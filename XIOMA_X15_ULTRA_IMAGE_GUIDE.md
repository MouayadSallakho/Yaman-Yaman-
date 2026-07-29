# XIOMA X15 Ultra — Image Production Guide

Place every final asset in:

```text
public/images/products/xioma-x15-ultra/
```

The page is already wired to these paths. Missing files display stable Techno Solutions placeholders in both the page gallery and Fancybox.

## Shared visual rules

- Minimum working canvas: **1600 × 1600 px**.
- Square or near-square composition.
- Keep one consistent Frost Silver phone design, camera module, button placement, and proportions across all images.
- The product should occupy roughly **78–88%** of the usable canvas.
- Use premium silver, ice-blue, navy, and soft-white lighting.
- Avoid excessive baked-in whitespace.
- Do not include product names, prices, badges, CTA buttons, UI text, or watermarks.
- Transparent WebP is preferred for isolated product angles used by the 3D-style stage.
- Full-background images are suitable for lifestyle and camera-sample views.
- Keep important product edges inside a 7% safe area so Fancybox and responsive crops do not cut them.

## Asset manifest

### `01-frost-silver-back.webp`
- Main default gallery visual and first Fancybox slide.
- Three-quarter rear view showing the complete circular camera system.
- Transparent background preferred.
- Center the product with a small rightward turn and clear floor shadow.

### `02-frost-silver-front.webp`
- Front display view.
- Use a refined blue abstract screen graphic without embedded text.
- Transparent background preferred.
- Keep bezel and screen proportions identical to the rear-view device.

### `03-frost-silver-side.webp`
- Precision side profile.
- Show frame thickness, buttons, and camera projection clearly.
- Transparent background required where practical.
- Scale the device large enough that the profile is still readable in a thumbnail.

### `04-camera-closeup.webp`
- Macro image of the camera module and Frost Silver material.
- Used in the gallery and Overview panel.
- Full-background studio composition is acceptable.
- Leave negative space around the module for responsive cropping.

### `05-box-contents.webp`
- Phone, box, USB-C cable, protective case, SIM tool, documentation, and demo 80W adapter.
- Clean top-down or three-quarter arrangement.
- Light neutral background.
- Keep individual items visually separated.

### `06-hand-lifestyle.webp`
- XIOMA X15 Ultra held naturally in one hand.
- Premium minimal environment; no identifiable face required.
- Full-background image.
- Keep the phone as the strongest focal point.

### `07-camera-sample.webp`
- Premium blue-hour mountain, architectural, or cityscape camera-sample concept.
- Used in the gallery and Camera tab.
- Full-background image; 16:10-safe central composition within the square canvas.
- No fake camera settings or text overlays.

### `08-material-detail.webp`
- Frost Silver frame, glass edge, speaker, or button-detail macro.
- Full-background studio composition.
- Emphasize texture, machining, and reflections without changing the established device design.

## Optional genuine 3D model

```text
public/images/products/xioma-x15-ultra/xioma-x15-ultra.glb
```

A model is optional and is **not required by the implemented demo**. The delivered page uses an honest 3D-style image gallery. A future real model should be optimized for web delivery, use compressed textures, and include a static fallback.

## Gemini prompt foundation

Use this foundation for isolated views, then append the angle-specific requirements above:

> Premium fictional flagship smartphone named XIOMA X15 Ultra, Frost Silver titanium-inspired finish, large circular multi-camera module, refined minimal industrial design, consistent proportions and camera layout, luxury technology product photography, soft ice-blue studio lighting, crisp realistic reflections, clean edges, product occupies 82 percent of the canvas, no text, no logo overlay, no price, no UI, no watermark, web ecommerce asset.

Generate all eight assets as one coordinated set, not as unrelated phone concepts.
