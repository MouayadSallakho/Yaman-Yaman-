"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaFire, FaChevronRight, FaStar } from "react-icons/fa6";

import "swiper/css";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { formatPrice } from "../data";
import { RAIL_SWIPER_PROPS, syncRailToFocus } from "./railConfig";
import styles from "./MobileTopSellersRail.module.css";

/**
 * Mobile "Top Sellers" — a real Swiper rail that keeps its ranking semantics.
 *
 * `wrapperTag="ol"` + `tag="li"` makes Swiper's own track the ordered list, so
 * the rank is conveyed structurally (and read out by assistive tech) rather
 * than living only in a decorative badge.
 *
 * GSAP only ever animates `[data-m-seller-inner]` — never the slide or track.
 *
 * @param {{
 *   topSellers: object[],
 *   viewAllHref: string,
 *   t: (key: string, vars?: object) => string,
 *   dir: "ltr"|"rtl",
 *   onSwiper: (swiper: import("swiper").Swiper) => void,
 * }} props
 */
export default function MobileTopSellersRail({
  topSellers,
  viewAllHref,
  t,
  dir,
  onSwiper,
}) {
  const swiperRef = useRef(null);

  const handleSwiper = useCallback(
    (swiper) => {
      swiperRef.current = swiper;
      onSwiper(swiper);
    },
    [onSwiper]
  );

  const handleFocus = useCallback(
    (event) => syncRailToFocus(swiperRef.current)(event),
    []
  );

  if (!topSellers.length) return null;

  return (
    <section
      className={styles.rail}
      aria-labelledby="m-pulse-sellers-heading"
      data-m-stage="sellers"
      // On the section, not on <Swiper>: Swiper's React wrapper does not forward
      // DOM handlers to its container. Focus bubbles here either way.
      onFocus={handleFocus}
    >
      <div className={styles.head}>
        <h2 id="m-pulse-sellers-heading" className={styles.heading}>
          <FaFire aria-hidden="true" className={styles.headingIcon} />
          {t("commerce.topSellersTitle")}
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
        key={dir}
        dir={dir}
        onSwiper={handleSwiper}
        className={styles.swiper}
        wrapperTag="ol"
        aria-label={t("commerce.topSellersTitle")}
      >
        {topSellers.map((product, index) => {
          const rank = index + 1;
          return (
            <SwiperSlide
              key={`${product.id}-${index}`}
              tag="li"
              className={styles.slide}
            >
              <Link
                href={product.href}
                className={styles.card}
                data-m-seller-inner
                data-rank={rank}
              >
                <span className={styles.rank}>
                  <span aria-hidden="true">{rank}</span>
                  <span className="visually-hidden">
                    {t("commerce.rankLabel", { rank })}
                  </span>
                </span>

                <span className={styles.media}>
                  <AssetImage
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 400px) 40vw, 180px"
                    wrapperClassName={styles.asset}
                    className={styles.image}
                    placeholderLabel={product.title}
                    placeholderTone="dark"
                    showPath={false}
                  />
                </span>

                <span className={styles.title}>{product.title}</span>

                <span className={styles.priceRow}>
                  <span className={styles.price}>{formatPrice(product.price)}</span>
                  {product.rating ? (
                    <span className={styles.rating}>
                      <FaStar aria-hidden="true" className={styles.ratingStar} />
                      <span aria-hidden="true">{product.rating}</span>
                      <span className="visually-hidden">
                        {t("product.ratedOutOf", { rating: product.rating })}
                      </span>
                    </span>
                  ) : null}
                </span>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
