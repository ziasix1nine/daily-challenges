/**
 * Trap Tab focus inside a container for dialogs, drawers, and menus.
 * Restores focus to the previously focused element on release.
 *
 * @example
 * const dialog = document.querySelector<HTMLElement>("#modal")!;
 * const trap = createFocusTrap(dialog, {
 *   onEscape: () => trap.deactivate(),
 * });
 * trap.activate();
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

export interface FocusTrapOptions {
  /** Focus the first focusable element on activate. Default true. */
  autoFocus?: boolean;
  /** Element to restore focus to. Defaults to document.activeElement at activate time. */
  returnFocusTo?: HTMLElement | null;
  /** Called when Escape is pressed. The trap stays active until deactivate(). */
  onEscape?: (event: KeyboardEvent) => void;
}

export interface FocusTrap {
  activate(): void;
  deactivate(): void;
  readonly active: boolean;
}

export function createFocusTrap(
  container: HTMLElement,
  options: FocusTrapOptions = {},
): FocusTrap {
  const { autoFocus = true, onEscape } = options;
  let active = false;
  let previouslyFocused: HTMLElement | null = null;
  let addedTabIndex = false;

  function getFocusable(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1 && isVisible(el),
    );
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (!active) return;

    if (event.key === "Escape") {
      onEscape?.(event);
      return;
    }
    if (event.key !== "Tab") return;

    const nodes = getFocusable();
    if (nodes.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }

    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const inside = current !== null && container.contains(current);

    if (event.shiftKey && (!inside || current === first)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (!inside || current === last)) {
      event.preventDefault();
      first.focus();
    }
  }

  return {
    get active() {
      return active;
    },
    activate() {
      if (active) return;
      active = true;
      previouslyFocused =
        options.returnFocusTo ??
        (document.activeElement instanceof HTMLElement ? document.activeElement : null);

      if (!container.hasAttribute("tabindex")) {
        container.setAttribute("tabindex", "-1");
        addedTabIndex = true;
      }

      document.addEventListener("keydown", onKeyDown);
      if (autoFocus) {
        const first = getFocusable()[0];
        (first ?? container).focus();
      }
    },
    deactivate() {
      if (!active) return;
      active = false;
      document.removeEventListener("keydown", onKeyDown);
      if (addedTabIndex) {
        container.removeAttribute("tabindex");
        addedTabIndex = false;
      }
      previouslyFocused?.focus();
      previouslyFocused = null;
    },
  };
}

function isVisible(el: HTMLElement): boolean {
  if (el.getClientRects().length === 0) return false;
  const style = window.getComputedStyle(el);
  return style.visibility !== "hidden" && style.display !== "none";
}

export function getFocusableElements(root: ParentNode = document): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1 && isVisible(el),
  );
}
