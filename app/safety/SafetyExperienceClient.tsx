"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./safety.module.css";

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

const safetyProtocols = [
  {
    id: "01",
    title: "公开地点优先",
    body: "第一次计划优先发生在公开路线、球馆、咖啡店、校园、展览或可见集合点。",
    proof: "地点先清楚，人再出现。"
  },
  {
    id: "02",
    title: "边界先确认",
    body: "人数、小组/一对一偏好、时间盒、活动强度、退出方式先成为计划条件。",
    proof: "没有边界，不开放邀请。"
  },
  {
    id: "03",
    title: "可退出机制",
    body: "每个计划都有结束点、退出方式和低压力离开路径，不强迫续场。",
    proof: "能离开，才敢开始。"
  },
  {
    id: "04",
    title: "举报和屏蔽",
    body: "举报、屏蔽和反馈不藏在 footer，必须跟安全收据和活动上下文绑定。",
    proof: "治理要离现场足够近。"
  },
  {
    id: "05",
    title: "隐私保护",
    body: "住址、住宿、私人联系方式和敏感位置不进入首次计划，不向企业合作侧共享敏感个人信息。",
    proof: "公开的是计划，不是隐私。"
  },
  {
    id: "06",
    title: "未成年人边界",
    body: "未成年人入口必须单独评估；未成年人不进入默认开放社交流。",
    proof: "默认保护，而不是默认开放。"
  }
];

const gateSteps = [
  ["需求", "先说想做什么：夜跑、球馆、桌游、城市漫游或周末短途。"],
  ["公开场景", "Agent 先找到可见地点、公开路线或可信场馆。"],
  ["边界", "人数、时间盒、退出方式和隐私限制先确认。"],
  ["确认", "用户接受场景和边界后，计划才进入邀请阶段。"],
  ["邀请", "邀请带着计划理由出现，不是冷启动接近。"],
  ["安全收据", "计划、边界、确认和治理入口都可回看。"]
];

const receiptRows = [
  ["真实需求", "今晚 20:30 想轻松夜跑，不想一个人。"],
  ["公开地点", "滨河公开跑道，起点和终点可见。"],
  ["人数偏好", "小组优先，2 到 4 人。"],
  ["退出机制", "跑后可直接离开，不默认续场。"],
  ["隐私边界", "不共享住址、精确住处、私人联系方式。"],
  ["确认后邀请", "双方确认计划和边界后再开放联系。"],
  ["治理入口", "安全收据保留举报、屏蔽和反馈。"]
];

