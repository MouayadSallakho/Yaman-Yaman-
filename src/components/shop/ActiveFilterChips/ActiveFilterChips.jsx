"use client";

import { FiX } from "react-icons/fi";

import { useTranslation } from "@/i18n/LocaleProvider";
import { CATEGORIES, PRICE_BANDS, matchPriceBand } from "../data/catalog";
import styles from "./ActiveFilterChips.module.css";

/**
 * Removable summary of everything currently narrowing the results.
 *
 * Each chip is a button that removes exactly one filter, which is the fastest
 * way back out of a dead end — far quicker than hunting the facet that caused
 * it. Renders nothing when no filters are active.
 */
export default function ActiveFilterChips({ filters, actions }) {
  const { t } = useTranslation();

  const chips = [];

  if (filters.search) {
    chips.push({
      key: "search",
      label: t("shop.chips.search", { term: filters.search }),
      remove: () => actions.removeFilter("search"),
    });
  }

  if (filters.category) {
    const category = CATEGORIES.find((c) => c.id === filters.category);
    chips.push({
      key: "category",
      label: category ? t(category.labelKey) : filters.category,
      remove: () => actions.removeFilter("category"),
    });
  }

  filters.brands.forEach((brand) => {
    chips.push({
      key: `brand-${brand}`,
      label: brand,
      remove: () => actions.removeFilter("brand", brand),
    });
  });

  if (filters.min != null || filters.max != null) {
    const bandId = matchPriceBand(filters.min, filters.max);
    const band = PRICE_BANDS.find((b) => b.id === bandId);
    let label;
    if (band && band.min == null) label = t("shop.price.under", { max: band.max + 1 });
    else if (band && band.max == null) label = t("shop.price.over", { min: band.min });
    else if (band) label = `$${band.min} – $${band.max}`;
    else label = `$${filters.min ?? 0} – $${filters.max ?? "∞"}`;

    chips.push({ key: "price", label, remove: () => actions.removeFilter("price") });
  }

  if (filters.rating != null) {
    chips.push({
      key: "rating",
      label: t("shop.filters.ratingAndUp", { rating: filters.rating }),
      remove: () => actions.removeFilter("rating"),
    });
  }

  if (filters.inStockOnly) {
    chips.push({
      key: "stock",
      label: t("shop.filters.inStockOnly"),
      remove: () => actions.removeFilter("stock"),
    });
  }

  if (filters.dealsOnly) {
    chips.push({
      key: "deals",
      label: t("shop.filters.dealsOnly"),
      remove: () => actions.removeFilter("deals"),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{t("shop.chips.label")}</span>

      <ul className={styles.list}>
        {chips.map((chip) => (
          <li key={chip.key}>
            <button type="button" className={styles.chip} onClick={chip.remove}>
              <span className={styles.chipText}>{chip.label}</span>
              <FiX aria-hidden="true" className={styles.chipIcon} />
              <span className="visually-hidden">{t("shop.chips.remove", { filter: chip.label })}</span>
            </button>
          </li>
        ))}
      </ul>

      {chips.length > 1 ? (
        <button type="button" className={styles.clearAll} onClick={actions.clearAll}>
          {t("shop.filters.clearAll")}
        </button>
      ) : null}
    </div>
  );
}
