"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiHeart, FiLock, FiShield, FiShoppingCart, FiTrash2 } from "react-icons/fi";

import ProductCarousel from "@/components/landing/ProductCarousel/ProductCarousel";
import { bestSellerProducts, suggestedProducts } from "@/components/landing/data/products";
import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { useToast } from "@/components/ui/Toaster/ToastProvider";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/i18n/LocaleProvider";
import {
  CartQuantityStepper,
  EmptyCartState,
  OptionPill,
  PromoCodeForm,
  SummaryRow,
} from "./CartUI";
import { CartPageSkeleton } from "./CartSkeleton";
import { WISHLIST_UI_ENABLED, formatMoney } from "./cartPricing";
import styles from "./CartPage.module.css";

/* -------------------------------------------------------------------- row */

function CartItemRow({ line, onQuantity, onRemove, onWishlist }) {
  const { t } = useTranslation();
  const options = [line.options?.storage, line.options?.color].filter(Boolean);

  return (
    <li className={styles.row}>
      <div className={styles.rowMedia}>
        <AssetImage
          src={line.image}
          alt={line.title}
          fill
          sizes="110px"
          showPath={false}
          placeholderLabel={line.title}
          wrapperClassName={styles.rowMediaStage}
          className={styles.rowImage}
        />
      </div>

      <div className={styles.rowInfo}>
        <p className={styles.rowTitle}>
          {line.detailHref ? (
            <Link href={line.detailHref} className={styles.rowLink}>
              {line.title}
            </Link>
          ) : (
            line.title
          )}
        </p>

        {options.length ? (
          <p className={styles.rowOptions}>
            {options.map((option) => (
              <OptionPill key={option}>{option}</OptionPill>
            ))}
          </p>
        ) : null}

        <p className={`${styles.rowStock} ${line.stock === "low" ? styles.rowStockLow : ""}`.trim()}>
          {t(line.stock === "low" ? "cart.lowStock" : "cart.inStock")}
        </p>

        <div className={styles.rowActions}>
          {WISHLIST_UI_ENABLED ? (
            <button type="button" className={styles.rowTextButton} onClick={() => onWishlist(line)}>
              <FiHeart aria-hidden="true" />
              <span>{t("cart.moveToWishlistShort")}</span>
            </button>
          ) : null}
          <button
            type="button"
            className={`${styles.rowTextButton} ${styles.rowRemove}`}
            onClick={() => onRemove(line)}
          >
            <FiTrash2 aria-hidden="true" />
            <span>{t("cart.removeShort")}</span>
          </button>
        </div>
      </div>

      <div className={styles.rowUnit}>
        <span className={styles.rowUnitPrice}>{formatMoney(line.price)}</span>
        <span className={styles.rowUnitLabel}>{t("cart.each")}</span>
      </div>

      <div className={styles.rowQuantity}>
        <CartQuantityStepper quantity={line.quantity} onChange={(next) => onQuantity(line.key, next)} />
      </div>

      <p className={styles.rowTotal}>{formatMoney(line.price * line.quantity)}</p>
    </li>
  );
}

/* ------------------------------------------------------- clear-cart dialog */

/**
 * Confirmation for the one destructive bulk action on this page. Native
 * confirm() is avoided so the dialog can be styled, translated, focus-trapped
 * and dismissed with Escape.
 */
