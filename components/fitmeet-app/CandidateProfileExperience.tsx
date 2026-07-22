"use client";

import { useEffect, useMemo, useState } from "react";
import { FiBookmark, FiCheck, FiChevronLeft, FiChevronRight, FiFlag, FiHeart, FiMapPin, FiMessageCircle, FiRefreshCw, FiShield, FiStar, FiUserPlus, FiX } from "react-icons/fi";
import type { FeedPost, RelationshipState } from "@/lib/fitmeet-api-contract";
import type { FitMeetApiClient } from "@/lib/fitmeet-api-client";
import type { DemoInvitationStatus } from "@/lib/fitmeet-experience-runtime";
import type { LiveCandidate } from "@/lib/fitmeet-agent-domain";
import styles from "./fitmeet-complete.module.css";

type CandidateSurface = "deck" | "profile" | "moments";
type ConfirmAction = "report" | "block" | null;

function CandidatePhoto({ candidate, className }: { candidate: LiveCandidate; className?: string }) {
  if (candidate.avatar) return <img className={className} src={candidate.avatar} alt={`${candidate.name}的公开照片`} />;
  return <div className={`${styles.candidatePhotoFallback} ${className || ""}`} style={{ "--candidate-color": candidate.color || "#4f7cff" } as React.CSSProperties}><span>{candidate.name.slice(0, 1)}</span><small>封面未公开</small></div>;
}

function PublicMomentCard({ post, compact = false }: { post: FeedPost; compact?: boolean }) {
  return <article className={`${styles.candidateMomentCard} ${compact ? styles.candidateMomentCompact : ""}`}>
    {post.images[0]?.url ? <img src={post.images[0].url} alt="公开动态图片" /> : <div className={styles.candidateMomentVisual} style={{ "--moment-color": post.color || "#4f7cff" } as React.CSSProperties}>{post.emoji || "✨"}</div>}
    <div><strong>{post.title || post.text}</strong><small>{post.createdAt} · {post.city || "位置未公开"}</small>{compact ? null : <p>{post.text}</p>}<span>{post.tags.slice(0, 3).join(" · ") || "公开动态"}</span></div>
  </article>;
}

