'use client';

import { useEffect, useId, useState } from 'react';
import { FiAlertTriangle, FiCheck, FiRefreshCw, FiShield, FiUserPlus, FiX } from 'react-icons/fi';
import type { FitMeetActionResult } from '@/lib/fitmeet-interaction-state';
import { useAccessibleDialog } from './useAccessibleDialog';
import styles from './friend-request-dialog.module.css';

export type FriendRequestContext = {
  demandTitle?: string;
  reason?: string;
  sourceLabel: string;
};

export function FriendRequestDialog({
  open,
  userName,
  initialMessage,
  context,
  onClose,
  onSubmit,
}: {
  open: boolean;
  userName: string;
  initialMessage: string;
  context: FriendRequestContext;
  onClose: () => void;
  onSubmit: (message: string) => Promise<FitMeetActionResult>;
}) {
  const [message, setMessage] = useState(initialMessage);
  const [status, setStatus] = useState<'idle' | 'pending' | 'error'>('idle');
  const [error, setError] = useState('');
  const descriptionId = useId();
  const errorId = useId();
  const close = () => {
    if (status !== 'pending') onClose();
  };
  const dialogRef = useAccessibleDialog(open, close);

  useEffect(() => {
    if (!open) return;
    setMessage(initialMessage);
    setStatus('idle');
    setError('');
  }, [initialMessage, open, userName]);

  if (!open) return null;

  const submit = async () => {
    const value = message.trim();
    if (!value || status === 'pending') return;
    setStatus('pending');
    setError('');
    try {
      const result = await onSubmit(value);
      if (result.ok) {
        onClose();
        return;
      }
      setError(result.error);
      setStatus('error');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '好友申请未能发送，请稍后再试。');
      setStatus('error');
    }
  };

  return (
    <div className={styles.shade} role="presentation" onMouseDown={close}>
      <section
        ref={dialogRef}
        tabIndex={-1}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${descriptionId}-title`}
        aria-describedby={`${descriptionId}-copy${error ? ` ${errorId}` : ''}`}
        aria-busy={status === 'pending'}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <span className={styles.icon}><FiUserPlus /></span>
          <div>
            <h2 id={`${descriptionId}-title`}>向 {userName} 发送好友申请</h2>
            <p id={`${descriptionId}-copy`}>对方接受前不会开放连续私信，也不会自动发送活动邀请。</p>
          </div>
          <button type="button" className={styles.close} aria-label="关闭好友申请" disabled={status === 'pending'} onClick={close}>
            <FiX />
          </button>
        </header>

        <section className={styles.context} aria-label="好友申请上下文">
          <strong>本次申请上下文</strong>
          <dl>
            <div><dt>来源</dt><dd>{context.sourceLabel}</dd></div>
            {context.demandTitle ? <div><dt>关联需求</dt><dd>{context.demandTitle}</dd></div> : null}
            {context.reason ? <div><dt>共同点</dt><dd>{context.reason}</dd></div> : null}
          </dl>
        </section>

        <label className={styles.field}>
          <span>申请文案</span>
          <textarea
            value={message}
            maxLength={120}
            disabled={status === 'pending'}
            aria-invalid={status === 'error'}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setMessage(event.target.value);
              if (status === 'error') {
                setStatus('idle');
                setError('');
              }
            }}
          />
          <small>{message.length}/120</small>
        </label>

        {error ? <p id={errorId} className={styles.error} role="alert"><FiAlertTriangle /> {error}</p> : null}

        <p className={styles.safety}><FiShield /> 只会发送上面的文案与关联上下文；不会共享联系方式、精确位置或未公开资料。</p>

        <footer>
          <button type="button" disabled={status === 'pending'} onClick={close}>取消</button>
          <button type="button" className={styles.primary} disabled={status === 'pending' || !message.trim()} onClick={() => void submit()}>
            {status === 'pending' ? <><FiRefreshCw className={styles.spin} /> 正在发送…</> : <><FiCheck /> 确认发送申请</>}
          </button>
        </footer>
      </section>
    </div>
  );
}
