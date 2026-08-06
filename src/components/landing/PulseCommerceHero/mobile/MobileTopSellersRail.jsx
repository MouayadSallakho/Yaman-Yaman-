"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaFire, FaChevronRight, FaStar } from "react-icons/fa6";

import "swiper/css";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { formatPrice } from "../data";
import { toPairedPages } from "./pairProducts";
import { RAIL_SWIPER_PROPS, syncRailToFocus, useRailDirection } from "./railConfig";
import styles from "./MobileTopSellersRail.module.css";

function SellerCard({ product, rank, t }) {
  return (
    <Link
      href={product.href}
      className={styles.card}
      data-m-seller-inner
      data-rank={rank}
    >
      <span className={styles.rank}>
        <span aria-hidden="true">{rank}</span>
        <span className="visually-hidden">{t("commerce.rankLabel", { rank })}</span>
      </span>

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
  );
}

/**
 * Mobile "Top Sellers" — a paired-page Swiper rail that keeps its ranking.
 *
 * `wrapperTag="ol"` + `tag="li"` makes Swiper's own track the ordered list, so
 * the pages are the list items. Because a page holds two products, the rank is
 * carried explicitly on each card (badge + visually-hidden label) rather than
 * being inferred from list position — the ordering information is therefore
 * still complete and correct for assistive tech.
 *
 * A collection with an odd number of sellers ends on a page whose second slot is
 * intentionally empty, so the last product keeps its proper column beside the
 * spine corridor instead of being re-centred over it.
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

  if (!topSellers.length) return null;
  const pages = toPairedPages(topSellers);

  return (
    <section
      className={styles.rail}
      aria-labelledby="m-pulse-sellers-heading"
      data-m-stage="sellers"
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
        /* Not keyed by `dir` — see MobileDealsRail and railConfig for why. */
        dir={dir}
        onSwiper={handleSwiper}
        onSlideChange={handleSlideChange}
        className={styles.swiper}
        wrapperTag="ol"
        aria-label={t("commerce.topSellersTitle")}
      >
        {pages.map((pair, pageIndex) => (
          <SwiperSlide key={pageIndex} tag="li" className={styles.slide}>
            <span className={styles.page}>
              <span className={styles.slot}>
                <SellerCard product={pair[0]} rank={pageIndex * 2 + 1} t={t} />
              </span>
              {/* Reserved spine corridor — see MobileDealsRail for the rationale. */}
              <span className={styles.corridor} />
              <span className={styles.slot}>
                {pair[1] ? (
                  <SellerCard product={pair[1]} rank={pageIndex * 2 + 2} t={t} />
                ) : null}
              </span>
            </span>
          </SwiperSlide>
        ))}
      </Swiper>

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
