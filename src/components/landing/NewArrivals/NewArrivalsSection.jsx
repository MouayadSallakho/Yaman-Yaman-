"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import gsap from "gsap";

import { useTranslation } from "@/i18n/LocaleProvider";
import ArrivalProductCard from "./ArrivalProductCard";
import FeaturedArrivalCard from "./FeaturedArrivalCard";
import NewArrivalsTabs from "./NewArrivalsTabs";
import {
  NEW_ARRIVALS_VIEW_ALL_HREF,
  newArrivalCollections,
} from "./data";
import { useNewArrivalsMotion } from "./useNewArrivalsMotion";
import styles from "./NewArrivalsSection.module.css";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function NewArrivalsSection() {
  const { t, locale, dir } = useTranslation();
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const transitionRef = useRef(null);
  const firstPanelRenderRef = useRef(true);

  const [activeId, setActiveId] = useState(newArrivalCollections[0].id);
  const [displayedId, setDisplayedId] = useState(newArrivalCollections[0].id);

  const collection = useMemo(
    () =>
      newArrivalCollections.find((item) => item.id === displayedId) ??
      newArrivalCollections[0],
    [displayedId]
  );

  const formatPrice = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format,
    [locale]
  );

  useNewArrivalsMotion({ rootRef, dir });

  const selectCollection = useCallback(
    (nextId) => {
      if (nextId === activeId) return;
      setActiveId(nextId);

      const panel = panelRef.current;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      transitionRef.current?.kill();

      if (!panel || reduceMotion) {
        setDisplayedId(nextId);
        return;
      }

      // If a user reverses a tab choice before the outgoing animation commits,
      // restore the currently rendered panel instead of fading it to zero.
      if (nextId === displayedId) {
        transitionRef.current = gsap.to(panel, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
          overwrite: true,
        });
        return;
      }

      transitionRef.current = gsap.to(panel, {
        opacity: 0,
        y: 8,
        scale: 0.995,
        duration: 0.15,
        ease: "power1.in",
        overwrite: true,
        onComplete: () => setDisplayedId(nextId),
      });
    },
    [activeId, displayedId]
  );

  useIsoLayoutEffect(() => {
    if (firstPanelRenderRef.current) {
      firstPanelRenderRef.current = false;
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      gsap.set(panel, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    transitionRef.current?.kill();
    transitionRef.current = gsap.fromTo(
      panel,
      { opacity: 0, y: 10, scale: 0.995 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.28,
        ease: "power2.out",
        overwrite: true,
      }
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
      id="new-arrivals"
      ref={rootRef}
      className={styles.section}
      aria-labelledby="new-arrivals-title"
    >
      <Container fluid className={styles.container}>
        <div className={styles.surface}>
          <header className={styles.header}>
            <div className={styles.headingGroup} data-new-arrivals-header>
              <span className={styles.eyebrow}>
                <HiSparkles aria-hidden="true" />
                {t("commerce.newArrivals.badge")}
              </span>
              <h2 id="new-arrivals-title" className={styles.title}>
                {t("commerce.newArrivals.title")}
              </h2>
              <p className={styles.subtitle}>{t("commerce.newArrivals.subtitle")}</p>
            </div>

            <div className={styles.controls} data-new-arrivals-header>
              <NewArrivalsTabs
                collections={newArrivalCollections}
                activeId={activeId}
                onSelect={selectCollection}
                t={t}
              />
              <Link href={NEW_ARRIVALS_VIEW_ALL_HREF} className={styles.viewAll}>
                <span>{t("commerce.newArrivals.viewAll")}</span>
                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </header>

          <div
            ref={panelRef}
            id="new-arrivals-panel"
            role="tabpanel"
            aria-labelledby={`new-arrivals-tab-${collection.id}`}
            className={styles.panel}
          >
            <FeaturedArrivalCard
              product={collection.featured}
              formatPrice={formatPrice}
              t={t}
            />

            <div className={styles.productGrid}>
              {collection.products.map((item) => (
                <ArrivalProductCard
                  key={item.id}
                  product={item}
                  formatPrice={formatPrice}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
