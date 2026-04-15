import type { WheelEvent } from "react";

export type ScrollAxis = "vertical" | "horizontal";

const SCROLLABLE_OVERFLOW_VALUES = new Set(["auto", "scroll", "overlay"]);

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

function supportsVerticalScroll(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  if (!SCROLLABLE_OVERFLOW_VALUES.has(style.overflowY)) return false;
  return el.scrollHeight > el.clientHeight;
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

export function shouldHandleHorizontalWheel(
  container: HTMLElement | null,
  event: Pick<WheelEvent<HTMLElement>, "target" | "deltaY">,
) {
  if (!container) return false;
  if (event.deltaY === 0) return false;
  if (container.scrollWidth <= container.clientWidth) return false;

  if (!(event.target instanceof HTMLElement)) return true;

  let current: HTMLElement | null = event.target;
  while (current && current !== container) {
    if (supportsVerticalScroll(current)) {
      const canConsume = canScrollInDirection(current, "vertical", event.deltaY);
      if (canConsume) return false;
    }
    current = current.parentElement;
  }

  return true;
}

export function applyHorizontalScroll(
  container: HTMLElement | null,
  deltaY: number,
) {
  if (!container) return false;
  return applyWheelScroll(container, "horizontal", deltaY);
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
  const delta =
    Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
  const consumed = applyWheelScroll(event.currentTarget, "horizontal", delta);
  if (!consumed) return false;
  event.preventDefault();
  event.stopPropagation();
  return true;
}
