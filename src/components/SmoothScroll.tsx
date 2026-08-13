"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { reduced } from "@/lib/media";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

const LenisContext = createContext<Lenis | null>(null);

/** The live Lenis instance, for programmatic scrolling from the nav. */
export const useLenis = () => useContext(LenisContext);

/**
 * Drives Lenis from GSAP's ticker.
 *
 * They have to share a clock. If Lenis runs its own rAF loop while
 * ScrollTrigger reads scroll position on GSAP's, every pinned section lags the
 * content by a frame and the pins visibly shudder.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const raf = useRef<((time: number) => void) | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (reduced()) return;

    const instance = new Lenis({
      // A long decay, but no longer a slow one. The weight of the scroll is
      // most of what makes an editorial site feel expensive -- past about 1.1s
      // it stops reading as weight and starts reading as lag, and it drags
      // every scrubbed animation down with it.
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      syncTouch: false,
    });

    instance.on("scroll", ScrollTrigger.update);

    raf.current = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf.current);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);

    return () => {
      if (raf.current) gsap.ticker.remove(raf.current);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
