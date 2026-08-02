"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import styles from "./NewArrivalsSection.module.css";

// Mobile is a rail of ~78vw cards capped at 300px, tablet is a 2-up grid, and
// desktop cards top out near 320px — so the widest candidate is a fixed size
// rather than a viewport fraction, which would over-fetch on large screens.
const CARD_IMAGE_SIZES =
  "(max-width: 767px) 80vw, (max-width: 1199px) 46vw, 320px";

export default function ArrivalProductCard({ product, formatPrice, t }) {
  return (
    <article
      className={styles.productCard}
      data-new-arrivals-card
      data-media-role={product.category}
    >
      <div className={styles.productMedia}>
        <span className={styles.newBadge}>{t("commerce.newArrivals.newBadge")}</span>
        <AssetImage
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes={CARD_IMAGE_SIZES}
          fit={product.mediaVariant}
          wrapperClassName={styles.productAsset}
          className={styles.productImage}
          placeholderLabel={product.name}
          imageProps={{
            style: {
              objectPosition: product.objectPosition,
              transform: `scale(${product.imageScale})`,
            },
          }}
        />
      </div>

      <div className={styles.productBody}>
        <div className={styles.productCopy}>
          <h3 className={styles.productTitle}>
            <Link href={product.productUrl}>{product.name}</Link>
          </h3>
          <p className={styles.productVariant}>{product.variant}</p>
          <p className={styles.productPriceRow}>
            <span className={styles.productPrice}>{formatPrice(product.price)}</span>
            {product.previousPrice ? (
              <s className={styles.productOldPrice}>
                <span className="visually-hidden">
                  {t("product.previousPrice")} {" "}
                </span>
                {formatPrice(product.previousPrice)}
              </s>
            ) : null}
          </p>
        </div>

        <Link
          href={product.productUrl}
          className={styles.productAction}
          aria-label={t("commerce.newArrivals.viewProduct", { name: product.name })}
        >
          <FiArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
