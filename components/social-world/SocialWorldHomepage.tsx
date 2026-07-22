"use client";

import Image from "next/image";
import Link from "next/link";
import { CSSProperties, useCallback, useRef, useState, type MutableRefObject } from "react";
import { FiArrowDown, FiArrowUpRight, FiCheck, FiMapPin, FiShield } from "react-icons/fi";
import { SiApple, SiGoogleplay } from "react-icons/si";
import { SiteFooter } from "@/components/site-shell/SiteFooter";
import { SiteNavigation } from "@/components/site-shell/SiteNavigation";
import { agentScenarios } from "@/lib/agent-semantic-content";
import { orbitFragments, worldScenes, type OrbitFragment } from "@/lib/social-world-scenes";
import { HomeCinematicField } from "./HomeCinematicField";
import { useSocialWorldMotion } from "./useSocialWorldMotion";
import styles from "./social-world.module.css";

type OrbitStyle = CSSProperties & {
  "--fragment-left": string;
  "--fragment-top": string;
  "--fragment-width": string;
  "--fragment-height": string;
  "--fragment-depth": number;
};

const momentFrames = [
  {
    label: "打球",
    meta: "周四 19:10 · 城市球场 · 3 人",
    asset: "/images/moments-film/moments-same-court-badminton-desktop.jpg",
    position: "50% 46%",
  },
  {
    label: "旅游",
    meta: "周六 16:40 · 城市街区 · 3 人",
    asset: "/images/moments-film/moments-see-city-photo-desktop.jpg",
    position: "50% 50%",
  },
  {
    label: "音乐会",
    meta: "周日 20:25 · 公共空间 · 4 人",
    asset: "/images/moments-film/moments-culture-festival-desktop.jpg",
    position: "50% 52%",
  },
] as const;

function OrbitFragmentImage({ fragment, index }: { fragment: OrbitFragment; index: number }) {
  const style: OrbitStyle = {
    "--fragment-left": `${fragment.rect.left}%`,
    "--fragment-top": `${fragment.rect.top}%`,
    "--fragment-width": `${fragment.rect.width}%`,
    "--fragment-height": `${fragment.rect.height}%`,
    "--fragment-depth": fragment.depth,
  };

  return (
    <figure className={styles.orbitFragment} data-orbit-fragment style={style} aria-hidden="true">
      <Image
        src={fragment.asset}
        fill
        sizes="12vw"
        fetchPriority={index === 5 ? "high" : "auto"}
        loading={index === 5 || index < 3 ? "eager" : "lazy"}
        alt=""
        style={{ objectPosition: fragment.objectPosition }}
      />
      <figcaption>{fragment.label}</figcaption>
    </figure>
  );
}

function BrandRoute({
  className = "",
  gradientId,
  path = "M-80 714C180 682 168 324 422 318C674 312 624 112 842 130C1098 150 984 548 1246 570C1422 586 1470 438 1534 356",
  showNodes = false,
}: {
  className?: string;
  gradientId: string;
  path?: string;
  showNodes?: boolean;
}) {
  return (
    <svg className={className} viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1">
          <stop offset="0" stopColor="#08e4f2" />
          <stop offset="0.56" stopColor="#28f0c0" />
          <stop offset="1" stopColor="#f14db2" />
        </linearGradient>
      </defs>
      <path data-brand-route d={path} style={{ stroke: `url(#${gradientId})` }} />
      {showNodes ? (
        <>
          <circle cx="422" cy="318" r="5" />
          <circle cx="842" cy="130" r="5" />
          <circle cx="1246" cy="570" r="5" />
        </>
      ) : null}
    </svg>
  );
}

