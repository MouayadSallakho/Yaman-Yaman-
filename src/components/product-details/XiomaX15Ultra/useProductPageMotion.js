"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function useProductPageMotion(scopeRef) {
  useGSAP(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set("[data-product-reveal], [data-product-purchase] > *", { clearProps: "all" });
      return undefined;
    }

    // The gallery shell animates in as one unit. Individual orbit cards are
    // deliberately excluded: useProductOrbitGalleryMotion is their only owner,
    // and two timelines writing the same transforms would fight each other.
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .from("[data-product-breadcrumb]", { opacity: 0, y: 10, duration: 0.38 })
      .from("[data-product-gallery]", { opacity: 0, y: 22, scale: 0.985, duration: 0.72 }, "-=0.12")
      .from("[data-product-purchase] > *", { opacity: 0, y: 14, stagger: 0.04, duration: 0.42 }, "-=0.42")
      .from("[data-product-details]", { opacity: 0, y: 20, duration: 0.55 }, "-=0.15");

    return () => timeline.kill();
  }, { scope: scopeRef });
}
