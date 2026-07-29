"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import TechnoLogo from "@/components/brand/TechnoLogo/TechnoLogo";

import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  normalizeLocale,
} from "./config";
import { createTranslator } from "./translate";
import styles from "./LocaleProvider.module.css";

const LocaleContext = createContext(null);

/**
 * Root client boundary for i18n. Receives the server-resolved locale + active
 * dictionary as props (so only ONE locale is shipped to the client and the
 * first paint already matches <html lang/dir> — no hydration flash). Exposes
 * translation + a polished, reduced-motion-aware language transition.
 *
 * @param {{ locale: "en"|"ar", dir: "ltr"|"rtl", dict: object, children: React.ReactNode }} props
 */
export default function LocaleProvider({ locale, dir, dict, children }) {
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);

  const overlayRef = useRef(null);
  const markRef = useRef(null);
  const switchingRef = useRef(false);
  const tlRef = useRef(null);
  const timerRef = useRef(null);

  const t = useMemo(() => createTranslator(dict, locale), [dict, locale]);

  const finish = useCallback(() => {
    switchingRef.current = false;
    setIsSwitching(false);
    // Return focus to a stable landmark (the trigger may have re-rendered).
    const target =
      document.querySelector("[data-lang-switcher]") ||
      document.getElementById("main-content");
    target?.focus?.({ preventScroll: true });
  }, []);

  const switchLocale = useCallback(
    (target) => {
      const next = normalizeLocale(target);
      if (next === locale || switchingRef.current) return; // no-op / de-bounce

      switchingRef.current = true;
      setIsSwitching(true);

      // Persist the explicit choice (SSR-readable on the next request).
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;

      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      // Reduced motion (or no overlay): switch immediately, no directional slide.
      if (reduce || !overlayRef.current) {
        router.refresh();
        timerRef.current = window.setTimeout(finish, 80);
        return;
      }

      // Directional veil: outgoing content exits toward the current reading
      // direction; the incoming mark enters from the opposite side.
      const outX = dir === "rtl" ? 26 : -26;
      const inX = dir === "rtl" ? -26 : 26;
      if (markRef.current) {
        markRef.current.textContent = LOCALE_SHORT_LABELS[next];
      }

      tlRef.current?.kill();
      tlRef.current = gsap
        .timeline({ onComplete: finish })
        .set(overlayRef.current, { visibility: "visible" })
        .fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.16, ease: "power2.out" }
        )
        .fromTo(
          markRef.current,
          { opacity: 0, x: inX },
          { opacity: 1, x: 0, duration: 0.18, ease: "power2.out" },
          "<"
        )
        // Navigate while the veil covers the page (prevents any flash).
        .add(() => router.refresh(), 0.18)
        .to(markRef.current, { opacity: 0, x: outX, duration: 0.14, ease: "power2.in" }, "+=0.08")
        .to(overlayRef.current, { opacity: 0, duration: 0.18, ease: "power2.in" }, "<")
        .set(overlayRef.current, { visibility: "hidden" });
    },
    [locale, dir, router, finish]
  );

  // Clean up any in-flight animation / timer on unmount.
  useEffect(
    () => () => {
      tlRef.current?.kill();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  const value = useMemo(
    () => ({
      locale,
      dir,
      t,
      isSwitching,
      switchLocale,
      locales: LOCALES,
      labels: LOCALE_LABELS,
      shortLabels: LOCALE_SHORT_LABELS,
    }),
    [locale, dir, t, isSwitching, switchLocale]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
      <div
        ref={overlayRef}
        className={styles.overlay}
        aria-hidden="true"
        style={{ visibility: "hidden", opacity: 0 }}
      >
        <span className={styles.mark} ref={markRef} />
        <TechnoLogo
          variant="light"
          decorative
          className={styles.brandLogo}
          sizes="(max-width: 575px) 150px, 230px"
        />
      </div>
    </LocaleContext.Provider>
  );
}

/** Access locale state + the language switch action. */
export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

/** Access the translator. `const { t } = useTranslation();` */
export function useTranslation() {
  const { t, locale, dir } = useLocale();
  return { t, locale, dir };
}
