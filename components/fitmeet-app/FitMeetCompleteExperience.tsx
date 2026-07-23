"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiAlertTriangle, FiArrowUp, FiBell, FiBookOpen, FiBookmark, FiCalendar, FiCheck, FiChevronRight, FiClock, FiCompass, FiEdit3, FiEye, FiFileText, FiFlag, FiHeart, FiHome, FiImage, FiLock, FiMapPin, FiMessageCircle, FiMic, FiMoreHorizontal, FiPlus, FiSearch, FiSend, FiSettings, FiShield, FiSliders, FiStar, FiTrash2, FiUser, FiUserPlus, FiUsers, FiX,
} from "react-icons/fi";
import type { AgentInboxEvent, AgentThread, AgentThreadDetail, AgentThreadEntry, BlockedUserRecord, ConversationMessage, DemandDraftSession, FeedPost, FitMeetAgentMemory, FitMeetConnectionRequest, FitMeetConversation, FitMeetConversationMessage, FitMeetDemand, FitMeetIntentApplication, FitMeetProfilePhoto, FitMeetPublicIntent, MeetInvitation, OnboardingPayload, PublicUserProfile, RelationshipState, SocialProfile } from "@/lib/fitmeet-api-contract";
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
} from "@/lib/fitmeet-experience-models";
import {
  demandStatusCopy,
  displayCandidate,
  displayDemand,
  displayDraftSession,
  effectiveDemandStatus,
  type LiveCandidate,
} from "@/lib/fitmeet-agent-domain";
import {
  agentDraftCanRenderCard,
  agentReplySuggestions,
  agentTurnNotice,
  canonicalAgentDraftCardPatch,
  demandLifecyclePrompt,
  latestAgentToolProposal,
  mergeAgentDraftEdits,
  preferredAgentThread,
  reconcileAgentReplyWithDraft,
  reconcileExplicitDraftAnswer,
  repairDraftAfterLifecycleTurn,
  type DemandLifecycleAction,
} from "@/lib/fitmeet-agent-thread-state";
import { FitMeetApiError } from "@/lib/fitmeet-api-client";
import { OnboardingFlow } from "./OnboardingFlow";
import { InternalTesterLogin } from "./InternalTesterLogin";
import { FitMeetBrandIcon } from "./FitMeetBrandIcon";
import { CandidateProfileExperience } from "./CandidateProfileExperience";
import { MessagesExperience } from "./MessagesExperience";
import { MomentsExperience } from "./MomentsExperience";
import { ProfileExperience } from "./ProfileExperience";
import { useFitMeetSession } from "./useFitMeetSession";
import { useFitMeetRealtime, type FitMeetRealtimeEvent } from "./useFitMeetRealtime";
import { useBrowserVoiceInput } from "./useBrowserVoiceInput";
import { useAccessibleDialog } from "./useAccessibleDialog";
import styles from "./fitmeet-complete.module.css";

type TabId = "home" | "moments" | "messages" | "profile";
type Overlay = "candidate" | "demand" | "demandList" | "demandEdit" | "invitation" | "composer" | "conversation" | "memory" | "editProfile" | "privacy" | "settings" | "relationships" | "meet" | "safety" | "accountSafety" | "history" | "toolApproval" | null;
type ChatLine = { id: string | number; role: "assistant" | "user"; text: string };
type MomentDraftImage = { id: string; file: File; preview: string };

const tabs: Array<{ id: TabId; label: string; icon: typeof FiHome }> = [
  { id: "home", label: "首页", icon: FiHome },
  { id: "moments", label: "发现", icon: FiCompass },
  { id: "messages", label: "消息", icon: FiMessageCircle },
  { id: "profile", label: "我的", icon: FiUser },
];

const initialChat: ChatLine[] = [
  { id: 1, role: "assistant", text: "嗨，我是小福。你可以从一个模糊的想法开始，我会先帮你理解和整理，不会替你联系或安排任何人。" },
];

const quickAgentPrompts = [
  "周末想找人 Citywalk 后喝杯咖啡",
  "有件事想先和你聊聊，不创建卡片",
  "我有一个还没想清楚的现实需求",
];

const emptyProfile: SocialProfile = {
  nickname: "内测用户",
  city: "",
  bio: "",
  interests: [],
  distanceKm: 5,
  profileDiscoverable: true,
  agentCanRecommendMe: true,
  agentCanStartChatAfterApproval: false,
  hideSensitiveTags: true,
};

function chatFromAgentEntries(entries: AgentThreadEntry[]): ChatLine[] {
  return entries
    .filter((entry) => entry.kind === "message" && (entry.role === "user" || entry.role === "assistant") && entry.content)
    .map((entry) => ({ id: entry.id, role: entry.role as "user" | "assistant", text: entry.content || "" }));
}

function notificationPreferenceKey(userId: number | undefined) {
  return userId ? `fitmeet:web-foreground-notifications:${userId}` : null;
}

function likedMomentsKey(userId: number) {
  return `fitmeet:web-liked-moments:v1:${userId}`;
}

function blockedUsersKey(userId: number) {
  return `fitmeet:web-blocked-users:v1:${userId}`;
}

function closedConversationsKey(userId: number) {
  return `fitmeet:web-closed-conversations:v1:${userId}`;
}

function readStoredArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value as T[] : [];
  } catch { return []; }
}

