"use client";

import Image from "next/image";
import { useState } from "react";

import { MediaFallback, MediaSkeleton } from "@/components/ui/Skeleton/Skeleton";
import styles from "./AssetImage.module.css";

const FIT_CLASS = {
  contain: styles.contain,
  cover: styles.cover,
};

/**
 * Paths already known to be missing in this session.
 *
 * The catalogue reuses the same handful of image paths across the grid, the cart
 * drawer and the cart page, so without this every mount re-requests a file that
 * has already 404'd and the console fills with the same failures. Once a path
 * fails, later instances render the placeholder directly and issue no request.
 *
 * Client-only by consequence: nothing populates it during SSR, so the first
 * render matches the server. A reload clears it, which is what you want in dev
 * after actually adding the file.
 */
const failedSources = new Set();

/**
 * Whether this session has already seen `src` fail to load.
 *
 * Every product image on a page goes through `AssetImage`, so by the time a
 * secondary surface (the full-size gallery, say) needs to know whether an asset
 * exists, that question has usually already been answered for free. Exposing it
 * saves those surfaces from re-probing the network to learn something the page
 * has known since it rendered.
 *
 * A path that has not been attempted yet reports `false` — optimistic, which is
 * the right default: the overwhelmingly common case is that the file is there.
 */
export function hasAssetFailed(src) {
  return failedSources.has(src);
}

/**
 * Image boundary used across the storefront while the real visual assets are
 * being produced. The placeholder remains visible until the requested file
 * loads successfully. Dropping a file at the displayed /public path makes the
 * real image appear without another code change.
 */
export default function AssetImage({
  src,
  alt = "",
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  fit = "contain",
  className = "",
  wrapperClassName = "",
  placeholderLabel,
  placeholderTone = "light",
  showPath = true,
  imageProps = {},
  ...slotProps
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [renderedSrc, setRenderedSrc] = useState(src);

  // Reset the load/error state during render when the requested file changes,
  // so a new src never inherits the previous one's loaded flag. A path already
  // known to be missing starts in the failed state and is never requested again.
  if (renderedSrc !== src) {
    setRenderedSrc(src);
    setLoaded(false);
    setFailed(failedSources.has(src));
  }

  const isMissing = failed || failedSources.has(src);

  const fixedStyle = !fill && width && height ? { width, height } : undefined;

  return (
    <span
      className={`${styles.slot} ${fill ? styles.fill : styles.fixed} ${wrapperClassName}`.trim()}
      style={fixedStyle}
      {...slotProps}
    >
      {/*
        Two genuinely different states, never the same visual.

        Loading shows a shimmer and nothing else — no product name, no file path,
        no broken-image icon, no instructional copy. A customer waiting for a
        photograph should see the shape of the photograph arriving, not a caption
        describing the app's internals.

        A missing asset stops shimmering immediately. Continuing to pulse would
        promise something that is never going to appear, so the failed state is a
        flat neutral surface instead. It keeps the slot's exact dimensions in
        both cases, so nothing reflows when the real image lands.

        `placeholderLabel` and `showPath` are still accepted so the many call
        sites need no edit, but they no longer render: the label duplicated the
        `alt` text already on the image, and the path was an internal detail.
      */}
      {isMissing ? (
        <MediaFallback />
      ) : loaded ? null : (
        <MediaSkeleton />
      )}

      {src && !isMissing ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes || (fill ? "100vw" : `${width || 320}px`)}
          priority={priority}
          className={`${styles.image} ${FIT_CLASS[fit] || styles.contain} ${loaded ? styles.imageVisible : ""} ${className}`.trim()}
          onLoad={() => setLoaded(true)}
          onError={() => {
            // Remember it so no other instance re-requests this path.
            failedSources.add(src);
            setFailed(true);
          }}
          {...imageProps}
        />
      ) : null}
    </span>
  );
}
