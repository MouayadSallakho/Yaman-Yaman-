"use client";

import Link from "next/link";
import { MdArrowForwardIos } from "react-icons/md";

import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./SectionHeader.module.css";

/**
 * Shared landing-section header: one h2 per section plus an optional
 * "View all" link to a real route. The chevron flips automatically under RTL
 * because the icon is a directional cue (see globals.css [dir="rtl"] rule).
 */
export default function SectionHeader({ id, title, viewAllHref }) {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {viewAllHref ? (
        <Link href={viewAllHref} className={styles.viewAll}>
          {t("common.actions.viewAll")}
          <MdArrowForwardIos aria-hidden="true" className={styles.viewAllIcon} />
        </Link>
      ) : null}
    </div>
  );
}