function writeStoredArray(key: string, value: unknown[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

function displayConversationMessage(message: FitMeetConversationMessage, currentUserId?: number): ConversationMessage {
  const mine = typeof message.isMine === "boolean" ? message.isMine : Number(message.senderId) === Number(currentUserId);
  const recalled = message.lifecycleStatus === "recalled" || Boolean(message.recalledAt);
  return {
    id: message.id,
    role: mine ? "user" : "peer",
    text: recalled ? mine ? "你撤回了一条消息" : "对方撤回了一条消息" : message.text || message.body?.text || "",
    createdAt: message.createdAt,
    senderId: message.senderId,
    readByOther: message.readByOther,
    status: message.status,
    lifecycleStatus: message.lifecycleStatus,
    recalledAt: message.recalledAt,
  };
}

function conversationPeerId(conversation: FitMeetConversation | null | undefined) {
  return Number(conversation?.userId ?? conversation?.peer?.id) || null;
}

function agentEntriesForDetail(detail: AgentThreadDetail) {
  const draft = detail.activeDraft;
  const latestAssistantSequence = detail.entries.reduce((latest, entry) => (
    entry.kind === "message" && entry.role === "assistant"
      ? Math.max(latest, entry.sequence)
      : latest
  ), -1);
  const normalizedEntries = detail.entries.map((entry) => {
    if (draft && entry.kind === "message" && entry.role === "assistant" && entry.sequence === latestAssistantSequence) {
      return { ...entry, content: reconcileAgentReplyWithDraft(entry.content, draft) };
    }
    if (entry.toolName !== "classify_demand" || !draft?.demandType) return entry;
    const label = draft.demandType === "buddy" ? "搭子 / 交友" : draft.demandType === "workout" ? "运动约练" : draft.demandType;
    return { ...entry, content: `已按当前远端草稿归类为「${label}」需求。` };
  });
  if (!draft?.userConfirmedGenerate || normalizedEntries.some((entry) => entry.toolName === "generate_demand_card")) return normalizedEntries;
  const latestSequence = normalizedEntries.reduce((maximum, entry) => Math.max(maximum, entry.sequence || 0), 0);
  return [...normalizedEntries, {
    id: `derived-demand-card-${draft.id}-${draft.updatedAt}`,
    threadId: detail.thread.id,
    sequence: latestSequence + 1,
    kind: "tool_resolution",
    role: null,
    content: "需求卡已经按你的明确要求生成；当前仍未发布。",
    toolName: "generate_demand_card",
    toolStatus: "completed",
    payload: { derivedFromRemoteDraft: true, draftSessionId: draft.id },
    clientTurnId: null,
    createdAt: draft.updatedAt,
    updatedAt: draft.updatedAt,
  } satisfies AgentThreadEntry];
}

function Avatar({ name, color = "#677cf2", size = 42 }: { name: string; color?: string; size?: number }) {
  return <span className={styles.avatar} style={{ width: size, height: size, "--avatar-color": color } as React.CSSProperties}>{name.slice(0, 1)}</span>;
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  const dialogRef = useAccessibleDialog(true, onClose);
  return <div className={styles.sheetShade} role="presentation" onMouseDown={onClose}><section ref={dialogRef} tabIndex={-1} className={styles.sheet} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><div className={styles.sheetHandle} /><header><h2>{title}</h2><button type="button" aria-label="关闭" onClick={onClose}><FiX /></button></header>{children}</section></div>;
}

export function FitMeetCompleteExperience({ initialSurface = "main" }: { initialSurface?: "main" | "onboarding" }) {
  const session = useFitMeetSession();
  const [surface, setSurface] = useState<"main" | "onboarding">(initialSurface);
  const [agentOnlyMode, setAgentOnlyMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [toast, setToast] = useState("所有涉及别人和线下活动的动作，都要经过你的明确确认。");
  const [profile, setProfile] = useState<SocialProfile>(emptyProfile);
  const [chat, setChat] = useState<ChatLine[]>(initialChat);
  const [agentEntries, setAgentEntries] = useState<AgentThreadEntry[]>([]);
  const [agentThreads, setAgentThreads] = useState<AgentThread[]>([]);
  const [activeAgentThread, setActiveAgentThread] = useState<AgentThread | null>(null);
  const [activeDraftSession, setActiveDraftSession] = useState<DemandDraftSession | null>(null);
  const [selectedToolProposal, setSelectedToolProposal] = useState<AgentThreadEntry | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [agentSending, setAgentSending] = useState(false);
  const [demand, setDemand] = useState<DemandViewModel>(emptyDemandView);
  const [demands, setDemands] = useState<FitMeetDemand[]>([]);
  const [hasDemand, setHasDemand] = useState(false);
  const [candidates, setCandidates] = useState<LiveCandidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [inviteStatus, setInviteStatus] = useState<InvitationViewStatus>("none");
  const [relationship, setRelationship] = useState<RelationshipState>("none");
  const [meet, setMeet] = useState<MeetViewModel>({ id: 0, status: "none" });
  const [socialIntents, setSocialIntents] = useState<FitMeetPublicIntent[]>([]);
  const [taskIntents, setTaskIntents] = useState<FitMeetPublicIntent[]>([]);
  const [socialApplications, setSocialApplications] = useState<FitMeetIntentApplication[]>([]);
  const [taskApplications, setTaskApplications] = useState<FitMeetIntentApplication[]>([]);
  const [ownerSocialApplications, setOwnerSocialApplications] = useState<FitMeetIntentApplication[]>([]);
  const [ownerTaskApplications, setOwnerTaskApplications] = useState<FitMeetIntentApplication[]>([]);
  const [agentInboxEvents, setAgentInboxEvents] = useState<AgentInboxEvent[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [feedLastPage, setFeedLastPage] = useState(1);
  const [profilePhotos, setProfilePhotos] = useState<FitMeetProfilePhoto[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
  const [postText, setPostText] = useState("");
  const [postImages, setPostImages] = useState<MomentDraftImage[]>([]);
  const [postPublishing, setPostPublishing] = useState(false);
  const [discoverChannel, setDiscoverChannel] = useState<"moments" | "social" | "tasks">("moments");
  const [memories, setMemories] = useState<FitMeetAgentMemory[]>([]);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [conversationInput, setConversationInput] = useState("");
  const [conversations, setConversations] = useState<FitMeetConversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState<FitMeetConversation | null>(null);
  const [invitations, setInvitations] = useState<MeetInvitation[]>([]);
  const [incomingConnections, setIncomingConnections] = useState<FitMeetConnectionRequest[]>([]);
  const [outgoingConnections, setOutgoingConnections] = useState<FitMeetConnectionRequest[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserRecord[]>([]);
  const [closedConversationIds, setClosedConversationIds] = useState<string[]>([]);
  const [liveDemand, setLiveDemand] = useState<{ id: string } | null>(null);
  const conversationSyncing = useRef(false);
  const activeAgentThreadIdRef = useRef<string | null>(null);
  const agentThreadSwitchingRef = useRef(false);
  const api = session.api;
  const liveApi = session.state.status === "authenticated";
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) ?? candidates[0];
  const activeCandidates = candidates.filter((candidate) => candidate.decision !== "dismissed");
  const selectedCandidateInvitation = selectedCandidate && liveDemand
    ? invitations.find((invitation) => invitation.demandId === liveDemand.id && Number(invitation.inviteeUserId) === Number(selectedCandidate.candidateUserId))
    : undefined;
  const selectedCandidateInviteStatus: InvitationViewStatus = inviteStatus === "draft"
    ? "draft"
    : selectedCandidateInvitation?.status === "pending"
      ? "sent"
      : selectedCandidateInvitation?.status ?? "none";
  const visibleConversations = conversations.filter((item) => !closedConversationIds.includes(item.id));
  const selectedConversationClosed = Boolean(selectedConversation && closedConversationIds.includes(selectedConversation.id));
  const notice = useCallback((message: string) => setToast(message), []);
  const voiceInput = useBrowserVoiceInput((transcript) => {
    setChatInput((current) => [current.trim(), transcript].filter(Boolean).join(current.trim() ? "，" : ""));
    setActiveTab("home");
    notice("已转成文字；你可以先检查，再决定是否发送给小福。");
  });

  const applyAgentDetail = useCallback((detail: AgentThreadDetail, presentDraft = false) => {
    activeAgentThreadIdRef.current = detail.thread.id;
    setActiveAgentThread(detail.thread);
    setAgentThreads((current) => [detail.thread, ...current.filter((thread) => thread.id !== detail.thread.id)]);
    const normalizedEntries = agentEntriesForDetail(detail);
    setAgentEntries(normalizedEntries);
    const nextChat = chatFromAgentEntries(normalizedEntries);
    setChat(nextChat.length ? nextChat : initialChat);
    setActiveDraftSession(detail.activeDraft);
    if (detail.activeDraft && presentDraft) {
      setDemand(displayDraftSession(detail.activeDraft));
      setHasDemand(agentDraftCanRenderCard(detail.activeDraft));
      setLiveDemand(null);
      setCandidates([]);
      setSelectedCandidateId(null);
    } else if (presentDraft) {
      setDemand(emptyDemandView);
      setHasDemand(false);
      setLiveDemand(null);
      setCandidates([]);
      setSelectedCandidateId(null);
    }
  }, []);

  const loadAgentThread = useCallback(async (threadId: string, presentDraft = false) => {
    let detail = await api.getAgentThread(threadId);
    if (detail.activeDraft?.status === "cardGenerated") {
      const canonical = canonicalAgentDraftCardPatch(detail.activeDraft);
      const fieldsChanged = JSON.stringify(canonical.knownFields) !== JSON.stringify(detail.activeDraft.knownFields);
      if (fieldsChanged || canonical.category !== detail.activeDraft.category) {
        await api.updateDemandDraftSession(detail.activeDraft.id, canonical);
        detail = await api.getAgentThread(threadId);
      }
    }
    applyAgentDetail(detail, presentDraft);
    return detail;
  }, [api, applyAgentDetail]);

  const activateDemand = useCallback(async (record: FitMeetDemand, openDetail = false) => {
    setDemand(displayDemand(record));
    setHasDemand(true);
    setLiveDemand({ id: record.id });
    setInviteStatus("none");
    setSelectedCandidateId(null);
    if (["cancelled", "canceled", "closed"].includes(record.status)) {
      setCandidates([]);
    } else {
      try {
        const page = await api.listDemandCandidates(record.id);
        const resolvedDemand = page.demand ?? record;
        const nextCandidates = page.candidates.map(displayCandidate);
        setDemand(displayDemand(resolvedDemand));
        setDemands((current) => [resolvedDemand, ...current.filter((item) => item.id !== resolvedDemand.id)]);
        setCandidates(nextCandidates);
        setSelectedCandidateId(nextCandidates[0]?.id ?? null);
      } catch (reason) {
        setCandidates([]);
        notice(reason instanceof Error ? reason.message : "这条需求的候选人暂时无法同步。");
      }
    }
    if (openDetail) setOverlay("demand");
  }, [api, notice]);

  const startNewDemand = useCallback(async () => {
    agentThreadSwitchingRef.current = true;
    try {
      const created = await api.createAgentThread();
      activeAgentThreadIdRef.current = created.thread.id;
      setLiveDemand(null);
      setHasDemand(false);
      setCandidates([]);
      setSelectedCandidateId(null);
      setInviteStatus("none");
      await loadAgentThread(created.thread.id, true);
      setOverlay(null);
      setActiveTab("home");
      notice("已开始一条新需求；之前的需求和匹配记录仍保留在账号中。");
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : "新的需求暂时无法创建。");
    } finally {
      agentThreadSwitchingRef.current = false;
    }
  }, [api, loadAgentThread, notice]);

  const ensureAgentThread = useCallback(async () => {
    if (activeAgentThread && activeAgentThread.id === activeAgentThreadIdRef.current) return activeAgentThread;
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
    const timer = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (session.state.status !== "authenticated") return;
    if (session.state.socialProfile) setProfile(session.state.socialProfile);
    if (!session.state.onboarding?.canUseSocialActions && !agentOnlyMode) {
      setSurface("onboarding");
    }
  }, [agentOnlyMode, session.state.onboarding?.canUseSocialActions, session.state.socialProfile, session.state.status]);

  useEffect(() => {
    if (session.state.status !== "authenticated" || typeof window === "undefined") return;
    const userId = session.state.session?.user.id;
    const key = notificationPreferenceKey(userId);
    setNotificationEnabled(!key || window.localStorage.getItem(key) !== "false");
    if (userId) {
      setLikedPostIds(readStoredArray<number>(likedMomentsKey(userId)).filter((id) => Number.isInteger(id)));
      setBlockedUsers(readStoredArray<BlockedUserRecord>(blockedUsersKey(userId)).filter((item) => Number.isInteger(item?.id) && typeof item?.name === "string"));
      setClosedConversationIds(readStoredArray<string>(closedConversationsKey(userId)).filter((id) => typeof id === "string" && id));
    }
  }, [session.state.session?.user.id, session.state.status]);

  const updateNotificationPreference = async (enabled: boolean) => {
    if (enabled && typeof window !== "undefined" && "Notification" in window) {
      const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      if (permission !== "granted") {
        setNotificationEnabled(false);
        const deniedKey = notificationPreferenceKey(session.state.session?.user.id);
        if (deniedKey) window.localStorage.setItem(deniedKey, "false");
        notice("浏览器通知权限未开启；页面内实时消息仍会正常更新。");
        return;
      }
    }
    setNotificationEnabled(enabled);
    const key = notificationPreferenceKey(session.state.session?.user.id);
    if (key && typeof window !== "undefined") window.localStorage.setItem(key, String(enabled));
    notice(enabled ? "实时提醒已开启；页面打开或处于后台标签页时会提示，彻底关闭浏览器后不会推送。" : "前台实时提醒已关闭；不影响消息和邀请在服务端保存。");
  };

  const rememberClosedConversations = useCallback((ids: string[]) => {
    const validIds = ids.filter(Boolean);
    if (!validIds.length) return;
    setClosedConversationIds((current) => {
      const next = Array.from(new Set([...current, ...validIds]));
      const userId = session.state.session?.user.id;
      if (userId) writeStoredArray(closedConversationsKey(userId), next);
      return next;
    });
  }, [session.state.session?.user.id]);

  const restoreConversationAccess = useCallback((id: string) => {
    if (!id) return;
    setClosedConversationIds((current) => {
      const next = current.filter((item) => item !== id);
      const userId = session.state.session?.user.id;
      if (userId) writeStoredArray(closedConversationsKey(userId), next);
      return next;
    });
  }, [session.state.session?.user.id]);

  useEffect(() => {
    if (!liveApi) return;
    void (async () => {
      const results = await Promise.allSettled([
      api.getFeed(),
      api.listMyDemands(),
      api.listAgentMemories(),
      api.listMeetInvitations(),
      api.listConversations(),
      api.listConnectionRequests("inbox"),
      api.listConnectionRequests("outbox"),
      api.listAgentThreads(),
      api.listProfilePhotos(),
      api.getUnreadCount(),
      ] as const);
      const [feedResult, demandsResult, memoriesResult, invitationsResult, conversationsResult, inboxResult, outboxResult, threadsResult, photosResult, unreadResult] = results;
      if (feedResult.status === "fulfilled") { setPosts(feedResult.value.data); setFeedLastPage(feedResult.value.metadata?.lastPage ?? 1); }
      if (demandsResult.status === "fulfilled") setDemands(demandsResult.value.data);
      if (memoriesResult.status === "fulfilled") setMemories(memoriesResult.value.items ?? memoriesResult.value.data ?? []);
      if (invitationsResult.status === "fulfilled") setInvitations(invitationsResult.value);
      if (conversationsResult.status === "fulfilled") setConversations(conversationsResult.value);
      if (inboxResult.status === "fulfilled") setIncomingConnections(inboxResult.value);
      if (outboxResult.status === "fulfilled") setOutgoingConnections(outboxResult.value);
      if (photosResult.status === "fulfilled") setProfilePhotos(photosResult.value);
      if (unreadResult.status === "fulfilled") setUnreadCount(unreadResult.value.unreadCount ?? 0);
      const nextThreads = threadsResult.status === "fulfilled" ? threadsResult.value.items ?? threadsResult.value.data ?? [] : [];
      setAgentThreads(nextThreads);
      let hasRemoteDraft = false;
      try {
        const requestedThread = agentThreadSwitchingRef.current
          ? null
          : preferredAgentThread(nextThreads, activeAgentThreadIdRef.current);
        if (requestedThread) {
          const detail = await api.getAgentThread(requestedThread.id);
          hasRemoteDraft = Boolean(detail.activeDraft);
          applyAgentDetail(detail, hasRemoteDraft);
        } else if (threadsResult.status === "fulfilled" && !agentThreadSwitchingRef.current) {
          const created = await api.createAgentThread();
          activeAgentThreadIdRef.current = created.thread.id;
          applyAgentDetail(await api.getAgentThread(created.thread.id));
        }
      } catch (reason) {
        notice(reason instanceof Error ? reason.message : "小福历史暂时无法恢复。");
      }
      const myInvitations = invitationsResult.status === "fulfilled" ? invitationsResult.value : [];
      const acceptedInvitation = myInvitations.find((invitation) => invitation.status === "accepted" && (invitation.meetId || invitation.acceptedMeetId));
      if (acceptedInvitation) setMeet({ id: Number(acceptedInvitation.meetId || acceptedInvitation.acceptedMeetId), status: "scheduled" });
      const latest = demandsResult.status === "fulfilled" ? demandsResult.value.data[0] : undefined;
      if (latest && !hasRemoteDraft) await activateDemand(latest);
      if (results.every((result) => result.status === "rejected")) notice("未能同步你的 FitMeet 数据，请检查网络后重试。");
    })().catch((reason) => notice(reason instanceof Error ? reason.message : "未能同步你的 FitMeet 数据。"));
  }, [activateDemand, api, applyAgentDetail, liveApi, notice]);

  useEffect(() => {
    if (!liveApi) return;
    void Promise.all([
      api.listPublicSocialIntents(),
      api.listPublicTaskIntents(),
      api.listMyPublicIntentApplications("applicant"),
      api.listMyTaskIntentApplications("applicant"),
    ]).then(([nextSocial, nextTask, nextSocialApplications, nextTaskApplications]) => {
      setSocialIntents(nextSocial);
      setTaskIntents(nextTask);
      setSocialApplications(nextSocialApplications);
      setTaskApplications(nextTaskApplications);
    }).catch((reason) => notice(reason instanceof Error ? reason.message : "大厅内容暂时无法同步。"));
  }, [api, liveApi]);

  useEffect(() => {
    if (!liveApi) return;
    void Promise.all([
      api.getAgentInboxEvents(),
      api.listMyPublicIntentApplications("owner"),
      api.listMyTaskIntentApplications("owner"),
    ]).then(([events, socialOwnerApplications, taskOwnerApplications]) => {
      setAgentInboxEvents(events.items);
      setOwnerSocialApplications(socialOwnerApplications);
      setOwnerTaskApplications(taskOwnerApplications);
    }).catch((reason) => notice(reason instanceof Error ? reason.message : "消息事件暂时无法同步。"));
  }, [api, liveApi, notice]);

  const completeOnboarding = async (payload: OnboardingPayload) => {
    try {
      const onboarding = await api.completeOnboarding(payload);
      const [socialProfile, nextProfilePhotos] = await Promise.all([api.getSocialProfile(), api.listProfilePhotos()]);
      session.setOnboarding(onboarding);
      session.setSocialProfile(socialProfile);
      setProfile(socialProfile);
      setProfilePhotos(nextProfilePhotos);
      setAgentOnlyMode(false);
      notice("资料已保存。小福会按你的兴趣和边界提供建议。");
      setSurface("main");
      setActiveTab("home");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "资料暂未保存，请稍后再试。";
      notice(message);
      throw reason;
    }
  };

  const uploadProfilePhotos = async (files: File[]) => {
    if (files.length < 2) throw new Error("请至少选择 2 张清晰的本人照片。");
    const uploads = await Promise.all(files.map((file) => api.uploadImage(file)));
    const assetIds = uploads.map((upload) => upload.assetId ?? upload.asset_id ?? upload.id);
    if (assetIds.some((assetId) => !assetId)) throw new Error("照片上传没有返回有效资源，请重新上传。");
    return api.replaceProfilePhotos(assetIds.map((assetId, index) => ({ assetId: Number(assetId), sortOrder: index, isCover: index === 0 })));
  };

  const sendAgentMessage = async (message = chatInput) => {
    const text = message.trim();
    if (!text || agentSending) return;
    setAgentSending(true);
    setChatInput("");
    try {
      const thread = await ensureAgentThread();
      const turn = await api.sendAgentThreadTurn(thread.id, text);
      let detail = await api.getAgentThread(thread.id);
      const answerPatch = reconcileExplicitDraftAnswer(text, activeDraftSession, detail.activeDraft);
      if (answerPatch && detail.activeDraft) {
        await api.updateDemandDraftSession(detail.activeDraft.id, answerPatch);
      }
      detail = await loadAgentThread(thread.id, true);
      const feedback = agentTurnNotice({ executionMode: turn.executionMode, activeDraft: detail.activeDraft });
      if (feedback) notice(feedback);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "小福暂时无法回复，请稍后再试。";
      notice(message);
      setChatInput(text);
    } finally {
      setAgentSending(false);
    }
  };

  const startVoiceInput = () => {
    if (voiceInput.isListening) {
      voiceInput.stop();
      return;
    }
    if (!voiceInput.start()) notice(voiceInput.error || "当前浏览器不支持语音转文字，请改用文字输入。");
  };

  const prepareDemandDraft = async () => {
    try {
      const thread = await ensureAgentThread();
      const detail = await loadAgentThread(thread.id, true);
      if (!detail.activeDraft) return notice("先和小福说说你想一起做什么、什么时候或在意的边界；我会把内容保存为远端草稿。 ");
      setOverlay("demandEdit");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "需求草稿暂时无法恢复。 "); }
  };

  const saveDemandDraft = async (next: DemandViewModel) => {
    if (!activeDraftSession) return notice("这张草稿还没有同步到小福；请先发送一条需求描述。 ");
    const patch = mergeAgentDraftEdits(activeDraftSession, next);
    try {
      const saved = await api.updateDemandDraftSession(activeDraftSession.id, patch);
      setActiveDraftSession(saved);
      setDemand(displayDraftSession(saved));
      setHasDemand(agentDraftCanRenderCard(saved));
      setOverlay(null);
      notice(saved.missingFields.length ? `草稿已同步；小福接下来只会确认：${saved.missingFields[0]}。` : saved.status === "cardGenerated" ? "需求卡已更新；发布前仍可继续修改。" : "信息已整理好；请由你确认是否生成需求卡。");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "需求草稿未能保存。 "); }
  };

  const confirmDemandCardDraft = async () => {
    if (!activeDraftSession) return notice("这段需求还没有同步到小福；请先发送一条需求描述。 ");
    if (!activeDraftSession.canGenerateCard) return notice(`还差：${activeDraftSession.missingFields.join("、")}。补完后再由你决定是否生成需求卡。`);
    if (agentSending) return;
    setAgentSending(true);
    try {
      const thread = await ensureAgentThread();
      const proposal = latestAgentToolProposal(agentEntries, "generate_demand_card", ["ready_for_review"]);
      if (proposal) {
        await api.resolveAgentToolProposal(thread.id, proposal.id, "approve");
      } else {
        await api.sendAgentThreadTurn(thread.id, "我确认生成这张需求卡。");
      }
      const detail = await loadAgentThread(thread.id, true);
      if (!detail.activeDraft || !agentDraftCanRenderCard(detail.activeDraft)) {
        throw new Error("服务端尚未确认需求卡已生成，请继续补充小福提出的关键问题。");
      }
      setDemand(displayDraftSession(detail.activeDraft));
      setHasDemand(true);
      setOverlay("demand");
      notice("需求卡已生成，仍未发布。请核对后再决定是否开始匹配。");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "需求卡暂时无法生成。 "); }
    finally { setAgentSending(false); }
  };

  const requestAgentDemandLifecycle = async (action: DemandLifecycleAction) => {
    if (agentSending) return;
    setAgentSending(true);
    try {
      const thread = await ensureAgentThread();
      const stableDraft = activeDraftSession
        ? { ...activeDraftSession, knownFields: { ...activeDraftSession.knownFields }, missingFields: [...activeDraftSession.missingFields] }
        : null;
      if (action === "publish" && activeDraftSession?.status === "cardGenerated") {
        const canonical = canonicalAgentDraftCardPatch(activeDraftSession);
        await api.updateDemandDraftSession(activeDraftSession.id, canonical);
      }
      await api.sendAgentThreadTurn(thread.id, demandLifecyclePrompt(action));
      let detail = await api.getAgentThread(thread.id);
      const repair = repairDraftAfterLifecycleTurn(stableDraft, detail.activeDraft);
      if (repair && detail.activeDraft) {
        await api.updateDemandDraftSession(detail.activeDraft.id, repair);
      }
      detail = await loadAgentThread(thread.id, true);
      const proposal = latestAgentToolProposal(detail.entries, "press_demand_card_button", ["awaiting_confirmation", "failed"]);
      if (!proposal) {
        const lastAssistant = [...detail.entries]
          .sort((left, right) => right.sequence - left.sequence)
          .find((entry) => entry.kind === "message" && entry.role === "assistant" && entry.content);
        throw new Error(lastAssistant?.content || "小福还没有生成可确认的需求卡操作。");
      }
      setSelectedToolProposal(proposal);
      setOverlay("toolApproval");
      notice("小福已准备好这一步；只有你在确认页同意后才会执行。");
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : "小福暂时无法准备这项操作。");
    } finally {
      setAgentSending(false);
    }
  };

  const publishDemand = async () => {
    if (demand.status === "cancelled") return notice("这条需求已取消。你可以从新的想法重新开始，不需要勉强继续。");
    if (!session.state.onboarding?.canUseSocialActions) {
      setSurface("onboarding");
      return notice("完成资料和照片审核后，才能发布并匹配真实用户。你可以先继续和小福聊聊。 ");
    }
    if (!liveDemand) {
      await requestAgentDemandLifecycle("publish");
      return;
    }
    try {
      const created = await api.getDemand(liveDemand.id);
      const published = await api.publishDemand(created.id, created.category);
      const page = await api.listDemandCandidates(created.id);
      const nextCandidates = page.candidates.map(displayCandidate);
      setLiveDemand({ id: created.id });
      const resolvedDemand = page.demand ?? published;
      setDemands((current) => [resolvedDemand, ...current.filter((item) => item.id !== resolvedDemand.id)]);
      setDemand({ ...displayDemand(resolvedDemand), status: page.candidates.length ? "matched" : "matching" });
      setCandidates(nextCandidates);
      setSelectedCandidateId(nextCandidates[0]?.id ?? null);
      notice(page.candidates.length ? `已同步 ${page.candidates.length} 位真实候选人。` : "需求已发布，正在等待合适的候选人。");
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : "需求尚未发布，请稍后再试。");
    }
  };

  const changeDemandStatus = async (status: DemandViewModel["status"]) => {
    if (!liveDemand) {
      if (status === "cancelled" && activeDraftSession) {
        try {
          await api.cancelDemandDraftSession(activeDraftSession.id);
          setActiveDraftSession(null);
          setHasDemand(false);
          setDemand(emptyDemandView);
          setOverlay(null);
          if (activeAgentThread) await loadAgentThread(activeAgentThread.id);
          notice("这张未发布需求卡已取消；没有发布、匹配或联系任何人。");
        } catch (reason) {
          notice(reason instanceof Error ? reason.message : "取消需求草稿失败，请稍后再试。");
        }
        return;
      }
      return notice("这是一张还没有发布的草稿。你可以继续编辑，或确认后再开始匹配。");
    }
    if (status === "hidden") {
      try {
        const result = await api.hideDemand(liveDemand.id);
        setDemands((current) => [result, ...current.filter((item) => item.id !== result.id)]);
        setDemand(displayDemand(result));
        notice("匹配已暂停。");
      } catch (reason) { notice(reason instanceof Error ? reason.message : "暂停匹配失败，请稍后再试。"); }
    }
    if (status === "cancelled") {
      try {
        const result = await api.cancelDemand(liveDemand.id, "用户主动取消");
        setDemands((current) => [result, ...current.filter((item) => item.id !== result.id)]);
        setDemand(displayDemand(result));
        setCandidates([]);
        notice("需求已取消，后续匹配已停止。");
      } catch (reason) { notice(reason instanceof Error ? reason.message : "取消需求失败，请稍后再试。"); }
    }
  };

  const recordCandidate = (candidateId: number, decision: CandidateDecision) => {
    const candidate = candidates.find((item) => item.id === candidateId);
    if (!candidate || !liveDemand) return;
    void api.recordDemandCandidateBehavior(liveDemand.id, candidate.candidateRecordId, decision === "dismissed" ? "dismissed" : decision === "saved" ? "saved" : decision === "invited" ? "invited" : "viewed").then(() => {
      setCandidates((items) => items.map((item) => item.id === candidateId ? { ...item, decision } : item));
    }).catch((reason) => notice(reason instanceof Error ? reason.message : "候选人状态未保存，请稍后再试。"));
  };

  const dismissCandidate = () => {
    if (!selectedCandidate) return;
    recordCandidate(selectedCandidate.id, "dismissed");
    const next = candidates.find((candidate) => candidate.id !== selectedCandidate.id && candidate.decision !== "dismissed");
    if (next) setSelectedCandidateId(next.id);
    notice("已标记为不合适；不会向对方发送任何通知。");
  };

  const refreshCommunications = async () => {
    const [nextInvitations, nextConversations, nextUnread] = await Promise.all([api.listMeetInvitations(), api.listConversations(), api.getUnreadCount()]);
    setInvitations(nextInvitations);
    setConversations(nextConversations);
    setUnreadCount(nextUnread.unreadCount ?? 0);
  };

  const refreshConnections = async () => {
    const [inbox, outbox] = await Promise.all([api.listConnectionRequests("inbox"), api.listConnectionRequests("outbox")]);
    setIncomingConnections(inbox);
    setOutgoingConnections(outbox);
  };

  const resolveConnection = async (request: FitMeetConnectionRequest, action: "accept" | "reject" | "cancel") => {
    try {
      if (action === "accept") {
        await api.acceptConnectionRequest(request.id);
        setRelationship("friends");
        notice("已接受好友申请。双方已建立关系，可以开始聊天。");
      }
      if (action === "reject") {
        await api.rejectConnectionRequest(request.id);
        notice("已拒绝这次好友申请；不会打开私信。");
      }
      if (action === "cancel") {
        await api.cancelConnectionRequest(request.id);
        notice("好友申请已撤回。");
      }
      await Promise.all([refreshConnections(), refreshCommunications()]);
    } catch (reason) { notice(reason instanceof Error ? reason.message : "关系状态未能更新，请稍后再试。"); }
  };

  const resolveInvitation = async (invitation: MeetInvitation, action: "accept" | "reject" | "cancel") => {
    try {
      if (action === "accept") {
        const result = await api.acceptInvitation(invitation.id);
        if (result.meetId) setMeet({ id: result.meetId, status: "scheduled" });
        const acceptedConversationId = result.conversation?.id || result.conversation?.conversationId;
        if (acceptedConversationId) {
          restoreConversationAccess(acceptedConversationId);
          await refreshCommunications();
          await openConversation(acceptedConversationId);
        }
        notice("邀请已接受。会话现在已开放，你们可以慢慢确认活动细节。");
      }
      if (action === "reject") {
        await api.rejectInvitation(invitation.id);
        notice("已婉拒这次邀请。不会开启会话，也不会继续催促你。");
      }
      if (action === "cancel") {
        await api.cancelInvitation(invitation.id);
        notice("邀请已撤回。对方不会再被推进到会话。");
      }
      await refreshCommunications();
    } catch (reason) { notice(reason instanceof Error ? reason.message : "邀请状态未能更新，请稍后再试。"); }
  };

  const openConversation = async (conversationId: string) => {
    if (closedConversationIds.includes(conversationId)) {
      notice("这段旧会话已在拉黑时关闭。解除拉黑不会自动恢复关系，请重新匹配或建立关系后再聊天。");
      return;
    }
    try {
      let nextConversations = conversations;
      let summary = nextConversations.find((item) => item.id === conversationId || item.conversationId === conversationId);
      if (!summary || !conversationPeerId(summary)) {
        nextConversations = await api.listConversations();
        setConversations(nextConversations);
        summary = nextConversations.find((item) => item.id === conversationId || item.conversationId === conversationId);
      }
      if (!summary || !conversationPeerId(summary)) throw new Error("会话缺少可验证的对方账号，请从最新消息列表重新进入。");
      const messages = await api.getConversation(conversationId);
      const currentUserId = session.state.session?.user.id;
      setConversation(messages.map((message) => displayConversationMessage(message, currentUserId)));
      setSelectedConversation(summary);
      setConversations((items) => items.map((item) => item.id === summary.id ? { ...item, unread: 0 } : item));
      setUnreadCount((current) => Math.max(0, current - Number(summary.unread || 0)));
      setOverlay("conversation");
      const lastMessageId = messages.at(-1)?.id;
      if (lastMessageId) await Promise.allSettled([api.markConversationDelivered(conversationId, lastMessageId), api.markConversationRead(conversationId, lastMessageId)]);
      await refreshCommunications();
    } catch (reason) { notice(reason instanceof Error ? reason.message : "会话暂时无法打开，请稍后再试。"); }
  };

  const openDemandConversation = () => {
    const acceptedInvitation = invitations.find((invitation) => invitation.demandId === liveDemand?.id && invitation.status === "accepted");
    const conversationId = acceptedInvitation?.conversation?.id || acceptedInvitation?.conversation?.conversationId;
    setOverlay(null);
    if (conversationId) {
      void openConversation(conversationId);
      return;
    }
    setActiveTab("messages");
    notice("匹配已经确认；请从消息列表进入已开放的会话。");
  };

  const requestFriendship = async () => {
    if (!selectedCandidate) return;
    try {
      await api.createConnectionRequest(selectedCandidate.candidateUserId, "想先从共同的活动兴趣开始聊聊。 ", liveDemand?.id || "");
      recordCandidate(selectedCandidate.id, "saved");
      setRelationship("pending");
      setOverlay(null);
      await refreshConnections();
      notice("好友申请已发出；双方确认前不会开放连续私信。");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "好友申请未能发出，请稍后再试。"); }
  };

  const createInvite = () => {
    if (!selectedCandidate) return;
    recordCandidate(selectedCandidate.id, "invited");
    setInviteStatus("draft"); setOverlay("invitation");
  };

  const sendInvite = async (message: string) => {
    if (!selectedCandidate) return;
    if (!liveDemand) return notice("请先发布需求并从真实候选人中选择对象，再发送邀请。");
    try {
      const invitation = await api.createInvitation({ inviteeUserId: selectedCandidate.candidateUserId, demandId: liveDemand.id, candidateRecordId: selectedCandidate.candidateRecordId, title: demand.title, message, activityType: demand.activityType, city: profile.city, locationText: demand.locationText, timeWindow: demand.timeWindow, capacityMax: demand.capacityMax, sourceType: "agent_candidate", sourceId: liveDemand.id });
      recordCandidate(selectedCandidate.id, "invited");
      setInviteStatus("sent");
      setOverlay(null);
      await refreshCommunications();
      notice("邀请已发送，等待对方自主决定。");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "邀请未能发送，请稍后再试。"); }
  };

  const updateMeet = async (status: MeetViewStatus, review?: MeetViewModel["review"]) => {
    if (!meet.id) return notice("还没有可操作的真实活动进程。");
    const copy: Record<MeetViewStatus, string> = {
      none: "", scheduled: "约练已经建立，出发前仍可以取消或调整。", arrived: "已记录确认到达；下一步由双方决定是否完成这次活动。", completed: "活动已完成。评价只用于守约与安全，不会要求你公开私人感受。", no_show: "已记录爽约。你可以选择只结束这次约练，也可以通过安全帮助提交说明。", cancelled: "约练已取消。提前停止是一种对彼此时间的尊重。",
    };
    try {
      if (status === "arrived") await api.confirmMeet(meet.id);
      if (status === "completed") {
        await api.completeMeet(meet.id);
        if (review) await api.reviewMeet(meet.id, { rating: review === "愉快" ? 5 : review === "守约" ? 4 : 2, tags: [review] });
      }
      if (status === "no_show") await api.reportMeetNoShow(meet.id, "用户报告爽约");
      if (status === "cancelled") await api.cancelMeet(meet.id, "用户主动取消");
      setMeet((current) => ({ ...current, status, ...(status === "arrived" ? { confirmedAt: "刚刚" } : {}), ...(status === "completed" ? { completedAt: "刚刚", review } : {}) }));
      notice(copy[status]);
    } catch (reason) { notice(reason instanceof Error ? reason.message : "活动状态未能更新，请稍后再试。"); }
  };

  const toggleLike = async (id: number) => {
    const liked = likedPostIds.includes(id);
    try {
      if (liked) {
        const next = await api.unlikeFeedPost(id);
        setLikedPostIds((items) => {
          const updated = items.filter((item) => item !== id);
          const userId = session.state.session?.user.id;
          if (userId) writeStoredArray(likedMomentsKey(userId), updated);
          return updated;
        });
        setPosts((items) => items.map((post) => post.id === id ? { ...post, likes: next.likes } : post));
      } else {
        const next = await api.likeFeedPost(id);
        setLikedPostIds((items) => {
          const updated = Array.from(new Set([...items, id]));
          const userId = session.state.session?.user.id;
          if (userId) writeStoredArray(likedMomentsKey(userId), updated);
          return updated;
        });
        setPosts((items) => items.map((post) => post.id === id ? { ...post, likes: next.likes } : post));
      }
    } catch (reason) { notice(reason instanceof Error ? reason.message : "点赞未能保存，请稍后再试。"); }
  };

  const selectPostImages = async (files: File[]) => {
    const available = Math.max(0, 9 - postImages.length);
    const selected = files.slice(0, available);
    if (files.length > available) notice("每条动态最多添加 9 张图片。");
    const valid = selected.filter((file) => {
      if (!file.type.startsWith("image/")) { notice(`${file.name} 不是支持的图片格式。`); return false; }
      if (file.size > 8 * 1024 * 1024) { notice(`${file.name} 超过 8MB，请压缩后再上传。`); return false; }
      return true;
    });
    try {
      const additions = await Promise.all(valid.map((file) => new Promise<MomentDraftImage>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ id: crypto.randomUUID(), file, preview: String(reader.result || "") });
        reader.onerror = () => reject(new Error(`${file.name} 读取失败。`));
        reader.readAsDataURL(file);
      })));
      setPostImages((current) => [...current, ...additions].slice(0, 9));
    } catch (reason) { notice(reason instanceof Error ? reason.message : "图片暂时无法读取。"); }
  };

  const publishPost = async () => {
    const text = postText.trim();
    if ((!text && !postImages.length) || postPublishing) return;
    setPostPublishing(true);
    try {
      const uploads = await Promise.all(postImages.map((image) => api.uploadImage(image.file)));
      const rejected = uploads.find((upload) => (upload.moderationStatus ?? upload.moderation_status ?? "approved") !== "approved");
      if (rejected) throw new Error("有图片尚未通过安全审核，动态没有发布；你可以调整后重试。");
      const images = uploads.map((upload) => ({ assetId: Number(upload.assetId ?? upload.asset_id ?? upload.id), url: upload.url, width: upload.width, height: upload.height }));
      if (images.some((image) => !image.assetId)) throw new Error("图片缺少有效资源编号，动态没有发布。");
      const post = await api.createFeedPost({ title: text ? "我的新动态" : "图片动态", text: text || "分享了今天的瞬间", tags: profile.interests.slice(0, 3), city: profile.city, images });
      setPosts((items) => [post, ...items]);
      setPostText("");
      setPostImages([]);
      setOverlay(null);
      notice(images.length ? `动态与 ${images.length} 张图片已发布；精确位置没有展示。` : "动态已发布；精确位置没有展示。");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "动态未能发布，请稍后再试。"); }
    finally { setPostPublishing(false); }
  };

  const deletePost = async (post: FeedPost) => {
    try {
      await api.deleteFeedPost(post.id);
      setPosts((items) => items.filter((item) => item.id !== post.id));
      notice("动态已从 FitMeet 服务端删除。");
      return true;
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : "动态暂时无法删除。");
      return false;
    }
  };

  const rememberBlockedUser = useCallback((record: BlockedUserRecord) => {
    setBlockedUsers((current) => {
      const next = [record, ...current.filter((item) => item.id !== record.id)];
      const userId = session.state.session?.user.id;
      if (userId) writeStoredArray(blockedUsersKey(userId), next);
      return next;
    });
  }, [session.state.session?.user.id]);

  const blockAndRemember = async (target: { id: number; name?: string; avatar?: string | null }) => {
    await api.blockUser(target.id);
    rememberBlockedUser({ id: target.id, name: target.name || "FitMeet 用户", avatar: target.avatar, blockedAt: new Date().toISOString() });
    const affectedConversationIds = conversations
      .filter((item) => conversationPeerId(item) === Number(target.id))
      .map((item) => item.id);
    if (selectedConversation && conversationPeerId(selectedConversation) === Number(target.id)) affectedConversationIds.push(selectedConversation.id);
    rememberClosedConversations(affectedConversationIds);
    setConversations((items) => items.filter((item) => Number(item.userId ?? item.peer?.id) !== Number(target.id)));
    setCandidates((items) => items.filter((item) => Number(item.candidateUserId) !== Number(target.id)));
    notice("已拉黑；服务端会停止推荐和后续私信，当前设备也已记录。");
  };

  const unblockKnownUser = async (target: BlockedUserRecord) => {
    try {
      await api.unblockUser(target.id);
      setBlockedUsers((current) => {
        const next = current.filter((item) => item.id !== target.id);
        const userId = session.state.session?.user.id;
        if (userId) writeStoredArray(blockedUsersKey(userId), next);
        return next;
      });
      notice(`已解除对 ${target.name} 的拉黑；旧会话不会自动恢复，需要重新匹配或建立关系后再聊天。`);
    } catch (reason) { notice(reason instanceof Error ? reason.message : "解除拉黑暂时未能完成。"); }
  };

  const changeApplication = async (kind: "social" | "task", intent: FitMeetPublicIntent, next: ApplicationViewStatus) => {
    const current = kind === "social" ? socialApplications.find((item) => item.publicIntentId === intent?.id) : taskApplications.find((item) => item.taskIntentId === intent?.id);
    try {
      if (next === "pending") {
        if (kind === "social") await api.createPublicIntentApplication(intent.id, "想先确认活动细节，再决定是否加入。");
        else await api.createTaskIntentApplication(intent.id, "我可以先沟通服务细节，再确认是否参与。");
        notice("申请已提交；对方接受前不会开放连续私信。");
      }
      if (next === "cancelled") {
        if (!current) return;
        if (kind === "social") await api.cancelPublicIntentApplication(current.id);
        else await api.cancelTaskIntentApplication(current.id);
        notice("申请已取消。");
      }
      const [nextSocialApplications, nextTaskApplications] = await Promise.all([api.listMyPublicIntentApplications("applicant"), api.listMyTaskIntentApplications("applicant")]);
      setSocialApplications(nextSocialApplications);
      setTaskApplications(nextTaskApplications);
    } catch (reason) { notice(reason instanceof Error ? reason.message : "申请状态未能更新，请稍后再试。"); }
  };

  const acknowledgeInboxEvent = async (eventId: string) => {
    try {
      await api.acknowledgeAgentInboxEvents([eventId]);
      setAgentInboxEvents((items) => items.filter((item) => item.id !== eventId));
    } catch (reason) { notice(reason instanceof Error ? reason.message : "通知暂时无法标记为已读。"); }
  };

  const openInboxEvent = async (event: AgentInboxEvent) => {
    const conversationId = typeof event.payload?.conversationId === "string" ? event.payload.conversationId : "";
    if (conversationId) await openConversation(conversationId);
    await acknowledgeInboxEvent(event.id);
  };

  const resolveIntentApplication = async (kind: "social" | "task", application: FitMeetIntentApplication, decision: "accept" | "reject") => {
    try {
      if (kind === "social") {
        if (decision === "accept") await api.acceptPublicIntentApplication(application.id);
        else await api.rejectPublicIntentApplication(application.id);
      } else if (decision === "accept") await api.acceptTaskIntentApplication(application.id);
      else await api.rejectTaskIntentApplication(application.id);
      const [socialOwnerApplications, taskOwnerApplications, nextConversations, events] = await Promise.all([
        api.listMyPublicIntentApplications("owner"),
        api.listMyTaskIntentApplications("owner"),
        api.listConversations(),
        api.getAgentInboxEvents(),
      ]);
      setOwnerSocialApplications(socialOwnerApplications);
      setOwnerTaskApplications(taskOwnerApplications);
      setConversations(nextConversations);
      setAgentInboxEvents(events.items);
      notice(decision === "accept" ? "已接受申请；会话会以服务端实际开放状态显示。" : "已婉拒申请。");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "申请暂时无法处理。"); }
  };

  const sendConversation = async () => {
    const text = conversationInput.trim();
    if (!text || !selectedConversation || selectedConversationClosed) return;
    try {
      const response = await api.sendConversationMessage(selectedConversation.id, text);
      const currentUserId = session.state.session?.user.id;
      setConversation((items) => [...items, displayConversationMessage({ ...response, text: response.text || response.body?.text || text }, currentUserId)]);
      setConversationInput("");
      await refreshCommunications();
    } catch (reason) {
      if (reason instanceof FitMeetApiError && reason.status === 403) {
        rememberClosedConversations([selectedConversation.id]);
        setConversations((items) => items.filter((item) => item.id !== selectedConversation.id));
        notice("这段会话已经关闭，消息没有发送。解除拉黑不会自动恢复旧关系，请重新匹配或建立关系。");
        return;
      }
      notice(reason instanceof Error ? reason.message : "消息未能发送，请稍后再试。");
    }
  };

  const recallConversationMessage = async (messageId: string) => {
    try {
      const recalled = await api.recallConversationMessage(messageId);
      setConversation((items) => items.map((item) => item.id === messageId ? displayConversationMessage({ ...recalled, lifecycleStatus: "recalled", recalledAt: recalled.recalledAt || new Date().toISOString() }, session.state.session?.user.id) : item));
      notice("消息已撤回；服务端仍会保留必要的安全审计记录。");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "消息未能撤回；撤回仅在发送后短时间内可用。"); }
  };

  const reportConversationMessage = async (messageId: string) => {
    try {
      await api.reportConversationMessage(messageId, "inappropriate_content", "网页端会话消息举报");
      notice("这条消息已提交安全审核；不会自动回复或继续联系对方。");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "消息举报暂时未能提交。"); }
  };

  const toggleConversationMute = async () => {
    if (!selectedConversation) return;
    const muted = selectedConversation.notificationLevel === "muted" || Boolean(selectedConversation.mutedUntil && new Date(selectedConversation.mutedUntil).getTime() > Date.now());
    try {
      const next = await api.updateConversationSettings(selectedConversation.id, { notificationLevel: muted ? "normal" : "muted", mutedUntil: null });
      const updated = { ...selectedConversation, ...next, notificationLevel: muted ? "normal" : "muted", mutedUntil: null };
      setSelectedConversation(updated);
      setConversations((items) => items.map((item) => item.id === selectedConversation.id ? updated : item));
      notice(muted ? "已恢复这段会话的提醒。" : "已静音这段会话；消息仍会保存在服务端。");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "会话提醒设置暂时无法更新。"); }
  };

  const saveProfile = async (patch: Partial<SocialProfile>) => {
    try {
      const next = await api.updateSocialProfile(patch);
      setProfile(next);
      session.setSocialProfile(next);
      notice("资料已更新。隐私与推荐设置已同步。");
      setOverlay(null);
    } catch (reason) { notice(reason instanceof Error ? reason.message : "资料未能保存，请稍后再试。"); }
  };

  const saveMemory = async (id: string) => {
    const memory = memories.find((item) => item.id === id);
    if (!memory) return;
    try {
      const saved = await api.confirmAgentMemory({ memoryType: memory.memoryType, value: memory.value || memory.summary || "", summary: memory.summary ?? undefined });
      setMemories((items) => items.map((item) => item.id === id ? saved : item));
      notice("偏好已确认保存；小福只会在推荐和措辞中参考它。");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "偏好未能保存，请稍后再试。"); }
  };

  const deleteMemory = async (id: string) => {
    try {
      await api.deleteAgentMemory(id);
      setMemories((items) => items.filter((item) => item.id !== id));
      notice("这条偏好已删除；后续不会再使用它解释推荐。");
    } catch (reason) { notice(reason instanceof Error ? reason.message : "偏好未能删除，请稍后再试。"); }
  };

  const syncOpenConversation = useCallback(async () => {
    if (!liveApi || !selectedConversation || closedConversationIds.includes(selectedConversation.id) || conversationSyncing.current) return;
    conversationSyncing.current = true;
    try {
      const messages = await api.getConversation(selectedConversation.id);
      const currentUserId = session.state.session?.user.id;
      setConversation(messages.map((message) => displayConversationMessage(message, currentUserId)));
      const lastMessageId = messages.at(-1)?.id;
      if (lastMessageId) {
        await Promise.allSettled([
          api.markConversationDelivered(selectedConversation.id, lastMessageId),
          api.markConversationRead(selectedConversation.id, lastMessageId),
        ]);
      }
      const [nextConversations, nextUnread] = await Promise.all([api.listConversations(), api.getUnreadCount()]);
      setConversations(nextConversations);
      setUnreadCount(nextUnread.unreadCount ?? 0);
      const nextSummary = nextConversations.find((item) => item.id === selectedConversation.id || item.conversationId === selectedConversation.id);
      if (nextSummary) setSelectedConversation(nextSummary);
    } finally {
      conversationSyncing.current = false;
    }
  }, [api, closedConversationIds, liveApi, selectedConversation, session.state.session?.user.id]);

  const reconcileRealtimeState = useCallback(async () => {
    if (!liveApi) return;
    const results = await Promise.allSettled([
      api.getFeed(),
      api.listMyDemands(),
      api.listMeetInvitations(),
      api.listConversations(),
      api.listConnectionRequests("inbox"),
      api.listConnectionRequests("outbox"),
      api.getUnreadCount(),
      api.getAgentInboxEvents(),
      api.listMyPublicIntentApplications("owner"),
      api.listMyTaskIntentApplications("owner"),
    ] as const);
    const [feedResult, demandsResult, invitationsResult, conversationsResult, inboxResult, outboxResult, unreadResult, eventsResult, socialApplicationsResult, taskApplicationsResult] = results;
    if (feedResult.status === "fulfilled") {
      setPosts(feedResult.value.data);
      setFeedLastPage(feedResult.value.metadata?.lastPage ?? 1);
    }
    if (invitationsResult.status === "fulfilled") setInvitations(invitationsResult.value);
    if (conversationsResult.status === "fulfilled") setConversations(conversationsResult.value);
    if (inboxResult.status === "fulfilled") setIncomingConnections(inboxResult.value);
    if (outboxResult.status === "fulfilled") setOutgoingConnections(outboxResult.value);
    if (unreadResult.status === "fulfilled") setUnreadCount(unreadResult.value.unreadCount ?? 0);
    if (eventsResult.status === "fulfilled") setAgentInboxEvents(eventsResult.value.items);
    if (socialApplicationsResult.status === "fulfilled") setOwnerSocialApplications(socialApplicationsResult.value);
    if (taskApplicationsResult.status === "fulfilled") setOwnerTaskApplications(taskApplicationsResult.value);
    if (demandsResult.status === "fulfilled") setDemands(demandsResult.value.data);
    const latest = demandsResult.status === "fulfilled" ? demandsResult.value.data.find((item) => item.id === liveDemand?.id) ?? demandsResult.value.data[0] : undefined;
    if (latest) await activateDemand(latest);
    const threadIdToRefresh = activeAgentThreadIdRef.current;
    if (threadIdToRefresh && !agentThreadSwitchingRef.current) await loadAgentThread(threadIdToRefresh);
    await syncOpenConversation();
    if (results.every((result) => result.status === "rejected")) throw new Error("实时数据暂时无法同步。");
  }, [activateDemand, api, liveApi, liveDemand?.id, loadAgentThread, syncOpenConversation]);

  const handleRealtimeEvent = useCallback((event: FitMeetRealtimeEvent) => {
    const eventConversationId = typeof event.payload?.conversationId === "string" ? event.payload.conversationId : "";
    if (event.eventType === "chat.unlocked" && eventConversationId) restoreConversationAccess(eventConversationId);
    void reconcileRealtimeState().catch(() => notice("实时同步暂时中断；网络恢复后会自动补齐。"));
    const eventCopy: Record<string, string> = {
      "demand.candidates.ready": "小福找到了新的候选人，已为你刷新。",
      "invitation.sent": "你收到一份新邀请。",
      "invitation.accepted": "对方接受了邀请，会话已经开放。",
      "chat.unlocked": "双方已经确认，会话现已开放。",
      "invitation.rejected": "对方暂时不方便接受这次邀请。",
      "message.received": "你收到一条新消息。",
      "connection.request.created": "你收到一条新的关系申请。",
      "connection.request.accepted": "对方接受了关系申请，现在可以聊天。",
      "feed.comment.created": "你的动态收到了一条新评论。",
      "public_intent.application.created": "你的社交需求收到了一条新申请。",
      "task.application.created": "你的任务需求收到了一条新申请。",
    };
    const copy = eventCopy[event.eventType];
    if (notificationEnabled && copy) {
      notice(copy);
      if (typeof document !== "undefined" && document.visibilityState !== "visible" && typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("FitMeet", { body: copy, icon: "/fitmeet-icon.png", tag: event.eventType });
      }
    }
  }, [notificationEnabled, notice, reconcileRealtimeState, restoreConversationAccess]);

  const realtimeStatus = useFitMeetRealtime(session.state.session?.accessToken, handleRealtimeEvent, () => {
    void reconcileRealtimeState().catch(() => {
      // A socket wake-up can race with logout or token rotation. The event is
      // only an invalidation hint, so a later reconnect will safely retry.
    });
  });

  useEffect(() => {
    if (!liveApi || overlay !== "conversation" || !selectedConversation || selectedConversationClosed) return;
    const refresh = () => {
      if (document.visibilityState === "visible") void syncOpenConversation().catch(() => undefined);
    };
    const timer = window.setInterval(refresh, 2_500);
    return () => window.clearInterval(timer);
  }, [liveApi, overlay, selectedConversation, selectedConversationClosed, syncOpenConversation]);

  useEffect(() => {
    if (!liveApi || activeTab !== "moments") return;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      void api.getFeed().then((page) => {
        setPosts(page.data);
        setFeedLastPage(page.metadata?.lastPage ?? 1);
      }).catch(() => undefined);
    };
    const timer = window.setInterval(refresh, 6_000);
    return () => window.clearInterval(timer);
  }, [activeTab, api, liveApi]);

  const openToolProposal = (proposal: AgentThreadEntry) => {
    setSelectedToolProposal(proposal);
    setOverlay("toolApproval");
  };

  const resolveToolProposal = async (decision: "approve" | "decline", message?: string) => {
    if (!activeAgentThread || !selectedToolProposal) return;
    try {
      await api.resolveAgentToolProposal(
        activeAgentThread.id,
        selectedToolProposal.id,
        decision,
        message ? { message } : undefined,
      );
      await reconcileRealtimeState();
      setOverlay(null);
      setSelectedToolProposal(null);
      notice(decision === "approve" ? "已按你的确认提交；我会以服务端返回的实际结果更新状态。" : "好的，这项操作不会执行。");
    } catch (reason) {
      await loadAgentThread(activeAgentThread.id).catch(() => undefined);
      notice(reason instanceof Error ? reason.message : "这项操作没有成功提交；请检查后重试。");
    }
  };

  if (session.state.status === "loading") return <main className={styles.appPage}><section className={`${styles.mobileSurface} ${styles.loadingSurface}`} aria-live="polite"><FitMeetBrandIcon size={78} priority /><p>正在准备你的 FitMeet 内测档案…</p></section></main>;
  if (session.state.status === "anonymous") return <InternalTesterLogin onLogin={session.login} initialError={session.state.error} />;

  if (surface === "onboarding") return <OnboardingFlow userId={session.state.session?.user.id ?? 0} initialProfile={session.state.socialProfile} initialStatus={session.state.onboarding} onComplete={completeOnboarding} onUploadPhotos={uploadProfilePhotos} onExit={session.logout} onLifeNeed={(purpose) => {
    const labels = { friends: "交友", dating: "恋爱", workout: "约练", buddy: "找搭子", travel: "找旅伴", service: "找服务", housing: "找房", activity: "找活动", help: "求助", other: "其他需求" };
    setAgentOnlyMode(true); setSurface("main"); setActiveTab("home");
    void (async () => {
      try {
        const thread = await ensureAgentThread();
        await api.sendAgentThreadTurn(thread.id, `我想先${labels[purpose]}。`);
        await loadAgentThread(thread.id, true);
      } catch { notice("小福工作台已准备好；你可以从一个模糊的想法开始。 "); }
    })();
    notice(`已进入 ${labels[purpose]} 的小福工作台；暂不要求建立社交资料。`);
  }} />;

  return <main className={styles.appPage}><section className={styles.mobileSurface} aria-label="FitMeet 完整体验账号">
    <div className={styles.appScroll}>
      {activeTab === "home" ? <HomeScreen nickname={profile.nickname} chat={chat} entries={agentEntries} input={chatInput} onInput={setChatInput} onSend={() => void sendAgentMessage()} onQuickPrompt={(prompt) => void sendAgentMessage(prompt)} replySuggestions={agentReplySuggestions(activeDraftSession)} sending={agentSending} onVoice={startVoiceInput} voiceActive={voiceInput.isListening} demand={hasDemand ? demand : null} draftMissingFields={activeDraftSession?.missingFields ?? []} candidateCount={activeCandidates.length} onDemand={() => hasDemand ? setOverlay("demand") : void prepareDemandDraft()} onDemandList={() => demands.length ? setOverlay("demandList") : hasDemand ? setOverlay("demand") : void prepareDemandDraft()} onEditDemand={() => hasDemand ? setOverlay("demandEdit") : void prepareDemandDraft()} onCandidates={() => setOverlay("candidate")} onConversation={openDemandConversation} onCreateDemand={() => activeDraftSession ? void prepareDemandDraft() : void startNewDemand()} onReviewDemandCard={() => void confirmDemandCardDraft()} onToolProposal={openToolProposal} onMemory={() => setOverlay("memory")} onHistory={() => setOverlay("history")} realtimeStatus={realtimeStatus} /> : null}
      {activeTab === "moments" ? <MomentsExperience api={api} userId={session.state.session?.user.id ?? 0} posts={posts} onPostsChange={setPosts} likedPostIds={likedPostIds} onLike={(id) => void toggleLike(id)} channel={discoverChannel} onChannel={setDiscoverChannel} onCompose={() => setOverlay("composer")} onDelete={deletePost} socialIntents={socialIntents} taskIntents={taskIntents} socialApplications={socialApplications} taskApplications={taskApplications} onApplication={(kind, intent, status) => void changeApplication(kind, intent, status)} onNotice={notice} initialLastPage={feedLastPage} /> : null}
      {activeTab === "messages" ? <MessagesExperience invitations={invitations} conversations={visibleConversations} incomingConnections={incomingConnections} outgoingConnections={outgoingConnections} agentEvents={agentInboxEvents} ownerSocialApplications={ownerSocialApplications} ownerTaskApplications={ownerTaskApplications} currentUserId={session.state.session?.user.id ?? 0} unreadCount={unreadCount} onConversation={(id) => void openConversation(id)} onInvitation={(invitation, action) => void resolveInvitation(invitation, action)} onIntentApplication={(kind, application, decision) => void resolveIntentApplication(kind, application, decision)} onSystemEvent={(event) => void openInboxEvent(event)} onMeet={() => meet.id ? setOverlay("meet") : notice("还没有已确认的真实活动。 ")} onRelationship={() => setOverlay("relationships")} onRefresh={reconcileRealtimeState} /> : null}
      {activeTab === "profile" ? <ProfileExperience api={api} userId={session.state.session?.user.id ?? 0} profile={profile} photos={profilePhotos} notificationEnabled={notificationEnabled} postCount={posts.filter((post) => Number(post.userId) === Number(session.state.session?.user.id)).length} relationshipCount={incomingConnections.length + outgoingConnections.length} blockedUsers={blockedUsers} onPhotosChange={setProfilePhotos} onNotice={notice} onEdit={() => setOverlay("editProfile")} onPrivacy={() => setOverlay("privacy")} onNotification={(value) => void updateNotificationPreference(value)} onRelationships={() => setOverlay("relationships")} onReboard={() => { setAgentOnlyMode(false); setSurface("onboarding"); }} onSafety={() => setOverlay("accountSafety")} onMoments={() => setActiveTab("moments")} onLogout={session.logout} onBlockUser={async (user: PublicUserProfile) => { try { await blockAndRemember({ id: user.id, name: user.name, avatar: user.avatar }); } catch (reason) { notice(reason instanceof Error ? reason.message : "拉黑操作未能完成。"); } }} onUnblockUser={unblockKnownUser} /> : null}
    </div>
    <nav className={styles.tabBar} aria-label="FitMeet 主导航">{tabs.map((tab) => { const Icon = tab.icon; const selected = activeTab === tab.id; return <button key={tab.id} type="button" className={`${styles.tabButton} ${selected ? styles.tabButtonActive : ""}`} onClick={() => setActiveTab(tab.id)} aria-current={selected ? "page" : undefined} aria-label={tab.label}><Icon /><small>{tab.label}</small></button>; })}</nav>
    {toast ? <p className={styles.toast} role="status"><FiCheck /> {toast}</p> : null}
  </section>

  {overlay === "candidate" && selectedCandidate ? <CandidateProfileExperience api={api} candidate={selectedCandidate} candidates={activeCandidates} relationship={relationship} inviteStatus={selectedCandidateInviteStatus} onClose={() => setOverlay(null)} onSelect={(id) => { setSelectedCandidateId(id); setInviteStatus("none"); }} onDismiss={dismissCandidate} onSave={() => recordCandidate(selectedCandidate.id, "saved")} onFriend={() => void requestFriendship()} onInvite={createInvite} onConversation={openDemandConversation} onReport={async () => { await api.reportSafety({ targetType: "user", targetId: selectedCandidate.candidateUserId, targetUserId: selectedCandidate.candidateUserId, reason: "inappropriate_behavior", description: "网页候选人资料举报" }); notice("举报已提交安全审核；不会自动联系对方。"); }} onBlock={async () => { await blockAndRemember({ id: selectedCandidate.candidateUserId, name: selectedCandidate.name, avatar: selectedCandidate.avatar }); setRelationship("blocked"); }} /> : null}
  {overlay === "demandList" ? <DemandListSheet demands={demands} activeDemandId={liveDemand?.id} onClose={() => setOverlay(null)} onSelect={(record) => void activateDemand(record, true)} onCreate={() => void startNewDemand()} /> : null}
  {overlay === "demand" && hasDemand ? <DemandSheet demand={demand} candidateCount={activeCandidates.length} onClose={() => setOverlay(null)} onEdit={() => setOverlay("demandEdit")} onPublish={() => void publishDemand()} onHide={() => void changeDemandStatus("hidden")} onCancel={() => void changeDemandStatus("cancelled")} onCandidates={() => setOverlay("candidate")} onConversation={openDemandConversation} /> : null}
  {overlay === "demandEdit" ? <DemandEditSheet demand={demand} onClose={() => setOverlay(null)} onSave={(next) => void saveDemandDraft(next)} /> : null}
  {overlay === "invitation" && selectedCandidate ? <InviteSheet candidate={selectedCandidate} demand={demand} onClose={() => { setInviteStatus("none"); setOverlay(null); }} onSend={(message) => void sendInvite(message)} /> : null}
  {overlay === "composer" ? <ComposeSheet value={postText} images={postImages} publishing={postPublishing} onChange={setPostText} onFiles={(files) => void selectPostImages(files)} onRemoveImage={(id) => setPostImages((items) => items.filter((item) => item.id !== id))} onClose={() => setOverlay(null)} onPublish={() => void publishPost()} /> : null}
  {overlay === "conversation" && selectedConversation ? <ConversationSheet conversation={selectedConversation} unlocked={!selectedConversationClosed} closed={selectedConversationClosed} items={conversation} input={conversationInput} onInput={setConversationInput} onSend={() => void sendConversation()} onMute={() => void toggleConversationMute()} onRecall={(id) => void recallConversationMessage(id)} onReport={(id) => void reportConversationMessage(id)} onBlock={() => { const targetId = Number(selectedConversation.userId ?? selectedConversation.peer?.id); if (!targetId) return notice("当前会话没有可验证的对方账号，无法拉黑。"); void blockAndRemember({ id: targetId, name: selectedConversation.displayName || selectedConversation.username || selectedConversation.peer?.name, avatar: selectedConversation.avatar || selectedConversation.peer?.avatar }).then(() => setOverlay(null)).catch((reason) => notice(reason instanceof Error ? reason.message : "拉黑操作未能完成。")); }} onClose={() => setOverlay(null)} /> : null}
  {overlay === "memory" ? <MemorySheet memories={memories} onClose={() => setOverlay(null)} onSave={saveMemory} onDelete={deleteMemory} /> : null}
  {overlay === "history" ? <HistorySheet threads={agentThreads} activeThreadId={activeAgentThread?.id} onClose={() => setOverlay(null)} onSelect={(id) => { void loadAgentThread(id, true).then(() => setOverlay(null)).catch((reason) => notice(reason instanceof Error ? reason.message : "对话记录暂时无法打开。")); }} onNew={() => void startNewDemand()} /> : null}
  {overlay === "toolApproval" && selectedToolProposal ? <ToolApprovalSheet key={selectedToolProposal.id} proposal={selectedToolProposal} onClose={() => { setOverlay(null); setSelectedToolProposal(null); }} onResolve={(decision, message) => void resolveToolProposal(decision, message)} /> : null}
  {overlay === "editProfile" ? <EditProfileSheet profile={profile} onClose={() => setOverlay(null)} onSave={saveProfile} /> : null}
  {overlay === "privacy" ? <PrivacySheet profile={profile} onClose={() => setOverlay(null)} onSave={saveProfile} /> : null}
  {overlay === "settings" ? <SettingsSheet notificationEnabled={notificationEnabled} onNotification={(value) => void updateNotificationPreference(value)} onClose={() => setOverlay(null)} onReset={() => { setOverlay(null); setAgentOnlyMode(false); setSurface("onboarding"); notice("已进入重新建档流程。") }} onSafety={() => setOverlay("accountSafety")} /> : null}
  {overlay === "relationships" ? <RelationshipSheet incoming={incomingConnections} outgoing={outgoingConnections} onClose={() => setOverlay(null)} onAction={(request, action) => void resolveConnection(request, action)} /> : null}
  {overlay === "meet" && meet.id ? <MeetLifecycleSheet meet={meet} demand={demand} onClose={() => setOverlay(null)} onUpdate={(status, review) => void updateMeet(status, review)} /> : null}
  {overlay === "safety" ? <SafetySheet onClose={() => setOverlay(null)} onReport={() => { if (!selectedCandidate) return notice("请先从候选人或会话中选择需要帮助的对象。"); void api.reportSafety({ targetType: "user", targetId: selectedCandidate.candidateUserId, targetUserId: selectedCandidate.candidateUserId, reason: "用户请求安全帮助" }).then(() => notice("安全帮助请求已提交。我们不会替你继续联系对方。 ")).catch((reason) => notice(reason instanceof Error ? reason.message : "安全帮助请求未能提交。")); }} onBlock={() => { if (!selectedCandidate) return notice("请先从候选人或会话中选择需要拉黑的对象。"); void blockAndRemember({ id: selectedCandidate.candidateUserId, name: selectedCandidate.name, avatar: selectedCandidate.avatar }).then(() => setRelationship("blocked")).catch((reason) => notice(reason instanceof Error ? reason.message : "拉黑操作未能完成。")); }} /> : null}
  {overlay === "accountSafety" ? <AccountSafetySheet profile={profile} photos={profilePhotos} onClose={() => setOverlay(null)} onPrivacy={() => setOverlay("privacy")} onRelationships={() => setOverlay("relationships")} /> : null}
  </main>;
}

