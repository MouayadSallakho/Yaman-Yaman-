"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  DEFAULT_THEME,
  THEMES,
  THEME_EVENT,
  THEME_STORAGE_KEY,
  normalizeTheme,
} from "@/theme/config";

const ThemeContext = createContext(null);
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getClientSnapshot() {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return normalizeTheme(document.documentElement.dataset.theme);
}

function writeThemeCookie(theme) {
  if (typeof document === "undefined") return;
  document.cookie = `${THEME_STORAGE_KEY}=${encodeURIComponent(
    theme
  )}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
}

function subscribe(callback) {
  if (typeof window === "undefined") return () => {};

  const onTheme = () => callback();
  const onStorage = (event) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    const next = normalizeTheme(event.newValue);
    document.documentElement.dataset.theme = next;
    writeThemeCookie(next);
    callback();
  };

  window.addEventListener(THEME_EVENT, onTheme);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(THEME_EVENT, onTheme);
    window.removeEventListener("storage", onStorage);
  };
}

export default function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
}) {
  const normalizedInitialTheme = normalizeTheme(initialTheme);
  const theme = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    () => normalizedInitialTheme
  );

  const setTheme = useCallback((requestedTheme) => {
    if (typeof document === "undefined") return;

    const next = normalizeTheme(requestedTheme);
    document.documentElement.dataset.theme = next;
    writeThemeCookie(next);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked by privacy settings. The cookie and root
      // data-theme attribute still preserve the selected appearance.
    }

    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, themes: THEMES }),
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider");
  return value;
}
