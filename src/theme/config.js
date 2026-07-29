/**
 * Canonical Techno Solutions appearance configuration.
 *
 * Keep theme ids, labels and preview swatches in one module so the root
 * pre-paint script, ThemeProvider and both desktop/mobile selectors cannot
 * drift apart.
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
]);

export const THEME_IDS = Object.freeze(THEMES.map(({ id }) => id));
const VALID_THEME_IDS = new Set(THEME_IDS);

export function normalizeTheme(value) {
  return VALID_THEME_IDS.has(value) ? value : DEFAULT_THEME;
}