function HomeScreen({ nickname, chat, entries, input, onInput, onSend, onQuickPrompt, replySuggestions, sending, onVoice, voiceActive, demand, draftMissingFields, candidateCount, onDemand, onDemandList, onEditDemand, onCandidates, onConversation, onCreateDemand, onReviewDemandCard, onToolProposal, onMemory, onHistory, realtimeStatus }: { nickname: string; chat: ChatLine[]; entries: AgentThreadEntry[]; input: string; onInput: (value: string) => void; onSend: () => void; onQuickPrompt: (prompt: string) => void; replySuggestions: string[]; sending: boolean; onVoice: () => void; voiceActive: boolean; demand: DemandViewModel | null; draftMissingFields: string[]; candidateCount: number; onDemand: () => void; onDemandList: () => void; onEditDemand: () => void; onCandidates: () => void; onConversation: () => void; onCreateDemand: () => void; onReviewDemandCard: () => void; onToolProposal: (proposal: AgentThreadEntry) => void; onMemory: () => void; onHistory: () => void; realtimeStatus: "offline" | "connecting" | "connected" | "reconnecting" }) {
  const [showFullTimeline, setShowFullTimeline] = useState(false);
  const syncLabel = realtimeStatus === "connected" ? "实时在线" : realtimeStatus === "reconnecting" ? "正在重连" : realtimeStatus === "offline" ? "离线，待恢复" : "正在连接";
  const timeline = entries.length ? entries : chat.map((item) => ({ id: String(item.id), kind: "message", role: item.role, content: item.text } as AgentThreadEntry));
  const hiddenTimelineCount = Math.max(0, timeline.length - 6);
  const visibleTimeline = showFullTimeline ? timeline : timeline.slice(-6);
  const currentDemandStatus = demand ? effectiveDemandStatus(demand, candidateCount) : null;
  const focusTitle = currentDemandStatus === "communicating" ? "已经匹配成功" : currentDemandStatus === "invited" ? "邀请已经发送" : demand ? (candidateCount ? `找到 ${candidateCount} 位候选人` : demand.status === "draft" ? "需求卡等待你确认" : "需求已经进入匹配") : draftMissingFields.length ? "需求草稿已保存" : "今天想遇见怎样的人？";
  const focusCopy = currentDemandStatus === "communicating" ? "双方已经确认，会话已开放。你们可以继续商量时间、地点和舒服的边界。" : currentDemandStatus === "invited" ? "正在等待对方自主决定；接受前不会开放连续私信。" : demand ? (candidateCount ? "匹配理由和边界都已整理好，是否邀请仍由你决定。" : "小福会持续按你的地点、时间和边界补充候选。") : draftMissingFields.length ? `还需补充：${draftMissingFields.join("、")}。你可以继续对话，草稿不会丢。` : "从一句不完整的想法开始，小福会陪你补齐需求，再由你确认发布。";
  const focusAction = currentDemandStatus === "communicating" ? onConversation : demand && candidateCount ? onCandidates : demand ? onDemand : onCreateDemand;
  const focusActionLabel = currentDemandStatus === "communicating" ? "进入聊天" : demand && candidateCount ? "查看候选" : demand ? "查看需求卡" : draftMissingFields.length ? "继续完善" : "开始整理";

  return <div className={styles.homeScreen}>
    <header className={styles.agentHeader}>
      <div className={styles.homeIdentity}><FitMeetBrandIcon size={40} priority /><div><small>你好，{nickname || "朋友"}</small><strong>FitMeet</strong></div></div>
      <div className={styles.homeHeaderActions}><button type="button" aria-label="查看历史" onClick={onHistory}><FiClock /></button><button type="button" aria-label="查看记忆" onClick={onMemory}><FiBookOpen /></button><button type="button" aria-label="全部需求" onClick={onDemandList}><FiFileText /></button></div>
    </header>

    <section className={styles.homeFocusCard} aria-label="当前进度">
      <div className={`${styles.realtimeBadge} ${styles[`realtime_${realtimeStatus}`]}`}><i />{syncLabel}</div>
      <span className={styles.focusEyebrow}>小福工作台</span>
      <h1>{focusTitle}</h1>
      <p>{focusCopy}</p>
      <button type="button" onClick={focusAction}>{focusActionLabel}<FiChevronRight /></button>
    </section>

    {!demand && !draftMissingFields.length ? <section className={styles.quickStart} aria-label="快捷开始"><header><strong>可以这样告诉小福</strong><small>点击后会直接进入真实 Agent 对话</small></header><div>{quickAgentPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => onQuickPrompt(prompt)} disabled={sending}>{prompt}<FiChevronRight /></button>)}</div></section> : null}

    {demand ? <div className={styles.homeDemandSlot}><DemandCard demand={demand} candidateCount={candidateCount} onEdit={onEditDemand} onOpen={onDemand} onCandidates={onCandidates} onConversation={onConversation} /></div> : null}

    <section className={styles.homeConversation} aria-label="最近对话">
      <header><div><strong>和小福的最近对话</strong><small>历史与草稿已同步到账号</small></div>{hiddenTimelineCount ? <button type="button" onClick={() => setShowFullTimeline((current) => !current)}>{showFullTimeline ? "收起" : `更早 ${hiddenTimelineCount} 条`}</button> : null}</header>
      <div className={styles.chatStack}>{visibleTimeline.map((item) => item.kind === "message" ? <AgentMessage key={item.id} role={item.role === "user" ? "user" : "assistant"} text={item.content || ""} /> : <AgentToolTimelineCard key={item.id} entry={item} onReviewDemandCard={onReviewDemandCard} onOpenProposal={() => onToolProposal(item)} />)}{!demand ? <button type="button" className={styles.draftDemandAction} onClick={onCreateDemand}><FiFileText /><span><strong>查看需求草稿</strong><small>先和小福聊几句，再由你核对并发布</small></span><FiChevronRight /></button> : null}</div>
    </section>

    {replySuggestions.length ? <section className={styles.agentReplySuggestions} aria-label="快捷回答"><small>点一下即可回答当前问题</small><div>{replySuggestions.map((suggestion) => <button type="button" key={suggestion} disabled={sending} onClick={() => onQuickPrompt(suggestion)}>{suggestion}</button>)}</div></section> : null}

    <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); onSend(); }} aria-busy={sending}>
      <button type="button" aria-label="图片理解暂未开放" title="图片理解暂未开放" disabled><FiImage /></button>
      <button type="button" aria-label={voiceActive ? "停止语音输入" : "语音输入"} onClick={onVoice} className={voiceActive ? styles.composerVoiceActive : ""}><FiMic /></button>
      <input value={input} onChange={(event) => onInput(event.target.value)} placeholder={sending ? "小福正在理解和整理…" : "告诉小福你现在想解决什么"} aria-label="告诉小福你现在想解决什么" disabled={sending} />
      <button type="submit" aria-label="发送给小福" disabled={!input.trim() || sending}><FiArrowUp /></button>
    </form>
  </div>;
}

