/**
 * Merges multiple React refs into a single callback ref.
 * Useful when a component needs to forward a ref while also using one internally
 * (e.g. combining a forwarded ref with a local ref for measurements or focus).
 *
 * Supports both callback refs and RefObject refs.
 */

type Ref<T> = React.RefCallback<T> | React.MutableRefObject<T> | null | undefined;

/**
 * Combines multiple refs into one.
 *
 * @param refs - Any number of refs (callback or object refs)
 * @returns A single callback ref that updates all provided refs
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const forwardedRef = ...; // from forwardRef
 *
 * <div ref={mergeRefs(ref, forwardedRef)} />
 */
export function mergeRefs<T>(...refs: Array<Ref<T>>): React.RefCallback<T> {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}

// Usage example:
if (typeof window !== 'undefined') {
  // In a React component:
  // const localRef = useRef<HTMLInputElement>(null);
  // const inputRef = mergeRefs(localRef, props.ref);
  // <input ref={inputRef} />
  console.log('mergeRefs utility loaded');
}
