# XIOMA X15 Ultra Manager Demo — Implementation Notes

## Route

```text
/products/xioma-x15-ultra
```

The page is implemented as a normal Next.js App Router route and supports direct navigation and browser refresh.

## Product experience

- The project does not contain a valid GLB/GLTF product model or an existing WebGL stack.
- The implementation therefore uses an honest **3D-style gallery**, not a false genuine-3D claim.
- Five perspective panels, circular stage lighting, pointer dragging, touch swiping, arrows, thumbnails, and keyboard controls create the spatial product experience.
- The gallery does not autoplay.

## Fancybox

- Official `@fancyapps/ui` integration is configured programmatically.
- The complete eight-slide gallery opens at the clicked slide.
- Real files open as image slides.
- Missing files open as branded HTML placeholder slides, so the manager demo remains usable before Gemini assets are produced.
- Fancybox bindings and instances are cleaned up when the component unmounts.
- Review Fancyapps licensing before production deployment.

## Purchase behavior

The current project has no real cart or checkout infrastructure. Add to Cart, Buy Now, and Wishlist are deliberately implemented as manager-demo UI feedback through the existing Toast component. No transaction or fake checkout route is created.

## Reviews

Review content is static demonstration copy. No fake submission form or claim of live customer data is included.

## Localization

Every new visible label is available in English and Arabic dictionaries. Direction-aware gallery arrows, keyboard navigation, breadcrumbs, and the existing application language provider are preserved.

## Validation limitation

The source was statically validated for syntax, local imports, CSS Modules, translation parity, image manifest paths, and ZIP integrity. Complete dependency installation and the Next.js runtime build depend on registry availability for `@fancyapps/ui` and the project’s existing packages.

## Fancybox package decision

The official `@fancyapps/ui` dependency is intentionally retained. It provides the requested production-grade lightbox, image zoom, fullscreen mode, keyboard navigation, focus management, gestures, and thumbnail navigation. Do not replace it with the temporary built-in lightbox workaround unless the product requirements change.
