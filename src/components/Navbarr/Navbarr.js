"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  FiChevronDown,
  FiMenu,
  FiSearch,
  FiUser,
  FiX,
} from "react-icons/fi";

import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher/ThemeSwitcher";
import TechnoLogo from "@/components/brand/TechnoLogo/TechnoLogo";
import CartButton from "@/components/cart/CartButton/CartButton";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./Navbarr.module.css";

const ACCOUNT_LINKS = [
  { href: "/login", key: "common.nav.login" },
  { href: "/register", key: "common.nav.register" },
  { href: "/dashboard", key: "common.nav.dashboard" },
  { href: "/verify", key: "common.nav.verify" },
];

function isPathActive(pathname, href) {
  if (href === "/") return pathname === "/";
  if (href === "/products") return pathname.startsWith("/products");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbarr() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, dir } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [desktopMenu, setDesktopMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null);

  const accountWrapRef = useRef(null);
  const accountTriggerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const searchButtonRef = useRef(null);
  const mobileCloseButtonRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const mobilePanelRef = useRef(null);
  // Which control opened the drawer, so focus lands on the matching target and
  // returns to the right trigger on close.
  const openIntentRef = useRef("menu");
  const accountMenuId = useId();
  const mobileMenuId = useId();
  const mobileAccountGroupId = useId();

  const accountActive = ACCOUNT_LINKS.some((link) =>
    isPathActive(pathname, link.href)
  );

  const closeMobile = useCallback((restoreFocus = true) => {
    setMobileOpen(false);
    setMobileGroup(null);

    if (restoreFocus) {
      // Focus goes back to whichever control opened the drawer, not always the
      // menu button — otherwise using Search would silently move the user's
      // place in the header.
      const trigger =
        openIntentRef.current === "search"
          ? searchButtonRef.current
          : menuButtonRef.current;
      window.requestAnimationFrame(() =>
        (trigger ?? menuButtonRef.current)?.focus({ preventScroll: true })
      );
    }
  }, []);

  useEffect(() => {
    if (desktopMenu !== "account") return undefined;

    const onPointerDown = (event) => {
      if (!accountWrapRef.current?.contains(event.target)) {
        setDesktopMenu(null);
      }
    };

    const onFocusIn = (event) => {
      if (!accountWrapRef.current?.contains(event.target)) {
        setDesktopMenu(null);
      }
    };

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setDesktopMenu(null);
      window.requestAnimationFrame(() =>
        accountTriggerRef.current?.focus({ preventScroll: true })
      );
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [desktopMenu]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = mobilePanelRef.current;
    const focusable = () =>
      Array.from(
        panel?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) || []
      );

    // Opening via Search puts the caret straight in the search field; opening
    // via Menu starts at the close button as before.
    window.requestAnimationFrame(() => {
      const target =
        openIntentRef.current === "search"
          ? mobileSearchInputRef.current
          : mobileCloseButtonRef.current;
      (target ?? mobileCloseButtonRef.current)?.focus({ preventScroll: true });
    });

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobile(true);
        return;
      }

      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, closeMobile]);

  function submitSearch(event) {
    event.preventDefault();
    const query = searchText.trim();
    if (!query) return;
    closeMobile(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  }

  /**
   * Open the mobile drawer.
   *
   * Search has no separate overlay: the project's real compact mobile search is
   * the form inside this drawer, so the header's Search control opens that same
   * drawer with the field focused. This reuses the existing scroll lock, focus
   * trap, Escape handling and submit logic rather than adding a second search
   * surface.
   *
   * @param {"menu"|"search"} intent
   */
  function openMobile(intent = "menu") {
    openIntentRef.current = intent;
    setDesktopMenu(null);
    setMobileOpen(true);
  }

  function renderAccountPopover() {
    const open = desktopMenu === "account";

    return (
      <div className={styles.accountWrap} ref={accountWrapRef}>
        <button
          ref={accountTriggerRef}
          type="button"
          className={`${styles.utilityButton} ${
            accountActive ? styles.utilityActive : ""
          }`}
          aria-label={t("common.nav.account")}
          aria-expanded={open}
          aria-controls={accountMenuId}
          aria-haspopup="true"
          onClick={() =>
            setDesktopMenu((current) =>
              current === "account" ? null : "account"
            )
          }
        >
          <FiUser aria-hidden="true" />
        </button>

        {open ? (
          <nav
            className={`${styles.dropdown} ${styles.accountDropdown}`}
            id={accountMenuId}
            aria-label={t("navigation.groups.account")}
          >
            {ACCOUNT_LINKS.map((link) => {
              const active = isPathActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? styles.dropdownActive : ""}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setDesktopMenu(null)}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    );
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/*
          Physical-left zone (mobile only — `display: none` on desktop, so it is
          excluded from the desktop grid's auto-placement entirely). It comes
          before the logo in the DOM so the tab order matches the visual order:
          Menu → Logo → Search → Cart.
        */}
        <div className={styles.mobileLead}>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.navIcon}
            aria-label={t("navigation.openMenu")}
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            onClick={() => openMobile("menu")}
          >
            <FiMenu aria-hidden="true" />
          </button>
        </div>

        <Link
          href="/"
          className={styles.brand}
          aria-label={t("branding.homeLabel")}
        >
          <TechnoLogo
            variant="light"
            priority
            decorative
            className={styles.brandLogo}
            sizes="(max-width: 359px) 120px, (max-width: 1079px) 144px, 132px"
          />
        </Link>

        <nav
          className={styles.desktopNav}
          aria-label={t("navigation.mainLabel")}
        >
          <Link
            href="/"
            className={pathname === "/" ? styles.active : ""}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            {t("common.nav.home")}
          </Link>
          <Link
            href="/products"
            className={pathname.startsWith("/products") ? styles.active : ""}
            aria-current={
              pathname.startsWith("/products") ? "page" : undefined
            }
          >
            {t("common.nav.products")}
          </Link>
          <Link
            href="/contact"
            className={pathname === "/contact" ? styles.active : ""}
            aria-current={pathname === "/contact" ? "page" : undefined}
          >
            {t("common.nav.contact")}
          </Link>
        </nav>

        <div className={styles.desktopActions}>
          <form className={styles.search} onSubmit={submitSearch} role="search">
            <label className={styles.srOnly} htmlFor="site-search-desktop">
              {t("common.search.ariaLabel")}
            </label>
            <input
              id="site-search-desktop"
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={t("common.search.placeholder")}
            />
            <button
              type="submit"
              className={styles.searchSubmit}
              aria-label={t("common.search.submit")}
            >
              <FiSearch aria-hidden="true" />
            </button>
          </form>
          <ThemeSwitcher />
          <LanguageSwitcher />
          <CartButton className={styles.utilityButton} />
          {renderAccountPopover()}
        </div>

        {/* Physical-right zone: Search then Cart, matching the approved layout. */}
        <div className={styles.mobileActions}>
          <button
            ref={searchButtonRef}
            type="button"
            className={styles.navIcon}
            aria-label={t("common.search.ariaLabel")}
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            onClick={() => openMobile("search")}
          >
            <FiSearch aria-hidden="true" />
          </button>
          <CartButton className={styles.navIcon} />
        </div>
      </div>

      <div
        className={`${styles.mobileLayer} ${
          mobileOpen ? styles.mobileLayerOpen : ""
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={styles.mobileBackdrop}
          aria-label={t("navigation.closeMenu")}
          tabIndex={-1}
          onClick={() => closeMobile(true)}
        />
        <aside
          ref={mobilePanelRef}
          id={mobileMenuId}
          className={styles.mobilePanel}
          role="dialog"
          aria-modal="true"
          aria-label={t("navigation.mobileLabel")}
          dir={dir}
        >
          <div className={styles.mobileHeader}>
            <Link
              href="/"
              onClick={() => closeMobile(false)}
              aria-label={t("branding.homeLabel")}
            >
              <TechnoLogo variant="light" decorative />
            </Link>
            <button
              ref={mobileCloseButtonRef}
              type="button"
              className={styles.closeButton}
              aria-label={t("navigation.closeMenu")}
              onClick={() => closeMobile(true)}
            >
              <FiX aria-hidden="true" />
            </button>
          </div>

          <form className={styles.mobileSearch} onSubmit={submitSearch} role="search">
            <FiSearch aria-hidden="true" />
            <label className={styles.srOnly} htmlFor="site-search-mobile">
              {t("common.search.ariaLabel")}
            </label>
            <input
              ref={mobileSearchInputRef}
              id="site-search-mobile"
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={t("common.search.placeholder")}
            />
            <button type="submit">{t("common.search.submit")}</button>
          </form>

          <nav
            className={styles.mobileNav}
            aria-label={t("navigation.mainLabel")}
          >
            <Link
              href="/"
              onClick={() => closeMobile(false)}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              {t("common.nav.home")}
            </Link>
            <Link
              href="/products"
              onClick={() => closeMobile(false)}
              aria-current={
                pathname.startsWith("/products") ? "page" : undefined
              }
            >
              {t("common.nav.products")}
            </Link>

            <div className={styles.mobileGroup}>
              <button
                type="button"
                className={accountActive ? styles.mobileGroupActive : ""}
                aria-expanded={mobileGroup === "account"}
                aria-controls={mobileAccountGroupId}
                onClick={() =>
                  setMobileGroup((current) =>
                    current === "account" ? null : "account"
                  )
                }
              >
                {t("navigation.groups.account")}
                <FiChevronDown aria-hidden="true" />
              </button>
              {mobileGroup === "account" ? (
                <div
                  id={mobileAccountGroupId}
                  className={styles.mobileSubmenu}
                >
                  {ACCOUNT_LINKS.map((link) => {
                    const active = isPathActive(pathname, link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => closeMobile(false)}
                        aria-current={active ? "page" : undefined}
                      >
                        {t(link.key)}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <Link
              href="/contact"
              onClick={() => closeMobile(false)}
              aria-current={pathname === "/contact" ? "page" : undefined}
            >
              {t("common.nav.contact")}
            </Link>
          </nav>

          <div className={styles.mobileUtilities}>
            <ThemeSwitcher mode="inline" />
            <div className={styles.mobileLanguage}>
              <span>{t("common.language.change")}</span>
              <LanguageSwitcher onSwitch={() => closeMobile(false)} />
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
