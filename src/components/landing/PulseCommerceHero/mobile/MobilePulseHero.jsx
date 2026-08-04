"use client";

import { useCallback, useEffect, useRef } from "react";

import { useTranslation } from "@/i18n/LocaleProvider";
import { resolvedCollections } from "../data";
import MobileCategoryArc from "./MobileCategoryArc";
import MobileFeaturedDeal from "./MobileFeaturedDeal";
import MobileDealsRail from "./MobileDealsRail";
import MobileTopSellersRail from "./MobileTopSellersRail";
import { useMobilePulseSequence } from "./useMobilePulseSequence";
import styles from "./MobilePulseHero.module.css";

/**
 * The mobile Pulse Commerce hero — one dark premium shell telling a single
 * connected commerce story:
 *
 *   Category arc → Featured Deal → Deals of the Day → Top Sellers → seam
 *
 * A vertical pulse spine runs the full height of the shell and is the visual
 * proof that the four stages are one system: selecting a category sends energy
 * down it, and each stage updates as the energy arrives.
 *
 * All four stages read from the same `resolvedCollections` record, so the
 * featured product, the deals and the top sellers can never disagree about
 * which collection they are showing.
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
        {/* One continuous spine. A straight line under a non-uniform scale stays
            a straight line, so this needs no per-breakpoint geometry. */}
        <div className={styles.spine} aria-hidden="true">
          <span className={styles.spineBase} data-m-spine-base />
          <span className={styles.spinePulse} data-m-spine-pulse />
        </div>

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

        <span className={styles.junction} data-m-junction="featured" aria-hidden="true" />
        <MobileFeaturedDeal product={dealsCollection.featured} t={t} />

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

      {/* One concise announcement per meaningful category change. */}
      <span className="visually-hidden" aria-live="polite" ref={liveRef} />
    </div>
  );
}
