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

export default function TodaysPicksSection() {
  const { t, locale, dir } = useTranslation();
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const transitionRef = useRef(null);
  const firstRenderRef = useRef(true);
  const directionRef = useRef(1);

  const [activeId, setActiveId] = useState(todaysPicks[0].id);
  const [displayedId, setDisplayedId] = useState(todaysPicks[0].id);

  const displayedIndex = Math.max(
    0,
    todaysPicks.findIndex((item) => item.id === displayedId)
  );
  const product = todaysPicks[displayedIndex];

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

      const currentIndex = todaysPicks.findIndex((item) => item.id === displayedId);
      const nextIndex = todaysPicks.findIndex((item) => item.id === nextId);
      const logicalDirection = nextIndex >= currentIndex ? 1 : -1;
      directionRef.current = dir === "rtl" ? -logicalDirection : logicalDirection;
      setActiveId(nextId);

      const panel = panelRef.current;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      transitionRef.current?.kill();

      if (!panel || reduceMotion) {
        setDisplayedId(nextId);
        return;
      }

      const visual = panel.querySelector("[data-todays-picks-visual]");
      const copy = panel.querySelector("[data-todays-picks-copy]");

      // A quick reversal can select the product that is still rendered while
      // its outgoing animation is running. Restore it instead of committing an
      // unnecessary state update that would leave the panel transparent.
      if (nextId === displayedId) {
        transitionRef.current = gsap.timeline({ defaults: { overwrite: true } })
          .to(visual, { opacity: 1, x: 0, scale: 1, duration: 0.2, ease: "power2.out" })
          .to(copy, { opacity: 1, x: 0, duration: 0.18, ease: "power2.out" }, "<");
        return;
      }

      const offset = 18 * directionRef.current;

      transitionRef.current = gsap
        .timeline({ defaults: { overwrite: true } })
        .to(visual, {
          opacity: 0,
          x: offset,
          scale: 0.992,
          duration: 0.16,
          ease: "power1.in",
        })
        .to(
          copy,
          { opacity: 0, x: -offset * 0.7, duration: 0.14, ease: "power1.in" },
          "<"
        )
        .add(() => setDisplayedId(nextId));
    },
    [activeId, displayedId, dir]
  );

  const selectPrevious = useCallback(() => {
    const index = todaysPicks.findIndex((item) => item.id === activeId);
    const previous = (index - 1 + todaysPicks.length) % todaysPicks.length;
    selectPick(todaysPicks[previous].id);
  }, [activeId, selectPick]);

  const selectNext = useCallback(() => {
    const index = todaysPicks.findIndex((item) => item.id === activeId);
    const next = (index + 1) % todaysPicks.length;
    selectPick(todaysPicks[next].id);
  }, [activeId, selectPick]);

  useIsoLayoutEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    const visual = panel.querySelector("[data-todays-picks-visual]");
    const copy = panel.querySelector("[data-todays-picks-copy]");
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    transitionRef.current?.kill();

    if (reduceMotion) {
      gsap.set([visual, copy], { opacity: 1, x: 0, scale: 1 });
      return;
    }

    const offset = 18 * directionRef.current;
    transitionRef.current = gsap
      .timeline({ defaults: { ease: "power2.out", overwrite: true } })
      .fromTo(
        visual,
        { opacity: 0, x: -offset, scale: 0.992 },
        { opacity: 1, x: 0, scale: 1, duration: 0.32 }
      )
      .fromTo(
        copy,
        { opacity: 0, x: offset * 0.7 },
        { opacity: 1, x: 0, duration: 0.28 },
        "-=0.22"
      );
  }, [displayedId]);

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
            aria-labelledby={`todays-picks-tab-${displayedId}`}
            className={styles.panel}
          >
            <ProductSpotlight
              product={product}
              position={displayedIndex + 1}
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
        </div>
      </Container>
    </section>
  );
}
