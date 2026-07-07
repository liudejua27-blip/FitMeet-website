"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./journal.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ChannelId = "all" | "product" | "city" | "lab" | "cooperation";

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

const channels: Array<{ id: ChannelId; label: string; line: string }> = [
  { id: "all", label: "全部", line: "完整内容轨道" },
  { id: "product", label: "产品进展", line: "需求如何变成计划" },
  { id: "city", label: "城市观察", line: "年轻人为什么难到场" },
  { id: "lab", label: "技术实验", line: "Agent 如何判断边界" },
  { id: "cooperation", label: "合作动态", line: "真实场景如何接入" }
];

const featuredTopics: Array<{
  id: string;
  channel: Exclude<ChannelId, "all">;
  label: string;
  title: string;
  summary: string;
  promise: string;
  terms: string[];
}> = [
  {
    id: "night-run",
    channel: "city",
    label: "城市观察",
    title: "今晚想跑步，但不想一个人。",
    summary:
      "年轻人不是没有兴趣，而是很难把一句生活想法变成一个低压力、可退出、能真实发生的计划。",
    promise: "从真实需求切入，不把社交写成资料浏览。",
    terms: ["夜跑", "运动搭子", "真实计划", "公开地点"]
  },
  {
    id: "people-later",
    channel: "product",
    label: "产品进展",
    title: "社交产品应该晚一点出现人。",
    summary:
      "FitMeet 先处理场景、时间、边界和计划，再让合适的人出现。人不是入口，真实计划才是入口。",
    promise: "解释 Social World 的产品顺序。",
    terms: ["社交 Agent", "计划生成", "边界确认", "同频匹配"]
  },
  {
    id: "tags-vs-plans",
    channel: "lab",
    label: "技术实验",
    title: "真实计划，比兴趣标签更重要。",
    summary:
      "兴趣标签只说明可能性，真实计划才说明行动意图。Agent 的任务不是贴标签，而是降低发起成本。",
    promise: "用清楚机制解释技术，不写空泛 AI 趋势。",
    terms: ["需求理解", "上下文判断", "计划收据", "安全边界"]
  },
  {
    id: "empty-venues",
    channel: "cooperation",
    label: "合作动态",
    title: "城市里的空场地，需要被重新连接。",
    summary:
      "场馆、品牌、活动空间和本地服务应该接入正在形成计划的人，而不是只等待流量路过。",
    promise: "只写可服务真实到场的合作，不写假案例。",
    terms: ["企业合作", "场景资产", "到场意图", "城市节点"]
  }
];

const issueFrames = [
  ["01", "一句需求", "不是资料填写。只需要说清今晚、周末、运动、球馆、桌游或城市漫游里的一个真实念头。"],
  ["02", "一个计划", "时间、地点、强度、人数、退出方式先被组织起来。计划先出现，人再出现。"],
  ["03", "一次到场", "公开场景和边界确认后，同频的人才进入现实。Social World 由这些小计划连接起来。"]
] as const;

const editorialRules = [
  ["不写公关稿", "每篇内容必须回答一个真实问题，不能只宣传 FitMeet 多好。"],
  ["不伪造研究数据", "没有来源的数据不出现，没有验证的成果不包装成增长故事。"],
  ["不做 AI 空话", "先讲年轻人的生活摩擦，再讲 Agent 如何降低发起成本。"],
  ["不写恋爱匹配语境", "FitMeet 讨论真实到场、公开场景、边界确认，不讨论关系筛选和附近浏览。"]
] as const;

