"use client";

import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { finePointer, reduced } from "@/lib/media";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * A ring that trails the pointer and inverts over imagery.
 *
 * The lag between the dot and the ring is the effect; matched speeds read as a
 * broken cursor rather than a designed one. Over a plate the ring fills and
 * takes a label, which is the standard editorial "view" affordance.
 *
 * Fine pointers only -- touch keeps native behaviour.
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!ring || !dot || !label) return;

    if (!finePointer() || reduced()) return;

    document.body.dataset.cursor = "on";

    const dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.6, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.6, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    let mode = "";
    // Delegated, so content mounted later is covered without re-binding.
    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const media = target?.closest?.("[data-cursor='view']");
      const link = target?.closest?.("a, button, [data-cursor='link']");
      const next = media ? "view" : link ? "link" : "";
      if (next === mode) return;
      mode = next;

      const ringScale = media ? 3.1 : link ? 1.9 : 1;
      gsap.to(ring, {
        scale: ringScale,
        backgroundColor: media ? "var(--ink)" : "transparent",
        borderColor: media ? "transparent" : "var(--line-strong)",
        duration: 0.55,
        ease: "editorial",
      });
      // The label lives inside the ring so it inherits the position, but it
      // must not inherit the scale -- counter-scaling keeps the type at its
      // designed size instead of ballooning with the circle.
      gsap.to(label, {
        scale: 1 / ringScale,
        opacity: media ? 1 : 0,
        duration: 0.55,
        ease: "editorial",
      });
      gsap.to(dot, { opacity: media || link ? 0 : 1, duration: 0.3 });
    };

    gsap.set([ring, dot], { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.to([ring, dot], { opacity: 1, duration: 0.8, delay: 0.9 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });

    return () => {
      delete document.body.dataset.cursor;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[400] hidden md:block" aria-hidden>
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border"
        style={{ borderColor: "var(--line-strong)", willChange: "transform" }}
      >
        <span
          ref={labelRef}
          className="whitespace-nowrap text-[10px] uppercase tracking-[0.28em] opacity-0"
          style={{ color: "var(--bg)" }}
        >
          View
        </span>
      </div>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1 w-1 rounded-full"
        style={{ backgroundColor: "var(--ink)", willChange: "transform" }}
      />
    </div>
  );
}
