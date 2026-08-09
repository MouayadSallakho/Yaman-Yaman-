"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DEFAULT_SORT, SHOP_PRODUCTS, SORT_OPTIONS } from "./data/catalog";
import {
  EMPTY_FILTERS,
  countAllCategories,
  countByBrand,
  countByCategory,
  filterProducts,
  sortProducts,
} from "./data/filtering";

const SORT_IDS = SORT_OPTIONS.map((option) => option.id);

const toNumber = (value) => {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/**
 * Single source of truth for what the shop is showing.
 *
 * Filters and sort live in the URL, which buys two things for free: the view is
 * shareable, and no state is duplicated between the sidebar and the mobile
 * drawer.
 *
 * Every mutation *replaces* the current history entry rather than pushing a new
 * one, so a session of narrowing filters does not have to be unwound one click
 * at a time before Back can leave the page. The trade is deliberate and worth
 * naming: Back does not step through previous filter states. Arriving at any
 * such URL — a shared link, Forward, a reload — still restores it exactly.
 *
 * @param {() => void} [onChange] Invoked after any filter/sort mutation so the
 *   caller can run its own side effect (this page scrolls to the results).
 */
export default function useShopQuery(onChange) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const brands = searchParams.get("brand");
    return {
      search: searchParams.get("search") ?? "",
      category: searchParams.get("category") ?? "",
      brands: brands ? brands.split(",").filter(Boolean) : [],
      min: toNumber(searchParams.get("min")),
      max: toNumber(searchParams.get("max")),
      rating: toNumber(searchParams.get("rating")),
      inStockOnly: searchParams.get("stock") === "1",
      dealsOnly: searchParams.get("deals") === "1",
    };
  }, [searchParams]);

  const sort = useMemo(() => {
    const value = searchParams.get("sort");
    return value && SORT_IDS.includes(value) ? value : DEFAULT_SORT;
  }, [searchParams]);

  /** Write the given state to the URL. Never scrolls — the page owns that. */
  const commit = useCallback(
    (nextFilters, nextSort, { notify = true } = {}) => {
      // Seeded from the current query, not from empty. The shop owns the keys
      // below and nothing else: a campaign tag, a referrer, anything a marketing
      // link or another feature put on the URL survives a filter or sort change
      // instead of being silently dropped by the first click on the page.
      const params = new URLSearchParams(searchParams);
      const set = (key, value) => {
        if (value == null || value === "") params.delete(key);
        else params.set(key, String(value));
      };

      set("search", nextFilters.search);
      set("category", nextFilters.category);
      set("brand", nextFilters.brands.join(","));
      set("min", nextFilters.min);
      set("max", nextFilters.max);
      set("rating", nextFilters.rating);
      set("stock", nextFilters.inStockOnly ? "1" : "");
      set("deals", nextFilters.dealsOnly ? "1" : "");
      // The default order is the absence of the parameter, so the shared URL of
      // an unsorted view stays clean.
      set("sort", nextSort && nextSort !== DEFAULT_SORT ? nextSort : "");

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      if (notify) onChange?.();
    },
    [onChange, pathname, router, searchParams]
  );

  const patchFilters = useCallback(
    (patch) => commit({ ...filters, ...patch }, sort),
    [commit, filters, sort]
  );

  const actions = useMemo(
    () => ({
      setSearch: (search) => patchFilters({ search }),
      // Radio-style facets set directly; each group ships an explicit "any"
      // option, which is clearer than toggling the selected row off.
      setCategory: (category) => patchFilters({ category }),
      toggleBrand: (brand) =>
        patchFilters({
          brands: filters.brands.includes(brand)
            ? filters.brands.filter((b) => b !== brand)
            : [...filters.brands, brand],
        }),
      setPriceRange: (min, max) => patchFilters({ min, max }),
      setRating: (rating) => patchFilters({ rating }),
      toggleInStock: () => patchFilters({ inStockOnly: !filters.inStockOnly }),
      toggleDeals: () => patchFilters({ dealsOnly: !filters.dealsOnly }),
      setDeals: (dealsOnly) => patchFilters({ dealsOnly }),
      setSort: (nextSort) => commit(filters, nextSort),
      clearAll: () => commit(EMPTY_FILTERS, sort),
      /** Remove exactly one active filter (used by the chips). */
      removeFilter: (kind, value) => {
        switch (kind) {
          case "search":
            return patchFilters({ search: "" });
          case "category":
            return patchFilters({ category: "" });
          case "brand":
            return patchFilters({ brands: filters.brands.filter((b) => b !== value) });
          case "price":
            return patchFilters({ min: null, max: null });
          case "rating":
            return patchFilters({ rating: null });
          case "stock":
            return patchFilters({ inStockOnly: false });
          case "deals":
            return patchFilters({ dealsOnly: false });
          default:
            return undefined;
        }
      },
    }),
    [commit, filters, patchFilters, sort]
  );

  const results = useMemo(
    () => sortProducts(filterProducts(SHOP_PRODUCTS, filters), sort),
    [filters, sort]
  );

  const facets = useMemo(
    () => ({
      categories: countByCategory(SHOP_PRODUCTS, filters),
      brands: countByBrand(SHOP_PRODUCTS, filters),
      allCategories: countAllCategories(SHOP_PRODUCTS, filters),
    }),
    [filters]
  );

  /** Stable key for the current query — used to reset progressive loading. */
  const queryKey = useMemo(() => `${searchParams.toString()}`, [searchParams]);

  return { filters, sort, actions, results, facets, queryKey };
}
