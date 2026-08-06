"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
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
  /*
    `isPending` is the authoritative "the new locale has not landed yet" signal.

    The veil used to be a fixed GSAP timeline that called `router.refresh()`
    partway through and then faded itself out on a wall clock, so the end of the
    animation had nothing to do with the end of the work. Measured on the
    production build at 390x844 / Fast 4G / 4x CPU, the veil lifted at 448-587ms
    while translated content did not arrive until 1739-3411ms — every run left a
    1.3-2.8s window in which the page was uncovered, the buttons were re-enabled
    and every word was still in the previous language. That window is the "stale
    UI" the switch was reported for; it is a timing bug, not a mechanism failure.
  */
  const [isPending, startTransition] = useTransition();

  const overlayRef = useRef(null);
  const markRef = useRef(null);
  const switchingRef = useRef(false);
  const tlRef = useRef(null);
  const timerRef = useRef(null);

  const t = useMemo(() => createTranslator(dict, locale), [dict, locale]);

  const finish = useCallback(() => {
    switchingRef.current = false;
    setIsSwitching(false);
    document.documentElement.removeAttribute("aria-busy");
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
      // Document-level busy state: the whole page is being re-rendered in
      // another language, and assistive technology should be told once rather
      // than hearing every translated element announce itself.
      document.documentElement.setAttribute("aria-busy", "true");

      // Persist the explicit choice (SSR-readable on the next request).
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;

      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      // Raise the veil, but never schedule its exit here — see the effect below.
      if (!reduce && overlayRef.current) {
        const inX = dir === "rtl" ? -26 : 26;
        if (markRef.current) {
          markRef.current.textContent = LOCALE_SHORT_LABELS[next];
        }
        tlRef.current?.kill();
        tlRef.current = gsap
          .timeline()
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
          );
      }

      /*
        The refresh is the transition. Wrapping it keeps `isPending` true until
        React has actually applied the server's re-render, which is the only
        moment at which the new dictionary, `html lang` and `html dir` all exist
        together.
      */
      startTransition(() => {
        router.refresh();
      });
    },
    [locale, dir, router]
  );

  /*
    Land the transition.

    By the time `isPending` clears, React has committed the server's re-render:
    the dictionary below is the new one and the root layout has already written
    the matching `lang` and `dir`. Only then is it safe to uncover the page, so
    there is no frame in which the old language is visible without the veil and
    no frame in which text and direction disagree.
  */
  useEffect(() => {
    if (!switchingRef.current || isPending) return undefined;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const overlay = overlayRef.current;
    tlRef.current?.kill();

    // No veil to retract (reduced motion still gets one, just instant): settle
    // on the next frame rather than synchronously, so the completion never
    // cascades a render out of this effect's body.
    if (!overlay) {
      const id = requestAnimationFrame(finish);
      return () => cancelAnimationFrame(id);
    }

    // The veil exits toward the reading direction that is now in force.
    const outX = dir === "rtl" ? 26 : -26;
    const markOut = reduce ? 0 : 0.14;
    const veilOut = reduce ? 0 : 0.18;

    tlRef.current = gsap
      .timeline({ onComplete: finish })
      .to(markRef.current, { opacity: 0, x: outX, duration: markOut, ease: "power2.in" })
      .to(overlay, { opacity: 0, duration: veilOut, ease: "power2.in" }, "<")
      .set(overlay, { visibility: "hidden" });

    return undefined;
  }, [isPending, dir, finish]);

  // Clean up any in-flight animation / timer on unmount, and never strand the
  // document in a busy state.
  useEffect(
    () => () => {
      tlRef.current?.kill();
      if (timerRef.current) window.clearTimeout(timerRef.current);
      document.documentElement.removeAttribute("aria-busy");
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
