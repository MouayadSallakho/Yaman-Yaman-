# Techno Solutions image asset guide

The project intentionally contains no final product or campaign images.
Every image area uses the reusable `AssetImage` placeholder and automatically
shows the real asset after you place a file at the exact path listed below.
No component code needs to change after an asset is added.

## General generation rules

- Use WebP unless transparency or brand tooling requires another format.
- Do not add text, prices, badges, logos, or buttons inside product images.
- Keep the product centred and let it occupy about 80-90% of the canvas.
- Avoid baked-in white borders and excessive transparent padding.
- Preserve the natural product aspect ratio; do not stretch it.
- Use a transparent or very light neutral background for product assets.
- Use consistent lighting and camera angle across related products.
- Export product assets at 1200 x 1200 px or larger.
- Export wide promotional assets at 1600 x 900 px or larger.
- Export brand marks on a transparent canvas, about 800 x 240 px.

## 1. Cinematic intro orbit

Place in `public/images/products/`:

- `boso-buds-pro.webp`
- `xioma-pro-smartphone.webp`
- `opplo-watch-3.webp`
- `boso-2-headphone.webp`
- `xioma-s9-plus.webp`
- `xioma-book-air.webp`

These are shown as compact floating product objects. Use transparent backgrounds
and keep the product visually large within the square canvas.

## 2. Main Pulse Commerce hero

This is the section containing Popular Categories, Deals of the Day, and Top
Sellers. The same product library is reused as categories rotate.

Place in `public/images/products/`:

- `xioma-15-green.webp`
- `xioma-15-blue.webp`
- `xioma-15-yellow.webp`
- `xioma-14-blue.webp`
- `xioma-14-pro.webp`
- `xioma-12-pro.webp`
- `xioma-s9-plus.webp`
- `clear-case-13.webp`
- `boso-2-headphone.webp`
- `xioma-pad-6.webp`
- `opplo-watch-3.webp`
- `opplo-pad-navy.webp`
- `xioma-book-air.webp`
- `sono-studio-24.webp`

For the four compact deal cards, keep one clear primary product and fill roughly
85% of the canvas. For featured products, transparent backgrounds work best.

## 3. Popular category carousel

Place in `public/images/categories/`:

- `gaming.webp`
- `sport-equipment.webp`
- `kitchen.webp`
- `robot-cleaner.webp`
- `mobiles.webp`
- `office.webp`
- `televisions.webp`
- `audio.webp`

Recommended: isolated category object, transparent background, 900 x 900 px.

## 4. Promotional row

Place in `public/images/promos/`:

- `sono-playgo-5.webp`
- `logitek-keyboard.webp`
- `xioma-sport-watch.webp`
- `okodo-hero-11.webp`

Recommended: 1600 x 1000 px. Leave safe negative space where the existing card
copy appears. Do not include text inside the generated artwork.

## 5. Product carousels and suggestions

These sections reuse the same assets from `public/images/products/` listed in
the Main Pulse Commerce hero section. You do not need duplicate files.

## 6. Deals section

Additional assets in `public/images/products/`:

- `boso-buds-3-white.webp`
- `boso-buds-3-black.webp`

The watch card reuses `opplo-watch-3.webp`.

## 7. Trending search feature

Reuses:

- `public/images/products/opplo-watch-3.webp`

## 8. Download app and cashback banners

Place in `public/images/promos/`:

- `cashback-banner.webp`
- `download-app-banner.webp`

Recommended: 1800 x 620 px. Keep the subject on the opposite side from the text
and preserve strong text contrast. Do not bake UI text into the image.

## 9. Brand marquee

Place in `public/images/brands/`:

- `grafbase.webp`
- `msi.webp`
- `jamx.webp`
- `digitek.webp`
- `ohbear.webp`
- `oak.webp`
- `stropi.webp`

Use transparent backgrounds and generous horizontal composition. The interface
handles grayscale and hover colour states.

## 10. Footer

The footer no longer requires image badges. App-store actions are rendered with
icons and accessible text, so no footer image files are required.

## How replacement works

1. Generate the asset.
2. Export it using the exact filename above.
3. Copy it into the exact folder under `public/images/`.
4. Refresh the development server.

The placeholder disappears automatically once the file loads successfully.

## New Arrivals

Place New Arrivals WebP assets in `public/images/new-arrivals/`. The complete manifest and generation guidance are in `NEW_ARRIVALS_IMAGE_GUIDE.md` at the project root.
