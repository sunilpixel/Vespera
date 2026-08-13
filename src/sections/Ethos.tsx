"use client";

import { useRef } from "react";

import { gsap, SplitText } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { reduced } from "@/animations/reveals";
import { Plate } from "@/components/Plate";
import { ETHOS } from "@/content/site";

/**
 * The pull quote.
 *
 * Words rise individually against a heavily scrimmed plate that drifts and
 * slowly loses its scrim as the quote lands — the background brightens exactly
 * as the sentence completes. The reveal is scrubbed rather than fired once, so
 * the reader controls the pace of the line.
 */
export function Ethos() {
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const quote = root.querySelector<HTMLElement>("[data-ethos-quote]");
      const media = root.querySelector<HTMLElement>("[data-plate-media]");
      const scrim = root.querySelector<HTMLElement>("[data-ethos-scrim]");
      if (!quote) return;

      const split = new SplitText(quote, {
        type: "words,lines",
        mask: "lines",
        linesClass: "line-mask",
      });
      gsap.set(quote, { autoAlpha: 1 });

      if (reduced()) return () => split.revert();

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 72%",
            end: "center 46%",
            scrub: 1.2,
          },
        })
        .from(split.words, { yPercent: 118, stagger: 0.06, ease: "veil" }, 0)
        .to(scrim, { opacity: 0.42, ease: "none" }, 0);

      if (media) {
        gsap.fromTo(
          media,
          { yPercent: -7, scale: 1.12 },
          {
            yPercent: 7,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }

      return () => split.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="ethos" className="relative min-h-[100svh] overflow-hidden">
      <Plate id="veil" bleed={10} sizes="100vw" className="absolute inset-0 h-full w-full" />
      <span
        data-ethos-scrim
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: "var(--bg)", opacity: 0.86 }}
      />

      <div className="relative flex min-h-[100svh] items-center gutter py-32">
        <div className="mx-auto w-full max-w-[100rem]">
          <blockquote>
            <p
              data-ethos-quote
              className="display invisible max-w-[22ch] text-[clamp(2.4rem,7.4vw,7rem)]"
              style={{ color: "var(--ink-strong)" }}
            >
              {ETHOS.quote}
            </p>
            <footer className="mt-14 flex items-center gap-5">
              <span className="block h-px w-16" style={{ backgroundColor: "var(--accent)" }} />
              <cite className="eyebrow not-italic">{ETHOS.attribution}</cite>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
