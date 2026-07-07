"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ActivityOrbit } from "./ActivityOrbit";
import { CinematicImage } from "./CinematicImage";
import { MouseFieldProvider } from "./MouseFieldProvider";
import { SafetyShell } from "./SafetyShell";
import { SignalLineCanvas } from "./SignalLineCanvas";
import { SignalPrism } from "./SignalPrism";
import { businessValues, heroImage, needSignals, parsingLayers, signalImages } from "./enterpriseAssets";
import styles from "./signal-prism-homepage.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const navItems = [
  { label: "产品", href: "/product" },
  { label: "场景", href: "/scenes" },
  { label: "社区", href: "/community" },
  { label: "安全", href: "/safety" },
  { label: "合作", href: "/contact" }
];

const heroProofs = [
  { label: "需求", value: "今晚想夜跑", note: "先从真实生活开始" },
  { label: "边界", value: "公开路线 / 2-4 人", note: "小福先确认安全范围" },
  { label: "到场", value: "同频计划成立", note: "人最后自然出现" }
];

export function SignalPrismHomepage() {
  const pageRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const root = pageRef.current;
      if (!root || reduceMotion) return;

      gsap.set(root.querySelectorAll("[data-reveal]"), { autoAlpha: 0, y: 34 });
      gsap.to(root.querySelectorAll("[data-reveal]"), {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: root.querySelector("[data-hero]"),
          start: "top 72%",
          toggleActions: "play none none reverse"
        }
      });

      root.querySelectorAll<HTMLElement>("[data-signal-section]").forEach((section, index) => {
        const items = section.querySelectorAll("[data-section-reveal]");
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 56, rotateX: 8 },
          {
            autoAlpha: 1,
            y: 0,
            rotateX: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              toggleActions: "play none none reverse",
              refreshPriority: index + 1
            }
          }
        );
      });

      gsap.to(root, {
        "--scroll-signal": 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8
        }
      });

      gsap.to(root.querySelector("[data-orbit]"), {
        xPercent: -9,
        ease: "none",
        scrollTrigger: {
          trigger: root.querySelector("[data-orbit-section]"),
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });
    },
    { scope: pageRef }
  );

  return (
    <MouseFieldProvider>
      <div className={styles.page} ref={pageRef}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/" aria-label="FitMeet 首页，F 品牌标志">
            <img src="/fitmeet-icon.png" alt="" />
            <span>FitMeet</span>
          </Link>
          <nav className={styles.nav} aria-label="主导航">
            {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          </nav>
          <Link className={styles.headerCta} href="/contact#enterprise">企业合作</Link>
        </header>

        <main>
          <section className={styles.hero} data-hero aria-labelledby="signal-prism-title">
            <div className={styles.heroImage} aria-hidden="true">
              <img src={heroImage.src} alt="" loading="eager" decoding="async" />
            </div>
            <div className={styles.heroGrid} aria-hidden="true" />
            <div className={styles.heroScenePanel} data-reveal aria-hidden="true">
              <img src={heroImage.src} alt="" loading="eager" decoding="async" />
              <div className={styles.heroSceneCaption}>
                <span>今晚 20:00 / 公开夜跑路线</span>
                <strong>想跑，但不想一个人。</strong>
              </div>
            </div>
            <div className={styles.heroPrism} data-reveal>
              <SignalPrism />
            </div>
            <div className={styles.heroCopy}>
              <p data-reveal className={styles.systemLine}>Interactive Social Signal System</p>
              <h1 id="signal-prism-title" data-reveal>Social World</h1>
              <p data-reveal className={styles.heroLead}>社交不是筛选，是现实里发生。一句真实需求，经过小福理解，变成城市里的同频计划。</p>
              <div data-reveal className={styles.heroActions}>
                <Link href="/contact#waitlist">开始一次真实计划</Link>
                <Link href="/product">了解小福 Agent</Link>
              </div>
              <div data-reveal className={styles.heroSignalStrip} aria-label="FitMeet 首屏计划证明">
                {heroProofs.map((item) => (
                  <article key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <p>{item.note}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className={styles.heroTicker} aria-label="FitMeet 信号流程">
              {['需求醒来', '小福解析', '边界确认', '城市点亮', '同频出现', '真实到场'].map((item) => <span key={item}>{item}</span>)}
            </div>
          </section>

          <section className={styles.needSection} data-signal-section>
            <div className={styles.sectionCopy} data-section-reveal>
              <span className={styles.sectionIndex}>01 / Demand</span>
              <h2>先说你想做什么。</h2>
              <p>FitMeet 不从头像开始。用户先说出真实需求，小福把这句话吸收成可以被理解的同频信号。</p>
            </div>
            <div className={styles.needBoard} data-section-reveal>
              <CinematicImage image={signalImages.coffee} />
              <div className={styles.needList}>
                {needSignals.map((need) => <button type="button" key={need}>{need}</button>)}
              </div>
            </div>
          </section>

          <section className={styles.parseSection} data-signal-section>
            <div className={styles.parseMedia} data-section-reveal>
              <CinematicImage image={signalImages.badminton} />
              <SignalPrism mode="parse" />
            </div>
            <div className={styles.sectionCopy} data-section-reveal>
              <span className={styles.sectionIndex}>02 / Xiaofu Parsing</span>
              <h2>小福把想法拆成可以发生的计划。</h2>
              <p>它不是陪聊机器人。它解析时间、地点、兴趣和安全边界，让一次真实活动先成立。</p>
              <div className={styles.parseGrid}>
                {parsingLayers.map((layer) => (
                  <article key={layer.label}>
                    <span>{layer.label}</span>
                    <strong>{layer.value}</strong>
                    <p>{layer.note}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.mapSection} data-signal-section>
            <div className={styles.mapImage} data-section-reveal>
              <CinematicImage image={signalImages.travelPhoto} />
              <SignalLineCanvas />
            </div>
            <div className={styles.sectionCopy} data-section-reveal>
              <span className={styles.sectionIndex}>03 / City Signal</span>
              <h2>城市里的同频信号开始亮起。</h2>
              <p>FitMeet 连接公开场景和真实计划，不展示个人精确位置，也不把人做成资料货架。</p>
            </div>
          </section>

          <section className={styles.activitySection} data-signal-section data-orbit-section>
            <div className={styles.activityIntro} data-section-reveal>
              <span className={styles.sectionIndex}>04 / Activity Orbit</span>
              <h2>活动世界展开。</h2>
              <p>夜跑、健身、露营、桌游、宠物、Cos、游戏开黑、旅游摄影，都不是标签，而是可以被组织起来的生活计划。</p>
            </div>
            <ActivityOrbit />
          </section>

          <section className={styles.safetySection} data-signal-section>
            <div className={styles.sectionCopy} data-section-reveal>
              <span className={styles.sectionIndex}>05 / Safety Shell</span>
              <h2>先确认边界，再靠近彼此。</h2>
              <p>小福在连接前加入模糊定位、公共场所、站内沟通、发布前确认、小组优先和可退出机制。</p>
            </div>
            <div data-section-reveal>
              <SafetyShell />
            </div>
          </section>

          <section className={styles.businessSection} data-signal-section>
            <div className={styles.businessVisual} data-section-reveal>
              <CinematicImage image={signalImages.court} />
            </div>
            <div className={styles.sectionCopy} data-section-reveal>
              <span className={styles.sectionIndex}>06 / Business Signal</span>
              <h2>真实需求，比曝光更接近成交。</h2>
              <p>场馆、商家和品牌不再只买曝光，而是接住正在形成计划的年轻用户。</p>
              <div className={styles.businessGrid}>
                {businessValues.map((item) => (
                  <article key={item.label}>
                    <strong>{item.label}</strong>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
              <Link className={styles.inlineCta} href="mailto:15253005312@163.com?subject=FitMeet%20企业合作">15253005312@163.com</Link>
            </div>
          </section>

          <section className={styles.finalSection} data-signal-section>
            <SignalPrism mode="final" />
            <div className={styles.finalCopy} data-section-reveal>
              <p>FitMeet Signal Prism</p>
              <h2>真实计划。真实的人。就在附近。</h2>
              <div className={styles.heroActions}>
                <Link href="/contact#waitlist">开始一次真实计划</Link>
                <Link href="/contact#enterprise">联系企业合作</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </MouseFieldProvider>
  );
}
