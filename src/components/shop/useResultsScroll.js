"use client";

import { useCallback, useRef } from "react";

/**
 * Height of whatever is pinned to the top of the viewport right now.
 *
 * Measured from the live element rather than assumed: the header is a shared,
 * protected component whose height differs between breakpoints, and it carries no
 * hook-owned marker to key off. Only a genuinely pinned element is subtracted —
 * a statically positioned header scrolls away and must not be deducted.
 */
function pinnedHeaderHeight() {
  const header = document.querySelector("header");
  if (!header) return 0;

  const { position } = window.getComputedStyle(header);
  if (position !== "sticky" && position !== "fixed") return 0;

  return header.getBoundingClientRect().height;
}

/**
 * Scroll policy for the shop.
 *
 * Filter, sort and clear-all changes bring the user back to the START of the
 * results — but only to the results heading, never the top of the whole page,
 * and never downward. If the results are already in view (or above the
 * viewport), nothing moves: re-anchoring someone who can already see the change
 * is the disorienting behaviour, not the fix for it.
 *
 * Appending a batch deliberately calls nothing at all, so reading position is
 * preserved while new cards arrive below.
 */
export default function useResultsScroll() {
  const resultsRef = useRef(null);

  const scrollToResults = useCallback(() => {
    const node = resultsRef.current;
    if (!node || typeof window === "undefined") return;

    // A filter changed from inside the bottom sheet. Moving the page behind an
    // open modal is a jump the user cannot see happening and has not asked for,
    // so the anchor is simply skipped while one is up.
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;

    // Clear the pinned header so the results heading is not hidden behind it.
    const target = Math.max(
      0,
      node.getBoundingClientRect().top + window.scrollY - pinnedHeaderHeight() - 16,
    );

    // Only ever pull the user back up to the results.
    if (window.scrollY <= target + 4) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: target, behavior: reduceMotion ? "instant" : "smooth" });
  }, []);

  return { resultsRef, scrollToResults };
}
