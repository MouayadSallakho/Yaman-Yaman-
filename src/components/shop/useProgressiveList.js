"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Cards revealed per batch. */
export const BATCH_SIZE = 12;

/**
 * The catalogue is in memory, so appending a batch would otherwise be
 * instantaneous and the inline skeletons would never be perceivable. This short
 * delay stands in for request latency; when a real endpoint arrives, drop it and
 * drive `isLoadingMore` from the request instead.
 */
const SIMULATED_LATENCY = 420;

const STORAGE_PREFIX = "mabco-shop-progress:";

/**
 * Progressive reveal for a long product list.
 *
 * Hybrid by design: filters and sort live in the URL (shareable, Back-friendly)
 * while the number of revealed cards is local UI state. Scrolling appends the
 * next batch automatically and a real button is always present, so the feature
 * works without an IntersectionObserver and for keyboard-only users.
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
    count: BATCH_SIZE,
    loading: false,
  });

  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const timerRef = useRef(null);
  const restoredRef = useRef(false);

  // Reset when the query changes. Adjusting state during render (rather than in
  // an effect) means the first paint after a filter change already shows the
  // first batch — no intermediate frame with a stale, longer list.
  if (progress.key !== queryKey) {
    setProgress({ key: queryKey, count: BATCH_SIZE, loading: false });
  }

  // Read the batch that belongs to this query; ignore a stale one mid-reset.
  const visibleCount = progress.key === queryKey ? progress.count : BATCH_SIZE;
  const isLoadingMore = progress.key === queryKey ? progress.loading : false;

  const total = items.length;
  const hasMore = visibleCount < total;

  const loadMore = useCallback(() => {
    if (loadingRef.current) return; // guards double-fire from observer + click
    loadingRef.current = true;

    setProgress((current) => ({ ...current, loading: true }));

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      loadingRef.current = false;
      setProgress((current) =>
        // The query may have changed while this batch was in flight.
        current.key !== queryKey
          ? current
          : { ...current, count: current.count + BATCH_SIZE, loading: false }
      );
    }, SIMULATED_LATENCY);
  }, [queryKey]);

  // Abandon an in-flight batch when the query changes.
  useEffect(() => {
    loadingRef.current = false;
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [queryKey]);

  // --- auto-append on scroll ------------------------------------------------
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      // Begin loading before the sentinel is on screen so the next batch is
      // usually painted by the time the user reaches it.
      { rootMargin: "600px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

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
            : { ...current, count: Math.max(BATCH_SIZE, Math.min(saved.count, items.length)) }
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
    isLoadingMore,
    loadMore,
    sentinelRef,
    remaining: Math.max(0, total - visibleCount),
  };
}
