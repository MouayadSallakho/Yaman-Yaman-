"use client";

import gsap from "gsap";
import { useCallback, useEffect, useRef } from "react";

/**
 * Cinematic 3D Orbit Deck — the single owner of gallery card positioning.
 *
 * Every gallery item is a persistent element (see ProductGallery: `key={item.id}`).
 * A card's place on the orbit is derived from its signed ring distance to the
 * active card and expressed purely as a transform, so "active becomes a side
 * card" is a real tween of one element rather than a swap between two.
 *
 * CSS owns the equivalent static composition through `data-slot`, so the deck is
 * already correct before this hook runs and stays usable if GSAP never loads.
 * Nothing here animates a layout property.
 */

/** Orbit slots, indexed by absolute ring distance from the active card. */
const SLOTS = [
  { x: 0, scale: 1, ry: 0, rz: 0, z: 40, opacity: 1, zIndex: 30 },
  { x: 78, scale: 0.72, ry: 22, rz: 1.2, z: -60, opacity: 0.92, zIndex: 20 },
  { x: 128, scale: 0.55, ry: 30, rz: 1.6, z: -150, opacity: 0.55, zIndex: 10 },
  { x: 150, scale: 0.44, ry: 34, rz: 1.8, z: -240, opacity: 0, zIndex: 0 },
];

const HIDDEN_DISTANCE = SLOTS.length - 1;

/** Cards this far from centre or closer are shown and can be clicked. */
export const VISIBLE_DISTANCE = 2;

const DESKTOP_DURATION = 0.66;
const MOBILE_DURATION = 0.5;
/**
 * power4.inOut was measured moving a card only ~3% of its distance through the
 * first 31% of the tween, which reads as hesitation rather than weight.
 * power3.inOut keeps the weighted settle but responds immediately.
 */
const EASE = "power3.inOut";

/** Fraction of a drag that must be covered before release commits the move. */
const COMMIT_RATIO = 0.32;
/**
 * px per ms for the flick shortcut, paired with FLICK_MIN_PROGRESS. Both are
 * deliberately not generous: a quick twitch of a few pixels is far more likely
 * to be a mis-grab than an intent to navigate.
 */
const COMMIT_VELOCITY = 0.9;
const FLICK_MIN_PROGRESS = 0.12;
/** Samples closer together than this give a useless velocity denominator. */
const MIN_SAMPLE_MS = 4;
/** Horizontal travel, as a share of stage width, that equals one full step. */
const DRAG_SPAN = 0.55;
/** Ignore sub-pixel jitter so a tap never registers as a drag. */
const DRAG_START = 8;

/**
 * Shortest signed distance from `active` to `index` around the ring, so a card
 * always travels the short way instead of crossing the whole stage.
 */
export function ringOffset(index, active, count) {
  let offset = (((index - active) % count) + count) % count;
  if (offset > count / 2) offset -= count;
  return offset;
}

/** Slot name consumed by CSS for the pre-GSAP composition. */
export function slotName(offset) {
  const distance = Math.abs(offset);
  if (distance === 0) return "active";
  if (distance > VISIBLE_DISTANCE) return "hidden";
  const edge = distance === 1 ? "near" : "far";
  return `${edge}-${offset < 0 ? "prev" : "next"}`;
}

/**
 * Transform values for a signed ring offset, mirrored for RTL.
 *
 * `x: 0` is not redundant. The CSS fallback expresses slots as percentages inside
 * `translate3d()`, which GSAP parses into a *pixel* x on first read; left alone it
 * would then add xPercent on top of it — doubling the offset in LTR, and in RTL
 * cancelling it out exactly, which stacked every card in the centre. Pinning x
 * here makes this hook the sole author of horizontal placement.
 */
function slotFor(offset, dirSign) {
  const slot = SLOTS[Math.min(Math.abs(offset), HIDDEN_DISTANCE)];
  const side = Math.sign(offset) * dirSign;
  return {
    x: 0,
    y: 0,
    xPercent: slot.x * side,
    scale: slot.scale,
    rotationY: -slot.ry * side,
    rotationZ: slot.rz * side,
    z: slot.z,
    opacity: slot.opacity,
    zIndex: slot.zIndex,
  };
}

