"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { FiArrowDown, FiArrowUpRight, FiCheck } from "react-icons/fi";
import { siteConfig } from "@/lib/site-config";
import { SiteFooter } from "@/components/site-shell/SiteFooter";
import { SiteNavigation } from "@/components/site-shell/SiteNavigation";
import styles from "./contact-network.module.css";

const contactTypes = [
  { id: "business", label: "商务合作", note: "场馆、旅行、城市空间与产品合作" },
  { id: "media", label: "媒体与品牌", note: "采访、内容、品牌与行业交流" },
  { id: "feedback", label: "产品反馈", note: "体验问题、建议与功能讨论" },
  { id: "other", label: "其他", note: "安全、隐私或尚未归类的联系" },
] as const;

export function ContactNetworkPage() {
  const [type, setType] = useState<(typeof contactTypes)[number]["id"]>("business");
  const [confirmed, setConfirmed] = useState(false);
  const selected = contactTypes.find((item) => item.id === type) ?? contactTypes[0];
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const organization = String(form.get("organization") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const subject = `FitMeet ${selected.label}｜${organization || name}`;
    const body = [`联系类型：${selected.label}`, `姓名：${name}`, `邮箱：${email}`, `组织：${organization || "未填写"}`, "", message].join("\n");
    setConfirmed(true);
    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className={styles.page}>
      <SiteNavigation context="联系" />
      <section className={styles.hero} id="top">
        <div className={styles.heroMedia}><Image src="/images/about-network/about-origin-city-hero-desktop.jpg" fill priority loading="eager" sizes="100vw" alt="城市公共空间中的人们" /></div>
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <span>联系与合作</span>
          <h1>有合作想法？<br />让我们从一封清楚的<br />邮件开始</h1>
          <p>选择联系类型我们会把它交给合适的人</p>
          <a href="#contact-form">开始联系 <FiArrowDown /></a>
        </div>
      </section>

      <section className={styles.contactFlow} id="contact-form">
        <header><span>01 / 选择联系类型</span><h2>先说明为什么联系</h2></header>
        <div className={styles.typeGrid}>
          {contactTypes.map((item) => <button type="button" key={item.id} aria-pressed={type === item.id} onClick={() => { setType(item.id); setConfirmed(false); }}><span>{item.label}</span><small>{item.note}</small><i /></button>)}
        </div>
        <div className={styles.formLayout}>
          <aside><span>当前路径</span><strong>{selected.label}</strong><p>{selected.note}</p><div className={styles.publicContact}><span>公开联系方式</span><a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}<FiArrowUpRight aria-hidden="true" /></a></div><small>当前通过公开邮箱接收我们不虚构固定回复时效；信息清楚时会更容易交给合适的人</small></aside>
          <form onSubmit={submit}>
            <div><label>你的姓名<input name="name" required autoComplete="name" placeholder="怎么称呼你" /></label><label>联系邮箱<input name="email" required type="email" autoComplete="email" placeholder="请输入邮箱地址" /></label></div>
            <label>组织或项目<input name="organization" autoComplete="organization" placeholder="选填" /></label>
            <label>你想讨论什么<textarea name="message" required rows={6} placeholder="请说明背景、想解决的问题以及希望 FitMeet 了解什么" /></label>
            <p>提交后会打开你的邮件应用内容会预先填好；发送前你仍可修改不会在网页中静默上传信息</p>
            <button type="submit">确认并打开邮件 <FiArrowUpRight /></button>
            {confirmed ? <output><FiCheck />邮件内容已准备好请在邮件应用中确认发送</output> : null}
          </form>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
