"use client";

import Link from "next/link";
import { FiArrowRight, FiTag, FiZap } from "react-icons/fi";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./ShopHero.module.css";

const formatPrice = (value) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * Shop discovery header.
 *
 * Deliberately restrained — it orients the visitor and offers two fast routes
 * into the catalogue, then hands the screen over to the products. The shortcuts
 * mutate the same filter state the rest of the page uses (rather than being
 * links to elsewhere), so they run through the shared scroll policy.
 */
export default function ShopHero({ featured, totalCount, onShowNewest, onShowDeals }) {
  const { t } = useTranslation();

  return (
    <section className={styles.hero} aria-labelledby="shop-hero-title">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.copy}>
        <p className={styles.eyebrow}>{t("shop.hero.eyebrow")}</p>
        <h1 id="shop-hero-title" className={styles.title}>
          {t("shop.hero.title")}
        </h1>
        <p className={styles.text}>{t("shop.hero.subtitle")}</p>

        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onShowNewest}>
            <FiZap aria-hidden="true" />
            {t("shop.hero.newest")}
          </button>
          <button type="button" className={styles.secondary} onClick={onShowDeals}>
            <FiTag aria-hidden="true" />
            {t("shop.hero.deals")}
          </button>
        </div>

        <p className={styles.count}>{t("shop.hero.count", { count: totalCount })}</p>
      </div>

      {featured ? (
        <div className={styles.showcase}>
          <div className={styles.showcaseMedia}>
            <AssetImage
              src={featured.image}
              alt={featured.title}
              fill
              sizes="(max-width: 767px) 80vw, 380px"
              priority
              placeholderLabel={featured.title}
              showPath={false}
              wrapperClassName={styles.showcaseStage}
              className={styles.showcaseImage}
            />
          </div>

          <div className={styles.showcaseInfo}>
            <p className={styles.showcaseFlag}>{t("shop.hero.featured")}</p>
            <p className={styles.showcaseName}>{featured.title}</p>
            <p className={styles.showcasePrice}>
              {t("shop.hero.from")}{" "}
              {/* Isolated so the currency symbol stays with the amount in RTL. */}
              <span dir="ltr">{formatPrice(featured.price)}</span>
            </p>
            {featured.detailHref ? (
              <Link href={featured.detailHref} className={styles.showcaseLink}>
                {t("shop.hero.discover")}
                <FiArrowRight aria-hidden="true" className={styles.showcaseArrow} />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
