/**
 * Shared Swiper configuration for both mobile hero rails.
 *
 * PAIRED PAGES, NOT FREE-SLIDING CARDS
 * ------------------------------------
 * Each slide is one *page* holding two product slots with the electric spine's
 * reserved corridor between them (`slidesPerView: 1`). The previous
 * `slidesPerView: "auto"` model positioned cards by accumulating fixed slide
 * widths from the track's left edge, which has nothing to do with where the
 * spine sits — so a card straddled the spine at almost every viewport width and
 * the left/right gaps drifted apart by as much as 40px. Paging by pairs makes
 * the geometry structural: column 1, corridor, column 3.
 *
 * The rails must never trap the page: `touchAngle` keeps a drag horizontal-only
 * unless the gesture is clearly sideways, so a vertical swipe over a card
 * scrolls the page as normal. No autoplay and no loop — the rails are
 * merchandising, not a slideshow, and looping would break the "reset to page
 * zero on category change" contract.
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
 * its length and — for Top Sellers — the rank, with no ARIA at all. Every card
 * is reachable with Tab whichever page is showing, and `syncRailToFocus` brings
 * a focused card into view. The page dots are a visual progress indicator only.
 *
 * Swiper's Keyboard module is also left out: it binds arrow keys at the document
 * level, which would fight the category arc's own arrow-key navigation.
 */
export const RAIL_SWIPER_PROPS = {
  slidesPerView: 1,
  spaceBetween: 14,
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
 * The track is `overflow: hidden`, so a card reached by Tab while its page is
 * off-screen would be focused but invisible — and any scroll the browser
 * applies to reach it is something Swiper cannot see. Sliding to the card's own
 * page keeps the visible position and the focus position in agreement, and
 * clearing `scrollLeft` undoes a browser scroll if one already happened.
 *
 * Attach as `onFocus` on the section (React's synthetic focus event bubbles, and
 * Swiper's React wrapper does not forward DOM handlers to its container).
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
