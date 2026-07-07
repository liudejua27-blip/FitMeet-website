"use client";

import Link from "next/link";
import { useState, type CSSProperties, type PointerEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { commitments, dataLayers, dataMap, partnerReceipts } from "./privacyContent";
import styles from "./privacy.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function PrivacyExperienceClient() {
  const [activeLayer, setActiveLayer] = useState<(typeof dataLayers)[number]>(dataLayers[0]);

  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set("[data-privacy-reveal]", { autoAlpha: 0, y: 58 });
    gsap.to("[data-privacy-reveal]", {
      autoAlpha: 1,
      y: 0,
      duration: reduceMotion ? 0.01 : 0.96,
      ease: "power3.out",
      stagger: reduceMotion ? 0 : 0.065,
    });

    if (!reduceMotion) {
      gsap.fromTo(
        "[data-privacy-path]",
        { strokeDasharray: 1400, strokeDashoffset: 1400 },
        { strokeDashoffset: 0, duration: 3, ease: "power2.inOut", repeat: -1, repeatDelay: 1.4 },
      );

      gsap.fromTo(
        "[data-boundary-row]",
        { autoAlpha: 0, y: 38 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.76,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: "[data-boundary-list]", start: "top 76%" },
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
      style={{ "--privacy-accent": activeLayer.color } as CSSProperties}
    >
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.cursorGlow} aria-hidden="true" />
      <div className={styles.cityLayer} aria-hidden="true" />

      <header className={styles.header} data-privacy-reveal>
        <Link href="/" className={styles.brand} aria-label="返回 FitMeet 首页">
          <img src="/fitmeet-icon.png" alt="FitMeet" />
          <span>FitMeet</span>
        </Link>
        <nav className={styles.nav} aria-label="隐私页导航">
          <Link href="/safety">安全边界</Link>
          <Link href="/faq">常见问题</Link>
          <Link href="/partners">合作</Link>
          <Link href="/contact">联系</Link>
        </nav>
        <Link href="/contact" className={styles.headerCta}>
          隐私联系
        </Link>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker} data-privacy-reveal>隐私边界说明</p>
        <h1 data-privacy-reveal>
          <span>你可以说出真实需求，</span>
          <span>但不必交出全部自己。</span>
        </h1>
        <p className={styles.heroText} data-privacy-reveal>
          FitMeet 只应该收集把一次需求变成安全计划所需的信息。城市、时间、活动偏好和边界，用来帮助你找到合适场景，而不是把你变成可出售的数据标签。
        </p>
        <div className={styles.pathStage} data-privacy-reveal aria-hidden="true">
          <svg viewBox="0 0 1280 420">
            <path d="M66 300 C190 86 336 302 500 154 S804 60 990 238 1144 326 1220 120" data-privacy-path />
            <path d="M138 358 C302 286 456 380 640 314 S894 182 1134 282" className={styles.blockedPath} />
            <circle cx="66" cy="300" r="8" />
            <circle cx="500" cy="154" r="8" />
            <circle cx="990" cy="238" r="8" />
            <circle className={styles.boundaryRing} cx="638" cy="218" r="96" />
            <circle className={styles.boundaryRing} cx="638" cy="218" r="148" />
          </svg>
          <div className={styles.pathLabels}>
            <span>少收集</span>
            <span>先说明</span>
            <span>边界优先</span>
            <span>可退出删除</span>
          </div>
        </div>
      </section>

      <section className={styles.commitmentsSection}>
        {commitments.map(([title, copy], index) => (
          <p key={title} data-privacy-reveal>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{title}</strong>
            <em>{copy}</em>
          </p>
        ))}
      </section>

      <section className={styles.boundarySection} data-boundary-list aria-labelledby="privacy-boundary-title">
        <div className={styles.sectionHead} data-privacy-reveal>
          <span>数据如何移动</span>
          <h2 id="privacy-boundary-title">每一类信息，都必须知道为什么存在。</h2>
        </div>
        <div className={styles.layerRows}>
          {dataLayers.map((layer, index) => (
            <button
              type="button"
              key={layer.id}
              className={layer.id === activeLayer.id ? styles.activeLayer : ""}
              onClick={() => setActiveLayer(layer)}
              style={{ "--layer-color": layer.color } as CSSProperties}
              data-boundary-row
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{layer.zh}</strong>
              <em>{layer.purpose}</em>
              <i>{layer.signal}</i>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.activeSection} aria-labelledby="active-privacy-layer">
        <p className={styles.kicker} data-privacy-reveal>{activeLayer.zh}</p>
        <h2 id="active-privacy-layer" data-privacy-reveal>{activeLayer.purpose}</h2>
        <div className={styles.activeRows} data-privacy-reveal>
          <div>
            <b>我们收集</b>
            <p>{activeLayer.collect.join("、")}</p>
          </div>
          <div>
            <b>你可控制</b>
            <p>{activeLayer.userControl.join("、")}</p>
          </div>
          <div>
            <b>不会共享</b>
            <p>{activeLayer.notShared.join("、")}</p>
          </div>
          <div>
            <b>合作方只能看到</b>
            <p>{activeLayer.partnerView}</p>
          </div>
        </div>
      </section>

      <section className={styles.mapSection}>
        <div className={styles.sectionHead} data-privacy-reveal>
          <span>隐私路径</span>
          <h2>数据只应该沿着真实计划需要的路径移动。</h2>
        </div>
        <div className={styles.mapRows}>
          {dataMap.map((row) => (
            <article key={row.stage} data-privacy-reveal>
              <span>{row.stage}</span>
              <strong>{row.title}</strong>
              <p>{row.body}</p>
              <em>{row.boundary}</em>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.partnerSection}>
        <div className={styles.sectionHead} data-privacy-reveal>
          <span>合作方边界</span>
          <h2>商业价值来自真实需求，不来自出售个人隐私。</h2>
        </div>
        <div className={styles.partnerRows}>
          {partnerReceipts.map((receipt, index) => (
            <article key={receipt.before} data-privacy-reveal>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{receipt.before}</p>
              <strong>{receipt.safe}</strong>
              <em>{receipt.blocked}</em>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
