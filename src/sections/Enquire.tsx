"use client";

import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { drawRule, revealChars, revealLines, snapIn } from "@/animations/reveals";
import { MagneticButton } from "@/components/MagneticButton";

const COLOPHON = [
  { label: "Atelier", value: "14 rue des Bénédictins, Grasse" },
  { label: "Correspondence", value: "bureau@vespera.example" },
  { label: "Appointments", value: "Tuesday — Saturday, by request" },
];

/**
 * Closing statement.
 *
 * The last display line is the only other place the per-character treatment
 * from the cover appears — it bookends the page, so the ending rhymes with the
 * opening instead of introducing a ninth idea.
 */
export function Enquire() {
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const splits: { revert: () => void }[] = [];
      const heading = root.querySelector("[data-enquire-heading]");
      const body = root.querySelector("[data-enquire-body]");

      if (heading) splits.push(revealChars(heading, { stagger: 0.022, start: "top 80%" }));
      if (body) splits.push(revealLines(body, { start: "top 82%" }));

      root.querySelectorAll("[data-enquire-rule]").forEach((rule) => drawRule(rule));

      snapIn("[data-colophon-row]", {
        trigger: root.querySelector("[data-colophon]") ?? undefined,
        start: "top 86%",
        y: 22,
      });

      return () => splits.forEach((s) => s.revert());
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="enquire"
      className="relative gutter pb-16 pt-[clamp(6rem,18vh,14rem)]"
    >
      <div className="mx-auto w-full max-w-[100rem]">
        <p className="eyebrow">Enquire</p>

        <h2
          data-enquire-heading
          className="display invisible mt-10 max-w-[16ch] text-[clamp(2.8rem,10vw,9.5rem)]"
          style={{ color: "var(--ink-strong)" }}
        >
          Come and smell it
        </h2>

        <div className="mt-16 flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-end">
          <p
            data-enquire-body
            className="invisible max-w-lg text-[clamp(0.95rem,1.15vw,1.125rem)] leading-[1.8]"
            style={{ color: "var(--ink-muted)" }}
          >
            We do not ship samples. A composition read from a card is not the
            composition. Write to us and we will set aside an hour, a room, and
            the four bottles we think you should meet.
          </p>

          <MagneticButton variant="solid" href="mailto:bureau@vespera.example">
            Request an hour
          </MagneticButton>
        </div>

        {/* colophon */}
        <div data-colophon className="mt-[clamp(5rem,14vh,10rem)]">
          <span
            data-enquire-rule
            className="block h-px w-full origin-left scale-x-0"
            style={{ backgroundColor: "var(--line)" }}
          />
          <dl className="grid gap-x-12 gap-y-8 pt-10 md:grid-cols-3">
            {COLOPHON.map((row) => (
              <div key={row.label} data-colophon-row>
                <dt className="eyebrow">{row.label}</dt>
                <dd className="mt-3 text-[0.9375rem]" style={{ color: "var(--ink)" }}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="gutter pb-10 pt-16">
      <div
        className="mx-auto w-full max-w-[100rem] border-t pt-8"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="eyebrow">© MMXXV Vespera — A fictional maison</p>
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            {["Instagram", "Journal", "Stockists", "Legal"].map((item) => (
              <a
                key={item}
                href="#"
                data-cursor="link"
                className="group relative"
                onClick={(e) => e.preventDefault()}
              >
                <span className="eyebrow transition-colors duration-500 group-hover:text-[var(--ink)]">
                  {item}
                </span>
                <span
                  className="absolute -bottom-1.5 left-0 block h-px w-full origin-right scale-x-0 transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100"
                  style={{ backgroundColor: "var(--ink)" }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
