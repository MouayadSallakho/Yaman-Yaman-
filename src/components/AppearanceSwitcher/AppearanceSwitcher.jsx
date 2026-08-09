"use client";

import { useId, useRef } from "react";
import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";

import { useAppearance } from "@/context/AppearanceContext";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./AppearanceSwitcher.module.css";

const ICONS = {
  light: FiSun,
  system: FiMonitor,
  dark: FiMoon,
};

/**
 * Light / System / Dark segmented control.
 *
 * This selects a PREFERENCE, not a rendered appearance. `System` stays visibly
 * selected while the OS flips the page between light and dark - the resolved
 * value is exposed to assistive technology through the option's accessible
 * name, never by moving the selection.
 *
 * Implemented as a real radiogroup with roving tabindex so the whole control is
 * one tab stop and arrows move within it, which is what a segmented control is
 * expected to do.
 */
export default function AppearanceSwitcher({ className = "" }) {
  const { preference, resolved, setAppearance, appearances } = useAppearance();
  const { t, dir } = useTranslation();
  const labelId = useId();
  const optionRefs = useRef([]);

  const moveFocus = (event, index) => {
    const count = appearances.length;
    const horizontalStep = dir === "rtl" ? -1 : 1;
    let next = index;

    if (event.key === "ArrowRight") next = (index + horizontalStep + count) % count;
    else if (event.key === "ArrowLeft") next = (index - horizontalStep + count) % count;
    else if (event.key === "ArrowDown") next = (index + 1) % count;
    else if (event.key === "ArrowUp") next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;

    event.preventDefault();
    const target = appearances[next];
    if (!target) return;
    setAppearance(target.id);
    optionRefs.current[next]?.focus({ preventScroll: true });
  };

  return (
    <section className={`${styles.root} ${className}`.trim()}>
      <h2 className={styles.label} id={labelId}>
        {t("appearance.label")}
      </h2>

      <div className={styles.group} role="radiogroup" aria-labelledby={labelId}>
        {appearances.map((option, index) => {
          const Icon = ICONS[option.id];
          const selected = preference === option.id;
          /* Only the System option needs the resolved value spoken; Light and
             Dark already say exactly what they do. */
          const accessibleName =
            option.id === "system"
              ? t(
                  resolved === "dark"
                    ? "appearance.systemResolvedDark"
                    : "appearance.systemResolvedLight"
                )
              : t(option.labelKey);

          return (
            <button
              key={option.id}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={accessibleName}
              tabIndex={selected ? 0 : -1}
              className={`${styles.option} ${selected ? styles.selected : ""}`}
              onClick={() => setAppearance(option.id)}
              onKeyDown={(event) => moveFocus(event, index)}
            >
              <Icon aria-hidden="true" />
              <span>{t(option.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
