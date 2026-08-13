'use client';

import { useDeferredValue, useMemo, useRef, useState } from 'react';
import {
  FiBell,
  FiCalendar,
  FiChevronRight,
  FiHeart,
  FiMessageCircle,
  FiRefreshCw,
  FiSearch,
  FiUserPlus,
  FiX,
} from 'react-icons/fi';
import type {
  AgentInboxEvent,
  FitMeetConnectionRequest,
  FitMeetConversation,
  FitMeetIntentApplication,
  MeetInvitation,
} from '@/lib/fitmeet-api-contract';
import {
  dedupeAndSortConversations,
  formatInboxTimestamp,
} from '@/lib/fitmeet-social-state';
import styles from './fitmeet-complete.module.css';
import { useAccessibleDialog } from './useAccessibleDialog';

type MessageCategory = 'all' | 'private' | 'interaction' | 'system';
type MessageHomeCategory = Exclude<MessageCategory, 'all'>;
type InvitationAction = 'accept' | 'reject' | 'cancel';
type SearchItem = {
  id: string;
  category: Exclude<MessageCategory, 'all'>;
  title: string;
  subtitle: string;
  unread: number;
  action: () => void;
};

function MessageAvatar({ conversation }: { conversation: FitMeetConversation }) {
  const name = conversation.title || conversation.displayName || conversation.username || 'FitMeet 用户';
  const url = conversation.avatar || conversation.peer?.avatar;
  return url ? (
    <img className={styles.messageAvatar} src={url} alt={`${name}头像`} />
  ) : (
    <span className={styles.messageAvatarFallback}>{name.slice(0, 1)}</span>
  );
}