function CinematicHero({
  progress,
  pointer,
}: {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<{ x: number; y: number }>;
}) {
  const [fieldReady, setFieldReady] = useState(false);
  const handleFieldReady = useCallback((ready: boolean) => setFieldReady(ready), []);

  return (
    <section className={styles.cinematicTrack} id="top" data-home-cinematic>
      <div className={styles.cinematicStage} data-cinematic-stage data-field-ready={fieldReady ? "true" : "false"}>
        <div className={styles.cinematicPaper} />
        <div className={styles.cinematicMedia} data-cinematic-media>
          <Image
            src="/images/social-world/social-world-transition-blue-hour.jpg"
            fill
            sizes="100vw"
            alt="蓝调时刻的城市公共空间人们正在走向彼此"
            loading="lazy"
          />
        </div>
        <div className={styles.cinematicShade} data-cinematic-shade />
        <div className={styles.cinematicField} data-cinematic-field>
          <HomeCinematicField progress={progress} pointer={pointer} onReady={handleFieldReady} />
        </div>
        <BrandRoute className={styles.heroRoute} gradientId="hero-route-gradient" showNodes />
        <div className={styles.orbitFragments} data-hero-fragments>
          {orbitFragments.map((fragment, index) => <OrbitFragmentImage fragment={fragment} index={index} key={fragment.id} />)}
        </div>
        <div className={styles.heroCopy} data-hero-copy>
          <h1>Social World</h1>
          <p>让社交更简单</p>
          <strong>FitMeet助你社交成功</strong>
          <div>
            <Link href="/agent">了解社交助手如何辅助 <FiArrowUpRight aria-hidden="true" /></Link>
            <Link href="/app">查看 FitMeet 应用</Link>
          </div>
        </div>
        <p className={styles.cinematicCopy} data-cinematic-copy>社交就来FitMeet</p>
        <a className={styles.scrollCue} href="#world-preview"><span>向下滚动</span><FiArrowDown aria-hidden="true" /></a>
      </div>
    </section>
  );
}

