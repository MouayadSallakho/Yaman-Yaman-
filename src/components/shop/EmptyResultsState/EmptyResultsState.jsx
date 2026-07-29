"use client";

import { FiSearch } from "react-icons/fi";

import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./EmptyResultsState.module.css";

/**
 * Shown when the active filters match nothing. Always offers the way out, so a
 * dead end is never a dead end.
 */
export default function EmptyResultsState({ onClearAll }) {
  const { t } = useTranslation();

  return (
    <div className={styles.empty}>
      <span className={styles.icon} aria-hidden="true">
        <FiSearch />
      </span>
      <h3 className={styles.title}>{t("shop.empty.title")}</h3>
      <p className={styles.text}>{t("shop.empty.text")}</p>
      <button type="button" className={styles.action} onClick={onClearAll}>
        {t("shop.filters.clearAll")}
      </button>
    </div>
  );
}
