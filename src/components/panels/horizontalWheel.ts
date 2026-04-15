export interface HorizontalWheelContext {
  container: HTMLDivElement;
  eventTarget: EventTarget | null;
  deltaY: number;
}

function hasHorizontalOverflow(container: HTMLDivElement): boolean {
  return container.scrollWidth > container.clientWidth;
}

function isElement(value: EventTarget | null): value is HTMLElement {
  return value instanceof HTMLElement;
}

function canElementScrollVertically(element: HTMLElement, deltaY: number): boolean {
  if (element.scrollHeight <= element.clientHeight) {
    return false;
  }

  if (deltaY < 0) {
    return element.scrollTop > 0;
  }

  if (deltaY > 0) {
    const maxScrollTop = element.scrollHeight - element.clientHeight;
    return element.scrollTop < maxScrollTop;
  }

  return false;
}

function hasNestedVerticalScrollTarget({
  container,
  eventTarget,
  deltaY,
}: HorizontalWheelContext): boolean {
  if (!isElement(eventTarget)) {
    return false;
  }

  let cursor: HTMLElement | null = eventTarget;
  while (cursor && cursor !== container) {
    if (canElementScrollVertically(cursor, deltaY)) {
      return true;
    }
    cursor = cursor.parentElement;
  }

  return false;
}

export function shouldHandleHorizontalWheel(context: HorizontalWheelContext): boolean {
  if (context.deltaY === 0) {
    return false;
  }

  if (!hasHorizontalOverflow(context.container)) {
    return false;
  }

  return !hasNestedVerticalScrollTarget(context);
}

export function applyHorizontalScroll(
  container: HTMLDivElement,
  deltaY: number,
  scrollFactor: number,
): boolean {
  const previousScrollLeft = container.scrollLeft;
  container.scrollLeft += deltaY * scrollFactor;
  return container.scrollLeft !== previousScrollLeft;
}
