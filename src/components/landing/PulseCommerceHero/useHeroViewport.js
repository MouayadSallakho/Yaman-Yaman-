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

const readMode = () =>
  window.matchMedia(HERO_DESKTOP_QUERY).matches ? "desktop" : "mobile";

/**
 * Which composition's motion should be running: `"desktop"`, `"mobile"`, or
 * `"unknown"` while the answer is still a server guess.
 *
 * Both compositions are always in the markup — CSS decides which is visible, so
 * neither side can shift layout or flash the wrong one. This hook exists so the
 * matching composition's GSAP work is the *only* one that runs: without it the
 * desktop sequence would keep auto-rotating collections and tweening a
 * `display: none` subtree on every phone.
 *
 * WHY THERE IS A THIRD STATE
 * --------------------------
 * A media query cannot be evaluated on the server, and React reuses the server
 * snapshot for the hydration render. When that snapshot claimed `"desktop"`, the
 * first client commit on a phone claimed it too — and the desktop sequence's
 * `useGSAP` runs on that commit, setting its whole timeline up against a tree
 * CSS had already hidden. Profiling a production build at 390x844 measured 178
 * of 360 `getComputedStyle` calls (49%) landing on that hidden subtree, 128 of
 * them on Category Reactor nodes alone, before the store corrected itself and
 * the timeline was reverted. Phones paid for both compositions; desktops paid
 * for one.
 *
 * Answering `"unknown"` until the client has been asked means neither sequence
 * starts against a guess. The correct one starts on the next commit.
 *
 * This is safe precisely because the value never reaches the markup: both
 * sequence hooks use it only to gate their `useGSAP` body, and the state they
 * return (`activeIndex` and friends) is plain `useState`, identical either way.
 * Server and client HTML stay byte-identical — no hydration mismatch, no
 * wrong-composition flash, and the CSS gate keeps owning visibility.
 *
 * Mounted after hydration (a client-side navigation), there is no server
 * snapshot to reuse and the real mode is available on the first commit.
 */
export function useHeroMode() {
  return useSyncExternalStore(
    typeof window === "undefined" ? EMPTY_SUBSCRIBE : subscribe,
    readMode,
    () => "unknown"
  );
}
