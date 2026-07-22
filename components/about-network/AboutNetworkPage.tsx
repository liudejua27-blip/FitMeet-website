"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";
import { SiteNavigation } from "@/components/site-shell/SiteNavigation";
import { SiteFooter } from "@/components/site-shell/SiteFooter";
import { aboutBeliefs, aboutHorizon } from "@/lib/about-network-content";
import { useAboutNetworkMotion } from "./useAboutNetworkMotion";
import styles from "./about-network.module.css";

function NetworkPath({ id, className }: { id: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1000 560" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="40" y1="520" x2="960" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22e7dc" />
          <stop offset=".52" stopColor="#75a7ff" />
          <stop offset="1" stopColor="#ee61c0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path data-network-path d="M18 536C188 510 250 440 335 333C425 218 492 301 566 202C638 105 748 181 982 28" stroke={`url(#${id})`} strokeWidth="2" />
      {["18,536", "335,333", "566,202", "982,28"].map((point) => {
        const [cx, cy] = point.split(",");
        return <g data-network-node key={point}><circle cx={cx} cy={cy} r="8" fill="#f4f1ec" stroke={`url(#${id})`} strokeWidth="2" /><circle cx={cx} cy={cy} r="2.6" fill="#fff" filter={`url(#${id}-glow)`} /></g>;
      })}
    </svg>
  );
}

function OriginHero() {
  return (
    <section className={styles.originTrack} id="top" data-about-origin>
      <div className={styles.originStage}>
        <div className={styles.originCopy} data-origin-copy>
          <h1>关于<br />FitMeet</h1>
          <h2>我们不替你社交<br />只让开始更容易</h2>
          <p>FitMeet 帮你把时间、地点、人数和边界说清楚<br />邀请谁、是否见面仍由你决定</p>
          <a href="#origin-question" data-magnetic>从一个问题开始 <FiArrowDown aria-hidden="true" /></a>
        </div>
        <div className={styles.originMedia} data-origin-media>
          <Image src="/images/about-network/about-origin-city-hero-desktop.jpg" fill priority loading="eager" unoptimized sizes="68vw" alt="一位青年站在城市公共空间远望即将出发的地方" />
        </div>
        <NetworkPath id="origin-spectrum" className={styles.originPath} />
        <div className={styles.coordinate} data-origin-coordinate><i /><span>北纬 31.2304°<br />东经 121.4737°</span></div>
        <div className={styles.nextChapter}><span>01 /</span><strong>相遇之前的距离</strong></div>
      </div>
    </section>
  );
}

function ProblemLandscape() {
  return (
    <section className={styles.problem} id="origin-question" data-about-problem>
      <div className={styles.problemLead} data-problem-copy>
        <span>01 / 相遇之前的距离</span>
        <h2>复杂的不是需求</h2>
        <p>复杂的是找到合适的人<br />说清楚条件并建立最基本的信任</p>
      </div>
      <div className={styles.problemScenes} data-problem-scenes>
        <figure><div className={styles.emptyCourt}><Image src="/images/about-network/about-problem-empty-court-desktop.jpg" fill unoptimized loading="lazy" sizes="34vw" alt="亮着灯却没有球员的羽毛球场" /><i /><i /><i /></div><figcaption><i />一个球局没人响应</figcaption></figure>
        <figure><div className={styles.soloRoute}><Image src="/images/about-network/about-problem-solo-route-desktop.jpg" fill unoptimized loading="lazy" sizes="28vw" alt="一位青年独自乘火车出发" /><div><span>出发</span><b /><span>抵达</span></div></div><figcaption><i />一个人出发心里没底</figcaption></figure>
        <figure><div className={styles.unmadePlan}><Image src="/images/about-network/about-problem-unmade-plan-desktop.jpg" fill unoptimized loading="lazy" sizes="34vw" alt="约定地点留下的球拍和外套" /><div><span>周末 · 城市之外</span><strong>计划未成行</strong><i /></div></div><figcaption><i />一个计划最终没能成行</figcaption></figure>
      </div>
      <NetworkPath id="problem-spectrum" className={styles.problemPath} />
    </section>
  );
}

function BeliefRail() {
  return (
    <section className={styles.beliefTrack} id="beliefs" data-belief-track>
      <div className={styles.beliefStage}>
        <div className={styles.beliefRail} data-belief-rail>
          {aboutBeliefs.map((belief) => (
            <article className={styles.belief} key={belief.id}>
              <div className={styles.beliefCopy}>
                <span>{belief.index} /</span>
                <h2>{belief.heading.map((line) => <span key={line}>{line}</span>)}</h2>
                <p>{belief.copy}</p>
              </div>
              <div className={styles.beliefMedia}>
                <Image src={belief.asset} fill unoptimized loading="lazy" sizes="34vw" alt={belief.alt} />
              </div>
              <i className={styles.beliefNode} data-belief-node aria-hidden="true" />
            </article>
          ))}
        </div>
        <div className={styles.beliefLine} aria-hidden="true"><i /><i /><i /></div>
        <div className={styles.railHint}><span>纵向滚动</span><i /><span>探索我们的信念</span></div>
      </div>
    </section>
  );
}

