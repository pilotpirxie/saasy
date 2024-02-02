import { RefObject, useCallback, useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(ref: RefObject<T>, callback: () => void) {
  const handleClick = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  }, [ref, callback]);
  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [handleClick]);
}