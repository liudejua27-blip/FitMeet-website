"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiArrowUpRight, FiChevronDown, FiExternalLink, FiSearch } from "react-icons/fi";
import { contactMailto, siteConfig } from "@/lib/site-config";
import { SiteFooter } from "@/components/site-shell/SiteFooter";
import { SiteNavigation } from "@/components/site-shell/SiteNavigation";
import styles from "./support-center.module.css";

const faqs = [
  { id: "plan-edit", category: "计划", question: "计划确认后还能修改吗？", answer: "可以时间、地点、人数和预算都应当允许再次确认应用内完整修改能力仍在建设中当前演示不会替你发送变更" },
  { id: "plan-exit", category: "计划", question: "我不想继续这次计划了怎么办？", answer: "你可以随时退出不需要为了礼貌继续已经确认的参与者应收到清楚、及时的变化说明" },
  { id: "unsafe", category: "安全", question: "遇到让我不舒服的互动怎么办？", answer: "先结束互动并离开现场联系可信赖的人若存在即时人身危险请优先联系当地警方、医疗或紧急服务" },
  { id: "report", category: "举报", question: "现在可以在哪里举报？", answer: `应用内举报仍在建设中当前可以通过 ${siteConfig.contactEmail} 提交必要信息我们不会承诺尚未建立的自动化处理时效` },
  { id: "block", category: "安全", question: "屏蔽功能已经可用吗？", answer: "还没有屏蔽、举报与申诉必须等正式能力完成后再公布官网不会把设计中的功能写成已经上线" },
  { id: "privacy", category: "隐私", question: "如何提出隐私或删除请求？", answer: `请通过 ${siteConfig.contactEmail} 联系并只提供核验和处理所需的信息正式产品上线后会提供更清楚的账号内入口` },
  { id: "account", category: "账户", question: "我可以创建账号了吗？", answer: "FitMeet 应用尚未正式上线目前没有官网账号注册入口你可以在应用页面获取上线消息" },
] as const;

const categories = ["全部", "账户", "计划", "安全", "举报", "隐私"] as const;

export function SupportCenterPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("全部");
  const [openId, setOpenId] = useState<string>(faqs[0].id);
  const results = useMemo(() => faqs.filter((item) => {
    const normalized = query.trim().toLowerCase();
    const matchesCategory = category === "全部" || item.category === category;
    return matchesCategory && (!normalized || `${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(normalized));
  }), [category, query]);

  return (
    <main className={styles.page}>
      <SiteNavigation context="支持" />
      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <span>支持中心</span>
          <h1>你需要什么帮助？</h1>
          <p>先搜索问题；如果答案不够再联系真实的人</p>
          <label className={styles.heroSearch}>
            <FiSearch aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索计划、安全、举报或隐私" autoFocus={false} />
            <span>{results.length} 条结果</span>
          </label>
        </div>
      </section>

      <section className={styles.answers} id="answers">
        <header><span>常见问题</span><h2>先找到答案<br />再决定下一步</h2></header>
        <div className={styles.filters} aria-label="帮助分类">
          {categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div className={styles.answerList}>
          {results.map((item) => {
            const open = openId === item.id;
            return (
              <article key={item.id} data-open={open ? "true" : "false"}>
                <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? "" : item.id)}>
                  <span>{item.category}</span><strong>{item.question}</strong><FiChevronDown aria-hidden="true" />
                </button>
                <div><p>{item.answer}</p></div>
              </article>
            );
          })}
          {results.length === 0 ? <p className={styles.empty}>没有找到对应答案你可以换个关键词或直接联系支持</p> : null}
        </div>
      </section>

      <section className={styles.scenarios}>
        <header><span>遇到这些情况</span><h2>先做最重要的事</h2></header>
        <div>
          <article><span>01</span><h3>计划无法修改</h3><p>先向相关参与者说明变化；不要在条件不清楚时继续</p><button type="button" onClick={() => { setCategory("计划"); setQuery("修改"); document.querySelector("#answers")?.scrollIntoView({ behavior: "smooth" }); }}>查看计划答案</button></article>
          <article><span>02</span><h3>需要立即退出</h3><p>你可以随时离开让你不安的互动或现场不需要等待许可</p><button type="button" onClick={() => { setCategory("计划"); setQuery("退出"); document.querySelector("#answers")?.scrollIntoView({ behavior: "smooth" }); }}>查看退出指引</button></article>
          <article><span>03</span><h3>遇到不当行为</h3><p>先保护自己保留必要信息再通过公开渠道反馈</p><a href={contactMailto("FitMeet 安全事件反馈")}>联系安全支持 <FiArrowUpRight /></a></article>
        </div>
        <p className={styles.emergency}><FiExternalLink />FitMeet 不是紧急服务机构；存在即时人身危险时请联系当地警方、医疗或紧急机构</p>
      </section>

      <section className={styles.contact}>
        <div><span>联系支持</span><h2>答案还不够？<br />告诉我们发生了什么</h2><p>只提供处理问题需要的信息当前通过公开邮箱接收请求不虚构回复时效</p></div>
        <aside><a href={contactMailto("FitMeet 支持请求")}>联系 {siteConfig.contactEmail}<FiArrowUpRight /></a><Link href="/safety">查看安全设计<FiArrowUpRight /></Link><Link href="/community-guidelines">阅读社区准则<FiArrowUpRight /></Link></aside>
      </section>
      <SiteFooter />
    </main>
  );
}
