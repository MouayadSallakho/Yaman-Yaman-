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
import { useEffect, useRef } from "react";

export const RAIL_SWIPER_PROPS = {
  slidesPerView: 1,
  spaceBetween: 14,
  grabCursor: true,
  watchOverflow: true,
  /* Settle time after release. 420ms read as lag on a phone — the page had
     visibly stopped following the finger while the transition ran out. */
  speed: 320,
  autoplay: false,
  loop: false,
  /*
    Swiper's default. It was narrowed to 32° to "only claim clearly horizontal
    gestures", and that is exactly what made the rails feel broken on real
    hardware: Swiper measures the angle of the opening movement and *silently
    refuses* anything steeper, so the swipe simply did nothing.

    Measured on the production build at 390x844, resetting to page 0 before each
    gesture:

        ~2°  (a DevTools mouse drag)  -> moves
        ~15°                          -> moves
        ~25°                          -> moves
        ~35°                          -> REFUSED
        ~45°                          -> REFUSED

    A mouse travels at 0–2°, which is why emulation always felt smooth. A thumb
    sweeping across a phone arcs through roughly 30–50°, so a large share of
    real swipes fell in the refused band; the user swipes again and reads the
    non-response as lag. 45° keeps clearly vertical gestures with the page.
  */
  touchAngle: 45,
  /* Let the page take over once the rail is at its end. */
  touchReleaseOnEdges: true,
  resistanceRatio: 0.6,
  threshold: 4,
};

/**
 * Keep a live Swiper's reading direction in step with the document's.
 *
 * The rails used to carry `key={dir}`, which threw the whole instance away and
 * built a new one whenever the language changed. That is what leaked: measured
 * in place on the homepage across twenty English/Arabic switches, live
 * ResizeObservers grew 2 -> 42, exactly two per switch — one per discarded rail
 * — and the heap rose with them at roughly 0.2MB per switch while DOM nodes and
 * listeners had already plateaued. The discarded instances kept their observers.
 *
 * `changeLanguageDirection` is Swiper's own answer to this: it flips `rtl`,
 * recalculates the track and leaves the instance, its observers and its slides
 * alone. Direction still changes exactly once per switch.
 *
 * Paging is reset to the first page because the rails already do that whenever
 * their contents change collection; leaving a right-to-left track parked on
 * page two of the previous reading order is the stale state the key was
 * originally added to avoid.
 *
 * @param {import("react").RefObject<import("swiper").Swiper|null>} swiperRef
 * @param {"ltr"|"rtl"} dir
 */
export function useRailDirection(swiperRef, dir) {
  const appliedRef = useRef(null);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;

    // First run just records the direction the instance was built with.
    if (appliedRef.current === null) {
      appliedRef.current = dir;
      return;
    }
    if (appliedRef.current === dir) return;
    appliedRef.current = dir;

    swiper.changeLanguageDirection(dir);
    swiper.slideTo(0, 0);
    swiper.update();
  }, [swiperRef, dir]);
}

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
