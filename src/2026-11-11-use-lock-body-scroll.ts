/**
 * React hook that locks body scroll (useful for modals, drawers, full-screen menus).
 *
 * Preserves the original overflow style and restores it on cleanup or when disabled.
 * Also supports an optional padding-right compensation for scrollbar width to prevent layout shift.
 */

import { useEffect, useRef } from "react";

export interface UseLockBodyScrollOptions {
  /** Whether the lock is active. Default: true */
  enabled?: boolean;
  /** Compensate for scrollbar width by adding padding-right. Default: true */
  compensateScrollbar?: boolean;
}

/**
 * Locks document.body scroll while `enabled` is true.
 *
 * @example
 * function Modal({ open }: { open: boolean }) {
 *   useLockBodyScroll({ enabled: open });
 *   return open ? <div className="modal">...</div> : null;
 * }
 */
export function useLockBodyScroll({
  enabled = true,
  compensateScrollbar = true,
}: UseLockBodyScrollOptions = {}) {
  const originalOverflow = useRef<string>("");
  const originalPaddingRight = useRef<string>("");

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const body = document.body;
    originalOverflow.current = body.style.overflow;
    originalPaddingRight.current = body.style.paddingRight;

    // Measure scrollbar width if needed
    const scrollbarWidth = compensateScrollbar
      ? window.innerWidth - document.documentElement.clientWidth
      : 0;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPadding = parseInt(window.getComputedStyle(body).paddingRight, 10) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = originalOverflow.current;
      body.style.paddingRight = originalPaddingRight.current;
    };
  }, [enabled, compensateScrollbar]);
}

// ——— Usage example ———
/*
import { useLockBodyScroll } from "./use-lock-body-scroll";

function Drawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useLockBodyScroll({ enabled: isOpen });

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true">
      <button onClick={onClose}>Close</button>
      <div>Drawer content</div>
    </div>
  );
}
*/