const lerp = (from, to, t) => from + (to - from) * t;

export default function useProductOrbitGalleryMotion({
  stageRef,
  cardsRef,
  count,
  activeIndex,
  dir = "ltr",
  onNavigate,
  onSettle,
}) {
  const dirSign = dir === "rtl" ? -1 : 1;

  const timelineRef = useRef(null);
  const appliedRef = useRef([]);
  const mountedRef = useRef(false);
  const reducedRef = useRef(false);
  const activeRef = useRef(activeIndex);

  // Latest callbacks and active index, so the pointer listeners never have to be
  // torn down and re-armed just because a prop identity changed. Declared before
  // every other effect here, so the effects below always read fresh values.
  const navigateRef = useRef(onNavigate);
  const settleRef = useRef(onSettle);
  useEffect(() => {
    navigateRef.current = onNavigate;
    settleRef.current = onSettle;
    activeRef.current = activeIndex;
  });

  /** Place every card for `active`, animating only when asked to. */
  const applySlots = useCallback((active, animate) => {
    const cards = cardsRef.current;
    if (!cards?.length) return;

    timelineRef.current?.kill();

    const duration =
      (typeof window !== "undefined" && window.innerWidth <= 767 ? MOBILE_DURATION : DESKTOP_DURATION);
    const timeline = animate ? gsap.timeline({
      defaults: { duration, ease: EASE, overwrite: "auto" },
      onComplete: () => {
        timelineRef.current = null;
        settleRef.current?.(activeRef.current);
      },
    }) : null;

    cards.forEach((card, index) => {
      if (!card) return;
      const offset = ringOffset(index, active, count);
      const target = slotFor(offset, dirSign);
      const previous = appliedRef.current[index];
      appliedRef.current[index] = target;

      if (!timeline) {
        gsap.set(card, target);
        return;
      }

      // A card that is invisible before and after is repositioned outright, so
      // nothing is tweened across the stage behind the scenes.
      const wasHidden = previous ? previous.opacity === 0 : true;
      if (wasHidden && target.opacity === 0) {
        timeline.set(card, target, 0);
        return;
      }

      const { zIndex, ...motion } = target;
      // Depth order flips at a controlled point: cards falling back reorder
      // immediately, the incoming active only once it is past the side cards,
      // so nothing pops through anything else mid-flight.
      const risesForward = previous ? zIndex > previous.zIndex : false;
      timeline.set(card, { zIndex }, risesForward ? duration * 0.55 : 0);
      timeline.to(card, motion, 0);
    });

    timelineRef.current = timeline;
  }, [cardsRef, count, dirSign]);

  // Honour reduced motion, and react to the user changing it mid-session.
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return undefined;
    reducedRef.current = query.matches;
    const onChange = (event) => {
      reducedRef.current = event.matches;
      applySlots(activeRef.current, false);
    };
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, [applySlots]);

  // First paint places the deck without motion; later index changes travel.
  useEffect(() => {
    const animate = mountedRef.current && !reducedRef.current;
    applySlots(activeIndex, animate);
    if (!animate) settleRef.current?.(activeIndex);
    mountedRef.current = true;
  }, [activeIndex, applySlots]);

  // Direct manipulation. Drag frames never touch React state.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    let pointerId = null;
    let startX = 0;
    let dragging = false;
    let progress = 0;
    let intent = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let frame = 0;
    let queuedX = null;

    const paint = () => {
      frame = 0;
      if (queuedX === null) return;
      const dx = queuedX - startX;
      queuedX = null;

      const span = Math.max(stage.clientWidth * DRAG_SPAN, 1);
      progress = Math.max(-1, Math.min(1, dx / span));
      // Dragging towards the start of the strip walks backwards through it.
      intent = (progress > 0 ? -1 : 1) * dirSign;
      const t = Math.abs(progress);
      const active = activeRef.current;

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        const from = slotFor(ringOffset(index, active, count), dirSign);
        const to = slotFor(ringOffset(index, active + intent, count), dirSign);
        gsap.set(card, {
          x: 0,
          y: 0,
          xPercent: lerp(from.xPercent, to.xPercent, t),
          scale: lerp(from.scale, to.scale, t),
          rotationY: lerp(from.rotationY, to.rotationY, t),
          rotationZ: lerp(from.rotationZ, to.rotationZ, t),
          z: lerp(from.z, to.z, t),
          opacity: lerp(from.opacity, to.opacity, t),
        });
      });
    };

    const onDown = (event) => {
      if (!event.isPrimary || event.button > 0) return;
      // Start each gesture clean. A drag that ends under pointer capture has its
      // click retargeted to the stage, so the card's handler may never consume
      // the flag — left set, it would swallow a later, genuine click.
      delete stage.dataset.dragConsumed;
      pointerId = event.pointerId;
      startX = event.clientX;
      lastX = event.clientX;
      lastT = event.timeStamp;
      velocity = 0;
      progress = 0;
      dragging = false;
    };

    const onMove = (event) => {
      if (pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;

      if (!dragging) {
        if (Math.abs(dx) <= DRAG_START) return;
        dragging = true;
        stage.dataset.dragging = "true";
        // Capture only once a real drag begins — capturing on pointerdown
        // retargets the following click and the arrows would never receive it.
        // Best-effort: a gesture that started before this became interactive
        // delivers its moves here without the browser ever having seen a
        // pointerdown for that id, and capturing it then throws.
        try {
          if (!stage.hasPointerCapture?.(pointerId)) stage.setPointerCapture(pointerId);
        } catch {
          /* the drag still tracks through pointermove without capture */
        }
        timelineRef.current?.kill();
        timelineRef.current = null;
      }

      // Only resample once enough time has passed, otherwise a near-zero
      // denominator reports an enormous velocity for a tiny movement.
      const dt = event.timeStamp - lastT;
      if (dt >= MIN_SAMPLE_MS) {
        velocity = (event.clientX - lastX) / dt;
        lastX = event.clientX;
        lastT = event.timeStamp;
      }

      if (reducedRef.current) return;
      queuedX = event.clientX;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const finish = (event) => {
      if (pointerId !== event.pointerId) return;
      const wasDragging = dragging;
      const settledProgress = progress;
      const settledIntent = intent;
      const settledVelocity = velocity;

      if (stage.hasPointerCapture?.(pointerId)) stage.releasePointerCapture?.(pointerId);
      pointerId = null;
      dragging = false;
      delete stage.dataset.dragging;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      queuedX = null;

      if (!wasDragging) return;
      stage.dataset.dragConsumed = "true";

      const far = Math.abs(settledProgress) >= COMMIT_RATIO;
      const flicked = Math.abs(settledVelocity) >= COMMIT_VELOCITY
        && Math.sign(settledVelocity) === Math.sign(settledProgress)
        && Math.abs(settledProgress) >= FLICK_MIN_PROGRESS;

      if (reducedRef.current) {
        if (far || flicked) navigateRef.current?.(settledIntent);
        return;
      }
      if (far || flicked) navigateRef.current?.(settledIntent);
      // Short drag: settle back to the current card rather than hard-snapping.
      else applySlots(activeRef.current, true);
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", finish);
    stage.addEventListener("pointercancel", finish);

    return () => {
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", finish);
      stage.removeEventListener("pointercancel", finish);
      if (frame) cancelAnimationFrame(frame);
      if (pointerId !== null && stage.hasPointerCapture?.(pointerId)) {
        stage.releasePointerCapture?.(pointerId);
      }
      delete stage.dataset.dragging;
    };
  }, [applySlots, cardsRef, count, dirSign, stageRef]);

  // Kill any in-flight motion when the gallery goes away.
  useEffect(() => () => {
    timelineRef.current?.kill();
    timelineRef.current = null;
  }, []);
}
