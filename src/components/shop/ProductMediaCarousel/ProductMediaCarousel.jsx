"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./ProductMediaCarousel.module.css";

/**
 * Looping image browser for a product listing card.
 *
 * Deliberately not a Swiper instance. The grid renders 12 cards per batch and
 * grows by 12, so a full library instance per card would mean dozens of
 * observers, listener sets and cloned loop slides on one page. This keeps three
 * windowed slides and a modular index instead:
 *
 * - Only `previous | active | next` are in the DOM, so a card never decodes the
 *   whole set, and looping needs no cloned nodes — which is also why there is no
 *   clone flash and never a duplicated frame.
 * - Drag writes transforms straight to the track through rAF. No React state is
 *   touched until the gesture settles.
 * - A single image renders as a plain static image: no track, no listeners, no
 *   indicators, identical to the previous card markup.
 */

/** Share of the media width a drag must cover to commit. */
const COMMIT_RATIO = 0.28;
/** px per ms; pairs with FLICK_MIN so a small twitch cannot navigate. */
const FLICK_VELOCITY = 0.55;
const FLICK_MIN = 0.08;
/** Below this the velocity denominator is meaningless. */
const MIN_SAMPLE_MS = 4;
/** Ignore sub-pixel jitter so a tap never reads as a drag. */
const DRAG_START = 8;
const DURATION_MS = 300;
const EASE = "cubic-bezier(0.33, 1, 0.68, 1)";

const mod = (value, length) => ((value % length) + length) % length;

