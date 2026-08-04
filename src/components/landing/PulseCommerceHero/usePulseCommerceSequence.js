"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const AUTO_DELAY = 14000; // ~10s between automatic collection changes

// Shortest continuous rotation from `current` (deg, unbounded) to a bounded
// target angle — so the selector never takes the long way round.
function shortestStep(current, targetAngle) {
  const cm = ((current % 360) + 360) % 360;
  let delta = targetAngle - cm;
  delta = ((delta + 540) % 360) - 180;
  return current + delta;
}

/**
 * Master GSAP orchestration for the Pulse Commerce hero.
 *
 * Owns the displayed collection indices, the first-render assembly, the
 * category-change choreography (Reactor selector → signal → Deals → signal →
 * Sellers), ambient motion, single-timer auto-progression and every pause rule.
 * All GSAP work is scoped to `rootRef` via `useGSAP`, so tweens, the assembly,
 * the master timeline and ambient loops revert automatically on unmount;
 * observers, listeners and the timer are cleared in the returned cleanup.
 *
 * @param {{
 *   rootRef: React.RefObject<HTMLElement>,
 *   count: number,
 *   labelForIndex: (index: number) => string,
 *   liveRef: React.RefObject<HTMLElement>,
 *   enabled?: boolean,
 * }} params
 * @param {boolean} [params.enabled=true] Whether the desktop composition is the
 *   visible one. Below the hero's breakpoint the desktop tree is `display: none`
 *   and the mobile composition is in charge, so this hook stands down entirely
 *   rather than auto-rotating collections and tweening hidden DOM.
 */
