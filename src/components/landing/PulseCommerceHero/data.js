import {
  bestSellerProducts,
  suggestedProducts,
  productSearchHref,
} from "@/components/landing/data/products";

/**
 * Centralised data model for the Techno Solutions Pulse Commerce Core hero.
 *
 * Relocated (unchanged in intent) from the Phase-1-preserved
 * `CommerceHero/data.js`. It is the single source of truth for the hero's
 * product references — the Category Reactor, Deals Matrix and Top Seller Vault
 * all resolve their content from here, so the same product mapping never lives
 * in two files.
 *
 * DATA-HONESTY NOTE
 * -----------------
 * The demo catalogue is ~14 general-tech products (mostly phones) and is NOT
 * tagged by product-type category, so drawn "popular categories"
 * (Gaming/Kitchen/Sport/…) have no matching products. To avoid BOTH fabricating
 * products and showing mismatched ones, the reactor exposes four REAL
 * merchandising collections, each defined by a genuine product attribute so
 * every product legitimately belongs:
 *
 *   top-rated  → highest-rated products (rating)
 *   best-value → products with a real discount (oldPrice present)
 *   premium    → highest-priced products (price)
 *   everyday   → accessible mid-range mix (price band)
 *   budget     → lowest-priced products (price)
 *   mobile     → phones + phone accessories (product type)
 *   popular    → most-reviewed products (reviews count)
 *   hot-deals  → largest real discount percentage (discount magnitude)
 *
 * Each collection references 8 DISTINCT real product IDs (4 deals + 1 featured
 * + 3 top sellers) — no product repeats inside one collection view. Records are
 * referenced by ID (never copied or mutated); the same product may legitimately
 * appear in more than one collection (a genuine, well-reviewed, discounted
 * phone belongs under several honest merchandising angles). Product
 * names/prices/images/ratings are the real catalogue values (the catalogue has
 * no Arabic product fields, so they stay in their source language). Discounts
 * shown are computed from the real price/oldPrice pair — never invented.
 */

/** Real, truthful discount percentage from a price pair, or null. */
export function discountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round((1 - price / oldPrice) * 100);
}

/** Shared USD formatter for every hero column (matches the ProductCard style). */
export const formatPrice = (value) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

// One lookup of every real product, normalised to the hero card shape.
const PRODUCT_INDEX = (() => {
  const index = new Map();
  [...bestSellerProducts, ...suggestedProducts].forEach((p) => {
    if (index.has(p.id)) return;
    index.set(p.id, {
      id: p.id,
      title: p.title,
      image: p.image,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      badge: p.badge ?? null,
      rating: p.rating ?? null,
      reviews: p.reviews ?? null,
      discount: discountPercent(p.price, p.oldPrice ?? null),
      href: productSearchHref(p.title),
    });
  });
  return index;
})();

/** Resolve an array of product IDs to real product records (skips unknowns). */
export function resolveProducts(ids) {
  return ids.map((id) => PRODUCT_INDEX.get(id)).filter(Boolean);
}

/**
 * @typedef {Object} Collection
 * @property {string} id
 * @property {string} labelKey     Dictionary key for the collection name.
 * @property {string} searchTerm   Term for the "View all" products link.
 * @property {string[]} dealIds    Four compact-deal product IDs.
 * @property {string} featuredId   Featured-deal product ID.
 * @property {string[]} topSellerIds  Three top-seller product IDs.
 */

/** @type {Collection[]} */
export const collections = [
  {
    // rating-led (5★ heavy)
    id: "top-rated",
    labelKey: "commerce.categories.top-rated",
    searchTerm: "Top Rated",
    dealIds: ["xioma-14-pro", "xioma-15-blue", "xioma-15-green", "boso-2-headphone"],
    featuredId: "xioma-book-air",
    topSellerIds: ["xioma-s9-plus", "xioma-12-pro", "xioma-15-yellow"],
  },
  {
    // every item carries a real discount (oldPrice present)
    id: "best-value",
    labelKey: "commerce.categories.best-value",
    searchTerm: "Deals",
    dealIds: ["xioma-12-pro", "xioma-14-blue", "opplo-pad-navy", "xioma-pad-6"],
    featuredId: "xioma-15-green",
    topSellerIds: ["boso-2-headphone", "opplo-watch-3", "clear-case-13"],
  },
  {
    // highest price tier
    id: "premium",
    labelKey: "commerce.categories.premium",
    searchTerm: "Premium",
    dealIds: ["sono-studio-24", "xioma-14-pro", "xioma-book-air", "xioma-15-blue"],
    featuredId: "xioma-15-green",
    topSellerIds: ["xioma-15-yellow", "xioma-12-pro", "xioma-14-blue"],
  },
  {
    // accessible mid-range mix
    id: "everyday",
    labelKey: "commerce.categories.everyday",
    searchTerm: "Accessories",
    dealIds: ["xioma-pad-6", "opplo-pad-navy", "xioma-14-blue", "boso-2-headphone"],
    featuredId: "xioma-s9-plus",
    topSellerIds: ["xioma-12-pro", "opplo-watch-3", "xioma-15-yellow"],
  },
  {
    // lowest price tier
    id: "budget",
    labelKey: "commerce.categories.budget",
    searchTerm: "Budget",
    dealIds: ["clear-case-13", "opplo-watch-3", "xioma-pad-6", "opplo-pad-navy"],
    featuredId: "xioma-s9-plus",
    topSellerIds: ["xioma-14-blue", "boso-2-headphone", "xioma-12-pro"],
  },
  {
    // phones + phone accessory
    id: "mobile",
    labelKey: "commerce.categories.mobile",
    searchTerm: "Mobiles",
    dealIds: ["xioma-15-green", "xioma-15-blue", "xioma-14-blue", "xioma-s9-plus"],
    featuredId: "xioma-14-pro",
    topSellerIds: ["xioma-12-pro", "xioma-15-yellow", "clear-case-13"],
  },
  {
    // most-reviewed (customer favourites)
    id: "popular",
    labelKey: "commerce.categories.popular",
    searchTerm: "Popular",
    dealIds: ["clear-case-13", "xioma-12-pro", "boso-2-headphone", "xioma-15-green"],
    featuredId: "xioma-15-blue",
    topSellerIds: ["xioma-14-blue", "xioma-pad-6", "xioma-15-yellow"],
  },
  {
    // largest real discount percentage
    id: "hot-deals",
    labelKey: "commerce.categories.hot-deals",
    searchTerm: "Deals",
    dealIds: ["clear-case-13", "opplo-watch-3", "boso-2-headphone", "xioma-pad-6"],
    featuredId: "xioma-12-pro",
    topSellerIds: ["xioma-14-blue", "xioma-book-air", "opplo-pad-navy"],
  },
];

/** Resolve one collection's ID references into real product records. */
export function resolveCollection(collection) {
  const featured = PRODUCT_INDEX.get(collection.featuredId) ?? null;
  const deals = resolveProducts(collection.dealIds);
  return {
    id: collection.id,
    labelKey: collection.labelKey,
    searchTerm: collection.searchTerm,
    viewAllHref: productSearchHref(collection.searchTerm),
    deals,
    featured,
    topSellers: resolveProducts(collection.topSellerIds),
  };
}

/** All collections pre-resolved (stable module-level value). */
export const resolvedCollections = collections.map(resolveCollection);
