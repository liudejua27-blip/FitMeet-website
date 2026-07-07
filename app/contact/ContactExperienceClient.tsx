"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./contact.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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

const userSignals = [
  ["真实需求", "想夜跑、球馆、桌游、城市漫游、周末短途，或只是想把一个模糊想法变成现实计划。"],
  ["早期体验", "留下你希望 FitMeet 帮你组织的生活场景，优先进入早期体验队列。"],
  ["安全边界", "公开地点、退出机制、隐私边界和确认后邀请，会先于真人连接出现。"]
] as const;

const enterpriseValues = [
  ["更精准的用户", "连接正在形成计划的人，而不是只看见广告的人。"],
  ["更省时的触达", "需求已经出现，合作不再从冷启动解释开始。"],
  ["更高效的转化", "从真实场景进入行动，减少无效曝光和空泛沟通。"],
  ["更真实的反馈", "用户到场后的选择、偏好和复访意图比点击更接近真实需求。"],
  ["更长期的场景资产", "让场馆、品牌、活动空间沉淀为可复访的城市节点。"]
] as const;

const contactRoutes = [
  {
    id: "01",
    label: "个人体验",
    title: "我有一个真实生活需求。",
    body: "从一句想法开始，让 FitMeet 判断场景、边界和下一步计划。",
    href: "#waitlist",
    action: "加入早期体验"
  },
  {
    id: "02",
    label: "企业合作",
    title: "我想让真实需求进入真实场景。",
    body: "适合场馆、品牌、活动空间、本地服务和年轻人城市生活相关合作。",
    href: "#enterprise",
    action: "联系企业合作"
  },
  {
    id: "03",
    label: "安全问题",
    title: "我关心隐私、安全或边界。",
    body: "安全问题优先进入安全路径，不进入普通营销或合作沟通。",
    href: "/safety",
    action: "查看安全边界"
  }
] as const;

const intakeSteps = [
  ["说清需求", "你想做什么、什么时候、在哪里、希望多低压力。"],
  ["确认边界", "公开地点、人数偏好、退出方式和隐私边界先写清。"],
  ["进入路径", "个人体验、企业合作、安全问题分别进入正确通道。"],
  ["形成下一步", "不是等待回复，而是让需求进入可执行的计划队列。"]
] as const;

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

