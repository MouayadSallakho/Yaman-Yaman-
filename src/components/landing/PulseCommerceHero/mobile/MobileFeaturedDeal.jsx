"use client";

import Link from "next/link";
import { FaArrowRight, FaBolt, FaStar } from "react-icons/fa6";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { formatPrice } from "../data";
import styles from "./MobileFeaturedDeal.module.css";

/**
 * Mobile Featured Deal — the hero's fixed commercial focal point.
 *
 * Deliberately not a carousel: one product, one price, one CTA. Information
 * sits inline-start, the illuminated product stage inline-end, matching the
 * approved composition.
 *
 * TRUTHFULNESS
 * ------------
 * The approved image shows hardware spec chips (chip / RAM / display). The
 * catalogue has no spec fields, so those are replaced by metadata that really
 * exists on every record — the star rating and the review count. The discount
 * chip renders only when `oldPrice` genuinely beats `price`.
 *
 * @param {{ product: object|null, t: (key: string, vars?: object) => string }} props
 */
export default function MobileFeaturedDeal({ product, t }) {
  if (!product) return null;

  return (
    <section
      className={styles.featured}
      aria-labelledby="m-pulse-featured-heading"
      data-m-stage="featured"
    >
      {/* h2 matches the desktop hero and every other landing section, so the
          page outline stays h2-per-section with no skipped level. */}
      <h2 id="m-pulse-featured-heading" className="visually-hidden">
        {t("commerce.featuredLabel")}
      </h2>

      <Link href={product.href} className={styles.link}>
        <span className={styles.body} data-m-featured-body>
          <span className={styles.eyebrow}>
            <FaBolt aria-hidden="true" />
            {t("commerce.featuredLabel")}
          </span>

          <span className={styles.title}>{product.title}</span>

          <span className={styles.meta}>
            {product.rating ? (
              <span className={styles.chip}>
                <FaStar aria-hidden="true" className={styles.chipStar} />
                <span aria-hidden="true">{product.rating}</span>
                <span className="visually-hidden">
                  {t("product.ratedOutOf", { rating: product.rating })}
                </span>
              </span>
            ) : null}
            {product.reviews ? (
              <span className={styles.chip}>
                {t("commerce.mobile.reviews", { count: product.reviews })}
              </span>
            ) : null}
          </span>

          <span className={styles.priceRow}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {product.oldPrice ? (
              <s className={styles.oldPrice}>
                <span className="visually-hidden">
                  {t("product.previousPrice")}{" "}
                </span>
                {formatPrice(product.oldPrice)}
              </s>
            ) : null}
            {product.discount ? (
              <span className={styles.save}>-{product.discount}%</span>
            ) : null}
          </span>

          <span className={styles.cta}>
            {t("common.actions.viewDetails")}
            <FaArrowRight aria-hidden="true" className={styles.ctaIcon} />
          </span>
        </span>

        <span className={styles.stage} data-m-featured-stage>
          <span className={styles.stageGlow} aria-hidden="true" />
          <span className={styles.stageRings} aria-hidden="true" />
          <AssetImage
            src={product.image}
            alt={product.title}
            fill
            /*
              This is the mobile hero's LCP element, so it is eager.

              Above the hero's breakpoint this composition is `display: none` and
              the desktop featured image is the one on screen — so the hint here
              deliberately matches the desktop image's `300px` from 1200px up.
              Both then resolve to the same optimised URL and the eager fetch is
              shared rather than wasted on a hidden element.
            */
            sizes="(max-width: 1199px) 46vw, 300px"
            priority
            wrapperClassName={styles.asset}
            className={styles.image}
            placeholderLabel={product.title}
            placeholderTone="dark"
            showPath={false}
            data-m-featured-img
          />
        </span>
      </Link>
    </section>
  );
}
