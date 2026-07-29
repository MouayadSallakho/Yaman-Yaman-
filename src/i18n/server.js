import "server-only";
import { cookies } from "next/headers";

import en from "./dictionaries/en";
import ar from "./dictionaries/ar";
import {
  LOCALE_COOKIE,
  normalizeLocale,
  directionOf,
  DEFAULT_LOCALE,
} from "./config";
import { createTranslator, collectKeys } from "./translate";

const DICTIONARIES = { en, ar };

// Development-only completeness check: log any key present in English but
// missing in Arabic (or vice-versa). Runs once per server process.
if (process.env.NODE_ENV !== "production") {
  const enKeys = new Set(collectKeys(en));
  const arKeys = new Set(collectKeys(ar));
  const missingInAr = [...enKeys].filter((k) => !arKeys.has(k));
  const missingInEn = [...arKeys].filter((k) => !enKeys.has(k));
  if (missingInAr.length || missingInEn.length) {
    console.warn(
      "[i18n] Dictionary mismatch —",
      missingInAr.length ? `missing in ar: ${missingInAr.join(", ")}` : "",
      missingInEn.length ? `missing in en: ${missingInEn.join(", ")}` : ""
    );
  }
}

/**
 * The active locale for this request, read from the persistence cookie and
 * validated against the supported list. Falls back to English.
 * @returns {Promise<import("./config").Locale>}
 */
export async function getLocale() {
  try {
    const store = await cookies();
    return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * The dictionary object for a locale (server-side only).
 * @param {import("./config").Locale} locale
 */
export function getDictionary(locale) {
  return DICTIONARIES[normalizeLocale(locale)];
}

/**
 * Everything a Server Component needs to render localised markup + metadata.
 */
export async function getServerI18n() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    locale,
    dir: directionOf(locale),
    dict,
    t: createTranslator(dict, locale),
  };
}
