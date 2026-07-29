/**
 * Demo catalogue data for the landing page.
 * No product API exists yet — every landing section renders from these
 * arrays so the markup stays in one reusable card system. When a real
 * backend arrives, swap these arrays for fetched data.
 */

export const PRODUCTS_ROUTE = "/products";

export const productSearchHref = (term) =>
  `${PRODUCTS_ROUTE}?search=${encodeURIComponent(term)}`;

/** Categories preserved from the previous hero side menu. */
export const heroCategories = [
  "Laptop",
  "PC & Computers",
  "Cell Phones",
  "Tablets",
  "Gaming & VR",
  "Networking",
  "Cameras",
  "Office",
  "Storage, USB",
  "Accessories",
  "Clearance",
];

/**
 * Popular Categories shown as an image-based carousel under the hero.
 * Each record maps a real asset in /public/images to a display label and
 * the search term used to build the products-page link. Add more records
 * here as additional real category assets become available — the
 * CategoryStrip component renders whatever this array contains.
 *
 * @typedef {Object} PopularCategory
 * @property {string} id         Stable key (also used as the React key).
 * @property {string} label      Visible category name under the circle.
 * @property {string} image      Path to the category asset in /public/images.
 * @property {string} searchTerm Term passed to productSearchHref().
 * @property {number} [imageScale] Per-asset size multiplier applied to the
 *   base image size inside the circle. Assets ship with different amounts of
 *   transparent/white padding, so this tunes each one to read at a
 *   consistent visual weight (~65–78% of the circle). Defaults to 1.
 */

/** @type {PopularCategory[]} */
export const popularCategories = [
  {
    id: "gaming",
    label: "Gaming",
    image: "/images/categories/gaming.webp",
    searchTerm: "Gaming",
    imageScale: 1.2,
  },
  {
    id: "sport-equip",
    label: "Sport Equip",
    image: "/images/categories/sport-equipment.webp",
    searchTerm: "Sport",
    imageScale: 1.25,
  },
  {
    id: "kitchen",
    label: "Kitchen",
    image: "/images/categories/kitchen.webp",
    searchTerm: "Kitchen",
    imageScale: 1.08,
  },
  {
    id: "robot-cleaner",
    label: "Robot Cleaner",
    image: "/images/categories/robot-cleaner.webp",
    searchTerm: "Robot Cleaner",
    imageScale: 1.18,
  },
  {
    id: "mobiles",
    label: "Mobiles",
    image: "/images/categories/mobiles.webp",
    searchTerm: "Mobiles",
    imageScale: 1.22,
  },
  {
    id: "office",
    label: "Office",
    image: "/images/categories/office.webp",
    searchTerm: "Office",
    imageScale: 1.05,
  },
  {
    id: "televisions",
    label: "Televisions",
    image: "/images/categories/televisions.webp",
    searchTerm: "Televisions",
    imageScale: 1.2,
  },
  {
    id: "audios",
    label: "Audios",
    image: "/images/categories/audio.webp",
    searchTerm: "Audio",
    imageScale: 1.12,
  },
];

/** Promo tiles preserved from the previous hero side cards. */
export const promoTiles = [
  {
    id: "playgo",
    title: "Sono Playgo 5",
    note: "from $569",
    cta: "Discover now",
    image: "/images/promos/sono-playgo-5.webp",
    theme: "light",
  },
  {
    id: "keyboard",
    title: "Logitek Bluetooth Keyboard",
    note: "Best for work",
    cta: "Discover now",
    image: "/images/promos/logitek-keyboard.webp",
    theme: "dark",
  },
  {
    id: "watch",
    title: "xomia Sport Water-Resistance Watch",
    note: "New arrival",
    cta: "Shop now",
    image: "/images/promos/xioma-sport-watch.webp",
    theme: "light",
  },
  {
    id: "okodo",
    title: "OKODo hero 11+ black",
    note: "from $169",
    cta: "Shop now",
    image: "/images/promos/okodo-hero-11.webp",
    theme: "dark",
  },
];

