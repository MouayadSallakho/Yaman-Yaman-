import styles from "./ShopSkeletons.module.css";

/**
 * Loading placeholders for the shop.
 *
 * Each skeleton mirrors the box model of the component it stands in for — same
 * aspect ratio, same line count, same paddings — so the swap to real content
 * does not reflow the page. They are decorative: the surrounding regions own
 * the aria-busy/live messaging, and these are hidden from assistive tech.
 */

export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.media} />
      <div className={styles.cardBody}>
        <span className={`${styles.line} ${styles.brandLine}`} />
        <span className={`${styles.line} ${styles.titleLine}`} />
        <span className={`${styles.line} ${styles.titleLineShort}`} />
        <span className={`${styles.line} ${styles.metaLine}`} />
        <span className={`${styles.line} ${styles.ratingLine}`} />
        <div className={styles.cardFooter}>
          <span className={`${styles.line} ${styles.priceLine}`} />
          <span className={styles.ctaBlock} />
        </div>
      </div>
    </div>
  );
}

/** A run of card skeletons, used for both first paint and batch appends. */
export function ProductGridSkeleton({ count = 12 }) {
  return Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />);
}

export function FiltersSkeleton({ groups = 4 }) {
  return (
    <div className={styles.filters} aria-hidden="true">
      {Array.from({ length: groups }, (_, group) => (
        <div className={styles.filterGroup} key={group}>
          <span className={`${styles.line} ${styles.groupTitle}`} />
          {Array.from({ length: 4 }, (_, row) => (
            <span className={`${styles.line} ${styles.filterRow}`} key={row} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ToolbarSkeleton() {
  return (
    <div className={styles.toolbar} aria-hidden="true">
      <span className={`${styles.line} ${styles.countLine}`} />
      <span className={styles.sortBlock} />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className={styles.hero} aria-hidden="true">
      <div className={styles.heroCopy}>
        <span className={`${styles.line} ${styles.heroEyebrow}`} />
        <span className={`${styles.line} ${styles.heroTitle}`} />
        <span className={`${styles.line} ${styles.heroText}`} />
        <span className={styles.heroCta} />
      </div>
      <div className={styles.heroArt} />
    </div>
  );
}
