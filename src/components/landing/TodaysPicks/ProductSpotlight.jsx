"use client";

import Link from "next/link";
import { FiArrowRight, FiCheck, FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import styles from "./TodaysPicksSection.module.css";

const accentClass = (accent) => styles[`accent${accent[0].toUpperCase()}${accent.slice(1)}`] || styles.accentBlue;

export default function ProductSpotlight({
  product,
  position,
  total,
  formatPrice,
  t,
  onPrevious,
  onNext,
}) {
  const discount = product.previousPrice
    ? Math.round((1 - product.price / product.previousPrice) * 100)
    : null;

  return (
    <div className={`${styles.spotlight} ${accentClass(product.accent)}`.trim()}>
      <div className={styles.visualPanel} data-todays-picks-visual>
        <div className={styles.visualAmbient} aria-hidden="true" />
        <div className={styles.visualGrid} aria-hidden="true" />
        <div className={styles.orbitOne} aria-hidden="true" />
        <div className={styles.orbitTwo} aria-hidden="true" />
        <div className={styles.stageShadow} aria-hidden="true" />

        <div className={styles.visualMeta}>
          <span className={styles.categoryBadge}>{t(product.categoryKey)}</span>
          <span className={styles.positionControls}>
            <button type="button" className={styles.positionButton} onClick={onPrevious} aria-label={t("commerce.todaysPicks.previousPick")}>
              <FiChevronLeft aria-hidden="true" />
            </button>
            <span className={styles.positionLabel}>
              {t("commerce.todaysPicks.position", {
                current: String(position).padStart(2, "0"),
                total: String(total).padStart(2, "0"),
              })}
            </span>
            <button type="button" className={styles.positionButton} onClick={onNext} aria-label={t("commerce.todaysPicks.nextPick")}>
              <FiChevronRight aria-hidden="true" />
            </button>
          </span>
        </div>

        <AssetImage
          src={product.imageSrc}
          alt={`${product.name} — ${t(product.variantKey)}`}
          fill
          sizes="(max-width: 767px) 92vw, (max-width: 1199px) 88vw, 55vw"
          fit={product.mediaVariant}
          wrapperClassName={styles.productMedia}
          className={styles.productImage}
          placeholderLabel={product.name}
          placeholderTone="dark"
          imageProps={{
            style: {
              objectPosition: product.objectPosition,
              transform: `scale(${product.imageScale})`,
            },
          }}
        />
      </div>

      <div className={styles.informationPanel} data-todays-picks-copy aria-live="polite">
        <span className={styles.recommendationLabel}>
          <FiStar aria-hidden="true" />
          {t(product.recommendationKey)}
        </span>

        <div className={styles.productHeading}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productVariant}>{t(product.variantKey)}</p>
        </div>

        <p className={styles.productDescription}>{t(product.descriptionKey)}</p>

        <div className={styles.reasonCard}>
          <span className={styles.reasonKicker}>{t("commerce.todaysPicks.whyTitle")}</span>
          <p>{t(product.reasonKey)}</p>
        </div>

        <ul className={styles.featureList} aria-label={t("commerce.todaysPicks.featuresLabel")}>
          {product.featureKeys.map((featureKey) => (
            <li key={featureKey}>
              <FiCheck aria-hidden="true" />
              <span>{t(featureKey)}</span>
            </li>
          ))}
        </ul>

        <div className={styles.purchaseRow}>
          <div className={styles.priceBlock}>
            <div className={styles.priceLine}>
              <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
              {discount ? (
                <span className={styles.discountBadge}>
                  {t("commerce.todaysPicks.savePercent", { percent: discount })}
                </span>
              ) : null}
            </div>
            {product.previousPrice ? (
              <s className={styles.previousPrice}>
                <span className="visually-hidden">{t("product.previousPrice")} </span>
                {formatPrice(product.previousPrice)}
              </s>
            ) : null}
          </div>

          <Link href={product.productUrl} className={styles.detailsAction}>
            <span>{t("commerce.todaysPicks.viewDetails")}</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
