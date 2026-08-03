"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { FiActivity, FiArrowLeft, FiArrowRight, FiBookOpen, FiBriefcase, FiCalendar, FiCamera, FiCheck, FiCode, FiCoffee, FiCompass, FiFeather, FiFilm, FiFlag, FiGlobe, FiHeart, FiHome, FiImage, FiLayers, FiMapPin, FiMessageCircle, FiMic, FiMonitor, FiPlus, FiSettings, FiShield, FiShoppingBag, FiStar, FiSun, FiTool, FiTruck, FiUsers, FiX, FiZap } from "react-icons/fi";
import type { FitMeetProfilePhoto, OnboardingPayload, OnboardingStatus, SocialProfile, SocialPurpose } from "@/lib/fitmeet-api-contract";
import { FITMEET_CURRENT_REGISTRATION_POLICY } from "@/lib/fitmeet-registration-consent";
import { FitMeetBrandIcon } from "./FitMeetBrandIcon";
import styles from "./fitmeet-complete.module.css";

gsap.registerPlugin(useGSAP);

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
const showMeOptions = ["女性", "男性", "所有人"];
const genderOptions = ["不透露", "女性", "男性", "非二元", "其他"];
const cityOptions = ["青岛", "上海", "北京", "深圳", "杭州", "成都"];
const communicationOptions = ["自然一点", "直接一点", "先从共同兴趣开始"];
const boundaryOptions = [
  "先在线上聊天熟悉，再决定是否见面",
  "第一次只在公共场所见面",
  "不接受临时改地点或临时邀约",
];

const onboardingStages = [
  {
    title: "基础身份",
    subtitle: "一次完成登录后必需的合规确认和基础资料。",
    summary: "合规确认 · 昵称生日 · 城市与展示偏好",
  },
  {
    title: "兴趣、目的和边界",
    subtitle: "告诉 FitMeet 你想认识谁、喜欢什么，以及不希望越过的边界。",
    summary: "目的 · 兴趣 · 性格 · 距离 · 见面边界 · Bio",
  },
  {
    title: "照片与最终确认",
    subtitle: "上传真实照片，检查完整资料卡，再确认进入首页。",
    summary: "照片 · 封面 · 资料摘要",
  },
] as const;

type InitialPurposeOptionShape = {
  value: string;
  title: string;
  subtitle: string;
  icon: typeof FiUsers;
  socialPurpose?: SocialPurpose;
  interestTags?: readonly string[];
};

