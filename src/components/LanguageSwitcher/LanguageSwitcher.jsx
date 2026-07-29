"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import styles from "./LanguageSwitcher.module.css";

/**
 * Accessible language switcher (segmented control) for the two supported
 * locales. Reused in desktop + mobile public navigation and the admin shell.
 *
 * - Semantic buttons in a labelled group; keyboard/Enter/Space work natively.
 * - The active locale is marked with `aria-pressed`; re-clicking it is a no-op.
 * - Disabled while a transition is running (prevents duplicate navigations).
 * - A polite live region announces the switch for screen-reader users.
 *
 * @param {{ onSwitch?: () => void }} props - optional hook to e.g. close the
 *   mobile menu when a language is chosen.
 */
export default function LanguageSwitcher({ onSwitch }) {
  const { locale, isSwitching, switchLocale, labels, shortLabels, t } =
    useLocale();

  const handle = (target) => {
    if (target === locale || isSwitching) return;
    onSwitch?.();
    switchLocale(target);
  };

  return (
    <div
      className={styles.group}
      role="group"
      aria-label={t("common.language.change")}
    >
      {(["en", "ar"]).map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            data-lang-switcher
            className={`${styles.option} ${active ? styles.active : ""}`}
            aria-pressed={active}
            disabled={isSwitching}
            lang={code}
            title={code === "ar" ? labels.ar : labels.en}
            onClick={() => handle(code)}
          >
            {shortLabels[code]}
          </button>
        );
      })}

      <span className={styles.srOnly} aria-live="polite">
        {isSwitching
          ? t("common.language.switchingTo", {
              name: locale === "en" ? labels.ar : labels.en,
            })
          : ""}
      </span>
    </div>
  );
}
