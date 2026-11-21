import { useCallback, useEffect, useState } from 'react';

/**
 * Custom React hook to manage the Fullscreen API for an element.
 *
 * Provides enter/exit/toggle methods and reactive isFullscreen state.
 * Works with the standard Fullscreen API (and vendor prefixes where needed).
 *
 * @param ref - React ref to the element you want to make fullscreen
 * @returns Object with isFullscreen, enter, exit, toggle, and error state
 *
 * @example
 * function VideoPlayer() {
 *   const videoRef = useRef<HTMLVideoElement>(null);
 *   const { isFullscreen, toggle } = useFullscreen(videoRef);
 *
 *   return (
 *     <div>
 *       <video ref={videoRef} src="..." />
 *       <button onClick={toggle}>
 *         {isFullscreen ? 'Exit' : 'Enter'} Fullscreen
 *       </button>
 *     </div>
 *   );
 * }
 */
export function useFullscreen<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>
) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getFullscreenElement = () =>
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement;

  const updateState = useCallback(() => {
    const el = ref.current;
    setIsFullscreen(!!el && getFullscreenElement() === el);
  }, [ref]);

  useEffect(() => {
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];

    events.forEach((event) => {
      document.addEventListener(event, updateState);
    });

    updateState();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateState);
      });
    };
  }, [updateState]);

  const enter = useCallback(async () => {
    const el = ref.current;
    if (!el) {
      setError(new Error('No element reference provided'));
      return;
    }

    try {
      setError(null);
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      } else if ((el as any).mozRequestFullScreen) {
        await (el as any).mozRequestFullScreen();
      } else if ((el as any).msRequestFullscreen) {
        await (el as any).msRequestFullscreen();
      } else {
        throw new Error('Fullscreen API not supported');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [ref]);

  const exit = useCallback(async () => {
    try {
      setError(null);
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  const toggle = useCallback(async () => {
    if (isFullscreen) {
      await exit();
    } else {
      await enter();
    }
  }, [isFullscreen, enter, exit]);

  return {
    isFullscreen,
    enter,
    exit,
    toggle,
    error,
  };
}

// Usage example (commented, for reference)
/*
import { useRef } from 'react';

function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle, error } = useFullscreen(ref);

  return (
    <div>
      <div ref={ref} style={{ padding: 40, background: '#eee' }}>
        Content to fullscreen
      </div>
      <button onClick={toggle}>
        {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
*/