function AgentMessage({ role, text }: { role: "assistant" | "user"; text: string }) {
  return <article className={role === "user" ? styles.userChat : styles.agentChat}>{role === "assistant" ? <FitMeetBrandIcon size={31} /> : null}<div><p>{text}</p></div>{role === "user" ? <Avatar name="我" size={31} /> : null}</article>;
}

function toolTitle(toolName: string | null, status: string | null) {
  const titles: Record<string, string> = {
    classify_demand: "需求理解",
    route_demand_flow: "流程建议",
    generate_demand_card: "需求卡草稿",
    press_demand_card_button: "需求卡操作",
    search_candidates_for_demand: "候选筛选",
    rank_candidates: "候选排序",
    draft_invitation: "邀请草稿",
    send_invitation: "发送邀请",
    draft_service_message: "服务沟通草稿",
    request_service_connection: "联系服务者",
    block_user: "拉黑用户",
    report_user: "举报用户",
    patch_social_profile: "更新资料",
  };
  if (status === "failed") return `${titles[toolName || ""] || "操作"}未提交`;
  return titles[toolName || ""] || "小福整理的下一步";
}

function AgentToolTimelineCard({ entry, onReviewDemandCard, onOpenProposal }: { entry: AgentThreadEntry; onReviewDemandCard: () => void; onOpenProposal: () => void }) {
  const isProposal = entry.kind === "tool_proposal";
  const awaitingConfirmation = isProposal && ["awaiting_confirmation", "failed"].includes(entry.toolStatus || "");
  const readyForReview = isProposal && entry.toolName === "generate_demand_card" && entry.toolStatus === "ready_for_review";
  const isCompleted = entry.toolStatus === "executed" || entry.toolStatus === "completed" || entry.toolStatus === "approved";
  const statusCopy = entry.toolStatus === "awaiting_confirmation" ? "等待你的确认" : entry.toolStatus === "ready_for_review" ? "等待生成" : entry.toolStatus === "collecting" ? "还在整理" : entry.toolStatus === "executing" ? "正在提交" : entry.toolStatus === "executed" ? "已按确认完成" : entry.toolStatus === "completed" ? "已整理" : entry.toolStatus === "declined" ? "你选择了不执行" : entry.toolStatus === "failed" ? "没有提交成功" : isCompleted ? "已完成" : "已同步";
  return <article className={`${styles.toolTimelineCard} ${awaitingConfirmation ? styles.toolTimelinePending : ""}`}><header><span><FiShield /></span><div><strong>{toolTitle(entry.toolName, entry.toolStatus)}</strong><small>{statusCopy}</small></div></header><p>{entry.content || (readyForReview ? "信息已整理好，但不会自动生成或发布。" : "小福已把这一步记录在账号级对话里。")}</p>{readyForReview ? <button type="button" className={styles.secondaryButton} onClick={onReviewDemandCard}>由我生成需求卡 <FiChevronRight /></button> : null}{awaitingConfirmation ? <button type="button" className={entry.toolStatus === "failed" ? styles.secondaryButton : styles.primaryButton} onClick={onOpenProposal}>{entry.toolStatus === "failed" ? "检查后重试" : "查看并确认"} <FiChevronRight /></button> : null}</article>;
}

