'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FiAlertCircle, FiArrowRight, FiCheck, FiEye, FiEyeOff, FiLock, FiRefreshCw } from 'react-icons/fi';
import { FitMeetApiClient } from '@/lib/fitmeet-api-client';
import { fitMeetEmailActionTokenFromFragment } from '@/lib/fitmeet-email-action-client';
import { isValidFitMeetPassword } from '@/lib/fitmeet-login-state';
import { EmailActionShell } from './EmailActionShell';
import styles from './email-action.module.css';

export function ResetPasswordExperience() {
  const apiRef = useRef(new FitMeetApiClient(() => null));
  const tokenRef = useRef<string | null>(null);
  const startedRef = useRef(false);
  const [tokenReady, setTokenReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    tokenRef.current = fitMeetEmailActionTokenFromFragment(window.location.hash);
    window.history.replaceState(null, '', window.location.pathname);
    setTokenReady(Boolean(tokenRef.current));
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = tokenRef.current;
    if (!token) {
      setError('重置链接无效或已过期，请重新申请。');
      return;
    }
    if (!isValidFitMeetPassword(password)) {
      setError('密码需要 8–72 位。');
      return;
    }
    if (password !== confirmation) {
      setError('两次输入的密码不一致。');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiRef.current.resetWebPassword(token, password);
      tokenRef.current = null;
      setPassword('');
      setConfirmation('');
      setComplete(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '暂时无法重置密码，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EmailActionShell
      eyebrow="账号恢复"
      title={complete ? '密码已更新' : '设置新密码'}
      description="重置成功后，其他设备上的旧登录状态会被安全撤销。"
    >
      {tokenReady === null ? (
        <div className={`${styles.statusCard} ${styles.statussubmitting}`} role="status" aria-live="polite">
          <span className={styles.statusIcon}><FiRefreshCw aria-hidden="true" /></span>
          <div><strong>请稍候</strong><p>正在安全读取重置信息…</p></div>
        </div>
      ) : complete ? (
        <>
          <div className={`${styles.statusCard} ${styles.statusverified}`} role="status" aria-live="polite">
            <span className={styles.statusIcon}><FiCheck aria-hidden="true" /></span>
            <div><strong>密码重置完成</strong><p>请使用新密码重新登录 FitMeet。</p></div>
          </div>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/agent/try">返回登录</Link>
          </div>
        </>
      ) : !tokenReady ? (
        <>
          <div className={`${styles.statusCard} ${styles.statuserror}`} role="alert">
            <span className={styles.statusIcon}><FiAlertCircle aria-hidden="true" /></span>
            <div><strong>重置链接不可用</strong><p>链接可能不完整、已过期或已经使用。</p></div>
          </div>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/auth/password/forgot">重新申请重置邮件</Link>
          </div>
        </>
      ) : (
        <form className={styles.form} onSubmit={submit} noValidate aria-busy={submitting}>
          <PasswordField
            id="new-password"
            label="新密码"
            value={password}
            visible={showPassword}
            disabled={submitting}
            onChange={(value) => { setPassword(value); setError(''); }}
            onToggle={() => setShowPassword((current) => !current)}
          />
          <PasswordField
            id="confirm-password"
            label="确认新密码"
            value={confirmation}
            visible={showConfirmation}
            disabled={submitting}
            onChange={(value) => { setConfirmation(value); setError(''); }}
            onToggle={() => setShowConfirmation((current) => !current)}
          />
          <p className={styles.hint}>使用 8–72 位密码，请勿复用其他网站的密码。</p>
          {error ? (
            <p className={styles.error} role="alert"><FiAlertCircle aria-hidden="true" /> {error}</p>
          ) : null}
          <button className={styles.primaryAction} type="submit" disabled={submitting}>
            {submitting ? <><FiRefreshCw aria-hidden="true" /> 正在更新…</> : <>更新密码 <FiArrowRight aria-hidden="true" /></>}
          </button>
        </form>
      )}
    </EmailActionShell>
  );
}

function PasswordField({
  id,
  label,
  value,
  visible,
  disabled,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label htmlFor={id}>
      <span>{label}</span>
      <div className={styles.input}>
        <FiLock aria-hidden="true" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          disabled={disabled}
          placeholder="输入 8–72 位密码"
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          className={styles.reveal}
          type="button"
          disabled={disabled}
          aria-label={visible ? `隐藏${label}` : `显示${label}`}
          aria-pressed={visible}
          onClick={onToggle}
        >
          {visible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
        </button>
      </div>
    </label>
  );
}