const initialPurposeOptions = [
  { value: "friends", title: "交友", subtitle: "认识新朋友，先聊天，再看是否合适。", icon: FiUsers, socialPurpose: "newFriends" },
  { value: "dating", title: "恋爱", subtitle: "以认真关系或约会为目标。", icon: FiHeart, socialPurpose: "seriousDating" },
  { value: "workout", title: "约练", subtitle: "找运动伙伴、健身搭子、跑步搭子。", icon: FiStar, socialPurpose: "sportsPartner", interestTags: ["羽毛球", "跑步"] },
  { value: "travel", title: "找旅伴", subtitle: "一起旅行、周边游或短途出行。", icon: FiMapPin, socialPurpose: "activityPartner", interestTags: ["旅行"] },
  { value: "buddy", title: "兴趣搭子", subtitle: "从共同兴趣开始，一起做喜欢的事。", icon: FiCompass, socialPurpose: "activityPartner" },
  { value: "study", title: "学习搭子", subtitle: "读书、自习、语言练习或技能共学。", icon: FiBookOpen, socialPurpose: "activityPartner", interestTags: ["读书"] },
  { value: "meal", title: "饭搭子", subtitle: "一起探店、吃饭或喝咖啡。", icon: FiCoffee, socialPurpose: "activityPartner", interestTags: ["探店", "咖啡"] },
  { value: "movie", title: "电影搭子", subtitle: "看电影、聊电影或参加影展。", icon: FiFilm, socialPurpose: "activityPartner", interestTags: ["电影"] },
  { value: "photo", title: "摄影搭子", subtitle: "扫街、约拍或一起记录城市。", icon: FiCamera, socialPurpose: "activityPartner", interestTags: ["摄影", "Citywalk"] },
  { value: "fitness", title: "健身搭子", subtitle: "训练、跑步或规律运动。", icon: FiActivity, socialPurpose: "sportsPartner", interestTags: ["健身", "跑步"] },
  { value: "hiking", title: "徒步露营", subtitle: "徒步、露营、登山或亲近自然。", icon: FiSun, socialPurpose: "activityPartner", interestTags: ["徒步", "旅行"] },
  { value: "cycling", title: "跑步骑行", subtitle: "城市慢跑、骑行或周末拉练。", icon: FiZap, socialPurpose: "sportsPartner", interestTags: ["跑步", "健身"] },
  { value: "pets", title: "宠物社交", subtitle: "遛狗、宠物交流或友好聚会。", icon: FiFeather, socialPurpose: "activityPartner" },
  { value: "music", title: "音乐演出", subtitle: "音乐节、演唱会、Livehouse 或排练。", icon: FiMic, socialPurpose: "activityPartner", interestTags: ["音乐"] },
  { value: "exhibition", title: "看展逛馆", subtitle: "展览、博物馆、艺术空间或市集。", icon: FiLayers, socialPurpose: "activityPartner", interestTags: ["Citywalk", "摄影"] },
  { value: "boardgame", title: "桌游电竞", subtitle: "桌游、剧本、主机游戏或电竞组队。", icon: FiMonitor, socialPurpose: "activityPartner" },
  { value: "ballgames", title: "球类运动", subtitle: "羽毛球、网球、篮球、足球或乒乓球。", icon: FiActivity, socialPurpose: "sportsPartner", interestTags: ["羽毛球", "健身"] },
  { value: "citywalk", title: "城市漫游", subtitle: "Citywalk、咖啡、街区探索或夜游。", icon: FiGlobe, socialPurpose: "activityPartner", interestTags: ["Citywalk", "咖啡"] },
  { value: "service", title: "找专业服务", subtitle: "摄影、课程、咨询或技能服务。", icon: FiSettings },
  { value: "housing", title: "找房室友", subtitle: "租房、合租、室友、看房或房源筛选。", icon: FiHome },
  { value: "activity", title: "找本地活动", subtitle: "周末活动、展览、演出、运动局或线下局。", icon: FiCalendar },
  { value: "help", title: "找人帮忙", subtitle: "临时帮忙、信息求助、本地问题或资源求助。", icon: FiShield },
  { value: "career", title: "求职交流", subtitle: "行业交流、职业经验、面试或求职互助。", icon: FiBriefcase },
  { value: "business", title: "商务合作", subtitle: "项目合作、供应对接或本地商业连接。", icon: FiShoppingBag },
  { value: "design", title: "设计创意", subtitle: "视觉、产品、空间、内容或创意协作。", icon: FiLayers },
  { value: "technology", title: "编程科技", subtitle: "开发、AI、产品、开源或技术交流。", icon: FiCode },
  { value: "education", title: "教育培训", subtitle: "课程、家教、技能训练或学习咨询。", icon: FiBookOpen },
  { value: "health", title: "健康陪伴", subtitle: "陪诊、康复、照护或健康生活支持。", icon: FiHeart },
  { value: "repair", title: "装修维修", subtitle: "家装、维修、安装或设备维护。", icon: FiTool },
  { value: "moving", title: "搬家跑腿", subtitle: "搬家、运输、跑腿或临时执行。", icon: FiTruck },
  { value: "homecare", title: "家政照护", subtitle: "保洁、收纳、老人或宠物照护。", icon: FiHome },
  { value: "events", title: "活动策划", subtitle: "社群活动、品牌活动、婚礼或现场执行。", icon: FiFlag },
  { value: "volunteer", title: "公益志愿", subtitle: "志愿服务、社区互助或公益活动。", icon: FiUsers },
  { value: "other", title: "其他需求", subtitle: "让小福先听你说，再一起梳理。", icon: FiMessageCircle },
] as const satisfies readonly InitialPurposeOptionShape[];

export type InitialPurpose = (typeof initialPurposeOptions)[number]["value"];
type InitialPurposeOption = InitialPurposeOptionShape & { value: InitialPurpose };

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
    ...FITMEET_CURRENT_REGISTRATION_POLICY,
    adultAttestation: false,
    photoPermissionAcknowledged: false,
    contentRulesAccepted: false,
  },
  photos: [],
  };
}

function onboardingStorageKey(userId: number) {
  return `fitmeet:web-onboarding-draft:v2:${userId}`;
}