export const bestSellerProducts = [
  {
    id: "boso-2-headphone",
    title: "BOSO 2 Wireless On-Ear Headphone",
    image: "/images/products/boso-2-headphone.webp",
    price: 610,
    oldPrice: 750,
    rating: 5,
    reviews: 120,
    badge: { label: "Best", tone: "dark" },
  },
  {
    id: "xioma-pad-6",
    title: "Xioma Pad 6 Wi-Fi 128GB, Space Gray",
    image: "/images/products/xioma-pad-6.webp",
    price: 329,
    oldPrice: 399,
    rating: 4,
    reviews: 84,
    badge: { label: "New", tone: "success" },
  },
  {
    id: "opplo-watch-3",
    title: "Opplo Watch Sport Series 3",
    image: "/images/products/opplo-watch-3.webp",
    price: 152,
    oldPrice: 190,
    rating: 4,
    reviews: 42,
    badge: { label: "-20%", tone: "danger" },
  },
  {
    id: "xioma-s9-plus",
    title: "Xioma S9+ 128GB Smartphone, Coral Blue",
    image: "/images/products/xioma-s9-plus.webp",
    price: 549,
    oldPrice: null,
    rating: 5,
    reviews: 66,
    badge: null,
  },
  {
    id: "opplo-pad-navy",
    title: "Opplo Pad 10.9-inch 256GB, Navy",
    image: "/images/products/opplo-pad-navy.webp",
    price: 449,
    oldPrice: 489,
    rating: 4,
    reviews: 66,
    badge: null,
  },
  {
    id: "xioma-book-air",
    title: "Xioma Book Air 13 256GB, Space Gray",
    image: "/images/products/xioma-book-air.webp",
    price: 999,
    oldPrice: 1099,
    rating: 5,
    reviews: 66,
    badge: null,
  },
  {
    id: "sono-studio-24",
    title: "Sono Studio 24 All-in-One Desktop, Silver",
    image: "/images/products/sono-studio-24.webp",
    price: 1249,
    oldPrice: null,
    rating: 4,
    reviews: 66,
    badge: null,
  },
];

export const suggestedProducts = [
  {
    id: "xioma-15-green",
    title: "Xioma 15 Plus 128GB, Green",
    image: "/images/products/xioma-15-green.webp",
    price: 899,
    oldPrice: 949,
    rating: 5,
    reviews: 120,
    badge: null,
  },
  {
    id: "xioma-15-blue",
    title: "Xioma 15 Plus 256GB, Blue",
    image: "/images/products/xioma-15-blue.webp",
    price: 999,
    oldPrice: null,
    rating: 5,
    reviews: 96,
    badge: null,
  },
  {
    id: "xioma-15-yellow",
    title: "Xioma 15 Plus 128GB, Yellow",
    image: "/images/products/xioma-15-yellow.webp",
    price: 899,
    oldPrice: 949,
    rating: 4,
    reviews: 74,
    badge: null,
  },
  {
    id: "xioma-14-blue",
    title: "Xioma 14 128GB, Blue",
    image: "/images/products/xioma-14-blue.webp",
    price: 749,
    oldPrice: 829,
    rating: 4,
    reviews: 88,
    badge: null,
  },
  {
    id: "xioma-14-pro",
    title: "Xioma 14 Pro 256GB, Sierra Blue",
    image: "/images/products/xioma-14-pro.webp",
    price: 1049,
    oldPrice: null,
    rating: 5,
    reviews: 63,
    badge: null,
  },
  {
    id: "xioma-12-pro",
    title: "Xioma 12 Pro 512GB, Silver",
    image: "/images/products/xioma-12-pro.webp",
    price: 829,
    oldPrice: 999,
    rating: 4,
    reviews: 141,
    badge: { label: "-17%", tone: "danger" },
  },
  {
    id: "clear-case-13",
    title: "Clear Protective Case for Xioma 13 Pro",
    image: "/images/products/clear-case-13.webp",
    price: 29,
    oldPrice: 39,
    rating: 4,
    reviews: 210,
    badge: null,
  },
  {
    id: "boso-2-headphone-sug",
    title: "BOSO 2 Wireless On-Ear Headphone",
    image: "/images/products/boso-2-headphone.webp",
    price: 610,
    oldPrice: 750,
    rating: 5,
    reviews: 120,
    badge: null,
  },
];

export const bestSellerCategories = [
  "Top 12",
  "Televisions",
  "PC Gaming",
  "Computers",
  "Cameras",
  "Gadgets",
  "Smart Home",
  "Sport Equipments",
];
