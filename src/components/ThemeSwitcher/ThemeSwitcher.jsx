"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiDroplet } from "react-icons/fi";

import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./ThemeSwitcher.module.css";

export default function ThemeSwitcher({ mode = "popover", onSelect }) {
  const { theme, setTheme, themes } = useTheme();
  const { t, dir } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const labelId = useId();
  const popoverId = useId();

  useEffect(() => {
    if (!open || mode !== "popover") return undefined;
    const selectedIndex = Math.max(
      0,
      themes.findIndex((item) => item.id === theme)
    );
    const frame = window.requestAnimationFrame(() => {
      optionRefs.current[selectedIndex]?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, mode, theme, themes]);

  useEffect(() => {
    if (!open || mode !== "popover") return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onFocusIn = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, mode]);

  const choose = (next) => {
    setTheme(next);
    onSelect?.();
    if (mode === "popover") {
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    }
  };

  const moveFocus = (event, index) => {
    const count = themes.length;
    const horizontalStep = dir === "rtl" ? -1 : 1;
    let next = index;

    if (event.key === "ArrowRight") {
      next = (index + horizontalStep + count) % count;
    } else if (event.key === "ArrowLeft") {
      next = (index - horizontalStep + count) % count;
    } else if (event.key === "ArrowDown") {
      next = (index + 1) % count;
    } else if (event.key === "ArrowUp") {
      next = (index - 1 + count) % count;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = count - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTheme = themes[next];
    if (!nextTheme) return;
    setTheme(nextTheme.id);
    optionRefs.current[next]?.focus({ preventScroll: true });
  };

  const options = (
    <div
      className={styles.options}
      role="radiogroup"
      aria-labelledby={labelId}
    >
      {themes.map((item, index) => {
        const selected = theme === item.id;
        return (
          <button
            key={item.id}
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={`${styles.option} ${selected ? styles.selected : ""}`}
            onClick={() => choose(item.id)}
            onKeyDown={(event) => moveFocus(event, index)}
          >
            <span className={styles.swatches} aria-hidden="true">
              {item.swatches.map((swatch) => (
                <i key={swatch} style={{ backgroundColor: swatch }} />
              ))}
            </span>
            <span className={styles.optionLabel}>{t(item.labelKey)}</span>
            <span className={styles.check} aria-hidden="true">
              {selected ? <FiCheck /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );

  if (mode === "inline") {
    return (
      <section className={styles.inline} aria-labelledby={labelId}>
        <div className={styles.inlineHeading}>
          <FiDroplet aria-hidden="true" />
          <h2 id={labelId}>{t("theme.chooseTheme")}</h2>
        </div>
        {options}
      </section>
    );
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={t("theme.chooseTheme")}
        aria-expanded={open}
        aria-controls={popoverId}
        aria-haspopup="dialog"
        title={t("theme.chooseTheme")}
        onClick={() => setOpen((current) => !current)}
      >
        <FiDroplet aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={popoverId}
          className={styles.popover}
          role="dialog"
          aria-labelledby={labelId}
        >
          <div className={styles.heading}>
            <span id={labelId}>{t("theme.chooseTheme")}</span>
            <small>{t("theme.currentTheme")}</small>
          </div>
          {options}
        </div>
      ) : null}
    </div>
  );
}
