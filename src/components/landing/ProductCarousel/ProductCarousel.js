"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";

import "swiper/css";

import ProductCard from "../ProductCard/ProductCard";

const DEFAULT_BREAKPOINTS = {
  0: { slidesPerView: 1.15, spaceBetween: 12 },
  480: { slidesPerView: 2.15, spaceBetween: 12 },
  768: { slidesPerView: 3, spaceBetween: 14 },
  992: { slidesPerView: 4, spaceBetween: 14 },
  1200: { slidesPerView: 5, spaceBetween: 14 },
};

/**
 * Product carousel used by the landing sections. No autoplay: users
 * drag, swipe or use the keyboard. Slides are whole cards from the
 * shared ProductCard system.
 */
export default function ProductCarousel({ products, label, breakpoints }) {
  return (
    <Swiper
      modules={[A11y, Keyboard]}
      a11y={{ containerRoleDescriptionMessage: "carousel", itemRoleDescriptionMessage: "slide" }}
      keyboard={{ enabled: true, onlyInViewport: true }}
      aria-label={label}
      grabCursor
      watchOverflow
      speed={450}
      breakpoints={breakpoints ?? DEFAULT_BREAKPOINTS}
    >
      {products.map((product) => (
        <SwiperSlide key={product.id} style={{ height: "auto" }}>
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
