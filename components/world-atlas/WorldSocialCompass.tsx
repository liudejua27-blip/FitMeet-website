"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Component,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ErrorInfo,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { FiArrowDownRight } from "react-icons/fi";
import { PiHandHeart, PiHouseLine, PiPersonSimpleRun, PiUsersThree } from "react-icons/pi";
import { getWorldModule, worldModules, worldReleaseImage, type WorldModuleId } from "@/lib/world-atlas-content";
import styles from "./world-atlas.module.css";

const WorldSocialCompassCanvas = dynamic(() => import("./WorldSocialCompassCanvas"), {
  ssr: false,
  loading: () => null,
});

export type WorldCompassPhase = "intro" | "life" | "sport" | "social" | "help" | "release";

export type WorldCompassMotionState = {
  progress: number;
  pointerX: number;
  pointerY: number;
  activeId: WorldModuleId;
};

export type WorldCompassController = {
  setProgress: (progress: number) => void;
  focusModule: (id: WorldModuleId) => void;
};

type WorldSocialCompassProps = {
  onModuleSelect: (id: WorldModuleId) => void;
};

const moduleIcons = {
  life: PiHouseLine,
  sport: PiPersonSimpleRun,
  social: PiUsersThree,
  help: PiHandHeart,
} as const;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function getActiveModule(progress: number): WorldModuleId {
  if (progress < 0.3) return "life";
  if (progress < 0.5) return "sport";
  if (progress < 0.7) return "social";
  return "help";
}

function getPhase(progress: number): WorldCompassPhase {
  if (progress < 0.1) return "intro";
  if (progress < 0.3) return "life";
  if (progress < 0.5) return "sport";
  if (progress < 0.7) return "social";
  if (progress < 0.9) return "help";
  return "release";
}