function DemandCard({ demand, candidateCount, onEdit, onOpen, onCandidates, onConversation }: { demand: DemandViewModel; candidateCount: number; onEdit: () => void; onOpen: () => void; onCandidates: () => void; onConversation: () => void }) {
  const effectiveStatus = effectiveDemandStatus(demand, candidateCount);
  const primary = effectiveStatus === "draft" ? "确认并开始匹配" : effectiveStatus === "matching" || effectiveStatus === "published" ? "正在匹配 · 查看详情" : effectiveStatus === "matched" ? `查看 ${candidateCount} 位候选人` : effectiveStatus === "invited" ? "邀请已发送 · 等待回应" : effectiveStatus === "communicating" ? "已匹配 · 进入聊天" : effectiveStatus === "hidden" ? "匹配已暂停" : "这条需求已取消";
  const click = effectiveStatus === "matched" ? onCandidates : effectiveStatus === "communicating" ? onConversation : onOpen;
  const dynamicRows = (demand.fields?.length ? demand.fields : [
    { title: "时间", value: demand.timeWindow }, { title: "地点", value: demand.locationText },
    { title: "同行", value: `${demand.capacityMax} 位伙伴` }, { title: "方式", value: demand.durationText },
  ]).filter((field) => field.value.trim());
  const iconFor = (label: string) => label.includes("时间") ? FiCalendar : /地点|目的地|区域/.test(label) ? FiMapPin : /人数|同行|偏好|要求/.test(label) ? FiUsers : FiClock;
  return <section className={styles.demandCard} aria-label={`${demand.title}需求卡`}><header><span><FiStar /></span><strong>{demand.title}</strong>{effectiveStatus === "draft" ? <button type="button" aria-label="编辑需求" onClick={onEdit}><FiEdit3 /></button> : <FiChevronRight />}</header>{dynamicRows.slice(0, 6).map(({ title, value }) => { const RowIcon = iconFor(title); return <button type="button" className={styles.demandRow} key={`${title}-${value}`} onClick={onOpen}><RowIcon /><span>{title}</span><strong>{value}</strong>{effectiveStatus === "draft" ? <FiEdit3 /> : <FiChevronRight />}</button> })}<button type="button" className={styles.primaryButton} onClick={click} disabled={effectiveStatus === "cancelled"}>{primary} {effectiveStatus === "matched" ? <FiChevronRight /> : <FiCheck />}</button></section>;
}

