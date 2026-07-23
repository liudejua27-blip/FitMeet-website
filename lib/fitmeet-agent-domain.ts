import type { DemandDraftSession, FitMeetDemand, FitMeetDemandCandidate } from "./fitmeet-api-contract";
import type { CandidateViewModel, DemandViewModel } from "./fitmeet-experience-models";
import { agentDraftActivity, orderedAgentDraftFields } from "./fitmeet-agent-thread-state";

export type LiveCandidate = CandidateViewModel & {
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

export function demandStatus(status: string, candidateCount = 0): DemandViewModel["status"] {
  const normalized = status === "canceled" ? "cancelled" : status;
  if (normalized === "matchedCommunicating") return "communicating";
  if (normalized === "invited") return "invited";
  if (normalized === "hasCandidates" || candidateCount > 0) return "matched";
  if (["candidatePool", "published", "active"].includes(normalized)) return "matching";
  if (["hidden", "cancelled", "matching", "matched", "communicating", "draft"].includes(normalized)) {
    return normalized as DemandViewModel["status"];
  }
  return "draft";
}

export function effectiveDemandStatus(demand: DemandViewModel, candidateCount: number): DemandViewModel["status"] {
  if (demand.status === "communicating" || demand.status === "invited") return demand.status;
  return candidateCount > 0 ? "matched" : demand.status;
}

function fieldValue(fields: FitMeetDemand["fields"], title: string, fallback: string) {
  return fields.find((field) => field.title === title)?.value || fallback;
}

const internalDemandTypeLabels: Record<string, string> = {
  friends: "认识新朋友",
  dating: "认真认识彼此",
  workout: "一起运动",
  buddy: "一起找搭子",
  travel: "一起旅行",
  activity: "一起参加活动",
  service: "找合适的服务",
  housing: "找房或室友",
  help: "寻求帮助",
  other: "一起做点喜欢的事",
};

export function humanDemandActivity(activityType: string, fields: Array<{ title: string; value: string }> = []) {
  const normalized = activityType.trim().toLowerCase();
  if (!internalDemandTypeLabels[normalized]) return activityType || "一起活动";
  return fields.find((field) => ["运动项目", "活动", "服务类型", "求助事项", "目的地"].includes(field.title) && field.value.trim())?.value
    || internalDemandTypeLabels[normalized];
}

export function displayDemand(value: FitMeetDemand): DemandViewModel {
  const activityType = humanDemandActivity(value.category || value.type || "一起活动", value.fields);
  return {
    id: value.id,
    title: value.title,
    summary: value.summary,
    activityType,
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

export function displayDraftSession(session: DemandDraftSession): DemandViewModel {
  const fields = session.knownFields || {};
  const activity = agentDraftActivity(session);
  const cardFields = orderedAgentDraftFields(session);
  const timeField = cardFields.find((field) => /时间|日期|期限/.test(field.title) && field.value)?.value;
  const locationField = cardFields.find((field) => /地点|位置|区域|目的地/.test(field.title) && field.value)?.value;
  const preferenceField = cardFields.find((field) => /方式|节奏|要求|偏好|水平|边界/.test(field.title) && field.value)?.value;
  return {
    id: session.generatedCardId || session.id,
    title: activity,
    summary: session.rawUserIntent?.trim() || Object.values(fields).filter(Boolean).join(" · ") || "需求内容待补充",
    activityType: activity,
    timeWindow: timeField || fields["时间"] || fields.time || "时间待确认",
    locationText: locationField || fields["地点"] || fields["目的地"] || fields.location || "大致地点待确认",
    capacityMax: 2,
    durationText: preferenceField || fields["水平或偏好"] || fields["搭子要求"] || fields["偏好"] || fields.boundary || "节奏待确认，可继续补充",
    privacyBoundary: fields["边界"] || fields.boundary || fields["搭子要求"] || fields["偏好"] || "公共场所集合，先聊天再决定",
    status: "draft",
    fields: cardFields,
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

export function demandMatchingPolicy(demand: DemandViewModel, city: string, radiusKm: number) {
  const demandType = demandTypeFor(demand.activityType);
  const activity = humanDemandActivity(demand.activityType, demand.fields);
  const hardFilters = demandType === "workout" && activity
    ? [`运动项目：${activity}`]
    : [];
  const softPreferences = Array.from(new Set([
    activity ? `活动：${activity}` : "",
    demand.timeWindow && !/待确认/.test(demand.timeWindow) ? `时间：${demand.timeWindow}` : "",
    demand.locationText && !/待确认/.test(demand.locationText) ? `地点：${demand.locationText}` : "",
    demand.durationText && !/待确认/.test(demand.durationText) ? `方式：${demand.durationText}` : "",
    demand.privacyBoundary ? `边界：${demand.privacyBoundary}` : "",
  ].filter(Boolean)));
  return {
    demandType,
    activity,
    matchingPolicy: {
      city: city || undefined,
      radiusKm,
      hardFilters,
      softPreferences,
    },
  };
}

export function demandFieldImportance(title: string, demandType: string): "required" | "optional" | "context" {
  // The current MobileAPI matcher only distinguishes `required` and
  // `optional`; an unknown `context` value falls back to the field kind and
  // turns a safety boundary into an exact hard filter. Keep the boundary in
  // matchingPolicy.softPreferences and render it on the card, while marking
  // the field optional for backend compatibility.
  if (title === "边界") return "optional";
  if (demandType === "workout" && title === "运动项目") return "required";
  return "optional";
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
