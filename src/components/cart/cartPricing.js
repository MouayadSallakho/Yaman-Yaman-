/**
 * Single source of truth for cart money.
 *
 * Every total shown anywhere (drawer, cart page, mobile bar, badge) is derived
 * here. Nothing stores a computed total, so the drawer and the page can never
 * disagree.
 *
 * Scope note: this storefront has no pricing/tax backend. Shipping and promotion
 * rules below are explicit, inspectable storefront rules — not placeholders that
 * pretend to call a service. Tax is deliberately absent rather than invented.
 */

/**
 * Wishlist state and the move-to-wishlist reducer action both exist and work,
 * but there is no /wishlist route yet — so the cart deliberately does not offer
 * the action. Surfacing it would move a product somewhere the customer cannot
 * get to. Flip this to true as soon as a wishlist page ships; no other change
 * is needed.
 */
export const WISHLIST_UI_ENABLED = false;

/** Orders at or above this subtotal ship free. */
export const FREE_SHIPPING_THRESHOLD = 129;

/** Flat shipping fee applied below the threshold. */
export const FLAT_SHIPPING_FEE = 9.9;

/**
 * Promotions this storefront accepts. Codes are matched case-insensitively.
 * `minSubtotal` guards a code that only makes sense on larger baskets.
 *
 * @type {Record<string, { kind: "percent"|"amount", value: number, minSubtotal?: number }>}
 */
export const PROMOTIONS = {
  MABCO10: { kind: "percent", value: 10 },
  TECH25: { kind: "amount", value: 25, minSubtotal: 299 },
};

/**
 * Identity of a cart line. Two different configurations of the same product are
 * separate lines, so a 512GB Frost Silver never merges into a 1TB Aurora.
 */
export const cartLineKey = (productId, options = {}) =>
  [productId, options.storage ?? "-", options.color ?? "-"].join("::");

const round = (value) => Math.round(value * 100) / 100;

/** Total units in the cart — the definition used by the header badge. */
export const totalQuantity = (lines) => lines.reduce((sum, line) => sum + line.quantity, 0);

/** Number of distinct cart lines. */
export const uniqueCount = (lines) => lines.length;

/**
 * Resolve a promo code against a subtotal.
 *
 * @returns {{ ok: true, code: string, amount: number } | { ok: false, reason: "unknown"|"minSubtotal", minSubtotal?: number }}
 */
export function resolvePromotion(rawCode, subtotal) {
  const code = String(rawCode || "").trim().toUpperCase();
  const promo = PROMOTIONS[code];
  if (!promo) return { ok: false, reason: "unknown" };

  if (promo.minSubtotal && subtotal < promo.minSubtotal) {
    return { ok: false, reason: "minSubtotal", minSubtotal: promo.minSubtotal };
  }

  const amount =
    promo.kind === "percent" ? round((subtotal * promo.value) / 100) : Math.min(promo.value, subtotal);

  return { ok: true, code, amount: round(amount) };
}

/**
 * Derive every money figure for a cart.
 *
 * @param {Array<{ price: number, quantity: number }>} lines
 * @param {string|null} promoCode
 */
export function selectTotals(lines, promoCode) {
  const subtotal = round(lines.reduce((sum, line) => sum + line.price * line.quantity, 0));

  const promo = promoCode ? resolvePromotion(promoCode, subtotal) : null;
  const discount = promo && promo.ok ? promo.amount : 0;

  const discountedSubtotal = round(subtotal - discount);

  // No items means no shipping line at all, rather than a fee on an empty cart.
  const shipping =
    lines.length === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;

  return {
    subtotal,
    discount,
    shipping,
    freeShipping: lines.length > 0 && shipping === 0,
    /** How much more is needed to qualify for free shipping (0 when qualified). */
    freeShippingRemaining:
      lines.length === 0 ? 0 : Math.max(0, round(FREE_SHIPPING_THRESHOLD - discountedSubtotal)),
    total: round(discountedSubtotal + shipping),
    appliedCode: promo && promo.ok ? promo.code : null,
  };
}

/** Currency formatting used by every cart surface. */
export const formatMoney = (value) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });
