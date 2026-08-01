'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiArrowDown,
  FiArrowLeft,
  FiBell,
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiChevronUp,
  FiFlag,
  FiHeart,
  FiMapPin,
  FiMessageCircle,
  FiMoreHorizontal,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiTrash2,
  FiUserCheck,
  FiUserMinus,
  FiUserPlus,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import type {
  AgentInboxEvent,
  AgentInboxScope,
  ConversationMessage,
  FeedComment,
  FeedPost,
  FitMeetConnectionRequest,
  FitMeetConversation,
  FitMeetDemand,
  FitMeetGroupJoinMode,
  PublicUserProfile,
} from '@/lib/fitmeet-api-contract';
import type { FitMeetApiClient } from '@/lib/fitmeet-api-client';
import type { FitMeetActionResult } from '@/lib/fitmeet-interaction-state';
import {
  inboxEventCategory,
  type InboxEventCategory,
} from '@/lib/fitmeet-product-trust';
import {
  firstUnreadPeerMessageIndex,
  type RelationshipSnapshot,
} from '@/lib/fitmeet-social-state';
import styles from './social-interaction.module.css';
import { FriendRequestDialog } from './FriendRequestDialog';
import { GroupExperience } from './GroupExperience';

export type SocialExperienceMode =
  | 'user'
  | 'relationships'
  | 'conversation'
  | 'notifications'
  | 'post'
  | 'demand'
  | 'groups'
  | 'group';

function UserAvatar({
  user,
  size = 72,
}: {
  user: Pick<PublicUserProfile, 'name' | 'avatar'>;
  size?: number;
}) {
  return user.avatar ? (
    <img
      className={styles.avatar}
      width={size}
      height={size}
      src={user.avatar}
      alt={`${user.name}的头像`}
    />
  ) : (
    <span className={styles.avatar} style={{ width: size, height: size }}>
      {user.name.slice(0, 1)}
    </span>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" className={styles.iconButton} aria-label="返回" onClick={onBack}>
      <FiArrowLeft />
    </button>
  );
}

export function SocialInteractionExperience(props: {
  mode: SocialExperienceMode;
  api: FitMeetApiClient;
  currentUserId: number;
  user?: PublicUserProfile | null;
  userLoading?: boolean;
  relationship?: RelationshipSnapshot;
  userContext?: {
    demandTitle: string;
    reason: string;
    signals: string[];
    boundaryNotes: string[];
    timeWindow: string;
    locationText: string;
  };
  friends: PublicUserProfile[];
  incoming: FitMeetConnectionRequest[];
  outgoing: FitMeetConnectionRequest[];
  conversations: FitMeetConversation[];
  conversation?: FitMeetConversation | null;
  messages: ConversationMessage[];
  conversationNextBefore?: string | null;
  conversationLoadingMore?: boolean;
  messageInput: string;
  messageSending: boolean;
  events: AgentInboxEvent[];
  eventsScope: AgentInboxScope;
  eventsTotal: number;
  eventsHistoryCount: number;
  eventsUnreadCount: number;
  eventsLoading: boolean;
  eventsError?: string | null;
  eventsNextCursor?: string | null;
  eventsLoadingMore: boolean;
  post?: FeedPost | null;
  demand?: FitMeetDemand | null;
  groupId?: string;
  onBack: () => void;
  onUser: (id: number) => void;
  onMessageInput: (value: string) => void;
  onLoadOlderConversation?: () => void;
  onMessageVisible?: (messageId: string) => void;
  onSend: () => void;
  onRetry: (message: ConversationMessage) => void;
  onRecall: (id: string) => void;
  onReportMessage: (id: string, reason: string, details?: string) => void;
  onMute: () => void;
  onBlockConversation: () => void;
  onRelationshipAction: (
    request: FitMeetConnectionRequest,
    action: 'accept' | 'reject' | 'cancel',
  ) => void;
  onAddFriend: (user: PublicUserProfile, message: string) => Promise<FitMeetActionResult>;
  onDeleteFriend: (user: PublicUserProfile) => void;
  onStartConversation: (user: PublicUserProfile) => void;
  onConversation: (id: string) => void;
  onInviteUser: (user: PublicUserProfile) => void;
  onBlockUser: (user: PublicUserProfile) => void;
  onUnblockUser: (user: PublicUserProfile) => void;
  onReportUser: (user: PublicUserProfile, reason: string, details?: string) => void;
  onEvent: (event: AgentInboxEvent) => void;
  onAcknowledgeEvent: (id: string) => Promise<void>;
  onAcknowledgeAll: () => void;
  onEventsScope: (scope: AgentInboxScope) => void;
  onRetryEvents: () => void;
  onLoadMoreEvents: () => void;
  onPostLike: (id: number) => void;
  postLiked: boolean;
  onOpenPost: (id: number) => void;
  onOpenDemand: (id: string) => void;
  onGroup: (id: string) => void;
  onGroups: () => void;
  groupsEnabled: boolean;
  onCreateGroup: (demand: FitMeetDemand, joinMode: FitMeetGroupJoinMode) => Promise<boolean>;
  onNotice: (message: string) => void;
}) {
  if (props.mode === 'groups' || props.mode === 'group')
    return (
      <GroupExperience
        api={props.api}
        groupId={props.mode === 'group' ? props.groupId : undefined}
        onBack={props.onBack}
        onGroup={props.onGroup}
        onConversation={props.onConversation}
        onUser={props.onUser}
        onNotice={props.onNotice}
      />
    );
  if (props.mode === 'conversation') return <ConversationWorkspace {...props} />;
  if (props.mode === 'relationships') return <RelationshipsWorkspace {...props} />;
  if (props.mode === 'notifications') return <NotificationsWorkspace {...props} />;
  if (props.mode === 'post') return <PostWorkspace {...props} />;
  if (props.mode === 'demand') return <DemandWorkspace {...props} />;
  return <UserWorkspace {...props} />;
}

