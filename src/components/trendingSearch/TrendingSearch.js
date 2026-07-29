"use client";

import Link from "next/link";
import { FiArrowRight, FiTrendingUp } from "react-icons/fi";
import { Container } from "react-bootstrap";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { productSearchHref } from "@/components/landing/data/products";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./TrendingSearch.module.css";

const TRENDING_TERMS = [
  "Vacuum Robot", "Coffee Maker", "Smart Watch", "Projector", "Gaming PC",
  "Headphones", "Camera", "TV", "Laptop", "Smart Home", "Accessories",
  "Storage", "Keyboard", "Mouse",
];

export default function TrendingSearch() {
  const { t } = useTranslation();
  const label = (term) => t(`trending.items.${term}`);

  return (
    <section id="trending-search" className={styles.section} aria-labelledby="trending-heading">
      <Container fluid className={styles.container}>
        <div className={styles.surface}>
          <div className={styles.discovery}>
            <div className={styles.headingRow}>
              <div>
                <span className={styles.eyebrow}><FiTrendingUp aria-hidden="true" />{t("trending.eyebrow")}</span>
                <h2 id="trending-heading">{t("trending.title")}</h2>
                <p>{t("trending.subtitle")}</p>
              </div>
              <Link href="/products" className={styles.viewAll}>{t("common.actions.viewAll")} <FiArrowRight aria-hidden="true" /></Link>
            </div>
            <div className={styles.pills} aria-label={t("trending.title")}>
              {TRENDING_TERMS.map((term) => <Link key={term} href={productSearchHref(term)}>{label(term)}</Link>)}
            </div>
          </div>

          <Link href="/products" className={styles.preorderCard}>
            <div className={styles.preorderCopy}>
              <span className={styles.preorderLabel}>{t("trending.preOrder")}</span>
              <strong>{t("trending.preOrderLead")}</strong>
              <span>{t("trending.priceFrom")}</span>
              <em>{t("common.actions.discoverNow")} <FiArrowRight aria-hidden="true" /></em>
            </div>
            <AssetImage
              src="/images/products/opplo-watch-3.webp"
              alt="Opplo Watch Sport Series 8"
              fill
              fit="contain"
              wrapperClassName={styles.preorderMedia}
              placeholderLabel="Opplo Watch"
              showPath={false}
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}
