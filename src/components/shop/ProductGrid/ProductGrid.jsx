"use client";

import { useTranslation } from "@/i18n/LocaleProvider";
import ShopProductCard from "../ShopProductCard/ShopProductCard";
import { BATCH_SIZE, INITIAL_COUNT } from "../useProgressiveList";
import styles from "./ProductGrid.module.css";

/**
 * The results list plus its progressive-loading tail.
 *
 * Appending never moves the viewport: new cards render below the current ones and
 * the sentinel sits above the end of the list, so the next batch is normally
 * painted before the user arrives. Because the catalogue is in memory a batch is
 * committed synchronously — there is no request in flight, so there is
 * deliberately no spinner.
 *
 * The manual control next to the sentinel is the fail-open path, not a competing
 * call to action: while the observer is doing the work it stays out of the visual
 * flow but inside the tab order, and it only becomes visible to everyone when
 * there is no IntersectionObserver to append for us.
 */
export default function ProductGrid({
  products,
  view = "grid",
  visibleCount = 0,
  total = 0,
  lastAdded = 0,
  hasMore = false,
  remaining = 0,
  observerSupported = true,
  onLoadMore,
  sentinelRef,
}) {
  const { t } = useTranslation();
  const isList = view === "list";

  return (
    <div className={styles.wrap}>
      <div className={`${styles.grid} ${isList ? styles.list : ""}`.trim()}>
        {products.map((product, index) => (
          <ShopProductCard
            key={product.id}
            product={product}
            view={view}
            /* Only the first row is eager; the rest stay lazy. */
            priority={index < 4}
          />
        ))}
      </div>

      {/* Announced only once a batch has actually been committed, so scrolling
          never narrates itself and focus is never moved. */}
      <span role="status" aria-live="polite" className="visually-hidden">
        {lastAdded > 0
          ? t("shop.grid.batchAnnouncement", {
              added: lastAdded,
              shown: visibleCount,
              total,
            })
          : ""}
      </span>

      {hasMore ? (
        <>
          {/* Zero-height probe. Once everything matching is rendered it stops
              being rendered at all, so the observer has nothing left to watch. */}
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

          <button
            type="button"
            className={`${styles.loadMore} ${observerSupported ? styles.loadMoreAuto : ""}`.trim()}
            onClick={onLoadMore}
          >
            {t("shop.filters.showResults", {
              count: Math.min(BATCH_SIZE, remaining),
            })}
          </button>
        </>
      ) : null}

      {/* Only meaningful where progressive loading actually happened — telling
          someone they reached the end of a five-item result set is noise. A plain
          paragraph, so an unrelated re-render cannot re-announce it. */}
      {!hasMore && total > INITIAL_COUNT ? (
        <p className={styles.end}>{t("shop.grid.end")}</p>
      ) : null}
    </div>
  );
}
