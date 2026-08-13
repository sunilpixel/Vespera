"use client";

import { useRef } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { reduced } from "@/animations/reveals";
import { MARQUEE } from "@/content/site";

/**
 * The running band.
 *
 * The only element on the page that moves when the reader does not, which is
 * precisely its job: it sits between the densest section and the quietest one
 * and keeps the page alive across the handover.
 *
 * Two behaviours ride on top of the base crawl:
 *
 *   direction — the band runs with the reader. Scroll down and it travels left,
 *               scroll up and it reverses. Nothing else on the page carries
 *               that information, so it reads as the page acknowledging you.
 *   velocity  — a hard flick spins it up to roughly triple speed and it eases
 *               back down. `timeScale` is the right knob for this: it retimes
 *               the existing tween instead of stacking a second one on the same
 *               transform.
 */
export function Marquee() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || reduced()) return;

    const ctx = gsap.context(() => {
      // The track holds the phrase list twice, so a -50% travel lands the copy
      // exactly where the original started and the seam never shows.
      const crawl = gsap.to(track, {
        xPercent: -50,
        ease: "none",
        duration: 34,
        repeat: -1,
      });

      // Ease back to the base crawl rather than snapping, or every scroll stop
      // reads as the band hitting a wall.
      //
      // One paused tween, restarted, rather than a fresh one per scroll frame:
      // `invalidate` drops the start value it recorded last time so the restart
      // picks the spun-up timeScale off the tween as it stands now, which is
      // what building a new tween each frame was buying at the cost of an
      // allocation and a kill sixty times a second.
      const settle = gsap.to(crawl, {
        timeScale: 1,
        duration: 1.1,
        ease: "power2.out",
        paused: true,
      });

      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const boost = Math.min(Math.abs(self.getVelocity()) / 900, 2.2);
          crawl.timeScale(self.direction * (1 + boost));
          settle.vars.timeScale = self.direction;
          settle.invalidate().restart();
        },
      });

      return () => {
        settle.kill();
        st.kill();
        crawl.kill();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  // The two halves must be structurally identical, or -50% no longer lands on
  // the seam. The duplicate is decorative, so it is hidden from assistive tech
  // rather than read out a second time.
  const half = (copy: string) => (
    <div className="flex shrink-0 items-center" aria-hidden={copy === "b" ? true : undefined}>
      {MARQUEE.map((phrase, i) => (
        <span key={`${copy}-${i}`} className="flex shrink-0 items-center">
          <span className="display whitespace-nowrap text-[clamp(1.75rem,4.5vw,3.75rem)]">
            {phrase}
          </span>
          <span
            aria-hidden
            className="mx-[clamp(1.5rem,3.5vw,3.5rem)] block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: "var(--accent)" }}
          />
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden border-y py-[clamp(1.25rem,3vh,2.25rem)]"
      style={{ borderColor: "var(--line)", color: "var(--ink-strong)" }}
    >
      <div ref={trackRef} className="flex w-max items-center" style={{ willChange: "transform" }}>
        {half("a")}
        {half("b")}
      </div>
    </div>
  );
}
