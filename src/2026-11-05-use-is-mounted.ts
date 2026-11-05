/**
 * Custom React hook that returns whether the component is currently mounted.
 * Useful to avoid state updates or side effects after unmount (e.g. in async callbacks).
 *
 * @returns {boolean} `true` if the component is mounted, `false` otherwise.
 *
 * @example
 * function UserProfile({ userId }: { userId: string }) {
 *   const isMounted = useIsMounted();
 *   const [user, setUser] = useState(null);
 *
 *   useEffect(() => {
 *     fetchUser(userId).then((data) => {
 *       if (isMounted()) {
 *         setUser(data);
 *       }
 *     });
 *   }, [userId, isMounted]);
 *
 *   return user ? <div>{user.name}</div> : <div>Loading...</div>;
 * }
 */
import { useEffect, useRef, useCallback } from 'react';

export function useIsMounted(): () => boolean {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

// Usage example (React component context)
if (typeof window !== 'undefined') {
  // In a real component:
  // const isMounted = useIsMounted();
  // fetchData().then(data => {
  //   if (isMounted()) setData(data);
  // });
  console.log('useIsMounted hook ready for import');
}
