/**
 * Shared Swiper configuration for both mobile hero rails.
 *
 * The rails must never trap the page: `touchAngle` keeps a drag horizontal-only
 * unless the gesture is clearly sideways, so a vertical swipe over a card
 * scrolls the page as normal. No autoplay and no loop — the rails are
 * merchandising, not a slideshow, and looping would break the "reset to slide
 * zero on category change" contract.
 *
 * Slide widths come from CSS (`slidesPerView: "auto"`), so one card reads as
 * primary with the next previewed at every mobile width.
 *
 * ACCESSIBILITY: NO a11y MODULE, BY DESIGN
 * ----------------------------------------
 * Swiper's A11y module puts `aria-live="polite"` on the track itself, so every
 * content swap re-announces every product name and price in the rail — on top
 * of an `aria-live="assertive"` notifier. That drowns out the hero's one
 * intended announcement (the chosen category).
 *
 * The rails already carry better semantics natively: each is a real `<ul>` /
 * `<ol>` of `<li>` items containing links, so assistive tech reports the list,
 * its length and — for Top Sellers — the rank, with no ARIA at all. The
 * container keeps an `aria-label`. Keyboard users reach every card with Tab
 * regardless of the track position, and `syncRailToFocus` brings a focused card
 * into view.
 *
 * Swiper's Keyboard module is also left out: it binds arrow keys at the document
 * level, which would fight the category arc's own arrow-key navigation.
 */
export const RAIL_SWIPER_PROPS = {
  slidesPerView: "auto",
  spaceBetween: 10,
  grabCursor: true,
  watchOverflow: true,
  speed: 420,
  autoplay: false,
  loop: false,
  /* Only claim the gesture when it is clearly horizontal (default is 45°). */
  touchAngle: 32,
  /* Let the page take over once the rail is at its end. */
  touchReleaseOnEdges: true,
  resistanceRatio: 0.6,
  threshold: 4,
};

/**
 * Bring the focused card into view.
 *
 * The track is `overflow: hidden`, so a card reached by Tab while off-screen
 * would be focused but invisible — and any scroll the browser applies to reach
 * it is something Swiper cannot see. Sliding to the card's own index keeps the
 * visible position and the focus position in agreement, and clearing
 * `scrollLeft` undoes a browser scroll if one already happened.
 *
 * Attach as `onFocus` (React's synthetic focus event bubbles, so this catches
 * focus on any card inside the rail).
 *
 * @param {import("swiper").Swiper|null} swiper
 * @returns {(event: React.FocusEvent) => void}
 */
export function syncRailToFocus(swiper) {
  return (event) => {
    if (!swiper || swiper.destroyed) return;
    const slide = event.target.closest(".swiper-slide");
    if (!slide) return;

    const container = swiper.el;
    if (container && container.scrollLeft !== 0) container.scrollLeft = 0;

    const index = swiper.slides.indexOf(slide);
    if (index >= 0 && index !== swiper.activeIndex) swiper.slideTo(index);
  };
}
