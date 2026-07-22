"use client";

import { type RefObject, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { WorldModuleId } from "@/lib/world-atlas-content";
import type { WorldCompassController } from "./WorldSocialCompass";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const moduleProgress: Record<WorldModuleId, number> = {
  life: 0.2,
  sport: 0.4,
  social: 0.6,
  help: 0.8,
};

export function useWorldAtlasMotion(
  scope: RefObject<HTMLElement | null>,
  compass: RefObject<WorldCompassController | null>,
) {
  useEffect(() => {
    const root = scope.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const lenis = finePointer ? new Lenis({ duration: 0.82, smoothWheel: true }) : null;
    const tick = (time: number) => lenis?.raf(time * 1000);
    const updateScrollTrigger = () => ScrollTrigger.update();
    const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));

    const navigateAnchor = (event: MouseEvent) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      const href = anchor.getAttribute("href");
      const target = href ? root.querySelector<HTMLElement>(href) : null;
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.04, offset: 0 });
      else target.scrollIntoView({ behavior: "smooth" });
    };

    const focusModule = (event: Event) => {
      const id = (event as CustomEvent<WorldModuleId>).detail;
      const compassSection = root.querySelector<HTMLElement>("[data-world-compass]");
      if (!compassSection || !moduleProgress[id]) return;
      const scrollDistance = Math.max(1, compassSection.offsetHeight - window.innerHeight);
      const target = compassSection.offsetTop + scrollDistance * moduleProgress[id];
      compass.current?.focusModule(id);
      if (lenis) lenis.scrollTo(target, { duration: 0.76 });
      else window.scrollTo({ top: target, behavior: "smooth" });
    };

    lenis?.on("scroll", updateScrollTrigger);
    if (lenis) gsap.ticker.add(tick);
    anchors.forEach((anchor) => anchor.addEventListener("click", navigateAnchor));
    window.addEventListener("world:compass-focus", focusModule);

    return () => {
      lenis?.off("scroll", updateScrollTrigger);
      if (lenis) gsap.ticker.remove(tick);
      lenis?.destroy();
      anchors.forEach((anchor) => anchor.removeEventListener("click", navigateAnchor));
      window.removeEventListener("world:compass-focus", focusModule);
    };
  }, [compass, scope]);

  useGSAP(() => {
    const root = scope.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const opening = gsap.timeline({ defaults: { ease: "power3.out" } });
    opening
      .from("[data-compass-intro]", { y: 18, duration: 0.58 })
      .from("[data-world-compass] button", { autoAlpha: 0, scale: 0.9, duration: 0.58, stagger: 0.06 }, "-=0.34");

    const compassSection = root.querySelector<HTMLElement>("[data-world-compass]");
    if (compassSection) {
      ScrollTrigger.create({
        trigger: compassSection,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onEnter: () => compass.current?.setProgress(0),
        onLeave: () => compass.current?.setProgress(1),
        onEnterBack: () => compass.current?.setProgress(1),
        onLeaveBack: () => compass.current?.setProgress(0),
        onUpdate: (self) => compass.current?.setProgress(self.progress),
        snap: window.matchMedia("(pointer: fine)").matches ? {
          snapTo: (value: number) => value > 0.88 ? value : gsap.utils.snap([0, 0.2, 0.4, 0.6, 0.8], value),
          duration: { min: 0.16, max: 0.38 },
          delay: 0.12,
          ease: "power2.out",
          inertia: false,
        } : undefined,
      });
    }

    const stories = Array.from(root.querySelectorAll<HTMLElement>("[data-world-story]"));
    stories.forEach((story, index) => {
      const copy = story.querySelector<HTMLElement>("[data-story-copy]");
      const visual = story.querySelector<HTMLElement>("[data-story-visual]");
      const primaryImage = visual?.querySelector("figure:first-child img");
      const secondary = story.querySelector<HTMLElement>("[data-story-secondary]");
      const prelude = story.querySelector<HTMLElement>("[data-story-prelude]");
      const route = story.querySelector<HTMLElement>("[data-story-route]");
      const signal = story.querySelector<HTMLElement>("[data-story-signal]");
      const ghost = story.querySelector<HTMLElement>("[data-story-ghost]");
      const tags = story.querySelectorAll<HTMLElement>("li");
      const direction = index % 2 === 0 ? 1 : -1;

      ScrollTrigger.create({
        trigger: story,
        start: "top 58%",
        end: "bottom 42%",
        onEnter: () => story.classList.add("is-active"),
        onEnterBack: () => story.classList.add("is-active"),
        onLeave: () => story.classList.remove("is-active"),
        onLeaveBack: () => story.classList.remove("is-active"),
      });

      if (prelude) {
        gsap.fromTo(prelude,
          { autoAlpha: 1, scale: 1 },
          {
            autoAlpha: 0,
            scale: 1.055,
            ease: "none",
            scrollTrigger: { trigger: story, start: "top bottom", end: "top 22%", scrub: 0.65 },
          },
        );
      }

      if (route) {
        gsap.fromTo(route, { scaleX: 0 }, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: story, start: "top 92%", end: "bottom 18%", scrub: 0.55 },
        });
      }

      if (copy) {
        gsap.from(copy.children, {
          autoAlpha: 0,
          x: direction * -44,
          y: 22,
          duration: 0.82,
          stagger: 0.075,
          ease: "power3.out",
          scrollTrigger: { trigger: story, start: "top 64%", toggleActions: "play none none reverse" },
        });
      }

      if (visual) {
        gsap.fromTo(visual,
          { clipPath: `inset(9% ${direction > 0 ? 0 : 8}% 9% ${direction > 0 ? 8 : 0}%)`, xPercent: direction * 9, rotationY: direction * -5, scale: 0.94 },
          {
            clipPath: "inset(0% 0 0% 0)",
            xPercent: 0,
            rotationY: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: story, start: "top 94%", end: "top 28%", scrub: 0.72 },
          },
        );
      }

      if (primaryImage) {
        gsap.fromTo(primaryImage,
          { scale: 1.08, yPercent: -2 },
          {
            scale: 1,
            yPercent: 3,
            ease: "none",
            scrollTrigger: { trigger: story, start: "top 96%", end: "bottom 5%", scrub: 0.8 },
          },
        );
      }

      if (secondary) {
        gsap.fromTo(secondary,
          { autoAlpha: 0, yPercent: 34, xPercent: direction * 16, scale: 0.72, rotation: direction * 7 },
          {
            autoAlpha: 1,
            yPercent: 0,
            xPercent: 0,
            scale: 1,
            rotation: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: story, start: "top 58%", end: "top 18%", scrub: 0.55 },
          },
        );
      }

      if (signal) {
        gsap.fromTo(signal,
          { autoAlpha: 0, scale: 0.5, rotation: direction * -90 },
          {
            autoAlpha: 1,
            scale: 1,
            rotation: 0,
            ease: "power3.out",
            scrollTrigger: { trigger: story, start: "top 72%", end: "top 38%", scrub: 0.45 },
          },
        );
      }

      if (ghost) {
        gsap.fromTo(ghost,
          { yPercent: 12, rotation: direction * 2, autoAlpha: 0.28 },
          {
            yPercent: -8,
            rotation: 0,
            autoAlpha: 0.7,
            ease: "none",
            scrollTrigger: { trigger: story, start: "top bottom", end: "bottom top", scrub: 0.8 },
          },
        );
      }

      if (tags.length) {
        gsap.from(tags, {
          autoAlpha: 0,
          y: 14,
          stagger: 0.06,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: { trigger: tags[0], start: "top 88%", toggleActions: "play none none reverse" },
        });
      }
    });

    gsap.from("[data-world-principle] > *", {
      autoAlpha: 0,
      y: 34,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-world-principle]", start: "top 72%", once: true },
    });

    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  }, { dependencies: [compass], scope });
}
