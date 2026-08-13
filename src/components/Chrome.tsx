"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { reduced } from "@/lib/media";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { useLenis } from "@/components/SmoothScroll";
import { SECTIONS } from "@/content/site";

/* =============================================================== grain == */

/**
 * Film grain as a repeating 128px tile.
 *
 * A live SVG turbulence filter stretched over the viewport with a blend mode
 * would force the browser to re-composite the entire page on every scroll
 * frame -- not a trade worth making for grain.
 */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[300]"
      style={{
        backgroundImage: "url(/grain.png)",
        backgroundSize: "128px 128px",
        opacity: "var(--grain-opacity)",
      }}
    />
  );
}

/* ============================================================== curtain == */

/**
 * The entry transition: two ivory panels that part to reveal the page.
 *
 * It also gates the hero animation — `onDone` fires as the panels clear, so the
 * wordmark sets itself into an already-visible page rather than behind a
 * closed curtain.
 */
export function Curtain({ onDone }: { onDone?: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (reduced()) {
      gsap.set(root, { display: "none" });
      onDone?.();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        delay: 0.15,
        onComplete: () => {
          gsap.set(root, { display: "none" });
          onDone?.();
        },
      });

      tl.to("[data-curtain-word]", { autoAlpha: 1, duration: 0.9, ease: "editorial" })
        .to("[data-curtain-rule]", { scaleX: 1, duration: 1.1, ease: "editorial" }, 0.2)
        .to("[data-curtain-word]", { autoAlpha: 0, duration: 0.6, ease: "swift" }, 1.35)
        .to(
          "[data-curtain-panel]",
          { scaleY: 0, duration: 1.25, stagger: 0.07, ease: "drape" },
          1.5
        );
    }, root);

    return () => ctx.revert();
  }, [onDone]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[500] flex" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          data-curtain-panel
          className="h-full flex-1 origin-bottom"
          style={{ backgroundColor: "var(--bg)" }}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          data-curtain-word
          className="display text-[clamp(2rem,6vw,4rem)] opacity-0"
          style={{ color: "var(--ink-strong)" }}
        >
          Vespera
        </span>
        <span
          data-curtain-rule
          className="mt-6 block h-px w-[min(22rem,50vw)] origin-left scale-x-0"
          style={{ backgroundColor: "var(--line-strong)" }}
        />
      </div>
    </div>
  );
}

/* ====================================================== active section == */

/**
 * Index of the section currently under the middle of the viewport.
 *
 * Two components need this and they are siblings, so rather than lifting state
 * into the page just to thread it back down, each one runs its own set of
 * triggers. Nine `ScrollTrigger.create` calls that do nothing but flip a
 * boolean cost less than the wiring would.
 */
