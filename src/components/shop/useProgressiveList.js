"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/** Cards rendered on first paint. */
export const INITIAL_COUNT = 12;

/**
 * Rendered per additional batch — two complete rows of the four-column grid.
 * Smaller than the initial count so scrolling stays cheap.
 */
export const BATCH_SIZE = 8;

const STORAGE_PREFIX = "mabco-shop-progress:";

/**
 * How many frames a restore will wait for the re-rendered grid to grow tall
 * enough to hold the saved scroll position before applying it anyway.
 */
const RESTORE_MAX_FRAMES = 12;

/**
 * Whether the browser can append batches for us.
 *
 * Read through useSyncExternalStore rather than an effect: this is an immutable
 * browser capability, not React state, and the store form is the one way to read
 * it that keeps the server and the hydrating client in agreement without a
 * cascading render. Support never changes, so nothing ever needs to notify.
 */
const subscribeToNothing = () => () => {};
const readObserverSupport = () => typeof IntersectionObserver !== "undefined";
/** The server has no observer; assume the common client case so markup matches. */
const readObserverSupportOnServer = () => true;

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
 * read and every update re-checks that key, so a batch resolving just as the user
 * changes a filter can never leak into the new result set.
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

  const observerSupported = useSyncExternalStore(
    subscribeToNothing,
    readObserverSupport,
    readObserverSupportOnServer,
  );

  /**
   * The sentinel is mounted by the caller only while there is more to reveal, so
   * it can arrive and disappear over the life of the hook. A plain ref would be
   * read as null on the effect pass that matters, so the node is tracked as state
   * and the observer effect re-runs when it arrives.
   */
  const [sentinelNode, setSentinelNode] = useState(null);
  const sentinelRef = useCallback((node) => setSentinelNode(node ?? null), []);
  /** The query whose stored depth has already been applied. */
  const restoredKeyRef = useRef(null);
  const itemsLengthRef = useRef(items.length);

  // The batch committer reads the length from a ref so it never has to be
  // recreated when the result set changes size, which would re-arm the observer.
  useEffect(() => {
    itemsLengthRef.current = items.length;
  }, [items.length]);

  // Progress belonging to a previous query is simply not read, which is why no
  // state has to be corrected during render: the first paint after a filter
  // change already shows the first batch, with no intermediate stale frame.
  const onCurrentQuery = progress.key === queryKey;
  const visibleCount = onCurrentQuery ? progress.count : INITIAL_COUNT;
  const lastAdded = onCurrentQuery ? progress.added : 0;

  const total = items.length;
  const hasMore = visibleCount < total;

  const loadMore = useCallback(() => {
    // Committed in one functional update, so an observer firing twice in the same
    // frame cannot double-advance and no re-entry guard is needed. Re-keying also
    // happens here rather than during render: a batch requested while the stored
    // progress still belongs to the previous query counts up from the start.
    setProgress((current) => {
      const base = current.key === queryKey ? current.count : INITIAL_COUNT;
      const next = Math.min(base + BATCH_SIZE, itemsLengthRef.current);
      if (next === base && current.key === queryKey) return current;
      return { key: queryKey, count: next, added: next - base };
    });
  }, [queryKey]);

  // --- auto-append on scroll ------------------------------------------------
  useEffect(() => {
    if (!sentinelNode || !hasMore) return undefined;

    // Nothing can append automatically here. `observerSupported` already reads
    // false, so the caller has revealed its manual control and the rest of the
    // catalogue stays reachable.
    if (!observerSupported) return undefined;

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
  }, [hasMore, loadMore, observerSupported, sentinelNode, visibleCount]);

  // --- restore how far the user had browsed --------------------------------
  // Keyed by query rather than latched once per mount, so returning to a query
  // visited earlier in this session (A → B → A) restores A's depth again.
  // Reading sessionStorage during render would desync the SSR markup, and the
  // scroll position can only be applied once the restored grid has been laid out.
  useEffect(() => {
    if (restoredKeyRef.current === queryKey) return undefined;
    restoredKeyRef.current = queryKey;

    let saved = null;
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + queryKey);
      saved = raw ? JSON.parse(raw) : null;
    } catch {
      // Private-mode or quota failures must never break browsing.
      return undefined;
    }
    if (!saved || typeof saved.count !== "number") return undefined;

    const targetCount = Math.max(
      INITIAL_COUNT,
      Math.min(saved.count, itemsLengthRef.current)
    );

    setProgress((current) =>
      current.key === queryKey && current.count >= targetCount
        ? current
        : { key: queryKey, count: targetCount, added: 0 }
    );

    if (typeof saved.scrollY !== "number" || saved.scrollY <= 0) return undefined;

    // The restored cards must be laid out before the offset is applied, or the
    // browser clamps it to the height of the shorter document and the position
    // is silently lost.
    let raf = 0;
    let frames = 0;
    const applyScroll = () => {
      if (restoredKeyRef.current !== queryKey) return; // a newer query took over
      const reachable = document.documentElement.scrollHeight - window.innerHeight;
      if (reachable < saved.scrollY && frames < RESTORE_MAX_FRAMES) {
        frames += 1;
        raf = requestAnimationFrame(applyScroll);
        return;
      }
      window.scrollTo({ top: saved.scrollY, behavior: "instant" });
    };
    raf = requestAnimationFrame(applyScroll);

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [queryKey]);

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
    /** False once the observer effect has found no IntersectionObserver. */
    observerSupported,
    remaining: Math.max(0, total - visibleCount),
  };
}
