"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import AssetImage from "@/components/ui/AssetImage/AssetImage";
import { Col, Container, Row } from "react-bootstrap";

import SectionHeader from "@/components/landing/SectionHeader/SectionHeader";
import { PRODUCTS_ROUTE } from "@/components/landing/data/products";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./DealsOfDay.module.css";

// Product titles stay in their original language; only the discount amount is
// data (the "Save {amount}" label itself is localised).
const sideDeals = [
  {
    id: "boso-buds-white",
    image: "/images/products/boso-buds-3-white.webp",
    title: "BOSO Buds 3 True Wireless Earbuds, White",
    price: "$199.00",
    oldPrice: "$234.00",
    saveAmount: "$35",
  },
  {
    id: "boso-buds-black",
    image: "/images/products/boso-buds-3-black.webp",
    title: "BOSO Buds 3 True Wireless Earbuds, Black",
    price: "$234.00",
    oldPrice: "$274.00",
    saveAmount: "$40",
  },
  {
    id: "opplo-watch",
    image: "/images/products/opplo-watch-3.webp",
    title: "Opplo Watch Sport Series 3",
    price: "$152.00",
    oldPrice: "$190.00",
    saveAmount: "$38",
  },
];

export default function DealsOfDay() {
  const { t } = useTranslation();
  const videoRef = useRef(null);

  // Respect reduced motion: never autoplay the promo video for those users.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.removeAttribute("autoplay");
      video.pause();
    }
  }, []);

  return (
    <section
      id="deals"
      className={styles.section}
      aria-labelledby="deals-heading"
    >
      <Container>
        {/* One unified card: header + divider + body, matching Best Seller. */}
        <div
          className={styles.sectionCard}
          data-aos="fade-up"
          data-aos-duration="550"
          data-aos-once="true"
        >
          <SectionHeader
            id="deals-heading"
            title={t("deals.title")}
            viewAllHref={PRODUCTS_ROUTE}
          />

          <div className={styles.content}>
            <Row className={`g-4 ${styles.equalHeightRow}`}>
              {/* LEFT: main deal */}
              <Col lg={9} className={styles.leftCol}>
                <div className={styles.bigBox}>
                  <Row className={`g-4 ${styles.myRow}`}>
                    <Col lg={5}>
                      <div className={styles.holderimage}>
                        <div className={styles.imageWrap}>
                          <video
                            ref={videoRef}
                            className={styles.video}
                            src="/videos/tudo_o_que_voce_procura_esta_aqui_mundo_rick_a_loja_mais_complet.mp4"
                            autoPlay
                            muted
                            playsInline
                            loop
                            preload="metadata"
                            aria-label={t("deals.videoAria")}
                          />
                          <p className={styles.saveBadge}>
                            {t("deals.save", { amount: "$199" })}
                          </p>
                        </div>

                        <Link className={styles.detailsBtn} href={PRODUCTS_ROUTE}>
                          {t("common.actions.viewDetails")}
                        </Link>
                      </div>
                    </Col>

                    <Col lg={7}>
                      <div className={styles.detailes}>
                        <h3>
                          Xioma Redmi Note 11 Pro 256GB 2023, Black Smartphone
                        </h3>

                        <p className={styles.priceLine}>
                          $569.00 <span>$759.00</span>
                        </p>

                        <ul className={styles.features}>
                          {t("deals.bullets").map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>

                        <div className={styles.tags}>
                          <p className={styles.tagGreen}>
                            <span>{t("deals.freeShipping")}</span>
                          </p>
                          <p className={styles.tagRed}>
                            <span>{t("deals.freeGift")}</span>
                          </p>
                        </div>

                        <p className={styles.limited}>{t("deals.limited")}</p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* RIGHT: side deals */}
              <Col lg={3} className={styles.rightCol}>
                <div className={styles.rightStack}>
                  {sideDeals.map((deal) => (
                    <div key={deal.id} className={styles.notherDeals}>
                      <div className={styles.rightImgWrap}>
                        <AssetImage
                          src={deal.image}
                          alt={deal.title}
                          fill
                          sizes="(max-width: 992px) 30vw, 110px"
                          wrapperClassName={styles.asset}
                          className={styles.img}
                          placeholderLabel={deal.title}
                        />
                        <p className={styles.saveBadgeSmall}>
                          {t("deals.save", { amount: deal.saveAmount })}
                        </p>
                      </div>

                      <div className={styles.rightInfo}>
                        <p>{deal.title}</p>
                        <div className={styles.rightPrices}>
                          <s className={styles.discount}>
                            <span className="visually-hidden">
                              {t("deals.previousPrice")}{" "}
                            </span>
                            {deal.oldPrice}
                          </s>
                          <span className={styles.newPrice}>{deal.price}</span>
                        </div>
                        <Link href={PRODUCTS_ROUTE} className={styles.rightLink}>
                          {t("common.actions.viewDetails")}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Container>
    </section>
  );
}
