"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Cards rendered on first paint. */
export const INITIAL_COUNT = 12;

/**
 * Rendered per additional batch — two complete rows of the four-column grid.
 * Smaller than the initial count so scrolling stays cheap.
 */
export const BATCH_SIZE = 8;

const STORAGE_PREFIX = "mabco-shop-progress:";

/**
 * Progressive reveal for a long product list.
 *
 * Hybrid by design: filters and sort live in the URL (shareable, Back-friendly)
 * while the number of revealed cards is local UI state. An IntersectionObserver
 * on a sentinel past the grid appends the next batch as the user approaches it.
 *
 * The catalogue is in memory, so a batch is committed synchronously: there is no
 * request to wait for, therefore no latency to simulate and no spinner to show.
 *
 * Progress is stored as a single object carrying the query it belongs to. Every
 * update re-checks that key, so a batch resolving just as the user changes a
 * filter can never leak into the new result set.
 *
 * @param {unknown[]} items  The full, already filtered + sorted list.
 * @param {string} queryKey  Changes whenever the query changes → resets.
 */
export default function useProgressiveList(items, queryKey) {
  const [progress, setProgress] = useState({
    key: queryKey,
    count: INITIAL_COUNT,
    /** Size of the batch that produced this count, for the polite announcement. */
    added: 0,
  });

  /**
   * The sentinel is mounted by the caller only after the initial skeleton clears,
   * which is later than this hook's first effect pass. A plain ref would already
   * have been read as null by then and the observer would never attach, so the
   * node is tracked as state and the observer effect re-runs when it arrives.
   */
  const [sentinelNode, setSentinelNode] = useState(null);
  const sentinelRef = useCallback((node) => setSentinelNode(node ?? null), []);
  const restoredRef = useRef(false);
  const itemsLengthRef = useRef(items.length);

  // The batch committer reads the length from a ref so it never has to be
  // recreated when the result set changes size, which would re-arm the observer.
  useEffect(() => {
    itemsLengthRef.current = items.length;
  }, [items.length]);

  // Reset when the query changes. Adjusting state during render (rather than in
  // an effect) means the first paint after a filter change already shows the
  // first batch — no intermediate frame with a stale, longer list.
  if (progress.key !== queryKey) {
    setProgress({ key: queryKey, count: INITIAL_COUNT, added: 0 });
  }

  // Read the batch that belongs to this query; ignore a stale one mid-reset.
  const visibleCount = progress.key === queryKey ? progress.count : INITIAL_COUNT;
  const lastAdded = progress.key === queryKey ? progress.added : 0;

  const total = items.length;
  const hasMore = visibleCount < total;

  const loadMore = useCallback(() => {
    // Committed in one functional update, so an observer firing twice in the same
    // frame cannot double-advance and no re-entry guard is needed.
    setProgress((current) => {
      if (current.key !== queryKey) return current;
      const next = Math.min(current.count + BATCH_SIZE, itemsLengthRef.current);
      if (next === current.count) return current;
      return { ...current, count: next, added: next - current.count };
    });
  }, [queryKey]);

  // --- auto-append on scroll ------------------------------------------------
  useEffect(() => {
    if (!sentinelNode || !hasMore) return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      // Begin loading before the sentinel is on screen so the next batch is
      // usually painted by the time the user reaches it.
      { rootMargin: "600px 0px" }
    );

    observer.observe(sentinelNode);
    return () => observer.disconnect();
    // visibleCount is a dependency on purpose. An IntersectionObserver only
    // reports *changes* in intersection, so a sentinel that is still inside the
    // root margin after a batch would never fire again and loading would stall
    // until the user scrolled once more. Re-observing after each committed batch
    // gives a fresh initial callback, which keeps filling until the sentinel
    // finally falls outside the margin or nothing matching is left.
  }, [hasMore, loadMore, sentinelNode, visibleCount]);

  // --- restore how far the user had browsed --------------------------------
  // Once, after mount, inside a rAF: reading sessionStorage during render would
  // desync the SSR markup, and the scroll position can only be applied after
  // the restored (taller) grid has been laid out.
  useEffect(() => {
    if (restoredRef.current) return undefined;
    restoredRef.current = true;

    const key = queryKey;
    let raf = 0;

    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
      if (!raw) return undefined;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved.count !== "number") return undefined;

      raf = requestAnimationFrame(() => {
        setProgress((current) =>
          current.key !== key
            ? current
            : { ...current, count: Math.max(INITIAL_COUNT, Math.min(saved.count, items.length)) }
        );
        if (typeof saved.scrollY === "number") {
          requestAnimationFrame(() =>
            window.scrollTo({ top: saved.scrollY, behavior: "instant" })
          );
        }
      });
    } catch {
      // Private-mode or quota failures must never break browsing.
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items.length, queryKey]);

  // --- persist browsing depth ----------------------------------------------
  useEffect(() => {
    const persist = () => {
      try {
        sessionStorage.setItem(
          STORAGE_PREFIX + queryKey,
          JSON.stringify({ count: visibleCount, scrollY: Math.round(window.scrollY) })
        );
      } catch {
        // Ignore — persistence is a convenience, not a requirement.
      }
    };

    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", persist);
    return () => {
      persist();
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", persist);
    };
  }, [queryKey, visibleCount]);

  return {
    visibleItems: items.slice(0, visibleCount),
    visibleCount,
    hasMore,
    /** Size of the most recent batch, so the caller can announce it politely. */
    lastAdded,
    loadMore,
    sentinelRef,
    remaining: Math.max(0, total - visibleCount),
  };
}
