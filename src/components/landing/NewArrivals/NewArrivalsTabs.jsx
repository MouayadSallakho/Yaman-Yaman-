"use client";

import { useRef } from "react";

import styles from "./NewArrivalsSection.module.css";

export default function NewArrivalsTabs({
  collections,
  activeId,
  onSelect,
  t,
}) {
  const tabRefs = useRef([]);
  const activeIndex = collections.findIndex((item) => item.id === activeId);

  const focusAndSelect = (index) => {
    const normalized = (index + collections.length) % collections.length;
    const next = collections[normalized];
    tabRefs.current[normalized]?.focus();
    onSelect(next.id);
  };

  const handleKeyDown = (event) => {
    let nextIndex = activeIndex;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = activeIndex + 1;
        break;
      case "ArrowLeft":
        nextIndex = activeIndex - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = collections.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    focusAndSelect(nextIndex);
  };

  return (
    <div
      className={styles.tabs}
      role="tablist"
      aria-label={t("commerce.newArrivals.tabsLabel")}
      onKeyDown={handleKeyDown}
    >
      {collections.map((collection, index) => {
        const selected = collection.id === activeId;
        return (
          <button
            key={collection.id}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`new-arrivals-tab-${collection.id}`}
            aria-selected={selected}
            aria-controls="new-arrivals-panel"
            tabIndex={selected ? 0 : -1}
            className={`${styles.tab} ${selected ? styles.tabActive : ""}`.trim()}
            onClick={() => onSelect(collection.id)}
          >
            {t(collection.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
