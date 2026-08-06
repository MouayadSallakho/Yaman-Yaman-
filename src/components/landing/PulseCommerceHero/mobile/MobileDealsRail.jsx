"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaBolt, FaChevronRight } from "react-icons/fa6";

import "swiper/css";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { formatPrice } from "../data";
import { toPairedPages } from "./pairProducts";
import { RAIL_SWIPER_PROPS, syncRailToFocus, useRailDirection } from "./railConfig";
import styles from "./MobileDealsRail.module.css";

/**
 * One product card. `eager` marks the first card of the first page, which is the
 * mobile hero's LCP element now that the featured block is gone.
 */
function DealCard({ product, t, eager }) {
  return (
    <Link href={product.href} className={styles.card} data-m-deal-inner>
      <span className={styles.media}>
        <AssetImage
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 420px) 42vw, 220px"
          wrapperClassName={styles.asset}
          className={styles.image}
          placeholderLabel={product.title}
          placeholderTone="dark"
          showPath={false}
          priority={eager}
        />
        {product.discount ? (
          <span className={styles.badge}>-{product.discount}%</span>
        ) : null}
      </span>

      <span className={styles.title}>{product.title}</span>

      <span className={styles.priceRow}>
        <span className={styles.price}>{formatPrice(product.price)}</span>
        {product.oldPrice ? (
          <s className={styles.oldPrice}>
            <span className="visually-hidden">{t("product.previousPrice")} </span>
            {formatPrice(product.oldPrice)}
          </s>
        ) : null}
      </span>
    </Link>
  );
}

/**
 * Mobile "Deals of the Day" — a real Swiper rail paged two products at a time.
 *
 * Each slide is a page laid out as [ slot | spine corridor | slot ], so the
 * electric spine always runs through reserved empty space and the two cards stay
 * symmetric about it. No wishlist control: the catalogue has wishlist state but
 * no wishlist route (`WISHLIST_UI_ENABLED === false`), so a heart here would be
 * a dead affordance.
 *
 * GSAP only ever animates `[data-m-deal-inner]` — never the slide or the track,
 * which Swiper owns exclusively.
 *
 * @param {{
 *   deals: object[],
 *   viewAllHref: string,
 *   t: (key: string, vars?: object) => string,
 *   dir: "ltr"|"rtl",
 *   onSwiper: (swiper: import("swiper").Swiper) => void,
 * }} props
 */
export default function MobileDealsRail({ deals, viewAllHref, t, dir, onSwiper }) {
  const swiperRef = useRef(null);
  const [page, setPage] = useState(0);

  const handleSwiper = useCallback(
    (swiper) => {
      swiperRef.current = swiper;
      setPage(swiper.activeIndex);
      onSwiper(swiper);
    },
    [onSwiper]
  );

  const handleFocus = useCallback(
    (event) => syncRailToFocus(swiperRef.current)(event),
    []
  );

  const handleSlideChange = useCallback((swiper) => {
    setPage(swiper.activeIndex);
  }, []);

  // Reconfigure the live instance instead of remounting it — see railConfig.
  useRailDirection(swiperRef, dir);

  if (!deals.length) return null;
  const pages = toPairedPages(deals);

  return (
    <section
      className={styles.rail}
      aria-labelledby="m-pulse-deals-heading"
      data-m-stage="deals"
      onFocus={handleFocus}
    >
      <div className={styles.head}>
        <h2 id="m-pulse-deals-heading" className={styles.heading}>
          <FaBolt aria-hidden="true" className={styles.headingIcon} />
          {t("commerce.dealsTitle")}
        </h2>
        <Link href={viewAllHref} className={styles.viewAll}>
          <span>{t("common.actions.viewAll")}</span>
          <FaChevronRight
            aria-hidden="true"
            className={dir === "rtl" ? styles.flip : undefined}
          />
        </Link>
      </div>

      <Swiper
        {...RAIL_SWIPER_PROPS}
        /*
          Deliberately NOT keyed by `dir`.

          Keying it remounted the whole rail on every language change, and the
          discarded instance's ResizeObserver was never disconnected: measured
          in place on the homepage, ResizeObservers climbed 2 -> 42 across
          twenty locale switches (exactly two per switch, one per rail) with the
          heap tracking them linearly. `useRailDirection` below reconfigures the
          live instance through Swiper's own `changeLanguageDirection`, so the
          direction still changes exactly once and nothing is thrown away.
        */
        dir={dir}
        onSwiper={handleSwiper}
        onSlideChange={handleSlideChange}
        className={styles.swiper}
        wrapperTag="ul"
        aria-label={t("commerce.dealsTitle")}
      >
        {pages.map((pair, pageIndex) => (
          <SwiperSlide key={pageIndex} tag="li" className={styles.slide}>
            <span className={styles.page}>
              <span className={styles.slot}>
                <DealCard product={pair[0]} t={t} eager={pageIndex === 0} />
              </span>
              {/*
                The middle track is the spine's reserved corridor. It is a real
                (empty) grid item rather than an implicit gap, so auto-placement
                puts the second card in column 3 — and it mirrors correctly in
                RTL without any column-number arithmetic.
              */}
              <span className={styles.corridor} />
              <span className={styles.slot}>
                {pair[1] ? <DealCard product={pair[1]} t={t} /> : null}
              </span>
            </span>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Visual progress only: every card is reachable with Tab on any page, so
          this carries no interaction and is hidden from assistive tech. */}
      {pages.length > 1 ? (
        <span className={styles.dots} aria-hidden="true">
          {pages.map((_, i) => (
            <span
              key={i}
              className={styles.dot}
              data-active={i === page ? "true" : "false"}
            />
          ))}
        </span>
      ) : null}
    </section>
  );
}
