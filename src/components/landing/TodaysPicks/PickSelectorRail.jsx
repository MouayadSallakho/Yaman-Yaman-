"use client";

import { useRef } from "react";
import { FiCheck } from "react-icons/fi";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import styles from "./TodaysPicksSection.module.css";

export default function PickSelectorRail({ picks, activeId, onSelect, t, dir }) {
  const tabRefs = useRef([]);
  const activeIndex = picks.findIndex((item) => item.id === activeId);

  const focusAndSelect = (index) => {
    const normalized = (index + picks.length) % picks.length;
    tabRefs.current[normalized]?.focus();
    onSelect(picks[normalized].id);
  };

  const handleKeyDown = (event) => {
    let nextIndex = activeIndex;
    const direction = dir === "rtl" ? -1 : 1;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = activeIndex + direction;
        break;
      case "ArrowLeft":
        nextIndex = activeIndex - direction;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = picks.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    focusAndSelect(nextIndex);
  };

  return (
    <div
      className={styles.selectorRail}
      role="tablist"
      aria-label={t("commerce.todaysPicks.selectorLabel")}
      onKeyDown={handleKeyDown}
      data-todays-picks-rail
    >
      {picks.map((pick, index) => {
        const selected = pick.id === activeId;
        return (
          <button
            key={pick.id}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            id={`todays-picks-tab-${pick.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="todays-picks-panel"
            tabIndex={selected ? 0 : -1}
            className={`${styles.selectorItem} ${selected ? styles.selectorItemActive : ""}`.trim()}
            onClick={() => onSelect(pick.id)}
            data-todays-picks-selector
          >
            <AssetImage
              src={pick.imageSrc}
              alt=""
              fill
              /* 96px, not 64px: this project's image optimizer rejects w=64
                 with a 400, so the thumbnail would fall back to a placeholder.
                 96 also covers the 56px box at 2x DPR. */
              sizes="96px"
              fit="contain"
              wrapperClassName={styles.selectorMedia}
              className={styles.selectorImage}
              placeholderLabel={pick.name}
              showPath={false}
              imageProps={{
                style: {
                  objectPosition: pick.objectPosition,
                  transform: `scale(${Math.min(pick.imageScale, 1.08)})`,
                },
              }}
            />

            {/* Two flowing rows instead of four fixed grid tracks. The old
                `auto 60px 1fr auto` layout gave the fixed columns priority, so
                at the rail's minimum track width the name column collapsed to
                ~8px and every title rendered as one or two characters. Here the
                only fixed element is the thumbnail; the copy takes the rest and
                the name is allowed two lines. */}
            <span className={styles.selectorCopy}>
              <span className={styles.selectorTopLine}>
                <span className={styles.selectorNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.selectorCategory}>{t(pick.categoryKey)}</span>
              </span>
              <strong className={styles.selectorName}>{pick.name}</strong>
              <small className={styles.selectorLabel}>{t(pick.recommendationKey)}</small>
            </span>

            <span className={styles.selectedMark} aria-hidden="true">
              <FiCheck />
            </span>
            {selected ? (
              <span className="visually-hidden">{t("commerce.todaysPicks.selected")}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
