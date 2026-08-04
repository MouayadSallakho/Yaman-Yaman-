/**
 * Arc windowing maths for the mobile Category Reactor.
 *
 * The real catalogue exposes eight merchandising collections, but the approved
 * mobile arc shows five nodes at a time with the active collection dead centre.
 * These helpers map "which collection is active" onto "which five sit on the
 * arc, and in which slot" — kept as pure functions so the component, the
 * keyboard handler and the GSAP sequence all agree on one answer.
 *
 * Slot coordinates themselves live in the stylesheet (`.slot0`…`.slot4`), not
 * here: positions must survive GSAP `clearProps`, which would wipe inline
 * styles but can never touch a class.
 */

/** Nodes visible on the arc at once. */
export const ARC_SLOTS = 5;

/** How many slots are actually used for a given collection count. */
export function arcSpan(count) {
  return Math.max(0, Math.min(ARC_SLOTS, count));
}

/** Slot that holds the active collection (centre of the used span). */
export function arcCenterSlot(count) {
  return Math.floor(arcSpan(count) / 2);
}

/**
 * The collection indices on the arc, left-to-right in visual order, with the
 * active collection in the centre slot. Wraps, so every collection reaches the
 * arc as the selection moves and none becomes unreachable.
 *
 * @param {number} activeIndex
 * @param {number} count
 * @returns {number[]} collection indices, `arcSpan(count)` long
 */
export function buildArcWindow(activeIndex, count) {
  const span = arcSpan(count);
  if (!span) return [];
  const half = Math.floor(span / 2);
  const window = [];
  for (let slot = 0; slot < span; slot += 1) {
    window.push((((activeIndex - half + slot) % count) + count) % count);
  }
  return window;
}

/**
 * Stylesheet slot a visual position maps to. When fewer collections exist than
 * there are slots, the used span stays centred on the arc rather than
 * left-aligned (so a short catalogue still looks deliberate).
 *
 * @param {number} position index within the built window
 * @param {number} count
 */
export function slotForPosition(position, count) {
  return position + Math.floor((ARC_SLOTS - arcSpan(count)) / 2);
}

/** Step the selection by `delta`, wrapping — used by arrow-key navigation. */
export function stepIndex(activeIndex, delta, count) {
  if (!count) return 0;
  return (((activeIndex + delta) % count) + count) % count;
}
