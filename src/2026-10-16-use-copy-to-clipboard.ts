/**
 * React hook to copy text to the clipboard with feedback state.
 *
 * Handles modern Clipboard API with fallback, and provides success/error states.
 *
 * @example
 * const { copy, copied, error } = useCopyToClipboard();
 *
 * <button onClick={() => copy('Hello world')}>
 *   {copied ? 'Copied!' : 'Copy'}
 * </button>
 */
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseCopyToClipboardOptions {
  /** Duration in ms to keep `copied` true. Default: 2000 */
  resetDelay?: number;
}

interface UseCopyToClipboardReturn {
  /** Function to copy text to clipboard */
  copy: (text: string) => Promise<boolean>;
  /** Whether the last copy was successful (resets after delay) */
  copied: boolean;
  /** Error message if the last copy failed */
  error: string | null;
  /** Reset the copied/error state manually */
  reset: () => void;
}

export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardReturn {
  const { resetDelay = 2000 } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      reset();

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers / non-secure contexts
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.left = '-9999px';
          textarea.style.top = '-9999px';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const success = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (!success) {
            throw new Error('Fallback copy failed');
          }
        }

        setCopied(true);
        setError(null);

        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, resetDelay);

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to copy';
        setError(message);
        setCopied(false);
        return false;
      }
    },
    [reset, resetDelay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copy, copied, error, reset };
}

// Usage example:
/*
function CopyButton() {
  const { copy, copied, error } = useCopyToClipboard();

  return (
    <div>
      <button onClick={() => copy('https://github.com/ziasix1nine')}>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
}
*/