type SocialProps = Parameters<typeof SocialInteractionExperience>[0];

function UserWorkspace(props: SocialProps) {
  const [friendSheet, setFriendSheet] = useState(false);
  const [confirm, setConfirm] = useState<'delete' | 'block' | 'report' | null>(null);
  const [reportReason, setReportReason] = useState('inappropriate_behavior');
  const [reportDetails, setReportDetails] = useState('');
  const [userPosts, setUserPosts] = useState<FeedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const user = props.user;
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    setPostsLoading(true);
    void props.api
      .listUserPosts(user.id, 1, 6)
      .then((page) => {
        if (active) setUserPosts(page.data);
      })
      .catch(() => {
        if (active) setUserPosts([]);
      })
      .finally(() => {
        if (active) setPostsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [props.api, user?.id]);
  if (props.userLoading)
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          <FiRefreshCw /> 正在同步真实资料与关系状态…
        </div>
      </main>
    );
  if (!user)
    return (
      <main className={styles.page}>
        <header className={styles.pageHeader}>
          <BackButton onBack={props.onBack} />
          <div>
            <h1>用户资料</h1>
            <p>未能从服务端读取这位用户</p>
          </div>
        </header>
        <p className={styles.empty}>资料不可用，不会生成替代人物信息。</p>
      </main>
    );
  const relation = props.relationship?.state ?? user.relationship ?? 'none';
  const direction = props.relationship?.direction;
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <BackButton onBack={props.onBack} />
        <div>
          <h1>公开资料</h1>
          <p>关系和安全状态以服务端为准</p>
        </div>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="更多操作"
          onClick={() => setConfirm(confirm ? null : 'report')}
        >
          <FiMoreHorizontal />
        </button>
      </header>
      <div className={styles.userLayout}>
        <section className={styles.profileCard}>
          <div className={styles.profileHero}>
            <UserAvatar user={user} size={92} />
            <div>
              <h2>
                {user.name}
                {user.verificationStatus === 'verified' ? <FiCheck /> : null}
              </h2>
              <p>
                <FiMapPin /> {user.city || '城市未公开'}
              </p>
              <span>{user.status || '公开资料'}</span>
            </div>
          </div>
          <p className={styles.bio}>{user.bio || '这位用户暂未填写公开介绍。'}</p>
          <div className={styles.tags}>
            {(user.interests || []).length ? (
              user.interests?.map((tag) => <span key={tag}>{tag}</span>)
            ) : (
              <span>兴趣暂未公开</span>
            )}
          </div>
          <div className={styles.primaryActions}>
            {relation === 'none' ? (
              <button type="button" onClick={() => setFriendSheet(true)}>
                <FiUserPlus /> 加好友
              </button>
            ) : null}
            {relation === 'pending' && direction === 'incoming' && props.relationship?.request ? (
              <>
                <button
                  type="button"
                  onClick={() => props.onRelationshipAction(props.relationship!.request!, 'accept')}
                >
                  <FiUserCheck /> 接受申请
                </button>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={() => props.onRelationshipAction(props.relationship!.request!, 'reject')}
                >
                  婉拒
                </button>
              </>
            ) : null}
            {relation === 'pending' && direction === 'outgoing' && props.relationship?.request ? (
              <>
                <button type="button" disabled>
                  <FiRefreshCw /> 等待对方确认
                </button>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={() => props.onRelationshipAction(props.relationship!.request!, 'cancel')}
                >
                  撤回申请
                </button>
              </>
            ) : null}
            {relation === 'friends' ? (
              <button type="button" onClick={() => props.onStartConversation(user)}>
                <FiMessageCircle /> 发消息
              </button>
            ) : null}
            {relation !== 'blocked' ? (
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => props.onInviteUser(user)}
              >
                <FiCalendar /> 邀请参加活动
              </button>
            ) : null}
            {relation !== 'blocked' ? (
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => setConfirm('block')}
              >
                <FiShield /> 安全操作
              </button>
            ) : (
              <button type="button" onClick={() => props.onUnblockUser(user)}>
                <FiShield /> 解除拉黑
              </button>
            )}
          </div>
          <section className={styles.infoGrid}>
            <article>
              <strong>互动原则</strong>
              <p>加好友与活动邀请是两个独立动作；任何线下安排仍需双方明确确认。</p>
            </article>
            <article>
              <strong>隐私边界</strong>
              <p>只展示模糊城市与用户主动公开的信息，不展示精确位置和联系方式。</p>
            </article>
          </section>
          {props.userContext ? (
            <section className={styles.matchContext}>
              <header>
                <div>
                  <strong>与当前需求的共同点</strong>
                  <small>{props.userContext.demandTitle}</small>
                </div>
                <FiUsers />
              </header>
              <p>{props.userContext.reason}</p>
              <div>
                {props.userContext.signals.slice(0, 4).map((signal) => (
                  <span key={signal}>{signal}</span>
                ))}
              </div>
              <dl>
                <div>
                  <dt>时间</dt>
                  <dd>{props.userContext.timeWindow}</dd>
                </div>
                <div>
                  <dt>地点</dt>
                  <dd>{props.userContext.locationText}</dd>
                </div>
              </dl>
              {props.userContext.boundaryNotes.map((note) => (
                <small key={note}>
                  <FiShield /> {note}
                </small>
              ))}
            </section>
          ) : null}
          <section className={styles.publicMoments}>
            <header>
              <div>
                <strong>公开动态</strong>
                <small>只显示服务端返回的公开内容</small>
              </div>
              <span>{userPosts.length}</span>
            </header>
            {postsLoading ? (
              <p>正在同步公开动态…</p>
            ) : userPosts.length ? (
              <div>
                {userPosts.map((post) => (
                  <button type="button" key={post.id} onClick={() => props.onOpenPost(post.id)}>
                    {post.images[0] ? (
                      <img src={post.images[0].url} alt="公开动态图片" />
                    ) : (
                      <span>{post.emoji || '✨'}</span>
                    )}
                    <p>{post.text}</p>
                    <small>
                      <FiHeart /> {post.likes} · <FiMessageCircle /> {post.comments}
                    </small>
                  </button>
                ))}
              </div>
            ) : (
              <p>暂无公开动态；不会根据兴趣标签生成替代内容。</p>
            )}
          </section>
          {relation === 'friends' ? (
            <button
              type="button"
              className={styles.textDanger}
              onClick={() => setConfirm('delete')}
            >
              <FiUserMinus /> 删除好友
            </button>
          ) : null}
        </section>
        <aside className={styles.contextRail}>
          <h3>关系状态</h3>
          <div className={styles.relationshipStatus}>
            <FiUserCheck />
            <span>
              <strong>
                {relation === 'friends'
                  ? '已是好友'
                  : relation === 'pending'
                    ? direction === 'incoming'
                      ? '收到申请'
                      : '等待回应'
                    : relation === 'blocked'
                      ? '已停止互动'
                      : '尚未建立关系'}
              </strong>
              <small>由统一关系接口确认</small>
            </span>
          </div>
          <p>
            <FiShield /> 举报、拉黑和删除好友互不替代，每个动作都会再次确认。
          </p>
        </aside>
      </div>
      <FriendRequestDialog
        open={friendSheet}
        userName={user.name}
        initialMessage="想先从共同兴趣开始认识一下。"
        context={{
          demandTitle: props.userContext?.demandTitle,
          reason: props.userContext?.reason,
          sourceLabel: props.userContext ? '当前需求的候选人资料' : '公开资料页',
        }}
        onClose={() => setFriendSheet(false)}
        onSubmit={(value) => props.onAddFriend(user, value)}
      />
      {confirm ? (
        <div className={styles.modalShade} onMouseDown={() => setConfirm(null)}>
          <section
            className={styles.confirmDialog}
            role="alertdialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <FiShield />
            <h2>
              {confirm === 'delete'
                ? '删除好友？'
                : confirm === 'block'
                  ? '拉黑并停止互动？'
                  : '举报这位用户？'}
            </h2>
            <p>
              {confirm === 'delete'
                ? '删除后不会自动拉黑；重新聊天需要再次建立关系。'
                : confirm === 'block'
                  ? '将停止推荐并关闭后续互动；解除后也不会自动恢复好友关系。'
                  : '举报会进入安全审核，不会自动向对方发送消息。'}
            </p>
            {confirm === 'report' ? (
              <div className={styles.reportFields}>
                <label>
                  <span>举报原因</span>
                  <select
                    value={reportReason}
                    onChange={(event) => setReportReason(event.target.value)}
                  >
                    <option value="inappropriate_behavior">不当行为</option>
                    <option value="harassment">骚扰或越界</option>
                    <option value="fraud">疑似欺诈</option>
                    <option value="unsafe_offline_request">不安全的线下请求</option>
                    <option value="other">其他</option>
                  </select>
                </label>
                <label>
                  <span>补充说明（可选）</span>
                  <textarea
                    value={reportDetails}
                    maxLength={500}
                    onChange={(event) => setReportDetails(event.target.value)}
                    placeholder="请勿填写联系方式、精确位置等敏感信息"
                  />
                </label>
              </div>
            ) : null}
            <div>
              <button type="button" onClick={() => setConfirm(null)}>
                取消
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => {
                  if (confirm === 'delete') props.onDeleteFriend(user);
                  else if (confirm === 'block') props.onBlockUser(user);
                  else props.onReportUser(user, reportReason, reportDetails.trim() || undefined);
                  setConfirm(null);
                }}
              >
                确认
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function RelationshipsWorkspace(props: SocialProps) {
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <BackButton onBack={props.onBack} />
        <div>
          <h1>好友与互动</h1>
          <p>收到的申请、已发送申请和好友</p>
        </div>
      </header>
      <div className={styles.relationshipColumns}>
        <RelationshipList
          title="收到的申请"
          empty="没有待处理申请"
          items={props.incoming.map((request) => ({
            request,
            user: { id: request.requesterId, name: request.requesterName || 'FitMeet 用户' },
          }))}
          onUser={props.onUser}
          actions={(request) => (
            <>
              <button type="button" onClick={() => props.onRelationshipAction(request, 'accept')}>
                接受
              </button>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => props.onRelationshipAction(request, 'reject')}
              >
                拒绝
              </button>
            </>
          )}
        />
        <RelationshipList
          title="已发送"
          empty="没有等待回应的申请"
          items={props.outgoing.map((request) => ({
            request,
            user: { id: request.targetUserId, name: request.targetName || 'FitMeet 用户' },
          }))}
          onUser={props.onUser}
          actions={(request) => (
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => props.onRelationshipAction(request, 'cancel')}
            >
              撤回
            </button>
          )}
        />
        <section className={styles.listPanel}>
          <header>
            <h2>我的好友</h2>
            <span>{props.friends.length}</span>
          </header>
          {props.friends.length ? (
            props.friends.map((user) => (
              <button
                type="button"
                className={styles.userRow}
                key={user.id}
                onClick={() => props.onUser(user.id)}
              >
                <UserAvatar user={user} size={44} />
                <span>
                  <strong>{user.name}</strong>
                  <small>{user.city || '城市未公开'}</small>
                </span>
                <FiChevronRight />
              </button>
            ))
          ) : (
            <p className={styles.empty}>好友关系会在对方接受后出现在这里。</p>
          )}
        </section>
      </div>
    </main>
  );
}

