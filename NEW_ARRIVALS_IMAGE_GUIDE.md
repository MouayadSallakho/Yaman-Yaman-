# New Arrivals image guide

Place every generated asset in:

```text
public/images/new-arrivals/
```

The section already contains resilient placeholders. A real image appears automatically as soon as its file is added at the matching path; no component edit is required.

## Shared generation rules

- Format: WebP.
- Do not place product names, prices, badges, buttons, specifications, logos, or watermarks inside the image.
- Keep the product sharp and fully visible; do not stretch it.
- Use one consistent studio-lighting language across the collection.
- Keep important product details away from the outer 6% safe area.
- Avoid excessive baked-in whitespace.
- Do not use official real-world brand marks. These are fictional products.

### Featured images

- Recommended dimensions: **1600 × 1200 px** or larger.
- Aspect ratio: **4:3**.
- Use a premium navy/blue designed background with controlled light arcs or glow.
- Product should occupy approximately **75–85%** of the canvas.
- Keep the lower 28–32% visually calm because HTML product information overlays that area.
- The composition may contain a front-and-back product pair where appropriate.

### Smaller product-card images

- Recommended dimensions: **1200 × 900 px** or larger.
- Aspect ratio: **4:3**.
- Product should occupy approximately **80–88%** of the canvas.
- Use a clean white, ice-blue, or subtle category-tinted studio background.
- Transparent backgrounds are acceptable, but a polished 4:3 designed background will match the target most closely.

## Asset manifest

| Filename | Use | Product concept | Composition guidance |
|---|---|---|---|
| `xioma-15-pro-blue-titanium.webp` | All — featured | Metallic blue premium smartphone pair | Front and rear phones, dark blue light arcs, calm lower overlay zone |
| `xioma-15-mint-green.webp` | All — card | Mint-green flagship smartphone | Front/rear pair, bright ice-blue studio background |
| `novabuds-pro-white.webp` | All/Audio — card | White premium wireless earbuds | Open case, earbuds large and centered, clean pale-blue background |
| `pulse-3-midnight.webp` | All/Wearables — card | Dark rectangular smartwatch | Three-quarter angle, midnight band, cool studio glow |
| `shield-case-clear.webp` | All/Accessories — card | Transparent magnetic phone case | Dynamic three-quarter angle, visible magnetic ring, blue light streak |
| `xioma-16-ultra-silver.webp` | Phones — featured | Silver ultra flagship smartphone pair | Premium silver/titanium finish, navy-blue environment, calm lower zone |
| `xioma-15-pro-blue.webp` | Phones — card | Deep-blue professional smartphone | Large two-device composition, pale-blue background |
| `nova-x2-black.webp` | Phones — card | Minimal black smartphone | Front/rear pair, subtle graphite reflections |
| `orbit-fold-violet.webp` | Phones — card | Violet foldable smartphone | Half-open foldable, violet/cyan rim light |
| `xioma-lite-coral.webp` | Phones — card | Slim coral smartphone | Soft coral accent, clean white/blue studio set |
| `novabuds-max-feature.webp` | Audio — featured | Premium silver over-ear headphones | Large headphones, deep-blue acoustic light waves, calm lower zone |
| `soniq-studio-headphones.webp` | Audio — card | Black reference headphones | Three-quarter angle, subtle waveform lighting |
| `pulse-speaker-mini.webp` | Audio — card | Compact blue wireless speaker | Product large and centered, soft circular sound-wave background |
| `orbit-soundbar.webp` | Audio — card | Slim premium soundbar | Wide product composition, blue cinematic glow |
| `pulse-watch-ultra-feature.webp` | Wearables — featured | Titanium rugged smartwatch | Hero watch with second angled view, navy outdoor-tech background |
| `orbit-fit-band.webp` | Wearables — card | Graphite fitness band | Curved band, bright readable screen, clean studio background |
| `nova-watch-classic.webp` | Wearables — card | Steel classic smartwatch | Round premium case and leather/metal strap |
| `luma-smart-ring.webp` | Wearables — card | Titanium smart ring | Macro product render, subtle blue health-data glow |
| `shield-accessory-bundle.webp` | Accessories — featured | Case, charger, stand, power-bank bundle | Cohesive grouped composition on navy/blue set, calm lower zone |
| `nova-fast-charger.webp` | Accessories — card | Compact 45W GaN charger | Large charger with cable detail, pale-blue studio background |
| `orbit-magnetic-stand.webp` | Accessories — card | Adjustable aluminum magnetic stand | Three-quarter angle with mounted phone silhouette optional |
| `pulse-power-bank.webp` | Accessories — card | Magnetic 10,000mAh power bank | Product attached to phone or isolated, clean premium lighting |

## Gemini prompt pattern

Use this structure for each asset:

```text
Create a premium fictional consumer-electronics product render for an ecommerce card.
Product: [PRODUCT CONCEPT].
Canvas: 4:3, [1600x1200 featured / 1200x900 card].
The product fills [80%] of the frame, remains fully visible, and has minimal empty margins.
Use refined blue-white studio lighting, realistic materials, crisp edges, and a high-end electronics-store aesthetic.
Do not include words, logos, prices, UI controls, badges, or watermarks.
Export-ready composition for WebP.
[For featured: keep the lower 30% visually calm for an HTML information overlay.]
```
