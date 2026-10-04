/**
 * Small Intersection Observer helper for lazy loading, infinite scroll,
 * and "entered viewport" analytics without wiring the browser API by hand.
 */

export interface ObserveOptions {
  /** Root element. Defaults to the viewport. */
  root?: Element | null;
  /** CSS margin around the root. Default: "0px". */
  rootMargin?: string;
  /** Visibility ratio that counts as intersecting. Default: 0. */
  threshold?: number | number[];
  /** Stop observing after the first intersecting entry. Default: false. */
  once?: boolean;
}

export interface ObserveHandle {
  /** Stop observing and disconnect the underlying observer. */
  disconnect: () => void;
}

function supportsIntersectionObserver(): boolean {
  return typeof IntersectionObserver !== "undefined";
}

/**
 * Observe one or more elements. The callback receives each entry and the element.
 * Returns a handle so callers can disconnect early (for example on unmount).
 */
export function observeIntersection(
  targets: Element | Element[],
  onChange: (entry: IntersectionObserverEntry, element: Element) => void,
  options: ObserveOptions = {},
): ObserveHandle {
  const elements = (Array.isArray(targets) ? targets : [targets]).filter(Boolean);
  if (elements.length === 0) {
    return { disconnect: () => undefined };
  }

  if (!supportsIntersectionObserver()) {
    // Fallback: treat every target as visible so callers still run once.
    for (const element of elements) {
      onChange(
        {
          target: element,
          isIntersecting: true,
          intersectionRatio: 1,
        } as IntersectionObserverEntry,
        element,
      );
    }
    return { disconnect: () => undefined };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        onChange(entry, entry.target);
        if (options.once && entry.isIntersecting) {
          observer.unobserve(entry.target);
        }
      }
    },
    {
      root: options.root ?? null,
      rootMargin: options.rootMargin ?? "0px",
      threshold: options.threshold ?? 0,
    },
  );

  for (const element of elements) observer.observe(element);

  return {
    disconnect: () => observer.disconnect(),
  };
}

/**
 * Resolve when `element` intersects the root. Rejects if disconnected first.
 */
export function whenVisible(
  element: Element,
  options: ObserveOptions = {},
): Promise<IntersectionObserverEntry> {
  return new Promise((resolve, reject) => {
    const handle = observeIntersection(
      element,
      (entry) => {
        if (!entry.isIntersecting) return;
        handle.disconnect();
        resolve(entry);
      },
      { ...options, once: true },
    );

    if (!element.isConnected) {
      handle.disconnect();
      reject(new Error("Element is not connected to the document"));
    }
  });
}

// Example:
// const images = document.querySelectorAll("img[data-src]");
// observeIntersection(Array.from(images), (entry) => {
//   if (!entry.isIntersecting) return;
//   const img = entry.target as HTMLImageElement;
//   img.src = img.dataset.src ?? "";
//   img.removeAttribute("data-src");
// }, { rootMargin: "200px", once: true });