function Horizon() {
  return (
    <section className={styles.horizonTrack} id="horizon" data-horizon-track>
      <div className={styles.horizonStage}>
        <div className={styles.horizonHeading} data-horizon-heading>
          <span>从一个连接点开始</span>
          <h2>从一句想法<br />走向一次共同完成</h2>
        </div>
        <div className={styles.horizonLine} aria-hidden="true"><i /></div>
        <div className={styles.horizonSteps}>
          {aboutHorizon.map((stage, index) => (
            <article data-horizon-step key={stage.id}>
              <i aria-hidden="true" />
              <span>0{index + 1}</span>
              <h3>{stage.label}</h3>
              <p>{stage.copy}</p>
            </article>
          ))}
        </div>
        <div className={styles.horizonImages} aria-hidden="true">
          {aboutBeliefs.map((belief) => <Image src={belief.asset} fill unoptimized loading="lazy" sizes="60vw" alt="" key={belief.id} />)}
        </div>
        <NetworkPath id="horizon-spectrum" className={styles.horizonPath} />
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className={styles.manifesto} id="manifesto" data-manifesto>
      <div className={styles.manifestoCopy} data-manifesto-copy>
        <p>技术把见面前的条件整理清楚<br />相处这件事仍然留给每一个人</p>
        <p>我们从一场球、一次同行开始<br />认真做好每一次可以发生的连接</p>
      </div>
      <div className={styles.manifestoWord} data-manifesto-word>FitMeet</div>
      <div className={styles.manifestoMedia} data-manifesto-media>
        <Image src="/images/about-network/about-manifesto-camp-desktop.jpg" fill unoptimized loading="eager" sizes="100vw" alt="年轻人在户外共同完成露营晚餐" />
      </div>
      <NetworkPath id="manifesto-spectrum" className={styles.manifestoPath} />
      <div className={styles.manifestoMark}><span>FitMeet</span><strong>先说清计划再决定是否见面</strong></div>
    </section>
  );
}

function AboutHandoff() {
  return (
    <footer className={styles.handoff}>
      <span>联系与合作</span>
      <h2>如果你也在认真做真实的事<br />我们愿意听听你的想法</h2>
      <div>
        <Link href="/contact" data-magnetic>联系 FitMeet <FiArrowUpRight aria-hidden="true" /></Link>
        <Link href="/contact" data-magnetic>了解合作方式</Link>
      </div>
    </footer>
  );
}

function CompanyProof() {
  return (
    <section className={styles.companyProof} aria-label="FitMeet 企业信息">
      <header><span>公司 / 当前状态</span><h2>只公开已经确认的事</h2><p>FitMeet 当前专注于苹果端应用与企业宣传官网公司主体、团队规模与办公地点将在确认可公开后补充不用虚构信息制造成熟感</p></header>
      <div>
        <article><span>现在</span><strong>辅助型社交助手</strong><p>帮助整理需求、条件与计划不替用户邀请、承诺或建立关系</p></article>
        <article><span>合作</span><strong>真实场景合作</strong><p>面向运动空间、旅行户外、青年品牌、媒体与安全研究交流</p></article>
        <article><span>联系</span><strong>从清楚的信息开始</strong><p>商务、媒体、安全与隐私联系统一进入联系与合作页面</p><Link href="/contact">联系 FitMeet <FiArrowUpRight aria-hidden="true" /></Link></article>
      </div>
    </section>
  );
}

function ProductPrinciples() {
  const principles = [
    ["01", "具体", "每份计划都要说清时间、地点、人数和活动内容"],
    ["02", "可修改", "建议不是命令；时间、地点、预算与边界随时可以调整"],
    ["03", "需确认", "社交助手不替用户邀请、承诺或决定是否见面"],
    ["04", "有边界", "公共地点、随时退出和支持入口必须在关键步骤可见"],
  ] as const;
  return (
    <section className={styles.principles} id="principles">
      <header><span>产品原则</span><h2>每一句相信<br />都要变成产品行为</h2></header>
      <div>{principles.map(([index, title, body]) => <article key={index}><span>{index}</span><strong>{title}</strong><p>{body}</p></article>)}</div>
    </section>
  );
}

export function AboutNetworkPage() {
  const mainRef = useRef<HTMLElement>(null);
  useAboutNetworkMotion(mainRef);

  return (
    <main className={styles.page} ref={mainRef}>
      <SiteNavigation context="关于" />
      <OriginHero />
      <ProblemLandscape />
      <BeliefRail />
      <Horizon />
      <ProductPrinciples />
      <Manifesto />
      <CompanyProof />
      <AboutHandoff />
      <SiteFooter />
    </main>
  );
}
