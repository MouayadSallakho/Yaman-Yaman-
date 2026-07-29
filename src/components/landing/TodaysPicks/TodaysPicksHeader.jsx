"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

import { TODAYS_PICKS_VIEW_ALL_HREF } from "./data";
import styles from "./TodaysPicksSection.module.css";

export default function TodaysPicksHeader({ t, count }) {
  return (
    <header className={styles.header}>
      <div className={styles.headingGroup} data-todays-picks-header>
        <span className={styles.eyebrow}>
          <HiSparkles aria-hidden="true" />
          {t("commerce.todaysPicks.badge")}
        </span>
        <h2 id="todays-picks-title" className={styles.title}>
          {t("commerce.todaysPicks.title")}
        </h2>
        <p className={styles.subtitle}>{t("commerce.todaysPicks.subtitle")}</p>
      </div>

      <div className={styles.headerActions} data-todays-picks-header>
        <span className={styles.dailyEdit}>
          <span className={styles.dailyDot} aria-hidden="true" />
          {t("commerce.todaysPicks.dailyEdit", { count })}
        </span>
        <Link href={TODAYS_PICKS_VIEW_ALL_HREF} className={styles.viewAll}>
          <span>{t("commerce.todaysPicks.viewAll")}</span>
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
