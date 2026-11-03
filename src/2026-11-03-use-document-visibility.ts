/**
 * Custom React hook that tracks the Page Visibility API state.
 *
 * Returns `true` when the document is visible (tab is focused / page is in foreground),
 * and `false` when it is hidden (user switched tabs or minimized the window).
 *
 * Perfect for:
 * - Pausing expensive animations or video when the tab is in the background
 * - Stopping polling / WebSocket heartbeats
 * - Analytics (time spent on page)
 * - Auto-saving or cleanup logic
 *
 * @example
 * ```tsx
 * function VideoPlayer() {
 *   const isVisible = useDocumentVisibility();
 *
 *   useEffect(() => {
 *     if (!isVisible) {
 *       videoRef.current?.pause();
 *     }
 *   }, [isVisible]);
 *
 *   return <video ref={videoRef} />;
 * }
 * ```
 */

import { useEffect, useState } from 'react';

export function useDocumentVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof document === 'undefined') return true;
    return document.visibilityState === 'visible';
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

// ─── Usage example ───
//
// function VisibilityDemo() {
//   const isVisible = useDocumentVisibility();
//
//   return (
//     <div>
//       <h2>Tab is currently: {isVisible ? 'Visible 👁️' : 'Hidden 🙈'}</h2>
//       <p>Switch tabs to see the state change.</p>
//     </div>
//   );
// }
