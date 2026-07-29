"use client";

import { useCallback, useRef, useState } from "react";

const DRAG_THRESHOLD = 46;

export default function useProductGallery(itemCount, dir = "ltr") {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef(null);
  const dragged = useRef(false);
  const thumbnailRefs = useRef([]);

  const select = useCallback((index, focus = false) => {
    const normalized = ((index % itemCount) + itemCount) % itemCount;
    setActiveIndex(normalized);
    requestAnimationFrame(() => {
      thumbnailRefs.current[normalized]?.scrollIntoView?.({ behavior: "smooth", inline: "nearest", block: "nearest" });
      if (focus) thumbnailRefs.current[normalized]?.focus?.({ preventScroll: true });
    });
  }, [itemCount]);

  const next = useCallback(() => select(activeIndex + 1), [activeIndex, select]);
  const previous = useCallback(() => select(activeIndex - 1), [activeIndex, select]);

  function onKeyDown(event) {
    if (event.key === "ArrowRight") { event.preventDefault(); select(activeIndex + (dir === "rtl" ? -1 : 1), true); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); select(activeIndex + (dir === "rtl" ? 1 : -1), true); }
    else if (event.key === "Home") { event.preventDefault(); select(0, true); }
    else if (event.key === "End") { event.preventDefault(); select(itemCount - 1, true); }
  }

  function onPointerDown(event) {
    pointerStart.current = event.clientX;
    dragged.current = false;
  }

  function onPointerMove(event) {
    if (pointerStart.current === null) return;
    if (Math.abs(event.clientX - pointerStart.current) <= 8) return;

    dragged.current = true;
    // Capture only once a real drag starts. Capturing on pointerdown would
    // retarget the following click to the stage, so the arrows and the panel
    // buttons inside it would never receive it.
    if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
  }

  function onPointerUp(event) {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) >= DRAG_THRESHOLD) select(activeIndex + (distance > 0 ? -1 : 1));
  }

  function consumeDrag() {
    const value = dragged.current;
    dragged.current = false;
    return value;
  }

  return { activeIndex, select, next, previous, onKeyDown, onPointerDown, onPointerMove, onPointerUp, consumeDrag, thumbnailRefs };
}
