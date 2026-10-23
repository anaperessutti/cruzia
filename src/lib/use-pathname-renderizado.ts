import { useRouterState } from "@tanstack/react-router";

/** Keep shared chrome aligned with the route whose content has resolved. */
export function usePathnameRenderizado() {
  return useRouterState({
    select: (state) => state.resolvedLocation?.pathname ?? state.location.pathname,
  });
}