function readStoredDraft(userId: number, profile?: SocialProfile | null): Draft {
  const base = createInitialDraft(profile);
  if (typeof window === "undefined" || !userId) return base;
  try {
    const raw = window.localStorage.getItem(onboardingStorageKey(userId));
    if (!raw) return base;
    const stored = JSON.parse(raw) as Partial<Draft>;
    return {
      ...base,
      ...stored,
      purposes: Array.isArray(stored.purposes) ? stored.purposes : base.purposes,
      showMe: Array.isArray(stored.showMe) ? stored.showMe : base.showMe,
      personalityTags: Array.isArray(stored.personalityTags) ? stored.personalityTags : base.personalityTags,
      availableTimes: Array.isArray(stored.availableTimes) ? stored.availableTimes : base.availableTimes,
      interestTags: Array.isArray(stored.interestTags) ? stored.interestTags : base.interestTags,
      // A saved onboarding draft may outlive a legal-policy release. Preserve
      // the user's explicit choices, but always submit the current canonical
      // policy versions shared with registration instead of stale draft data.
      consents: {
        ...base.consents,
        ...(stored.consents ?? {}),
        ...FITMEET_CURRENT_REGISTRATION_POLICY,
      },
      photos: [],
    };
  } catch {
    return base;
  }
}

function toggle<T>(items: T[], item: T, minimum = 0) {
  return items.includes(item) ? (items.length > minimum ? items.filter((value) => value !== item) : items) : [...items, item];
}

function validationHint(stage: number, draft: Draft): string | null {
  if (stage === 0) {
    if (!draft.consents.contentRulesAccepted) return "请先同意服务条款与隐私政策";
    if (!draft.consents.adultAttestation) return "请确认你已年满 18 周岁";
    if (!draft.consents.photoPermissionAcknowledged) return "请确认照片的资料与审核用途";
    if (!draft.nickname.trim()) return "请填写昵称";
    if (!draft.dateOfBirth) return "请选择出生日期";
    if (!draft.city.trim()) return "请填写常驻城市";
    if (!draft.gender?.trim()) return "请选择性别展示方式";
    if (!draft.showMe.length) return "请选择想认识谁";
    return null;
  }
  if (stage === 1) {
    if (!draft.primaryPurpose || !draft.purposes.length) return "请选择至少一个社交目的，并设为主要目的";
    if (draft.interestTags.length < 3) return "请至少选择 3 个兴趣标签";
    if (draft.personalityTags.length < 2) return "请至少选择 2 个性格标签";
    if (!draft.meetingPace?.trim()) return "请选择舒服的见面节奏";
    if (!draft.communicationStyle?.trim()) return "请选择聊天方式";
    if (!draft.privacyBoundary?.trim()) return "请填写见面边界，例如“先在公共场所见面”";
    if (draft.distanceKm <= 0) return "请设置希望认识的人距离范围";
    if ((draft.bio?.length ?? 0) > 180) return "Bio 最多 180 字";
    return null;
  }
  const earlierHint = validationHint(0, draft) ?? validationHint(1, draft);
  if (earlierHint) return earlierHint;
  if (draft.photos.length < 2) return "请至少上传 2 张清晰的本人照片";
  if (draft.photos.length > 6) return "最多保留 6 张照片";
  return null;
}

function firstIncompleteStage(draft: Draft) {
  return [0, 1, 2].find((stage) => validationHint(stage, draft) !== null) ?? 2;
}

function recommendedInterests(purpose: SocialPurpose) {
  switch (purpose) {
    case "sportsPartner": return ["健身", "羽毛球", "跑步"];
    case "activityPartner": return ["Citywalk", "咖啡", "电影"];
    case "seriousDating": return ["咖啡", "电影", "旅行"];
    case "casualBrowsing": return ["电影", "音乐", "读书"];
    case "newFriends": return ["Citywalk", "电影", "咖啡"];
  }
}

function applyRecommendedPreferences(draft: Draft): Draft {
  return {
    ...draft,
    interestTags: draft.interestTags.length >= 3 ? draft.interestTags : recommendedInterests(draft.primaryPurpose),
    personalityTags: draft.personalityTags.length >= 2 ? draft.personalityTags : ["真诚", "有边界感"],
    meetingPace: draft.meetingPace || "先聊天",
    communicationStyle: draft.communicationStyle || "自然一点",
    availableTimes: draft.availableTimes.length ? draft.availableTimes : ["周六白天", "周日白天"],
    privacyBoundary: draft.privacyBoundary?.trim() || boundaryOptions.slice(0, 2).join("；"),
  };
}

