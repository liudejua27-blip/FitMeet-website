"use client";

import Image from "next/image";
import {
  ChangeEvent,
  FormEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { arrivalAtlasCopy as copy } from "../arrival-atlas-copy";
import { activityImages, heroImage, businessImages, socialImages } from "../arrival-atlas-images";
import styles from "./arrival-atlas.module.css";

type IntentProfile = {
  activity: string;
  timeWindow: string;
  rhythm: string;
  people: string;
  sceneMode: string;
  boundary: string;
};

type SectionKey =
  | "hero"
  | "pipeline"
  | "scene"
  | "signal"
  | "safety"
  | "enterprise"
  | "final";

type RouteNode = {
  x: number;
  y: number;
  title: string;
};

type SectionStatus = "待同步" | "解析中" | "完成" | "等待";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const routeNodes: RouteNode[] = [
  { x: 14, y: 75, title: "INPUT" },
  { x: 28, y: 62, title: "TIME" },
  { x: 44, y: 48, title: "SCENE" },
  { x: 64, y: 34, title: "MATCH" },
  { x: 82, y: 22, title: "SAFE" },
  { x: 93, y: 14, title: "CITY" }
];

const routePath = "M 14 75 C 21 70, 27 65, 28 62 C 38 56, 42 52, 44 48 C 52 42, 58 38, 64 34 C 71 30, 77 26, 82 22 C 88 17, 91 15, 93 14";

const routeToRoomIndex = (activity: string, rooms: typeof activityImages) => {
  const map: Record<string, string[]> = {
    "夜跑": ["夜跑", "跑步", "run", "5km"],
    "羽毛球": ["球馆", "羽毛球", "球场", "健身", "篮球"],
    "桌游": ["桌游", "桌面", "桌面游戏"],
    "露营": ["露营", "营地", "烧烤"],
    "遛狗": ["遛狗", "宠物", "狗"],
    "开黑": ["开黑", "游戏", "电竞"],
    "摄影": ["摄影", "旅行", "旅游", "拍照", "cos", "photo"],
    "骑行": ["骑行", "骑车", "自行车"],
    "攀岩": ["攀岩", "rock", "climb"]
  };

  const entries = Object.entries(map) as Array<[string, string[]]>;

  for (const [label, keys] of entries) {
    const has = keys.some((key) => activity.includes(key));
    if (has) {
      const idx = rooms.findIndex((room) => room.title.includes(label));
      if (idx >= 0) {
        return idx;
      }
    }
  }

  return 0;
};

const flowMarks = ["INPUT", "DECODE", "ROUTE", "MATCH", "SAFE", "WORLD"];

const parseIntent = (input: string): IntentProfile => {
  const text = input.toLowerCase();
  const has = (keys: string[]) => keys.some((key) => text.includes(key));

  const activity =
    has(["夜跑", "run", "跑步", "running"]) ? "夜跑"
      : has(["球馆", "羽毛球", "篮球", "球场", "健身"]) ? "球馆 / 健身"
      : has(["桌游", "桌面", "桌面游戏"]) ? "桌游"
      : has(["露营", "营地", "烧烤", "camp"]) ? "露营"
      : has(["遛狗", "宠物", "狗"]) ? "遛狗搭子"
      : has(["开黑", "游戏", "电竞"]) ? "游戏开黑"
      : has(["摄影", "拍照", "旅游", "travel", "photo", "cos"]) ? "摄影"
      : has(["骑行", "自行车", "骑车"]) ? "骑行"
      : has(["攀岩", "rock", "climb"]) ? "攀岩"
      : "活动";

  const timeWindow =
    has(["今晚", "today", "今儿"]) ? "今晚"
      : has(["明天", "明日", "tomorrow"]) ? "明天"
      : has(["周末", "周六", "周日"]) ? "周末"
      : has(["本周", "周一", "周二", "周三", "周四", "周五"]) ? "本周"
      : "近期";

  const rhythm =
    has(["5km", "五公里", "快", "高", "冲", "hiit"]) ? "中高节奏"
      : has(["慢", "轻松", "低强", "舒缓"]) ? "舒适节奏"
      : "可持续节奏";

  const people =
    has(["solo", "一个", "单独", "独自", "1"]) ? "1-2 人"
      : has(["3", "四", "5", "6", "多人", "6人", "4-6"]) ? "2-6 人"
      : "2-4 人";

  const sceneMode =
    has(["室内", "球馆", "健身房", "咖啡", "商场"]) ? "公开室内"
      : has(["户外", "公园", "街", "绿道", "徒步", "海边"]) ? "公开场地"
      : "公开优先";

  const boundary =
    has(["边界", "退出", "不舒服", "低压", "安全"]) ? "边界可见" : "发布前确认";

  return {
    activity,
    timeWindow,
    rhythm,
    people,
    sceneMode,
    boundary
  };
};

function useIntentSignals(intentText: string) {
  return useMemo(() => {
    const profile = parseIntent(intentText);
    return [
      { title: "活动", value: profile.activity },
      { title: "时间", value: profile.timeWindow },
      { title: "节奏", value: profile.rhythm },
      { title: "人数", value: profile.people },
      { title: "场景", value: profile.sceneMode },
      { title: "边界", value: profile.boundary }
    ];
  }, [intentText]);
}

export function ArrivalAtlasHomepage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<SectionKey, HTMLElement | null>>({
    hero: null,
    pipeline: null,
    scene: null,
    signal: null,
    safety: null,
    enterprise: null,
    final: null
  });

  const [intentText, setIntentText] = useState(copy.hero.demandPlaceholder);
  const [cityText, setCityText] = useState(copy.hero.cityPlaceholder);
  const [isDispatching, setIsDispatching] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeRoom, setActiveRoom] = useState(0);
  const [dispatchPulse, setDispatchPulse] = useState(0);
  const [activeSignal, setActiveSignal] = useState(0);

  const displayRooms = useMemo(() => activityImages.slice(0, 6), []);
  const displaySignals = useMemo(() => socialImages.slice(0, 4), []);
  const displayBusiness = useMemo(() => businessImages.slice(0, 3), []);
  const parseSignals = useIntentSignals(intentText);
  const timersRef = useRef<number[]>([]);
  const activeFlowIndex = isDispatching ? Math.min(activeStep, flowMarks.length - 1) : 0;

  const bindSection = (key: SectionKey) => (node: HTMLElement | null) => {
    sectionRefs.current[key] = node;
  };

  const clearTimers = () => {
    if (timersRef.current.length === 0) return;
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const statusOf = (index: number): SectionStatus => {
    if (!isDispatching) {
      return "待同步";
    }

    if (index < activeStep) {
      return "完成";
    }

    if (index === activeStep) {
      return "解析中";
    }

    return "等待";
  };

  const updateIntent = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (name === "intent") {
      setIntentText(value);
    } else {
      setCityText(value);
    }
  };

  const submitIntent = (event: FormEvent) => {
    event.preventDefault();
    clearTimers();

    const profile = parseIntent(intentText);
    const roomIndex = routeToRoomIndex(profile.activity, activityImages);

    setIsDispatching(true);
    setDispatchPulse((prev) => prev + 1);
    setActiveStep(0);
    setActiveSignal(0);
    setActiveRoom(roomIndex);

    timersRef.current.push(
      window.setTimeout(() => {
        setActiveStep(1);
      }, 220),
      window.setTimeout(() => {
        setActiveStep(2);
        setActiveSignal(1);
      }, 560),
      window.setTimeout(() => {
        setActiveStep(3);
        setActiveSignal(2);
      }, 980),
      window.setTimeout(() => {
        setActiveStep(4);
        setActiveSignal(3);
      }, 1400),
      window.setTimeout(() => {
        setActiveStep(5);
      }, 1800),
      window.setTimeout(() => {
        setIsDispatching(false);
      }, 2400)
    );
  };

  const pointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!rootRef.current) {
      return;
    }

    rootRef.current.style.setProperty("--mx", `${event.clientX}px`);
    rootRef.current.style.setProperty("--my", `${event.clientY}px`);
  };

  useEffect(() => {
    if (isDispatching) {
      return;
    }

    const roomTimer = window.setInterval(() => {
      setActiveRoom((prev) => (prev + 1) % displayRooms.length);
    }, 1900);

    const signalTimer = window.setInterval(() => {
      setActiveSignal((prev) => (prev + 1) % 4);
    }, 900);

    return () => {
      window.clearInterval(roomTimer);
      window.clearInterval(signalTimer);
    };
  }, [isDispatching, displayRooms.length]);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const ctx = gsap.context(() => {
        const animateSection = (key: SectionKey) => {
          const sectionNode = sectionRefs.current[key];
          if (!sectionNode) {
            return;
          }

          const nodes = sectionNode.querySelectorAll<HTMLElement>(`.${styles.reveal}`);
          if (nodes.length) {
            gsap.fromTo(
              nodes,
              {
                y: 42,
                opacity: 0
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.95,
                ease: "power3.out",
                stagger: 0.1,
                scrollTrigger: {
                  trigger: sectionNode,
                  start: "top 82%",
                  end: "top 22%",
                  scrub: true
                }
              }
            );
          }
        };

        ["hero", "pipeline", "scene", "signal", "safety", "enterprise", "final"].forEach((key) => {
          animateSection(key as SectionKey);
        });

        const line = rootRef.current?.querySelector<SVGPathElement>(`.${styles.routePath}`);
        if (line) {
          const len = line.getTotalLength();
          gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(line, {
            strokeDashoffset: 0,
            ease: "power2.inOut",
            duration: 1.2,
            scrollTrigger: {
              trigger: sectionRefs.current.hero,
              start: "top 80%",
              end: "top 30%",
              scrub: 0.22
            }
          });
        }

        gsap.to(`.${styles.pipelineLight}`, {
          opacity: 0.85,
          y: -8,
          duration: 1,
          repeat: -1,
          yoyo: true,
          stagger: 0.16,
          ease: "sine.inOut"
        });

        gsap.to(`.${styles.sceneCard}`, {
          y: -10,
          rotateX: 3,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          stagger: 0.14,
          ease: "power1.inOut"
        });

        if (dispatchPulse > 0) {
          gsap.fromTo(
            `.${styles.dispatchPulse}`,
            { scale: 0.93, opacity: 0.16 },
            { scale: 1.04, opacity: 0.9, duration: 0.42, repeat: 1, yoyo: true, ease: "power2.out" }
          );
        }
      }, rootRef);

      return () => {
        ctx.revert();
      };
    },
    {
      dependencies: [activeStep, activeSignal, activeRoom, dispatchPulse],
      scope: rootRef
    }
  );

  const deckRooms = useMemo(() => {
    if (displayRooms.length === 0) {
      return [];
    }

    const len = displayRooms.length;
    return [
      displayRooms[(activeRoom + 1) % len],
      displayRooms[activeRoom % len],
      displayRooms[(activeRoom + 2) % len]
    ];
  }, [activeRoom, displayRooms]);

  return (
    <div className={styles.stage} ref={rootRef} onPointerMove={pointerMove}>
      <div className={styles.ground} />
      <div className={styles.vignette} />
      <div className={styles.rayfield} aria-hidden />

      <header className={styles.header}>
        <a className={styles.logo} href="#hero" aria-label="FitMeet">
          <span className={styles.logoMark}>F</span>
          <span>FitMeet</span>
        </a>

        <nav className={styles.nav} aria-label="主导航">
          <a href="#pipeline">流程</a>
          <a href="#scene">场景</a>
          <a href="#signal">同频</a>
          <a href="#safety">安全</a>
          <a href="#enterprise">合作</a>
        </nav>

        <a href="#final" className={styles.navCta}>
          立即加入
        </a>
      </header>

      <main className={styles.shell}>
        <div className={styles.flowSpine} aria-hidden>
          {flowMarks.map((node, index) => (
            <span
              key={node}
              className={`${styles.flowStep} ${index <= activeFlowIndex ? styles.flowStepActive : ""}`}
              style={{ top: `${14 + index * 136}px` }}
            >
              <b>{String(index + 1).padStart(2, "0")}</b>
              <i>{node}</i>
            </span>
          ))}
        </div>

        <section id="hero" className={`${styles.panel} ${styles.hero}`} ref={bindSection("hero")}>
          <div className={`${styles.heroCopy} ${styles.reveal}`}>
            <p className={styles.kicker}>FitMeet Fieldline</p>
            <h1 className={styles.heroTitle}>{copy.hero.title}</h1>
            <p className={styles.heroKicker}>{copy.hero.kicker}</p>
            <p className={styles.heroBody}>{copy.hero.statement}</p>

            <form className={styles.intentForm} onSubmit={submitIntent}>
              <label className={styles.fieldBlock}>
                <span>{copy.hero.demandLabel}</span>
                <textarea
                  rows={2}
                  name="intent"
                  value={intentText}
                  onChange={updateIntent}
                  placeholder={copy.hero.demandPlaceholder}
                />
              </label>

              <label className={styles.fieldBlock}>
                <span>{copy.hero.cityLabel}</span>
                <input
                  name="city"
                  value={cityText}
                  onChange={updateIntent}
                  placeholder={copy.hero.cityPlaceholder}
                />
              </label>

              <p className={styles.cityTag}>
                真实城市：<strong>{cityText}</strong>
              </p>

              <button type="submit" className={styles.primaryBtn}>
                {isDispatching ? "正在编排" : copy.hero.buttonLabel}
              </button>
            </form>

            <div className={styles.ticketBoard}>
              {parseSignals.map((item, index) => (
                <article
                  key={item.title}
                  className={`${styles.signalTicket} ${activeStep === index + 1 ? styles.signalActive : ""}`}
                  data-status={statusOf(index)}
                >
                  <small>{item.title}</small>
                  <p>{item.value}</p>
                  <strong>{statusOf(index)}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className={`${styles.heroCanvasWrap} ${styles.reveal}`}>
            <div className={styles.stageCard}>
              <Image src={heroImage.image} alt={heroImage.title} fill className={styles.heroImage} />
              <div className={styles.heroScrim} />
              <div className={styles.dispatchPulse} />

              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.fieldRoute} aria-hidden>
                <defs>
                  <linearGradient id="routeGlow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(255, 147, 86, 0.22)" />
                    <stop offset="100%" stopColor="rgba(255, 101, 56, 0.98)" />
                  </linearGradient>
                </defs>
                <path d={routePath} className={styles.routePath} />
                {routeNodes.map((node, index) => (
                  <circle
                    key={node.title}
                    cx={node.x}
                    cy={node.y}
                    r={1.0}
                    className={
                      index <= activeStep
                        ? `${styles.routeNode} ${styles.routeNodeActive}`
                        : styles.routeNode
                    }
                  />
                ))}
                <path
                  d={routePath}
                  className={styles.routePathGlow}
                  fill="none"
                  stroke="url(#routeGlow)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>

              <div className={styles.routeTags}>
                {routeNodes.map((item) => (
                  <span
                    key={item.title}
                    className={styles.routeTag}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  >
                    {item.title}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.deckLine}>
              {deckRooms.map((room, index) => (
                <article
                  key={room.id}
                  className={`${styles.sceneCard} ${index === 1 ? styles.sceneCardMain : ""}`}
                >
                  <Image src={room.image} alt={room.title} fill className={styles.sceneCardImage} />
                  <span className={styles.sceneCardTag}>{room.title}</span>
                  <p>{room.scene}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pipeline" className={`${styles.panel} ${styles.pipeline}`} ref={bindSection("pipeline")}>
          <div className={styles.panelHead}>
            <p className={styles.sectionTag}>01 · FIELDLINE CORE</p>
            <h2 className={styles.panelTitle}>{copy.pipelineTitle}</h2>
            <p className={styles.panelBody}>{copy.pipelineSub}</p>
          </div>
          <div className={styles.pipelineTrack}>
            {copy.pipeline.map((item, index) => (
              <article
                key={item.title}
                className={`${styles.pipelineCard} ${
                  activeStep === index ? styles.pipelineCardActive : activeStep > index ? styles.pipelineCardDone : ""
                }`}
              >
                <div className={styles.pipelineLight} />
                <p className={styles.smallNum}>{String(index + 1).padStart(2, "0")}</p>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="scene" className={`${styles.panel} ${styles.scene}`} ref={bindSection("scene")}>
          <div className={styles.panelHead}>
            <p className={styles.sectionTag}>02 · 城市活动场</p>
            <h2 className={styles.panelTitle}>{copy.arenaTitle}</h2>
            <p className={styles.panelBody}>{copy.arenaSub}</p>
          </div>

          <div className={styles.sceneGrid}>
            <div className={styles.sceneMain}>
              <Image
                src={displayRooms[activeRoom].image}
                alt={displayRooms[activeRoom].title}
                fill
                sizes="(max-width: 1600px) 60vw, 720px"
                className={styles.sceneMainImage}
              />
              <div className={styles.sceneMainOverlay}>
                <p>ROOM</p>
                <h3>{displayRooms[activeRoom].title}</h3>
                <p>{displayRooms[activeRoom].scene}</p>
                <span>{displayRooms[activeRoom].status}</span>
              </div>
            </div>

            <div className={styles.sceneList}>
              {displayRooms.map((room, index) => (
                <button
                  type="button"
                  key={room.id}
                  className={`${styles.sceneItem} ${index === activeRoom ? styles.sceneItemActive : ""}`}
                  onMouseEnter={() => setActiveRoom(index)}
                  onFocus={() => setActiveRoom(index)}
                >
                  <p>{room.title}</p>
                  <span>{room.scene}</span>
                  <small>{room.status}</small>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="signal" className={`${styles.panel} ${styles.signal}`} ref={bindSection("signal")}>
          <div className={styles.panelHead}>
            <p className={styles.sectionTag}>03 · 同频不是头像墙</p>
            <h2 className={styles.panelTitle}>{copy.matchTitle}</h2>
            <p className={styles.panelBody}>{copy.matchBody}</p>
          </div>

          <div className={styles.signalWrap}>
            {copy.matchSignals.map((signal, index) => (
              <article
                key={signal}
                className={`${styles.signalCard} ${activeSignal > index ? styles.signalCardActive : ""}`}
              >
                <p>SIGNAL</p>
                <h3>{signal}</h3>
                <span>{activeSignal > index ? "已形成" : "等待"}</span>
              </article>
            ))}
          </div>

          <div className={styles.signalStrip}>
            {displaySignals.map((scene) => (
              <figure key={scene.id} className={styles.signalThumb}>
                <Image
                  src={scene.image}
                  alt={scene.title}
                  fill
                  sizes="(max-width: 1400px) 24vw, 420px"
                  className={styles.signalImage}
                />
                <figcaption>
                  <p>{scene.title}</p>
                  <small>{scene.scene}</small>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="safety" className={`${styles.panel} ${styles.safety}`} ref={bindSection("safety")}>
          <div className={styles.panelHead}>
            <p className={styles.sectionTag}>04 · 安全基线</p>
            <h2 className={styles.panelTitle}>{copy.trustTitle}</h2>
            <p className={styles.panelBody}>{copy.trustSub}</p>
          </div>
          <div className={styles.safetyGrid}>
            {copy.trustItems.map((item) => (
              <article key={item} className={styles.safetyCard}>
                <p>SAFE</p>
                <h3>{item}</h3>
              </article>
            ))}
          </div>
        </section>

        <section id="enterprise" className={`${styles.panel} ${styles.enterprise}`} ref={bindSection("enterprise")}>
          <div className={styles.panelHead}>
            <p className={styles.sectionTag}>05 · 商业共赢</p>
            <h2 className={styles.panelTitle}>{copy.enterpriseTitle}</h2>
            <p className={styles.panelBody}>{copy.enterpriseSub}</p>
          </div>

          <div className={styles.enterpriseGrid}>
            {displayBusiness.map((node) => (
              <article key={node.id} className={styles.enterpriseCard}>
                <Image src={node.image} alt={node.title} fill className={styles.enterpriseImage} />
                <div className={styles.enterpriseOverlay}>
                  <h3>{node.title}</h3>
                  <p>{node.scene}</p>
                  <span>{node.status}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="final" className={`${styles.panel} ${styles.final}`} ref={bindSection("final")}>
          <div className={`${styles.finalBlock} ${styles.reveal}`}>
            <p className={styles.sectionTag}>FINAL</p>
            <h2>{copy.finalTitle}</h2>
            <p>{copy.finalBody}</p>
            <p className={styles.contact}>{copy.contact}</p>
            <div className={styles.finalActions}>
              <a href="#hero" className={styles.btnPrimary}>
                {copy.finalCTAPrimary}
              </a>
              <a href="mailto:15253005312@163.com" className={styles.btnGhost}>
                {copy.finalCTASecondary}
              </a>
            </div>
          </div>

          <div className={styles.finalImageCard}>
            <Image
              src={displayBusiness[1].image}
              alt={displayBusiness[1].title}
              fill
              className={styles.finalImage}
            />
            <span className={styles.finalLogo}>F</span>
          </div>
        </section>
      </main>
    </div>
  );
}
