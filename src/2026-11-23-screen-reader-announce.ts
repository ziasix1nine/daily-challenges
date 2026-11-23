/**
 * Accessibility helper to announce messages to screen readers
 * using a polite or assertive ARIA live region.
 *
 * Creates a hidden live region on first use and reuses it.
 */

type Politeness = 'polite' | 'assertive';

let liveRegion: HTMLElement | null = null;

function getLiveRegion(politeness: Politeness = 'polite'): HTMLElement {
  if (typeof document === 'undefined') {
    throw new Error('screen reader announce only works in browser');
  }

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', politeness);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    // Visually hidden but available to screen readers
    Object.assign(liveRegion.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });
    document.body.appendChild(liveRegion);
  } else {
    // Update politeness if needed
    liveRegion.setAttribute('aria-live', politeness);
  }

  return liveRegion;
}

/**
 * Announce a message to screen readers.
 *
 * @param message - The text to announce.
 * @param politeness - 'polite' (default) or 'assertive'.
 *
 * @example
 * announceToScreenReader('Form submitted successfully');
 * announceToScreenReader('Error: invalid email', 'assertive');
 */
export function announceToScreenReader(
  message: string,
  politeness: Politeness = 'polite'
): void {
  if (!message) return;

  const region = getLiveRegion(politeness);

  // Clear then set to ensure announcement even if same message
  region.textContent = '';
  // Force reflow so screen readers pick up the change
  void region.offsetWidth;
  region.textContent = message;
}

/**
 * Convenience wrappers.
 */
export const announcePolite = (message: string) =>
  announceToScreenReader(message, 'polite');

export const announceAssertive = (message: string) =>
  announceToScreenReader(message, 'assertive');

// Usage example (browser only):
if (typeof document !== 'undefined') {
  // announceToScreenReader('Item added to cart');
  // announceAssertive('Connection lost');
}
