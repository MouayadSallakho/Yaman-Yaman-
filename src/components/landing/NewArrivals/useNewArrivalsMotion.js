"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export function useNewArrivalsMotion({ rootRef, dir }) {
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const headerItems = gsap.utils.toArray("[data-new-arrivals-header]", root);
      const featured = root.querySelector("[data-new-arrivals-featured]");
      const cards = gsap.utils.toArray("[data-new-arrivals-card]", root);
      const glow = root.querySelector("[data-new-arrivals-glow]");
      const allTargets = [...headerItems, featured, ...cards, glow].filter(Boolean);
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(allTargets, { opacity: 1, x: 0, y: 0, scale: 1 });
        return undefined;
      }

      gsap.set(headerItems, { opacity: 0, y: 18 });
      gsap.set(featured, { opacity: 0, x: dir === "rtl" ? 26 : -26 });
      gsap.set(cards, { opacity: 0, y: 20, scale: 0.985 });
      gsap.set(glow, { opacity: 0 });

      let hasPlayed = false;
      const play = () => {
        if (hasPlayed) return;
        hasPlayed = true;

        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .to(headerItems, { opacity: 1, y: 0, duration: 0.52, stagger: 0.07 })
          .to(featured, { opacity: 1, x: 0, duration: 0.68 }, "-=0.3")
          .to(glow, { opacity: 1, duration: 0.72 }, "<")
          .to(
            cards,
            { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.085 },
            "-=0.45"
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
        { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
      );

      observer.observe(root);
      return () => observer.disconnect();
    },
    { scope: rootRef, dependencies: [dir] }
  );
}