export function usePulseCommerceSequence({
  rootRef,
  count,
  labelForIndex,
  liveRef,
  enabled = true,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dealsIndex, setDealsIndex] = useState(0);
  const [sellersIndex, setSellersIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  const mountedRef = useRef(false);
  const reducedRef = useRef(false);
  const stepRef = useRef(0); // continuous selector rotation in degrees
  const targetRef = useRef(0); // logically selected collection
  const masterRef = useRef(null);
  const pendingRef = useRef(null); // latest pending selection while busy
  const ambientRef = useRef([]);
  const autoTimerRef = useRef(null);
  const pauseRef = useRef({ hover: false, focus: false, offscreen: false, hidden: false });
  const apiRef = useRef(null);

  useGSAP(
    (context, contextSafe) => {
      mountedRef.current = true;
      const root = rootRef.current;
      if (!root || !enabled) return undefined;

      const q = gsap.utils.selector(root);
      const angleStep = 360 / count;
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      reducedRef.current = reduced;

      const has = (sel) => q(sel).length > 0;
      const setState = (setter, val) => {
        if (mountedRef.current) setter(val);
      };

      // --- initial selector orientation ---------------------------------
      gsap.set(q("[data-pulse-pointer]"), { rotation: 0 });
      stepRef.current = 0;

      // --- one reusable electrical signal -------------------------------
      const fire = (id) => {
        const pulse = q(`[data-pulse-connector="${id}"] [data-cpart="pulse"]`);
        const flash = q(`[data-pulse-connector="${id}"] [data-cpart="flash"]`);
        const sparks = q(`[data-pulse-connector="${id}"] [data-cpart="spark"]`);
        const tl = gsap.timeline();
        if (pulse.length) {
          tl.set(pulse, { strokeDashoffset: 100, opacity: 1 }, 0).to(
            pulse,
            { strokeDashoffset: -15, duration: 0.42, ease: "power1.inOut" },
            0
          );
        }
        if (sparks.length) {
          tl.to(sparks, { opacity: 1, duration: 0.1, stagger: 0.06, yoyo: true, repeat: 1 }, 0.05);
        }
        if (flash.length) {
          tl.to(flash, { opacity: 0.9, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, 0.3);
        }
        if (pulse.length) {
          tl.to(pulse, { opacity: 0, duration: 0.15 }, 0.42);
        }
        return tl;
      };

      // --- ambient motion ------------------------------------------------
      const computeVisible = () =>
        !reducedRef.current && !pauseRef.current.hidden && !pauseRef.current.offscreen;

      const setAmbientActive = (active) => {
        ambientRef.current.forEach((tw) => (active ? tw.play() : tw.pause()));
      };

      const startAmbient = contextSafe(() => {
        if (reducedRef.current || ambientRef.current.length) return;
        const tw = [];
        const add = (t) => t && tw.push(t);
        if (has("[data-pulse-spin]"))
          add(gsap.to(q("[data-pulse-spin]"), { rotation: "+=360", duration: 90, ease: "none", repeat: -1 }));
        if (has("[data-pulse-energy]"))
          add(gsap.fromTo(q("[data-pulse-energy]"), { opacity: 0.35, scale: 0.8 }, { opacity: 1, scale: 1.2, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%" }));
        if (has("[data-pulse-featured-img]"))
          add(gsap.to(q("[data-pulse-featured-img]"), { y: -6, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1 }));
        if (has("[data-pulse-featured-line]"))
          add(gsap.to(q("[data-pulse-featured-line]"), { strokeDashoffset: -118, duration: 3.4, ease: "none", repeat: -1 }));
        if (has('[data-cpart="base"]'))
          add(gsap.fromTo(q('[data-cpart="base"]'), { opacity: 0.28 }, { opacity: 0.5, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.5 }));
        ambientRef.current = tw;
        setAmbientActive(computeVisible());
      });

      // --- auto-progression (single timer) ------------------------------
      const canAuto = () =>
        !reducedRef.current &&
        !pauseRef.current.hover &&
        !pauseRef.current.focus &&
        !pauseRef.current.offscreen &&
        !pauseRef.current.hidden &&
        !(masterRef.current && masterRef.current.isActive());

      const clearAuto = () => {
        if (autoTimerRef.current) {
          clearTimeout(autoTimerRef.current);
          autoTimerRef.current = null;
        }
      };

      const refreshAuto = () => {
        clearAuto();
        if (!canAuto()) return;
        autoTimerRef.current = setTimeout(() => {
          autoTimerRef.current = null;
          if (!canAuto()) return;
          apiRef.current.select((targetRef.current + 1) % count, false);
        }, AUTO_DELAY);
      };

      // --- master category-change choreography --------------------------
      const onMasterDone = (index) => {
        masterRef.current = null;
        targetRef.current = index;
        if (!mountedRef.current) return;
        setBusy(false);
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (pending && pending.index !== index) {
          startChange(pending.index, pending.isManual);
        } else {
          refreshAuto();
        }
      };

      const buildMaster = (index) => {
        const nodes = q("[data-pulse-node]");
        const targetNode = nodes[index];
        const cover = q("[data-pulse-cover]");
        const deals = q("[data-pulse-deal]");
        const featured = q("[data-pulse-featured]");
        const sellers = q("[data-pulse-seller]");
        const pointer = q("[data-pulse-pointer]");

        const newStep = shortestStep(stepRef.current, index * angleStep);
        stepRef.current = newStep;

        const tl = gsap.timeline({ onComplete: () => onMasterDone(index) });

        // Phase A — reactor selection (selector moves, centre content swaps
        // while covered)
        if (targetNode)
          tl.to(targetNode, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 0);
        if (pointer.length) tl.to(pointer, { rotation: newStep, duration: 0.55, ease: "power3.inOut" }, 0);
        if (cover.length) {
          tl.to(cover, { opacity: 1, duration: 0.2, ease: "power2.in" }, 0.12)
            .add(() => setState(setActiveIndex, index), 0.34)
            .to(cover, { opacity: 0, duration: 0.24, ease: "power2.out" }, 0.42);
        } else {
          tl.add(() => setState(setActiveIndex, index), 0.34);
        }

        // Phase B — first signal
        tl.add(fire(1), 0.5);

        // Phase C — deals transformation (covered swap)
        const cAt = 0.72;
        if (deals.length)
          tl.to(deals, { opacity: 0, scale: 0.94, z: -30, duration: 0.24, stagger: 0.05, ease: "power2.in" }, cAt);
        if (featured.length)
          tl.to(featured, { opacity: 0, y: 8, duration: 0.22, ease: "power2.in" }, cAt);
        tl.add(() => setState(setDealsIndex, index), cAt + 0.28);
        if (deals.length)
          tl.fromTo(
            deals,
            { opacity: 0, scale: 0.94, y: 14 },
            { opacity: 1, scale: 1, y: 0, z: 0, duration: 0.4, stagger: { each: 0.07, from: "start" }, ease: "power3.out" },
            cAt + 0.3
          );
        if (featured.length)
          tl.fromTo(featured, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, cAt + 0.34);

        // Phase D — second signal
        tl.add(fire(2), cAt + 0.5);

        // Phase E — controlled 360° seller update
        const eAt = cAt + 0.72;
        if (sellers.length) {
          tl.to(sellers, { rotationY: 90, duration: 0.28, stagger: 0.1, ease: "power2.in" }, eAt)
            .add(() => setState(setSellersIndex, index), eAt + 0.5)
            .set(sellers, { rotationY: 270 }, eAt + 0.5)
            .to(sellers, { rotationY: 360, duration: 0.32, stagger: 0.1, ease: "power2.out" }, eAt + 0.52)
            .set(sellers, { rotationY: 0 }, ">");
        } else {
          tl.add(() => setState(setSellersIndex, index), eAt + 0.5);
        }

        return tl;
      };

      const startChange = contextSafe((index, isManual) => {
        targetRef.current = index;
        setBusy(true);
        clearAuto();
        if (isManual && liveRef?.current) liveRef.current.textContent = labelForIndex(index);
        const tl = buildMaster(index);
        masterRef.current = tl;
        tl.play(0);
      });

      const applyInstant = contextSafe((index, isManual) => {
        const newStep = shortestStep(stepRef.current, index * angleStep);
        stepRef.current = newStep;
        gsap.set(q("[data-pulse-pointer]"), { rotation: newStep });
        targetRef.current = index;
        setState(setActiveIndex, index);
        setState(setDealsIndex, index);
        setState(setSellersIndex, index);
        if (isManual && liveRef?.current) liveRef.current.textContent = labelForIndex(index);
      });

      const select = (index, isManual = true) => {
        if (index == null || index < 0 || index >= count) return;
        if (reducedRef.current) {
          applyInstant(index, isManual);
          return;
        }
        if (masterRef.current && masterRef.current.isActive()) {
          pendingRef.current = { index, isManual }; // keep only the latest request
          return;
        }
        if (index === targetRef.current) return;
        startChange(index, isManual);
      };

      apiRef.current = { select };

      // --- first-render assembly ----------------------------------------
      const shell = root;
      const runAssembly = contextSafe(() => {
        if (!mountedRef.current) return;
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(
              [shell, q("[data-pulse-ring]"), q("[data-pulse-node]"), q('[data-pulse-panel="deals"]'), q('[data-pulse-panel="sellers"]')],
              { clearProps: "all" }
            );
            startAmbient();
            refreshAuto();
          },
        });
        tl.to(shell, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0)
          .to(q("[data-pulse-ring]"), { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out" }, 0.15)
          .to(q("[data-pulse-node]"), { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.05, ease: "back.out(1.6)" }, 0.4)
          .to(q('[data-pulse-panel="deals"]'), { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.35)
          .to(q('[data-pulse-panel="sellers"]'), { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.5)
          .add(fire(1), 0.7)
          .add(fire(2), 0.85);
      });

      let introObserver = null;
      let introFallback = null;
      if (!reduced) {
        // Hide the assembly targets before paint (safe: the cinematic intro
        // overlay covers the hero, or we play on the next frame). Transform +
        // opacity only, so there is no layout shift.
        gsap.set(shell, { autoAlpha: 0, y: 16 });
        gsap.set(q("[data-pulse-ring]"), { autoAlpha: 0, scale: 0.85, transformOrigin: "50% 50%" });
        gsap.set(q("[data-pulse-node]"), { autoAlpha: 0, scale: 0 });
        gsap.set([q('[data-pulse-panel="deals"]'), q('[data-pulse-panel="sellers"]')], { autoAlpha: 0, y: 22 });

        const introEl = document.documentElement;
        const introState = introEl.getAttribute("data-mabco-intro");
        if (introState === "show") {
          introObserver = new MutationObserver(() => {
            const s = introEl.getAttribute("data-mabco-intro");
            if (s === "done" || s === "skip") {
              introObserver.disconnect();
              introObserver = null;
              if (introFallback) clearTimeout(introFallback);
              runAssembly();
            }
          });
          introObserver.observe(introEl, { attributes: true, attributeFilter: ["data-mabco-intro"] });
          introFallback = setTimeout(runAssembly, 6000);
        } else {
          requestAnimationFrame(() => requestAnimationFrame(runAssembly));
        }
      }

      // --- observers / listeners ----------------------------------------
      const io = new IntersectionObserver(
        ([entry]) => {
          pauseRef.current.offscreen = !entry.isIntersecting;
          setAmbientActive(computeVisible());
          refreshAuto();
        },
        { threshold: 0.15 }
      );
      io.observe(root);

      const onVisibility = () => {
        pauseRef.current.hidden = document.hidden;
        setAmbientActive(computeVisible());
        refreshAuto();
      };
      const onEnter = () => {
        pauseRef.current.hover = true;
        clearAuto();
      };
      const onLeave = () => {
        pauseRef.current.hover = false;
        refreshAuto();
      };
      const onFocusIn = () => {
        pauseRef.current.focus = true;
        clearAuto();
      };
      const onFocusOut = (e) => {
        if (!root.contains(e.relatedTarget)) {
          pauseRef.current.focus = false;
          refreshAuto();
        }
      };

      document.addEventListener("visibilitychange", onVisibility);
      root.addEventListener("pointerenter", onEnter);
      root.addEventListener("pointerleave", onLeave);
      root.addEventListener("focusin", onFocusIn);
      root.addEventListener("focusout", onFocusOut);

      return () => {
        mountedRef.current = false;
        clearAuto();
        if (introFallback) clearTimeout(introFallback);
        introObserver?.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        root.removeEventListener("pointerenter", onEnter);
        root.removeEventListener("pointerleave", onLeave);
        root.removeEventListener("focusin", onFocusIn);
        root.removeEventListener("focusout", onFocusOut);
        ambientRef.current = [];
      };
    },
    // Crossing the hero's breakpoint tears this sequence down or brings it back.
    { scope: rootRef, dependencies: [enabled], revertOnUpdate: true }
  );

  const select = useCallback((index, isManual = true) => {
    apiRef.current?.select?.(index, isManual);
  }, []);

  return { activeIndex, dealsIndex, sellersIndex, busy, select };
}
