/**
 * useOnlineStatus
 *
 * React hook that returns the current online/offline status of the browser
 * and updates automatically when the connection changes.
 *
 * @example
 * function StatusIndicator() {
 *   const isOnline = useOnlineStatus();
 *   return <span>{isOnline ? 'Online' : 'Offline'}</span>;
 * }
 */

import { useState, useEffect } from 'react';

type UseOnlineStatusOptions = {
  /** Initial value if navigator is not available (e.g. SSR). Default: true */
  initialValue?: boolean;
};

export function useOnlineStatus(options: UseOnlineStatusOptions = {}): boolean {
  const { initialValue = true } = options;

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return initialValue;
    return navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync in case the status changed between render and effect
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ---------------------------------------------------------------------------
// Usage example (React component)
// ---------------------------------------------------------------------------
/*
import { useOnlineStatus } from './2026-10-25-use-online-status';

function NetworkStatus() {
  const isOnline = useOnlineStatus();

  return (
    <div style={{ color: isOnline ? 'green' : 'red' }}>
      {isOnline ? 'Connected' : 'No internet connection'}
    </div>
  );
}
*/
