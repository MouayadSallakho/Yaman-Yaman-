"use client";

import { useEffect, useId, useRef } from "react";
import { FiX } from "react-icons/fi";

import { useTranslation } from "@/i18n/LocaleProvider";
import ShopFilters from "../ShopFilters/ShopFilters";
import styles from "./MobileFiltersDrawer.module.css";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Mobile filter sheet.
 *
 * Filters apply immediately (the result count in the footer updates live), so
 * there is no "Apply" step to forget — the footer button just closes the sheet.
 * Implements the modal contract by hand: focus moves in on open, Tab is trapped,
 * Escape and the backdrop close it, background scrolling is locked, and focus
 * returns to whatever opened it.
 */
export default function MobileFiltersDrawer({ open, onClose, filters, facets, actions, resultCount }) {
  const { t } = useTranslation();
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const restoreRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    restoreRef.current = document.activeElement;
    closeRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      restoreRef.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.root}>
      {/* Decorative: Escape and the footer button are the accessible paths out. */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
      >
        <div className={styles.header}>
          <span className={styles.grabber} aria-hidden="true" />
          <h2 id={titleId} className={styles.title}>
            {t("shop.filters.title")}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            ref={closeRef}
            aria-label={t("common.close")}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className={styles.body}>
          <ShopFilters filters={filters} facets={facets} actions={actions} idPrefix="drawer" />
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.clear} onClick={actions.clearAll}>
            {t("shop.filters.clearAll")}
          </button>
          <button type="button" className={styles.apply} onClick={onClose}>
            {t("shop.filters.showResults", { count: resultCount })}
          </button>
        </div>
      </div>
    </div>
  );
}
