"use client";

import { useSyncExternalStore } from "react";

/**
 * The hero's composition breakpoint.
 *
 * At and above this width the accepted desktop three-column hero is in charge;
 * below it the mobile arc composition takes over. It matches the existing
 * `max-width: 1199px` boundary already used throughout the hero's stylesheets,
 * so CSS visibility and JS behaviour switch on exactly the same line.
 */
export const HERO_DESKTOP_QUERY = "(min-width: 1200px)";

const EMPTY_SUBSCRIBE = () => () => {};

function subscribe(onChange) {
  const mql = window.matchMedia(HERO_DESKTOP_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * Whether the desktop hero composition is the active one.
 *
 * Both compositions are always in the markup — CSS decides which is visible, so
 * neither side can shift layout or flash the wrong one. This hook exists so the
 * matching composition's GSAP work is the *only* one that runs: without it the
 * desktop sequence would keep auto-rotating collections and tweening a
 * `display:none` subtree on every phone.
 *
 * Renders `true` on the server, which keeps the desktop hero's behaviour
 * byte-for-byte what it was before the mobile composition existed.
 */
export function useIsDesktopHero() {
  return useSyncExternalStore(
    typeof window === "undefined" ? EMPTY_SUBSCRIBE : subscribe,
    () => window.matchMedia(HERO_DESKTOP_QUERY).matches,
    () => true
  );
}
