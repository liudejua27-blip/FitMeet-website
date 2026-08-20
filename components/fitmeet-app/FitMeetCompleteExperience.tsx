'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiAlertTriangle,
  FiArrowUp,
  FiBell,
  FiBookmark,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiEye,
  FiFileText,
  FiFlag,
  FiHeart,
  FiImage,
  FiInfo,
  FiLock,
  FiMapPin,
  FiMessageCircle,
  FiMic,
  FiMoreHorizontal,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiSettings,
  FiShield,
  FiSliders,
  FiStar,
  FiTrash2,
  FiUserPlus,
  FiUsers,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import type {
  AgentInboxEvent,
  AgentInboxEventPage,
  AgentInboxScope,
  AgentDataAccessLogEntry,
  AgentDataAccessSettings,
  AgentDataAccessUpdateRequest,
  AgentNeedWikiItem,
  AgentMemoryControl,
  AgentMemoryUsageEvent,
  AgentMemoryUsagePage,
  AgentMemoryUseScope,
  AgentThread,
  AgentThreadDetail,
  AgentThreadEntry,
  AgentDemandDraftAction,
  AgentDemandDraftActionReceipt,
  BlockedUserRecord,
  ConversationMessage,
  CapabilityOffering,
  DemandDraftSession,
  DemandMatchJob,
  FeedPost,
  FitMeetAppConfig,
  FitMeetAgentMemory,
  FitMeetConnectionRequest,
  FitMeetConversation,
  FitMeetConversationMessage,
  FitMeetDemand,
  FitMeetDemandCandidate,
  FitMeetGroupJoinMode,
  FitMeetIntentApplication,
  FitMeetNotificationPreferences,
  FitMeetProfilePhoto,
  FitMeetPublicIntent,
  FitMeetSearchResult,
  MeetInvitation,
  OnboardingPayload,
  PublicUserProfile,
  RelationshipState,
  SocialProfile,
} from '@/lib/fitmeet-api-contract';
import {
  emptyDemandView,
  type CandidateDecision,
  type ApplicationViewStatus,
  type CandidateViewModel,
  type DemandViewModel,
  type InvitationViewStatus,
  type MeetViewModel,
  type MeetViewStatus,
  invitationMessage,
} from '@/lib/fitmeet-experience-models';
import {
  demandStatusCopy,
  displayCandidate,
  displayDemand,
  displayDraftSession,
  effectiveDemandStatus,
  type LiveCandidate,
} from '@/lib/fitmeet-agent-domain';
import {
  agentDraftCanRenderCard,
  agentReplySuggestions,
  agentTurnNotice,
  compactAgentTimelineEntries,
  demandForAgentThread,
  guardDemandMatchesGeneration,
  demandMatchPhase,
  latestAgentToolProposal,
  mergeAgentDraftEdits,
  preferredAgentThread,
  type DemandMatchPhase,
} from '@/lib/fitmeet-agent-thread-state';
import { FitMeetApiClient, FitMeetApiError } from '@/lib/fitmeet-api-client';
import {
  agentToolDisclosure,
  agentToolResultLink,
  feedbackToneForMessage,
  parseConversationDrafts,
  updateConversationDraft,
  visibleAgentArguments,
  type ConversationDrafts,
  type FitMeetActionResult,
  type FitMeetFeedbackTone,
} from '@/lib/fitmeet-interaction-state';
import {
  agentMemoryUseScopeOptions,
  defaultMemoryUseScope,
  memoryCanChangeScope,
  memoryEvidenceText,
  mergeMemoryUsageEvents,
  memoryTypeLabel,
  memoryUsageContextLabel,
  memoryUsagePath,
  memoryUsagePurposeLabel,
  memoryUseScopePresentation,
} from '@/lib/fitmeet-memory-state';
import {
  candidateFitPresentation,
  inboxEventDestination,
  memoryBoundaryNotice,
  memoryConfidenceLabel,
  memoryDecisionActions,
  memorySensitivityPresentation,
  memorySourceLabel,
  memoryStatusLabel,
} from '@/lib/fitmeet-product-trust';
import {
  conversationRequestIsCurrent,
  dedupeInboxEvents,
  failOptimisticMessage,
  optimisticLikeState,
  optimisticMessage,
  relationshipSnapshot,
  settleOptimisticMessage,
} from '@/lib/fitmeet-social-state';
import { featureEnabled } from '@/lib/fitmeet-capabilities';
import {
  agentEntryCanRender,
  agentEntryIsStreaming,
  agentLiveEventBelongsToThread,
  agentRunPresentation,
  agentToolIsActive,
} from '@/lib/fitmeet-agent-presentation';
import {
  AgentActivityIndicator,
  AgentInlineActivity,
  AgentTaskProgress,
  StreamingAgentText,
} from './AgentRuntimeUI';
import { OnboardingFlow } from './OnboardingFlow';
import { FitMeetLogin } from './FitMeetLogin';
import { FitMeetBrandIcon } from './FitMeetBrandIcon';
import { CandidateProfileExperience } from './CandidateProfileExperience';
import { MessagesExperience } from './MessagesExperience';
import { MomentsExperience } from './MomentsExperience';
import { ProfileExperience } from './ProfileExperience';
import { AgentDataAccessPanel } from './AgentDataAccessPanel';
import {
  SocialInteractionExperience,
  type SocialExperienceMode,
} from './SocialInteractionExperience';
import { useFitMeetSession } from './useFitMeetSession';
import { useFitMeetRealtime, type FitMeetRealtimeEvent } from './useFitMeetRealtime';
import { useBrowserVoiceInput } from './useBrowserVoiceInput';
import { useAccessibleDialog } from './useAccessibleDialog';
import {
  FitMeetAgentContextPanel,
  FitMeetAgentShell,
  type FitMeetAppDestination,
  type FitMeetContextLifecycleStage,
} from './FitMeetAgentShell';
import styles from './fitmeet-complete.module.css';

type TabId = 'home' | 'moments' | 'messages' | 'profile';
type Overlay =
  | 'candidate'
  | 'demand'
  | 'demandList'
  | 'demandEdit'
  | 'invitation'
  | 'composer'
  | 'conversation'
  | 'memory'
  | 'agentDataAccess'
  | 'editProfile'
  | 'privacy'
  | 'settings'
  | 'relationships'
  | 'meet'
  | 'safety'
  | 'accountSafety'
  | 'history'
  | 'toolApproval'
  | null;
type ChatLine = { id: string | number; role: 'assistant' | 'user'; text: string };
type MomentDraftImage = { id: string; file: File; preview: string };
type ToastAction = { label: string; onSelect: () => void };
type ToastState = {
  id: number;
  message: string;
  tone: FitMeetFeedbackTone;
  action?: ToastAction;
};

const initialChat: ChatLine[] = [
  {
    id: 1,
    role: 'assistant',
    text: '嗨，我是小福。你可以从一个模糊的想法开始，我会先帮你理解和整理，不会替你联系或安排任何人。',
  },
];

const quickAgentPrompts = [
  '周末想找人 Citywalk 后喝杯咖啡',
  '有件事想先和你聊聊，不创建卡片',
  '我有一个还没想清楚的现实需求',
];

const emptyProfile: SocialProfile = {
  nickname: 'FitMeet 用户',
  city: '',
  bio: '',
  interests: [],
  distanceKm: 5,
  profileDiscoverable: true,
  agentCanRecommendMe: true,
  agentCanStartChatAfterApproval: false,
  hideSensitiveTags: true,
};

function chatFromAgentEntries(entries: AgentThreadEntry[]): ChatLine[] {
  return entries
    .filter(
      (entry) =>
        entry.kind === 'message' &&
        (entry.role === 'user' || entry.role === 'assistant') &&
        entry.content,
    )
    .map((entry) => ({
      id: entry.id,
      role: entry.role as 'user' | 'assistant',
      text: entry.content || '',
    }));
}

// `response.delta` is an in-memory SSE event, intentionally not a durable
// thread entry. Keep one replaceable local message for it so the web surface
// can render first tokens immediately and the next authoritative read can
// replace it with the persisted assistant message without duplication.
function mergeAgentLiveResponse(
  entries: AgentThreadEntry[],
  runId: string,
  event: AgentThreadEntry,
): AgentThreadEntry[] {
  const id = `live-response-${runId}`;
  if (event.kind === 'response.reset') return entries.filter((entry) => entry.id !== id);
  if (event.kind !== 'response.delta') return entries;
  const delta = typeof event.payload?.delta === 'string' ? event.payload.delta : event.content;
  if (!delta) return entries;
  const incomingLiveSequence = Number(event.payload?.liveSequence || 0);
  const index = entries.findIndex((entry) => entry.id === id);
  if (index >= 0) {
    const current = entries[index];
    const currentLiveSequence = Number(current.payload?.liveSequence || 0);
    if (
      incomingLiveSequence > 0 &&
      currentLiveSequence > 0 &&
      incomingLiveSequence <= currentLiveSequence
    ) {
      return entries;
    }
    const next = [...entries];
    next[index] = {
      ...current,
      content: `${current.content || ''}${delta}`,
      payload: { ...current.payload, ...event.payload, live: true },
      updatedAt: event.updatedAt,
    };
    return next;
  }
  return [
    ...entries,
    {
      id,
      threadId: event.threadId,
      sequence: event.sequence,
      kind: 'message',
      role: 'assistant',
      content: delta,
      toolName: null,
      toolStatus: null,
      payload: { ...event.payload, live: true },
      clientTurnId: event.clientTurnId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    },
  ];
}

function notificationPreferenceKey(userId: number | undefined) {
  return userId ? `fitmeet:web-foreground-notifications:${userId}` : null;
}

function notificationPreferencesEnabled(preferences: FitMeetNotificationPreferences) {
  return (
    preferences.directMessagesEnabled &&
    preferences.interactionsEnabled &&
    preferences.systemEnabled
  );
}

function likedMomentsKey(userId: number) {
  return `fitmeet:web-liked-moments:v1:${userId}`;
}

function closedConversationsKey(userId: number) {
  return `fitmeet:web-closed-conversations:v1:${userId}`;
}

function conversationDraftsKey(userId: number) {
  return `fitmeet:web-conversation-drafts:v1:${userId}`;
}

function activeAgentThreadKey(userId: number) {
  return `fitmeet:web-active-agent-thread:v1:${userId}`;
}

function readStoredArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

function writeStoredArray(key: string, value: unknown[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(value));
}

function FeedbackIcon({ tone }: { tone: FitMeetFeedbackTone }) {
  if (tone === 'success') return <FiCheckCircle />;
  if (tone === 'error') return <FiXCircle />;
  if (tone === 'warning') return <FiAlertTriangle />;
  if (tone === 'pending') return <FiRefreshCw />;
  return <FiInfo />;
}

function displayConversationMessage(
  message: FitMeetConversationMessage,
  currentUserId?: number,
): ConversationMessage {
  const mine =
    typeof message.isMine === 'boolean'
      ? message.isMine
      : Number(message.senderId) === Number(currentUserId);
  const recalled = message.lifecycleStatus === 'recalled' || Boolean(message.recalledAt);
  return {
    id: message.id,
    role: mine ? 'user' : 'peer',
    text: recalled
      ? mine
        ? '你撤回了一条消息'
        : '对方撤回了一条消息'
      : message.text || message.body?.text || '',
    createdAt: message.createdAt,
    senderId: message.senderId,
    senderName: message.senderName,
    senderAvatar: message.senderAvatar,
    readByOther: message.readByOther,
    status: message.status,
    lifecycleStatus: message.lifecycleStatus,
    recalledAt: message.recalledAt,
    clientMessageId: message.clientMessageId,
  };
}

function mergeConversationMessages(
  current: ConversationMessage[],
  incoming: ConversationMessage[],
): ConversationMessage[] {
  const byId = new Map<string, ConversationMessage>();
  for (const item of current) byId.set(item.id, item);
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function CapabilityGate({
  title,
  message,
  loading = false,
  onRetry,
}: {
  title: string;
  message: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  return (
    <main className={styles.appPage}>
      <section className={`${styles.mobileSurface} ${styles.loadingSurface}`} aria-live="polite">
        <FitMeetBrandIcon size={78} priority src="/brand/fitmeet-login-icon.png" />
        <h1>{title}</h1>
        <p>{message}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} disabled={loading}>
            <FiRefreshCw /> {loading ? '正在同步…' : '重新检查'}
          </button>
        ) : null}
      </section>
    </main>
  );
}

function conversationPeerId(conversation: FitMeetConversation | null | undefined) {
  return Number(conversation?.userId ?? conversation?.peer?.id) || null;
}

function isGroupConversation(conversation: FitMeetConversation | null | undefined) {
  return conversation?.isGroup === true || conversation?.contextType === 'group';
}

function agentEntriesForDetail(detail: AgentThreadDetail) {
  const draft = detail.activeDraft;
  const hasApprovalProjection = Array.isArray(detail.pendingApprovals);
  const pendingProposalIds = new Set(
    (detail.pendingApprovals || [])
      .map((approval) => approval.proposalId)
      .filter((proposalId): proposalId is string => Boolean(proposalId)),
  );
  const normalizedEntries = detail.entries.map((entry) => {
    if (
      entry.kind === 'tool_proposal' &&
      ['awaiting_confirmation', 'failed'].includes(entry.toolStatus || '') &&
      hasApprovalProjection &&
      !pendingProposalIds.has(entry.id)
    ) {
      return { ...entry, toolStatus: 'stale' };
    }
    if (entry.toolName !== 'classify_demand' || !draft?.demandType) return entry;
    const label =
      draft.demandType === 'buddy'
        ? '搭子 / 交友'
        : draft.demandType === 'workout'
          ? '运动约练'
          : draft.demandType;
    return { ...entry, content: `已按当前远端草稿归类为「${label}」需求。` };
  });
  return compactAgentTimelineEntries(normalizedEntries);
}

function Avatar({
  name,
  color = '#677cf2',
  size = 42,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, '--avatar-color': color } as React.CSSProperties}
    >
      {name.slice(0, 1)}
    </span>
  );
}

