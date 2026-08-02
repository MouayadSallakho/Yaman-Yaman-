"use client";

import Link from "next/link";
import {
  FiArrowRight,
  FiHeadphones,
  FiZap,
  FiShield,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import styles from "./BrandShowcaseSection.module.css";

const BENEFIT_ICONS = {
  shield: FiShield,
  support: FiHeadphones,
  rocket: FiZap,
};

/**
 * The copy is split into an intro block and a details block with the product
 * media between them in the DOM. That single source order reads correctly in
 * both compositions:
 *
 *   desktop — the card is a grid; intro and details occupy the left column
 *             (rows 1 and 2) while the media is absolutely positioned across
 *             the right side, exactly as before
 *   mobile  — everything collapses to one column and normal flow produces
 *             badge → brand → statement → description → image → trust points →
 *             CTA → product count, with no absolutely positioned content block
 */
export default function FeaturedBrandCard({ brand, t }) {
  return (
    <article className={styles.featuredCard} data-brand-showcase-featured>
      <div className={styles.featuredAmbient} aria-hidden="true" />
      <div className={styles.neonStage} aria-hidden="true" data-brand-showcase-rings>
        <span className={styles.neonRingOuter} />
        <span className={styles.neonRingInner} />
        <span className={styles.stagePlatform} />
      </div>

      <div className={styles.featuredIntro} data-brand-showcase-featured-copy>
        <span className={styles.featuredBadge}>
          <HiSparkles aria-hidden="true" />
          {t("commerce.brandShowcase.featured.badge")}
        </span>

        <h3 className={styles.featuredName}>{brand.name}</h3>
        <p className={styles.featuredTagline}>{t(brand.taglineKey)}</p>
        <p className={styles.featuredDescription}>{t(brand.descriptionKey)}</p>
      </div>

      <AssetImage
        src={brand.imageSrc}
        alt={t(brand.imageAltKey)}
        fill
        sizes="(max-width: 767px) 86vw, (max-width: 1199px) 58vw, 34vw"
        fit="contain"
        wrapperClassName={styles.featuredMedia}
        className={styles.featuredImage}
        placeholderLabel={brand.name}
        placeholderTone="dark"
        showPath={false}
        imageProps={{
          style: {
            objectPosition: brand.objectPosition,
            transform: `scale(${brand.imageScale})`,
          },
        }}
      />

      <div className={styles.featuredDetails} data-brand-showcase-featured-copy>
        <ul className={styles.featuredBenefits}>
          {brand.benefits.map((benefit) => {
            const Icon = BENEFIT_ICONS[benefit.icon] ?? FiShield;
            return (
              <li key={benefit.id}>
                <Icon aria-hidden="true" />
                <span>{t(benefit.labelKey)}</span>
              </li>
            );
          })}
        </ul>

        <div className={styles.featuredFooter}>
          <Link className={styles.featuredCta} href={brand.destinationUrl}>
            <span>{t("commerce.brandShowcase.featured.explore", { name: brand.name })}</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
          <span className={styles.featuredCount}>
            {t("commerce.brandShowcase.productCount", { count: brand.productCount })}
          </span>
        </div>
      </div>
    </article>
  );
}