function ContactMedia({
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

export function ContactExperienceClient() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const select = gsap.utils.selector(root);
      const reveals = gsap.utils.toArray<HTMLElement>(select("[data-contact-reveal]"));
      const routeLines = gsap.utils.toArray<HTMLElement>(select("[data-contact-route]"));
      const slices = gsap.utils.toArray<HTMLElement>(select("[data-contact-slice]"));

      if (prefersReducedMotion) {
        gsap.set(reveals, { autoAlpha: 1, y: 0 });
        gsap.set(routeLines, { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(slices, { xPercent: 0, autoAlpha: 1 });
        gsap.set(select("[data-contact-progress]"), { scaleX: 1 });
        return;
      }

      gsap.set(reveals, { autoAlpha: 0.74, y: 28 });
      gsap.set(routeLines, { autoAlpha: 0.62, y: 30, scale: 0.992 });
      gsap.set(slices, { xPercent: -8, autoAlpha: 0.5 });

      gsap.to(select("[data-contact-progress]"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          id: "contact-progress",
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5
        }
      });

      ScrollTrigger.batch(reveals, {
        start: "top 82%",
        end: "bottom 18%",
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.68,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true
          });
        },
        onLeaveBack: (batch) => {
          gsap.to(batch, {
            autoAlpha: 0.74,
            y: 14,
            duration: 0.32,
            ease: "power2.out",
            overwrite: true
          });
        }
      });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "contact-route",
            trigger: select("[data-contact-router]")[0],
            start: "top 74%",
            end: "bottom 22%",
            scrub: 1
          }
        })
        .to(routeLines, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          stagger: 0.08
        })
        .to(
          slices,
          {
            xPercent: 0,
            autoAlpha: 1,
            stagger: 0.08
          },
          "<0.12"
        );

      ScrollTrigger.refresh();
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true }
  );

  return (
    <div className={styles.surface} ref={rootRef} data-contact-page>
      <div className={styles.progress} data-contact-progress aria-hidden="true" />

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
              aria-current={item.href === "/contact" ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a className={styles.headerCta} href="mailto:15253005312@163.com">
          直接联系
        </a>
      </header>

      <main>
        <section className={styles.hero} aria-label="FitMeet 联系入口">
          <div className={styles.heroCopy} data-contact-reveal>
            <p className={styles.kicker}>CONTACT / SIGNAL INTAKE</p>
            <h1>
              <span>从一个</span>
              <span>真实想法</span>
              <span>开始。</span>
            </h1>
            <p>
              从一个真实想法开始。FitMeet 的联系页不是普通收件箱。个人体验、企业合作和安全问题，需要进入不同路径，才能形成真正有效的下一步。
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#waitlist">
                加入早期体验
              </a>
              <a className={styles.secondaryAction} href="#enterprise">
                联系企业合作
              </a>
            </div>
          </div>

          <aside className={styles.heroMedia} data-contact-reveal>
            <ContactMedia
              src="/images/home-v5/scene-citywalk-case-poster.jpg"
              alt="年轻人在城市公共街区形成真实到场计划"
              priority
            />
            <div className={styles.mediaBlade} data-contact-slice aria-hidden="true" />
            <div className={styles.mediaCaption}>
              <span>REAL SIGNAL</span>
              <strong>真实需求，比曝光更接近成交。</strong>
            </div>
          </aside>
        </section>

        <section className={styles.routeSection} data-contact-router aria-labelledby="route-title">
          <div className={styles.sectionHeader} data-contact-reveal>
            <p className={styles.kicker}>ENTRY ROUTES</p>
            <h2 id="route-title">
              <span>不是所有联系，</span>
              <span>都该进入同一个表单。</span>
            </h2>
            <p>FitMeet 先判断你带来的信号，再把它送到个人体验、企业合作或安全边界的正确路径。</p>
          </div>

          <div className={styles.routeStack}>
            {contactRoutes.map((route) => (
              <a className={styles.routeLine} href={route.href} key={route.id} data-contact-route>
                <span className={styles.routeId}>{route.id}</span>
                <span className={styles.routeLabel}>{route.label}</span>
                <span className={styles.routeText}>
                  <strong>{route.title}</strong>
                  <em>{route.body}</em>
                </span>
                <span className={styles.routeAction}>{route.action}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="waitlist" className={styles.waitlistSection} aria-labelledby="waitlist-title">
          <div className={styles.waitlistCopy} data-contact-reveal>
            <p className={styles.kicker}>USER WAITLIST</p>
            <h2 id="waitlist-title">
              <span>加入早期体验，</span>
              <span>先写下真实需求。</span>
            </h2>
            <p>
              不需要包装资料。告诉 FitMeet 你希望被组织起来的一件事：运动、球馆、桌游、城市漫游、周末短途，或任何真实生活里的计划。
            </p>
          </div>

          <div className={styles.signalGrid}>
            {userSignals.map(([title, body], index) => (
              <article key={title} data-contact-reveal>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="enterprise" className={styles.enterpriseSection} aria-labelledby="enterprise-title">
          <div className={styles.enterpriseMedia} data-contact-reveal>
            <ContactMedia
              src="/images/home-v5/partner-arrival-value-poster.jpg"
              alt="真实到场意图进入场馆和合作空间"
            />
            <div className={styles.mediaBlade} data-contact-slice aria-hidden="true" />
          </div>

          <div className={styles.enterpriseCopy} data-contact-reveal>
            <p className={styles.kicker}>ENTERPRISE COOPERATION</p>
            <h2 id="enterprise-title">
              <span>真实需求，</span>
              <span>比曝光更接近成交。</span>
            </h2>
            <p>
              FitMeet 帮助企业连接正在形成计划的年轻用户，让合作进入真实场景，而不是停留在广告展示。
            </p>
            <a className={styles.emailAction} href="mailto:15253005312@163.com">
              合作请联系：15253005312@163.com
            </a>
          </div>
        </section>

        <section className={styles.valueSection} aria-labelledby="value-title">
          <div className={styles.sectionHeader} data-contact-reveal>
            <p className={styles.kicker}>VALUE FOR BUSINESS</p>
            <h2 id="value-title">
              <span>合作价值，</span>
              <span>必须落到真实场景。</span>
            </h2>
            <p>企业合作不能绕过用户价值。FitMeet 只接受能够让年轻人更容易真实到场的合作路径。</p>
          </div>

          <div className={styles.valueGrid}>
            {enterpriseValues.map(([title, body], index) => (
              <article key={title} data-contact-reveal>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.intakeSection} aria-labelledby="intake-title">
          <div className={styles.intakeCopy} data-contact-reveal>
            <p className={styles.kicker}>NEXT STEP ORDER</p>
            <h2 id="intake-title">
              <span>先说清楚为什么，</span>
              <span>再决定去哪里。</span>
            </h2>
          </div>

          <div className={styles.intakeRail}>
            {intakeSteps.map(([title, body], index) => (
              <article key={title} data-contact-reveal>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.boundarySection} aria-labelledby="boundary-title">
          <p className={styles.kicker} data-contact-reveal>BOUNDARY</p>
          <h2 id="boundary-title" data-contact-reveal>
            <span>安全问题，</span>
            <span>不进入普通队列。</span>
          </h2>
          <p data-contact-reveal>
            涉及隐私、骚扰、账号异常或边界风险，请优先查看安全与隐私路径。即时人身危险、医疗、心理危机、法律、金融或其他专业紧急问题，请先联系当地紧急服务或专业机构。
          </p>
          <div className={styles.boundaryActions} data-contact-reveal>
            <Link className={styles.secondaryAction} href="/safety">
              查看安全边界
            </Link>
            <Link className={styles.secondaryAction} href="/privacy">
              查看隐私规则
            </Link>
          </div>
        </section>

        <section className={styles.finalSection} aria-labelledby="final-title">
          <p className={styles.kicker} data-contact-reveal>DIRECT CONTACT</p>
          <h2 id="final-title" data-contact-reveal>
            <span>让一个真实信号，</span>
            <span>进入正确路径。</span>
          </h2>
          <p data-contact-reveal>
            个人体验从真实需求开始。企业合作从真实场景开始。所有联系都必须服务于 Social World：一句想法，变成一次真实到场。
          </p>
          <div className={styles.finalActions} data-contact-reveal>
            <a className={styles.primaryAction} href="mailto:15253005312@163.com">
              发送合作邮件
            </a>
            <Link className={styles.secondaryAction} href="/thank-you">
              查看提交后路径
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
