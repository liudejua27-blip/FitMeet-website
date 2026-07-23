"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { FiBell, FiCalendar, FiChevronRight, FiHeart, FiMessageCircle, FiRefreshCw, FiSearch, FiUserPlus, FiX } from "react-icons/fi";
import type { AgentInboxEvent, FitMeetConnectionRequest, FitMeetConversation, FitMeetIntentApplication, MeetInvitation } from "@/lib/fitmeet-api-contract";
import styles from "./fitmeet-complete.module.css";
import { useAccessibleDialog } from "./useAccessibleDialog";

type MessageCategory = "all" | "private" | "interaction" | "system";
type SearchItem = { id: string; category: Exclude<MessageCategory, "all">; title: string; subtitle: string; unread: number; action: () => void };

function MessageAvatar({ conversation }: { conversation: FitMeetConversation }) {
  const name = conversation.displayName || conversation.username || "FitMeet 用户";
  const url = conversation.avatar || conversation.peer?.avatar;
  return url ? <img className={styles.messageAvatar} src={url} alt={`${name}头像`} /> : <span className={styles.messageAvatarFallback}>{name.slice(0, 1)}</span>;
}

export function MessagesExperience({ invitations, conversations, incomingConnections, outgoingConnections, agentEvents, ownerSocialApplications, ownerTaskApplications, currentUserId, unreadCount, onConversation, onInvitation, onIntentApplication, onSystemEvent, onMeet, onRelationship, onRefresh }: {
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
  onInvitation: (invitation: MeetInvitation, action: "accept" | "reject" | "cancel") => void;
  onIntentApplication: (kind: "social" | "task", application: FitMeetIntentApplication, decision: "accept" | "reject") => void;
  onSystemEvent: (event: AgentInboxEvent) => void;
  onMeet: () => void;
  onRelationship: () => void;
  onRefresh: () => Promise<void>;
}) {
  const [category, setCategory] = useState<MessageCategory>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const searchDialogRef = useAccessibleDialog(searchOpen, () => setSearchOpen(false));
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("zh-CN"));
  const pendingReceived = invitations.filter((item) => item.status === "pending" && Number(item.inviteeUserId) === Number(currentUserId));
  const pendingSent = invitations.filter((item) => item.status === "pending" && Number(item.inviterUserId) === Number(currentUserId));
  const pendingSocialApplications = ownerSocialApplications.filter((item) => item.status === "pending");
  const pendingTaskApplications = ownerTaskApplications.filter((item) => item.status === "pending");
  const interactionCount = pendingReceived.length + pendingSent.length + incomingConnections.length + outgoingConnections.length + pendingSocialApplications.length + pendingTaskApplications.length;
  const totalUnread = unreadCount + agentEvents.length;

  const searchItems = useMemo<SearchItem[]>(() => [
    ...conversations.map((item) => ({ id: `conversation-${item.id}`, category: "private" as const, title: item.displayName || item.username || "FitMeet 用户", subtitle: item.lastMessage || "会话已开放", unread: item.unread || 0, action: () => onConversation(item.id) })),
    ...pendingReceived.map((item) => ({ id: `received-${item.id}`, category: "interaction" as const, title: item.title || "收到活动邀请", subtitle: item.message || "等待你决定是否接受", unread: 1, action: () => onMeet() })),
    ...pendingSent.map((item) => ({ id: `sent-${item.id}`, category: "interaction" as const, title: item.title || "已发送活动邀请", subtitle: "等待对方自主决定", unread: 0, action: () => onMeet() })),
    ...incomingConnections.map((item) => ({ id: `connection-in-${item.id}`, category: "interaction" as const, title: item.requesterName || "收到好友申请", subtitle: item.message || "等待你处理关系申请", unread: 1, action: onRelationship })),
    ...outgoingConnections.map((item) => ({ id: `connection-out-${item.id}`, category: "interaction" as const, title: item.targetName || "好友申请已发送", subtitle: "等待对方回应", unread: 0, action: onRelationship })),
    ...pendingSocialApplications.map((item) => ({ id: `social-application-${item.id}`, category: "interaction" as const, title: "收到社交需求申请", subtitle: item.message || `用户 ${item.applicantUserId ?? ""} 希望加入`, unread: 1, action: onRelationship })),
    ...pendingTaskApplications.map((item) => ({ id: `task-application-${item.id}`, category: "interaction" as const, title: "收到任务申请", subtitle: item.message || `用户 ${item.applicantUserId ?? ""} 希望参与`, unread: 1, action: onRelationship })),
    ...agentEvents.map((item) => ({ id: `agent-event-${item.id}`, category: "system" as const, title: item.title || "FitMeet 通知", subtitle: item.body || item.type || "账号状态已更新", unread: 1, action: () => onSystemEvent(item) })),
  ], [agentEvents, conversations, incomingConnections, onConversation, onMeet, onRelationship, onSystemEvent, outgoingConnections, pendingReceived, pendingSent, pendingSocialApplications, pendingTaskApplications]);

  const visibleSearchItems = useMemo(() => searchItems.filter((item) => {
    const categoryMatches = category === "all" || item.category === category;
    const queryMatches = !deferredQuery || `${item.title} ${item.subtitle} ${item.category}`.toLocaleLowerCase("zh-CN").includes(deferredQuery);
    return categoryMatches && queryMatches;
  }), [category, deferredQuery, searchItems]);

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };

  return <div className={styles.standardScreen}>
    <header className={styles.messageHeader}><div><h1>消息</h1><p>{totalUnread ? `${totalUnread} 条未读` : "私信、互动和通知"}</p></div><button type="button" aria-label="刷新消息" onClick={() => void refresh()} className={refreshing ? styles.spinIcon : ""}><FiRefreshCw /></button></header>
    <button type="button" className={styles.searchButton} onClick={() => setSearchOpen(true)}><FiSearch /> 搜索私信、约练或系统通知</button>
    <section className={styles.messageOverview}><span><strong>{totalUnread}</strong><small>未读</small></span><span><strong>{conversations.length}</strong><small>私信</small></span><span><strong>{interactionCount}</strong><small>互动</small></span><span><strong>{agentEvents.length}</strong><small>系统</small></span></section>
    <section className={styles.quickMessages}><button type="button" onClick={onRelationship}><span><FiHeart /></span>互动消息{incomingConnections.length ? <small>{incomingConnections.length}</small> : null}</button><button type="button" onClick={() => { setCategory("system"); setSearchOpen(true); }}><span><FiBell /></span>系统通知</button><button type="button" onClick={onMeet}><span><FiCalendar /></span>待处理{pendingReceived.length ? <small>{pendingReceived.length}</small> : null}</button></section>

    {pendingReceived.length ? <><h2 className={styles.listTitle}>待处理邀请</h2>{pendingReceived.map((item) => <article className={styles.inboxAction} key={item.id}><span><FiCalendar /></span><div><strong>{item.title || "FitMeet 活动邀请"}</strong><p>{item.message || "对方邀请你一起参与活动。"}</p><small>{item.timeWindow || "时间待确认"} · {item.locationText || "公共区域集合"}</small><div className={styles.inlineActions}><button type="button" onClick={() => onInvitation(item, "accept")}>接受</button><button type="button" onClick={() => onInvitation(item, "reject")}>婉拒</button></div></div></article>)}</> : null}
    {pendingSent.length ? <><h2 className={styles.listTitle}>等待回应</h2>{pendingSent.map((item) => <article className={styles.inboxAction} key={item.id}><span><FiCalendar /></span><div><strong>{item.title || "活动邀请"}</strong><p>接受前不会开放连续私信。</p><div className={styles.inlineActions}><button type="button" onClick={() => onInvitation(item, "cancel")}>撤回邀请</button></div></div></article>)}</> : null}
    {pendingSocialApplications.length || pendingTaskApplications.length ? <><h2 className={styles.listTitle}>需求申请</h2>{pendingSocialApplications.map((item) => <article className={styles.inboxAction} key={`social-${item.id}`}><span><FiUserPlus /></span><div><strong>社交需求申请</strong><p>{item.message || `用户 ${item.applicantUserId ?? ""} 希望加入你的需求。`}</p><div className={styles.inlineActions}><button type="button" onClick={() => onIntentApplication("social", item, "accept")}>接受</button><button type="button" onClick={() => onIntentApplication("social", item, "reject")}>婉拒</button></div></div></article>)}{pendingTaskApplications.map((item) => <article className={styles.inboxAction} key={`task-${item.id}`}><span><FiUserPlus /></span><div><strong>任务需求申请</strong><p>{item.message || `用户 ${item.applicantUserId ?? ""} 希望参与你的任务。`}</p><div className={styles.inlineActions}><button type="button" onClick={() => onIntentApplication("task", item, "accept")}>接受</button><button type="button" onClick={() => onIntentApplication("task", item, "reject")}>婉拒</button></div></div></article>)}</> : null}
    {agentEvents.length ? <><h2 className={styles.listTitle}>系统通知</h2>{agentEvents.slice(0, 5).map((item) => <button type="button" className={styles.messageRow} key={item.id} onClick={() => onSystemEvent(item)}><span className={styles.messageInteractionIcon}><FiBell /></span><span><strong>{item.title || "FitMeet 通知"}</strong><small>{item.body || item.type || "账号状态已更新"}</small></span><time className={styles.unreadBadge}>1</time><FiChevronRight /></button>)}</> : null}

    <div className={styles.messageListHeader}><h2 className={styles.listTitle}>全部消息</h2><small>{conversations.length}</small></div>
    {conversations.length ? conversations.map((item) => <button type="button" className={styles.messageRow} key={item.id} onClick={() => onConversation(item.id)}><MessageAvatar conversation={item} /><span><strong>{item.displayName || item.username || "FitMeet 用户"}</strong><small>{item.lastMessage || "会话已开放"}</small></span>{item.unread ? <time className={styles.unreadBadge}>{item.unread}</time> : <time>{item.updatedAt || item.time || ""}</time>}<FiChevronRight /></button>) : <p className={styles.emptyState}>还没有已开放的会话。双方确认邀请或关系后，会话会自动出现在这里。</p>}

      {searchOpen ? <div className={styles.sheetShade} role="presentation" onMouseDown={() => setSearchOpen(false)}><section ref={searchDialogRef} tabIndex={-1} className={`${styles.sheet} ${styles.messageSearchSheet}`} role="dialog" aria-modal="true" aria-label="搜索消息" onMouseDown={(event) => event.stopPropagation()}><div className={styles.sheetHandle} /><header><h2>搜索消息</h2><button type="button" aria-label="关闭搜索" onClick={() => setSearchOpen(false)}><FiX /></button></header><label className={styles.messageSearchInput}><FiSearch /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索私信、约练或系统通知" />{query ? <button type="button" aria-label="清空搜索" onClick={() => setQuery("")}><FiX /></button> : null}</label><div className={styles.messageCategoryTabs}>{(["all", "private", "interaction", "system"] as const).map((item) => <button type="button" key={item} className={category === item ? styles.messageCategoryActive : ""} onClick={() => setCategory(item)}>{item === "all" ? "全部" : item === "private" ? "私信" : item === "interaction" ? "互动" : "系统"}</button>)}</div><div className={styles.messageSearchResults}>{visibleSearchItems.length ? visibleSearchItems.map((item) => <button type="button" key={item.id} onClick={() => { item.action(); setSearchOpen(false); }}><span className={item.category === "private" ? styles.messagePrivateIcon : styles.messageInteractionIcon}>{item.category === "private" ? <FiMessageCircle /> : item.category === "system" ? <FiBell /> : <FiUserPlus />}</span><div><small>{item.category === "private" ? "私信" : item.category === "system" ? "系统" : "互动"}</small><strong>{item.title}</strong><p>{item.subtitle}</p></div>{item.unread ? <i>{item.unread}</i> : <FiChevronRight />}</button>) : <p className={styles.emptyState}>{category === "system" ? "当前没有系统通知。" : "没有找到匹配的消息。"}</p>}</div></section></div> : null}
  </div>;
}
