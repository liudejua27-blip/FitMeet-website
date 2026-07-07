"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MediaAsset, SocialWorldPageConfig } from "./pageData";
import styles from "./social-world-page.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const navItems = [
  { href: "/", label: "首页" },
  { href: "/product", label: "产品" },
  { href: "/scenes", label: "场景" },
  { href: "/community", label: "社区" },
  { href: "/safety", label: "安全" },
  { href: "/about", label: "关于" },
  { href: "/journal", label: "动态" },
  { href: "/contact", label: "联系" }
];

function SignalImageMedia({ media, priority = false }: { media: MediaAsset; priority?: boolean }) {
  return <img className={styles.video} src={media.src} alt={media.alt} loading={priority ? "eager" : "lazy"} decoding="async" />;
}

export function SocialWorldPage({ config }: { config: SocialWorldPageConfig }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const sections = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-motion-scope]"));

      if (reduceMotion) {
        gsap.set(root, {
          "--sw-flow": 0,
          "--sw-heat": 0
        });
        gsap.set(root.querySelectorAll("[data-motion-target]"), {
          clearProps: "transform,clipPath"
        });
        return;
      }

      gsap.fromTo(
        root.querySelectorAll("[data-hero-word]"),
        { y: 56, clipPath: "inset(100% 0 0 0)" },
        {
          y: 0,
          clipPath: "inset(0% 0 0 0)",
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.09
        }
      );

      gsap.to(root.querySelector("[data-motion-target='progress']"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.2
        }
      });

      gsap.to(root, {
        "--sw-flow": 1,
        "--sw-heat": 1,
        ease: "none",
        scrollTrigger: {
          id: `${config.slug}-continuity-field`,
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8
        }
      });

      sections.forEach((section, index) => {
        const revealTargets = section.querySelectorAll<HTMLElement>("[data-motion-target='reveal']");
        const mediaTargets = section.querySelectorAll<HTMLElement>("[data-motion-target='media']");
        const proofTargets = section.querySelectorAll<HTMLElement>("[data-motion-target='proof']");

        if (revealTargets.length > 0) {
          gsap.fromTo(
            revealTargets,
            { y: 44, clipPath: "inset(0 0 18% 0)" },
            {
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: 0.92,
              ease: "power3.out",
              stagger: 0.055,
              scrollTrigger: {
                id: `${config.slug}-reveal-${index}`,
                trigger: section,
                start: "top 74%",
                end: "bottom 30%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }

        if (mediaTargets.length > 0) {
          gsap.fromTo(
            mediaTargets,
            { y: 36, scale: 1.08, clipPath: "polygon(9% 0, 100% 0, 91% 100%, 0 100%)" },
            {
              y: -24,
              scale: 1,
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              ease: "none",
              scrollTrigger: {
                id: `${config.slug}-media-${index}`,
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
              }
            }
          );
        }

        if (proofTargets.length > 0) {
          gsap.fromTo(
            proofTargets,
            { x: 36 },
            {
              x: 0,
              duration: 0.72,
              ease: "power3.out",
              stagger: 0.05,
              scrollTrigger: {
                id: `${config.slug}-proof-${index}`,
                trigger: section,
                start: "top 68%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      });
    },
    { scope: rootRef, dependencies: [config.slug] }
  );

  return (
    <div className={styles.page} data-page={config.slug} ref={rootRef}>
      <div className={styles.progress} data-motion-target="progress" aria-hidden="true" />
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="FitMeet 首页，F 品牌标志">
          <span className={styles.brandMark} aria-hidden="true">
            <img src="/fitmeet-icon.png" alt="" />
          </span>
          <span className={styles.brandName}>FitMeet</span>
        </Link>
        <nav className={styles.nav} aria-label="主导航">
          {navItems.map((item) => (
            <Link aria-current={item.label === config.navLabel ? "page" : undefined} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className={styles.headerCta} href="/contact#enterprise">
          企业合作
        </Link>
      </header>

      <main>
        <section
          className={styles.hero}
          data-motion-scope="hero"
          data-visual-owner={`${config.slug}-hero`}
          aria-labelledby={`${config.slug}-title`}
        >
          <div className={styles.heroMedia} data-motion-target="media" aria-hidden="true">
            <SignalImageMedia media={config.hero} priority />
          </div>
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow} data-motion-target="reveal">
              {config.eyebrow}
            </p>
            <h1 id={`${config.slug}-title`}>
              {config.title.split("，").map((part, index) => (
                <span data-hero-word key={`${part}-${index}`}>
                  {index === 0 ? part : `，${part}`}
                </span>
              ))}
            </h1>
            <p className={styles.subtitle} data-motion-target="reveal">
              {config.subtitle}
            </p>
            <div className={styles.actions} data-motion-target="reveal">
              <Link href={config.primaryCta.href}>{config.primaryCta.label}</Link>
              <Link href={config.secondaryCta.href}>{config.secondaryCta.label}</Link>
            </div>
          </div>
        </section>

        <section className={styles.ticker} aria-label="FitMeet 关键词">
          <div>
            {[...config.ticker, ...config.ticker, ...config.ticker].map((word, index) => (
              <span key={`${word}-${index}`}>{word}</span>
            ))}
          </div>
        </section>

        <section className={styles.chain} data-motion-scope="story-chain" data-visual-owner={`${config.slug}-chain`}>
          <div className={styles.chainLine} aria-hidden="true" />
          {["一句想法", "公开场景", "边界确认", "计划生成", "真人出现", "Social World"].map((step, index) => (
            <article key={step} data-motion-target="proof">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </article>
          ))}
        </section>

        {config.sections.map((section, index) => (
          <section
            id={section.kicker.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
            className={index % 2 === 0 ? styles.storySection : `${styles.storySection} ${styles.reverse}`}
            data-motion-scope={`section-${index + 1}`}
            data-visual-owner={`${config.slug}-section-${index + 1}`}
            key={section.title}
            aria-labelledby={`${config.slug}-section-${index}`}
          >
            <div className={styles.sectionMedia} data-motion-target="media">
              <SignalImageMedia media={section.media} />
            </div>
            <div className={styles.sectionCopy}>
              <p className={styles.kicker} data-motion-target="reveal">
                {section.kicker}
              </p>
              <h2 id={`${config.slug}-section-${index}`} data-motion-target="reveal">
                {section.title}
              </h2>
              <p data-motion-target="reveal">{section.body}</p>
              <div className={styles.proofGrid}>
                {section.proof.map((item) => (
                  <article data-motion-target="proof" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section
          className={styles.finalCta}
          data-motion-scope="final"
          data-visual-owner={`${config.slug}-final`}
          aria-labelledby={`${config.slug}-final-title`}
        >
          <p data-motion-target="reveal">Social World</p>
          <h2 id={`${config.slug}-final-title`} data-motion-target="reveal">
            {config.final.title}
          </h2>
          <span data-motion-target="reveal">{config.final.body}</span>
          <Link data-motion-target="reveal" href={config.final.href}>
            {config.final.cta}
          </Link>
        </section>
      </main>
    </div>
  );
}
