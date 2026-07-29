"use client";

import Link from "next/link";
import { Container } from "react-bootstrap";

import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import TechnoLogo from "@/components/brand/TechnoLogo/TechnoLogo";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./Footer.module.css";

const linkGroups = [
  {
    titleKey: "footer.groups.discover.title",
    links: [
      { key: "footer.groups.discover.newArrivals", href: "/#new-arrivals" },
      { key: "footer.groups.discover.todaysPicks", href: "/#todays-picks" },
      { key: "footer.groups.discover.brands", href: "/#brand-showcase" },
    ],
  },
  {
    titleKey: "footer.groups.shop.title",
    links: [
      { key: "footer.groups.shop.allProducts", href: "/products" },
      { key: "footer.groups.shop.deals", href: "/#commerce-core" },
      { key: "footer.groups.shop.cart", href: "/cart" },
    ],
  },
  {
    titleKey: "footer.groups.account.title",
    links: [
      { key: "footer.groups.account.login", href: "/login" },
      { key: "footer.groups.account.register", href: "/register" },
      { key: "footer.groups.account.dashboard", href: "/dashboard" },
      { key: "footer.groups.account.verify", href: "/verify" },
    ],
  },
  {
    titleKey: "footer.groups.support.title",
    links: [{ key: "footer.groups.support.contact", href: "/contact" }],
  },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <Container fluid className={styles.container}>
        <div className={styles.main}>
          <div className={styles.brandColumn}>
            <Link className={styles.brand} href="/" aria-label={t("branding.homeLabel")}>
              <TechnoLogo
                variant="light"
                decorative
                className={styles.footerLogo}
                sizes="(max-width: 767px) 176px, 220px"
              />
            </Link>
            <p>{t("footer.description")}</p>
            <Link href="/products" className={styles.shopAction}>{t("footer.shopAction")}</Link>
          </div>

          <nav className={styles.linkGrid} aria-label={t("footer.navigationLabel")}>
            {linkGroups.map((group) => (
              <div className={styles.group} key={group.titleKey}>
                <h2>{t(group.titleKey)}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.key}><Link href={link.href}>{t(link.key)}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
          <LanguageSwitcher />
        </div>
      </Container>
    </footer>
  );
}
