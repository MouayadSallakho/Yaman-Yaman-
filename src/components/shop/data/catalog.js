/**
 * Shop catalogue for the products listing page.
 *
 * There is still no product API, so the shop browses this in-memory array — the
 * same convention the landing sections use. Every field the UI can filter,
 * sort or render is present here, which keeps the components pure view layers
 * and makes swapping in a real endpoint a data-layer change only.
 *
 * Image paths intentionally point at the /public naming convention. Files that
 * do not exist yet render the shared AssetImage placeholder, so the grid stays
 * visually stable until real assets land.
 *
 * @typedef {"in"|"low"|"out"} StockState
 * @typedef {"new"|"sale"|"bestseller"|"trending"|null} BadgeKind
 *
 * @typedef {Object} ShopProduct
 * @property {string} id
 * @property {string} title
 * @property {string} brand
 * @property {string} category   Category id (see CATEGORIES).
 * @property {number} price
 * @property {number|null} oldPrice
 * @property {number} rating     0–5, one decimal.
 * @property {number} reviews
 * @property {string} image
 * @property {BadgeKind} badge
 * @property {StockState} stock
 * @property {string} meta       Short spec line shown under the title.
 * @property {number} added      Monotonic recency key for "Newest" sorting.
 * @property {string} [detailHref] Product-detail route, when one exists. Most
 *   demo products have no detail page yet, so their titles stay plain text
 *   rather than linking somewhere that does not exist.
 */

/** Category facets. Labels are translated; ids are the URL values. */
export const CATEGORIES = [
  { id: "smartphones", labelKey: "shop.categories.smartphones" },
  { id: "tablets", labelKey: "shop.categories.tablets" },
  { id: "laptops", labelKey: "shop.categories.laptops" },
  { id: "audio", labelKey: "shop.categories.audio" },
  { id: "wearables", labelKey: "shop.categories.wearables" },
  { id: "accessories", labelKey: "shop.categories.accessories" },
  { id: "smart-home", labelKey: "shop.categories.smartHome" },
  { id: "gaming", labelKey: "shop.categories.gaming" },
];

/** Sort options. `id` is the URL value. */
export const SORT_OPTIONS = [
  { id: "featured", labelKey: "shop.sort.featured" },
  { id: "newest", labelKey: "shop.sort.newest" },
  { id: "price-asc", labelKey: "shop.sort.priceAsc" },
  { id: "price-desc", labelKey: "shop.sort.priceDesc" },
  { id: "rating", labelKey: "shop.sort.rating" },
  { id: "discount", labelKey: "shop.sort.discount" },
];

export const DEFAULT_SORT = "featured";

