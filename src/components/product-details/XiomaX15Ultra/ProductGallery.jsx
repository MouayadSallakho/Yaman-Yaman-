"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { useTranslation } from "@/i18n/LocaleProvider";
import useProductFancybox from "./useProductFancybox";
import styles from "./XiomaX15Ultra.module.css";

/**
 * One `sizes` for every slide, deliberately.
 *
 * A slide's rendered width does not depend on which position it currently
 * occupies — Coverflow scales it with a transform, which does not change the
 * layout box. Varying `sizes` per slot would make Next re-request a different
 * candidate every time the deck moved, for no visual gain.
 */
const SLIDE_SIZES = "(max-width: 767px) 74vw, (max-width: 1179px) 46vw, 32vw";

/**
 * Coverflow tuned for product photography rather than the demo's abstract art.
 *
 * The demo's `rotate: 50` / `depth: 100` / `slideShadows: true` were tried first
 * and rejected on this content: 50 degrees skews a phone hard enough that the
 * chassis reads as bent, and the built-in slide shadows lay a grey wash over
 * white product backgrounds that looks like a dirty photo rather than depth.
 *
 *   rotate 26        still unmistakably Coverflow, but the device stays
 *                    readable as a straight object at the centre.
 *   depth 170        pushes the neighbours back further than the demo, which is
 *                    what buys the centre its dominance once rotation is down.
 *   scale 0.86       the main hierarchy lever. Side views stay large enough to
 *                    be identifiable as other angles, clearly subordinate.
 *   stretch 0        neighbours keep their own space instead of tucking under
 *                    the centre; with 8 real product views, overlap just hides
 *                    information.
 *   modifier 1       one unit of the above per step; higher values compounded
 *                    the rotation on the second neighbour into a sliver.
 *   slideShadows off both for the wash described above and because it is two
 *                    extra composited layers per slide on every frame.
 */
const COVERFLOW = {
  rotate: 26,
  stretch: 0,
  depth: 170,
  modifier: 1,
  scale: 0.86,
  slideShadows: false,
};

