"use client";

import Link from "next/link";
import styles from "./product.module.css";

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

const pipelineSteps = [
  {
    id: "01",
    title: "需求理解",
    eyebrow: "一句真实想法",
    body: "先识别你想做什么、什么时候做、希望多轻松、有没有明确地点。",
    proof: "今晚想轻松夜跑，不想一个人。"
  },
  {
    id: "02",
    title: "上下文判断",
    eyebrow: "现实条件先过一遍",
    body: "把天气、时段、公开地点、活动强度和到达难度放进同一个判断里。",
    proof: "雨后路面、20:30、滨河公开跑道。"
  },
  {
    id: "03",
    title: "边界协议",
    eyebrow: "靠近之前先确认",
    body: "人数上限、公开场景、可退出方式、邀请前确认，先成为计划规则。",
    proof: "2 到 4 人，跑后可直接离开。"
  },
  {
    id: "04",
    title: "计划生成",
    eyebrow: "从想法变成行动",
    body: "Agent 输出路线、集合点、时间窗、强度和需要确认的下一步。",
    proof: "20:30 集合，轻松 5 公里，公开起点。"
  },
  {
    id: "05",
    title: "同频匹配",
    eyebrow: "因为同一件事出现",
    body: "匹配依据是同一计划、同一强度、同一时间窗，而不是先看资料。",
    proof: "同路线、同配速、同样想低压力到场。"
  },
  {
    id: "06",
    title: "计划收据",
    eyebrow: "每次连接都可回看",
    body: "把需求、场景、边界和确认状态留下，减少误会和临场压力。",
    proof: "一张清楚的到场上下文。"
  }
];

const boundaryRules = [
  "公开地点优先",
  "确认后再邀请",
  "人数范围清楚",
  "随时可以退出",
  "不公开敏感位置",
  "未成年人边界独立处理"
];

const receiptRows = [
  ["需求", "今晚 20:30 想轻松夜跑"],
  ["场景", "滨河公开跑道"],
  ["强度", "轻松 5 公里"],
  ["人数", "2 到 4 人"],
  ["边界", "跑后可直接离开"],
  ["同频理由", "同一时间、同一强度、同一公开路线"],
  ["下一步", "确认后公开计划"]
];

const systemPrinciples = [
  {
    title: "先计划，后出现人",
    body: "FitMeet 不把人当成货架。先把一件真实生活里的事安排清楚，再让合适的人进入。"
  },
  {
    title: "先边界，后靠近",
    body: "社交不是越快越好。公开地点、人数、退出方式和确认动作，先成为产品顺序。"
  },
  {
    title: "先到场，后关系",
    body: "关系不是屏幕里制造出来的。FitMeet 让年轻人先拥有一件可以一起做的事。"
  }
];

