"use client";

import Link from "next/link";
import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { FaStar, FaRegStar } from "react-icons/fa";

import { PRODUCTS_ROUTE } from "../data/products";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./ProductCard.module.css";

const BADGE_TONES = {
  dark: styles.badgeDark,
  success: styles.badgeSuccess,
  danger: styles.badgeDanger,
};

const formatPrice = (value) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

/**
 * Single reusable product card for every landing section.
 *
 * @param {object} props
 * @param {{id: string, title: string, image: string, price: number,
 *          oldPrice: (number|null), rating: number, reviews: number,
 *          badge: ({label: string, tone: string}|null)}} props.product
 * @param {string} [props.sizes] - next/image sizes hint for the media stage.
 * @param {string} [props.mediaAspect] - CSS aspect-ratio for the media stage.
 *   Defaults to the square stage from the stylesheet. Wider cards (such as the
 *   product-page recommendation rail) pass a shorter ratio to keep card height
 *   moderate without changing the landing grid.
 */
export default function ProductCard({
  product,
  sizes = "(max-width: 480px) 78vw, (max-width: 992px) 45vw, 240px",
  mediaAspect,
}) {
  const { title, image, price, oldPrice, rating, reviews, badge } = product;
  const { t } = useTranslation();

  return (
    <article className={styles.card}>
      <div
        className={styles.media}
        style={mediaAspect ? { aspectRatio: mediaAspect } : undefined}
      >
        <AssetImage
          src={image}
          alt={title}
          fill
          sizes={sizes}
          wrapperClassName={styles.mediaAsset}
          className={styles.mediaImg}
          placeholderLabel={title}
        />
        {badge ? (
          <span className={`${styles.badge} ${BADGE_TONES[badge.tone] ?? styles.badgeDark}`}>
            {badge.label}
          </span>
        ) : null}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={PRODUCTS_ROUTE} className={styles.titleLink}>
            {title}
          </Link>
        </h3>

        <p className={styles.rating}>
          <span aria-hidden="true" className={styles.stars}>
            {Array.from({ length: 5 }, (_, i) =>
              i < rating ? <FaStar key={i} /> : <FaRegStar key={i} />
            )}
          </span>
          <span className="visually-hidden">
            {t("product.ratedOutOf", { rating })}
          </span>
          <span className={styles.reviews}>({reviews})</span>
        </p>

        <p className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(price)}</span>
          {oldPrice ? (
            <s className={styles.oldPrice}>
              <span className="visually-hidden">
                {t("product.previousPrice")}{" "}
              </span>
              {formatPrice(oldPrice)}
            </s>
          ) : null}
        </p>

        <Link href={PRODUCTS_ROUTE} className={styles.viewBtn}>
          {t("product.viewProduct")}
        </Link>
      </div>
    </article>
  );
}
