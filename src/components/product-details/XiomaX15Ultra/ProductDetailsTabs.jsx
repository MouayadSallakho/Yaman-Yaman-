"use client";

import { useId, useRef, useState } from "react";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./XiomaX15Ultra.module.css";

const TAB_IDS = ["overview", "specifications", "camera", "reviews", "box"];

export default function ProductDetailsTabs({ product }) {
  const { t, dir } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const prefix = useId().replaceAll(":", "");
  const tabRefs = useRef([]);

  function selectByIndex(index) {
    const next = (index + TAB_IDS.length) % TAB_IDS.length;
    setActiveTab(TAB_IDS[next]);
    requestAnimationFrame(() => tabRefs.current[next]?.focus());
  }

  function onKeyDown(event, index) {
    if (event.key === "ArrowRight") { event.preventDefault(); selectByIndex(dir === "rtl" ? index - 1 : index + 1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); selectByIndex(dir === "rtl" ? index + 1 : index - 1); }
    else if (event.key === "Home") { event.preventDefault(); selectByIndex(0); }
    else if (event.key === "End") { event.preventDefault(); selectByIndex(TAB_IDS.length - 1); }
  }

  return (
    <section id="product-details" className={styles.detailsSection} aria-labelledby={`${prefix}-details-title`} data-product-details>
      <div className={styles.detailsHeading}>
        <span>{t("productDemo.details.eyebrow")}</span>
        <h2 id={`${prefix}-details-title`}>{t("productDemo.details.title")}</h2>
        <p>{t("productDemo.details.subtitle")}</p>
      </div>

      <div className={styles.tabList} role="tablist" aria-label={t("productDemo.details.tabLabel")}>
        {TAB_IDS.map((tab, index) => (
          <button
            key={tab}
            ref={(node) => { tabRefs.current[index] = node; }}
            id={`${prefix}-${tab}-tab`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`${prefix}-panel`}
            tabIndex={activeTab === tab ? 0 : -1}
            className={activeTab === tab ? styles.tabActive : ""}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {t(`productDemo.details.tabs.${tab}`)}
          </button>
        ))}
      </div>

      <div id={`${prefix}-panel`} role="tabpanel" tabIndex={0} aria-labelledby={`${prefix}-${activeTab}-tab`} className={styles.tabPanel}>
        {activeTab === "overview" && <Overview product={product} t={t} />}
        {activeTab === "specifications" && <Specifications product={product} t={t} />}
        {activeTab === "camera" && <Camera product={product} t={t} />}
        {activeTab === "reviews" && <Reviews product={product} t={t} />}
        {activeTab === "box" && <BoxContents product={product} t={t} />}
      </div>
    </section>
  );
}

function Overview({ product, t }) {
  return (
    <div className={styles.overviewPanel}>
      <div className={styles.overviewCopy}>
        <span className={styles.panelEyebrow}>{t("productDemo.overview.eyebrow")}</span>
        <h3>{t("productDemo.overview.title")}</h3>
        <p>{t("productDemo.overview.copy")}</p>
        <div className={styles.benefitGrid}>
          {product.overviewBenefits.map(([mark, key]) => <div key={key}><span>{mark}</span><strong>{t(key)}</strong></div>)}
        </div>
      </div>
      <div className={styles.overviewVisual}>
        <AssetImage src="/images/products/xioma-x15-ultra/04-camera-closeup.webp" alt={t("productDemo.gallery.camera.alt")} fill sizes="(max-width: 767px) 92vw, 45vw" fit="cover" placeholderLabel={t("productDemo.gallery.camera.alt")} wrapperClassName={styles.detailMedia} />
        <div className={styles.overviewStat}><strong>200MP</strong><span>{t("productDemo.overview.cameraStat")}</span></div>
      </div>
    </div>
  );
}

function Specifications({ product, t }) {
  return <dl className={styles.specGrid}>{product.specifications.map(([key, value]) => <div key={key}><dt>{t(key)}</dt><dd>{value}</dd></div>)}</dl>;
}

function Camera({ product, t }) {
  return (
    <div className={styles.cameraPanel}>
      <div className={styles.cameraVisual}>
        <AssetImage src="/images/products/xioma-x15-ultra/07-camera-sample.webp" alt={t("productDemo.gallery.sample.alt")} fill sizes="(max-width: 767px) 92vw, 48vw" fit="cover" placeholderLabel={t("productDemo.gallery.sample.alt")} wrapperClassName={styles.detailMedia} />
        <span>{t("productDemo.camera.demoLabel")}</span>
      </div>
      <div className={styles.cameraCopy}>
        <span className={styles.panelEyebrow}>{t("productDemo.camera.eyebrow")}</span>
        <h3>{t("productDemo.camera.title")}</h3>
        <p>{t("productDemo.camera.copy")}</p>
        <div className={styles.cameraStats}>{product.cameraHighlights.map(([value, key]) => <div key={key}><strong>{value}</strong><span>{t(key)}</span></div>)}</div>
      </div>
    </div>
  );
}

function Reviews({ product, t }) {
  return (
    <div className={styles.reviewsPanel}>
      <div className={styles.reviewSummary}>
        <strong>{product.rating}</strong><span aria-hidden="true">★★★★★</span>
        <p>{t("productDemo.reviews.summary", { count: product.reviewCount })}</p>
        <small>{t("productDemo.reviews.demoDisclosure")}</small>
      </div>
      <div className={styles.reviewList}>
        {product.reviews.map((review) => (
          <article key={review.id}>
            <header><span>{review.initials}</span><div><strong>{review.author}</strong><small>{review.date}</small></div><em aria-label={t("productDemo.reviews.fiveStars")}>★★★★★</em></header>
            <h3>{t(review.titleKey)}</h3><p>{t(review.bodyKey)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function BoxContents({ product, t }) {
  return (
    <div className={styles.boxPanel}>
      <div className={styles.boxCopy}><span className={styles.panelEyebrow}>{t("productDemo.box.eyebrow")}</span><h3>{t("productDemo.box.title")}</h3><p>{t("productDemo.box.copy")}</p></div>
      <div className={styles.boxGrid}>{product.boxItems.map(([number, key]) => <div key={key}><span>{number}</span><strong>{t(key)}</strong></div>)}</div>
    </div>
  );
}
