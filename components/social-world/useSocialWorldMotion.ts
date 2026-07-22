"use client";

import { RefObject, useEffect, type MutableRefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { HomeCinematicPhase } from "@/lib/experience-types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const phaseForProgress = (progress: number): HomeCinematicPhase => {
  if (progress < .18) return "arrival";
  if (progress < .45) return "depth";
  if (progress < .72) return "gather";
  if (progress < .9) return "passage";
  return "handoff";
};

export function useSocialWorldMotion(
  scope: RefObject<HTMLElement | null>,
  cinematicProgress: MutableRefObject<number>,
  cinematicPointer: MutableRefObject<{ x: number; y: number }>,
) {
  useEffect(() => {
    const root = scope.current;
    if (!root || prefersReducedMotion()) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const lenis = finePointer
      ? new Lenis({
          duration: .92,
          easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)),
          smoothWheel: true,
          syncTouch: false,
        })
      : null;
    const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const hero = root.querySelector<HTMLElement>("[data-cinematic-stage]");
    const fragments = Array.from(root.querySelectorAll<HTMLElement>("[data-orbit-fragment]"));
    const fragmentMoves = fragments.map((fragment) => {
      const depth = Number(fragment.style.getPropertyValue("--fragment-depth") || 1);
      return {
        depth,
        xTo: gsap.quickTo(fragment, "x", { duration: 0.42, ease: "power3.out" }),
        yTo: gsap.quickTo(fragment, "y", { duration: 0.42, ease: "power3.out" }),
      };
    });

    const update = () => ScrollTrigger.update();
    const tick = (time: number) => lenis?.raf(time * 1000);
    const navigate = (event: MouseEvent) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      const href = anchor.getAttribute("href");
      const target = href ? root.querySelector<HTMLElement>(href) : null;
      if (!href || !target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.15 });
      else target.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", href);
    };
    const moveFragments = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      cinematicPointer.current = { x: x * 2, y: y * 2 };
      fragmentMoves.forEach(({ depth, xTo, yTo }) => {
        xTo(x * 17 * depth);
        yTo(y * 12 * depth);
      });
      window.dispatchEvent(new Event("fitmeet:cinematic-progress"));
    };
    const resetFragments = () => {
      cinematicPointer.current = { x: 0, y: 0 };
      fragmentMoves.forEach(({ xTo, yTo }) => { xTo(0); yTo(0); });
      window.dispatchEvent(new Event("fitmeet:cinematic-progress"));
    };

    lenis?.on("scroll", update);
    if (lenis) {
      gsap.ticker.add(tick);
    }
    anchors.forEach((anchor) => anchor.addEventListener("click", navigate));
    hero?.addEventListener("pointermove", moveFragments, { passive: true });
    hero?.addEventListener("pointerleave", resetFragments);

    return () => {
      lenis?.off("scroll", update);
      if (lenis) gsap.ticker.remove(tick);
      lenis?.destroy();
      anchors.forEach((anchor) => anchor.removeEventListener("click", navigate));
      hero?.removeEventListener("pointermove", moveFragments);
      hero?.removeEventListener("pointerleave", resetFragments);
    };
  }, [cinematicPointer, scope]);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root || prefersReducedMotion()) return;

      const drawRoute = (path: SVGPathElement, trigger?: Element, start = "top 76%", end = "bottom 52%") => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        if (!trigger) {
          gsap.to(path, { strokeDashoffset: 0, duration: 1.8, delay: 0.15, ease: "power2.out" });
          return;
        }
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger, start, end, scrub: 0.65 },
        });
      };

      const routePaths = Array.from(root.querySelectorAll<SVGPathElement>("[data-brand-route]"));
      const cinematic = root.querySelector<HTMLElement>("[data-home-cinematic]");
      const appEntry = root.querySelector<HTMLElement>("[data-app-entry]");
      routePaths.forEach((path, index) => {
        if (index === 0) drawRoute(path);
        else if (index === 1 && appEntry) drawRoute(path, appEntry, "top 78%", "bottom 60%");
      });

      const heroFragments = gsap.utils.toArray<HTMLElement>("[data-orbit-fragment]");
      gsap.from(heroFragments, {
        scale: 0.86,
        y: (index) => (index % 2 === 0 ? 22 : -18),
        duration: 0.88,
        stagger: { amount: 0.5, from: "center" },
        ease: "power3.out",
        delay: 0.08,
      });
      gsap.from("[data-hero-copy] > *:not(h1)", {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.22,
      });

      if (cinematic) {
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: cinematic,
            start: "top top",
            end: "bottom bottom",
          scrub: .58,
            refreshPriority: -10,
            onUpdate: (self) => {
              cinematicProgress.current = self.progress;
              cinematic.dataset.cinematicPhase = phaseForProgress(self.progress);
              window.dispatchEvent(new Event("fitmeet:cinematic-progress"));
            },
          },
        });
        timeline
          .to("[data-hero-copy]", { yPercent: -12, autoAlpha: 0, duration: .2, ease: "power2.in" }, .2)
          .to(heroFragments, {
            x: (index) => ((index % 3) - 1) * 64,
            y: (index) => (index - 4) * 10,
            scale: .66,
            autoAlpha: .1,
            stagger: { amount: .08, from: "edges" },
            duration: .27,
          }, .4)
          .to("[data-cinematic-stage] [data-brand-route]", { autoAlpha: 0, duration: .2 }, .6)
          .fromTo("[data-cinematic-media]", { scale: .62, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .27, ease: "power1.inOut" }, .66)
          .to("[data-cinematic-shade]", { autoAlpha: 1, duration: .24 }, .68)
          .to("[data-cinematic-field]", { autoAlpha: 0, duration: .18 }, .76)
          .fromTo("[data-cinematic-copy]", { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: .13, ease: "power2.out" }, .86);
      }

      const reveal = (targets: gsap.TweenTarget, trigger: string, options: gsap.TweenVars = {}) => {
        gsap.from(targets, {
          autoAlpha: 0,
          y: 42,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          ...options,
          scrollTrigger: { trigger, start: "top 76%", once: true },
        });
      };

      reveal("[data-world-copy] > *", "[data-world-preview]");
      reveal("[data-agent-copy] > *, [data-agent-demo]", "[data-agent-preview]");
      reveal("[data-moments-header] > *", "[data-moments-preview]");
      reveal("[data-moment-article]", "[data-moments-preview]", { stagger: 0.12 });
      reveal("[data-safety-copy] > *", "[data-safety-preview]");
      reveal("[data-app-copy] > *, [data-app-status]", "[data-app-entry]");

      gsap.fromTo("[data-world-media] img", { scale: 1.06 }, {
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: "[data-world-preview]", start: "top bottom", end: "bottom top", scrub: 0.8 },
      });
    },
    { scope, dependencies: [cinematicProgress], revertOnUpdate: true },
  );
}
