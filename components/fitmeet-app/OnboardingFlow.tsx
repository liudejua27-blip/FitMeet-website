"use client";

import { useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCalendar, FiCheck, FiCompass, FiHeart, FiHome, FiImage, FiMapPin, FiMessageCircle, FiPlus, FiSettings, FiShield, FiStar, FiUsers, FiX } from "react-icons/fi";
import type { FitMeetProfilePhoto, OnboardingPayload, OnboardingStatus, SocialProfile, SocialPurpose } from "@/lib/fitmeet-api-contract";
import { FitMeetBrandIcon } from "./FitMeetBrandIcon";
import styles from "./fitmeet-complete.module.css";

type DraftPhoto = { file: File; preview: string };
type Draft = Omit<OnboardingPayload, "expectedProfileVersion" | "photoIds" | "coverPhotoId"> & { photos: DraftPhoto[] };

const purposeOptions: Array<{ value: SocialPurpose; title: string; subtitle: string }> = [
  { value: "sportsPartner", title: "找运动搭子", subtitle: "运动类型、水平和频率" },
  { value: "activityPartner", title: "找活动搭子", subtitle: "看展、咖啡、Citywalk" },
  { value: "newFriends", title: "认识新朋友", subtitle: "共同兴趣和活跃时间" },
  { value: "seriousDating", title: "认真交友", subtitle: "关系期待和生活方式" },
  { value: "casualBrowsing", title: "随便看看", subtitle: "先轻量探索，不主动创建匹配" },
];

const interests = ["健身", "羽毛球", "Citywalk", "咖啡", "电影", "徒步", "旅行", "摄影", "读书", "音乐", "跑步", "探店"];
const personalities = ["慢热", "真诚", "幽默", "有边界感", "爱计划", "随性", "好奇", "稳定"];
const paceOptions = ["先聊天", "一周内见面", "熟悉后再约"];
const timeOptions = ["工作日晚上", "周六白天", "周日白天", "周末晚上"];

type InitialPurpose = "friends" | "dating" | "workout" | "buddy" | "travel" | "service" | "housing" | "activity" | "help" | "other";

const initialPurposeGroups: Array<{ title: string; subtitle: string; options: Array<{ value: InitialPurpose; title: string; subtitle: string; icon: typeof FiUsers; socialPurpose?: SocialPurpose }> }> = [
  {
    title: "真人连接类",
    subtitle: "涉及交友、恋爱、约练、搭子或同行时，先补齐社交档案。",
    options: [
      { value: "friends", title: "交友", subtitle: "认识新朋友，先聊天，再看是否合适。", icon: FiUsers, socialPurpose: "newFriends" },
      { value: "dating", title: "恋爱", subtitle: "以认真关系或约会为目标。", icon: FiHeart, socialPurpose: "seriousDating" },
      { value: "workout", title: "约练", subtitle: "找运动伙伴、健身搭子、跑步搭子。", icon: FiStar, socialPurpose: "sportsPartner" },
      { value: "buddy", title: "搭子", subtitle: "饭搭子、电影搭子、展览搭子、学习搭子。", icon: FiCompass, socialPurpose: "activityPartner" },
      { value: "travel", title: "找旅伴", subtitle: "一起旅行、周边游、短途出行。", icon: FiMapPin, socialPurpose: "activityPartner" },
    ],
  },
  {
    title: "生活需求类",
    subtitle: "不需要先建社交档案，直接进入 Agent 帮你整理需求。",
    options: [
      { value: "service", title: "找服务", subtitle: "维修、搬家、摄影、课程或技能服务。", icon: FiSettings },
      { value: "housing", title: "找房", subtitle: "租房、合租、室友、看房或房源筛选。", icon: FiHome },
      { value: "activity", title: "找活动", subtitle: "周末活动、展览、演出、运动局、线下局。", icon: FiCalendar },
      { value: "help", title: "求助", subtitle: "临时帮忙、信息求助、本地问题或资源求助。", icon: FiShield },
      { value: "other", title: "其他", subtitle: "让 Agent 先听你说。", icon: FiMessageCircle },
    ],
  },
];

function createInitialDraft(profile?: SocialProfile | null): Draft {
  return {
  nickname: profile?.nickname || "",
  dateOfBirth: "",
  city: profile?.city || "",
  primaryPurpose: "newFriends",
  purposes: ["newFriends"],
  bio: profile?.bio || "",
  gender: "不透露",
  showMe: ["所有人"],
  personalityTags: [],
  mbti: "",
  meetingPace: "先聊天",
  communicationStyle: "自然一点",
  nearbyArea: "",
  fitnessGoals: [],
  exerciseLevels: [],
  socialScenes: [],
  lifestyleTags: [],
  availableTimes: [],
  socialPreference: "共同兴趣优先",
  privacyBoundary: "",
  interestTags: profile?.interests || [],
  distanceKm: profile?.distanceKm || 5,
  fuzzyLatitude: null,
  fuzzyLongitude: null,
  consents: {
    termsVersion: "2026-07-02",
    privacyVersion: "2026-07-02",
    adultAttestation: false,
    photoPermissionAcknowledged: false,
    contentRulesAccepted: false,
  },
  photos: [],
  };
}

