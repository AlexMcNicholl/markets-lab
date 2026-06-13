import { useEffect, useRef, useState } from "react";

/**
 * Reports when an element first scrolls into view, so sections can reveal
 * themselves on entry. Fires once, then disconnects. Falls back to "visible"
 * when IntersectionObserver is unavailable so content is never hidden.
 */
export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.15 },
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}
