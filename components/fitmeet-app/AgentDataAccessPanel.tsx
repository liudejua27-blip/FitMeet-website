'use client';

import { useId, useState, type ComponentType } from 'react';
import {
  FiAlertTriangle,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiDatabase,
  FiLock,
  FiMessageCircle,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';
import styles from './agent-data-access.module.css';

export type AgentPrivateMessageAccess = 'shared_only' | 'disabled';

export type AgentDataAccessSettings = {
  profileConfirmed: boolean;
  capabilityOfferings: boolean;
  verificationBadges: boolean;
  demands: boolean;
  needWiki: boolean;
  confirmedMemory: boolean;
  publicPosts: boolean;
  fulfillmentHistory: boolean;
  relationshipSummary: boolean;
  personalizedMatching: boolean;
  privateMessages: AgentPrivateMessageAccess;
  revision: number;
  updatedAt?: string | null;
};

export type AgentDataAccessLog = {
  id: string;
  purpose: string;
  sources: readonly string[];
  subjectType?: string | null;
  subjectId?: string | null;
  createdAt: string;
};

type BooleanAccessKey = Exclude<
  keyof AgentDataAccessSettings,
  'privateMessages' | 'revision' | 'updatedAt'
>;

export type AgentDataAccessPatch = {
  expectedRevision: number;
} & Partial<Pick<AgentDataAccessSettings, BooleanAccessKey | 'privateMessages'>>;

export type AgentDataAccessPanelProps = {
  settings: AgentDataAccessSettings | null;
  logs: readonly AgentDataAccessLog[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onChange: (patch: AgentDataAccessPatch) => void | Promise<void>;
  className?: string;
};

type AccessItem = {
  key: BooleanAccessKey;
  title: string;
  description: string;
};

type AccessGroup = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ 'aria-hidden'?: boolean }>;
  items: readonly AccessItem[];
  footer: string;
  tone?: 'warning';
};

const ACCESS_GROUPS: readonly AccessGroup[] = [
  {
    id: 'available',
    title: 'Agent 可用资料',
    description: '用于理解当前目标、生成需求卡和解释推荐。',
    icon: FiDatabase,
    items: [
      { key: 'profileConfirmed', title: '已确认资料', description: '只读取你已经确认的人物资料。' },
      { key: 'capabilityOfferings', title: '正式能力', description: '用于能力供需匹配与候选排序。' },
      { key: 'verificationBadges', title: '认证标识', description: '只读取认证结果，不读取证件原图。' },
      { key: 'demands', title: '我的需求', description: '用于延续你正在处理的真实目标。' },
      { key: 'needWiki', title: '需求资料', description: '用于补齐已确认的长期需求背景。' },
      { key: 'confirmedMemory', title: '已确认记忆', description: '只使用你保留且未撤销的记忆。' },
    ],
    footer: '关闭正式能力会让新的能力匹配失效；关闭其他资料后，相关需求整理与候选解释也会失去对应依据。',
    tone: 'warning',
  },
  {
    id: 'additional',
    title: '需要单独授权',
    description: '默认不参与推理，只有开启后才会用于新的推荐。',
    icon: FiLock,
    items: [
      { key: 'publicPosts', title: '公开动态', description: '仅使用你已公开发布的内容摘要。' },
      { key: 'fulfillmentHistory', title: '过往履约摘要', description: '用于理解守约与协作情况，不展示完整记录。' },
      { key: 'relationshipSummary', title: '关系状态摘要', description: '不会暴露第三方身份或私密关系细节。' },
    ],
    footer: '关闭后，这类资料不会再进入新的推荐或回答；已经生成的服务端记录仍按隐私政策保留或删除。',
  },
  {
    id: 'matching',
    title: '个性化匹配',
    description: '决定 Agent 是否能把你的资料用于匹配决策。',
    icon: FiShield,
    items: [
      { key: 'personalizedMatching', title: '允许个性化能力匹配', description: '关闭后，不再使用你的能力与偏好产生个性化候选。' },
    ],
    footer: '关闭个性化能力匹配后，依赖这些资料的相关匹配会失效，正在进行的流程可能无法继续产生候选。',
    tone: 'warning',
  },
];