function ClearCartDialog({ open, count, onCancel, onConfirm }) {
  const { t } = useTranslation();
  const cancelRef = useRef(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    // Focus lands on the least destructive control.
    cancelRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className={styles.dialogRoot}>
      <div className={styles.dialogBackdrop} onClick={onCancel} aria-hidden="true" />
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
      >
        <h2 id={titleId} className={styles.dialogTitle}>
          {t("cart.clearCartTitle")}
        </h2>
        <p id={bodyId} className={styles.dialogBody}>
          {t("cart.clearCartBody", { count })}
        </p>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.dialogCancel} onClick={onCancel} ref={cancelRef}>
            {t("cart.cancel")}
          </button>
          <button type="button" className={styles.dialogConfirm} onClick={onConfirm}>
            {t("cart.clearCartConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- page */

/**
 * Full cart page. Shares the exact cart state the drawer uses, so any change
 * made here is already reflected in the drawer and the header badge.
 */
export default function CartPageContent() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    lines,
    hydrated,
    totals,
    count,
    setQuantity,
    removeLine,
    restoreLine,
    clearCart,
    moveToWishlist,
    applyPromo,
    removePromo,
  } = useCart();

  const [clearOpen, setClearOpen] = useState(false);

  // The sticky mobile bar must not duplicate a checkout button that is already
  // on screen, so it yields whenever the summary CTA is visible.
  const summaryCtaRef = useRef(null);
  const [summaryCtaVisible, setSummaryCtaVisible] = useState(false);

  useEffect(() => {
    const node = summaryCtaRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => setSummaryCtaVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [lines.length]);

  const handleRemove = useCallback(
    (line) => {
      const snapshot = removeLine(line.key);
      if (!snapshot) return;
      showToast({
        message: t("cart.itemRemoved", { title: line.title }),
        actionLabel: t("cart.undo"),
        onAction: () => restoreLine(snapshot.line, snapshot.index),
      });
    },
    [removeLine, restoreLine, showToast, t]
  );

  const handleWishlist = useCallback(
    (line) => {
      moveToWishlist(line.key);
      showToast({ message: t("cart.movedToWishlist", { title: line.title }), tone: "success" });
    },
    [moveToWishlist, showToast, t]
  );

  const handleClear = useCallback(() => {
    clearCart();
    setClearOpen(false);
    showToast({ message: t("cart.cartCleared") });
  }, [clearCart, showToast, t]);

  // Same double-submit guard as the drawer; both CTAs disable together because
  // they share this one handler.
  const [isSubmitting, setSubmitting] = useState(false);
  const submitTimer = useRef(null);

  useEffect(() => () => { if (submitTimer.current) clearTimeout(submitTimer.current); }, []);

  const handleCheckout = useCallback(() => {
    if (isSubmitting) return;
    setSubmitting(true);
    showToast({ message: t("cart.checkoutNotConnected") });
    submitTimer.current = setTimeout(() => setSubmitting(false), 1200);
  }, [isSubmitting, showToast, t]);

  // Recommendations exclude whatever is already in the cart.
  const recommendations = useMemo(() => {
    const inCart = new Set(lines.map((line) => line.productId));
    return [...suggestedProducts, ...bestSellerProducts]
      .filter((product) => !inCart.has(product.id))
      .slice(0, 8);
  }, [lines]);

  const hasItems = lines.length > 0;

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label={t("cart.breadcrumbLabel")}>
          <Link href="/">{t("common.nav.home")}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{t("cart.shoppingCart")}</span>
        </nav>

        <header className={styles.header}>
          <span className={styles.headerIcon} aria-hidden="true">
            <FiShoppingCart />
          </span>
          <div>
            <h1 className={styles.title}>{t("cart.shoppingCart")}</h1>
            <p className={styles.subtitle}>
              {hasItems ? t("cart.itemsInCart", { count }) : t("cart.cartSubtitle")}
            </p>
          </div>
        </header>

        {!hydrated ? (
          <CartPageSkeleton />
        ) : !hasItems ? (
          <div className={styles.emptyCard}>
            <EmptyCartState />
          </div>
        ) : (
          <>
            <div className={styles.layout}>
              <section className={styles.main} aria-labelledby="cart-items-heading">
                <div className={styles.mainHeader}>
                  <h2 id="cart-items-heading" className={styles.mainTitle}>
                    {t("cart.itemsHeading")} <span>({count})</span>
                  </h2>
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={() => setClearOpen(true)}
                  >
                    <FiTrash2 aria-hidden="true" />
                    {t("cart.clearCart")}
                  </button>
                </div>

                <ul className={styles.rows}>
                  {lines.map((line) => (
                    <CartItemRow
                      key={line.key}
                      line={line}
                      onQuantity={setQuantity}
                      onRemove={handleRemove}
                      onWishlist={handleWishlist}
                    />
                  ))}
                </ul>

                <Link href="/products" className={styles.continue}>
                  <FiArrowLeft aria-hidden="true" className={styles.continueIcon} />
                  {t("cart.continueShopping")}
                </Link>
              </section>

              {/* Sticky on desktop; normal flow once the layout stacks. */}
              <aside className={styles.aside} aria-labelledby="order-summary-heading">
                <div className={styles.summaryCard}>
                  <h2 id="order-summary-heading" className={styles.summaryTitle}>
                    {t("cart.orderSummary")}
                  </h2>

                  <PromoCodeForm
                    appliedCode={totals.appliedCode}
                    discount={totals.discount}
                    onApply={applyPromo}
                    onRemove={removePromo}
                  />

                  <div className={styles.summaryRows}>
                    <SummaryRow label={t("cart.subtotal")} value={formatMoney(totals.subtotal)} />
                    {totals.discount > 0 ? (
                      <SummaryRow
                        label={t("cart.discount")}
                        value={`− ${formatMoney(totals.discount)}`}
                        tone="positive"
                      />
                    ) : null}
                    <SummaryRow
                      label={t("cart.shipping")}
                      value={totals.shipping === 0 ? t("cart.free") : formatMoney(totals.shipping)}
                      tone={totals.shipping === 0 ? "positive" : undefined}
                    />
                    <SummaryRow label={t("cart.total")} value={formatMoney(totals.total)} strong />
                  </div>

                  {totals.discount > 0 ? (
                    <p className={styles.savings}>
                      {t("cart.savings", { amount: formatMoney(totals.discount) })}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    className={styles.checkout}
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    ref={summaryCtaRef}
                  >
                    <FiLock aria-hidden="true" />
                    {t("cart.checkoutSecurely")}
                  </button>

                  <p className={styles.secureNote}>
                    <FiShield aria-hidden="true" />
                    {t("cart.secureNote")}
                  </p>
                </div>
              </aside>
            </div>

            {recommendations.length ? (
              <section className={styles.recommend} aria-labelledby="cart-recommend-heading">
                <div className={styles.recommendHeader}>
                  <h2 id="cart-recommend-heading" className={styles.recommendTitle}>
                    {t("cart.recommendedTitle")}
                  </h2>
                  <p className={styles.recommendSubtitle}>{t("cart.recommendedSubtitle")}</p>
                </div>
                <ProductCarousel
                  products={recommendations}
                  label={t("cart.recommendedTitle")}
                />
              </section>
            ) : null}

            {/* Mobile-only: keeps the total and the CTA reachable while scrolling. */}
            <div
              className={`${styles.mobileBar} ${summaryCtaVisible ? styles.mobileBarHidden : ""}`.trim()}
              data-cart-mobile-bar
            >
              <div className={styles.mobileBarInfo}>
                <span className={styles.mobileBarLabel}>{t("cart.total")}</span>
                <span className={styles.mobileBarTotal}>{formatMoney(totals.total)}</span>
              </div>
              <button type="button" className={styles.mobileBarCta} onClick={handleCheckout} disabled={isSubmitting}>
                {t("cart.checkoutSecurely")}
              </button>
            </div>
          </>
        )}
      </div>

      <ClearCartDialog
        open={clearOpen}
        count={count}
        onCancel={() => setClearOpen(false)}
        onConfirm={handleClear}
      />
    </main>
  );
}
