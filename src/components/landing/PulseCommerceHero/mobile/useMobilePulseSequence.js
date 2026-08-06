"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * GSAP orchestration for the mobile Pulse Commerce hero.
 *
 * Purpose-built for the mobile composition rather than shared with the desktop
 * hook, because the two have different geometry (arc vs. full ring), different
 * stage count and — critically — different transform ownership: the mobile
 * rails are Swiper instances.
 *
 * SWIPER / GSAP OWNERSHIP
 * -----------------------
 * Swiper alone owns `.swiper-wrapper` transforms, slide positioning and drag.
 * Every selector here targets inner card content (`[data-m-deal-inner]`,
 * `[data-m-seller-inner]`) or decoration; nothing in this file touches a track
 * or a slide. Rail resets go through Swiper's own `slideTo`, so the two systems
 * never write the same transform.
 *
 * STATE SYNCHRONISATION
 * ---------------------
 * `activeIndex` drives the arc immediately (the tap must feel instant), while
 * `dealsIndex` and `sellersIndex` are swapped mid-timeline as the pulse reaches
 * each stage. A single in-flight timeline is tracked; a selection made while it
 * runs is stored as the one pending request (latest wins), so rapid taps can
 * never interleave two timelines or leave a stage showing another category's
 * products.
 *
 * @param {{
 *   rootRef: React.RefObject<HTMLElement>,
 *   count: number,
 *   labelForIndex: (index: number) => string,
 *   liveRef: React.RefObject<HTMLElement>,
 *   dealsSwiperRef: React.RefObject<import("swiper").Swiper|null>,
 *   sellersSwiperRef: React.RefObject<import("swiper").Swiper|null>,
 *   enabled: boolean,
 * }} params
 */
