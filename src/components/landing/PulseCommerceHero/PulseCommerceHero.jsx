"use client";

import { useCallback, useEffect, useRef } from "react";
import { Container } from "react-bootstrap";

import { useTranslation } from "@/i18n/LocaleProvider";
import { resolvedCollections } from "./data";
import { usePulseCommerceSequence } from "./usePulseCommerceSequence";
import CategoryReactor from "./CategoryReactor";
import DealsMatrix from "./DealsMatrix";
import TopSellerVault from "./TopSellerVault";
import EnergyConnector from "./EnergyConnector";
import MobilePulseHero from "./mobile/MobilePulseHero";
import { useHeroMode } from "./useHeroViewport";
import styles from "./PulseCommerceHero.module.css";

/**
 * Techno Solutions Pulse Commerce Core — the unified homepage hero.
 *
 * One premium card wiring three real merchandising systems into a single
 * synchronized experience: the Category Reactor selects a collection, an
 * electrical signal drives the Deals Matrix, a second signal drives the Top
 * Seller Vault. All product content resolves from the shared, truthful
 * `data.js` model; the master GSAP orchestration lives in
 * `usePulseCommerceSequence`.
 *
 * TWO COMPOSITIONS, ONE DATA MODEL
 * --------------------------------
 * Below 1200px the mobile arc composition (`mobile/MobilePulseHero`) takes over
 * completely — it is not this layout scaled down. Both trees are always
 * rendered and CSS decides which is visible, so neither side flashes the wrong
 * composition or shifts layout on hydration. `useHeroMode` then makes sure only
 * the visible composition's GSAP sequence actually runs — and that neither runs
 * while the answer is still the server's guess.
 */
export default function PulseCommerceHero() {
  const { t, dir } = useTranslation();
  const rootRef = useRef(null);
  const liveRef = useRef(null);
  // "unknown" on the hydration commit, so neither composition's GSAP sequence
  // sets itself up against a tree that CSS is hiding. See useHeroViewport.
  const heroMode = useHeroMode();

  const count = resolvedCollections.length;

  // Always announce with the latest dictionary, even after a language switch
  // (the sequence hook is set up once, so it reads `t` through this ref).
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const labelForIndex = useCallback(
    (index) => tRef.current(resolvedCollections[index].labelKey),
    []
  );

  const { activeIndex, dealsIndex, sellersIndex, select } = usePulseCommerceSequence({
    rootRef,
    count,
    labelForIndex,
    liveRef,
    enabled: heroMode === "desktop",
  });

  const activeCol = resolvedCollections[activeIndex];
  const dealsCol = resolvedCollections[dealsIndex];
  const sellersCol = resolvedCollections[sellersIndex];
  const flip = dir === "rtl";

  return (
    <section
      id="commerce-core"
      ref={rootRef}
      className={styles.hero}
      aria-label={t("commerce.regionLabel")}
    >
      {/* A controlled fluid container gives the commerce hero enough room for
          the target three-column composition while retaining responsive gutters. */}
      <Container fluid className={styles.container}>
        {/* Mobile arc composition — visible below 1200px. */}
        <div className={styles.mobileOnly}>
          <MobilePulseHero enabled={heroMode === "mobile"} />
        </div>

        {/* Desktop composition — unchanged, visible from 1200px up. */}
        <div className={`${styles.card} ${styles.desktopOnly}`}>
          <div className={styles.grid}>
            <CategoryReactor
              collections={resolvedCollections}
              activeIndex={activeIndex}
              count={count}
              viewAllHref={activeCol.viewAllHref}
              activeLabel={t(activeCol.labelKey)}
              dir={dir}
              t={t}
              onSelect={(i) => select(i, true)}
            />

            <EnergyConnector id={1} flip={flip} />

            <DealsMatrix deals={dealsCol.deals} featured={dealsCol.featured} t={t} />

            <EnergyConnector id={2} flip={flip} />

            <TopSellerVault topSellers={sellersCol.topSellers} t={t} />
          </div>
        </div>
      </Container>

      {/* Manual category changes make one concise polite announcement. */}
      <span className="visually-hidden" aria-live="polite" ref={liveRef} />
    </section>
  );
}