function toggle<T>(items: T[], item: T, minimum = 0) {
  return items.includes(item) ? (items.length > minimum ? items.filter((value) => value !== item) : items) : [...items, item];
}

export function OnboardingFlow({ initialProfile, initialStatus, onComplete, onUploadPhotos, onExit, onLifeNeed }: { initialProfile?: SocialProfile | null; initialStatus?: OnboardingStatus | null; onComplete: (payload: OnboardingPayload) => Promise<void>; onUploadPhotos: (files: File[]) => Promise<FitMeetProfilePhoto[]>; onExit: () => void; onLifeNeed: (purpose: InitialPurpose) => void }) {
  const [entry, setEntry] = useState<"initialPurpose" | "onboarding">("initialPurpose");
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => createInitialDraft(initialProfile));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const lastStep = 8;
  const title = ["Agent 建档", "基础身份", "社交目的", "兴趣爱好", "性格 / MBTI", "偏好补充", "Bio", "上传照片", "确认资料卡"][step];
  const canContinue = useMemo(() => {
    if (step === 0) return draft.consents.adultAttestation && draft.consents.contentRulesAccepted && draft.consents.photoPermissionAcknowledged;
    if (step === 1) return Boolean(draft.nickname.trim() && draft.dateOfBirth && draft.city.trim());
    if (step === 2) return Boolean(draft.primaryPurpose && draft.purposes.length);
    if (step === 3) return draft.interestTags.length >= 3;
    if (step === 7) return draft.photos.length >= 2;
    if (step === 8) return Boolean(draft.nickname.trim() && draft.privacyBoundary?.trim());
    return true;
  }, [draft, step]);

  const next = async () => {
    if (!canContinue) {
      setError(step === 3 ? "至少选择 3 个兴趣，才更容易得到合适的推荐。" : "请先完成本页必要信息。");
      return;
    }
    setError(null);
    if (step < lastStep) {
      setStep((value) => value + 1);
      return;
    }
    setSubmitting(true);
    try {
      const serverPhotos = await onUploadPhotos(draft.photos.map((photo) => photo.file));
      const orderedPhotos = [...serverPhotos].sort((left, right) => (left.sortOrder ?? left.sort_order ?? 0) - (right.sortOrder ?? right.sort_order ?? 0));
      const coverPhoto = orderedPhotos.find((photo) => photo.isCover || photo.is_cover) ?? orderedPhotos[0];
      if (!coverPhoto || orderedPhotos.length < 2) throw new Error("服务端尚未确认至少 2 张照片，请重新上传。");
      await onComplete({
        ...draft,
        expectedProfileVersion: initialStatus?.completion?.profileVersion ?? null,
        photoIds: orderedPhotos.map((photo) => photo.id),
        coverPhotoId: coverPhoto.id,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "资料暂未保存，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 6 - draft.photos.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setDraft((current) => ({ ...current, photos: [...current.photos, { file, preview: String(reader.result) }] }));
      reader.readAsDataURL(file);
    });
  };

  const selectInitialPurpose = (option: (typeof initialPurposeGroups)[number]["options"][number]) => {
    if (!option.socialPurpose) {
      onLifeNeed(option.value);
      return;
    }
    setDraft((current) => ({ ...current, primaryPurpose: option.socialPurpose ?? current.primaryPurpose, purposes: current.purposes.includes(option.socialPurpose!) ? current.purposes : [option.socialPurpose!, ...current.purposes] }));
    setEntry("onboarding");
  };

  if (entry === "initialPurpose") {
    return <main className={styles.onboardingPage}><section className={styles.mobileSurface} aria-label="FitMeet 初始需求选择"><div className={styles.initialPurposeBody}><div className={styles.onboardingBrand}><FitMeetBrandIcon size={64} priority /></div><h1>你想让 FitMeet 先帮你做什么？</h1><p>先判断需求，再决定是否建档。只有涉及真人连接、亲密关系、线下同行或被推荐给别人时，才进入社交资料完善。</p>{initialPurposeGroups.map((group) => <section key={group.title} className={styles.initialPurposeGroup}><h2>{group.title}</h2><small>{group.subtitle}</small><div>{group.options.map((option) => { const Icon = option.icon; return <button type="button" key={option.value} onClick={() => selectInitialPurpose(option)}><span><Icon /></span><i><strong>{option.title}</strong><em>{option.subtitle}</em></i><FiArrowRight /></button>; })}</div></section>)}<button type="button" className={styles.flowExit} onClick={onExit}>退出内测账号</button></div></section></main>;
  }

  return (
    <main className={styles.onboardingPage}>
      <section className={styles.mobileSurface} aria-label="FitMeet 完整建档">
        <header className={styles.flowHeader}>
          <button type="button" aria-label={step ? "返回上一步" : "返回需求选择"} onClick={step ? () => setStep((value) => value - 1) : () => setEntry("initialPurpose")}>{step ? <FiArrowLeft /> : <FiX />}</button>
          <div><strong>{title}</strong><small>{step + 1} / 9</small></div>
          <button type="button" className={styles.flowExit} onClick={onExit}>退出建档</button>
        </header>
        <div className={styles.progressTrack}><i style={{ width: `${((step + 1) / 9) * 100}%` }} /></div>

        <div className={styles.onboardingBody}>
          {step === 0 ? <Welcome draft={draft} setDraft={setDraft} /> : null}
          {step === 1 ? <Identity draft={draft} setDraft={setDraft} /> : null}
          {step === 2 ? <Purpose draft={draft} setDraft={setDraft} /> : null}
          {step === 3 ? <Interests draft={draft} setDraft={setDraft} /> : null}
          {step === 4 ? <Personality draft={draft} setDraft={setDraft} /> : null}
          {step === 5 ? <Preferences draft={draft} setDraft={setDraft} /> : null}
          {step === 6 ? <Bio draft={draft} setDraft={setDraft} /> : null}
          {step === 7 ? <Photos photos={draft.photos} onUpload={addPhotos} onRemove={(index) => setDraft((current) => ({ ...current, photos: current.photos.filter((_, item) => item !== index) }))} /> : null}
          {step === 8 ? <Preview draft={draft} /> : null}
        </div>

        <footer className={styles.flowFooter}>
          {error ? <p className={styles.formError}>{error}</p> : <span />}
          <button type="button" className={styles.primaryButton} onClick={() => void next()} disabled={submitting}>{step === lastStep ? (submitting ? "正在保存…" : <>确认并进入 FitMeet <FiCheck /></>) : <>继续 <FiArrowRight /></>}</button>
        </footer>
      </section>
    </main>
  );
}