export function OnboardingFlow({ userId, initialProfile, initialStatus, onComplete, onUploadPhotos, onExit, onLifeNeed }: { userId: number; initialProfile?: SocialProfile | null; initialStatus?: OnboardingStatus | null; onComplete: (payload: OnboardingPayload) => Promise<void>; onUploadPhotos: (files: File[]) => Promise<FitMeetProfilePhoto[]>; onExit: () => Promise<void>; onLifeNeed: (labels: string[]) => void }) {
  const [entry, setEntry] = useState<"initialPurpose" | "onboarding">("initialPurpose");
  const [selectedInitialPurposes, setSelectedInitialPurposes] = useState<InitialPurpose[]>([]);
  const [stage, setStage] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => readStoredDraft(userId, initialProfile));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [exiting, setExiting] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const purposeWorkspaceRef = useRef<HTMLElement>(null);
  const purposeCloudRef = useRef<HTMLDivElement>(null);
  const currentStage = onboardingStages[stage];
  const currentHint = useMemo(() => validationHint(stage, draft), [draft, stage]);
  const canContinue = currentHint === null;

  useGSAP(() => {
    if (!purposeCloudRef.current) return;
    const tiles = gsap.utils.toArray<HTMLElement>("[data-purpose-tile]", purposeCloudRef.current);
    const media = gsap.matchMedia();
    media.add(
      {
        desktop: "(min-width: 721px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const conditions = context.conditions as { desktop?: boolean; reduceMotion?: boolean };
        if (!conditions.desktop || conditions.reduceMotion) return;

        gsap.from(tiles, {
          autoAlpha: 0,
          y: 22,
          scale: 0.96,
          duration: 0.65,
          ease: "power3.out",
          stagger: { amount: 0.46, from: "random" },
        });

        tiles.forEach((tile, index) => {
          const direction = index % 2 === 0 ? 1 : -1;
          gsap.to(tile, {
            x: direction * (3 + (index % 3)),
            y: direction * (4 + (index % 4)),
            rotation: direction * (0.25 + (index % 3) * 0.12),
            duration: 3.4 + (index % 5) * 0.32,
            delay: (index % 7) * 0.08,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });
      },
    );
    return () => media.revert();
  }, { scope: purposeWorkspaceRef, dependencies: [entry], revertOnUpdate: true });

  const exit = async () => {
    if (exiting) return;
    setExiting(true);
    setError(null);
    try {
      await onExit();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "退出暂未完成，请稍后重试。");
      setExiting(false);
    }
  };

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [entry, stage]);

  useEffect(() => {
    if (!userId) return;
    const { photos: _photos, ...serializableDraft } = draft;
    try {
      window.localStorage.setItem(onboardingStorageKey(userId), JSON.stringify(serializableDraft));
    } catch {
      // Storage may be unavailable in private browsing; onboarding still works in memory.
    }
  }, [draft, userId]);

  const next = async () => {
    if (!canContinue) {
      setError(currentHint);
      return;
    }
    setError(null);
    if (stage < onboardingStages.length - 1) {
      setStage((value) => value + 1);
      return;
    }
    const incompleteStage = firstIncompleteStage(draft);
    const incompleteHint = validationHint(incompleteStage, draft);
    if (incompleteHint) {
      setStage(incompleteStage);
      setError(incompleteHint);
      return;
    }
    setSubmitting(true);
    try {
      const serverPhotos = await onUploadPhotos(draft.photos.map((photo) => photo.file));
      const orderedPhotos = [...serverPhotos].sort((left, right) => (left.sortOrder ?? left.sort_order ?? 0) - (right.sortOrder ?? right.sort_order ?? 0));
      const coverPhoto = orderedPhotos.find((photo) => photo.isCover || photo.is_cover) ?? orderedPhotos[0];
      if (!coverPhoto || orderedPhotos.length < 2) throw new Error("服务端尚未确认至少 2 张照片，请重新上传。");
      const { photos: _localPhotos, ...profilePayload } = draft;
      await onComplete({
        ...profilePayload,
        expectedProfileVersion: initialStatus?.completion?.profileVersion ?? null,
        photoIds: orderedPhotos.map((photo) => photo.id),
        coverPhotoId: coverPhoto.id,
      });
      try {
        window.localStorage.removeItem(onboardingStorageKey(userId));
      } catch {
        // Successful server completion must not be reported as failed if storage is unavailable.
      }
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

  const toggleInitialPurpose = (purpose: InitialPurpose) => {
    setError(null);
    setSelectedInitialPurposes((current) => toggle(current, purpose));
  };

  const continueFromInitialPurpose = () => {
    if (!selectedInitialPurposes.length) {
      setError("请先选择至少一个目标");
      return;
    }
    const selectedOptions: InitialPurposeOption[] = selectedInitialPurposes.flatMap((purpose) => {
      const option = initialPurposeOptions.find((candidate) => candidate.value === purpose);
      return option ? [option as InitialPurposeOption] : [];
    });
    const socialPurposes = selectedOptions
      .map((option) => option.socialPurpose)
      .filter((purpose): purpose is SocialPurpose => Boolean(purpose))
      .filter((purpose, index, values) => values.indexOf(purpose) === index);
    if (!socialPurposes.length) {
      onLifeNeed(selectedOptions.map((option) => option.title));
      return;
    }
    const selectedInterests = selectedOptions.flatMap((option) => option.interestTags ?? []);
    setDraft((current) => ({
      ...current,
      primaryPurpose: socialPurposes[0],
      purposes: socialPurposes,
      interestTags: [...new Set([...current.interestTags, ...selectedInterests])],
    }));
    setEntry("onboarding");
  };

  if (entry === "initialPurpose") {
    return (
      <main className={styles.onboardingPage}>
        <section ref={purposeWorkspaceRef} className={`${styles.mobileSurface} ${styles.purposeWorkspace}`} aria-label="FitMeet 初始需求选择">
          <header className={styles.purposeTopbar}>
            <FitMeetBrandIcon size={52} priority src="/brand/fitmeet-login-icon.png" />
            <button type="button" className={styles.flowExit} onClick={() => void exit()} disabled={exiting}>{exiting ? "正在安全退出…" : "退出当前账号"}</button>
          </header>
          <div className={styles.initialPurposeBody}>
            <header className={styles.purposeHero}>
              <h1>你想让 FitMeet 先帮你做什么？</h1>
              <p>可以多选。先选择你的目标，再进入下一步。</p>
            </header>
            <div ref={purposeCloudRef} className={styles.purposeCloud} role="group" aria-label="选择你的目标">
              {initialPurposeOptions.map((option) => {
                const Icon = option.icon;
                const selected = selectedInitialPurposes.includes(option.value);
                return (
                  <button
                    type="button"
                    key={option.value}
                    className={`${styles.purposeTile} ${selected ? styles.purposeTileSelected : ""}`}
                    data-purpose-tile
                    aria-pressed={selected}
                    title={option.subtitle}
                    onClick={() => toggleInitialPurpose(option.value)}
                  >
                    <span><Icon /></span>
                    <strong>{option.title}</strong>
                    <em className={styles.purposeTileHint}>{option.subtitle}</em>
                    {selected ? <i><FiCheck /></i> : null}
                  </button>
                );
              })}
            </div>
            {error ? <p className={`${styles.footerStatus} ${styles.footerStatusError}`} role="alert">{error}</p> : null}
            <div className={styles.purposeActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => onLifeNeed(["其他需求"])}>稍后再说</button>
              <button type="button" className={styles.primaryButton} onClick={continueFromInitialPurpose}>下一步 <FiArrowRight /></button>
            </div>
            <p className={styles.purposePrivacy}><FiShield /> 你的选择仅用于提升推荐准确度，不会公开可见</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.onboardingPage}>
      <section className={`${styles.mobileSurface} ${styles.onboardingWorkspace}`} aria-label="FitMeet 完整建档">
        <header className={styles.flowHeader}>
          <div className={styles.flowHeaderLeading}>
            <button type="button" aria-label={stage ? "返回上一阶段" : "返回需求选择"} onClick={stage ? () => { setError(null); setStage((value) => value - 1); } : () => setEntry("initialPurpose")}>{stage ? <FiArrowLeft /> : <FiX />}</button>
            <FitMeetBrandIcon size={38} priority src="/brand/fitmeet-login-icon.png" />
          </div>
          <div><strong>完善你的社交资料</strong><small>{currentStage.title} · {stage + 1} / 3</small></div>
          <button type="button" className={styles.flowExit} onClick={() => void exit()} disabled={exiting}>{exiting ? "正在安全退出…" : "退出建档"}</button>
        </header>

        <div ref={bodyRef} className={styles.onboardingBody}>
          <StageProgress stage={stage} title={currentStage.title} subtitle={currentStage.subtitle} summary={currentStage.summary} />
          {stage === 0 ? <div className={`${styles.stageSections} ${styles.stageDesktopGrid}`}><div className={styles.stageBlock}><StageSectionTitle title="开始前确认" subtitle="隐私、年龄和内容规则只确认一次。" /><Welcome draft={draft} setDraft={setDraft} /></div><div className={styles.stageBlock}><StageSectionTitle title="基础身份" subtitle="昵称、生日、城市和展示偏好。" /><Identity draft={draft} setDraft={setDraft} /></div></div> : null}
          {stage === 1 ? <div className={styles.stageSections}><button type="button" className={styles.quickFillButton} onClick={() => { setError(null); setDraft((current) => applyRecommendedPreferences(current)); }}><span><FiStar /><i><strong>使用小福推荐设置</strong><small>按当前目的补齐兴趣、性格、时间与安全边界，之后仍可修改</small></i></span><FiArrowRight /></button><div className={styles.stageDesktopGrid}><div className={styles.stageBlock}><StageSectionTitle title="社交目的" subtitle="选择主要目的，帮助小福正确理解你的需求。" /><Purpose draft={draft} setDraft={setDraft} /></div><div className={styles.stageBlock}><StageSectionTitle title="兴趣与性格" subtitle="至少选择 3 个兴趣和 2 个性格标签。" /><Interests draft={draft} setDraft={setDraft} /><Personality draft={draft} setDraft={setDraft} /></div><div className={`${styles.stageBlock} ${styles.stageBlockWide}`}><StageSectionTitle title="节奏与边界" subtitle="见面节奏、聊天方式、距离和安全边界。" /><div className={styles.stageNestedGrid}><Preferences draft={draft} setDraft={setDraft} /><Bio draft={draft} setDraft={setDraft} /></div></div></div></div> : null}
          {stage === 2 ? <div className={`${styles.stageSections} ${styles.stageDesktopGrid}`}><div className={styles.stageBlock}><StageSectionTitle title="真实照片" subtitle="上传 2–6 张照片，第一张作为封面。" /><Photos photos={draft.photos} onUpload={addPhotos} onRemove={(index) => setDraft((current) => ({ ...current, photos: current.photos.filter((_, item) => item !== index) }))} /></div><div className={styles.stageBlock}><StageSectionTitle title="最终确认" subtitle="确认资料卡摘要后进入首页。" /><Preview draft={draft} /></div></div> : null}
        </div>

        <footer className={styles.flowFooter}>
          <p className={`${styles.footerStatus} ${error ? styles.footerStatusError : canContinue ? styles.footerStatusReady : ""}`} aria-live="polite">{error ?? (canContinue ? (stage === 2 ? "资料已完整，确认后进入首页" : "当前阶段已完成") : currentHint)}</p>
          <div className={styles.footerActions}>
            {stage > 0 ? <button type="button" className={styles.secondaryButton} onClick={() => { setError(null); setStage((value) => value - 1); }}><FiArrowLeft /> 上一阶段</button> : null}
            <button type="button" className={styles.primaryButton} onClick={() => void next()} disabled={submitting}>{stage === onboardingStages.length - 1 ? (submitting ? "正在保存…" : <>确认并进入 <FiCheck /></>) : <>继续下一阶段 <FiArrowRight /></>}</button>
          </div>
        </footer>
      </section>
    </main>
  );
}

function StageProgress({ stage, title, subtitle, summary }: { stage: number; title: string; subtitle: string; summary: string }) {
  const progress = Math.round(((stage + 1) / onboardingStages.length) * 100);
  return <section className={styles.stageProgress} aria-label={`建档进度第 ${stage + 1} 章，共 ${onboardingStages.length} 章，当前章节 ${title}`}><div><strong>第 {stage + 1} 章 / 共 {onboardingStages.length} 章</strong><span>{progress}%</span></div><div className={styles.progressTrack}><i style={{ width: `${progress}%` }} /></div><h1>{title}</h1><p>{subtitle}</p><small>{summary}</small></section>;
}

function StageSectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <header className={styles.stageSectionTitle}><h2>{title}</h2><p>{subtitle}</p></header>;
}