function MomentsScreen({ posts, likedPostIds, onLike, channel, onChannel, onCompose, socialIntent, taskIntent, socialApplication, taskApplication, onApplication }: { posts: FeedPost[]; likedPostIds: number[]; onLike: (id: number) => void; channel: "moments" | "social" | "tasks"; onChannel: (value: "moments" | "social" | "tasks") => void; onCompose: () => void; socialIntent: FitMeetPublicIntent | null; taskIntent: FitMeetPublicIntent | null; socialApplication: ApplicationViewStatus; taskApplication: ApplicationViewStatus; onApplication: (kind: "social" | "task", status: ApplicationViewStatus) => void }) {
  return <div className={styles.standardScreen}><header className={styles.screenHeader}><div><h1>发现</h1><p>分享动态，也看看附近真实需求</p></div><button type="button" aria-label="发布动态" onClick={onCompose}><FiPlus /></button></header><div className={styles.segmented}>{(["moments", "social", "tasks"] as const).map((id) => <button type="button" key={id} className={channel === id ? styles.segmentActive : ""} onClick={() => onChannel(id)}>{id === "moments" ? "朋友圈" : id === "social" ? "社交大厅" : "任务大厅"}</button>)}</div>{channel === "moments" ? <div className={styles.feedList}>{posts.length ? posts.map((post) => <article className={styles.postCard} key={post.id}><header><Avatar name={post.username} color={post.id % 2 ? "#ed7f94" : "#6889ec"} /><div><strong>{post.username}</strong><small>{post.createdAt} · {post.city}</small></div><FiMoreHorizontal /></header><h2>{post.title}</h2><p>{post.text}</p><div className={styles.postImage}><span>{post.tags[0]?.slice(0, 1) ?? "F"}</span></div><div className={styles.tagRow}>{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><footer><button type="button" className={likedPostIds.includes(post.id) ? styles.liked : ""} onClick={() => onLike(post.id)}><FiHeart /> {post.likes}</button><button type="button"><FiMessageCircle /> {post.comments}</button><button type="button"><FiSend /> 分享</button></footer></article>) : <p className={styles.emptyState}>暂时没有动态。你可以发布第一条轻松的近况。</p>}</div> : <DiscoveryHall task={channel === "tasks"} intent={channel === "tasks" ? taskIntent : socialIntent} status={channel === "tasks" ? taskApplication : socialApplication} onAction={(status) => onApplication(channel === "tasks" ? "task" : "social", status)} />}</div>;
}

function DiscoveryHall({ task, intent, status, onAction }: { task: boolean; intent: FitMeetPublicIntent | null; status: ApplicationViewStatus; onAction: (status: ApplicationViewStatus) => void }) {
  if (!intent) return <section className={styles.discoveryHall}><p className={styles.emptyState}>暂时没有可申请的真实需求。你可以稍后再看，或发布自己的需求卡。</p></section>;
  const title = intent.title || (task ? "服务需求" : "社交需求");
  const action = status === "idle" ? task ? "申请接单" : "申请加入" : status === "pending" ? "等待对方确认" : status === "accepted" ? "已接受 · 可进入会话" : status === "rejected" ? "对方暂未接受" : "申请已取消";
  return <section className={styles.discoveryHall}><p className={styles.hallNotice}><FiShield /> 精确位置不会展示；申请被接受前不开放连续私信。</p><article><span>{task ? "任务大厅" : "社交大厅"}</span><h2>{title}</h2><p>{intent.summary || intent.text || "发布者希望先确认活动节奏与边界。"}</p><div className={styles.tagRow}>{(intent.tags || []).slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}<span>{intent.timeWindow || "时间待确认"}</span></div><button type="button" className={styles.primaryButton} onClick={() => status === "idle" || status === "cancelled" ? onAction("pending") : status === "pending" ? onAction("cancelled") : undefined}>{status === "pending" ? "取消申请" : action} <FiChevronRight /></button>{status === "accepted" ? <p className={styles.statusRow}><FiCheck /> 申请已被接受；真实会话已开放。</p> : null}</article></section>;
}

function MessagesScreen({ invitations, conversations, currentUserId, onConversation, onInvitation, onMeet, onRelationship }: { invitations: MeetInvitation[]; conversations: FitMeetConversation[]; currentUserId: number; onConversation: (id: string) => void; onInvitation: (invitation: MeetInvitation, action: "accept" | "reject" | "cancel") => void; onMeet: () => void; onRelationship: () => void }) {
  const pendingReceived = invitations.filter((invitation) => invitation.status === "pending" && Number(invitation.inviteeUserId) === Number(currentUserId));
  const pendingSent = invitations.filter((invitation) => invitation.status === "pending" && Number(invitation.inviterUserId) === Number(currentUserId));
  return <div className={styles.standardScreen}><header className={styles.messageHeader}><h1>消息</h1><p>只有双方确认后，连续会话才会开放</p></header><button type="button" className={styles.searchButton}><FiSearch /> 搜索消息</button><section className={styles.quickMessages}><button type="button" onClick={onRelationship}><span><FiUserPlus /></span>关系申请</button><button type="button"><span><FiBell /></span>系统通知</button><button type="button" onClick={onMeet}><span><FiCalendar /></span>待处理{pendingReceived.length ? <small>{pendingReceived.length}</small> : null}</button></section>{pendingReceived.length ? <><h2 className={styles.listTitle}>收到的邀请</h2>{pendingReceived.map((invitation) => <article className={styles.inboxAction} key={invitation.id}><span><FiCalendar /></span><div><strong>{invitation.title || "FitMeet 活动邀请"}</strong><p>{invitation.message || "对方邀请你一起参与活动。"}</p><small>{invitation.timeWindow || "时间待确认"} · {invitation.locationText || "公共区域集合"}</small><div className={styles.inlineActions}><button type="button" onClick={() => onInvitation(invitation, "accept")}>接受</button><button type="button" onClick={() => onInvitation(invitation, "reject")}>婉拒</button></div></div></article>)}</> : null}{pendingSent.length ? <><h2 className={styles.listTitle}>等待回应</h2>{pendingSent.map((invitation) => <article className={styles.inboxAction} key={invitation.id}><span><FiCalendar /></span><div><strong>{invitation.title || "活动邀请"}</strong><p>等待对方自主决定；接受前不会开放连续私信。</p><div className={styles.inlineActions}><button type="button" onClick={() => onInvitation(invitation, "cancel")}>撤回邀请</button></div></div></article>)}</> : null}<h2 className={styles.listTitle}>全部消息</h2>{conversations.length ? conversations.map((conversation) => <button type="button" className={styles.messageRow} key={conversation.id} onClick={() => onConversation(conversation.id)}><Avatar name={conversation.displayName || conversation.username || "F"} color="#9d7df2" /><span><strong>{conversation.displayName || conversation.username || "FitMeet 用户"}</strong><small>{conversation.lastMessage || "会话已开放"}</small></span>{conversation.unread ? <time>{conversation.unread}</time> : <time>{conversation.updatedAt || conversation.time || ""}</time>}</button>) : <p className={styles.emptyState}>还没有已开放的会话。接受一项活动邀请，或等待对方接受你的邀请后，就可以在这里继续聊天。</p>}</div>;
}

function ProfileScreen({ profile, notificationEnabled, postCount, relationshipCount, onEdit, onPrivacy, onSettings, onRelationships, onReboard }: { profile: SocialProfile; notificationEnabled: boolean; postCount: number; relationshipCount: number; onEdit: () => void; onPrivacy: () => void; onSettings: () => void; onRelationships: () => void; onReboard: () => void }) {
  return <div className={styles.profileScreen}><header><button type="button" aria-label="隐私设置" onClick={onPrivacy}><FiShield /></button><button type="button" aria-label="设置" onClick={onSettings}><FiSettings /></button></header><section className={styles.profileHero}><Avatar name={profile.nickname} color="#657cf3" size={72} /><div><h1>{profile.nickname}</h1><p>{profile.city || "城市待填写"}</p><span>内测资料</span></div><button type="button" onClick={onEdit}>编辑资料</button></section><p className={styles.profileBio}>{profile.bio || "写几句话介绍自己，让小福更好地理解你的兴趣与边界。"}</p><section className={styles.profileStats}><span><strong>{postCount}</strong>动态</span><span><strong>{profile.interests.length}</strong>兴趣</span><span><strong>{relationshipCount}</strong>待处理关系</span></section><div className={styles.profileTags}>{profile.interests.map((interest) => <span key={interest}>{interest}</span>)}</div><section className={styles.profileRows}><button type="button" onClick={onRelationships}><span><FiUsers /></span><strong>我的关系</strong><small>{relationshipCount ? `${relationshipCount} 个待处理` : "好友与申请"}</small><FiChevronRight /></button><button type="button" onClick={onPrivacy}><span><FiLock /></span><strong>隐私边界</strong><small>附近推荐 / 先聊天</small><FiChevronRight /></button><button type="button" onClick={onSettings}><span><FiBell /></span><strong>通知设置</strong><small>{notificationEnabled ? "已开启" : "已关闭"}</small><FiChevronRight /></button><button type="button" onClick={onReboard}><span><FiSliders /></span><strong>重新完善资料</strong><small>完整 onboarding</small><FiChevronRight /></button></section></div>;
}

function CandidateSheet({ candidate, candidates, relationship, inviteStatus, onClose, onSelect, onDismiss, onSave, onFriend, onInvite, onConversation }: { candidate: CandidateViewModel; candidates: CandidateViewModel[]; relationship: RelationshipState; inviteStatus: InvitationViewStatus; onClose: () => void; onSelect: (id: number) => void; onDismiss: () => void; onSave: () => void; onFriend: () => void; onInvite: () => void; onConversation: () => void }) {
  const invitationAccepted = inviteStatus === "accepted";
  return <Sheet title="候选人" onClose={onClose}><p className={styles.sheetLead}>先看共同点和活动节奏，再决定要不要继续。没有“必须合适”的人。</p><div className={styles.candidatePicker}>{candidates.map((item) => <button type="button" key={item.id} className={candidate.id === item.id ? styles.candidatePickerActive : ""} onClick={() => onSelect(item.id)}>{item.name}</button>)}</div><article className={styles.candidateDetail}><header><Avatar name={candidate.name} color="#9d7df2" size={68} /><div><h3>{candidate.name}</h3><p>{candidate.age} · {candidate.sport} · {candidate.level} · {candidate.distance}</p></div></header><p className={styles.candidateReason}><FiStar /> {candidate.reason}</p><div className={styles.tagRow}>{candidate.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><p className={styles.sheetSafety}><FiShield /> 小福不会替你私信。对方接受邀请或好友申请后，才能聊天。</p><div className={styles.stackActions}><button type="button" className={styles.secondaryButton} onClick={onSave}><FiBookmark /> 先收藏</button><button type="button" className={styles.secondaryButton} onClick={onDismiss}>这次不合适</button>{relationship === "none" ? <button type="button" className={styles.secondaryButton} onClick={onFriend}><FiUserPlus /> 先申请好友</button> : null}<button type="button" className={styles.primaryButton} onClick={invitationAccepted ? onConversation : onInvite} disabled={inviteStatus === "sent"}>{inviteStatus === "sent" ? "邀请已发送 · 等待回应" : invitationAccepted ? <>已匹配 · 进入聊天 <FiChevronRight /></> : <>生成邀请草稿 <FiChevronRight /></>}</button></div></article></Sheet>;
}

function DemandListSheet({ demands, activeDemandId, onClose, onSelect, onCreate }: { demands: FitMeetDemand[]; activeDemandId?: string; onClose: () => void; onSelect: (demand: FitMeetDemand) => void; onCreate: () => void }) {
  return <Sheet title="我的需求" onClose={onClose}>
    <p className={styles.sheetLead}>每条需求都保留独立的卡片、候选、邀请和会话状态。切换不会覆盖其他需求。</p>
    <div className={styles.demandList}>
      {demands.length ? demands.map((item) => <button type="button" key={item.id} className={item.id === activeDemandId ? styles.demandListActive : ""} onClick={() => onSelect(item)}>
        <span><strong>{item.title || item.category || "未命名需求"}</strong><small>{item.summary || "打开查看需求详情"}</small></span>
        <i>{demandStatusCopy(item)}</i>
        <FiChevronRight />
      </button>) : <p className={styles.emptyState}>还没有已发布的需求。你可以先告诉小福一个不完整的想法。</p>}
    </div>
    <button type="button" className={styles.primaryButton} onClick={onCreate}><FiPlus /> 新建一条需求</button>
    <p className={styles.sheetSafety}><FiShield /> 新建不会删除历史需求；发布、邀请和聊天仍需按各自状态确认。</p>
  </Sheet>;
}

function DemandSheet({ demand, candidateCount, onClose, onEdit, onPublish, onHide, onCancel, onCandidates, onConversation }: { demand: DemandViewModel; candidateCount: number; onClose: () => void; onEdit: () => void; onPublish: () => void; onHide: () => void; onCancel: () => void; onCandidates: () => void; onConversation: () => void }) {
  const effectiveStatus = effectiveDemandStatus(demand, candidateCount);
  const statusText = effectiveStatus === "draft" ? "待确认" : ["matching", "published"].includes(effectiveStatus) ? "正在匹配" : effectiveStatus === "matched" ? "已找到候选人" : effectiveStatus === "invited" ? "已发送邀请" : effectiveStatus === "communicating" ? "已匹配，可聊天" : effectiveStatus === "hidden" ? "已暂停" : "已取消";
  const detailFields = demand.fields?.length ? demand.fields : [{ title: "时间", value: demand.timeWindow }, { title: "地点", value: demand.locationText }, { title: "边界", value: demand.privacyBoundary }];
  return <Sheet title="我的需求" onClose={onClose}><p className={styles.sheetLead}>需求先以草稿保存。发布、暂停、取消和查看候选人都对应 iOS 的 demand 状态，而不是一次性的展示按钮。</p><article className={styles.detailCard}><span>当前状态</span><strong>{statusText}</strong><p>{demand.summary}</p><dl className={styles.detailRows}>{detailFields.slice(0, 6).map((field) => <div key={`${field.title}-${field.value}`}><dt>{field.title}</dt><dd>{field.value}</dd></div>)}</dl></article><div className={styles.stackActions}>{effectiveStatus === "draft" ? <button type="button" className={styles.secondaryButton} onClick={onEdit}><FiEdit3 /> 编辑草稿</button> : null}{effectiveStatus === "draft" || effectiveStatus === "hidden" ? <button type="button" className={styles.primaryButton} onClick={onPublish}>确认并开始匹配</button> : null}{effectiveStatus === "matched" ? <button type="button" className={styles.primaryButton} onClick={onCandidates}>查看 {candidateCount} 位候选人</button> : null}{effectiveStatus === "communicating" ? <button type="button" className={styles.primaryButton} onClick={onConversation}>进入聊天</button> : null}{effectiveStatus === "invited" ? <p className={styles.statusRow}><FiClock /> 等待对方接受；接受前不会开放连续私信。</p> : null}{["published", "matching", "matched"].includes(effectiveStatus) ? <button type="button" className={styles.secondaryButton} onClick={onHide}>暂停匹配</button> : null}{!["cancelled", "communicating"].includes(effectiveStatus) ? <button type="button" className={styles.dangerButton} onClick={onCancel}>取消这条需求</button> : null}</div></Sheet>;
}

function DemandEditSheet({ demand, onClose, onSave }: { demand: DemandViewModel; onClose: () => void; onSave: (demand: DemandViewModel) => void }) {
  const [draft, setDraft] = useState(demand);
  const fields = draft.fields || [];
  return <Sheet title="编辑需求草稿" onClose={onClose}><p className={styles.sheetLead}>字段由小福根据这一次真实需求动态整理，不会把 Citywalk、咖啡、服务或求助强行套进运动模板。</p><article className={styles.detailCard}><span>小福理解的需求</span><strong>{draft.title}</strong><p>{draft.summary}</p></article><div className={styles.draftForm}>{fields.map((field, index) => <Field label={field.title} key={`${field.title}-${index}`}><input value={field.value} placeholder={`补充${field.title}`} onChange={(event) => setDraft((current) => ({ ...current, fields: (current.fields || []).map((item, fieldIndex) => fieldIndex === index ? { ...item, value: event.target.value } : item) }))} /></Field>)}</div><button type="button" className={styles.primaryButton} onClick={() => onSave({ ...draft, status: "draft" })}>保存并让小福继续理解</button></Sheet>;
}

function InviteSheet({ candidate, demand, onClose, onSend }: { candidate: CandidateViewModel; demand: DemandViewModel; onClose: () => void; onSend: (message: string) => void }) {
  const [message, setMessage] = useState(invitationMessage(candidate, demand));
  return <Sheet title={`邀请 ${candidate.name} 一起活动`} onClose={onClose}><div className={styles.inviteDraft}><span>邀请说明</span><textarea className={styles.publishTextarea} aria-label="邀请文案" value={message} onChange={(event) => setMessage(event.target.value)} /><small>发送前可以随时修改；对方接受前不会开放私信。</small></div><button type="button" className={styles.primaryButton} disabled={!message.trim()} onClick={() => onSend(message)}><FiSend /> 确认发送邀请</button></Sheet>;
}

function proposalArguments(entry: AgentThreadEntry) {
  const candidate = entry.payload?.arguments;
  return candidate && typeof candidate === "object" && !Array.isArray(candidate) ? candidate as Record<string, unknown> : {};
}

function proposalApprovalCopy(proposal: AgentThreadEntry) {
  const args = proposalArguments(proposal);
  const action = typeof args.action === "string" ? args.action : "";
  const titles: Record<string, string> = {
    press_demand_card_button: action === "publish" ? "确认发布需求卡" : action === "hide" ? "确认暂停匹配" : action === "cancel" ? "确认取消需求" : "确认操作需求卡",
    send_invitation: "确认发送邀请",
    request_service_connection: "确认联系服务者",
    block_user: "确认拉黑用户",
    report_user: "确认提交举报",
    patch_social_profile: "确认更新资料",
  };
  const summaries: Record<string, string> = {
    press_demand_card_button: `将${action === "publish" ? "发布" : action === "hide" ? "暂停" : action === "cancel" ? "取消" : "操作"}这张需求卡；系统会以服务端实际状态为准。`,
    send_invitation: "对方可以自主接受或婉拒；接受前不会开放连续私信。",
    request_service_connection: "这会创建一条联系请求，不会绕过对方或直接开启聊天。",
    block_user: "拉黑后，对方不会再出现在推荐或会话入口中。",
    report_user: "举报会提交给安全流程；小福不会替你继续联系对方。",
    patch_social_profile: "只会写入下方列出的资料或隐私字段。",
  };
  return { title: titles[proposal.toolName || ""] || "确认这项操作", summary: summaries[proposal.toolName || ""] || "这项操作会影响账号或与他人的关系，需要你明确确认。" };
}

function ToolApprovalSheet({ proposal, onClose, onResolve }: { proposal: AgentThreadEntry; onClose: () => void; onResolve: (decision: "approve" | "decline", message?: string) => void }) {
  const args = proposalArguments(proposal);
  const approval = proposalApprovalCopy(proposal);
  const editable = proposal.toolName === "send_invitation" || proposal.toolName === "request_service_connection";
  const [message, setMessage] = useState(typeof args.message === "string" ? args.message : "");
  const displayedArguments = Object.entries(args).filter(([key]) => !["message", "invitation_message", "service_message"].includes(key));
  return <Sheet title={approval.title} onClose={onClose}><p className={styles.sheetLead}><FiShield /> {approval.summary}</p><article className={styles.detailCard}><span>你将确认的内容</span>{editable ? <><textarea className={styles.publishTextarea} aria-label="确认前可编辑的文案" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="写一句你想表达的话" /><small>你可以先改成自己舒服的说法；发送前仍由你最后确认。</small></> : null}{displayedArguments.length ? <dl className={styles.detailRows}>{displayedArguments.map(([key, value]) => <div key={key}><dt>{key.replace(/_/g, " ")}</dt><dd>{typeof value === "string" ? value : JSON.stringify(value)}</dd></div>)}</dl> : null}</article><div className={styles.stackActions}><button type="button" className={styles.primaryButton} disabled={editable && !message.trim()} onClick={() => onResolve("approve", editable ? message.trim() : undefined)}><FiCheck /> 我确认执行</button><button type="button" className={styles.secondaryButton} onClick={() => onResolve("decline")}>不执行这一步</button></div><p className={styles.sheetSafety}><FiShield /> 只有服务端返回成功后，界面才会显示“已完成”；网络失败不会被当作已发送或已发布。</p></Sheet>;
}

function ComposeSheet({ value, images, publishing, onChange, onFiles, onRemoveImage, onClose, onPublish }: { value: string; images: MomentDraftImage[]; publishing: boolean; onChange: (value: string) => void; onFiles: (files: File[]) => void; onRemoveImage: (id: string) => void; onClose: () => void; onPublish: () => void }) {
  return <Sheet title="发布动态" onClose={onClose}><textarea className={styles.publishTextarea} value={value} onChange={(event) => onChange(event.target.value)} placeholder="分享一个今天的瞬间，或说说你正在寻找的同伴…" aria-label="动态内容" />{images.length ? <div className={styles.momentDraftGrid}>{images.map((image) => <figure key={image.id}><img src={image.preview} alt="待发布图片预览" /><button type="button" aria-label="移除图片" onClick={() => onRemoveImage(image.id)}><FiX /></button></figure>)}</div> : null}<label className={styles.momentMediaPicker}><FiImage /><span><strong>添加图片</strong><small>{images.length}/9 · 单张不超过 8MB</small></span><input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={publishing || images.length >= 9} onChange={(event) => { onFiles(Array.from(event.target.files || [])); event.target.value = ""; }} /></label><div className={styles.publishOptions}><span><FiMapPin /> 模糊定位</span><span><FiUsers /> 公开给同城兴趣圈</span></div><button type="button" className={styles.primaryButton} onClick={onPublish} disabled={publishing || (!value.trim() && !images.length)}>{publishing ? "正在审核并发布…" : "发布到朋友圈"}</button><p className={styles.sheetSafety}><FiShield /> 图片先上传到统一审核接口；全部通过后才会创建动态。</p></Sheet>;
}

function ConversationSheet({ conversation, unlocked, closed, items, input, onInput, onSend, onMute, onRecall, onReport, onBlock, onClose }: { conversation: FitMeetConversation; unlocked: boolean; closed: boolean; items: ConversationMessage[]; input: string; onInput: (value: string) => void; onSend: () => void; onMute: () => void; onRecall: (id: string) => void; onReport: (id: string) => void; onBlock: () => void; onClose: () => void }) {
  const [actionMessageId, setActionMessageId] = useState<string | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const title = conversation.displayName || conversation.username || "FitMeet 用户";
  const muted = conversation.notificationLevel === "muted" || Boolean(conversation.mutedUntil && new Date(conversation.mutedUntil).getTime() > Date.now());
  return <Sheet title={title} onClose={onClose}>{closed ? null : <div className={styles.threadToolbar}><button type="button" onClick={onMute}><FiBell /> {muted ? "恢复提醒" : "静音"}</button><button type="button" className={confirmBlock ? styles.threadDangerAction : ""} onClick={() => { if (confirmBlock) onBlock(); else setConfirmBlock(true); }}><FiShield /> {confirmBlock ? "确认拉黑" : "拉黑"}</button></div>}<p className={styles.threadNote}><FiShield /> {closed ? "这段旧会话已关闭；历史记录只读保留" : unlocked ? "双方确认后开放的真实会话；当前服务端仅支持文字消息" : "等待双方接受邀请或好友关系后，才会开启连续会话"}</p>{unlocked || closed ? <div className={styles.thread}>{items.map((item) => {
    const recalled = item.lifecycleStatus === "recalled" || Boolean(item.recalledAt);
    const canRecall = item.role === "user" && !recalled && Date.now() - new Date(item.createdAt).getTime() <= 2 * 60 * 1000;
    return <article key={item.id} className={`${styles.threadMessage} ${item.role === "user" ? styles.threadMine : ""}`}><p>{item.text}</p><footer><small>{item.role === "user" ? recalled ? "已撤回" : item.readByOther ? "已读" : item.status === "delivered" ? "已送达" : "已发送" : new Date(item.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</small>{!recalled ? <button type="button" aria-label="消息操作" onClick={() => setActionMessageId(actionMessageId === item.id ? null : item.id)}><FiMoreHorizontal /></button> : null}</footer>{actionMessageId === item.id ? <aside>{canRecall ? <button type="button" onClick={() => { onRecall(item.id); setActionMessageId(null); }}><FiTrash2 /> 撤回消息</button> : null}{item.role === "peer" ? <button type="button" onClick={() => { onReport(item.id); setActionMessageId(null); }}><FiFlag /> 举报消息</button> : null}{!canRecall && item.role === "user" ? <small>发送超过 2 分钟，无法撤回</small> : null}</aside> : null}</article>;
  })}</div> : null}{unlocked ? <form className={styles.sheetComposer} onSubmit={(event) => { event.preventDefault(); onSend(); }}><input value={input} onChange={(event) => onInput(event.target.value)} placeholder="说点什么" aria-label="消息内容" /><button type="submit" aria-label="发送消息" disabled={!input.trim()}><FiSend /></button></form> : <section className={styles.lockedConversation}><FiLock /><strong>{closed ? "旧会话已关闭" : "还没有开启会话"}</strong><p>{closed ? "解除拉黑不会自动恢复原关系。重新匹配、重新邀请或双方重新建立关系后，新的会话才会开放。" : "你可以等待对方决定，也可以撤回邀请；小福不会替你越过这一步。"}</p></section>}</Sheet>;
}

function MemorySheet({ memories, onClose, onSave, onDelete }: { memories: FitMeetAgentMemory[]; onClose: () => void; onSave: (id: string) => void; onDelete: (id: string) => void }) {
  return <Sheet title="人物画像" onClose={onClose}><p className={styles.sheetLead}>小福只会在你确认后保存偏好。你可以随时修改或删除。</p><section className={styles.memoryList}>{memories.length ? memories.map((memory) => <article key={memory.id}><span>{memory.memoryType}</span><strong>{memory.value || memory.summary || "未填写"}</strong><p>推荐时会先解释共同点和安全边界，不会替你做决定。</p><div className={styles.inlineActions}>{memory.status === "confirmed" || memory.status === "active" ? <button type="button" onClick={() => void onDelete(memory.id)}><FiTrash2 /> 删除</button> : <button type="button" onClick={() => void onSave(memory.id)}>确认保存</button>}</div></article>) : <p className={styles.emptyState}>没有已保存的偏好。你可以在对话中告诉小福什么会让你感到舒服。</p>}</section></Sheet>;
}

function HistorySheet({ threads, activeThreadId, onClose, onNew, onSelect }: { threads: AgentThread[]; activeThreadId?: string; onClose: () => void; onNew: () => void; onSelect: (id: string) => void }) {
  return <Sheet title="对话记录" onClose={onClose}><p className={styles.sheetLead}>对话和需求草稿已同步到你的内测账号；刷新或换到 iOS、微信端后都可继续。</p><div className={styles.historyList}>{threads.length ? threads.map((thread) => <button type="button" key={thread.id} onClick={() => onSelect(thread.id)}><strong>{thread.title}</strong><p>{thread.preview || "等待你继续说说这个想法"}</p><small>{thread.id === activeThreadId ? "当前对话" : "打开这段对话"}</small></button>) : <p className={styles.emptyState}>还没有已保存的对话。</p>}</div><button type="button" className={styles.primaryButton} onClick={onNew}>开始新的对话</button></Sheet>;
}

function EditProfileSheet({ profile, onClose, onSave }: { profile: SocialProfile; onClose: () => void; onSave: (patch: Partial<SocialProfile>) => void }) {
  const [nickname, setNickname] = useState(profile.nickname); const [city, setCity] = useState(profile.city); const [bio, setBio] = useState(profile.bio);
  return <Sheet title="编辑资料" onClose={onClose}><Field label="昵称"><input value={nickname} onChange={(event) => setNickname(event.target.value)} /></Field><Field label="城市"><input value={city} onChange={(event) => setCity(event.target.value)} /></Field><Field label="介绍"><textarea value={bio} onChange={(event) => setBio(event.target.value)} /></Field><button type="button" className={styles.primaryButton} onClick={() => onSave({ nickname, city, bio })}>保存资料</button></Sheet>;
}

function PrivacySheet({ profile, onClose, onSave }: { profile: SocialProfile; onClose: () => void; onSave: (patch: Partial<SocialProfile>) => void }) {
  const [draft, setDraft] = useState(profile); return <Sheet title="隐私设置" onClose={onClose}><p className={styles.sheetLead}><FiShield /> 控制推荐曝光和约练提醒，不展示精确位置。</p>{[["profileDiscoverable", "附近推荐", "只使用模糊区域，不展示精确位置"], ["agentCanRecommendMe", "允许小福推荐我", "仅在你公开的兴趣和边界内推荐"], ["agentCanStartChatAfterApproval", "确认后可开启私信", "需双方已接受关系或邀请"], ["hideSensitiveTags", "隐藏敏感标签", "资料页不展示敏感偏好"]].map(([key, title, copy]) => <label className={styles.switchRow} key={key}><span><strong>{title}</strong><small>{copy}</small></span><input type="checkbox" checked={Boolean(draft[key as keyof SocialProfile])} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.checked }))} /><i /></label>)}<button type="button" className={styles.primaryButton} onClick={() => onSave(draft)}>保存隐私设置</button></Sheet>;
}

