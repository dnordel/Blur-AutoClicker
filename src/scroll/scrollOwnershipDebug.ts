import type { WheelEvent } from "react";

type WheelLikeEvent = Pick<WheelEvent<HTMLElement>, "target" | "deltaX" | "deltaY">;

function isScrollDebugEnabled() {
  if (!import.meta.env.DEV) return false;
  if (typeof window === "undefined") return false;
  return (window as typeof window & { __BLUR_SCROLL_DEBUG__?: boolean }).__BLUR_SCROLL_DEBUG__ === true;
}

function getTargetLabel(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return "unknown-target";
  const owner = target.dataset.scrollOwner;
  if (owner) return owner;
  if (target.dataset.testid) return target.dataset.testid;
  return target.className || target.tagName.toLowerCase();
}

export function getScrollOwnerDebugAttributes(owner: string) {
  if (!import.meta.env.DEV) return undefined;
  return { "data-scroll-owner": owner };
}

export function reportWheelRouting(
  owner: string,
  event: WheelLikeEvent,
  decision: "consumed" | "pass",
) {
  if (!isScrollDebugEnabled()) return;
  const targetLabel = getTargetLabel(event.target);
  console.debug(
    `[scroll-debug] owner=${owner} decision=${decision} deltaY=${event.deltaY} deltaX=${event.deltaX} target=${targetLabel}`,
  );
}
