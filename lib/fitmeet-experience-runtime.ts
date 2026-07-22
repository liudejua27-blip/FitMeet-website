import type { FeedPost, SocialProfile } from "./fitmeet-api-contract";

export type DemoDemandStatus = "draft" | "published" | "matching" | "matched" | "invited" | "communicating" | "hidden" | "cancelled";
export type CandidateDecision = "new" | "saved" | "dismissed" | "invited";
export type DemoInvitationStatus = "none" | "draft" | "sent" | "accepted" | "rejected" | "cancelled";
export type DemoMeetStatus = "none" | "scheduled" | "arrived" | "completed" | "no_show" | "cancelled";
export type DemoApplicationStatus = "idle" | "pending" | "accepted" | "rejected" | "cancelled";

export type DemoDemand = {
  id: string;
  title: string;
  summary: string;
  activityType: string;
  timeWindow: string;
  locationText: string;
  capacityMax: number;
  durationText: string;
  privacyBoundary: string;
  status: DemoDemandStatus;
  fields?: Array<{ title: string; value: string }>;
};

export type DemoCandidate = {
  id: number;
  name: string;
  age: number;
  city: string;
  sport: string;
  level: string;
  distance: string;
  reason: string;
  tags: string[];
  decision: CandidateDecision;
};

export type DemoMeet = {
  id: number;
  status: DemoMeetStatus;
  confirmedAt?: string;
  completedAt?: string;
  review?: "守约" | "愉快" | "不合适";
};

export const defaultDemoDemand: DemoDemand = {
  id: "demo-demand-001",
  title: "周六羽毛球局",
  summary: "周六下午想找人打羽毛球，水平差不多就行。",
  activityType: "羽毛球",
  timeWindow: "周六 16:00",
  locationText: "静安体育中心",
  capacityMax: 2,
  durationText: "AA 场地 · 90 分钟",
  privacyBoundary: "公共场馆集合，先确认节奏再见面",
  status: "draft",
};

export const defaultDemoCandidates: DemoCandidate[] = [
  {
    id: 1004,
    name: "林一",
    age: 25,
    city: "静安",
    sport: "羽毛球",
    level: "中级",
    distance: "1.8 km",
    reason: "时间、水平与活动节奏相近；也选择了公共场馆和 AA。",
    tags: ["周末可约", "公共场馆", "AA 更自在"],
    decision: "new",
  },
  {
    id: 1005,
    name: "许澈",
    age: 27,
    city: "静安",
    sport: "羽毛球",
    level: "进阶",
    distance: "2.4 km",
    reason: "同样偏好不赶时间的球局，愿意先确认水平和场馆。",
    tags: ["周末下午", "先聊天", "不追强度"],
    decision: "new",
  },
  {
    id: 1006,
    name: "周末",
    age: 24,
    city: "徐汇",
    sport: "羽毛球",
    level: "中级",
    distance: "4.1 km",
    reason: "运动频率接近，接受公共区域集合与临时调整时间。",
    tags: ["同城", "临时可调", "公共场所"],
    decision: "new",
  },
];

export function candidatesForDemoDemand(demand: DemoDemand): DemoCandidate[] {
  const activityHasSkillLevel = ["羽毛球", "跑步", "徒步"].includes(demand.activityType);
  return defaultDemoCandidates.map((candidate, index) => ({
    ...candidate,
    sport: demand.activityType,
    level: activityHasSkillLevel ? candidate.level : "慢节奏",
    city: demand.locationText,
    reason: index === 0
      ? `活动、时间和「${demand.privacyBoundary}」的节奏相近；适合先从轻松的一次${demand.activityType}开始。`
      : index === 1
        ? `同样偏好不赶时间的${demand.activityType}，愿意先确认安排和边界。`
        : `活动偏好接近，也接受公共区域集合与临时调整时间。`,
    tags: index === 0 ? [demand.timeWindow, "公共场所", "先聊天"] : index === 1 ? ["不赶时间", "先确认细节", demand.locationText] : ["同城", "临时可调", "公共场所"],
    decision: "new",
  }));
}

export const seedExperiencePosts: FeedPost[] = [
  { id: 1, userId: 1001, username: "乔乔", city: "静安", title: "下次想约一场不赶时间的轻松局", text: "今天的羽毛球课终于没有迟到。慢慢热身、慢慢打，也很好。", tags: ["羽毛球", "周末可约"], likes: 18, comments: 3, images: [], createdAt: "刚刚" },
  { id: 2, userId: 1002, username: "吴宜", city: "徐汇", title: "周日晨跑", text: "周日早上在滨江慢跑 5km，不追配速，愿意一起聊天就更好。", tags: ["跑步", "公共区域"], likes: 9, comments: 1, images: [], createdAt: "18 分钟前" },
];

