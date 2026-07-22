"use client";

import { RefObject, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useAgentSemanticMotion(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root || reduceMotion()) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const lenis = finePointer
      ? new Lenis({
          duration: 1.08,
          easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)),
          smoothWheel: true,
          syncTouch: false,
        })
      : null;

    const tick = (time: number) => lenis?.raf(time * 1000);
    const update = () => ScrollTrigger.update();
    lenis?.on("scroll", update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const moveToAnchor = (event: MouseEvent) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = root.querySelector<HTMLElement>(id);
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.35, easing: (value) => 1 - (1 - value) ** 4 });
      else target.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    anchors.forEach((anchor) => anchor.addEventListener("click", moveToAnchor));

    return () => {
      anchors.forEach((anchor) => anchor.removeEventListener("click", moveToAnchor));
      gsap.ticker.remove(tick);
      lenis?.off("scroll", update);
      lenis?.destroy();
    };
  }, [scope]);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root || reduceMotion()) return;

      const heroNodes = gsap.utils.toArray<HTMLElement>("[data-agent-hero] [data-semantic-node]");
      const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTimeline
        .from("[data-hero-title] h1 span", { yPercent: 104, autoAlpha: 0, duration: 0.92, stagger: 0.08 })
        .from("[data-hero-title] p, [data-hero-title] a", { y: 20, autoAlpha: 0, duration: 0.64, stagger: 0.1 }, "-=0.5")
        .from("[data-hero-photo]", { scale: 1.05, autoAlpha: 0, duration: 1.1 }, 0.08)
        .from("[data-hero-intent]", { x: -28, autoAlpha: 0, duration: 0.7 }, 0.62)
        .from(heroNodes, { x: -14, autoAlpha: 0, duration: 0.46, stagger: 0.08 }, 0.75)
        .from("[data-hero-product]", { xPercent: 12, autoAlpha: 0, duration: 0.9 }, 0.72)
        .from("[data-understand-preview]", { y: 30, autoAlpha: 0, duration: 0.62 }, 0.9);

      const heroScroll = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "[data-agent-hero]",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
          refreshPriority: 0,
        },
      });
      heroScroll
        .to("[data-hero-title]", { yPercent: -10, autoAlpha: 0, duration: 0.34 }, 0.08)
        .to("[data-hero-photo]", { scale: 1.08, xPercent: -3, filter: "saturate(.75)", duration: 0.72 }, 0)
        .to("[data-hero-intent]", { xPercent: 13, duration: 0.5 }, 0.12)
        .to("[data-agent-hero] [data-semantic-spine]", { xPercent: -7, duration: 0.58 }, 0.12)
        .to("[data-hero-product]", { xPercent: -7, autoAlpha: 1, duration: 0.64 }, 0.12)
        .to("[data-understand-preview]", { yPercent: -28, duration: 0.72 }, 0.16)
        .fromTo(
          "[data-hero-intent], [data-agent-hero] [data-semantic-spine], [data-hero-product]",
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.25, immediateRender: false },
          0.74,
        );

      const understandNodes = gsap.utils.toArray<HTMLElement>("[data-understand-track] [data-semantic-node]");
      gsap.set(understandNodes, { autoAlpha: 0, x: -24 });
      gsap.set("[data-understand-track] [data-semantic-spine]", { autoAlpha: 0 });
      const understandTimeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "[data-understand-track]",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
          refreshPriority: 1,
        },
      });
      understandTimeline
        .from("[data-understand-copy]", { y: 26, autoAlpha: 0, duration: 0.2 }, 0)
        .from("[data-extracted-intent]", { xPercent: -7, autoAlpha: 0, duration: 0.24 }, 0.12)
        .to("[data-understand-track] [data-semantic-spine]", { autoAlpha: 1, duration: 0.12 }, 0.22)
        .to(understandNodes, { x: 0, autoAlpha: 1, duration: 0.34, stagger: 0.06, ease: "power2.out" }, 0.25)
        .to("[data-extracted-intent]", { xPercent: 7, duration: 0.45 }, 0.25)
        .to("[data-understand-media]", { scale: 1.07, xPercent: -2, duration: 0.86 }, 0)
        .to("[data-understand-copy]", { autoAlpha: 0, y: -24, duration: 0.18 }, 0.76);

      gsap.from("[data-plan-header] > *", {
        y: 28,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-plan-chapter]", start: "top 72%", toggleActions: "play none none reverse" },
      });

      gsap.from("[data-boundaries] article", {
        y: 42,
        autoAlpha: 0,
        duration: 0.82,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-boundaries]", start: "top 65%", toggleActions: "play none none reverse" },
      });

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
