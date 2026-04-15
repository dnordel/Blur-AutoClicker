import type { WheelEvent } from "react";
import {
  applyHorizontalScroll,
  handleVerticalWheel,
  shouldHandleHorizontalWheel,
} from "./scrollBehavior";
import { reportWheelRouting } from "./scrollOwnershipDebug";

export function routeVerticalWheel(
  event: WheelEvent<HTMLElement>,
  owner: string,
) {
  const consumed = handleVerticalWheel(event);
  reportWheelRouting(owner, event, consumed ? "consumed" : "pass");
  return consumed;
}

export function routeHorizontalWheel(
  event: WheelEvent<HTMLElement>,
  container: HTMLElement | null,
  owner: string,
) {
  const shouldRoute = shouldHandleHorizontalWheel(container, event);
  if (!shouldRoute) {
    reportWheelRouting(owner, event, "pass");
    return false;
  }

  const consumed = applyHorizontalScroll(container, event.deltaY);
  if (!consumed) {
    reportWheelRouting(owner, event, "pass");
    return false;
  }

  event.preventDefault();
  reportWheelRouting(owner, event, "consumed");
  return true;
}
