/**
 * React hook that tracks the size of a DOM element using ResizeObserver.
 * Returns the element's content box width and height.
 *
 * Useful for responsive components, charts, virtual lists, etc.
 */

import { useEffect, useRef, useState, type RefObject } from "react";

export interface ElementSize {
  width: number;
  height: number;
}

export interface UseElementSizeOptions {
  /** Initial size before the observer fires. Defaults to { width: 0, height: 0 } */
  initialSize?: ElementSize;
  /** Whether to observe border-box instead of content-box. Default: false */
  box?: "content-box" | "border-box" | "device-pixel-content-box";
}

/**
 * Track the rendered size of a DOM element.
 *
 * @example
 * function ResizableBox() {
 *   const { ref, width, height } = useElementSize<HTMLDivElement>();
 *   return (
 *     <div ref={ref} style={{ border: "1px solid #ccc", padding: 16 }}>
 *       Size: {width} × {height}
 *     </div>
 *   );
 * }
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(
  options: UseElementSizeOptions = {}
): { ref: RefObject<T>; width: number; height: number } {
  const { initialSize = { width: 0, height: 0 }, box = "content-box" } = options;

  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize>(initialSize);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      let width: number;
      let height: number;

      if (box === "border-box" && entry.borderBoxSize) {
        const borderBox = Array.isArray(entry.borderBoxSize)
          ? entry.borderBoxSize[0]
          : entry.borderBoxSize;
        width = borderBox.inlineSize;
        height = borderBox.blockSize;
      } else if (box === "device-pixel-content-box" && entry.devicePixelContentBoxSize) {
        const deviceBox = Array.isArray(entry.devicePixelContentBoxSize)
          ? entry.devicePixelContentBoxSize[0]
          : entry.devicePixelContentBoxSize;
        width = deviceBox.inlineSize;
        height = deviceBox.blockSize;
      } else {
        // content-box (default)
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }

      setSize({ width: Math.round(width), height: Math.round(height) });
    });

    observer.observe(element, { box });

    return () => {
      observer.disconnect();
    };
  }, [box]);

  return {
    ref,
    width: size.width,
    height: size.height,
  };
}

// --- Usage example (React) ---
/*
import { useElementSize } from "./2026-11-15-use-element-size";

function Card() {
  const { ref, width, height } = useElementSize<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{
        resize: "both",
        overflow: "auto",
        border: "1px solid #ddd",
        padding: "1rem",
        minWidth: 200,
        minHeight: 100,
      }}
    >
      <p>Current size: {width}px × {height}px</p>
    </div>
  );
}
*/
