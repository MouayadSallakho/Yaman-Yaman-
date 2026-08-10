import Link from "next/link";
import { FiArrowRight, FiGrid, FiShoppingBag, FiUser } from "react-icons/fi";

import ContactForm from "@/components/contact/ContactForm";
import styles from "@/components/contact/ContactPage.module.css";
import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return {
    title: t("metadata.contact.title"),
    description: t("metadata.contact.description"),
  };
}

/*
  Only routes that exist in this application are listed. The reference design
  also carried a Help Center, an FAQ, a returns portal and a warranty page;
  none of those routes exist here, and linking to them would reintroduce the
  visible-link-to-404 problem. `/dashboard` is deliberately absent too — it is
  the admin surface and is marked noindex.
*/
const SELF_SERVICE = [
  { key: "products", href: "/products", Icon: FiGrid },
  { key: "cart", href: "/cart", Icon: FiShoppingBag },
  { key: "account", href: "/login", Icon: FiUser },
];

export default async function ContactPage() {
  const { t } = await getServerI18n();

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.container}>
        {/*
          Deliberately light: a heading, one sentence and a rule. No Swiper, no
          GSAP timeline, no hero artwork — the reference's product still-life has
          no equivalent asset in this repository, and the job of this band is to
          hand the visitor straight to the form.
        */}
        <section className={styles.hero}>
          <p className={styles.heroEyebrow}>{t("contact.hero.eyebrow")}</p>
          <h1 className={styles.heroTitle}>{t("contact.hero.title")}</h1>
          <span className={styles.heroRule} aria-hidden="true" />
          <p className={styles.heroIntro}>{t("contact.hero.intro")}</p>
        </section>

        <div className={styles.layout}>
          <ContactForm />

          {/*
            The reference's support column (email, phone, address, opening
            hours, map) is not reproduced: the repository holds none of those
            values, and inventing them would put false business contact details
            in front of customers. What remains is true — three routes that work
            right now.
          */}
          <aside className={styles.aside} aria-labelledby="contact-self-service">
            <div className={styles.asideCard}>
              <h2 id="contact-self-service" className={styles.asideTitle}>
                {t("contact.selfService.title")}
              </h2>
              <p className={styles.asideDescription}>
                {t("contact.selfService.description")}
              </p>

              <ul className={styles.linkList}>
                {SELF_SERVICE.map(({ key, href, Icon }) => (
                  <li key={key}>
                    <Link href={href} className={styles.linkItem}>
                      <span className={styles.linkIcon} aria-hidden="true">
                        <Icon />
                      </span>
                      <span className={styles.linkLabel}>
                        {t(`contact.selfService.${key}`)}
                      </span>
                      <FiArrowRight className={styles.linkArrow} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
