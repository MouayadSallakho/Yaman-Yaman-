import { PRODUCTS_ROUTE } from "../data/products";

export const PROMO_VIEW_ALL_HREF = PRODUCTS_ROUTE;

const assetBase = "/images/promos";

/**
 * PER-CARD BACKGROUND TREATMENT — CURRENTLY PROVISIONAL
 * -----------------------------------------------------
 * None of the four `/images/promos/*.webp` files exist in the repository yet,
 * so these values have NOT been tuned against real artwork. They are chosen to
 * be safe for *any* artwork rather than flattering to a particular one:
 *
 *   `contain` crops nothing, so the complete product silhouette survives
 *   whatever aspect ratio the real file turns out to have. That also means
 *   there is no focal-point guess baked in here — with `contain` the vertical
 *   position is a no-op in a wider-than-tall card, and the horizontal position
 *   only decides where the whole render sits relative to the copy, which is a
 *   layout decision this component owns.
 *
 * `size`/`position` are per-card fields precisely so each can be re-tuned
 * independently once the real files land. Until then they are deliberately
 * uniform, and `tuned: false` marks them as unverified.
 */
const PROVISIONAL_MEDIA = {
  size: "contain",
  position: "100% 50%",
  positionRtl: "0% 50%",
  tuned: false,
};

/**
 * SECTION-LOCAL PROMOTION DATA
 * ----------------------------
 * These four records mirror `promoTiles` in `../data/products`, which is a
 * protected Hero dependency and must not be edited. Isolating them here lets
 * this section own its presentation metadata (media treatment, translation
 * keys) without touching the shared catalogue.
 *
 * Titles, image paths, destinations and theme are copied verbatim — no price,
 * urgency, stock, discount, date or product claim is introduced.
 *
 * `promoTiles` also carries literal `note` and `cta` strings. They are not
 * reproduced because the component never rendered them: the visible copy has
 * always come from the `promo.*` dictionary, which is why `noteKey`/`ctaKey`
 * are the fields that matter here.
 */
export const promotions = [
  {
    id: "playgo",
    title: "Sono Playgo 5",
    noteKey: "promo.notes.playgo",
    ctaKey: "promo.cta.discover",
    imageSrc: `${assetBase}/sono-playgo-5.webp`,
    destinationUrl: PRODUCTS_ROUTE,
    theme: "light",
    media: { ...PROVISIONAL_MEDIA },
  },
  {
    id: "keyboard",
    title: "Logitek Bluetooth Keyboard",
    noteKey: "promo.notes.keyboard",
    ctaKey: "promo.cta.discover",
    imageSrc: `${assetBase}/logitek-keyboard.webp`,
    destinationUrl: PRODUCTS_ROUTE,
    theme: "dark",
    media: { ...PROVISIONAL_MEDIA },
  },
  {
    // Spelled `xomia` to match the existing catalogue record. The shop
    // catalogue spells the same product `xioma`; that inconsistency belongs to
    // the Asset Integrity Recovery audit and is deliberately not resolved here.
    id: "watch",
    title: "xomia Sport Water-Resistance Watch",
    noteKey: "promo.notes.watch",
    ctaKey: "promo.cta.shop",
    imageSrc: `${assetBase}/xomia-sport-watch.webp`,
    destinationUrl: PRODUCTS_ROUTE,
    theme: "light",
    media: { ...PROVISIONAL_MEDIA },
  },
  {
    id: "okodo",
    title: "OKODo hero 11+ black",
    noteKey: "promo.notes.okodo",
    ctaKey: "promo.cta.shop",
    imageSrc: `${assetBase}/okodo-hero-11.webp`,
    destinationUrl: PRODUCTS_ROUTE,
    theme: "dark",
    media: { ...PROVISIONAL_MEDIA },
  },
];

export const promotionImageManifest = promotions.map((item) => item.imageSrc);
