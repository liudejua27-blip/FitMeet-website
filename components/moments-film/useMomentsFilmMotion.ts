"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useMomentsFilmMotion(scope: RefObject<HTMLElement | null>, onActiveChange: (index: number) => void) {
  useEffect(() => {
    const root = scope.current;
    if (!root || reducedMotion()) return;

    const lenis = window.matchMedia("(pointer: fine)").matches
      ? new Lenis({ duration: 1.08, easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)), smoothWheel: true, syncTouch: false })
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

      const momentIndex = Number(anchor.dataset.momentJump);
      const archive = root.querySelector<HTMLElement>("[data-moment-archive]");
      let destination: HTMLElement | number = target;
      if (archive && Number.isFinite(momentIndex)) {
          const chapterProgress = [0.01, 0.34, 0.67, 0.97][momentIndex] ?? 0;
        const range = Math.max(0, archive.offsetHeight - window.innerHeight);
        destination = archive.offsetTop + range * chapterProgress;
      } else if (archive && href.startsWith("#moment-")) {
        destination = archive.offsetTop + 3;
      }
      if (lenis) lenis.scrollTo(destination, { duration: 1.4, easing: (value) => 1 - (1 - value) ** 4 });
      else if (typeof destination === "number") window.scrollTo({ top: destination, behavior: "smooth" });
      else destination.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    anchors.forEach((anchor) => anchor.addEventListener("click", navigate));

    return () => {
      anchors.forEach((anchor) => anchor.removeEventListener("click", navigate));
      gsap.ticker.remove(tick);
      lenis?.off("scroll", update);
      lenis?.destroy();
    };
  }, [scope]);

  useGSAP(() => {
    const root = scope.current;
    if (!root || reducedMotion()) return;

    const frames = gsap.utils.toArray<HTMLElement>("[data-film-frame]");
    const heroFrame = root.querySelector<HTMLElement>('[data-hero-film="true"]');
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from("[data-moments-hero-copy] > *", { y: 24, autoAlpha: 0, duration: 0.75, stagger: 0.09 })
      .from("[data-editorial-state]", { x: 18, autoAlpha: 0, duration: 0.6 }, 0.25)
      .from("[data-giant-moments]", { yPercent: 20, autoAlpha: 0, duration: 0.9 }, 0.18)
      .from(frames, { y: 34, autoAlpha: 0, duration: 0.88, stagger: 0.06 }, 0.35)
      .from("[data-hero-timeline]", { y: 24, autoAlpha: 0, duration: 0.6 }, 0.76);

    const heroTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: "[data-moments-hero]", start: "top top", end: "bottom bottom", scrub: 0.9 },
    });
    heroTimeline
      .to("[data-film-rail]", { xPercent: -10, duration: 0.7 }, 0)
      .to("[data-moments-hero-copy], [data-editorial-state]", { yPercent: -10, autoAlpha: 0, duration: 0.28 }, 0.08)
      .to("[data-giant-moments]", { yPercent: -10, scale: 0.96, autoAlpha: 0, duration: 0.38 }, 0.1)
      .to(frames.filter((frame) => frame !== heroFrame), { autoAlpha: 0, scale: 0.9, duration: 0.38, stagger: 0.02 }, 0.2)
      .to(heroFrame, { scale: 2.45, duration: 0.72, ease: "power3.inOut" }, 0.2)
      .to("[data-hero-timeline]", { yPercent: 45, autoAlpha: 0, duration: 0.25 }, 0.63)
      .to("[data-rail-viewport]", { autoAlpha: 0, duration: 0.1 }, 0.9);

    const scenes = gsap.utils.toArray<HTMLElement>("[data-moment-scene]");
    scenes.slice(1).forEach((scene) => {
      gsap.set(scene, { autoAlpha: 0, scale: 1.025 });
      gsap.set(scene.querySelector("[data-story-copy]"), { autoAlpha: 0, y: 28 });
      gsap.set(scene.querySelector("[data-scene-time]"), { autoAlpha: 0, y: 16 });
    });

    let lastIndex = -1;
    const archiveTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: "[data-moment-archive]",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.92,
        onUpdate: (self) => {
          const index = self.progress < 0.25 ? 0 : self.progress < 0.5 ? 1 : self.progress < 0.75 ? 2 : 3;
          if (index !== lastIndex) { lastIndex = index; onActiveChange(index); }
        },
        onLeaveBack: () => onActiveChange(0),
      },
    });
    scenes.slice(1).forEach((scene, transitionIndex) => {
      const sceneIndex = transitionIndex + 1;
      const previous = scenes[sceneIndex - 1];
      const offset = sceneIndex * 1.4;
      archiveTimeline
        .to(previous.querySelector("[data-story-copy]"), { y: -22, autoAlpha: 0, duration: 0.2 }, offset)
        .to(previous.querySelector("[data-scene-time]"), { autoAlpha: 0, duration: 0.16 }, offset)
        .to(scene, { autoAlpha: 1, scale: 1, duration: 0.58, ease: "power2.inOut" }, offset)
        .fromTo(scene.querySelector("[data-story-media]"), { scale: 1.06 }, { scale: 1, duration: 0.7, ease: "power2.inOut", immediateRender: false }, offset)
        .to(scene.querySelector("[data-story-copy]"), { y: 0, autoAlpha: 1, duration: 0.28, ease: "power2.out" }, offset + 0.52)
        .to(scene.querySelector("[data-scene-time]"), { y: 0, autoAlpha: 1, duration: 0.24, ease: "power2.out" }, offset + 0.58);
    });

    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: "[data-collection]", start: "top bottom", end: "bottom top", scrub: 0.85 },
    })
      .from("[data-collection-copy] > *", { y: 28, autoAlpha: 0, duration: 0.3, stagger: 0.05 }, 0.1)
      .from("[data-collection-film]", { xPercent: (index) => index % 2 === 0 ? -18 : 18, y: 30, autoAlpha: 0, duration: 0.46, stagger: 0.06 }, 0.12)
      .to("[data-collection-films]", { xPercent: -6, duration: 0.7 }, 0.3);

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
        cleanups.push(() => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", leave); });
      });
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }, { scope });
}
