# Today’s Picks Implementation Notes

## Purpose

The former `Suggest Today` product grid was replaced with a manual, editorial product spotlight. This avoids false personalization and creates a visual rhythm that is different from New Arrivals and Brand Showcase.

## Placement

The landing-page order is now:

1. Pulse Commerce Hero
2. New Arrivals
3. Today’s Picks
4. Brand Showcase
5. Remaining existing sections

## Architecture

- `TodaysPicksSection.jsx`: selection state, transition orchestration, price formatting, and section composition
- `TodaysPicksHeader.jsx`: semantic heading and real products-route action
- `ProductSpotlight.jsx`: active product visual, editorial rationale, feature chips, price, and product-details navigation
- `PickSelectorRail.jsx`: accessible tab pattern with roving tabindex and arrow/Home/End keyboard navigation
- `data.js`: catalogue-linked product identity plus separate editorial recommendation metadata
- `useTodaysPicksMotion.js`: existing GSAP system integration, IntersectionObserver entrance, and reduced-motion handling
- `TodaysPicksSection.module.css`: responsive visual system and product-specific accents

## Product behavior

No functional cart infrastructure exists in the project, so the section does not display a fake Add to Cart control. Every product action uses the existing `/products?search=...` route.

## Images

No images were generated, downloaded, or restored. Add the five expected WebP assets under `public/images/todays-picks/`. Until then, the existing `AssetImage` component displays stable placeholders without layout shift.

## Removed legacy code

The old `src/components/suggestToday/` grid and carousel implementation was removed after confirming it was referenced only by the landing page. Its obsolete translation namespace was also removed.
