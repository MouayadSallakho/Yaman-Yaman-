"use client";

import { useMemo, useState } from "react";

import Toast from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/i18n/LocaleProvider";
import { formatPrice } from "./data";
import styles from "./XiomaX15Ultra.module.css";

export default function ProductPurchasePanel({ product }) {
  const { t, locale } = useTranslation();
  const { addItem } = useCart();
  const [storage, setStorage] = useState(product.defaultStorage);
  const [color, setColor] = useState(product.defaultColor);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState("");

  const selectedStorage = useMemo(
    () => product.storageOptions.find((item) => item.id === storage) || product.storageOptions[0],
    [product.storageOptions, storage]
  );
  const selectedColor = product.colors.find((item) => item.id === color) || product.colors[0];
  const previousPrice = selectedStorage.price + 200;
  const savingsPercent = Math.round(((previousPrice - selectedStorage.price) / previousPrice) * 100);

  return (
    <aside className={styles.purchasePanel} aria-labelledby="xioma-product-title" data-product-purchase>
      <div className={styles.purchaseHeader}>
        <span className={styles.releaseBadge}>{t("productDemo.badge")}</span>
        <button
          type="button"
          className={styles.wishlistButton}
          aria-label={t("productDemo.purchase.wishlistDemo")}
          onClick={() => setToast(t("productDemo.purchase.wishlistDemo"))}
        >
          <span aria-hidden="true">♡</span>
        </button>
      </div>

      <div className={styles.productIdentity}>
        <p className={styles.brandLabel}>{product.brand}</p>
        <h1 id="xioma-product-title">{product.name}</h1>
        <p className={styles.tagline}>{t("productDemo.tagline")}</p>
      </div>

      <a className={styles.ratingRow} href="#product-details" aria-label={t("productDemo.ratingLabel", { rating: product.rating, count: product.reviewCount })}>
        <span className={styles.stars} aria-hidden="true">★★★★★</span>
        <strong>{product.rating}</strong>
        <span>{t("productDemo.reviewCount", { count: product.reviewCount })}</span>
      </a>

      <div className={styles.priceBlock}>
        <strong>{formatPrice(selectedStorage.price, locale)}</strong>
        <del>{formatPrice(previousPrice, locale)}</del>
        <span>{t("productDemo.purchase.savePercent", { percent: savingsPercent })}</span>
      </div>

      <fieldset className={styles.optionGroup}>
        <legend>{t("productDemo.purchase.storage")}</legend>
        <div className={styles.storageOptions}>
          {product.storageOptions.map((option) => (
            <label key={option.id} className={`${styles.storageOption} ${option.id === storage ? styles.optionSelected : ""}`}>
              <input type="radio" name="xioma-storage" value={option.id} checked={option.id === storage} onChange={() => setStorage(option.id)} />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.optionGroup}>
        <legend>{t("productDemo.purchase.color")}: <strong>{t(selectedColor.labelKey)}</strong></legend>
        <div className={styles.colorOptions}>
          {product.colors.map((option) => (
            <label
              key={option.id}
              className={`${styles.colorOption} ${option.id === color ? styles.colorSelected : ""} ${!option.available ? styles.colorUnavailable : ""}`}
              title={!option.available ? t("productDemo.purchase.colorUnavailable") : t(option.labelKey)}
            >
              <input type="radio" name="xioma-color" value={option.id} checked={option.id === color} disabled={!option.available} onChange={() => setColor(option.id)} />
              <span style={{ backgroundColor: option.hex }} aria-hidden="true" />
              <em>{t(option.labelKey)}</em>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.quantityAndStatus}>
        <div>
          <span className={styles.controlLabel}>{t("productDemo.purchase.quantity")}</span>
          <div className={styles.quantityControl}>
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label={t("productDemo.purchase.decreaseQuantity")}>−</button>
            <output aria-live="polite">{quantity}</output>
            <button type="button" onClick={() => setQuantity((value) => Math.min(product.stockLimit, value + 1))} disabled={quantity >= product.stockLimit} aria-label={t("productDemo.purchase.increaseQuantity")}>+</button>
          </div>
        </div>
        <p className={styles.stockStatus}><span aria-hidden="true" />{t("productDemo.purchase.inStock")}</p>
      </div>

      <div className={styles.purchaseActions}>
        <button
          type="button"
          className={styles.addToCart}
          onClick={() => {
            // Adds to the same canonical cart the header and /cart read, with the
            // chosen configuration so each variant is its own cart line.
            addItem(
              {
                id: "xioma-x15-ultra-5g",
                title: product.name,
                image: product.gallery?.[0]?.src,
                price: selectedStorage.price,
                stock: "in",
                detailHref: "/products/xioma-x15-ultra",
              },
              {
                quantity,
                options: { storage: selectedStorage.label, color: t(selectedColor.labelKey) },
              }
            );
            setToast(t("productDemo.purchase.demoAdded", { quantity, storage: selectedStorage.label }));
          }}
        >
          <span aria-hidden="true">▣</span>{t("productDemo.purchase.addToCart")}
        </button>
        <button type="button" className={styles.buyNow} onClick={() => setToast(t("productDemo.purchase.checkoutDemo"))}>{t("productDemo.purchase.buyNow")}</button>
        <p>{t("productDemo.purchase.demoDisclosure")}</p>
      </div>

      <div className={styles.trustRow} aria-label={t("productDemo.trust.regionLabel")}>
        <div><span aria-hidden="true">⇢</span><strong>{t("productDemo.trust.shipping.title")}</strong><small>{t("productDemo.trust.shipping.copy")}</small></div>
        <div><span aria-hidden="true">↺</span><strong>{t("productDemo.trust.returns.title")}</strong><small>{t("productDemo.trust.returns.copy")}</small></div>
        <div><span aria-hidden="true">▣</span><strong>{t("productDemo.trust.secure.title")}</strong><small>{t("productDemo.trust.secure.copy")}</small></div>
      </div>

      <ul className={styles.featureList}>
        {product.featureKeys.map((key) => <li key={key}><span aria-hidden="true">✓</span>{t(key)}</li>)}
      </ul>
      <Toast message={toast} onClose={() => setToast("")} />
    </aside>
  );
}
