"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { SoundPreference } from "@/lib/experience-types";
import styles from "./experience-shell.module.css";

function RouteTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const pendingHref = useRef<string | null>(null);
  const navigationTimer = useRef<number | null>(null);
  const fallbackTimer = useRef<number | null>(null);
  const initial = useRef(true);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download") || anchor.dataset.noTransition === "true") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname || anchor.getAttribute("href")?.startsWith("#")) return;
      event.preventDefault();
      const href = `${url.pathname}${url.search}${url.hash}`;
      const sourcePath = window.location.pathname;
      pendingHref.current = href;
      setPhase("cover");
      navigationTimer.current = window.setTimeout(() => {
        router.push(href);
        fallbackTimer.current = window.setTimeout(() => {
          if (window.location.pathname === sourcePath) window.location.assign(href);
        }, 700);
      }, 320);
    };
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (navigationTimer.current) window.clearTimeout(navigationTimer.current);
      if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current);
    };
  }, [router]);

  useEffect(() => {
    if (initial.current) { initial.current = false; return; }
    pendingHref.current = null;
    if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setPhase("reveal");
    const timer = window.setTimeout(() => setPhase("idle"), 720);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={`${styles.transition} ${styles[phase]}`} aria-hidden="true">
      <div className={styles.transitionField}>
        <span>FitMeet</span>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none"><path d="M-80 690C190 675 205 325 430 318C690 309 642 110 858 132C1090 154 1010 548 1260 568C1410 580 1475 438 1530 350" /></svg>
        <i /><i /><i />
      </div>
    </div>
  );
}

function SoundControl() {
  const pathname = usePathname();
  const [preference, setPreference] = useState<SoundPreference>("off");
  const audio = useRef<{ context: AudioContext; gain: GainNode; oscillators: OscillatorNode[] } | null>(null);
  const visible = pathname === "/" || pathname === "/moments";

  useEffect(() => {
    const stored = window.localStorage.getItem("fitmeet:sound");
    if (stored === "ambient") setPreference("off");
    return () => {
      audio.current?.oscillators.forEach((oscillator) => oscillator.stop());
      void audio.current?.context.close();
    };
  }, []);

  const stop = () => {
    if (!audio.current) return;
    const { context, gain, oscillators } = audio.current;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setTargetAtTime(0, context.currentTime, 0.08);
    window.setTimeout(() => {
      oscillators.forEach((oscillator) => oscillator.stop());
      void context.close();
    }, 240);
    audio.current = null;
  };

  const toggle = () => {
    if (preference === "ambient") {
      stop();
      setPreference("off");
      window.localStorage.setItem("fitmeet:sound", "off");
      return;
    }
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.value = 0.018;
    gain.connect(context.destination);
    const oscillators = [110, 164.81].map((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index ? -8 : 0;
      oscillator.connect(gain);
      oscillator.start();
      return oscillator;
    });
    audio.current = { context, gain, oscillators };
    setPreference("ambient");
    window.localStorage.setItem("fitmeet:sound", "ambient");
  };

  if (!visible) return null;
  return <button className={styles.sound} type="button" aria-pressed={preference === "ambient"} onClick={toggle}><i /><span>{preference === "ambient" ? "环境声已开" : "开启环境声"}</span></button>;
}

export function ExperienceShell({ children }: { children: ReactNode }) {
  return <><RouteTransition /><SoundControl />{children}</>;
}
