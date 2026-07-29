"use client";

import { useCallback, useRef } from "react";

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

    // Clear the sticky header so the results heading is not hidden behind it.
    const header = document.querySelector("[data-app-header]") || document.querySelector("nav");
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const target = Math.max(0, node.getBoundingClientRect().top + window.scrollY - headerHeight - 16);

    // Only ever pull the user back up to the results.
    if (window.scrollY <= target + 4) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: target, behavior: reduceMotion ? "instant" : "smooth" });
  }, []);

  return { resultsRef, scrollToResults };
}
