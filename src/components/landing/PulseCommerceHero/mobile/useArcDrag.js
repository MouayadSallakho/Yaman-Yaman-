"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Pointer-drag and magnetic snap for the mobile Category arc.
 *
 * GEOMETRY
 * --------
 * The arc's resting slot coordinates are duplicated here from
 * `MobileCategoryArc.module.css` because dragging has to interpolate *between*
 * them. Interpolating the discrete table — rather than re-deriving positions from
 * the underlying ellipse — guarantees the transform is exactly zero at rest, so
 * handing the node back to CSS after a snap cannot produce a visible jump.
 * The two tables must stay in step; the slot classes name the same numbers.
 *
 * Two extrapolated buffer slots (-1 and 5) sit just outside the arc so a node is
 * always ready to enter as another leaves. They are transparent at rest and are
 * clipped by the hero shell's own `overflow: hidden`.
 *
 * RENDERING
 * ---------
 * Pointer moves never touch React state. The handler writes a transform and a
 * `--drag-p` proximity custom property straight to each node inside one
 * `requestAnimationFrame`, so a drag costs no reconciliation and no layout — CSS
 * turns proximity into scale, brightness and glow. React is involved exactly
 * once per gesture, when the snap commits.
 *
 * @param {{
 *   stageRef: React.RefObject<HTMLElement>,
 *   count: number,
 *   activeIndex: number,
 *   rtl: boolean,
 *   onCommit: (index: number) => void,
 * }} params
 */

/** Resting slot centres, as percentages of the stage box. Mirrors the CSS. */
const SLOT_X = [8.5, 25.53, 50, 74.47, 91.5];
const SLOT_Y = [51.27, 31.77, 24, 31.77, 51.27];

/** Reflected buffer slots either side, so nodes can enter and leave smoothly. */
const BUFFER_X_LOW = 2 * SLOT_X[0] - SLOT_X[1];
const BUFFER_X_HIGH = 2 * SLOT_X[4] - SLOT_X[3];
const BUFFER_Y = 2 * SLOT_Y[0] - SLOT_Y[1];

const CENTER_SLOT = 2;

/**
 * Movement before a gesture is judged to be a drag rather than a tap. Touch slop
 * on Android is around 8px, so anything under that is still a tap in the user's
 * mind and, more importantly, in the browser's.
 */
const INTENT_THRESHOLD_PX = 8;

/**
 * How much more vertical than horizontal a gesture must be before the arc gives
 * it up to the page.
 *
 * WHY THIS IS DELIBERATELY FORGIVING
 * ----------------------------------
 * The previous rule was the inverse — a gesture had to be 1.25x more horizontal
 * than vertical *on the first sample past the threshold*, and failing it called
 * a reset that cleared the tracked pointer id. Every later move for that same
 * finger was then dropped by the id guard, so a thumb that started with any
 * downward drift and then swept sideways was rejected outright and could not
 * recover; the user had to lift and try again.
 *
 * Measured against the production build with synthetic touch pointers:
 *
 *     first sample (5,9) then turning horizontal -> never entered drag
 *     a steady ~40° arc                          -> never entered drag
 *     a near-perfect horizontal line (a mouse)   -> always worked
 *
 * which is precisely why the arc felt fine in DevTools and unreliable in a hand.
 * Now the gesture is only surrendered when it is *clearly* vertical, and the
 * decision stays open until one axis actually wins.
 */
const VERTICAL_YIELD_RATIO = 1.6;

/**
 * Vertical travel before the arc will consider surrendering the gesture. Well
 * past touch slop, so a thumb that dips a few pixels on the way into a sideways
 * sweep is not mistaken for someone scrolling the page.
 */
const VERTICAL_COMMIT_PX = 14;
/** Never travel more than this many categories from one gesture. */
const MAX_STEPS = 2;

/** Slot centre in percentage units for any slot from -1 to 5. */
function slotPosition(slot) {
  if (slot <= -1) return { x: BUFFER_X_LOW, y: BUFFER_Y };
  if (slot >= 5) return { x: BUFFER_X_HIGH, y: BUFFER_Y };
  return { x: SLOT_X[slot], y: SLOT_Y[slot] };
}

