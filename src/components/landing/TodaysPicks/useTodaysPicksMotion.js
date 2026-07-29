"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export function useTodaysPicksMotion({ rootRef, dir }) {
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const header = gsap.utils.toArray("[data-todays-picks-header]", root);
      const visual = root.querySelector("[data-todays-picks-visual]");
      const copy = root.querySelector("[data-todays-picks-copy]");
      const rail = root.querySelector("[data-todays-picks-rail]");
      const selectors = gsap.utils.toArray("[data-todays-picks-selector]", root);
      const targets = [...header, visual, copy, rail, ...selectors].filter(Boolean);
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(targets, { opacity: 1, x: 0, y: 0, scale: 1, clipPath: "none" });
        return undefined;
      }

      const visualOffset = dir === "rtl" ? 28 : -28;
      gsap.set(header, { opacity: 0, y: 18 });
      gsap.set(visual, {
        opacity: 0,
        x: visualOffset,
        scale: 0.985,
        clipPath: dir === "rtl"
          ? "inset(0 0 0 12% round 28px)"
          : "inset(0 12% 0 0 round 28px)",
      });
      gsap.set(copy, { opacity: 0, x: -visualOffset * 0.55 });
      gsap.set(rail, { opacity: 0, y: 18 });
      gsap.set(selectors, { opacity: 0, x: dir === "rtl" ? 16 : -16 });

      let hasPlayed = false;
      const play = () => {
        if (hasPlayed) return;
        hasPlayed = true;

        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .to(header, { opacity: 1, y: 0, duration: 0.54, stagger: 0.08 })
          .to(
            visual,
            {
              opacity: 1,
              x: 0,
              scale: 1,
              clipPath: "inset(0 0 0 0 round 28px)",
              duration: 0.76,
              ease: "power4.out",
            },
            "-=0.3"
          )
          .to(copy, { opacity: 1, x: 0, duration: 0.58 }, "-=0.5")
          .to(rail, { opacity: 1, y: 0, duration: 0.42 }, "-=0.32")
          .to(
            selectors,
            { opacity: 1, x: 0, duration: 0.42, stagger: 0.055 },
            "-=0.32"
          );
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
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      observer.observe(root);
      return () => observer.disconnect();
    },
    { scope: rootRef, dependencies: [dir] }
  );
}
