"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiLock, FiMessageCircle, FiShield, FiSmartphone } from "react-icons/fi";
import { FitMeetBrandIcon } from "./FitMeetBrandIcon";
import styles from "./fitmeet-complete.module.css";

type FitMeetLoginProps = {
  onLogin: (phone: string, code: string) => Promise<unknown>;
  onSendCode: (phone: string) => Promise<{ message?: string; expiresIn?: number }>;
  initialError?: string | null;
};

function normalizedPhone(value: string) {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function FitMeetLogin({ onLogin, onSendCode, initialError }: FitMeetLoginProps) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [error, setError] = useState(initialError || "");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!countdown) return;
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const sendCode = async () => {
    if (!/^1\d{10}$/.test(phone)) {
      setError("请输入有效手机号。");
      return;
    }
    setSendingCode(true);
    setError("");
    setNotice("");
    try {
      const result = await onSendCode(phone);
      setNotice(result.message || "验证码已发送，请查看短信。");
      setCountdown(Math.min(Math.max(result.expiresIn || 60, 30), 120));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "验证码发送失败，请稍后重试。");
    } finally {
      setSendingCode(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^1\d{10}$/.test(phone)) return setError("请输入有效手机号。");
    if (code.trim().length < 4) return setError("请输入短信验证码。");
    if (!agreementAccepted) return setError("请先同意《用户协议》和《隐私政策》。");
    setSubmitting(true);
    setError("");
    try {
      await onLogin(phone, code.trim());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "登录暂时不可用，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return <main className={styles.appPage}>
    <section className={`${styles.mobileSurface} ${styles.internalLogin} ${styles.formalLogin}`} aria-label="FitMeet 登录">
      <div className={styles.loginGlow} />
      <header><FitMeetBrandIcon size={48} priority /><span>FitMeet</span></header>
      <section>
        <p className={styles.loginEyebrow}>让社交更简单</p>
        <h1>从一次舒服的连接开始。</h1>
        <p>登录后，网页、iOS 和微信端会使用同一个 FitMeet 账号，需求、匹配与消息以服务端真实状态为准。</p>
        <form onSubmit={submit}>
          <div className={styles.loginFormTitle}><FiSmartphone /><strong>手机号验证码登录</strong><span>主登录</span></div>
          <label><span>手机号</span><input value={phone} onChange={(event) => setPhone(normalizedPhone(event.target.value))} inputMode="tel" autoComplete="tel" placeholder="请输入手机号" aria-label="手机号" /></label>
          <label><span>短信验证码</span><div className={styles.loginCodeRow}><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))} inputMode="numeric" autoComplete="one-time-code" placeholder="请输入验证码" aria-label="短信验证码" /><button type="button" onClick={() => void sendCode()} disabled={sendingCode || countdown > 0}>{sendingCode ? "发送中" : countdown ? `${countdown}s` : "获取验证码"}</button></div></label>
          {notice ? <p className={styles.loginNotice} role="status"><FiMessageCircle />{notice}</p> : null}
          {error ? <p className={styles.loginError} role="alert">{error}</p> : null}
          <label className={styles.loginAgreement}><input type="checkbox" checked={agreementAccepted} onChange={(event) => setAgreementAccepted(event.target.checked)} /><span>我已阅读并同意 <Link href="/terms">《用户协议》</Link> 和 <Link href="/privacy">《隐私政策》</Link></span></label>
          <button type="submit" className={styles.primaryButton} disabled={submitting}>{submitting ? "正在登录…" : <>登录 FitMeet <FiArrowRight /></>}</button>
        </form>
      </section>
      <footer><p><FiShield /> 登录凭证仅用于账号安全、恢复登录与风险控制。</p><p><FiLock /> 所有真实发布、邀请和消息动作都需要你的确认。</p></footer>
    </section>
  </main>;
}
