"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import gsap from "gsap";

import { useTranslation } from "@/i18n/LocaleProvider";
import PickSelectorRail from "./PickSelectorRail";
import ProductSpotlight from "./ProductSpotlight";
import TodaysPicksHeader from "./TodaysPicksHeader";
import { todaysPicks } from "./data";
import { useTodaysPicksMotion } from "./useTodaysPicksMotion";
import styles from "./TodaysPicksSection.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * STATE MODEL
 * -----------
 * One piece of state: `activeId`. Selection, the rendered product, the
 * tabpanel's `aria-labelledby`, the selector's `aria-selected` and the live
 * announcement all derive from it, so they can never disagree.
 *
 * The previous implementation carried a second `displayedId` that lagged
 * `activeId` for the duration of an outgoing tween. During those ~160ms the
 * selector reported one product as selected while the panel still described
 * another, and the panel's `aria-labelledby` pointed at the stale tab. It also
 * needed a reversal guard for the case where a user re-picked the product that
 * was still on screen.
 *
 * Removing it means the switch is render-first: the new product is committed
 * immediately and only animated *in*. There is no outgoing tween to get stuck
 * behind, which is also why a failed animation can no longer leave the panel
 * transparent.
 */
export default function TodaysPicksSection() {
  const { t, locale, dir } = useTranslation();
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const transitionRef = useRef(null);
  const previousIndexRef = useRef(0);
  const firstRenderRef = useRef(true);

  const [activeId, setActiveId] = useState(todaysPicks[0].id);
  // Empty until the user actually changes pick, so nothing is announced on load.
  const [announcement, setAnnouncement] = useState("");

  const activeIndex = Math.max(
    0,
    todaysPicks.findIndex((item) => item.id === activeId)
  );
  const product = todaysPicks[activeIndex];

  const formatPrice = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format,
    [locale]
  );

  useTodaysPicksMotion({ rootRef, dir });

  const selectPick = useCallback(
    (nextId) => {
      if (nextId === activeId) return;

      const nextIndex = todaysPicks.findIndex((item) => item.id === nextId);
      if (nextIndex < 0) return;

      previousIndexRef.current = activeIndex;
      setActiveId(nextId);

      // Concise, self-contained update — not the whole details panel.
      const next = todaysPicks[nextIndex];
      setAnnouncement(
        `${t("commerce.todaysPicks.position", {
          current: String(nextIndex + 1).padStart(2, "0"),
          total: String(todaysPicks.length).padStart(2, "0"),
        })}: ${next.name} — ${t("commerce.todaysPicks.selected")}`
      );
    },
    [activeId, activeIndex, t]
  );

  const selectPrevious = useCallback(() => {
    const previous = (activeIndex - 1 + todaysPicks.length) % todaysPicks.length;
    selectPick(todaysPicks[previous].id);
  }, [activeIndex, selectPick]);

  const selectNext = useCallback(() => {
    const next = (activeIndex + 1) % todaysPicks.length;
    selectPick(todaysPicks[next].id);
  }, [activeIndex, selectPick]);

  // Incoming-only transition. The content is already committed and painted by
  // the time this runs, so a failure here cannot hide it.
  useIsoLayoutEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const visual = panel.querySelector("[data-todays-picks-visual]");
    const copy = panel.querySelector("[data-todays-picks-copy]");
    if (!visual && !copy) return;

    const forward = activeIndex >= previousIndexRef.current;
    const logical = forward ? 1 : -1;
    const offset = 16 * (dir === "rtl" ? -logical : logical);

    transitionRef.current?.kill();
    transitionRef.current = gsap
      .timeline({ defaults: { ease: "power2.out", overwrite: "auto", immediateRender: false } })
      .fromTo(visual, { opacity: 0, x: offset }, { opacity: 1, x: 0, duration: 0.3 })
      .fromTo(copy, { opacity: 0, x: -offset * 0.6 }, { opacity: 1, x: 0, duration: 0.26 }, "<0.04");
  }, [activeId, activeIndex, dir]);

  useEffect(
    () => () => {
      transitionRef.current?.kill();
    },
    []
  );

  return (
    <section
      id="todays-picks"
      ref={rootRef}
      className={styles.section}
      aria-labelledby="todays-picks-title"
    >
      <Container fluid className={styles.container}>
        <div className={styles.surface}>
          <TodaysPicksHeader t={t} count={todaysPicks.length} />

          <div
            ref={panelRef}
            id="todays-picks-panel"
            role="tabpanel"
            aria-labelledby={`todays-picks-tab-${activeId}`}
            className={styles.panel}
          >
            <ProductSpotlight
              product={product}
              position={activeIndex + 1}
              total={todaysPicks.length}
              formatPrice={formatPrice}
              t={t}
              onPrevious={selectPrevious}
              onNext={selectNext}
            />
          </div>

          <PickSelectorRail
            picks={todaysPicks}
            activeId={activeId}
            onSelect={selectPick}
            t={t}
            dir={dir}
          />

          {/* Single small live region. Carries only "Pick n of m: Name — Selected",
              never the description, reason card or feature chips. */}
          <p className="visually-hidden" role="status" aria-live="polite">
            {announcement}
          </p>
        </div>
      </Container>
    </section>
  );
}
