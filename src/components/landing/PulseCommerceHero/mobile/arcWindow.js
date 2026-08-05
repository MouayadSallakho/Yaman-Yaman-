/**
 * Arc windowing maths for the mobile Category Reactor.
 *
 * The real catalogue exposes eight merchandising collections, but the approved
 * mobile arc shows five nodes at a time with the active collection dead centre.
 * These helpers map "which collection is active" onto "which nodes sit on the
 * arc, and in which slot" — kept as pure functions so the component, the
 * keyboard handler and the drag gesture all agree on one answer.
 *
 * Two extra nodes are rendered beyond the five visible slots, one at each end.
 * They rest just outside the arc (transparent, clipped by the hero shell) and
 * exist so that dragging always has a node ready to move into view as another
 * leaves — without them the arc would visibly pop at its edges mid-gesture.
 *
 * Slot coordinates themselves live in the stylesheet (`.slot0`…`.slot4`) and, for
 * interpolation during a drag, in `useArcDrag`. Positions are never inline
 * styles at rest: GSAP `clearProps` would wipe those but can never touch a class.
 */

/** Nodes visible on the arc at once. */
export const ARC_SLOTS = 5;

/** Off-arc buffer nodes rendered either side of the visible span. */
export const ARC_BUFFER = 1;

/** How many slots are actually used for a given collection count. */
export function arcSpan(count) {
  return Math.max(0, Math.min(ARC_SLOTS, count));
}

/** Slot that holds the active collection (centre of the used span). */
export function arcCenterSlot(count) {
  return Math.floor(arcSpan(count) / 2);
}

/**
 * The collections to render, in visual order, each with the slot it occupies.
 *
 * Visible slots are `0…span-1`; buffers use `-1` and `span`. Wraps, so every
 * collection reaches the arc as the selection moves and none becomes unreachable.
 * Buffers are only produced when there are more collections than visible slots —
 * otherwise they would duplicate a node already on the arc.
 *
 * @param {number} activeIndex
 * @param {number} count
 * @returns {Array<{ index: number, slot: number, buffer: boolean }>}
 */
export function buildArcWindow(activeIndex, count) {
  const span = arcSpan(count);
  if (!span) return [];

  const half = Math.floor(span / 2);
  /*
    Buffers are only worth rendering when the catalogue is big enough that they
    name collections not already on the arc. Below that the window would list the
    same collection twice, which — because nodes are keyed by collection id so
    React can move a focused node instead of destroying it — would mean duplicate
    keys and lost focus after an arrow key.
  */
  const withBuffers = count >= span + 2 * ARC_BUFFER;
  const from = withBuffers ? -ARC_BUFFER : 0;
  const to = withBuffers ? span - 1 + ARC_BUFFER : span - 1;

  const window = [];
  for (let slot = from; slot <= to; slot += 1) {
    window.push({
      index: (((activeIndex - half + slot) % count) + count) % count,
      slot,
      buffer: slot < 0 || slot > span - 1,
    });
  }
  return window;
}

/**
 * Stylesheet slot a visible position maps to. When fewer collections exist than
 * there are slots, the used span stays centred on the arc rather than
 * left-aligned (so a short catalogue still looks deliberate).
 *
 * @param {number} slot slot from `buildArcWindow`
 * @param {number} count
 */
export function slotForPosition(slot, count) {
  return slot + Math.floor((ARC_SLOTS - arcSpan(count)) / 2);
}

/** Step the selection by `delta`, wrapping — used by arrow-key navigation. */
export function stepIndex(activeIndex, delta, count) {
  if (!count) return 0;
  return (((activeIndex + delta) % count) + count) % count;
}
