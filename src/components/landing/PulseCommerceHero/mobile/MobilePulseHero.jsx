"use client";

import { useCallback, useEffect, useRef } from "react";

import { useTranslation } from "@/i18n/LocaleProvider";
import { resolvedCollections } from "../data";
import MobileCategoryArc from "./MobileCategoryArc";
import MobileDealsRail from "./MobileDealsRail";
import MobileTopSellersRail from "./MobileTopSellersRail";
import { useMobilePulseSequence } from "./useMobilePulseSequence";
import styles from "./MobilePulseHero.module.css";

/**
 * The mobile Pulse Commerce hero — one dark premium shell telling a single
 * connected commerce story:
 *
 *   Category arc → Deals of the Day → Top Sellers → seam
 *
 * A vertical pulse spine runs the full height of the shell and is the visual
 * proof that the three stages are one system: selecting a category sends energy
 * down it, and each stage updates as the energy arrives.
 *
 * The featured product deliberately has no mobile stage: the brief is that
 * Categories, Deals and Top Sellers must all be reachable in the first screen,
 * and the featured block alone cost ~270–450px of that budget. It remains part
 * of the data model and of the desktop composition, which is unchanged.
 *
 * Both rails read from the same `resolvedCollections` record, so the deals and
 * the top sellers can never disagree about which collection they are showing.
 *
 * @param {{ enabled: boolean }} props `false` above the hero's breakpoint, where
 *   this composition is `display: none` and the desktop hero is in charge — the
 *   sequence then stands down instead of animating hidden DOM.
 */
export default function MobilePulseHero({ enabled }) {
  const { t, dir } = useTranslation();
  const rootRef = useRef(null);
  const liveRef = useRef(null);
  const dealsSwiperRef = useRef(null);
  const sellersSwiperRef = useRef(null);

  const count = resolvedCollections.length;

  // The sequence hook is created once, so it reads the current dictionary
  // through a ref — otherwise a language switch would announce stale labels.
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const labelForIndex = useCallback(
    (index) => tRef.current(resolvedCollections[index].labelKey),
    []
  );

  const { activeIndex, dealsIndex, sellersIndex, select } = useMobilePulseSequence({
    rootRef,
    count,
    labelForIndex,
    liveRef,
    dealsSwiperRef,
    sellersSwiperRef,
    enabled,
  });

  const activeCollection = resolvedCollections[activeIndex];
  const dealsCollection = resolvedCollections[dealsIndex];
  const sellersCollection = resolvedCollections[sellersIndex];

  const handleDealsSwiper = useCallback((swiper) => {
    dealsSwiperRef.current = swiper;
  }, []);
  const handleSellersSwiper = useCallback((swiper) => {
    sellersSwiperRef.current = swiper;
  }, []);

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.shell} data-m-shell>
        <MobileCategoryArc
          collections={resolvedCollections}
          activeIndex={activeIndex}
          count={count}
          viewAllHref={activeCollection.viewAllHref}
          activeLabel={t(activeCollection.labelKey)}
          dir={dir}
          t={t}
          onSelect={select}
        />

        {/*
          Everything the spine runs through, in one positioned region.

          The spine is absolutely positioned to this wrapper's full height rather
          than offset from the shell top by a hardcoded number, so compacting or
          resizing the arc can never leave it starting in the wrong place.
        */}
        <div className={styles.flow}>
          {/* One continuous spine. A straight line under a non-uniform scale
              stays a straight line, so this needs no per-breakpoint geometry. */}
          <div className={styles.spine} aria-hidden="true">
            <span className={styles.spineBase} data-m-spine-base />
            <span className={styles.spinePulse} data-m-spine-pulse />
          </div>

          <span className={styles.junction} data-m-junction="deals" aria-hidden="true" />
          <MobileDealsRail
            deals={dealsCollection.deals}
            viewAllHref={dealsCollection.viewAllHref}
            t={t}
            dir={dir}
            onSwiper={handleDealsSwiper}
          />

          <span className={styles.junction} data-m-junction="sellers" aria-hidden="true" />
          <MobileTopSellersRail
            topSellers={sellersCollection.topSellers}
            viewAllHref={sellersCollection.viewAllHref}
            t={t}
            dir={dir}
            onSwiper={handleSellersSwiper}
          />

          {/* Glowing seam that hands the page over to New Arrivals. */}
          <div className={styles.seam} aria-hidden="true">
            <span className={styles.seamLine} />
            <span className={styles.seamCharge} data-m-seam-charge />
            <span className={styles.seamNode} />
          </div>
        </div>
      </div>

      {/* One concise announcement per meaningful category change. */}
      <span className="visually-hidden" aria-live="polite" ref={liveRef} />
    </div>
  );
}
