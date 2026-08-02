"use client";

import { useRef } from "react";
import Link from "next/link";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { Container } from "react-bootstrap";

import { useTranslation } from "@/i18n/LocaleProvider";
import { PROMO_VIEW_ALL_HREF, promotions } from "./data";
import { usePromoRowMotion } from "./usePromoRowMotion";
import styles from "./PromoRow.module.css";

/**
 * Product imagery is decorative here, so it is painted as a card-local CSS
 * background layer rather than an `<img>` in the document flow. Three things
 * follow from that:
 *
 *   - card height is set by CSS alone, so a slow or missing image cannot shift
 *     the layout;
 *   - the artwork carries no meaning the copy does not already carry, so there
 *     is no alt text to get wrong;
 *   - when a file is missing the browser simply paints no image layer and the
 *     card's own tonal background remains — a controlled fallback with no
 *     broken-image affordance and no fabricated product silhouette.
 *
 * The per-card treatment travels as custom properties so the stylesheet keeps
 * one rule and the data module owns the values.
 */
function mediaVars(promo) {
  return {
    "--promo-media-image": `url("${promo.imageSrc}")`,
    "--promo-media-size": promo.media.size,
    "--promo-media-position": promo.media.position,
    "--promo-media-position-rtl": promo.media.positionRtl,
  };
}

export default function PromoRow() {
  const { t } = useTranslation();
  const rootRef = useRef(null);

  usePromoRowMotion({ rootRef });

  return (
    <section
      id="promotions"
      ref={rootRef}
      className={styles.section}
      aria-labelledby="promo-row-title"
    >
      <Container fluid className={styles.container}>
        <div className={styles.surface}>
          {/* One header, one h2, one Browse All link. The link re-flows below
              the description on narrow screens through layout rather than a
              second copy of the markup, so the DOM order below is also the
              reading order and the tab order at every width. */}
          <header className={styles.header}>
            <div className={styles.headingGroup} data-promo-header>
              <span className={styles.eyebrow}>
                <FiStar aria-hidden="true" />
                {t("promo.sectionLabel")}
              </span>
              <h2 id="promo-row-title" className={styles.title}>
                {t("promo.title")}
              </h2>
              <p className={styles.subtitle}>{t("promo.subtitle")}</p>
            </div>

            <Link href={PROMO_VIEW_ALL_HREF} className={styles.viewAll} data-promo-header>
              <span>{t("promo.viewAll")}</span>
              <FiArrowRight aria-hidden="true" />
            </Link>
          </header>

          {/* A list rather than a bare div: on mobile the cards become a
              horizontal rail where only part of the next card is visible, and
              the list semantics tell a screen-reader user how many there are
              before they start scrolling. */}
          <ul className={styles.grid}>
            {promotions.map((promo) => (
              <li className={styles.tileItem} key={promo.id} data-promo-card>
                <Link
                  href={promo.destinationUrl}
                  className={`${styles.tile} ${promo.theme === "dark" ? styles.tileDark : ""}`.trim()}
                  style={mediaVars(promo)}
                >
                  <span className={styles.tileContent}>
                    <span className={styles.tileNote}>{t(promo.noteKey)}</span>
                    <strong className={styles.tileTitle}>{promo.title}</strong>
                    <span className={styles.tileCta}>
                      <span>{t(promo.ctaKey)}</span>
                      <FiArrowRight aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
