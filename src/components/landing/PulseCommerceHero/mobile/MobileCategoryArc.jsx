"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import {
  FaStar,
  FaTags,
  FaGem,
  FaBolt,
  FaWallet,
  FaMobileScreenButton,
  FaThumbsUp,
  FaFire,
  FaChevronRight,
} from "react-icons/fa6";

import { buildArcWindow, slotForPosition, stepIndex } from "./arcWindow";
import styles from "./MobileCategoryArc.module.css";

/** Icon per real collection id (mirrors the desktop reactor's mapping). */
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

/**
 * The arc the five visible nodes sit on.
 *
 * Drawn in a normalised 0–100 box with `preserveAspectRatio="none"`, exactly
 * like the percentage slot coordinates in the stylesheet — so the same
 * non-uniform scale applies to both and the curve keeps passing through every
 * node centre at any stage size. An elliptical arc stays an arc under that
 * scale, so there is no per-breakpoint path to maintain.
 *
 * Derived from one ellipse (rx 48.94, ry 58) sampled at ±58°, ±30° and 0°,
 * which is where `.slot0`…`.slot4` place the nodes.
 */
const ARC_PATH = "M 8.5 51.27 A 48.94 58 0 0 1 91.5 51.27";

/**
 * Mobile Category Reactor — a top arc of real buttons with the active
 * collection centred and dominant.
 *
 * Only five of the eight real collections are on the arc at once (labels would
 * collide at 320px otherwise). The window wraps as the selection moves, and
 * arrow keys step one collection at a time, so every collection stays
 * reachable. Selection is delegated upward; all motion is owned by the mobile
 * sequence hook through the `data-m-*` hooks.
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
export default function MobileCategoryArc({
  collections,
  activeIndex,
  count,
  viewAllHref,
  activeLabel,
  dir,
  t,
  onSelect,
}) {
  const listRef = useRef(null);
  const window = buildArcWindow(activeIndex, count);

  // The arc is geometrically symmetric, so RTL needs no new coordinates — only
  // the reading order reverses, putting the first collection on the right.
  const ordered = dir === "rtl" ? [...window].reverse() : window;

  // Roving arrow-key navigation walks the full catalogue, not just the window,
  // so keyboard users are never gated behind repeated tabbing.
  const handleKeyDown = useCallback(
    (event) => {
      const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
      const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      let next = null;

      if (event.key === back) next = stepIndex(activeIndex, -1, count);
      else if (event.key === forward) next = stepIndex(activeIndex, 1, count);
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = count - 1;
      if (next === null) return;

      event.preventDefault();
      onSelect(next);
    },
    [activeIndex, count, dir, onSelect]
  );

  /*
    Keep the roving tabindex and the focus ring on the same node.

    Nodes are keyed by collection, so React moves a node's DOM element as the
    window shifts. After an arrow key the element that had focus is still the
    previously selected collection — now an inactive, `tabindex="-1"` node. This
    hands focus to whichever node is active once React has committed.

    It only ever fires while the arc already owns focus, so a pointer tap never
    pulls focus (or the viewport) anywhere.
  */
  const previousActiveRef = useRef(activeIndex);
  useEffect(() => {
    if (previousActiveRef.current === activeIndex) return;
    previousActiveRef.current = activeIndex;

    const list = listRef.current;
    if (!list || !list.contains(document.activeElement)) return;
    list.querySelector('[data-m-node][data-active="true"] button')?.focus();
  }, [activeIndex]);

  return (
    <div className={styles.arc} data-m-arc>
      <Link href={viewAllHref} className={styles.viewAll} data-m-arc-viewall>
        <span>{t("common.actions.viewAll")}</span>
        <FaChevronRight
          aria-hidden="true"
          className={dir === "rtl" ? styles.flip : undefined}
        />
      </Link>

      <div className={styles.stage}>
        {/* Decorative energy rail the nodes sit on. */}
        <svg
          className={styles.rail}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d={ARC_PATH} className={styles.railBase} />
          <path
            d={ARC_PATH}
            className={styles.railCharge}
            data-m-arc-charge
            pathLength="100"
          />
        </svg>

        <div
          className={styles.nodes}
          ref={listRef}
          role="group"
          aria-label={t("commerce.categoryLabel")}
          onKeyDown={handleKeyDown}
        >
          {ordered.map((index, position) => {
            const collection = collections[index];
            const Icon = COLLECTION_ICONS[collection.id] ?? FaBolt;
            const isActive = index === activeIndex;
            const label = t(collection.labelKey);
            const slot = slotForPosition(position, count);
            return (
              <div
                key={collection.id}
                className={`${styles.node} ${styles[`slot${slot}`]}`}
                data-m-node
                data-active={isActive ? "true" : "false"}
              >
                <button
                  type="button"
                  className={styles.nodeBtn}
                  aria-pressed={isActive}
                  aria-label={label}
                  // Roving tabindex: one arc stop, arrows move within it.
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onSelect(index)}
                >
                  <span className={styles.nodeGlow} aria-hidden="true" />
                  <Icon aria-hidden="true" />
                </button>
                <span className={styles.nodeLabel} aria-hidden="true">
                  {isActive ? activeLabel : label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Where the spine leaves the arc — purely decorative. */}
        <span className={styles.tap} data-m-arc-tap aria-hidden="true" />
      </div>
    </div>
  );
}
