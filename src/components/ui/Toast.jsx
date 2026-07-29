"use client";

import { useEffect } from "react";
import styles from "./Toast.module.css";
import { useTranslation } from "@/i18n/LocaleProvider";

export default function Toast({ message, onClose, duration = 2800 }) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={styles.toast}>
      <span>{message}</span>
      <button onClick={onClose} className={styles.closeBtn} aria-label={t("common.close")}>
        ✕
      </button>
    </div>
  );
}