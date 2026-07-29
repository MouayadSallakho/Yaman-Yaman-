"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "@/i18n/LocaleProvider";
import ActiveFilterChips from "./ActiveFilterChips/ActiveFilterChips";
import EmptyResultsState from "./EmptyResultsState/EmptyResultsState";
import MobileFiltersDrawer from "./MobileFiltersDrawer/MobileFiltersDrawer";
import ProductGrid from "./ProductGrid/ProductGrid";
import ShopFilters from "./ShopFilters/ShopFilters";
import ShopToolbar from "./ShopToolbar/ShopToolbar";
import {
  FiltersSkeleton,
  ToolbarSkeleton,
} from "./ShopSkeletons/ShopSkeletons";
import {
  activeFilterCount as countActive,
  hasActiveFilters,
} from "./data/filtering";
import useProgressiveList from "./useProgressiveList";
import useResultsScroll from "./useResultsScroll";
import useShopQuery from "./useShopQuery";
import styles from "./ShopPage.module.css";

const FIRST_LOAD_MS = 520;

export default function ShopPage() {
  const { t } = useTranslation();

  const { resultsRef, scrollToResults } = useResultsScroll();

  const {
    filters,
    sort,
    actions,
    results,
    facets,
    queryKey,
  } = useShopQuery(scrollToResults);

  const {
    visibleItems,
    hasMore,
    isLoadingMore,
    loadMore,
    sentinelRef,
    remaining,
  } = useProgressiveList(results, queryKey);

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [density, setDensity] = useState("comfortable");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, FIRST_LOAD_MS);

    return () => clearTimeout(timer);
  }, []);

  const activeCount = useMemo(
    () => countActive(filters),
    [filters],
  );

  const anyFilters = useMemo(
    () => hasActiveFilters(filters),
    [filters],
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const showEmpty = !isFirstLoad && results.length === 0;

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label={t("shop.breadcrumbLabel")}
        >
          <Link href="/">
            {t("common.nav.home")}
          </Link>

          <span aria-hidden="true">/</span>

          <span aria-current="page">
            {t("common.nav.products")}
          </span>
        </nav>

        <div className={styles.layout}>
          <aside
            className={styles.sidebar}
            aria-label={t("shop.filters.title")}
          >
            <div className={styles.sidebarInner}>
              <div className={styles.sidebarHeader}>
                <h2 className={styles.sidebarTitle}>
                  {t("shop.filters.title")}
                </h2>

                {anyFilters ? (
                  <button
                    type="button"
                    className={styles.sidebarClear}
                    onClick={actions.clearAll}
                  >
                    {t("shop.filters.clearAll")}
                  </button>
                ) : null}
              </div>

              {isFirstLoad ? (
                <FiltersSkeleton />
              ) : (
                <ShopFilters
                  filters={filters}
                  facets={facets}
                  actions={actions}
                  idPrefix="sidebar"
                />
              )}
            </div>
          </aside>

          <section
            className={styles.results}
            ref={resultsRef}
            aria-labelledby="shop-results-title"
          >
            <h2
              id="shop-results-title"
              className="visually-hidden"
            >
              {t("shop.resultsTitle")}
            </h2>

            {isFirstLoad ? (
              <ToolbarSkeleton />
            ) : (
              <ShopToolbar
                shown={visibleItems.length}
                total={results.length}
                sort={sort}
                onSortChange={actions.setSort}
                onOpenFilters={() => setDrawerOpen(true)}
                activeFilterCount={activeCount}
                density={density}
                onDensityChange={setDensity}
              />
            )}

            {!isFirstLoad ? (
              <ActiveFilterChips
                filters={filters}
                actions={actions}
              />
            ) : null}

            {showEmpty ? (
              <EmptyResultsState
                onClearAll={actions.clearAll}
              />
            ) : (
              <ProductGrid
                products={visibleItems}
                density={density}
                isInitialLoading={isFirstLoad}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                remaining={remaining}
                onLoadMore={loadMore}
                sentinelRef={sentinelRef}
              />
            )}
          </section>
        </div>
      </div>

      <MobileFiltersDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        filters={filters}
        facets={facets}
        actions={actions}
        resultCount={results.length}
      />
    </main>
  );
}