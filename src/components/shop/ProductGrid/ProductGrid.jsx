"use client";

import { useTranslation } from "@/i18n/LocaleProvider";
import ShopProductCard from "../ShopProductCard/ShopProductCard";
import { ProductGridSkeleton } from "../ShopSkeletons/ShopSkeletons";
import styles from "./ProductGrid.module.css";

/**
 * The results list plus its progressive-loading tail.
 *
 * Appending never moves the viewport: new cards render below the current ones and
 * the sentinel sits above the end of the list, so the next batch is normally
 * painted before the user arrives. Because the catalogue is in memory a batch is
 * committed synchronously — there is no request in flight, so there is
 * deliberately no spinner and no "load more" button to press.
 */
export default function ProductGrid({
  products,
  view = "grid",
  isInitialLoading = false,
  visibleCount = 0,
  total = 0,
  lastAdded = 0,
  sentinelRef,
}) {
  const { t } = useTranslation();
  const isList = view === "list";

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.grid} ${isList ? styles.list : ""}`.trim()}
        aria-busy={isInitialLoading}
      >
        {isInitialLoading ? (
          <ProductGridSkeleton count={12} />
        ) : (
          products.map((product, index) => (
            <ShopProductCard
              key={product.id}
              product={product}
              view={view}
              /* Only the first row is eager; the rest stay lazy. */
              priority={index < 4}
            />
          ))
        )}
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

      {/* Zero-height probe. Once everything matching is rendered it stops being
          rendered at all, so the observer has nothing left to watch. */}
      {!isInitialLoading && visibleCount < total ? (
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      ) : null}
    </div>
  );
}
