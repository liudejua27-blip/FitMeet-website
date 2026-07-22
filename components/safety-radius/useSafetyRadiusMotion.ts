"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useSafetyRadiusMotion(
  scope: RefObject<HTMLElement | null>,
  onActiveLayerChange: (index: number) => void,
) {
  useEffect(() => {
    const root = scope.current;
    if (!root || reducedMotion()) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const lenis = finePointer
      ? new Lenis({
          duration: 1.06,
          easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)),
          smoothWheel: true,
          syncTouch: false,
        })
      : null;

    const update = () => ScrollTrigger.update();
    const tick = (time: number) => lenis?.raf(time * 1000);
    lenis?.on("scroll", update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const navigate = (event: MouseEvent) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = root.querySelector<HTMLElement>(href);
      if (!target) return;
      event.preventDefault();

      const layerIndex = Number(anchor.dataset.trustJump);
      const journey = root.querySelector<HTMLElement>("[data-trust-journey]");
      let destination: HTMLElement | number = target;
      if (journey && Number.isFinite(layerIndex)) {
        const range = Math.max(0, journey.offsetHeight - window.innerHeight);
        destination = journey.offsetTop + range * (layerIndex / 4);
      }

      if (lenis) {
        lenis.scrollTo(destination, {
          duration: 1.42,
          easing: (value) => 1 - (1 - value) ** 4,
        });
      } else if (typeof destination === "number") {
        window.scrollTo({ top: destination, behavior: "smooth" });
      } else {
        destination.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    anchors.forEach((anchor) => anchor.addEventListener("click", navigate));

    return () => {
      anchors.forEach((anchor) => anchor.removeEventListener("click", navigate));
      gsap.ticker.remove(tick);
      lenis?.off("scroll", update);
      lenis?.destroy();
    };
  }, [scope]);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root || reducedMotion()) return;

      const titleLines = gsap.utils.toArray<HTMLElement>("[data-safety-hero-copy] h1 span");
      const radiusCircles = gsap.utils.toArray<HTMLElement>("[data-safety-hero] [data-radius-circle]");
      const radiusNodes = gsap.utils.toArray<HTMLElement>("[data-safety-hero] [data-radius-node]");
      const radiusLabels = gsap.utils.toArray<HTMLElement>("[data-safety-hero] [data-radius-label]");

      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(titleLines, { yPercent: 108, autoAlpha: 0, duration: 0.9, stagger: 0.08 })
        .from("[data-safety-hero-copy] h2, [data-safety-hero-copy] p, [data-safety-hero-copy] a", {
          y: 20,
          autoAlpha: 0,
          duration: 0.62,
          stagger: 0.09,
        }, "-=0.48")
        .from("[data-safety-hero-media]", { scale: 1.04, autoAlpha: 0, duration: 1.15 }, 0.08)
        .from(radiusCircles, { scale: 0.84, autoAlpha: 0, duration: 0.9, stagger: 0.06 }, 0.28)
        .from(radiusNodes, { scale: 0, autoAlpha: 0, duration: 0.4, stagger: 0.07 }, 0.72)
        .from(radiusLabels, { x: 14, autoAlpha: 0, duration: 0.48, stagger: 0.07 }, 0.72)
        .from("[data-identity-preview]", { yPercent: 100, autoAlpha: 0, duration: 0.72 }, 0.96);

      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "[data-safety-hero]",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
        },
      })
        .to("[data-safety-hero-copy]", { yPercent: -10, scale: 0.96, autoAlpha: 0, duration: 0.42 }, 0.08)
        .to("[data-safety-hero-media]", { scale: 1.09, xPercent: -2.5, duration: 0.86 }, 0)
        .to(radiusCircles, { scale: (index) => 1.08 + index * 0.025, duration: 0.72, stagger: 0.018 }, 0.08)
        .to("[data-safety-hero] [data-radius-label]", { x: 16, duration: 0.52 }, 0.1)
        .to("[data-identity-preview]", { yPercent: -32, duration: 0.72 }, 0.18)
        .to("[data-safety-hero] [data-radius-field]", { autoAlpha: 0, duration: 0.24 }, 0.72);

      const stage = root.querySelector<HTMLElement>("[data-trust-journey-stage]");
      const scenes = gsap.utils.toArray<HTMLElement>("[data-trust-scene]");
      if (stage) {
        gsap.set(stage, { autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: "[data-trust-journey]",
          start: "top top",
          end: "bottom bottom",
          onEnter: () => gsap.set(stage, { autoAlpha: 1 }),
          onEnterBack: () => gsap.set(stage, { autoAlpha: 1 }),
          onLeaveBack: () => gsap.set(stage, { autoAlpha: 0 }),
        });
      }

      scenes.slice(1).forEach((scene) => {
        gsap.set(scene, { autoAlpha: 0, scale: 1.035 });
        gsap.set(scene.querySelector("[data-layer-copy]"), { autoAlpha: 0, y: 28 });
        gsap.set(scene.querySelector("[data-scene-radius]"), { scale: 0.72, autoAlpha: 0 });
      });

      let lastIndex = -1;
      const journeyTimeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "[data-trust-journey]",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.92,
          onUpdate: (self) => {
            const index = Math.min(4, Math.floor(self.progress * 5));
            if (index !== lastIndex) {
              lastIndex = index;
              onActiveLayerChange(index);
            }
          },
          onLeaveBack: () => onActiveLayerChange(0),
        },
      });

      journeyTimeline
        .from("[data-scene-index=\"0\"] [data-layer-copy]", { y: 26, autoAlpha: 0, duration: 0.24 }, 0)
        .from("[data-scene-index=\"0\"] [data-scene-radius]", { scale: 0.8, autoAlpha: 0, duration: 0.28 }, 0.04);

      scenes.slice(1).forEach((scene, transitionIndex) => {
        const sceneIndex = transitionIndex + 1;
        const previous = scenes[sceneIndex - 1];
        const offset = sceneIndex * 1.35;
        journeyTimeline
          .to(previous.querySelector("[data-layer-copy]"), { y: -24, autoAlpha: 0, duration: 0.2 }, offset)
          .to(previous.querySelector("[data-scene-radius]"), { scale: 1.16, autoAlpha: 0, duration: 0.3 }, offset)
          .to(scene, { autoAlpha: 1, scale: 1, duration: 0.58, ease: "power2.inOut" }, offset)
          .fromTo(scene.querySelector("[data-scene-media]"), { scale: 1.06 }, { scale: 1, duration: 0.7, ease: "power2.inOut", immediateRender: false }, offset)
          .to(scene.querySelector("[data-layer-copy]"), { y: 0, autoAlpha: 1, duration: 0.28, ease: "power2.out" }, offset + 0.54)
          .to(scene.querySelector("[data-scene-radius]"), { scale: 1, autoAlpha: 1, duration: 0.32, ease: "power2.out" }, offset + 0.48);
      });

      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "[data-data-purpose]",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.85,
        },
      })
        .from("[data-data-ring]", { scale: (index) => 1.28 + index * 0.08, autoAlpha: 0, stagger: 0.04, duration: 0.42 }, 0.05)
        .from("[data-data-copy] > *", { y: 28, autoAlpha: 0, stagger: 0.06, duration: 0.34 }, 0.16)
        .to("[data-data-ring]", { scale: (index) => 0.6 + index * 0.045, stagger: 0.025, duration: 0.5 }, 0.52)
        .to("[data-data-core]", { scale: 1.16, duration: 0.35 }, 0.62);

      const magnetic = gsap.utils.toArray<HTMLElement>("[data-magnetic]");
      const cleanups: Array<() => void> = [];
      if (window.matchMedia("(pointer: fine)").matches) {
        magnetic.forEach((element) => {
          const xTo = gsap.quickTo(element, "x", { duration: 0.38, ease: "power3.out" });
          const yTo = gsap.quickTo(element, "y", { duration: 0.38, ease: "power3.out" });
          const move = (event: PointerEvent) => {
            const rect = element.getBoundingClientRect();
            xTo((event.clientX - rect.left - rect.width / 2) * 0.13);
            yTo((event.clientY - rect.top - rect.height / 2) * 0.18);
          };
          const leave = () => { xTo(0); yTo(0); };
          element.addEventListener("pointermove", move);
          element.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerleave", leave);
          });
        });
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope },
  );
}
