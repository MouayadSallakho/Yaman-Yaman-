"use client";

import Link from "next/link";
import {
  FaStar,
  FaTags,
  FaGem,
  FaBolt,
  FaWallet,
  FaMobileScreenButton,
  FaThumbsUp,
  FaFire,
  FaArrowRightLong,
} from "react-icons/fa6";

import styles from "./CategoryReactor.module.css";

// Icon per real collection id (kept out of data.js so the data stays pure).
const COLLECTION_ICONS = {
  "top-rated": FaStar,
  "best-value": FaTags,
  premium: FaGem,
  everyday: FaBolt,
  budget: FaWallet,
  mobile: FaMobileScreenButton,
  popular: FaThumbsUp,
  "hot-deals": FaFire,
};

const pad2 = (n) => String(n).padStart(2, "0");
// Round to a short, stable decimal so SSR and client emit identical values.
const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Left column — the mechanical "Category Reactor".
 *
 * Presentational: it renders the ring, ticks, a small mechanical selector
 * (pointer) and eight evenly-spaced, icon-only category nodes (real buttons).
 * The centre hub shows only the active collection's icon, name and index — no
 * product imagery lives in this column. All motion is owned by the hero's
 * master timeline via the `data-pulse-*` hooks. Selection is delegated upward
 * through `onSelect`.
 *
 * @param {{
 *   collections: object[],
 *   activeIndex: number,
 *   count: number,
 *   viewAllHref: string,
 *   activeLabel: string,
 *   dir: "ltr"|"rtl",
 *   t: (key: string, vars?: object) => string,
 *   onSelect: (index: number) => void,
 * }} props
 */
export default function CategoryReactor({
  collections,
  activeIndex,
  count,
  viewAllHref,
  activeLabel,
  dir,
  t,
  onSelect,
}) {
  const ActiveIcon = COLLECTION_ICONS[collections[activeIndex]?.id] ?? FaBolt;

  // Nodes are placed at 45° intervals (i=0 top, clockwise) through stylesheet
  // position classes — NOT inline styles — so GSAP's assembly clearProps can
  // never wipe their coordinates. Top-half nodes carry their label above.
  const LABEL_ABOVE = new Set([0, 1, 7]);

  return (
    <div className={styles.reactor}>
      <p className={styles.heading}>{t("commerce.reactorTitle")}</p>

      <div className={styles.stage} data-pulse-stage>
        <div className={styles.ring} data-pulse-ring>
          {/* layered mechanical tracks + fine ticks (NO rotating arc) */}
          <svg className={styles.tracks} viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="96" className={styles.trackOuter} />
            <circle cx="100" cy="100" r="82" className={styles.trackMid} />
            <circle cx="100" cy="100" r="60" className={styles.trackInner} />
            <g className={styles.ticks} data-pulse-spin>
              {Array.from({ length: 60 }, (_, i) => {
                const major = i % 5 === 0;
                const a = (i / 60) * Math.PI * 2;
                const rOuter = 90;
                const rInner = major ? 82 : 86;
                return (
                  <line
                    key={i}
                    x1={r2(100 + rOuter * Math.cos(a))}
                    y1={r2(100 + rOuter * Math.sin(a))}
                    x2={r2(100 + rInner * Math.cos(a))}
                    y2={r2(100 + rInner * Math.sin(a))}
                    className={major ? styles.tickMajor : styles.tickMinor}
                  />
                );
              })}
            </g>
          </svg>

          {/* small mechanical selector — pivots at centre, points at active node */}
          <div className={styles.pointer} data-pulse-pointer aria-hidden="true">
            <span className={styles.pointerStem} />
            <span className={styles.pointerHead} />
          </div>

          {/* centre hub: active icon + name + index (no product image) */}
          <div className={styles.chamber}>
            <div className={styles.chamberGlass} aria-hidden="true" />
            <div className={styles.hub} data-pulse-center>
              <span className={styles.hubIcon} aria-hidden="true">
                <ActiveIcon />
              </span>
              <span className={styles.hubName}>{activeLabel}</span>
              <span className={styles.hubIndex}>
                {pad2(activeIndex + 1)} <i>/</i> {pad2(count)}
              </span>
            </div>
            <span className={styles.hubEnergy} data-pulse-energy aria-hidden="true" />
            <div className={styles.cover} data-pulse-cover aria-hidden="true" />
          </div>

          {/* eight evenly-spaced category nodes (real buttons) */}
          {collections.map((col, i) => {
            const Icon = COLLECTION_ICONS[col.id] ?? FaBolt;
            const isActive = i === activeIndex;
            const label = t(col.labelKey);
            const labelClass = LABEL_ABOVE.has(i)
              ? styles.nodeLabelAbove
              : styles.nodeLabelBelow;
            return (
              <div
                key={col.id}
                className={`${styles.node} ${styles[`pos${i}`]} ${labelClass}`}
                data-pulse-node
                data-active={isActive ? "true" : "false"}
              >
                <button
                  type="button"
                  className={styles.nodeBtn}
                  aria-pressed={isActive}
                  aria-label={label}
                  onClick={() => onSelect(i)}
                >
                  <Icon aria-hidden="true" />
                </button>
                <span className={styles.nodeLabel}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Link href={viewAllHref} className={styles.viewAll}>
        <span>{t("commerce.viewAllCollection", { name: activeLabel })}</span>
        <FaArrowRightLong
          aria-hidden="true"
          className={dir === "rtl" ? styles.arrowFlip : ""}
        />
      </Link>
    </div>
  );
}
