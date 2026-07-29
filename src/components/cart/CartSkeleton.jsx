import styles from "./CartSkeleton.module.css";

/**
 * Cart loading placeholders.
 *
 * Shown while persisted cart state is being read on the client. That read is
 * deliberately post-mount, so without these the first paint would flash an
 * incorrect "empty cart". Each shape matches the real layout's box model, so
 * the swap causes no layout shift.
 */

function ItemSkeleton() {
  return (
    <div className={styles.item}>
      <div className={styles.media} />
      <div className={styles.lines}>
        <span className={`${styles.line} ${styles.title}`} />
        <span className={`${styles.line} ${styles.option}`} />
        <span className={`${styles.line} ${styles.price}`} />
        <div className={styles.stepper} />
      </div>
      <span className={`${styles.line} ${styles.lineTotal}`} />
    </div>
  );
}

/** Fills the drawer body: items, summary rows and the action buttons. */
export function CartDrawerSkeleton({ items = 3 }) {
  return (
    <div className={styles.drawer} aria-hidden="true">
      <div className={styles.drawerItems}>
        {Array.from({ length: items }, (_, i) => (
          <ItemSkeleton key={i} />
        ))}
      </div>

      <div className={styles.drawerFooter}>
        <span className={`${styles.line} ${styles.summaryRow}`} />
        <span className={`${styles.line} ${styles.summaryRow}`} />
        <span className={`${styles.line} ${styles.summaryTotal}`} />
        <div className={styles.cta} />
        <div className={styles.ctaSecondary} />
      </div>
    </div>
  );
}

/** Fills the cart page: heading, rows and the order summary card. */
export function CartPageSkeleton({ rows = 3 }) {
  return (
    <div className={styles.page} aria-hidden="true">
      <div className={styles.pageMain}>
        <span className={`${styles.line} ${styles.heading}`} />
        <div className={styles.pageCard}>
          {Array.from({ length: rows }, (_, i) => (
            <ItemSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className={styles.pageAside}>
        <span className={`${styles.line} ${styles.asideTitle}`} />
        <span className={`${styles.line} ${styles.summaryRow}`} />
        <span className={`${styles.line} ${styles.summaryRow}`} />
        <span className={`${styles.line} ${styles.summaryRow}`} />
        <span className={`${styles.line} ${styles.summaryTotal}`} />
        <div className={styles.cta} />
      </div>
    </div>
  );
}