function Welcome({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  const allConfirmed = draft.consents.contentRulesAccepted && draft.consents.adultAttestation && draft.consents.photoPermissionAcknowledged;
  return <section className={styles.welcomeStep}><div className={styles.onboardingBrand}><FitMeetBrandIcon size={82} priority /></div><h1>先让小福认识你一点</h1><p>这份资料只用于理解你的兴趣、边界和适合的社交节奏。你可以随时修改或删除。</p><div className={styles.consentList}>{[
    ["我已阅读并同意服务条款与隐私政策", "contentRulesAccepted"],
    ["我已年满 18 周岁", "adultAttestation"],
    ["我了解照片会用于个人资料和审核", "photoPermissionAcknowledged"],
  ].map(([label, key]) => <label key={key}><input type="checkbox" checked={Boolean(draft.consents[key as keyof Draft["consents"]])} onChange={(event) => setDraft((current) => ({ ...current, consents: { ...current.consents, [key]: event.target.checked } }))} /><span>{label}</span></label>)}</div><button type="button" className={styles.consentConfirm} onClick={() => setDraft((current) => ({ ...current, consents: { ...current.consents, contentRulesAccepted: true, adultAttestation: true, photoPermissionAcknowledged: true } }))}>{allConfirmed ? <><FiCheck /> 已确认以上内容</> : <><FiShield /> 我已了解并一次确认</>}</button><aside><FiShield /> 不展示精确位置；发送邀请和开启私信都需要你的确认。</aside></section>;
}

function Identity({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.stepSection}><h1>先填基础资料</h1><p>昵称和城市优先沿用现有账号资料；生日使用系统日期选择，不公开精确位置。</p><Field label="昵称"><input value={draft.nickname} maxLength={20} onChange={(event) => setDraft((current) => ({ ...current, nickname: event.target.value }))} /></Field><Field label="出生日期"><input type="date" value={draft.dateOfBirth} onChange={(event) => setDraft((current) => ({ ...current, dateOfBirth: event.target.value }))} /></Field><Field label="常驻城市"><input value={draft.city} onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))} /></Field><div className={styles.choiceRow}>{cityOptions.map((value) => <button type="button" key={value} className={draft.city === value ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, city: value }))}>{value}</button>)}</div><p className={styles.groupLabel}>你的性别</p><div className={styles.choiceRow}>{genderOptions.map((value) => <button type="button" key={value} className={draft.gender === value ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, gender: value }))}>{value}</button>)}</div><p className={styles.groupLabel}>想认识谁</p><div className={styles.choiceRow}>{showMeOptions.map((value) => <button type="button" key={value} className={draft.showMe.includes(value) ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, showMe: [value] }))}>{value}</button>)}</div></section>;
}

