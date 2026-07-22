"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type MutableRefObject } from "react";

const HomeCinematicFieldCanvas = dynamic(() => import("./HomeCinematicFieldCanvas"), { ssr: false });

type PointerState = { x: number; y: number };

export function HomeCinematicField({
  progress,
  pointer,
  onReady,
}: {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<PointerState>;
  onReady: (ready: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return;

    let activated = false;
    let pointerTravel = 0;
    let lastPointer: { x: number; y: number } | null = null;
    const activate = () => {
      if (activated) return;
      activated = true;
      setEnabled(true);
      window.removeEventListener("pointermove", measureIntent);
      window.removeEventListener("scroll", activateFromScroll);
    };
    const measureIntent = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      if (lastPointer) pointerTravel += Math.hypot(event.clientX - lastPointer.x, event.clientY - lastPointer.y);
      lastPointer = { x: event.clientX, y: event.clientY };
      if (pointerTravel >= 18) activate();
    };
    const activateFromScroll = () => {
      if (window.scrollY >= 24) activate();
    };
    const delay = window.setTimeout(() => {
      window.addEventListener("pointermove", measureIntent, { passive: true });
      window.addEventListener("scroll", activateFromScroll, { passive: true });
    }, 900);
    return () => {
      window.clearTimeout(delay);
      window.removeEventListener("pointermove", measureIntent);
      window.removeEventListener("scroll", activateFromScroll);
    };
  }, []);

  if (!enabled) return null;
  return <HomeCinematicFieldCanvas progress={progress} pointer={pointer} onReady={onReady} />;
}
