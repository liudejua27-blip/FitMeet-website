"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./about.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const navItems = [
  { label: "首页", href: "/" },
  { label: "产品", href: "/product" },
  { label: "场景", href: "/scenes" },
  { label: "社区", href: "/community" },
  { label: "安全", href: "/safety" },
  { label: "关于", href: "/about" },
  { label: "动态", href: "/journal" },
  { label: "联系", href: "/contact" }
];

const painPoints = [
  {
    id: "01",
    title: "人被展示得太早",
    body: "很多产品先让人包装资料、筛选别人，再慢慢解释自己真正想做什么。社交变成提前表演。"
  },
  {
    id: "02",
    title: "场景出现得太晚",
    body: "聊天可以持续，但现实里最关键的时间、地点、强度、人数和退出方式常常没人组织。"
  },
  {
    id: "03",
    title: "行动成本过高",
    body: "年轻人不一定缺少想法，缺的是把一句想法变成公开计划、可确认邀请和真实到场的中间层。"
  },
  {
    id: "04",
    title: "关系化语境过载",
    body: "夜跑、球馆、桌游、展览、城市漫游和周末短途不应该被默认塞进暧昧消费和关系货架。"
  }
];

const productPath = [
  ["真实需求", "先说想做什么，而不是先包装人设。"],
  ["场景上下文", "时间、地点、能量、人数和公共空间先被补齐。"],
  ["边界协议", "公开地点、退出方式、小组偏好和隐私限制先确认。"],
  ["Agent 计划", "社交 Agent 把需求整理成路线、集合点、节奏和邀请理由。"],
  ["真实到场", "计划和边界成立后，合适的人再出现。"],
  ["Social World", "一个个真实计划连接成城市生活网络。"]
] as const;

const currentWork = [
  {
    title: "我们正在解决的痛点",
    body: "现实社交不是缺一个更会聊天的界面，而是缺一个能把真实需求、公开场景、安全边界和行动计划组织起来的产品系统。"
  },
  {
    title: "我们现在的产品路径",
    body: "用社交 Agent 承担开场、整理、确认和边界说明，把一句模糊需求转成可发生、可拒绝、可回看的现实计划。"
  },
  {
    title: "我们不会做的方向",
    body: "不做头像货架，不做附近可刷列表，不做伴侣化承诺，不用假数据制造繁荣，不把 Agent 做成替代真人的陪聊人设。"
  }
];

const horizon = [
  ["1", "让更多年轻人把真实生活需求变成可发生的计划。"],
  ["2", "让本地场馆、品牌和活动空间连接到更精准、更有行动意图的用户。"],
  ["3", "让公开场景、边界确认和真实到场成为城市社交的默认基础设施。"]
] as const;

const refusalLines = [
  "不把人做成可以无限滑动的资料货架。",
  "不把普通生活需求默认推向约会语境。",
  "不制造没有场景、没有边界、没有退出方式的冷启动接触。",
  "不伪造规模、背书、增速或商业成果。",
  "不让 Agent 取代真人关系，只让它降低真实行动成本。"
] as const;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);

    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

