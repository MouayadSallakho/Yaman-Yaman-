/**
 * Pure translation helpers shared by the server loader and the client provider.
 * No React, no browser/server-only APIs — safe to import from either side.
 */

/**
 * Resolve a dotted key path (e.g. "common.actions.save") against a dictionary.
 * @param {Record<string, any>} dict
 * @param {string} key
 * @returns {unknown}
 */
export function resolveKey(dict, key) {
  return key
    .split(".")
    .reduce(
      (acc, part) =>
        acc && typeof acc === "object" ? acc[part] : undefined,
      dict
    );
}

/**
 * Replace {token} placeholders with values from `vars`.
 * @param {string} template
 * @param {Record<string, string|number>} [vars]
 */
export function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match
  );
}

/**
 * Build a `t()` translator bound to one dictionary + locale.
 * Missing keys warn in development and fall back to the key itself (never
 * blank), so a gap is visible but never crashes or hides content.
 * @param {Record<string, any>} dict
 * @param {string} locale
 */
export function createTranslator(dict, locale) {
  return function t(key, vars) {
    const value = resolveKey(dict, key);

    if (value === undefined) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] Missing key "${key}" for locale "${locale}".`);
      }
      return key;
    }

    if (typeof value === "string") return interpolate(value, vars);
    // Arrays/objects (e.g. bullet lists) are returned untouched.
    return value;
  };
}

/**
 * Collect every leaf key path in a dictionary (for completeness checks).
 * @param {Record<string, any>} obj
 * @param {string} [prefix]
 * @returns {string[]}
 */
export function collectKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...collectKeys(v, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}
