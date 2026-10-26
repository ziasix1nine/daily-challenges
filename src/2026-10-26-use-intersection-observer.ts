import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * React hook that wraps IntersectionObserver for easy viewport detection.
 * Useful for lazy loading, infinite scroll, and entrance animations.
 *
 * @example
 * const { ref, isIntersecting, entry } = useIntersectionObserver({
 *   threshold: 0.5,
 *   rootMargin: "100px",
 *   freezeOnceVisible: true,
 * });
 * return <div ref={ref}>{isIntersecting ? "Visible!" : "Hidden"}</div>;
 */

export interface UseIntersectionObserverOptions {
  /** Element that is used as the viewport for checking visibility. Defaults to the browser viewport. */
  root?: Element | Document | null;
  /** Margin around the root. Can have values similar to the CSS margin property. */
  rootMargin?: string;
  /** Number or array of numbers between 0 and 1 indicating the percentage of visibility that triggers the callback. */
  threshold?: number | number[];
  /** If true, stops observing after the element becomes visible the first time. */
  freezeOnceVisible?: boolean;
  /** If true, starts observing immediately. Defaults to true. */
  enabled?: boolean;
}

export interface UseIntersectionObserverResult<T extends Element = Element> {
  /** Callback ref to attach to the target element. */
  ref: (node: T | null) => void;
  /** Current ref object (useful if you need the element itself). */
  elementRef: RefObject<T | null>;
  /** Whether the element is currently intersecting. */
  isIntersecting: boolean;
  /** The latest IntersectionObserverEntry, or null. */
  entry: IntersectionObserverEntry | null;
}

export function useIntersectionObserver<
  T extends Element = HTMLDivElement,
>(
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverResult<T> {
  const {
    root = null,
    rootMargin = "0px",
    threshold = 0,
    freezeOnceVisible = false,
    enabled = true,
  } = options;

  const elementRef = useRef<T | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozen = useRef(false);

  const ref = (node: T | null) => {
    elementRef.current = node;
  };

  useEffect(() => {
    const node = elementRef.current;
    if (!enabled || !node || frozen.current) return;

    if (typeof IntersectionObserver === "undefined") {
      // SSR or unsupported: treat as intersecting so callers still render.
      setEntry({
        isIntersecting: true,
        intersectionRatio: 1,
        target: node,
      } as IntersectionObserverEntry);
      return;
    }

    const observer = new IntersectionObserver(
      ([latest]) => {
        setEntry(latest);
        if (freezeOnceVisible && latest.isIntersecting) {
          frozen.current = true;
          observer.disconnect();
        }
      },
      { root, rootMargin, threshold },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [enabled, root, rootMargin, threshold, freezeOnceVisible]);

  return {
    ref,
    elementRef,
    isIntersecting: entry?.isIntersecting ?? false,
    entry,
  };
}

// Example usage (React component):
// function LazyImage({ src, alt }: { src: string; alt: string }) {
//   const { ref, isIntersecting } = useIntersectionObserver({
//     rootMargin: "200px",
//     freezeOnceVisible: true,
//   });
//   return (
//     <img
//       ref={ref}
//       src={isIntersecting ? src : undefined}
//       alt={alt}
//       style={{ minHeight: 200, background: "#eee" }}
//     />
//   );
// }
