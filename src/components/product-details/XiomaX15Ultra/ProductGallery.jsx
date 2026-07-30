"use client";

import { useCallback, useRef } from "react";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { useTranslation } from "@/i18n/LocaleProvider";
import useProductFancybox from "./useProductFancybox";
import useProductGallery from "./useProductGallery";
import useProductOrbitGalleryMotion, {
  VISIBLE_DISTANCE,
  ringOffset,
  slotName,
} from "./useProductOrbitGalleryMotion";
import styles from "./XiomaX15Ultra.module.css";

/**
 * One `sizes` value for every card on purpose: the slot a card occupies changes
 * constantly, and varying `sizes` per slot would make Next re-request a
 * different candidate on every move.
 */
const CARD_SIZES = "(max-width: 767px) 60vw, (max-width: 1179px) 34vw, 24vw";

export default function ProductGallery({ gallery }) {
  const { t, dir } = useTranslation();
  const controls = useProductGallery(gallery.length, dir);
  const openFancybox = useProductFancybox({ gallery, t, dir });

  const stageRef = useRef(null);
  const cardsRef = useRef([]);
  const liveRef = useRef(null);

  const { activeIndex, select, step, next, previous, onKeyDown } = controls;

  // Announce the image the deck actually landed on, not every frame it passed.
  const onSettle = useCallback((index) => {
    const item = gallery[index];
    if (!liveRef.current || !item) return;
    liveRef.current.textContent = t("productDemo.gallery.selectImage", {
      index: index + 1,
      label: t(item.altKey),
    });
  }, [gallery, t]);

  useProductOrbitGalleryMotion({
    stageRef,
    cardsRef,
    count: gallery.length,
    activeIndex,
    dir,
    onNavigate: step,
    onSettle,
  });

  /**
   * Two-stage behaviour: a side card travels to the centre, and only the card
   * already at the centre opens the full-size gallery.
   */
  const onCardClick = useCallback((index) => {
    const stage = stageRef.current;
    // A click that ends a drag is not a click on the card.
    if (stage?.dataset.dragConsumed) {
      delete stage.dataset.dragConsumed;
      return;
    }
    if (index === activeIndex) openFancybox(index, cardsRef.current[index]);
    else select(index);
  }, [activeIndex, openFancybox, select]);

  return (
    <section className={styles.galleryShell} aria-label={t("productDemo.gallery.regionLabel")} data-product-gallery>
      <div
        ref={stageRef}
        className={styles.galleryStage}
        tabIndex={0}
        role="group"
        aria-roledescription={t("productDemo.gallery.carousel")}
        aria-label={t("productDemo.gallery.keyboardHelp")}
        onKeyDown={onKeyDown}
      >
        <div className={styles.stageGlow} aria-hidden="true" />
        <div className={styles.stageOrbit} aria-hidden="true" />
        <div className={styles.stageOrbitSecondary} aria-hidden="true" />
        <span className={styles.counter}>
          {String(activeIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
        </span>

        {/* Every item stays mounted and keyed by identity, so a card can travel
            between slots instead of being unmounted and re-created elsewhere. */}
        {gallery.map((item, index) => {
          const offset = ringOffset(index, activeIndex, gallery.length);
          const slot = slotName(offset);
          const hidden = Math.abs(offset) > VISIBLE_DISTANCE;
          const isActive = index === activeIndex;
          return (
            <button
              key={item.id}
              ref={(node) => { cardsRef.current[index] = node; }}
              type="button"
              className={styles.galleryPanel}
              data-slot={slot}
              data-active={isActive || undefined}
              // The stage handles arrow keys and the rail below is a tablist, so
              // only the centre card is a tab stop — no stack of hidden ones.
              tabIndex={isActive ? 0 : -1}
              aria-hidden={hidden || undefined}
              onClick={() => onCardClick(index)}
              aria-label={
                isActive
                  ? t("productDemo.gallery.openImage", { index: index + 1, label: t(item.altKey) })
                  : t("productDemo.gallery.selectImage", { index: index + 1, label: t(item.altKey) })
              }
              data-product-gallery-panel
            >
              <AssetImage
                src={item.src}
                alt={t(item.altKey)}
                fill
                sizes={CARD_SIZES}
                fit={item.fit || "contain"}
                priority={index === 0}
                placeholderLabel={t(item.altKey)}
                /* With the card shell gone there is nothing to contain a failed
                   asset's fallback, so the raw path is suppressed here — a
                   missing image degrades to a clean label, never a file path
                   printed over the stage. */
                showPath={false}
                wrapperClassName={styles.panelMedia}
                className={styles.panelImage}
                imageProps={{ style: { transform: `scale(${item.scale || 1})` } }}
              />
            </button>
          );
        })}

        <button type="button" className={`${styles.galleryArrow} ${styles.previousArrow}`} onClick={(event) => { event.stopPropagation(); previous(); }} aria-label={t("productDemo.gallery.previous")}>
          <span aria-hidden="true">{dir === "rtl" ? "›" : "‹"}</span>
        </button>
        <button type="button" className={`${styles.galleryArrow} ${styles.nextArrow}`} onClick={(event) => { event.stopPropagation(); next(); }} aria-label={t("productDemo.gallery.next")}>
          <span aria-hidden="true">{dir === "rtl" ? "‹" : "›"}</span>
        </button>
        {/* No permanent "drag to explore" label: the visible neighbouring images,
            the arrows, the grab cursor and the live drag response communicate the
            affordance without instructional furniture. Drag itself is unchanged. */}
      </div>

      <span ref={liveRef} className={styles.liveRegion} aria-live="polite" role="status" />

      {/* Selecting a view moves focus onto its thumbnail, so the rail handles the
          same arrow keys as the stage to keep keyboard navigation going. */}
      <div className={styles.thumbnailRail} role="tablist" aria-label={t("productDemo.gallery.thumbnailLabel")} onKeyDown={onKeyDown}>
        {gallery.map((item, index) => (
          <button
            key={item.id}
            type="button"
            ref={(node) => { controls.thumbnailRefs.current[index] = node; }}
            className={`${styles.thumbnail} ${index === activeIndex ? styles.thumbnailActive : ""}`}
            role="tab"
            aria-selected={index === activeIndex}
            tabIndex={index === activeIndex ? 0 : -1}
            // Selecting brings the image to the centre; inspecting it full size
            // is the deliberate second step on the active card.
            onClick={() => select(index)}
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

      <button type="button" className={styles.openGalleryButton} onClick={(event) => openFancybox(activeIndex, event.currentTarget)}>
        <span aria-hidden="true">⌕</span>{t("productDemo.gallery.openFull")}
      </button>
    </section>
  );
}
