"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

/**
 * Entrance choreography for New Arrivals.
 *
 * FAIL-OPEN CONTRACT
 * ------------------
 * Nothing in here hides content. The section is fully painted from the server
 * HTML and no element is ever parked at `opacity: 0` waiting for JavaScript to
 * release it. The reveal is written with `gsap.from()`, which animates *towards*
 * the state the CSS already renders, so every failure mode degrades to "no
 * animation" rather than "blank section":
 *
 *   - JavaScript disabled      → server HTML stays visible
 *   - GSAP chunk fails to load → server HTML stays visible
 *   - hydration throws         → server HTML stays visible
 *   - IntersectionObserver     → missing: plays immediately; never fires: stays visible
 *   - prefers-reduced-motion   → returns before creating a single tween
 *
 * The observer is armed with a positive bottom rootMargin so the from-state is
 * applied while the section is still below the fold. The tween is already
 * running by the time the section scrolls into view, so making the content
 * visible-by-default costs no visible flash.
 */
export function useNewArrivalsMotion({ rootRef, dir }) {
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      // Reduced motion: leave the DOM exactly as the CSS painted it.
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return undefined;

      const headerItems = gsap.utils.toArray("[data-new-arrivals-header]", root);
      const featured = root.querySelector("[data-new-arrivals-featured]");
      const cards = gsap.utils.toArray("[data-new-arrivals-card]", root);
      const glow = root.querySelector("[data-new-arrivals-glow]");

      let timeline = null;
      let hasPlayed = false;

      const play = () => {
        if (hasPlayed) return;
        hasPlayed = true;

        // `fromTo` with explicit end values rather than `from`: a `from` tween
        // infers its destination from whatever the element currently reads,
        // and with immediateRender it can capture the from-state it just wrote
        // — which left the transforms pinned at their start values while only
        // opacity animated. Stating both ends removes the inference entirely.
        // `immediateRender: false` keeps the start state off the element until
        // the playhead actually reaches each tween, which is what allows the
        // markup to stay visible by default.
        timeline = gsap.timeline({
          defaults: { ease: "power3.out", immediateRender: false },
        });

        if (headerItems.length) {
          timeline.fromTo(
            headerItems,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.52, stagger: 0.07 }
          );
        }

        if (featured) {
          timeline.fromTo(
            featured,
            { opacity: 0, x: dir === "rtl" ? 26 : -26 },
            { opacity: 1, x: 0, duration: 0.68 },
            "-=0.3"
          );
        }

        if (glow) {
          timeline.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.72 }, "<");
        }

        if (cards.length) {
          // The supporting cards sit in a horizontal scroll container on
          // mobile, so the reveal stays on opacity/scale — a downward offset
          // would briefly extend the rail's scrollable area.
          timeline.fromTo(
            cards,
            { opacity: 0, scale: 0.985 },
            { opacity: 1, scale: 1, duration: 0.55, stagger: 0.085 },
            "-=0.45"
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
        // Positive bottom margin: fire while the section is still a fifth of a
        // viewport below the fold, so the from-state is never painted on screen.
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
