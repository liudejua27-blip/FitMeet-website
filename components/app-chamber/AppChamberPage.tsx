"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  FiActivity,
  FiArrowDown,
  FiArrowUpRight,
  FiBattery,
  FiBell,
  FiCheck,
  FiChevronLeft,
  FiClock,
  FiCompass,
  FiEdit3,
  FiHome,
  FiMapPin,
  FiMessageCircle,
  FiSend,
  FiShield,
  FiUser,
  FiUsers,
  FiWifi,
  FiX,
} from "react-icons/fi";
import { SiApple, SiGoogleplay } from "react-icons/si";
import { SiteFooter } from "@/components/site-shell/SiteFooter";
import { SiteNavigation } from "@/components/site-shell/SiteNavigation";
import type { AppDemoScenario, AppDemoScreen } from "@/lib/experience-types";
import { useAppChamberMotion } from "./useAppChamberMotion";
import styles from "./app-chamber.module.css";

const scenarios: AppDemoScenario[] = [
  {
    id: "sport",
    label: "运动",
    intent: "周六下午想找两三个人打羽毛球",
    title: "周六羽毛球",
    time: "周六 15:00",
    place: "静安公共球馆",
    people: "2–3 人",
    budget: "每人 60 元内",
    boundary: "公共场馆 · 90 分钟 · 结束后各自返回",
    asset: "/images/social-world/night-badminton-desktop.jpg",
  },
  {
    id: "travel",
    label: "旅行",
    intent: "周末想找三个人从同城出发去海边",
    title: "周末海边同行",
    time: "周六 08:30",
    place: "城市公共集合点",
    people: "3–4 人",
    budget: "出发前共同确认",
    boundary: "公开路线 · 当日往返 · 行程变化需重新确认",
    asset: "/images/social-world/travel-meetup-desktop.jpg",
  },
  {
    id: "photo",
    label: "摄影",
    intent: "想找人一起拍一组城市夜景",
    title: "城市夜景漫游",
    time: "周五 19:30",
    place: "滨水公共街区",
    people: "2–4 人",
    budget: "各自承担",
    boundary: "公共区域 · 2 小时 · 不拍摄陌生人正脸",
    asset: "/images/social-world/city-public-space-desktop.jpg",
  },
];

type PlanStatus = "idle" | "confirmed" | "cancelled";
type InterfaceSize = "device" | "expanded";

