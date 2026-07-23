"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiEyeOff, FiFlag, FiHeart, FiImage, FiMessageCircle, FiMoreHorizontal, FiPlus, FiSend, FiShield, FiTrash2, FiUsers } from "react-icons/fi";
import type { FeedComment, FeedCommentPage, FeedPage, FeedPost, FitMeetIntentApplication, FitMeetPublicIntent } from "@/lib/fitmeet-api-contract";
import type { DemoApplicationStatus } from "@/lib/fitmeet-experience-runtime";
import type { FitMeetApiClient } from "@/lib/fitmeet-api-client";
import styles from "./fitmeet-complete.module.css";

type DiscoveryChannel = "moments" | "social" | "tasks";

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) || "") as T; } catch { return fallback; }
}

function writeStored(key: string, value: unknown) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

function MomentAvatar({ post }: { post: FeedPost }) {
  return <span className={styles.momentAvatar} style={{ "--moment-color": post.color || "#4f7cff" } as React.CSSProperties}>{post.username.slice(0, 1)}</span>;
}

function DiscoveryHall({ task, intents, applications, onAction }: { task: boolean; intents: FitMeetPublicIntent[]; applications: FitMeetIntentApplication[]; onAction: (intent: FitMeetPublicIntent, status: DemoApplicationStatus) => void }) {
  if (!intents.length) return <section className={styles.discoveryHall}><p className={styles.emptyState}>暂时没有可申请的真实需求。你可以稍后再看，或发布自己的需求卡。</p></section>;
  return <section className={styles.discoveryHall}><p className={styles.hallNotice}><FiShield /> 精确位置不会展示；申请被接受前不开放连续私信。</p>{intents.map((intent) => {
    const application = applications.find((item) => (task ? item.taskIntentId : item.publicIntentId) === intent.id);
    const status = (application?.status ?? "idle") as DemoApplicationStatus;
    const action = status === "idle" ? task ? "申请接单" : "申请加入" : status === "pending" ? "等待对方确认" : status === "accepted" ? "已接受 · 可进入会话" : status === "rejected" ? "对方暂未接受" : "重新申请";
    return <article key={intent.id}><span>{task ? "任务大厅" : "社交大厅"}</span><h2>{intent.title || (task ? "服务需求" : "社交需求")}</h2><p>{intent.summary || intent.text || "发布者希望先确认活动节奏与边界。"}</p><div className={styles.tagRow}>{(intent.tags || []).slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}<span>{intent.timeWindow || "时间待确认"}</span></div><button type="button" className={styles.primaryButton} disabled={["accepted", "rejected"].includes(status)} onClick={() => status === "pending" ? onAction(intent, "cancelled") : onAction(intent, "pending")}>{status === "pending" ? "取消申请" : action} <FiChevronRight /></button></article>;
  })}</section>;
}

