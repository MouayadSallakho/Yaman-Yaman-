/**
 * Extra listing-card imagery, keyed by the catalogue product `id`.
 *
 * This lives beside the catalogue rather than inside it on purpose: `catalog.js`
 * defines the shared product shape that filtering, sorting and the cart all read,
 * and its single `image` contract stays untouched. A product simply gains extra
 * views by appearing here, and gains nothing by being absent.
 *
 * Rules this map follows deliberately:
 * - Only files that really exist under /public are listed. A product with no
 *   entry keeps its single catalogue image and renders no carousel.
 * - The same photo is never repeated to manufacture a second slide, and no
 *   product ever borrows another product's imagery.
 * - The first entry is the product's own catalogue image, so the card's initial
 *   frame is identical to what it showed before and nothing shifts on load.
 *
 * Only one catalogue product currently has more than one real image on disk.
 * The other 48 point at files that have not been produced yet, so they stay
 * single-image until those assets land — at which point adding a key here is the
 * only change required.
 *
 * Listing cards deliberately expose a small commercial subset (front, rear, side,
 * camera detail) rather than the full eight-image detail gallery: those four
 * answer "what does it look like" without making every card load a gallery.
 */

/** @type {Record<string, string[]>} */
export const PRODUCT_CARD_MEDIA = {
  "xioma-x15-ultra-5g": [
    "/images/products/xioma-x15-ultra/02-frost-silver-front.webp",
    "/images/products/xioma-x15-ultra/01-frost-silver-back.webp",
    "/images/products/xioma-x15-ultra/03-frost-silver-side.webp",
    "/images/products/xioma-x15-ultra/04-camera-closeup.webp",
  ],
};

/** Hard ceiling on card slides, so a long future list cannot bloat a card. */
export const MAX_CARD_MEDIA = 5;

/**
 * The images a listing card should show, newest contract first.
 *
 * Always returns at least one entry when the product has an image at all, so
 * callers never have to special-case the single-image path.
 *
 * @param {{ id: string, image?: string }} product
 * @returns {string[]}
 */
export function cardMediaFor(product) {
  const extra = PRODUCT_CARD_MEDIA[product?.id];
  if (Array.isArray(extra) && extra.length > 0) return extra.slice(0, MAX_CARD_MEDIA);
  return product?.image ? [product.image] : [];
}
