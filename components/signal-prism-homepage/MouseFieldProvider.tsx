"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef } from "react";
import styles from "./signal-prism-homepage.module.css";

type MouseFieldContextValue = {
  rootRef: React.RefObject<HTMLDivElement | null>;
};

const MouseFieldContext = createContext<MouseFieldContextValue | null>(null);

export function useMouseField() {
  const value = useContext(MouseFieldContext);
  if (!value) {
    throw new Error("useMouseField must be used within MouseFieldProvider");
  }
  return value;
}

export function MouseFieldProvider({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0.5, y: 0.5 });
  const current = useRef({ x: 0.5, y: 0.5 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.dataset.motion = reduceMotion ? "reduced" : "full";
    root.style.setProperty("--mx", "0.5");
    root.style.setProperty("--my", "0.5");
    root.style.setProperty("--tilt-x", "0deg");
    root.style.setProperty("--tilt-y", "0deg");

    if (reduceMotion) return;

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.12;
      current.current.y += (target.current.y - current.current.y) * 0.12;
      const x = current.current.x;
      const y = current.current.y;
      root.style.setProperty("--mx", x.toFixed(4));
      root.style.setProperty("--my", y.toFixed(4));
      root.style.setProperty("--tilt-x", `${((0.5 - y) * 14).toFixed(3)}deg`);
      root.style.setProperty("--tilt-y", `${((x - 0.5) * 18).toFixed(3)}deg`);
      raf.current = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      target.current.x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      target.current.y = Math.min(1, Math.max(0, (event.clientY - rect.top) / Math.max(rect.height, 1)));
    };

    root.addEventListener("pointermove", onPointerMove, { passive: true });
    raf.current = window.requestAnimationFrame(tick);

    return () => {
      root.removeEventListener("pointermove", onPointerMove);
      if (raf.current !== null) window.cancelAnimationFrame(raf.current);
    };
  }, []);

  const value = useMemo(() => ({ rootRef }), []);

  return (
    <MouseFieldContext.Provider value={value}>
      <div ref={rootRef} className={styles.mouseField}>
        {children}
      </div>
    </MouseFieldContext.Provider>
  );
}