function SettingsSheet({ notificationEnabled, onNotification, onClose, onReset, onSafety }: { notificationEnabled: boolean; onNotification: (value: boolean) => void; onClose: () => void; onReset: () => void; onSafety: () => void }) {
  return <Sheet title="设置" onClose={onClose}><label className={styles.switchRow}><span><strong>通知设置</strong><small>私信、互动和约练提醒仅当前设备生效</small></span><input type="checkbox" checked={notificationEnabled} onChange={(event) => onNotification(event.target.checked)} /><i /></label><div className={styles.settingsActions}><button type="button" onClick={onSafety}><FiFlag /> 举报与安全帮助</button><button type="button" onClick={onReset}><FiSliders /> 重新完善资料</button></div><p className={styles.sheetSafety}><FiShield /> 举报、拉黑、邀约与会话均写入同一后端合同；小福不会代替你做决定。</p></Sheet>;
}

function RelationshipSheet({ incoming, outgoing, onClose, onAction }: { incoming: FitMeetConnectionRequest[]; outgoing: FitMeetConnectionRequest[]; onClose: () => void; onAction: (request: FitMeetConnectionRequest, action: "accept" | "reject" | "cancel") => void }) {
  return <Sheet title="我的关系" onClose={onClose}><p className={styles.sheetLead}>关系申请、接受与拒绝都由服务端写入；没有任何动作会替你自动完成。</p>{incoming.length ? incoming.map((request) => <article className={styles.relationshipCard} key={request.id}><Avatar name={request.requesterName || "F"} color="#9d7df2" size={56} /><div><strong>{request.requesterName || "FitMeet 用户"}</strong><p>{request.message || "想先从共同兴趣开始聊聊。"}</p></div><div className={styles.inlineActions}><button type="button" onClick={() => onAction(request, "accept")}>接受</button><button type="button" onClick={() => onAction(request, "reject")}>拒绝</button></div></article>) : null}{outgoing.length ? outgoing.map((request) => <article className={styles.relationshipCard} key={request.id}><Avatar name={request.targetName || "F"} color="#7790e8" size={56} /><div><strong>{request.targetName || "FitMeet 用户"}</strong><p>等待对方决定；在接受前不会开放连续私信。</p></div><button type="button" onClick={() => onAction(request, "cancel")}>撤回</button></article>) : null}{!incoming.length && !outgoing.length ? <p className={styles.emptyState}>还没有待处理的关系申请。你可以从真实候选人页先发起申请。</p> : null}<p className={styles.sheetSafety}><FiShield /> 好友关系、邀请和会话权限由服务端状态决定；拒绝、取消或拉黑都不会开放聊天。</p></Sheet>;
}