function AboutMedia({
  src,
  alt,
  priority = false
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return <img className={styles.mediaAsset} src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" />;
}

export function AboutExperienceClient() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const select = gsap.utils.selector(root);
      const reveals = gsap.utils.toArray<HTMLElement>(select("[data-about-reveal]"));
      const beats = gsap.utils.toArray<HTMLElement>(select("[data-about-beat]"));
      const slices = gsap.utils.toArray<HTMLElement>(select("[data-about-slice]"));

      if (prefersReducedMotion) {
        gsap.set(reveals, { autoAlpha: 1, y: 0 });
        gsap.set(beats, { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(slices, { xPercent: 0, autoAlpha: 1 });
        gsap.set(select("[data-about-progress]"), { scaleX: 1 });
        return;
      }

      gsap.set(reveals, { autoAlpha: 0.72, y: 28 });
      gsap.set(beats, { autoAlpha: 0.32, y: 40, scale: 0.985 });
      gsap.set(slices, { xPercent: -8, autoAlpha: 0.42 });

      gsap.to(select("[data-about-progress]"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          id: "about-progress",
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5
        }
      });

      ScrollTrigger.batch(reveals, {
        start: "top 82%",
        end: "bottom 18%",
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true
          });
        },
        onLeaveBack: (batch) => {
          gsap.to(batch, {
            autoAlpha: 0.72,
            y: 14,
            duration: 0.32,
            ease: "power2.out",
            overwrite: true
          });
        }
      });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "about-path",
            trigger: select("[data-about-path]")[0],
            start: "top 76%",
            end: "bottom 20%",
            scrub: 1
          }
        })
        .to(beats, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          stagger: 0.08
        })
        .to(
          slices,
          {
            xPercent: 0,
            autoAlpha: 1,
            stagger: 0.06
          },
          "<0.12"
        );

      ScrollTrigger.refresh();
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true }
  );

  return (
    <div className={styles.surface} ref={rootRef} data-about-page>
      <div className={styles.progress} data-about-progress aria-hidden="true" />

      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="FitMeet Home">
          <img className={styles.logo} src="/fitmeet-icon.png" alt="" />
          <span>FitMeet</span>
        </Link>

        <nav className={styles.nav} aria-label="主导航">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === "/about" ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className={styles.headerCta} href="/contact#waitlist">
          加入早期体验
        </Link>
      </header>

      <main>
        <section className={styles.hero} aria-label="FitMeet 公司理念">
          <div className={styles.heroCopy} data-about-reveal>
            <p className={styles.kicker}>ABOUT FITMEET / SOCIAL WORLD COMPANY</p>
            <h1>
              <span>我们不从</span>
              <span>关系开始。</span>
              <span>我们从</span>
              <span>真实生活开始。</span>
            </h1>
            <p>
              FitMeet 正在用社交 Agent，把分散的生活需求变成可发生、可确认、可参与的现实计划。
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/product">
                看产品路径
              </Link>
              <Link className={styles.secondaryAction} href="/safety">
                看安全边界
              </Link>
            </div>
          </div>

          <aside className={styles.heroMedia} data-about-reveal>
            <AboutMedia
              src="/images/home-v5/vision-arrival-network-poster.jpg"
              alt="城市公共场景里的年轻人到场和连接"
              priority
            />
            <div className={styles.mediaBlade} data-about-slice aria-hidden="true" />
            <div className={styles.mediaCaption}>
              <span>Social World</span>
              <strong>一句想法，变成一次真实到场。</strong>
            </div>
          </aside>
        </section>

        <section className={styles.painSection} aria-labelledby="pain-title">
          <div className={styles.sectionHeader} data-about-reveal>
            <p className={styles.kicker}>INDUSTRY PAIN</p>
            <h2 id="pain-title">
              <span>社交行业的问题，</span>
              <span>不是缺少人。</span>
            </h2>
            <p>真正的问题是：人被展示得太早，场景出现得太晚。</p>
          </div>

          <div className={styles.painGrid}>
            {painPoints.map((item) => (
              <article className={styles.painCard} key={item.id} data-about-reveal>
                <span>{item.id}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.planSection} aria-labelledby="plan-title">
          <div className={styles.planCopy} data-about-reveal>
            <p className={styles.kicker}>CURRENT PLAN</p>
            <h2 id="plan-title">
              <span>我们用社交 Agent</span>
              <span>重新组织真实需求。</span>
            </h2>
            <p>
              它不是聊天机器人，而是现实计划的生成器。它承担开场、整理、确认和边界说明，降低年轻人从想法到行动的成本。
            </p>
          </div>

          <div className={styles.planList}>
            {currentWork.map((item) => (
              <article key={item.title} data-about-reveal>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.pathSection} data-about-path aria-labelledby="path-title">
          <div className={styles.pathIntro} data-about-reveal>
            <p className={styles.kicker}>PRODUCT BELIEF</p>
            <h2 id="path-title">
              <span>不是更多聊天，</span>
              <span>是更多真实计划。</span>
            </h2>
            <p>FitMeet 的顺序必须清楚：真实需求先站稳，场景和边界先成立，真人最后出现。</p>
          </div>

          <div className={styles.pathRail}>
            {productPath.map(([title, body], index) => (
              <article className={styles.pathBeat} key={title} data-about-beat>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.visionSection} aria-labelledby="vision-title">
          <div className={styles.visionMedia} data-about-reveal>
            <AboutMedia
              src="/images/home-v5/hero-night-run-social-world-poster.jpg"
              alt="夜色城市中年轻人从计划走向真实到场"
            />
            <div className={styles.mediaBlade} data-about-slice aria-hidden="true" />
          </div>

          <div className={styles.visionCopy} data-about-reveal>
            <p className={styles.kicker}>3-5 YEAR VISION</p>
            <h2 id="vision-title">
              <span>未来 3-5 年，</span>
              <span>让真实社交成为</span>
              <span>城市基础设施。</span>
            </h2>
            <p>
              我们希望帮助更多年轻人把真实生活需求变成可发生的计划，也帮助更多本地场馆、品牌和活动空间连接到更精准、更有行动意图的用户。
            </p>
          </div>
        </section>

        <section className={styles.horizonSection} aria-label="FitMeet 未来展望">
          {horizon.map(([id, body]) => (
            <article key={id} data-about-reveal>
              <span>{id}</span>
              <p>{body}</p>
            </article>
          ))}
        </section>

        <section className={styles.refusalSection} aria-labelledby="refusal-title">
          <div className={styles.sectionHeader} data-about-reveal>
            <p className={styles.kicker}>WHAT WE REFUSE</p>
            <h2 id="refusal-title">
              <span>有些增长，</span>
              <span>不值得拥有。</span>
            </h2>
            <p>企业级官网不应该靠假繁荣建立信任。FitMeet 的边界必须写在公司页面里。</p>
          </div>
          <div className={styles.refusalWall}>
            {refusalLines.map((line) => (
              <p key={line} data-about-reveal>{line}</p>
            ))}
          </div>
        </section>

        <section className={styles.finalSection} aria-labelledby="final-title">
          <p className={styles.kicker} data-about-reveal>FINAL AMBITION</p>
          <h2 id="final-title" data-about-reveal>
            <span>最终目标，</span>
            <span>是改变人和城市</span>
            <span>连接的方式。</span>
          </h2>
          <p data-about-reveal>
            如果每个年轻人在任何一座城市，都能找到一件可以一起做的事，社交就不再只是线上关系，而会重新成为城市生活的一部分。
          </p>
          <div className={styles.finalActions} data-about-reveal>
            <Link className={styles.primaryAction} href="/contact#waitlist">
              一起建设 Social World
            </Link>
            <Link className={styles.secondaryAction} href="/journal">
              查看动态
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
