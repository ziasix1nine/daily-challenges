/**
 * Custom React hook for the Geolocation API.
 *
 * Provides the user's current position with loading and error states.
 * Automatically cleans up watchers on unmount.
 *
 * @example
 * ```tsx
 * function LocationDisplay() {
 *   const { latitude, longitude, error, loading } = useGeolocation();
 *
 *   if (loading) return <p>Getting location...</p>;
 *   if (error) return <p>Error: {error.message}</p>;
 *
 *   return (
 *     <p>
 *       Lat: {latitude}, Lng: {longitude}
 *     </p>
 *   );
 * }
 * ```
 */

import { useEffect, useState, useCallback } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: GeolocationPositionError | Error | null;
  loading: boolean;
  timestamp: number | null;
}

export interface UseGeolocationOptions extends PositionOptions {
  /** Whether to watch for position changes (default: false) */
  watch?: boolean;
  /** Whether to request position immediately (default: true) */
  immediate?: boolean;
}

const defaultState: GeolocationState = {
  latitude: null,
  longitude: null,
  accuracy: null,
  error: null,
  loading: true,
  timestamp: null,
};

export function useGeolocation(options: UseGeolocationOptions = {}): GeolocationState & {
  refresh: () => void;
} {
  const {
    watch = false,
    immediate = true,
    enableHighAccuracy = false,
    timeout = 10000,
    maximumAge = 0,
  } = options;

  const [state, setState] = useState<GeolocationState>(defaultState);

  const onSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false,
      timestamp: position.timestamp,
    });
  }, []);

  const onError = useCallback((error: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      error,
      loading: false,
    }));
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: new Error('Geolocation is not supported by this browser'),
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
  }, [enableHighAccuracy, timeout, maximumAge, onSuccess, onError]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        ...defaultState,
        error: new Error('Geolocation is not supported by this browser'),
        loading: false,
      });
      return;
    }

    let watchId: number | undefined;

    if (immediate) {
      refresh();
    }

    if (watch) {
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy,
        timeout,
        maximumAge,
      });
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, immediate, enableHighAccuracy, timeout, maximumAge, refresh, onSuccess, onError]);

  return { ...state, refresh };
}

// Usage example:
// const { latitude, longitude, loading, error, refresh } = useGeolocation({
//   enableHighAccuracy: true,
//   watch: true,
// });
