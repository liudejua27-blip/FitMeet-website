"use client";

import { useState } from "react";
import { FiArrowRight, FiLock, FiShield } from "react-icons/fi";
import { FitMeetBrandIcon } from "./FitMeetBrandIcon";
import styles from "./fitmeet-complete.module.css";

export function InternalTesterLogin({ onLogin, initialError }: { onLogin: (accessCode: string) => Promise<unknown>; initialError?: string | null }) {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState(initialError || "");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessCode.trim()) {
      setError("请输入项目组发放的内测邀请码。");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onLogin(accessCode.trim());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "内测登录暂时不可用，请联系项目组。");
    } finally {
      setSubmitting(false);
    }
  };

  return <main className={styles.appPage}>
    <section className={`${styles.mobileSurface} ${styles.internalLogin}`} aria-label="FitMeet 内测登录">
      <div className={styles.loginGlow} />
      <header><FitMeetBrandIcon size={48} priority /><span>FitMeet 内测</span></header>
      <section>
        <p className={styles.loginEyebrow}>移动端体验</p>
        <h1>从一次舒服的连接开始。</h1>
        <p>输入项目组发放的邀请码，进入你自己的测试档案。资料、需求、匹配和聊天都会写入同一套 FitMeet 服务。</p>
        <form onSubmit={submit}>
          <label><span>内测邀请码</span><input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} autoCapitalize="none" autoComplete="one-time-code" placeholder="例如：2601" aria-label="内测邀请码" /></label>
          {error ? <p className={styles.loginError} role="alert">{error}</p> : null}
          <button type="submit" className={styles.primaryButton} disabled={submitting}>{submitting ? "正在进入…" : <>进入内测 <FiArrowRight /></>}</button>
        </form>
      </section>
      <footer><p><FiShield /> 不使用手机号；邀请码和测试身份只在服务端校验。</p><p><FiLock /> 没有邀请码？请联系 FitMeet 项目组。</p></footer>
    </section>
  </main>;
}
