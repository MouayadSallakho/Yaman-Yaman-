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
 * UX policy: play once per browser session, skip immediately for reduced-motion
 * users, and always release the pre-paint scroll lock during cleanup.
 */
export default function LandingExperience() {
  const [introActive, setIntroActive] = useState(true);
  const activeRef = useRef(true);

  const finishIntro = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    try {
      sessionStorage.setItem("mabco-intro-seen", "1");
    } catch {
      /* storage may be unavailable in privacy modes */
    }
    if (document.documentElement.getAttribute(ATTR) !== "skip") {
      setIntroState("done");
    }
    setIntroActive(false);
  }, []);

  useIsoLayoutEffect(() => {
    let shouldSkip = prefersReducedMotion();
    try {
      shouldSkip = shouldSkip || sessionStorage.getItem("mabco-intro-seen") === "1";
    } catch {
      /* use motion preference only */
    }

    if (shouldSkip || document.documentElement.getAttribute(ATTR) !== "show") {
      setIntroState("skip");
      finishIntro();
      return;
    }

    setIntroState("show");
  }, [finishIntro]);

  useEffect(() => () => setIntroState("skip"), []);

  return introActive ? <CinematicIntro onComplete={finishIntro} /> : null;
}
