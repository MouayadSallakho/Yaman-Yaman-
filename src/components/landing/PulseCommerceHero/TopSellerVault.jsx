"use client";

import Link from "next/link";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { formatPrice } from "./data";
import styles from "./TopSellerVault.module.css";

/**
 * Right column — the ranked top-seller panel. Positional keys and the
 * data-pulse-seller hook remain unchanged so the original GSAP flip sequence
 * keeps the same timing and order.
 */
export default function TopSellerVault({ topSellers, t }) {
  return (
    <section
      className={styles.vault}
      aria-labelledby="pulse-sellers-heading"
      data-pulse-panel="sellers"
    >
      <h2 id="pulse-sellers-heading" className={styles.heading}>
        {t("commerce.topSellersTitle")}
      </h2>

      <ol className={styles.list}>
        {topSellers.map((product, i) => {
          const rank = i + 1;
          return (
            <li key={i} className={styles.cardWrap} data-rank={rank}>
              <Link href={product.href} className={styles.card} data-pulse-seller>
                <span
                  className={styles.rank}
                  aria-label={t("commerce.rankLabel", { rank })}
                >
                  {rank}
                </span>

                <span className={styles.media}>
                  <AssetImage
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 767px) 36vw, 138px"
                    wrapperClassName={styles.asset}
                    className={styles.mediaImg}
                    placeholderLabel={product.title}
                  />
                </span>

                <span className={styles.info}>
                  <span className={styles.title}>{product.title}</span>
                  <span className={styles.priceRow}>
                    <span className={styles.price}>{formatPrice(product.price)}</span>
                    {product.oldPrice ? (
                      <s className={styles.oldPrice}>
                        <span className="visually-hidden">
                          {t("product.previousPrice")} {" "}
                        </span>
                        {formatPrice(product.oldPrice)}
                      </s>
                    ) : null}
                    {product.discount ? (
                      <span className={styles.discount}>-{product.discount}%</span>
                    ) : null}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