export function useMobilePulseSequence({
  rootRef,
  count,
  labelForIndex,
  liveRef,
  dealsSwiperRef,
  sellersSwiperRef,
  enabled,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dealsIndex, setDealsIndex] = useState(0);
  const [sellersIndex, setSellersIndex] = useState(0);

  const mountedRef = useRef(false);
  const reducedRef = useRef(false);
  const targetRef = useRef(0);
  const masterRef = useRef(null);
  const pendingRef = useRef(null);
  const ambientRef = useRef([]);
  const pauseRef = useRef({ offscreen: false, hidden: false });
  const apiRef = useRef(null);

  useGSAP(
    (context, contextSafe) => {
      mountedRef.current = true;
      const root = rootRef.current;
      if (!root || !enabled) return undefined;

      const q = gsap.utils.selector(root);
      const reduced =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      reducedRef.current = reduced;

      const setState = (setter, value) => {
        if (mountedRef.current) setter(value);
      };

      /** Reset a rail to its first slide using Swiper's own API (0ms, no tween). */
      const resetRail = (ref) => {
        const swiper = ref.current;
        // `destroyed` guards a rail that unmounted mid-timeline.
        if (swiper && !swiper.destroyed) swiper.slideTo(0, 0, false);
      };

      // ---- ambient motion ------------------------------------------------
      const ambientShouldRun = () =>
        !reducedRef.current && !pauseRef.current.hidden && !pauseRef.current.offscreen;

      const setAmbient = (active) => {
        ambientRef.current.forEach((tween) =>
          active ? tween.play() : tween.pause()
        );
      };

      const startAmbient = contextSafe(() => {
        if (reducedRef.current || ambientRef.current.length) return;
        const tweens = [];
        const push = (tween) => tween && tweens.push(tween);

        // A slow breath along the spine — the "idle" energy of the system.
        push(
          gsap.fromTo(
            q("[data-m-spine-base]"),
            { opacity: 0.34 },
            {
              opacity: 0.6,
              duration: 2.6,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }
          )
        );
        push(
          gsap.fromTo(
            q("[data-m-arc-tap], [data-m-junction]"),
            { opacity: 0.55, scale: 0.9 },
            {
              opacity: 1,
              scale: 1.14,
              duration: 1.9,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              stagger: 0.28,
              transformOrigin: "50% 50%",
            }
          )
        );
        ambientRef.current = tweens;
        setAmbient(ambientShouldRun());
      });

      // ---- the travelling pulse -----------------------------------------
      /**
       * Sends the bright segment down the spine between two fractions of its
       * height. Percentage-based, so the same call works at any hero height —
       * no pixel path to keep in sync.
       */
      const travel = (from, to, duration) => {
        const track = q("[data-m-spine-track]");
        const pulse = q("[data-m-spine-pulse]");
        if (!track.length || !pulse.length) return gsap.timeline();
        /*
          `yPercent` resolves against the element's own height, and the track is
          exactly as tall as the spine — so these are the same fractions the old
          `top` animation used, expressed as a transform. Moving the track rather
          than the segment keeps this off the layout path entirely: no per-frame
          reflow, and no layout shift for Chrome to attribute to the pulse.
        */
        return gsap
          .timeline()
          .set(track, { yPercent: from, force3D: true }, 0)
          .set(pulse, { opacity: 0 }, 0)
          .to(pulse, { opacity: 1, duration: 0.1, ease: "power1.out" }, 0)
          .to(track, { yPercent: to, duration, ease: "power2.inOut", force3D: true }, 0)
          .to(pulse, { opacity: 0, duration: 0.14, ease: "power1.in" }, duration - 0.05);
      };

      /** Bloom at a stage's junction as the pulse arrives. */
      const bloom = (stage) => {
        const node = q(`[data-m-junction="${stage}"]`);
        if (!node.length) return gsap.timeline();
        return gsap
          .timeline()
          .fromTo(
            node,
            { scale: 1, opacity: 0.7 },
            {
              scale: 2.1,
              opacity: 1,
              duration: 0.2,
              ease: "power2.out",
              transformOrigin: "50% 50%",
            }
          )
          .to(node, { scale: 1, opacity: 0.8, duration: 0.28, ease: "power2.in" });
      };

      // ---- category-change choreography ----------------------------------
      const onMasterDone = (index) => {
        masterRef.current = null;
        targetRef.current = index;
        if (!mountedRef.current) return;
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (pending && pending.index !== index) {
          startChange(pending.index, pending.isManual);
        }
      };

      /*
        Two commerce stages, not three: the featured block has no mobile
        composition, so the pulse runs arc → Deals → Top Sellers and the whole
        story settles in ~1.2s instead of ~1.7s.
      */
      const buildMaster = (index) => {
        const dealCards = q("[data-m-deal-inner]");
        const sellerCards = q("[data-m-seller-inner]");
        const charge = q("[data-m-arc-charge]");

        const tl = gsap.timeline({ onComplete: () => onMasterDone(index) });

        // 1 — the arc responds first: energy sweeps toward the new centre.
        if (charge.length) {
          tl.set(charge, { strokeDashoffset: 100, opacity: 1 }, 0)
            .to(charge, { strokeDashoffset: -26, duration: 0.5, ease: "power2.inOut" }, 0)
            .to(charge, { opacity: 0, duration: 0.16 }, 0.44);
        }

        // 2 — the pulse leaves the arc and reaches the Deals rail.
        tl.add(travel(0, 50, 0.4), 0.12);
        tl.add(bloom("deals"), 0.46);
        if (dealCards.length) {
          tl.to(
            dealCards,
            { opacity: 0, y: 10, duration: 0.16, stagger: 0.03, ease: "power2.in" },
            0.2
          );
        }
        tl.add(() => {
          setState(setDealsIndex, index);
          resetRail(dealsSwiperRef);
        }, 0.42);
        if (dealCards.length) {
          tl.fromTo(
            dealCards,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.34,
              stagger: { each: 0.05, from: "start" },
              ease: "power3.out",
            },
            0.46
          );
        }

        // 3 — the pulse continues to Top Sellers.
        tl.add(travel(50, 96, 0.36), 0.5);
        tl.add(bloom("sellers"), 0.84);
        if (sellerCards.length) {
          tl.to(
            sellerCards,
            { opacity: 0, y: 10, duration: 0.16, stagger: 0.03, ease: "power2.in" },
            0.56
          );
        }
        tl.add(() => {
          setState(setSellersIndex, index);
          resetRail(sellersSwiperRef);
        }, 0.8);
        if (sellerCards.length) {
          tl.fromTo(
            sellerCards,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.34,
              stagger: { each: 0.05, from: "start" },
              ease: "power3.out",
            },
            0.84
          );
        }

        // 4 — the seam acknowledges the new state and the story settles (~1.2s).
        tl.fromTo(
          q("[data-m-seam-charge]"),
          { opacity: 0, scaleX: 0.6 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.28,
            ease: "power2.out",
            transformOrigin: "50% 50%",
          },
          0.88
        ).to(q("[data-m-seam-charge]"), { opacity: 0.5, duration: 0.22 }, 1.12);

        return tl;
      };

      const startChange = contextSafe((index, isManual) => {
        targetRef.current = index;
        // The tap itself must never wait on the timeline.
        setState(setActiveIndex, index);
        if (isManual && liveRef?.current) {
          liveRef.current.textContent = labelForIndex(index);
        }
        const tl = buildMaster(index);
        masterRef.current = tl;
        tl.play(0);
      });

      /** Reduced motion (and the pre-hydration path): land on the final state. */
      const applyInstant = contextSafe((index, isManual) => {
        targetRef.current = index;
        setState(setActiveIndex, index);
        setState(setDealsIndex, index);
        setState(setSellersIndex, index);
        resetRail(dealsSwiperRef);
        resetRail(sellersSwiperRef);
        if (isManual && liveRef?.current) {
          liveRef.current.textContent = labelForIndex(index);
        }
      });

      const select = (index, isManual = true) => {
        if (index == null || index < 0 || index >= count) return;
        if (reducedRef.current) {
          applyInstant(index, isManual);
          return;
        }
        if (masterRef.current && masterRef.current.isActive()) {
          // Latest request wins; anything older is discarded, never queued.
          pendingRef.current = { index, isManual };
          // Keep the arc responsive even mid-timeline.
          setState(setActiveIndex, index);
          if (isManual && liveRef?.current) {
            liveRef.current.textContent = labelForIndex(index);
          }
          return;
        }
        if (index === targetRef.current) return;
        startChange(index, isManual);
      };

      apiRef.current = { select };

      // ---- entrance ------------------------------------------------------
      const shell = q("[data-m-shell]");
      const runEntrance = contextSafe(() => {
        if (!mountedRef.current) return;
        const tl = gsap.timeline({
          onComplete: () => {
            // Hand the layout back to CSS so nothing carries an inline transform
            // into the interactive phase.
            gsap.set(
              [
                shell,
                q("[data-m-node]"),
                q("[data-m-stage]"),
                q("[data-m-spine-base]"),
              ],
              { clearProps: "all" }
            );
            startAmbient();
          },
        });

        tl.to(shell, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0)
          .to(
            q("[data-m-spine-base]"),
            { autoAlpha: 1, duration: 0.45, ease: "power2.out" },
            0.1
          )
          .to(
            q("[data-m-node]"),
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.4,
              // Reveal outward from the active centre node.
              stagger: { each: 0.05, from: "center" },
              ease: "back.out(1.5)",
            },
            0.18
          )
          .to(
            q("[data-m-stage]"),
            { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.1, ease: "power3.out" },
            0.34
          )
          .add(travel(0, 96, 0.66), 0.42)
          .add(bloom("deals"), 0.7)
          .add(bloom("sellers"), 0.92);
      });

      let introObserver = null;
      let introFallback = null;

      if (reduced) {
        // Nothing is pre-hidden under reduced motion, so there is no state to
        // restore — the hero is already in its final form.
        startAmbient();
      } else {
        // Hidden with transform + opacity only, so there is no layout shift.
        gsap.set(shell, { autoAlpha: 0 });
        gsap.set(q("[data-m-spine-base]"), { autoAlpha: 0 });
        gsap.set(q("[data-m-node]"), { autoAlpha: 0, scale: 0.4 });
        gsap.set(q("[data-m-stage]"), { autoAlpha: 0, y: 18 });

        const html = document.documentElement;
        const introState = html.getAttribute("data-mabco-intro");
        // `checking` means the intro decision is still pending, so wait for it
        // exactly as we would for `show` — spending the entrance now could burn
        // it behind an intro that is about to appear.
        if (introState === "show" || introState === "checking") {
          // Wait for the cinematic intro to clear before spending the entrance.
          introObserver = new MutationObserver(() => {
            const next = html.getAttribute("data-mabco-intro");
            if (next === "done" || next === "skip") {
              introObserver.disconnect();
              introObserver = null;
              if (introFallback) clearTimeout(introFallback);
              runEntrance();
            }
          });
          introObserver.observe(html, {
            attributes: true,
            attributeFilter: ["data-mabco-intro"],
          });
          introFallback = setTimeout(runEntrance, 6000);
        } else {
          requestAnimationFrame(() => requestAnimationFrame(runEntrance));
        }
      }

      // ---- pause rules ---------------------------------------------------
      const io = new IntersectionObserver(
        ([entry]) => {
          pauseRef.current.offscreen = !entry.isIntersecting;
          setAmbient(ambientShouldRun());
        },
        { threshold: 0.1 }
      );
      io.observe(root);

      const onVisibility = () => {
        pauseRef.current.hidden = document.hidden;
        setAmbient(ambientShouldRun());
      };
      document.addEventListener("visibilitychange", onVisibility);

      return () => {
        mountedRef.current = false;
        if (introFallback) clearTimeout(introFallback);
        introObserver?.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        // useGSAP reverts every tween in this scope; drop our handles too.
        ambientRef.current = [];
        masterRef.current = null;
        pendingRef.current = null;
      };
    },
    // Crossing the hero's breakpoint tears this sequence down or brings it back.
    { scope: rootRef, dependencies: [enabled], revertOnUpdate: true }
  );

  const select = useCallback((index, isManual = true) => {
    apiRef.current?.select?.(index, isManual);
  }, []);

  return { activeIndex, dealsIndex, sellersIndex, select };
}