/** @type {ShopProduct[]} */
export const SHOP_PRODUCTS = [
  // ---------------------------------------------------------------- phones
  { id: "xioma-x15-ultra-5g", title: "XIOMA X15 Ultra 5G", brand: "XIOMA", category: "smartphones", price: 1299, oldPrice: 1499, rating: 4.8, reviews: 236, image: "/images/products/xioma-x15-ultra/02-frost-silver-front.webp", badge: "bestseller", stock: "in", meta: "16GB RAM · 512GB · 200MP", added: 48, detailHref: "/products/xioma-x15-ultra" },
  { id: "xioma-15-pro-5g", title: "XIOMA 15 Pro 5G", brand: "XIOMA", category: "smartphones", price: 999, oldPrice: 1129, rating: 4.6, reviews: 88, image: "/images/products/xioma-14-pro.webp", badge: "sale", stock: "in", meta: "12GB RAM · 256GB", added: 47 },
  { id: "xioma-15-5g", title: "XIOMA 15 5G", brand: "XIOMA", category: "smartphones", price: 699, oldPrice: null, rating: 4.5, reviews: 96, image: "/images/products/xioma-15-blue.webp", badge: null, stock: "in", meta: "8GB RAM · 256GB", added: 46 },
  { id: "xioma-fold-x", title: "XIOMA Fold X", brand: "XIOMA", category: "smartphones", price: 1799, oldPrice: 2349, rating: 4.4, reviews: 64, image: "/images/products/xioma-fold-x.webp", badge: "new", stock: "low", meta: "16GB RAM · 1TB · Foldable", added: 45 },
  { id: "xioma-15-plus-256", title: "XIOMA 15 Plus 256GB", brand: "XIOMA", category: "smartphones", price: 899, oldPrice: 949, rating: 4.5, reviews: 120, image: "/images/products/xioma-15-green.webp", badge: null, stock: "in", meta: "8GB RAM · 256GB", added: 44 },
  { id: "xioma-12-pro-512", title: "XIOMA 12 Pro 512GB", brand: "XIOMA", category: "smartphones", price: 829, oldPrice: 999, rating: 4.3, reviews: 141, image: "/images/products/xioma-12-pro.webp", badge: "sale", stock: "in", meta: "8GB RAM · 512GB", added: 30 },
  { id: "xioma-14-blue-128", title: "XIOMA 14 128GB", brand: "XIOMA", category: "smartphones", price: 749, oldPrice: 829, rating: 4.2, reviews: 88, image: "/images/products/xioma-14-blue.webp", badge: null, stock: "in", meta: "8GB RAM · 128GB", added: 28 },
  { id: "novatech-aura-6", title: "NovaTech Aura 6", brand: "NovaTech", category: "smartphones", price: 649, oldPrice: 729, rating: 4.1, reviews: 57, image: "/images/products/novatech-aura-6.webp", badge: null, stock: "in", meta: "8GB RAM · 128GB", added: 41 },
  { id: "novatech-aura-6-pro", title: "NovaTech Aura 6 Pro", brand: "NovaTech", category: "smartphones", price: 879, oldPrice: null, rating: 4.4, reviews: 39, image: "/images/products/novatech-aura-6-pro.webp", badge: "new", stock: "in", meta: "12GB RAM · 256GB", added: 43 },
  { id: "opplo-edge-9", title: "Opplo Edge 9", brand: "Opplo", category: "smartphones", price: 559, oldPrice: 619, rating: 4.0, reviews: 74, image: "/images/products/xioma-s9-plus.webp", badge: null, stock: "low", meta: "8GB RAM · 128GB", added: 26 },
  { id: "opplo-edge-9-lite", title: "Opplo Edge 9 Lite", brand: "Opplo", category: "smartphones", price: 379, oldPrice: 429, rating: 3.9, reviews: 112, image: "/images/products/opplo-edge-9-lite.webp", badge: null, stock: "in", meta: "6GB RAM · 128GB", added: 21 },
  { id: "xioma-15-yellow-128", title: "XIOMA 15 Plus 128GB", brand: "XIOMA", category: "smartphones", price: 899, oldPrice: 949, rating: 4.2, reviews: 74, image: "/images/products/xioma-15-yellow.webp", badge: null, stock: "out", meta: "8GB RAM · 128GB", added: 20 },

  // --------------------------------------------------------------- tablets
  { id: "xioma-pad-6", title: "XIOMA Pad 6", brand: "XIOMA", category: "tablets", price: 499, oldPrice: 579, rating: 4.5, reviews: 84, image: "/images/products/xioma-pad-6.webp", badge: "bestseller", stock: "in", meta: '11" 2.8K · 256GB', added: 42 },
  { id: "xioma-pad-6-lite", title: "XIOMA Pad 6 Lite", brand: "XIOMA", category: "tablets", price: 329, oldPrice: 399, rating: 4.2, reviews: 66, image: "/images/products/xioma-pad-6-lite.webp", badge: "sale", stock: "in", meta: '10.4" · 128GB', added: 33 },
  { id: "opplo-pad-navy", title: "Opplo Pad 10.9-inch 256GB", brand: "Opplo", category: "tablets", price: 449, oldPrice: 489, rating: 4.3, reviews: 66, image: "/images/products/opplo-pad-navy.webp", badge: null, stock: "in", meta: '10.9" · 256GB', added: 31 },
  { id: "novatech-slate-11", title: "NovaTech Slate 11", brand: "NovaTech", category: "tablets", price: 389, oldPrice: null, rating: 4.0, reviews: 41, image: "/images/products/novatech-slate-11.webp", badge: null, stock: "in", meta: '11" · 128GB', added: 24 },
  { id: "xioma-pad-mini", title: "XIOMA Pad Mini", brand: "XIOMA", category: "tablets", price: 279, oldPrice: 319, rating: 4.1, reviews: 53, image: "/images/products/xioma-pad-mini.webp", badge: null, stock: "low", meta: '8.7" · 128GB', added: 18 },

  // --------------------------------------------------------------- laptops
  { id: "xioma-book-air-13", title: "XIOMA Book Air 13", brand: "XIOMA", category: "laptops", price: 999, oldPrice: 1099, rating: 4.6, reviews: 66, image: "/images/products/xioma-book-air.webp", badge: "bestseller", stock: "in", meta: "16GB · 512GB SSD", added: 40 },
  { id: "xioma-book-pro-16", title: "XIOMA Book Pro 16", brand: "XIOMA", category: "laptops", price: 1849, oldPrice: 1999, rating: 4.7, reviews: 48, image: "/images/products/xioma-book-pro-16.webp", badge: "new", stock: "low", meta: "32GB · 1TB SSD", added: 44 },
  { id: "novatech-zen-14", title: "NovaTech Zen 14", brand: "NovaTech", category: "laptops", price: 879, oldPrice: 969, rating: 4.2, reviews: 37, image: "/images/products/novatech-zen-14.webp", badge: "sale", stock: "in", meta: "16GB · 512GB SSD", added: 29 },
  { id: "sono-studio-24", title: "Sono Studio 24 All-in-One", brand: "Sono", category: "laptops", price: 1249, oldPrice: null, rating: 4.3, reviews: 66, image: "/images/products/sono-studio-24.webp", badge: null, stock: "in", meta: '24" · 16GB · 1TB', added: 22 },
  { id: "novatech-zen-14-ultra", title: "NovaTech Zen 14 Ultra", brand: "NovaTech", category: "laptops", price: 1399, oldPrice: 1549, rating: 4.5, reviews: 26, image: "/images/products/novatech-zen-14-ultra.webp", badge: null, stock: "in", meta: "32GB · 1TB SSD", added: 35 },

  // ----------------------------------------------------------------- audio
  { id: "novabuds-pro", title: "NovaBuds Pro", brand: "NovaTech", category: "audio", price: 149, oldPrice: 189, rating: 4.4, reviews: 78, image: "/images/products/novabuds-pro.webp", badge: "trending", stock: "in", meta: "Active Noise Cancellation", added: 45 },
  { id: "novabuds-air", title: "NovaBuds Air", brand: "NovaTech", category: "audio", price: 89, oldPrice: 109, rating: 4.1, reviews: 164, image: "/images/products/novabuds-air.webp", badge: "sale", stock: "in", meta: "Bluetooth 5.3 · 28h", added: 32 },
  { id: "boso-2-headphone", title: "BOSO 2 Wireless On-Ear", brand: "BOSO", category: "audio", price: 610, oldPrice: 750, rating: 4.7, reviews: 120, image: "/images/products/boso-2-headphone.webp", badge: "bestseller", stock: "in", meta: "Over-ear · 40h battery", added: 39 },
  { id: "boso-studio-mini", title: "BOSO Studio Mini Speaker", brand: "BOSO", category: "audio", price: 199, oldPrice: null, rating: 4.2, reviews: 58, image: "/images/products/boso-studio-mini.webp", badge: null, stock: "in", meta: "360° sound · IPX7", added: 27 },
  { id: "sono-playgo-5", title: "Sono Playgo 5 Speaker", brand: "Sono", category: "audio", price: 569, oldPrice: 649, rating: 4.5, reviews: 91, image: "/images/promos/sono-playgo-5.webp", badge: null, stock: "in", meta: "Room-filling · Wi-Fi", added: 25 },
  { id: "boso-buds-sport", title: "BOSO Buds Sport", brand: "BOSO", category: "audio", price: 129, oldPrice: 159, rating: 4.0, reviews: 143, image: "/images/products/boso-buds-sport.webp", badge: null, stock: "low", meta: "Sweat-resistant · 24h", added: 19 },

  // ------------------------------------------------------------- wearables
  { id: "pulse-3-smart-watch", title: "Pulse 3 Smart Watch", brand: "Pulse", category: "wearables", price: 199, oldPrice: 249, rating: 4.5, reviews: 45, image: "/images/products/pulse-3-smart-watch.webp", badge: "trending", stock: "in", meta: "AMOLED · GPS", added: 46 },
  { id: "opplo-watch-3", title: "Opplo Watch Sport Series 3", brand: "Opplo", category: "wearables", price: 152, oldPrice: 190, rating: 4.2, reviews: 42, image: "/images/products/opplo-watch-3.webp", badge: "sale", stock: "in", meta: "GPS · 7-day battery", added: 34 },
  { id: "pulse-band-2", title: "Pulse Band 2", brand: "Pulse", category: "wearables", price: 69, oldPrice: 89, rating: 4.0, reviews: 208, image: "/images/products/pulse-band-2.webp", badge: null, stock: "in", meta: "Fitness · 14-day battery", added: 23 },
  { id: "xioma-sport-watch", title: "XIOMA Sport Water-Resistance Watch", brand: "XIOMA", category: "wearables", price: 179, oldPrice: null, rating: 4.1, reviews: 61, image: "/images/promos/xioma-sport-watch.webp", badge: null, stock: "in", meta: "5ATM · Always-on", added: 17 },
  { id: "pulse-3-pro", title: "Pulse 3 Pro Titanium", brand: "Pulse", category: "wearables", price: 349, oldPrice: 399, rating: 4.6, reviews: 33, image: "/images/products/pulse-3-pro.webp", badge: "new", stock: "low", meta: "Titanium · ECG", added: 43 },

  // ----------------------------------------------------------- accessories
  { id: "nova-80w-charger", title: "Nova 80W Fast Charger", brand: "NovaTech", category: "accessories", price: 79, oldPrice: 99, rating: 4.3, reviews: 125, image: "/images/products/nova-80w-charger.webp", badge: null, stock: "in", meta: "GaN · Dual USB-C", added: 38 },
  { id: "pulse-power-bank", title: "Pulse Power Bank 20000mAh", brand: "Pulse", category: "accessories", price: 59, oldPrice: 75, rating: 4.2, reviews: 187, image: "/images/products/pulse-power-bank.webp", badge: "sale", stock: "in", meta: "20000mAh · 65W", added: 36 },
  { id: "shield-clear-case", title: "Shield Clear Case", brand: "XIOMA", category: "accessories", price: 29, oldPrice: 39, rating: 4.1, reviews: 210, image: "/images/products/clear-case-13.webp", badge: null, stock: "in", meta: "Anti-yellowing · MagSafe", added: 16 },
  { id: "orbit-magnetic-stand", title: "Orbit Magnetic Stand", brand: "NovaTech", category: "accessories", price: 39, oldPrice: null, rating: 4.0, reviews: 96, image: "/images/products/orbit-magnetic-stand.webp", badge: null, stock: "in", meta: "Aluminium · Adjustable", added: 15 },
  { id: "logitek-keyboard", title: "Logitek Bluetooth Keyboard", brand: "Sono", category: "accessories", price: 89, oldPrice: 109, rating: 4.2, reviews: 74, image: "/images/promos/logitek-keyboard.webp", badge: null, stock: "in", meta: "Multi-device · Backlit", added: 14 },
  { id: "nova-usbc-hub", title: "Nova 8-in-1 USB-C Hub", brand: "NovaTech", category: "accessories", price: 69, oldPrice: 85, rating: 4.1, reviews: 88, image: "/images/products/nova-usbc-hub.webp", badge: null, stock: "in", meta: "8-in-1 · 4K HDMI", added: 13 },
  { id: "xioma-screen-guard", title: "XIOMA Ceramic Screen Guard", brand: "XIOMA", category: "accessories", price: 19, oldPrice: 25, rating: 3.9, reviews: 254, image: "/images/products/xioma-screen-guard.webp", badge: null, stock: "in", meta: "9H · Oleophobic", added: 12 },

  // ----------------------------------------------------------- smart home
  { id: "nova-hub-mini", title: "Nova Smart Hub Mini", brand: "NovaTech", category: "smart-home", price: 119, oldPrice: 149, rating: 4.2, reviews: 63, image: "/images/products/nova-hub-mini.webp", badge: "new", stock: "in", meta: "Matter · Thread", added: 41 },
  { id: "nova-robot-cleaner", title: "Nova Robot Cleaner R7", brand: "NovaTech", category: "smart-home", price: 449, oldPrice: 549, rating: 4.4, reviews: 77, image: "/images/categories/robot-cleaner.webp", badge: "sale", stock: "in", meta: "LiDAR · Self-empty", added: 37 },
  { id: "sono-cam-360", title: "Sono Cam 360", brand: "Sono", category: "smart-home", price: 99, oldPrice: null, rating: 4.0, reviews: 118, image: "/images/products/sono-cam-360.webp", badge: null, stock: "in", meta: "2K · Night vision", added: 11 },
  { id: "nova-smart-bulb-4", title: "Nova Smart Bulb 4-pack", brand: "NovaTech", category: "smart-home", price: 49, oldPrice: 65, rating: 3.9, reviews: 146, image: "/images/products/nova-smart-bulb-4.webp", badge: null, stock: "in", meta: "16M colours · Matter", added: 10 },

  // --------------------------------------------------------------- gaming
  { id: "okodo-hero-11", title: "OKODo Hero 11+ Black", brand: "Sono", category: "gaming", price: 169, oldPrice: 219, rating: 4.3, reviews: 84, image: "/images/promos/okodo-hero-11.webp", badge: "trending", stock: "in", meta: "5.3K · Action camera", added: 35 },
  { id: "nova-pad-controller", title: "Nova Pro Controller", brand: "NovaTech", category: "gaming", price: 79, oldPrice: 99, rating: 4.2, reviews: 132, image: "/images/products/nova-pad-controller.webp", badge: null, stock: "in", meta: "Hall-effect · Low latency", added: 9 },
  { id: "xioma-gaming-headset", title: "XIOMA Gaming Headset G7", brand: "XIOMA", category: "gaming", price: 139, oldPrice: 179, rating: 4.1, reviews: 97, image: "/images/products/xioma-gaming-headset.webp", badge: "sale", stock: "low", meta: "Spatial audio · 50h", added: 8 },
  { id: "novatech-vr-one", title: "NovaTech VR One", brand: "NovaTech", category: "gaming", price: 599, oldPrice: 699, rating: 4.0, reviews: 44, image: "/images/products/novatech-vr-one.webp", badge: null, stock: "out", meta: "4K per eye · 120Hz", added: 7 },
  { id: "nova-gaming-mouse", title: "Nova Lightspeed Mouse", brand: "NovaTech", category: "gaming", price: 59, oldPrice: 75, rating: 4.2, reviews: 176, image: "/images/products/nova-gaming-mouse.webp", badge: null, stock: "in", meta: "26K DPI · 60h", added: 6 },
];

