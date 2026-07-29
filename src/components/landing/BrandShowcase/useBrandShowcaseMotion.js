"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export function useBrandShowcaseMotion({ rootRef, dir }) {
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const headerItems = gsap.utils.toArray("[data-brand-showcase-header]", root);
      const featured = root.querySelector("[data-brand-showcase-featured]");
      const featuredCopy = root.querySelector("[data-brand-showcase-featured-copy]");
      const rings = root.querySelector("[data-brand-showcase-rings]");
      const cards = gsap.utils.toArray("[data-brand-showcase-card]", root);
      const mobileAction = root.querySelector("[data-brand-showcase-mobile-action]");
      const benefits = root.querySelector("[data-brand-showcase-benefits]");
      const targets = [
        ...headerItems,
        featured,
        featuredCopy,
        rings,
        ...cards,
        mobileAction,
        benefits,
      ].filter(Boolean);
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(targets, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0% round 28px)",
          clearProps: "rotate",
        });
        return undefined;
      }

      const featuredOrigin = dir === "rtl" ? "100% 50%" : "0% 50%";
      const featuredClip = dir === "rtl"
        ? "inset(0% 100% 0% 0% round 28px)"
        : "inset(0% 0% 0% 100% round 28px)";

      gsap.set(headerItems, { opacity: 0, y: 20 });
      gsap.set(featured, {
        opacity: 0.92,
        clipPath: featuredClip,
        transformOrigin: featuredOrigin,
      });
      gsap.set(featuredCopy, { opacity: 0, x: dir === "rtl" ? 22 : -22 });
      gsap.set(rings, { opacity: 0, scale: 0.86, rotate: dir === "rtl" ? -8 : 8 });
      gsap.set(cards, {
        opacity: 0,
        y: (index) => (index % 2 === 0 ? 24 : 34),
        x: (index) => {
          const direction = index % 3 === 0 ? -1 : index % 3 === 2 ? 1 : 0;
          return direction * (dir === "rtl" ? -16 : 16);
        },
        scale: 0.975,
      });
      gsap.set(mobileAction, { opacity: 0, y: 14 });
      gsap.set(benefits, { opacity: 0, y: 18 });

      let hasPlayed = false;
      const play = () => {
        if (hasPlayed) return;
        hasPlayed = true;

        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline
          .to(headerItems, {
            opacity: 1,
            y: 0,
            duration: 0.56,
            stagger: 0.075,
          })
          .to(
            featured,
            {
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0% round 28px)",
              duration: 0.82,
              ease: "power4.inOut",
            },
            "-=0.28"
          )
          .to(
            rings,
            { opacity: 1, scale: 1, rotate: 0, duration: 0.78 },
            "-=0.58"
          )
          .to(
            featuredCopy,
            { opacity: 1, x: 0, duration: 0.58 },
            "-=0.52"
          )
          .to(
            cards,
            {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.58,
              stagger: {
                each: 0.075,
                from: "edges",
                grid: [2, 3],
              },
            },
            "-=0.5"
          )
          .to(mobileAction, { opacity: 1, y: 0, duration: 0.42 }, "-=0.26")
          .to(benefits, { opacity: 1, y: 0, duration: 0.5 }, "-=0.28");
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
