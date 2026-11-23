/**
 * Utility to query focusable elements within a container.
 * Useful for accessibility (focus traps, keyboard navigation, etc.).
 *
 * Follows the standard focusable elements definition used by many a11y libraries.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Returns all focusable elements inside the given container.
 * Filters out elements that are not visible or have negative tabindex.
 *
 * @param container - The root element to search within. Defaults to document.body.
 * @returns Array of focusable HTMLElements in DOM order.
 *
 * @example
 * const focusable = getFocusableElements(modalRef.current);
 * focusable[0]?.focus();
 */
export function getFocusableElements(
  container: HTMLElement | Document = document.body
): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );

  return elements.filter((el) => {
    // Skip elements that are not visible or disabled via aria
    if (el.getAttribute('aria-hidden') === 'true') return false;
    if (el.tabIndex < 0) return false;

    // Basic visibility check (offsetParent is null for display:none / visibility:hidden in many cases)
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;

    return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
  });
}

/**
 * Returns the first focusable element in the container, or null.
 */
export function getFirstFocusable(
  container: HTMLElement | Document = document.body
): HTMLElement | null {
  return getFocusableElements(container)[0] ?? null;
}

/**
 * Returns the last focusable element in the container, or null.
 */
export function getLastFocusable(
  container: HTMLElement | Document = document.body
): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] ?? null;
}

// Usage example:
if (typeof document !== 'undefined') {
  const modal = document.querySelector('#my-modal') as HTMLElement | null;
  if (modal) {
    const focusables = getFocusableElements(modal);
    console.log('Focusable elements in modal:', focusables.length);
    getFirstFocusable(modal)?.focus();
  }
}
