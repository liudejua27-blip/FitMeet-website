"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./community.module.css";

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

const loopSteps = [
  {
    id: "01",
    title: "需求",
    line: "有人想夜跑、打球、城市漫游，或者周末短途。",
    proof: "不是先找人，是先说一件真实的事。"
  },
  {
    id: "02",
    title: "计划",
    line: "Agent 把时间、公开地点、人数、强度和边界整理清楚。",
    proof: "计划先成立，连接才进入。"
  },
  {
    id: "03",
    title: "到场",
    line: "合适的人因为同一件事出现，在公开场景里低压力见面。",
    proof: "真实城市成为社交入口。"
  },
  {
    id: "04",
    title: "复访",
    line: "一条路线、一个球馆、一家桌游空间，开始形成可复访节点。",
    proof: "社区不是拉群，是生活会回来。"
  }
];

const cityNodes = [
  {
    name: "夜跑路线",
    context: "公开路线 / 配速清楚 / 跑后可退出",
    role: "把运动从独自坚持，变成低压力一起出发。"
  },
  {
    name: "球馆",
    context: "固定时段 / 强度偏好 / 人数明确",
    role: "把场地空档，变成可加入的真实计划。"
  },
  {
    name: "桌游空间",
    context: "公开空间 / 小组优先 / 轻社交",
    role: "把尬聊替换成一件自然进行的事。"
  },
  {
    name: "城市漫游",
    context: "街区路线 / 咖啡停靠 / 可提前离开",
    role: "让刚到一座城市的人，有第一个生活入口。"
  },
  {
    name: "展览与街区",
    context: "兴趣明确 / 公开动线 / 节奏放慢",
    role: "把同频从标签，变成一起走过的路线。"
  },
  {
    name: "短途目的地",
    context: "时间窗 / 预算边界 / 到达方式",
    role: "让周末计划从想法变成可确认行动。"
  }
];

const sceneStrips = [
  {
    title: "夜跑",
    copy: "一条公开路线，让运动成为可加入的城市节点。",
    src: "/images/home-v5/scene-night-run-poster.jpg",
    alt: "雨后城市夜跑公开路线"
  },
  {
    title: "球馆",
    copy: "一个真实场地，让同频从计划里出现。",
    src: "/images/home-v5/scene-court-dispatch-poster.jpg",
    alt: "年轻人在球馆形成低压力运动计划"
  },
  {
    title: "城市漫游",
    copy: "一条街区路线，让新城市有第一个入口。",
    src: "/images/home-v5/scene-citywalk-case-poster.jpg",
    alt: "年轻人在城市街角低压力同行"
  }
];

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

