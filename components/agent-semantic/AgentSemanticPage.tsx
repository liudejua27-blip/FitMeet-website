"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiArrowUpRight, FiCheck, FiEdit3, FiShield, FiUsers } from "react-icons/fi";
import { SiApple, SiGoogleplay } from "react-icons/si";
import { SiteNavigation } from "@/components/site-shell/SiteNavigation";
import { SiteFooter } from "@/components/site-shell/SiteFooter";
import { agentBoundaries, agentScenarios, type AgentPlanStatus, type AgentScenarioId } from "@/lib/agent-semantic-content";
import styles from "./agent-semantic.module.css";

const steps = ["说出需求", "整理条件", "确认计划"] as const;

function AgentDemo() {
  const [scenarioId, setScenarioId] = useState<AgentScenarioId>("sport");
  const [status, setStatus] = useState<AgentPlanStatus>("idle");
  const [step, setStep] = useState(0);
  const timer = useRef<number | null>(null);
  const scenario = agentScenarios.find((item) => item.id === scenarioId) ?? agentScenarios[0];
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(scenario.nodes.map((node) => [node.id, node.value])));
  const [intentText, setIntentText] = useState(scenario.intent);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  useEffect(() => {
    const scene = new URLSearchParams(window.location.search).get("scene");
    const mapped: AgentScenarioId | undefined = scene === "move" ? "sport" : scene === "go" || scene === "outdoor" ? "travel" : scene === "create" ? "create" : undefined;
    if (!mapped || mapped === scenarioId) return;
    const next = agentScenarios.find((item) => item.id === mapped) ?? agentScenarios[0];
    setScenarioId(mapped);
    setIntentText(next.intent);
    setValues(Object.fromEntries(next.nodes.map((node) => [node.id, node.value])));
    setStatus("idle");
    setStep(0);
  }, []);

  const selectScenario = (id: AgentScenarioId) => {
    const next = agentScenarios.find((item) => item.id === id) ?? agentScenarios[0];
    setScenarioId(id);
    setIntentText(next.intent);
    setValues(Object.fromEntries(next.nodes.map((node) => [node.id, node.value])));
    setStatus("idle");
    setStep(0);
  };

  const organize = () => {
    setStatus("extracting");
    setStep(1);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("ready"), 520);
  };

  const confirm = () => {
    if (status === "idle" || status === "cancelled") return organize();
    setStatus("confirmed");
    setStep(2);
  };

  const revise = (field: "time" | "place", value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setStatus("ready");
    setStep(1);
  };

  const cancel = () => {
    setStatus("cancelled");
    setStep(2);
  };

  return (
    <div className={styles.demo} data-plan-status={status}>
      <div className={styles.demoTop}>
        <div><Image src="/brand/fitmeet-logo-v2.png" width={32} height={32} alt="" /><strong>FitMeet 社交助手</strong></div>
        <span><i />{status === "confirmed" ? "计划已确认" : status === "cancelled" ? "计划已取消" : status === "extracting" ? "正在整理" : "等待你的决定"}</span>
      </div>
      <div className={styles.steps} aria-label="社交助手工作步骤">
        {steps.map((label, index) => <span className={index <= step ? styles.stepActive : ""} key={label}><i>{index + 1}</i>{label}</span>)}
      </div>
      <div className={styles.scenarios} aria-label="选择演示场景">
        {agentScenarios.map((item) => (
          <button type="button" key={item.id} onClick={() => selectScenario(item.id)} aria-pressed={scenario.id === item.id}>{item.category === "共创" ? "城市摄影" : item.category === "运动" ? "羽毛球" : item.category}</button>
        ))}
      </div>
      <div className={styles.intent}>
        <span>我想要</span>
        <textarea aria-label="描述你想进行的活动" value={intentText} rows={2} onChange={(event) => { setIntentText(event.target.value); setStatus("idle"); setStep(0); }} />
        <button type="button" onClick={organize} disabled={status === "extracting"}>{status === "extracting" ? "正在整理" : "整理条件"}<FiArrowUpRight aria-hidden="true" /></button>
      </div>
      <div className={styles.fields}>
        {scenario.nodes.map((node) => (
          <label key={node.id} data-node-status={node.status}>
            <span>{node.label}<i>{node.status === "needs-confirmation" ? "需确认" : "已识别"}</i><FiEdit3 aria-hidden="true" /></span>
            <input value={values[node.id] ?? ""} onChange={(event) => { setValues({ ...values, [node.id]: event.target.value }); setStatus("idle"); setStep(1); }} />
            <small>来自“{node.sourceText}”</small>
          </label>
        ))}
      </div>
      <div className={styles.plan} aria-live="polite">
        <div><span>{status === "extracting" ? "正在把条件整理成计划" : status === "cancelled" ? "这份计划不会继续" : scenario.signal}</span><strong>{status === "extracting" ? "请稍等…" : status === "cancelled" ? "计划已由你取消" : scenario.planTitle}</strong></div>
        <p><FiUsers aria-hidden="true" />{values.people} · {values.time} · {values.place}</p>
        <button type="button" onClick={confirm} disabled={status === "extracting" || status === "confirmed" || (status === "ready" && values.place === "等待你选择")}>{status === "confirmed" ? "计划已确认" : status === "cancelled" ? "重新整理" : status === "ready" ? "确认计划" : "生成计划"}{status === "confirmed" ? <FiCheck aria-hidden="true" /> : <FiArrowUpRight aria-hidden="true" />}</button>
      </div>
      {status === "ready" && values.place === "等待你选择" ? (
        <div className={styles.question}>
          <span>需要确认：你更希望离家近还是离地铁近？</span>
          <button type="button" onClick={() => revise("place", "离家近的公共场馆")}>离家近</button>
          <button type="button" onClick={() => revise("place", "地铁站附近公共场馆")}>离地铁近</button>
        </div>
      ) : null}
      {status === "confirmed" ? (
        <div className={styles.planControls} aria-label="修改或取消计划">
          <span>计划有变化？</span>
          <button type="button" onClick={() => revise("time", "周六 16:00")}>改到 16:00</button>
          <button type="button" onClick={() => revise("place", "地铁站附近公共场馆")}>换到地铁附近</button>
          <button type="button" onClick={cancel}>取消计划</button>
        </div>
      ) : null}
      <p className={styles.boundaryNote}><FiShield aria-hidden="true" />FitMeet 帮助整理与建议但不会替你发送邀请或作出决定</p>
    </div>
  );
}

