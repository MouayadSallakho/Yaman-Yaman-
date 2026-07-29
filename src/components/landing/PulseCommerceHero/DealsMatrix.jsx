"use client";

import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { formatPrice } from "./data";
import styles from "./DealsMatrix.module.css";

// Restrained pointer tilt via CSS custom properties — no re-render, no second
// animation system. The existing GSAP reveal sequence still owns entrances.
function handleTilt(e) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  el.style.setProperty("--ry", `${(px - 0.5) * 4}deg`);
  el.style.setProperty("--rx", `${(0.5 - py) * 4}deg`);
  el.style.setProperty("--mx", `${px * 100}%`);
  el.style.setProperty("--my", `${py * 100}%`);
}

function resetTilt(e) {
  const el = e.currentTarget;
  el.style.setProperty("--ry", "0deg");
  el.style.setProperty("--rx", "0deg");
}

function DealCard({ product, t }) {
  return (
    <li className={styles.cardWrap} data-pulse-deal>
      <Link
        href={product.href}
        className={styles.card}
        onPointerMove={handleTilt}
        onPointerLeave={resetTilt}
      >
        <span className={styles.media}>
          <AssetImage
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 767px) 44vw, (max-width: 1199px) 28vw, 240px"
            wrapperClassName={styles.asset}
            className={styles.mediaImg}
            placeholderLabel={product.title}
          />
          {product.discount ? (
            <span className={styles.badge}>-{product.discount}%</span>
          ) : null}
          <span className={styles.sheen} aria-hidden="true" />
        </span>

        <span className={styles.title}>{product.title}</span>
        <span className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.oldPrice ? (
            <s className={styles.oldPrice}>
              <span className="visually-hidden">{t("product.previousPrice")} </span>
              {formatPrice(product.oldPrice)}
            </s>
          ) : null}
        </span>
      </Link>
    </li>
  );
}

/**
 * Centre column — a 2x2 grid of compact deal cards above one wide featured
 * deal. The data hooks consumed by usePulseCommerceSequence are intentionally
 * unchanged so the original reveal and category-swap animations are retained.
 */
export default function DealsMatrix({ deals, featured, t }) {
  return (
    <section
      className={styles.matrix}
      aria-labelledby="pulse-deals-heading"
      data-pulse-panel="deals"
    >
      <h2 id="pulse-deals-heading" className={styles.heading}>
        {t("commerce.dealsTitle")}
      </h2>

      <ul className={styles.grid}>
        {deals.map((product, i) => (
          <DealCard key={i} product={product} t={t} />
        ))}
      </ul>

      {featured ? (
        <div className={styles.featured} data-pulse-featured>
          <Link href={featured.href} className={styles.featuredLink}>
            <span className={styles.featuredMedia}>
              <span className={styles.featuredSpot} aria-hidden="true" />
              <AssetImage
                src={featured.image}
                alt={featured.title}
                fill
                sizes="(max-width: 767px) 82vw, (max-width: 1199px) 42vw, 300px"
                wrapperClassName={styles.featuredAsset}
                className={styles.featuredImg}
                placeholderLabel={featured.title}
                priority
                data-pulse-featured-img
              />
            </span>

            <span className={styles.featuredBody}>
              <span className={styles.featuredLabel}>
                {t("commerce.featuredLabel")}
              </span>
              <span className={styles.featuredTitle}>{featured.title}</span>
              <span className={styles.featuredPrices}>
                <span className={styles.featuredPrice}>
                  {formatPrice(featured.price)}
                </span>
                {featured.oldPrice ? (
                  <s className={styles.featuredOld}>
                    <span className="visually-hidden">
                      {t("product.previousPrice")} {" "}
                    </span>
                    {formatPrice(featured.oldPrice)}
                  </s>
                ) : null}
              </span>
              <span className={styles.featuredCta}>
                {t("common.actions.viewDetails")}
                <FaArrowRightLong aria-hidden="true" />
              </span>
            </span>
          </Link>

          <svg
            className={styles.featuredLine}
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              className={styles.featuredLineStroke}
              data-pulse-featured-line
              pathLength="100"
            />
          </svg>
        </div>
      ) : null}
    </section>
  );
}
