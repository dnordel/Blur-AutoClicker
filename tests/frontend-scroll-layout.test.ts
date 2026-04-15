import { describe, expect, it } from "vitest";
import {
  applyScrollbarDrag,
  applyWheelScroll,
  handleHorizontalWheelFromWheel,
  handleVerticalWheel,
} from "../src/scroll/scrollBehavior";

function createScrollable({
  clientWidth = 100,
  scrollWidth = 100,
  clientHeight = 100,
  scrollHeight = 100,
  scrollLeft = 0,
  scrollTop = 0,
}: {
  clientWidth?: number;
  scrollWidth?: number;
  clientHeight?: number;
  scrollHeight?: number;
  scrollLeft?: number;
  scrollTop?: number;
}) {
  const el = document.createElement("div");
  Object.defineProperty(el, "clientWidth", { value: clientWidth, configurable: true });
  Object.defineProperty(el, "scrollWidth", { value: scrollWidth, configurable: true });
  Object.defineProperty(el, "clientHeight", { value: clientHeight, configurable: true });
  Object.defineProperty(el, "scrollHeight", { value: scrollHeight, configurable: true });
  el.scrollLeft = scrollLeft;
  el.scrollTop = scrollTop;
  return el;
}

function createWheelEvent(target: HTMLElement, deltaX: number, deltaY: number) {
  let prevented = false;
  let stopped = false;
  const event = {
    currentTarget: target,
    deltaX,
    deltaY,
    preventDefault: () => {
      prevented = true;
    },
    stopPropagation: () => {
      stopped = true;
    },
  };

  return {
    event,
    wasPrevented: () => prevented,
    wasStopped: () => stopped,
  };
}

describe("frontend scroll layout contract", () => {
  it("supports settings panel vertical wheel scrolling", () => {
    const settingsPanel = createScrollable({ clientHeight: 120, scrollHeight: 500 });

    const consumed = applyWheelScroll(settingsPanel, "vertical", 60);

    expect(consumed).toBe(true);
    expect(settingsPanel.scrollTop).toBe(60);
  });

  it("maps wheel-to-horizontal scrolling for advanced panel columns container", () => {
    const advancedColumns = createScrollable({ clientWidth: 220, scrollWidth: 800 });
    const { event, wasPrevented, wasStopped } = createWheelEvent(advancedColumns, 0, 75);

    const consumed = handleHorizontalWheelFromWheel(event as never);

    expect(consumed).toBe(true);
    expect(advancedColumns.scrollLeft).toBe(75);
    expect(wasPrevented()).toBe(true);
    expect(wasStopped()).toBe(true);
  });

  it("supports advanced column vertical wheel scrolling", () => {
    const advancedColumn = createScrollable({ clientHeight: 180, scrollHeight: 640 });
    const { event } = createWheelEvent(advancedColumn, 0, 90);

    const consumed = handleVerticalWheel(event as never);

    expect(consumed).toBe(true);
    expect(advancedColumn.scrollTop).toBe(90);
  });

  it("supports scrollbar drag interaction in each scrollable container", () => {
    const settingsPanel = createScrollable({ clientHeight: 140, scrollHeight: 420 });
    const advancedColumns = createScrollable({ clientWidth: 240, scrollWidth: 900 });
    const advancedColumn = createScrollable({ clientHeight: 180, scrollHeight: 800 });

    const settingsMoved = applyScrollbarDrag(settingsPanel, "vertical", 135);
    const columnsMoved = applyScrollbarDrag(advancedColumns, "horizontal", 155);
    const columnMoved = applyScrollbarDrag(advancedColumn, "vertical", 165);

    expect(settingsMoved).toBe(true);
    expect(columnsMoved).toBe(true);
    expect(columnMoved).toBe(true);
    expect(settingsPanel.scrollTop).toBe(135);
    expect(advancedColumns.scrollLeft).toBe(155);
    expect(advancedColumn.scrollTop).toBe(165);
  });

  it("clamps boundary movement and hands wheel events to parent at edges", () => {
    const parent = createScrollable({ clientWidth: 200, scrollWidth: 700, scrollLeft: 100 });
    const child = createScrollable({ clientHeight: 150, scrollHeight: 450, scrollTop: 300 });

    const childWheelDown = createWheelEvent(child, 0, 50);
    const childConsumed = handleVerticalWheel(childWheelDown.event as never);
    const parentWheelDown = createWheelEvent(parent, 0, 50);
    const parentConsumed = handleHorizontalWheelFromWheel(parentWheelDown.event as never);

    const childAtTop = applyWheelScroll(child, "vertical", -999);
    const parentAtLeft = applyWheelScroll(parent, "horizontal", -999);

    expect(childConsumed).toBe(false);
    expect(parentConsumed).toBe(true);
    expect(parent.scrollLeft).toBe(150);
    expect(childAtTop).toBe(true);
    expect(parentAtLeft).toBe(true);
    expect(child.scrollTop).toBe(0);
    expect(parent.scrollLeft).toBe(0);
  });
});
