"use client";

import Link from "next/link";
import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { Container } from "react-bootstrap";

import { featuredBrands } from "../data/brands";
import { productSearchHref } from "../data/products";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./BrandMarquee.module.css";

/**
 * Continuously scrolling "Featured Brands" strip.
 *
 * Implemented as a pure-CSS marquee (no client JS): the brand list is
 * rendered twice inside one track that translates by exactly one set width,
 * so the loop is seamless. The first set is the real, keyboard-navigable set;
 * the second is an aria-hidden, non-interactive visual clone. Motion pauses on
 * hover/focus and is fully disabled (static centered row) under
 * prefers-reduced-motion.
 */
export default function BrandMarquee() {
  const { t } = useTranslation();
  return (
    <section className={styles.section} aria-labelledby="brands-heading">
      <Container>
        <div className={styles.card}>
          <h2 id="brands-heading" className={styles.title}>
            {t("brands.title")}
          </h2>

          <div className={styles.viewport}>
            <ul className={styles.track}>
              {featuredBrands.map((brand) => (
                <li key={brand.id} className={styles.item}>
                  <Link
                    href={productSearchHref(brand.searchTerm)}
                    className={styles.link}
                    aria-label={t("brands.shopAria", { name: brand.name })}
                  >
                    <AssetImage
                      src={brand.logo}
                      alt=""
                      width={140}
                      height={40}
                      wrapperClassName={styles.logoAsset}
                      className={styles.logo}
                      placeholderLabel={brand.name}
                      showPath={false}
                      imageProps={{ draggable: false }}
                    />
                  </Link>
                </li>
              ))}
{/*Hello ALl   */} 

              {/* Seamless-loop clone: hidden from assistive tech and not focusable. */}
              {featuredBrands.map((brand) => (
                <li
                  key={`clone-${brand.id}`}
                  className={`${styles.item} ${styles.clone}`}
                  aria-hidden="true"
                >
                  <span className={styles.link}>
                    <AssetImage
                      src={brand.logo}
                      alt=""
                      width={140}
                      height={40}
                      wrapperClassName={styles.logoAsset}
                      className={styles.logo}
                      placeholderLabel={brand.name}
                      showPath={false}
                      imageProps={{ draggable: false }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
