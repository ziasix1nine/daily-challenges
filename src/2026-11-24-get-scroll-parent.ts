/**
 * Finds the nearest scrollable ancestor of an element.
 * Useful for popovers, dropdowns, sticky headers, infinite scroll, etc.
 *
 * Checks overflow properties and also handles the document scrolling element.
 */

const SCROLLABLE_OVERFLOW = new Set(['auto', 'scroll', 'overlay']);

/**
 * Returns the closest scrollable parent of the given element.
 *
 * @param element - The starting element
 * @returns The nearest scrollable ancestor, or the document scrolling element if none found
 *
 * @example
 * const dropdown = document.querySelector('.dropdown');
 * const scroller = getScrollParent(dropdown);
 * scroller.addEventListener('scroll', handleScroll);
 */
export function getScrollParent(element: HTMLElement | null): HTMLElement {
  if (!element || typeof window === 'undefined') {
    return document.documentElement;
  }

  let parent = element.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    const isScrollableY =
      SCROLLABLE_OVERFLOW.has(overflowY) && parent.scrollHeight > parent.clientHeight;
    const isScrollableX =
      SCROLLABLE_OVERFLOW.has(overflowX) && parent.scrollWidth > parent.clientWidth;

    if (isScrollableY || isScrollableX) {
      return parent;
    }

    parent = parent.parentElement;
  }

  // Fallback to the document scrolling element
  return (document.scrollingElement || document.documentElement) as HTMLElement;
}

/**
 * Checks whether an element is currently scrollable on a given axis.
 */
export function isScrollable(
  element: HTMLElement,
  axis: 'x' | 'y' | 'both' = 'both'
): boolean {
  const style = window.getComputedStyle(element);

  if (axis === 'y' || axis === 'both') {
    if (
      SCROLLABLE_OVERFLOW.has(style.overflowY) &&
      element.scrollHeight > element.clientHeight
    ) {
      return true;
    }
  }

  if (axis === 'x' || axis === 'both') {
    if (
      SCROLLABLE_OVERFLOW.has(style.overflowX) &&
      element.scrollWidth > element.clientWidth
    ) {
      return true;
    }
  }

  return false;
}

// Usage example:
if (typeof document !== 'undefined') {
  const button = document.querySelector('button');
  if (button) {
    const scroller = getScrollParent(button as HTMLElement);
    console.log('Nearest scroll parent:', scroller.tagName);
  }
}
