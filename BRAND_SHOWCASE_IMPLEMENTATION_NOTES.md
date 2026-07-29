# Brand Showcase implementation notes

## Placement

The section is rendered immediately after `NewArrivalsSection` in `src/app/page.js`.

## Architecture

- `BrandShowcaseSection.jsx` — section composition and landing-page boundary.
- `FeaturedBrandCard.jsx` — cinematic XIOMA brand experience.
- `BrandCard.jsx` — reusable brand discovery card.
- `BrandBenefitsStrip.jsx` — four-item reassurance strip.
- `data.js` — brand records, image manifest, navigation destinations, and benefit configuration.
- `useBrandShowcaseMotion.js` — reduced-motion-aware GSAP entrance sequence.
- `BrandShowcaseSection.module.css` — responsive visual system and brand-specific motifs.

## Navigation

The project does not currently expose dedicated brand pages. All brand actions therefore use the existing `/products` route with meaningful search parameters. No fake links or placeholder click handlers were added.

## Images

No product image was generated, restored, or downloaded. The section reuses the shared `AssetImage` boundary and expects assets under `public/images/brand-showcase/`. Missing files show stable placeholders and do not cause layout shift.

## Motion

The Brand Showcase uses the existing GSAP stack. Its entrance differs from New Arrivals by using:

- a horizontal mask reveal for the featured card;
- sequenced featured copy and neon-stage motion;
- an edge-origin wave for the six brand cards;
- a final reassurance-strip reveal.

Reduced-motion users receive immediately visible content without mask, stagger, or decorative motion.

## Validation performed

- JavaScript and JSX syntax parsed successfully with the TypeScript compiler API.
- Local import paths resolved.
- CSS Module references and dynamic brand-variant classes resolved.
- CSS braces are balanced.
- English and Arabic dictionaries have matching keys.
- Brand Showcase translation references resolve.
- The seven expected image paths match the image guide.
- The Brand Showcase image folder contains no generated product images.

A full Next.js build and ESLint run could not be completed in the execution environment because `npm ci` received HTTP 503 responses from the internal npm package registry. Run the standard commands locally after extraction.
