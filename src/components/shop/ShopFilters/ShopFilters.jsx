"use client";

import { useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import { useTranslation } from "@/i18n/LocaleProvider";
import {
  BRANDS,
  CATEGORIES,
  PRICE_BANDS,
  RATING_STEPS,
  matchPriceBand,
} from "../data/catalog";
import styles from "./ShopFilters.module.css";

/**
 * Collapsible facet group. A real <button> owns the disclosure so it is
 * keyboard operable, and the panel keeps its own id for aria-controls.
 */
function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.groupHeader}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>{title}</span>
        <FiChevronDown
          aria-hidden="true"
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`.trim()}
        />
      </button>

      <div id={panelId} className={styles.groupPanel} hidden={!open}>
        {children}
      </div>
    </div>
  );
}

const priceBandLabel = (band, t) => {
  if (band.min == null) return t("shop.price.under", { max: band.max + 1 });
  if (band.max == null) return t("shop.price.over", { min: band.min });
  return `$${band.min} – $${band.max}`;
};

/**
 * The full facet set. Rendered once in the desktop sidebar and once inside the
 * mobile drawer — both read from the same URL-backed state, so the two can never
 * disagree. `idPrefix` keeps input names unique when both exist in the DOM.
 */
export default function ShopFilters({ filters, facets, actions, idPrefix = "shop" }) {
  const { t } = useTranslation();
  const activeBand = matchPriceBand(filters.min, filters.max);

  return (
    <div className={styles.filters}>
      <FilterGroup title={t("shop.filters.category")}>
        <ul className={styles.optionList}>
          <li>
            <label className={styles.option}>
              <input
                type="radio"
                name={`${idPrefix}-category`}
                className={styles.radio}
                checked={filters.category === ""}
                onChange={() => actions.setCategory("")}
              />
              <span className={styles.optionLabel}>{t("shop.filters.allProducts")}</span>
              <span className={styles.count}>{facets.allCategories}</span>
            </label>
          </li>

          {CATEGORIES.map((category) => {
            const count = facets.categories[category.id] ?? 0;
            return (
              <li key={category.id}>
                <label className={`${styles.option} ${count === 0 ? styles.optionEmpty : ""}`.trim()}>
                  <input
                    type="radio"
                    name={`${idPrefix}-category`}
                    className={styles.radio}
                    checked={filters.category === category.id}
                    onChange={() => actions.setCategory(category.id)}
                  />
                  <span className={styles.optionLabel}>{t(category.labelKey)}</span>
                  <span className={styles.count}>{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title={t("shop.filters.price")}>
        <ul className={styles.optionList}>
          <li>
            <label className={styles.option}>
              <input
                type="radio"
                name={`${idPrefix}-price`}
                className={styles.radio}
                checked={activeBand === "" && filters.min == null && filters.max == null}
                onChange={() => actions.setPriceRange(null, null)}
              />
              <span className={styles.optionLabel}>{t("shop.filters.anyPrice")}</span>
            </label>
          </li>

          {PRICE_BANDS.map((band) => (
            <li key={band.id}>
              <label className={styles.option}>
                <input
                  type="radio"
                  name={`${idPrefix}-price`}
                  className={styles.radio}
                  checked={activeBand === band.id}
                  onChange={() => actions.setPriceRange(band.min, band.max)}
                />
                <span className={styles.optionLabel}>{priceBandLabel(band, t)}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title={t("shop.filters.brand")}>
        <ul className={styles.optionList}>
          {BRANDS.map((brand) => {
            const count = facets.brands[brand] ?? 0;
            return (
              <li key={brand}>
                <label className={`${styles.option} ${count === 0 ? styles.optionEmpty : ""}`.trim()}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={filters.brands.includes(brand)}
                    onChange={() => actions.toggleBrand(brand)}
                  />
                  <span className={styles.optionLabel}>{brand}</span>
                  <span className={styles.count}>{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title={t("shop.filters.rating")}>
        <ul className={styles.optionList}>
          <li>
            <label className={styles.option}>
              <input
                type="radio"
                name={`${idPrefix}-rating`}
                className={styles.radio}
                checked={filters.rating == null}
                onChange={() => actions.setRating(null)}
              />
              <span className={styles.optionLabel}>{t("shop.filters.anyRating")}</span>
            </label>
          </li>

          {RATING_STEPS.map((step) => (
            <li key={step}>
              <label className={styles.option}>
                <input
                  type="radio"
                  name={`${idPrefix}-rating`}
                  className={styles.radio}
                  checked={filters.rating === step}
                  onChange={() => actions.setRating(step)}
                />
                <span className={styles.optionLabel}>{t("shop.filters.ratingAndUp", { rating: step })}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title={t("shop.filters.availability")}>
        <ul className={styles.optionList}>
          <li>
            <label className={styles.option}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={filters.inStockOnly}
                onChange={actions.toggleInStock}
              />
              <span className={styles.optionLabel}>{t("shop.filters.inStockOnly")}</span>
            </label>
          </li>
          <li>
            <label className={styles.option}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={filters.dealsOnly}
                onChange={actions.toggleDeals}
              />
              <span className={styles.optionLabel}>{t("shop.filters.dealsOnly")}</span>
            </label>
          </li>
        </ul>
      </FilterGroup>
    </div>
  );
}
