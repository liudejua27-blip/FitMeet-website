'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { FiAlertCircle, FiArrowRight, FiCheck, FiMail, FiRefreshCw } from 'react-icons/fi';
import { FitMeetApiClient } from '@/lib/fitmeet-api-client';
import { isValidFitMeetEmail, normalizeFitMeetEmail } from '@/lib/fitmeet-login-state';
import { EmailActionShell } from './EmailActionShell';
import styles from './email-action.module.css';

export function ForgotPasswordExperience() {
  const apiRef = useRef(new FitMeetApiClient(() => null));
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidFitMeetEmail(email)) {
      setError('请输入有效邮箱地址。');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiRef.current.requestWebPasswordReset(normalizeFitMeetEmail(email));
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '暂时无法发送重置邮件，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EmailActionShell
      eyebrow="账号恢复"
      title={sent ? '检查你的邮箱' : '重置密码'}
      description="输入注册邮箱，我们会发送一封限时有效的密码重置邮件。"
    >
      {sent ? (
        <>
          <div className={`${styles.statusCard} ${styles.statusverified}`} role="status" aria-live="polite">
            <span className={styles.statusIcon}><FiCheck aria-hidden="true" /></span>
            <div>
              <strong>请求已受理</strong>
              <p>如果该邮箱已注册，你会收到密码重置邮件。请同时检查垃圾邮件目录。</p>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.secondaryAction} type="button" onClick={() => setSent(false)}>
              重新填写邮箱
            </button>
            <Link className={styles.primaryAction} href="/agent/try">返回登录</Link>
          </div>
        </>
      ) : (
        <form className={styles.form} onSubmit={submit} noValidate aria-busy={submitting}>
          <label>
            <span>注册邮箱</span>
            <div className={`${styles.input} ${error ? styles.inputError : ''}`}>
              <FiMail aria-hidden="true" />
              <input
                type="email"
                name="email"
                value={email}
                maxLength={254}
                inputMode="email"
                autoComplete="email"
                enterKeyHint="send"
                autoFocus
                disabled={submitting}
                placeholder="name@example.com"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'forgot-password-error' : undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError('');
                }}
              />
            </div>
          </label>
          {error ? (
            <p id="forgot-password-error" className={styles.error} role="alert">
              <FiAlertCircle aria-hidden="true" /> {error}
            </p>
          ) : null}
          <button className={styles.primaryAction} type="submit" disabled={submitting}>
            {submitting ? <><FiRefreshCw aria-hidden="true" /> 正在发送…</> : <>发送重置邮件 <FiArrowRight aria-hidden="true" /></>}
          </button>
        </form>
      )}
    </EmailActionShell>
  );
}
