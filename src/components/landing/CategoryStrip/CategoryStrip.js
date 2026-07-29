"use client";

import Link from "next/link";
import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { Container } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y, Keyboard } from "swiper/modules";
import { MdArrowForwardIos } from "react-icons/md";

import "swiper/css";
import "swiper/css/free-mode";

import {
  popularCategories,
  productSearchHref,
  PRODUCTS_ROUTE,
} from "../data/products";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./CategoryStrip.module.css";

/**
 * Image-based "Popular Categories" carousel shown under the hero.
 * Each item is a real link into the products search; the row is
 * drag/swipe scrollable and disables its own carousel behaviour when
 * every category already fits (watchOverflow).
 */
export default function CategoryStrip() {
  const { t } = useTranslation();
  return (
    <section
      className={styles.section}
      aria-labelledby="popular-categories-title"
    >
      <Container>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 id="popular-categories-title" className={styles.title}>
              {t("categories.title")}
            </h2>
            <Link href={PRODUCTS_ROUTE} className={styles.viewAll}>
              {t("common.actions.viewAll")}
              <MdArrowForwardIos aria-hidden="true" className={styles.viewAllIcon} />
            </Link>
          </div>

          <nav aria-label={t("categories.title")}>
            <Swiper
              modules={[FreeMode, A11y, Keyboard]}
              freeMode
              grabCursor
              watchOverflow
              keyboard={{ enabled: true, onlyInViewport: true }}
              slidesPerView={2.5}
              spaceBetween={12}
              breakpoints={{
                400: { slidesPerView: 3.5, spaceBetween: 14 },
                576: { slidesPerView: 4.5, spaceBetween: 16 },
                768: { slidesPerView: 5.5, spaceBetween: 18 },
                992: { slidesPerView: 6.5, spaceBetween: 20 },
                1200: { slidesPerView: 7.5, spaceBetween: 24 },
              }}
              className={styles.swiper}
            >
              {popularCategories.map((category) => (
                <SwiperSlide key={category.id} className={styles.slide}>
                  <Link
                    href={productSearchHref(category.searchTerm)}
                    className={styles.item}
                  >
                    <span
                      className={styles.circle}
                      style={{ "--img-scale": category.imageScale ?? 1 }}
                    >
                      <AssetImage
                        src={category.image}
                        alt={t(`categories.items.${category.id}`)}
                        width={80}
                        height={80}
                        wrapperClassName={styles.categoryAsset}
                        className={styles.image}
                        placeholderLabel={t(`categories.items.${category.id}`)}
                        showPath={false}
                      />
                    </span>
                    <span className={styles.label}>
                      {t(`categories.items.${category.id}`)}
                    </span>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </nav>
        </div>
      </Container>
    </section>
  );
}