function AppEntry() {
  return (
    <section className={styles.appEntry} id="app-entry">
      <div>
        <span>FitMeet 应用</span>
        <h2>把确认好的计划<br />带到现实</h2>
      </div>
      <div className={styles.storeState}>
        <span><SiApple aria-hidden="true" /><small>苹果应用商店</small><strong>即将上线</strong></span>
        <span><SiGoogleplay aria-hidden="true" /><small>谷歌应用商店</small><strong>即将上线</strong></span>
        <Link href="/app">查看应用进度 <FiArrowUpRight aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

export function AgentSemanticPage() {
  return (
    <main className={styles.page} id="top">
      <SiteNavigation active="agent" />
      <section className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden="true"><Image src="/images/agent-semantic/agent-intent-concourse-hero-desktop.jpg" fill priority loading="eager" sizes="100vw" alt="" /></div>
        <div className={styles.heroCopy}>
          <h1>你说想法<br />它帮你把条件理清</h1>
          <p>FitMeet 帮你整理时间、地点、人数、预算和边界邀请谁、要不要见面仍由你决定</p>
          <a href="#how-it-works">试着整理一个计划 <FiArrowUpRight aria-hidden="true" /></a>
        </div>
        <AgentDemo />
      </section>

      <section className={styles.explanation} id="how-it-works">
        <header><span>它会做什么</span><h2>少一点来回确认<br />更快看清这次见面</h2></header>
        <div>
          <article><strong>01</strong><h3>听懂你的想法</h3><p>从一句自然表达里找出时间、地点、人数和兴趣</p></article>
          <article><strong>02</strong><h3>把条件摆在眼前</h3><p>不确定的地方留给你修改预算与边界也可以直接说明</p></article>
          <article><strong>03</strong><h3>给出可确认的计划</h3><p>计划只是建议你确认之后才进入下一步</p></article>
        </div>
      </section>

      <section className={styles.boundaries}>
        <div className={styles.boundaryMedia}><Image src="/images/agent-semantic/agent-boundary-conversation-wide-desktop.jpg" fill sizes="50vw" alt="在公共空间交流的年轻人" /></div>
        <div className={styles.boundaryCopy}>
          <span>它不会替你做什么</span>
          <h2>辅助你开始<br />决定始终在你手里</h2>
          {agentBoundaries.map((item) => <article key={item.index}><strong>{item.index}</strong><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}
        </div>
      </section>
      <AppEntry />
      <SiteFooter />
    </main>
  );
}