export function CandidateProfileExperience({ api, candidate, candidates, relationship, inviteStatus, onClose, onSelect, onDismiss, onSave, onFriend, onInvite, onConversation, onReport, onBlock }: {
  api: FitMeetApiClient;
  candidate: LiveCandidate;
  candidates: LiveCandidate[];
  relationship: RelationshipState;
  inviteStatus: DemoInvitationStatus;
  onClose: () => void;
  onSelect: (id: number) => void;
  onDismiss: () => void;
  onSave: () => void;
  onFriend: () => void;
  onInvite: () => void;
  onConversation: () => void;
  onReport: () => Promise<void>;
  onBlock: () => Promise<void>;
}) {
  const [surface, setSurface] = useState<CandidateSurface>("deck");
  const [moments, setMoments] = useState<FeedPost[]>([]);
  const [momentsLoading, setMomentsLoading] = useState(false);
  const [momentsError, setMomentsError] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [safetyBusy, setSafetyBusy] = useState(false);
  const invitationAccepted = inviteStatus === "accepted";
  const currentIndex = candidates.findIndex((item) => item.id === candidate.id);
  const galleryImages = useMemo(() => Array.from(new Set([candidate.avatar, ...moments.flatMap((post) => post.images.map((image) => image.url))].filter((value): value is string => Boolean(value)))).slice(0, 6), [candidate.avatar, moments]);

  useEffect(() => {
    let active = true;
    setMomentsLoading(true);
    setMomentsError("");
    void api.listUserPosts(candidate.candidateUserId, 1, 10).then((page) => {
      if (active) setMoments(page.data);
    }).catch((reason) => {
      if (active) setMomentsError(reason instanceof Error ? reason.message : "公开动态暂时无法更新。");
    }).finally(() => {
      if (active) setMomentsLoading(false);
    });
    return () => { active = false; };
  }, [api, candidate.candidateUserId]);

  const selectNext = () => {
    if (!candidates.length) return;
    const next = candidates[(currentIndex + 1) % candidates.length];
    onSelect(next.id);
    setSurface("deck");
  };

  const executeSafetyAction = async () => {
    if (!confirmAction || safetyBusy) return;
    setSafetyBusy(true);
    try {
      if (confirmAction === "report") await onReport();
      else await onBlock();
      setConfirmAction(null);
    } finally {
      setSafetyBusy(false);
    }
  };

  return <div className={styles.sheetShade} role="presentation"><section className={`${styles.sheet} ${styles.candidateProfileSheet}`} role="dialog" aria-modal="true" aria-label={surface === "moments" ? `${candidate.name}的动态` : "匹配资料"}>
    <div className={styles.sheetHandle} />
    <header className={styles.candidateProfileHeader}>
      {surface === "deck" ? <span /> : <button type="button" aria-label="返回候选人资料" onClick={() => setSurface(surface === "moments" ? "profile" : "deck")}><FiChevronLeft /></button>}
      <h2>{surface === "moments" ? `${candidate.name}的动态` : surface === "profile" ? "匹配资料" : "为你推荐"}</h2>
      <button type="button" aria-label="关闭" onClick={onClose}><FiX /></button>
    </header>

    {surface === "deck" ? <>
      <div className={styles.candidateDeckToolbar}><span>{candidates.length} 位真实候选人</span><button type="button" onClick={selectNext}><FiRefreshCw /> 换一换</button></div>
      <div className={styles.candidatePicker}>{candidates.map((item) => <button type="button" key={item.id} className={candidate.id === item.id ? styles.candidatePickerActive : ""} onClick={() => onSelect(item.id)}>{item.name}</button>)}</div>
      <button type="button" className={styles.candidateHeroCard} onClick={() => setSurface("profile")}>
        <CandidatePhoto candidate={candidate} />
        <span className={styles.candidateHeroShade} />
        <div><h3>{candidate.name}{candidate.verificationStatus === "verified" ? <FiCheck /> : null}</h3><p>{candidate.age || "年龄未公开"} · {candidate.city} · {candidate.distance}</p><aside>{candidate.tags.slice(0, 3).map((tag) => <small key={tag}>{tag}</small>)}</aside></div>
        <b>{candidate.score || 0}%<small>匹配度</small></b>
      </button>
      <section className={styles.compatibilityPanel}><header><span><FiStar /> AI 认为你们很合适</span><strong>{candidate.score || 0}%</strong></header><p>{candidate.reason}</p>{(candidate.explanationSignals ?? []).slice(0, 3).map((signal) => <div key={signal}><FiCheck /> {signal}</div>)}</section>
      <div className={styles.candidatePreviewRow}><button type="button" onClick={() => setSurface("profile")}><FiShield /><span><strong>查看完整资料</strong><small>资料信号、照片与互动边界</small></span><FiChevronRight /></button><button type="button" onClick={() => setSurface("moments")}><FiHeart /><span><strong>公开动态</strong><small>{momentsLoading ? "正在更新" : `${moments.length} 条真实公开内容`}</small></span><FiChevronRight /></button></div>
    </> : null}

    {surface === "profile" ? <div className={styles.candidateProfileBody}>
      <section className={styles.candidateProfileHero}><CandidatePhoto candidate={candidate} /><div><h3>{candidate.name}</h3><p>{candidate.city} · {candidate.distance} · {candidate.lastActiveText || "活跃状态待确认"}</p><span>{candidate.verificationStatus === "verified" ? "身份已验证" : "身份状态待确认"}</span></div></section>
      {galleryImages.length ? <section><h3>公开照片</h3><div className={styles.candidateGallery}>{galleryImages.map((url) => <img key={url} src={url} alt="候选人公开内容" />)}</div></section> : null}
      <section><h3>关于 {candidate.name}</h3><p className={styles.candidateAbout}>{candidate.reason}</p><div className={styles.profileSignalGrid}><span><FiMapPin /><strong>{candidate.distance}</strong><small>模糊距离</small></span><span><FiStar /><strong>{candidate.score || 0}%</strong><small>需求匹配</small></span><span><FiShield /><strong>{candidate.safetyState === "normal" ? "状态正常" : "需谨慎"}</strong><small>安全状态</small></span><span><FiCheck /><strong>{candidate.profileCompleteness || 0}%</strong><small>资料完整度</small></span></div></section>
      <section><header className={styles.candidateSectionHeader}><h3>动态</h3><button type="button" onClick={() => setSurface("moments")}>查看全部</button></header>{moments[0] ? <PublicMomentCard post={moments[0]} compact /> : <p className={styles.emptyState}>{momentsLoading ? "正在更新真实公开动态…" : momentsError || "暂无公开动态。不会用兴趣标签生成虚假内容。"}</p>}</section>
      <section className={styles.candidateSafetyPanel}><h3><FiShield /> 互动边界</h3><p>举报和拉黑分别处理；只有服务端确认成功后才显示结果。</p>{candidate.riskWarnings?.map((warning) => <small key={warning}>{warning}</small>)}<div><button type="button" onClick={() => setConfirmAction("report")}><FiFlag /> 举报</button><button type="button" onClick={() => setConfirmAction("block")}><FiShield /> 拉黑</button></div></section>
    </div> : null}

    {surface === "moments" ? <div className={styles.candidateMomentsList}>{momentsLoading ? <p className={styles.emptyState}>正在更新真实公开动态…</p> : moments.length ? moments.map((post) => <PublicMomentCard key={post.id} post={post} />) : <p className={styles.emptyState}>{momentsError || "暂无公开动态。这里只展示对方主动公开的真实内容。"}</p>}</div> : null}

    {confirmAction ? <section className={styles.inlineConfirm}><strong>{confirmAction === "report" ? "确认举报这位用户？" : "确认拉黑这位用户？"}</strong><p>{confirmAction === "report" ? "举报会提交安全审核，不会自动向对方发送消息。" : "拉黑后将停止推荐，并关闭双方后续互动。"}</p><div><button type="button" onClick={() => setConfirmAction(null)}>取消</button><button type="button" disabled={safetyBusy} onClick={() => void executeSafetyAction()}>{safetyBusy ? "提交中…" : "确认执行"}</button></div></section> : null}

    {surface !== "moments" ? <footer className={styles.candidateActionDock}><button type="button" aria-label="收藏候选人" onClick={onSave}><FiBookmark /></button><button type="button" aria-label="不合适" onClick={onDismiss}><FiX /></button>{relationship === "none" ? <button type="button" aria-label="申请好友" onClick={onFriend}><FiUserPlus /></button> : null}<button type="button" className={styles.candidatePrimaryAction} onClick={invitationAccepted ? onConversation : onInvite} disabled={inviteStatus === "sent"}>{inviteStatus === "sent" ? "等待回应" : invitationAccepted ? <><FiMessageCircle /> 进入聊天</> : <>发送邀请 <FiChevronRight /></>}</button></footer> : null}
  </section></div>;
}
