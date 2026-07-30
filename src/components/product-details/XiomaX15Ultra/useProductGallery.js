"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Active-image state for the orbit gallery.
 *
 * This owns *which* image is active and nothing about how cards move — pointer
 * dragging and all positional transforms belong to useProductOrbitGalleryMotion,
 * so the two never write the same properties.
 */
export default function useProductGallery(itemCount, dir = "ltr") {
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailRefs = useRef([]);

  /** Keeps the chosen thumbnail in view, and optionally moves focus to it. */
  const revealThumbnail = useCallback((index, focus) => {
    requestAnimationFrame(() => {
      thumbnailRefs.current[index]?.scrollIntoView?.({ behavior: "smooth", inline: "nearest", block: "nearest" });
      if (focus) thumbnailRefs.current[index]?.focus?.({ preventScroll: true });
    });
  }, []);

  /**
   * Navigation is never blocked or debounced. The active index is the single
   * source of truth, and the motion hook rebuilds every slot from it off the
   * cards' current positions — so rapid or alternating input retargets
   * immediately instead of being dropped, and still cannot desync.
   */
  const select = useCallback((index, focus = false) => {
    const normalized = ((index % itemCount) + itemCount) % itemCount;
    if (normalized === activeIndex) return;
    setActiveIndex(normalized);
    revealThumbnail(normalized, focus);
  }, [activeIndex, itemCount, revealThumbnail]);

  const step = useCallback((delta, focus = false) => {
    if (!delta) return;
    const normalized = (((activeIndex + delta) % itemCount) + itemCount) % itemCount;
    setActiveIndex(normalized);
    revealThumbnail(normalized, focus);
  }, [activeIndex, itemCount, revealThumbnail]);

  const next = useCallback(() => step(1), [step]);
  const previous = useCallback(() => step(-1), [step]);

  const onKeyDown = useCallback((event) => {
    // In RTL the visual orbit is mirrored, so the arrows keep their on-screen
    // meaning rather than their index meaning.
    const forward = dir === "rtl" ? -1 : 1;
    if (event.key === "ArrowRight") { event.preventDefault(); step(forward, true); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); step(-forward, true); }
    else if (event.key === "Home") { event.preventDefault(); select(0, true); }
    else if (event.key === "End") { event.preventDefault(); select(itemCount - 1, true); }
  }, [dir, itemCount, select, step]);

  return { activeIndex, select, step, next, previous, onKeyDown, thumbnailRefs };
}
