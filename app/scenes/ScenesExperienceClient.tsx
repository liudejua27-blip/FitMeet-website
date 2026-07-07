"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type PointerEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./scenes.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const scenes = [
  {
    id: "sport",
    number: "01",
    label: "运动",
    title: "运动搭子",
    short: "今晚一起动起来",
    color: "#ff3a2f",
    city: "上海 · 滨江跑道",
    need: "今晚 20:30 想找 3-5 个人轻松夜跑 5 公里，公开路线，不拼速度。",
    context: ["20:30", "5 公里", "3-5 人", "轻松配速"],
    boundary: "公开跑道 / 小组优先 / 路线先共享 / 结束后可直接离开",
    plan: "滨江 5 公里 夜跑，4 人确认，运动后可选补给点。",
    receipt: "一个想恢复运动的人，不再靠自律硬撑，而是进入一个节奏相近、边界清楚的公开计划。",
    partner: "跑团、球馆、运动品牌和补给点，可以在用户准备行动时自然出现。",
  },
  {
    id: "travel",
    number: "02",
    label: "旅行",
    title: "城市旅行搭子",
    short: "新城市从一条路线开始",
    color: "#ff6b4a",
    city: "东京 · 中目黑",
    need: "周末想找同路线城市漫步搭子，咖啡、展览、日落前结束。",
    context: ["周末", "3 小时", "同路线", "日落前"],
    boundary: "公开集合点 / 不共享住宿 / 时间盒 / 确认后邀请",
    plan: "代官山到中目黑，咖啡中途点，2-4 人低压力路线。",
    receipt: "一个人的旅行不必变成私约，也可以是公开路线里的短暂同频。",
    partner: "咖啡馆、展览、文旅和本地活动，成为城市路线中的可信节点。",
  },
  {
    id: "nearby",
    number: "03",
    label: "附近",
    title: "附近轻社交",
    short: "附近不是人，是可以加入的生活片段",
    color: "#f5efe6",
    city: "深圳 · 下班生活圈",
    need: "下班后不想一个人待着，想找附近低压力活动，先活动后聊天。",
    context: ["800 米", "下班后", "低压力", "可加入"],
    boundary: "模糊定位 / 公开地点 / 先活动后聊天 / 随时退出",
    plan: "咖啡散步、市集短逛或攀岩体验，从 800 米 内可加入节点开始。",
    receipt: "附近不再是陌生人的距离，而是一个可以安全出现的城市时刻。",
    partner: "附近商家获得一组准备一起出现的人，而不是一个随机点击。",
  },
  {
    id: "newcity",
    number: "04",
    label: "新城市",
    title: "新城市社交",
    short: "刚到一座城市，先有一个安全计划",
    color: "#d8a34e",
    city: "青岛 · 海边周末",
    need: "刚搬到青岛，想从一个白天的公开路线认识同频的人。",
    context: ["新城市", "白天", "4 人", "公开路线"],
    boundary: "小组活动 / 明确结束点 / 不暴露住址 / 活动后再决定是否继续聊",
    plan: "海边城市漫步，4 人公开路线，结束后生成社交回执。",
    receipt: "新城市不再从孤独开始，而是从一个可确认、可退出的周末计划开始。",
    partner: "校园、城市活动和本地组织者，可以理解真实需求趋势并承接活动。",
  },
] as const;

const protocol = [
  ["真实需求", "先说你想做什么，而不是先展示你是谁。"],
  ["场景上下文", "智能体识别时间、地点、活动强度、人数和情绪压力。"],
  ["安全边界", "公开地点、小组优先、模糊定位和确认后邀请先出现。"],
  ["可确认计划", "一句话被整理成时间、路线、集合点和可参与条件。"],
  ["同频的人", "人以加入理由出现，而不是以头像墙出现。"],
] as const;

const receipts = [
  ["发生前", "一个人想夜跑，但总是临时放弃。"],
  ["智能体", "把需求变成公开路线、轻松配速和 3-5 人小组。"],
  ["边界", "不共享住址，公开集合，结束后可直接离开。"],
  ["结果", "4 人完成 5 公里，活动结束后自然生成下一次可能。"],
] as const;