/** Distinct brands, alphabetical — used to build the brand facet. */
export const BRANDS = [...new Set(SHOP_PRODUCTS.map((p) => p.brand))].sort((a, b) =>
  a.localeCompare(b)
);

/** Absolute price bounds of the catalogue, rounded outward to tidy steps. */
export const PRICE_BOUNDS = {
  min: 0,
  max: Math.ceil(Math.max(...SHOP_PRODUCTS.map((p) => p.price)) / 100) * 100,
};

/** Rating thresholds offered in the filter panel. */
export const RATING_STEPS = [4.5, 4, 3.5, 3];

/**
 * Price bands. Discrete bands beat a dual-thumb slider here: they are keyboard
 * and screen-reader friendly out of the box, and they read as one clear choice
 * instead of two fiddly handles.
 */
export const PRICE_BANDS = [
  { id: "under-100", min: null, max: 99 },
  { id: "100-299", min: 100, max: 299 },
  { id: "300-599", min: 300, max: 599 },
  { id: "600-999", min: 600, max: 999 },
  { id: "1000-plus", min: 1000, max: null },
];

/** Find the band a min/max pair corresponds to, if any. */
export const matchPriceBand = (min, max) =>
  PRICE_BANDS.find((b) => b.min === (min ?? null) && b.max === (max ?? null))?.id ?? "";

export const discountPercent = (product) =>
  product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