function CommunityMedia({
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

export function CommunityExperienceClient() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const select = gsap.utils.selector(root);
      const reveals = gsap.utils.toArray<HTMLElement>(select("[data-community-reveal]"));
      const nodes = gsap.utils.toArray<HTMLElement>(select("[data-community-node]"));
      const paths = gsap.utils.toArray<HTMLElement>(select("[data-community-path]"));

      if (prefersReducedMotion) {
        gsap.set(reveals, { autoAlpha: 1, y: 0 });
        gsap.set(nodes, { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(paths, { "--path-scale": 1 });
        gsap.set(select("[data-community-progress]"), { scaleX: 1 });
        return;
      }

      gsap.set(reveals, { autoAlpha: 0, y: 42 });
      gsap.set(nodes, { autoAlpha: 0.42, y: 34, scale: 0.96 });
      gsap.set(paths, { "--path-scale": 0 });

      gsap.to(select("[data-community-progress]"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          id: "community-progress",
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.45
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
            autoAlpha: 0.34,
            y: 22,
            duration: 0.36,
            ease: "power2.out",
            overwrite: true
          });
        }
      });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "community-network",
            trigger: select("[data-community-network]")[0],
            start: "top 72%",
            end: "bottom 22%",
            scrub: 1
          }
        })
        .to(nodes, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          stagger: 0.1
        })
        .to(
          paths,
          {
            "--path-scale": 1,
            stagger: 0.08
          },
          "<0.15"
        );

      gsap.to(select("[data-community-rail]"), {
        xPercent: -18,
        ease: "none",
        scrollTrigger: {
          id: "community-rail",
          trigger: select("[data-community-rail-wrap]")[0],
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });

      ScrollTrigger.refresh();
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true }
  );

  return (
    <div className={styles.surface} ref={rootRef} data-community-page>
      <div className={styles.progress} data-community-progress aria-hidden="true" />

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
              aria-current={item.href === "/community" ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className={styles.headerCta} href="/contact#enterprise">
          成为城市节点
        </Link>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="community-title">
          <div className={styles.heroMedia} data-community-reveal>
            <CommunityMedia
              src="/images/home-v5/vision-arrival-network-poster.jpg"
              alt="城市里的真实计划连接成 Social World"
              priority
            />
            <div className={styles.heroBlade} aria-hidden="true" />
          </div>

          <div className={styles.heroCopy} data-community-reveal>
            <p className={styles.kicker}>COMMUNITY / SOCIAL WORLD</p>
            <h1 id="community-title">
              <span>城市里的计划，</span>
              <span>正在连成</span>
              <span>Social World。</span>
            </h1>
            <p>
              FitMeet 希望把运动空间、路线、活动场地、咖啡店、桌游空间、展览和短途目的地，组织成可参与的城市生活网络。只连接公开场景和计划节点，个人位置不被公开。
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/contact#waitlist">
                进入 Social World
              </Link>
              <Link className={styles.secondaryAction} href="/contact#enterprise">
                成为城市节点
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.marqueeSection} data-community-rail-wrap aria-label="社区节点关键词">
          <div className={styles.marqueeRail} data-community-rail>
            {["夜跑路线", "球馆", "桌游空间", "咖啡街区", "展览", "城市漫游", "周末短途", "公开地点", "边界确认", "可复访计划"].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </section>

        <section className={styles.loopSection} aria-labelledby="loop-title">
          <div className={styles.sectionHeader} data-community-reveal>
            <p className={styles.kicker}>COMMUNITY LOOP</p>
            <h2 id="loop-title">
              <span>社区不是关系池。</span>
              <span>社区是一件件真实计划反复发生。</span>
            </h2>
          </div>

          <div className={styles.loopGrid}>
            {loopSteps.map((step) => (
              <article className={styles.loopCard} key={step.id} data-community-reveal>
                <span>{step.id}</span>
                <h3>{step.title}</h3>
                <p>{step.line}</p>
                <strong>{step.proof}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.networkSection} data-community-network aria-labelledby="network-title">
          <div className={styles.networkIntro} data-community-reveal>
            <p className={styles.kicker}>CITY NODES</p>
            <h2 id="network-title">
              <span>城市不是地图。</span>
              <span>城市是可以加入的生活节点。</span>
            </h2>
            <p>
              Social World 不展示个人位置，不制造抽象大屏。它只把公开场景、真实计划和可复访节点连接起来。
            </p>
          </div>

          <div className={styles.nodeGrid}>
            {cityNodes.map((node, index) => (
              <article className={styles.nodeCard} key={node.name} data-community-node>
                <i data-community-path aria-hidden="true" />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{node.name}</h3>
                <p>{node.context}</p>
                <strong>{node.role}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.scenesSection} aria-labelledby="scenes-title">
          <div className={styles.sectionHeader} data-community-reveal>
            <p className={styles.kicker}>REAL PLACES</p>
            <h2 id="scenes-title">
              <span>不是线上热闹。</span>
              <span>是现实里有地方可以去。</span>
            </h2>
          </div>

          <div className={styles.sceneGrid}>
            {sceneStrips.map((scene) => (
              <article className={styles.sceneCard} key={scene.title}>
                <CommunityMedia src={scene.src} alt={scene.alt} />
                <div>
                  <h3>{scene.title}</h3>
                  <p>{scene.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.trustBand} aria-labelledby="trust-title">
          <div data-community-reveal>
            <p className={styles.kicker}>TRUSTED CITY LAYER</p>
            <h2 id="trust-title">
              <span>公开场景先行，</span>
              <span>个人位置不被公开。</span>
            </h2>
          </div>
          <p data-community-reveal>
            社区叙事不能以暴露个人位置为代价。FitMeet 的城市层只表达公开计划、授权意图和场景节点；企业合作看到的是需求方向，不是个人隐私。
          </p>
        </section>

        <section className={styles.blueprint} aria-labelledby="blueprint-title">
          <div className={styles.blueprintCopy} data-community-reveal>
            <p className={styles.kicker}>3-5 YEAR BLUEPRINT</p>
            <h2 id="blueprint-title">
              <span>让真实社交成为</span>
              <span>城市基础设施。</span>
            </h2>
          </div>

          <div className={styles.blueprintPanel} data-community-reveal>
            <p>
              未来 3-5 年，FitMeet 希望让每座城市里的运动、街区、场馆、校园和目的地，都能承接年轻人的真实生活需求。
            </p>
            <p>
              最终目标不是让人停留在屏幕里，而是改变人和城市连接的方式。
            </p>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="community-cta-title">
          <p className={styles.kicker}>START A CITY</p>
          <h2 id="community-cta-title">
            <span>让一座城市，</span>
            <span>从一个真实计划开始连接。</span>
          </h2>
          <div className={styles.finalActions}>
            <Link className={styles.primaryAction} href="/contact#waitlist">
              提交真实需求
            </Link>
            <Link className={styles.secondaryAction} href="/contact#enterprise">
              联系企业合作
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