function Sheet({
  title,
  children,
  onClose,
  closeDisabled = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  closeDisabled?: boolean;
}) {
  const guardedClose = useCallback(() => {
    if (!closeDisabled) onClose();
  }, [closeDisabled, onClose]);
  const dialogRef = useAccessibleDialog(true, guardedClose);
  return (
    <div className={styles.sheetShade} role="presentation" onMouseDown={guardedClose}>
      <section
        ref={dialogRef}
        tabIndex={-1}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-busy={closeDisabled}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.sheetHandle} />
        <header>
          <h2>{title}</h2>
          <button type="button" aria-label="关闭" disabled={closeDisabled} onClick={guardedClose}>
            <FiX />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

type FitMeetCompleteExperienceProps = {
  initialSurface?: 'main' | 'onboarding';
  initialDestination?: TabId;
  initialThreadId?: string;
  initialExperience?: SocialExperienceMode;
  initialEntityId?: string;
};

type FitMeetSessionController = ReturnType<typeof useFitMeetSession>;

export function FitMeetCompleteExperience(props: FitMeetCompleteExperienceProps) {
  const session = useFitMeetSession();
  const loadingWorkbench = (
    <main className={styles.appPage}>
      <section className={`${styles.mobileSurface} ${styles.loadingSurface}`} aria-live="polite">
        <FitMeetBrandIcon size={78} priority src="/brand/fitmeet-login-icon.png" />
        <p>正在准备你的 FitMeet 工作台…</p>
      </section>
    </main>
  );

  if (session.state.status === 'loading') return loadingWorkbench;
  if (session.state.status === 'anonymous')
    return (
      <FitMeetLogin
        onLogin={session.login}
        onRegister={session.register}
        onResendEmailVerification={session.resendEmailVerification}
        initialError={session.state.error}
      />
    );

  const authenticatedSession = session.state.session;
  if (!authenticatedSession) return loadingWorkbench;
  return (
    <FitMeetAuthenticatedExperience
      key={String(authenticatedSession.user.id)}
      {...props}
      session={session}
    />
  );
}

function FitMeetAuthenticatedExperience({
  initialSurface = 'main',
  initialDestination = 'home',
  initialThreadId,
  initialExperience,
  initialEntityId,
  session,
}: FitMeetCompleteExperienceProps & { session: FitMeetSessionController }) {
  const router = useRouter();
  const memoryOwnerId =
    session.state.status === 'authenticated' && session.state.session?.user.id != null
      ? String(session.state.session.user.id)
      : null;
  const [surface, setSurface] = useState<'main' | 'onboarding'>(initialSurface);
  const [agentOnlyMode, setAgentOnlyMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(initialDestination);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [toast, setToast] = useState<ToastState | null>({
    id: 0,
    message: '所有涉及别人和线下活动的动作，都要经过你的明确确认。',
    tone: 'info',
  });
  const [profile, setProfile] = useState<SocialProfile>(emptyProfile);
  const [chat, setChat] = useState<ChatLine[]>(initialChat);
  const [agentEntries, setAgentEntries] = useState<AgentThreadEntry[]>([]);
  const [agentThreads, setAgentThreads] = useState<AgentThread[]>([]);
  const [activeAgentThread, setActiveAgentThread] = useState<AgentThread | null>(null);
  const [activeDraftSession, setActiveDraftSession] = useState<DemandDraftSession | null>(null);
  const [selectedToolProposal, setSelectedToolProposal] = useState<AgentThreadEntry | null>(null);
  const [toolProposalDecision, setToolProposalDecision] = useState<'approve' | 'decline' | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [agentSending, setAgentSending] = useState(false);
  const [agentDraftStructuring, setAgentDraftStructuring] = useState(false);
  const [agentPendingMessage, setAgentPendingMessage] = useState<string | null>(null);
  const [demand, setDemand] = useState<DemandViewModel>(emptyDemandView);
  const [demands, setDemands] = useState<FitMeetDemand[]>([]);
  const [hasDemand, setHasDemand] = useState(false);
  const [matchJob, setMatchJob] = useState<DemandMatchJob | null>(null);
  const [demandLifecycleAction, setDemandLifecycleAction] =
    useState<AgentDemandDraftAction | null>(null);
  const [candidates, setCandidates] = useState<LiveCandidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [inviteStatus, setInviteStatus] = useState<InvitationViewStatus>('none');
  const [inviteSending, setInviteSending] = useState(false);
  const [relationship, setRelationship] = useState<RelationshipState>('none');
  const [meet, setMeet] = useState<MeetViewModel>({ id: 0, status: 'none' });
  const [socialIntents, setSocialIntents] = useState<FitMeetPublicIntent[]>([]);
  const [taskIntents, setTaskIntents] = useState<FitMeetPublicIntent[]>([]);
  const [socialApplications, setSocialApplications] = useState<FitMeetIntentApplication[]>([]);
  const [taskApplications, setTaskApplications] = useState<FitMeetIntentApplication[]>([]);
  const [ownerSocialApplications, setOwnerSocialApplications] = useState<
    FitMeetIntentApplication[]
  >([]);
  const [ownerTaskApplications, setOwnerTaskApplications] = useState<FitMeetIntentApplication[]>(
    [],
  );
  const [agentInboxEvents, setAgentInboxEvents] = useState<AgentInboxEvent[]>([]);
  const [agentInboxScope, setAgentInboxScope] = useState<AgentInboxScope>('unread');
  const [agentInboxTotal, setAgentInboxTotal] = useState(0);
  const [agentInboxHistoryCount, setAgentInboxHistoryCount] = useState(0);
  const [agentInboxUnreadCount, setAgentInboxUnreadCount] = useState(0);
  const [agentInboxLoading, setAgentInboxLoading] = useState(false);
  const [agentInboxError, setAgentInboxError] = useState<string | null>(null);
  const [agentInboxNextCursor, setAgentInboxNextCursor] = useState<string | null>(null);
  const [agentInboxLoadingMore, setAgentInboxLoadingMore] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [feedLastPage, setFeedLastPage] = useState(1);
  const [profilePhotos, setProfilePhotos] = useState<FitMeetProfilePhoto[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
  const [postText, setPostText] = useState('');
  const [postImages, setPostImages] = useState<MomentDraftImage[]>([]);
  const [postPublishing, setPostPublishing] = useState(false);
  const [discoverChannel, setDiscoverChannel] = useState<'moments' | 'social' | 'tasks'>('moments');
  const [memories, setMemories] = useState<FitMeetAgentMemory[]>([]);
  const [needWikiEntries, setNeedWikiEntries] = useState<AgentNeedWikiItem[]>([]);
  const [capabilityOfferings, setCapabilityOfferings] = useState<CapabilityOffering[]>([]);
  const [memoryControl, setMemoryControl] = useState<AgentMemoryControl | null>(null);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [memoryStateOwnerId, setMemoryStateOwnerId] = useState<string | null>(null);
  const [agentDataAccess, setAgentDataAccess] = useState<AgentDataAccessSettings | null>(null);
  const [agentDataAccessLogs, setAgentDataAccessLogs] = useState<AgentDataAccessLogEntry[]>([]);
  const [agentDataAccessLoading, setAgentDataAccessLoading] = useState(false);
  const [agentDataAccessSaving, setAgentDataAccessSaving] = useState(false);
  const [agentDataAccessError, setAgentDataAccessError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [conversationNextBefore, setConversationNextBefore] = useState<string | null>(null);
  const [conversationLoadingMore, setConversationLoadingMore] = useState(false);
  const [conversationInput, setConversationInput] = useState('');
  const [conversationSending, setConversationSending] = useState(false);
  const [conversations, setConversations] = useState<FitMeetConversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState<FitMeetConversation | null>(
    null,
  );
  const [invitations, setInvitations] = useState<MeetInvitation[]>([]);
  const [messageLandingCategory, setMessageLandingCategory] = useState<
    'private' | 'interaction'
  >('private');
  const [incomingConnections, setIncomingConnections] = useState<FitMeetConnectionRequest[]>([]);
  const [outgoingConnections, setOutgoingConnections] = useState<FitMeetConnectionRequest[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationPreferenceSyncing, setNotificationPreferenceSyncing] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserRecord[]>([]);
  const [blockedUsersLoading, setBlockedUsersLoading] = useState(false);
  const [blockedUsersError, setBlockedUsersError] = useState(false);
  const [closedConversationIds, setClosedConversationIds] = useState<string[]>([]);
  const [friends, setFriends] = useState<PublicUserProfile[]>([]);
  const [publicUser, setPublicUser] = useState<PublicUserProfile | null>(null);
  const [publicUserLoading, setPublicUserLoading] = useState(false);
  const [deepLinkedPostRecord, setDeepLinkedPostRecord] = useState<FeedPost | null>(null);
  const [deepLinkedDemandRecord, setDeepLinkedDemandRecord] = useState<FitMeetDemand | null>(null);
  const [liveDemand, setLiveDemand] = useState<{ id: string } | null>(null);
  const conversationSyncingRef = useRef(new Set<string>());
  const activeConversationIdRef = useRef<string | null>(null);
  const conversationLoadGenerationRef = useRef(0);
  const conversationReceiptRef = useRef(new Map<string, string>());
  const conversationReceiptPendingRef = useRef(new Set<string>());
  const conversationDraftsRef = useRef<ConversationDrafts>({});
  const deepLinkLoadedRef = useRef<string | null>(null);
  const activeAgentThreadIdRef = useRef<string | null>(null);
  const agentThreadLoadRequestRef = useRef(0);
  const agentThreadSwitchingRef = useRef(false);
  const agentSendRequestRef = useRef(0);
  const agentSendingRef = useRef(false);
  const agentSendingAfterSequenceRef = useRef(0);
  const demandLifecycleActionRef = useRef<AgentDemandDraftAction | null>(null);
  const demandMatchPollGenerationRef = useRef(0);
  const activeDemandIdRef = useRef<string | null>(null);
  const inviteSendingRef = useRef(false);
  const inviteIdempotencyKeyRef = useRef<string | null>(null);
  const agentInboxLoadRequestRef = useRef(0);
  const agentInboxScopeRef = useRef<AgentInboxScope>('unread');
  const memoryOwnerIdRef = useRef<string | null>(memoryOwnerId);
  const memoryRefreshRequestRef = useRef(0);
  const sessionAccessToken = session.state.session?.accessToken ?? null;
  const api = useMemo(
    () => new FitMeetApiClient(() => sessionAccessToken),
    [sessionAccessToken],
  );
  const liveApi = session.state.status === 'authenticated';
  const [appConfig, setAppConfig] = useState<FitMeetAppConfig | null>(null);
  const [appConfigLoading, setAppConfigLoading] = useState(true);
  const [appConfigError, setAppConfigError] = useState<string | null>(null);
  useEffect(
    () => () => {
      demandMatchPollGenerationRef.current += 1;
    },
    [],
  );
  const refreshAppConfig = useCallback(async () => {
    setAppConfigLoading(true);
    setAppConfigError(null);
    try {
      setAppConfig(await api.getAppConfig());
    } catch (reason) {
      setAppConfig(null);
      setAppConfigError(reason instanceof Error ? reason.message : '服务能力暂时无法同步。');
    } finally {
      setAppConfigLoading(false);
    }
  }, [api]);
  useEffect(() => {
    void refreshAppConfig();
  }, [refreshAppConfig]);
  const currentUserId = session.state.session?.user.id;
  const agentEnabled = featureEnabled(appConfig, 'agent', currentUserId);
  const groupsEnabled = featureEnabled(appConfig, 'multiplayerGroups', currentUserId);
  const demandPublishingEnabled = featureEnabled(appConfig, 'demandPublishing', currentUserId);
  const matchingEnabled = featureEnabled(appConfig, 'matching', currentUserId);
  const messagingEnabled = featureEnabled(appConfig, 'messaging', currentUserId);
  const memoryStateBelongsToCurrentOwner =
    memoryOwnerId !== null && memoryStateOwnerId === memoryOwnerId;
  const selectedCandidate =
    candidates.find((candidate) => candidate.id === selectedCandidateId) ?? candidates[0];
  const publicCandidateContext = publicUser
    ? candidates.find((candidate) => Number(candidate.candidateUserId) === Number(publicUser.id))
    : undefined;
  const activeCandidates = candidates.filter((candidate) => candidate.decision !== 'dismissed');
  const selectedCandidateInvitation =
    selectedCandidate && liveDemand
      ? invitations.find(
          (invitation) =>
            invitation.demandId === liveDemand.id &&
            Number(invitation.inviteeUserId) === Number(selectedCandidate.candidateUserId),
        )
      : undefined;
  const selectedCandidateInviteStatus: InvitationViewStatus =
    inviteStatus === 'draft'
      ? 'draft'
      : selectedCandidateInvitation?.status === 'pending'
        ? 'sent'
        : (selectedCandidateInvitation?.status ?? 'none');
  const visibleConversations = conversations.filter(
    (item) => !closedConversationIds.includes(item.id),
  );
  const selectedConversationClosed = Boolean(
    selectedConversation && closedConversationIds.includes(selectedConversation.id),
  );
  const notice = useCallback(
    (message: string, tone?: FitMeetFeedbackTone, action?: ToastAction) =>
      setToast({ id: Date.now(), message, tone: tone || feedbackToneForMessage(message), action }),
    [],
  );
  const runGlobalSearch = useCallback((query: string) => api.search(query), [api]);
  const openGlobalSearchResult = useCallback(
    (result: FitMeetSearchResult) => router.push(result.path),
    [router],
  );
  const isCurrentMemoryOwner = useCallback(
    (ownerId: string | null) => ownerId !== null && memoryOwnerIdRef.current === ownerId,
    [],
  );

  const refreshMemoryCenter = useCallback(async () => {
    const requestOwnerId = memoryOwnerId;
    const requestId = ++memoryRefreshRequestRef.current;
    if (!requestOwnerId) {
      setMemories([]);
      setNeedWikiEntries([]);
      setCapabilityOfferings([]);
      setMemoryControl(null);
      setMemoryLoading(false);
      setMemoryError(null);
      return;
    }
    setMemoryStateOwnerId(requestOwnerId);
    setMemoryLoading(true);
    setMemoryError(null);
    try {
      const [memoryResult, controlResult, wikiResult, capabilityResult] = await Promise.allSettled([
        api.listAgentMemories(),
        api.getAgentMemoryControl(),
        api.listAgentNeedWiki(),
        api.listCapabilityOfferings(),
      ]);
      if (
        !isCurrentMemoryOwner(requestOwnerId) ||
        requestId !== memoryRefreshRequestRef.current
      )
        return;
      if (memoryResult.status === 'fulfilled')
        setMemories(memoryResult.value.items ?? memoryResult.value.data ?? []);
      if (controlResult.status === 'fulfilled') setMemoryControl(controlResult.value);
      if (wikiResult.status === 'fulfilled') setNeedWikiEntries(wikiResult.value);
      if (capabilityResult.status === 'fulfilled') setCapabilityOfferings(capabilityResult.value);
      const failure = [memoryResult, controlResult, wikiResult, capabilityResult].find(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      );
      if (failure)
        setMemoryError(
          failure.reason instanceof Error
            ? failure.reason.message
            : '人物画像与记忆暂时无法完整同步。',
        );
    } catch (reason) {
      if (
        !isCurrentMemoryOwner(requestOwnerId) ||
        requestId !== memoryRefreshRequestRef.current
      )
        return;
      setMemoryError(reason instanceof Error ? reason.message : '人物画像与记忆暂时无法同步。');
    } finally {
      if (
        isCurrentMemoryOwner(requestOwnerId) &&
        requestId === memoryRefreshRequestRef.current
      )
        setMemoryLoading(false);
    }
  }, [api, isCurrentMemoryOwner, memoryOwnerId]);

  const refreshAgentDataAccess = useCallback(async () => {
    setAgentDataAccessLoading(true);
    setAgentDataAccessError(null);
    try {
      const [settingsResult, logsResult] = await Promise.allSettled([
        api.getAgentDataAccess(),
        api.getAgentDataAccessLog(undefined, 30),
      ]);
      if (settingsResult.status === 'fulfilled') setAgentDataAccess(settingsResult.value);
      if (logsResult.status === 'fulfilled') setAgentDataAccessLogs(logsResult.value.items);
      const failure = [settingsResult, logsResult].find(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      );
      if (failure)
        setAgentDataAccessError(
          failure.reason instanceof Error
            ? failure.reason.message
            : 'Agent 数据权限暂时无法完整同步。',
        );
    } finally {
      setAgentDataAccessLoading(false);
    }
  }, [api]);

  const updateAgentDataAccess = async (patch: AgentDataAccessUpdateRequest) => {
    if (agentDataAccessSaving) return;
    setAgentDataAccessSaving(true);
    setAgentDataAccessError(null);
    try {
      const saved = await api.updateAgentDataAccess(patch);
      setAgentDataAccess(saved);
      notice('Agent 数据权限已按服务端最新版本保存。', 'success');
    } catch (reason) {
      setAgentDataAccessError(
        reason instanceof Error ? reason.message : 'Agent 数据权限没有保存，请重新同步后再试。',
      );
      if (reason instanceof FitMeetApiError && reason.status === 409)
        await refreshAgentDataAccess();
    } finally {
      setAgentDataAccessSaving(false);
    }
  };

  const applyAgentInboxPage = useCallback((page: AgentInboxEventPage) => {
    setAgentInboxEvents(page.items);
    setAgentInboxNextCursor(page.nextCursor ?? null);
    setAgentInboxTotal(page.total ?? page.items.length);
    setAgentInboxHistoryCount(page.historyCount ?? page.total ?? page.items.length);
    setAgentInboxUnreadCount(page.unreadCount ?? 0);
  }, []);

  const refreshAgentInbox = useCallback(
    async (scope: AgentInboxScope = agentInboxScopeRef.current) => {
      const requestId = ++agentInboxLoadRequestRef.current;
      setAgentInboxLoading(true);
      setAgentInboxError(null);
      try {
        const page = await api.getAgentInboxEvents(30, undefined, scope);
        if (requestId !== agentInboxLoadRequestRef.current || scope !== agentInboxScopeRef.current)
          return;
        applyAgentInboxPage(page);
      } catch (reason) {
        if (requestId !== agentInboxLoadRequestRef.current || scope !== agentInboxScopeRef.current)
          return;
        setAgentInboxError(reason instanceof Error ? reason.message : '通知历史暂时无法同步。');
      } finally {
        if (requestId === agentInboxLoadRequestRef.current) setAgentInboxLoading(false);
      }
    },
    [api, applyAgentInboxPage],
  );

  const selectAgentInboxScope = useCallback((scope: AgentInboxScope) => {
    if (scope === agentInboxScopeRef.current) return;
    agentInboxScopeRef.current = scope;
    setAgentInboxEvents([]);
    setAgentInboxNextCursor(null);
    setAgentInboxTotal(0);
    setAgentInboxError(null);
    setAgentInboxLoading(true);
    setAgentInboxScope(scope);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(
      () => setToast((current) => (current?.id === toast.id ? null : current)),
      toast.tone === 'error' ? 9_000 : toast.tone === 'warning' ? 8_000 : 6_000,
    );
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    memoryOwnerIdRef.current = memoryOwnerId;
    memoryRefreshRequestRef.current += 1;
    setMemoryStateOwnerId(memoryOwnerId);
    setMemories([]);
    setMemoryControl(null);
    setMemoryLoading(false);
    setMemoryError(null);
    if (memoryOwnerId) void refreshMemoryCenter();
  }, [memoryOwnerId, refreshMemoryCenter]);

  useEffect(() => {
    if (overlay === 'memory') void refreshMemoryCenter();
  }, [overlay, refreshMemoryCenter]);

  useEffect(() => {
    const userId = session.state.session?.user.id;
    if (!userId) {
      conversationDraftsRef.current = {};
      setConversationInput('');
      return;
    }
    conversationDraftsRef.current = parseConversationDrafts(
      window.localStorage.getItem(conversationDraftsKey(userId)),
    );
  }, [session.state.session?.user.id]);

  const persistConversationDraft = useCallback(
    (conversationId: string, value: string) => {
      const userId = session.state.session?.user.id;
      if (!userId || !conversationId) return;
      const next = updateConversationDraft(conversationDraftsRef.current, conversationId, value);
      conversationDraftsRef.current = next;
      window.localStorage.setItem(conversationDraftsKey(userId), JSON.stringify(next));
    },
    [session.state.session?.user.id],
  );

  const changeConversationInput = useCallback(
    (value: string) => {
      setConversationInput(value);
      if (selectedConversation?.id) persistConversationDraft(selectedConversation.id, value);
    },
    [persistConversationDraft, selectedConversation?.id],
  );
  const refreshBlockedUsers = useCallback(async () => {
    if (session.state.status !== 'authenticated') {
      setBlockedUsers([]);
      setBlockedUsersError(false);
      return;
    }
    setBlockedUsersLoading(true);
    setBlockedUsersError(false);
    try {
      setBlockedUsers(await api.listBlockedUsers());
    } catch (reason) {
      setBlockedUsersError(true);
      throw reason;
    } finally {
      setBlockedUsersLoading(false);
    }
  }, [api, session.state.status]);
  const deepLinkedUserId = initialExperience === 'user' ? Number(initialEntityId) || 0 : 0;
  const deepLinkedPost =
    initialExperience === 'post'
      ? (posts.find((item) => Number(item.id) === Number(initialEntityId)) ?? deepLinkedPostRecord)
      : null;
  const deepLinkedDemand =
    initialExperience === 'demand'
      ? (demands.find((item) => item.id === initialEntityId) ?? deepLinkedDemandRecord)
      : null;
  const publicRelationship = useMemo(
    () =>
      relationshipSnapshot({
        userId: publicUser?.id || deepLinkedUserId,
        friends,
        incoming: incomingConnections,
        outgoing: outgoingConnections,
        serverRelationship: publicUser?.relationship,
      }),
    [
      deepLinkedUserId,
      friends,
      incomingConnections,
      outgoingConnections,
      publicUser?.id,
      publicUser?.relationship,
    ],
  );
  const voiceInput = useBrowserVoiceInput((transcript) => {
    setChatInput((current) =>
      [current.trim(), transcript].filter(Boolean).join(current.trim() ? '，' : ''),
    );
    setActiveTab('home');
    notice('已转成文字；你可以先检查，再决定是否发送给小福。');
  });

  const applyAgentDetail = useCallback(
    (detail: AgentThreadDetail, presentDraft = false) => {
      activeAgentThreadIdRef.current = detail.thread.id;
      const userId = session.state.session?.user.id;
      if (userId && typeof window !== 'undefined') {
        window.localStorage.setItem(activeAgentThreadKey(userId), detail.thread.id);
      }
      setActiveAgentThread(detail.thread);
      setAgentThreads((current) => [
        detail.thread,
        ...current.filter((thread) => thread.id !== detail.thread.id),
      ]);
      const normalizedEntries = agentEntriesForDetail(detail);
      setAgentEntries(normalizedEntries);
      const nextChat = chatFromAgentEntries(normalizedEntries);
      setChat(nextChat.length ? nextChat : initialChat);
      setActiveDraftSession(detail.activeDraft);
      if (detail.activeDraft && presentDraft && agentDraftCanRenderCard(detail.activeDraft)) {
        demandMatchPollGenerationRef.current += 1;
        activeDemandIdRef.current = null;
        setDemand(displayDraftSession(detail.activeDraft));
        setHasDemand(true);
        setLiveDemand(null);
        setMatchJob(null);
        setCandidates([]);
        setSelectedCandidateId(null);
      } else if (presentDraft) {
        demandMatchPollGenerationRef.current += 1;
        activeDemandIdRef.current = null;
        setDemand(emptyDemandView);
        setHasDemand(false);
        setLiveDemand(null);
        setMatchJob(null);
        setCandidates([]);
        setSelectedCandidateId(null);
      }
    },
    [session.state.session?.user.id],
  );

  const loadAgentThread = useCallback(
    async (threadId: string, presentDraft = false) => {
      const requestId = ++agentThreadLoadRequestRef.current;
      activeAgentThreadIdRef.current = threadId;
      const detail = await api.getAgentThread(threadId);
      if (
        requestId !== agentThreadLoadRequestRef.current ||
        activeAgentThreadIdRef.current !== threadId
      )
        return detail;
      applyAgentDetail(detail, presentDraft);
      return detail;
    },
    [api, applyAgentDetail],
  );

  const applyDemandProjection = useCallback(
    (
      record: FitMeetDemand,
      nextMatchJob: DemandMatchJob | null,
      rawCandidates: FitMeetDemandCandidate[] = [],
    ) => {
      const nextCandidates = rawCandidates.map(displayCandidate);
      activeDemandIdRef.current = record.id;
      setDemand(displayDemand(record));
      setHasDemand(true);
      setLiveDemand({ id: record.id });
      setMatchJob(nextMatchJob);
      setDemands((current) => [record, ...current.filter((item) => item.id !== record.id)]);
      setCandidates(nextCandidates);
      setSelectedCandidateId(nextCandidates[0]?.id ?? null);
      return demandMatchPhase({
        demandStatus: record.status,
        demandVisibility: record.visibility,
        matchJobStatus: nextMatchJob?.status,
        candidateCount: nextCandidates.length,
      });
    },
    [],
  );

  const activateDemand = useCallback(
    async (record: FitMeetDemand, openDetail = false) => {
      const activationGeneration = ++demandMatchPollGenerationRef.current;
      activeDemandIdRef.current = record.id;
      setDemand(displayDemand(record));
      setHasDemand(true);
      setLiveDemand({ id: record.id });
      setMatchJob(null);
      setInviteStatus('none');
      setSelectedCandidateId(null);
      if (
        record.visibility === 'hidden' ||
        ['hidden', 'cancelled', 'canceled', 'closed'].includes(record.status)
      ) {
        setCandidates([]);
      } else {
        try {
          const page = await api.listDemandMatches(record.id);
          if (
            activationGeneration !== demandMatchPollGenerationRef.current ||
            activeDemandIdRef.current !== record.id
          )
            return;
          const guarded = guardDemandMatchesGeneration(page);
          if (!guarded.ok) {
            applyDemandProjection(
              {
                ...page.demand,
                candidateCount: 0,
                status: page.demand.status === 'hasCandidates' ? 'matching' : page.demand.status,
              },
              null,
              [],
            );
            notice(guarded.message, 'warning');
          } else {
            applyDemandProjection(page.demand, page.matchJob, guarded.candidates);
          }
        } catch (reason) {
          if (
            activationGeneration !== demandMatchPollGenerationRef.current ||
            activeDemandIdRef.current !== record.id
          )
            return;
          setCandidates([]);
          notice(reason instanceof Error ? reason.message : '这条需求的候选人暂时无法同步。');
        }
      }
      if (
        openDetail &&
        activationGeneration === demandMatchPollGenerationRef.current &&
        activeDemandIdRef.current === record.id
      )
        setOverlay('demand');
    },
    [api, applyDemandProjection, notice],
  );

  const openDemandRecord = useCallback(
    async (record: FitMeetDemand, openDetail = false) => {
      if (
        record.sourceConversationId &&
        record.sourceConversationId !== activeAgentThreadIdRef.current
      ) {
        await loadAgentThread(record.sourceConversationId, true);
      }
      await activateDemand(record, openDetail);
    },
    [activateDemand, loadAgentThread],
  );

  const openAgentThread = useCallback(
    async (threadId: string) => {
      agentSendRequestRef.current += 1;
      agentSendingRef.current = false;
      setAgentSending(false);
      setAgentPendingMessage(null);
      setAgentDraftStructuring(false);
      const detail = await loadAgentThread(threadId, true);
      if (!agentDraftCanRenderCard(detail.activeDraft)) {
        const linkedDemand = demandForAgentThread(demands, threadId);
        if (linkedDemand) await activateDemand(linkedDemand);
      }
    },
    [activateDemand, demands, loadAgentThread],
  );

  const startNewDemand = useCallback(async () => {
    agentThreadSwitchingRef.current = true;
    agentSendRequestRef.current += 1;
    agentSendingRef.current = false;
    setAgentSending(false);
    setAgentPendingMessage(null);
    setAgentDraftStructuring(false);
    try {
      const created = await api.createAgentThread();
      activeAgentThreadIdRef.current = created.thread.id;
      applyAgentDetail({ ...created, activeDraft: null, toolManifest: [] }, true);
      activeDemandIdRef.current = null;
      setLiveDemand(null);
      setHasDemand(false);
      setMatchJob(null);
      setCandidates([]);
      setSelectedCandidateId(null);
      setInviteStatus('none');
      await loadAgentThread(created.thread.id, true);
      setOverlay(null);
      setActiveTab('home');
      notice('已开始一条新对话；旧需求仍保留在“全部需求”中，不会带入这里。');
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '新的需求暂时无法创建。');
    } finally {
      agentThreadSwitchingRef.current = false;
    }
  }, [api, applyAgentDetail, loadAgentThread, notice]);

  const ensureAgentThread = useCallback(async () => {
    if (activeAgentThread && activeAgentThread.id === activeAgentThreadIdRef.current)
      return activeAgentThread;
    if (activeAgentThreadIdRef.current) {
      const detail = await loadAgentThread(activeAgentThreadIdRef.current);
      return detail.thread;
    }
    const created = await api.createAgentThread();
    activeAgentThreadIdRef.current = created.thread.id;
    const detail = await loadAgentThread(created.thread.id);
    return detail.thread;
  }, [activeAgentThread, api, loadAgentThread]);

  useEffect(() => {
    if (session.state.status !== 'authenticated') return;
    if (session.state.socialProfile) setProfile(session.state.socialProfile);
    if (!session.state.onboarding?.canUseSocialActions && !agentOnlyMode) {
      setSurface('onboarding');
    }
  }, [
    agentOnlyMode,
    session.state.onboarding?.canUseSocialActions,
    session.state.socialProfile,
    session.state.status,
  ]);

  useEffect(() => {
    if (session.state.status !== 'authenticated' || typeof window === 'undefined') return;
    const userId = session.state.session?.user.id;
    const key = notificationPreferenceKey(userId);
    setNotificationEnabled(!key || window.localStorage.getItem(key) !== 'false');
    let cancelled = false;
    if (userId) {
      void api
        .getNotificationPreferences()
        .then((preferences) => {
          if (cancelled) return;
          const enabled = notificationPreferencesEnabled(preferences);
          setNotificationEnabled(enabled);
          if (key) window.localStorage.setItem(key, String(enabled));
        })
        .catch(() => {
          // Keep the last local value as a safe fallback when an older API
          // deployment does not expose this optional preference endpoint.
        });
    }
    if (userId) {
      setLikedPostIds(
        readStoredArray<number>(likedMomentsKey(userId)).filter((id) => Number.isInteger(id)),
      );
      setClosedConversationIds(
        readStoredArray<string>(closedConversationsKey(userId)).filter(
          (id) => typeof id === 'string' && id,
        ),
      );
    }
    return () => {
      cancelled = true;
    };
  }, [api, session.state.session?.user.id, session.state.status]);

  useEffect(() => {
    if (session.state.status !== 'authenticated') return;
    void refreshBlockedUsers().catch(() => undefined);
  }, [refreshBlockedUsers, session.state.session?.user.id, session.state.status]);

  const updateNotificationPreference = async (enabled: boolean) => {
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      const permission =
        Notification.permission === 'default'
          ? await Notification.requestPermission()
          : Notification.permission;
      if (permission !== 'granted') {
        notice('浏览器通知权限未开启；账号通知偏好未修改，页面内实时消息仍会正常更新。');
        return;
      }
    }
    const userId = session.state.session?.user.id;
    const key = notificationPreferenceKey(userId);
    const previous = notificationEnabled;
    setNotificationPreferenceSyncing(true);
    try {
      const saved = await api.updateNotificationPreferences({
        directMessagesEnabled: enabled,
        interactionsEnabled: enabled,
        systemEnabled: enabled,
      });
      const effective = notificationPreferencesEnabled(saved);
      setNotificationEnabled(effective);
      if (key && typeof window !== 'undefined') window.localStorage.setItem(key, String(effective));
      notice(
        effective
          ? '通知偏好已同步；页面打开或处于后台标签页时会提示，彻底关闭浏览器后仍需系统推送能力。'
          : '通知偏好已同步关闭；不影响消息和邀请在服务端保存。',
      );
    } catch (reason) {
      setNotificationEnabled(previous);
      notice(reason instanceof Error ? `通知偏好未保存：${reason.message}` : '通知偏好未保存，请稍后重试。');
    } finally {
      setNotificationPreferenceSyncing(false);
    }
  };

  const rememberClosedConversations = useCallback(
    (ids: string[]) => {
      const validIds = ids.filter(Boolean);
      if (!validIds.length) return;
      setClosedConversationIds((current) => {
        const next = Array.from(new Set([...current, ...validIds]));
        const userId = session.state.session?.user.id;
        if (userId) writeStoredArray(closedConversationsKey(userId), next);
        return next;
      });
    },
    [session.state.session?.user.id],
  );

  const restoreConversationAccess = useCallback(
    (id: string) => {
      if (!id) return;
      setClosedConversationIds((current) => {
        const next = current.filter((item) => item !== id);
        const userId = session.state.session?.user.id;
        if (userId) writeStoredArray(closedConversationsKey(userId), next);
        return next;
      });
    },
    [session.state.session?.user.id],
  );

  useEffect(() => {
    if (!liveApi) return;
    void (async () => {
      const results = await Promise.allSettled([
        api.getFeed(),
        api.listMyDemands(),
        api.listMeetInvitations(),
        api.listConversations(),
        api.listConnectionRequests('inbox'),
        api.listConnectionRequests('outbox'),
        api.listAgentThreads(),
        api.listProfilePhotos(),
        api.getUnreadCount(),
      ] as const);
      const [
        feedResult,
        demandsResult,
        invitationsResult,
        conversationsResult,
        inboxResult,
        outboxResult,
        threadsResult,
        photosResult,
        unreadResult,
      ] = results;
      if (feedResult.status === 'fulfilled') {
        setPosts(feedResult.value.data);
        setFeedLastPage(feedResult.value.metadata?.lastPage ?? 1);
      }
      if (demandsResult.status === 'fulfilled') setDemands(demandsResult.value.data);
      if (invitationsResult.status === 'fulfilled') setInvitations(invitationsResult.value);
      if (conversationsResult.status === 'fulfilled') setConversations(conversationsResult.value);
      if (inboxResult.status === 'fulfilled') setIncomingConnections(inboxResult.value);
      if (outboxResult.status === 'fulfilled') setOutgoingConnections(outboxResult.value);
      if (photosResult.status === 'fulfilled') setProfilePhotos(photosResult.value);
      if (unreadResult.status === 'fulfilled') setUnreadCount(unreadResult.value.unreadCount ?? 0);
      const nextThreads =
        threadsResult.status === 'fulfilled'
          ? (threadsResult.value.items ?? threadsResult.value.data ?? [])
          : [];
      setAgentThreads(nextThreads);
      let restoredThreadId: string | null = null;
      let hasRemoteDraft = false;
      try {
        const userId = session.state.session?.user.id;
        const rememberedThreadId =
          userId && typeof window !== 'undefined'
            ? window.localStorage.getItem(activeAgentThreadKey(userId))
            : null;
        const requestedThread = agentThreadSwitchingRef.current
          ? null
          : preferredAgentThread(
              nextThreads,
              initialThreadId || activeAgentThreadIdRef.current || rememberedThreadId,
            );
        if (requestedThread) {
          const detail = await loadAgentThread(requestedThread.id, true);
          restoredThreadId = detail.thread.id;
          hasRemoteDraft = agentDraftCanRenderCard(detail.activeDraft);
        } else if (threadsResult.status === 'fulfilled' && !agentThreadSwitchingRef.current) {
          const created = await api.createAgentThread();
          activeAgentThreadIdRef.current = created.thread.id;
          applyAgentDetail({ ...created, activeDraft: null, toolManifest: [] }, true);
          const detail = await loadAgentThread(created.thread.id, true);
          restoredThreadId = detail.thread.id;
        }
      } catch (reason) {
        notice(reason instanceof Error ? reason.message : '小福历史暂时无法恢复。');
      }
      const myInvitations = invitationsResult.status === 'fulfilled' ? invitationsResult.value : [];
      const acceptedInvitation = myInvitations.find(
        (invitation) =>
          invitation.status === 'accepted' && (invitation.meetId || invitation.acceptedMeetId),
      );
      if (acceptedInvitation)
        setMeet({
          id: Number(acceptedInvitation.meetId || acceptedInvitation.acceptedMeetId),
          status: 'scheduled',
        });
      const restoredDemand =
        demandsResult.status === 'fulfilled'
          ? demandForAgentThread(demandsResult.value.data, restoredThreadId)
          : null;
      if (restoredDemand && !hasRemoteDraft) await activateDemand(restoredDemand);
      if (results.every((result) => result.status === 'rejected'))
        notice('未能同步你的 FitMeet 数据，请检查网络后重试。');
    })().catch((reason) =>
      notice(reason instanceof Error ? reason.message : '未能同步你的 FitMeet 数据。'),
    );
  }, [
    activateDemand,
    api,
    applyAgentDetail,
    initialThreadId,
    liveApi,
    loadAgentThread,
    notice,
    session.state.session?.user.id,
  ]);

  useEffect(() => {
    if (!liveApi) return;
    void Promise.all([
      api.listPublicSocialIntents(),
      api.listPublicTaskIntents(),
      api.listMyPublicIntentApplications('applicant'),
      api.listMyTaskIntentApplications('applicant'),
    ])
      .then(([nextSocial, nextTask, nextSocialApplications, nextTaskApplications]) => {
        setSocialIntents(nextSocial);
        setTaskIntents(nextTask);
        setSocialApplications(nextSocialApplications);
        setTaskApplications(nextTaskApplications);
      })
      .catch((reason) =>
        notice(reason instanceof Error ? reason.message : '大厅内容暂时无法同步。'),
      );
  }, [api, liveApi]);

  useEffect(() => {
    if (!liveApi) return;
    void refreshAgentInbox(agentInboxScope);
  }, [agentInboxScope, liveApi, refreshAgentInbox]);

  useEffect(() => {
    if (!liveApi) return;
    void Promise.all([
      api.listMyPublicIntentApplications('owner'),
      api.listMyTaskIntentApplications('owner'),
    ])
      .then(([socialOwnerApplications, taskOwnerApplications]) => {
        setOwnerSocialApplications(socialOwnerApplications);
        setOwnerTaskApplications(taskOwnerApplications);
      })
      .catch((reason) =>
        notice(reason instanceof Error ? reason.message : '消息事件暂时无法同步。'),
      );
  }, [api, liveApi, notice]);

  const completeOnboarding = async (payload: OnboardingPayload) => {
    try {
      const onboarding = await api.completeOnboarding(payload);
      const [socialProfile, nextProfilePhotos] = await Promise.all([
        api.getSocialProfile(),
        api.listProfilePhotos(),
      ]);
      session.setOnboarding(onboarding, sessionAccessToken);
      session.setSocialProfile(socialProfile, sessionAccessToken);
      setProfile(socialProfile);
      setProfilePhotos(nextProfilePhotos);
      setAgentOnlyMode(false);
      notice('资料已保存。小福会按你的兴趣和边界提供建议。');
      setSurface('main');
      setActiveTab('home');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : '资料暂未保存，请稍后再试。';
      notice(message);
      throw reason;
    }
  };

  const uploadProfilePhotos = async (files: File[]) => {
    if (files.length < 2) throw new Error('请至少选择 2 张清晰的本人照片。');
    const uploads = await Promise.all(files.map((file) => api.uploadImage(file)));
    const assetIds = uploads.map((upload) => upload.assetId ?? upload.asset_id ?? upload.id);
    if (assetIds.some((assetId) => !assetId))
      throw new Error('照片上传没有返回有效资源，请重新上传。');
    return api.replaceProfilePhotos(
      assetIds.map((assetId, index) => ({
        assetId: Number(assetId),
        sortOrder: index,
        isCover: index === 0,
      })),
    );
  };

  const sendAgentMessage = async (message = chatInput) => {
    const text = message.trim();
    if (!text || agentSendingRef.current) return;
    const sendRequestId = ++agentSendRequestRef.current;
    agentSendingRef.current = true;
    let expectedThreadId = activeAgentThreadIdRef.current;
    const operationIsCurrent = () =>
      sendRequestId === agentSendRequestRef.current &&
      (!expectedThreadId || activeAgentThreadIdRef.current === expectedThreadId);
    agentSendingAfterSequenceRef.current = agentEntries.reduce(
      (maximum, entry) => Math.max(maximum, Number(entry.sequence || 0)),
      0,
    );
    setAgentPendingMessage(text);
    setAgentSending(true);
    setChatInput('');
    let liveResponseId: string | null = null;
    try {
      const thread = await ensureAgentThread();
      if (expectedThreadId && thread.id !== expectedThreadId) return;
      expectedThreadId = thread.id;
      if (!operationIsCurrent()) return;
      const turn = await api.sendAgentThreadTurn(thread.id, text);
      if (!operationIsCurrent()) return;
      liveResponseId = `live-response-${turn.run.id}`;
      const acceptedEntries = compactAgentTimelineEntries([
        ...agentEntries,
        ...(turn.entries || []),
      ]);
      setAgentPendingMessage(null);
      setAgentEntries(acceptedEntries);
      setChat(chatFromAgentEntries(acceptedEntries));
      const afterSequence = (turn.entries || []).reduce(
        (maximum, entry) => Math.max(maximum, Number(entry.sequence || 0)),
        0,
      );
      const onLiveEvent = (event: AgentThreadEntry) => {
        if (
          !operationIsCurrent() ||
          !agentLiveEventBelongsToThread({
            activeThreadId: activeAgentThreadIdRef.current,
            expectedThreadId: thread.id,
            eventThreadId: event.threadId,
          })
        )
          return;
        if (event.kind === 'draft_skeleton') {
          setAgentDraftStructuring(true);
          return;
        }
        if (event.kind === 'draft_ready') {
          setAgentDraftStructuring(false);
          const liveDraft = event.payload?.draft;
          if (liveDraft && typeof liveDraft === 'object' && !Array.isArray(liveDraft)) {
            const nextDraft = liveDraft as DemandDraftSession;
            setActiveDraftSession(nextDraft);
            setDemand(displayDraftSession(nextDraft));
            setHasDemand(true);
          }
          return;
        }
        if (event.kind !== 'response.delta' && event.kind !== 'response.reset') return;
        // Keep token rendering outside the urgent input update lane. This
        // mirrors the native client’s immediate SSE presentation while
        // preserving the server as the source of final conversation state.
        startTransition(() => {
          setAgentEntries((current) => mergeAgentLiveResponse(current, turn.run.id, event));
        });
      };
      const run = await api.waitForAgentRun(turn.run.id, {
        afterSequence,
        timeoutMs: 45_000,
        onEvent: onLiveEvent,
      });
      if (!operationIsCurrent()) return;
      const detail = await loadAgentThread(thread.id, true);
      if (!operationIsCurrent()) return;
      if (!['completed', 'waiting_approval'].includes(run.status)) {
        notice('小福仍在后台处理，结果会自动回到当前对话。', 'info');
        void api.waitForAgentRun(run.id, { afterSequence, timeoutMs: 120_000, onEvent: onLiveEvent })
          .then(() => {
            if (!operationIsCurrent()) return undefined;
            return Promise.all([loadAgentThread(thread.id, true), refreshMemoryCenter()]);
          })
          .catch(() => undefined);
        return;
      }
      await refreshMemoryCenter();
      const feedback = agentTurnNotice({
        executionMode:
          typeof run.checkpoint?.executionMode === 'string'
            ? run.checkpoint.executionMode
            : turn.executionMode ?? undefined,
        activeDraft: detail.activeDraft,
      });
      if (feedback) notice(feedback);
    } catch (reason) {
      if (!operationIsCurrent()) return;
      const message = reason instanceof Error ? reason.message : '小福暂时无法回复，请稍后再试。';
      notice(message);
      setAgentPendingMessage(null);
      setChatInput((current) => (current.trim() ? current : text));
      if (liveResponseId) {
        setAgentEntries((current) => current.filter((entry) => entry.id !== liveResponseId));
      }
    } finally {
      if (operationIsCurrent()) {
        agentSendingRef.current = false;
        setAgentDraftStructuring(false);
        setAgentSending(false);
      }
    }
  };

  const startVoiceInput = () => {
    if (voiceInput.isListening) {
      voiceInput.stop();
      return;
    }
    if (!voiceInput.start())
      notice(voiceInput.error || '当前浏览器不支持语音转文字，请改用文字输入。');
  };

  const prepareDemandDraft = async () => {
    try {
      const thread = await ensureAgentThread();
      const detail = await loadAgentThread(thread.id, true);
      if (!detail.activeDraft)
        return notice(
          '先和小福说说你想一起做什么、什么时候或在意的边界；我会把内容保存为远端草稿。 ',
        );
      setOverlay('demandEdit');
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '需求草稿暂时无法恢复。 ');
    }
  };

  const saveDemandDraft = async (next: DemandViewModel) => {
    if (!activeDraftSession) return notice('这张草稿还没有同步到小福；请先发送一条需求描述。 ');
    const patch = mergeAgentDraftEdits(activeDraftSession, next);
    try {
      const saved = await api.updateDemandDraftSession(activeDraftSession.id, patch);
      setActiveDraftSession(saved);
      setDemand(displayDraftSession(saved));
      setHasDemand(agentDraftCanRenderCard(saved));
      setOverlay(null);
      notice('需求卡已更新；发布前仍可继续修改。');
    } catch (reason) {
      if (reason instanceof FitMeetApiError && reason.code === 'DRAFT_REVISION_CONFLICT') {
        const latest = reason.details && typeof reason.details === 'object' && 'currentItem' in reason.details
          ? (reason.details as { currentItem?: DemandDraftSession | null }).currentItem
          : null;
        if (latest) {
          setActiveDraftSession(latest);
          setDemand(displayDraftSession(latest));
          setHasDemand(true);
        }
        notice('草稿已在另一台设备更新，已加载最新版本，请确认后再保存。', 'info');
        return;
      }
      notice(reason instanceof Error ? reason.message : '需求草稿未能保存。 ');
    }
  };

  const applyVerifiedDemandDraftAction = (
    receipt: AgentDemandDraftActionReceipt,
  ): DemandMatchPhase | null => {
    if (!receipt.verified) throw new Error('服务端尚未确认这次操作，需求卡保持原样。');
    setActiveDraftSession(receipt.activeDraft);
    if (receipt.action === 'cancel') {
      demandMatchPollGenerationRef.current += 1;
      activeDemandIdRef.current = null;
      if (receipt.demand)
        setDemands((current) => [
          receipt.demand as FitMeetDemand,
          ...current.filter((item) => item.id !== receipt.demand?.id),
        ]);
      setDemand(emptyDemandView);
      setHasDemand(false);
      setLiveDemand(null);
      setMatchJob(null);
      setCandidates([]);
      setSelectedCandidateId(null);
      return null;
    }
    if (!receipt.demand) throw new Error('服务端没有返回可核验的需求状态，需求卡保持原样。');
    if (receipt.action === 'publish') {
      const guarded = guardDemandMatchesGeneration({
        demand: receipt.demand,
        matchJob: receipt.matchJob,
        candidates: [],
        total: 0,
      });
      if (!guarded.ok) throw new Error(guarded.message);
    }
    return applyDemandProjection(receipt.demand, receipt.matchJob, []);
  };

  const syncDemandMatches = async (demandId: string) => {
    const generation = demandMatchPollGenerationRef.current;
    const page = await api.listDemandMatches(demandId);
    if (
      generation !== demandMatchPollGenerationRef.current ||
      activeDemandIdRef.current !== demandId
    )
      throw new Error('当前查看的需求已经变化，已忽略旧的匹配结果。');
    const guarded = guardDemandMatchesGeneration(page);
    if (!guarded.ok) {
      const sanitizedDemand = {
        ...page.demand,
        candidateCount: 0,
        status: page.demand.status === 'hasCandidates' ? 'matching' : page.demand.status,
      };
      setMatchJob(null);
      setCandidates([]);
      setSelectedCandidateId(null);
      setDemand(displayDemand(sanitizedDemand));
      setDemands((current) => [
        sanitizedDemand,
        ...current.filter((item) => item.id !== demandId),
      ]);
      throw new Error(guarded.message);
    }
    return {
      phase: applyDemandProjection(page.demand, page.matchJob, guarded.candidates),
      actionableCandidateCount: guarded.candidates.length,
    };
  };

  const pollDemandMatches = (demandId: string) => {
    const generation = ++demandMatchPollGenerationRef.current;
    void (async () => {
      const delays = [500, 2_000, 5_000, 15_000, 30_000];
      for (let index = 0; index < delays.length; index += 1) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, delays[index]));
        if (generation !== demandMatchPollGenerationRef.current) return;
        try {
          const result = await syncDemandMatches(demandId);
          if (generation !== demandMatchPollGenerationRef.current) return;
          if (
            ['matched', 'invited', 'communicating', 'failed', 'hidden', 'cancelled'].includes(
              result.phase,
            )
          )
            return;
        } catch (reason) {
          if (generation !== demandMatchPollGenerationRef.current) return;
          if (index === delays.length - 1) {
            notice(
              reason instanceof Error
                ? `需求已经提交，候选状态稍后会自动补齐：${reason.message}`
                : '需求已经提交，候选状态稍后会自动补齐。',
              'warning',
            );
          }
        }
      }
    })();
  };

  const recoverDemandDraftAction = async (
    threadId: string,
    action: AgentDemandDraftAction,
    requestedDemandId?: string | null,
  ) => {
    const [detail, demandPage] = await Promise.all([
      loadAgentThread(threadId),
      api.listMyDemands(),
    ]);
    const record = demandForAgentThread(demandPage.data, threadId, requestedDemandId);
    const status = record?.status || '';
    const applied = action === 'publish'
      ? Boolean(
          record &&
            record.visibility === 'public' &&
            ['published', 'matching', 'candidatePool', 'hasCandidates', 'invited', 'matchedCommunicating'].includes(status),
        )
      : action === 'hide'
        ? Boolean(
            record &&
              record.visibility === 'hidden' &&
              ['hidden', 'matching', 'candidatePool', 'hasCandidates', 'invited', 'matchedCommunicating'].includes(status),
          )
        : Boolean(record && ['canceled', 'cancelled'].includes(status));
    if (!applied) return null;
    setActiveDraftSession(detail.activeDraft);
    if (action === 'cancel') {
      applyVerifiedDemandDraftAction({
        action,
        verified: true,
        demand: record,
        matchJob: null,
        activeDraft: detail.activeDraft,
      });
      return record;
    }
    applyDemandProjection(record as FitMeetDemand, null, []);
    return record;
  };

  const performDemandDraftAction = async (action: AgentDemandDraftAction) => {
    if (demandLifecycleActionRef.current || !activeDraftSession || !activeAgentThread) return;
    if (action === 'publish' && appConfigLoading)
      return notice('正在核对发布与匹配能力，请稍后再试。', 'pending');
    if (action === 'publish' && !demandPublishingEnabled)
      return notice(appConfigError || '当前环境暂未开放需求发布。', 'warning');
    if (action === 'publish' && !matchingEnabled)
      return notice(appConfigError || '当前环境暂未开放真实匹配。', 'warning');
    demandLifecycleActionRef.current = action;
    setDemandLifecycleAction(action);
    const draft = activeDraftSession;
    const thread = activeAgentThread;
    try {
      const receipt = await api.performAgentDemandDraftAction(thread.id, draft.id, {
        action,
        cardId: draft.generatedCardId || draft.id,
        expectedCardStatus: draft.status,
      });
      applyVerifiedDemandDraftAction(receipt);
      setOverlay(null);
      if (action === 'cancel') {
        notice('这张需求卡已取消；没有继续匹配或联系任何人。', 'success');
      } else if (receipt.demand) {
        pollDemandMatches(receipt.demand.id);
        notice(
          action === 'publish'
            ? '需求已发布，正在匹配合适的人。'
            : '需求已隐藏，匹配已暂停。',
          'success',
        );
      }
    } catch (reason) {
      const recovered = await recoverDemandDraftAction(
        thread.id,
        action,
        draft.generatedCardId,
      ).catch(() => null);
      if (recovered) {
        setOverlay(null);
        if (action !== 'cancel') pollDemandMatches(recovered.id);
        notice('网络回执中断，但已从服务端确认这次操作完成。', 'success');
      } else {
        notice(
          reason instanceof Error ? reason.message : '这次操作没有完成，需求卡保持原样。',
          'error',
        );
      }
    } finally {
      demandLifecycleActionRef.current = null;
      setDemandLifecycleAction(null);
    }
  };

  const publishDemand = async () => {
    if (demand.status === 'cancelled')
      return notice('这条需求已取消。你可以从新的想法重新开始，不需要勉强继续。');
    if (!session.state.onboarding?.canUseSocialActions) {
      setSurface('onboarding');
      return notice('完成资料和照片审核后，才能发布并匹配真实用户。你可以先继续和小福聊聊。 ');
    }
    if (!liveDemand) {
      await performDemandDraftAction('publish');
      return;
    }
    if (demandLifecycleActionRef.current) return;
    if (appConfigLoading) return notice('正在核对发布与匹配能力，请稍后再试。', 'pending');
    if (!demandPublishingEnabled || !matchingEnabled)
      return notice(appConfigError || '当前环境暂未开放需求发布与匹配。', 'warning');
    demandLifecycleActionRef.current = 'publish';
    setDemandLifecycleAction('publish');
    const demandId = liveDemand.id;
    try {
      const created = await api.getDemand(demandId);
      const published = await api.publishDemand(created.id, created.category, created.status);
      applyDemandProjection(published, null, []);
      setOverlay(null);
      pollDemandMatches(published.id);
      notice('需求已发布，正在匹配合适的人。', 'success');
    } catch (reason) {
      const recovered = await api.getDemand(demandId).catch(() => null);
      if (
        recovered &&
        recovered.visibility === 'public' &&
        ['published', 'matching', 'candidatePool', 'hasCandidates', 'invited', 'matchedCommunicating'].includes(recovered.status)
      ) {
        applyDemandProjection(recovered, null, []);
        setOverlay(null);
        pollDemandMatches(recovered.id);
        notice('网络回执中断，但已从服务端确认需求发布成功。', 'success');
      } else {
        notice(reason instanceof Error ? reason.message : '需求尚未发布，请稍后再试。');
      }
    } finally {
      demandLifecycleActionRef.current = null;
      setDemandLifecycleAction(null);
    }
  };

  const changeDemandStatus = async (status: DemandViewModel['status']) => {
    if (!liveDemand) {
      if (activeDraftSession && status === 'hidden') return performDemandDraftAction('hide');
      if (activeDraftSession && status === 'cancelled') return performDemandDraftAction('cancel');
      return notice('这是一张还没有发布的草稿。你可以继续编辑，或确认后再开始匹配。');
    }
    if (demandLifecycleActionRef.current) return;
    const action: AgentDemandDraftAction = status === 'hidden' ? 'hide' : 'cancel';
    demandLifecycleActionRef.current = action;
    setDemandLifecycleAction(action);
    if (status === 'hidden') {
      try {
        const result = await api.hideDemand(liveDemand.id, demand.status);
        demandMatchPollGenerationRef.current += 1;
        applyDemandProjection(result, null, []);
        notice('匹配已暂停。');
      } catch (reason) {
        notice(reason instanceof Error ? reason.message : '暂停匹配失败，请稍后再试。');
      }
    }
    if (status === 'cancelled') {
      try {
        const result = await api.cancelDemand(liveDemand.id, '用户主动取消', demand.status);
        demandMatchPollGenerationRef.current += 1;
        applyDemandProjection(result, null, []);
        notice('需求已取消，后续匹配已停止。');
      } catch (reason) {
        notice(reason instanceof Error ? reason.message : '取消需求失败，请稍后再试。');
      }
    }
    demandLifecycleActionRef.current = null;
    setDemandLifecycleAction(null);
  };

  const recordCandidate = (candidateId: number, decision: CandidateDecision) => {
    const candidate = candidates.find((item) => item.id === candidateId);
    if (!candidate || !liveDemand) return;
    void api
      .recordDemandCandidateBehavior(
        liveDemand.id,
        candidate.candidateRecordId,
        decision === 'dismissed'
          ? 'dismissed'
          : decision === 'saved'
            ? 'saved'
            : decision === 'invited'
              ? 'invited'
              : 'viewed',
      )
      .then(() => {
        setCandidates((items) =>
          items.map((item) => (item.id === candidateId ? { ...item, decision } : item)),
        );
      })
      .catch((reason) =>
        notice(reason instanceof Error ? reason.message : '候选人状态未保存，请稍后再试。'),
      );
  };

  const dismissCandidate = () => {
    if (!selectedCandidate) return;
    recordCandidate(selectedCandidate.id, 'dismissed');
    const next = candidates.find(
      (candidate) => candidate.id !== selectedCandidate.id && candidate.decision !== 'dismissed',
    );
    if (next) setSelectedCandidateId(next.id);
    notice('已标记为不合适；不会向对方发送任何通知。');
  };

  const refreshCommunications = async () => {
    const [nextInvitations, nextConversations, nextUnread] = await Promise.all([
      api.listMeetInvitations(),
      api.listConversations(),
      api.getUnreadCount(),
    ]);
    setInvitations(nextInvitations);
    setConversations(nextConversations);
    setUnreadCount(nextUnread.unreadCount ?? 0);
  };

  const refreshConnections = async () => {
    const [inbox, outbox] = await Promise.all([
      api.listConnectionRequests('inbox'),
      api.listConnectionRequests('outbox'),
    ]);
    setIncomingConnections(inbox);
    setOutgoingConnections(outbox);
  };

  const resolveConnection = async (
    request: FitMeetConnectionRequest,
    action: 'accept' | 'reject' | 'cancel',
  ) => {
    try {
      if (action === 'accept') {
        await api.acceptConnectionRequest(request.id);
        setRelationship('friends');
        notice('已接受好友申请。双方已建立关系，可以开始聊天。');
      }
      if (action === 'reject') {
        await api.rejectConnectionRequest(request.id);
        notice('已拒绝这次好友申请；不会打开私信。');
      }
      if (action === 'cancel') {
        await api.cancelConnectionRequest(request.id);
        notice('好友申请已撤回。');
      }
      await Promise.all([refreshConnections(), refreshCommunications()]);
      if (action === 'accept') setFriends(await api.listFriends());
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '关系状态未能更新，请稍后再试。');
    }
  };

  const resolveInvitation = async (
    invitation: MeetInvitation,
    action: 'accept' | 'reject' | 'cancel',
  ) => {
    try {
      if (action === 'accept') {
        const result = await api.acceptInvitation(invitation.id);
        if (result.meetId) setMeet({ id: result.meetId, status: 'scheduled' });
        const acceptedConversationId =
          result.conversation?.id || result.conversation?.conversationId;
        if (acceptedConversationId) {
          restoreConversationAccess(acceptedConversationId);
          await refreshCommunications();
          await openConversation(acceptedConversationId);
          notice('邀请已接受。服务端已返回正式会话，可以继续确认活动细节。');
        } else {
          notice('邀请已接受，但服务端尚未返回正式会话；不会提前打开聊天。');
        }
      }
      if (action === 'reject') {
        await api.rejectInvitation(invitation.id);
        notice('已婉拒这次邀请。不会开启会话，也不会继续催促你。');
      }
      if (action === 'cancel') {
        await api.cancelInvitation(invitation.id);
        notice('邀请已撤回。对方不会再被推进到会话。');
      }
      await refreshCommunications();
    } catch (reason) {
      const failure = reason instanceof Error ? reason : new Error('邀请状态未能更新，请稍后再试。');
      notice(failure.message);
      throw failure;
    }
  };

  const openConversation = async (
    conversationId: string,
    presentation: 'overlay' | 'page' = 'overlay',
  ) => {
    if (closedConversationIds.includes(conversationId)) {
      notice('这段旧会话已在拉黑时关闭。解除拉黑不会自动恢复关系，请重新匹配或建立关系后再聊天。');
      return;
    }
    const requestGeneration = ++conversationLoadGenerationRef.current;
    let expectedConversationId = conversationId;
    activeConversationIdRef.current = expectedConversationId;
    setConversationLoadingMore(false);
    setConversationSending(false);
    try {
      let nextConversations = conversations;
      let summary = nextConversations.find(
        (item) => item.id === conversationId || item.conversationId === conversationId,
      );
      if (!summary || (!isGroupConversation(summary) && !conversationPeerId(summary))) {
        nextConversations = await api.listConversations();
        setConversations(nextConversations);
        summary = nextConversations.find(
          (item) => item.id === conversationId || item.conversationId === conversationId,
        );
      }
      if (!summary || (!isGroupConversation(summary) && !conversationPeerId(summary)))
        throw new Error('会话缺少可验证的对方账号，请从最新消息列表重新进入。');
      if (
        !conversationRequestIsCurrent({
          expectedConversationId,
          activeConversationId: activeConversationIdRef.current,
          requestGeneration,
          currentGeneration: conversationLoadGenerationRef.current,
        })
      )
        return;
      expectedConversationId = summary.id;
      activeConversationIdRef.current = expectedConversationId;
      const page = await api.getConversationMessagesPage(conversationId, undefined, undefined, 50);
      if (
        !conversationRequestIsCurrent({
          expectedConversationId,
          activeConversationId: activeConversationIdRef.current,
          requestGeneration,
          currentGeneration: conversationLoadGenerationRef.current,
        })
      )
        return;
      const currentUserId = session.state.session?.user.id;
      setConversation(
        page.items.map((message) => displayConversationMessage(message, currentUserId)),
      );
      setConversationNextBefore(page.nextBefore);
      conversationReceiptRef.current.delete(conversationId);
      setConversationInput(conversationDraftsRef.current[summary.id] || '');
      setSelectedConversation(summary);
      if (presentation === 'overlay') setOverlay('conversation');
      await refreshCommunications();
    } catch (reason) {
      if (requestGeneration !== conversationLoadGenerationRef.current) return;
      notice(reason instanceof Error ? reason.message : '会话暂时无法打开，请稍后再试。');
    }
  };

  const loadOlderConversation = useCallback(async () => {
    if (
      !selectedConversation ||
      !conversationNextBefore ||
      conversationLoadingMore ||
      selectedConversationClosed
    )
      return;
    const conversationId = selectedConversation.id;
    const requestGeneration = conversationLoadGenerationRef.current;
    const requestedBefore = conversationNextBefore;
    setConversationLoadingMore(true);
    try {
      const page = await api.getConversationMessagesPage(
        conversationId,
        requestedBefore,
        undefined,
        50,
      );
      if (
        !conversationRequestIsCurrent({
          expectedConversationId: conversationId,
          activeConversationId: activeConversationIdRef.current,
          requestGeneration,
          currentGeneration: conversationLoadGenerationRef.current,
        })
      )
        return;
      const currentUserId = session.state.session?.user.id;
      const older = page.items.map((message) => displayConversationMessage(message, currentUserId));
      setConversation((items) => mergeConversationMessages(items, older));
      setConversationNextBefore(page.nextBefore);
    } catch (reason) {
      if (requestGeneration !== conversationLoadGenerationRef.current) return;
      notice(reason instanceof Error ? reason.message : '更早的消息暂时无法加载。', 'error');
    } finally {
      if (requestGeneration === conversationLoadGenerationRef.current)
        setConversationLoadingMore(false);
    }
  }, [
    api,
    conversationLoadingMore,
    conversationNextBefore,
    notice,
    selectedConversation,
    selectedConversationClosed,
    session.state.session?.user.id,
  ]);

  const markVisibleConversationMessage = useCallback(
    (messageId: string) => {
      const activeConversation = selectedConversation;
      if (!activeConversation || !messageId || selectedConversationClosed) return;
      const message = conversation.find((item) => item.id === messageId);
      if (!message || message.role !== 'peer') return;
      if (conversationReceiptRef.current.get(activeConversation.id) === messageId) return;
      const receiptKey = `${activeConversation.id}:${messageId}`;
      if (conversationReceiptPendingRef.current.has(receiptKey)) return;
      conversationReceiptPendingRef.current.add(receiptKey);
      void Promise.allSettled([
        api.markConversationDelivered(activeConversation.id, messageId),
        api.markConversationRead(activeConversation.id, messageId),
      ]).then((results) => {
        conversationReceiptPendingRef.current.delete(receiptKey);
        if (results.some((result) => result.status === 'rejected')) return;
        conversationReceiptRef.current.set(activeConversation.id, messageId);
        setConversations((items) =>
          items.map((item) =>
            item.id === activeConversation.id ? { ...item, unread: 0 } : item,
          ),
        );
        setUnreadCount((current) => Math.max(0, current - Number(activeConversation.unread || 0)));
      });
    },
    [api, conversation, selectedConversation, selectedConversationClosed],
  );

  const openDemandConversation = () => {
    const acceptedInvitation = invitations.find(
      (invitation) => invitation.demandId === liveDemand?.id && invitation.status === 'accepted',
    );
    const conversationId =
      acceptedInvitation?.conversation?.id || acceptedInvitation?.conversation?.conversationId;
    setOverlay(null);
    if (conversationId) {
      void openConversation(conversationId);
      return;
    }
    setActiveTab('messages');
    notice('匹配已经确认；请从消息列表进入已开放的会话。');
  };

  const requestFriendship = async (message: string): Promise<FitMeetActionResult> => {
    if (!selectedCandidate) return { ok: false, error: '当前没有可验证的候选人。' };
    try {
      await api.createConnectionRequest(
        selectedCandidate.candidateUserId,
        message,
        liveDemand?.id || '',
      );
      recordCandidate(selectedCandidate.id, 'saved');
      setRelationship('pending');
      setOverlay(null);
      await refreshConnections();
      notice('好友申请已发出；双方确认前不会开放连续私信。', 'success', {
        label: '查看申请',
        onSelect: () => router.push('/agent/try/relationships'),
      });
      return { ok: true };
    } catch (reason) {
      const error = reason instanceof Error ? reason.message : '好友申请未能发出，请稍后再试。';
      notice(error, 'error');
      return { ok: false, error };
    }
  };

  const createInvite = () => {
    if (!selectedCandidate) return;
    inviteIdempotencyKeyRef.current = `web-invite-${liveDemand?.id || 'demand'}-${selectedCandidate.candidateRecordId}-${crypto.randomUUID()}`;
    setInviteStatus('draft');
    setOverlay('invitation');
  };

  const sendInvite = async (message: string) => {
    if (!selectedCandidate || inviteSendingRef.current) return;
    if (!liveDemand) return notice('请先发布需求并从真实候选人中选择对象，再发送邀请。');
    inviteSendingRef.current = true;
    setInviteSending(true);
    const idempotencyKey =
      inviteIdempotencyKeyRef.current ||
      `web-invite-${liveDemand.id}-${selectedCandidate.candidateRecordId}-${crypto.randomUUID()}`;
    inviteIdempotencyKeyRef.current = idempotencyKey;
    try {
      await api.createInvitation(
        {
          inviteeUserId: selectedCandidate.candidateUserId,
          demandId: liveDemand.id,
          candidateRecordId: selectedCandidate.candidateRecordId,
          title: demand.title,
          message,
          activityType: demand.activityType,
          city: profile.city,
          locationText: demand.locationText,
          timeWindow: demand.timeWindow,
          capacityMax: demand.capacityMax,
          sourceType: 'agent_candidate',
          sourceId: liveDemand.id,
        },
        idempotencyKey,
      );
      recordCandidate(selectedCandidate.id, 'invited');
      setInviteStatus('sent');
      inviteIdempotencyKeyRef.current = null;
      setOverlay(null);
      await refreshCommunications();
      notice('邀请已发送，等待对方自主决定。');
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '邀请未能发送，请稍后再试。');
    } finally {
      inviteSendingRef.current = false;
      setInviteSending(false);
    }
  };

  const updateMeet = async (status: MeetViewStatus, review?: MeetViewModel['review']) => {
    if (!meet.id) return notice('还没有可操作的真实活动进程。');
    const copy: Record<MeetViewStatus, string> = {
      none: '',
      scheduled: '约练已经建立，出发前仍可以取消或调整。',
      arrived: '已记录确认到达；下一步由双方决定是否完成这次活动。',
      completed: '活动已完成。评价只用于守约与安全，不会要求你公开私人感受。',
      no_show: '已记录爽约。你可以选择只结束这次约练，也可以通过安全帮助提交说明。',
      cancelled: '约练已取消。提前停止是一种对彼此时间的尊重。',
    };
    try {
      if (status === 'arrived') await api.confirmMeet(meet.id);
      if (status === 'completed') {
        await api.completeMeet(meet.id);
        if (review)
          await api.reviewMeet(meet.id, {
            rating: review === '愉快' ? 5 : review === '守约' ? 4 : 2,
            tags: [review],
          });
      }
      if (status === 'no_show') await api.reportMeetNoShow(meet.id, '用户报告爽约');
      if (status === 'cancelled') await api.cancelMeet(meet.id, '用户主动取消');
      setMeet((current) => ({
        ...current,
        status,
        ...(status === 'arrived' ? { confirmedAt: '刚刚' } : {}),
        ...(status === 'completed' ? { completedAt: '刚刚', review } : {}),
      }));
      notice(copy[status]);
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '活动状态未能更新，请稍后再试。');
    }
  };

  const toggleLike = async (id: number) => {
    const optimistic = optimisticLikeState(posts, likedPostIds, id);
    const liked = optimistic.wasLiked;
    const previousPost = posts.find((post) => post.id === id);
    const previousLikedIds = likedPostIds;
    setLikedPostIds(optimistic.likedIds);
    setPosts(optimistic.posts);
    const currentUserId = session.state.session?.user.id;
    if (currentUserId) writeStoredArray(likedMomentsKey(currentUserId), optimistic.likedIds);
    try {
      const next = liked ? await api.unlikeFeedPost(id) : await api.likeFeedPost(id);
      setPosts((items) =>
        items.map((post) => (post.id === id ? { ...post, likes: next.likes } : post)),
      );
    } catch (reason) {
      setLikedPostIds(previousLikedIds);
      if (previousPost)
        setPosts((items) =>
          items.map((post) => (post.id === id ? { ...post, likes: previousPost.likes } : post)),
        );
      if (currentUserId) writeStoredArray(likedMomentsKey(currentUserId), previousLikedIds);
      notice(reason instanceof Error ? reason.message : '点赞未能保存，请稍后再试。');
    }
  };

  const selectPostImages = async (files: File[]) => {
    const available = Math.max(0, 9 - postImages.length);
    const selected = files.slice(0, available);
    if (files.length > available) notice('每条动态最多添加 9 张图片。');
    const valid = selected.filter((file) => {
      if (!file.type.startsWith('image/')) {
        notice(`${file.name} 不是支持的图片格式。`);
        return false;
      }
      if (file.size > 8 * 1024 * 1024) {
        notice(`${file.name} 超过 8MB，请压缩后再上传。`);
        return false;
      }
      return true;
    });
    try {
      const additions = await Promise.all(
        valid.map(
          (file) =>
            new Promise<MomentDraftImage>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({ id: crypto.randomUUID(), file, preview: String(reader.result || '') });
              reader.onerror = () => reject(new Error(`${file.name} 读取失败。`));
              reader.readAsDataURL(file);
            }),
        ),
      );
      setPostImages((current) => [...current, ...additions].slice(0, 9));
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '图片暂时无法读取。');
    }
  };

  const publishPost = async () => {
    const text = postText.trim();
    if ((!text && !postImages.length) || postPublishing) return;
    setPostPublishing(true);
    try {
      const uploads = await Promise.all(postImages.map((image) => api.uploadImage(image.file)));
      const rejected = uploads.find(
        (upload) =>
          (upload.moderationStatus ?? upload.moderation_status ?? 'approved') !== 'approved',
      );
      if (rejected) throw new Error('有图片尚未通过安全审核，动态没有发布；你可以调整后重试。');
      const images = uploads.map((upload) => ({
        assetId: Number(upload.assetId ?? upload.asset_id ?? upload.id),
        url: upload.url,
        width: upload.width,
        height: upload.height,
      }));
      if (images.some((image) => !image.assetId))
        throw new Error('图片缺少有效资源编号，动态没有发布。');
      const post = await api.createFeedPost({
        title: text ? '我的新动态' : '图片动态',
        text: text || '分享了今天的瞬间',
        tags: profile.interests.slice(0, 3),
        city: profile.city,
        images,
      });
      setPosts((items) => [post, ...items]);
      setPostText('');
      setPostImages([]);
      setOverlay(null);
      notice(
        images.length
          ? `动态与 ${images.length} 张图片已发布；精确位置没有展示。`
          : '动态已发布；精确位置没有展示。',
      );
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '动态未能发布，请稍后再试。');
    } finally {
      setPostPublishing(false);
    }
  };

  const deletePost = async (post: FeedPost) => {
    try {
      await api.deleteFeedPost(post.id);
      setPosts((items) => items.filter((item) => item.id !== post.id));
      notice('动态已从 FitMeet 服务端删除。');
      return true;
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '动态暂时无法删除。');
      return false;
    }
  };

  const rememberBlockedUser = useCallback(
    (record: BlockedUserRecord) => {
      setBlockedUsers((current) => {
        return [record, ...current.filter((item) => item.id !== record.id)];
      });
    },
    [],
  );

  const blockAndRemember = async (target: {
    id: number;
    name?: string;
    avatar?: string | null;
  }) => {
    await api.blockUser(target.id);
    rememberBlockedUser({
      id: target.id,
      name: target.name || 'FitMeet 用户',
      avatar: target.avatar,
      blockedAt: new Date().toISOString(),
    });
    void refreshBlockedUsers().catch(() => undefined);
    const affectedConversationIds = conversations
      .filter((item) => conversationPeerId(item) === Number(target.id))
      .map((item) => item.id);
    if (selectedConversation && conversationPeerId(selectedConversation) === Number(target.id))
      affectedConversationIds.push(selectedConversation.id);
    rememberClosedConversations(affectedConversationIds);
    setConversations((items) =>
      items.filter((item) => Number(item.userId ?? item.peer?.id) !== Number(target.id)),
    );
    setCandidates((items) =>
      items.filter((item) => Number(item.candidateUserId) !== Number(target.id)),
    );
    notice('已拉黑；服务端会停止推荐和后续私信。');
  };

  const unblockKnownUser = async (target: BlockedUserRecord) => {
    try {
      await api.unblockUser(target.id);
      setBlockedUsers((current) => current.filter((item) => item.id !== target.id));
      notice(
        `已解除对 ${target.name} 的拉黑；旧会话不会自动恢复，需要重新匹配或建立关系后再聊天。`,
      );
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '解除拉黑暂时未能完成。');
    }
  };

  const changeApplication = async (
    kind: 'social' | 'task',
    intent: FitMeetPublicIntent,
    next: ApplicationViewStatus,
    applicationMessage?: string,
  ) => {
    const current =
      kind === 'social'
        ? socialApplications.find((item) => item.publicIntentId === intent?.id)
        : taskApplications.find((item) => item.taskIntentId === intent?.id);
    try {
      if (next === 'pending') {
        if (kind === 'social')
          await api.createPublicIntentApplication(
            intent.id,
            applicationMessage || '想先确认活动细节，再决定是否加入。',
          );
        else
          await api.createTaskIntentApplication(
            intent.id,
            applicationMessage || '我可以先沟通服务细节，再确认是否参与。',
          );
        notice('申请已提交；对方接受前不会开放连续私信。');
      }
      if (next === 'cancelled') {
        if (!current) return;
        if (kind === 'social') await api.cancelPublicIntentApplication(current.id);
        else await api.cancelTaskIntentApplication(current.id);
        notice('申请已取消。');
      }
      const [nextSocialApplications, nextTaskApplications] = await Promise.all([
        api.listMyPublicIntentApplications('applicant'),
        api.listMyTaskIntentApplications('applicant'),
      ]);
      setSocialApplications(nextSocialApplications);
      setTaskApplications(nextTaskApplications);
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '申请状态未能更新，请稍后再试。');
    }
  };

  const acknowledgeInboxEvent = async (eventId: string) => {
    const selectedEvent = agentInboxEvents.find((item) => item.id === eventId);
    if (selectedEvent?.acknowledgedAt) return;
    try {
      await api.acknowledgeAgentInboxEvents([eventId]);
      const acknowledgedAt = new Date().toISOString();
      setAgentInboxEvents((items) =>
        agentInboxScope === 'unread'
          ? items.filter((item) => item.id !== eventId)
          : items.map((item) => (item.id === eventId ? { ...item, acknowledgedAt } : item)),
      );
      setAgentInboxUnreadCount((count) => Math.max(0, count - 1));
      if (agentInboxScope === 'unread') setAgentInboxTotal((count) => Math.max(0, count - 1));
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '通知暂时无法标记为已读。');
    }
  };

  const openInboxEvent = async (event: AgentInboxEvent) => {
    const destination = inboxEventDestination(event);
    try {
      if (destination.kind === 'conversation') await openConversation(destination.id);
      else if (destination.kind === 'user') router.push(`/agent/try/users/${destination.id}`);
      else if (destination.kind === 'demand')
        router.push(`/agent/try/demands/${encodeURIComponent(destination.id)}`);
      else if (destination.kind === 'group')
        router.push(`/agent/try/groups/${encodeURIComponent(destination.id)}`);
      else if (destination.kind === 'post')
        router.push(`/agent/try/discover/posts/${destination.id}`);
      await acknowledgeInboxEvent(event.id);
      if (destination.kind === 'none')
        notice('通知已标记为已读；服务端没有提供可打开的目标页面。', 'info');
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '通知目标暂时无法打开；通知仍会保留。');
    }
  };

  const loadMoreInboxEvents = async () => {
    if (!agentInboxNextCursor || agentInboxLoadingMore) return;
    const requestedScope = agentInboxScope;
    const requestedCursor = agentInboxNextCursor;
    setAgentInboxLoadingMore(true);
    try {
      const page = await api.getAgentInboxEvents(30, requestedCursor, requestedScope);
      if (requestedScope !== agentInboxScopeRef.current) return;
      setAgentInboxEvents((items) => dedupeInboxEvents([...items, ...page.items]));
      setAgentInboxNextCursor(page.nextCursor ?? null);
      setAgentInboxTotal(page.total ?? agentInboxTotal);
      setAgentInboxHistoryCount(page.historyCount ?? agentInboxHistoryCount);
      setAgentInboxUnreadCount(page.unreadCount ?? agentInboxUnreadCount);
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '更早的通知暂时无法加载。');
    } finally {
      setAgentInboxLoadingMore(false);
    }
  };

  const resolveIntentApplication = async (
    kind: 'social' | 'task',
    application: FitMeetIntentApplication,
    decision: 'accept' | 'reject',
  ) => {
    try {
      if (kind === 'social') {
        if (decision === 'accept') await api.acceptPublicIntentApplication(application.id);
        else await api.rejectPublicIntentApplication(application.id);
      } else if (decision === 'accept') await api.acceptTaskIntentApplication(application.id);
      else await api.rejectTaskIntentApplication(application.id);
      const [socialOwnerApplications, taskOwnerApplications, nextConversations, events] =
        await Promise.all([
          api.listMyPublicIntentApplications('owner'),
          api.listMyTaskIntentApplications('owner'),
          api.listConversations(),
          api.getAgentInboxEvents(30, undefined, agentInboxScope),
        ]);
      setOwnerSocialApplications(socialOwnerApplications);
      setOwnerTaskApplications(taskOwnerApplications);
      setConversations(nextConversations);
      applyAgentInboxPage(events);
      notice(
        decision === 'accept' ? '已接受申请；会话会以服务端实际开放状态显示。' : '已婉拒申请。',
      );
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '申请暂时无法处理。');
    }
  };

  const sendConversation = async (retry?: ConversationMessage) => {
    const text = (retry?.text || conversationInput).trim();
    if (!text || !selectedConversation || selectedConversationClosed || conversationSending) return;
    const activeConversation = selectedConversation;
    const conversationId = activeConversation.id;
    const requestGeneration = conversationLoadGenerationRef.current;
    if (
      !conversationRequestIsCurrent({
        expectedConversationId: conversationId,
        activeConversationId: activeConversationIdRef.current,
        requestGeneration,
        currentGeneration: conversationLoadGenerationRef.current,
      })
    )
      return;
    setConversationSending(true);
    const clientMessageId =
      retry?.clientMessageId || retry?.id || `web-message-${crypto.randomUUID()}`;
    if (retry)
      setConversation((items) =>
        items.map((item) =>
          item.id === retry.id ? { ...item, localStatus: 'sending', status: 'sending' } : item,
        ),
      );
    else {
      setConversation((items) => [...items, optimisticMessage(text, clientMessageId)]);
    }
    try {
      const response = await api.sendConversationMessage(
        conversationId,
        text,
        clientMessageId,
      );
      if (
        !conversationRequestIsCurrent({
          expectedConversationId: conversationId,
          activeConversationId: activeConversationIdRef.current,
          requestGeneration,
          currentGeneration: conversationLoadGenerationRef.current,
        })
      )
        return;
      const currentUserId = session.state.session?.user.id;
      const settled = displayConversationMessage(
        { ...response, clientMessageId, text: response.text || response.body?.text || text },
        currentUserId,
      );
      setConversation((items) => settleOptimisticMessage(items, clientMessageId, settled));
      if (!retry) {
        setConversationInput((current) => (current.trim() === text ? '' : current));
        if ((conversationDraftsRef.current[conversationId] || '').trim() === text) {
          persistConversationDraft(conversationId, '');
        }
      }
      await refreshCommunications();
    } catch (reason) {
      if (requestGeneration !== conversationLoadGenerationRef.current) return;
      setConversation((items) => failOptimisticMessage(items, clientMessageId));
      if (reason instanceof FitMeetApiError && reason.status === 403) {
        rememberClosedConversations([conversationId]);
        setConversations((items) => items.filter((item) => item.id !== conversationId));
        notice(
          '这段会话已经关闭，消息没有发送。解除拉黑不会自动恢复旧关系，请重新匹配或建立关系。',
        );
        return;
      }
      notice(reason instanceof Error ? reason.message : '消息未能发送，请稍后再试。');
    } finally {
      if (requestGeneration === conversationLoadGenerationRef.current)
        setConversationSending(false);
    }
  };

  const recallConversationMessage = async (messageId: string) => {
    try {
      const recalled = await api.recallConversationMessage(messageId);
      setConversation((items) =>
        items.map((item) =>
          item.id === messageId
            ? displayConversationMessage(
                {
                  ...recalled,
                  lifecycleStatus: 'recalled',
                  recalledAt: recalled.recalledAt || new Date().toISOString(),
                },
                session.state.session?.user.id,
              )
            : item,
        ),
      );
      notice('消息已撤回；服务端仍会保留必要的安全审计记录。');
    } catch (reason) {
      notice(
        reason instanceof Error ? reason.message : '消息未能撤回；撤回仅在发送后短时间内可用。',
      );
    }
  };

  const reportConversationMessage = async (
    messageId: string,
    reason = 'inappropriate_content',
    details = '网页端会话消息举报',
  ) => {
    try {
      await api.reportConversationMessage(messageId, reason, details);
      notice('这条消息已提交安全审核；不会自动回复或继续联系对方。');
    } catch (reason) {
      const failure = reason instanceof Error ? reason : new Error('消息举报暂时未能提交。');
      notice(failure.message);
      throw failure;
    }
  };

  const toggleConversationMute = async () => {
    if (!selectedConversation) return;
    const muted =
      selectedConversation.notificationLevel === 'muted' ||
      Boolean(
        selectedConversation.mutedUntil &&
          new Date(selectedConversation.mutedUntil).getTime() > Date.now(),
      );
    try {
      const next = await api.updateConversationSettings(selectedConversation.id, {
        notificationLevel: muted ? 'normal' : 'muted',
        mutedUntil: null,
      });
      const updated = {
        ...selectedConversation,
        ...next,
        notificationLevel: muted ? 'normal' : 'muted',
        mutedUntil: null,
      };
      setSelectedConversation(updated);
      setConversations((items) =>
        items.map((item) => (item.id === selectedConversation.id ? updated : item)),
      );
      notice(muted ? '已恢复这段会话的提醒。' : '已静音这段会话；消息仍会保存在服务端。');
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '会话提醒设置暂时无法更新。');
    }
  };

  const saveProfile = async (patch: Partial<SocialProfile>) => {
    try {
      const next = await api.updateSocialProfile(patch);
      setProfile(next);
      session.setSocialProfile(next, sessionAccessToken);
      notice('资料已更新。隐私与推荐设置已同步。');
      setOverlay(null);
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '资料未能保存，请稍后再试。');
    }
  };

  const memoryForRevisionWrite = (
    id: string,
  ): (FitMeetAgentMemory & { revision: number }) | null => {
    const current = memories.find((item) => item.id === id);
    if (typeof current?.revision === 'number') return { ...current, revision: current.revision };
    void refreshMemoryCenter();
    notice('画像版本信息不完整，正在同步最新版本；请稍后重试。', 'warning');
    return null;
  };

  const reconcileMemoryRevisionConflict = (reason: unknown, id: string) => {
    if (!(reason instanceof FitMeetApiError)) return false;
    const latest = (reason.details as { currentItem?: FitMeetAgentMemory } | undefined)?.currentItem;
    if (reason.code !== 'MEMORY_REVISION_CONFLICT' && latest?.id !== id) return false;
    if (latest?.id === id) {
      setMemories((items) => items.map((item) => (item.id === id ? latest : item)));
    } else {
      void refreshMemoryCenter();
    }
    notice('这条画像已在另一端更新，已为你同步最新版本；请核对后再操作。', 'warning');
    return true;
  };

  const saveMemory = async (
    id: string,
    useScope: AgentMemoryUseScope,
    explicitSensitiveConsent: boolean,
  ) => {
    const requestOwnerId = memoryOwnerId;
    if (!isCurrentMemoryOwner(requestOwnerId)) return;
    const current = memoryForRevisionWrite(id);
    if (!current) return;
    try {
      const saved = await api.confirmAgentMemory(
        id,
        current.revision,
        useScope,
        explicitSensitiveConsent,
      );
      if (!isCurrentMemoryOwner(requestOwnerId)) return;
      setMemories((items) => items.map((item) => (item.id === id ? saved : item)));
      notice(`画像已由你确认；使用范围为“${memoryUseScopePresentation(useScope).label}”。`);
    } catch (reason) {
      if (!isCurrentMemoryOwner(requestOwnerId)) return;
      if (!reconcileMemoryRevisionConflict(reason, id))
        notice(reason instanceof Error ? reason.message : '偏好未能保存，请稍后再试。');
    }
  };

  const updateMemory = async (
    id: string,
    patch: { value?: string; useScope?: AgentMemoryUseScope },
  ) => {
    const requestOwnerId = memoryOwnerId;
    if (!isCurrentMemoryOwner(requestOwnerId)) return false;
    const current = memoryForRevisionWrite(id);
    if (!current) return false;
    const expandsSensitiveUse = Boolean(
      current
        && patch.useScope
        && ['agent_and_matching', 'matching_only'].includes(patch.useScope)
        && memorySensitivityPresentation(current.sensitivity).tone === 'caution',
    );
    try {
      const saved = await api.updateAgentMemory(id, {
        ...patch,
        expectedRevision: current.revision,
        ...(expandsSensitiveUse ? { explicitSensitiveConsent: true } : {}),
      });
      if (!isCurrentMemoryOwner(requestOwnerId)) return false;
      setMemories((items) => items.map((item) => (item.id === id ? saved : item)));
      notice(
        patch.useScope
          ? `使用范围已改为“${memoryUseScopePresentation(patch.useScope).label}”。`
          : '画像内容已由你纠正。',
      );
      return true;
    } catch (reason) {
      if (!isCurrentMemoryOwner(requestOwnerId)) return false;
      if (!reconcileMemoryRevisionConflict(reason, id)) {
        notice(reason instanceof Error ? reason.message : '画像未能更新，请稍后再试。');
      }
      return false;
    }
  };

  const deleteMemory = async (id: string) => {
    const requestOwnerId = memoryOwnerId;
    if (!isCurrentMemoryOwner(requestOwnerId)) return false;
    const current = memoryForRevisionWrite(id);
    if (!current) return false;
    try {
      await api.deleteAgentMemory(id, current.revision);
      if (!isCurrentMemoryOwner(requestOwnerId)) return false;
      setMemories((items) => items.filter((item) => item.id !== id));
      notice('这条偏好已删除；后续不会再使用它解释推荐。');
      return true;
    } catch (reason) {
      if (!isCurrentMemoryOwner(requestOwnerId)) return false;
      if (!reconcileMemoryRevisionConflict(reason, id))
        notice(reason instanceof Error ? reason.message : '偏好未能删除，请稍后再试。');
      return false;
    }
  };

  const rejectMemory = async (id: string) => {
    const requestOwnerId = memoryOwnerId;
    if (!isCurrentMemoryOwner(requestOwnerId)) return;
    const current = memoryForRevisionWrite(id);
    if (!current) return;
    try {
      await api.rejectAgentMemory(id, current.revision);
      if (!isCurrentMemoryOwner(requestOwnerId)) return;
      setMemories((items) => items.filter((item) => item.id !== id));
      notice('这条推断已拒绝，不会成为长期记忆。');
    } catch (reason) {
      if (!isCurrentMemoryOwner(requestOwnerId)) return;
      if (!reconcileMemoryRevisionConflict(reason, id))
        notice(reason instanceof Error ? reason.message : '这条推断暂时无法拒绝，请稍后再试。');
    }
  };

  const toggleMemoryInference = async () => {
    const requestOwnerId = memoryOwnerId;
    if (!memoryControl || !isCurrentMemoryOwner(requestOwnerId)) return;
    const nextEnabled = !memoryControl.inferenceEnabled;
    try {
      const next = await api.updateAgentMemoryControl(nextEnabled);
      if (!isCurrentMemoryOwner(requestOwnerId)) return;
      setMemoryControl(next);
      notice(
        nextEnabled
          ? '小福可以再次从你的原话中提出待确认画像。'
          : '已暂停提出新画像；已确认画像仍按各自使用范围生效。',
      );
    } catch (reason) {
      if (!isCurrentMemoryOwner(requestOwnerId)) return;
      notice(reason instanceof Error ? reason.message : '画像推断设置暂时无法更新。');
    }
  };

  const suppressMemory = async (id: string) => {
    const requestOwnerId = memoryOwnerId;
    if (!isCurrentMemoryOwner(requestOwnerId)) return false;
    const current = memoryForRevisionWrite(id);
    if (!current) return false;
    try {
      const result = await api.suppressAgentMemory(id, current.revision);
      if (!isCurrentMemoryOwner(requestOwnerId)) return false;
      setMemories((items) => items.filter((item) => item.id !== id));
      setMemoryControl(result.control);
      notice(`已删除并禁止再次推断“${memoryTypeLabel(result.item.memoryType)}”。`);
      return true;
    } catch (reason) {
      if (!isCurrentMemoryOwner(requestOwnerId)) return false;
      if (!reconcileMemoryRevisionConflict(reason, id))
        notice(reason instanceof Error ? reason.message : '暂时无法禁止再次推断这类画像。');
      return false;
    }
  };

  const removeMemorySuppression = async (memoryType: string) => {
    const requestOwnerId = memoryOwnerId;
    if (!isCurrentMemoryOwner(requestOwnerId)) return;
    try {
      const next = await api.removeAgentMemorySuppression(memoryType);
      if (!isCurrentMemoryOwner(requestOwnerId)) return;
      setMemoryControl(next);
      notice(`以后可以再次提出“${memoryTypeLabel(memoryType)}”画像，仍需你确认。`);
    } catch (reason) {
      if (!isCurrentMemoryOwner(requestOwnerId)) return;
      notice(reason instanceof Error ? reason.message : '暂时无法恢复这类画像提议。');
    }
  };

  const loadMemoryUsage = async (id: string, cursor?: string) => {
    const requestOwnerId = memoryOwnerId;
    if (!isCurrentMemoryOwner(requestOwnerId)) throw new Error('登录账号已切换，请重新打开使用记录。');
    const page = await api.listAgentMemoryUsage(id, cursor, 20);
    if (!isCurrentMemoryOwner(requestOwnerId)) throw new Error('登录账号已切换，请重新打开使用记录。');
    return page;
  };

  const updateNeedWiki = async (id: string, title: string, summary: string) => {
    const current = needWikiEntries.find((item) => item.id === id);
    if (!current) return false;
    try {
      const response = await api.updateAgentNeedWiki(id, {
        revision: current.revision,
        title,
        summary,
      });
      setNeedWikiEntries((items) => [
        response.item,
        ...items.filter((item) => item.id !== response.item.id),
      ]);
      notice('需求 Wiki 已按你的纠正更新。');
      return true;
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '需求 Wiki 未能更新，请刷新后重试。');
      return false;
    }
  };

  const deleteNeedWiki = async (id: string) => {
    const current = needWikiEntries.find((item) => item.id === id);
    if (!current) return false;
    try {
      await api.deleteAgentNeedWiki(id, current.revision);
      setNeedWikiEntries((items) => items.filter((item) => item.id !== id));
      notice('这份需求 Wiki 已删除，后续不会再作为语义上下文使用。');
      return true;
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '需求 Wiki 未能删除，请刷新后重试。');
      return false;
    }
  };

  const saveCapabilityOffering = async (draft: {
    id?: string;
    displayName: string;
    domain: string;
    capabilities: string[];
    serviceModes: string[];
    city?: string | null;
    acceptsNewRequests: boolean;
  }) => {
    try {
      const existing = draft.id
        ? capabilityOfferings.find((item) => item.id === draft.id)
        : null;
      const saved = existing
        ? await api.updateCapabilityOffering(existing.id, {
            revision: existing.revision,
            capabilities: draft.capabilities,
            serviceModes: draft.serviceModes,
            city: draft.city,
            acceptsNewRequests: draft.acceptsNewRequests,
          })
        : await api.createCapabilityOffering({
            providerKind: 'person',
            displayName: draft.displayName,
            domain: draft.domain,
            capabilities: draft.capabilities,
            serviceModes: draft.serviceModes,
            city: draft.city,
            acceptsNewRequests: draft.acceptsNewRequests,
          });
      setCapabilityOfferings((items) => [saved, ...items.filter((item) => item.id !== saved.id)]);
      notice(existing ? '能力档案已更新。' : '能力档案已创建，后续可用于需求—能力匹配。');
      return true;
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '能力档案未能保存，请稍后再试。');
      return false;
    }
  };

  const syncOpenConversation = useCallback(async () => {
    const conversationId = selectedConversation?.id || '';
    if (
      !liveApi ||
      !conversationId ||
      closedConversationIds.includes(conversationId) ||
      conversationSyncingRef.current.has(conversationId)
    )
      return;
    const requestGeneration = conversationLoadGenerationRef.current;
    conversationSyncingRef.current.add(conversationId);
    try {
      const page = await api.getConversationMessagesPage(conversationId, undefined, undefined, 50);
      if (
        !conversationRequestIsCurrent({
          expectedConversationId: conversationId,
          activeConversationId: activeConversationIdRef.current,
          requestGeneration,
          currentGeneration: conversationLoadGenerationRef.current,
        })
      )
        return;
      const currentUserId = session.state.session?.user.id;
      setConversation((items) =>
        mergeConversationMessages(
          items,
          page.items.map((message) => displayConversationMessage(message, currentUserId)),
        ),
      );
      setConversationNextBefore((current) => current ?? page.nextBefore);
      const [nextConversations, nextUnread] = await Promise.all([
        api.listConversations(),
        api.getUnreadCount(),
      ]);
      if (
        !conversationRequestIsCurrent({
          expectedConversationId: conversationId,
          activeConversationId: activeConversationIdRef.current,
          requestGeneration,
          currentGeneration: conversationLoadGenerationRef.current,
        })
      )
        return;
      setConversations(nextConversations);
      setUnreadCount(nextUnread.unreadCount ?? 0);
      const nextSummary = nextConversations.find(
        (item) =>
          item.id === conversationId || item.conversationId === conversationId,
      );
      if (nextSummary) setSelectedConversation(nextSummary);
    } finally {
      conversationSyncingRef.current.delete(conversationId);
    }
  }, [api, closedConversationIds, liveApi, selectedConversation, session.state.session?.user.id]);

  const reconcileRealtimeState = useCallback(async () => {
    if (!liveApi) return;
    const results = await Promise.allSettled([
      api.getFeed(),
      api.listMyDemands(),
      api.listMeetInvitations(),
      api.listConversations(),
      api.listConnectionRequests('inbox'),
      api.listConnectionRequests('outbox'),
      api.getUnreadCount(),
      api.getAgentInboxEvents(30, undefined, agentInboxScope),
      api.listMyPublicIntentApplications('owner'),
      api.listMyTaskIntentApplications('owner'),
    ] as const);
    const [
      feedResult,
      demandsResult,
      invitationsResult,
      conversationsResult,
      inboxResult,
      outboxResult,
      unreadResult,
      eventsResult,
      socialApplicationsResult,
      taskApplicationsResult,
    ] = results;
    if (feedResult.status === 'fulfilled') {
      setPosts(feedResult.value.data);
      setFeedLastPage(feedResult.value.metadata?.lastPage ?? 1);
    }
    if (invitationsResult.status === 'fulfilled') setInvitations(invitationsResult.value);
    if (conversationsResult.status === 'fulfilled') setConversations(conversationsResult.value);
    if (inboxResult.status === 'fulfilled') setIncomingConnections(inboxResult.value);
    if (outboxResult.status === 'fulfilled') setOutgoingConnections(outboxResult.value);
    if (unreadResult.status === 'fulfilled') setUnreadCount(unreadResult.value.unreadCount ?? 0);
    if (eventsResult.status === 'fulfilled') {
      applyAgentInboxPage(eventsResult.value);
    }
    if (socialApplicationsResult.status === 'fulfilled')
      setOwnerSocialApplications(socialApplicationsResult.value);
    if (taskApplicationsResult.status === 'fulfilled')
      setOwnerTaskApplications(taskApplicationsResult.value);
    if (demandsResult.status === 'fulfilled') setDemands(demandsResult.value.data);
    const threadIdToRefresh = activeAgentThreadIdRef.current;
    if (threadIdToRefresh && !agentThreadSwitchingRef.current)
      await loadAgentThread(threadIdToRefresh);
    const currentDemand =
      demandsResult.status === 'fulfilled'
        ? demandForAgentThread(
            demandsResult.value.data,
            activeAgentThreadIdRef.current,
            liveDemand?.id,
          )
        : null;
    if (currentDemand) await activateDemand(currentDemand);
    await syncOpenConversation();
    if (results.every((result) => result.status === 'rejected'))
      throw new Error('实时数据暂时无法同步。');
  }, [
    activateDemand,
    agentInboxScope,
    api,
    applyAgentInboxPage,
    liveApi,
    liveDemand?.id,
    loadAgentThread,
    syncOpenConversation,
  ]);

  const handleRealtimeEvent = useCallback(
    (event: FitMeetRealtimeEvent) => {
      const eventConversationId =
        typeof event.payload?.conversationId === 'string' ? event.payload.conversationId : '';
      if (event.eventType === 'chat.unlocked' && eventConversationId)
        restoreConversationAccess(eventConversationId);
      void reconcileRealtimeState().catch(() => notice('实时同步暂时中断；网络恢复后会自动补齐。'));
      const eventCopy: Record<string, string> = {
        'demand.candidates.ready': '小福找到了新的候选人，已为你刷新。',
        'invitation.sent': '你收到一份新邀请。',
        'invitation.accepted': '对方接受了邀请，会话已经开放。',
        'chat.unlocked': '双方已经确认，会话现已开放。',
        'invitation.rejected': '对方暂时不方便接受这次邀请。',
        'message.received': '你收到一条新消息。',
        'connection.request.created': '你收到一条新的关系申请。',
        'connection.request.accepted': '对方接受了关系申请，现在可以聊天。',
        'feed.comment.created': '你的动态收到了一条新评论。',
        'public_intent.application.created': '你的社交需求收到了一条新申请。',
        'task.application.created': '你的任务需求收到了一条新申请。',
        'group.join.requested': '你的组局收到一条新的加入申请。',
        'group.join.approved': '你的加入申请已通过。',
        'group.waitlist.promoted': '你已从候补转为正式成员。',
        'group.cancelled': '一个相关组局已取消。',
      };
      const copy = eventCopy[event.eventType];
      if (notificationEnabled && copy) {
        notice(copy);
        if (
          typeof document !== 'undefined' &&
          document.visibilityState !== 'visible' &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted'
        ) {
          new Notification('FitMeet', {
            body: copy,
            icon: '/fitmeet-icon-v2.png',
            tag: event.eventType,
          });
        }
      }
    },
    [notificationEnabled, notice, reconcileRealtimeState, restoreConversationAccess],
  );

  const realtimeStatus = useFitMeetRealtime(
    session.state.session?.accessToken,
    handleRealtimeEvent,
    () => {
      void reconcileRealtimeState().catch(() => {
        // A socket wake-up can race with logout or token rotation. The event is
        // only an invalidation hint, so a later reconnect will safely retry.
      });
    },
  );

  useEffect(() => {
    if (
      !liveApi ||
      overlay !== 'conversation' ||
      !selectedConversation ||
      selectedConversationClosed
    )
      return;
    const refresh = () => {
      if (document.visibilityState === 'visible')
        void syncOpenConversation().catch(() => undefined);
    };
    const timer = window.setInterval(refresh, 2_500);
    return () => window.clearInterval(timer);
  }, [liveApi, overlay, selectedConversation, selectedConversationClosed, syncOpenConversation]);

  useEffect(() => {
    if (!liveApi || activeTab !== 'moments') return;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      void api
        .getFeed()
        .then((page) => {
          setPosts(page.data);
          setFeedLastPage(page.metadata?.lastPage ?? 1);
        })
        .catch(() => undefined);
    };
    const timer = window.setInterval(refresh, 6_000);
    return () => window.clearInterval(timer);
  }, [activeTab, api, liveApi]);

  useEffect(() => {
    if (!liveApi || !liveDemand?.id) return;
    const demandId = liveDemand.id;
    const refresh = () => {
      if (document.visibilityState === 'visible')
        void syncDemandMatches(demandId).catch(() => undefined);
    };
    const onOnline = () => void syncDemandMatches(demandId).catch(() => undefined);
    window.addEventListener('focus', refresh);
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [liveApi, liveDemand?.id]);

  const openToolProposal = (proposal: AgentThreadEntry) => {
    setSelectedToolProposal(proposal);
    setOverlay('toolApproval');
  };

  const resolveToolProposal = async (decision: 'approve' | 'decline', message?: string) => {
    if (!activeAgentThread || !selectedToolProposal || toolProposalDecision) return;
    setToolProposalDecision(decision);
    try {
      const resolved = await api.resolveAgentToolProposal(
        activeAgentThread.id,
        selectedToolProposal.id,
        decision,
        message ? { message } : undefined,
      );
      const executed = resolved.resolution.payload?.executed === true;
      const verified = resolved.resolution.payload?.verified === true;
      if (decision === 'approve' && executed && !verified)
        throw new Error('服务端执行后尚未通过状态回读验证，页面不会显示为已完成。');
      if (selectedToolProposal.toolName === 'press_demand_card_button') {
        const demandPage = await api.listMyDemands();
        setDemands(demandPage.data);
        await loadAgentThread(activeAgentThread.id);
        const linkedDemand = demandForAgentThread(demandPage.data, activeAgentThread.id);
        if (decision === 'approve' && !linkedDemand)
          throw new Error('操作已经提交，但当前需求状态尚未读回；请稍后刷新确认。');
        if (linkedDemand) await activateDemand(linkedDemand);
      } else {
        await reconcileRealtimeState();
      }
      setOverlay(null);
      setSelectedToolProposal(null);
      notice(
        decision === 'approve'
          ? verified
            ? '服务端已经执行并核验完成。'
            : '已按你的确认更新；界面已同步服务端状态。'
          : '好的，这项操作不会执行。',
        decision === 'approve' ? 'success' : 'info',
      );
    } catch (reason) {
      const detail = await loadAgentThread(activeAgentThread.id, true).catch(() => null);
      if (
        reason instanceof FitMeetApiError &&
        ['APPROVAL_STATE_STALE', 'APPROVAL_EXPIRED', 'APPROVAL_ALREADY_RESOLVED'].includes(
          reason.code || '',
        )
      ) {
        const replacement = detail
          ? latestAgentToolProposal(detail.entries, selectedToolProposal.toolName || '', [
              'awaiting_confirmation',
            ])
          : null;
        if (replacement) {
          setSelectedToolProposal(replacement);
          notice('确认内容已更新，请检查当前最新版本后再确认。', 'warning');
        } else {
          setOverlay(null);
          setSelectedToolProposal(null);
          notice('这项确认已失效，页面已经同步到当前状态。', 'warning');
        }
        return;
      }
      const retryJsonWrite =
        reason instanceof FitMeetApiError &&
        (reason.code === 'INVALID_JSONB_PAYLOAD' || /invalid input syntax for type json/i.test(reason.rawMessage));
      notice(
        reason instanceof Error ? reason.message : '这项操作没有成功提交；请检查后重试。',
        'error',
        retryJsonWrite
          ? { label: '重新确认', onSelect: () => setOverlay('toolApproval') }
          : undefined,
      );
    } finally {
      setToolProposalDecision(null);
    }
  };

  const destinationPath: Record<FitMeetAppDestination, string> = {
    home: '/agent/try',
    moments: '/agent/try/discover',
    messages: '/agent/try/messages',
    profile: '/agent/try/profile',
  };

  const navigateDestination = (destination: FitMeetAppDestination) => {
    if (destination === 'messages') setMessageLandingCategory('private');
    setActiveTab(destination);
    router.push(destinationPath[destination]);
  };

  const createGroupFromDemand = async (
    sourceDemand: FitMeetDemand,
    joinMode: FitMeetGroupJoinMode,
  ) => {
    if (!groupsEnabled) {
      notice('多人组局当前未由服务端开放；不会提交创建请求。', 'warning');
      return false;
    }
    try {
      const created = await api.createGroup({
        demandId: sourceDemand.id,
        joinMode,
        capacityMin: Math.max(2, sourceDemand.capacityMin),
        capacityMax: sourceDemand.capacityMax,
      });
      notice('组局已由服务端创建；不会自动邀请或联系任何人。', 'success');
      router.push(`/agent/try/groups/${encodeURIComponent(created.id)}`);
      return true;
    } catch (reason) {
      if (reason instanceof FitMeetApiError && reason.code === 'GROUP_ALREADY_EXISTS') {
        const groupId =
          reason.details && typeof reason.details === 'object' && 'groupId' in reason.details
            ? String((reason.details as { groupId: unknown }).groupId || '')
            : '';
        if (groupId) {
          notice('这条需求已经有组局，已为你打开现有记录。', 'info');
          router.push(`/agent/try/groups/${encodeURIComponent(groupId)}`);
          return true;
        }
      }
      notice(reason instanceof Error ? reason.message : '组局未能创建，请稍后重试。', 'error');
      return false;
    }
  };

  const openThreadFromShell = async (threadId: string) => {
    setActiveTab('home');
    router.push(`/agent/try/chat/${encodeURIComponent(threadId)}`);
    try {
      await openAgentThread(threadId);
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '对话记录暂时无法打开。');
    }
  };

  const createThreadFromShell = async () => {
    setActiveTab('home');
    router.push('/agent/try');
    await startNewDemand();
  };

  const currentDemandRecord = liveDemand
    ? demands.find((item) => item.id === liveDemand.id)
    : undefined;
  const showEditableDemandCard = Boolean(
    hasDemand &&
      !liveDemand &&
      activeDraftSession &&
      agentDraftCanRenderCard(activeDraftSession),
  );
  // matchJob.candidateCount is the immutable generation receipt. It must not
  // be presented as the number still actionable after invite/dismiss/block.
  const currentCandidateCount = activeCandidates.length;
  const currentDemandMatchPhase = liveDemand
    ? demandMatchPhase({
        demandStatus: currentDemandRecord?.status || demand.status,
        demandVisibility: currentDemandRecord?.visibility,
        matchJobStatus: matchJob?.status,
        candidateCount: currentCandidateCount,
      })
    : null;
  const contextFields = hasDemand
    ? (demand.fields || [])
        .filter((field) => field.value.trim())
        .map((field) => ({ label: field.title, value: field.value }))
    : Object.entries(activeDraftSession?.knownFields || {})
        .filter(([, value]) => value.trim())
        .map(([label, value]) => ({ label, value }));
  const currentDemandTitle = hasDemand
    ? demand.title
    : activeDraftSession?.rawUserIntent?.trim() ||
      (activeDraftSession ? '正在整理新的需求' : undefined);
  const currentDemandStatus = currentDemandRecord
    ? demandStatusCopy(currentDemandRecord)
    : activeDraftSession?.status === 'cardGenerated'
      ? '需求卡未发布'
      : activeDraftSession?.canGenerateCard
        ? '可编辑草稿 · 未发布'
        : activeDraftSession
          ? '等待补充'
          : undefined;
  const currentDemandLifecycleStage: FitMeetContextLifecycleStage = !liveDemand
    ? 'draft'
    : ['hidden', 'cancelled'].includes(currentDemandMatchPhase || '')
      ? 'published'
      : 'matching';
  const demandContextPrimary =
    currentDemandMatchPhase === 'invited'
      ? '查看已发邀请'
      : currentDemandMatchPhase === 'communicating'
        ? '进入聊天'
        : currentDemandMatchPhase === 'matched'
        ? activeCandidates.length
          ? `查看 ${activeCandidates.length} 位候选人`
          : '同步候选人'
        : effectiveDemandStatus(demand, activeCandidates.length) === 'communicating'
          ? '进入聊天'
          : liveDemand
            ? '查看需求与匹配状态'
            : activeDraftSession && !agentDraftCanRenderCard(activeDraftSession)
              ? '正在同步需求状态'
              : '查看需求与发布状态';
  const openDemandContextPrimary = () => {
    if (!liveDemand && activeDraftSession && !agentDraftCanRenderCard(activeDraftSession)) {
      return;
    }
    if (activeDraftSession && agentDraftCanRenderCard(activeDraftSession) && !hasDemand) {
      setDemand(displayDraftSession(activeDraftSession));
      setHasDemand(true);
      setOverlay('demand');
      return;
    }
    const status = effectiveDemandStatus(demand, activeCandidates.length);
    if (currentDemandMatchPhase === 'invited') {
      setOverlay(null);
      setMessageLandingCategory('interaction');
      setActiveTab('messages');
      router.push('/agent/try/messages');
      notice('邀请已发出；可以查看对方资料，接受后会在消息页开放会话。', 'info');
    } else if (currentDemandMatchPhase === 'communicating') openDemandConversation();
    else if (currentDemandMatchPhase === 'matched' && activeCandidates.length) setOverlay('candidate');
    else if (currentDemandMatchPhase === 'matched' && liveDemand)
      void syncDemandMatches(liveDemand.id)
        .then((result) => {
          if (result.actionableCandidateCount > 0) setOverlay('candidate');
          else notice('本轮候选已经处理完；新候选出现后会在这里更新。', 'info');
        })
        .catch((reason) =>
          notice(reason instanceof Error ? reason.message : '候选人详情暂时无法同步。', 'warning'),
        );
    else if (status === 'communicating') openDemandConversation();
    else if (hasDemand) setOverlay('demand');
  };

  const refreshFriends = useCallback(async () => {
    if (!liveApi) return;
    try {
      setFriends(await api.listFriends());
    } catch {
      setFriends([]);
    }
  }, [api, liveApi]);

  const addFriendFromProfile = async (
    user: PublicUserProfile,
    message: string,
  ): Promise<FitMeetActionResult> => {
    try {
      await api.createConnectionRequest(user.id, message, initialEntityId || '');
      await refreshConnections();
      notice('好友申请已发送；对方接受前不会开放连续私信。', 'success', {
        label: '查看申请',
        onSelect: () => router.push('/agent/try/relationships'),
      });
      return { ok: true };
    } catch (reason) {
      const error = reason instanceof Error ? reason.message : '好友申请未能发送。';
      notice(error, 'error');
      return { ok: false, error };
    }
  };

  const deleteFriendFromProfile = async (user: PublicUserProfile) => {
    try {
      await api.deleteFriend(user.id);
      await Promise.all([refreshFriends(), refreshCommunications()]);
      notice('好友关系已删除；不会自动拉黑对方。');
    } catch (reason) {
      const failure = reason instanceof Error ? reason : new Error('好友关系未能删除。');
      notice(failure.message);
      throw failure;
    }
  };

  const startConversationFromProfile = async (user: PublicUserProfile) => {
    try {
      const created = await api.startConversation(user.id, 'profile', String(user.id));
      await refreshCommunications();
      router.push(
        `/agent/try/messages/${encodeURIComponent(created.id || created.conversationId || '')}`,
      );
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '当前关系还不能开启会话。');
    }
  };

  const inviteFromProfile = (user: PublicUserProfile) => {
    const eligibleCandidate = candidates.find(
      (candidate) => Number(candidate.candidateUserId) === Number(user.id),
    );
    if (!liveDemand || !eligibleCandidate) {
      notice('活动邀请必须关联一条真实需求和候选记录；请先从该需求的候选人页发起。');
      return;
    }
    setSelectedCandidateId(eligibleCandidate.id);
    setInviteStatus('draft');
    setOverlay('invitation');
  };

  const unblockProfileUser = async (user: PublicUserProfile) => {
    try {
      await api.unblockUser(user.id);
      setBlockedUsers((current) => current.filter((item) => Number(item.id) !== Number(user.id)));
      setPublicUser((current) =>
        current && Number(current.id) === Number(user.id)
          ? { ...current, relationship: 'none' }
          : current,
      );
      await Promise.all([refreshConnections(), refreshFriends()]);
      notice('已解除拉黑；旧关系和旧会话不会自动恢复。');
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '解除拉黑暂时未能完成。');
    }
  };

  const acknowledgeAllEvents = async () => {
    if (!agentInboxUnreadCount) return;
    try {
      const result = await api.acknowledgeAllAgentInboxEvents();
      const acknowledgedAt = new Date().toISOString();
      if (agentInboxScope === 'unread') {
        setAgentInboxEvents([]);
        setAgentInboxNextCursor(null);
        setAgentInboxTotal(0);
      } else {
        setAgentInboxEvents((events) =>
          events.map((event) =>
            event.acknowledgedAt ? event : { ...event, acknowledgedAt },
          ),
        );
      }
      setAgentInboxUnreadCount(0);
      notice(`已同步标记 ${result.acknowledgedCount} 条服务端通知为已读。`);
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : '通知暂时无法全部标记为已读。');
    }
  };

  useEffect(() => {
    if (!liveApi) return;
    void refreshFriends();
  }, [liveApi, refreshFriends]);

  useEffect(() => {
    if (!liveApi || !initialExperience || !initialEntityId) return;
    const key = `${initialExperience}:${initialEntityId}`;
    if (deepLinkLoadedRef.current === key) return;
    deepLinkLoadedRef.current = key;
    if (initialExperience === 'user') {
      setPublicUserLoading(true);
      void api
        .getRelationshipUser(Number(initialEntityId))
        .then(setPublicUser)
        .catch(() => setPublicUser(null))
        .finally(() => setPublicUserLoading(false));
    }
    if (initialExperience === 'conversation') void openConversation(initialEntityId, 'page');
    if (initialExperience === 'post')
      void api
        .getFeedPost(Number(initialEntityId))
        .then(setDeepLinkedPostRecord)
        .catch(() => setDeepLinkedPostRecord(null));
    if (initialExperience === 'demand')
      void api
        .getDemand(initialEntityId)
        .then(setDeepLinkedDemandRecord)
        .catch(() => setDeepLinkedDemandRecord(null));
    if (initialExperience === 'demand') {
      const record = demands.find((item) => item.id === initialEntityId);
      if (record) void activateDemand(record);
    }
  }, [api, demands, initialEntityId, initialExperience, liveApi]);

  if (appConfig?.maintenance?.enabled) {
    return (
      <CapabilityGate
        title={appConfig.maintenance.title || '服务暂时维护中'}
        message={appConfig.maintenance.message || '服务正在短暂维护，请稍后重试。'}
        loading={appConfigLoading}
        onRetry={() => void refreshAppConfig()}
      />
    );
  }

  if (initialExperience === 'groups' || initialExperience === 'group') {
    if (appConfigLoading) {
      return (
        <CapabilityGate
          title="正在检查组局能力"
          message="只有服务端确认开放后，才会显示成员、候补和群聊入口。"
          loading
        />
      );
    }
    if (!groupsEnabled) {
      return (
        <CapabilityGate
          title="多人组局暂未开放"
          message={
            appConfigError ||
            '当前环境尚未开放多人组局；已有好友、需求和一对一消息不会受到影响。'
          }
          loading={appConfigLoading}
          onRetry={() => void refreshAppConfig()}
        />
      );
    }
  }

  if (surface === 'onboarding')
    return (
      <OnboardingFlow
        userId={session.state.session?.user.id ?? 0}
        initialProfile={session.state.socialProfile}
        initialStatus={session.state.onboarding}
        onComplete={completeOnboarding}
        onUploadPhotos={uploadProfilePhotos}
        onExit={session.logout}
        onLifeNeed={(selectedLabels) => {
          const selectedSummary = selectedLabels.join('、');
          setAgentOnlyMode(true);
          setSurface('main');
          setActiveTab('home');
          void (async () => {
            try {
              const thread = await ensureAgentThread();
              const turn = await api.sendAgentThreadTurn(thread.id, `我想先处理这些目标：${selectedSummary}。请帮我一起梳理。`);
              const afterSequence = (turn.entries || []).reduce(
                (maximum, entry) => Math.max(maximum, Number(entry.sequence || 0)),
                0,
              );
              await api.waitForAgentRun(turn.run.id, { afterSequence, timeoutMs: 45_000 });
              await loadAgentThread(thread.id, true);
            } catch {
              notice('小福工作台已准备好；你可以从一个模糊的想法开始。 ');
            }
          })();
          notice(`已进入 ${selectedSummary} 的小福工作台；暂不要求建立社交资料。`);
        }}
      />
    );

  const contextPanel = currentDemandTitle ? (
    <FitMeetAgentContextPanel
      title={currentDemandTitle}
      status={currentDemandStatus || '等待你继续'}
      fields={contextFields}
      missingFields={activeDraftSession?.missingFields || []}
      candidateCount={currentCandidateCount}
      lifecycleStage={currentDemandLifecycleStage}
      primaryLabel={demandContextPrimary}
      primaryDisabled={Boolean(
        !liveDemand &&
          activeDraftSession &&
          !agentDraftCanRenderCard(activeDraftSession),
      )}
      onPrimary={openDemandContextPrimary}
      onEdit={() =>
        showEditableDemandCard
          ? setOverlay('demandEdit')
          : liveDemand
            ? notice('已发布需求不能按草稿覆盖；可以暂停或取消后新建一条需求。', 'info')
            : void prepareDemandDraft()
      }
      onOpen={openDemandContextPrimary}
    />
  ) : undefined;
  const socialExperienceActive = Boolean(initialExperience);

  return (
    <main className={`${styles.appPage} ${styles.authenticatedPage}`}>
      <FitMeetAgentShell
        activeDestination={activeTab}
        activeThreadId={activeAgentThread?.id}
        activeThreadTitle={activeAgentThread?.title}
        contextPanel={activeTab === 'home' ? contextPanel : undefined}
        currentDemandTitle={currentDemandTitle}
        currentDemandStatus={currentDemandStatus}
        nickname={profile.nickname}
        realtimeStatus={realtimeStatus}
        threads={agentThreads}
        unreadCount={unreadCount}
        onDestination={navigateDestination}
        onNewThread={() => void createThreadFromShell()}
        onOpenHelp={() => setOverlay('accountSafety')}
        onOpenMemory={() => setOverlay('memory')}
        onOpenSearchResult={openGlobalSearchResult}
        onOpenSettings={() => setOverlay('settings')}
        onOpenThread={(threadId) => void openThreadFromShell(threadId)}
        onRetrySync={() => {
          notice('正在重新同步账号数据；页面草稿不会被清空。', 'pending');
          void reconcileRealtimeState();
        }}
        onSearch={runGlobalSearch}
      >
        <div
          className={`${styles.appScroll} ${!socialExperienceActive && activeTab === 'home' ? styles.agentWorkspaceScroll : styles.secondaryWorkspaceScroll}`}
        >
          {socialExperienceActive && initialExperience ? (
            <SocialInteractionExperience
              api={api}
              mode={initialExperience}
              currentUserId={session.state.session?.user.id ?? 0}
              user={publicUser}
              userLoading={publicUserLoading}
              relationship={publicRelationship}
              userContext={
                publicCandidateContext
                  ? {
                      demandTitle: demand.title,
                      reason: publicCandidateContext.reason,
                      signals:
                        publicCandidateContext.explanationSignals || publicCandidateContext.tags,
                      boundaryNotes: publicCandidateContext.boundaryNotes || [],
                      timeWindow: demand.timeWindow,
                      locationText: demand.locationText,
                    }
                  : undefined
              }
              friends={friends}
              incoming={incomingConnections}
              outgoing={outgoingConnections}
              conversations={visibleConversations}
              conversation={selectedConversation}
              messages={conversation}
              conversationNextBefore={conversationNextBefore}
              conversationLoadingMore={conversationLoadingMore}
              messageInput={conversationInput}
              messageSending={conversationSending}
              events={dedupeInboxEvents(agentInboxEvents)}
              eventsScope={agentInboxScope}
              eventsTotal={agentInboxTotal}
              eventsHistoryCount={agentInboxHistoryCount}
              eventsUnreadCount={agentInboxUnreadCount}
              eventsLoading={agentInboxLoading}
              eventsError={agentInboxError}
              eventsNextCursor={agentInboxNextCursor}
              eventsLoadingMore={agentInboxLoadingMore}
              post={deepLinkedPost}
              demand={deepLinkedDemand}
              groupId={initialExperience === 'group' ? initialEntityId : undefined}
              groupsEnabled={groupsEnabled}
              onBack={() => router.back()}
              onUser={(id) => router.push(`/agent/try/users/${id}`)}
              onMessageInput={changeConversationInput}
              onLoadOlderConversation={() => void loadOlderConversation()}
              onMessageVisible={markVisibleConversationMessage}
              onSend={() => void sendConversation()}
              onRetry={(item) => void sendConversation(item)}
              onRecall={(id) => void recallConversationMessage(id)}
              onReportMessage={reportConversationMessage}
              onMute={() => void toggleConversationMute()}
              onBlockConversation={async () => {
                const targetId = conversationPeerId(selectedConversation);
                if (!targetId || !selectedConversation) return;
                await blockAndRemember({
                  id: targetId,
                  name:
                    selectedConversation.displayName ||
                    selectedConversation.username ||
                    selectedConversation.peer?.name,
                  avatar: selectedConversation.avatar || selectedConversation.peer?.avatar,
                });
                router.push('/agent/try/messages');
              }}
              onRelationshipAction={(request, action) => void resolveConnection(request, action)}
              onAddFriend={addFriendFromProfile}
              onDeleteFriend={deleteFriendFromProfile}
              onStartConversation={(user) => void startConversationFromProfile(user)}
              onConversation={(id) => router.push(`/agent/try/messages/${encodeURIComponent(id)}`)}
              onInviteUser={inviteFromProfile}
              onBlockUser={async (user) => {
                await blockAndRemember({ id: user.id, name: user.name, avatar: user.avatar });
                setPublicUser((current) =>
                  current ? { ...current, relationship: 'blocked' } : current,
                );
              }}
              onUnblockUser={(user) => void unblockProfileUser(user)}
              onReportUser={async (user, reason, details) => {
                await api.reportSafety({
                  targetType: 'user',
                  targetId: user.id,
                  targetUserId: user.id,
                  reason,
                  description: details || '网页公开资料举报',
                });
                notice('举报已提交安全审核；不会自动联系对方。');
              }}
              onEvent={(event) => void openInboxEvent(event)}
              onAcknowledgeEvent={acknowledgeInboxEvent}
              onAcknowledgeAll={() => void acknowledgeAllEvents()}
              onEventsScope={selectAgentInboxScope}
              onRetryEvents={() => void refreshAgentInbox(agentInboxScope)}
              onLoadMoreEvents={() => void loadMoreInboxEvents()}
              onPostLike={(id) => void toggleLike(id)}
              postLiked={Boolean(deepLinkedPost && likedPostIds.includes(deepLinkedPost.id))}
              onOpenPost={(id) => router.push(`/agent/try/discover/posts/${id}`)}
              onOpenDemand={(id) => router.push(`/agent/try/demands/${encodeURIComponent(id)}`)}
              onGroup={(id) => router.push(`/agent/try/groups/${encodeURIComponent(id)}`)}
              onGroups={() => router.push('/agent/try/groups')}
              onCreateGroup={createGroupFromDemand}
              onNotice={notice}
            />
          ) : null}
          {!socialExperienceActive && activeTab === 'home' ? (
            appConfigLoading || !agentEnabled ? (
              <div className={styles.standardScreen} aria-live="polite">
                <header className={styles.messageHeader}>
                  <div>
                    <h1>小福 Agent</h1>
                    <p>正在核对服务能力</p>
                  </div>
                </header>
                <p className={styles.emptyState}>
                  {appConfigLoading
                    ? '正在读取服务端能力清单，不会在状态未知时执行真实操作。'
                    : appConfigError || '当前环境暂未开放 Agent。'}
                </p>
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={appConfigLoading}
                  onClick={() => void refreshAppConfig()}
                >
                  <FiRefreshCw /> {appConfigLoading ? '正在检查…' : '重新检查'}
                </button>
              </div>
            ) : (
              <HomeScreen
              nickname={profile.nickname}
              chat={chat}
              entries={agentEntries}
              input={chatInput}
              onInput={setChatInput}
              onSend={() => void sendAgentMessage()}
              onQuickPrompt={(prompt) => void sendAgentMessage(prompt)}
              replySuggestions={agentReplySuggestions(activeDraftSession)}
              sending={agentSending}
              draftStructuring={agentDraftStructuring}
              sendingAfterSequence={agentSendingAfterSequenceRef.current}
              pendingMessage={agentPendingMessage}
              onVoice={startVoiceInput}
              voiceActive={voiceInput.isListening}
              demand={showEditableDemandCard ? demand : null}
              demandLifecycle={
                liveDemand && currentDemandMatchPhase
                  ? {
                      title: demand.title,
                      phase: currentDemandMatchPhase,
                      candidateCount: currentCandidateCount,
                      errorMessage: matchJob?.errorMessage || null,
                    }
                  : null
              }
              demandBusy={demandLifecycleAction}
              onEditDemand={() =>
                showEditableDemandCard ? setOverlay('demandEdit') : void prepareDemandDraft()
              }
              onPublish={() => void publishDemand()}
              onHide={() => {
                if (liveDemand) void changeDemandStatus('hidden');
                else void performDemandDraftAction('hide');
              }}
              onCancel={() => void changeDemandStatus('cancelled')}
              onOpenDemandLifecycle={openDemandContextPrimary}
              onSyncDemandLifecycle={() => {
                if (!liveDemand) return;
                void syncDemandMatches(liveDemand.id)
                  .then(() => notice('已从服务端重新核对当前匹配状态。', 'success'))
                  .catch((reason) =>
                    notice(
                      reason instanceof Error ? reason.message : '匹配状态暂时无法同步。',
                      'warning',
                    ),
                  );
              }}
              onToolProposal={openToolProposal}
              onExploreCandidateKind={(kind) =>
                void sendAgentMessage(`请保持我刚才的目标和已确认约束，只检索“${fulfillmentCandidateKindLabel(kind)}”类型的真实结果；说明证据和仍缺的验证，不要联系或发布。`)
              }
              onMemory={() => setOverlay('memory')}
              onHistory={() => setOverlay('history')}
              realtimeStatus={realtimeStatus}
              />
            )
          ) : null}
          {!socialExperienceActive && activeTab === 'moments' ? (
            <MomentsExperience
              api={api}
              userId={session.state.session?.user.id ?? 0}
              posts={posts}
              onPostsChange={setPosts}
              likedPostIds={likedPostIds}
              onLike={(id) => void toggleLike(id)}
              channel={discoverChannel}
              onChannel={setDiscoverChannel}
              onCompose={() => setOverlay('composer')}
              onDelete={deletePost}
              socialIntents={socialIntents}
              taskIntents={taskIntents}
              socialApplications={socialApplications}
              taskApplications={taskApplications}
              onApplication={(kind, intent, status, message) =>
                changeApplication(kind, intent, status, message)
              }
              onNotice={notice}
              onUser={(id) => router.push(`/agent/try/users/${id}`)}
              onPost={(id) => router.push(`/agent/try/discover/posts/${id}`)}
              initialLastPage={feedLastPage}
            />
          ) : null}
          {!socialExperienceActive && activeTab === 'messages' ? (
            appConfigLoading || !messagingEnabled ? (
              <div className={styles.standardScreen} aria-live="polite">
                <header className={styles.messageHeader}>
                  <div>
                    <h1>消息</h1>
                    <p>正在核对真实会话能力</p>
                  </div>
                </header>
                <p className={styles.emptyState}>
                  {appConfigLoading
                    ? '只有服务端确认开放后，才会显示好友、组局与消息会话。'
                    : appConfigError || '当前环境暂未开放消息能力。'}
                </p>
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={appConfigLoading}
                  onClick={() => void refreshAppConfig()}
                >
                  <FiRefreshCw /> {appConfigLoading ? '正在检查…' : '重新检查'}
                </button>
              </div>
            ) : (
              <MessagesExperience
              invitations={invitations}
              conversations={visibleConversations}
              incomingConnections={incomingConnections}
              outgoingConnections={outgoingConnections}
              agentEvents={dedupeInboxEvents(agentInboxEvents)}
              ownerSocialApplications={ownerSocialApplications}
              ownerTaskApplications={ownerTaskApplications}
              currentUserId={session.state.session?.user.id ?? 0}
              unreadCount={unreadCount}
              initialCategory={messageLandingCategory}
              onConversation={(id) => router.push(`/agent/try/messages/${encodeURIComponent(id)}`)}
              onInvitation={resolveInvitation}
              onIntentApplication={(kind, application, decision) =>
                void resolveIntentApplication(kind, application, decision)
              }
              onSystemEvent={(event) => void openInboxEvent(event)}
              onMeet={() => (meet.id ? setOverlay('meet') : notice('还没有已确认的真实活动。 '))}
              onUser={(id) => router.push(`/agent/try/users/${id}`)}
              onRelationship={() => router.push('/agent/try/relationships')}
              onNotifications={() => router.push('/agent/try/notifications')}
              onRefresh={reconcileRealtimeState}
              />
            )
          ) : null}
          {!socialExperienceActive && activeTab === 'profile' ? (
            <ProfileExperience
              api={api}
              userId={session.state.session?.user.id ?? 0}
              profile={profile}
              photos={profilePhotos}
              notificationEnabled={notificationEnabled}
              notificationPreferenceSyncing={notificationPreferenceSyncing}
              postCount={
                posts.filter(
                  (post) => Number(post.userId) === Number(session.state.session?.user.id),
                ).length
              }
              relationshipCount={incomingConnections.length + outgoingConnections.length}
              groupsEnabled={groupsEnabled}
              blockedUsers={blockedUsers}
              blockedUsersLoading={blockedUsersLoading}
              blockedUsersError={blockedUsersError}
              onPhotosChange={setProfilePhotos}
              onNotice={notice}
              onEdit={() => setOverlay('editProfile')}
              onPrivacy={() => setOverlay('privacy')}
              onAgentDataAccess={() => {
                setOverlay('agentDataAccess');
                void refreshAgentDataAccess();
              }}
              onNotification={(value) => void updateNotificationPreference(value)}
              onRelationships={() => router.push('/agent/try/relationships')}
              onGroups={() => router.push('/agent/try/groups')}
              onReboard={() => {
                setAgentOnlyMode(false);
                setSurface('onboarding');
              }}
              onSafety={() => setOverlay('accountSafety')}
              onMoments={() => navigateDestination('moments')}
              onLogout={async () => {
                try {
                  await session.logout();
                } catch (reason) {
                  notice(reason instanceof Error ? reason.message : '退出暂未完成，请稍后重试。');
                }
              }}
              onBlockUser={async (user: PublicUserProfile) => {
                try {
                  await blockAndRemember({ id: user.id, name: user.name, avatar: user.avatar });
                } catch (reason) {
                  notice(reason instanceof Error ? reason.message : '拉黑操作未能完成。');
                }
              }}
              onUnblockUser={unblockKnownUser}
              onRefreshBlockedUsers={refreshBlockedUsers}
            />
          ) : null}
        </div>
        {toast ? (
          <div
            className={styles.toast}
            data-tone={toast.tone}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
          >
            <FeedbackIcon tone={toast.tone} />
            <span>{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                className={styles.toastAction}
                onClick={() => {
                  const action = toast.action;
                  setToast(null);
                  action?.onSelect();
                }}
              >
                {toast.action.label} <FiChevronRight />
              </button>
            ) : null}
            <button type="button" className={styles.toastClose} aria-label="关闭提示" onClick={() => setToast(null)}>
              <FiX />
            </button>
          </div>
        ) : null}
      </FitMeetAgentShell>

      {overlay === 'candidate' && selectedCandidate ? (
        <CandidateProfileExperience
          api={api}
          candidate={selectedCandidate}
          candidates={activeCandidates}
          demandTitle={demand.title}
          relationship={relationship}
          inviteStatus={selectedCandidateInviteStatus}
          onClose={() => setOverlay(null)}
          onSelect={(id) => {
            setSelectedCandidateId(id);
            setInviteStatus('none');
          }}
          onDismiss={dismissCandidate}
          onSave={() => recordCandidate(selectedCandidate.id, 'saved')}
          onFriend={requestFriendship}
          onInvite={createInvite}
          onConversation={openDemandConversation}
          onReport={async () => {
            await api.reportSafety({
              targetType: 'user',
              targetId: selectedCandidate.candidateUserId,
              targetUserId: selectedCandidate.candidateUserId,
              reason: 'inappropriate_behavior',
              description: '网页候选人资料举报',
            });
            notice('举报已提交安全审核；不会自动联系对方。');
          }}
          onBlock={async () => {
            await blockAndRemember({
              id: selectedCandidate.candidateUserId,
              name: selectedCandidate.name,
              avatar: selectedCandidate.avatar,
            });
            setRelationship('blocked');
          }}
        />
      ) : null}
      {overlay === 'demandList' ? (
        <DemandListSheet
          demands={demands}
          activeDemandId={liveDemand?.id}
          onClose={() => setOverlay(null)}
          onSelect={(record) => void openDemandRecord(record, true)}
          onCreate={() => void startNewDemand()}
        />
      ) : null}
      {overlay === 'demand' && hasDemand ? (
        <DemandSheet
          demand={demand}
          candidateCount={activeCandidates.length}
          busy={demandLifecycleAction}
          onClose={() => setOverlay(null)}
          onEdit={() => setOverlay('demandEdit')}
          onPublish={() => void publishDemand()}
          onHide={() => void changeDemandStatus('hidden')}
          onCancel={() => void changeDemandStatus('cancelled')}
          onCandidates={() => setOverlay('candidate')}
          onConversation={openDemandConversation}
        />
      ) : null}
      {overlay === 'demandEdit' ? (
        <DemandEditSheet
          demand={demand}
          onClose={() => setOverlay(null)}
          onSave={(next) => void saveDemandDraft(next)}
        />
      ) : null}
      {overlay === 'invitation' && selectedCandidate ? (
        <InviteSheet
          candidate={selectedCandidate}
          demand={demand}
          busy={inviteSending}
          onClose={() => {
            inviteIdempotencyKeyRef.current = null;
            setInviteStatus('none');
            setOverlay(null);
          }}
          onSend={sendInvite}
        />
      ) : null}
      {overlay === 'composer' ? (
        <ComposeSheet
          value={postText}
          images={postImages}
          publishing={postPublishing}
          onChange={setPostText}
          onFiles={(files) => void selectPostImages(files)}
          onRemoveImage={(id) => setPostImages((items) => items.filter((item) => item.id !== id))}
          onClose={() => setOverlay(null)}
          onPublish={() => void publishPost()}
        />
      ) : null}
      {overlay === 'conversation' && selectedConversation ? (
        <ConversationSheet
          conversation={selectedConversation}
          unlocked={!selectedConversationClosed}
          closed={selectedConversationClosed}
          items={conversation}
          input={conversationInput}
          sending={conversationSending}
          onInput={changeConversationInput}
          onSend={() => void sendConversation()}
          onMute={() => void toggleConversationMute()}
          onRecall={(id) => void recallConversationMessage(id)}
          onReport={(id) => void reportConversationMessage(id)}
          onBlock={() => {
            const targetId = Number(selectedConversation.userId ?? selectedConversation.peer?.id);
            if (!targetId) return notice('当前会话没有可验证的对方账号，无法拉黑。');
            void blockAndRemember({
              id: targetId,
              name:
                selectedConversation.displayName ||
                selectedConversation.username ||
                selectedConversation.peer?.name,
              avatar: selectedConversation.avatar || selectedConversation.peer?.avatar,
            })
              .then(() => setOverlay(null))
              .catch((reason) =>
                notice(reason instanceof Error ? reason.message : '拉黑操作未能完成。'),
              );
          }}
          onClose={() => setOverlay(null)}
        />
      ) : null}
      {overlay === 'memory' ? (
        <MemorySheet
          key={memoryOwnerId ?? 'anonymous'}
          ownerId={memoryOwnerId}
          memories={memoryStateBelongsToCurrentOwner ? memories : []}
          needWikiEntries={memoryStateBelongsToCurrentOwner ? needWikiEntries : []}
          capabilityOfferings={memoryStateBelongsToCurrentOwner ? capabilityOfferings : []}
          control={memoryStateBelongsToCurrentOwner ? memoryControl : null}
          loading={Boolean(memoryOwnerId) && (!memoryStateBelongsToCurrentOwner || memoryLoading)}
          error={memoryStateBelongsToCurrentOwner ? memoryError : null}
          onClose={() => setOverlay(null)}
          onSave={saveMemory}
          onUpdate={updateMemory}
          onDelete={deleteMemory}
          onReject={rejectMemory}
          onToggleInference={toggleMemoryInference}
          onSuppress={suppressMemory}
          onRemoveSuppression={removeMemorySuppression}
          onLoadUsage={loadMemoryUsage}
          onUpdateNeedWiki={updateNeedWiki}
          onDeleteNeedWiki={deleteNeedWiki}
          onSaveCapability={saveCapabilityOffering}
          onRetry={refreshMemoryCenter}
        />
      ) : null}
      {overlay === 'agentDataAccess' ? (
        <Sheet title="Agent 数据权限" onClose={() => setOverlay(null)}>
          <AgentDataAccessPanel
            settings={agentDataAccess}
            logs={agentDataAccessLogs}
            loading={agentDataAccessLoading}
            saving={agentDataAccessSaving}
            error={agentDataAccessError}
            onRefresh={refreshAgentDataAccess}
            onChange={updateAgentDataAccess}
          />
        </Sheet>
      ) : null}
      {overlay === 'history' ? (
        <HistorySheet
          threads={agentThreads}
          activeThreadId={activeAgentThread?.id}
          onClose={() => setOverlay(null)}
          onSelect={(id) => {
            void openAgentThread(id)
              .then(() => setOverlay(null))
              .catch((reason) =>
                notice(reason instanceof Error ? reason.message : '对话记录暂时无法打开。'),
              );
          }}
          onNew={() => void startNewDemand()}
        />
      ) : null}
      {overlay === 'toolApproval' && selectedToolProposal ? (
        <ToolApprovalSheet
          key={selectedToolProposal.id}
          proposal={selectedToolProposal}
          busy={toolProposalDecision}
          onClose={() => {
            if (toolProposalDecision) return;
            setOverlay(null);
            setSelectedToolProposal(null);
          }}
          onResolve={(decision, message) => void resolveToolProposal(decision, message)}
        />
      ) : null}
      {overlay === 'editProfile' ? (
        <EditProfileSheet profile={profile} onClose={() => setOverlay(null)} onSave={saveProfile} />
      ) : null}
      {overlay === 'privacy' ? (
        <PrivacySheet profile={profile} onClose={() => setOverlay(null)} onSave={saveProfile} />
      ) : null}
      {overlay === 'settings' ? (
        <SettingsSheet
          notificationEnabled={notificationEnabled}
          notificationPreferenceSyncing={notificationPreferenceSyncing}
          onNotification={(value) => void updateNotificationPreference(value)}
          onClose={() => setOverlay(null)}
          onReset={() => {
            setOverlay(null);
            setAgentOnlyMode(false);
            setSurface('onboarding');
            notice('已进入重新建档流程。');
          }}
          onSafety={() => setOverlay('accountSafety')}
        />
      ) : null}
      {overlay === 'relationships' ? (
        <RelationshipSheet
          incoming={incomingConnections}
          outgoing={outgoingConnections}
          onClose={() => setOverlay(null)}
          onAction={(request, action) => void resolveConnection(request, action)}
        />
      ) : null}
      {overlay === 'meet' && meet.id ? (
        <MeetLifecycleSheet
          meet={meet}
          demand={demand}
          onClose={() => setOverlay(null)}
          onUpdate={(status, review) => void updateMeet(status, review)}
        />
      ) : null}
      {overlay === 'safety' ? (
        <SafetySheet
          onClose={() => setOverlay(null)}
          onReport={() => {
            if (!selectedCandidate) return notice('请先从候选人或会话中选择需要帮助的对象。');
            void api
              .reportSafety({
                targetType: 'user',
                targetId: selectedCandidate.candidateUserId,
                targetUserId: selectedCandidate.candidateUserId,
                reason: '用户请求安全帮助',
              })
              .then(() => notice('安全帮助请求已提交。我们不会替你继续联系对方。 '))
              .catch((reason) =>
                notice(reason instanceof Error ? reason.message : '安全帮助请求未能提交。'),
              );
          }}
          onBlock={() => {
            if (!selectedCandidate) return notice('请先从候选人或会话中选择需要拉黑的对象。');
            void blockAndRemember({
              id: selectedCandidate.candidateUserId,
              name: selectedCandidate.name,
              avatar: selectedCandidate.avatar,
            })
              .then(() => setRelationship('blocked'))
              .catch((reason) =>
                notice(reason instanceof Error ? reason.message : '拉黑操作未能完成。'),
              );
          }}
        />
      ) : null}
      {overlay === 'accountSafety' ? (
        <AccountSafetySheet
          profile={profile}
          photos={profilePhotos}
          onClose={() => setOverlay(null)}
          onPrivacy={() => setOverlay('privacy')}
          onRelationships={() => setOverlay('relationships')}
        />
      ) : null}
    </main>
  );
}

