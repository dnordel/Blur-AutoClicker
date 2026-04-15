import type { WheelEvent } from "react";

export type ScrollAxis = "vertical" | "horizontal";

function getAxisMetrics(el: HTMLElement, axis: ScrollAxis) {
  if (axis === "vertical") {
    return {
      current: el.scrollTop,
      viewport: el.clientHeight,
      extent: el.scrollHeight,
      write: (value: number) => {
        el.scrollTop = value;
      },
    };
  }

  return {
    current: el.scrollLeft,
    viewport: el.clientWidth,
    extent: el.scrollWidth,
    write: (value: number) => {
      el.scrollLeft = value;
    },
  };
}

function clamp(value: number, min: number, max: number) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function canScrollInDirection(
  el: HTMLElement,
  axis: ScrollAxis,
  delta: number,
) {
  const { current, viewport, extent } = getAxisMetrics(el, axis);
  const max = Math.max(extent - viewport, 0);
  if (max === 0) return false;
  if (delta > 0) return current < max;
  if (delta < 0) return current > 0;
  return false;
}

export function applyWheelScroll(
  el: HTMLElement,
  axis: ScrollAxis,
  delta: number,
) {
  if (!canScrollInDirection(el, axis, delta)) return false;

  const { current, viewport, extent, write } = getAxisMetrics(el, axis);
  const max = Math.max(extent - viewport, 0);
  const next = clamp(current + delta, 0, max);
  write(next);
  return next !== current;
}

export function applyScrollbarDrag(
  el: HTMLElement,
  axis: ScrollAxis,
  nextPosition: number,
) {
  const { current, viewport, extent, write } = getAxisMetrics(el, axis);
  const max = Math.max(extent - viewport, 0);
  const next = clamp(nextPosition, 0, max);
  write(next);
  return next !== current;
}

export function handleVerticalWheel(event: WheelEvent<HTMLElement>) {
  const consumed = applyWheelScroll(event.currentTarget, "vertical", event.deltaY);
  if (!consumed) return false;
  event.preventDefault();
  event.stopPropagation();
  return true;
}

export function handleHorizontalWheelFromWheel(
  event: WheelEvent<HTMLElement>,
) {
  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
    ? event.deltaY
    : event.deltaX;
  const consumed = applyWheelScroll(event.currentTarget, "horizontal", delta);
  if (!consumed) return false;
  event.preventDefault();
  event.stopPropagation();
  return true;
}
