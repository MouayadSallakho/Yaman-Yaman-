import "./globals.css";
import Navbarr from "@/components/Navbarr/Navbarr";
import { Inter, Cairo } from "next/font/google";
import { cookies } from "next/headers";

import CartDrawer from "@/components/cart/CartDrawer/CartDrawer";
import ToastProvider from "@/components/ui/Toaster/ToastProvider";
import AppearanceProvider from "@/context/AppearanceContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ThemeProvider from "@/context/ThemeContext";
import LocaleProvider from "@/i18n/LocaleProvider";
import { getServerI18n } from "@/i18n/server";
import {
  APPEARANCE_IDS,
  APPEARANCE_RESOLVED_HINT_KEY,
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  DEFAULT_THEME,
  THEME_IDS,
  THEME_STORAGE_KEY,
  normalizeAppearance,
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

/*
  Pre-paint appearance resolver.

  The server already emitted `data-appearance` from the preference cookie (and,
  for `system`, from the resolved-hint cookie), which covers every repeat visit.
  What the server cannot do is evaluate `prefers-color-scheme`, so this script
  closes the two remaining gaps before the first pixel:

    1. First ever visit with `system` on a dark OS — there is no hint yet, so
       the server emitted light. This corrects it.
    2. The OS scheme changed since the hint was written.

  It runs synchronously as the first child of <body>, so it executes before any
  content below it can paint. An explicit light/dark preference is never
  re-derived from the OS here: the preference wins, which is what makes "Dark"
  stay dark when the system later switches to light.
*/
const APPEARANCE_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;var k=${JSON.stringify(
  APPEARANCE_STORAGE_KEY
)};var h=${JSON.stringify(APPEARANCE_RESOLVED_HINT_KEY)};var a=${JSON.stringify(
  APPEARANCE_IDS
)};var s=null;try{s=localStorage.getItem(k);}catch(e){}var p=a.indexOf(s)>-1?s:d.getAttribute('data-appearance-preference');if(a.indexOf(p)<0)p=${JSON.stringify(
  DEFAULT_APPEARANCE
)};var r=p;if(p==='system'){r=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';}d.setAttribute('data-appearance-preference',p);d.setAttribute('data-appearance',r);document.cookie=k+'='+encodeURIComponent(p)+'; path=/; max-age=31536000; samesite=lax';document.cookie=h+'='+encodeURIComponent(r)+'; path=/; max-age=31536000; samesite=lax';}catch(e){}})();`;

/*
  Pre-paint gate: resolves the unresolved `checking` state that the server renders
  on <html> into either `show` or `skip`.

  Whether the intro is due depends on sessionStorage and the motion preference,
  neither of which exists on the server — so the server cannot decide, and this
  has to. What it must never do is let the *undecided* state look like the
  homepage: it used to, because the attribute was simply absent until this ran,
  and the stylesheet treated "not show" as "reveal the landing page". Any frame
  painted before this script executed therefore showed the homepage, and the
  intro then covered it — the "homepage → intro → homepage" flash.

  Now `checking` is its own state with its own neutral, intro-coloured frame, so
  the worst case is a neutral surface for a fraction of a frame, never content.
*/
const INTRO_BOOT_SCRIPT = `(function(){var d=document.documentElement;try{var r=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var h=location.pathname==='/';var seen=sessionStorage.getItem('mabco-intro-seen')==='1';d.setAttribute('data-mabco-intro',(h&&!r&&!seen)?'show':'skip');}catch(e){try{d.setAttribute('data-mabco-intro','skip');}catch(_){}}})();`;

export default async function RootLayout({ children }) {
  const { locale, dir, dict, t } = await getServerI18n();
  const cookieStore = await cookies();
  const initialTheme = normalizeTheme(
    cookieStore.get(THEME_STORAGE_KEY)?.value
  );

  /*
    Appearance is resolved server-side wherever that is possible at all.

    An explicit light/dark preference is fully knowable here, so those users get
    the correct document in the first byte with nothing left to correct. For
    `system` the OS scheme is unknowable on the server, so the last resolved
    value this device reported is used as the hint; the boot script re-resolves
    it before paint either way.
  */
  const appearancePreference = normalizeAppearance(
    cookieStore.get(APPEARANCE_STORAGE_KEY)?.value
  );
  const resolvedHint =
    cookieStore.get(APPEARANCE_RESOLVED_HINT_KEY)?.value === "dark" ? "dark" : "light";
  const initialAppearance =
    appearancePreference === "system" ? resolvedHint : appearancePreference;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${cairo.variable}`}
      data-theme={initialTheme}
      data-appearance={initialAppearance}
      data-appearance-preference={appearancePreference}
      /* Server-rendered so it is in the very first byte: the intro decision is
         not yet made. The boot script below resolves it to `show` or `skip`
         before hydration. See INTRO_BOOT_SCRIPT and the gate in globals.css. */
      data-mabco-intro="checking"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
        <LocaleProvider locale={locale} dir={dir} dict={dict}>
          <ThemeProvider initialTheme={initialTheme}>
            <AppearanceProvider
              initialPreference={appearancePreference}
              initialResolved={initialAppearance}
            >
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
            </AppearanceProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
