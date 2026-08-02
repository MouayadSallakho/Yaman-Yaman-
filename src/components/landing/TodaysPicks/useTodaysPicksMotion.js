"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

/**
 * Entrance choreography for Today's Picks.
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
 */
export function useTodaysPicksMotion({ rootRef, dir }) {
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return undefined;

      const header = gsap.utils.toArray("[data-todays-picks-header]", root);
      const visual = root.querySelector("[data-todays-picks-visual]");
      const copy = root.querySelector("[data-todays-picks-copy]");
      const selectors = gsap.utils.toArray("[data-todays-picks-selector]", root);

      let timeline = null;
      let hasPlayed = false;

      const play = () => {
        if (hasPlayed) return;
        hasPlayed = true;

        const visualOffset = dir === "rtl" ? 26 : -26;
        timeline = gsap.timeline({
          defaults: { ease: "power3.out", immediateRender: false },
        });

        if (header.length) {
          timeline.fromTo(
            header,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.54, stagger: 0.08 }
          );
        }

        if (visual) {
          timeline.fromTo(
            visual,
            { opacity: 0, x: visualOffset, scale: 0.988 },
            { opacity: 1, x: 0, scale: 1, duration: 0.66 },
            "-=0.3"
          );
        }

        if (copy) {
          timeline.fromTo(
            copy,
            { opacity: 0, x: -visualOffset * 0.55 },
            { opacity: 1, x: 0, duration: 0.56 },
            "-=0.46"
          );
        }

        if (selectors.length) {
          // Opacity only — the rail is a horizontal scroll container, and an
          // inline offset here would briefly extend its scrollable area.
          timeline.fromTo(
            selectors,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, stagger: 0.055 },
            "-=0.3"
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
    { scope: rootRef, dependencies: [dir] }
  );
}
