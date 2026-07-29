"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { FiArrowRight, FiMinus, FiPlus, FiShoppingCart, FiTag, FiX } from "react-icons/fi";

import { useTranslation } from "@/i18n/LocaleProvider";
import { formatMoney } from "./cartPricing";
import styles from "./CartUI.module.css";

/* ------------------------------------------------------------------ stepper */

/**
 * Quantity control shared by the drawer and the cart page.
 *
 * The value is a polite live region so a screen-reader user hears the new
 * quantity after pressing a button, and the decrement disables at the minimum
 * rather than silently refusing.
 */
export function CartQuantityStepper({ quantity, onChange, max = 10, size = "md" }) {
  const { t } = useTranslation();
  const atMin = quantity <= 1;
  const atMax = quantity >= max;

  return (
    <div
      className={`${styles.stepper} ${size === "sm" ? styles.stepperSm : ""}`.trim()}
      role="group"
      aria-label={t("cart.quantity")}
    >
      <button
        type="button"
        className={styles.stepperButton}
        onClick={() => onChange(quantity - 1)}
        disabled={atMin}
        aria-label={t("cart.decreaseQuantity")}
      >
        <FiMinus aria-hidden="true" />
      </button>

      <span className={styles.stepperValue} aria-live="polite">
        {quantity}
      </span>

      <button
        type="button"
        className={styles.stepperButton}
        onClick={() => onChange(quantity + 1)}
        disabled={atMax}
        aria-label={t("cart.increaseQuantity")}
      >
        <FiPlus aria-hidden="true" />
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- promo form */

/**
 * Promo code entry.
 *
 * Validation is local and synchronous (see cartPricing.PROMOTIONS), so there is
 * deliberately no spinner — a fake pending state would misrepresent what is
 * happening. A rejected code keeps what the customer typed and explains why.
 */
export function PromoCodeForm({ appliedCode, discount, onApply, onRemove }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(Boolean(appliedCode));
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const inputId = useId();
  const errorId = useId();

  if (appliedCode) {
    return (
      <div className={styles.promoApplied}>
        <span className={styles.promoAppliedIcon} aria-hidden="true">
          <FiTag />
        </span>
        <p className={styles.promoAppliedText}>
          <strong>{appliedCode}</strong>
          <span>{t("cart.promoSaving", { amount: formatMoney(discount) })}</span>
        </p>
        <button type="button" className={styles.promoRemove} onClick={onRemove}>
          {t("cart.removePromoCode")}
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className={styles.promoToggle} onClick={() => setOpen(true)}>
        <FiTag aria-hidden="true" />
        {t("cart.havePromoCode")}
      </button>
    );
  }

  const submit = (event) => {
    event.preventDefault();
    const code = value.trim();
    if (!code) return;

    const result = onApply(code);
    if (result?.ok) {
      setError(null);
      setValue("");
      return;
    }
    // Keep the typed value so the customer can correct a typo.
    setError(
      result?.reason === "minSubtotal"
        ? t("cart.promoMinSubtotal", { amount: formatMoney(result.minSubtotal) })
        : t("cart.invalidPromoCode")
    );
  };

  return (
    <form className={styles.promoForm} onSubmit={submit} noValidate>
      <label className={styles.promoLabel} htmlFor={inputId}>
        {t("cart.promoCode")}
      </label>

      <div className={styles.promoRow}>
        <input
          id={inputId}
          className={styles.promoInput}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          placeholder={t("cart.promoPlaceholder")}
          autoComplete="off"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <button type="submit" className={styles.promoApply} disabled={!value.trim()}>
          {t("cart.apply")}
        </button>
      </div>

      {error ? (
        <p className={styles.promoError} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

/* --------------------------------------------------------------- empty cart */

/**
 * Empty state for both surfaces. Reads as a starting point, not an error —
 * no disabled checkout button, no zeroed summary.
 */
export function EmptyCartState({ variant = "page", onContinue }) {
  const { t } = useTranslation();

  return (
    <div className={`${styles.empty} ${variant === "drawer" ? styles.emptyDrawer : ""}`.trim()}>
      <span className={styles.emptyIcon} aria-hidden="true">
        <FiShoppingCart />
      </span>
      <h3 className={styles.emptyTitle}>{t("cart.emptyCart")}</h3>
      <p className={styles.emptyText}>{t("cart.emptyCartDescription")}</p>

      <Link href="/products" className={styles.emptyAction} onClick={onContinue}>
        {t("cart.continueShopping")}
        <FiArrowRight aria-hidden="true" className={styles.emptyArrow} />
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------- line summary */

/** One label/value row in a price summary. */
export function SummaryRow({ label, value, tone, strong = false }) {
  return (
    <div className={`${styles.summaryRow} ${strong ? styles.summaryRowTotal : ""}`.trim()}>
      <span>{label}</span>
      <span className={tone === "positive" ? styles.summaryPositive : undefined}>{value}</span>
    </div>
  );
}

/** Small removable pill used for cart line options (storage / colour). */
export function OptionPill({ children }) {
  return <span className={styles.optionPill}>{children}</span>;
}

/** Close button shared by the drawer and dialogs. */
export function IconCloseButton({ onClick, label, innerRef }) {
  return (
    <button type="button" className={styles.iconClose} onClick={onClick} aria-label={label} ref={innerRef}>
      <FiX aria-hidden="true" />
    </button>
  );
}
