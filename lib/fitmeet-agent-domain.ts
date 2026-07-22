import type { DemandDraftSession, FitMeetDemand, FitMeetDemandCandidate } from "./fitmeet-api-contract";
import { defaultDemoDemand, type DemoCandidate, type DemoDemand } from "./fitmeet-experience-runtime";

export type LiveCandidate = DemoCandidate & {
  candidateRecordId: number;
  candidateUserId: number;
  avatar?: string | null;
  color?: string;
  score?: number | null;
  suggestedOpener?: string;
  riskWarnings?: string[];
  safetyState?: string;
  verificationStatus?: string;
  profileCompleteness?: number | null;
  lastActiveText?: string | null;
  explanationSignals?: string[];
  boundaryNotes?: string[];
};

export function demandStatus(status: string, candidateCount = 0): DemoDemand["status"] {
  const normalized = status === "canceled" ? "cancelled" : status;
  if (normalized === "matchedCommunicating") return "communicating";
  if (normalized === "invited") return "invited";
  if (normalized === "hasCandidates" || candidateCount > 0) return "matched";
  if (["candidatePool", "published", "active"].includes(normalized)) return "matching";
  if (["hidden", "cancelled", "matching", "matched", "communicating", "draft"].includes(normalized)) {
    return normalized as DemoDemand["status"];
  }
  return "draft";
}

export function effectiveDemandStatus(demand: DemoDemand, candidateCount: number): DemoDemand["status"] {
  if (demand.status === "communicating" || demand.status === "invited") return demand.status;
  return candidateCount > 0 ? "matched" : demand.status;
}

function fieldValue(fields: FitMeetDemand["fields"], title: string, fallback: string) {
  return fields.find((field) => field.title === title)?.value || fallback;
}

export function displayDemand(value: FitMeetDemand): DemoDemand {
  return {
    id: value.id,
    title: value.title,
    summary: value.summary,
    activityType: value.category || value.type || "一起活动",
    timeWindow: fieldValue(value.fields, "时间", "时间待确认"),
    locationText: fieldValue(value.fields, "地点", "大致地点待确认"),
    capacityMax: value.capacityMax || 2,
    durationText: fieldValue(value.fields, "方式", "节奏待确认"),
    privacyBoundary: fieldValue(value.fields, "边界", "公共场所集合，先聊天再决定"),
    status: demandStatus(value.status, value.candidateCount),
    fields: value.fields.map((field) => ({ title: field.title, value: field.value })),
  };
}

export function displayCandidate(value: FitMeetDemandCandidate): LiveCandidate {
  const tags = value.commonTags?.length ? value.commonTags : value.interestTags?.length ? value.interestTags : [];
  const reasons = value.reasons?.length ? value.reasons : value.matchReasons?.length ? value.matchReasons : [];
  return {
    id: value.candidateUserId,
    candidateUserId: value.candidateUserId,
    candidateRecordId: value.candidateRecordId,
    avatar: value.avatar,
    color: value.color,
    score: value.score ?? value.matchScore,
    suggestedOpener: value.suggestedOpener ?? value.suggestedMessage,
    riskWarnings: value.riskWarnings ?? [],
    safetyState: value.safetyState,
    verificationStatus: value.verificationStatus,
    profileCompleteness: value.profileCompleteness,
    lastActiveText: value.lastActiveText,
    explanationSignals: value.lifeGraphExplanation?.usedSignals ?? [],
    boundaryNotes: value.lifeGraphExplanation?.boundaryNotes ?? [],
    name: value.displayName || value.nickname || "FitMeet 用户",
    age: value.age ?? 0,
    city: value.city || "同城",
    sport: value.level || "共同活动",
    level: value.level || "节奏待沟通",
    distance: typeof value.distanceKm === "number" ? `${value.distanceKm.toFixed(1)} km` : "距离待确认",
    reason: reasons.join("；") || value.candidateExplanation?.safeFirstStep || "匹配原因待服务端生成",
    tags,
    decision: value.status === "dismissed" ? "dismissed" : value.status === "invited" ? "invited" : value.status === "saved" ? "saved" : "new",
  };
}

export function displayDraftSession(session: DemandDraftSession): DemoDemand {
  const fields = session.knownFields || {};
  const activity = fields["运动项目"] || fields["活动"] || fields["服务类型"] || fields.activity || session.category || "一起活动";
  const cardFields = ["运动项目", "活动", "服务类型", "求助事项", "目的地", "地点", "时间", "水平或偏好", "搭子要求", "偏好", "预算", "数量或人数"]
    .filter((key) => fields[key])
    .map((key) => ({ title: key, value: fields[key] }))
    .slice(0, 6);
  return {
    ...defaultDemoDemand,
    id: session.generatedCardId || session.id,
    title: activity === "一起活动" ? "一起做点喜欢的事" : `轻松${activity}局`,
    summary: session.rawUserIntent || defaultDemoDemand.summary,
    activityType: activity,
    timeWindow: fields["时间"] || fields.time || "时间待确认",
    locationText: fields["地点"] || fields["目的地"] || fields.location || "大致地点待确认",
    durationText: fields["水平或偏好"] || fields["搭子要求"] || fields["偏好"] || fields.boundary || "节奏待确认，可继续补充",
    privacyBoundary: fields.boundary || fields["搭子要求"] || fields["偏好"] || "公共场所集合，先聊天再决定",
    status: "draft",
    fields: cardFields.length >= 3 ? cardFields : undefined,
  };
}

export function demandTypeFor(activityType: string) {
  const activity = activityType.toLowerCase();
  if (/羽毛球|跑步|慢跑|健身|健身房|徒步|爬山|骑行|游泳|瑜伽|篮球|足球|网球|乒乓|攀岩|运动|约练/.test(activity)) return "workout";
  if (/旅行|旅伴|周边游|出行/.test(activity)) return "travel";
  if (/约会|恋爱|相亲/.test(activity)) return "dating";
  if (/展览|演出|电影|桌游|活动|音乐节/.test(activity)) return "activity";
  if (/维修|搬家|家政|摄影|课程|服务/.test(activity)) return "service";
  if (/租房|合租|室友|看房/.test(activity)) return "housing";
  if (/求助|帮忙|跑腿/.test(activity)) return "help";
  if (/交友|认识朋友/.test(activity)) return "friends";
  return "buddy";
}

export function requiresScheduledTime(demandType: string) {
  return !["service", "housing", "help"].includes(demandType);
}

export function missingFieldsForDemandType(demandType: string, fields: Record<string, string>) {
  const required: Record<string, string[]> = {
    friends: ["地点", "偏好"], dating: ["地点", "偏好"],
    workout: ["运动项目", "地点", "时间", "水平或偏好"],
    buddy: ["活动", "地点", "时间", "搭子要求"],
    travel: ["目的地", "时间", "搭子要求"],
    service: ["服务类型", "地点"], housing: ["地点", "预算"],
    activity: ["活动", "地点", "时间"], help: ["求助事项", "地点"], other: ["需求内容"],
  };
  return (required[demandType] || required.other).filter((key) => !fields[key]?.trim());
}

export function demandStatusCopy(value: FitMeetDemand) {
  const status = demandStatus(value.status, value.candidateCount);
  if (status === "communicating") return "已匹配";
  if (status === "invited") return "已邀请";
  if (status === "matched") return `${value.candidateCount || 0} 位候选`;
  if (status === "matching" || status === "published") return "匹配中";
  if (status === "hidden") return "已暂停";
  if (status === "cancelled") return "已取消";
  return "待确认";
}
