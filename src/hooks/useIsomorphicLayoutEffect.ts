import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect that degrades to useEffect on the server, so GSAP setup runs
 * before paint in the browser without tripping React's SSR warning.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