type DemoProps = {
  screen: AppDemoScreen;
  scenario: AppDemoScenario;
  intent: string;
  status: PlanStatus;
  onIntentChange: (value: string) => void;
  onScenarioChange: (scenario: AppDemoScenario) => void;
  onScreenChange: (screen: AppDemoScreen) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

function PhoneStatusBar() {
  return (
    <div className={styles.phoneStatus} aria-hidden="true">
      <span>9:41</span>
      <div><FiActivity /><FiWifi /><FiBattery /></div>
    </div>
  );
}

function BottomTabs() {
  return (
    <nav className={styles.phoneTabs} aria-label="应用演示导航">
      <button type="button" aria-current="page"><FiHome /><span>首页</span></button>
      <button type="button" aria-disabled="true"><FiCompass /><span>世界</span></button>
      <button type="button" aria-disabled="true"><FiMessageCircle /><span>消息</span></button>
      <button type="button" aria-disabled="true"><FiUser /><span>我的</span></button>
    </nav>
  );
}

function AssistantScreen({
  idPrefix,
  size,
  scenario,
  intent,
  onIntentChange,
  onScenarioChange,
  onGenerate,
}: {
  idPrefix: string;
  size: InterfaceSize;
  scenario: AppDemoScenario;
  intent: string;
  onIntentChange: (value: string) => void;
  onScenarioChange: (scenario: AppDemoScenario) => void;
  onGenerate: () => void;
}) {
  return (
    <div className={styles.assistantScreen} data-app-screen="assistant" data-interface-size={size}>
      <header className={styles.appHeader}>
        <div><Image src="/brand/fitmeet-logo.png" width={36} height={36} alt="" /><span><strong>FitMeet</strong><small>社交助手</small></span></div>
        <button type="button" aria-label="通知演示"><FiBell /></button>
      </header>

      <div className={styles.assistantLayout}>
        <div className={styles.assistantCompose}>
          <section className={styles.assistantIntro}>
            <span><Image src="/brand/fitmeet-logo.png" width={26} height={26} alt="" /></span>
            <div><strong>今天想和谁一起做什么？</strong><p>从一件想做的事开始时间、地点和边界都可以再修改</p></div>
          </section>
          <label className={styles.intentComposer} htmlFor={`${idPrefix}-intent`}>
            <textarea id={`${idPrefix}-intent`} value={intent} onChange={(event) => onIntentChange(event.target.value)} aria-label="告诉社交助手你想做什么" />
            <button type="button" aria-label="整理需求" onClick={onGenerate}><FiSend /></button>
          </label>
          <div className={styles.scenarioSwitch} aria-label="选择活动场景">
            {scenarios.map((item) => <button type="button" aria-pressed={scenario.id === item.id} onClick={() => onScenarioChange(item)} key={item.id}>{item.label}</button>)}
          </div>
          <p className={styles.assistantBoundary}><FiShield />不先浏览陌生人也不会替你发送邀请</p>
        </div>

        <section className={styles.recommendations}>
          <header><strong>活动计划建议</strong><span>根据当前需求整理</span></header>
          <div>
            {scenarios.map((item) => (
              <button className={scenario.id === item.id ? styles.planCardActive : ""} type="button" onClick={() => onScenarioChange(item)} key={item.id}>
                <span className={styles.planCardMedia}><Image src={item.asset} fill sizes={size === "device" ? "120px" : "260px"} loading={size === "device" ? "eager" : "lazy"} alt="" /></span>
                <span className={styles.planCardCopy}>
                  <small>{item.label}</small>
                  <strong>{item.title}</strong>
                  <i><span><FiClock />{item.time}</span><span><FiUsers />{item.people}</span></i>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
      <BottomTabs />
    </div>
  );
}

function PlanScreen({
  size,
  scenario,
  status,
  onEdit,
  onConfirm,
  onCancel,
}: {
  size: InterfaceSize;
  scenario: AppDemoScenario;
  status: PlanStatus;
  onEdit: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const stateLabel = status === "confirmed" ? "计划已确认" : status === "cancelled" ? "计划已取消" : "等待你的确认";

  return (
    <div className={styles.planScreen} data-app-screen="plan" data-interface-size={size}>
      <header className={styles.planHeader}>
        <button type="button" onClick={onEdit} aria-label="返回修改"><FiChevronLeft /></button>
        <strong>确认计划</strong>
        <span><FiShield />由你决定</span>
      </header>
      <div className={styles.planLayout}>
        <div className={styles.planHero}>
          <Image src={scenario.asset} fill sizes={size === "device" ? "360px" : "560px"} alt={scenario.title} />
          <div><small>{stateLabel}</small><strong>{scenario.title}</strong></div>
        </div>
        <div className={styles.planDetails}>
          <div className={styles.planFacts}>
            <div><span><FiClock />时间</span><strong>{scenario.time}</strong></div>
            <div><span><FiMapPin />地点</span><strong>{scenario.place}</strong></div>
            <div><span><FiUsers />人数</span><strong>{scenario.people}</strong></div>
            <div><span>¥ 预算</span><strong>{scenario.budget}</strong></div>
          </div>
          <div className={styles.boundaryBlock}><FiShield /><div><strong>见面边界</strong><p>{scenario.boundary}</p></div></div>
          <div className={styles.planActions}>
            <button type="button" onClick={onEdit}><FiEdit3 />返回修改</button>
            <button type="button" onClick={onConfirm} disabled={status === "confirmed"}><FiCheck />{status === "confirmed" ? "计划已确认" : "确认计划"}</button>
            <button type="button" onClick={onCancel}><FiX />取消计划</button>
          </div>
          <p className={styles.planFeedback} role="status" aria-live="polite">
            {status === "confirmed" ? "已保存你的确认；FitMeet 不会自动发送邀请" : status === "cancelled" ? "计划已取消没有发送任何邀请" : "确认前你仍可以修改或取消"}
          </p>
        </div>
      </div>
      <BottomTabs />
    </div>
  );
}

function ProductInterface({ size, idPrefix, ...props }: DemoProps & { size: InterfaceSize; idPrefix: string }) {
  return props.screen === "assistant" ? (
    <AssistantScreen
      idPrefix={idPrefix}
      size={size}
      scenario={props.scenario}
      intent={props.intent}
      onIntentChange={props.onIntentChange}
      onScenarioChange={props.onScenarioChange}
      onGenerate={() => props.onScreenChange("plan")}
    />
  ) : (
    <PlanScreen
      size={size}
      scenario={props.scenario}
      status={props.status}
      onEdit={() => props.onScreenChange("assistant")}
      onConfirm={props.onConfirm}
      onCancel={props.onCancel}
    />
  );
}

function ProductDevice({ idPrefix, ...props }: DemoProps & { idPrefix: string }) {
  return (
    <div className={styles.productDevice} data-product-device>
      <div className={styles.deviceViewport}>
        <PhoneStatusBar />
        <ProductInterface size="device" idPrefix={idPrefix} {...props} />
      </div>
      <Image className={styles.deviceFrame} src="/images/app-chamber/device-frame-v2-cropped.png" fill sizes="430px" alt="" priority />
    </div>
  );
}

function LaunchHero(props: DemoProps) {
  return (
    <section className={styles.launchHero} id="top" data-app-launch>
      <div className={styles.launchCopy} data-launch-copy>
        <span>FitMeet 应用</span>
        <h1>先说想做什么<br />再确认每个条件</h1>
        <p>社交助手整理时间、地点、人数和边界<br />邀请谁、是否见面仍由你决定</p>
        <Link href="#product-demo">查看产品演示 <FiArrowDown /></Link>
        <small>产品交互演示最终界面以上线版本为准</small>
      </div>
      <div className={styles.heroDevice} data-hero-device><ProductDevice idPrefix="hero" {...props} /></div>
      <div className={styles.heroRoute} aria-hidden="true"><i /><i /><i /></div>
    </section>
  );
}

function ProductDemo(props: DemoProps) {
  return (
    <section className={styles.demoTrack} id="product-demo" data-app-demo data-current-screen={props.screen}>
      <div className={styles.demoStage}>
        <header className={styles.demoEditorial}>
          <span data-stage-index>{props.screen === "assistant" ? "01 / 02" : "02 / 02"}</span>
          <div data-stage-copy="assistant"><strong>先说想做什么</strong><p>场景和建议围绕活动展开不用先浏览陌生人的资料</p></div>
          <div data-stage-copy="plan"><strong>再确认每个条件</strong><p>时间、地点、人数、预算与见面边界始终由你修改和确认</p></div>
          <nav aria-label="切换产品演示界面">
            <button type="button" aria-pressed={props.screen === "assistant"} onClick={() => props.onScreenChange("assistant")}>助手首页</button>
            <button type="button" aria-pressed={props.screen === "plan"} onClick={() => props.onScreenChange("plan")}>计划确认</button>
          </nav>
        </header>

        <div className={styles.demoDevice} data-demo-device><ProductDevice idPrefix="demo-device" {...props} /></div>
        <div className={styles.expandedCanvas} data-expanded-canvas>
          <ProductInterface size="expanded" idPrefix="demo-expanded" {...props} />
        </div>
        <div className={styles.demoProgress} aria-hidden="true"><i data-demo-progress /><span data-demo-progress-label>01</span><b>/ 02</b></div>
      </div>
    </section>
  );
}

function DecisionBand() {
  const items = [
    ["01", "可以修改", "建议不是命令条件随时可以调整"],
    ["02", "需要确认", "只有你主动确认后计划才会被保存"],
    ["03", "随时取消", "取消不会自动通知或邀请任何人"],
    ["04", "保留边界", "公共地点、退出与支持入口始终可见"],
  ];
  return (
    <section className={styles.decisionBand} data-decision-band>
      <header><span>产品边界</span><h2>产品负责把事情说清楚<br />决定仍然属于你</h2><p>FitMeet 是辅助型社交助手不替用户邀请、承诺或建立关系</p></header>
      <div>{items.map(([index, title, copy]) => <article key={index}><span>{index}</span><strong>{title}</strong><p>{copy}</p></article>)}</div>
    </section>
  );
}

function StoreSection() {
  return (
    <section className={styles.storeSection} data-store-section>
      <div><span>当前状态</span><h2>FitMeet 应用即将上线</h2><p>商店页面、二维码和正式上线时间将在可以验证后发布</p></div>
      <div className={styles.storeActions}>
        <span><SiApple /><strong>苹果应用商店</strong><small>即将上线</small></span>
        <span><SiGoogleplay /><strong>谷歌应用商店</strong><small>即将上线</small></span>
        <Link href="/contact">获取上线消息 <FiArrowUpRight /></Link>
      </div>
    </section>
  );
}

export function AppChamberPage() {
  const mainRef = useRef<HTMLElement>(null);
  const [screen, setScreen] = useState<AppDemoScreen>("assistant");
  const [scenario, setScenario] = useState<AppDemoScenario>(scenarios[0]);
  const [intent, setIntent] = useState(scenarios[0].intent);
  const [status, setStatus] = useState<PlanStatus>("idle");

  const selectScenario = useCallback((next: AppDemoScenario) => {
    setScenario(next);
    setIntent(next.intent);
    setStatus("idle");
  }, []);
  const changeScreen = useCallback((next: AppDemoScreen) => {
    setScreen(next);
    if (next === "assistant") setStatus("idle");
  }, []);

  useAppChamberMotion(mainRef, changeScreen);

  const props: DemoProps = {
    screen,
    scenario,
    intent,
    status,
    onIntentChange: (value) => { setIntent(value); setStatus("idle"); },
    onScenarioChange: selectScenario,
    onScreenChange: changeScreen,
    onConfirm: () => setStatus("confirmed"),
    onCancel: () => setStatus("cancelled"),
  };

  return (
    <main className={styles.page} ref={mainRef}>
      <SiteNavigation active="app" tone="light" />
      <LaunchHero {...props} />
      <ProductDemo {...props} />
      <DecisionBand />
      <StoreSection />
      <SiteFooter />
    </main>
  );
}
