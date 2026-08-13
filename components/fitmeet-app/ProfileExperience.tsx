"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiAlertCircle, FiAward, FiBell, FiBriefcase, FiCamera, FiCheck, FiChevronRight, FiDownload, FiEdit3, FiEye, FiImage, FiLock, FiLogOut, FiMonitor, FiPlus, FiRefreshCw, FiSettings, FiShield, FiSliders, FiTrash2, FiUpload, FiUsers, FiX } from "react-icons/fi";
import type { AccountReauthChallengeResponse, AccountReauthVerificationResponse, BlockedUserRecord, FeedPost, FitMeetAuthSessionRecord, FitMeetProfilePhoto, PublicUserProfile, SocialProfile, UserAdvantage, UserVerification } from "@/lib/fitmeet-api-contract";
import { FitMeetApiError, type FitMeetApiClient } from "@/lib/fitmeet-api-client";
import { useAccessibleDialog } from "./useAccessibleDialog";
import styles from "./fitmeet-complete.module.css";

type ProfilePanel = "preview" | "photos" | "advantages" | "verifications" | "friends" | "settings" | "sessions" | "blocklist" | "closure" | null;
type AccountOperation = "export" | "challenge" | "verify" | "delete" | null;
type ClosureMessageTone = "neutral" | "success" | "error";

function accountReauthFailureMessage(reason: unknown, phase: "request" | "verify" | "delete") {
  if (!(reason instanceof FitMeetApiError))
    return phase === "delete" ? "注销失败，服务端未确认账号已删除。请重新验证后再试。" : "身份验证暂时无法完成，请检查网络后重试。";
  const details = reason.details && typeof reason.details === "object" ? reason.details as Record<string, unknown> : {};
  if (reason.code === "REAUTH_VERIFICATION_FAILED") {
    const attempts = Number(details.attemptsRemaining);
    return Number.isFinite(attempts) && attempts > 0
      ? `邮箱密码不正确，还可以尝试 ${attempts} 次。`
      : "邮箱密码不正确，请重新开始身份验证。";
  }
  if (reason.code === "REAUTH_CHALLENGE_INVALID") return "验证请求已过期或尝试次数已用完，请重新开始。";
  if (reason.code === "REAUTH_RATE_LIMITED") {
    const retryAfter = reason.retryAfterSeconds ?? Number(details.retryAfterSeconds);
    return Number.isFinite(retryAfter) && Number(retryAfter) > 0
      ? `验证请求过于频繁，请在 ${Math.ceil(Number(retryAfter))} 秒后重试。`
      : "验证请求过于频繁，请稍后再试。";
  }
  if (reason.code === "REAUTH_SESSION_REQUIRED") return "当前登录会话不能执行高风险操作，请重新登录后再试。";
  if (reason.code === "REAUTH_REQUIRED") return "一次性身份凭证已失效或已使用，请重新验证后再注销。";
  return reason.message || (phase === "delete" ? "账号注销暂时未能完成。" : "身份验证暂时无法完成。");
}

function ProfileImage({ photo, name, className }: { photo?: FitMeetProfilePhoto; name: string; className?: string }) {
  return photo?.url ? <img className={className} src={photo.url} alt={`${name}的资料照片`} /> : <span className={`${styles.profileImageFallback} ${className || ""}`}>{name.slice(0, 1)}</span>;
}

function authSessionPlatformLabel(session: FitMeetAuthSessionRecord) {
  const platform = session.platform.trim().toLowerCase();
  if (platform === "web") return "网页端";
  if (platform === "ios") return "iPhone / iPad";
  if (platform === "android") return "Android";
  return session.platform || "未知设备";
}

