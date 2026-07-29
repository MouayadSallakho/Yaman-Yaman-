# Techno Solutions Storefront

A Next.js 16 ecommerce storefront with a responsive shop, XIOMA product demo, official Fancybox gallery, cart drawer/page, English/Arabic localization, RTL support, three selectable themes and stable image placeholders.

## Requirements

- Node.js `20.9.0` or newer
- npm

On the Windows environment used for this project, set the network-family timeout before npm commands:

```powershell
$env:NODE_OPTIONS="--network-family-autoselection-attempt-timeout=5000"
```

## Install and run

```powershell
npm ci
npm run dev
```

Open:

```text
http://localhost:3000
```

Validation:

```powershell
npm run lint
npm run build
```

## Main pages

- `/` — Home
- `/products` — Shop / products
- `/products/xioma-x15-ultra` — XIOMA X15 Ultra manager-demo page
- `/cart` — Cart
- `/contact` — Contact stub
- `/login` — Login
- `/register` — Register
- `/verify?email=user@example.com` — Verify account
- `/dashboard` — Dashboard stub

See [`TECHNO_SOLUTIONS_URL_MAP.md`](./TECHNO_SOLUTIONS_URL_MAP.md) for full URLs, route status, query examples and missing destinations.

## Themes

The header appearance control switches between:

1. Original Tech Blue (default)
2. Aurora Cyan
3. Royal Violet

Theme colors are centralized in:

- `src/styles/tokens.css`
- `src/styles/themes.css`
- `src/styles/legacy-tones.css`

The selected theme persists through a cookie and local storage.

## Techno Solutions logo

The supplied official raster reference is retained under `public/brand/`. The project did not contain the original licensed font or source vector, so it uses transparent assets derived from the supplied reference rather than an approximate replacement font.

## Image placeholder workflow

Final product imagery is intentionally not bundled. Reusable image slots remain stable until expected files are added under `public/images/`. See [`IMAGE_ASSET_GUIDE.md`](./IMAGE_ASSET_GUIDE.md) and the section-specific image guides.

## Implementation and validation

- [`TECHNO_SOLUTIONS_IMPLEMENTATION_REPORT.md`](./TECHNO_SOLUTIONS_IMPLEMENTATION_REPORT.md)
- [`STATIC_VALIDATION.txt`](./STATIC_VALIDATION.txt)