const SOURCE_LABELS: Readonly<Record<string, string>> = {
  profileConfirmed: '已确认资料',
  capabilityOfferings: '正式能力',
  verificationBadges: '认证标识',
  demands: '我的需求',
  needWiki: '需求资料',
  confirmedMemory: '已确认记忆',
  publicPosts: '公开动态',
  fulfillmentHistory: '履约摘要',
  relationshipSummary: '关系摘要',
  sharedPrivateMessages: '主动分享的私聊片段',
  profile_confirmed: '已确认资料',
  capability_offerings: '正式能力',
  verification_badges: '认证标识',
  need_wiki: '需求资料',
  confirmed_memory: '已确认记忆',
  public_posts: '公开动态',
  fulfillment_history: '履约摘要',
  relationship_summary: '关系摘要',
  shared_private_messages: '主动分享的私聊片段',
};

const PURPOSE_LABELS: Readonly<Record<string, string>> = {
  capability_matching: '能力匹配',
  capability_recommendation: '能力推荐',
  candidate_explanation: '候选解释',
  agent_context: 'Agent 回答',
  agent_turn: 'Agent 回答',
};

const SHANGHAI_DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function formatAccessTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : SHANGHAI_DATE_FORMATTER.format(date);
}

function purposeLabel(value: string) {
  return PURPOSE_LABELS[value] ?? (value.trim() || '数据使用');
}

function sourceLabel(value: string) {
  return SOURCE_LABELS[value] ?? value;
}

function LoadingState() {
  return (
    <div className={styles.centerState} role="status" aria-live="polite">
      <FiRefreshCw className={styles.spin} aria-hidden />
      <strong>正在读取数据权限</strong>
      <span>以服务端最新版本为准，不会用默认值覆盖你的选择。</span>
    </div>
  );
}

