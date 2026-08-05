"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import CinematicIntro from "../Intro/CinematicIntro";

const ATTR = "data-mabco-intro";

// useLayoutEffect on the client (runs before the browser paints the committed
// DOM → flash-free client-side navigation), useEffect on the server (avoids the
// "useLayoutEffect does nothing on the server" warning).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const prefersReducedMotion = () => {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};

const setIntroState = (value) => {
  try {
    document.documentElement.setAttribute(ATTR, value);
  } catch {
    /* document unavailable — nothing to gate */
  }
};

/**
 * Coordinates a flash-free cinematic intro for the homepage.
 *
 * PHASES
 * ------
 * The component moves strictly forward through `checking → intro → content`, or
 * `checking → content` when the intro is not due. It can never go back: once
 * `content` is committed, nothing re-enables the intro. That one-way rule is
 * what makes an unrelated re-render — a locale change, a hero state update, a
 * Strict Mode double-invoke — unable to replay the intro over a page the user is
 * already reading.
 *
 * The first paint is owned by CSS via `data-mabco-intro`, which the server
 * renders as `checking` and the root layout's boot script resolves before
 * hydration. This component never decides the *first* frame; it reads the
 * resolved state, drives GSAP and reports completion.
 *
 * UX policy (unchanged): play once per browser session, skip immediately for
 * reduced-motion users, only on a full load of `/`, and always release the
 * pre-paint scroll lock during cleanup.
 */
export default function LandingExperience() {
  const [phase, setPhase] = useState("checking");

  // Mirrors `phase` for the callbacks, which must not be re-created (and must not
  // capture a stale value) when the phase moves on.
  const phaseRef = useRef("checking");
  const resolvedRef = useRef(false);

  const commitContent = useCallback(() => {
    if (phaseRef.current === "content") return;
    phaseRef.current = "content";
    setPhase("content");
  }, []);

  const finishIntro = useCallback(() => {
    if (phaseRef.current === "content") return;
    try {
      sessionStorage.setItem("mabco-intro-seen", "1");
    } catch {
      /* storage may be unavailable in privacy modes */
    }
    if (document.documentElement.getAttribute(ATTR) !== "skip") {
      setIntroState("done");
    }
    commitContent();
  }, [commitContent]);

  useIsoLayoutEffect(() => {
    /*
      Two separate concerns, and conflating them is a trap.

      Eligibility is decided exactly once — re-deciding it later is precisely how
      the intro could come back over content the user is already reading.

      The DOM gate, though, must be re-asserted on every run. In development
      Strict Mode mounts, runs the cleanup below (which parks the attribute at
      `skip`) and mounts again; without this the second run would early-return and
      leave the intro mounted but hidden by CSS, so it would never play at all.
    */
    if (resolvedRef.current) {
      if (phaseRef.current === "intro") setIntroState("show");
      return;
    }
    resolvedRef.current = true;

    const state = document.documentElement.getAttribute(ATTR);

    // `checking` means the boot script did not run (scripting blocked it, or it
    // threw). Resolve it here rather than leaving the page hidden behind the
    // neutral frame.
    if (state === "checking") {
      let due = !prefersReducedMotion() && window.location.pathname === "/";
      try {
        due = due && sessionStorage.getItem("mabco-intro-seen") !== "1";
      } catch {
        /* motion preference and path are enough to decide */
      }
      if (due) {
        setIntroState("show");
        phaseRef.current = "intro";
        setPhase("intro");
      } else {
        setIntroState("skip");
        commitContent();
      }
      return;
    }

    if (state === "show") {
      phaseRef.current = "intro";
      setPhase("intro");
      return;
    }

    // Already skipped or already done — go straight to content.
    setIntroState(state === "done" ? "done" : "skip");
    commitContent();
  }, [commitContent]);

  // Leaving the page must not strand the scroll lock or the neutral frame.
  useEffect(() => () => setIntroState("skip"), []);

  return phase === "intro" ? <CinematicIntro onComplete={finishIntro} /> : null;
}
