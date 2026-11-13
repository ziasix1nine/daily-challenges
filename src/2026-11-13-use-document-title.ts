import { useEffect, useRef } from 'react';

/**
 * React hook that sets `document.title` and optionally restores the previous title on unmount.
 *
 * Ideal for page-level components that should update the browser tab title.
 *
 * @param {string} title - The title to set on the document
 * @param {object} [options] - Optional configuration
 * @param {boolean} [options.restoreOnUnmount=true] - Restore previous title when the component unmounts
 *
 * @example
 * function ProductPage({ product }: { product: { name: string } }) {
 *   useDocumentTitle(`${product.name} | Store`);
 *   return <h1>{product.name}</h1>;
 * }
 *
 * @example
 * // Keep the new title even after unmount
 * useDocumentTitle('Settings', { restoreOnUnmount: false });
 */
export function useDocumentTitle(
  title: string,
  options: { restoreOnUnmount?: boolean } = {}
): void {
  const { restoreOnUnmount = true } = options;
  const previousTitleRef = useRef<string>(document.title);

  useEffect(() => {
    const previous = previousTitleRef.current;
    document.title = title;

    return () => {
      if (restoreOnUnmount) {
        document.title = previous;
      }
    };
  }, [title, restoreOnUnmount]);
}

// Usage example (in a React component):
/*
function Dashboard() {
  useDocumentTitle('Dashboard — Acme App');

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome back!</p>
    </main>
  );
}

function Modal({ open }: { open: boolean }) {
  useDocumentTitle(open ? 'Confirm Action' : document.title, {
    restoreOnUnmount: true
  });

  if (!open) return null;
  return <div role="dialog">Confirm?</div>;
}
*/
