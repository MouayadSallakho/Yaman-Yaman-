"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

/**
 * Entrance choreography for More to Explore.
 *
 * FAIL-OPEN CONTRACT
 * ------------------
 * Nothing here hides content. The section is painted from the server HTML and
 * no element is parked at `opacity: 0` waiting for JavaScript to release it, so
 * every failure mode degrades to "no animation" rather than "blank section":
 *
 *   - JavaScript disabled      → server HTML stays visible
 *   - GSAP fails to load       → server HTML stays visible
 *   - hydration throws         → server HTML stays visible
 *   - IntersectionObserver     → missing: plays immediately; never fires: stays visible
 *   - prefers-reduced-motion   → returns before creating a single tween
 *
 * `fromTo` with explicit end values (rather than `from`, which infers its
 * destination from whatever the element currently reads and can capture the
 * start state it just wrote) plus `immediateRender: false` keeps the start
 * state off the elements until the playhead reaches each tween. The observer
 * is armed with a positive bottom rootMargin so that happens while the section
 * is still below the fold — visible-by-default costs no flash.
 *
 * This is the last section before the Footer, so the whole timeline is kept
 * short: a long stagger here would delay the final links on a page the visitor
 * has already scrolled to the bottom of.
 */
export function usePromoRowMotion({ rootRef }) {
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return undefined;

      const headerItems = gsap.utils.toArray("[data-promo-header]", root);
      const cards = gsap.utils.toArray("[data-promo-card]", root);

      let timeline = null;
      let hasPlayed = false;

      const play = () => {
        if (hasPlayed) return;
        hasPlayed = true;

        timeline = gsap.timeline({
          defaults: { ease: "power3.out", immediateRender: false },
        });

        if (headerItems.length) {
          timeline.fromTo(
            headerItems,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.46, stagger: 0.07 }
          );
        }

        if (cards.length) {
          // Opacity and a small lift only. The cards sit in a horizontal
          // scroll container on mobile, so an inline offset would briefly
          // extend its scrollable area.
          timeline.fromTo(
            cards,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.42, stagger: 0.05 },
            "-=0.28"
          );
        }
      };

      if (!("IntersectionObserver" in window)) {
        play();
        return undefined;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            play();
            observer.disconnect();
          }
        },
        { threshold: 0, rootMargin: "0px 0px 20% 0px" }
      );

      observer.observe(root);

      return () => {
        observer.disconnect();
        timeline?.kill();
      };
    },
    { scope: rootRef }
  );
}