export function AgentDataAccessPanel({
  settings,
  logs,
  loading,
  saving,
  error,
  onRefresh,
  onChange,
  className,
}: AgentDataAccessPanelProps) {
  const titleId = useId();
  const [logsOpen, setLogsOpen] = useState(true);
  const unavailable = loading || saving || !settings;

  const emitChange = (patch: Omit<AgentDataAccessPatch, 'expectedRevision'>) => {
    if (!settings || unavailable) return;
    void onChange({ expectedRevision: settings.revision, ...patch });
  };

  return (
    <section
      className={[styles.panel, className].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      aria-busy={loading || saving}
    >
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden><FiShield /></span>
        <div className={styles.heroCopy}>
          <h2 id={titleId}>Agent 数据权限</h2>
          <p>Agent 只读取本次目的所需的结构化摘要，不会任意浏览你的全部数据。</p>
        </div>
        <button
          type="button"
          className={styles.refreshButton}
          disabled={loading || saving}
          onClick={() => void onRefresh()}
        >
          <FiRefreshCw className={loading ? styles.spin : undefined} aria-hidden />
          <span>{loading ? '同步中' : '重新同步'}</span>
        </button>
      </header>

      <div className={styles.statusRegion} aria-live="polite" aria-atomic="true">
        {saving ? (
          <p className={styles.savingStatus}><FiRefreshCw className={styles.spin} aria-hidden /> 正在保存第 {settings?.revision ?? '—'} 版权限…</p>
        ) : null}
        {error ? (
          <div className={styles.errorNotice} role="alert">
            <FiAlertTriangle aria-hidden />
            <span>{error}</span>
            <button type="button" disabled={loading || saving} onClick={() => void onRefresh()}>重试</button>
          </div>
        ) : null}
      </div>

      {loading && !settings ? <LoadingState /> : null}

      {!loading && !settings ? (
        <div className={styles.centerState}>
          <FiAlertTriangle aria-hidden />
          <strong>暂时无法显示权限</strong>
          <span>没有读取到服务端设置，本页不会假设或代填任何权限。</span>
          <button type="button" onClick={() => void onRefresh()}>重新加载</button>
        </div>
      ) : null}

      {settings ? (
        <div className={styles.content}>
          <div className={styles.revisionBar}>
            <span><FiCheck aria-hidden /> 已与账号同步</span>
            <span>权限版本 {settings.revision}</span>
            {settings.updatedAt ? <time dateTime={settings.updatedAt}>更新于 {formatAccessTime(settings.updatedAt)}</time> : null}
          </div>

          {ACCESS_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const groupHeadingId = `${titleId}-${group.id}`;
            return (
              <section className={styles.group} key={group.id} aria-labelledby={groupHeadingId}>
                <header className={styles.groupHeader}>
                  <span aria-hidden><GroupIcon /></span>
                  <div>
                    <h3 id={groupHeadingId}>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                </header>
                <div className={styles.accessList}>
                  {group.items.map((item) => (
                    <label className={styles.accessRow} key={item.key}>
                      <span className={styles.accessCopy}>
                        <strong>{item.title}</strong>
                        <small>{item.description}</small>
                      </span>
                      <input
                        type="checkbox"
                        role="switch"
                        checked={settings[item.key]}
                        disabled={unavailable}
                        aria-label={item.title}
                        onChange={(event) => emitChange({ [item.key]: event.target.checked })}
                      />
                      <span className={styles.switchTrack} aria-hidden><span /></span>
                    </label>
                  ))}
                </div>
                <p className={group.tone === 'warning' ? styles.warningFooter : styles.groupFooter}>
                  {group.tone === 'warning' ? <FiAlertTriangle aria-hidden /> : <FiShield aria-hidden />}
                  <span>{group.footer}</span>
                </p>
              </section>
            );
          })}

          <section className={styles.group} aria-labelledby={`${titleId}-private-messages`}>
            <header className={styles.groupHeader}>
              <span aria-hidden><FiMessageCircle /></span>
              <div>
                <h3 id={`${titleId}-private-messages`}>私聊片段</h3>
                <p>私聊始终需要逐条主动分享，Agent 不能浏览整段会话。</p>
              </div>
            </header>
            <label className={styles.accessRow}>
              <span className={styles.accessCopy}>
                <strong>允许主动分享私聊片段</strong>
                <small>{settings.privateMessages === 'shared_only' ? '只使用你每次主动选择的消息片段。' : '任何私聊片段都不会用于推荐或回答。'}</small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={settings.privateMessages === 'shared_only'}
                disabled={unavailable}
                aria-label="允许主动分享私聊片段"
                onChange={(event) => emitChange({ privateMessages: event.target.checked ? 'shared_only' : 'disabled' })}
              />
              <span className={styles.switchTrack} aria-hidden><span /></span>
            </label>
            <p className={styles.warningFooter}>
              <FiAlertTriangle aria-hidden />
              <span>关闭后，会撤销仍在有效期内的已共享私聊片段；之后 Agent 也不会再将这些片段用于推荐或回答。</span>
            </p>
          </section>

          <details
            className={styles.logDisclosure}
            open={logsOpen}
            onToggle={(event) => setLogsOpen(event.currentTarget.open)}
          >
            <summary>
              <span className={styles.summaryIcon} aria-hidden><FiClock /></span>
              <span>
                <strong>最近数据使用记录</strong>
                <small>{logs.length ? `已读取 ${logs.length} 条服务端记录` : 'Agent 真正使用资料后才会产生记录'}</small>
              </span>
              <FiChevronDown className={styles.disclosureChevron} aria-hidden />
            </summary>
            <div className={styles.logBody}>
              {loading && logs.length === 0 ? (
                <p className={styles.logState} role="status"><FiRefreshCw className={styles.spin} aria-hidden /> 正在读取使用记录…</p>
              ) : null}
              {!loading && !error && logs.length === 0 ? (
                <p className={styles.logState}>还没有使用记录。Agent 完成匹配、候选解释或回答时，真实记录会显示在这里。</p>
              ) : null}
              {!loading && error && logs.length === 0 ? (
                <p className={styles.logState}>使用记录暂时没有同步成功，本页不会把空列表当作真实记录。</p>
              ) : null}
              {logs.length ? (
                <ol className={styles.logList}>
                  {logs.map((entry) => (
                    <li key={entry.id}>
                      <span className={styles.logMarker} aria-hidden />
                      <div>
                        <strong>{purposeLabel(entry.purpose)}</strong>
                        <p>{entry.sources.length ? entry.sources.map(sourceLabel).join(' · ') : '服务端未提供资料来源'}</p>
                        <time dateTime={entry.createdAt}>{formatAccessTime(entry.createdAt)}</time>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </details>
        </div>
      ) : null}
    </section>
  );
}
