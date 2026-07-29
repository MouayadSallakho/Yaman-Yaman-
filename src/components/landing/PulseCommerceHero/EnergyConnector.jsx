"use client";

import styles from "./EnergyConnector.module.css";

/**
 * Decorative electrical signal connector between two hero panels.
 *
 * Pure SVG presentation — the travelling pulse, sparks and endpoint flash are
 * driven by the master GSAP timeline in `usePulseCommerceSequence`, which
 * selects the parts below through their `data-cpart` attributes (scoped to the
 * hero root). The whole graphic is hidden from assistive tech and ignores
 * pointer input; in RTL it is mirrored so the arrowhead and pulse travel
 * follow the reversed reading flow.
 *
 * @param {{ id: 1|2, flip?: boolean }} props
 */
export default function EnergyConnector({ id, flip = false }) {
  // Shared lightning path — normalised to pathLength 100 so the travelling
  // dash maths is independent of the rendered size.
  const d = "M3 30 H24 L33 17 L43 43 L52 30 H63";

  return (
    <div
      className={`${styles.lane} ${flip ? styles.flip : ""}`}
      data-pulse-connector={id}
      aria-hidden="true"
    >
      <svg
        className={styles.svg}
        viewBox="0 0 76 60"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
      >
        {/* soft static conduit */}
        <path
          d={d}
          className={styles.base}
          data-cpart="base"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* bright travelling pulse (dash animated by the timeline) */}
        <path
          d={d}
          className={styles.pulse}
          data-cpart="pulse"
          pathLength="100"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* directional arrowhead near the destination edge */}
        <path
          d="M60 22 L72 30 L60 38 Z"
          className={styles.arrow}
          data-cpart="arrow"
        />
        {/* endpoint bloom — flashes when the signal arrives */}
        <circle cx="70" cy="30" r="6" className={styles.flash} data-cpart="flash" />
        {/* start node */}
        <circle cx="3" cy="30" r="2.4" className={styles.node} />
        {/* travelling sparks (max three) */}
        <circle cx="30" cy="26" r="1.3" className={styles.spark} data-cpart="spark" />
        <circle cx="43" cy="34" r="1.1" className={styles.spark} data-cpart="spark" />
        <circle cx="54" cy="28" r="1.2" className={styles.spark} data-cpart="spark" />
      </svg>
    </div>
  );
}
