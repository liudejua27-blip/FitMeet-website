"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, type CSSProperties } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { SiteFooter } from "@/components/site-shell/SiteFooter";
import { SiteNavigation } from "@/components/site-shell/SiteNavigation";
import { worldModules, type WorldModule, type WorldModuleId } from "@/lib/world-atlas-content";
import WorldSocialCompass, { type WorldCompassController } from "./WorldSocialCompass";
import { useWorldAtlasMotion } from "./useWorldAtlasMotion";
import styles from "./world-atlas.module.css";

function WorldStory({ module, index }: { module: WorldModule; index: number }) {
  return (
    <section
      className={styles.story}
      id={`world-${module.id}`}
      data-world-story
      data-world-story-id={module.id}
      data-layout={index % 2 === 0 ? "copy-left" : "copy-right"}
      style={{ "--module-accent": module.accent } as CSSProperties}
    >
      {index === 0 ? (
        <div className={styles.storyPrelude} data-story-prelude aria-hidden="true">
          <Image
            src={module.images[1].src}
            fill
            sizes="100vw"
            alt=""
            style={{ objectPosition: module.images[1].objectPosition }}
          />
          <i />
        </div>
      ) : null}

      <div className={styles.storyGhost} data-story-ghost aria-hidden="true">{module.index}</div>

      <div className={styles.storyTrack} aria-hidden="true">
        <span>{module.index}</span>
        <i><b data-story-route /></i>
        <small>04</small>
      </div>

      <div className={styles.storyCopy} data-story-copy>
        <div className={styles.storyMeta}>
          <span>{module.index} / 04</span>
          <strong>{module.name}</strong>
        </div>
        <h2>{module.title.map((line) => <span key={line}>{line}</span>)}</h2>
        <p>{module.body}</p>
        <ul aria-label={`${module.name}包含的场景`}>
          {module.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
        {module.boundary ? <div className={styles.storyBoundary}>{module.boundary}</div> : null}
      </div>

      <div className={styles.storyVisual} data-story-visual>
        <div className={styles.storySignal} data-story-signal aria-hidden="true">
          <span>{module.index}</span>
          <i />
        </div>
        <figure className={styles.storyPrimary}>
          <Image
            src={module.images[0].src}
            fill
            sizes="64vw"
            alt={module.images[0].alt}
            style={{ objectPosition: module.images[0].objectPosition }}
          />
        </figure>
        <figure className={styles.storySecondary} data-story-secondary>
          <Image
            src={module.images[1].src}
            fill
            sizes="25vw"
            alt={module.images[1].alt}
            style={{ objectPosition: module.images[1].objectPosition }}
          />
        </figure>
      </div>
    </section>
  );
}

function WorldPrinciple() {
  return (
    <section className={styles.principle} data-world-principle>
      <div className={styles.principleMeta}>05 — 关系仍由你决定</div>
      <h2>
        <span>关系仍由你决定</span>
        <span>FitMeet 只帮你把需求</span>
        <span>条件和边界提前说清</span>
      </h2>
      <div className={styles.principleLinks}>
        <Link href="/about">了解 FitMeet <FiArrowUpRight aria-hidden="true" /></Link>
        <Link href="/safety">了解安全边界 <FiArrowUpRight aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

export function WorldAtlasPage() {
  const pageRef = useRef<HTMLElement>(null);
  const compassRef = useRef<WorldCompassController>(null);
  useWorldAtlasMotion(pageRef, compassRef);

  const handleModuleSelect = useCallback((id: WorldModuleId) => {
    window.dispatchEvent(new CustomEvent<WorldModuleId>("world:compass-focus", { detail: id }));
  }, []);

  return (
    <main className={styles.page} ref={pageRef}>
      <SiteNavigation active="world" tone="dark" context="Social World" />
      <WorldSocialCompass ref={compassRef} onModuleSelect={handleModuleSelect} />
      <div className={styles.storyCollection}>
        {worldModules.map((module, index) => (
          <WorldStory module={module} index={index} key={module.id} />
        ))}
      </div>
      <WorldPrinciple />
      <SiteFooter />
    </main>
  );
}
