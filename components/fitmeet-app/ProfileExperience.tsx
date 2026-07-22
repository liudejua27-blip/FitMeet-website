"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiAward, FiBell, FiBriefcase, FiCamera, FiCheck, FiChevronRight, FiDownload, FiEdit3, FiEye, FiImage, FiLock, FiLogOut, FiPlus, FiSettings, FiShield, FiSliders, FiTrash2, FiUpload, FiUsers, FiX } from "react-icons/fi";
import type { FeedPost, FitMeetProfilePhoto, PublicUserProfile, SocialProfile, UserAdvantage, UserVerification } from "@/lib/fitmeet-api-contract";
import type { FitMeetApiClient } from "@/lib/fitmeet-api-client";
import styles from "./fitmeet-complete.module.css";

type ProfilePanel = "preview" | "photos" | "advantages" | "verifications" | "friends" | "settings" | "blocklist" | "closure" | null;

function ProfileImage({ photo, name, className }: { photo?: FitMeetProfilePhoto; name: string; className?: string }) {
  return photo?.url ? <img className={className} src={photo.url} alt={`${name}的资料照片`} /> : <span className={`${styles.profileImageFallback} ${className || ""}`}>{name.slice(0, 1)}</span>;
}

function ProfilePanelShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className={styles.sheetShade} role="presentation"><section className={`${styles.sheet} ${styles.profilePanelSheet}`} role="dialog" aria-modal="true" aria-label={title}><div className={styles.sheetHandle} /><header><h2>{title}</h2><button type="button" aria-label="关闭" onClick={onClose}><FiX /></button></header>{children}</section></div>;
}

