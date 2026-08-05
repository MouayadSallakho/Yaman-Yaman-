/**
 * Group a rail's products into paired pages.
 *
 * Each mobile rail page shows two products with the electric spine's reserved
 * corridor between them, so the rail advances a pair at a time rather than
 * sliding cards past the spine one by one. A collection with an odd count ends
 * on a page whose second slot is intentionally empty — the remaining product
 * still sits in its proper column beside the corridor instead of being
 * stretched or re-centred.
 *
 * Pure and shape-preserving: it only re-groups the records it is given, never
 * copies, reorders or invents product data.
 *
 * @template T
 * @param {T[]} items
 * @returns {Array<[T, T|null]>} pages of exactly two slots, `null` where empty
 */
export function toPairedPages(items) {
  if (!Array.isArray(items) || !items.length) return [];
  const pages = [];
  for (let i = 0; i < items.length; i += 2) {
    pages.push([items[i], items[i + 1] ?? null]);
  }
  return pages;
}
