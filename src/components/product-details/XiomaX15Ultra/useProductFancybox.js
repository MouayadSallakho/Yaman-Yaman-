"use client";

import { useCallback, useEffect, useRef } from "react";

import { hasAssetFailed } from "@/components/ui/AssetImage/AssetImage";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getThemePalette() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name) => styles.getPropertyValue(name).trim();
  return {
    primary: read("--color-primary"),
    primaryHover: read("--color-primary-hover"),
    surface: read("--color-surface-muted"),
    surfaceSoft: read("--color-surface-soft"),
    surfaceStrong: read("--color-surface-elevated"),
    text: read("--color-text-primary"),
  };
}

function placeholderThumb(label, index, palette) {
  const safeLabel = escapeHtml(label).slice(0, 30);
  const number = String(index + 1).padStart(2, "0");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180" viewBox="0 0 240 180"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${palette.surface}"/><stop offset="1" stop-color="${palette.surfaceSoft}"/></linearGradient></defs><rect width="240" height="180" rx="18" fill="url(#g)"/><path d="M0 45H240M0 90H240M0 135H240M48 0V180M96 0V180M144 0V180M192 0V180" stroke="${palette.primary}" stroke-opacity=".14"/><circle cx="120" cy="75" r="28" fill="${palette.surfaceStrong}" stroke="${palette.primary}" stroke-width="3"/><text x="120" y="83" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="${palette.primaryHover}">${number}</text><text x="120" y="130" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="${palette.text}">${safeLabel}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function placeholderSlide(item, index, label, helper, palette) {
  return {
    html: `<div class="mabco-fancybox-placeholder"><div class="mabco-fancybox-placeholder__orb"><span>${String(index + 1).padStart(2, "0")}</span></div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(helper)}</p><code>${escapeHtml(item.src)}</code></div>`,
    caption: escapeHtml(label),
    thumbSrc: placeholderThumb(label, index, palette),
    thumbAlt: escapeHtml(label),
  };
}

export default function useProductFancybox({ gallery, t, dir }) {
  const instanceRef = useRef(null);

  const open = useCallback(async (startIndex, triggerEl) => {
    try {
      const { Fancybox } = await import("@fancyapps/ui/dist/fancybox/");
      const palette = getThemePalette();
      /*
        Availability comes from what the page already rendered, not from the
        network. Opening used to await a `HEAD` request per image with
        `cache: "no-store"` — eight blocking round trips before the gallery could
        appear, every one of which succeeds for this product because all eight
        files exist. On a phone that was the whole of the "slow to open" feeling.

        The inline deck renders all eight images (plus eight thumbnails) through
        `AssetImage`, so a missing file has already been discovered by the time
        anyone taps to expand, and the placeholder path still works. A path that
        has not been attempted yet is treated as present, which is both the
        common case and recoverable.
      */
      const slides = gallery.map((item, index) => {
        const alt = t(item.altKey);
        return hasAssetFailed(item.src)
          ? placeholderSlide(item, index, alt, t("productDemo.gallery.placeholderMessage"), palette)
          : { src: item.src, type: "image", caption: t(item.captionKey), thumbSrc: item.src, thumbAlt: alt };
      });

      instanceRef.current?.close?.();
      instanceRef.current = Fancybox.show(slides, {
        id: "mabco-xioma-gallery",
        startIndex,
        triggerEl,
        closeExisting: true,
        placeFocusBack: true,
        hideScrollbar: true,
        dragToClose: true,
        theme: "dark",
        mainClass: "mabco-product-fancybox",
        l10n: {
          MODAL: t("productDemo.fancybox.modal"),
          CLOSE: t("common.close"),
          NEXT: t("productDemo.gallery.next"),
          PREV: t("productDemo.gallery.previous"),
        },
        Carousel: {
          infinite: false,
          rtl: dir === "rtl",
          Thumbs: { type: "classic" },
          Toolbar: {
            display: {
              left: ["counter"],
              middle: ["zoomIn", "zoomOut", "toggle1to1"],
              right: ["toggleFull", "thumbs", "close"],
            },
          },
        },
        /*
          No dialog semantics are patched on here, deliberately.

          Fancybox 6 renders into a real `<dialog>` and opens it with
          `showModal()` — verified on the live overlay, which matches `:modal`.
          That gives the implicit dialog role, the top-layer modal boundary, the
          focus trap and Escape for free, and `l10n.MODAL` above supplies the
          accessible name in the active language. Setting `role="dialog"` and
          `aria-modal` on the inner container would nest a second dialog inside
          the real one, which is worse than leaving it alone.

          Recorded because an earlier pass measured `role = null` on
          `.fancybox__container` and concluded the semantics were missing. That
          was the wrong element: the roled element is its `<dialog>` parent.
        */
        on: {
          destroy: () => { instanceRef.current = null; },
        },
      });
    } catch (error) {
      console.error("Unable to open Fancybox product gallery", error);
    }
  }, [dir, gallery, t]);

  useEffect(() => () => {
    instanceRef.current?.close?.();
    instanceRef.current = null;
  }, []);

  return open;
}
