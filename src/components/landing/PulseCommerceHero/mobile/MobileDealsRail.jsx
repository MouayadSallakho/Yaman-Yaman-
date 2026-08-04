"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaBolt, FaChevronRight } from "react-icons/fa6";

import "swiper/css";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { formatPrice } from "../data";
import { RAIL_SWIPER_PROPS, syncRailToFocus } from "./railConfig";
import styles from "./MobileDealsRail.module.css";

/**
 * Mobile "Deals of the Day" — a real Swiper rail.
 *
 * One card reads as primary with the next partially previewed, so the rail
 * announces itself as swipeable without shrinking cards to fit. No wishlist
 * control: the catalogue has wishlist state but no wishlist route
 * (`WISHLIST_UI_ENABLED === false`), so the approved image's heart would be a
 * dead affordance.
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

  if (!deals.length) return null;

  return (
    <section
      className={styles.rail}
      aria-labelledby="m-pulse-deals-heading"
      data-m-stage="deals"
      // On the section, not on <Swiper>: Swiper's React wrapper does not forward
      // DOM handlers to its container. Focus bubbles here either way.
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
        // `key` on dir makes Swiper rebuild for the new reading direction rather
        // than keeping a stale RTL/LTR track.
        key={dir}
        dir={dir}
        onSwiper={handleSwiper}
        className={styles.swiper}
        wrapperTag="ul"
        aria-label={t("commerce.dealsTitle")}
      >
        {deals.map((product, index) => (
          <SwiperSlide key={`${product.id}-${index}`} tag="li" className={styles.slide}>
            <Link href={product.href} className={styles.card} data-m-deal-inner>
              <span className={styles.media}>
                <AssetImage
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(max-width: 400px) 44vw, 190px"
                  wrapperClassName={styles.asset}
                  className={styles.image}
                  placeholderLabel={product.title}
                  placeholderTone="dark"
                  showPath={false}
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
                    <span className="visually-hidden">
                      {t("product.previousPrice")}{" "}
                    </span>
                    {formatPrice(product.oldPrice)}
                  </s>
                ) : null}
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
