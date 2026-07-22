"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";
import { SiteNavigation } from "@/components/site-shell/SiteNavigation";
import { SiteFooter } from "@/components/site-shell/SiteFooter";
import { cultureFilm, momentFilms, type MomentFilm } from "@/lib/moments-film-content";
import { useMomentsFilmMotion } from "./useMomentsFilmMotion";
import styles from "./moments-film.module.css";

const railFrames = [
  { asset: cultureFilm.asset, alt: cultureFilm.alt, id: "culture" },
  momentFilms[1],
  momentFilms[0],
  momentFilms[3],
  momentFilms[2],
];

function FilmMarks() {
  return <span className={styles.filmMarks} aria-hidden="true"><i /><i /><i /><i /></span>;
}

function FilmRail() {
  return (
    <div className={styles.railViewport} data-rail-viewport>
      <div className={styles.filmRail} data-film-rail>
        {railFrames.map((frame, index) => (
          <figure className={index === 2 ? styles.heroFrame : ""} data-film-frame data-hero-film={index === 2 ? "true" : undefined} key={frame.id}>
            <Image
              src={frame.asset}
              fill
              priority={index >= 1 && index <= 3}
              loading={index >= 1 && index <= 3 ? "eager" : "lazy"}
              unoptimized
              sizes={index === 2 ? "44vw" : "28vw"}
              alt={frame.alt}
            />
            <FilmMarks />
            <figcaption><span>0{index + 1}</span><strong>{index === 2 ? "下班之后" : "故事档案"}</strong></figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className={styles.heroTrack} id="top" data-moments-hero>
      <div className={styles.heroStage} data-moments-hero-stage>
        <div className={styles.heroCopy} data-moments-hero-copy>
          <h1>有些见面<br />从一句“要不要”开始</h1>
        </div>
        <div className={styles.giantTitle} data-giant-moments>见面片段</div>
        <FilmRail />
        <div className={styles.heroTimeline} data-hero-timeline>
          <div><span>01 /</span><strong>下班之后</strong></div>
          <div className={styles.spectrumTime} aria-label="时间 19:30 到 20:10">
            <span>19:30</span><i><b /></i><span>20:10</span>
          </div>
        </div>
        <a className={styles.scrollCue} href="#moment-after-work"><FiArrowDown aria-hidden="true" /> 向下滚动进入画面</a>
      </div>
    </section>
  );
}

function StoryCopy({ film }: { film: MomentFilm }) {
  return (
    <div className={styles.storyCopy} data-story-copy>
      <div className={styles.storyMeta}><span>{film.index}</span><i /><strong>{film.category}</strong></div>
      <h2>{film.title[0]}<br />{film.title[1]}</h2>
      <dl className={styles.storyFacts}>
        <div><dt>需求</dt><dd>{film.need}</dd></div>
        <div><dt>计划</dt><dd>{film.plan}</dd></div>
        <div><dt>现场</dt><dd>{film.onSite}</dd></div>
      </dl>
    </div>
  );
}

function StoryArchive({ activeIndex }: { activeIndex: number }) {
  return (
    <section className={styles.archiveTrack} id="archive" data-moment-archive>
      <div className={styles.archiveStage} data-moment-archive-stage>
        {momentFilms.map((film, index) => (
          <article className={styles.storyScene} data-moment-scene data-scene-index={index} id={`moment-${film.id}`} aria-hidden={activeIndex !== index} inert={activeIndex !== index ? true : undefined} key={film.id}>
            <div className={styles.storyMedia} data-story-media>
              <Image src={film.asset} fill unoptimized loading={index < 2 ? "eager" : "lazy"} sizes="100vw" alt={film.alt} style={{ objectPosition: film.focalPoint }} />
            </div>
            <div className={styles.storyVeil} />
            <StoryCopy film={film} />
            <div className={styles.sceneTime} data-scene-time>
              <span>{film.timeStart}</span><i><b /></i><span>{film.timeEnd}</span>
            </div>
            <span className={styles.sceneNumber} aria-hidden="true">{film.index}</span>
          </article>
        ))}
        <nav className={styles.archiveNavigation} aria-label="故事章节">
          <span>故事影像</span>
          <div>
            {momentFilms.map((film, index) => (
              <a className={activeIndex === index ? styles.archiveActive : ""} href={`#moment-${film.id}`} data-moment-jump={index} aria-label={`${film.index} ${film.category}`} aria-current={activeIndex === index ? "step" : undefined} key={film.id}><i /></a>
            ))}
          </div>
          <strong>{momentFilms[activeIndex]?.index ?? "01"} / 04</strong>
        </nav>
        <a className={styles.skipChapter} href="#story-state">跳过见面片段</a>
      </div>
    </section>
  );
}

function CollectionState() {
  return (
    <section className={styles.collection} id="story-state" data-collection>
      <div className={styles.collectionCopy} data-collection-copy>
        <h2>打破孤独<br />打破枯燥<br />打破常规<br />每一次都是新体验</h2>
      </div>
      <div className={styles.collectionFilms} data-collection-films>
        {momentFilms.map((film) => (
          <figure data-collection-film key={film.id}>
            <Image src={film.asset} fill unoptimized loading="lazy" sizes="20vw" alt="" />
            <figcaption>{film.index} / {film.category}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Handoff() {
  return (
    <footer className={styles.handoff}>
      <div className={styles.handoffMedia}>
        <Image src={cultureFilm.asset} fill unoptimized loading="lazy" sizes="100vw" alt={cultureFilm.alt} />
      </div>
      <div className={styles.handoffVeil} />
      <div className={styles.handoffCopy}>
        <span>下一次见面</span>
        <h2>先选择你的目标<br />过程交给agent帮你速通</h2>
        <div>
          <Link href="/world" data-magnetic>进入 Social World <FiArrowUpRight aria-hidden="true" /></Link>
          <Link href="/agent" data-magnetic>告诉社交助手</Link>
        </div>
      </div>
    </footer>
  );
}

function CategoryIndex() {
  const categories = ["运动", "旅行", "城市", "兴趣", "陪伴"];
  return (
    <section className={styles.categoryIndex}>
      <header><span>场景索引</span><h2>见面的可能<br />藏在不同生活里</h2></header>
      <div>{categories.map((category, index) => <Link href="/world#explore" key={category}><span>0{index + 1}</span><strong>{category}</strong><FiArrowUpRight /></Link>)}</div>
    </section>
  );
}

export function MomentsFilmPage() {
  const mainRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  useMomentsFilmMotion(mainRef, setActiveIndex);

  return (
    <main className={styles.page} ref={mainRef}>
      <SiteNavigation active="moments" />
      <Hero />
      <StoryArchive activeIndex={activeIndex} />
      <CollectionState />
      <CategoryIndex />
      <Handoff />
      <SiteFooter />
    </main>
  );
}