const trustEdges = [
  {
    title: "对个人",
    body: "让用户在进入真实社交之前知道在哪里、和几个人、做什么、怎么退出。"
  },
  {
    title: "对企业",
    body: "企业合作侧看到的是授权后的需求方向和场景价值，不是个人敏感信息。"
  },
  {
    title: "对城市",
    body: "公共空间成为更安全的社交入口，而不是被算法变成私密压力。"
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

function SafetyMedia({
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

export function SafetyExperienceClient() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const select = gsap.utils.selector(root);
      const reveals = gsap.utils.toArray<HTMLElement>(select("[data-safety-reveal]"));
      const rules = gsap.utils.toArray<HTMLElement>(select("[data-safety-rule]"));
      const lines = gsap.utils.toArray<HTMLElement>(select("[data-safety-line]"));

      if (prefersReducedMotion) {
        gsap.set(reveals, { autoAlpha: 1, y: 0 });
        gsap.set(rules, { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(lines, { "--line-scale": 1 });
        gsap.set(select("[data-safety-progress]"), { scaleX: 1 });
        return;
      }

      gsap.set(reveals, { autoAlpha: 0, y: 38 });
      gsap.set(rules, { autoAlpha: 0.36, y: 34, scale: 0.98 });
      gsap.set(lines, { "--line-scale": 0 });

      gsap.to(select("[data-safety-progress]"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          id: "safety-progress",
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
            duration: 0.68,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true
          });
        },
        onLeaveBack: (batch) => {
          gsap.to(batch, {
            autoAlpha: 0.42,
            y: 20,
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
            id: "safety-protocol",
            trigger: select("[data-safety-protocol]")[0],
            start: "top 74%",
            end: "bottom 22%",
            scrub: 1
          }
        })
        .to(rules, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          stagger: 0.08
        })
        .to(
          lines,
          {
            "--line-scale": 1,
            stagger: 0.08
          },
          "<0.18"
        );

      ScrollTrigger.refresh();
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true }
  );

  return (
    <div className={styles.surface} ref={rootRef} data-safety-page>
      <div className={styles.progress} data-safety-progress aria-hidden="true" />

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
              aria-current={item.href === "/safety" ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className={styles.headerCta} href="/privacy">
          查看隐私规则
        </Link>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="safety-title">
          <div className={styles.heroCopy} data-safety-reveal>
            <p className={styles.kicker}>TRUST & SAFETY / BOUNDARY FIRST</p>
            <h1 id="safety-title">
              <span>先确认边界，</span>
              <span>再靠近彼此。</span>
            </h1>
            <p>
              FitMeet 把公开地点、小组偏好、时间盒、退出方式、隐私边界、举报与屏蔽、未成年人边界和确认后邀请放在第一次连接之前。
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/contact#waitlist">
                在边界内开始
              </Link>
              <Link className={styles.secondaryAction} href="/privacy">
                查看隐私规则
              </Link>
            </div>
          </div>

          <div className={styles.heroMedia} data-safety-reveal>
            <SafetyMedia
              src="/images/home-v5/scene-public-plan-plaza-poster.jpg"
              alt="公开城市广场里的低压力社交计划"
              priority
            />
            <div className={styles.mediaBlade} aria-hidden="true" />
            <div className={styles.mediaCaption}>
              <span>PUBLIC PLACE FIRST</span>
              <strong>公开的是计划，不是隐私</strong>
            </div>
          </div>
        </section>

        <section className={styles.protocolSection} data-safety-protocol aria-labelledby="protocol-title">
          <div className={styles.sectionHeader} data-safety-reveal>
            <p className={styles.kicker}>SAFETY PROTOCOL</p>
            <h2 id="protocol-title">
              <span>安全不是免责声明。</span>
              <span>安全是产品顺序。</span>
            </h2>
          </div>

          <div className={styles.protocolGrid}>
            {safetyProtocols.map((item) => (
              <article className={styles.protocolCard} key={item.id} data-safety-rule>
                <i data-safety-line aria-hidden="true" />
                <span>{item.id}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <strong>{item.proof}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.gateSection} aria-labelledby="gate-title">
          <div className={styles.gateMedia} data-safety-reveal>
            <SafetyMedia
              src="/images/home-v5/scene-citywalk-case-poster.jpg"
              alt="城市街角公开路线里的低压力同行"
            />
          </div>

          <div className={styles.gateCopy} data-safety-reveal>
            <p className={styles.kicker}>CONFIRMATION GATE</p>
            <h2 id="gate-title">
              <span>邀请之前，</span>
              <span>计划必须先过闸。</span>
            </h2>
            <p>
              人不是突然出现。FitMeet 先确认场景、边界、时间、人数和退出方式，再让邀请带着明确理由发生。
            </p>
          </div>

          <div className={styles.gateSteps}>
            {gateSteps.map(([title, body], index) => (
              <article key={title} data-safety-reveal>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.receiptSection} aria-labelledby="receipt-title">
          <div className={styles.receiptCopy} data-safety-reveal>
            <p className={styles.kicker}>SAFETY RECEIPT</p>
            <h2 id="receipt-title">
              <span>边界可回看，</span>
              <span>连接才可信。</span>
            </h2>
            <p>
              一次真实计划应该留下清楚的安全上下文：为什么连接、在哪里连接、如何退出、怎么举报、哪些隐私不进入计划。
            </p>
          </div>

          <article className={styles.receiptCard} data-safety-reveal aria-label="FitMeet 安全收据样例">
            <div className={styles.receiptTopline}>
              <span>FITMEET SAFETY RECEIPT</span>
              <strong>BOUNDARY CONFIRMED</strong>
            </div>
            <h3>夜跑计划 / 公开路线</h3>
            <dl>
              {receiptRows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </section>

        <section className={styles.minorSection} aria-labelledby="minor-title">
          <div data-safety-reveal>
            <p className={styles.kicker}>MINORS BOUNDARY</p>
            <h2 id="minor-title">
              <span>未成年人边界，</span>
              <span>必须单独处理。</span>
            </h2>
          </div>
          <p data-safety-reveal>
            未成年人不进入默认开放社交流。涉及未成年人时，产品必须采用单独入口、额外审核、监护与合规策略，而不是把他们放进普通社交计划里。
          </p>
        </section>

        <section className={styles.trustSection} aria-labelledby="trust-title">
          <div className={styles.sectionHeader} data-safety-reveal>
            <p className={styles.kicker}>TRUST EDGES</p>
            <h2 id="trust-title">
              <span>信任不是口号。</span>
              <span>信任是每一类参与者知道边界。</span>
            </h2>
          </div>

          <div className={styles.trustGrid}>
            {trustEdges.map((edge) => (
              <article key={edge.title} data-safety-reveal>
                <h3>{edge.title}</h3>
                <p>{edge.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="safety-cta-title">
          <p className={styles.kicker}>START CLEAR</p>
          <h2 id="safety-cta-title">
            <span>不是更快见面。</span>
            <span>是更安全地开始。</span>
          </h2>
          <div className={styles.finalActions}>
            <Link className={styles.primaryAction} href="/contact#waitlist">
              提交真实需求
            </Link>
            <Link className={styles.secondaryAction} href="/product">
              理解产品机制
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