function AgentRunStatus({
  entries,
  afterSequence,
  draftStructuring,
}: {
  entries: AgentThreadEntry[];
  afterSequence: number;
  draftStructuring: boolean;
}) {
  return (
    <AgentTaskProgress
      presentation={agentRunPresentation(entries, afterSequence, draftStructuring)}
    />
  );
}

function HomeScreen({
  nickname,
  chat,
  entries,
  input,
  onInput,
  onSend,
  onQuickPrompt,
  replySuggestions,
  sending,
  draftStructuring,
  sendingAfterSequence,
  pendingMessage,
  onVoice,
  voiceActive,
  demand,
  demandLifecycle,
  demandBusy,
  onEditDemand,
  onPublish,
  onHide,
  onCancel,
  onOpenDemandLifecycle,
  onSyncDemandLifecycle,
  onToolProposal,
  onExploreCandidateKind,
  onMemory,
  onHistory,
  realtimeStatus,
}: {
  nickname: string;
  chat: ChatLine[];
  entries: AgentThreadEntry[];
  input: string;
  onInput: (value: string) => void;
  onSend: () => void;
  onQuickPrompt: (prompt: string) => void;
  replySuggestions: string[];
  sending: boolean;
  draftStructuring: boolean;
  sendingAfterSequence: number;
  pendingMessage: string | null;
  onVoice: () => void;
  voiceActive: boolean;
  demand: DemandViewModel | null;
  demandLifecycle: {
    title: string;
    phase: DemandMatchPhase;
    candidateCount: number;
    errorMessage: string | null;
  } | null;
  demandBusy: AgentDemandDraftAction | null;
  onEditDemand: () => void;
  onPublish: () => void;
  onHide: () => void;
  onCancel: () => void;
  onOpenDemandLifecycle: () => void;
  onSyncDemandLifecycle: () => void;
  onToolProposal: (proposal: AgentThreadEntry) => void;
  onExploreCandidateKind: (kind: FulfillmentCandidatePreview['kind']) => void;
  onMemory: () => void;
  onHistory: () => void;
  realtimeStatus: 'offline' | 'connecting' | 'connected' | 'reconnecting';
}) {
  const [showFullTimeline, setShowFullTimeline] = useState(false);
  const timeline = entries.length
    ? entries
    : chat.map(
        (item) =>
          ({
            id: String(item.id),
            kind: 'message',
            role: item.role,
            content: item.text,
          }) as AgentThreadEntry,
      );
  const trustedTimeline = timeline.filter(agentEntryCanRender);
  const hiddenTimelineCount = Math.max(0, trustedTimeline.length - 10);
  const visibleTimeline = showFullTimeline ? trustedTimeline : trustedTimeline.slice(-10);
  const hasUserMessage = trustedTimeline.some(
    (item) => item.kind === 'message' && item.role === 'user',
  );
  const showWelcome = !hasUserMessage && !pendingMessage && !demand && !draftStructuring;

  return (
    <div className={styles.homeScreen}>
      <div className={styles.conversationColumn}>
        {showWelcome ? (
          <section className={styles.agentWelcome} aria-label="开始和小福对话">
            <FitMeetBrandIcon size={46} priority />
            <h1>今天想找谁一起做什么？</h1>
            <p>小福会帮你把想法整理成需求卡，发布前由你确认。</p>
            <div className={styles.quickStart} aria-label="快捷开始">
              {quickAgentPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => onQuickPrompt(prompt)}
                  disabled={sending}
                >
                  {prompt}
                  <FiChevronRight />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {!showWelcome ? (
          <section className={styles.homeConversation} aria-label="和小福的对话">
            {hiddenTimelineCount ? (
              <button
                type="button"
                className={styles.earlierMessagesButton}
                onClick={() => setShowFullTimeline((current) => !current)}
              >
                {showFullTimeline ? '收起较早消息' : `查看更早的 ${hiddenTimelineCount} 条消息`}
              </button>
            ) : null}
            <div className={styles.chatStack}>
              {visibleTimeline.map((item) =>
                item.kind === 'message' ? (
                  <AgentMessage
                    key={item.id}
                    role={item.role === 'user' ? 'user' : 'assistant'}
                    text={item.content || ''}
                    live={agentEntryIsStreaming(item)}
                  />
                ) : (
                  <AgentToolTimelineCard
                    key={item.id}
                    entry={item}
                    onOpenProposal={() => onToolProposal(item)}
                    onExploreCandidateKind={onExploreCandidateKind}
                  />
                ),
              )}
              {pendingMessage ? <AgentMessage role="user" text={pendingMessage} /> : null}
              {sending ? (
                <AgentRunStatus
                  entries={entries}
                  afterSequence={sendingAfterSequence}
                  draftStructuring={draftStructuring}
                />
              ) : null}
            </div>
            {demand ? (
              <div className={styles.homeDemandSlot}>
                <DemandCard
                  demand={demand}
                  busy={demandBusy}
                  onEdit={onEditDemand}
                  onPublish={onPublish}
                  onHide={onHide}
                  onCancel={onCancel}
                />
              </div>
            ) : null}
            {demandLifecycle ? (
              <div className={styles.homeDemandSlot}>
                <DemandMatchingStatusCard
                  {...demandLifecycle}
                  onOpen={onOpenDemandLifecycle}
                  onSync={onSyncDemandLifecycle}
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {replySuggestions.length ? (
          <section className={styles.agentReplySuggestions} aria-label="快捷回答">
            <div>
              {replySuggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  disabled={sending}
                  onClick={() => onQuickPrompt(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className={styles.composerDock}>
        <form
          className={styles.composer}
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
          aria-busy={sending}
        >
          <textarea
            value={input}
            rows={1}
            onChange={(event) => onInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder={`给小福发送消息，${nickname || '朋友'}`}
            aria-label="告诉小福你现在想解决什么"
            aria-describedby="agent-composer-guidance"
          />
          <div className={styles.composerTools}>
            {sending ? (
              <AgentInlineActivity mode={draftStructuring ? 'structuring' : 'working'}>
                <span role="status" aria-live="polite">
                  {draftStructuring ? '正在整理需求卡 · 可以先输入下一条' : '本轮处理中 · 可以先输入下一条'}
                </span>
              </AgentInlineActivity>
            ) : (
              <span>普通聊天与需求整理都可以直接说</span>
            )}
            <button
              type="button"
              aria-label={voiceActive ? '停止语音输入' : '语音输入'}
              onClick={onVoice}
              className={voiceActive ? styles.composerVoiceActive : ''}
            >
              <FiMic />
            </button>
            <button type="submit" aria-label="发送给小福" disabled={!input.trim() || sending}>
              <FiArrowUp />
            </button>
          </div>
        </form>
        <small id="agent-composer-guidance">
          {sending
            ? '本轮完成后即可发送下一条；已输入内容不会被清空。'
            : '小福可能会理解错信息，请核查重要内容。发布、邀请和联系都由你确认。'}
        </small>
      </div>
    </div>
  );
}

function AgentMessage({
  role,
  text,
  live = false,
}: {
  role: 'assistant' | 'user';
  text: string;
  live?: boolean;
}) {
  const displayText = role === 'assistant' ? agentDisplayText(text) : text;
  return (
    <article
      className={role === 'user' ? styles.userChat : styles.agentChat}
      aria-busy={role === 'assistant' && live ? 'true' : undefined}
    >
      {role === 'assistant' ? <FitMeetBrandIcon size={31} /> : null}
      <div>
        <p>
          <StreamingAgentText live={role === 'assistant' && live}>{displayText}</StreamingAgentText>
        </p>
      </div>
      {role === 'user' ? <Avatar name="我" size={31} /> : null}
    </article>
  );
}

// The server remains the source of Agent text.  This only presents occasional
// Markdown-like model formatting as normal conversation rather than exposing
// implementation punctuation such as **标题** in the chat surface.
function agentDisplayText(value: string) {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/(^|\n)\s{0,3}#{1,6}\s+/g, '$1')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/__([^_\n]+)__/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/(^|\n)\s*[-*•]\s+/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function toolTitle(toolName: string | null, status: string | null) {
  const titles: Record<string, string> = {
    classify_demand: '需求理解',
    route_demand_flow: '流程建议',
    generate_demand_card: '需求卡草稿',
    generate_demand_card_v2: '结构化需求卡',
    draft_capability_offering: '能力资料草稿',
    press_demand_card_button: '需求卡操作',
    preview_search_candidates: '候选范围预览',
    search_candidates_for_demand: '候选筛选',
    rank_candidates: '候选排序',
    search_capability_matches_for_demand: '能力匹配',
    draft_invitation: '邀请草稿',
    send_invitation: '发送邀请',
    draft_service_message: '服务沟通草稿',
    request_service_connection: '联系服务者',
    draft_multiplayer_group: '组局草稿',
    create_multiplayer_group: '创建组局',
    invite_group_candidate: '组局邀请',
    block_user: '拉黑用户',
    report_user: '举报用户',
    patch_social_profile: '更新资料',
    patch_onboarding: '更新建档资料',
    search_knowledge: '知识检索',
    search_people: '寻找合适的人',
    search_services: '寻找专业服务',
    search_activities: '寻找活动',
    search_organizations: '寻找机构',
    evaluate_safety_requirements: '安全要求核验',
  };
  if (status === 'failed') return `${titles[toolName || ''] || '操作'}未提交`;
  if (status === 'stale' || status === 'expired') return `${titles[toolName || ''] || '操作'}已更新`;
  return titles[toolName || ''] || '小福整理的下一步';
}

type FulfillmentCandidatePreview = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  score: number | null;
  reasons: string[];
  evidenceCount: number;
  missingEvidence: string[];
  nextStep: string;
};

function textList(value: unknown, limit = 3) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).slice(0, limit)
    : [];
}

function fulfillmentText(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function fulfillmentPositiveInteger(record: Record<string, unknown>, ...keys: string[]) {
  const value = fulfillmentText(record, ...keys);
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function fulfillmentCandidatePreviews(entry: AgentThreadEntry): FulfillmentCandidatePreview[] {
  if (entry.kind !== 'tool_result') return [];
  const payload = entry.payload && typeof entry.payload === 'object' ? entry.payload : {};
  const execution = payload.execution;
  if (!execution || typeof execution !== 'object' || Array.isArray(execution)) return [];
  const result = (execution as Record<string, unknown>).result;
  if (!result || typeof result !== 'object' || Array.isArray(result)) return [];
  const resultRecord = result as Record<string, unknown>;
  const candidates = resultRecord.candidates;
  if (!Array.isArray(candidates)) return [];
  const requiresPublishedGeneration = ['search_candidates_for_demand', 'rank_candidates'].includes(
    entry.toolName || '',
  );
  const rootDemandId = fulfillmentText(resultRecord, 'demandId', 'demand_id');
  const rootMatchJobId = fulfillmentText(resultRecord, 'matchJobId', 'match_job_id');
  const rootDemandRevision = fulfillmentPositiveInteger(
    resultRecord,
    'demandRevision',
    'demand_revision',
  );
  if (
    requiresPublishedGeneration &&
    ((resultRecord.isRealData ?? resultRecord.is_real_data) !== true ||
      !rootDemandId ||
      !rootMatchJobId ||
      !rootDemandRevision)
  ) {
    return [];
  }
  const mapped = candidates.map((candidate, index): FulfillmentCandidatePreview | null => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
    const item = candidate as Record<string, unknown>;
    const title = typeof item.displayName === 'string' ? item.displayName.trim() : '';
    const candidateId = fulfillmentText(
      item,
      'candidateId',
      'candidate_id',
      'candidateRecordId',
      'candidate_record_id',
      'matchId',
      'match_id',
    );
    if (!title || !candidateId) return null;
    if (requiresPublishedGeneration) {
      const candidateUserId = fulfillmentPositiveInteger(
        item,
        'candidateUserId',
        'candidate_user_id',
        'targetUserId',
        'target_user_id',
        'userId',
        'user_id',
      );
      if (
        (item.isRealData ?? item.is_real_data) !== true ||
        (item.preview ?? item.isPreview ?? item.is_preview) === true ||
        !candidateUserId ||
        fulfillmentText(item, 'matchJobId', 'match_job_id') !== rootMatchJobId ||
        fulfillmentPositiveInteger(item, 'demandRevision', 'demand_revision') !==
          rootDemandRevision
      ) {
        return null;
      }
    }
    const score = typeof item.score === 'number' && Number.isFinite(item.score) ? item.score : null;
    return {
      id: `${entry.id}-${candidateId || index}`,
      kind: typeof item.candidateKind === 'string' ? item.candidateKind : 'candidate',
      title,
      summary: typeof item.summary === 'string' ? item.summary.trim() : '',
      score,
      reasons: textList(item.matchReasons),
      evidenceCount: Array.isArray(item.evidence) ? item.evidence.length : 0,
      missingEvidence: textList(item.missingEvidence, 2),
      nextStep: typeof item.recommendedNextStep === 'string' ? item.recommendedNextStep.trim() : '',
    };
  });
  if (mapped.some((candidate) => candidate === null)) return [];
  return (mapped as FulfillmentCandidatePreview[]).slice(0, 3);
}

function fulfillmentCandidateKindLabel(kind: string) {
  const labels: Record<string, string> = {
    person: '人员',
    provider: '服务者',
    activity: '活动',
    organization: '机构',
    knowledge: '知识来源',
  };
  return labels[kind] || '候选';
}

function AgentToolTimelineCard({
  entry,
  onOpenProposal,
  onExploreCandidateKind,
}: {
  entry: AgentThreadEntry;
  onOpenProposal: () => void;
  onExploreCandidateKind: (kind: FulfillmentCandidatePreview['kind']) => void;
}) {
  const isProposal = entry.kind === 'tool_proposal';
  const args = proposalArguments(entry);
  const disclosure = agentToolDisclosure(entry.toolName, args);
  const resultLink = agentToolResultLink(entry.payload || {});
  const candidates = fulfillmentCandidatePreviews(entry);
  const awaitingConfirmation = isProposal && entry.toolStatus === 'awaiting_confirmation';
  const isCompleted =
    entry.toolStatus === 'executed' ||
    entry.toolStatus === 'completed' ||
    entry.toolStatus === 'approved';
  const toolActive = agentToolIsActive(entry.toolStatus);
  const toolActivity = /search|rank/.test(entry.toolName || '')
    ? 'searching'
    : /generate|classify|route/.test(entry.toolName || '')
      ? 'structuring'
      : 'working';
  const statusCopy =
    entry.toolStatus === 'awaiting_confirmation'
      ? '等待你的确认'
      : entry.toolStatus === 'ready_for_review'
        ? '草稿已自动整理'
        : entry.toolStatus === 'collecting'
          ? '还在整理'
          : entry.toolStatus === 'executing'
            ? '正在提交'
            : entry.toolStatus === 'executed'
              ? '已按确认完成'
              : entry.toolStatus === 'completed'
                ? '已整理'
                : entry.toolStatus === 'declined'
                  ? '你选择了不执行'
                : entry.toolStatus === 'failed'
                    ? '没有提交成功'
                    : entry.toolStatus === 'stale'
                      ? '已有更新版本，请确认最新操作'
                      : entry.toolStatus === 'expired'
                        ? '确认已过期'
                    : isCompleted
                      ? '已完成'
                      : '已同步';
  return (
    <article
      className={`${styles.toolTimelineCard} ${awaitingConfirmation ? styles.toolTimelinePending : ''}`}
    >
      <header>
        <span>
          {toolActive ? (
            <AgentActivityIndicator mode={toolActivity} size="small" />
          ) : (
            <FiShield />
          )}
        </span>
        <div>
          <strong>{toolTitle(entry.toolName, entry.toolStatus)}</strong>
          <small>{statusCopy}</small>
        </div>
      </header>
      <p>
        {entry.content ||
          '小福已把这一步记录在账号级对话里。'}
      </p>
      {candidates.length ? (
        <section className={styles.fulfillmentCandidates} aria-label="真实检索候选">
          <div className={styles.fulfillmentCandidateKinds} aria-label="切换检索结果类型">
            {(['person', 'provider', 'activity', 'organization', 'knowledge'] as const).map((kind) => (
              <button
                type="button"
                key={kind}
                className={candidates.some((candidate) => candidate.kind === kind) ? styles.fulfillmentCandidateKindActive : undefined}
                onClick={() => onExploreCandidateKind(kind)}
              >
                {fulfillmentCandidateKindLabel(kind)}
              </button>
            ))}
          </div>
          {candidates.map((candidate) => {
            const fit = candidateFitPresentation({
              score: candidate.score,
              evidenceCount: candidate.evidenceCount,
              missingEvidenceCount: candidate.missingEvidence.length,
            });
            return (
              <article key={candidate.id} className={styles.fulfillmentCandidate}>
                <header>
                  <strong>{candidate.title}</strong>
                  <span>{fulfillmentCandidateKindLabel(candidate.kind)}</span>
                  <small data-tone={fit.tone}>{fit.label}</small>
                </header>
                {candidate.summary ? <p>{candidate.summary}</p> : null}
                {candidate.reasons.length ? <ul>{candidate.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : null}
                <footer>
                  <span>{candidate.evidenceCount ? `已用证据 ${candidate.evidenceCount} 项` : '暂无可核验证据'}</span>
                  <span>{fit.detail}</span>
                  {candidate.missingEvidence.length ? <span>待核验：{candidate.missingEvidence.join('、')}</span> : null}
                </footer>
                {candidate.nextStep ? <small className={styles.fulfillmentNextStep}>{candidate.nextStep}</small> : null}
              </article>
            );
          })}
        </section>
      ) : null}
      <details className={styles.toolDisclosure}>
        <summary>为什么出现 · 使用了哪些资料</summary>
        <div>
          <p>{disclosure.why}</p>
          <strong>本次读取</strong>
          <ul>{disclosure.sources.map((source) => <li key={source}>{source}</li>)}</ul>
          <small><FiShield /> {disclosure.writeScope}</small>
        </div>
      </details>
      <footer className={styles.toolAuditFooter}>
        <time dateTime={entry.updatedAt || entry.createdAt}>
          {entry.updatedAt || entry.createdAt
            ? new Date(entry.updatedAt || entry.createdAt).toLocaleString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '刚刚更新'}
        </time>
        {isCompleted && resultLink ? <Link href={resultLink.href}>{resultLink.label} <FiChevronRight /></Link> : null}
      </footer>
      {awaitingConfirmation ? (
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onOpenProposal}
        >
          查看并确认 <FiChevronRight />
        </button>
      ) : null}
    </article>
  );
}

function DemandMatchingStatusCard({
  title,
  phase,
  candidateCount,
  errorMessage,
  onOpen,
  onSync,
}: {
  title: string;
  phase: DemandMatchPhase;
  candidateCount: number;
  errorMessage: string | null;
  onOpen: () => void;
  onSync: () => void;
}) {
  const presentation = {
    matching: {
      title: '正在匹配合适的人',
      detail: '需求已经发布。系统正在按地点、时间、兴趣和边界筛选真实候选人。',
      icon: FiRefreshCw,
      step: 1,
      action: '查看匹配状态',
    },
    waiting: {
      title: '已进入候选池',
      detail: '本轮暂时没有合适候选人，需求会继续保留并等待新的匹配。',
      icon: FiClock,
      step: 1,
      action: '查看需求状态',
    },
    matched: {
      title: `已找到 ${candidateCount} 位候选人`,
      detail: '候选人只代表推荐结果。加好友、邀请和聊天仍由你逐步确认。',
      icon: FiUsers,
      step: 2,
      action: `查看 ${candidateCount} 位候选人`,
    },
    invited: {
      title: '邀请已发送',
      detail: '候选人已由你处理；对方接受前不会开放连续私信。',
      icon: FiSend,
      step: 3,
      action: '查看已发邀请',
    },
    communicating: {
      title: '会话已经开放',
      detail: '双方已经确认，可以在消息页继续沟通活动细节。',
      icon: FiMessageCircle,
      step: 3,
      action: '进入聊天',
    },
    failed: {
      title: '本轮匹配未完成',
      detail: errorMessage || '需求仍然保留，可以查看状态并稍后重试。',
      icon: FiAlertTriangle,
      step: 1,
      action: '查看问题',
    },
    hidden: {
      title: '匹配已暂停',
      detail: '需求不会继续进入新的匹配；恢复前也不会联系任何人。',
      icon: FiEye,
      step: 1,
      action: '查看需求',
    },
    cancelled: {
      title: '需求已取消',
      detail: '后续匹配已经停止。需要时可以从一条新需求重新开始。',
      icon: FiXCircle,
      step: 1,
      action: '查看记录',
    },
  }[phase];
  const StatusIcon = presentation.icon;
  const lifecycleLabels =
    phase === 'invited'
      ? ['已发布', '已匹配', '等待回应']
      : phase === 'communicating'
        ? ['已发布', '已确认', '会话开放']
        : ['已发布', '匹配中', '查看候选'];
  return (
    <section className={styles.demandMatchingCard} data-phase={phase} aria-live="polite">
      <header>
        <span>
          {phase === 'matching' ? (
            <AgentActivityIndicator mode="searching" size="large" />
          ) : (
            <StatusIcon />
          )}
        </span>
        <div>
          <small>{title}</small>
          <strong>{presentation.title}</strong>
        </div>
      </header>
      <p>{presentation.detail}</p>
      <ol className={styles.demandLifecycle} aria-label="需求发布与匹配进度">
        {lifecycleLabels.map((label, index) => (
          <li
            key={label}
            data-state={index < presentation.step ? 'complete' : index === presentation.step ? 'active' : 'pending'}
          >
            <i>{index < presentation.step ? <FiCheck /> : index + 1}</i>
            <span>{label}</span>
          </li>
        ))}
      </ol>
      <div className={styles.demandMatchingActions}>
        <button type="button" className={styles.secondaryButton} onClick={onOpen}>
          {presentation.action} <FiChevronRight />
        </button>
        {['matching', 'waiting', 'failed'].includes(phase) ? (
          <button type="button" className={styles.tertiaryButton} onClick={onSync}>
            <FiRefreshCw /> 重新同步
          </button>
        ) : null}
      </div>
    </section>
  );
}

function DemandCard({
  demand,
  busy,
  onEdit,
  onPublish,
  onHide,
  onCancel,
}: {
  demand: DemandViewModel;
  busy: AgentDemandDraftAction | null;
  onEdit: () => void;
  onPublish: () => void;
  onHide: () => void;
  onCancel: () => void;
}) {
  const fieldOrder = ['public_summary', 'goal', 'activity', 'location', 'time', 'ability'];
  const fallbacks: Record<string, { title: string; value: string }> = {
    public_summary: { title: '公开摘要', value: demand.summary },
    goal: { title: '核心目的', value: `找到合适伙伴，一起完成“${demand.activityType}”` },
    activity: { title: '活动', value: demand.activityType },
    location: { title: '地点', value: demand.locationText },
    time: { title: '时间', value: demand.timeWindow },
    ability: { title: '能力', value: demand.durationText },
  };
  const facts = new Map((demand.fields || []).map((field) => [field.key, field]));
  const rows = fieldOrder.map((key) => facts.get(key) || { key, ...fallbacks[key] });
  const iconFor = (key: string, label: string) =>
    key === 'public_summary'
      ? FiFileText
      : key === 'goal'
        ? FiStar
        : key === 'time' || label.includes('时间')
      ? FiCalendar
      : key === 'location' || /地点|目的地|区域/.test(label)
        ? FiMapPin
        : key === 'ability' || /能力|人数|同行|偏好|要求/.test(label)
          ? FiUsers
          : FiClock;
  return (
    <section
      className={styles.demandCard}
      aria-label={`${demand.title}需求卡`}
      aria-busy={Boolean(busy)}
    >
      <header>
        <span>
          <FiStar />
        </span>
        <strong>{demand.title}</strong>
        <small className={styles.demandStatus}>草稿 · 未发布</small>
        <button type="button" aria-label="编辑需求" onClick={onEdit} disabled={Boolean(busy)}>
          <FiEdit3 />
        </button>
      </header>
      {rows.map(({ key, title, value }) => {
        const RowIcon = iconFor(key || '', title);
        return (
          <button
            type="button"
            className={styles.demandRow}
            key={`${title}-${value}`}
            onClick={onEdit}
            disabled={Boolean(busy)}
          >
            <RowIcon />
            <span>{title}</span>
            <strong>{value}</strong>
            <FiEdit3 />
          </button>
        );
      })}
      <p className={styles.demandBoundaryNote}>
        <FiInfo />
        发布后开始推荐合适的人；地点、时间和能力默认只参与排序，邀请和联系仍由你确认。
      </p>
      <div className={styles.demandCardActions}>
        <button type="button" className={styles.primaryButton} onClick={onPublish} disabled={Boolean(busy)}>
          {busy === 'publish' ? <FiRefreshCw /> : <FiCheck />}{' '}
          {busy === 'publish' ? '正在确认发布…' : '发布'}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onHide} disabled={Boolean(busy)}>
          {busy === 'hide' ? '正在隐藏…' : '隐藏'}
        </button>
        <button type="button" className={styles.dangerButton} onClick={onCancel} disabled={Boolean(busy)}>
          {busy === 'cancel' ? '正在取消…' : '取消'}
        </button>
      </div>
    </section>
  );
}

function MomentsScreen({
  posts,
  likedPostIds,
  onLike,
  channel,
  onChannel,
  onCompose,
  socialIntent,
  taskIntent,
  socialApplication,
  taskApplication,
  onApplication,
}: {
  posts: FeedPost[];
  likedPostIds: number[];
  onLike: (id: number) => void;
  channel: 'moments' | 'social' | 'tasks';
  onChannel: (value: 'moments' | 'social' | 'tasks') => void;
  onCompose: () => void;
  socialIntent: FitMeetPublicIntent | null;
  taskIntent: FitMeetPublicIntent | null;
  socialApplication: ApplicationViewStatus;
  taskApplication: ApplicationViewStatus;
  onApplication: (kind: 'social' | 'task', status: ApplicationViewStatus) => void;
}) {
  return (
    <div className={styles.standardScreen}>
      <header className={styles.screenHeader}>
        <div>
          <h1>发现</h1>
          <p>分享动态，也看看附近真实需求</p>
        </div>
        <button type="button" aria-label="发布动态" onClick={onCompose}>
          <FiPlus />
        </button>
      </header>
      <div className={styles.segmented}>
        {(['moments', 'social', 'tasks'] as const).map((id) => (
          <button
            type="button"
            key={id}
            className={channel === id ? styles.segmentActive : ''}
            onClick={() => onChannel(id)}
          >
            {id === 'moments' ? '朋友圈' : id === 'social' ? '社交大厅' : '任务大厅'}
          </button>
        ))}
      </div>
      {channel === 'moments' ? (
        <div className={styles.feedList}>
          {posts.length ? (
            posts.map((post) => (
              <article className={styles.postCard} key={post.id}>
                <header>
                  <Avatar name={post.username} color={post.id % 2 ? '#ed7f94' : '#6889ec'} />
                  <div>
                    <strong>{post.username}</strong>
                    <small>
                      {post.createdAt} · {post.city}
                    </small>
                  </div>
                  <FiMoreHorizontal />
                </header>
                <h2>{post.title}</h2>
                <p>{post.text}</p>
                <div className={styles.postImage}>
                  <span>{post.tags[0]?.slice(0, 1) ?? 'F'}</span>
                </div>
                <div className={styles.tagRow}>
                  {post.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <footer>
                  <button
                    type="button"
                    className={likedPostIds.includes(post.id) ? styles.liked : ''}
                    onClick={() => onLike(post.id)}
                  >
                    <FiHeart /> {post.likes}
                  </button>
                  <button type="button">
                    <FiMessageCircle /> {post.comments}
                  </button>
                  <button type="button">
                    <FiSend /> 分享
                  </button>
                </footer>
              </article>
            ))
          ) : (
            <p className={styles.emptyState}>暂时没有动态。你可以发布第一条轻松的近况。</p>
          )}
        </div>
      ) : (
        <DiscoveryHall
          task={channel === 'tasks'}
          intent={channel === 'tasks' ? taskIntent : socialIntent}
          status={channel === 'tasks' ? taskApplication : socialApplication}
          onAction={(status) => onApplication(channel === 'tasks' ? 'task' : 'social', status)}
        />
      )}
    </div>
  );
}

function DiscoveryHall({
  task,
  intent,
  status,
  onAction,
}: {
  task: boolean;
  intent: FitMeetPublicIntent | null;
  status: ApplicationViewStatus;
  onAction: (status: ApplicationViewStatus) => void;
}) {
  if (!intent)
    return (
      <section className={styles.discoveryHall}>
        <p className={styles.emptyState}>
          暂时没有可申请的真实需求。你可以稍后再看，或发布自己的需求卡。
        </p>
      </section>
    );
  const title = intent.title || (task ? '服务需求' : '社交需求');
  const action =
    status === 'idle'
      ? task
        ? '申请接单'
        : '申请加入'
      : status === 'pending'
        ? '等待对方确认'
        : status === 'accepted'
          ? '已接受 · 可进入会话'
          : status === 'rejected'
            ? '对方暂未接受'
            : '申请已取消';
  return (
    <section className={styles.discoveryHall}>
      <p className={styles.hallNotice}>
        <FiShield /> 精确位置不会展示；申请被接受前不开放连续私信。
      </p>
      <article>
        <span>{task ? '任务大厅' : '社交大厅'}</span>
        <h2>{title}</h2>
        <p>{intent.summary || intent.text || '发布者希望先确认活动节奏与边界。'}</p>
        <div className={styles.tagRow}>
          {(intent.tags || []).slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
          <span>{intent.timeWindow || '时间待确认'}</span>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() =>
            status === 'idle' || status === 'cancelled'
              ? onAction('pending')
              : status === 'pending'
                ? onAction('cancelled')
                : undefined
          }
        >
          {status === 'pending' ? '取消申请' : action} <FiChevronRight />
        </button>
        {status === 'accepted' ? (
          <p className={styles.statusRow}>
            <FiCheck /> 申请已被接受；真实会话已开放。
          </p>
        ) : null}
      </article>
    </section>
  );
}

function MessagesScreen({
  invitations,
  conversations,
  currentUserId,
  onConversation,
  onInvitation,
  onMeet,
  onRelationship,
}: {
  invitations: MeetInvitation[];
  conversations: FitMeetConversation[];
  currentUserId: number;
  onConversation: (id: string) => void;
  onInvitation: (invitation: MeetInvitation, action: 'accept' | 'reject' | 'cancel') => void;
  onMeet: () => void;
  onRelationship: () => void;
}) {
  const pendingReceived = invitations.filter(
    (invitation) =>
      invitation.status === 'pending' && Number(invitation.inviteeUserId) === Number(currentUserId),
  );
  const pendingSent = invitations.filter(
    (invitation) =>
      invitation.status === 'pending' && Number(invitation.inviterUserId) === Number(currentUserId),
  );
  return (
    <div className={styles.standardScreen}>
      <header className={styles.messageHeader}>
        <h1>消息</h1>
        <p>只有双方确认后，连续会话才会开放</p>
      </header>
      <button type="button" className={styles.searchButton}>
        <FiSearch /> 搜索消息
      </button>
      <section className={styles.quickMessages}>
        <button type="button" onClick={onRelationship}>
          <span>
            <FiUserPlus />
          </span>
          关系申请
        </button>
        <button type="button">
          <span>
            <FiBell />
          </span>
          系统通知
        </button>
        <button type="button" onClick={onMeet}>
          <span>
            <FiCalendar />
          </span>
          待处理{pendingReceived.length ? <small>{pendingReceived.length}</small> : null}
        </button>
      </section>
      {pendingReceived.length ? (
        <>
          <h2 className={styles.listTitle}>收到的邀请</h2>
          {pendingReceived.map((invitation) => (
            <article className={styles.inboxAction} key={invitation.id}>
              <span>
                <FiCalendar />
              </span>
              <div>
                <strong>{invitation.title || 'FitMeet 活动邀请'}</strong>
                <p>{invitation.message || '对方邀请你一起参与活动。'}</p>
                <small>
                  {invitation.timeWindow || '时间待确认'} ·{' '}
                  {invitation.locationText || '公共区域集合'}
                </small>
                <div className={styles.inlineActions}>
                  <button type="button" onClick={() => onInvitation(invitation, 'accept')}>
                    接受
                  </button>
                  <button type="button" onClick={() => onInvitation(invitation, 'reject')}>
                    婉拒
                  </button>
                </div>
              </div>
            </article>
          ))}
        </>
      ) : null}
      {pendingSent.length ? (
        <>
          <h2 className={styles.listTitle}>等待回应</h2>
          {pendingSent.map((invitation) => (
            <article className={styles.inboxAction} key={invitation.id}>
              <span>
                <FiCalendar />
              </span>
              <div>
                <strong>{invitation.title || '活动邀请'}</strong>
                <p>等待对方自主决定；接受前不会开放连续私信。</p>
                <div className={styles.inlineActions}>
                  <button type="button" onClick={() => onInvitation(invitation, 'cancel')}>
                    撤回邀请
                  </button>
                </div>
              </div>
            </article>
          ))}
        </>
      ) : null}
      <h2 className={styles.listTitle}>全部消息</h2>
      {conversations.length ? (
        conversations.map((conversation) => (
          <button
            type="button"
            className={styles.messageRow}
            key={conversation.id}
            onClick={() => onConversation(conversation.id)}
          >
            <Avatar
              name={conversation.displayName || conversation.username || 'F'}
              color="#9d7df2"
            />
            <span>
              <strong>{conversation.displayName || conversation.username || 'FitMeet 用户'}</strong>
              <small>{conversation.lastMessage || '会话已开放'}</small>
            </span>
            {conversation.unread ? (
              <time>{conversation.unread}</time>
            ) : (
              <time>{conversation.updatedAt || conversation.time || ''}</time>
            )}
          </button>
        ))
      ) : (
        <p className={styles.emptyState}>
          还没有已开放的会话。接受一项活动邀请，或等待对方接受你的邀请后，就可以在这里继续聊天。
        </p>
      )}
    </div>
  );
}

function ProfileScreen({
  profile,
  notificationEnabled,
  postCount,
  relationshipCount,
  onEdit,
  onPrivacy,
  onSettings,
  onRelationships,
  onReboard,
}: {
  profile: SocialProfile;
  notificationEnabled: boolean;
  postCount: number;
  relationshipCount: number;
  onEdit: () => void;
  onPrivacy: () => void;
  onSettings: () => void;
  onRelationships: () => void;
  onReboard: () => void;
}) {
  return (
    <div className={styles.profileScreen}>
      <header>
        <button type="button" aria-label="隐私设置" onClick={onPrivacy}>
          <FiShield />
        </button>
        <button type="button" aria-label="设置" onClick={onSettings}>
          <FiSettings />
        </button>
      </header>
      <section className={styles.profileHero}>
        <Avatar name={profile.nickname} color="#657cf3" size={72} />
        <div>
          <h1>{profile.nickname}</h1>
          <p>{profile.city || '城市待填写'}</p>
          <span>{profile.profileDiscoverable ? '资料可发现' : '资料已隐藏'}</span>
        </div>
        <button type="button" onClick={onEdit}>
          编辑资料
        </button>
      </section>
      <p className={styles.profileBio}>
        {profile.bio || '写几句话介绍自己，让小福更好地理解你的兴趣与边界。'}
      </p>
      <section className={styles.profileStats}>
        <span>
          <strong>{postCount}</strong>动态
        </span>
        <span>
          <strong>{profile.interests.length}</strong>兴趣
        </span>
        <span>
          <strong>{relationshipCount}</strong>待处理关系
        </span>
      </section>
      <div className={styles.profileTags}>
        {profile.interests.map((interest) => (
          <span key={interest}>{interest}</span>
        ))}
      </div>
      <section className={styles.profileRows}>
        <button type="button" onClick={onRelationships}>
          <span>
            <FiUsers />
          </span>
          <strong>我的关系</strong>
          <small>{relationshipCount ? `${relationshipCount} 个待处理` : '好友与申请'}</small>
          <FiChevronRight />
        </button>
        <button type="button" onClick={onPrivacy}>
          <span>
            <FiLock />
          </span>
          <strong>隐私边界</strong>
          <small>附近推荐 / 先聊天</small>
          <FiChevronRight />
        </button>
        <button type="button" onClick={onSettings}>
          <span>
            <FiBell />
          </span>
          <strong>通知设置</strong>
          <small>{notificationEnabled ? '已开启' : '已关闭'}</small>
          <FiChevronRight />
        </button>
        <button type="button" onClick={onReboard}>
          <span>
            <FiSliders />
          </span>
          <strong>重新完善资料</strong>
          <small>完整 onboarding</small>
          <FiChevronRight />
        </button>
      </section>
    </div>
  );
}

function CandidateSheet({
  candidate,
  candidates,
  relationship,
  inviteStatus,
  onClose,
  onSelect,
  onDismiss,
  onSave,
  onFriend,
  onInvite,
  onConversation,
}: {
  candidate: CandidateViewModel;
  candidates: CandidateViewModel[];
  relationship: RelationshipState;
  inviteStatus: InvitationViewStatus;
  onClose: () => void;
  onSelect: (id: number) => void;
  onDismiss: () => void;
  onSave: () => void;
  onFriend: () => void;
  onInvite: () => void;
  onConversation: () => void;
}) {
  const invitationAccepted = inviteStatus === 'accepted';
  return (
    <Sheet title="候选人" onClose={onClose}>
      <p className={styles.sheetLead}>
        先看共同点和活动节奏，再决定要不要继续。没有“必须合适”的人。
      </p>
      <div className={styles.candidatePicker}>
        {candidates.map((item) => (
          <button
            type="button"
            key={item.id}
            className={candidate.id === item.id ? styles.candidatePickerActive : ''}
            onClick={() => onSelect(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <article className={styles.candidateDetail}>
        <header>
          <Avatar name={candidate.name} color="#9d7df2" size={68} />
          <div>
            <h3>{candidate.name}</h3>
            <p>
              {candidate.age} · {candidate.sport} · {candidate.level} · {candidate.distance}
            </p>
          </div>
        </header>
        <p className={styles.candidateReason}>
          <FiStar /> {candidate.reason}
        </p>
        <div className={styles.tagRow}>
          {candidate.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p className={styles.sheetSafety}>
          <FiShield /> 小福不会替你私信。对方接受邀请或好友申请后，才能聊天。
        </p>
        <div className={styles.stackActions}>
          <button type="button" className={styles.secondaryButton} onClick={onSave}>
            <FiBookmark /> 先收藏
          </button>
          <button type="button" className={styles.secondaryButton} onClick={onDismiss}>
            这次不合适
          </button>
          {relationship === 'none' ? (
            <button type="button" className={styles.secondaryButton} onClick={onFriend}>
              <FiUserPlus /> 先申请好友
            </button>
          ) : null}
          <button
            type="button"
            className={styles.primaryButton}
            onClick={invitationAccepted ? onConversation : onInvite}
            disabled={inviteStatus === 'sent'}
          >
            {inviteStatus === 'sent' ? (
              '邀请已发送 · 等待回应'
            ) : invitationAccepted ? (
              <>
                已匹配 · 进入聊天 <FiChevronRight />
              </>
            ) : (
              <>
                生成邀请草稿 <FiChevronRight />
              </>
            )}
          </button>
        </div>
      </article>
    </Sheet>
  );
}

function DemandListSheet({
  demands,
  activeDemandId,
  onClose,
  onSelect,
  onCreate,
}: {
  demands: FitMeetDemand[];
  activeDemandId?: string;
  onClose: () => void;
  onSelect: (demand: FitMeetDemand) => void;
  onCreate: () => void;
}) {
  return (
    <Sheet title="我的需求" onClose={onClose}>
      <p className={styles.sheetLead}>
        每条需求都保留独立的卡片、候选、邀请和会话状态。切换不会覆盖其他需求。
      </p>
      <div className={styles.demandList}>
        {demands.length ? (
          demands.map((item) => (
            <button
              type="button"
              key={item.id}
              className={item.id === activeDemandId ? styles.demandListActive : ''}
              onClick={() => onSelect(item)}
            >
              <span>
                <strong>{item.title || item.category || '未命名需求'}</strong>
                <small>{item.summary || '打开查看需求详情'}</small>
              </span>
              <i>{demandStatusCopy(item)}</i>
              <FiChevronRight />
            </button>
          ))
        ) : (
          <p className={styles.emptyState}>
            还没有已发布的需求。你可以先告诉小福一个不完整的想法。
          </p>
        )}
      </div>
      <button type="button" className={styles.primaryButton} onClick={onCreate}>
        <FiPlus /> 新建一条需求
      </button>
      <p className={styles.sheetSafety}>
        <FiShield /> 新建不会删除历史需求；发布、邀请和聊天仍需按各自状态确认。
      </p>
    </Sheet>
  );
}

function DemandSheet({
  demand,
  candidateCount,
  busy,
  onClose,
  onEdit,
  onPublish,
  onHide,
  onCancel,
  onCandidates,
  onConversation,
}: {
  demand: DemandViewModel;
  candidateCount: number;
  busy: AgentDemandDraftAction | null;
  onClose: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onHide: () => void;
  onCancel: () => void;
  onCandidates: () => void;
  onConversation: () => void;
}) {
  const effectiveStatus = effectiveDemandStatus(demand, candidateCount);
  const statusText =
    effectiveStatus === 'draft'
      ? '待确认'
      : ['matching', 'published'].includes(effectiveStatus)
        ? '正在匹配'
        : effectiveStatus === 'matched'
          ? '已找到候选人'
          : effectiveStatus === 'invited'
            ? '已发送邀请'
            : effectiveStatus === 'communicating'
              ? '已匹配，可聊天'
              : effectiveStatus === 'hidden'
                ? '已暂停'
                : '已取消';
  const detailFields = demand.fields?.length
    ? demand.fields
    : [
        { title: '时间', value: demand.timeWindow },
        { title: '地点', value: demand.locationText },
        { title: '边界', value: demand.privacyBoundary },
      ];
  return (
    <Sheet title="我的需求" onClose={onClose}>
      <p className={styles.sheetLead}>
        这里显示这张需求的真实状态。发布、暂停或取消都需要你再次确认。
      </p>
      <article className={styles.detailCard}>
        <span>当前状态</span>
        <strong>{statusText}</strong>
        <p>{demand.summary}</p>
        <dl className={styles.detailRows}>
          {detailFields.slice(0, 6).map((field) => (
            <div key={`${field.title}-${field.value}`}>
              <dt>{field.title}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      </article>
      <div className={styles.stackActions}>
        {effectiveStatus === 'draft' ? (
          <button type="button" className={styles.secondaryButton} onClick={onEdit}>
            <FiEdit3 /> 编辑草稿
          </button>
        ) : null}
        {effectiveStatus === 'draft' || effectiveStatus === 'hidden' ? (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onPublish}
            disabled={Boolean(busy) || (effectiveStatus === 'draft' && demand.publishable === false)}
          >
            {busy === 'publish' ? '正在确认发布…' : '确认并开始匹配'}
          </button>
        ) : null}
        {effectiveStatus === 'draft' && demand.publishable === false ? (
          <p className={styles.sheetSafety}>
            <FiAlertTriangle /> 关键事实尚未补齐；草稿可以保存，但暂不能发布。
          </p>
        ) : null}
        {effectiveStatus === 'matched' ? (
          <button type="button" className={styles.primaryButton} onClick={onCandidates}>
            查看 {candidateCount} 位候选人
          </button>
        ) : null}
        {effectiveStatus === 'communicating' ? (
          <button type="button" className={styles.primaryButton} onClick={onConversation}>
            进入聊天
          </button>
        ) : null}
        {effectiveStatus === 'invited' ? (
          <p className={styles.statusRow}>
            <FiClock /> 等待对方接受；接受前不会开放连续私信。
          </p>
        ) : null}
        {['published', 'matching', 'matched'].includes(effectiveStatus) ? (
          <button type="button" className={styles.secondaryButton} onClick={onHide} disabled={Boolean(busy)}>
            {busy === 'hide' ? '正在暂停…' : '暂停匹配'}
          </button>
        ) : null}
        {!['cancelled', 'communicating'].includes(effectiveStatus) ? (
          <button type="button" className={styles.dangerButton} onClick={onCancel} disabled={Boolean(busy)}>
            {busy === 'cancel' ? '正在取消…' : '取消这条需求'}
          </button>
        ) : null}
      </div>
    </Sheet>
  );
}

type DemandEditorField = NonNullable<DemandViewModel['fields']>[number];

const lightDemandFieldSpecs: Array<{
  key: string;
  title: string;
  fallback: string;
}> = [
  { key: 'goal', title: '核心目的', fallback: '找到合适伙伴，一起完成这件事' },
  { key: 'activity', title: '活动', fallback: '新的活动' },
  { key: 'location', title: '地点', fallback: '同城公共场所，具体地点可协商（可编辑默认）' },
  { key: 'time', title: '时间', fallback: '时间可协商（可编辑默认）' },
  { key: 'ability', title: '能力', fallback: '能力不限，轻松参与（可编辑默认）' },
];

const demandTypeOptions = [
  ['friends', '交友'], ['dating', '认真认识'], ['workout', '运动约练'], ['buddy', '活动搭子'],
  ['travel', '旅行同行'], ['service', '生活服务'], ['housing', '找房合租'], ['activity', '线下活动'],
  ['help', '本地求助'], ['other', '其他需求'],
] as const;

function DemandEditSheet({
  demand,
  onClose,
  onSave,
}: {
  demand: DemandViewModel;
  onClose: () => void;
  onSave: (demand: DemandViewModel) => void;
}) {
  const [draft, setDraft] = useState(demand);

  const fieldFor = (spec: typeof lightDemandFieldSpecs[number]): DemandEditorField =>
    (draft.fields || []).find((field) => field.key === spec.key) || {
      key: spec.key,
      title: spec.title,
      value: spec.fallback,
      state: 'defaulted',
      requirement: spec.key === 'goal' ? 'context' : 'preferred',
      visibility: 'public',
      editable: true,
      evidence: [],
    };

  const updateField = (spec: typeof lightDemandFieldSpecs[number], value: string) => {
    setDraft((current) => {
      const fields = current.fields || [];
      const index = fields.findIndex((field) => field.key === spec.key);
      const nextField: DemandEditorField = {
        ...(index >= 0 ? fields[index] : {}),
        key: spec.key,
        title: spec.title,
        value,
        state: 'confirmed',
        requirement: spec.key === 'goal' ? 'context' : 'preferred',
        visibility: 'public',
        editable: true,
        evidence: index >= 0 ? fields[index].evidence || [] : [],
      };
      return {
        ...current,
        fields: index >= 0
          ? fields.map((field, fieldIndex) => fieldIndex === index ? nextField : field)
          : [...fields, nextField],
      };
    });
  };

  return (
    <Sheet title="编辑需求草稿" onClose={onClose}>
      <p className={styles.sheetLead}>
        小福会把你的描述整理成简洁需求卡。地点、时间和能力没有特别要求时可保留默认值。
      </p>
      <div className={styles.draftIntentEditor}>
        <Field label="需求类型">
          <select
            value={draft.demandType || 'other'}
            onChange={(event) => setDraft((current) => ({ ...current, demandType: event.target.value }))}
          >
            {demandTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
        <Field label="简短标题">
          <input
            value={draft.title}
            maxLength={28}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          />
        </Field>
        <Field label="公开摘要">
          <textarea
            value={draft.summary}
            maxLength={88}
            onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
          />
        </Field>
      </div>

      <div className={styles.structuredDraftEditor}>
        {lightDemandFieldSpecs.map((spec) => {
          const field = fieldFor(spec);
          return (
            <article key={spec.key} className={styles.structuredDraftField}>
              <div>
                <strong>{spec.title}</strong>
                {field.state === 'defaulted' ? <span data-state="defaulted">可编辑默认</span> : null}
              </div>
              <textarea
                aria-label={`${spec.title}内容`}
                value={field.value}
                placeholder={spec.fallback}
                disabled={field.editable === false}
                onChange={(event) => updateField(spec, event.target.value)}
              />
            </article>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.primaryButton}
        disabled={!draft.title.trim()}
        onClick={() => onSave({ ...draft, status: 'draft' })}
      >
        保存需求卡
      </button>
    </Sheet>
  );
}

function InviteSheet({
  candidate,
  demand,
  busy,
  onClose,
  onSend,
}: {
  candidate: CandidateViewModel;
  demand: DemandViewModel;
  busy: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
}) {
  const [message, setMessage] = useState(invitationMessage(candidate, demand));
  return (
    <Sheet title={`邀请 ${candidate.name} 一起活动`} onClose={onClose} closeDisabled={busy}>
      <div className={styles.inviteDraft}>
        <span>邀请说明</span>
        <textarea
          className={styles.publishTextarea}
          aria-label="邀请文案"
          value={message}
          disabled={busy}
          onChange={(event) => setMessage(event.target.value)}
        />
        <small>发送前可以随时修改；对方接受前不会开放私信。</small>
      </div>
      <button
        type="button"
        className={styles.primaryButton}
        disabled={!message.trim() || busy}
        onClick={() => void onSend(message)}
      >
        <FiSend /> {busy ? '正在发送…' : '确认发送邀请'}
      </button>
    </Sheet>
  );
}

function proposalArguments(entry: AgentThreadEntry) {
  const candidate = entry.payload?.arguments;
  return candidate && typeof candidate === 'object' && !Array.isArray(candidate)
    ? (candidate as Record<string, unknown>)
    : {};
}

function proposalApprovalCopy(proposal: AgentThreadEntry) {
  const args = proposalArguments(proposal);
  const action = typeof args.action === 'string' ? args.action : '';
  const titles: Record<string, string> = {
    press_demand_card_button:
      action === 'publish'
        ? '确认发布需求卡'
        : action === 'hide'
          ? '确认暂停匹配'
          : action === 'cancel'
            ? '确认取消需求'
            : '确认操作需求卡',
    send_invitation: '确认发送邀请',
    request_service_connection: '确认联系服务者',
    block_user: '确认拉黑用户',
    report_user: '确认提交举报',
    patch_social_profile: '确认更新资料',
  };
  const summaries: Record<string, string> = {
    press_demand_card_button: `将${action === 'publish' ? '发布' : action === 'hide' ? '暂停' : action === 'cancel' ? '取消' : '操作'}这张需求卡；系统会以服务端实际状态为准。`,
    send_invitation: '对方可以自主接受或婉拒；接受前不会开放连续私信。',
    request_service_connection: '这会创建一条联系请求，不会绕过对方或直接开启聊天。',
    block_user: '拉黑后，对方不会再出现在推荐或会话入口中。',
    report_user: '举报会提交给安全流程；小福不会替你继续联系对方。',
    patch_social_profile: '只会写入下方列出的资料或隐私字段。',
  };
  return {
    title: titles[proposal.toolName || ''] || '确认这项操作',
    summary:
      summaries[proposal.toolName || ''] || '这项操作会影响账号或与他人的关系，需要你明确确认。',
  };
}

function ToolApprovalSheet({
  proposal,
  busy,
  onClose,
  onResolve,
}: {
  proposal: AgentThreadEntry;
  busy: 'approve' | 'decline' | null;
  onClose: () => void;
  onResolve: (decision: 'approve' | 'decline', message?: string) => void;
}) {
  const args = proposalArguments(proposal);
  const approval = proposalApprovalCopy(proposal);
  const editable =
    proposal.toolName === 'send_invitation' || proposal.toolName === 'request_service_connection';
  const [message, setMessage] = useState(typeof args.message === 'string' ? args.message : '');
  const displayedArguments = visibleAgentArguments(args);
  const disclosure = agentToolDisclosure(proposal.toolName, args);
  return (
    <Sheet title={approval.title} closeDisabled={Boolean(busy)} onClose={onClose}>
      <div aria-busy={Boolean(busy)}>
      <p className={styles.sheetLead}>
        <FiShield /> {approval.summary}
      </p>
      <ol className={styles.actionLifecycle} aria-label="操作进度">
        <li data-state="complete"><FiCheck /> 草稿已准备</li>
        <li data-state={busy ? 'complete' : 'current'}>{busy ? <FiCheck /> : <span>2</span>} 等待你确认</li>
        <li data-state={busy ? 'current' : 'upcoming'}>{busy ? <FiRefreshCw /> : <span>3</span>} {busy ? '正在执行' : '服务端执行'}</li>
        <li data-state="upcoming"><span>4</span> 返回真实结果</li>
      </ol>
      <article className={styles.detailCard}>
        <span>你将确认的内容</span>
        {editable ? (
          <>
            <textarea
              className={styles.publishTextarea}
              aria-label="确认前可编辑的文案"
              value={message}
              disabled={Boolean(busy)}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="写一句你想表达的话"
            />
            <small>你可以先改成自己舒服的说法；发送前仍由你最后确认。</small>
          </>
        ) : null}
        {displayedArguments.length ? (
          <dl className={styles.detailRows}>
            {displayedArguments.map((item) => (
              <div key={item.key}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </article>
      <details className={styles.approvalDisclosure}>
        <summary>查看为什么需要确认 · 读取范围</summary>
        <p>{disclosure.why}</p>
        <ul>{disclosure.sources.map((source) => <li key={source}>{source}</li>)}</ul>
        <small><FiShield /> {disclosure.writeScope}</small>
      </details>
      <div className={styles.stackActions}>
        <button
          type="button"
          className={`${styles.primaryButton} ${busy === 'approve' ? styles.spinIcon : ''}`}
          disabled={Boolean(busy) || (editable && !message.trim())}
          onClick={() => onResolve('approve', editable ? message.trim() : undefined)}
        >
          {busy === 'approve' ? <><FiRefreshCw /> 正在执行…</> : <><FiCheck /> 我确认执行</>}
        </button>
        <button
          type="button"
          className={`${styles.secondaryButton} ${busy === 'decline' ? styles.spinIcon : ''}`}
          disabled={Boolean(busy)}
          onClick={() => onResolve('decline')}
        >
          {busy === 'decline' ? <><FiRefreshCw /> 正在取消…</> : '不执行这一步'}
        </button>
      </div>
      <p className={styles.sheetSafety}>
        <FiShield /> 只有服务端返回成功后，界面才会显示“已完成”；网络失败不会被当作已发送或已发布。
      </p>
      </div>
    </Sheet>
  );
}

function ComposeSheet({
  value,
  images,
  publishing,
  onChange,
  onFiles,
  onRemoveImage,
  onClose,
  onPublish,
}: {
  value: string;
  images: MomentDraftImage[];
  publishing: boolean;
  onChange: (value: string) => void;
  onFiles: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onClose: () => void;
  onPublish: () => void;
}) {
  return (
    <Sheet title="发布动态" onClose={onClose}>
      <textarea
        className={styles.publishTextarea}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="分享一个今天的瞬间，或说说你正在寻找的同伴…"
        aria-label="动态内容"
      />
      {images.length ? (
        <div className={styles.momentDraftGrid}>
          {images.map((image) => (
            <figure key={image.id}>
              <img src={image.preview} alt="待发布图片预览" />
              <button type="button" aria-label="移除图片" onClick={() => onRemoveImage(image.id)}>
                <FiX />
              </button>
            </figure>
          ))}
        </div>
      ) : null}
      <label className={styles.momentMediaPicker}>
        <FiImage />
        <span>
          <strong>添加图片</strong>
          <small>{images.length}/9 · 单张不超过 8MB</small>
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          disabled={publishing || images.length >= 9}
          onChange={(event) => {
            onFiles(Array.from(event.target.files || []));
            event.target.value = '';
          }}
        />
      </label>
      <div className={styles.publishOptions}>
        <span>
          <FiMapPin /> 模糊定位
        </span>
        <span>
          <FiUsers /> 公开给同城兴趣圈
        </span>
      </div>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={onPublish}
        disabled={publishing || (!value.trim() && !images.length)}
      >
        {publishing ? '正在审核并发布…' : '发布到朋友圈'}
      </button>
      <p className={styles.sheetSafety}>
        <FiShield /> 图片先上传到统一审核接口；全部通过后才会创建动态。
      </p>
    </Sheet>
  );
}

function ConversationSheet({
  conversation,
  unlocked,
  closed,
  items,
  input,
  sending,
  onInput,
  onSend,
  onMute,
  onRecall,
  onReport,
  onBlock,
  onClose,
}: {
  conversation: FitMeetConversation;
  unlocked: boolean;
  closed: boolean;
  items: ConversationMessage[];
  input: string;
  sending: boolean;
  onInput: (value: string) => void;
  onSend: () => void;
  onMute: () => void;
  onRecall: (id: string) => void;
  onReport: (id: string) => void;
  onBlock: () => void;
  onClose: () => void;
}) {
  const [actionMessageId, setActionMessageId] = useState<string | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const groupConversation = isGroupConversation(conversation);
  const title =
    conversation.title || conversation.displayName || conversation.username || 'FitMeet 用户';
  const muted =
    conversation.notificationLevel === 'muted' ||
    Boolean(conversation.mutedUntil && new Date(conversation.mutedUntil).getTime() > Date.now());
  return (
    <Sheet title={title} onClose={onClose}>
      {closed ? null : (
        <div className={styles.threadToolbar}>
          <button type="button" onClick={onMute}>
            <FiBell /> {muted ? '恢复提醒' : '静音'}
          </button>
          {!groupConversation ? (
            <button
              type="button"
              className={confirmBlock ? styles.threadDangerAction : ''}
              onClick={() => {
                if (confirmBlock) onBlock();
                else setConfirmBlock(true);
              }}
            >
              <FiShield /> {confirmBlock ? '确认拉黑' : '拉黑'}
            </button>
          ) : null}
        </div>
      )}
      <p className={styles.threadNote}>
        <FiShield />{' '}
        {closed
          ? '这段旧会话已关闭；历史记录只读保留'
          : unlocked
            ? groupConversation
              ? '只有正式成员可以进入；离开组局后会同步收回群聊权限'
              : '双方确认后开放的真实会话；当前服务端仅支持文字消息'
            : '等待双方接受邀请或好友关系后，才会开启连续会话'}
      </p>
      {unlocked || closed ? (
        <div className={styles.thread}>
          {items.map((item) => {
            const recalled = item.lifecycleStatus === 'recalled' || Boolean(item.recalledAt);
            const canRecall =
              item.role === 'user' &&
              !recalled &&
              Date.now() - new Date(item.createdAt).getTime() <= 2 * 60 * 1000;
            return (
              <article
                key={item.id}
                className={`${styles.threadMessage} ${item.role === 'user' ? styles.threadMine : ''}`}
              >
                <p>{item.text}</p>
                <footer>
                  <small>
                    {item.role === 'user'
                      ? recalled
                        ? '已撤回'
                        : item.readByOther
                          ? '已读'
                          : item.status === 'delivered'
                            ? '已送达'
                            : '已发送'
                      : new Date(item.createdAt).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                  </small>
                  {!recalled ? (
                    <button
                      type="button"
                      aria-label="消息操作"
                      onClick={() =>
                        setActionMessageId(actionMessageId === item.id ? null : item.id)
                      }
                    >
                      <FiMoreHorizontal />
                    </button>
                  ) : null}
                </footer>
                {actionMessageId === item.id ? (
                  <aside>
                    {canRecall ? (
                      <button
                        type="button"
                        onClick={() => {
                          onRecall(item.id);
                          setActionMessageId(null);
                        }}
                      >
                        <FiTrash2 /> 撤回消息
                      </button>
                    ) : null}
                    {item.role === 'peer' ? (
                      <button
                        type="button"
                        onClick={() => {
                          onReport(item.id);
                          setActionMessageId(null);
                        }}
                      >
                        <FiFlag /> 举报消息
                      </button>
                    ) : null}
                    {!canRecall && item.role === 'user' ? (
                      <small>发送超过 2 分钟，无法撤回</small>
                    ) : null}
                  </aside>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
      {unlocked ? (
        <form
          className={styles.sheetComposer}
          aria-busy={sending}
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
        >
          <input
            value={input}
            disabled={sending}
            onChange={(event) => onInput(event.target.value)}
            placeholder={sending ? '正在发送…' : '说点什么'}
            aria-label="消息内容"
          />
          <button type="submit" aria-label={sending ? '正在发送消息' : '发送消息'} disabled={sending || !input.trim()}>
            {sending ? <FiRefreshCw /> : <FiSend />}
          </button>
        </form>
      ) : (
        <section className={styles.lockedConversation}>
          <FiLock />
          <strong>{closed ? '旧会话已关闭' : '还没有开启会话'}</strong>
          <p>
            {closed
              ? '解除拉黑不会自动恢复原关系。重新匹配、重新邀请或双方重新建立关系后，新的会话才会开放。'
              : '你可以等待对方决定，也可以撤回邀请；小福不会替你越过这一步。'}
          </p>
        </section>
      )}
    </Sheet>
  );
}

function formatMemoryDate(value?: string) {
  if (!value) return '时间未提供';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function MemorySheet({
  ownerId,
  memories,
  needWikiEntries,
  capabilityOfferings,
  control,
  loading,
  error,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  onReject,
  onToggleInference,
  onSuppress,
  onRemoveSuppression,
  onLoadUsage,
  onUpdateNeedWiki,
  onDeleteNeedWiki,
  onSaveCapability,
  onRetry,
}: {
  ownerId: string | null;
  memories: FitMeetAgentMemory[];
  needWikiEntries: AgentNeedWikiItem[];
  capabilityOfferings: CapabilityOffering[];
  control: AgentMemoryControl | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (
    id: string,
    useScope: AgentMemoryUseScope,
    explicitSensitiveConsent: boolean,
  ) => Promise<void>;
  onUpdate: (
    id: string,
    patch: { value?: string; useScope?: AgentMemoryUseScope },
  ) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<void>;
  onToggleInference: () => Promise<void>;
  onSuppress: (id: string) => Promise<boolean>;
  onRemoveSuppression: (memoryType: string) => Promise<void>;
  onLoadUsage: (id: string, cursor?: string) => Promise<AgentMemoryUsagePage>;
  onUpdateNeedWiki: (id: string, title: string, summary: string) => Promise<boolean>;
  onDeleteNeedWiki: (id: string) => Promise<boolean>;
  onSaveCapability: (draft: {
    id?: string;
    displayName: string;
    domain: string;
    capabilities: string[];
    serviceModes: string[];
    city?: string | null;
    acceptsNewRequests: boolean;
  }) => Promise<boolean>;
  onRetry: () => Promise<void>;
}) {
  const [busyAction, setBusyAction] = useState('');
  const [scopeDrafts, setScopeDrafts] = useState<Record<string, AgentMemoryUseScope>>({});
  const [editingId, setEditingId] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editingWikiId, setEditingWikiId] = useState('');
  const [wikiTitle, setWikiTitle] = useState('');
  const [wikiSummary, setWikiSummary] = useState('');
  const [capabilityName, setCapabilityName] = useState('');
  const [capabilityDomain, setCapabilityDomain] = useState('general');
  const [capabilityText, setCapabilityText] = useState('');
  const [capabilityModes, setCapabilityModes] = useState('线下');
  const [capabilityCity, setCapabilityCity] = useState('');
  const [acceptsNewRequests, setAcceptsNewRequests] = useState(true);
  const [confirmingAction, setConfirmingAction] = useState<{
    id: string;
    kind: 'delete' | 'suppress';
  } | null>(null);
  const [expandedUsageId, setExpandedUsageId] = useState('');
  const [usageByMemory, setUsageByMemory] = useState<
    Record<
      string,
      {
        items: AgentMemoryUsageEvent[];
        nextCursor?: string | null;
        loading: boolean;
        error?: string | null;
      }
    >
  >({});
  const usageOwnerIdRef = useRef<string | null>(ownerId);
  const usageLoadRequestRef = useRef<Record<string, number>>({});

  useEffect(() => {
    usageOwnerIdRef.current = ownerId;
    usageLoadRequestRef.current = {};
    setBusyAction('');
    setScopeDrafts({});
    setEditingId('');
    setEditValue('');
    setEditingWikiId('');
    setWikiTitle('');
    setWikiSummary('');
    setConfirmingAction(null);
    setExpandedUsageId('');
    setUsageByMemory({});
  }, [ownerId]);

  useEffect(() => {
    const offering = capabilityOfferings[0];
    setCapabilityName(offering?.displayName ?? '');
    setCapabilityDomain(offering?.domain ?? 'general');
    setCapabilityText((offering?.capabilities ?? []).join('、'));
    setCapabilityModes((offering?.serviceModes ?? ['线下']).join('、'));
    setCapabilityCity(offering?.city ?? '');
    setAcceptsNewRequests(offering?.acceptsNewRequests ?? true);
  }, [capabilityOfferings]);

  useEffect(() => {
    setScopeDrafts((current) => {
      const next: Record<string, AgentMemoryUseScope> = {};
      for (const memory of memories)
        next[memory.id] = memory.useScope ?? current[memory.id] ?? defaultMemoryUseScope(memory);
      return next;
    });
  }, [memories]);

  const execute = async (key: string, action: () => Promise<void>) => {
    if (busyAction) return;
    setBusyAction(key);
    try {
      await action();
    } finally {
      setBusyAction('');
    }
  };

  const loadUsage = async (memoryId: string, cursor?: string) => {
    const requestOwnerId = ownerId;
    const requestId = (usageLoadRequestRef.current[memoryId] ?? 0) + 1;
    usageLoadRequestRef.current[memoryId] = requestId;
    if (!requestOwnerId || usageOwnerIdRef.current !== requestOwnerId) return;
    setUsageByMemory((current) => ({
      ...current,
      [memoryId]: {
        items: cursor ? current[memoryId]?.items ?? [] : [],
        nextCursor: current[memoryId]?.nextCursor,
        loading: true,
        error: null,
      },
    }));
    try {
      const page = await onLoadUsage(memoryId, cursor);
      if (
        usageOwnerIdRef.current !== requestOwnerId ||
        usageLoadRequestRef.current[memoryId] !== requestId
      )
        return;
      setUsageByMemory((current) => ({
        ...current,
        [memoryId]: {
          items: cursor
            ? mergeMemoryUsageEvents(current[memoryId]?.items ?? [], page.items)
            : mergeMemoryUsageEvents([], page.items),
          nextCursor: page.nextCursor ?? null,
          loading: false,
          error: null,
        },
      }));
    } catch (reason) {
      if (
        usageOwnerIdRef.current !== requestOwnerId ||
        usageLoadRequestRef.current[memoryId] !== requestId
      )
        return;
      setUsageByMemory((current) => ({
        ...current,
        [memoryId]: {
          items: current[memoryId]?.items ?? [],
          nextCursor: current[memoryId]?.nextCursor,
          loading: false,
          error: reason instanceof Error ? reason.message : '使用记录暂时无法读取。',
        },
      }));
    }
  };

  const toggleUsage = (memoryId: string) => {
    if (expandedUsageId === memoryId) {
      setExpandedUsageId('');
      return;
    }
    setExpandedUsageId(memoryId);
    if (!usageByMemory[memoryId]) void loadUsage(memoryId);
  };

  return (
    <Sheet title="人物画像与记忆" onClose={onClose}>
      <p className={styles.sheetLead}>查看小福记住了什么、来自哪里、能用于什么，以及它过去在哪里真正被使用。待确认推断不会自动成为长期记忆。</p>
      <section className={styles.memoryControlPanel} aria-busy={loading || busyAction === 'control'}>
        <div>
          <strong>允许提出新画像</strong>
          <p>只从你的原话中提出，保存和使用范围仍由你逐条确认。</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={control?.inferenceEnabled ?? false}
          aria-label="允许小福提出新的待确认画像"
          disabled={!control || loading || Boolean(busyAction)}
          onClick={() => void execute('control', onToggleInference)}
        >
          <span />
          {control ? (control.inferenceEnabled ? '已开启' : '已暂停') : '同步中'}
        </button>
        {control?.suppressions.length ? (
          <div className={styles.memorySuppressions}>
            <span>禁止再次推断</span>
            <ul>
              {control.suppressions.map((suppression) => (
                <li key={suppression.memoryType}>
                  <span>{memoryTypeLabel(suppression.memoryType)}</span>
                  <button
                    type="button"
                    disabled={Boolean(busyAction)}
                    onClick={() =>
                      void execute(`unsuppress:${suppression.memoryType}`, () =>
                        onRemoveSuppression(suppression.memoryType),
                      )
                    }
                  >
                    允许再次提出
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
      <section className={styles.memoryList} aria-label="需求 Wiki">
        <header>
          <div>
            <strong>需求 Wiki</strong>
            <p>每个完整目标保留一份高价值版本；你可以纠正或删除，它不会自动触发发布和联系。</p>
          </div>
        </header>
        {needWikiEntries.length ? needWikiEntries.map((item) => (
          <article key={item.id}>
            <header>
              <span>版本 {item.revision}</span>
              <em data-tone={item.status === 'active' ? 'positive' : 'neutral'}>
                {item.status === 'active' ? '当前目标' : '已归档'}
              </em>
            </header>
            {editingWikiId === item.id ? (
              <form
                className={styles.memoryEditForm}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!wikiTitle.trim() || !wikiSummary.trim()) return;
                  void execute(`${item.id}:wiki`, async () => {
                    if (await onUpdateNeedWiki(item.id, wikiTitle.trim(), wikiSummary.trim())) {
                      setEditingWikiId('');
                    }
                  });
                }}
              >
                <label><span>需求名称</span><input value={wikiTitle} maxLength={120} onChange={(event) => setWikiTitle(event.target.value)} /></label>
                <label><span>高价值摘要</span><textarea value={wikiSummary} maxLength={1500} onChange={(event) => setWikiSummary(event.target.value)} /></label>
                <div className={styles.inlineActions}>
                  <button type="submit" disabled={Boolean(busyAction) || !wikiTitle.trim() || !wikiSummary.trim()}>保存纠正</button>
                  <button type="button" disabled={Boolean(busyAction)} onClick={() => setEditingWikiId('')}>取消</button>
                </div>
              </form>
            ) : (
              <>
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
                <div className={styles.inlineActions}>
                  <button type="button" disabled={Boolean(busyAction)} onClick={() => {
                    setEditingWikiId(item.id);
                    setWikiTitle(item.title);
                    setWikiSummary(item.summary);
                  }}><FiEdit3 /> 修正</button>
                  <button type="button" disabled={Boolean(busyAction)} onClick={() => void execute(`${item.id}:wiki-delete`, async () => {
                    await onDeleteNeedWiki(item.id);
                  })}><FiTrash2 /> 删除</button>
                </div>
              </>
            )}
          </article>
        )) : <p className={styles.emptyState}>完整需求会自动整理到这里；零散聊天不会写成 Wiki。</p>}
      </section>
      <section className={styles.memoryList} aria-label="能力档案">
        <header>
          <div>
            <strong>我能提供什么</strong>
            <p>能力档案用于需求—能力匹配，不再只用兴趣相似度。专业服务和机构资质仍需人工审核。</p>
          </div>
        </header>
        <article>
          <form
            className={styles.memoryEditForm}
            onSubmit={(event) => {
              event.preventDefault();
              const capabilities = capabilityText.split(/[、,，\n]/).map((item) => item.trim()).filter(Boolean);
              const serviceModes = capabilityModes.split(/[、,，\n]/).map((item) => item.trim()).filter(Boolean);
              if (!capabilityName.trim() || !capabilityDomain.trim() || !capabilities.length) return;
              const existing = capabilityOfferings[0];
              void execute('capability-save', async () => {
                await onSaveCapability({
                  id: existing?.id,
                  displayName: capabilityName.trim(),
                  domain: capabilityDomain.trim(),
                  capabilities,
                  serviceModes,
                  city: capabilityCity.trim() || null,
                  acceptsNewRequests,
                });
              });
            }}
          >
            <label><span>展示名称</span><input value={capabilityName} maxLength={120} onChange={(event) => setCapabilityName(event.target.value)} /></label>
            <label><span>能力领域</span><input value={capabilityDomain} maxLength={120} placeholder="例如 education.tutoring" onChange={(event) => setCapabilityDomain(event.target.value)} /></label>
            <label><span>具体能力</span><textarea value={capabilityText} maxLength={800} placeholder="例如 初中数学、英语口语、大型犬照护" onChange={(event) => setCapabilityText(event.target.value)} /></label>
            <label><span>服务方式</span><input value={capabilityModes} maxLength={240} placeholder="线上、线下、上门" onChange={(event) => setCapabilityModes(event.target.value)} /></label>
            <label><span>所在城市</span><input value={capabilityCity} maxLength={120} onChange={(event) => setCapabilityCity(event.target.value)} /></label>
            <label>
              <span>接受新需求</span>
              <input type="checkbox" checked={acceptsNewRequests} onChange={(event) => setAcceptsNewRequests(event.target.checked)} />
            </label>
            <button type="submit" disabled={Boolean(busyAction) || !capabilityName.trim() || !capabilityText.trim()}>
              {busyAction === 'capability-save' ? '正在保存…' : capabilityOfferings[0] ? '更新能力档案' : '创建能力档案'}
            </button>
            {capabilityOfferings[0] ? (
              <small>当前状态：{capabilityOfferings[0].status} · 版本 {capabilityOfferings[0].revision}</small>
            ) : null}
          </form>
        </article>
      </section>
      {error ? (
        <div className={styles.memoryLoadError} role="alert">
          <span>{error}</span>
          <button type="button" disabled={loading} onClick={() => void onRetry()}>
            {loading ? <FiRefreshCw /> : null} 重新同步
          </button>
        </div>
      ) : null}
      <section className={styles.memoryList}>
        {loading && !memories.length ? (
          <p className={styles.emptyState} role="status">正在同步你的画像与使用边界…</p>
        ) : memories.length ? (
          memories.map((memory) => {
            const confirmed = ['confirmed', 'active'].includes(memory.status.toLowerCase());
            const memoryActions = memoryDecisionActions(memory.status);
            const sensitivity = memorySensitivityPresentation(memory.sensitivity);
            const evidence = memoryEvidenceText(memory.evidence);
            const scope = scopeDrafts[memory.id] ?? defaultMemoryUseScope(memory);
            const scopePresentation = memoryUseScopePresentation(scope);
            const busy = busyAction.startsWith(`${memory.id}:`);
            const actionsLocked = Boolean(busyAction);
            const usage = usageByMemory[memory.id];
            const confirming = confirmingAction?.id === memory.id ? confirmingAction.kind : null;
            return (
              <article key={memory.id} aria-busy={busy}>
                <header>
                  <span>{memoryTypeLabel(memory.memoryType)}</span>
                  <em data-tone={confirmed ? 'positive' : sensitivity.tone}>{memoryStatusLabel(memory.status)}</em>
                </header>
                {editingId === memory.id ? (
                  <form
                    className={styles.memoryEditForm}
                    onSubmit={(event) => {
                      event.preventDefault();
                      const nextValue = editValue.trim();
                      if (!nextValue) return;
                      void execute(`${memory.id}:edit`, async () => {
                        if (await onUpdate(memory.id, { value: nextValue })) setEditingId('');
                      });
                    }}
                  >
                    <label>
                      <span>纠正这条画像</span>
                      <textarea
                        value={editValue}
                        maxLength={240}
                        autoFocus
                        onChange={(event) => setEditValue(event.target.value)}
                      />
                    </label>
                    <div className={styles.inlineActions}>
                      <button type="submit" disabled={!editValue.trim() || actionsLocked}>保存纠正</button>
                      <button type="button" disabled={actionsLocked} onClick={() => setEditingId('')}>取消</button>
                    </div>
                  </form>
                ) : (
                  <strong>{memory.value || memory.summary || '未填写'}</strong>
                )}
                <dl className={styles.memoryMetadata}>
                  <div><dt>信息来源</dt><dd>{memorySourceLabel(memory.source)}</dd></div>
                  <div><dt>提取把握</dt><dd>{memoryConfidenceLabel(memory.confidence)}</dd></div>
                  <div><dt>敏感等级</dt><dd data-tone={sensitivity.tone}>{sensitivity.label}</dd></div>
                  <div><dt>使用范围</dt><dd>{scopePresentation.label}</dd></div>
                  <div><dt>最后更新</dt><dd>{formatMemoryDate(memory.updatedAt || memory.createdAt)}</dd></div>
                  {memory.userConfirmedAt ? <div><dt>由你确认</dt><dd>{formatMemoryDate(memory.userConfirmedAt)}</dd></div> : null}
                  {memory.expiresAt ? <div><dt>有效期至</dt><dd>{formatMemoryDate(memory.expiresAt)}</dd></div> : null}
                </dl>
                {(evidence.length || memory.sourceConversationId) ? (
                  <details className={styles.memoryEvidence}>
                    <summary>为什么会出现</summary>
                    {evidence.map((item) => <blockquote key={item}>“{item}”</blockquote>)}
                    {memory.sourceConversationId ? (
                      <Link href={`/agent/try/chat/${encodeURIComponent(memory.sourceConversationId)}`}>
                        查看来源对话
                      </Link>
                    ) : null}
                  </details>
                ) : null}
                <label className={styles.memoryScopeField}>
                  <span>这条画像可以用于</span>
                  <select
                    value={scope}
                    disabled={actionsLocked}
                    onChange={(event) => {
                      const nextScope = event.target.value as AgentMemoryUseScope;
                      const previousScope = scope;
                      setScopeDrafts((current) => ({ ...current, [memory.id]: nextScope }));
                      if (!memoryCanChangeScope(memory.status)) return;
                      void execute(`${memory.id}:scope`, async () => {
                        if (!(await onUpdate(memory.id, { useScope: nextScope })))
                          setScopeDrafts((current) => ({ ...current, [memory.id]: previousScope }));
                      });
                    }}
                  >
                    {agentMemoryUseScopeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <small>
                    {scopePresentation.description}
                    {sensitivity.tone === 'caution' && ['agent_and_matching', 'matching_only'].includes(scope)
                      ? ' 选择后即明确授权这条敏感画像参与匹配。'
                      : ''}
                  </small>
                </label>
                <p className={styles.memoryBoundary}><FiShield /> {memoryBoundaryNotice(memory)}</p>
                {confirmed ? (
                  <div className={styles.memoryUsageDisclosure}>
                    <button
                      type="button"
                      aria-expanded={expandedUsageId === memory.id}
                      onClick={() => toggleUsage(memory.id)}
                    >
                      {expandedUsageId === memory.id ? '收起使用记录' : '查看在哪里用过'}
                    </button>
                    {expandedUsageId === memory.id ? (
                      <div className={styles.memoryUsagePanel}>
                        {usage?.loading && !usage.items.length ? <p role="status">正在读取真实使用记录…</p> : null}
                        {usage?.error ? (
                          <p role="alert">
                            {usage.error}
                            <button type="button" onClick={() => void loadUsage(memory.id)}>重试</button>
                          </p>
                        ) : null}
                        {usage && !usage.loading && !usage.error && !usage.items.length ? (
                          <p>尚未发现这条画像被 Agent 或匹配真正使用。</p>
                        ) : null}
                        {usage?.items.length ? (
                          <ol>
                            {usage.items.map((event) => {
                              const path = memoryUsagePath(event);
                              const content = (
                                <>
                                  <strong>{memoryUsagePurposeLabel(event.purpose)}</strong>
                                  <span>{memoryUsageContextLabel(event)} · {formatMemoryDate(event.createdAt)}</span>
                                </>
                              );
                              return <li key={event.id}>{path ? <Link href={path}>{content}</Link> : content}</li>;
                            })}
                          </ol>
                        ) : null}
                        {usage?.nextCursor ? (
                          <button
                            type="button"
                            disabled={usage.loading}
                            onClick={() => void loadUsage(memory.id, usage.nextCursor ?? undefined)}
                          >
                            {usage.loading ? '正在加载…' : '查看更多记录'}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className={`${styles.inlineActions} ${styles.memoryActions}`}>
                  {confirming ? (
                    <div className={styles.memoryConfirmAction} role="group" aria-label={confirming === 'delete' ? '确认删除记忆' : '确认禁止再次推断'}>
                      <span>{confirming === 'delete' ? '删除后将立即停止使用。' : `删除并不再推断“${memoryTypeLabel(memory.memoryType)}”？`}</span>
                      <button
                        type="button"
                        disabled={actionsLocked}
                        onClick={() => void execute(`${memory.id}:${confirming}`, async () => {
                          const succeeded = confirming === 'delete'
                            ? await onDelete(memory.id)
                            : await onSuppress(memory.id);
                          if (succeeded) setConfirmingAction(null);
                        })}
                      >确认</button>
                      <button type="button" disabled={actionsLocked} onClick={() => setConfirmingAction(null)}>取消</button>
                    </div>
                  ) : memoryActions.length ? (
                    <>
                      {memoryActions.includes('confirm') ? (
                        <button type="button" disabled={actionsLocked} aria-busy={busyAction === `${memory.id}:save`} onClick={() => void execute(`${memory.id}:save`, () => onSave(memory.id, scope, sensitivity.tone === 'caution'))}>
                          {busyAction === `${memory.id}:save` ? <FiRefreshCw /> : <FiCheck />} {memory.status === 'expired' ? '重新确认' : sensitivity.tone === 'caution' ? '确认保存敏感画像' : '确认保存'}
                        </button>
                      ) : null}
                      {confirmed && editingId !== memory.id ? (
                        <button type="button" disabled={actionsLocked} onClick={() => {
                          setEditingId(memory.id);
                          setEditValue(memory.value || memory.summary || '');
                        }}><FiEdit3 /> 纠正</button>
                      ) : null}
                      {memoryActions.includes('reject') ? (
                        <button type="button" disabled={actionsLocked} aria-busy={busyAction === `${memory.id}:reject`} onClick={() => void execute(`${memory.id}:reject`, () => onReject(memory.id))}>
                          {busyAction === `${memory.id}:reject` ? <FiRefreshCw /> : <FiX />} 不保存
                        </button>
                      ) : null}
                      {memoryActions.includes('delete') ? (
                        <button type="button" disabled={actionsLocked} onClick={() => setConfirmingAction({ id: memory.id, kind: 'delete' })}><FiTrash2 /> 删除</button>
                      ) : null}
                      <button type="button" disabled={actionsLocked} onClick={() => setConfirmingAction({ id: memory.id, kind: 'suppress' })}><FiLock /> 删除并不再推断此类</button>
                    </>
                  ) : <small>当前状态没有可执行操作。</small>}
                </div>
              </article>
            );
          })
        ) : !error ? (
          <p className={styles.emptyState}>
            目前没有待确认或已保存的画像。小福只会从你的原话中提出，并先交给你确认。
          </p>
        ) : null}
      </section>
      <p className={styles.memoryScopeNote}><FiInfo /> Agent 记忆、匹配资料和公开个人资料保持分开；当前页面不会自动公开资料，也不会替你发消息、加好友、邀请或组局。</p>
    </Sheet>
  );
}

function HistorySheet({
  threads,
  activeThreadId,
  onClose,
  onNew,
  onSelect,
}: {
  threads: AgentThread[];
  activeThreadId?: string;
  onClose: () => void;
  onNew: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <Sheet title="对话记录" onClose={onClose}>
      <p className={styles.sheetLead}>
        对话和需求草稿已同步到你的 FitMeet 账号；刷新或换到 iOS、微信端后都可继续。
      </p>
      <div className={styles.historyList}>
        {threads.length ? (
          threads.map((thread) => (
            <button type="button" key={thread.id} onClick={() => onSelect(thread.id)}>
              <strong>{thread.title}</strong>
              <p>{thread.preview || '等待你继续说说这个想法'}</p>
              <small>{thread.id === activeThreadId ? '当前对话' : '打开这段对话'}</small>
            </button>
          ))
        ) : (
          <p className={styles.emptyState}>还没有已保存的对话。</p>
        )}
      </div>
      <button type="button" className={styles.primaryButton} onClick={onNew}>
        开始新的对话
      </button>
    </Sheet>
  );
}

function EditProfileSheet({
  profile,
  onClose,
  onSave,
}: {
  profile: SocialProfile;
  onClose: () => void;
  onSave: (patch: Partial<SocialProfile>) => void;
}) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [city, setCity] = useState(profile.city);
  const [bio, setBio] = useState(profile.bio);
  return (
    <Sheet title="编辑资料" onClose={onClose}>
      <Field label="昵称">
        <input value={nickname} onChange={(event) => setNickname(event.target.value)} />
      </Field>
      <Field label="城市">
        <input value={city} onChange={(event) => setCity(event.target.value)} />
      </Field>
      <Field label="介绍">
        <textarea value={bio} onChange={(event) => setBio(event.target.value)} />
      </Field>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={() => onSave({ nickname, city, bio })}
      >
        保存资料
      </button>
    </Sheet>
  );
}

function PrivacySheet({
  profile,
  onClose,
  onSave,
}: {
  profile: SocialProfile;
  onClose: () => void;
  onSave: (patch: Partial<SocialProfile>) => void;
}) {
  const [draft, setDraft] = useState(profile);
  return (
    <Sheet title="隐私设置" onClose={onClose}>
      <p className={styles.sheetLead}>
        <FiShield /> 控制推荐曝光和约练提醒，不展示精确位置。
      </p>
      {[
        ['profileDiscoverable', '附近推荐', '只使用模糊区域，不展示精确位置'],
        ['agentCanRecommendMe', '允许小福推荐我', '仅在你公开的兴趣和边界内推荐'],
        ['agentCanStartChatAfterApproval', '确认后可开启私信', '需双方已接受关系或邀请'],
        ['hideSensitiveTags', '隐藏敏感标签', '资料页不展示敏感偏好'],
      ].map(([key, title, copy]) => (
        <label className={styles.switchRow} key={key}>
          <span>
            <strong>{title}</strong>
            <small>{copy}</small>
          </span>
          <input
            type="checkbox"
            checked={Boolean(draft[key as keyof SocialProfile])}
            onChange={(event) =>
              setDraft((current) => ({ ...current, [key]: event.target.checked }))
            }
          />
          <i />
        </label>
      ))}
      <button type="button" className={styles.primaryButton} onClick={() => onSave(draft)}>
        保存隐私设置
      </button>
    </Sheet>
  );
}

function SettingsSheet({
  notificationEnabled,
  notificationPreferenceSyncing,
  onNotification,
  onClose,
  onReset,
  onSafety,
}: {
  notificationEnabled: boolean;
  notificationPreferenceSyncing: boolean;
  onNotification: (value: boolean) => void;
  onClose: () => void;
  onReset: () => void;
  onSafety: () => void;
}) {
  return (
    <Sheet title="设置" onClose={onClose}>
      <label className={styles.switchRow}>
        <span>
          <strong>通知设置</strong>
          <small>{notificationPreferenceSyncing ? '正在同步账号偏好…' : '私信、互动和系统提醒跨设备同步'}</small>
        </span>
        <input
          type="checkbox"
          checked={notificationEnabled}
          disabled={notificationPreferenceSyncing}
          onChange={(event) => onNotification(event.target.checked)}
        />
        <i />
      </label>
      <div className={styles.settingsActions}>
        <button type="button" onClick={onSafety}>
          <FiFlag /> 举报与安全帮助
        </button>
        <button type="button" onClick={onReset}>
          <FiSliders /> 重新完善资料
        </button>
      </div>
      <p className={styles.sheetSafety}>
        <FiShield /> 站内通知历史和账号偏好由服务端保存；网页关闭后的系统级推送仍取决于浏览器权限。
      </p>
    </Sheet>
  );
}

function RelationshipSheet({
  incoming,
  outgoing,
  onClose,
  onAction,
}: {
  incoming: FitMeetConnectionRequest[];
  outgoing: FitMeetConnectionRequest[];
  onClose: () => void;
  onAction: (request: FitMeetConnectionRequest, action: 'accept' | 'reject' | 'cancel') => void;
}) {
  return (
    <Sheet title="我的关系" onClose={onClose}>
      <p className={styles.sheetLead}>
        关系申请、接受与拒绝都由服务端写入；没有任何动作会替你自动完成。
      </p>
      {incoming.length
        ? incoming.map((request) => (
            <article className={styles.relationshipCard} key={request.id}>
              <Avatar name={request.requesterName || 'F'} color="#9d7df2" size={56} />
              <div>
                <strong>{request.requesterName || 'FitMeet 用户'}</strong>
                <p>{request.message || '想先从共同兴趣开始聊聊。'}</p>
              </div>
              <div className={styles.inlineActions}>
                <button type="button" onClick={() => onAction(request, 'accept')}>
                  接受
                </button>
                <button type="button" onClick={() => onAction(request, 'reject')}>
                  拒绝
                </button>
              </div>
            </article>
          ))
        : null}
      {outgoing.length
        ? outgoing.map((request) => (
            <article className={styles.relationshipCard} key={request.id}>
              <Avatar name={request.targetName || 'F'} color="#7790e8" size={56} />
              <div>
                <strong>{request.targetName || 'FitMeet 用户'}</strong>
                <p>等待对方决定；在接受前不会开放连续私信。</p>
              </div>
              <button type="button" onClick={() => onAction(request, 'cancel')}>
                撤回
              </button>
            </article>
          ))
        : null}
      {!incoming.length && !outgoing.length ? (
        <p className={styles.emptyState}>
          还没有待处理的关系申请。你可以从真实候选人页先发起申请。
        </p>
      ) : null}
      <p className={styles.sheetSafety}>
        <FiShield /> 好友关系、邀请和会话权限由服务端状态决定；拒绝、取消或拉黑都不会开放聊天。
      </p>
    </Sheet>
  );
}

function MeetLifecycleSheet({
  meet,
  demand,
  onClose,
  onUpdate,
}: {
  meet: MeetViewModel;
  demand: DemandViewModel;
  onClose: () => void;
  onUpdate: (status: MeetViewStatus, review?: MeetViewModel['review']) => void;
}) {
  return (
    <Sheet title="活动闭环" onClose={onClose}>
      <p className={styles.sheetLead}>
        开始前提醒、确认到达、完成活动、爽约和评价都会改变状态；不会被悄悄跳过。
      </p>
      <article className={styles.detailCard}>
        <span>当前状态</span>
        <strong>
          {meet.status === 'scheduled'
            ? '等待出发'
            : meet.status === 'arrived'
              ? '已确认到达'
              : meet.status === 'completed'
                ? '已完成活动'
                : meet.status === 'no_show'
                  ? '已记录爽约'
                  : meet.status === 'cancelled'
                    ? '已取消'
                    : '尚未建立'}
        </strong>
        <p>
          {demand.timeWindow} · {demand.locationText} · {demand.privacyBoundary}
        </p>
      </article>
      {meet.status === 'scheduled' ? (
        <div className={styles.lifecycleGrid}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => onUpdate('arrived')}
          >
            确认到达
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => onUpdate('cancelled')}
          >
            取消活动
          </button>
        </div>
      ) : null}
      {meet.status === 'arrived' ? (
        <div className={styles.lifecycleGrid}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => onUpdate('completed')}
          >
            完成活动
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => onUpdate('no_show')}
          >
            报告爽约
          </button>
        </div>
      ) : null}
      {meet.status === 'completed' && !meet.review ? (
        <div className={styles.reviewChoices}>
          <p>这次活动感觉如何？</p>
          {(['守约', '愉快', '不合适'] as const).map((review) => (
            <button type="button" key={review} onClick={() => onUpdate('completed', review)}>
              {review}
            </button>
          ))}
        </div>
      ) : null}
      {meet.review ? (
        <p className={styles.statusRow}>
          <FiCheck /> 已提交「{meet.review}」评价；不会公开你的私人感受。
        </p>
      ) : null}
      {meet.status === 'no_show' ? (
        <p className={styles.sheetSafety}>
          <FiShield />{' '}
          已记录。若涉及人身安全或持续骚扰，请使用安全帮助；否则你也可以只结束这次活动。
        </p>
      ) : null}
    </Sheet>
  );
}

function SafetySheet({
  onClose,
  onReport,
  onBlock,
}: {
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
}) {
  return (
    <Sheet title="安全帮助" onClose={onClose}>
      <p className={styles.sheetLead}>
        如果有人让你不舒服、绕过边界或出现安全风险，先停止互动。你不需要解释原因。
      </p>
      <div className={styles.stackActions}>
        <button type="button" className={styles.secondaryButton} onClick={onReport}>
          <FiFlag /> 记录安全帮助请求
        </button>
        <button type="button" className={styles.dangerButton} onClick={onBlock}>
          拉黑并停止推荐
        </button>
      </div>
      <p className={styles.sheetSafety}>
        <FiShield /> 举报写入统一安全审核接口；拉黑会立即停止推荐与后续互动。
      </p>
    </Sheet>
  );
}

function AccountSafetySheet({
  profile,
  photos,
  onClose,
  onPrivacy,
  onRelationships,
}: {
  profile: SocialProfile;
  photos: FitMeetProfilePhoto[];
  onClose: () => void;
  onPrivacy: () => void;
  onRelationships: () => void;
}) {
  const approvedPhotos = photos.filter(
    (photo) => (photo.moderationStatus ?? photo.moderation_status ?? 'approved') === 'approved',
  ).length;
  return (
    <Sheet title="账号与安全" onClose={onClose}>
      <p className={styles.sheetLead}>
        这里管理当前账号的资料安全与互动边界，不会默认举报任何候选人。
      </p>
      <div className={styles.accountSafetyGrid}>
        <span>
          <FiShield />
          <strong>资料状态</strong>
          <small>{profile.profileDiscoverable ? '可被发现' : '已隐藏'}</small>
        </span>
        <span>
          <FiImage />
          <strong>照片审核</strong>
          <small>{approvedPhotos} 张已通过</small>
        </span>
        <span>
          <FiLock />
          <strong>敏感标签</strong>
          <small>{profile.hideSensitiveTags ? '已保护' : '标准展示'}</small>
        </span>
        <span>
          <FiMessageCircle />
          <strong>聊天权限</strong>
          <small>双方确认后开放</small>
        </span>
      </div>
      <div className={styles.settingsActions}>
        <button type="button" onClick={onPrivacy}>
          <FiEye /> 检查隐私与推荐范围
        </button>
        <button type="button" onClick={onRelationships}>
          <FiUsers /> 管理好友与关系申请
        </button>
      </div>
      <p className={styles.sheetSafety}>
        <FiShield />{' '}
        精确位置与联系方式不会出现在公开资料；举报和拉黑需要从具体用户或动态进入并再次确认。
      </p>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
    </label>
  );
}
