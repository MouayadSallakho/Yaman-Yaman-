import { productSearchHref, PRODUCTS_ROUTE } from "../data/products";

export const BRAND_SHOWCASE_VIEW_ALL_HREF = `${PRODUCTS_ROUTE}?browse=brands`;

const assetBase = "/images/brand-showcase";

/**
 * Brand Showcase configuration. The product catalogue is currently static, so
 * this focused data source keeps brand discovery independent from presentation.
 * Replace the records with API data once a real brands endpoint is available.
 */
export const featuredBrand = {
  id: "xioma",
  slug: "xioma",
  name: "XIOMA",
  categoryKey: "commerce.brandShowcase.categories.smartphones",
  productCount: 28,
  imageSrc: `${assetBase}/xioma-featured-smartphones.webp`,
  imageAltKey: "commerce.brandShowcase.images.xioma",
  destinationUrl: productSearchHref("XIOMA"),
  imageScale: 1,
  objectPosition: "center bottom",
  taglineKey: "commerce.brandShowcase.featured.tagline",
  descriptionKey: "commerce.brandShowcase.featured.description",
  benefits: [
    {
      id: "warranty",
      labelKey: "commerce.brandShowcase.featured.benefits.warranty",
      icon: "shield",
    },
    {
      id: "support",
      labelKey: "commerce.brandShowcase.featured.benefits.support",
      icon: "support",
    },
    {
      id: "launches",
      labelKey: "commerce.brandShowcase.featured.benefits.launches",
      icon: "rocket",
    },
  ],
};

export const showcaseBrands = [
  {
    id: "nova",
    slug: "nova",
    name: "NOVA",
    categoryKey: "commerce.brandShowcase.categories.audio",
    productCount: 24,
    imageSrc: `${assetBase}/nova-headphones.webp`,
    imageAltKey: "commerce.brandShowcase.images.nova",
    destinationUrl: productSearchHref("NOVA Audio"),
    accent: "blue",
    decorativeVariant: "wave",
    imageScale: 1,
    objectPosition: "center",
  },
  {
    id: "pulse",
    slug: "pulse",
    name: "PULSE",
    categoryKey: "commerce.brandShowcase.categories.wearables",
    productCount: 18,
    imageSrc: `${assetBase}/pulse-smartwatch.webp`,
    imageAltKey: "commerce.brandShowcase.images.pulse",
    destinationUrl: productSearchHref("PULSE Wearables"),
    accent: "violet",
    decorativeVariant: "pulse",
    imageScale: 1,
    objectPosition: "center",
  },
  {
    id: "orbit",
    slug: "orbit",
    name: "ORBIT",
    categoryKey: "commerce.brandShowcase.categories.accessories",
    productCount: 32,
    imageSrc: `${assetBase}/orbit-charging-stand.webp`,
    imageAltKey: "commerce.brandShowcase.images.orbit",
    destinationUrl: productSearchHref("ORBIT Accessories"),
    accent: "cyan",
    decorativeVariant: "orbit",
    imageScale: 1,
    objectPosition: "center",
  },
  {
    id: "soniq",
    slug: "soniq",
    name: "SONIQ",
    categoryKey: "commerce.brandShowcase.categories.homeTech",
    productCount: 16,
    imageSrc: `${assetBase}/soniq-smart-speaker.webp`,
    imageAltKey: "commerce.brandShowcase.images.soniq",
    destinationUrl: productSearchHref("SONIQ Home Tech"),
    accent: "coral",
    decorativeVariant: "particles",
    imageScale: 1,
    objectPosition: "center",
  },
  {
    id: "luma",
    slug: "luma",
    name: "LUMA",
    categoryKey: "commerce.brandShowcase.categories.lighting",
    productCount: 14,
    imageSrc: `${assetBase}/luma-smart-lamp.webp`,
    imageAltKey: "commerce.brandShowcase.images.luma",
    destinationUrl: productSearchHref("LUMA Lighting"),
    accent: "indigo",
    decorativeVariant: "light",
    imageScale: 1,
    objectPosition: "center",
  },
  {
    id: "vertex",
    slug: "vertex",
    name: "VERTEX",
    categoryKey: "commerce.brandShowcase.categories.gaming",
    productCount: 24,
    imageSrc: `${assetBase}/vertex-controller.webp`,
    imageAltKey: "commerce.brandShowcase.images.vertex",
    destinationUrl: productSearchHref("VERTEX Gaming"),
    accent: "green",
    decorativeVariant: "grid",
    imageScale: 1,
    objectPosition: "center",
  },
];

export const brandBenefits = [
  {
    id: "official-warranty",
    icon: "shield",
    titleKey: "commerce.brandShowcase.reassurance.warranty.title",
    descriptionKey: "commerce.brandShowcase.reassurance.warranty.description",
  },
  {
    id: "secure-shipping",
    icon: "truck",
    titleKey: "commerce.brandShowcase.reassurance.shipping.title",
    descriptionKey: "commerce.brandShowcase.reassurance.shipping.description",
  },
  {
    id: "verified-sellers",
    icon: "award",
    titleKey: "commerce.brandShowcase.reassurance.sellers.title",
    descriptionKey: "commerce.brandShowcase.reassurance.sellers.description",
  },
  {
    id: "exclusive-launches",
    icon: "rocket",
    titleKey: "commerce.brandShowcase.reassurance.launches.title",
    descriptionKey: "commerce.brandShowcase.reassurance.launches.description",
  },
];