function ProductMedia({
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

export function ProductExperienceClient() {
  return (
    <div className={styles.surface} data-product-page>
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
              aria-current={item.href === "/product" ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className={styles.headerCta} href="/contact#enterprise">
          企业合作
        </Link>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="product-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>PRODUCT SYSTEM / SOCIAL AGENT</p>
            <h1 id="product-title" aria-label="一句想法，变成一张可执行的计划。">
              <span>一句想法</span>
              <span>变成一张</span>
              <span>可执行计划</span>
            </h1>
            <p className={styles.heroLead}>
              FitMeet 的社交 Agent 不陪聊，不做资料货架。它把活动、时间、地点、强度、人数和边界整理成一张真实计划，让到场先成立。
            </p>

            <div className={styles.heroActions} aria-label="产品页主要操作">
              <Link className={styles.primaryAction} href="/contact#waitlist">
                提交一个真实需求
              </Link>
              <Link className={styles.secondaryAction} href="/safety">
                查看安全边界
              </Link>
            </div>
          </div>

          <div className={styles.heroMedia} aria-label="公开场景计划影像">
            <ProductMedia
              src="/images/home-v5/scene-public-plan-plaza-poster.jpg"
              alt="年轻人在公开城市广场形成线下计划"
            />
            <div className={styles.mediaBlade} aria-hidden="true" />
            <div className={styles.mediaCaption}>
              <span>Plan first</span>
              <strong>再让同频的人出现</strong>
            </div>
          </div>
        </section>

        <section className={styles.statement} aria-labelledby="system-statement">
          <p className={styles.kicker}>WHY IT EXISTS</p>
          <h2 id="system-statement">
            <span>社交不是先挑人。</span>
            <span>社交是先有一件</span>
            <span>现实里能发生的事。</span>
          </h2>
          <p>
            当前很多产品让年轻人不断做选择，却很少帮他们把一件生活里的事安排好。FitMeet 把社交的起点从“看资料”改成“生成计划”。
          </p>
        </section>

        <section className={styles.pipelineSection} aria-labelledby="pipeline-title">
          <div className={styles.sectionHeader}>
            <p className={styles.kicker}>AGENT PIPELINE</p>
            <h2 id="pipeline-title">
              <span>从需求到到场，</span>
              <span>Agent 降低现实社交的启动成本。</span>
            </h2>
          </div>

          <div className={styles.pipeline}>
            {pipelineSteps.map((step) => (
              <article className={styles.stepCard} key={step.id}>
                <div className={styles.stepIndex}>{step.id}</div>
                <p>{step.eyebrow}</p>
                <h3>{step.title}</h3>
                <span>{step.body}</span>
                <strong>{step.proof}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.boundarySection} aria-labelledby="boundary-title">
          <div className={styles.boundaryMedia}>
            <ProductMedia
              src="/images/home-v5/scene-night-run-poster.jpg"
              alt="雨后城市夜跑公开路线"
            />
          </div>

          <div className={styles.boundaryCopy}>
            <p className={styles.kicker}>BOUNDARY PROTOCOL</p>
            <h2 id="boundary-title">
              <span>边界不是补丁。</span>
              <span>边界是产品顺序。</span>
            </h2>
            <p>
              FitMeet 先把公开场景、人数、退出方式和确认动作写进计划，再进入连接。这样社交更轻，也更可信。
            </p>

            <div className={styles.ruleGrid}>
              {boundaryRules.map((rule) => (
                <span key={rule}>{rule}</span>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.receiptSection} aria-labelledby="receipt-title">
          <div className={styles.receiptCopy}>
            <p className={styles.kicker}>PLAN RECEIPT</p>
            <h2 id="receipt-title">
              <span>每一次连接，</span>
              <span>都应该有清楚的上下文。</span>
            </h2>
            <p>
              计划收据让用户知道这次到场因为什么发生、在哪里发生、如何退出、下一步是什么。它是 FitMeet 产品可信度的核心证据。
            </p>
          </div>

          <article className={styles.receiptCard} aria-label="FitMeet 计划收据样例">
            <div className={styles.receiptTopline}>
              <span>FITMEET PLAN RECEIPT</span>
              <strong>WAITING CONFIRM</strong>
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

        <section className={styles.principles} aria-labelledby="principles-title">
          <div className={styles.sectionHeader}>
            <p className={styles.kicker}>PRODUCT PRINCIPLES</p>
            <h2 id="principles-title">
              <span>FitMeet 让社交更简单，</span>
              <span>不是因为更快，而是因为顺序更对。</span>
            </h2>
          </div>

          <div className={styles.principleGrid}>
            {systemPrinciples.map((principle) => (
              <article key={principle.title}>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="product-cta-title">
          <p className={styles.kicker}>MAKE IT REAL</p>
          <h2 id="product-cta-title">
            <span>把一个想法交给 Agent。</span>
            <span>让它变成一次可以到场的计划。</span>
          </h2>
          <div className={styles.finalActions}>
            <Link className={styles.primaryAction} href="/contact#waitlist">
              加入测试
            </Link>
            <Link className={styles.secondaryAction} href="/scenes">
              看真实场景
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