export function ScenesExperienceClient() {
  const [activeId, setActiveId] = useState<(typeof scenes)[number]["id"]>("sport");
  const activeScene = useMemo(() => scenes.find((scene) => scene.id === activeId) ?? scenes[0], [activeId]);

  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set("[data-scenes-reveal]", { autoAlpha: 0, y: 58 });
    gsap.to("[data-scenes-reveal]", {
      autoAlpha: 1,
      y: 0,
      duration: reduceMotion ? 0.01 : 0.96,
      ease: "power3.out",
      stagger: reduceMotion ? 0 : 0.065,
    });

    gsap.to("[data-scenes-progress]", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "[data-scenes-root]",
        start: "top top",
        end: "bottom bottom",
        scrub: reduceMotion ? false : 0.18,
      },
    });

    if (!reduceMotion) {
      gsap.fromTo(
        "[data-scene-route]",
        { strokeDasharray: 1600, strokeDashoffset: 1600 },
        { strokeDashoffset: 0, duration: 3.1, ease: "power2.inOut", repeat: -1, repeatDelay: 1.3 },
      );

      gsap.fromTo(
        "[data-scene-row]",
        { autoAlpha: 0, y: 38 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.76,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: "[data-scene-index]", start: "top 76%" },
        },
      );
    }
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--cursor-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--cursor-y", `${event.clientY}px`);
  };

  return (
    <section
      className={styles.surface}
      data-scenes-root
      onPointerMove={handlePointerMove}
      style={{ "--scene-color": activeScene.color } as CSSProperties}
    >
      <div className={styles.progressBar} data-scenes-progress />
      <div className={styles.cursorGlow} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.cityLayer} aria-hidden="true" />

      <header className={styles.header} data-scenes-reveal>
        <Link href="/" className={styles.brand} aria-label="返回 FitMeet 首页">
          <img src="/fitmeet-icon.png" alt="FitMeet" />
          <span>FitMeet</span>
        </Link>
        <nav className={styles.nav} aria-label="场景页导航">
          <Link href="/">首页</Link>
          <Link href="/product">产品</Link>
          <Link href="/community">社区</Link>
          <Link href="/safety">安全</Link>
          <Link href="/contact">联系</Link>
        </nav>
        <Link href="/contact#waitlist" className={styles.headerCta}>从真实需求开始</Link>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker} data-scenes-reveal>真实生活场景层</p>
        <h1 data-scenes-reveal>
          <span>今晚想出门，</span>
          <span>不必从刷头像开始。</span>
        </h1>
        <p className={styles.heroText} data-scenes-reveal>
          FitMeet 从夜跑、球局、城市漫步、附近散步、新城市周末这些真实需求开始。智能体先理解时间、地点、节奏和安全边界，再把它变成可以加入的真实计划。
        </p>
        <div className={styles.routeStage} data-scenes-reveal aria-hidden="true">
          <svg viewBox="0 0 1280 420">
            <path d="M66 300 C190 86 336 302 500 154 S804 60 990 238 1144 326 1220 120" data-scene-route />
            <path d="M138 358 C302 286 456 380 640 314 S894 182 1134 282" className={styles.secondaryPath} />
            <circle cx="66" cy="300" r="8" />
            <circle cx="500" cy="154" r="8" />
            <circle cx="990" cy="238" r="8" />
            <circle className={styles.boundaryRing} cx="638" cy="218" r="96" />
            <circle className={styles.boundaryRing} cx="638" cy="218" r="148" />
          </svg>
          <div className={styles.stageLabels}>
            <span>真实需求</span>
            <span>场景上下文</span>
            <span>安全边界</span>
            <span>同频的人</span>
          </div>
        </div>
      </section>

      <section className={styles.sceneIndexSection} data-scene-index aria-labelledby="scene-index-title">
        <div className={styles.sectionHead} data-scenes-reveal>
          <span>四条现实生活轨道</span>
          <h2 id="scene-index-title">年轻人的全球社交，先从这些真实生活片段开始。</h2>
        </div>
        <div className={styles.sceneRows}>
          {scenes.map((scene) => (
            <button
              key={scene.id}
              type="button"
              className={scene.id === activeScene.id ? styles.activeScene : ""}
              onClick={() => setActiveId(scene.id)}
              style={{ "--lane-color": scene.color } as CSSProperties}
              data-scene-row
            >
              <span>{scene.number}</span>
              <strong>{scene.title}</strong>
              <em>{scene.need}</em>
              <i>{scene.city}</i>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.activeSceneSection} aria-labelledby="active-scene-title">
        <p className={styles.kicker} data-scenes-reveal>{activeScene.city}</p>
        <h2 id="active-scene-title" data-scenes-reveal>{activeScene.title}</h2>
        <p className={styles.activeLead} data-scenes-reveal>{activeScene.short}</p>
        <div className={styles.signalFlow} data-scenes-reveal>
          <p><span>真实需求</span><strong>{activeScene.need}</strong></p>
          <p><span>场景上下文</span><strong>{activeScene.context.join(" · ")}</strong></p>
          <p><span>安全边界</span><strong>{activeScene.boundary}</strong></p>
          <p><span>可确认计划</span><strong>{activeScene.plan}</strong></p>
        </div>
      </section>

      <section className={styles.boundaryBand} aria-label="边界先于人出现">
        <span data-scenes-reveal>边界先于人出现</span>
        <div data-scenes-reveal>
          <strong>公开地点</strong>
          <strong>小组优先</strong>
          <strong>不共享住址</strong>
          <strong>确认后邀请</strong>
          <strong>随时退出</strong>
        </div>
      </section>

      <section className={styles.protocolSection} aria-labelledby="protocol-heading">
        <div className={styles.sectionHead} data-scenes-reveal>
          <span>连接顺序</span>
          <h2 id="protocol-heading">先需求，再边界，再人。这个顺序决定 FitMeet 不是陌生人软件。</h2>
        </div>
        <div className={styles.protocolRows}>
          {protocol.map(([title, copy], index) => (
            <div key={title} data-scenes-reveal>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.receiptSection} aria-labelledby="receipt-heading">
        <div className={styles.sectionHead} data-scenes-reveal>
          <span>连接回执</span>
          <h2 id="receipt-heading">我们不证明“谁喜欢谁”，我们证明一次真实连接如何发生。</h2>
        </div>
        <div className={styles.receiptRows}>
          {receipts.map(([title, copy], index) => (
            <div key={title} data-scenes-reveal>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <p>{copy}</p>
            </div>
          ))}
        </div>
        <p className={styles.receiptNote} data-scenes-reveal>{activeScene.receipt}</p>
      </section>

      <section className={styles.businessBridge} aria-labelledby="business-heading">
        <span data-scenes-reveal>场景承接</span>
        <h2 id="business-heading" data-scenes-reveal>真实需求，是比流量更有价值的入口。</h2>
        <p data-scenes-reveal>
          {activeScene.partner} FitMeet 不把用户卖给商业节点，而是在真实计划已经形成时，让合适的场馆、品牌、城市活动和本地服务成为可信节点。
        </p>
        <div className={styles.finalActions} data-scenes-reveal>
          <Link href="/contact#waitlist">从真实需求开始</Link>
          <Link href="/safety">查看安全边界</Link>
          <Link href="/contact#enterprise">查看城市合作</Link>
        </div>
      </section>
    </section>
  );
}
