"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import styles from "./NewArrivalsSection.module.css";

export default function FeaturedArrivalCard({ product, formatPrice, t }) {
  return (
    /* data-media-role drives per-category size caps in CSS — a tall phone and a
       wide soundbar cannot share one containment box without one of them looking
       wrong. It reuses the existing `category` field, so no product data changes. */
    <article
      className={styles.featuredCard}
      data-new-arrivals-featured
      data-media-role={product.category}
    >
      <div className={styles.featuredGlow} aria-hidden="true" data-new-arrivals-glow />
      <span className={styles.newBadge}>{t("commerce.newArrivals.newBadge")}</span>

      <AssetImage
        src={product.imageSrc}
        alt={product.imageAlt}
        fill
        priority={false}
        sizes="(max-width: 767px) 92vw, (max-width: 1199px) 88vw, 48vw"
        fit={product.mediaVariant}
        wrapperClassName={styles.featuredMedia}
        className={styles.featuredImage}
        placeholderLabel={product.name}
        placeholderTone="dark"
        imageProps={{
          style: {
            objectPosition: product.objectPosition,
            transform: `scale(${product.imageScale})`,
          },
        }}
      />

      <div className={styles.featuredOverlay}>
        <div className={styles.featuredCopy}>
          <h3 className={styles.featuredTitle}>{product.name}</h3>
          <p className={styles.featuredVariant}>{product.variant}</p>
          <p className={styles.featuredSpecs}>{product.specifications}</p>
          <p className={styles.featuredPriceRow}>
            <span className={styles.featuredPrice}>{formatPrice(product.price)}</span>
            {product.previousPrice ? (
              <s className={styles.featuredOldPrice}>
                <span className="visually-hidden">
                  {t("product.previousPrice")} {" "}
                </span>
                {formatPrice(product.previousPrice)}
              </s>
            ) : null}
          </p>
        </div>

        <Link className={styles.featuredCta} href={product.productUrl}>
          <span>{t("commerce.newArrivals.exploreNow")}</span>
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
