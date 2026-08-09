"use client";

import { useSyncExternalStore } from "react";

/**
 * Hydration is a one-way door: it happens once and can never un-happen, so this
 * "store" has nothing to subscribe to and never notifies.
 */
const subscribe = () => () => {};
const hydrated = () => true;
const notHydrated = () => false;

/**
 * `false` while the markup is still inert, `true` from the first render after
 * this tree has been hydrated.
 *
 * Read through `useSyncExternalStore` rather than the usual mount-effect flag.
 * React uses `getServerSnapshot` for the server render *and* for the client's
 * hydration render, then re-renders as soon as hydration finishes — so the two
 * passes agree by construction (no mismatch, no flash of corrected markup) and
 * the value flips the instant it is genuinely safe, with no timer to guess at.
 *
 * Use it only for the narrow case it is meant for: a control that the server can
 * paint but cannot make work, which must not pretend to be operable in the
 * meantime. It is not a general "am I on the client" escape hatch — anything
 * gated on it is invisible to a visitor without JavaScript.
 */
export default function useHydrated() {
  return useSyncExternalStore(subscribe, hydrated, notHydrated);
}
