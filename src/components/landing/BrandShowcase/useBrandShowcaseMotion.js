"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

/**
 * Entrance choreography for Brand Showcase.
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
 * fires while the section is still below the fold, so visible-by-default costs
 * no flash. The previous clip-path reveal is gone: it was the most expensive
 * part of the timeline and the one most likely to strand the card mid-wipe.
 */
export function useBrandShowcaseMotion({ rootRef, dir }) {
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return undefined;

      const headerItems = gsap.utils.toArray("[data-brand-showcase-header]", root);
      const featured = root.querySelector("[data-brand-showcase-featured]");
      const featuredCopy = gsap.utils.toArray("[data-brand-showcase-featured-copy]", root);
      const rings = root.querySelector("[data-brand-showcase-rings]");
      const cards = gsap.utils.toArray("[data-brand-showcase-card]", root);
      const benefits = root.querySelector("[data-brand-showcase-benefits]");

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
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }
          );
        }

        if (featured) {
          timeline.fromTo(
            featured,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.26"
          );
        }

        if (rings) {
          timeline.fromTo(
            rings,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.62 },
            "-=0.44"
          );
        }

        if (featuredCopy.length) {
          timeline.fromTo(
            featuredCopy,
            { opacity: 0, x: dir === "rtl" ? 18 : -18 },
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.06 },
            "-=0.46"
          );
        }

        if (cards.length) {
          // Opacity and a small lift only. The cards sit in a horizontal scroll
          // container on mobile, so an inline offset would briefly extend its
          // scrollable area, and a long stagger would delay reaching the links.
          timeline.fromTo(
            cards,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.44, stagger: 0.05 },
            "-=0.34"
          );
        }

        if (benefits) {
          timeline.fromTo(
            benefits,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.44 },
            "-=0.24"
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
    /* `revertOnUpdate` so the cleanup — and its `observer.disconnect()` — runs
       when `dir` changes on a language switch. Without it useGSAP re-runs this
       callback without reverting the previous context, leaving the old
       IntersectionObserver connected. See useTodaysPicksMotion for the
       measurement that isolated this section as one of the two leaking. */
    { scope: rootRef, dependencies: [dir], revertOnUpdate: true }
  );
}