function Purpose({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.stepSection}><h1>你这次更想收获什么？</h1><p>可选多个；第一个会成为小福优先理解的目的。</p><div className={styles.purposeList}>{purposeOptions.map((option) => { const selected = draft.purposes.includes(option.value); return <button type="button" key={option.value} className={selected ? styles.choiceSelected : ""} onClick={() => setDraft((current) => { const purposes = toggle(current.purposes, option.value, 1); return { ...current, purposes, primaryPurpose: purposes.includes(current.primaryPurpose) ? current.primaryPurpose : purposes[0] }; })}><span><strong>{option.title}</strong><small>{option.subtitle}</small></span>{draft.primaryPurpose === option.value ? <em>主要目的</em> : selected ? <FiCheck /> : <i />}</button>; })}</div></section>;
}

function Interests({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.stepSection}><h1>哪些事会让你放松？</h1><p>选择至少 3 个。它们会用来解释“为什么推荐这个人”。</p><div className={styles.chipGrid}>{interests.map((interest) => <button type="button" key={interest} className={draft.interestTags.includes(interest) ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, interestTags: toggle(current.interestTags, interest) }))}>{interest}</button>)}</div></section>;
}

function Personality({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.stepSection}><h1>让对话更像你</h1><p>至少选择 2 个性格标签；它们会让开场方式和推荐节奏更自然。</p><Field label="MBTI（可选）"><input placeholder="例如 INFJ" value={draft.mbti ?? ""} onChange={(event) => setDraft((current) => ({ ...current, mbti: event.target.value.toUpperCase() }))} /></Field><p className={styles.groupLabel}>你觉得自己更像（至少 2 个）</p><div className={styles.chipGrid}>{personalities.map((tag) => <button type="button" key={tag} className={draft.personalityTags.includes(tag) ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, personalityTags: toggle(current.personalityTags, tag) }))}>{tag}</button>)}</div><p className={styles.groupLabel}>聊天方式</p><div className={styles.choiceRow}>{communicationOptions.map((value) => <button type="button" key={value} className={draft.communicationStyle === value ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, communicationStyle: value }))}>{value}</button>)}</div></section>;
}

