"use client";

import { useMemo } from "react";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { useTranslation } from "@/i18n/LocaleProvider";
import useProductFancybox from "./useProductFancybox";
import useProductGallery from "./useProductGallery";
import styles from "./XiomaX15Ultra.module.css";

const PANEL_OFFSETS = [-2, -1, 0, 1, 2];
const indexForOffset = (active, offset, count) => ((active + offset) % count + count) % count;

export default function ProductGallery({ gallery }) {
  const { t, dir } = useTranslation();
  const controls = useProductGallery(gallery.length, dir);
  const openFancybox = useProductFancybox({ gallery, t, dir });
  const visiblePanels = useMemo(
    () => PANEL_OFFSETS.map((offset) => ({ offset, index: indexForOffset(controls.activeIndex, offset, gallery.length) })),
    [controls.activeIndex, gallery.length]
  );

  function openAt(index, event) {
    if (controls.consumeDrag()) return;
    controls.select(index);
    openFancybox(index, event.currentTarget);
  }

  return (
    <section className={styles.galleryShell} aria-label={t("productDemo.gallery.regionLabel")} data-product-gallery>
      <div
        className={styles.galleryStage}
        tabIndex={0}
        role="group"
        aria-roledescription={t("productDemo.gallery.carousel")}
        aria-label={t("productDemo.gallery.keyboardHelp")}
        onKeyDown={controls.onKeyDown}
        onPointerDown={controls.onPointerDown}
        onPointerMove={controls.onPointerMove}
        onPointerUp={controls.onPointerUp}
        onPointerCancel={controls.onPointerUp}
      >
        <div className={styles.stageGlow} aria-hidden="true" />
        <div className={styles.stageOrbit} aria-hidden="true" />
        <div className={styles.stageOrbitSecondary} aria-hidden="true" />
        <span className={styles.counter} aria-live="polite">
          {String(controls.activeIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
        </span>

        {visiblePanels.map(({ offset, index }) => {
          const item = gallery[index];
          const slot = offset === 0 ? "center" : offset < 0 ? `left${Math.abs(offset)}` : `right${offset}`;
          return (
            <button
              key={`${item.id}-${offset}`}
              type="button"
              className={`${styles.galleryPanel} ${styles[slot]}`}
              onClick={(event) => openAt(index, event)}
              aria-label={t("productDemo.gallery.openImage", { index: index + 1, label: t(item.altKey) })}
              data-product-gallery-panel
            >
              <AssetImage
                src={item.src}
                alt={t(item.altKey)}
                fill
                sizes={offset === 0 ? "(max-width: 991px) 88vw, 42vw" : "16vw"}
                fit={item.fit || "contain"}
                priority={index === 0}
                placeholderLabel={t(item.altKey)}
                placeholderTone={offset === 0 ? "dark" : "light"}
                wrapperClassName={styles.panelMedia}
                className={styles.panelImage}
                imageProps={{ style: { transform: `scale(${item.scale || 1})` } }}
              />
              <span className={styles.panelCaption}>{t(item.captionKey)}</span>
            </button>
          );
        })}

        <button type="button" className={`${styles.galleryArrow} ${styles.previousArrow}`} onClick={(event) => { event.stopPropagation(); controls.previous(); }} aria-label={t("productDemo.gallery.previous")}>
          <span aria-hidden="true">{dir === "rtl" ? "›" : "‹"}</span>
        </button>
        <button type="button" className={`${styles.galleryArrow} ${styles.nextArrow}`} onClick={(event) => { event.stopPropagation(); controls.next(); }} aria-label={t("productDemo.gallery.next")}>
          <span aria-hidden="true">{dir === "rtl" ? "‹" : "›"}</span>
        </button>
        <div className={styles.dragHint} aria-hidden="true"><span>↔</span>{t("productDemo.gallery.drag")}</div>
      </div>

      {/* Selecting a view moves focus onto its thumbnail, so the rail handles the
          same arrow keys as the stage to keep keyboard navigation going. */}
      <div className={styles.thumbnailRail} role="tablist" aria-label={t("productDemo.gallery.thumbnailLabel")} onKeyDown={controls.onKeyDown}>
        {gallery.map((item, index) => (
          <button
            key={item.id}
            type="button"
            ref={(node) => { controls.thumbnailRefs.current[index] = node; }}
            className={`${styles.thumbnail} ${index === controls.activeIndex ? styles.thumbnailActive : ""}`}
            role="tab"
            aria-selected={index === controls.activeIndex}
            tabIndex={index === controls.activeIndex ? 0 : -1}
            onClick={(event) => { controls.select(index); openFancybox(index, event.currentTarget); }}
            aria-label={t("productDemo.gallery.selectImage", { index: index + 1, label: t(item.altKey) })}
          >
            <span className={styles.thumbnailNumber}>{String(index + 1).padStart(2, "0")}</span>
            <AssetImage
              src={item.src}
              alt=""
              fill
              sizes="96px"
              fit={item.fit || "contain"}
              placeholderLabel={t(item.captionKey)}
              showPath={false}
              wrapperClassName={styles.thumbnailMedia}
              className={styles.thumbnailImage}
              imageProps={{ style: { transform: `scale(${Math.min(item.scale || 1, 0.98)})` } }}
            />
          </button>
        ))}
      </div>

      <button type="button" className={styles.openGalleryButton} onClick={(event) => openFancybox(controls.activeIndex, event.currentTarget)}>
        <span aria-hidden="true">⌕</span>{t("productDemo.gallery.openFull")}
      </button>
    </section>
  );
}
