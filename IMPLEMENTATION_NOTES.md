# Hero and image-placeholder implementation notes

## Main hero changes

- Preserved the `PulseCommerceHero` component structure and all existing
  `data-pulse-*` animation hooks.
- Preserved the GSAP master sequence, category rotation, connector pulses,
  deal-card stagger, featured animation, and seller-card flip order.
- Expanded the controlled page container for a stronger three-column desktop
  composition.
- Refined the outer blue-white background, borders, radii, ambient shadows,
  card hierarchy, and responsive behaviour.
- Increased compact deal media areas and top-seller media areas.
- Improved featured-deal proportions and made its media column more prominent.
- Added consistent image scaling and hover treatment without introducing a
  second animation library.

## Image workflow

- Removed all bundled final image assets from `public/images`.
- Replaced direct image rendering with a reusable `AssetImage` boundary.
- Every image area displays a labelled placeholder until the expected file is
  added.
- The real image appears automatically when the exact file is copied into
  `public/images`.
- Replaced obsolete image filenames such as `.png.png` and filenames containing
  spaces with structured, production-safe paths.
- Replaced footer store badge images with accessible icon-and-text controls.
- Replaced auth-page and legacy CSS image backgrounds with CSS gradients.

## Validation performed

- Parsed every JS and JSX source file with the TypeScript parser: no syntax
  errors found.
- Checked local imports: no unresolved local imports found.
- Checked CSS-module references: all static `styles.*` references resolve.
- Checked CSS brace balance: no malformed stylesheets found.
- Checked that legacy direct `next/image` usage remains only inside the reusable
  `AssetImage` component.

## Build limitation

`npm ci` could not be executed in the current container environment, so a full
Next.js production build was not available here. Run `npm ci`, `npm run lint`,
and `npm run build` locally after extraction.

## New Arrivals section

- Inserted directly after `PulseCommerceHero` in `src/app/page.js`.
- Added five functional collections: All, Phones, Audio, Wearables, and Accessories.
- Each tab renders one featured product and four compact products from a shared data model.
- Added ARIA tab semantics and Left/Right/Home/End keyboard navigation.
- Because the project has no cart implementation, compact card actions navigate to product search results instead of pretending to add items to a cart.
- Added GSAP entrance and tab-change transitions using the project's existing animation dependency, including reduced-motion handling and cleanup.
- Reused `AssetImage`; extended it with an optional dark placeholder tone for the featured product stage.
- No final product images were generated or downloaded. Expected assets live under `public/images/new-arrivals/` and are documented in `NEW_ARRIVALS_IMAGE_GUIDE.md`.

## Brand Showcase section

- Added a data-driven Brand Showcase immediately after New Arrivals.
- Added one cinematic featured brand, six brand discovery cards, and four reassurance items.
- Added GSAP entrance motion with a masked featured-card reveal and a distinct wave pattern for the small cards.
- Reused `AssetImage` for stable placeholders under `/public/images/brand-showcase/`.
- Added English and Arabic localization and real `/products` search navigation.
- No final image assets were generated, restored, or downloaded.
