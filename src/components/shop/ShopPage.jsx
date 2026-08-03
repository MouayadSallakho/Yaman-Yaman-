"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { useTranslation } from "@/i18n/LocaleProvider";
import ActiveFilterChips from "./ActiveFilterChips/ActiveFilterChips";
import EmptyResultsState from "./EmptyResultsState/EmptyResultsState";
import MobileFiltersDrawer from "./MobileFiltersDrawer/MobileFiltersDrawer";
import ProductGrid from "./ProductGrid/ProductGrid";
import ShopFilters from "./ShopFilters/ShopFilters";
import ShopToolbar from "./ShopToolbar/ShopToolbar";
import {
  activeFilterCount as countActive,
  hasActiveFilters,
} from "./data/filtering";
import useProgressiveList from "./useProgressiveList";
import useResultsScroll from "./useResultsScroll";
import useShopQuery from "./useShopQuery";
import styles from "./ShopPage.module.css";

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
    visibleCount,
    lastAdded,
    hasMore,
    remaining,
    observerSupported,
    loadMore,
    sentinelRef,
  } = useProgressiveList(results, queryKey);

  const [drawerOpen, setDrawerOpen] = useState(false);
  // Grid is the stable default; view mode is page-local so it never has to be
  // hydrated from storage or a URL param.
  const [view, setView] = useState("grid");

  // The catalogue is a synchronous in-memory constant, so the real products are
  // available on the very first render. There is deliberately no loading state:
  // anything shown before them would be invented latency.

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

  /**
   * Filtering can replace 49 results with 3 without anything visible moving into
   * the viewport, so the new total is announced politely.
   *
   * Derived, never stored: a live region is not announced for the content it
   * already had when it entered the accessibility tree, only for later changes,
   * so no "skip the first render" state is needed. It deliberately reports the
   * matched total and not how many are revealed — revealing a batch must stay the
   * grid's own announcement, and keying off the total is what keeps the two from
   * firing for the same update.
   */
  const resultsMessage = results.length === 0
    ? t("shop.toolbar.noResults")
    : t("shop.hero.count", { count: results.length });

  const showEmpty = results.length === 0;

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

        {/* The page's only h1. Deliberately a compact catalogue heading rather
            than a marketing hero: it names the route for assistive technology
            and search engines while costing almost nothing above the fold. */}
        <header className={styles.intro}>
          <h1 className={styles.introTitle}>{t("shop.pageTitle")}</h1>
          <p className={styles.introText}>{t("shop.pageIntro")}</p>
        </header>

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

              <ShopFilters
                filters={filters}
                facets={facets}
                actions={actions}
                idPrefix="sidebar"
              />
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

            {/* Narrow live region: only the committed result count, never the
                grid itself. */}
            <span role="status" aria-live="polite" className="visually-hidden">
              {resultsMessage}
            </span>

            <ShopToolbar
              shown={visibleItems.length}
              total={results.length}
              sort={sort}
              onSortChange={actions.setSort}
              onOpenFilters={() => setDrawerOpen(true)}
              activeFilterCount={activeCount}
              view={view}
              onViewChange={setView}
            />

            <ActiveFilterChips
              filters={filters}
              actions={actions}
            />

            {showEmpty ? (
              <EmptyResultsState
                onClearAll={actions.clearAll}
              />
            ) : (
              <ProductGrid
                products={visibleItems}
                view={view}
                visibleCount={visibleCount}
                total={results.length}
                lastAdded={lastAdded}
                hasMore={hasMore}
                remaining={remaining}
                observerSupported={observerSupported}
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
