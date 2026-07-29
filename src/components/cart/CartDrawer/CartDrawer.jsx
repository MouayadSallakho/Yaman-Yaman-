"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FiHeart, FiLock, FiShield, FiTrash2 } from "react-icons/fi";

import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { useToast } from "@/components/ui/Toaster/ToastProvider";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/i18n/LocaleProvider";
import {
  CartQuantityStepper,
  EmptyCartState,
  IconCloseButton,
  OptionPill,
  PromoCodeForm,
  SummaryRow,
} from "../CartUI";
import { CartDrawerSkeleton } from "../CartSkeleton";
import { WISHLIST_UI_ENABLED, formatMoney } from "../cartPricing";
import styles from "./CartDrawer.module.css";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/* --------------------------------------------------------------- line item */

function CartDrawerItem({ line, onQuantity, onRemove, onWishlist }) {
  const { t } = useTranslation();
  const options = [line.options?.storage, line.options?.color].filter(Boolean);

  return (
    <li className={styles.item}>
      <div className={styles.itemMedia}>
        <AssetImage
          src={line.image}
          alt={line.title}
          fill
          sizes="88px"
          showPath={false}
          placeholderLabel={line.title}
          wrapperClassName={styles.itemMediaStage}
          className={styles.itemImage}
        />
      </div>

      <div className={styles.itemBody}>
        <p className={styles.itemTitle}>
          {line.detailHref ? (
            <Link href={line.detailHref} className={styles.itemLink}>
              {line.title}
            </Link>
          ) : (
            line.title
          )}
        </p>

        {options.length ? (
          <p className={styles.itemOptions}>
            {options.map((option) => (
              <OptionPill key={option}>{option}</OptionPill>
            ))}
          </p>
        ) : null}

        <p className={styles.itemPrice}>{formatMoney(line.price)}</p>

        <p className={`${styles.itemStock} ${line.stock === "low" ? styles.itemStockLow : ""}`.trim()}>
          {t(line.stock === "low" ? "cart.lowStock" : "cart.inStock")}
        </p>

        <div className={styles.itemActions}>
          <CartQuantityStepper
            quantity={line.quantity}
            onChange={(next) => onQuantity(line.key, next)}
            size="sm"
          />

          <div className={styles.itemIconActions}>
            {WISHLIST_UI_ENABLED ? (
              <button
                type="button"
                className={styles.itemIconButton}
                onClick={() => onWishlist(line)}
                aria-label={t("cart.moveToWishlist", { title: line.title })}
              >
                <FiHeart aria-hidden="true" />
              </button>
            ) : null}
            <button
              type="button"
              className={`${styles.itemIconButton} ${styles.itemRemove}`}
              onClick={() => onRemove(line)}
              aria-label={t("cart.removeItem", { title: line.title })}
            >
              <FiTrash2 aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <p className={styles.itemLineTotal}>{formatMoney(line.price * line.quantity)}</p>
    </li>
  );
}

/* ------------------------------------------------------------------ drawer */

/**
 * Header cart drawer.
 *
 * Slides in from the logical end side, so it enters from the right in LTR and
 * from the left in RTL without a direction-specific branch — `inset-inline-end`
 * and a mirrored transform do the work.
 *
 * The shell stays mounted so both the open and close transitions can run; while
 * closed it is `visibility: hidden`, which also removes it from the tab order
 * and (with aria-hidden) from assistive technology.
 */
export default function CartDrawer() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    lines,
    hydrated,
    totals,
    count,
    isDrawerOpen,
    closeCart,
    setQuantity,
    removeLine,
    restoreLine,
    moveToWishlist,
    applyPromo,
    removePromo,
  } = useCart();

  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const titleId = useId();

  // Focus management, Escape, and background scroll lock.
  useEffect(() => {
    if (!isDrawerOpen) return undefined;

    restoreFocusRef.current = document.activeElement;
    closeRef.current?.focus();

    // Lock on both elements: html is the scroll container here, and body's
    // overflow only reaches the viewport via the root-propagation quirk. Setting
    // both leaves no doubt, and the scroll position is untouched so nothing
    // jumps when it is released.
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCart();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      restoreFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [isDrawerOpen, closeCart]);

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

  // Guards against a double submit: the button disables for the duration, so a
  // fast double-click cannot fire the action twice.
  const [isSubmitting, setSubmitting] = useState(false);
  const submitTimer = useRef(null);

  useEffect(() => () => { if (submitTimer.current) clearTimeout(submitTimer.current); }, []);

  const handleCheckout = useCallback(() => {
    if (isSubmitting) return;
    setSubmitting(true);
    // This storefront has no checkout backend; say so rather than pretending.
    showToast({ message: t("cart.checkoutNotConnected") });
    submitTimer.current = setTimeout(() => setSubmitting(false), 1200);
  }, [isSubmitting, showToast, t]);

  const hasItems = lines.length > 0;

  return (
    <div
      className={`${styles.root} ${isDrawerOpen ? styles.rootOpen : ""}`.trim()}
      aria-hidden={isDrawerOpen ? undefined : "true"}
    >
      <div className={styles.overlay} onClick={closeCart} aria-hidden="true" />

      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
      >
        <header className={styles.header}>
          <div>
            <h2 id={titleId} className={styles.title}>
              {t("cart.yourCart")} <span className={styles.titleCount}>({count})</span>
            </h2>
            <p className={styles.subtitle}>
              {hasItems ? t("cart.itemsInCart", { count }) : t("cart.emptySubtitle")}
            </p>
          </div>

          <IconCloseButton onClick={closeCart} label={t("cart.closeCart")} innerRef={closeRef} />
        </header>

        {!hydrated ? (
          <CartDrawerSkeleton />
        ) : !hasItems ? (
          <div className={styles.emptyWrap}>
            <EmptyCartState variant="drawer" onContinue={closeCart} />
          </div>
        ) : (
          <>
            {/* Progress toward the free-shipping threshold — a real rule, so it
                is safe to state. Hidden once it no longer applies. */}
            {totals.freeShippingRemaining > 0 ? (
              <p className={styles.shippingNudge}>
                {t("cart.freeShippingRemaining", {
                  amount: formatMoney(totals.freeShippingRemaining),
                })}
              </p>
            ) : (
              <p className={`${styles.shippingNudge} ${styles.shippingNudgeDone}`}>
                {t("cart.freeShippingUnlocked")}
              </p>
            )}

            <ul className={styles.items}>
              {lines.map((line) => (
                <CartDrawerItem
                  key={line.key}
                  line={line}
                  onQuantity={setQuantity}
                  onRemove={handleRemove}
                  onWishlist={handleWishlist}
                />
              ))}
            </ul>

            <div className={styles.footer}>
              <div className={styles.promoSlot}>
                <PromoCodeForm
                  appliedCode={totals.appliedCode}
                  discount={totals.discount}
                  onApply={applyPromo}
                  onRemove={removePromo}
                />
              </div>

              <div className={styles.summary}>
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

              <button
                type="button"
                className={styles.checkout}
                onClick={handleCheckout}
                disabled={isSubmitting}
              >
                <FiLock aria-hidden="true" />
                {t("cart.checkoutSecurely")}
              </button>

              <Link href="/cart" className={styles.viewCart} onClick={closeCart}>
                {t("cart.viewCart")}
              </Link>

              <p className={styles.secureNote}>
                <FiShield aria-hidden="true" />
                {t("cart.secureNote")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
