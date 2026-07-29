"use client";

import Link from "next/link";
import { useRef } from "react";

import { useTranslation } from "@/i18n/LocaleProvider";
import ProductDetailsTabs from "./ProductDetailsTabs";
import ProductGallery from "./ProductGallery";
import ProductPurchasePanel from "./ProductPurchasePanel";
import RelatedProducts from "./RelatedProducts";
import { XIOMA_X15_ULTRA } from "./data";
import useProductPageMotion from "./useProductPageMotion";
import styles from "./XiomaX15Ultra.module.css";

export default function XiomaX15UltraPage() {
  const { t, dir } = useTranslation();
  const pageRef = useRef(null);
  useProductPageMotion(pageRef);

  return (
    <main id="main-content" className={styles.page} ref={pageRef} data-direction={dir}>
      <div className={styles.ambientOne} aria-hidden="true" />
      <div className={styles.ambientTwo} aria-hidden="true" />
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label={t("productDemo.breadcrumb.label")} data-product-breadcrumb>
          <Link href="/">{t("common.nav.home")}</Link><span aria-hidden="true">/</span>
          <Link href="/products">{t("common.nav.products")}</Link><span aria-hidden="true">/</span>
          <span>{t("productDemo.category")}</span><span aria-hidden="true">/</span>
          <span aria-current="page">{XIOMA_X15_ULTRA.name}</span>
        </nav>

        <section className={styles.mobileIntro} aria-labelledby="xioma-mobile-title">
          <span>{t("productDemo.badge")}</span>
          <p>{XIOMA_X15_ULTRA.brand}</p>
          <h1 id="xioma-mobile-title">{XIOMA_X15_ULTRA.name}</h1>
          <p className={styles.mobileTagline}>{t("productDemo.tagline")}</p>
          <div><strong aria-hidden="true">★★★★★</strong><b>{XIOMA_X15_ULTRA.rating}</b><a href="#product-details">{t("productDemo.reviewCount", { count: XIOMA_X15_ULTRA.reviewCount })}</a></div>
        </section>

        <div className={styles.heroGrid} data-product-reveal>
          <ProductGallery gallery={XIOMA_X15_ULTRA.gallery} />
          <ProductPurchasePanel product={XIOMA_X15_ULTRA} />
        </div>

        <ProductDetailsTabs product={XIOMA_X15_ULTRA} />
      </div>

      {/* Full-width sibling of the product container. The shared layout does not
          render a Footer, so the route renders it after this section — the two
          stay separate regions. */}
      <RelatedProducts />
    </main>
  );
}