class CompassErrorBoundary extends Component<{
  children: ReactNode;
  fallback: ReactNode;
  onError: () => void;
}, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const WorldSocialCompass = forwardRef<WorldCompassController, WorldSocialCompassProps>(function WorldSocialCompass({
  onModuleSelect,
}, forwardedRef) {
  const rootRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<Partial<Record<WorldModuleId, HTMLButtonElement | null>>>({});
  const motionState = useRef<WorldCompassMotionState>({
    progress: 0,
    pointerX: 0,
    pointerY: 0,
    activeId: "life",
  });
  const invalidateRef = useRef<(() => void) | null>(null);
  const [activeId, setActiveId] = useState<WorldModuleId>("life");
  const [nearViewport, setNearViewport] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const activeModule = getWorldModule(activeId);

  const focusModule = useCallback((id: WorldModuleId) => {
    motionState.current.activeId = id;
    setActiveId((current) => current === id ? current : id);
    invalidateRef.current?.();
  }, []);

  const applyProgress = useCallback((value: number) => {
    const progress = clamp(value);
    const nextId = getActiveModule(progress);
    const root = rootRef.current;
    motionState.current.progress = progress;
    motionState.current.activeId = nextId;
    if (root) {
      root.dataset.phase = getPhase(progress);
      root.style.setProperty("--compass-progress", progress.toFixed(4));
      root.style.setProperty("--compass-release", clamp((progress - 0.9) / 0.1).toFixed(4));
    }
    setActiveId((current) => current === nextId ? current : nextId);
    invalidateRef.current?.();
  }, []);

  useImperativeHandle(forwardedRef, () => ({
    setProgress: applyProgress,
    focusModule,
  }), [applyProgress, focusModule]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setNearViewport(entry.isIntersecting), {
      rootMargin: "500px 0px",
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nearViewport) invalidateRef.current = null;
  }, [nearViewport]);

  useEffect(() => {
    const activate = () => setCanvasReady(true);
    window.addEventListener("pointerdown", activate, { passive: true, once: true });
    window.addEventListener("wheel", activate, { passive: true, once: true });
    window.addEventListener("keydown", activate, { once: true });
    return () => {
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("wheel", activate);
      window.removeEventListener("keydown", activate);
    };
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (reducedMotion || event.pointerType === "touch") return;
    setCanvasReady(true);
    const rect = event.currentTarget.getBoundingClientRect();
    motionState.current.pointerX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    motionState.current.pointerY = clamp(-(((event.clientY - rect.top) / rect.height) * 2 - 1), -1, 1);
    invalidateRef.current?.();
  }, [reducedMotion]);

  const handlePointerLeave = useCallback(() => {
    motionState.current.pointerX = 0;
    motionState.current.pointerY = 0;
    invalidateRef.current?.();
  }, []);

  const handleModuleSelect = useCallback((id: WorldModuleId) => {
    setCanvasReady(true);
    focusModule(id);
    onModuleSelect(id);
  }, [focusModule, onModuleSelect]);

  const handleModuleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, id: WorldModuleId) => {
    if (!["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = worldModules.findIndex((module) => module.id === id);
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next = worldModules[(currentIndex + direction + worldModules.length) % worldModules.length];
    handleModuleSelect(next.id);
    buttonRefs.current[next.id]?.focus();
  };

  const showFallback = reducedMotion || webglFailed;
  const fallbackPoster = (
    <Image
      className={styles.compassPoster}
      src="/images/world-compass/world-social-compass-poster.webp"
      fill
      priority
      unoptimized
      loading="eager"
      fetchPriority="high"
      sizes="70vw"
      alt="FitMeet 3D 社交罗盘由机械环、四个需求节点和中央影像舱组成"
    />
  );

  return (
    <section
      className={styles.compassSection}
      id="top"
      data-world-compass
      data-phase="intro"
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-canvas-ready={canvasReady ? "true" : "false"}
      data-near-viewport={nearViewport ? "true" : "false"}
      data-webgl-failed={webglFailed ? "true" : "false"}
      ref={rootRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className={styles.compassSticky}>
        <div className={styles.compassMeta}>
          <span>Social World</span>
          <i aria-hidden="true" />
          <strong>FitMeet 社交罗盘</strong>
        </div>

        <div className={styles.compassCopy}>
          <p>四种真实需要一条清晰路线</p>
          <h1>让真实需要<br />找到真实的人</h1>
          <div className={styles.compassIntro} data-compass-intro>
            从生活难题到运动搭子、社交关系和日常照护四种需求沿同一条路线说清楚
          </div>
          <div className={styles.compassActiveCopy} aria-live="polite" key={activeId}>
            <span>{activeModule.index} / 04</span>
            <strong>{activeModule.name}</strong>
            <p>{activeModule.shortLine}</p>
            <a href={`#world-${activeId}`}>查看这一方向 <FiArrowDownRight aria-hidden="true" /></a>
          </div>
        </div>

        <div className={styles.compassStage}>
          <div className={styles.portalImage} key={activeId}>
            <Image
              src={activeModule.images[0].src}
              fill
              priority={activeId === "life"}
              sizes="32vw"
              alt=""
              style={{ objectPosition: activeModule.images[0].objectPosition }}
            />
          </div>

          <div className={styles.releaseImage} aria-hidden="true">
            <Image
              src={worldReleaseImage.src}
              fill
              sizes="100vw"
              alt=""
              style={{ objectPosition: worldReleaseImage.objectPosition }}
            />
          </div>

          <div className={styles.compassCanvasLayer}>
            {showFallback || !canvasReady ? fallbackPoster : null}
            {!showFallback && nearViewport && canvasReady ? (
              <CompassErrorBoundary fallback={fallbackPoster} onError={() => setWebglFailed(true)}>
                <WorldSocialCompassCanvas
                  motionState={motionState as MutableRefObject<WorldCompassMotionState>}
                  activeId={activeId}
                  onSelect={handleModuleSelect}
                  onInvalidateReady={(invalidate) => {
                    invalidateRef.current = invalidate;
                    invalidate();
                  }}
                  onFatalError={() => setWebglFailed(true)}
                />
              </CompassErrorBoundary>
            ) : null}
          </div>
        </div>

        <div className={styles.compassNodes} aria-label="选择社交罗盘方向">
          {worldModules.map((module) => {
            const Icon = moduleIcons[module.id];
            const active = activeId === module.id;
            return (
              <button
                type="button"
                key={module.id}
                ref={(node) => { buttonRefs.current[module.id] = node; }}
                data-module={module.id}
                aria-pressed={active}
                onClick={() => handleModuleSelect(module.id)}
                onKeyDown={(event) => handleModuleKeyDown(event, module.id)}
              >
                <Icon aria-hidden="true" />
                <span>{module.name}</span>
                <small>{module.index}</small>
              </button>
            );
          })}
        </div>

        <div className={styles.compassProgress} aria-hidden="true">
          <span>滚动或选择一个方向</span>
          <i />
          <strong>{activeModule.index} / 04</strong>
        </div>

        <p className={styles.visuallyHidden}>
          FitMeet 社交罗盘包含生活、运动、社交和帮助四个方向当前方向是{activeModule.name}：{activeModule.shortLine}
        </p>
      </div>
    </section>
  );
});

export default memo(WorldSocialCompass);