const activityRules: Array<{ keys: string[]; activity: string; title: string }> = [
  { keys: ["羽毛球", "球"], activity: "羽毛球", title: "轻松羽毛球局" },
  { keys: ["跑步", "晨跑", "夜跑"], activity: "跑步", title: "不赶配速的跑步搭子" },
  { keys: ["徒步", "爬山"], activity: "徒步", title: "周末轻徒步" },
  { keys: ["咖啡", "咖啡馆"], activity: "咖啡聊天", title: "不赶时间的咖啡聊天" },
  { keys: ["citywalk", "看展", "散步"], activity: "Citywalk", title: "慢慢逛的 Citywalk" },
  { keys: ["摄影", "拍照"], activity: "摄影", title: "一起散步拍照" },
];

export function inferDemoDemand(prompt: string, profile: SocialProfile, previous: DemoDemand): DemoDemand {
  const normalized = prompt.trim();
  const matchedRule = activityRules.find((rule) => rule.keys.some((key) => normalized.toLowerCase().includes(key.toLowerCase())));
  const activityType = matchedRule?.activity ?? previous.activityType;
  const timeWindow = /周[一二三四五六日天]|周末|今晚|明天|下午|早上|晚上/.test(normalized)
    ? normalized.match(/(?:本周|下周)?周[一二三四五六日天](?:早上|上午|中午|下午|晚上|傍晚|\s*[0-2]?\d(?:[:：]\d{2})?)?|周末(?:早上|上午|中午|下午|晚上|傍晚)?|今晚(?:早些|晚些|\s*[0-2]?\d(?:[:：]\d{2})?)?|明天(?:早上|上午|中午|下午|晚上|傍晚|\s*[0-2]?\d(?:[:：]\d{2})?)?/)?.[0]?.replace(/\s+/g, " ") ?? "时间待确认"
    : "时间待确认";
  const locationText = /静安|徐汇|黄浦|浦东|体育中心|公园|球馆|滨江/.test(normalized)
    ? normalized.match(/(?:静安|徐汇|黄浦|浦东)(?:体育中心|公园|球馆|滨江)?|(?:体育中心|公园|球馆|滨江)/)?.[0] ?? previous.locationText
    : "大致地点待确认";

  return {
    ...previous,
    title: matchedRule?.title ?? `${activityType}一起出发`,
    summary: normalized || previous.summary,
    activityType,
    timeWindow,
    locationText,
    durationText: activityType === "Citywalk" || activityType === "咖啡聊天" ? "60 分钟左右，节奏可随时调整" : previous.durationText,
    privacyBoundary: profile.agentCanStartChatAfterApproval
      ? "双方确认后可开启私信；不展示精确位置"
      : "先聊天再确认；公共场馆集合，不展示精确位置",
    status: "draft",
  };
}

export function agentAcknowledgement(prompt: string, demand: DemoDemand): string {
  const missing: string[] = [];
  if (!/(周[一二三四五六日天]|今晚|明天|早上|下午|晚上)/.test(prompt)) missing.push("时间");
  if (!/(静安|徐汇|黄浦|浦东|体育中心|公园|球馆|滨江)/.test(prompt)) missing.push("大致地点");
  const question = missing.length
    ? `如果你愿意，下一步只补一下${missing.join("和")}就好；不想现在决定也没关系。`
    : "我已经把时间、地点和节奏整理成草稿，你可以先看一眼再决定要不要发布。";
  const emotionalAcknowledgement = /(累|疲惫|压力|不舒服|难过|焦虑|烦)/.test(prompt)
    ? "听起来你这周已经很累了，把节奏放慢、不给自己增加压力很重要。"
    : "我听到了，你想找的是一次轻松的连接，而不是赶任务。";
  return `${emotionalAcknowledgement}我先按「${demand.activityType}」整理。${question}在你确认前，我不会替你发申请、邀请或私信。`;
}

export function invitationMessage(candidate: DemoCandidate, demand: DemoDemand): string {
  return `嗨，看到我们都想在${demand.timeWindow}进行${demand.activityType}，节奏和边界也比较接近。想先约一次轻松的活动；如果你方便，我们再一起确认场馆和细节。`;
}