/** Slot centre for a fractional slot position, by interpolating the table. */
function interpolatedPosition(value) {
  const clamped = Math.max(-1, Math.min(5, value));
  const low = Math.floor(clamped);
  const t = clamped - low;
  if (t === 0) return slotPosition(low);
  const a = slotPosition(low);
  const b = slotPosition(low + 1);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

const wrapIndex = (value, count) => ((value % count) + count) % count;

export function useArcDrag({ stageRef, count, activeIndex, rtl, onCommit }) {
  const [dragging, setDragging] = useState(false);

  const stateRef = useRef({
    phase: "idle", // idle | pressing | dragging | snapping
    pointerId: null,
    startX: 0,
    startY: 0,
    startTime: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    shift: 0, // continuous displacement, in slot units
    slotWidthPx: 1,
    frame: 0,
  });

  // Read through refs so the listeners can stay attached for the element's whole
  // life instead of being torn down every time the active category changes.
  // Synced in an effect, never during render: a ref write during render is not
  // guaranteed to survive a discarded render pass.
  const activeRef = useRef(activeIndex);
  const rtlRef = useRef(rtl);
  const commitRef = useRef(onCommit);
  const countRef = useRef(count);

  useEffect(() => {
    activeRef.current = activeIndex;
    rtlRef.current = rtl;
    commitRef.current = onCommit;
    countRef.current = count;
  }, [activeIndex, rtl, onCommit, count]);

  /**
   * The collection a release at this displacement would land on.
   *
   * Single source of truth for both the live preview and the commit. Dragging
   * right brings the node on the left into the centre; in RTL the rendered
   * window is reversed, so the same gesture walks the other way.
   */
  const targetIndexFor = useCallback((shift) => {
    const steps = Math.max(-MAX_STEPS, Math.min(MAX_STEPS, Math.round(shift)));
    const direction = rtlRef.current ? 1 : -1;
    return wrapIndex(activeRef.current + direction * steps, countRef.current);
  }, []);

  /** Paint the arc for a given continuous displacement. Transform-only. */
  const paint = useCallback(
    (shift) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const nodes = stage.querySelectorAll("[data-m-node]");

      /*
        Live preview: the collection a release would land on is shown as active
        *before* the finger lifts. It is derived from `targetIndexFor` — the same
        function the commit uses — so the preview and the snap cannot disagree;
        an earlier version recomputed the two independently and they drifted
        apart whenever a flick was involved.

        Done here rather than in React because this runs every animation frame of
        the gesture: it is a couple of attribute writes, no reconciliation, and
        the committed collection is untouched until the snap lands. `data-active`
        therefore still means "committed", so `aria-pressed`, the polite
        announcement and the two rails all stay on the settled collection.
      */
      const previewIndex = targetIndexFor(shift);

      nodes.forEach((node) => {
        const slot = Number(node.getAttribute("data-slot"));
        if (Number.isNaN(slot)) return;

        const base = slotPosition(slot);
        const next = interpolatedPosition(slot + shift);
        const dx = ((next.x - base.x) / 100) * rect.width;
        const dy = ((next.y - base.y) / 100) * rect.height;

        // Distance from the centre slot, 1 at the centre and 0 two slots out.
        const distance = Math.abs(slot + shift - CENTER_SLOT);
        const proximity = Math.max(0, Math.min(1, 1 - distance / 2));

        node.style.transform = `translate(-50%, -50%) translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
        node.style.setProperty("--drag-p", proximity.toFixed(3));

        // Buffers duplicate a collection already on the arc and are out of the
        // accessibility tree, so they must never be shown as the preview.
        const isPreview =
          node.getAttribute("data-buffer") !== "true" &&
          Number(node.getAttribute("data-index")) === previewIndex;

        if (isPreview) node.setAttribute("data-preview", "true");
        else if (node.hasAttribute("data-preview")) node.removeAttribute("data-preview");
      });
    },
    [stageRef, targetIndexFor]
  );

  /** Hand every node back to the stylesheet. */
  const clearPaint = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.querySelectorAll("[data-m-node]").forEach((node) => {
      node.style.transform = "";
      node.style.removeProperty("--drag-p");
      node.removeAttribute("data-preview");
    });
  }, [stageRef]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const state = stateRef.current;

    const cancelFrame = () => {
      if (state.frame) {
        cancelAnimationFrame(state.frame);
        state.frame = 0;
      }
    };

    const schedule = () => {
      if (state.frame) return;
      state.frame = requestAnimationFrame(() => {
        state.frame = 0;
        paint(state.shift);
      });
    };

    const reset = () => {
      cancelFrame();
      state.phase = "idle";
      state.pointerId = null;
      state.shift = 0;
      state.velocity = 0;
      // Hand every node back to the stylesheet on every exit path, so no inline
      // transform and no `data-preview` can outlive the gesture that wrote it.
      clearPaint();
      setDragging(false);
    };

    const onPointerDown = (event) => {
      if (state.phase !== "idle" || !event.isPrimary) return;
      // A secondary mouse button should never start a drag.
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const rect = stage.getBoundingClientRect();
      // One slot step is the centre-to-neighbour distance along the arc.
      state.slotWidthPx = Math.max(
        1,
        ((SLOT_X[CENTER_SLOT] - SLOT_X[CENTER_SLOT - 1]) / 100) * rect.width
      );
      state.phase = "pressing";
      state.pointerId = event.pointerId;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.lastX = event.clientX;
      state.startTime = event.timeStamp;
      state.lastTime = event.timeStamp;
      state.velocity = 0;
      state.shift = 0;

      // Capture immediately rather than once the drag is recognised. A fast
      // flick can leave the stage's box within a frame or two of pointerdown,
      // and without capture those moves are delivered to whatever is under the
      // finger instead — the gesture would stall before it was ever classified.
      // `touch-action: pan-y` on the stage still lets the page scroll away
      // vertically, and the browser sends pointercancel when it does.
      try {
        stage.setPointerCapture(event.pointerId);
      } catch {
        /* capture is best-effort */
      }
    };

    const onPointerMove = (event) => {
      if (state.pointerId !== event.pointerId) return;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;

      if (state.phase === "pressing") {
        /*
          Keep the decision open until one axis actually wins. Three outcomes:

            - clearly vertical  -> hand the gesture to the page and stop looking
            - past the slop and at least as horizontal as vertical -> drag
            - anything else     -> undecided, wait for the next sample

          The undecided branch is the important one. It is what lets a thumb that
          starts with a little downward drift and then sweeps sideways still be
          recognised, instead of being written off on its first sample.
        */
        /*
          Vertical has to be *committed*, not merely leading, before the arc lets
          go: a decisive downward run, not one early sample that happened to
          contain more dy than dx. Nothing latches — every sample is judged on
          the movement so far, so a thumb that dips and then sweeps sideways is
          still recognised. On a real device the browser is the authority anyway:
          `touch-action: pan-y` lets it start scrolling and it then sends
          pointercancel, which tears the gesture down properly.
        */
        if (Math.abs(dy) >= VERTICAL_COMMIT_PX && Math.abs(dy) > Math.abs(dx) * VERTICAL_YIELD_RATIO) {
          return;
        }

        if (Math.abs(dx) < INTENT_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;

        state.phase = "dragging";
        setDragging(true);
      }

      if (state.phase !== "dragging") return;

      const dt = event.timeStamp - state.lastTime;
      if (dt > 0) {
        state.velocity = (event.clientX - state.lastX) / dt;
        state.lastX = event.clientX;
        state.lastTime = event.timeStamp;
      }

      // Resistance past the half-window keeps a long drag from flying away.
      const raw = dx / state.slotWidthPx;
      const limit = MAX_STEPS;
      state.shift =
        Math.abs(raw) <= limit
          ? raw
          : Math.sign(raw) * (limit + (Math.abs(raw) - limit) * 0.18);

      schedule();
    };

    const releaseCapture = (pointerId) => {
      try {
        stage.releasePointerCapture(pointerId);
      } catch {
        /* already released */
      }
    };

    const finish = (event) => {
      if (state.pointerId !== event.pointerId) return;

      if (state.phase === "pressing" || state.phase === "yielded") {
        // Never became a drag — let the click through untouched (a tap must
        // still select), and give the captured pointer back.
        releaseCapture(event.pointerId);
        reset();
        return;
      }
      if (state.phase !== "dragging") return;

      /*
        A drag has happened, so the click the browser synthesises next is not a
        tap on whichever node happened to be under the finger — acting on it
        would override the category the snap just chose. The arc clears this flag
        when it swallows that click. Same handshake the product gallery already
        uses for its own drag surface.
      */
      stage.dataset.dragConsumed = "1";

      cancelFrame();
      state.phase = "snapping";
      setDragging(false);

      /*
        The release commits exactly the displacement the arc was last showing.

        A flick used to add one extra category on top of it. That made sense when
        the gesture was blind, but the arc now previews its destination live, and
        an overshoot past the category the user is looking at is precisely the
        unpredictability the preview exists to remove — you would aim at one
        collection and land on its neighbour. Travel is unchanged for deliberate
        drags: MAX_STEPS still allows two categories in one sweep.
      */
      releaseCapture(event.pointerId);

      const next = targetIndexFor(state.shift);

      if (next === activeRef.current) {
        // Nothing changes collection, so settle the arc back ourselves.
        clearPaint();
        reset();
        return;
      }

      // Let the committed re-render own the resting positions: the new window
      // puts the chosen collection in the centre slot, so clearing the inline
      // transforms lands every node exactly on its slot with no jump.
      clearPaint();
      reset();
      commitRef.current?.(next);
    };

    const onLostCapture = (event) => {
      if (state.pointerId !== event.pointerId) return;
      clearPaint();
      reset();
    };

    const onCancel = (event) => {
      if (state.pointerId !== event.pointerId) return;
      clearPaint();
      reset();
    };

    const onResize = () => {
      if (state.phase === "idle") return;
      clearPaint();
      reset();
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", finish);
    stage.addEventListener("pointercancel", onCancel);
    stage.addEventListener("lostpointercapture", onLostCapture);
    window.addEventListener("resize", onResize);

    return () => {
      cancelFrame();
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", finish);
      stage.removeEventListener("pointercancel", onCancel);
      stage.removeEventListener("lostpointercapture", onLostCapture);
      window.removeEventListener("resize", onResize);
      clearPaint();
    };
  }, [stageRef, paint, clearPaint, targetIndexFor]);

  // A committed change re-renders the window; make sure no inline transform from
  // the gesture survives into the new resting layout.
  useEffect(() => {
    clearPaint();
  }, [activeIndex, clearPaint]);

  return { dragging };
}