function WorldPreview() {
  const [sceneId, setSceneId] = useState(worldScenes[3].id);
  const scene = worldScenes.find((item) => item.id === sceneId) ?? worldScenes[3];

  return (
    <section className={styles.worldPreview} id="world-preview" data-world-preview>
      <div className={styles.worldMedia} data-world-media>
        <Image src={scene.asset} fill sizes="100vw" alt={scene.alt} style={{ objectPosition: scene.focalPoint }} />
      </div>
      <div className={styles.worldShade} />
      <div className={styles.worldCopy} data-world-copy>
        <span>Social World</span>
        <h2>把一个念头<br />变成一场见面</h2>
        <p>来FitMeet认识更多懂你的朋友</p>
        <Link href="/world">进入完整的 Social World <FiArrowUpRight aria-hidden="true" /></Link>
      </div>
      <div className={styles.sceneRail} aria-label="选择 Social World 场景">
        {worldScenes.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={item.id === scene.id}
            onMouseEnter={() => setSceneId(item.id)}
            onFocus={() => setSceneId(item.id)}
            onClick={() => setSceneId(item.id)}
          >
            <i />
            <span>{item.index}</span>
            <strong>{item.category.split(" · ")[0]}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function AgentPreview() {
  const scenario = agentScenarios.find((item) => item.id === "sport") ?? agentScenarios[0];
  const [status, setStatus] = useState<"intent" | "organized" | "confirmed">("intent");

  return (
    <section className={styles.agentPreview} data-agent-preview>
      <div className={styles.agentCopy} data-agent-copy>
        <span>社交助手</span>
        <h2>你说想做什么<br />FitMeet 帮你把条件摆在眼前</h2>
        <p>时间、地点、人数、预算和边界都可以修改计划只有在你确认之后才进入下一步</p>
        <Link href="/agent">看看它怎么工作 <FiArrowUpRight aria-hidden="true" /></Link>
      </div>
      <div className={styles.agentDemo} data-agent-demo data-agent-status={status}>
        <header><strong>FitMeet 社交助手</strong><span><i />{status === "confirmed" ? "计划已确认" : "等待你的决定"}</span></header>
        <div className={styles.intentLine}>
          <small>你说</small>
          <p>“周六下午想找两三个人打羽毛球预算每人 60 元以内”</p>
          {status === "intent" ? <button type="button" onClick={() => setStatus("organized")}>整理条件</button> : null}
        </div>
        <div className={styles.conditionGrid}>
          {scenario.nodes.slice(0, 5).map((node) => (
            <div key={node.id} data-confirmed={status !== "intent" ? "true" : "false"}>
              <span><i />{node.label}</span><strong>{node.id === "time" ? "周六下午" : node.id === "people" ? "2–3 人" : node.id === "budget" ? "¥60 内" : node.value}</strong>
            </div>
          ))}
        </div>
        <div className={styles.planResult}>
          <div><small>计划建议</small><strong>{status === "intent" ? "整理后在这里确认" : "周六 15:00 · 公共运动场馆 · 预计 90 分钟"}</strong></div>
          {status === "organized" ? <button type="button" onClick={() => setStatus("confirmed")}>确认计划 <FiCheck /></button> : null}
          {status === "confirmed" ? <span><FiCheck /> 由你确认</span> : null}
        </div>
        <p className={styles.agentBoundary}><FiShield />FitMeet 不会替你发送邀请或作出决定</p>
      </div>
    </section>
  );
}

function MomentsPreview() {
  return (
    <section className={styles.momentsPreview} data-moments-preview>
      <header data-moments-header>
        <span>见面片段</span>
        <h2>把想法带进现实</h2>
        <Link href="/moments">查看见面片段 <FiArrowUpRight aria-hidden="true" /></Link>
      </header>
      <div className={styles.momentRail}>
        {momentFrames.map((frame) => (
          <article key={frame.label} data-moment-article>
            <div><Image src={frame.asset} fill sizes="31vw" alt={frame.label} style={{ objectPosition: frame.position }} /></div>
            <span>{frame.label}</span>
            <p>{frame.meta}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SafetyPreview() {
  const safetyItems = ["计划信息清楚", "建议可以修改", "优先公共地点", "随时可以退出"];
  return (
    <section className={styles.safetyPreview} data-safety-preview>
      <div className={styles.safetyMedia}>
        <Image src="/images/safety-radius/safety-public-plaza-hero-desktop.jpg" fill sizes="50vw" alt="人们在开放的城市公共空间见面" />
      </div>
      <div className={styles.safetyCopy} data-safety-copy>
        <span>安全设计</span>
        <h2>见面之前<br />把边界说清楚</h2>
        <p>公共地点、明确计划、可修改的选择以及随时退出的权利</p>
        <div>{safetyItems.map((item, index) => <span key={item}><i>{String(index + 1).padStart(2, "0")}</i>{item}</span>)}</div>
        <Link href="/safety">了解安全设计 <FiArrowUpRight aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

function AppEntry() {
  return (
    <section className={styles.appEntry} data-app-entry>
      <BrandRoute className={styles.appRoute} gradientId="app-route-gradient" path="M-120 654C176 650 240 480 442 480C686 480 700 236 926 236C1176 236 1122 570 1540 560" />
      <div data-app-copy>
        <span>FitMeet 应用</span>
        <h2>把想法<br />带到现实</h2>
        <p>应用即将上线现在可以留下联系方式第一时间获取上线消息</p>
      </div>
      <aside data-app-status>
        <span><SiApple /><small>苹果应用商店</small><strong>即将上线</strong></span>
        <span><SiGoogleplay /><small>谷歌应用商店</small><strong>即将上线</strong></span>
        <Link href="/contact">获取上线消息 <FiArrowUpRight /></Link>
      </aside>
    </section>
  );
}

export function SocialWorldHomepage() {
  const mainRef = useRef<HTMLElement>(null);
  const cinematicProgress = useRef(0);
  const cinematicPointer = useRef({ x: 0, y: 0 });
  useSocialWorldMotion(mainRef, cinematicProgress, cinematicPointer);

  return (
    <main ref={mainRef} className={styles.page}>
      <SiteNavigation />
      <CinematicHero progress={cinematicProgress} pointer={cinematicPointer} />
      <WorldPreview />
      <AgentPreview />
      <MomentsPreview />
      <SafetyPreview />
      <AppEntry />
      <SiteFooter />
    </main>
  );
}
