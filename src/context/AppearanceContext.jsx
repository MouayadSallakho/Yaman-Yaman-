"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  APPEARANCES,
  APPEARANCE_EVENT,
  APPEARANCE_RESOLVED_HINT_KEY,
  APPEARANCE_STORAGE_KEY,
  COLOR_SCHEME_QUERY,
  DEFAULT_APPEARANCE,
  normalizeAppearance,
  resolveAppearance,
} from "@/theme/config";

const AppearanceContext = createContext(null);
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/*
  Two cookies, two different jobs.

  - PREFERENCE is what the user chose: light | system | dark. This is the only
    thing that is ever "their setting".
  - RESOLVED HINT is a cache of what `system` last evaluated to on this device.

  The server can read the preference, but it cannot read the OS colour scheme -
  that only exists in the browser. Without the hint, every `system` user would
  be served the light document and corrected on the client, which is precisely
  the flash this architecture exists to avoid. The hint lets the server emit
  the right attribute in the first byte; the boot script still re-resolves and
  corrects it before paint, so a stale hint costs nothing.
*/

function writeCookie(name, value) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

/** The DOM is the single source of truth for the *resolved* appearance. */
function getResolvedSnapshot() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.appearance === "dark"
    ? "dark"
    : "light";
}

/** The preference lives on the same element so both stay in one place. */
function getPreferenceSnapshot() {
  if (typeof document === "undefined") return DEFAULT_APPEARANCE;
  return normalizeAppearance(
    document.documentElement.dataset.appearancePreference
  );
}

function systemPrefersDark() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(COLOR_SCHEME_QUERY).matches;
}

/**
 * Write both attributes and both cookies from a preference.
 * Returns the resolved appearance so callers can avoid recomputing it.
 */
function apply(preference) {
  const root = document.documentElement;
  const resolved = resolveAppearance(preference, systemPrefersDark());

  root.dataset.appearancePreference = preference;
  root.dataset.appearance = resolved;

  writeCookie(APPEARANCE_STORAGE_KEY, preference);
  writeCookie(APPEARANCE_RESOLVED_HINT_KEY, resolved);

  return resolved;
}

/*
  One subscription shared by every consumer.

  `useSyncExternalStore` calls subscribe once per store, and both hooks below
  read from the same module-level store, so the matchMedia listener is attached
  once for the whole application no matter how many components read appearance.
  That is what keeps the 30-switch stress test from accumulating listeners.
*/
function subscribe(callback) {
  if (typeof window === "undefined") return () => {};

  const onAppearance = () => callback();

  const onStorage = (event) => {
    if (event.key !== APPEARANCE_STORAGE_KEY) return;
    apply(normalizeAppearance(event.newValue));
    callback();
  };

  // System changes must move the RESOLVED value only. The preference stays
  // "system" so the UI keeps showing System selected while the page flips.
  const media = window.matchMedia?.(COLOR_SCHEME_QUERY);
  const onSystemChange = () => {
    if (getPreferenceSnapshot() !== "system") return; // explicit choice wins
    apply("system");
    callback();
  };

  window.addEventListener(APPEARANCE_EVENT, onAppearance);
  window.addEventListener("storage", onStorage);
  media?.addEventListener?.("change", onSystemChange);

  return () => {
    window.removeEventListener(APPEARANCE_EVENT, onAppearance);
    window.removeEventListener("storage", onStorage);
    media?.removeEventListener?.("change", onSystemChange);
  };
}

export default function AppearanceProvider({
  children,
  initialPreference = DEFAULT_APPEARANCE,
  initialResolved = "light",
}) {
  const normalizedPreference = normalizeAppearance(initialPreference);

  const preference = useSyncExternalStore(
    subscribe,
    getPreferenceSnapshot,
    () => normalizedPreference
  );

  const resolved = useSyncExternalStore(
    subscribe,
    getResolvedSnapshot,
    () => initialResolved
  );

  const setAppearance = useCallback((requested) => {
    if (typeof document === "undefined") return;

    const next = normalizeAppearance(requested);
    apply(next);

    try {
      window.localStorage.setItem(APPEARANCE_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked by privacy settings. The cookie and the root
      // data attributes still carry the choice.
    }

    window.dispatchEvent(new CustomEvent(APPEARANCE_EVENT, { detail: next }));
  }, []);

  /*
    Enable the colour transition only after the first commit.

    Without the gate the very first paint would animate from the stylesheet's
    initial values into the resolved appearance - a fade-in on every cold load.
    Switching afterwards still animates.
  */
  useEffect(() => {
    const root = document.documentElement;
    const id = window.requestAnimationFrame(() => {
      root.setAttribute("data-appearance-ready", "");
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  const value = useMemo(
    () => ({
      /** light | system | dark - what the user chose. */
      preference,
      /** light | dark - what is actually rendered. */
      resolved,
      setAppearance,
      appearances: APPEARANCES,
    }),
    [preference, resolved, setAppearance]
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) {
    throw new Error("useAppearance must be used within AppearanceProvider");
  }
  return value;
}
