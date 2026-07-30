"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaRegStar, FaStar, FaStarHalfStroke } from "react-icons/fa6";
import { FiCheck, FiHeart, FiShoppingCart } from "react-icons/fi";

import { useToast } from "@/components/ui/Toaster/ToastProvider";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/i18n/LocaleProvider";
import ProductMediaCarousel from "../ProductMediaCarousel/ProductMediaCarousel";
import { discountPercent } from "../data/catalog";
import { cardMediaFor } from "../data/productCardMedia";
import styles from "./ShopProductCard.module.css";

const formatPrice = (value) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const BADGE_CLASS = {
  new: styles.badgeNew,
  sale: styles.badgeSale,
  bestseller: styles.badgeBest,
  trending: styles.badgeTrending,
};

const BADGE_KEY = {
  new: "shop.badges.new",
  sale: "shop.badges.sale",
  bestseller: "shop.badges.bestSeller",
  trending: "shop.badges.trending",
};

/** Five stars supporting halves, so 4.5 does not read as 4. */
function Stars({ rating }) {
  return (
    <span className={styles.stars} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => {
        const position = i + 1;
        if (rating >= position) return <FaStar key={i} />;
        if (rating >= position - 0.5) return <FaStarHalfStroke key={i} />;
        return <FaRegStar key={i} />;
      })}
    </span>
  );
}

/**
 * Shop grid card. Every visual element degrades safely: missing imagery falls
 * back to the shared AssetImage placeholder, and the title only becomes a link
 * when the product actually has a detail route.
 */
export default function ShopProductCard({ product, view = "grid", priority = false }) {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const timerRef = useRef(null);

  const { title, brand, price, oldPrice, rating, reviews, badge, stock, meta, detailHref } =
    product;

  const discount = discountPercent(product);
  const soldOut = stock === "out";
  // Falls back to the product's single catalogue image when it has no extra views.
  const cardMedia = cardMediaFor(product);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleAdd = useCallback(() => {
    addItem(product, { quantity: 1 });
    // The toast region is already a live region, so the card does not announce
    // separately — that would read the same event twice.
    showToast({ message: t("shop.card.addedAnnouncement", { title }), tone: "success" });

    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1600);
  }, [addItem, product, showToast, t, title]);

  const stockLabel = soldOut
    ? t("shop.stock.out")
    : stock === "low"
      ? t("shop.stock.low")
      : t("shop.stock.in");

  return (
    /* One card, two compositions. The markup is identical in both views so there
       is never a duplicated product tree to keep in sync or hide from assistive
       technology — only the layout class changes. */
    <article
      className={`${styles.card} ${view === "list" ? styles.cardList : ""} ${soldOut ? styles.cardSoldOut : ""}`.trim()}
    >
      <div className={styles.media}>
        {/* Products with extra real views browse in place; a single-image product
            renders exactly the static image it did before. */}
        <ProductMediaCarousel
          images={cardMedia}
          alt={title}
          sizes={view === "list" ? "200px" : "(max-width: 599px) 92vw, (max-width: 899px) 46vw, (max-width: 1259px) 31vw, 280px"}
          priority={priority}
          placeholderLabel={title}
          wrapperClassName={styles.mediaStage}
          imageClassName={styles.mediaImage}
        />

        <div className={styles.badges}>
          {badge ? (
            <span className={`${styles.badge} ${BADGE_CLASS[badge]}`}>{t(BADGE_KEY[badge])}</span>
          ) : null}
          {discount > 0 ? (
            // dir="ltr" keeps the leading minus in front of the number under RTL,
            // where bidi reordering would otherwise render "-14%" as "14%-".
            <span className={`${styles.badge} ${styles.badgeDiscount}`} dir="ltr">
              -{discount}%
            </span>
          ) : null}
        </div>

        <button
          type="button"
          className={`${styles.wishlist} ${wished ? styles.wishlistOn : ""}`.trim()}
          onClick={() => setWished((value) => !value)}
          aria-pressed={wished}
          aria-label={t(wished ? "shop.card.wishlistRemove" : "shop.card.wishlistAdd", { title })}
        >
          <FiHeart aria-hidden="true" />
        </button>
      </div>

      <div className={styles.body}>
        <p className={styles.brand}>{brand}</p>

        <h3 className={styles.title}>
          {detailHref ? (
            <Link href={detailHref} className={styles.titleLink}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>

        <p className={styles.meta}>{meta}</p>

        <p className={styles.rating}>
          <Stars rating={rating} />
          <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
          <span className="visually-hidden">{t("product.ratedOutOf", { rating })}</span>
          <span className={styles.reviews}>({reviews})</span>
        </p>

        <p className={`${styles.stock} ${styles[`stock${stock}`] ?? ""}`.trim()}>{stockLabel}</p>

        <div className={styles.footer}>
          <p className={styles.priceRow}>
            <span className={styles.price}>{formatPrice(price)}</span>
            {oldPrice ? (
              <s className={styles.oldPrice}>
                <span className="visually-hidden">{t("product.previousPrice")} </span>
                {formatPrice(oldPrice)}
              </s>
            ) : null}
          </p>

          <button
            type="button"
            className={`${styles.cartButton} ${added ? styles.cartButtonAdded : ""}`.trim()}
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={t(soldOut ? "shop.card.soldOut" : "shop.card.addToCart", { title })}
          >
            {added ? <FiCheck aria-hidden="true" /> : <FiShoppingCart aria-hidden="true" />}
          </button>
        </div>

      </div>
    </article>
  );
}
