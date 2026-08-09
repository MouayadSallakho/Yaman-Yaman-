import styles from "./Skeleton.module.css";

/**
 * Shared loading primitives.
 *
 * Skeletons are decorative: they stand in for content that is genuinely still
 * arriving, and they are always hidden from assistive technology. The region
 * that owns the asynchronous work owns the `aria-busy`/live messaging — a grid
 * of shimmering boxes must never narrate itself.
 *
 * All three states below are CSS only. There is no JavaScript animation and no
 * GSAP here on purpose: a product grid can hold dozens of these at once, and the
 * cost of each one has to stay near zero.
 */

/**
 * A generic shimmering block. Give it a width/height through `className` or
 * `style` so it matches the box it is standing in for and nothing reflows when
 * the real content lands.
 */
export function Skeleton({ as: Tag = "span", className = "", style, line = false }) {
  return (
    <Tag
      aria-hidden="true"
      style={style}
      className={`${styles.base} ${line ? styles.line : ""} ${className}`.trim()}
    />
  );
}

/**
 * Fills a positioned media slot while its image loads.
 *
 * Expects a positioned ancestor (the slot), which is how every media box in the
 * app is already built, so it inherits the slot's exact dimensions and aspect
 * ratio and cannot introduce layout shift.
 */
export function MediaSkeleton({ className = "" }) {
  return <span aria-hidden="true" className={`${styles.base} ${styles.media} ${className}`.trim()} />;
}

/**
 * Shown when an image will not arrive at all.
 *
 * Distinct from `MediaSkeleton` by design: static rather than shimmering, so it
 * never implies that loading is still in progress. Carries no product name, no
 * file path and no substituted imagery.
 */
export function MediaFallback({ className = "" }) {
  return (
    <span aria-hidden="true" className={`${styles.fallback} ${className}`.trim()}>
      <span className={styles.fallbackMark} />
    </span>
  );
}
