"use client";

import Link from "next/link";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { Container } from "react-bootstrap";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { promoTiles, PRODUCTS_ROUTE } from "../data/products";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./PromoRow.module.css";

const CTA_KEY = {
  playgo: "promo.cta.discover",
  keyboard: "promo.cta.discover",
  watch: "promo.cta.shop",
  okodo: "promo.cta.shop",
};

export default function PromoRow() {
  const { t } = useTranslation();

  return (
    <section id="promotions" className={styles.section} aria-labelledby="promo-row-title">
      <Container fluid className={styles.container}>
        <div className={styles.surface}>
          <header className={styles.header}>
            <div>
              <span className={styles.eyebrow}><FiStar aria-hidden="true" />{t("promo.sectionLabel")}</span>
              <h2 id="promo-row-title">{t("promo.title")}</h2>
              <p>{t("promo.subtitle")}</p>
            </div>
            <Link href={PRODUCTS_ROUTE} className={styles.viewAll}>
              {t("promo.viewAll")} <FiArrowRight aria-hidden="true" />
            </Link>
          </header>

          <div className={styles.grid}>
            {promoTiles.map((tile) => (
              <Link
                href={PRODUCTS_ROUTE}
                className={`${styles.tile} ${tile.theme === "dark" ? styles.tileDark : ""}`.trim()}
                key={tile.id}
              >
                <AssetImage
                  src={tile.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 88vw, (max-width: 992px) 46vw, 320px"
                  fit="cover"
                  wrapperClassName={styles.tileAsset}
                  className={styles.tileImg}
                  placeholderLabel={tile.title}
                />
                <span className={styles.tileContent}>
                  <span className={styles.tileNote}>{t(`promo.notes.${tile.id}`)}</span>
                  <strong className={styles.tileTitle}>{tile.title}</strong>
                  <span className={styles.tileCta}>
                    {t(CTA_KEY[tile.id] ?? "promo.cta.discover")} <FiArrowRight aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