export default function ProductMediaCarousel({
  images,
  alt,
  sizes,
  priority = false,
  placeholderLabel,
  wrapperClassName = "",
  imageClassName = "",
}) {
  const { t, dir } = useTranslation();
  const count = images.length;
  const isCarousel = count > 1;

  const [index, setIndex] = useState(0);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const liveRef = useRef(null);
  const resetRef = useRef(false);
  const animatingRef = useRef(false);
  const interactedRef = useRef(false);

  /*
    The motion preference is read on every drag frame, so it is subscribed once
    rather than queried per event. `matchMedia()` was previously called inside
    `pointermove`, which meant one media-query evaluation for every pointer
    sample of every swipe on every card in the grid.
  */
  const reducedRef = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) return undefined;
    reducedRef.current = mql.matches;
    const onChange = (event) => { reducedRef.current = event.matches; };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const dirSign = dir === "rtl" ? -1 : 1;

  /**
   * Clear the slide-in transform in the same paint that renders the new active
   * slide. Doing it in an effect after paint would show the outgoing slide
   * snapping back for one frame.
   */
  useLayoutEffect(() => {
    if (!resetRef.current) return;
    resetRef.current = false;
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = "none";
    track.style.transform = "translate3d(0, 0, 0)";
  }, [index]);

  // Announce the settled position only, and never the initial render — a grid of
  // cards must not narrate itself on load.
  useEffect(() => {
    if (!interactedRef.current || !liveRef.current) return;
    liveRef.current.textContent = t("shop.card.mediaPosition", {
      current: index + 1,
      total: count,
    });
  }, [count, index, t]);

  /** Move by ±1 with the loop applied, animating unless motion is reduced. */
  const step = useCallback((delta) => {
    if (!isCarousel || !delta) return;
    const track = trackRef.current;
    interactedRef.current = true;
    const advance = () => setIndex((current) => mod(current + delta, count));

    if (!track || reducedRef.current) {
      if (track) { track.style.transition = "none"; track.style.transform = "translate3d(0, 0, 0)"; }
      advance();
      return;
    }
    if (animatingRef.current) return;
    animatingRef.current = true;

    // Slide the window one full step, then swap content and zero the track.
    track.style.transition = `transform ${DURATION_MS}ms ${EASE}`;
    track.style.transform = `translate3d(${-delta * dirSign * 100}%, 0, 0)`;

    let guard = 0;
    const settle = (event) => {
      // transitionend bubbles, and the card's hover zoom transitions the product
      // image's transform. Without this check a bubbled image event settles the
      // slide early, advancing the index mid-flight.
      if (event && (event.target !== track || event.propertyName !== "transform")) return;
      track.removeEventListener("transitionend", settle);
      clearTimeout(guard);
      animatingRef.current = false;
      resetRef.current = true;
      advance();
    };
    track.addEventListener("transitionend", settle);
    // If the transition never fires (interrupted, or the value did not change),
    // the deck must not be left permanently locked.
    guard = setTimeout(settle, DURATION_MS + 90);
  }, [count, dirSign, isCarousel]);

  // Direct manipulation. Drag frames never call setState.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!isCarousel || !viewport || !track) return undefined;

    let pointerId = null;
    let startX = 0;
    let dragging = false;
    let progress = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let frame = 0;
    let queued = null;
    /*
      Captured once per gesture instead of once per frame.

      `paint` used to read `viewport.clientWidth` inside the rAF callback, right
      after the previous frame had written a transform to the track — a forced
      synchronous layout on every frame of every swipe. Measured on the
      production build at /products, 390x844 DPR 3, 4x CPU: 12-13 layout events
      per gesture, and exactly 0 for a vertical gesture where `paint` never runs,
      which is what pinned the cost to this read.

      The viewport cannot change width mid-drag without a resize, and a resize
      ends the gesture, so one measurement per drag is sufficient. It is taken on
      pointerdown — the earliest point at which layout is settled and no
      transform has been written — and never defaulted to a placeholder: a bogus
      width would make `progress` saturate and commit a slide on gestures that
      should not navigate at all.
    */
    let widthPx = 0;

    const measureWidth = () => {
      const w = viewport.clientWidth;
      if (w > 0) widthPx = w;
      return widthPx;
    };

    const paint = () => {
      frame = 0;
      if (queued === null) return;
      const dx = queued;
      queued = null;
      // Only if pointerdown could not get a usable width (element not yet laid
      // out) do we pay for a read here.
      const width = widthPx > 0 ? widthPx : measureWidth();
      if (!(width > 0)) return;
      progress = Math.max(-1, Math.min(1, dx / width));
      track.style.transform = `translate3d(${progress * 100}%, 0, 0)`;
    };

    const onDown = (event) => {
      if (!event.isPrimary || event.button > 0 || animatingRef.current) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      lastX = event.clientX;
      lastT = event.timeStamp;
      velocity = 0;
      progress = 0;
      dragging = false;
      widthPx = 0;
      measureWidth();
    };

    const onMove = (event) => {
      if (pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;

      if (!dragging) {
        if (Math.abs(dx) <= DRAG_START) return;
        dragging = true;
        viewport.dataset.dragging = "true";
        // Best-effort: capture is armed here rather than on pointerdown so a tap
        // still reaches the card's link. By the time the drag is recognised the
        // pointer may no longer be capturable — a gesture that began before this
        // component was interactive is the real case, since the moves arrive here
        // but the pointerdown that would have registered the id never did.
        try {
          if (!viewport.hasPointerCapture?.(pointerId)) viewport.setPointerCapture(pointerId);
        } catch {
          /* the gesture still tracks through pointermove without capture */
        }
        track.style.transition = "none";
      }

      const dt = event.timeStamp - lastT;
      if (dt >= MIN_SAMPLE_MS) {
        velocity = (event.clientX - lastX) / dt;
        lastX = event.clientX;
        lastT = event.timeStamp;
      }

      if (reducedRef.current) return;
      queued = dx;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const finish = (event) => {
      if (pointerId !== event.pointerId) return;
      const wasDragging = dragging;
      const settled = progress;
      const speed = velocity;

      if (viewport.hasPointerCapture?.(pointerId)) viewport.releasePointerCapture?.(pointerId);
      pointerId = null;
      dragging = false;
      delete viewport.dataset.dragging;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      queued = null;
      if (!wasDragging) return;

      // Tell the card a real drag happened, so a click cannot follow it.
      viewport.dataset.dragConsumed = "true";

      const far = Math.abs(settled) >= COMMIT_RATIO;
      const flicked = Math.abs(speed) >= FLICK_VELOCITY
        && Math.sign(speed) === Math.sign(settled)
        && Math.abs(settled) >= FLICK_MIN;

      if (far || flicked) {
        // Dragging towards the start of the strip walks backwards through it.
        step((settled > 0 ? -1 : 1) * dirSign);
      } else {
        track.style.transition = `transform ${DURATION_MS}ms ${EASE}`;
        track.style.transform = "translate3d(0, 0, 0)";
      }
    };

    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", finish);
    viewport.addEventListener("pointercancel", finish);

    return () => {
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerup", finish);
      viewport.removeEventListener("pointercancel", finish);
      if (frame) cancelAnimationFrame(frame);
      if (pointerId !== null && viewport.hasPointerCapture?.(pointerId)) {
        viewport.releasePointerCapture?.(pointerId);
      }
      delete viewport.dataset.dragging;
    };
  }, [dirSign, isCarousel, step]);

  // A single image keeps exactly the previous static markup — no track, no
  // listeners, no indicators.
  if (!isCarousel) {
    return (
      <AssetImage
        src={images[0]}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholderLabel={placeholderLabel}
        showPath={false}
        wrapperClassName={wrapperClassName}
        className={imageClassName}
      />
    );
  }

  // Only the immediate neighbours are mounted, so a card never holds the whole set.
  const window3 = [
    { offset: -1, className: styles.slidePrev },
    { offset: 0, className: "" },
    { offset: 1, className: styles.slideNext },
  ];

  return (
    <div className={styles.viewport} ref={viewportRef}>
      <div className={styles.track} ref={trackRef}>
        {window3.map(({ offset, className }) => {
          const slideIndex = mod(index + offset, count);
          return (
            <div
              key={offset}
              className={`${styles.slide} ${className}`.trim()}
              aria-hidden={offset !== 0 || undefined}
            >
              <AssetImage
                src={images[slideIndex]}
                alt={offset === 0 ? alt : ""}
                fill
                sizes={sizes}
                /* Only the very first card's first frame is eager. */
                priority={priority && offset === 0}
                placeholderLabel={placeholderLabel}
                showPath={false}
                wrapperClassName={wrapperClassName}
                className={imageClassName}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={() => step(-1)}
        aria-label={t("shop.card.mediaPrevious")}
      >
        {dir === "rtl" ? <FiChevronRight aria-hidden="true" /> : <FiChevronLeft aria-hidden="true" />}
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={() => step(1)}
        aria-label={t("shop.card.mediaNext")}
      >
        {dir === "rtl" ? <FiChevronLeft aria-hidden="true" /> : <FiChevronRight aria-hidden="true" />}
      </button>

      {/* Indicators, not controls: swipe and the arrows already navigate, and
          making these buttons would add 4 tab stops to every card in the grid. */}
      <div className={styles.bullets} aria-hidden="true">
        {images.map((src, i) => (
          <span
            key={src}
            className={`${styles.bullet} ${i === index ? styles.bulletActive : ""}`.trim()}
          />
        ))}
      </div>

      <span ref={liveRef} className={styles.live} role="status" aria-live="polite" />
    </div>
  );
}
