"use client";

import { useEffect, useRef } from "react";
import { citySignals } from "./enterpriseAssets";
import styles from "./signal-prism-homepage.module.css";

export function SignalLineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let raf = 0;
    let time = 0;
    const pointer = { x: 0.5, y: 0.5 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      pointer.y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    };

    const draw = () => {
      time += reduceMotion ? 0 : 0.012;
      ctx.clearRect(0, 0, width, height);
      const centerX = width * (0.5 + (pointer.x - 0.5) * 0.08);
      const centerY = height * (0.5 + (pointer.y - 0.5) * 0.08);

      ctx.lineWidth = 1;
      citySignals.forEach((point, index) => {
        const x = (point.x / 100) * width;
        const y = (point.y / 100) * height;
        const dx = pointer.x * width - x;
        const dy = pointer.y * height - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const magnetic = Math.max(0, 1 - dist / 360);
        const pulse = reduceMotion ? 0.65 : 0.45 + Math.sin(time * 3 + index) * 0.16 + magnetic * 0.42;

        const gradient = ctx.createLinearGradient(centerX, centerY, x, y);
        gradient.addColorStop(0, `rgba(255, 42, 31, ${0.08 + pulse * 0.28})`);
        gradient.addColorStop(1, `rgba(255, 244, 234, ${0.05 + pulse * 0.18})`);
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.quadraticCurveTo((centerX + x) / 2, y - 60 + Math.sin(time + index) * 16, x, y);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 42, 31, ${0.42 + pulse * 0.48})`;
        ctx.beginPath();
        ctx.arc(x, y, 4 + pulse * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 244, 234, ${0.1 + magnetic * 0.32})`;
        ctx.beginPath();
        ctx.arc(x, y, 16 + pulse * 12, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.strokeStyle = "rgba(255, 42, 31, 0.42)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 52 + Math.sin(time * 2) * 8, 0, Math.PI * 2);
      ctx.stroke();

      if (!reduceMotion) raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.signalCanvas} aria-hidden="true" />;
}