function Preferences({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  const selectedBoundaries = (draft.privacyBoundary ?? "").split("；").map((value) => value.trim()).filter(Boolean);
  return <section className={styles.stepSection}><h1>把舒服的边界说清楚</h1><p>优先点选即可；小福只把它们当作筛选建议，不会替你越过边界。</p><p className={styles.groupLabel}>见面节奏</p><div className={styles.choiceRow}>{paceOptions.map((value) => <button type="button" key={value} className={draft.meetingPace === value ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, meetingPace: value }))}>{value}</button>)}</div><p className={styles.groupLabel}>通常可约（可选）</p><div className={styles.chipGrid}>{timeOptions.map((value) => <button type="button" key={value} className={draft.availableTimes.includes(value) ? styles.chipSelected : ""} onClick={() => setDraft((current) => ({ ...current, availableTimes: toggle(current.availableTimes, value) }))}>{value}</button>)}</div><Field label={`推荐半径 · ${draft.distanceKm} km`}><input type="range" min="1" max="30" value={draft.distanceKm} onChange={(event) => setDraft((current) => ({ ...current, distanceKm: Number(event.target.value) }))} /></Field><p className={styles.groupLabel}>见面边界（至少选择 1 项）</p><div className={styles.boundaryChoices}>{boundaryOptions.map((value) => <button type="button" key={value} className={selectedBoundaries.includes(value) ? styles.chipSelected : ""} onClick={() => setDraft((current) => { const items = (current.privacyBoundary ?? "").split("；").map((item) => item.trim()).filter(Boolean); return { ...current, privacyBoundary: toggle(items, value).join("；") }; })}><FiShield />{value}{selectedBoundaries.includes(value) ? <FiCheck /> : null}</button>)}</div><Field label="其他边界（可选）"><textarea placeholder="只在需要时补充" value={draft.privacyBoundary} onChange={(event) => setDraft((current) => ({ ...current, privacyBoundary: event.target.value }))} /></Field></section>;
}

