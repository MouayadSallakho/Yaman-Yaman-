"use client";

import { useTranslation } from "@/i18n/LocaleProvider";
import ShopProductCard from "../ShopProductCard/ShopProductCard";
import { ProductGridSkeleton } from "../ShopSkeletons/ShopSkeletons";
import styles from "./ProductGrid.module.css";

/** How many inline skeletons to show while the next batch resolves. */
const APPEND_PLACEHOLDERS = 4;

/**
 * The results grid plus its progressive-loading tail.
 *
 * Appending never moves the viewport: new cards render below the current ones
 * and the inline skeletons occupy the space the incoming batch will fill, so
 * reading position is preserved and nothing jumps.
 */
export default function ProductGrid({
  products,
  density = "comfortable",
  isInitialLoading = false,
  isLoadingMore = false,
  hasMore = false,
  remaining = 0,
  onLoadMore,
  sentinelRef,
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.grid} ${density === "compact" ? styles.gridCompact : ""}`.trim()}
        aria-busy={isInitialLoading || isLoadingMore}
      >
        {isInitialLoading ? (
          <ProductGridSkeleton count={12} />
        ) : (
          <>
            {products.map((product, index) => (
              <ShopProductCard
                key={product.id}
                product={product}
                /* Only the first row is eager; the rest stay lazy. */
                priority={index < 4}
              />
            ))}
            {isLoadingMore ? <ProductGridSkeleton count={APPEND_PLACEHOLDERS} /> : null}
          </>
        )}
      </div>

      {/* Announce growth without stealing focus or moving the page. */}
      <span role="status" aria-live="polite" className="visually-hidden">
        {isLoadingMore ? t("shop.grid.loadingMore") : ""}
      </span>

      {!isInitialLoading && hasMore ? (
        <div className={styles.tail}>
          {/* Auto-load trigger. The button below is the accessible equivalent. */}
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
          <button
            type="button"
            className={styles.loadMore}
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? t("shop.grid.loading") : t("shop.grid.loadMore", { count: remaining })}
          </button>
        </div>
      ) : null}

      {!isInitialLoading && !hasMore && products.length > 0 ? (
        <p className={styles.end}>{t("shop.grid.end")}</p>
      ) : null}
    </div>
  );
}
