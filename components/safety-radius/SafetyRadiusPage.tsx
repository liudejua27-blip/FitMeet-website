"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { SiteNavigation } from "@/components/site-shell/SiteNavigation";
import { SiteFooter } from "@/components/site-shell/SiteFooter";
import { trustLayers, trustStateCopy, type TrustLayer } from "@/lib/safety-radius-content";
import { useSafetyRadiusMotion } from "./useSafetyRadiusMotion";
import styles from "./safety-radius.module.css";

function TrustRadiusField({ activeIndex = 0, interactive = true }: { activeIndex?: number; interactive?: boolean }) {
  return (
    <div className={styles.radiusField} data-radius-field aria-label={interactive ? "信任层级导航" : undefined}>
      {trustLayers.map((layer, index) => {
        const content = (
          <>
            <span className={styles.radiusCircle} data-radius-circle aria-hidden="true" />
            <span className={styles.radiusNode} data-radius-node aria-hidden="true"><i /></span>
            <span className={styles.radiusLabel} data-radius-label>
              <strong>{layer.label}</strong>
              <small>00:0{index + 1}</small>
            </span>
          </>
        );

        if (!interactive) {
          return <div className={activeIndex === index ? styles.radiusActive : ""} data-radius-index={index} key={layer.id}>{content}</div>;
        }

        return (
          <a
            className={activeIndex === index ? styles.radiusActive : ""}
            href={`#trust-${layer.id}`}
            data-trust-jump={index}
            aria-current={activeIndex === index ? "step" : undefined}
            key={layer.id}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}

function SafetyHero({ activeIndex }: { activeIndex: number }) {
  return (
    <section className={styles.heroTrack} id="top" data-safety-hero>
      <div className={styles.heroStage} data-safety-hero-stage>
        <div className={styles.heroMedia} data-safety-hero-media>
          <Image
            src="/images/safety-radius/safety-public-plaza-hero-desktop.jpg"
            fill
            priority
            loading="eager"
            sizes="100vw"
            alt="青年从不同方向进入开放城市公共广场"
          />
        </div>

        <div className={styles.heroCopy} data-safety-hero-copy>
          <h1><span>边界</span><span>先于</span><span>见面</span></h1>
          <h2>每一步<br />都由你确认</h2>
          <p>时间、地点、参与者和活动内容需要透明；<br />拒绝、退出、屏蔽和举报也需要有清楚的下一步</p>
          <a href="#trust-identity" data-magnetic><i aria-hidden="true" />看见信任如何建立</a>
        </div>

        <TrustRadiusField activeIndex={activeIndex} />

        <div className={styles.identityPreview} data-identity-preview>
          <div><span>01 /</span><strong>身份真实</strong></div>
          <div className={styles.previewCoordinate} aria-hidden="true"><i /><i /><i /></div>
        </div>
      </div>
    </section>
  );
}

function LayerCopy({ layer }: { layer: TrustLayer }) {
  return (
    <div className={styles.layerCopy} data-layer-copy>
      <div className={styles.layerMeta}>
        <span>{layer.index}</span><i aria-hidden="true" /><span>{layer.label}</span>
      </div>
      <h2>{layer.title[0]}<br />{layer.title[1]}</h2>
      <p>{layer.body[0]}<br />{layer.body[1]}</p>
      <span className={layer.state === "principle" ? styles.principleState : styles.buildingState}>
        <i aria-hidden="true" />{trustStateCopy[layer.state]}
      </span>
    </div>
  );
}

function TrustJourney({ activeIndex }: { activeIndex: number }) {
  return (
    <section className={styles.journeyTrack} id="trust-journey" data-trust-journey>
      <div className={styles.journeyStage} data-trust-journey-stage>
        {trustLayers.map((layer, index) => (
          <article
            className={styles.trustScene}
            data-trust-scene
            data-scene-index={index}
            id={`trust-${layer.id}`}
            aria-hidden={activeIndex !== index}
            inert={activeIndex !== index ? true : undefined}
            key={layer.id}
          >
            <div className={styles.sceneMedia} data-scene-media>
              <Image
                src={layer.asset}
                fill
                unoptimized
                loading={index < 2 ? "eager" : "lazy"}
                sizes="100vw"
                alt={layer.alt}
                style={{ objectPosition: layer.focalPoint }}
              />
            </div>
            <div className={styles.sceneVeil} />
            <div className={styles.sceneRadius} data-scene-radius aria-hidden="true"><i /><i /></div>
            <LayerCopy layer={layer} />
            <span className={styles.sceneIndex} aria-hidden="true">{layer.index}</span>
          </article>
        ))}

        <aside className={styles.journeyNavigation} aria-label="信任层级进度">
          <span>信任半径</span>
          <div>
            {trustLayers.map((layer, index) => (
              <a
                className={activeIndex === index ? styles.journeyActive : ""}
                href={`#trust-${layer.id}`}
                data-trust-jump={index}
                aria-current={activeIndex === index ? "step" : undefined}
                aria-label={`${layer.index} ${layer.label}`}
                key={layer.id}
              ><i /></a>
            ))}
          </div>
          <strong>{trustLayers[activeIndex]?.index ?? "01"} / 05</strong>
        </aside>
        <a className={styles.skipJourney} href="#data-purpose">跳过信任层级</a>
      </div>
    </section>
  );
}

function DataPurpose() {
  return (
    <section className={styles.dataPurpose} id="data-purpose" data-data-purpose>
      <div className={styles.dataRadii} aria-hidden="true">
        {trustLayers.map((layer, index) => <i data-data-ring key={layer.id} style={{ "--data-ring": index } as CSSProperties} />)}
        <span data-data-core><Image src="/brand/fitmeet-logo-v2.png" width={50} height={50} alt="" /></span>
      </div>
      <div className={styles.dataCopy} data-data-copy>
        <span>每一份数据都有明确用途</span>
        <h2>最少必要<br />用途明确<br />用户可控</h2>
        <p>具体的数据收集、保存和删除规则<br />以正式隐私政策为准</p>
        <Link href="/privacy">阅读隐私政策 <FiArrowUpRight aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

function GuidelinesHandoff() {
  return (
    <footer className={styles.guidelinesHandoff} id="guidelines">
      <div className={styles.handoffMedia}>
        <Image src="/images/safety-radius/safety-public-plaza-hero-desktop.jpg" fill unoptimized sizes="100vw" alt="开放城市公共广场" />
      </div>
      <div className={styles.handoffVeil} />
      <div className={styles.handoffRadii} aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className={styles.handoffCopy}>
        <span>信任需要共同实践</span>
        <h2>把安全边界说清<br />才能安心靠近</h2>
        <div>
          <Link href="/community-guidelines" data-magnetic>阅读社区准则 <FiArrowUpRight aria-hidden="true" /></Link>
          <Link href="/support" data-magnetic>获得支持</Link>
        </div>
      </div>
    </footer>
  );
}

export function SafetyRadiusPage() {
  const mainRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  useSafetyRadiusMotion(mainRef, setActiveIndex);

  return (
    <main className={styles.page} ref={mainRef}>
      <SiteNavigation active="safety" />
      <SafetyHero activeIndex={activeIndex} />
      <TrustJourney activeIndex={activeIndex} />
      <DataPurpose />
      <GuidelinesHandoff />
      <SiteFooter />
    </main>
  );
}
