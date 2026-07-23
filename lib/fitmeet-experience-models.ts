export type DemandViewStatus = "draft" | "published" | "matching" | "matched" | "invited" | "communicating" | "hidden" | "cancelled";
export type CandidateDecision = "new" | "saved" | "dismissed" | "invited";
export type InvitationViewStatus = "none" | "draft" | "sent" | "accepted" | "rejected" | "cancelled";
export type MeetViewStatus = "none" | "scheduled" | "arrived" | "completed" | "no_show" | "cancelled";
export type ApplicationViewStatus = "idle" | "pending" | "accepted" | "rejected" | "cancelled";

export type DemandViewModel = {
  id: string;
  title: string;
  summary: string;
  activityType: string;
  timeWindow: string;
  locationText: string;
  capacityMax: number;
  durationText: string;
  privacyBoundary: string;
  status: DemandViewStatus;
  fields?: Array<{ title: string; value: string }>;
};

export type CandidateViewModel = {
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

export type MeetViewModel = {
  id: number;
  status: MeetViewStatus;
  confirmedAt?: string;
  completedAt?: string;
  review?: "守约" | "愉快" | "不合适";
};

export const emptyDemandView: DemandViewModel = {
  id: "",
  title: "",
  summary: "",
  activityType: "",
  timeWindow: "时间待确认",
  locationText: "大致地点待确认",
  capacityMax: 2,
  durationText: "节奏待确认",
  privacyBoundary: "公共场所集合，先聊天再决定",
  status: "draft",
};

export function invitationMessage(candidate: CandidateViewModel, demand: DemandViewModel): string {
  const internalTypeCopy: Record<string, string> = {
    friends: "认识新朋友",
    dating: "认真认识彼此",
    workout: "一起运动",
    buddy: "找兴趣相近的搭子",
    travel: "一起旅行",
    activity: "参加感兴趣的活动",
    service: "沟通服务需求",
    housing: "聊聊找房或合租",
    help: "沟通需要的帮助",
    other: "做点彼此都感兴趣的事",
  };
  const activity = internalTypeCopy[demand.activityType.toLowerCase()] || demand.activityType || "一起活动";
  const time = demand.timeWindow && !/待确认/.test(demand.timeWindow) ? `在${demand.timeWindow}` : "找个彼此方便的时间";
  const location = demand.locationText && !/待确认/.test(demand.locationText) ? `，大致在${demand.locationText}` : "";
  const candidateName = candidate.name ? `${candidate.name}，` : "";
  return `${candidateName}你好，看到我们都想${time}${location}${activity ? `，一起${activity}` : ""}。想先在线聊几句；如果彼此都觉得舒服，再一起确认时间、公共场所和活动边界。`;
}