function Welcome({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.welcomeStep}><div className={styles.onboardingBrand}><FitMeetBrandIcon size={82} priority /></div><h1>先让小福认识你一点</h1><p>这份资料只用于理解你的兴趣、边界和适合的社交节奏。你可以随时修改或删除。</p><div className={styles.consentList}>{[
    ["我已阅读并同意服务条款与隐私政策", "contentRulesAccepted"],
    ["我已年满 18 周岁", "adultAttestation"],
    ["我了解照片会用于个人资料和审核", "photoPermissionAcknowledged"],
  ].map(([label, key]) => <label key={key}><input type="checkbox" checked={Boolean(draft.consents[key as keyof Draft["consents"]])} onChange={(event) => setDraft((current) => ({ ...current, consents: { ...current.consents, [key]: event.target.checked } }))} /><span>{label}</span></label>)}</div><aside><FiShield /> 不展示精确位置；发送邀请和开启私信都需要你的确认。</aside></section>;
}

function Identity({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.stepSection}><h1>先填基础资料</h1><p>昵称、年龄和城市会帮助小福理解你，但不会公开精确位置。</p><Field label="昵称"><input value={draft.nickname} maxLength={20} onChange={(event) => setDraft((current) => ({ ...current, nickname: event.target.value }))} /></Field><Field label="出生日期"><input type="date" value={draft.dateOfBirth} onChange={(event) => setDraft((current) => ({ ...current, dateOfBirth: event.target.value }))} /></Field><Field label="常驻城市"><input value={draft.city} onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))} /></Field><Field label="性别（可选）"><select value={draft.gender} onChange={(event) => setDraft((current) => ({ ...current, gender: event.target.value }))}><option>不透露</option><option>女性</option><option>男性</option></select></Field></section>;
}

function Purpose({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.stepSection}><h1>你这次更想收获什么？</h1><p>可选多个；第一个会成为小福优先理解的目的。</p><div className={styles.purposeList}>{purposeOptions.map((option) => { const selected = draft.purposes.includes(option.value); return <button type="button" key={option.value} className={selected ? styles.choiceSelected : ""} onClick={() => setDraft((current) => { const purposes = toggle(current.purposes, option.value, 1); return { ...current, purposes, primaryPurpose: purposes.includes(current.primaryPurpose) ? current.primaryPurpose : purposes[0] }; })}><span><strong>{option.title}</strong><small>{option.subtitle}</small></span>{draft.primaryPurpose === option.value ? <em>主要目的</em> : selected ? <FiCheck /> : <i />}</button>; })}</div></section>;
}

