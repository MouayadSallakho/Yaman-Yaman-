"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function useProductPageMotion(scopeRef) {
  useGSAP(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set("[data-product-reveal], [data-product-gallery-panel], [data-product-purchase] > *", { clearProps: "all" });
      return undefined;
    }

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .from("[data-product-breadcrumb]", { opacity: 0, y: 10, duration: 0.38 })
      .from("[data-product-gallery]", { opacity: 0, y: 22, scale: 0.985, duration: 0.72 }, "-=0.12")
      .from("[data-product-gallery-panel]", { opacity: 0, x: (index) => (index % 2 ? 24 : -24), rotateY: (index) => (index % 2 ? -7 : 7), stagger: 0.055, duration: 0.55 }, "-=0.5")
      .from("[data-product-purchase] > *", { opacity: 0, y: 14, stagger: 0.04, duration: 0.42 }, "-=0.48")
      .from("[data-product-details]", { opacity: 0, y: 20, duration: 0.55 }, "-=0.15");

    return () => timeline.kill();
  }, { scope: scopeRef });
}
