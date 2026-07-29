import { productSearchHref } from "./products";

/**
 * Curated hero showcase products for the orbital carousel.
 *
 * These reuse real assets/prices already present in the landing demo catalogue
 * (see products.js / bestSellerProducts) — nothing is invented. The list is
 * intentionally curated (not the full catalogue) and can grow to any length;
 * the carousel shows a fixed number of visual slots regardless of queue size.
 *
 * `searchTerm` stays in English (route/query + API). Names/categories/prices
 * are product data kept in their original language.
 *
 * @typedef {Object} HeroProduct
 * @property {string} id         Stable unique key.
 * @property {string} name       Product name (data, not UI copy).
 * @property {string} category   Product category (data).
 * @property {string} image      Image in /public/images.
 * @property {string} alt        Meaningful alt text for the main image.
 * @property {string} priceText  Price label.
 * @property {string} searchTerm Term used to build the product route link.
 * @property {string} accent     Accent colour for the glow/ring tint.
 */

/** @type {HeroProduct[]} */
export const heroProducts = [
  {
    id: "buds-pro",
    name: "BOSO Buds Pro",
    category: "Audio",
    image: "/images/products/boso-buds-pro.webp",
    alt: "BOSO Buds Pro wireless earbuds resting in their charging case",
    priceText: "From $129.00",
    searchTerm: "Headphones",
    accent: "var(--color-primary)",
  },
  {
    id: "xioma-phone",
    name: "Xioma Pro Smartphone",
    category: "Phones",
    image: "/images/products/xioma-pro-smartphone.webp",
    alt: "Xioma Pro smartphone shown from the front and back",
    priceText: "From $569.00",
    searchTerm: "Mobiles",
    accent: "#e8853a",
  },
  {
    id: "opplo-watch",
    name: "Opplo Watch Series 3",
    category: "Wearables",
    image: "/images/products/opplo-watch-3.webp",
    alt: "Opplo Watch Series 3 smartwatch in two colourways",
    priceText: "From $152.00",
    searchTerm: "Smart Watch",
    accent: "#2f9e44",
  },
  {
    id: "boso-onear",
    name: "BOSO 2 Wireless On-Ear Headphone",
    category: "Audio",
    image: "/images/products/boso-2-headphone.webp",
    alt: "BOSO 2 wireless on-ear headphones",
    priceText: "From $610.00",
    searchTerm: "Headphones",
    accent: "var(--color-primary)",
  },
  {
    id: "xioma-s9",
    name: "Xioma S9+ Smartphone",
    category: "Phones",
    image: "/images/products/xioma-s9-plus.webp",
    alt: "Xioma S9+ smartphone in coral blue",
    priceText: "From $549.00",
    searchTerm: "Mobiles",
    accent: "#7048e8",
  },
  {
    id: "xioma-book",
    name: "Xioma Book Air 13",
    category: "Computers",
    image: "/images/products/xioma-book-air.webp",
    alt: "Xioma Book Air 13 laptop in space gray",
    priceText: "From $999.00",
    searchTerm: "Laptop",
    accent: "#1098ad",
  },
];

/** Build the product route for a hero product (real existing /products route). */
export const heroProductHref = (product) => productSearchHref(product.searchTerm);
