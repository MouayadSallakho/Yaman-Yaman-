/**
 * Featured brand logos for the continuously scrolling BrandMarquee.
 * Assets live in /public/images and were normalised to clean single-extension
 * names. Add more brands here as real logo assets become available — the
 * marquee renders whatever this array contains and duplicates it for a
 * seamless loop.
 *
 * @typedef {Object} FeaturedBrand
 * @property {string} id         Stable key (also used as the React key).
 * @property {string} name       Brand name, used for the image alt text.
 * @property {string} logo       Path to the logo asset in /public/images.
 * @property {string} searchTerm Term passed to productSearchHref().
 */

/** @type {FeaturedBrand[]} */
export const featuredBrands = [
  {
    id: "grafbase",
    name: "Grafbase",
    logo: "/images/brands/grafbase.webp",
    searchTerm: "Grafbase",
  },
  {
    id: "msi",
    name: "MSI",
    logo: "/images/brands/msi.webp",
    searchTerm: "MSI",
  },
  {
    id: "jamx",
    name: "JAMX",
    logo: "/images/brands/jamx.webp",
    searchTerm: "JAMX",
  },
  {
    id: "digitek",
    name: "Digitek",
    logo: "/images/brands/digitek.webp",
    searchTerm: "Digitek",
  },
  {
    id: "ohbear",
    name: "Ohbear",
    logo: "/images/brands/ohbear.webp",
    searchTerm: "Ohbear",
  },
  {
    id: "oak",
    name: "OAK",
    logo: "/images/brands/oak.webp",
    searchTerm: "OAK",
  },
  {
    id: "stropi",
    name: "Stropi",
    logo: "/images/brands/stropi.webp",
    searchTerm: "Stropi",
  },
];
