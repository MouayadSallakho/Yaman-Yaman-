"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiMonitor, FiMoon, FiSun } from "react-icons/fi";

import { useAppearance } from "@/context/AppearanceContext";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./AppearanceToggle.module.css";

const ICONS = {
  light: FiSun,
  system: FiMonitor,
  dark: FiMoon,
};

/**
 * Desktop header control for appearance.
 *
 * A popover rather than a cycle-through button: with three states, a single
 * toggle cannot show which one is active, and "System" is impossible to
 * discover by clicking. The trigger shows the RESOLVED icon (what you are
 * looking at) while the list shows which PREFERENCE is selected.
 *
 * Mirrors ThemeSwitcher's popover behaviour so the two header controls next to
 * each other behave identically.
 */
export default function AppearanceToggle({ className = "" }) {
  const { preference, resolved, setAppearance, appearances } = useAppearance();
  const { t, dir } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const labelId = useId();
  const popoverId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const selectedIndex = Math.max(
      0,
      appearances.findIndex((item) => item.id === preference)
    );
    const frame = window.requestAnimationFrame(() => {
      optionRefs.current[selectedIndex]?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, preference, appearances]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onFocusIn = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (next) => {
    setAppearance(next);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

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

  // What the user is currently looking at, not what they picked.
  const TriggerIcon = resolved === "dark" ? FiMoon : FiSun;

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${className}`.trim()}
        aria-label={t("appearance.chooseAppearance")}
        aria-expanded={open}
        aria-controls={popoverId}
        aria-haspopup="dialog"
        title={t("appearance.chooseAppearance")}
        onClick={() => setOpen((current) => !current)}
      >
        <TriggerIcon aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={popoverId}
          className={styles.popover}
          role="dialog"
          aria-labelledby={labelId}
        >
          <div className={styles.heading}>
            <span id={labelId}>{t("appearance.label")}</span>
          </div>

          <div className={styles.options} role="radiogroup" aria-labelledby={labelId}>
            {appearances.map((option, index) => {
              const Icon = ICONS[option.id];
              const selected = preference === option.id;
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
                  onClick={() => choose(option.id)}
                  onKeyDown={(event) => moveFocus(event, index)}
                >
                  <Icon className={styles.optionIcon} aria-hidden="true" />
                  <span className={styles.optionLabel}>{t(option.labelKey)}</span>
                  <span className={styles.check} aria-hidden="true">
                    {selected ? <FiCheck /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
