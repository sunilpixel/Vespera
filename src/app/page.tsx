"use client";

import { useCallback, useEffect, useState } from "react";

import { ScrollTrigger } from "@/lib/gsap";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Cursor } from "@/components/Cursor";
import { Curtain, Grain, Nav, ScrollProgress } from "@/components/Chrome";
import { Marquee } from "@/components/Marquee";
import { Hero } from "@/sections/Hero";
import { Story } from "@/sections/Story";
import { Light } from "@/sections/Light";
import { Compositions } from "@/sections/Compositions";
import { Archive } from "@/sections/Archive";
import { Craft } from "@/sections/Craft";
import { Ethos } from "@/sections/Ethos";
import { Noir } from "@/sections/Noir";
import { Enquire, Footer } from "@/sections/Enquire";

export default function Page() {
  const [ready, setReady] = useState(false);
  const onCurtainDone = useCallback(() => setReady(true), []);

  useEffect(() => {
    // Fonts and plates both change layout after first paint; ScrollTrigger has
    // to re-measure or every pinned section starts a few hundred pixels off.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <SmoothScroll>
      <Curtain onDone={onCurtainDone} />
      <Grain />
      <Cursor />
      <Nav />
      <ScrollProgress />

      <main>
        <Hero ready={ready} />
        <Story />
        <Light />
        <Compositions />
        <Archive />
        <Craft />
        {/* Between the densest section and the quietest one: the band keeps the
            page in motion across a handover where nothing else does. */}
        <Marquee />
        <Ethos />
        <Noir />
        <Enquire />
      </main>

      <Footer />
    </SmoothScroll>
  );
}
