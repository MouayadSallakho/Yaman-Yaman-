/**
 * Canonical Techno Solutions appearance configuration.
 *
 * Keep theme ids, labels and preview swatches in one module so the root
 * pre-paint script, ThemeProvider and both desktop/mobile selectors cannot
 * drift apart.
 *
 * Two INDEPENDENT axes are configured here:
 *
 *   accent theme  - which brand identity   (5 values, `data-theme`)
 *   appearance    - light / system / dark  (`data-appearance` holds the
 *                   RESOLVED light|dark; "system" never reaches the DOM)
 *
 * Every combination is valid: Royal Violet + Dark, Emerald Pulse + Light,
 * Tech Blue + System, and so on. Dark mode is not a sixth theme.
 */
export const DEFAULT_THEME = "original-tech-blue";
export const THEME_STORAGE_KEY = "techno-solutions-theme-v1";
export const THEME_EVENT = "techno-solutions-theme-change";

export const THEMES = Object.freeze([
  {
    id: "original-tech-blue",
    labelKey: "theme.options.originalTechBlue",
    swatches: ["#0492d0", "#037bb0", "#5ad8c5"],
  },
  {
    id: "aurora-cyan",
    labelKey: "theme.options.auroraCyan",
    swatches: ["#078f92", "#2478e8", "#5ad8c5"],
  },
  {
    id: "royal-violet",
    labelKey: "theme.options.royalViolet",
    swatches: ["#5b4bd8", "#8a63dc", "#5ad8c5"],
  },
  {
    id: "emerald-pulse",
    labelKey: "theme.options.emeraldPulse",
    swatches: ["#0d7a63", "#0a6552", "#2dd4bf"],
  },
  {
    id: "graphite-amber",
    labelKey: "theme.options.graphiteAmber",
    swatches: ["#2c313a", "#8a5d00", "#f2b84b"],
  },
]);

export const THEME_IDS = Object.freeze(THEMES.map(({ id }) => id));
const VALID_THEME_IDS = new Set(THEME_IDS);

export function normalizeTheme(value) {
  return VALID_THEME_IDS.has(value) ? value : DEFAULT_THEME;
}

/* ------------------------------------------------------------------ */
/* Appearance                                                          */
/* ------------------------------------------------------------------ */

export const DEFAULT_APPEARANCE = "system";
export const APPEARANCE_STORAGE_KEY = "techno-solutions-appearance-v1";
export const APPEARANCE_EVENT = "techno-solutions-appearance-change";

/*
  Cache of what `system` last resolved to on this device.

  It lives here, in a plain shared module, and NOT in the provider: the root
  layout is a server component, and a server component importing a named export
  from a "use client" module gets a client-reference proxy rather than the
  value. That silently produced a cookie literally named "undefined".

  This is a hint, never a preference. Losing it costs one pre-paint correction;
  it must never be read as "the user chose dark".
*/
export const APPEARANCE_RESOLVED_HINT_KEY =
  "techno-solutions-appearance-v1-resolved";

/** What the user can choose. `system` is a preference, not a rendered state. */
export const APPEARANCES = Object.freeze([
  { id: "light", labelKey: "appearance.options.light" },
  { id: "system", labelKey: "appearance.options.system" },
  { id: "dark", labelKey: "appearance.options.dark" },
]);

export const APPEARANCE_IDS = Object.freeze(APPEARANCES.map(({ id }) => id));
const VALID_APPEARANCE_IDS = new Set(APPEARANCE_IDS);

/** Preference as stored. Never assume this is the rendered appearance. */
export function normalizeAppearance(value) {
  return VALID_APPEARANCE_IDS.has(value) ? value : DEFAULT_APPEARANCE;
}

/**
 * Resolve a preference to what the DOM should actually render.
 *
 * `system` is resolved against the OS at call time, so the stored preference
 * stays "system" forever and only the resolved value moves when the OS flips.
 * Persisting the resolved value instead would silently convert "follow my OS"
 * into "explicitly dark", which is the bug this separation exists to prevent.
 *
 * @param {string} preference light | system | dark
 * @param {boolean} systemPrefersDark result of the media query
 * @returns {"light"|"dark"}
 */
export function resolveAppearance(preference, systemPrefersDark) {
  const pref = normalizeAppearance(preference);
  if (pref === "light") return "light";
  if (pref === "dark") return "dark";
  return systemPrefersDark ? "dark" : "light";
}

export const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
