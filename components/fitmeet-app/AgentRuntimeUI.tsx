'use client';

import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { FiAlertTriangle, FiArrowRight, FiCheck, FiChevronDown, FiCircle, FiClock } from 'react-icons/fi';
import type { AgentActivityMode, AgentRunPresentation } from '@/lib/fitmeet-agent-presentation';
import styles from './agent-runtime.module.css';

export function AgentActivityIndicator({
  mode = 'thinking',
  size = 'medium',
}: {
  mode?: AgentActivityMode;
  size?: 'small' | 'medium' | 'large';
}) {
  return (
    <span
      className={styles.activityIndicator}
      data-mode={mode}
      data-size={size}
      aria-hidden="true"
    >
      {Array.from({ length: 9 }, (_, index) => (
        <i key={index} style={{ '--activity-index': index } as CSSProperties} />
      ))}
    </span>
  );
}

export function AgentTaskProgress({
  presentation,
  defaultExpanded = true,
}: {
  presentation: AgentRunPresentation;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentId = useId();
  const steps = presentation.steps;
  const completeCount = steps.filter((step) => step.state === 'complete').length;
  const stepSignature = useMemo(
    () => steps.map((step) => `${step.id}:${step.state}`).join('|'),
    [steps],
  );

  useEffect(() => {
    if (steps.length && steps.every((step) => step.state === 'complete')) {
      setExpanded(false);
      return;
    }
    if (steps.some((step) => ['running', 'waiting', 'failed'].includes(step.state))) {
      setExpanded(true);
    }
  }, [stepSignature]);

  return (
    <section className={styles.taskProgress} aria-label="小福处理进度">
      <button
        type="button"
        className={styles.taskProgressHeader}
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((current) => !current)}
      >
        <AgentActivityIndicator mode={presentation.activity} />
        <span className={styles.taskProgressCopy} role="status" aria-live="polite" aria-atomic="true">
          <strong>{presentation.title}</strong>
          <small>{presentation.detail}</small>
        </span>
        <span className={styles.taskProgressCount} aria-label={`${completeCount}/${steps.length}`}>
          {completeCount}/{steps.length}
        </span>
        <FiChevronDown className={styles.taskProgressChevron} aria-hidden="true" />
      </button>
      <div
        id={contentId}
        className={styles.taskProgressCollapsible}
        data-expanded={expanded ? 'true' : 'false'}
      >
        <ol className={styles.taskProgressList} aria-label="本轮处理进度">
          {steps.map((step) => {
            const state = step.state;
            return (
              <li key={step.id} data-state={state} aria-current={state === 'running' ? 'step' : undefined}>
                <span className={styles.taskProgressIcon} aria-hidden="true">
                  {state === 'complete' ? (
                    <FiCheck />
                  ) : state === 'running' ? (
                    <FiArrowRight />
                  ) : state === 'waiting' ? (
                    <FiClock />
                  ) : state === 'failed' ? (
                    <FiAlertTriangle />
                  ) : (
                    <FiCircle />
                  )}
                </span>
                <span>{step.label}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function StreamingAgentText({ live, children }: { live: boolean; children: ReactNode }) {
  return (
    <span className={styles.streamingText} data-live={live ? 'true' : 'false'}>
      {children}
      {live ? <i className={styles.streamingCaret} aria-hidden="true" /> : null}
    </span>
  );
}

export function AgentInlineActivity({
  mode,
  children,
}: {
  mode: AgentActivityMode;
  children: ReactNode;
}) {
  return (
    <span className={styles.inlineActivity}>
      <AgentActivityIndicator mode={mode} size="small" />
      <span>{children}</span>
    </span>
  );
}