function Bio({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return <section className={styles.stepSection}><h1>用几句话介绍自己</h1><p>不用写得很完美，真实和舒适比“包装得好”更重要。</p><Field label="Bio"><textarea className={styles.largeTextarea} maxLength={180} value={draft.bio} onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))} /><small>{draft.bio?.length ?? 0}/180</small></Field></section>;
}

function Photos({ photos, onUpload, onRemove }: { photos: DraftPhoto[]; onUpload: (files: FileList | null) => void; onRemove: (index: number) => void }) {
  return <section className={styles.stepSection}><h1>上传照片</h1><p>至少 2 张，最多 6 张。第一张会作为封面；照片会先经过审核。审核通过前，账号不会进入其他用户的匹配候选。</p><div className={styles.photoGrid}>{photos.map((photo, index) => <figure key={photo.preview}><img src={photo.preview} alt={`资料照片 ${index + 1}`} /><button type="button" aria-label="删除照片" onClick={() => onRemove(index)}><FiX /></button>{index === 0 ? <figcaption>封面</figcaption> : null}</figure>)}{photos.length < 6 ? <label className={styles.photoUpload}><FiImage /><span>添加照片</span><input type="file" accept="image/*" multiple onChange={(event) => onUpload(event.target.files)} /></label> : null}</div><aside><FiShield /> 请使用清晰、真实的本人照片；避免敏感信息、未成年人和他人隐私。所有账号都必须完成同样的真实资料门槛。</aside></section>;
}

function Preview({ draft }: { draft: Draft }) {
  return <section className={styles.stepSection}><h1>确认你的资料卡</h1><p>小福会用这些信息筛掉不合适的邀约，推荐前也会说明原因。</p><article className={styles.profilePreviewCard}><div className={styles.previewAvatar}>{draft.photos[0] ? <img src={draft.photos[0].preview} alt="封面" /> : draft.nickname.slice(0, 1)}</div><div><h2>{draft.nickname}</h2><p>{draft.city} · {draft.meetingPace}</p></div></article><dl className={styles.previewRows}><div><dt>主要目的</dt><dd>{purposeOptions.find((item) => item.value === draft.primaryPurpose)?.title}</dd></div><div><dt>兴趣</dt><dd>{draft.interestTags.join(" · ")}</dd></div><div><dt>边界</dt><dd>{draft.privacyBoundary}</dd></div><div><dt>推荐范围</dt><dd><FiMapPin /> 模糊区域内 {draft.distanceKm} km</dd></div></dl><aside><FiCheck /> 你确认后才会完成建档并进入社交功能。</aside></section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}
