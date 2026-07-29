"use client";

import Link from "next/link";
import { Container } from "react-bootstrap";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";

import SectionHeader from "@/components/landing/SectionHeader/SectionHeader";
import ProductCarousel from "@/components/landing/ProductCarousel/ProductCarousel";
import {
  bestSellerProducts,
  bestSellerCategories,
  productSearchHref,
  PRODUCTS_ROUTE,
} from "@/components/landing/data/products";
import { useTranslation } from "@/i18n/LocaleProvider";

import styles from "./BestSeller.module.css";

export default function BestSeller() {
  const { t } = useTranslation();
  return (
    <section className={styles.BestSeller} aria-labelledby="best-seller-heading">
      <Container>
        <div className={styles.box}>
          <SectionHeader
            id="best-seller-heading"
            title={t("bestSeller.title")}
            viewAllHref={PRODUCTS_ROUTE}
          />

          {/* Category chips: real links into the products search */}
          <div className={styles.Cats}>
            <Swiper
              modules={[FreeMode, A11y]}
              freeMode
              grabCursor
              watchOverflow
              slidesPerView="auto"
              spaceBetween={10}
              className={styles.catSwiper}
              aria-label={t("bestSeller.title")}
            >
              {bestSellerCategories.map((category) => (
                <SwiperSlide key={category} className={styles.slide}>
                  <Link
                    href={productSearchHref(category)}
                    className={styles.chipLink}
                  >
                    {t(`bestSeller.categories.${category}`)}
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className={styles.products}>
            <ProductCarousel
              products={bestSellerProducts}
              label={t("bestSeller.productsLabel")}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
