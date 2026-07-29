/**
 * Locale configuration — the single source of truth for supported languages.
 *
 * The application uses a cookie + React-Context i18n model (no URL locale segment):
 * the active locale is stored in a cookie, read server-side in the root layout
 * so <html lang/dir> is correct on the first paint (no hydration flash), and
 * exposed to client components through LocaleProvider.
 */

/** @typedef {"en" | "ar"} Locale */

/** Ordered list of supported locales. English is the default/fallback. */
export const LOCALES = /** @type {const} */ (["en", "ar"]);

/** @type {Locale} */
export const DEFAULT_LOCALE = "en";

/** Cookie that persists the user's explicit choice (SSR-readable). */
export const LOCALE_COOKIE = "mabco_locale";

/** One year — the preference should survive refreshes and return visits. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Text direction per locale. */
const DIRECTIONS = { en: "ltr", ar: "rtl" };

/** Human-readable names shown in the language switcher (each in its own script). */
export const LOCALE_LABELS = { en: "English", ar: "العربية" };

/** Short badges for compact switcher UIs. */
export const LOCALE_SHORT_LABELS = { en: "EN", ar: "ع" };

/**
 * Narrow an untrusted value to a supported Locale, else the default.
 * Used everywhere a locale enters from the outside (cookie, header) so an
 * unsupported value can never crash rendering or load an arbitrary dictionary.
 * @param {unknown} value
 * @returns {Locale}
 */
export function normalizeLocale(value) {
  return LOCALES.includes(/** @type {Locale} */ (value))
    ? /** @type {Locale} */ (value)
    : DEFAULT_LOCALE;
}

/**
 * @param {Locale} locale
 * @returns {"ltr" | "rtl"}
 */
export function directionOf(locale) {
  return DIRECTIONS[normalizeLocale(locale)];
}

/**
 * @param {Locale} locale
 * @returns {boolean}
 */
export function isRtl(locale) {
  return directionOf(locale) === "rtl";
}
