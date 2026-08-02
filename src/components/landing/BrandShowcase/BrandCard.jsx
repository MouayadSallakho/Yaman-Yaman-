"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import styles from "./BrandShowcaseSection.module.css";

export default function BrandCard({ brand, t, index }) {
  const accentClass = styles[`accent${brand.accent[0].toUpperCase()}${brand.accent.slice(1)}`] ?? "";
  const motifClass = styles[`motif${brand.decorativeVariant[0].toUpperCase()}${brand.decorativeVariant.slice(1)}`] ?? "";

  return (
    <article
      className={`${styles.brandCard} ${accentClass} ${motifClass}`.trim()}
      data-brand-showcase-card
      data-brand-index={index}
    >
      <Link
        href={brand.destinationUrl}
        className={styles.brandCardLink}
        aria-label={t("commerce.brandShowcase.exploreBrand", { name: brand.name })}
      >
        <span className={styles.cardDecoration} aria-hidden="true" />
        {/* A real heading rather than a styled span: each brand card is a
            landmark in the section outline (h2 section → h3 brand). */}
        <h3 className={styles.brandWordmark}>{brand.name}</h3>

        <AssetImage
          src={brand.imageSrc}
          alt={t(brand.imageAltKey)}
          fill
          sizes="(max-width: 767px) 76vw, (max-width: 1199px) 46vw, 240px"
          fit="contain"
          wrapperClassName={styles.brandMedia}
          className={styles.brandImage}
          placeholderLabel={brand.name}
          showPath={false}
          imageProps={{
            style: {
              objectPosition: brand.objectPosition,
              transform: `scale(${brand.imageScale})`,
            },
          }}
        />

        <span className={styles.brandMeta}>
          <span className={styles.brandCategory}>{t(brand.categoryKey)}</span>
          <span className={styles.productCount}>
            {t("commerce.brandShowcase.productCount", { count: brand.productCount })}
          </span>
        </span>

        <span className={styles.brandAction} aria-hidden="true">
          <FiArrowUpRight />
        </span>
      </Link>
    </article>
  );
}
