import { DEFAULT_SORT, discountPercent } from "./catalog";

/**
 * Pure filtering + sorting for the shop. Kept free of React so the behaviour is
 * trivially testable and so facet counts can be recomputed cheaply.
 *
 * @typedef {Object} ShopFilters
 * @property {string} search
 * @property {string} category    "" means all categories.
 * @property {string[]} brands
 * @property {number|null} min
 * @property {number|null} max
 * @property {number|null} rating Minimum rating.
 * @property {boolean} inStockOnly
 * @property {boolean} dealsOnly
 */

/** @type {ShopFilters} */
export const EMPTY_FILTERS = {
  search: "",
  category: "",
  brands: [],
  min: null,
  max: null,
  rating: null,
  inStockOnly: false,
  dealsOnly: false,
};

const BADGE_RANK = { bestseller: 0, trending: 1, new: 2, sale: 3 };

const matchers = {
  search: (p, f) => {
    if (!f.search) return true;
    const q = f.search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.meta.toLowerCase().includes(q)
    );
  },
  category: (p, f) => !f.category || p.category === f.category,
  brands: (p, f) => !f.brands.length || f.brands.includes(p.brand),
  price: (p, f) =>
    (f.min == null || p.price >= f.min) && (f.max == null || p.price <= f.max),
  rating: (p, f) => f.rating == null || p.rating >= f.rating,
  inStockOnly: (p, f) => !f.inStockOnly || p.stock !== "out",
  dealsOnly: (p, f) => !f.dealsOnly || discountPercent(p) > 0,
};

/**
 * Filter the catalogue.
 *
 * @param {import("./catalog").ShopProduct[]} products
 * @param {ShopFilters} filters
 * @param {string[]} [ignore] Matcher keys to skip — used so a facet's own
 *   selection does not shrink its own counts.
 */
export function filterProducts(products, filters, ignore = []) {
  const active = Object.entries(matchers).filter(([key]) => !ignore.includes(key));
  return products.filter((product) => active.every(([, test]) => test(product, filters)));
}

/**
 * @param {import("./catalog").ShopProduct[]} products
 * @param {string} sort
 */
export function sortProducts(products, sort) {
  const list = [...products];

  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.added - a.added);
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "discount":
      return list.sort((a, b) => discountPercent(b) - discountPercent(a));
    case DEFAULT_SORT:
    default:
      // Featured: promoted items first (in badge priority), then best rated.
      return list.sort((a, b) => {
        const rank = (p) => (p.badge ? BADGE_RANK[p.badge] ?? 9 : 9);
        return rank(a) - rank(b) || b.rating - a.rating || b.reviews - a.reviews;
      });
  }
}

/** Count how many products each category would yield under the other filters. */
export function countByCategory(products, filters) {
  const pool = filterProducts(products, filters, ["category"]);
  return pool.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
}

/** Count how many products each brand would yield under the other filters. */
export function countByBrand(products, filters) {
  const pool = filterProducts(products, filters, ["brands"]);
  return pool.reduce((acc, p) => {
    acc[p.brand] = (acc[p.brand] || 0) + 1;
    return acc;
  }, {});
}

/** Total items available when only the category facet is ignored. */
export const countAllCategories = (products, filters) =>
  filterProducts(products, filters, ["category"]).length;

/** True when any filter deviates from the default state. */
export function hasActiveFilters(filters) {
  return (
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    filters.brands.length > 0 ||
    filters.min != null ||
    filters.max != null ||
    filters.rating != null ||
    filters.inStockOnly ||
    filters.dealsOnly
  );
}

/** Number of distinct active filters — drives the mobile trigger badge. */
export function activeFilterCount(filters) {
  return (
    (filters.search ? 1 : 0) +
    (filters.category ? 1 : 0) +
    filters.brands.length +
    (filters.min != null || filters.max != null ? 1 : 0) +
    (filters.rating != null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.dealsOnly ? 1 : 0)
  );
}
