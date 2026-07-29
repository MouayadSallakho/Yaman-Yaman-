"use client";

import { FaCartShopping } from "react-icons/fa6";

import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./CartButton.module.css";

/**
 * Header cart trigger.
 *
 * A button, not a link: clicking it opens the drawer over the current page
 * instead of navigating away. The badge counts total units (so 2× of one
 * product reads as 2) and caps at 99+ to keep the header from reflowing.
 *
 * Until persisted cart state has been read the badge is withheld rather than
 * rendering a confident "0", which would be wrong for a returning customer.
 */
export default function CartButton({ className = "" }) {
  const { t } = useTranslation();
  const { count, hydrated, openCart } = useCart();

  const showBadge = hydrated && count > 0;
  const display = count > 99 ? "99+" : String(count);

  return (
    <button
      type="button"
      className={`${styles.button} ${className}`.trim()}
      onClick={openCart}
      aria-label={
        showBadge ? t("cart.openCartWithCount", { count }) : t("cart.openCart")
      }
      aria-haspopup="dialog"
    >
      <FaCartShopping className={styles.icon} aria-hidden="true" />
      {showBadge ? (
        <span className={styles.badge} aria-hidden="true">
          {display}
        </span>
      ) : null}
    </button>
  );
}
