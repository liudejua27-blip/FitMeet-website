"use client";

import Link from "next/link";
import { useState, type CSSProperties, type PointerEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contractFlow, contractLayers, contractRows, enforcementCards } from "./termsContent";
import styles from "./terms.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function TermsExperienceClient() {
  const [activeLayer, setActiveLayer] = useState<(typeof contractLayers)[number]>(contractLayers[0]);

  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set("[data-contract-reveal]", { autoAlpha: 0, y: 58 });
    gsap.to("[data-contract-reveal]", {
      autoAlpha: 1,
      y: 0,
      duration: reduceMotion ? 0.01 : 0.96,
      ease: "power3.out",
      stagger: reduceMotion ? 0 : 0.065,
    });

    if (!reduceMotion) {
      gsap.fromTo(
        "[data-contract-line]",
        { strokeDasharray: 1400, strokeDashoffset: 1400 },
        { strokeDashoffset: 0, duration: 3.2, ease: "power2.inOut", repeat: -1, repeatDelay: 1.3 },
      );

      gsap.fromTo(
        "[data-contract-row]",
        { autoAlpha: 0, y: 38 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.76,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: "[data-contract-list]", start: "top 76%" },
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
      onPointerMove={handlePointerMove}
      style={{ "--contract-accent": activeLayer.color } as CSSProperties}
    >
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.cursorGlow} aria-hidden="true" />
      <div className={styles.cityLayer} aria-hidden="true" />

      <header className={styles.header} data-contract-reveal>
        <Link href="/" className={styles.brand} aria-label="返回 FitMeet 首页">
          <img src="/fitmeet-icon.png" alt="FitMeet" />
          <span>FitMeet</span>
        </Link>
        <nav className={styles.nav} aria-label="条款页导航">
          <Link href="/safety">安全边界</Link>
          <Link href="/privacy">隐私</Link>
          <Link href="/faq">常见问题</Link>
          <Link href="/contact">联系</Link>
        </nav>
        <Link href="/contact" className={styles.headerCta}>
          联系
        </Link>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker} data-contract-reveal>真实社交契约</p>
        <h1 data-contract-reveal>
          <span>真实出现，</span>
          <span>也要清楚边界。</span>
        </h1>
        <p className={styles.heroText} data-contract-reveal>
          FitMeet 鼓励年轻人走进城市、运动、旅行和附近生活，但每一次连接都必须建立在真实身份、公开场景、明确计划和可退出权利之上。
        </p>
        <div className={styles.contractStage} data-contract-reveal aria-hidden="true">
          <svg viewBox="0 0 1280 420">
            <path d="M66 280 C192 92 332 318 506 142 S790 70 990 224 1142 330 1220 118" data-contract-line />
            <path d="M138 344 C310 280 450 382 642 312 S902 172 1134 282" className={styles.warningPath} />
            <circle cx="66" cy="280" r="8" />
            <circle cx="506" cy="142" r="8" />
            <circle cx="990" cy="224" r="8" />
            <circle className={styles.boundaryRing} cx="640" cy="216" r="96" />
            <circle className={styles.boundaryRing} cx="640" cy="216" r="148" />
          </svg>
          <div className={styles.stageLabels}>
            {contractFlow.map(([, zh]) => <span key={zh}>{zh}</span>)}
          </div>
        </div>
      </section>

      <section className={styles.promiseSection} aria-labelledby="promise-title">
        <div className={styles.sectionHead} data-contract-reveal>
          <span>五项承诺</span>
          <h2 id="promise-title">真正能见面的人，需要共同遵守同一套规则。</h2>
        </div>
        <div className={styles.promiseRows}>
          {contractLayers.map((layer, index) => (
            <button
              type="button"
              key={layer.id}
              className={layer.id === activeLayer.id ? styles.activeLayer : ""}
              onClick={() => setActiveLayer(layer)}
              style={{ "--layer-color": layer.color } as CSSProperties}
              data-contract-reveal
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{layer.zh}</strong>
              <em>{layer.headline}</em>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.activeSection} aria-labelledby="active-contract-layer">
        <p className={styles.kicker} data-contract-reveal>{activeLayer.zh}</p>
        <h2 id="active-contract-layer" data-contract-reveal>{activeLayer.headline}</h2>
        <p className={styles.activeBody} data-contract-reveal>{activeLayer.body}</p>
        <div className={styles.ruleLine} data-contract-reveal>
          {activeLayer.rules.map((rule) => <span key={rule}>{rule}</span>)}
        </div>
        <p className={styles.receipt} data-contract-reveal>{activeLayer.receipt}</p>
      </section>

      <section className={styles.contractSection} data-contract-list aria-labelledby="contract-list-title">
        <div className={styles.sectionHead} data-contract-reveal>
          <span>出现的规则</span>
          <h2 id="contract-list-title">从一句需求到一次见面，每一步都有边界。</h2>
        </div>
        <div className={styles.contractRows}>
          {contractRows.map((row) => (
            <article key={row.index} data-contract-row>
              <span>{row.index}</span>
              <strong>{row.zh}</strong>
              <p>{row.copy}</p>
              <em>{row.status}</em>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.enforcementSection}>
        <div className={styles.sectionHead} data-contract-reveal>
          <span>执行机制</span>
          <h2>规则必须能被执行，否则就只是漂亮文案。</h2>
        </div>
        <div className={styles.enforcementRows}>
          {enforcementCards.map((card, index) => (
            <article key={card.title} data-contract-reveal>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{card.zh}</strong>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
        <p className={styles.finalLine} data-contract-reveal>
          合作价值不能覆盖用户安全。商业目标永远不能先于人的边界。
        </p>
      </section>
    </section>
  );
}
