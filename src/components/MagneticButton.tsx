"use client";

import { useRef, type ReactNode } from "react";

import { gsap } from "@/lib/gsap";
import { finePointer, reduced } from "@/lib/media";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "outline" | "solid";
  className?: string;
}

/**
 * Pointer-attracted button with a background that wipes up from the base.
 *
 * Uses gsap.quickTo rather than a tween per pointermove: quickTo reuses a
 * single tween instance, so dragging across a row of buttons doesn't allocate
 * hundreds of them.
 */
export function MagneticButton({
  children,
  onClick,
  href,
  variant = "outline",
  className = "",
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!finePointer() || reduced()) return;

    const label = el.querySelector<HTMLElement>("[data-label]");
    const setX = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" });
    const setY = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" });
    const setLX = label ? gsap.quickTo(label, "x", { duration: 0.95, ease: "power3.out" }) : null;
    const setLY = label ? gsap.quickTo(label, "y", { duration: 0.95, ease: "power3.out" }) : null;

    const RADIUS = 80;

    /*
     * The box is measured lazily and held until something can have moved it,
     * rather than read on every pointermove. A getBoundingClientRect per move
     * per button forces layout mid-gesture, and under Lenis that lands in the
     * same frames the scroll is being smoothed in.
     *
     * What is cached is the box at rest. getBoundingClientRect reports the
     * element where its transform currently puts it, so the offset this effect
     * is itself applying has to come back out -- and go back in on read. That
     * matters: measuring the displaced box is what makes the pull settle rather
     * than jump, because each move is measured from where the button has
     * already travelled to, so the remaining distance shrinks as it closes.
     * Caching the rest box and skipping the offset would silently make every
     * button about a third more magnetic.
     */
    const at = (axis: "x" | "y") => (gsap.getProperty(el, axis) as number) || 0;
    let box: { cx: number; cy: number; w: number; h: number } | null = null;
    const invalidate = () => {
      box = null;
    };

    const onMove = (event: PointerEvent) => {
      if (!box) {
        const r = el.getBoundingClientRect();
        box = {
          cx: r.left + r.width / 2 - at("x"),
          cy: r.top + r.height / 2 - at("y"),
          w: r.width,
          h: r.height,
        };
      }

      const dx = event.clientX - (box.cx + at("x"));
      const dy = event.clientY - (box.cy + at("y"));
      const near = Math.abs(dx) < box.w / 2 + RADIUS && Math.abs(dy) < box.h / 2 + RADIUS;

      // The label trails the button, which reads as weight rather than snap.
      setX(near ? dx * 0.3 : 0);
      setY(near ? dy * 0.3 : 0);
      setLX?.(near ? dx * 0.12 : 0);
      setLY?.(near ? dy * 0.12 : 0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, []);

  const solid = variant === "solid";

  return (
    <a
      ref={ref}
      href={href ?? "#"}
      onClick={(e) => {
        if (!href) e.preventDefault();
        onClick?.();
      }}
      data-cursor="link"
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-10 py-5 ${className}`}
      style={{
        border: `1px solid ${solid ? "transparent" : "var(--line-strong)"}`,
        // The solid variant is the page's one filled surface, so it is also the
        // only place the accent is allowed to carry a whole shape rather than a
        // hairline.
        backgroundColor: solid ? "var(--accent)" : "transparent",
      }}
    >
      {/* fill wipes up from the base on hover */}
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-450 ease-snap group-hover:scale-y-100"
        style={{ backgroundColor: solid ? "var(--ink-strong)" : "var(--accent)" }}
      />
      <span
        data-label
        className="eyebrow relative block transition-colors duration-300"
        style={{ color: solid ? "var(--accent-ink)" : "var(--ink)" }}
      >
        <span
          className={`transition-colors duration-300 ${
            solid ? "group-hover:text-bg" : "group-hover:text-(--accent-ink)"
          }`}
        >
          {children}
        </span>
      </span>
    </a>
  );
}