function RelationshipList({
  title,
  empty,
  items,
  onUser,
  actions,
}: {
  title: string;
  empty: string;
  items: Array<{ request: FitMeetConnectionRequest; user: PublicUserProfile }>;
  onUser: (id: number) => void;
  actions: (request: FitMeetConnectionRequest) => React.ReactNode;
}) {
  return (
    <section className={styles.listPanel}>
      <header>
        <h2>{title}</h2>
        <span>{items.length}</span>
      </header>
      {items.length ? (
        items.map(({ request, user }) => (
          <article className={styles.requestRow} key={request.id}>
            <button type="button" onClick={() => onUser(user.id)}>
              <UserAvatar user={user} size={44} />
              <span>
                <strong>{user.name}</strong>
                <small>{request.message || '想先从共同兴趣开始认识'}</small>
              </span>
            </button>
            <div>{actions(request)}</div>
          </article>
        ))
      ) : (
        <p className={styles.empty}>{empty}</p>
      )}
    </section>
  );
}

function ConversationWorkspace(props: SocialProps) {
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [reportMessageId, setReportMessageId] = useState<string | null>(null);
  const [messageReportReason, setMessageReportReason] = useState('inappropriate_content');
  const [messageReportDetails, setMessageReportDetails] = useState('');
  const threadRef = useRef<HTMLDivElement>(null);
  const unreadMarkerRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const positionedConversationRef = useRef<string | null>(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const conversation = props.conversation;
  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    const rememberPosition = () => {
      stickToBottomRef.current = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 80;
      setShowJumpToLatest(!stickToBottomRef.current);
    };
    thread.addEventListener('scroll', rememberPosition, { passive: true });
    rememberPosition();
    return () => thread.removeEventListener('scroll', rememberPosition);
  }, [conversation?.id]);
  useEffect(() => {
    if (!conversation?.id || !props.messages.length) return;
    if (positionedConversationRef.current !== conversation.id) {
      positionedConversationRef.current = conversation.id;
      if (Number(conversation.unread || 0) > 0 && unreadMarkerRef.current) {
        unreadMarkerRef.current.scrollIntoView({ block: 'center' });
        return;
      }
    }
    if (stickToBottomRef.current)
      threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation?.id, conversation?.unread, props.messages.length]);
  const latestPeerMessageId = [...props.messages]
    .reverse()
    .find((item) => item.role === 'peer')?.id;
  useEffect(() => {
    const thread = threadRef.current;
    if (!thread || !latestPeerMessageId || !props.onMessageVisible) return;
    const target = Array.from(
      thread.querySelectorAll<HTMLElement>('[data-peer-message="true"]'),
    ).find((item) => item.dataset.messageId === latestPeerMessageId);
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.5)
          props.onMessageVisible?.(latestPeerMessageId);
      },
      { root: thread, threshold: [0.5] },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [latestPeerMessageId, conversation?.id, props.messages.length, props.onMessageVisible]);
  if (!conversation)
    return (
      <main className={styles.page}>
        <header className={styles.pageHeader}>
          <BackButton onBack={props.onBack} />
          <div>
            <h1>消息会话</h1>
            <p>正在同步会话权限</p>
          </div>
        </header>
        <p className={styles.empty}>会话不可用，或当前账号还没有服务端确认的聊天权限。</p>
      </main>
    );
  const isGroup = conversation.isGroup === true || conversation.contextType === 'group';
  const title =
    conversation.title ||
    conversation.displayName ||
    conversation.username ||
    conversation.peer?.name ||
    (isGroup ? '组局群聊' : 'FitMeet 用户');
  const muted = conversation.notificationLevel === 'muted';
  const canSendMessages = conversation.canSendMessages !== false;
  const firstUnreadIndex = firstUnreadPeerMessageIndex(props.messages, conversation.unread);
  return (
    <main className={`${styles.page} ${styles.conversationPage}`}>
      <header className={styles.conversationHeader}>
        <BackButton onBack={props.onBack} />
        <button
          type="button"
          className={styles.peerButton}
          onClick={() => {
            if (isGroup) {
              if (conversation.contextId) props.onGroup(conversation.contextId);
              return;
            }
            const id = Number(conversation.userId ?? conversation.peer?.id);
            if (id) props.onUser(id);
          }}
        >
          <span className={styles.smallAvatar}>{title.slice(0, 1)}</span>
          <span>
            <strong>{title}</strong>
            <small>
              {isGroup
                ? `${conversation.memberCount || 0} 位正式成员 · 服务端群聊`
                : conversation.online
                  ? '在线'
                  : '消息由统一服务同步'}
            </small>
          </span>
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={muted ? '恢复提醒' : '静音'}
          onClick={props.onMute}
        >
          <FiBell />
        </button>
        {!isGroup ? (
          <button
            type="button"
            className={styles.iconButton}
            aria-label="拉黑用户"
            onClick={() => setConfirmBlock(true)}
          >
            <FiShield />
          </button>
        ) : null}
      </header>
      <div className={styles.chatLayout}>
        <aside className={styles.conversationListPanel} aria-label="会话列表">
          <header>
            <div>
              <strong>会话</strong>
              <small>{props.conversations.length} 个已开放会话</small>
            </div>
            <FiMessageCircle />
          </header>
          <div>
            {props.conversations.map((item) => {
              const itemTitle =
                item.title || item.displayName || item.username || item.peer?.name || 'FitMeet 用户';
              const active = item.id === conversation.id || item.conversationId === conversation.id;
              const mutedItem = item.notificationLevel === 'muted' || Boolean(item.mutedUntil);
              return (
                <button
                  type="button"
                  key={item.id}
                  className={active ? styles.conversationListActive : ''}
                  onClick={() => props.onConversation(item.id)}
                >
                  {item.avatar || item.peer?.avatar ? (
                    <img src={item.avatar || item.peer?.avatar || ''} alt={`${itemTitle}的头像`} />
                  ) : (
                    <span>{itemTitle.slice(0, 1)}</span>
                  )}
                  <div>
                    <strong>{itemTitle}</strong>
                    <small>{item.lastMessage || '会话已开放'}</small>
                  </div>
                  <aside>
                    <time>{item.time || item.updatedAt || ''}</time>
                    {item.unread ? <b>{item.unread}</b> : mutedItem ? <FiBell /> : null}
                  </aside>
                </button>
              );
            })}
          </div>
        </aside>
        <section className={styles.messageThread} ref={threadRef}>
          <p className={styles.threadSafety}>
            <FiShield />{' '}
            {isGroup
              ? canSendMessages
                ? '只有服务端确认的正式成员可以进入；退出或被移除后会同步收回群聊权限。'
                : '当前群聊仅允许主理人和协作者发言；你仍可读取已有消息。'
            : '双方确认后开放的真实会话；当前网页端发送文字消息。'}
          </p>
          {props.conversationNextBefore ? (
            <button
              type="button"
              className={styles.loadOlderButton}
              onClick={props.onLoadOlderConversation}
              disabled={props.conversationLoadingMore}
            >
              <FiChevronUp /> {props.conversationLoadingMore ? '正在加载更早消息…' : '加载更早消息'}
            </button>
          ) : null}
          {props.messages.length ? (
            props.messages.map((item, index) => {
              const recalled = item.lifecycleStatus === 'recalled' || Boolean(item.recalledAt);
              const canRecall =
                item.role === 'user' &&
                !recalled &&
                item.localStatus !== 'failed' &&
                Date.now() - new Date(item.createdAt).getTime() <= 120000;
              return (
                <div className={styles.messageSequence} key={item.id}>
                  {index === firstUnreadIndex ? (
                    <div ref={unreadMarkerRef} className={styles.unreadMarker} role="separator">
                      <span>以下是未读消息</span>
                    </div>
                  ) : null}
                <article
                  className={`${styles.bubbleRow} ${item.role === 'user' ? styles.mine : ''}`}
                  data-peer-message={item.role === 'peer' ? 'true' : undefined}
                  data-message-id={item.role === 'peer' ? item.id : undefined}
                >
                  <div className={styles.bubble}>
                    {isGroup && item.role === 'peer' ? (
                      <strong className={styles.messageSender}>{item.senderName || '组局成员'}</strong>
                    ) : null}
                    <p>{item.text}</p>
                    <footer>
                      <small>
                        {item.localStatus === 'sending'
                          ? '发送中…'
                          : item.localStatus === 'failed'
                            ? '发送失败'
                            : recalled
                              ? '已撤回'
                              : item.role === 'user'
                                ? item.readByOther
                                  ? '已读'
                                  : item.status === 'delivered'
                                    ? '已送达'
                                    : '已发送'
                                : new Date(item.createdAt).toLocaleTimeString('zh-CN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                      </small>
                      {item.localStatus === 'failed' ? (
                        <button type="button" onClick={() => props.onRetry(item)}>
                          <FiRefreshCw /> 重试
                        </button>
                      ) : !recalled ? (
                        <button
                          type="button"
                          aria-label="消息操作"
                          onClick={() => setActionId(actionId === item.id ? null : item.id)}
                        >
                          <FiMoreHorizontal />
                        </button>
                      ) : null}
                    </footer>
                    {actionId === item.id ? (
                      <aside>
                        {canRecall ? (
                          <button
                            type="button"
                            onClick={() => {
                              props.onRecall(item.id);
                              setActionId(null);
                            }}
                          >
                            <FiTrash2 /> 撤回
                          </button>
                        ) : null}
                        {item.role === 'peer' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReportMessageId(item.id);
                              setActionId(null);
                            }}
                          >
                            <FiFlag /> 举报
                          </button>
                        ) : null}
                      </aside>
                    ) : null}
                  </div>
                </article>
                </div>
              );
            })
          ) : (
            <p className={styles.empty}>会话已经开放。先从一句轻松的问候开始吧。</p>
          )}
        </section>
        {showJumpToLatest ? (
          <button
            type="button"
            className={styles.jumpToLatest}
            onClick={() => {
              threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
              stickToBottomRef.current = true;
              setShowJumpToLatest(false);
            }}
          >
            <FiArrowDown /> 回到最新消息
          </button>
        ) : null}
        <aside className={styles.peerRail}>
          <span className={styles.railAvatar}>{title.slice(0, 1)}</span>
          <h2>{title}</h2>
          <p>
            {isGroup
              ? `${conversation.memberCount || 0} 位正式成员。群聊不会替任何人确认时间、地点或线下出席。`
              : '加好友、活动邀请和聊天权限分别管理。任何线下见面仍需双方再次确认。'}
          </p>
          <button
            type="button"
            onClick={() => {
              if (isGroup) {
                if (conversation.contextId) props.onGroup(conversation.contextId);
                return;
              }
              const id = Number(conversation.userId ?? conversation.peer?.id);
              if (id) props.onUser(id);
            }}
          >
            {isGroup ? '查看组局详情' : '查看公开资料'} <FiChevronRight />
          </button>
        </aside>
      </div>
      <form
        className={styles.fixedComposer}
        aria-busy={props.messageSending}
        onSubmit={(event) => {
          event.preventDefault();
          if (canSendMessages) props.onSend();
        }}
      >
        <textarea
          rows={1}
          value={props.messageInput}
          disabled={props.messageSending || !canSendMessages}
          onChange={(event) => props.onMessageInput(event.target.value)}
          placeholder={!canSendMessages ? '当前仅主理人和协作者可发言' : props.messageSending ? '正在发送…' : '输入消息，Enter 发送'}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (canSendMessages) props.onSend();
            }
          }}
        />
        <button type="submit" disabled={!canSendMessages || !props.messageInput.trim() || props.messageSending} aria-label={props.messageSending ? '正在发送消息' : '发送'}>
          {props.messageSending ? <FiRefreshCw /> : <FiSend />}
        </button>
      </form>
      {confirmBlock ? (
        <div className={styles.modalShade}>
          <section className={styles.confirmDialog} role="alertdialog">
            <FiShield />
            <h2>拉黑并关闭后续互动？</h2>
            <p>此操作不会被“静音”替代；解除拉黑也不会恢复原关系。</p>
            <div>
              <button type="button" onClick={() => setConfirmBlock(false)}>
                取消
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => {
                  props.onBlockConversation();
                  setConfirmBlock(false);
                }}
              >
                确认拉黑
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {reportMessageId ? (
        <div className={styles.modalShade} onMouseDown={() => setReportMessageId(null)}>
          <section
            className={styles.confirmDialog}
            role="dialog"
            aria-modal="true"
            aria-label="举报消息"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <FiFlag />
            <h2>举报这条消息</h2>
            <p>举报会提交安全审核，不会自动回复、拉黑或继续联系对方。</p>
            <div className={styles.reportFields}>
              <label>
                <span>举报原因</span>
                <select
                  value={messageReportReason}
                  onChange={(event) => setMessageReportReason(event.target.value)}
                >
                  <option value="inappropriate_content">不当内容</option>
                  <option value="harassment">骚扰或越界</option>
                  <option value="fraud">疑似欺诈</option>
                  <option value="unsafe_offline_request">不安全的线下请求</option>
                  <option value="other">其他</option>
                </select>
              </label>
              <label>
                <span>补充说明（可选）</span>
                <textarea
                  value={messageReportDetails}
                  maxLength={500}
                  onChange={(event) => setMessageReportDetails(event.target.value)}
                  placeholder="补充上下文，不要填写敏感联系方式"
                />
              </label>
            </div>
            <div>
              <button type="button" onClick={() => setReportMessageId(null)}>
                取消
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => {
                  props.onReportMessage(
                    reportMessageId,
                    messageReportReason,
                    messageReportDetails.trim() || undefined,
                  );
                  setReportMessageId(null);
                  setMessageReportDetails('');
                }}
              >
                确认举报
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function NotificationsWorkspace(props: SocialProps) {
  const [filter, setFilter] = useState<'all' | InboxEventCategory>('all');
  const [acknowledgingId, setAcknowledgingId] = useState('');
  const categoryLabels: Record<InboxEventCategory, string> = {
    relationship: '关系',
    message: '私信',
    activity: '活动',
    safety: '安全',
    system: '系统',
  };
  const counts = useMemo(() => {
    const next: Record<InboxEventCategory, number> = {
      relationship: 0,
      message: 0,
      activity: 0,
      safety: 0,
      system: 0,
    };
    props.events.forEach((event) => {
      next[inboxEventCategory(event)] += 1;
    });
    return next;
  }, [props.events]);
  const visibleEvents = useMemo(
    () =>
      filter === 'all'
        ? props.events
        : props.events.filter((event) => inboxEventCategory(event) === filter),
    [filter, props.events],
  );
  const eventTime = (value?: string) => {
    if (!value) return '时间未提供';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <BackButton onBack={props.onBack} />
        <div>
          <h1>通知中心</h1>
          <p>{props.eventsUnreadCount} 条未读 · 共 {props.eventsHistoryCount} 条历史</p>
        </div>
        <button
          type="button"
          className={styles.markRead}
          disabled={!props.eventsUnreadCount || props.eventsLoading}
          onClick={props.onAcknowledgeAll}
        >
          全部已读
        </button>
      </header>
      <nav className={styles.notificationScopes} aria-label="通知阅读范围">
        <button
          type="button"
          aria-pressed={props.eventsScope === 'unread'}
          disabled={props.eventsLoading}
          onClick={() => props.onEventsScope('unread')}
        >
          未读 <span>{props.eventsUnreadCount}</span>
        </button>
        <button
          type="button"
          aria-pressed={props.eventsScope === 'all'}
          disabled={props.eventsLoading}
          onClick={() => props.onEventsScope('all')}
        >
          全部历史 <span>{props.eventsHistoryCount}</span>
        </button>
      </nav>
      <nav className={styles.notificationFilters} aria-label="通知分类">
        <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>全部 <span>{props.events.length}</span></button>
        {(Object.keys(categoryLabels) as InboxEventCategory[]).map((category) => (
          <button type="button" key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>
            {categoryLabels[category]} <span>{counts[category]}</span>
          </button>
        ))}
      </nav>
      <section className={styles.notificationList}>
        {props.eventsError ? (
          <div className={styles.notificationError} role="alert">
            <div>
              <strong>通知历史没有同步成功</strong>
              <p>{props.eventsError}</p>
            </div>
            <button type="button" onClick={props.onRetryEvents}>重新加载</button>
          </div>
        ) : null}
        {visibleEvents.length ? (
          <div>
            <h2>
              {filter === 'all'
                ? props.eventsScope === 'unread' ? '全部未读' : `全部历史 · ${props.eventsTotal} 条`
                : `${categoryLabels[filter]}通知`}
            </h2>
            {visibleEvents.map((event) => {
              const category = inboxEventCategory(event);
              const isRead = Boolean(event.acknowledgedAt);
              return (
                <article key={event.id} data-read={isRead}>
                  <button type="button" className={styles.notificationOpen} onClick={() => props.onEvent(event)}>
                    <span>
                      <FiBell />
                    </span>
                    <div>
                      <small>{categoryLabels[category]} · {eventTime(event.createdAt)}</small>
                      <strong>{event.title || 'FitMeet 通知'}</strong>
                      <p>{event.body || event.type}</p>
                    </div>
                    <i />
                    <FiChevronRight />
                  </button>
                  {isRead ? (
                    <span className={styles.notificationReadState}><FiCheck /> 已读</span>
                  ) : (
                    <button type="button" className={styles.notificationRead} aria-label={`将“${event.title || 'FitMeet 通知'}”标记为已读`} aria-busy={acknowledgingId === event.id} disabled={Boolean(acknowledgingId)} onClick={() => {
                      setAcknowledgingId(event.id);
                      void props.onAcknowledgeEvent(event.id).finally(() => setAcknowledgingId(''));
                    }}>{acknowledgingId === event.id ? <FiRefreshCw /> : <FiCheck />}</button>
                  )}
                </article>
              );
            })}
          </div>
        ) : props.eventsLoading ? (
          <p className={styles.notificationStatus}><FiRefreshCw /> 正在同步通知…</p>
        ) : (
          <p className={styles.empty}>
            {props.events.length
              ? `没有${filter === 'all' ? '' : categoryLabels[filter]}通知。`
              : props.eventsScope === 'unread'
                ? '没有未读通知。你仍可切换到“全部历史”查看已读内容。'
                : '还没有通知历史。新的关系、私信和活动事件会保存在这里。'}
          </p>
        )}
        {props.eventsNextCursor ? <button type="button" className={styles.notificationLoadMore} disabled={props.eventsLoadingMore} onClick={props.onLoadMoreEvents}>{props.eventsLoadingMore ? <><FiRefreshCw /> 正在加载…</> : props.eventsScope === 'unread' ? '加载更早的未读通知' : '加载更早的历史通知'}</button> : null}
        <p className={styles.notificationBoundary}><FiShield /> 站内通知历史与已读状态由服务端保存；网页关闭后的系统级推送仍取决于设备权限与通知偏好。</p>
      </section>
    </main>
  );
}

function PostWorkspace(props: SocialProps) {
  const post = props.post;
  const [comments, setComments] = useState<
    Array<FeedComment & { localStatus?: 'sending' | 'failed' }>
  >([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!post) return;
    let active = true;
    setLoading(true);
    void props.api
      .listFeedComments(post.id, 1, 30)
      .then((result) => {
        if (active) setComments(result.data);
      })
      .catch((reason) =>
        props.onNotice(reason instanceof Error ? reason.message : '评论暂时无法加载。'),
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [post?.id, props.api]);
  const submit = async (retry?: FeedComment & { localStatus?: 'sending' | 'failed' }) => {
    if (!post) return;
    const body = (retry?.body || commentText).trim();
    if (!body) return;
    const temporaryId = retry?.id ?? -Date.now();
    if (retry)
      setComments((items) =>
        items.map((item) => (item.id === temporaryId ? { ...item, localStatus: 'sending' } : item)),
      );
    else {
      setComments((items) => [
        ...items,
        {
          id: temporaryId,
          postId: post.id,
          userId: props.currentUserId,
          authorName: '我',
          body,
          createdAt: new Date().toISOString(),
          canDelete: true,
          localStatus: 'sending',
        },
      ]);
      setCommentText('');
    }
    try {
      const created = await props.api.createFeedComment(post.id, body);
      setComments((items) => items.map((item) => (item.id === temporaryId ? created : item)));
      props.onNotice('评论已同步到 FitMeet 服务端。');
    } catch (reason) {
      setComments((items) =>
        items.map((item) => (item.id === temporaryId ? { ...item, localStatus: 'failed' } : item)),
      );
      props.onNotice(reason instanceof Error ? reason.message : '评论未能发布，可点击重试。');
    }
  };
  const remove = async (comment: FeedComment) => {
    if (!post) return;
    try {
      await props.api.deleteFeedComment(post.id, comment.id);
      setComments((items) => items.filter((item) => item.id !== comment.id));
    } catch (reason) {
      props.onNotice(reason instanceof Error ? reason.message : '评论未能删除。');
    }
  };
  const report = async (comment: FeedComment) => {
    if (!post) return;
    try {
      await props.api.reportFeedComment(post.id, comment.id);
      props.onNotice('评论举报已提交安全审核。');
    } catch (reason) {
      props.onNotice(reason instanceof Error ? reason.message : '评论举报未能提交。');
    }
  };
  if (!post)
    return (
      <main className={styles.page}>
        <header className={styles.pageHeader}>
          <BackButton onBack={props.onBack} />
          <div>
            <h1>动态详情</h1>
            <p>内容不可用或已删除</p>
          </div>
        </header>
        <p className={styles.empty}>没有找到这条真实动态，不会生成替代内容。</p>
      </main>
    );
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <BackButton onBack={props.onBack} />
        <div>
          <h1>动态详情</h1>
          <p>公开内容与互动</p>
        </div>
      </header>
      <article className={styles.postDetail}>
        <button
          type="button"
          className={styles.postAuthor}
          onClick={() => props.onUser(Number(post.userId))}
        >
          <span>{post.username.slice(0, 1)}</span>
          <div>
            <strong>{post.username}</strong>
            <small>
              {post.createdAt} · {post.city || '位置未公开'}
            </small>
          </div>
          <FiChevronRight />
        </button>
        <p className={styles.postText}>{post.text}</p>
        {post.images.length ? (
          <div className={styles.postImages}>
            {post.images.map((image) => (
              <img src={image.url} alt="动态图片" key={image.url} />
            ))}
          </div>
        ) : null}
        <footer>
          <button
            type="button"
            className={props.postLiked ? styles.liked : ''}
            onClick={() => props.onPostLike(post.id)}
          >
            <FiHeart /> {post.likes}
          </button>
          <span>
            <FiMessageCircle /> {post.comments + comments.filter((item) => item.id < 0).length}{' '}
            条评论
          </span>
          <button
            type="button"
            onClick={() =>
              navigator.share
                ? void navigator.share({
                    title: `${post.username}的动态`,
                    text: post.text,
                    url: location.href,
                  })
                : void navigator.clipboard.writeText(location.href)
            }
          >
            <FiSend /> 分享
          </button>
        </footer>
      </article>
      <section className={styles.commentPlaceholder}>
        <h2>评论</h2>
        {loading && !comments.length ? (
          <p>正在加载真实评论…</p>
        ) : comments.length ? (
          <div className={styles.detailComments}>
            {comments.map((comment) => (
              <article key={comment.id}>
                <span>{comment.authorName.slice(0, 1)}</span>
                <div>
                  <strong>{comment.authorName}</strong>
                  <p>{comment.body}</p>
                  <small>
                    {comment.localStatus === 'sending'
                      ? '发送中…'
                      : comment.localStatus === 'failed'
                        ? '发送失败'
                        : comment.createdAt}
                  </small>
                </div>
                <aside>
                  {comment.localStatus === 'failed' ? (
                    <button type="button" onClick={() => void submit(comment)}>
                      <FiRefreshCw /> 重试
                    </button>
                  ) : comment.canDelete ? (
                    <button
                      type="button"
                      aria-label="删除评论"
                      onClick={() => void remove(comment)}
                    >
                      <FiTrash2 />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label="举报评论"
                      onClick={() => void report(comment)}
                    >
                      <FiFlag />
                    </button>
                  )}
                </aside>
              </article>
            ))}
          </div>
        ) : (
          <p>还没有评论。先留下一句友善的话吧。</p>
        )}
        <form
          className={styles.detailCommentComposer}
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <input
            value={commentText}
            maxLength={500}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="写下友善的评论"
          />
          <button type="submit" disabled={!commentText.trim()}>
            <FiSend />
          </button>
        </form>
      </section>
    </main>
  );
}

function DemandWorkspace(props: SocialProps) {
  const [showGroupSetup, setShowGroupSetup] = useState(false);
  const [joinMode, setJoinMode] = useState<FitMeetGroupJoinMode>('request');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const demand = props.demand;
  if (!demand)
    return (
      <main className={styles.page}>
        <header className={styles.pageHeader}>
          <BackButton onBack={props.onBack} />
          <div>
            <h1>需求详情</h1>
            <p>没有找到这条需求</p>
          </div>
        </header>
        <p className={styles.empty}>需求不存在、已关闭或尚未同步。</p>
      </main>
    );
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <BackButton onBack={props.onBack} />
        <div>
          <h1>需求详情</h1>
          <p>跨端共享的真实需求状态</p>
        </div>
      </header>
      <article className={styles.demandDetail}>
        <span>{demand.category || demand.type}</span>
        <h2>{demand.title}</h2>
        <p>{demand.summary}</p>
        <dl>
          {demand.fields.map((field) => (
            <div key={field.title}>
              <dt>{field.title}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
        <footer>
          <strong>{demand.status}</strong>
          <small>
            {demand.candidateCount} 位真实候选人 ·{' '}
            {demand.visibility === 'public' ? '公开' : '未公开'}
          </small>
        </footer>
      </article>
      {props.groupsEnabled ? (
        <section className={styles.groupEntry}>
          <div>
            <FiUsers />
            <span>
              <strong>多人组局</strong>
              <small>成员、候补和群聊权限由服务端统一管理</small>
            </span>
          </div>
          <div className={styles.groupEntryActions}>
            <button type="button" className={styles.secondaryAction} onClick={props.onGroups}>查看组局</button>
            {demand.capacityMax >= 3 && !['closed', 'canceled'].includes(demand.status) ? (
              <button type="button" onClick={() => setShowGroupSetup(true)}>创建组局</button>
            ) : null}
          </div>
          {demand.capacityMax < 3 ? <p>当前需求上限为 {demand.capacityMax} 人；把人数调整为至少 3 人后才会开放组局创建。</p> : null}
        </section>
      ) : null}
      {showGroupSetup ? (
        <section className={styles.groupSetup} role="dialog" aria-modal="true" aria-label="确认创建多人组局">
          <header><div><h2>确认创建组局</h2><p>不会自动邀请或联系任何人，创建后仍由你处理加入申请。</p></div><button type="button" aria-label="关闭" onClick={() => setShowGroupSetup(false)}><FiX /></button></header>
          <div className={styles.groupModeChoices}>
            {([
              ['request', '申请后加入', '你确认成员后开放群聊'],
              ['open', '开放加入', '有空位时直接成为成员'],
              ['invite_only', '仅邀请加入', '不出现在公开可加入列表'],
            ] as Array<[FitMeetGroupJoinMode, string, string]>).map(([value, title, copy]) => (
              <button type="button" key={value} aria-pressed={joinMode === value} onClick={() => setJoinMode(value)}>
                <span>{joinMode === value ? <FiCheck /> : null}</span><strong>{title}</strong><small>{copy}</small>
              </button>
            ))}
          </div>
          <dl><div><dt>成局人数</dt><dd>{Math.max(2, demand.capacityMin)} 人</dd></div><div><dt>人数上限</dt><dd>{demand.capacityMax} 人</dd></div></dl>
          <footer><button type="button" className={styles.secondaryAction} onClick={() => setShowGroupSetup(false)}>暂不创建</button><button type="button" disabled={creatingGroup} onClick={() => { setCreatingGroup(true); void props.onCreateGroup(demand, joinMode).then((created) => { if (created) setShowGroupSetup(false); }).finally(() => setCreatingGroup(false)); }}>{creatingGroup ? '正在创建…' : '确认创建组局'}</button></footer>
        </section>
      ) : null}
    </main>
  );
}