export function ProfileExperience({ api, userId, profile, photos, notificationEnabled, postCount, relationshipCount, onPhotosChange, onNotice, onEdit, onPrivacy, onNotification, onRelationships, onReboard, onSafety, onMoments, onLogout }: {
  api: FitMeetApiClient;
  userId: number;
  profile: SocialProfile;
  photos: FitMeetProfilePhoto[];
  notificationEnabled: boolean;
  postCount: number;
  relationshipCount: number;
  onPhotosChange: (photos: FitMeetProfilePhoto[]) => void;
  onNotice: (message: string) => void;
  onEdit: () => void;
  onPrivacy: () => void;
  onNotification: (value: boolean) => void;
  onRelationships: () => void;
  onReboard: () => void;
  onSafety: () => void;
  onMoments: () => void;
  onLogout: () => void;
}) {
  const [panel, setPanel] = useState<ProfilePanel>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [recentPosts, setRecentPosts] = useState<FeedPost[]>([]);
  const [remotePostCount, setRemotePostCount] = useState<number | null>(null);
  const [closureText, setClosureText] = useState("");
  const [accountBusy, setAccountBusy] = useState(false);
  const [advantages, setAdvantages] = useState<UserAdvantage[]>([]);
  const [verifications, setVerifications] = useState<UserVerification[]>([]);
  const [friends, setFriends] = useState<PublicUserProfile[]>([]);
  const [newAdvantage, setNewAdvantage] = useState("");
  const [newVerification, setNewVerification] = useState("");
  const [profileDataBusy, setProfileDataBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const orderedPhotos = useMemo(() => [...photos].sort((left, right) => (left.sortOrder ?? left.sort_order ?? 0) - (right.sortOrder ?? right.sort_order ?? 0)), [photos]);
  const cover = orderedPhotos.find((photo) => photo.isCover || photo.is_cover) || orderedPhotos[0];
  const missingItems = [!profile.nickname ? "昵称" : "", !profile.city ? "城市" : "", profile.interests.length < 3 ? "兴趣" : "", orderedPhotos.length < 2 ? "照片" : ""].filter(Boolean);
  const completion = Math.round(((4 - missingItems.length) / 4) * 100);
  const resolvedPostCount = remotePostCount ?? postCount;

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
    void Promise.all([api.listAdvantages(), api.listVerifications(), api.listFriends()]).then(([nextAdvantages, nextVerifications, nextFriends]) => {
      if (!active) return;
      setAdvantages(nextAdvantages.filter((item) => item.status !== "deleted"));
      setVerifications(nextVerifications.filter((item) => item.status !== "deleted"));
      setFriends(nextFriends);
    }).catch(() => onNotice("优势、认证或好友资料暂时无法同步。"));
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
    if (!title || profileDataBusy) return;
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
    setAccountBusy(true);
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
    finally { setAccountBusy(false); }
  };

  const closeAccount = async () => {
    if (closureText.trim() !== "注销账号" || accountBusy) return;
    setAccountBusy(true);
    try {
      await api.deleteAccount();
      onNotice("账号已由后端注销，本机登录状态已清理。");
      onLogout();
    } catch (reason) { onNotice(reason instanceof Error ? reason.message : "账号注销暂时未能完成。"); }
    finally { setAccountBusy(false); }
  };

  return <div className={styles.profileScreen}>
    <header><div><h1>我的</h1><p>资料、照片、隐私和账号安全</p></div><aside><button type="button" aria-label="账号安全" onClick={onSafety}><FiShield /></button><button type="button" aria-label="设置" onClick={() => setPanel("settings")}><FiSettings /></button></aside></header>
    <section className={styles.profileHero}><ProfileImage photo={cover} name={profile.nickname} /><div><h1>{profile.nickname || "内测用户"}<FiCheck /></h1><p>{profile.city || "城市待填写"}</p><span>内测资料</span></div><button type="button" onClick={onEdit}>编辑资料</button></section>
    <p className={styles.profileBio}>{profile.bio || "写几句话介绍自己，让小福更好地理解你的兴趣与边界。"}</p>
    <section className={styles.profileStats}><span><strong>{resolvedPostCount}</strong>动态</span><span><strong>{friends.length}</strong>好友</span><span><strong>{relationshipCount}</strong>待处理</span></section>
    <div className={styles.profileTags}>{profile.interests.map((interest) => <span key={interest}>{interest}</span>)}</div>

    <section className={styles.profileCompletion}><header><div><strong>资料概览</strong><small>{missingItems.length ? `还需完善：${missingItems.join("、")}` : "资料、照片和边界已准备好"}</small></div><b>{completion}%</b></header><i><span style={{ width: `${completion}%` }} /></i><div><span><FiImage /><strong>{orderedPhotos.length} 张</strong><small>照片</small></span><span><FiEye /><strong>{profile.profileDiscoverable ? "可发现" : "已隐藏"}</strong><small>资料</small></span><span><FiShield /><strong>{profile.hideSensitiveTags ? "已保护" : "标准"}</strong><small>隐私</small></span></div><button type="button" onClick={() => setPanel("preview")}>查看别人眼中的资料 <FiChevronRight /></button></section>

    <section className={styles.profilePhotoPreview}><header><div><strong>照片墙</strong><small>2–6 张审核通过的本人照片</small></div><button type="button" onClick={() => setPanel("photos")}>管理</button></header><div>{orderedPhotos.length ? orderedPhotos.slice(0, 4).map((photo) => <ProfileImage key={photo.id} photo={photo} name={profile.nickname} />) : <button type="button" onClick={() => setPanel("photos")}><FiPlus /><span>添加照片</span></button>}</div></section>

    <section className={styles.profileMomentPreview}><header><div><strong>我的动态</strong><small>{resolvedPostCount ? `${resolvedPostCount} 条已发布` : "还没有公开动态"}</small></div><button type="button" onClick={onMoments}>查看全部</button></header>{recentPosts.length ? <div>{recentPosts.map((post) => <article key={post.id}>{post.images[0]?.url ? <img src={post.images[0].url} alt="我的动态图片" /> : <span>{post.emoji || "✨"}</span>}<p>{post.text}</p></article>)}</div> : <button type="button" className={styles.profileMomentEmpty} onClick={onMoments}><FiPlus /> 发布第一条真实近况</button>}</section>

    <section className={styles.profileQuickGrid}><button type="button" onClick={onEdit}><FiEdit3 /><strong>编辑资料</strong><small>昵称城市</small></button><button type="button" onClick={() => setPanel("photos")}><FiCamera /><strong>照片管理</strong><small>封面形象</small></button><button type="button" onClick={() => setPanel("advantages")}><FiBriefcase /><strong>我的优势</strong><small>{advantages.length} 项能力</small></button><button type="button" onClick={() => setPanel("verifications")}><FiAward /><strong>认证中心</strong><small>{verifications.length} 项记录</small></button></section>

    <section className={styles.profileRows}><button type="button" onClick={() => setPanel("friends")}><span><FiUsers /></span><strong>好友列表</strong><small>{friends.length ? `${friends.length} 位好友` : "暂无好友"}</small><FiChevronRight /></button><button type="button" onClick={onRelationships}><span><FiUsers /></span><strong>关系申请</strong><small>{relationshipCount ? `${relationshipCount} 个待处理` : "暂无待处理"}</small><FiChevronRight /></button><button type="button" onClick={onPrivacy}><span><FiSliders /></span><strong>偏好边界</strong><small>{profile.distanceKm}km · 模糊位置</small><FiChevronRight /></button><button type="button" onClick={() => setPanel("settings")}><span><FiBell /></span><strong>更多设置</strong><small>通知 / 安全 / 建档</small><FiChevronRight /></button></section>

    {panel === "preview" ? <ProfilePanelShell title="资料预览" onClose={() => setPanel(null)}><section className={styles.profilePreviewCard}><div className={styles.profilePreviewCover}><ProfileImage photo={cover} name={profile.nickname} /><span><FiEye /> 仅展示模糊位置</span><b><FiImage /> {orderedPhotos.length}</b></div><div className={styles.profilePreviewIdentity}><ProfileImage photo={cover} name={profile.nickname} /><div><h3>{profile.nickname || "内测用户"}</h3><p>{profile.city || "城市待填写"} · 身份状态已同步</p></div></div><dl><div><dt>兴趣爱好</dt><dd>{profile.interests.join("、") || "待完善"}</dd></div><div><dt>资料可见范围</dt><dd>{profile.distanceKm}km · 仅模糊展示</dd></div><div><dt>个人介绍</dt><dd>{profile.bio || "待完善"}</dd></div></dl></section><p className={styles.sheetSafety}><FiShield /> 不公开精确位置、联系方式和敏感信息。</p><div className={styles.stackActions}><button type="button" className={styles.secondaryButton} onClick={onEdit}><FiEdit3 /> 编辑资料</button><button type="button" className={styles.primaryButton} onClick={() => setPanel("photos")}><FiCamera /> 照片管理</button></div></ProfilePanelShell> : null}

    {panel === "photos" ? <ProfilePanelShell title="照片管理" onClose={() => setPanel(null)}><p className={styles.sheetLead}>第一张作为封面。照片需通过审核，最多 6 张；资料完成后至少保留 2 张。</p><div className={styles.photoManagerGrid}>{orderedPhotos.map((photo, index) => <article key={photo.id}><ProfileImage photo={photo} name={profile.nickname} /><span>{index === 0 ? "封面" : `照片 ${index + 1}`}</span><div>{index ? <button type="button" disabled={photoBusy} onClick={() => void makeCover(photo)}><FiCheck /> 设为封面</button> : null}<button type="button" disabled={photoBusy || orderedPhotos.length <= 2} onClick={() => void removePhoto(photo)}><FiTrash2 /></button></div></article>)}{orderedPhotos.length < 6 ? <button type="button" className={styles.photoAddButton} disabled={photoBusy} onClick={() => fileInput.current?.click()}><FiUpload /><strong>{photoBusy ? "处理中…" : "添加照片"}</strong><small>JPG / PNG</small></button> : null}</div><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => void uploadPhotos(Array.from(event.target.files || []))} /><p className={styles.sheetSafety}><FiShield /> 上传会进入后端图片审核；未通过的照片不会成为公开资料。</p></ProfilePanelShell> : null}

    {panel === "advantages" ? <ProfilePanelShell title="我的优势" onClose={() => setPanel(null)}><p className={styles.sheetLead}>正式优势会作为高权重能力资料参与任务匹配，只在合适场景展示。</p><form className={styles.profileDataForm} onSubmit={(event) => { event.preventDefault(); void addAdvantage(); }}><input value={newAdvantage} onChange={(event) => setNewAdvantage(event.target.value)} placeholder="例如：擅长羽毛球入门陪练" /><button type="submit" disabled={!newAdvantage.trim() || profileDataBusy}><FiPlus /> 添加</button></form><div className={styles.profileDataList}>{advantages.length ? advantages.map((item) => <article key={item.id}><span><FiBriefcase /></span><div><strong>{item.title}</strong><small>{item.serviceArea || item.availableTime || "仅在匹配场景展示"}</small></div><button type="button" aria-label="删除优势" onClick={() => void removeAdvantage(item)}><FiTrash2 /></button></article>) : <p className={styles.emptyState}>还没有正式优势。先添加一项真实、可验证的能力。</p>}</div></ProfilePanelShell> : null}

    {panel === "verifications" ? <ProfilePanelShell title="认证中心" onClose={() => setPanel(null)}><p className={styles.sheetLead}>创建申请不等于已认证；只有证明材料审核通过后才展示 badge。</p><form className={styles.profileDataForm} onSubmit={(event) => { event.preventDefault(); void addVerification(); }}><input value={newVerification} onChange={(event) => setNewVerification(event.target.value)} placeholder="例如：国家二级运动员" /><button type="submit" disabled={!newVerification.trim() || profileDataBusy}><FiPlus /> 申请</button></form><div className={styles.profileDataList}>{verifications.length ? verifications.map((item) => <article key={item.id}><span><FiAward /></span><div><strong>{item.title}</strong><small>{item.status === "verified" ? item.badgeTitle || "已认证" : item.status === "pending_review" ? "材料审核中" : item.reviewerNote || "待提交证明"}</small></div>{item.status !== "verified" ? <button type="button" aria-label="删除认证申请" onClick={() => void removeVerification(item)}><FiTrash2 /></button> : <FiCheck />}</article>) : <p className={styles.emptyState}>暂无认证记录。</p>}</div></ProfilePanelShell> : null}

    {panel === "friends" ? <ProfilePanelShell title="好友列表" onClose={() => setPanel(null)}><p className={styles.sheetLead}>这里只展示双方已确认的关系。解除后不会再进入好友动态。</p><div className={styles.profileDataList}>{friends.length ? friends.map((friend) => <article key={friend.id}>{friend.avatar ? <img src={friend.avatar} alt={`${friend.name}头像`} /> : <span>{friend.name.slice(0, 1)}</span>}<div><strong>{friend.name}</strong><small>{friend.city || "城市未公开"}</small></div><button type="button" aria-label="解除好友" onClick={() => void removeFriend(friend)}><FiTrash2 /></button></article>) : <p className={styles.emptyState}>还没有双方确认的好友。</p>}</div></ProfilePanelShell> : null}

    {panel === "settings" ? <ProfilePanelShell title="更多设置" onClose={() => setPanel(null)}><label className={styles.switchRow}><span><strong>前台实时通知</strong><small>私信、互动和邀请在网页打开时实时更新</small></span><input type="checkbox" checked={notificationEnabled} onChange={(event) => onNotification(event.target.checked)} /><i /></label><div className={styles.settingsActions}><button type="button" onClick={onPrivacy}><FiEye /> 隐私与资料可见范围</button><button type="button" onClick={onRelationships}><FiUsers /> 好友与申请</button><button type="button" onClick={() => setPanel("blocklist")}><FiShield /> 黑名单</button><button type="button" onClick={onSafety}><FiLock /> 账号安全</button><button type="button" onClick={onReboard}><FiSliders /> 重新完善资料</button><button type="button" onClick={() => setPanel("closure")}><FiTrash2 /> 数据导出与注销账号</button><button type="button" onClick={onLogout}><FiLogOut /> 退出登录</button></div><p className={styles.sheetSafety}><FiShield /> 网页关闭后不宣称有后台推送；消息仍会保存在服务端。</p></ProfilePanelShell> : null}

    {panel === "blocklist" ? <ProfilePanelShell title="黑名单" onClose={() => setPanel(null)}><section className={styles.blocklistEmpty}><FiShield /><strong>暂无可展示的黑名单记录</strong><p>拉黑成功后，对方会从推荐、私信和互动通知中隐藏。当前后端只提供对具体用户的拉黑/解除操作，和 iOS 一样不在这里伪造名单。</p></section><div className={styles.detailRows}><div><span>私信</span><b>停止后续发送</b></div><div><span>匹配</span><b>不再进入候选</b></div><div><span>互动</span><b>相关通知隐藏</b></div></div><p className={styles.sheetSafety}><FiShield /> 遇到骚扰、诈骗或线下风险时，应同时使用具体内容或用户页的举报入口。</p></ProfilePanelShell> : null}

    {panel === "closure" ? <ProfilePanelShell title="数据与账号" onClose={() => setPanel(null)}><p className={styles.sheetLead}>注销是高风险操作。你可以先从后端导出账号数据；注销必须输入完整确认文字。</p><button type="button" className={styles.secondaryButton} disabled={accountBusy} onClick={() => void exportAccount()}><FiDownload /> {accountBusy ? "处理中…" : "导出我的数据"}</button><div className={styles.closurePanel}><strong>注销前请确认</strong><p>照片、动态和资料将不再公开；私信和互动会停止，必要安全审计按平台规则保留。</p><label><span>输入“注销账号”继续</span><input value={closureText} onChange={(event) => setClosureText(event.target.value)} placeholder="注销账号" /></label><button type="button" className={styles.dangerButton} disabled={closureText.trim() !== "注销账号" || accountBusy} onClick={() => void closeAccount()}>{accountBusy ? "正在提交…" : "确认注销账号"}</button></div></ProfilePanelShell> : null}
  </div>;
}
