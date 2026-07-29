import {
  bestSellerProducts,
  suggestedProducts,
} from "@/components/landing/data/products";

/**
 * "You May Also Like" list for the XIOMA X15 Ultra page.
 *
 * The landing catalogue is the single source of product truth, so entries are
 * referenced by id instead of being copied: ids, titles, prices and image paths
 * stay owned by `landing/data/products`. Ordering here is editorial — similarly
 * positioned smartphones first, then connected devices, then accessories.
 *
 * XIOMA X15 Ultra is intentionally absent: it is the page's own product and is
 * not part of either source array.
 */
const RECOMMENDED_IDS = [
  "xioma-14-pro",
  "xioma-15-blue",
  "xioma-12-pro",
  "xioma-15-green",
  "xioma-15-yellow",
  "xioma-14-blue",
  "xioma-pad-6",
  "opplo-watch-3",
  "boso-2-headphone-sug",
  "clear-case-13",
];

const CATALOGUE = new Map(
  [...suggestedProducts, ...bestSellerProducts].map((product) => [product.id, product])
);

/** @type {Array<import("@/components/landing/data/products").Product>} */
export const XIOMA_RECOMMENDATIONS = RECOMMENDED_IDS.map((id) => CATALOGUE.get(id)).filter(Boolean);