function MeetLifecycleSheet({ meet, demand, onClose, onUpdate }: { meet: MeetViewModel; demand: DemandViewModel; onClose: () => void; onUpdate: (status: MeetViewStatus, review?: MeetViewModel["review"]) => void }) {
  return <Sheet title="活动闭环" onClose={onClose}><p className={styles.sheetLead}>开始前提醒、确认到达、完成活动、爽约和评价都会改变状态；不会被悄悄跳过。</p><article className={styles.detailCard}><span>当前状态</span><strong>{meet.status === "scheduled" ? "等待出发" : meet.status === "arrived" ? "已确认到达" : meet.status === "completed" ? "已完成活动" : meet.status === "no_show" ? "已记录爽约" : meet.status === "cancelled" ? "已取消" : "尚未建立"}</strong><p>{demand.timeWindow} · {demand.locationText} · {demand.privacyBoundary}</p></article>{meet.status === "scheduled" ? <div className={styles.lifecycleGrid}><button type="button" className={styles.primaryButton} onClick={() => onUpdate("arrived")}>确认到达</button><button type="button" className={styles.secondaryButton} onClick={() => onUpdate("cancelled")}>取消活动</button></div> : null}{meet.status === "arrived" ? <div className={styles.lifecycleGrid}><button type="button" className={styles.primaryButton} onClick={() => onUpdate("completed")}>完成活动</button><button type="button" className={styles.secondaryButton} onClick={() => onUpdate("no_show")}>报告爽约</button></div> : null}{meet.status === "completed" && !meet.review ? <div className={styles.reviewChoices}><p>这次活动感觉如何？</p>{(["守约", "愉快", "不合适"] as const).map((review) => <button type="button" key={review} onClick={() => onUpdate("completed", review)}>{review}</button>)}</div> : null}{meet.review ? <p className={styles.statusRow}><FiCheck /> 已提交「{meet.review}」评价；不会公开你的私人感受。</p> : null}{meet.status === "no_show" ? <p className={styles.sheetSafety}><FiShield /> 已记录。若涉及人身安全或持续骚扰，请使用安全帮助；否则你也可以只结束这次活动。</p> : null}</Sheet>;
}

function SafetySheet({ onClose, onReport, onBlock }: { onClose: () => void; onReport: () => void; onBlock: () => void }) {
  return <Sheet title="安全帮助" onClose={onClose}><p className={styles.sheetLead}>如果有人让你不舒服、绕过边界或出现安全风险，先停止互动。你不需要解释原因。</p><div className={styles.stackActions}><button type="button" className={styles.secondaryButton} onClick={onReport}><FiFlag /> 记录安全帮助请求</button><button type="button" className={styles.dangerButton} onClick={onBlock}>拉黑并停止推荐</button></div><p className={styles.sheetSafety}><FiShield /> 举报写入统一安全审核接口；拉黑会立即停止推荐与后续互动。</p></Sheet>;
}

function AccountSafetySheet({ profile, photos, onClose, onPrivacy, onRelationships }: { profile: SocialProfile; photos: FitMeetProfilePhoto[]; onClose: () => void; onPrivacy: () => void; onRelationships: () => void }) {
  const approvedPhotos = photos.filter((photo) => (photo.moderationStatus ?? photo.moderation_status ?? "approved") === "approved").length;
  return <Sheet title="账号与安全" onClose={onClose}><p className={styles.sheetLead}>这里管理当前内测账号的资料安全与互动边界，不会默认举报任何候选人。</p><div className={styles.accountSafetyGrid}><span><FiShield /><strong>资料状态</strong><small>{profile.profileDiscoverable ? "可被发现" : "已隐藏"}</small></span><span><FiImage /><strong>照片审核</strong><small>{approvedPhotos} 张已通过</small></span><span><FiLock /><strong>敏感标签</strong><small>{profile.hideSensitiveTags ? "已保护" : "标准展示"}</small></span><span><FiMessageCircle /><strong>聊天权限</strong><small>双方确认后开放</small></span></div><div className={styles.settingsActions}><button type="button" onClick={onPrivacy}><FiEye /> 检查隐私与推荐范围</button><button type="button" onClick={onRelationships}><FiUsers /> 管理好友与关系申请</button></div><p className={styles.sheetSafety}><FiShield /> 精确位置与联系方式不会出现在公开资料；举报和拉黑需要从具体用户或动态进入并再次确认。</p></Sheet>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}
