'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiAlertCircle, FiCheck, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { FitMeetApiClient } from '@/lib/fitmeet-api-client';
import { fitMeetEmailActionTokenFromFragment } from '@/lib/fitmeet-email-action-client';
import { EmailActionShell } from './EmailActionShell';
import styles from './email-action.module.css';

type VerificationState = 'reading' | 'submitting' | 'verified' | 'error';

export function EmailVerificationExperience() {
  const apiRef = useRef(new FitMeetApiClient(() => null));
  const tokenRef = useRef<string | null>(null);
  const startedRef = useRef(false);
  const [state, setState] = useState<VerificationState>('reading');
  const [message, setMessage] = useState('正在安全读取验证信息…');

  const verify = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) {
      setState('error');
      setMessage('验证链接无效或已过期，请重新发送验证邮件。');
      return;
    }
    setState('submitting');
    setMessage('正在验证你的邮箱…');
    try {
      await apiRef.current.verifyWebEmail(token);
      tokenRef.current = null;
      setState('verified');
      setMessage('邮箱验证完成，现在可以安全登录 FitMeet。');
    } catch (reason) {
      setState('error');
      setMessage(reason instanceof Error ? reason.message : '暂时无法完成验证，请稍后重试。');
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    tokenRef.current = fitMeetEmailActionTokenFromFragment(window.location.hash);
    // Remove both fragment and unexpected query data before any subsequent
    // navigation or referrer can expose an action credential.
    window.history.replaceState(null, '', window.location.pathname);
    void verify();
  }, [verify]);

  const pending = state === 'reading' || state === 'submitting';
  const icon = pending
    ? <FiLoader aria-hidden="true" />
    : state === 'verified'
      ? <FiCheck aria-hidden="true" />
      : <FiAlertCircle aria-hidden="true" />;

  return (
    <EmailActionShell
      eyebrow="邮箱验证"
      title={state === 'verified' ? '验证完成' : '确认你的邮箱'}
      description="邮箱验证用于保护账号恢复与跨端登录安全。"
    >
      <div
        className={`${styles.statusCard} ${styles[`status${state}`]}`}
        role={state === 'error' ? 'alert' : 'status'}
        aria-live="polite"
        aria-busy={pending}
      >
        <span className={styles.statusIcon}>{icon}</span>
        <div>
          <strong>{pending ? '请稍候' : state === 'verified' ? '邮箱已验证' : '验证未完成'}</strong>
          <p>{message}</p>
        </div>
      </div>

      <div className={styles.actions}>
        {state === 'verified' ? (
          <Link className={styles.primaryAction} href="/agent/try">返回登录</Link>
        ) : state === 'error' && tokenRef.current ? (
          <button className={styles.primaryAction} type="button" onClick={() => void verify()}>
            <FiRefreshCw aria-hidden="true" /> 重新验证
          </button>
        ) : state === 'error' ? (
          <Link className={styles.primaryAction} href="/agent/try">返回登录并重新发送</Link>
        ) : null}
      </div>
    </EmailActionShell>
  );
}
