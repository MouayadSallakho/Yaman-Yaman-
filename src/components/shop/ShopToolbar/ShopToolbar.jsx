"use client";

import { useId } from "react";
import { FiGrid, FiList, FiSliders } from "react-icons/fi";

import { useTranslation } from "@/i18n/LocaleProvider";
import { SORT_OPTIONS } from "../data/catalog";
import styles from "./ShopToolbar.module.css";

/**
 * Results bar: how many products are showing, how they are ordered, and — below
 * the sidebar breakpoint — the entry point to the filter sheet.
 *
 * Sorting uses a native <select>: it is keyboard accessible for free and gives
 * mobile users their platform picker instead of a bespoke dropdown.
 */
export default function ShopToolbar({
  shown,
  total,
  sort,
  onSortChange,
  onOpenFilters,
  activeFilterCount,
  view,
  onViewChange,
}) {
  const { t } = useTranslation();
  const sortId = useId();

  return (
    <div className={styles.toolbar}>
      <p className={styles.count}>
        {total > 0
          ? t("shop.toolbar.showing", { shown, total })
          : t("shop.toolbar.noResults")}
      </p>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.filterTrigger}
          onClick={onOpenFilters}
          aria-label={t("shop.toolbar.openFilters")}
        >
          <FiSliders aria-hidden="true" />
          <span>{t("shop.filters.title")}</span>
          {activeFilterCount > 0 ? (
            <span className={styles.filterCount}>{activeFilterCount}</span>
          ) : null}
        </button>

        <div className={styles.sortWrap}>
          <label className={styles.sortLabel} htmlFor={sortId}>
            {t("shop.toolbar.sortBy")}
          </label>
          <select
            id={sortId}
            className={styles.sortSelect}
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>

        <div
          className={styles.density}
          role="group"
          aria-label={t("shop.toolbar.viewLabel")}
        >
          <button
            type="button"
            className={`${styles.densityButton} ${view === "grid" ? styles.densityOn : ""}`.trim()}
            onClick={() => onViewChange("grid")}
            aria-pressed={view === "grid"}
            aria-label={t("shop.toolbar.viewGrid")}
            title={t("shop.toolbar.viewGrid")}
          >
            <FiGrid aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.densityButton} ${view === "list" ? styles.densityOn : ""}`.trim()}
            onClick={() => onViewChange("list")}
            aria-pressed={view === "list"}
            aria-label={t("shop.toolbar.viewList")}
            title={t("shop.toolbar.viewList")}
          >
            <FiList aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