function useActiveSection() {
  const [current, setCurrent] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      SECTIONS.forEach((section, i) => {
        const el = document.getElementById(section.id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setCurrent(i),
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return current;
}

/* ============================================================ progress == */

/**
 * A hairline rail with the current section's index and name.
 * Progress is written straight to the DOM — it updates every frame and must
 * never go through React state.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLSpanElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const current = useActiveSection();

  useIsomorphicLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          bar.style.transform = `scaleY(${self.progress})`;
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // The readout used to swap its number and label instantly, which made the one
  // piece of chrome that tracks the whole page the only piece that never
  // animated. Both ends roll on every change.
  useIsomorphicLayoutEffect(() => {
    const el = readoutRef.current;
    if (!el || reduced()) return;

    const anim = gsap.fromTo(
      el.querySelectorAll("[data-readout]"),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "snap", overwrite: true }
    );

    return () => {
      anim.kill();
      gsap.set(el.querySelectorAll("[data-readout]"), { autoAlpha: 1, y: 0 });
    };
  }, [current]);

  return (
    <div
      ref={readoutRef}
      className="pointer-events-none fixed right-[max(1.25rem,2.2vw)] top-1/2 z-[200] hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex"
    >
      <span data-readout className="index">
        {String(current + 1).padStart(2, "0")}
      </span>

      <span
        className="relative block h-32 w-px"
        style={{ backgroundColor: "var(--line)" }}
      >
        <span
          ref={barRef}
          className="absolute inset-0 block origin-top"
          style={{ backgroundColor: "var(--accent)", transform: "scaleY(0)" }}
        />
      </span>

      <span
        data-readout
        className="eyebrow whitespace-nowrap"
        style={{ writingMode: "vertical-rl", letterSpacing: "0.34em" }}
      >
        {SECTIONS[current]?.label}
      </span>
    </div>
  );
}

/* ================================================================= nav == */

export function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const current = useActiveSection();
  const lenis = useLenis();

  useEffect(() => {
    const initial = (document.documentElement.dataset.theme as "dark" | "light") ?? "dark";
    setTheme(initial);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("vespera-theme", next);
      } catch {
        /* private mode — the choice just won't persist */
      }
      return next;
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    // Retreat on the way down, return on the way up. The sequence stays clean
    // without ever stranding the user without navigation.
    //
    // The header only ever holds two positions, so the tween is built once and
    // fired on the crossings. Tweening from inside the handler instead built a
    // fresh tween on every scroll event -- around sixty a second under Lenis,
    // each one immediately overwriting the last -- to re-state a value that had
    // not changed since the previous frame.
    const slide = gsap.quickTo(el, "yPercent", { duration: 0.45, ease: "swift" });
    let last = 0;
    let hidden = false;

    const onScroll = () => {
      const y = window.scrollY;
      const next = y > last && y > 160;
      last = y;
      if (next === hidden) return;
      hidden = next;
      slide(hidden ? -130 : 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.8 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-[250] gutter py-7"
      style={{ willChange: "transform" }}
    >
      <nav className="mx-auto flex w-full max-w-[100rem] items-center justify-between">
        <button
          onClick={() => go("hero")}
          className="display text-[1.35rem] leading-none"
          style={{ color: "var(--ink-strong)" }}
        >
          Vespera
        </button>

        <div className="hidden items-center gap-10 md:flex">
          {SECTIONS.filter((s) => s.inNav).map((s) => (
            <NavLink
              key={s.id}
              label={s.label}
              active={SECTIONS[current]?.id === s.id}
              onClick={() => go(s.id)}
            />
          ))}
        </div>

        <button
          onClick={toggleTheme}
          data-cursor="link"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="eyebrow flex items-center gap-3"
        >
          <span
            className="relative block h-px w-8 overflow-hidden"
            style={{ backgroundColor: "var(--line-strong)" }}
          >
            <span
              className="absolute top-1/2 block h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                backgroundColor: "var(--ink)",
                left: theme === "dark" ? 0 : "calc(100% - 0.375rem)",
              }}
            />
          </span>
          <span className="w-10 text-left">{theme === "dark" ? "Nuit" : "Jour"}</span>
        </button>
      </nav>
    </header>
  );
}

/**
 * Nav item with an underline that wipes in from the left and out to the right.
 *
 * The same rule doubles as the active-section mark: while its section is under
 * the viewport's middle the underline stays drawn and the label lifts to full
 * ink, so the nav reports position instead of only responding to the pointer.
 * Origin is pinned left while active, or leaving the item would wipe the mark
 * away and the nav would go blank inside its own section.
 */
function NavLink({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      data-cursor="link"
      aria-current={active ? "true" : undefined}
      className="group relative"
    >
      <span
        className="eyebrow transition-colors duration-500 group-hover:text-ink"
        style={{ color: active ? "var(--ink)" : "var(--ink-muted)" }}
      >
        {label}
      </span>
      <span
        className={`absolute -bottom-1.5 left-0 block h-px w-full transition-transform duration-420 ease-snap group-hover:origin-left group-hover:scale-x-100 ${
          active ? "origin-left scale-x-100" : "origin-right scale-x-0"
        }`}
        style={{ backgroundColor: "var(--accent)" }}
      />
    </button>
  );
}