function Interests({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.stepSection}><h1>哪些事会让你放松？</h1><p>选择至少 3 个。它们会用来解释“为什么推荐这个人”。</p><div className={styles.chipGrid}>{interests.map((interest) => <button type="button" key={interest} className={draft.interestTags.includes(interest) ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, interestTags: toggle(current.interestTags, interest) }))}>{interest}</button>)}</div></section>;
}

function Personality({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.stepSection}><h1>让对话更像你</h1><p>这些信息可选，但会让开场方式和推荐节奏更自然。</p><Field label="MBTI（可选）"><input placeholder="例如 INFJ" value={draft.mbti ?? ""} onChange={(event) => setDraft((current) => ({ ...current, mbti: event.target.value }))} /></Field><p className={styles.groupLabel}>你觉得自己更像</p><div className={styles.chipGrid}>{personalities.map((tag) => <button type="button" key={tag} className={draft.personalityTags.includes(tag) ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, personalityTags: toggle(current.personalityTags, tag) }))}>{tag}</button>)}</div><Field label="聊天方式"><select value={draft.communicationStyle} onChange={(event) => setDraft((current) => ({ ...current, communicationStyle: event.target.value }))}><option>自然一点</option><option>直接一点</option><option>先从共同兴趣开始</option></select></Field></section>;
}

function Preferences({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.stepSection}><h1>把舒服的边界说清楚</h1><p>小福会把这些当作建议，不会替你越过边界。</p><p className={styles.groupLabel}>见面节奏</p><div className={styles.choiceRow}>{paceOptions.map((value) => <button type="button" key={value} className={draft.meetingPace === value ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, meetingPace: value }))}>{value}</button>)}</div><p className={styles.groupLabel}>通常可约</p><div className={styles.chipGrid}>{timeOptions.map((value) => <button type="button" key={value} className={draft.availableTimes.includes(value) ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, availableTimes: toggle(current.availableTimes, value) }))}>{value}</button>)}</div><Field label={`推荐半径 · ${draft.distanceKm} km`}><input type="range" min="1" max="30" value={draft.distanceKm} onChange={(event) => setDraft((current) => ({ ...current, distanceKm: Number(event.target.value) }))} /></Field><Field label="见面边界"><textarea value={draft.privacyBoundary} onChange={(event) => setDraft((current) => ({ ...current, privacyBoundary: event.target.value }))} /></Field></section>;
}

function Bio({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.stepSection}><h1>用几句话介绍自己</h1><p>不用写得很完美，真实和舒适比“包装得好”更重要。</p><Field label="Bio"><textarea className={styles.largeTextarea} maxLength={180} value={draft.bio} onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))} /><small>{draft.bio?.length ?? 0}/180</small></Field></section>;
}

function Photos({ photos, onUpload, onRemove }: { photos: DraftPhoto[]; onUpload: (files: FileList | null) => void; onRemove: (index: number) => void }) {
  return <section className={styles.stepSection}><h1>上传照片</h1><p>至少 2 张，最多 6 张。第一张会作为封面；照片会先经过审核。</p><div className={styles.photoGrid}>{photos.map((photo, index) => <figure key={photo.preview}><img src={photo.preview} alt={`资料照片 ${index + 1}`} /><button type="button" aria-label="删除照片" onClick={() => onRemove(index)}><FiX /></button>{index === 0 ? <figcaption>封面</figcaption> : null}</figure>)}{photos.length < 6 ? <label className={styles.photoUpload}><FiImage /><span>添加照片</span><input type="file" accept="image/*" multiple onChange={(event) => onUpload(event.target.files)} /></label> : null}</div><aside><FiShield /> 请使用清晰、真实的本人照片；避免敏感信息、未成年人和他人隐私。</aside></section>;
}

function Preview({ draft }: { draft: Draft }) {
  return <section className={styles.stepSection}><h1>确认你的资料卡</h1><p>小福会用这些信息筛掉不合适的邀约，推荐前也会说明原因。</p><article className={styles.profilePreviewCard}><div className={styles.previewAvatar}>{draft.photos[0] ? <img src={draft.photos[0].preview} alt="封面" /> : draft.nickname.slice(0, 1)}</div><div><h2>{draft.nickname}</h2><p>{draft.city} · {draft.meetingPace}</p></div></article><dl className={styles.previewRows}><div><dt>主要目的</dt><dd>{purposeOptions.find((item) => item.value === draft.primaryPurpose)?.title}</dd></div><div><dt>兴趣</dt><dd>{draft.interestTags.join(" · ")}</dd></div><div><dt>边界</dt><dd>{draft.privacyBoundary}</dd></div><div><dt>推荐范围</dt><dd><FiMapPin /> 模糊区域内 {draft.distanceKm} km</dd></div></dl><aside><FiCheck /> 你确认后才会完成建档并进入社交功能。</aside></section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}
