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

/** Movement before a gesture is judged to be a drag rather than a tap. */
const INTENT_THRESHOLD_PX = 6;
/** A gesture only becomes a drag if it is meaningfully more sideways than not. */
const HORIZONTAL_BIAS = 1.25;
/** px/ms past which a flick contributes one extra step. */
const FLICK_VELOCITY = 0.55;
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

  /** Paint the arc for a given continuous displacement. Transform-only. */
  const paint = useCallback(
    (shift) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const nodes = stage.querySelectorAll("[data-m-node]");
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
      });
    },
    [stageRef]
  );

  /** Hand every node back to the stylesheet. */
  const clearPaint = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.querySelectorAll("[data-m-node]").forEach((node) => {
      node.style.transform = "";
      node.style.removeProperty("--drag-p");
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
    };

    const onPointerMove = (event) => {
      if (state.pointerId !== event.pointerId) return;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;

      if (state.phase === "pressing") {
        // Vertical scrolling wins until the gesture is clearly horizontal, so the
        // page never feels sticky when the finger passes over the arc.
        if (Math.abs(dx) < INTENT_THRESHOLD_PX) return;
        if (Math.abs(dx) < Math.abs(dy) * HORIZONTAL_BIAS) {
          reset();
          return;
        }
        state.phase = "dragging";
        setDragging(true);
        // Keep receiving moves even if the finger leaves the arc.
        try {
          stage.setPointerCapture(event.pointerId);
        } catch {
          /* capture is best-effort */
        }
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

    const finish = (event) => {
      if (state.pointerId !== event.pointerId) return;

      if (state.phase === "pressing") {
        // Never moved far enough to be a drag — let the click through untouched.
        reset();
        return;
      }
      if (state.phase !== "dragging") return;

      cancelFrame();
      state.phase = "snapping";
      setDragging(false);

      const shift = state.shift;
      let steps = Math.round(shift);
      // A flick may carry one extra category, and no more.
      if (Math.abs(state.velocity) > FLICK_VELOCITY) {
        const flick = Math.sign(state.velocity);
        if (flick === Math.sign(shift) || steps === 0) steps += flick;
      }
      steps = Math.max(-MAX_STEPS, Math.min(MAX_STEPS, steps));

      try {
        stage.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }

      if (steps === 0) {
        // Nothing changes collection, so settle the arc back ourselves.
        clearPaint();
        reset();
        return;
      }

      // Dragging right brings the node on the left into the centre. In RTL the
      // rendered window is reversed, so the same gesture walks the other way.
      const direction = rtlRef.current ? 1 : -1;
      const next = wrapIndex(
        activeRef.current + direction * steps,
        countRef.current
      );

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
  }, [stageRef, paint, clearPaint]);

  // A committed change re-renders the window; make sure no inline transform from
  // the gesture survives into the new resting layout.
  useEffect(() => {
    clearPaint();
  }, [activeIndex, clearPaint]);

  return { dragging };
}
