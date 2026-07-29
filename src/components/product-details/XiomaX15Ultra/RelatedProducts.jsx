"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, FreeMode, Keyboard, Mousewheel } from "swiper/modules";

import "swiper/css";

import ProductCard from "@/components/landing/ProductCard/ProductCard";
import { PRODUCTS_ROUTE } from "@/components/landing/data/products";
import { useTranslation } from "@/i18n/LocaleProvider";
import { XIOMA_RECOMMENDATIONS } from "./recommendations";
import styles from "./RelatedProducts.module.css";

const BREAKPOINTS = {
  360: { slidesPerView: 1.2, spaceBetween: 12 },
  480: { slidesPerView: 1.5, spaceBetween: 14 },
  640: { slidesPerView: 2.2, spaceBetween: 16 },
  768: { slidesPerView: 2.6, spaceBetween: 18 },
  1024: { slidesPerView: 3.5, spaceBetween: 20 },
  1280: { slidesPerView: 4.5, spaceBetween: 22 },
  1536: { slidesPerView: 5.5, spaceBetween: 24 },
};

/**
 * "You May Also Like" rail. A sibling region of the product content and of the
 * footer — never a wrapper around either. Navigation is driven from the Swiper
 * instance rather than element refs so the controls are correct on first paint
 * and can expose real disabled states at the edges.
 */
export default function RelatedProducts() {
  const { t, dir } = useTranslation();
  const [swiper, setSwiper] = useState(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const syncEdges = useCallback((instance) => {
    setEdges({ start: instance.isBeginning, end: instance.isEnd });
  }, []);

  const handleSwiper = useCallback(
    (instance) => {
      setSwiper(instance);
      syncEdges(instance);
    },
    [syncEdges]
  );

  if (!XIOMA_RECOMMENDATIONS.length) return null;

  return (
    <section className={styles.section} aria-labelledby="xioma-related-title">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <p className={styles.eyebrow}>{t("productDemo.recommendations.eyebrow")}</p>
            <h2 id="xioma-related-title" className={styles.title}>
              {t("productDemo.recommendations.title")}
            </h2>
            <p className={styles.subtitle}>{t("productDemo.recommendations.subtitle")}</p>
          </div>

          <div className={styles.actions}>
            <Link href={PRODUCTS_ROUTE} className={styles.viewAll}>
              {t("productDemo.recommendations.viewAll")}
              <FiArrowRight aria-hidden="true" className={styles.viewAllIcon} />
            </Link>

            <div className={styles.navGroup}>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => swiper?.slidePrev()}
                disabled={!swiper || edges.start}
                aria-label={t("productDemo.recommendations.previous")}
              >
                {dir === "rtl" ? <FiChevronRight aria-hidden="true" /> : <FiChevronLeft aria-hidden="true" />}
              </button>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => swiper?.slideNext()}
                disabled={!swiper || edges.end}
                aria-label={t("productDemo.recommendations.next")}
              >
                {dir === "rtl" ? <FiChevronLeft aria-hidden="true" /> : <FiChevronRight aria-hidden="true" />}
              </button>
            </div>
          </div>
        </header>

        <Swiper
          // Swiper reads direction at init, so remount when the locale flips.
          key={dir}
          dir={dir}
          className={styles.rail}
          modules={[A11y, FreeMode, Keyboard, Mousewheel]}
          a11y={{
            containerRoleDescriptionMessage: "carousel",
            itemRoleDescriptionMessage: "slide",
          }}
          aria-label={t("productDemo.recommendations.railLabel")}
          slidesPerView={1.2}
          spaceBetween={14}
          grabCursor
          watchOverflow
          speed={500}
          freeMode={{ enabled: true, sticky: false }}
          keyboard={{ enabled: true, onlyInViewport: true }}
          mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
          breakpoints={BREAKPOINTS}
          onSwiper={handleSwiper}
          onSlideChange={syncEdges}
          onReachBeginning={syncEdges}
          onReachEnd={syncEdges}
          onFromEdge={syncEdges}
          onResize={syncEdges}
        >
          {XIOMA_RECOMMENDATIONS.map((product) => (
            <SwiperSlide key={product.id} className={styles.slide}>
              <ProductCard
                product={product}
                mediaAspect="4 / 3"
                sizes="(max-width: 480px) 74vw, (max-width: 768px) 38vw, (max-width: 1280px) 26vw, 200px"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
