/**
 * useBroadcastChannel — React hook for simple cross-tab (and cross-window) messaging
 * using the BroadcastChannel API.
 *
 * Useful for keeping multiple tabs of the same app in sync (auth state, theme,
 * shopping cart, notifications, etc.) without a server or localStorage polling.
 *
 * @example
 * ```tsx
 * function ThemeSync() {
 *   const { postMessage, lastMessage } = useBroadcastChannel<{ theme: string }>('theme');
 *
 *   useEffect(() => {
 *     if (lastMessage?.theme) {
 *       document.documentElement.dataset.theme = lastMessage.theme;
 *     }
 *   }, [lastMessage]);
 *
 *   return (
 *     <button onClick={() => postMessage({ theme: 'dark' })}>
 *       Set dark theme (all tabs)
 *     </button>
 *   );
 * }
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseBroadcastChannelResult<T> {
  /** Post a message to all other tabs/windows on the same channel. */
  postMessage: (message: T) => void;
  /** The most recent message received from another tab (null until first message). */
  lastMessage: T | null;
  /** Whether the BroadcastChannel API is supported in this browser. */
  isSupported: boolean;
  /** Manually close the channel (usually not needed — cleaned up on unmount). */
  close: () => void;
}

export function useBroadcastChannel<T = unknown>(
  channelName: string
): UseBroadcastChannelResult<T> {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    const handler = (event: MessageEvent<T>) => {
      setLastMessage(event.data);
    };

    channel.addEventListener('message', handler);

    return () => {
      channel.removeEventListener('message', handler);
      channel.close();
      channelRef.current = null;
    };
  }, [channelName]);

  const postMessage = useCallback((message: T) => {
    channelRef.current?.postMessage(message);
  }, []);

  const close = useCallback(() => {
    channelRef.current?.close();
    channelRef.current = null;
  }, []);

  return { postMessage, lastMessage, isSupported, close };
}

// ---------------------------------------------------------------------------
// Usage example (plain JS / non-React contexts can also use BroadcastChannel directly)
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  const demo = new BroadcastChannel('daily-challenges-demo');
  demo.onmessage = (e) => console.log('[demo] received:', e.data);
  // demo.postMessage({ hello: 'from another tab' });
  // demo.close();
}
