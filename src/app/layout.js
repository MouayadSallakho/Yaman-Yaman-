import "./globals.css";
import Navbarr from "@/components/Navbarr/Navbarr";
import { Inter, Cairo } from "next/font/google";
import { cookies } from "next/headers";

import CartDrawer from "@/components/cart/CartDrawer/CartDrawer";
import ToastProvider from "@/components/ui/Toaster/ToastProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ThemeProvider from "@/context/ThemeContext";
import LocaleProvider from "@/i18n/LocaleProvider";
import { getServerI18n } from "@/i18n/server";
import {
  DEFAULT_THEME,
  THEME_IDS,
  THEME_STORAGE_KEY,
  normalizeTheme,
} from "@/theme/config";

// Latin display font (unchanged) + an Arabic-capable font. Both are loaded via
// next/font (self-hosted, no runtime CSS fetch, no layout shift) and exposed as
// CSS variables; globals.css picks the right family from the document `dir`.
const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-latin",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-arabic",
});

export async function generateMetadata() {
  const { t, locale } = await getServerI18n();
  return {
    title: {
      default: t("metadata.root.title"),
      template: "%s | Techno Solutions",
    },
    description: t("metadata.root.description"),
    openGraph: {
      title: t("metadata.root.title"),
      description: t("metadata.root.description"),
      locale: locale === "ar" ? "ar_AR" : "en_US",
      type: "website",
      siteName: "Techno Solutions",
    },
    applicationName: "Techno Solutions",
    icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
    twitter: {
      card: "summary_large_image",
      title: t("metadata.root.title"),
      description: t("metadata.root.description"),
    },
  };
}

// Hydration-safe theme fallback: the server renders the cookie value, while
// this blocking script can recover a valid localStorage choice when cookies
// are unavailable or were cleared. It also re-synchronizes the cookie.
const THEME_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;var k=${JSON.stringify(
  THEME_STORAGE_KEY
)};var a=${JSON.stringify(THEME_IDS)};var s=localStorage.getItem(k);var t=a.indexOf(s)>-1?s:d.getAttribute('data-theme');if(a.indexOf(t)<0)t=${JSON.stringify(
  DEFAULT_THEME
)};d.setAttribute('data-theme',t);document.cookie=k+'='+encodeURIComponent(t)+'; path=/; max-age=31536000; samesite=lax';}catch(e){}})();`;

// Pre-paint gate: runs synchronously before hydration and before the first
// meaningful paint, so the very first frame is already the correct state.
const INTRO_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;var r=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var h=location.pathname==='/';var seen=sessionStorage.getItem('mabco-intro-seen')==='1';d.setAttribute('data-mabco-intro',(h&&!r&&!seen)?'show':'skip');}catch(e){try{document.documentElement.setAttribute('data-mabco-intro','skip');}catch(_){}}})();`;

export default async function RootLayout({ children }) {
  const { locale, dir, dict, t } = await getServerI18n();
  const cookieStore = await cookies();
  const initialTheme = normalizeTheme(
    cookieStore.get(THEME_STORAGE_KEY)?.value
  );

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${cairo.variable}`}
      data-theme={initialTheme}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
        <LocaleProvider locale={locale} dir={dir} dict={dict}>
          <ThemeProvider initialTheme={initialTheme}>
            <AuthProvider>
              {/* Cart state wraps the header and every page, so the badge, the
                  drawer and /cart all read the one canonical cart. */}
              <CartProvider>
                <ToastProvider>
                  <a href="#main-content" className="skip-link">
                    {t("common.skipToContent")}
                  </a>
                  <Navbarr />
                  {children}
                  {/* Mounted once at the root so it overlays any route. */}
                  <CartDrawer />
                </ToastProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
