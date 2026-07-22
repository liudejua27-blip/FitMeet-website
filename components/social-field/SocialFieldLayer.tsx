"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { SocialFieldMode } from "@/lib/experience-types";
import styles from "./social-field.module.css";

const SocialFieldCanvas = dynamic(() => import("./SocialFieldCanvas"), { ssr: false });

export function SocialFieldLayer({ mode }: { mode: SocialFieldMode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.createElement("canvas");
    const supported = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    if (!supported) return;
    let activated = false;
    const activate = () => {
      if (activated) return;
      activated = true;
      setReady(true);
      window.removeEventListener("pointermove", activate);
    };
    const intentDelay = window.setTimeout(() => {
      window.addEventListener("pointermove", activate, { passive: true, once: true });
    }, 1600);
    return () => {
      window.clearTimeout(intentDelay);
      window.removeEventListener("pointermove", activate);
    };
  }, []);

  return (
    <div className={styles.layer} data-social-field={mode} aria-hidden="true">
      {!ready ? <div className={styles.fallback}><i /><i /><i /><i /><i /></div> : null}
      {ready ? <SocialFieldCanvas mode={mode} /> : null}
    </div>
  );
}