export default function ProductGallery({ gallery }) {
  const { t, dir } = useTranslation();
  const openFancybox = useProductFancybox({ gallery, t, dir });

  const swiperRef = useRef(null);
  const stageRef = useRef(null);
  const liveRef = useRef(null);
  const thumbnailRefs = useRef([]);

  /*
    Swiper owns the position; this mirrors it for the parts of the UI React has
    to render (the counter, the active thumbnail, the labels).
    `realIndex` — never the DOM slide index — is the canonical product-image
    index, so loop duplication cannot shift it.
  */
  const [activeIndex, setActiveIndex] = useState(0);
  const lastCount = gallery.length - 1;

  const announce = useCallback((index) => {
    const item = gallery[index];
    if (!liveRef.current || !item) return;
    liveRef.current.textContent = t("productDemo.gallery.selectImage", {
      index: index + 1,
      label: t(item.altKey),
    });
  }, [gallery, t]);

  const syncIndex = useCallback((swiper) => {
    setActiveIndex(swiper.realIndex);
    thumbnailRefs.current[swiper.realIndex]?.scrollIntoView?.({
      behavior: "smooth", inline: "nearest", block: "nearest",
    });
  }, []);

  /*
    EN <-> AR without remounting.

    `key={dir}` would throw the instance away and build a new one — the exact
    pattern that leaked observers elsewhere in this project. Swiper exposes a
    direction change as a first-class operation, so the live instance is
    retold its direction and keeps its slides, its listeners and its position.
  */
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;
    const target = dir === "rtl" ? "rtl" : "ltr";
    if (swiper.rtlTranslate === (target === "rtl")) return;
    swiper.changeLanguageDirection(target);
  }, [dir]);

  /*
    Intent, resolved by Swiper's own interaction state.

    Swiper only emits `click` when `allowClick` is still true, and it clears that
    flag itself as soon as a pointer sequence passes its drag threshold — so a
    completed drag cannot arrive here at all, and no timer is needed to guess
    whether a gesture "was really a tap".

    From there it is two-stage on purpose: a side view travels to the centre, and
    only the view already at the centre opens the full-size gallery.
  */
  const onSwiperClick = useCallback((swiper) => {
    const slide = swiper.clickedSlide;
    if (!slide) return;
    const index = Number(slide.dataset.imageIndex);
    if (!Number.isInteger(index)) return;

    if (index === swiper.realIndex) openFancybox(index, slide);
    else swiper.slideToLoop(index);
  }, [openFancybox]);

  const onKeyDown = useCallback((event) => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;
    // Arrows keep their on-screen meaning: in RTL "right" is the previous view.
    const rightIsNext = dir !== "rtl";
    if (event.key === "ArrowRight") {
      event.preventDefault();
      rightIsNext ? swiper.slideNext() : swiper.slidePrev();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      rightIsNext ? swiper.slidePrev() : swiper.slideNext();
    } else if (event.key === "Home") {
      event.preventDefault(); swiper.slideToLoop(0);
    } else if (event.key === "End") {
      event.preventDefault(); swiper.slideToLoop(lastCount);
    } else if (event.key === "Enter" || event.key === " ") {
      // The stage is the keyboard equivalent of clicking the centre image.
      event.preventDefault();
      openFancybox(swiper.realIndex, stageRef.current);
    }
  }, [dir, lastCount, openFancybox]);

  return (
    <section
      className={styles.galleryShell}
      aria-label={t("productDemo.gallery.regionLabel")}
      data-product-gallery
    >
      <div
        ref={stageRef}
        className={styles.galleryStage}
        tabIndex={0}
        role="group"
        aria-roledescription={t("productDemo.gallery.carousel")}
        aria-label={t("productDemo.gallery.keyboardHelp")}
        onKeyDown={onKeyDown}
      >
        <span className={styles.counter}>
          {String(activeIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
        </span>

        {/*
          `loop` is what produces the required first frame. With 8 views and the
          deck centred, image 08 sits left of image 01 and image 02 sits right of
          it, so the three spatial roles are readable before the visitor touches
          anything — and image 01 is still the active product image.
        */}
        <Swiper
          modules={[EffectCoverflow]}
          effect="coverflow"
          centeredSlides
          slidesPerView="auto"
          loop
          loopAdditionalSlides={2}
          speed={480}
          grabCursor
          watchSlidesProgress
          threshold={4}
          coverflowEffect={COVERFLOW}
          className={styles.coverflow}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          onRealIndexChange={syncIndex}
          onSlideChangeTransitionEnd={(swiper) => announce(swiper.realIndex)}
          onClick={onSwiperClick}
        >
          {gallery.map((item, index) => {
            const isActive = index === activeIndex;
            /*
              Only the three views that can be on screen at first paint are
              fetched up front: the centre is the LCP candidate and gets
              `priority`, its two neighbours are eager but unpreloaded, and the
              remaining five stay lazy until the deck reaches them.
            */
            const eager = index === 1 || index === lastCount;
            return (
              <SwiperSlide
                key={item.id}
                className={styles.coverSlide}
                data-image-index={index}
              >
                <AssetImage
                  src={item.src}
                  alt={t(item.altKey)}
                  fill
                  sizes={SLIDE_SIZES}
                  fit={item.fit || "contain"}
                  priority={index === 0}
                  placeholderLabel={t(item.altKey)}
                  showPath={false}
                  wrapperClassName={styles.coverMedia}
                  className={styles.coverImage}
                  imageProps={{
                    ...(index === 0 ? {} : { loading: eager ? "eager" : "lazy" }),
                    style: { transform: `scale(${item.scale || 1})` },
                    "aria-hidden": isActive ? undefined : "true",
                  }}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>

        <button
          type="button"
          className={`${styles.galleryArrow} ${styles.previousArrow}`}
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label={t("productDemo.gallery.previous")}
        >
          <span aria-hidden="true">{dir === "rtl" ? "›" : "‹"}</span>
        </button>
        <button
          type="button"
          className={`${styles.galleryArrow} ${styles.nextArrow}`}
          onClick={() => swiperRef.current?.slideNext()}
          aria-label={t("productDemo.gallery.next")}
        >
          <span aria-hidden="true">{dir === "rtl" ? "‹" : "›"}</span>
        </button>
      </div>

      <span ref={liveRef} className={styles.liveRegion} aria-live="polite" role="status" />

      {/*
        The rail is kept: with eight views it is the only control that reaches a
        specific angle in one action, and it doubles as the position indicator.
        That is also why no Swiper bullet pagination was added — the counter above
        and this rail already state where the visitor is, and a third indicator
        would be the "contradictory pagination" case.
      */}
      <div
        className={styles.thumbnailRail}
        role="tablist"
        aria-label={t("productDemo.gallery.thumbnailLabel")}
        onKeyDown={onKeyDown}
      >
        {gallery.map((item, index) => (
          <button
            key={item.id}
            type="button"
            ref={(node) => { thumbnailRefs.current[index] = node; }}
            className={`${styles.thumbnail} ${index === activeIndex ? styles.thumbnailActive : ""}`}
            role="tab"
            aria-selected={index === activeIndex}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => swiperRef.current?.slideToLoop(index)}
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

      <button
        type="button"
        className={styles.openGalleryButton}
        onClick={(event) => openFancybox(activeIndex, event.currentTarget)}
      >
        <span aria-hidden="true">⌕</span>{t("productDemo.gallery.openFull")}
      </button>
    </section>
  );
}
