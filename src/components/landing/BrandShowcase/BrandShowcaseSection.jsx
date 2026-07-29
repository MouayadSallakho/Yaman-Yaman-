"use client";

import { useRef } from "react";
import { Container } from "react-bootstrap";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

import { useTranslation } from "@/i18n/LocaleProvider";
import BrandBenefitsStrip from "./BrandBenefitsStrip";
import BrandCard from "./BrandCard";
import FeaturedBrandCard from "./FeaturedBrandCard";
import {
  BRAND_SHOWCASE_VIEW_ALL_HREF,
  brandBenefits,
  featuredBrand,
  showcaseBrands,
} from "./data";
import { useBrandShowcaseMotion } from "./useBrandShowcaseMotion";
import styles from "./BrandShowcaseSection.module.css";

export default function BrandShowcaseSection() {
  const { t, dir } = useTranslation();
  const rootRef = useRef(null);

  useBrandShowcaseMotion({ rootRef, dir });

  return (
    <section
      id="brand-showcase"
      ref={rootRef}
      className={styles.section}
      aria-labelledby="brand-showcase-title"
    >
      <Container fluid className={styles.container}>
        <div className={styles.surface}>
          <header className={styles.header}>
            <div className={styles.headingGroup} data-brand-showcase-header>
              <span className={styles.eyebrow}>
                <HiSparkles aria-hidden="true" />
                {t("commerce.brandShowcase.badge")}
              </span>
              <h2 id="brand-showcase-title" className={styles.title}>
                {t("commerce.brandShowcase.title")}
              </h2>
              <p className={styles.subtitle}>{t("commerce.brandShowcase.subtitle")}</p>
            </div>

            <Link
              href={BRAND_SHOWCASE_VIEW_ALL_HREF}
              className={`${styles.viewAll} ${styles.viewAllDesktop}`}
              data-brand-showcase-header
            >
              <span>{t("commerce.brandShowcase.viewAll")}</span>
              <FiArrowRight aria-hidden="true" />
            </Link>
          </header>

          <div className={styles.showcaseGrid}>
            <FeaturedBrandCard brand={featuredBrand} t={t} />
            <div className={styles.brandGrid}>
              {showcaseBrands.map((brand, index) => (
                <BrandCard key={brand.id} brand={brand} t={t} index={index} />
              ))}
            </div>
          </div>

          <Link
            href={BRAND_SHOWCASE_VIEW_ALL_HREF}
            className={`${styles.viewAll} ${styles.viewAllMobile}`}
            data-brand-showcase-mobile-action
          >
            <span>{t("commerce.brandShowcase.viewAll")}</span>
            <FiArrowRight aria-hidden="true" />
          </Link>

          <BrandBenefitsStrip benefits={brandBenefits} t={t} />
        </div>
      </Container>
    </section>
  );
}