const seoTopics = [
  "社交 Agent 如何理解一句真实需求",
  "为什么先生成计划，再出现真人",
  "年轻人为什么越来越难发起线下小事",
  "真实计划为什么比兴趣标签更重要",
  "品牌如何进入真实到场意图",
  "公开地点和退出机制为什么是社交产品的底层能力"
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

export function JournalExperienceClient() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [activeChannel, setActiveChannel] = useState<ChannelId>("all");
  const prefersReducedMotion = usePrefersReducedMotion();

  const visibleTopics = useMemo(() => {
    if (activeChannel === "all") {
      return featuredTopics;
    }

    return featuredTopics.filter((topic) => topic.channel === activeChannel);
  }, [activeChannel]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const select = gsap.utils.selector(root);
      const reveals = gsap.utils.toArray<HTMLElement>(select("[data-journal-reveal]"));
      const rails = gsap.utils.toArray<HTMLElement>(select("[data-journal-rail]"));
      const covers = gsap.utils.toArray<HTMLElement>(select("[data-journal-cover]"));

      if (prefersReducedMotion) {
        gsap.set(reveals, { autoAlpha: 1, y: 0 });
        gsap.set(rails, { xPercent: 0, autoAlpha: 1 });
        gsap.set(covers, { scale: 1 });
        gsap.set(select("[data-journal-progress]"), { scaleX: 1 });
        return;
      }

      gsap.set(reveals, { autoAlpha: 0.72, y: 30 });
      gsap.set(rails, { xPercent: -4, autoAlpha: 0.64 });
      gsap.set(covers, { scale: 1.04 });

      gsap.to(select("[data-journal-progress]"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          id: "journal-progress",
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5
        }
      });

      ScrollTrigger.batch(reveals, {
        start: "top 84%",
        end: "bottom 14%",
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.62,
            ease: "power3.out",
            stagger: 0.06,
            overwrite: true
          });
        },
        onLeaveBack: (batch) => {
          gsap.to(batch, {
            autoAlpha: 0.72,
            y: 16,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true
          });
        }
      });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "journal-editorial-rail",
            trigger: select("[data-journal-track]")[0],
            start: "top 72%",
            end: "bottom 22%",
            scrub: 1
          }
        })
        .to(rails, { xPercent: 0, autoAlpha: 1, stagger: 0.08 })
        .to(covers, { scale: 1, stagger: 0.08 }, "<");

      ScrollTrigger.refresh();
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true }
  );

  return (
    <div className={styles.surface} ref={rootRef} data-journal-page>
      <div className={styles.progress} data-journal-progress aria-hidden="true" />

      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="FitMeet Home">
          <img className={styles.logo} src="/fitmeet-icon.png" alt="" />
          <span>FitMeet</span>
        </Link>

        <nav className={styles.nav} aria-label="主导航">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} aria-current={item.href === "/journal" ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className={styles.headerCta} href="/contact#enterprise">
          合作入口
        </Link>
      </header>

      <main>
        <section className={styles.hero} aria-label="FitMeet Journal">
          <div className={styles.heroCopy} data-journal-reveal>
            <p className={styles.kicker}>JOURNAL / SOCIAL WORLD RECORD</p>
            <h1>
              <span>我们正在记录</span>
              <span>Social World</span>
              <span>如何发生。</span>
            </h1>
            <p>
              我们正在记录 Social World 如何发生。这里是 FitMeet 的产品进展、城市社交观察、技术实验和合作动态。我们记录问题、计划和真实到场，不写空泛公关稿。
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#feed">
                阅读产品进展
              </a>
              <Link className={styles.secondaryAction} href="/contact#enterprise">
                联系合作
              </Link>
            </div>
          </div>

          <aside className={styles.heroMedia} data-journal-reveal>
            <img
              className={styles.heroImage}
              src="/images/home-v5/vision-arrival-network-poster.jpg"
              alt="城市夜色中的真实计划网络"
              loading="eager"
              data-journal-cover
            />
            <div className={styles.heroCaption}>
              <span>EDITORIAL SIGNAL</span>
              <strong>从真实问题开始，而不是从流量叙事开始。</strong>
            </div>
          </aside>
        </section>

        <section id="feed" className={styles.feedSection} aria-labelledby="feed-title" data-journal-track>
          <div className={styles.sectionHeader} data-journal-reveal>
            <p className={styles.kicker}>CONTENT CHANNELS</p>
            <h2 id="feed-title">
              <span>四条内容轨道，</span>
              <span>解释一个真实世界。</span>
            </h2>
            <p>内容不是装饰。它要让搜索用户、媒体、合作伙伴和早期用户理解 FitMeet 为什么从真实计划开始。</p>
          </div>

          <div className={styles.channelBar} data-journal-reveal role="tablist" aria-label="Journal 内容栏目">
            {channels.map((channel) => (
              <button
                key={channel.id}
                className={styles.channelButton}
                type="button"
                role="tab"
                aria-selected={activeChannel === channel.id}
                onClick={() => setActiveChannel(channel.id)}
              >
                <span>{channel.label}</span>
                <em>{channel.line}</em>
              </button>
            ))}
          </div>

          <div className={styles.topicStack} aria-live="polite">
            {visibleTopics.map((topic, index) => (
              <article className={styles.topicLine} id={`topic-${topic.id}`} key={topic.id} data-journal-rail>
                <span className={styles.topicIndex}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.topicLabel}>{topic.label}</span>
                <div className={styles.topicText}>
                  <h3>{topic.title}</h3>
                  <p>{topic.summary}</p>
                  <strong>{topic.promise}</strong>
                </div>
                <div className={styles.topicTerms} aria-label={`${topic.title} SEO 关键词`}>
                  {topic.terms.map((term) => (
                    <span key={term}>{term}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.issueSection} aria-labelledby="issue-title">
          <div className={styles.issueMedia} data-journal-reveal>
            <img
              className={styles.issueImage}
              src="/images/home-v5/scene-citywalk-case-poster.jpg"
              alt="年轻人在城市街区低压力同行"
              loading="lazy"
              data-journal-cover
            />
          </div>

          <div className={styles.issueCopy} data-journal-reveal>
            <p className={styles.kicker}>CURRENT QUESTION</p>
            <h2 id="issue-title">
              <span>一篇内容，</span>
              <span>必须推动一次理解。</span>
            </h2>
            <p>
              Journal 的每个议题都要把 `一句想法，变成一次真实到场` 讲得更具体：需求从哪里来、计划如何成形、边界为什么先出现。
            </p>
          </div>

          <div className={styles.issueGrid}>
            {issueFrames.map(([id, title, body]) => (
              <article key={id} data-journal-reveal>
                <span>{id}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.seoSection} aria-labelledby="seo-title">
          <div className={styles.sectionHeader} data-journal-reveal>
            <p className={styles.kicker}>SEO / LONG TAIL</p>
            <h2 id="seo-title">
              <span>长期增长，</span>
              <span>来自真实问题。</span>
            </h2>
            <p>FitMeet 的 SEO 不靠伪造规模，不靠蹭概念，而是持续解释年轻人现实社交里的具体摩擦。</p>
          </div>

          <div className={styles.seoRail}>
            {seoTopics.map((topic, index) => (
              <article key={topic} data-journal-reveal>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{topic}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.rulesSection} aria-labelledby="rules-title">
          <div className={styles.rulesCopy} data-journal-reveal>
            <p className={styles.kicker}>EDITORIAL RULES</p>
            <h2 id="rules-title">
              <span>内容可以锋利，</span>
              <span>但必须可信。</span>
            </h2>
          </div>

          <div className={styles.rulesGrid}>
            {editorialRules.map(([title, body], index) => (
              <article key={title} data-journal-reveal>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.finalSection} aria-labelledby="journal-final-title">
          <p className={styles.kicker} data-journal-reveal>BUILD THE RECORD</p>
          <h2 id="journal-final-title" data-journal-reveal>
            <span>让 Social World</span>
            <span>被持续看见。</span>
          </h2>
          <p data-journal-reveal>
            产品进展、城市观察、技术实验和合作动态会一起证明一件事：社交不是筛选，是现实里发生。
          </p>
          <div className={styles.finalActions} data-journal-reveal>
            <Link className={styles.primaryAction} href="/product">
              查看产品机制
            </Link>
            <Link className={styles.secondaryAction} href="/contact#enterprise">
              联系合作
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
