import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Tool state that lives in the URL so any scenario is shareable and
 * deep-linkable. The full state is JSON-encoded into a single `s` query
 * parameter; when the state equals its default the parameter is dropped to
 * keep clean URLs clean.
 *
 * The URL is the single source of truth — `state` is derived from it on every
 * render, so `setState` always takes the complete next state (compute it from
 * the current `state` in the caller). Updates use `replace` so dragging a
 * slider doesn't flood browser history.
 *
 * Pass a stable `defaultState` (a module-level constant) so the returned
 * callbacks stay referentially stable.
 */
export function useSharedState<T>(
  defaultState: T,
): [T, (next: T) => void, () => void] {
  const [params, setParams] = useSearchParams();

  const raw = params.get("s");
  let state = defaultState;
  if (raw) {
    try {
      state = JSON.parse(decodeURIComponent(raw)) as T;
    } catch {
      state = defaultState;
    }
  }

  const setState = useCallback(
    (next: T) => {
      const isDefault =
        JSON.stringify(next) === JSON.stringify(defaultState);
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          if (isDefault) p.delete("s");
          else p.set("s", encodeURIComponent(JSON.stringify(next)));
          return p;
        },
        { replace: true },
      );
    },
    [setParams, defaultState],
  );

  const reset = useCallback(() => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete("s");
        return p;
      },
      { replace: true },
    );
  }, [setParams]);

  return [state, setState, reset];
}
