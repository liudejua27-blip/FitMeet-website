"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useAboutNetworkMotion(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root || reducedMotion()) return;
    const lenis = window.matchMedia("(pointer: fine)").matches
      ? new Lenis({ duration: 1.1, easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)), smoothWheel: true, syncTouch: false })
      : null;
    const update = () => ScrollTrigger.update();
    const tick = (time: number) => lenis?.raf(time * 1000);
    lenis?.on("scroll", update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const navigate = (event: MouseEvent) => {
      const href = (event.currentTarget as HTMLAnchorElement).getAttribute("href");
      if (!href || href === "#") return;
      const target = root.querySelector<HTMLElement>(href);
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.35, easing: (value) => 1 - (1 - value) ** 4 });
      else target.scrollIntoView({ behavior: "smooth", block: "start" });
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

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from("[data-origin-copy] > *", { y: 28, autoAlpha: 0, duration: 0.8, stagger: 0.08 })
      .from("[data-origin-media]", { clipPath: "inset(0 0 0 100%)", duration: 1.05, ease: "power4.inOut" }, 0.12)
      .from("[data-origin-coordinate]", { scale: 0.4, autoAlpha: 0, duration: 0.6 }, 0.68)
      .from("[data-about-origin] [data-network-path]", { strokeDasharray: 1800, strokeDashoffset: 1800, duration: 1.4 }, 0.35)
      .from("[data-about-origin] [data-network-node]", { scale: 0, transformOrigin: "center", duration: 0.35, stagger: 0.08 }, 0.72);

    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: "[data-about-origin]", start: "top top", end: "bottom bottom", scrub: 0.9 },
    })
      .to("[data-origin-copy]", { yPercent: -18, autoAlpha: 0, duration: 0.34 }, 0.12)
      .to("[data-origin-media]", { scale: 1.08, xPercent: -5, duration: 0.82 }, 0)
      .to("[data-origin-coordinate]", { xPercent: 180, yPercent: -120, duration: 0.72 }, 0)
      .to("[data-about-origin] [data-network-path]", { strokeDashoffset: -520, duration: 0.9 }, 0.05);

    gsap.timeline({
      scrollTrigger: { trigger: "[data-about-problem]", start: "top 72%", end: "bottom 45%", scrub: 0.75 },
    })
      .from("[data-problem-copy] > *", { y: 44, autoAlpha: 0, stagger: 0.08, duration: 0.28 })
      .from("[data-problem-scenes] figure", { y: 72, autoAlpha: 0, stagger: 0.11, duration: 0.36 }, 0.12)
      .from("[data-about-problem] [data-network-path]", { strokeDasharray: 1800, strokeDashoffset: 1800, duration: 0.75 }, 0.16);

    gsap.to("[data-belief-rail]", {
      xPercent: -66.666,
      ease: "none",
      scrollTrigger: { trigger: "[data-belief-track]", start: "top top", end: "bottom bottom", scrub: 0.92 },
    });
    gsap.from("[data-belief-node]", {
      scale: 0,
      stagger: 0.2,
      scrollTrigger: { trigger: "[data-belief-track]", start: "top 70%", end: "bottom 45%", scrub: 0.8 },
    });

    const steps = gsap.utils.toArray<HTMLElement>("[data-horizon-step]");
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: "[data-horizon-track]", start: "top top", end: "bottom bottom", scrub: 0.92 },
    })
      .from("[data-horizon-heading] > *", { y: 38, autoAlpha: 0, stagger: 0.08, duration: 0.22 })
      .from(steps, { x: 90, autoAlpha: 0, stagger: 0.22, duration: 0.3 }, 0.12)
      .from("[data-horizon-track] [data-network-path]", { strokeDasharray: 1800, strokeDashoffset: 1800, duration: 0.72 }, 0.1)
      .to("[data-horizon-track] img", { autoAlpha: (index) => index === 2 ? 1 : 0, stagger: 0.26, duration: 0.26 }, 0.2);

    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: "[data-manifesto]", start: "top 85%", end: "bottom bottom", scrub: 0.85 },
    })
      .from("[data-manifesto-copy] > *", { y: 42, autoAlpha: 0, stagger: 0.1, duration: 0.28 })
      .from("[data-manifesto-word]", { yPercent: 22, autoAlpha: 0, duration: 0.45 }, 0.12)
      .from("[data-manifesto-media]", { clipPath: "inset(28% 0 0 0)", scale: 1.08, duration: 0.58 }, 0.22)
      .from("[data-manifesto] [data-network-path]", { strokeDasharray: 1800, strokeDashoffset: 1800, duration: 0.64 }, 0.3);

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
