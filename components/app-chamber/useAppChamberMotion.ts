"use client";

import { useEffect, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { AppDemoScreen } from "@/lib/experience-types";

gsap.registerPlugin(ScrollTrigger, useGSAP);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useAppChamberMotion(
  scope: RefObject<HTMLElement | null>,
  onScreenChange: (screen: AppDemoScreen) => void,
) {
  useEffect(() => {
    const root = scope.current;
    if (!root || reducedMotion()) return;
    const lenis = window.matchMedia("(pointer: fine)").matches
      ? new Lenis({ duration: 1.02, easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)), smoothWheel: true, syncTouch: false })
      : null;
    const update = () => ScrollTrigger.update();
    const tick = (time: number) => lenis?.raf(time * 1000);
    const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const navigate = (event: MouseEvent) => {
      const href = (event.currentTarget as HTMLAnchorElement).getAttribute("href");
      const target = href ? root.querySelector<HTMLElement>(href) : null;
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.12 });
      else target.scrollIntoView({ behavior: "smooth" });
    };

    lenis?.on("scroll", update);
    if (lenis) gsap.ticker.add(tick);
    anchors.forEach((anchor) => anchor.addEventListener("click", navigate));
    return () => {
      anchors.forEach((anchor) => anchor.removeEventListener("click", navigate));
      if (lenis) gsap.ticker.remove(tick);
      lenis?.off("scroll", update);
      lenis?.destroy();
    };
  }, [scope]);

  useGSAP(() => {
    const root = scope.current;
    if (!root || reducedMotion()) return;

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from("[data-launch-copy] > *", { y: 24, autoAlpha: 0, duration: .7, stagger: .065 })
      .from("[data-hero-device]", { y: 54, rotate: 1.8, autoAlpha: 0, duration: .98 }, .08)
      .from("[data-app-launch] [class*=heroRoute]", { xPercent: 10, autoAlpha: 0, duration: .9 }, .22);

    const demo = root.querySelector<HTMLElement>("[data-app-demo]");
    const label = root.querySelector<HTMLElement>("[data-demo-progress-label]");
    let currentScreen: AppDemoScreen = "assistant";

    if (demo) {
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: demo,
          start: "top top",
          end: "bottom bottom",
          scrub: .72,
          refreshPriority: -5,
          onUpdate: (self) => {
            demo.style.setProperty("--demo-progress", self.progress.toFixed(3));
            const next: AppDemoScreen = self.progress < .64 ? "assistant" : "plan";
            if (label) label.textContent = next === "assistant" ? "01" : "02";
            if (next !== currentScreen) {
              currentScreen = next;
              onScreenChange(next);
            }
          },
          onLeaveBack: () => {
            currentScreen = "assistant";
            onScreenChange("assistant");
          },
        },
      })
        .fromTo("[data-demo-device]", { scale: .94, autoAlpha: 1, yPercent: 4 }, { scale: 1, autoAlpha: 1, yPercent: 0, duration: .2 }, 0)
        .to("[data-demo-device]", { scale: .72, yPercent: -5, autoAlpha: 0, duration: .2, ease: "power2.in" }, .22)
        .fromTo("[data-expanded-canvas]", { scale: .76, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .28, ease: "power3.out" }, .29)
        .to("[data-expanded-canvas]", { yPercent: -1.2, duration: .18 }, .65)
        .to("[data-expanded-canvas]", { yPercent: 0, duration: .17 }, .83);
    }

    gsap.from("[data-decision-band] header > *, [data-decision-band] article", {
      y: 30,
      autoAlpha: 0,
      stagger: .065,
      duration: .76,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-decision-band]", start: "top 74%", once: true },
    });
    gsap.from("[data-store-section] > *", {
      y: 28,
      autoAlpha: 0,
      stagger: .08,
      duration: .78,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-store-section]", start: "top 77%", once: true },
    });
  }, { scope, dependencies: [onScreenChange], revertOnUpdate: true });
}