export function MessagesExperience({
  invitations,
  conversations,
  incomingConnections,
  outgoingConnections,
  agentEvents,
  ownerSocialApplications,
  ownerTaskApplications,
  currentUserId,
  unreadCount,
  onConversation,
  onInvitation,
  onIntentApplication,
  onSystemEvent,
  onMeet,
  onRelationship,
  onNotifications,
  onRefresh,
}: {
  invitations: MeetInvitation[];
  conversations: FitMeetConversation[];
  incomingConnections: FitMeetConnectionRequest[];
  outgoingConnections: FitMeetConnectionRequest[];
  agentEvents: AgentInboxEvent[];
  ownerSocialApplications: FitMeetIntentApplication[];
  ownerTaskApplications: FitMeetIntentApplication[];
  currentUserId: number;
  unreadCount: number;
  onConversation: (id: string) => void;
  onInvitation: (invitation: MeetInvitation, action: InvitationAction) => Promise<void>;
  onIntentApplication: (
    kind: 'social' | 'task',
    application: FitMeetIntentApplication,
    decision: 'accept' | 'reject',
  ) => void;
  onSystemEvent: (event: AgentInboxEvent) => void;
  onMeet: () => void;
  onRelationship: () => void;
  onNotifications: () => void;
  onRefresh: () => Promise<void>;
}) {
  const [category, setCategory] = useState<MessageHomeCategory>('private');
  const [searchCategory, setSearchCategory] = useState<MessageCategory>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);
  const [pendingInvitationActions, setPendingInvitationActions] = useState<
    Partial<Record<number, InvitationAction>>
  >({});
  const [invitationActionErrors, setInvitationActionErrors] = useState<
    Partial<Record<number, string>>
  >({});
  const invitationActionLocksRef = useRef(new Set<number>());
  const searchDialogRef = useAccessibleDialog(searchOpen, () => setSearchOpen(false));
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase('zh-CN'));
  const visibleConversations = useMemo(
    () => dedupeAndSortConversations(conversations),
    [conversations],
  );
  const pendingReceived = invitations.filter(
    (item) => item.status === 'pending' && Number(item.inviteeUserId) === Number(currentUserId),
  );
  const pendingSent = invitations.filter(
    (item) => item.status === 'pending' && Number(item.inviterUserId) === Number(currentUserId),
  );
  const pendingSocialApplications = ownerSocialApplications.filter(
    (item) => item.status === 'pending',
  );
  const pendingTaskApplications = ownerTaskApplications.filter((item) => item.status === 'pending');
  const interactionCount =
    pendingReceived.length +
    pendingSent.length +
    incomingConnections.length +
    outgoingConnections.length +
    pendingSocialApplications.length +
    pendingTaskApplications.length;
  // `unreadCount` is the single server-owned aggregate. Event arrays are
  // rendered by category but are not added again, otherwise reconnects or
  // partially acknowledged events would double count the badge.
  const totalUnread = unreadCount;
  const showPrivate = category === 'private';
  const showInteraction = category === 'interaction';
  const showSystem = category === 'system';

  const searchItems = useMemo<SearchItem[]>(
    () => [
      ...visibleConversations.map((item) => ({
        id: `conversation-${item.id}`,
        category: 'private' as const,
        title: item.title || item.displayName || item.username || 'FitMeet 用户',
        subtitle: item.lastMessage || '会话已开放',
        unread: item.unread || 0,
        action: () => onConversation(item.id),
      })),
      ...pendingReceived.map((item) => ({
        id: `received-${item.id}`,
        category: 'interaction' as const,
        title: item.title || '收到活动邀请',
        subtitle: item.message || '等待你决定是否接受',
        unread: 1,
        action: () => onMeet(),
      })),
      ...pendingSent.map((item) => ({
        id: `sent-${item.id}`,
        category: 'interaction' as const,
        title: item.title || '已发送活动邀请',
        subtitle: '等待对方自主决定',
        unread: 0,
        action: () => onMeet(),
      })),
      ...incomingConnections.map((item) => ({
        id: `connection-in-${item.id}`,
        category: 'interaction' as const,
        title: item.requesterName || '收到好友申请',
        subtitle: item.message || '等待你处理关系申请',
        unread: 1,
        action: onRelationship,
      })),
      ...outgoingConnections.map((item) => ({
        id: `connection-out-${item.id}`,
        category: 'interaction' as const,
        title: item.targetName || '好友申请已发送',
        subtitle: '等待对方回应',
        unread: 0,
        action: onRelationship,
      })),
      ...pendingSocialApplications.map((item) => ({
        id: `social-application-${item.id}`,
        category: 'interaction' as const,
        title: '收到社交需求申请',
        subtitle: item.message || `用户 ${item.applicantUserId ?? ''} 希望加入`,
        unread: 1,
        action: onRelationship,
      })),
      ...pendingTaskApplications.map((item) => ({
        id: `task-application-${item.id}`,
        category: 'interaction' as const,
        title: '收到任务申请',
        subtitle: item.message || `用户 ${item.applicantUserId ?? ''} 希望参与`,
        unread: 1,
        action: onRelationship,
      })),
      ...agentEvents.map((item) => ({
        id: `agent-event-${item.id}`,
        category: 'system' as const,
        title: item.title || 'FitMeet 通知',
        subtitle: item.body || item.type || '账号状态已更新',
        unread: 1,
        action: () => onSystemEvent(item),
      })),
    ],
    [
      agentEvents,
      incomingConnections,
      onConversation,
      onMeet,
      onRelationship,
      onSystemEvent,
      outgoingConnections,
      pendingReceived,
      pendingSent,
      pendingSocialApplications,
      pendingTaskApplications,
      visibleConversations,
    ],
  );

  const visibleSearchItems = useMemo(
    () =>
      searchItems.filter((item) => {
        const categoryMatches = searchCategory === 'all' || item.category === searchCategory;
        const queryMatches =
          !deferredQuery ||
          `${item.title} ${item.subtitle} ${item.category}`
            .toLocaleLowerCase('zh-CN')
            .includes(deferredQuery);
        return categoryMatches && queryMatches;
      }),
    [deferredQuery, searchCategory, searchItems],
  );

  const refresh = async () => {
    if (refreshing) return;
    setRefreshNotice(null);
    setRefreshing(true);
    try {
      await onRefresh();
      setRefreshNotice({ tone: 'success', text: '消息已更新' });
    } catch {
      setRefreshNotice({ tone: 'error', text: '刷新失败，请检查网络后重试。' });
    } finally {
      setRefreshing(false);
    }
  };

  const runInvitationAction = async (invitation: MeetInvitation, action: InvitationAction) => {
    const invitationId = invitation.id;
    if (invitationActionLocksRef.current.has(invitationId)) return;

    invitationActionLocksRef.current.add(invitationId);
    setPendingInvitationActions((current) => ({ ...current, [invitationId]: action }));
    setInvitationActionErrors((current) => {
      if (!current[invitationId]) return current;
      const next = { ...current };
      delete next[invitationId];
      return next;
    });

    try {
      await onInvitation(invitation, action);
    } catch {
      const actionLabel = action === 'accept' ? '接受' : action === 'reject' ? '婉拒' : '撤回';
      setInvitationActionErrors((current) => ({
        ...current,
        [invitationId]: `${actionLabel}邀请失败，请重试。`,
      }));
    } finally {
      invitationActionLocksRef.current.delete(invitationId);
      setPendingInvitationActions((current) => {
        if (!current[invitationId]) return current;
        const next = { ...current };
        delete next[invitationId];
        return next;
      });
    }
  };

  return (
    <div className={styles.standardScreen}>
      <header className={styles.messageHeader}>
        <div>
          <h1>消息</h1>
          <p>{totalUnread ? `${totalUnread} 条未读` : '会话、互动和通知'}</p>
        </div>
        <button
          type="button"
          aria-label="刷新消息"
          aria-busy={refreshing}
          disabled={refreshing}
          onClick={() => void refresh()}
          className={refreshing ? styles.spinIcon : ''}
        >
          <FiRefreshCw />
        </button>
      </header>
      {refreshNotice ? (
        <p
          className={`${styles.messageRefreshNotice} ${
            refreshNotice.tone === 'error' ? styles.messageRefreshError : ''
          }`}
          role={refreshNotice.tone === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {refreshNotice.text}
        </p>
      ) : null}
      <button type="button" className={styles.searchButton} onClick={() => setSearchOpen(true)}>
        <FiSearch /> 搜索会话、组局或系统通知
      </button>
      <nav
        className={`${styles.messageCategoryTabs} ${styles.messageHomeTabs}`}
        aria-label="消息分类"
      >
        {(['private', 'interaction', 'system'] as const).map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={category === item}
            className={category === item ? styles.messageCategoryActive : ''}
            onClick={() => setCategory(item)}
          >
            {item === 'private' ? '会话' : item === 'interaction' ? '互动' : '系统'}
          </button>
        ))}
      </nav>
      {showInteraction ? (
        <section className={styles.quickMessages}>
          <button type="button" onClick={onRelationship}>
            <span>
              <FiHeart />
            </span>
            好友与申请
            {incomingConnections.length ? <small>{incomingConnections.length}</small> : null}
          </button>
          <button type="button" onClick={onMeet}>
            <span>
              <FiCalendar />
            </span>
            活动与邀约{pendingReceived.length ? <small>{pendingReceived.length}</small> : null}
          </button>
        </section>
      ) : null}
      {showSystem ? (
        <section className={styles.quickMessages}>
          <button type="button" onClick={onNotifications}>
            <span>
              <FiBell />
            </span>
            打开通知中心{agentEvents.length ? <small>{agentEvents.length}</small> : null}
          </button>
        </section>
      ) : null}

      {showInteraction && pendingReceived.length ? (
        <>
          <h2 className={styles.listTitle}>待处理邀请</h2>
          {pendingReceived.map((item) => {
            const pendingAction = pendingInvitationActions[item.id];
            const invitationBusy = Boolean(pendingAction);
            return (
              <article className={styles.inboxAction} key={item.id} aria-busy={invitationBusy}>
                <span>
                  <FiCalendar />
                </span>
                <div>
                  <strong>{item.title || 'FitMeet 活动邀请'}</strong>
                  <p>{item.message || '对方邀请你一起参与活动。'}</p>
                  <small>
                    {item.timeWindow || '时间待确认'} · {item.locationText || '公共区域集合'}
                  </small>
                  <div className={styles.inlineActions} aria-live="polite">
                    <button
                      type="button"
                      disabled={invitationBusy}
                      className={pendingAction === 'accept' ? styles.spinIcon : ''}
                      onClick={() => void runInvitationAction(item, 'accept')}
                    >
                      {pendingAction === 'accept' ? (
                        <>
                          <FiRefreshCw aria-hidden="true" /> 正在接受…
                        </>
                      ) : (
                        '接受'
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={invitationBusy}
                      className={pendingAction === 'reject' ? styles.spinIcon : ''}
                      onClick={() => void runInvitationAction(item, 'reject')}
                    >
                      {pendingAction === 'reject' ? (
                        <>
                          <FiRefreshCw aria-hidden="true" /> 正在婉拒…
                        </>
                      ) : (
                        '婉拒'
                      )}
                    </button>
                  </div>
                  {invitationActionErrors[item.id] ? (
                    <small className={styles.messageRefreshError} role="alert">
                      {invitationActionErrors[item.id]}
                    </small>
                  ) : null}
                </div>
              </article>
            );
          })}
        </>
      ) : null}
      {showInteraction && pendingSent.length ? (
        <>
          <h2 className={styles.listTitle}>等待回应</h2>
          {pendingSent.map((item) => {
            const pendingAction = pendingInvitationActions[item.id];
            const invitationBusy = Boolean(pendingAction);
            return (
              <article className={styles.inboxAction} key={item.id} aria-busy={invitationBusy}>
                <span>
                  <FiCalendar />
                </span>
                <div>
                  <strong>{item.title || '活动邀请'}</strong>
                  <p>接受前不会开放连续私信。</p>
                  <div className={styles.inlineActions} aria-live="polite">
                    <button
                      type="button"
                      disabled={invitationBusy}
                      className={pendingAction === 'cancel' ? styles.spinIcon : ''}
                      onClick={() => void runInvitationAction(item, 'cancel')}
                    >
                      {pendingAction === 'cancel' ? (
                        <>
                          <FiRefreshCw aria-hidden="true" /> 正在撤回…
                        </>
                      ) : (
                        '撤回邀请'
                      )}
                    </button>
                  </div>
                  {invitationActionErrors[item.id] ? (
                    <small className={styles.messageRefreshError} role="alert">
                      {invitationActionErrors[item.id]}
                    </small>
                  ) : null}
                </div>
              </article>
            );
          })}
        </>
      ) : null}
      {showInteraction && (pendingSocialApplications.length || pendingTaskApplications.length) ? (
        <>
          <h2 className={styles.listTitle}>需求申请</h2>
          {pendingSocialApplications.map((item) => (
            <article className={styles.inboxAction} key={`social-${item.id}`}>
              <span>
                <FiUserPlus />
              </span>
              <div>
                <strong>社交需求申请</strong>
                <p>{item.message || `用户 ${item.applicantUserId ?? ''} 希望加入你的需求。`}</p>
                <div className={styles.inlineActions}>
                  <button
                    type="button"
                    onClick={() => onIntentApplication('social', item, 'accept')}
                  >
                    接受
                  </button>
                  <button
                    type="button"
                    onClick={() => onIntentApplication('social', item, 'reject')}
                  >
                    婉拒
                  </button>
                </div>
              </div>
            </article>
          ))}
          {pendingTaskApplications.map((item) => (
            <article className={styles.inboxAction} key={`task-${item.id}`}>
              <span>
                <FiUserPlus />
              </span>
              <div>
                <strong>任务需求申请</strong>
                <p>{item.message || `用户 ${item.applicantUserId ?? ''} 希望参与你的任务。`}</p>
                <div className={styles.inlineActions}>
                  <button type="button" onClick={() => onIntentApplication('task', item, 'accept')}>
                    接受
                  </button>
                  <button type="button" onClick={() => onIntentApplication('task', item, 'reject')}>
                    婉拒
                  </button>
                </div>
              </div>
            </article>
          ))}
        </>
      ) : null}
      {showSystem && agentEvents.length ? (
        <>
          <h2 className={styles.listTitle}>系统通知</h2>
          {agentEvents.slice(0, 5).map((item) => (
            <button
              type="button"
              className={styles.messageRow}
              key={item.id}
              onClick={() => onSystemEvent(item)}
            >
              <span className={styles.messageInteractionIcon}>
                <FiBell />
              </span>
              <span>
                <strong>{item.title || 'FitMeet 通知'}</strong>
                <small>{item.body || item.type || '账号状态已更新'}</small>
              </span>
              <span className={styles.messageRowMeta}>
                {item.createdAt ? <time>{formatInboxTimestamp(item.createdAt)}</time> : null}
                <i className={styles.unreadBadge}>1</i>
              </span>
              <FiChevronRight />
            </button>
          ))}
        </>
      ) : null}
      {category === 'interaction' && !interactionCount ? (
        <p className={styles.emptyState}>当前没有待处理的好友、需求或活动互动。</p>
      ) : null}
      {category === 'system' && !agentEvents.length ? (
        <p className={styles.emptyState}>当前没有系统通知。</p>
      ) : null}

      {showPrivate ? (
        <>
          <div className={styles.messageListHeader}>
            <h2 className={styles.listTitle}>会话</h2>
            <small>{visibleConversations.length}</small>
          </div>
          {visibleConversations.length ? (
            visibleConversations.map((item) => (
              <button
                type="button"
                className={styles.messageRow}
                key={item.id}
                onClick={() => onConversation(item.id)}
              >
                <MessageAvatar conversation={item} />
                <span>
                  <strong>{item.title || item.displayName || item.username || 'FitMeet 用户'}</strong>
                  <small>{item.lastMessage || '会话已开放'}</small>
                </span>
                <span className={styles.messageRowMeta}>
                  {item.updatedAt || item.time ? (
                    <time>{formatInboxTimestamp(item.updatedAt || item.time)}</time>
                  ) : null}
                  {item.unread ? <i className={styles.unreadBadge}>{item.unread}</i> : null}
                </span>
                {item.notificationLevel === 'muted' || item.mutedUntil ? (
                  <FiBell aria-label="会话已静音" />
                ) : (
                  <FiChevronRight />
                )}
              </button>
            ))
          ) : (
            <p className={styles.emptyState}>
              还没有已开放的会话。好友关系、活动邀请或组局成员资格确认后，会话会出现在这里。
            </p>
          )}
        </>
      ) : null}

      {searchOpen ? (
        <div
          className={styles.sheetShade}
          role="presentation"
          onMouseDown={() => setSearchOpen(false)}
        >
          <section
            ref={searchDialogRef}
            tabIndex={-1}
            className={`${styles.sheet} ${styles.messageSearchSheet}`}
            role="dialog"
            aria-modal="true"
            aria-label="搜索消息"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.sheetHandle} />
            <header>
              <h2>搜索消息</h2>
              <button type="button" aria-label="关闭搜索" onClick={() => setSearchOpen(false)}>
                <FiX />
              </button>
            </header>
            <label className={styles.messageSearchInput}>
              <FiSearch />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索私信、约练或系统通知"
              />
              {query ? (
                <button type="button" aria-label="清空搜索" onClick={() => setQuery('')}>
                  <FiX />
                </button>
              ) : null}
            </label>
            <div className={styles.messageCategoryTabs}>
              {(['all', 'private', 'interaction', 'system'] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={searchCategory === item}
                  className={searchCategory === item ? styles.messageCategoryActive : ''}
                  onClick={() => setSearchCategory(item)}
                >
                  {item === 'all'
                    ? '全部'
                    : item === 'private'
                      ? '私信'
                      : item === 'interaction'
                        ? '互动'
                        : '系统'}
                </button>
              ))}
            </div>
            <div className={styles.messageSearchResults}>
              {visibleSearchItems.length ? (
                visibleSearchItems.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      item.action();
                      setSearchOpen(false);
                    }}
                  >
                    <span
                      className={
                        item.category === 'private'
                          ? styles.messagePrivateIcon
                          : styles.messageInteractionIcon
                      }
                    >
                      {item.category === 'private' ? (
                        <FiMessageCircle />
                      ) : item.category === 'system' ? (
                        <FiBell />
                      ) : (
                        <FiUserPlus />
                      )}
                    </span>
                    <div>
                      <small>
                        {item.category === 'private'
                          ? '私信'
                          : item.category === 'system'
                            ? '系统'
                            : '互动'}
                      </small>
                      <strong>{item.title}</strong>
                      <p>{item.subtitle}</p>
                    </div>
                    {item.unread ? <i>{item.unread}</i> : <FiChevronRight />}
                  </button>
                ))
              ) : (
                <p className={styles.emptyState}>
                  {searchCategory === 'system' ? '当前没有系统通知。' : '没有找到匹配的消息。'}
                </p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