function authSessionTime(value: string | null) {
  if (!value) return "时间未知";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "时间未知"
    : date.toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ProfilePanelShell({ title, children, onClose, closeDisabled = false }: { title: string; children: React.ReactNode; onClose: () => void; closeDisabled?: boolean }) {
  const guardedClose = useCallback(() => {
    if (!closeDisabled) onClose();
  }, [closeDisabled, onClose]);
  const dialogRef = useAccessibleDialog(true, guardedClose);
  return <div className={styles.sheetShade} role="presentation" onMouseDown={guardedClose}><section ref={dialogRef} tabIndex={-1} className={`${styles.sheet} ${styles.profilePanelSheet}`} role="dialog" aria-modal="true" aria-label={title} aria-busy={closeDisabled} onMouseDown={(event) => event.stopPropagation()}><div className={styles.sheetHandle} /><header><h2>{title}</h2><button type="button" aria-label="关闭" disabled={closeDisabled} onClick={guardedClose}><FiX /></button></header>{children}</section></div>;
}

export function ProfileExperience({ api, userId, profile, photos, notificationEnabled, notificationPreferenceSyncing, postCount, relationshipCount, groupsEnabled, blockedUsers, blockedUsersLoading, blockedUsersError, onPhotosChange, onNotice, onEdit, onPrivacy, onAgentDataAccess, onNotification, onRelationships, onGroups, onReboard, onSafety, onMoments, onLogout, onBlockUser, onUnblockUser, onRefreshBlockedUsers }: {
  api: FitMeetApiClient;
  userId: number;
  profile: SocialProfile;
  photos: FitMeetProfilePhoto[];
  notificationEnabled: boolean;
  notificationPreferenceSyncing: boolean;
  postCount: number;
  relationshipCount: number;
  groupsEnabled: boolean;
  blockedUsers: BlockedUserRecord[];
  blockedUsersLoading: boolean;
  blockedUsersError: boolean;
  onPhotosChange: (photos: FitMeetProfilePhoto[]) => void;
  onNotice: (message: string) => void;
  onEdit: () => void;
  onPrivacy: () => void;
  onAgentDataAccess: () => void;
  onNotification: (value: boolean) => void;
  onRelationships: () => void;
  onGroups: () => void;
  onReboard: () => void;
  onSafety: () => void;
  onMoments: () => void;
  onLogout: () => void | Promise<void>;
  onBlockUser: (user: PublicUserProfile) => Promise<void>;
  onUnblockUser: (user: BlockedUserRecord) => Promise<void>;
  onRefreshBlockedUsers: () => Promise<void>;
}) {
  const [panel, setPanel] = useState<ProfilePanel>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [recentPosts, setRecentPosts] = useState<FeedPost[]>([]);
  const [remotePostCount, setRemotePostCount] = useState<number | null>(null);
  const [closureText, setClosureText] = useState("");
  const [accountOperation, setAccountOperation] = useState<AccountOperation>(null);
  const [reauthChallenge, setReauthChallenge] = useState<AccountReauthChallengeResponse | null>(null);
  const [reauthCredential, setReauthCredential] = useState("");
  const [reauthVerification, setReauthVerification] = useState<AccountReauthVerificationResponse | null>(null);
  const [closureMessage, setClosureMessage] = useState("");
  const [closureMessageTone, setClosureMessageTone] = useState<ClosureMessageTone>("neutral");
  const [advantages, setAdvantages] = useState<UserAdvantage[]>([]);
  const [verifications, setVerifications] = useState<UserVerification[]>([]);
  const [verificationsAvailable, setVerificationsAvailable] = useState(true);
  const [verificationsMessage, setVerificationsMessage] = useState("");
  const [friends, setFriends] = useState<PublicUserProfile[]>([]);
  const [newAdvantage, setNewAdvantage] = useState("");
  const [newVerification, setNewVerification] = useState("");
  const [profileDataBusy, setProfileDataBusy] = useState(false);
  const [pendingBlockUserId, setPendingBlockUserId] = useState<number | null>(null);
  const [authSessions, setAuthSessions] = useState<FitMeetAuthSessionRecord[]>([]);
  const [authSessionsLoading, setAuthSessionsLoading] = useState(false);
  const [authSessionsError, setAuthSessionsError] = useState("");
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const closureFlowGenerationRef = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const orderedPhotos = useMemo(() => [...photos].sort((left, right) => (left.sortOrder ?? left.sort_order ?? 0) - (right.sortOrder ?? right.sort_order ?? 0)), [photos]);
  const cover = orderedPhotos.find((photo) => photo.isCover || photo.is_cover) || orderedPhotos[0];
  const missingItems = [!profile.nickname ? "昵称" : "", !profile.city ? "城市" : "", profile.interests.length < 3 ? "兴趣" : "", orderedPhotos.length < 2 ? "照片" : ""].filter(Boolean);
  const completion = Math.round(((4 - missingItems.length) / 4) * 100);
  const resolvedPostCount = remotePostCount ?? postCount;
  const accountBusy = accountOperation !== null;
  const validReauthToken = reauthVerification?.action === "account.delete"
    && reauthVerification.reauthToken.trim()
    && Date.parse(reauthVerification.expiresAt) > Date.now()
    ? reauthVerification.reauthToken
    : null;

  useEffect(() => {
    if (!reauthVerification) return;
    const remaining = Date.parse(reauthVerification.expiresAt) - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) {
      setReauthVerification(null);
      setReauthChallenge(null);
      setClosureMessageTone("error");
      setClosureMessage("身份验证已过期，请重新验证后再注销。");
      return;
    }
    const timer = window.setTimeout(() => {
      setReauthVerification(null);
      setReauthChallenge(null);
      setClosureMessageTone("error");
      setClosureMessage("身份验证已过期，请重新验证后再注销。");
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [reauthVerification]);

  useEffect(() => {
    let active = true;
    void api.listUserPosts(userId, 1, 3).then((page) => {
      if (!active) return;
      setRecentPosts(page.data);
      setRemotePostCount(page.metadata?.total ?? page.data.length);
    }).catch(() => {
      if (active) setRemotePostCount(null);
    });
    return () => { active = false; };
  }, [api, userId]);

  useEffect(() => {
    let active = true;
    void Promise.allSettled([api.listAdvantages(), api.listVerifications(), api.listFriends()]).then(([advantagesResult, verificationsResult, friendsResult]) => {
      if (!active) return;
      if (advantagesResult.status === "fulfilled") setAdvantages(advantagesResult.value.filter((item) => item.status !== "deleted"));
      if (friendsResult.status === "fulfilled") setFriends(friendsResult.value);
      if (verificationsResult.status === "fulfilled") {
        setVerifications(verificationsResult.value.items.filter((item) => item.status !== "deleted"));
        setVerificationsAvailable(verificationsResult.value.available);
        setVerificationsMessage(verificationsResult.value.message || "");
      } else {
        setVerifications([]);
        setVerificationsAvailable(false);
        setVerificationsMessage("认证服务暂时无法同步，其他资料仍可正常使用。");
      }
      const unavailable = [
        advantagesResult.status === "rejected" ? "优势" : "",
        friendsResult.status === "rejected" ? "好友" : "",
      ].filter(Boolean);
      if (unavailable.length) onNotice(`${unavailable.join("、")}资料暂时无法同步；其他资料不受影响。`);
    });
    return () => { active = false; };
  }, [api, onNotice]);

  const addAdvantage = async () => {
    const title = newAdvantage.trim();
    if (!title || profileDataBusy) return;
    setProfileDataBusy(true);
    try {
      const created = await api.createAdvantage({ title, advantageType: "service", visibility: "matching_only" });
      setAdvantages((items) => [created, ...items]);
      setNewAdvantage("");
      onNotice("优势已保存，并会参与合适的任务匹配。");
    } catch (reason) { onNotice(reason instanceof Error ? reason.message : "优势暂时无法保存。"); }
    finally { setProfileDataBusy(false); }
  };

  const removeAdvantage = async (record: UserAdvantage) => {
    try { await api.deleteAdvantage(record.id); setAdvantages((items) => items.filter((item) => item.id !== record.id)); onNotice("优势已删除。"); }
    catch (reason) { onNotice(reason instanceof Error ? reason.message : "优势暂时无法删除。"); }
  };

  const addVerification = async () => {
    const title = newVerification.trim();
    if (!title || profileDataBusy || !verificationsAvailable) return;
    setProfileDataBusy(true);
    try {
      const created = await api.createVerification({ title, verificationType: "self_reported", evidenceAssetIds: [] });
      setVerifications((items) => [created, ...items]);
      setNewVerification("");
      onNotice("认证申请已创建；提交证明并审核通过后才会展示标识。");
    } catch (reason) { onNotice(reason instanceof Error ? reason.message : "认证申请暂时无法创建。"); }
    finally { setProfileDataBusy(false); }
  };

  const removeVerification = async (record: UserVerification) => {
    try { await api.deleteVerification(record.id); setVerifications((items) => items.filter((item) => item.id !== record.id)); onNotice("认证申请已删除。"); }
    catch (reason) { onNotice(reason instanceof Error ? reason.message : "认证申请暂时无法删除。"); }
  };

  const removeFriend = async (friend: PublicUserProfile) => {
    try { await api.deleteFriend(friend.id); setFriends((items) => items.filter((item) => item.id !== friend.id)); onNotice("好友关系已解除；不会继续出现在好友动态中。"); }
    catch (reason) { onNotice(reason instanceof Error ? reason.message : "好友关系暂时无法解除。"); }
  };

  const replacePhotos = async (next: FitMeetProfilePhoto[]) => {
    const normalized = next.map((photo, index) => ({ assetId: Number(photo.assetId ?? photo.asset_id), sortOrder: index, isCover: index === 0 }));
    if (normalized.some((photo) => !photo.assetId)) throw new Error("照片缺少有效资源，请重新上传。");
    onPhotosChange(await api.replaceProfilePhotos(normalized));
  };

  const uploadPhotos = async (files: File[]) => {
    if (!files.length || photoBusy) return;
    if (orderedPhotos.length + files.length > 6) return onNotice("个人主页最多保留 6 张照片。");
    setPhotoBusy(true);
    try {
      const uploads = await Promise.all(files.map((file) => api.uploadImage(file)));
      const additions: FitMeetProfilePhoto[] = uploads.map((upload, index) => ({ id: -(Date.now() + index), assetId: Number(upload.assetId ?? upload.asset_id ?? upload.id), url: upload.url, sortOrder: orderedPhotos.length + index, isCover: false, moderationStatus: upload.moderationStatus ?? upload.moderation_status }));
      const next = [...orderedPhotos, ...additions];
      if (next.length < 2) return onNotice("资料照片至少需要 2 张；请再选择一张。");
      await replacePhotos(next);
      onNotice("照片墙已同步；仅审核通过的照片会公开展示。");
    } catch (reason) { onNotice(reason instanceof Error ? reason.message : "照片暂时无法保存。"); }
    finally { setPhotoBusy(false); if (fileInput.current) fileInput.current.value = ""; }
  };

  const makeCover = async (photo: FitMeetProfilePhoto) => {
    if (photoBusy || photo.id === cover?.id) return;
    setPhotoBusy(true);
    try { await replacePhotos([photo, ...orderedPhotos.filter((item) => item.id !== photo.id)]); onNotice("封面照片已更新。"); }
    catch (reason) { onNotice(reason instanceof Error ? reason.message : "封面暂时无法更新。"); }
    finally { setPhotoBusy(false); }
  };

  const removePhoto = async (photo: FitMeetProfilePhoto) => {
    if (photoBusy) return;
    if (orderedPhotos.length <= 2) return onNotice("为了保持真实资料，至少保留 2 张本人照片。");
    setPhotoBusy(true);
    try {
      await api.deleteProfilePhoto(photo.id);
      const remaining = orderedPhotos.filter((item) => item.id !== photo.id);
      if (photo.id === cover?.id) await replacePhotos(remaining);
      else onPhotosChange(remaining);
      onNotice("照片已删除。");
    }
    catch (reason) { onNotice(reason instanceof Error ? reason.message : "照片暂时无法删除。"); }
    finally { setPhotoBusy(false); }
  };

  const exportAccount = async () => {
    if (accountBusy) return;
    setAccountOperation("export");
    try {
      const data = await api.exportAccountData();
      const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `fitmeet-account-${userId}.json`;
      link.click();
      URL.revokeObjectURL(blobUrl);
      onNotice("账号数据已由后端生成并下载到当前设备。");
    } catch (reason) { onNotice(reason instanceof Error ? reason.message : "账号数据暂时无法导出。"); }
    finally { setAccountOperation(null); }
  };

  const resetAccountClosure = () => {
    closureFlowGenerationRef.current += 1;
    setClosureText("");
    setReauthChallenge(null);
    setReauthCredential("");
    setReauthVerification(null);
    setClosureMessage("");
    setClosureMessageTone("neutral");
    setAccountOperation(null);
  };

  const openAccountClosure = () => {
    resetAccountClosure();
    setPanel("closure");
  };

  const closeAccountClosure = () => {
    resetAccountClosure();
    setPanel(null);
  };

  const requestAccountReauth = async () => {
    if (accountBusy) return;
    const generation = closureFlowGenerationRef.current + 1;
    closureFlowGenerationRef.current = generation;
    setReauthChallenge(null);
    setReauthCredential("");
    setReauthVerification(null);
    setClosureMessage("");
    setAccountOperation("challenge");
    try {
      const challenge = await api.requestAccountReauthChallenge("email_password");
      if (closureFlowGenerationRef.current !== generation) return;
      if (challenge.action !== "account.delete" || challenge.method !== "email_password" || !challenge.challengeId.trim() || Date.parse(challenge.expiresAt) <= Date.now())
        throw new Error("服务端返回了不匹配的验证请求，请重新开始。");
      setReauthChallenge(challenge);
      setClosureMessageTone("neutral");
      setClosureMessage(`验证请求已创建。请输入 ${challenge.maskedDestination || "当前登录邮箱"} 的当前密码。`);
    } catch (reason) {
      if (closureFlowGenerationRef.current !== generation) return;
      setClosureMessageTone("error");
      setClosureMessage(accountReauthFailureMessage(reason, "request"));
    } finally {
      if (closureFlowGenerationRef.current === generation) setAccountOperation(null);
    }
  };

  const verifyAccountReauth = async () => {
    const challenge = reauthChallenge;
    const credential = reauthCredential;
    if (!challenge || challenge.method !== "email_password" || !credential || accountBusy) return;
    const generation = closureFlowGenerationRef.current;
    setClosureMessage("");
    setAccountOperation("verify");
    try {
      const verification = await api.verifyAccountReauthChallenge(challenge.challengeId, "email_password", credential);
      if (closureFlowGenerationRef.current !== generation) return;
      if (verification.action !== "account.delete" || !verification.reauthToken.trim() || Date.parse(verification.expiresAt) <= Date.now())
        throw new Error("服务端没有返回有效的注销验证凭证，请重新验证。");
      setReauthVerification(verification);
      setClosureMessageTone("success");
      setClosureMessage(`身份验证成功。一次性凭证仅保存在当前页面内存中，并将在 ${verification.expiresIn} 秒内失效。`);
    } catch (reason) {
      if (closureFlowGenerationRef.current !== generation) return;
      setReauthVerification(null);
      setClosureMessageTone("error");
      setClosureMessage(accountReauthFailureMessage(reason, "verify"));
      if (reason instanceof FitMeetApiError && reason.code === "REAUTH_CHALLENGE_INVALID") setReauthChallenge(null);
    } finally {
      if (closureFlowGenerationRef.current === generation) {
        setReauthCredential("");
        setAccountOperation(null);
      }
    }
  };

  const closeAccount = async () => {
    const token = validReauthToken;
    if (closureText.trim() !== "注销账号" || !token || accountBusy) return;
    setClosureMessage("");
    setAccountOperation("delete");
    try {
      await api.deleteAccount(token);
      setReauthVerification(null);
      setReauthChallenge(null);
      onNotice("账号已由后端注销，本机登录状态已清理。");
      await onLogout();
    } catch (reason) {
      setReauthVerification(null);
      setReauthChallenge(null);
      setClosureMessageTone("error");
      setClosureMessage(accountReauthFailureMessage(reason, "delete"));
    } finally { setAccountOperation(null); }
  };

  const refreshAuthSessions = async () => {
    if (authSessionsLoading) return;
    setAuthSessionsLoading(true);
    setAuthSessionsError("");
    try {
      const page = await api.listAuthSessions();
      setAuthSessions(page.items);
    } catch (reason) {
      setAuthSessionsError(reason instanceof Error ? reason.message : "登录设备暂时无法读取。");
    } finally {
      setAuthSessionsLoading(false);
    }
  };

  const openAuthSessions = () => {
    setPanel("sessions");
    void refreshAuthSessions();
  };

  const revokeAuthSession = async (session: FitMeetAuthSessionRecord) => {
    if (session.isCurrent || revokingSessionId) return;
    setRevokingSessionId(session.id);
    try {
      await api.revokeAuthSession(session.id);
      setAuthSessions((items) => items.filter((item) => item.id !== session.id));
      onNotice("该设备的登录状态已撤销。");
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : "该设备暂时无法退出。");
    } finally {
      setRevokingSessionId(null);
    }
  };

  return <div className={styles.profileScreen}>
    <header><div><h1>我的</h1><p>资料、照片、隐私和账号安全</p></div><aside><button type="button" aria-label="账号安全" onClick={onSafety}><FiShield /></button><button type="button" aria-label="设置" onClick={() => setPanel("settings")}><FiSettings /></button></aside></header>
    <section className={styles.profileHero}><ProfileImage photo={cover} name={profile.nickname} /><div><h1>{profile.nickname || "FitMeet 用户"}<FiCheck /></h1><p>{profile.city || "城市待填写"}</p><span>{profile.profileDiscoverable ? "资料可发现" : "资料已隐藏"}</span></div><button type="button" onClick={onEdit}>编辑资料</button></section>
    <p className={styles.profileBio}>{profile.bio || "写几句话介绍自己，让小福更好地理解你的兴趣与边界。"}</p>
    <section className={styles.profileStats}><span><strong>{resolvedPostCount}</strong>动态</span><span><strong>{friends.length}</strong>好友</span><span><strong>{relationshipCount}</strong>待处理</span></section>
    <div className={styles.profileTags}>{profile.interests.map((interest) => <span key={interest}>{interest}</span>)}</div>

    <section className={styles.profileCompletion}><header><div><strong>资料概览</strong><small>{missingItems.length ? `还需完善：${missingItems.join("、")}` : "资料、照片和边界已准备好"}</small></div><b>{completion}%</b></header><i><span style={{ width: `${completion}%` }} /></i><div><span><FiImage /><strong>{orderedPhotos.length} 张</strong><small>照片</small></span><span><FiEye /><strong>{profile.profileDiscoverable ? "可发现" : "已隐藏"}</strong><small>资料</small></span><span><FiShield /><strong>{profile.hideSensitiveTags ? "已保护" : "标准"}</strong><small>隐私</small></span></div><button type="button" onClick={() => setPanel("preview")}>查看别人眼中的资料 <FiChevronRight /></button></section>

    <section className={styles.profilePhotoPreview}><header><div><strong>照片墙</strong><small>2–6 张审核通过的本人照片</small></div><button type="button" onClick={() => setPanel("photos")}>管理</button></header><div>{orderedPhotos.length ? orderedPhotos.slice(0, 4).map((photo) => <ProfileImage key={photo.id} photo={photo} name={profile.nickname} />) : <button type="button" onClick={() => setPanel("photos")}><FiPlus /><span>添加照片</span></button>}</div></section>

    <section className={styles.profileMomentPreview}><header><div><strong>我的动态</strong><small>{resolvedPostCount ? `${resolvedPostCount} 条已发布` : "还没有公开动态"}</small></div><button type="button" onClick={onMoments}>查看全部</button></header>{recentPosts.length ? <div>{recentPosts.map((post) => <article key={post.id}>{post.images[0]?.url ? <img src={post.images[0].url} alt="我的动态图片" /> : <span>{post.emoji || "✨"}</span>}<p>{post.text}</p></article>)}</div> : <button type="button" className={styles.profileMomentEmpty} onClick={onMoments}><FiPlus /> 发布第一条真实近况</button>}</section>

    <section className={styles.profileQuickGrid}><button type="button" onClick={onEdit}><FiEdit3 /><strong>编辑资料</strong><small>昵称城市</small></button><button type="button" onClick={() => setPanel("photos")}><FiCamera /><strong>照片管理</strong><small>封面形象</small></button><button type="button" onClick={() => setPanel("advantages")}><FiBriefcase /><strong>我的优势</strong><small>{advantages.length} 项能力</small></button><button type="button" onClick={() => setPanel("verifications")}><FiAward /><strong>认证中心</strong><small>{verifications.length} 项记录</small></button></section>

    <section className={styles.profileRows}><button type="button" onClick={() => setPanel("friends")}><span><FiUsers /></span><strong>好友列表</strong><small>{friends.length ? `${friends.length} 位好友` : "暂无好友"}</small><FiChevronRight /></button><button type="button" onClick={onRelationships}><span><FiUsers /></span><strong>关系申请</strong><small>{relationshipCount ? `${relationshipCount} 个待处理` : "暂无待处理"}</small><FiChevronRight /></button>{groupsEnabled ? <button type="button" onClick={onGroups}><span><FiUsers /></span><strong>我的组局</strong><small>成员 / 候补 / 群聊</small><FiChevronRight /></button> : null}<button type="button" onClick={onPrivacy}><span><FiSliders /></span><strong>偏好边界</strong><small>{profile.distanceKm}km · 模糊位置</small><FiChevronRight /></button><button type="button" onClick={() => setPanel("settings")}><span><FiBell /></span><strong>更多设置</strong><small>通知 / 安全 / 建档</small><FiChevronRight /></button></section>

    {panel === "preview" ? <ProfilePanelShell title="资料预览" onClose={() => setPanel(null)}><section className={styles.profilePreviewCard}><div className={styles.profilePreviewCover}><ProfileImage photo={cover} name={profile.nickname} /><span><FiEye /> 仅展示模糊位置</span><b><FiImage /> {orderedPhotos.length}</b></div><div className={styles.profilePreviewIdentity}><ProfileImage photo={cover} name={profile.nickname} /><div><h3>{profile.nickname || "FitMeet 用户"}</h3><p>{profile.city || "城市待填写"} · 身份状态已同步</p></div></div><dl><div><dt>兴趣爱好</dt><dd>{profile.interests.join("、") || "待完善"}</dd></div><div><dt>资料可见范围</dt><dd>{profile.distanceKm}km · 仅模糊展示</dd></div><div><dt>个人介绍</dt><dd>{profile.bio || "待完善"}</dd></div></dl></section><p className={styles.sheetSafety}><FiShield /> 不公开精确位置、联系方式和敏感信息。</p><div className={styles.stackActions}><button type="button" className={styles.secondaryButton} onClick={onEdit}><FiEdit3 /> 编辑资料</button><button type="button" className={styles.primaryButton} onClick={() => setPanel("photos")}><FiCamera /> 照片管理</button></div></ProfilePanelShell> : null}

    {panel === "photos" ? <ProfilePanelShell title="照片管理" onClose={() => setPanel(null)}><p className={styles.sheetLead}>第一张作为封面。照片需通过审核，最多 6 张；资料完成后至少保留 2 张。</p><div className={styles.photoManagerGrid}>{orderedPhotos.map((photo, index) => <article key={photo.id}><ProfileImage photo={photo} name={profile.nickname} /><span>{index === 0 ? "封面" : `照片 ${index + 1}`}</span><div>{index ? <button type="button" disabled={photoBusy} onClick={() => void makeCover(photo)}><FiCheck /> 设为封面</button> : null}<button type="button" disabled={photoBusy || orderedPhotos.length <= 2} onClick={() => void removePhoto(photo)}><FiTrash2 /></button></div></article>)}{orderedPhotos.length < 6 ? <button type="button" className={styles.photoAddButton} disabled={photoBusy} onClick={() => fileInput.current?.click()}><FiUpload /><strong>{photoBusy ? "处理中…" : "添加照片"}</strong><small>JPG / PNG</small></button> : null}</div><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => void uploadPhotos(Array.from(event.target.files || []))} /><p className={styles.sheetSafety}><FiShield /> 上传会进入后端图片审核；未通过的照片不会成为公开资料。</p></ProfilePanelShell> : null}

    {panel === "advantages" ? <ProfilePanelShell title="我的优势" onClose={() => setPanel(null)}><p className={styles.sheetLead}>正式优势会作为高权重能力资料参与任务匹配，只在合适场景展示。</p><form className={styles.profileDataForm} onSubmit={(event) => { event.preventDefault(); void addAdvantage(); }}><input value={newAdvantage} onChange={(event) => setNewAdvantage(event.target.value)} placeholder="例如：擅长羽毛球入门陪练" /><button type="submit" disabled={!newAdvantage.trim() || profileDataBusy}><FiPlus /> 添加</button></form><div className={styles.profileDataList}>{advantages.length ? advantages.map((item) => <article key={item.id}><span><FiBriefcase /></span><div><strong>{item.title}</strong><small>{item.serviceArea || item.availableTime || "仅在匹配场景展示"}</small></div><button type="button" aria-label="删除优势" onClick={() => void removeAdvantage(item)}><FiTrash2 /></button></article>) : <p className={styles.emptyState}>还没有正式优势。先添加一项真实、可验证的能力。</p>}</div></ProfilePanelShell> : null}

    {panel === "verifications" ? <ProfilePanelShell title="认证中心" onClose={() => setPanel(null)}><p className={styles.sheetLead}>{verificationsAvailable ? "创建申请不等于已认证；只有证明材料审核通过后才展示 badge。" : verificationsMessage || "认证服务正在维护，其他资料和匹配功能不受影响。"}</p>{verificationsAvailable ? <form className={styles.profileDataForm} onSubmit={(event) => { event.preventDefault(); void addVerification(); }}><input value={newVerification} onChange={(event) => setNewVerification(event.target.value)} placeholder="例如：国家二级运动员" /><button type="submit" disabled={!newVerification.trim() || profileDataBusy}><FiPlus /> 申请</button></form> : null}<div className={styles.profileDataList}>{verifications.length ? verifications.map((item) => <article key={item.id}><span><FiAward /></span><div><strong>{item.title}</strong><small>{item.status === "verified" ? item.badgeTitle || "已认证" : item.status === "pending_review" ? "材料审核中" : item.reviewerNote || "待提交证明"}</small></div>{item.status !== "verified" ? <button type="button" aria-label="删除认证申请" onClick={() => void removeVerification(item)}><FiTrash2 /></button> : <FiCheck />}</article>) : <p className={styles.emptyState}>{verificationsAvailable ? "暂无认证记录。" : "认证记录暂时不可读取，请稍后再试。"}</p>}</div></ProfilePanelShell> : null}

    {panel === "friends" ? <ProfilePanelShell title="好友列表" onClose={() => setPanel(null)}><p className={styles.sheetLead}>这里只展示双方已确认的关系。解除好友与拉黑是两个独立动作。</p><div className={styles.profileDataList}>{friends.length ? friends.map((friend) => <article key={friend.id}>{friend.avatar ? <img src={friend.avatar} alt={`${friend.name}头像`} /> : <span>{friend.name.slice(0, 1)}</span>}<div><strong>{friend.name}</strong><small>{pendingBlockUserId === friend.id ? "再次点击盾牌确认拉黑" : friend.city || "城市未公开"}</small></div><aside className={styles.profileRecordActions}><button type="button" aria-label="解除好友" onClick={() => void removeFriend(friend)}><FiTrash2 /></button><button type="button" aria-label={pendingBlockUserId === friend.id ? "确认拉黑用户" : "拉黑用户"} onClick={() => { if (pendingBlockUserId === friend.id) { void onBlockUser(friend); setPendingBlockUserId(null); } else setPendingBlockUserId(friend.id); }}><FiShield /></button></aside></article>) : <p className={styles.emptyState}>还没有双方确认的好友。</p>}</div></ProfilePanelShell> : null}

    {panel === "settings" ? <ProfilePanelShell title="更多设置" onClose={() => setPanel(null)}><label className={styles.switchRow}><span><strong>实时通知</strong><small>{notificationPreferenceSyncing ? "正在同步账号偏好…" : "私信、互动和系统提醒跨设备同步"}</small></span><input type="checkbox" checked={notificationEnabled} disabled={notificationPreferenceSyncing} onChange={(event) => onNotification(event.target.checked)} /><i /></label><div className={styles.settingsActions}><button type="button" onClick={onPrivacy}><FiEye /> 隐私与资料可见范围</button><button type="button" onClick={onAgentDataAccess}><FiShield /> Agent 数据权限与访问记录</button><button type="button" onClick={onRelationships}><FiUsers /> 好友与申请</button><button type="button" onClick={openAuthSessions}><FiMonitor /> 登录设备</button><button type="button" onClick={() => { setPanel("blocklist"); void onRefreshBlockedUsers().catch(() => undefined); }}><FiShield /> 黑名单</button><button type="button" onClick={onSafety}><FiLock /> 账号安全</button><button type="button" onClick={onReboard}><FiSliders /> 重新完善资料</button><button type="button" onClick={openAccountClosure}><FiTrash2 /> 数据导出与注销账号</button><button type="button" onClick={onLogout}><FiLogOut /> 退出登录</button></div><p className={styles.sheetSafety}><FiShield /> 站内通知历史和账号偏好由服务端保存；网页关闭后的系统级推送仍取决于浏览器权限。</p></ProfilePanelShell> : null}

    {panel === "sessions" ? <ProfilePanelShell title="登录设备" onClose={() => setPanel(null)}><p className={styles.sheetLead}>这里展示仍持有有效刷新凭证的设备。退出其他设备不会影响当前网页。</p>{authSessionsLoading && !authSessions.length ? <section className={styles.blocklistEmpty}><FiRefreshCw /><strong>正在读取登录设备</strong><p>从 FitMeet 服务端核对当前有效会话。</p></section> : authSessionsError ? <section className={styles.blocklistEmpty}><FiAlertCircle /><strong>登录设备暂时无法读取</strong><p>{authSessionsError}</p><button type="button" onClick={() => void refreshAuthSessions()}><FiRefreshCw /> 重新加载</button></section> : authSessions.length ? <div className={`${styles.profileDataList} ${styles.authSessionList}`}>{authSessions.map((item) => <article key={item.id}><span><FiMonitor /></span><div><strong>{authSessionPlatformLabel(item)}{item.isCurrent ? " · 当前设备" : ""}</strong><small>{item.appVersion ? `版本 ${item.appVersion} · ` : ""}最近活动 {authSessionTime(item.lastActiveAt)}</small></div>{item.isCurrent ? <b>当前</b> : <button type="button" disabled={Boolean(revokingSessionId)} aria-label={`退出${authSessionPlatformLabel(item)}`} onClick={() => void revokeAuthSession(item)}>{revokingSessionId === item.id ? <FiRefreshCw /> : <FiLogOut />}</button>}</article>)}</div> : <section className={styles.blocklistEmpty}><FiMonitor /><strong>没有其他有效设备</strong><p>当前账号只保留了这个登录会话。</p></section>}<button type="button" className={styles.secondaryButton} disabled={authSessionsLoading} onClick={() => void refreshAuthSessions()}><FiRefreshCw /> {authSessionsLoading ? "正在刷新…" : "刷新设备列表"}</button><p className={styles.sheetSafety}><FiShield /> 撤销后，该设备下次刷新凭证时会被要求重新登录。</p></ProfilePanelShell> : null}

    {panel === "blocklist" ? <ProfilePanelShell title="黑名单" onClose={() => setPanel(null)}>{blockedUsersLoading && !blockedUsers.length ? <section className={styles.blocklistEmpty}><FiRefreshCw /><strong>正在读取黑名单</strong><p>从 FitMeet 服务端恢复已生效的拉黑关系。</p></section> : blockedUsersError ? <section className={styles.blocklistEmpty}><FiShield /><strong>黑名单暂时无法读取</strong><p>当前不会把空列表当成真实状态。</p><button type="button" onClick={() => void onRefreshBlockedUsers().catch(() => undefined)}><FiRefreshCw /> 重新加载</button></section> : blockedUsers.length ? <div className={styles.profileDataList}>{blockedUsers.map((user) => <article key={user.id}>{user.avatar ? <img src={user.avatar} alt={`${user.name}头像`} /> : <span>{user.name.slice(0, 1)}</span>}<div><strong>{user.name}</strong><small>{new Date(user.blockedAt).toLocaleDateString("zh-CN")} · 服务端已确认</small></div><button type="button" aria-label={`解除拉黑 ${user.name}`} onClick={() => void onUnblockUser(user)}><FiX /></button></article>)}</div> : <section className={styles.blocklistEmpty}><FiShield /><strong>暂无生效中的拉黑关系</strong><p>这里不会插入本地记录或模拟用户。</p></section>}<div className={styles.detailRows}><div><span>状态来源</span><b>FitMeet 服务端</b></div><div><span>解除后</span><b>旧关系与会话不恢复</b></div></div><p className={styles.sheetSafety}><FiShield /> 拉黑和解除都以服务端回执为准，并在 Web 与 iOS 之间保持一致。</p></ProfilePanelShell> : null}

    {panel === "closure" ? <ProfilePanelShell title="数据与账号" onClose={closeAccountClosure} closeDisabled={accountOperation === "delete"}>
      <p className={styles.sheetLead}>注销是不可逆的高风险操作。你可以先导出账号数据；正式注销需要当前邮箱密码完成一次性身份验证。</p>
      <button type="button" className={styles.secondaryButton} disabled={accountBusy} onClick={() => void exportAccount()}><FiDownload /> {accountOperation === "export" ? "正在导出…" : "导出我的数据"}</button>
      <div className={styles.closurePanel}>
        <strong>注销前请确认</strong>
        <p>照片、动态和资料将不再公开；私信和互动会停止，必要安全审计按平台规则保留。</p>
        <section className={styles.reauthPanel} aria-label="邮箱身份验证">
          <header><span data-verified={Boolean(validReauthToken)}>{validReauthToken ? <FiCheck /> : <FiLock />}</span><div><strong>{validReauthToken ? "本人身份已验证" : "先验证本人身份"}</strong><small>{validReauthToken ? "一次性凭证仅用于本次注销" : "密码和验证凭证不会写入浏览器存储"}</small></div></header>
          {!validReauthToken && !reauthChallenge ? <button type="button" className={styles.reauthButton} disabled={accountBusy} onClick={() => void requestAccountReauth()}>{accountOperation === "challenge" ? <FiRefreshCw className={styles.spinningIcon} /> : <FiShield />} {accountOperation === "challenge" ? "正在准备验证…" : "使用当前邮箱密码验证"}</button> : null}
          {!validReauthToken && reauthChallenge ? <div className={styles.reauthCredential}>
            <label><span>当前邮箱密码</span><input type="password" autoComplete="current-password" value={reauthCredential} disabled={accountBusy} onChange={(event) => setReauthCredential(event.target.value)} placeholder="请输入当前邮箱密码" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void verifyAccountReauth(); } }} /></label>
            <button type="button" className={styles.reauthButton} disabled={!reauthCredential || accountBusy} onClick={() => void verifyAccountReauth()}>{accountOperation === "verify" ? <FiRefreshCw className={styles.spinningIcon} /> : <FiCheck />} {accountOperation === "verify" ? "正在验证…" : "确认身份验证"}</button>
            <button type="button" className={styles.reauthRestart} disabled={accountBusy} onClick={() => void requestAccountReauth()}>重新创建验证请求</button>
          </div> : null}
          {validReauthToken ? <button type="button" className={styles.reauthRestart} disabled={accountBusy} onClick={() => void requestAccountReauth()}>重新验证</button> : null}
          {closureMessage ? <p className={styles.closureMessage} data-tone={closureMessageTone} role={closureMessageTone === "error" ? "alert" : "status"}>{closureMessageTone === "error" ? <FiAlertCircle /> : closureMessageTone === "success" ? <FiCheck /> : <FiShield />}{closureMessage}</p> : null}
        </section>
        <label><span>身份验证完成后，输入“注销账号”继续</span><input value={closureText} disabled={accountBusy || !validReauthToken} onChange={(event) => setClosureText(event.target.value)} placeholder="注销账号" /></label>
        <button type="button" className={styles.dangerButton} disabled={closureText.trim() !== "注销账号" || !validReauthToken || accountBusy} onClick={() => void closeAccount()}>{accountOperation === "delete" ? "正在注销…" : "确认注销账号"}</button>
        <small className={styles.reauthSafety}><FiShield /> 密码仅随本次 HTTPS 验证请求发送；一次性凭证绑定当前账号、登录设备与注销动作，关闭面板即从内存清除。</small>
      </div>
    </ProfilePanelShell> : null}
  </div>;
}
