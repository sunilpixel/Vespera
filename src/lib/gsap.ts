/**
 * Single registration point for GSAP and its plugins.
 *
 * Importing gsap directly anywhere else risks a component animating before the
 * module that registers ScrollTrigger has run, so everything pulls from here.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

  // The house eases.
  //
  // The first four are slow-out: the long, unhurried arrivals that carry the
  // primary type and imagery. The last two are the counterweight -- when every
  // ease on a page is a 1.5s slow-out, the eye stops registering any of them as
  // motion at all. Secondary detail moves on `snap`, and anything that has to
  // land with a small physical overshoot uses `settle`.
  CustomEase.create("editorial", "0.16, 1, 0.3, 1");
  CustomEase.create("swift", "0.7, 0, 0.2, 1");
  CustomEase.create("veil", "0.22, 1, 0.26, 1");
  CustomEase.create("drape", "0.38, 0.01, 0.1, 1");
  CustomEase.create("snap", "0.33, 1.06, 0.32, 1");
  CustomEase.create("settle", "0.34, 1.42, 0.56, 1");

  gsap.defaults({ ease: "editorial", duration: 1.2 });
  gsap.config({ force3D: true, nullTargetWarn: false });
}

export { gsap, ScrollTrigger, SplitText, CustomEase };
