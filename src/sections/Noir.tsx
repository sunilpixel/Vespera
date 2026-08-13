"use client";

import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { reduced } from "@/animations/reveals";
import { Plate } from "@/components/Plate";

/**
 * Small rectangle to full screen.
 *
 * The section pins and the plate grows from a portrait card at the centre of
 * the viewport out to full bleed. Three things are driven off the same scrub so
 * they stay locked together: the frame's clip-path opens, its border-radius
 * flattens, and the picture inside counter-scales. The label crossing it
 * inverts via difference blending, so it stays legible over both the pale and
 * the dark half of the image without a scrim.
 */
export function Noir() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin) return;

    const ctx = gsap.context(() => {
      const frame = root.querySelector<HTMLElement>("[data-noir-frame]");
      const media = root.querySelector<HTMLElement>("[data-plate-media]");
      const label = root.querySelector<HTMLElement>("[data-noir-label]");
      const meta = root.querySelector<HTMLElement>("[data-noir-meta]");
      if (!frame) return;

      if (reduced()) {
        gsap.set(frame, { clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=140%",
          pin,
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      });

      // The frame is full-bleed from the outset and revealed by an inset
      // clip-path. Animating width/height instead would force a layout on every
      // scroll frame; clip-path never touches layout.
      // Starts as a portrait card rather than a stamp: at the old 33% inset the
      // plate opened at 490px wide on a 1440px viewport, so five sixths of the
      // pinned screen was bare ground for the first half of the scrub.
      tl.fromTo(
        frame,
        { clipPath: "inset(11% 27% 11% 27% round 2px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "drape", duration: 1 },
        0
      );

      if (media) {
        tl.fromTo(media, { scale: 1.5 }, { scale: 1, ease: "drape", duration: 1 }, 0);
      }

      // The label opens its tracking as the frame opens its width.
      if (label) {
        tl.fromTo(
          label,
          { letterSpacing: "-0.03em", scale: 0.86 },
          { letterSpacing: "0.02em", scale: 1, ease: "drape", duration: 1 },
          0
        );
      }
      if (meta) tl.fromTo(meta, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 }, 0.62);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="noir" className="relative">
      <div
        ref={pinRef}
        className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden"
      >
        <Plate
          id="fold"
          data-noir-frame
          data-cursor="view"
          bleed={10}
          sizes="100vw"
          className="absolute inset-0 h-full w-full"
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <h2
            data-noir-label
            className="display text-[clamp(2.6rem,11vw,11rem)]"
            style={{ color: "var(--ink-strong)", mixBlendMode: "difference" }}
          >
            Noir
          </h2>
          <p
            data-noir-meta
            className="eyebrow mt-8 opacity-0"
            style={{ mixBlendMode: "difference" }}
          >
            Édition limitée — 300 flacons
          </p>
        </div>
      </div>
    </section>
  );
}