export function MomentsExperience({ api, userId, posts, onPostsChange, likedPostIds, onLike, channel, onChannel, onCompose, onDelete, socialIntents, taskIntents, socialApplications, taskApplications, onApplication, onNotice, initialLastPage = 1 }: {
  api: FitMeetApiClient;
  userId: number;
  posts: FeedPost[];
  onPostsChange: (posts: FeedPost[]) => void;
  likedPostIds: number[];
  onLike: (id: number) => void;
  channel: DiscoveryChannel;
  onChannel: (value: DiscoveryChannel) => void;
  onCompose: () => void;
  onDelete: (post: FeedPost) => Promise<void>;
  socialIntents: FitMeetPublicIntent[];
  taskIntents: FitMeetPublicIntent[];
  socialApplications: FitMeetIntentApplication[];
  taskApplications: FitMeetIntentApplication[];
  onApplication: (kind: "social" | "task", intent: FitMeetPublicIntent, status: DemoApplicationStatus) => void;
  onNotice: (message: string) => void;
  initialLastPage?: number;
}) {
  const hiddenKey = `fitmeet:web-hidden-moments:${userId}`;
  const reportedKey = `fitmeet:web-reported-moments:${userId}`;
  const [hiddenIds, setHiddenIds] = useState<number[]>(() => readStored(hiddenKey, []));
  const [reportedIds, setReportedIds] = useState<number[]>(() => readStored(reportedKey, []));
  const [comments, setComments] = useState<Record<number, FeedComment[]>>({});
  const [commentPages, setCommentPages] = useState<Record<number, { page: number; lastPage: number }>>({});
  const [commentLoadingId, setCommentLoadingId] = useState<number | null>(null);
  const [feedScope, setFeedScope] = useState<"all" | "friends">("all");
  const [openCommentId, setOpenCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [menuPostId, setMenuPostId] = useState<number | null>(null);
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(initialLastPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const visiblePosts = useMemo(() => posts.filter((post) => !hiddenIds.includes(post.id)), [hiddenIds, posts]);

  useEffect(() => setLastPage((current) => Math.max(current, initialLastPage)), [initialLastPage]);

  const hidePost = (post: FeedPost) => {
    const next = Array.from(new Set([...hiddenIds, post.id]));
    setHiddenIds(next);
    writeStored(hiddenKey, next);
    setMenuPostId(null);
    onNotice("已隐藏这条动态；只影响当前账号的展示。");
  };

  const reportPost = async (post: FeedPost) => {
    if (reportingId) return;
    setReportingId(post.id);
    try {
      await api.reportSafety({ targetType: "feed_post", targetId: post.id, reason: "inappropriate_content", description: "网页端用户举报动态" });
      const next = Array.from(new Set([...reportedIds, post.id]));
      setReportedIds(next);
      writeStored(reportedKey, next);
      setMenuPostId(null);
      onNotice("举报已提交安全审核；不会自动联系发布者。");
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : "举报暂时未能提交。");
    } finally { setReportingId(null); }
  };

  const deletePost = async (post: FeedPost) => {
    if (pendingDeleteId !== post.id) {
      setPendingDeleteId(post.id);
      return;
    }
    if (deletingId) return;
    setDeletingId(post.id);
    try {
      await onDelete(post);
      setMenuPostId(null);
      setPendingDeleteId(null);
    } finally { setDeletingId(null); }
  };

  const sharePost = async (post: FeedPost) => {
    const url = new URL(window.location.href);
    url.searchParams.set("moment", String(post.id));
    const payload = { title: `${post.username} 的 FitMeet 动态`, text: post.text, url: url.toString() };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        onNotice("已打开系统分享面板。");
      } else {
        await navigator.clipboard.writeText(`${payload.text}\n${payload.url}`);
        onNotice("动态链接已复制，可以粘贴给朋友。");
      }
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      onNotice("系统分享不可用，请稍后重试。");
    }
  };

  const loadComments = async (postId: number, page = 1) => {
    if (commentLoadingId) return;
    setCommentLoadingId(postId);
    try {
      const result: FeedCommentPage = await api.listFeedComments(postId, page);
      setComments((current) => ({ ...current, [postId]: page === 1 ? result.data : [...(current[postId] || []), ...result.data.filter((item) => !(current[postId] || []).some((existing) => existing.id === item.id))] }));
      setCommentPages((current) => ({ ...current, [postId]: { page: result.metadata?.page ?? page, lastPage: result.metadata?.lastPage ?? page } }));
    } catch (reason) { onNotice(reason instanceof Error ? reason.message : "评论暂时无法加载。"); }
    finally { setCommentLoadingId(null); }
  };

  const submitComment = async (postId: number) => {
    const text = commentText.trim();
    if (!text) return;
    try {
      const created = await api.createFeedComment(postId, text);
      setComments((current) => ({ ...current, [postId]: [...(current[postId] || []), created] }));
      onPostsChange(posts.map((post) => post.id === postId ? { ...post, comments: post.comments + 1 } : post));
      setCommentText("");
      onNotice("评论已同步到 FitMeet 服务端。");
    } catch (reason) { onNotice(reason instanceof Error ? reason.message : "评论未能发布。"); }
  };

  const deleteComment = async (comment: FeedComment) => {
    try {
      await api.deleteFeedComment(comment.postId, comment.id);
      setComments((current) => ({ ...current, [comment.postId]: (current[comment.postId] || []).filter((item) => item.id !== comment.id) }));
      onPostsChange(posts.map((post) => post.id === comment.postId ? { ...post, comments: Math.max(0, post.comments - 1) } : post));
      onNotice("评论已删除。");
    } catch (reason) { onNotice(reason instanceof Error ? reason.message : "评论未能删除。"); }
  };

  const reportComment = async (comment: FeedComment) => {
    try {
      await api.reportFeedComment(comment.postId, comment.id);
      onNotice("评论举报已提交安全审核。");
    } catch (reason) { onNotice(reason instanceof Error ? reason.message : "评论举报未能提交。"); }
  };

  const changeFeedScope = async (scope: "all" | "friends") => {
    if (scope === feedScope) return;
    setFeedScope(scope);
    setCurrentPage(1);
    try {
      const page = scope === "friends" ? await api.getFriendFeed(1, 10) : await api.getFeed(1, 10);
      onPostsChange(page.data);
      setLastPage(page.metadata?.lastPage ?? 1);
    } catch (reason) { onNotice(reason instanceof Error ? reason.message : "动态列表暂时无法切换。"); }
  };

  const loadMore = async () => {
    if (loadingMore || currentPage >= lastPage) return;
    setLoadingMore(true);
    try {
      const page: FeedPage = feedScope === "friends" ? await api.getFriendFeed(currentPage + 1, 10) : await api.getFeed(currentPage + 1, 10);
      const existing = new Set(posts.map((post) => post.id));
      onPostsChange([...posts, ...page.data.filter((post) => !existing.has(post.id))]);
      setCurrentPage(page.metadata?.page ?? currentPage + 1);
      setLastPage(page.metadata?.lastPage ?? currentPage + 1);
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : "更多动态暂时无法加载。");
    } finally { setLoadingMore(false); }
  };

  return <div className={styles.standardScreen}>
    <header className={styles.screenHeader}><div><h1>发现</h1><p>分享动态，也看看附近真实需求</p></div><button type="button" aria-label="发布动态" onClick={onCompose}><FiPlus /></button></header>
    <div className={styles.segmented}>{(["moments", "social", "tasks"] as const).map((item) => <button type="button" key={item} className={channel === item ? styles.segmentActive : ""} onClick={() => onChannel(item)}>{item === "moments" ? "朋友圈" : item === "social" ? "社交大厅" : "任务大厅"}</button>)}</div>
    {channel !== "moments" ? <DiscoveryHall task={channel === "tasks"} intents={channel === "tasks" ? taskIntents : socialIntents} applications={channel === "tasks" ? taskApplications : socialApplications} onAction={(intent, status) => onApplication(channel === "tasks" ? "task" : "social", intent, status)} /> : <><div className={styles.feedScope} aria-label="动态范围"><button type="button" className={feedScope === "all" ? styles.feedScopeActive : ""} onClick={() => void changeFeedScope("all")}>全部动态</button><button type="button" className={feedScope === "friends" ? styles.feedScopeActive : ""} onClick={() => void changeFeedScope("friends")}><FiUsers /> 好友动态</button></div><div className={styles.feedList}>
      {visiblePosts.length ? visiblePosts.map((post) => <article className={styles.momentPost} key={post.id}>
        <header><MomentAvatar post={post} /><div><strong>{post.username}<span>✓</span></strong><small>{post.createdAt} · {post.city || "位置未公开"}</small></div><button type="button" aria-label="动态更多操作" onClick={() => { setMenuPostId(menuPostId === post.id ? null : post.id); setPendingDeleteId(null); }}><FiMoreHorizontal /></button>{menuPostId === post.id ? <aside>{Number(post.userId) === Number(userId) ? <button type="button" disabled={deletingId === post.id} onClick={() => void deletePost(post)}><FiTrash2 /> {deletingId === post.id ? "删除中" : pendingDeleteId === post.id ? "确认删除" : "删除动态"}</button> : <><button type="button" onClick={() => hidePost(post)}><FiEyeOff /> 不看这条动态</button><button type="button" disabled={reportingId === post.id || reportedIds.includes(post.id)} onClick={() => void reportPost(post)}><FiFlag /> {reportedIds.includes(post.id) ? "已举报" : reportingId === post.id ? "提交中" : "举报动态"}</button></>}</aside> : null}</header>
        {reportedIds.includes(post.id) ? <p className={styles.moderationNotice}><FiFlag /> 已提交安全审核</p> : null}
        {post.title && post.title.trim() !== post.text.trim() ? <h2>{post.title}</h2> : null}<p>{post.text}</p>
        {post.images.length ? <div className={`${styles.momentPhotoGrid} ${post.images.length === 1 ? styles.momentPhotoSingle : ""}`}>{post.images.slice(0, 6).map((image) => <img key={`${post.id}-${image.url}`} src={image.url} alt="动态图片" />)}</div> : <div className={styles.momentVisualFallback} style={{ "--moment-color": post.color || "#4f7cff" } as React.CSSProperties}><FiImage /><span>{post.emoji || "✨"}</span></div>}
        <div className={styles.tagRow}>{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        {(comments[post.id] || []).length ? <div className={styles.commentPreview}>{comments[post.id].map((comment) => <div key={comment.id}><p><strong>{comment.authorName}：</strong>{comment.body}</p><span>{comment.canDelete ? <button type="button" aria-label="删除评论" onClick={() => void deleteComment(comment)}><FiTrash2 /></button> : <button type="button" aria-label="举报评论" onClick={() => void reportComment(comment)}><FiFlag /></button>}</span></div>)}{commentPages[post.id]?.page < commentPages[post.id]?.lastPage ? <button type="button" onClick={() => void loadComments(post.id, commentPages[post.id].page + 1)}>加载更多评论</button> : null}</div> : null}
        {openCommentId === post.id ? <form className={styles.commentComposer} onSubmit={(event) => { event.preventDefault(); void submitComment(post.id); }}><input autoFocus value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="写下友善的评论" /><button type="submit" disabled={!commentText.trim()}><FiSend /></button></form> : null}
        <footer><button type="button" className={likedPostIds.includes(post.id) ? styles.liked : ""} onClick={() => onLike(post.id)}><FiHeart /> {post.likes}</button><button type="button" onClick={() => { const opening = openCommentId !== post.id; setOpenCommentId(opening ? post.id : null); setCommentText(""); if (opening && !comments[post.id]) void loadComments(post.id); }}><FiMessageCircle /> {post.comments}</button><button type="button" onClick={() => void sharePost(post)}><FiSend /> 分享</button></footer>
      </article>) : <p className={styles.emptyState}>暂时没有可展示的真实动态。你可以发布第一条近况。</p>}
      <div className={styles.paginationFooter}>{currentPage < lastPage ? <button type="button" disabled={loadingMore} onClick={() => void loadMore()}>{loadingMore ? "正在加载…" : "查看更多运动生活"}</button> : visiblePosts.length ? <span>已经看到今天最新动态</span> : null}</div>
    </div></>}
  </div>;
}
