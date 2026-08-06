import type { DemandDraftSession, FitMeetDemand, FitMeetDemandCandidate } from "./fitmeet-api-contract";
import type { CandidateViewModel, DemandViewModel } from "./fitmeet-experience-models";
import { agentDraftActivity, deduplicateAgentCardFields, orderedAgentDraftFields } from "./fitmeet-agent-thread-state.ts";

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
  dataQuality?: string;
  lastActiveText?: string | null;
  explanationSignals?: string[];
  missingSignals?: string[];
  boundaryNotes?: string[];
  confidenceLevel?: string;
  safeFirstStep?: string;
  nextActionSuggestion?: string;
  requiresConfirmation?: boolean;
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
  const displayFields = deduplicateAgentCardFields(value.fields);
  const activityType = humanDemandActivity(value.category || value.type || "一起活动", displayFields);
  return {
    id: value.id,
    title: value.title,
    summary: value.summary,
    activityType,
    timeWindow: fieldValue(displayFields, "时间", "时间待确认"),
    locationText: fieldValue(displayFields, "地点", "大致地点待确认"),
    capacityMax: value.capacityMax || 2,
    durationText: fieldValue(displayFields, "方式", "节奏待确认"),
    privacyBoundary: fieldValue(displayFields, "边界", "公共场所集合，先聊天再决定"),
    status: demandStatus(value.status, value.candidateCount),
    fields: displayFields.map((field) => ({ title: field.title, value: field.value })),
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
    dataQuality: value.dataQuality,
    lastActiveText: value.lastActiveText,
    explanationSignals: value.lifeGraphExplanation?.usedSignals ?? [],
    missingSignals: value.lifeGraphExplanation?.missingSignals ?? [],
    boundaryNotes: value.lifeGraphExplanation?.boundaryNotes ?? [],
    confidenceLevel: value.lifeGraphExplanation?.confidenceLevel,
    safeFirstStep: value.candidateExplanation?.safeFirstStep,
    nextActionSuggestion: value.candidateExplanation?.nextActionSuggestion,
    requiresConfirmation: value.candidateExplanation?.requiresConfirmation,
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
  const structured = session.structuredDraft;
  if (structured?.schemaVersion === 2) {
    const factsByKey = new Map(structured.facts.map((fact) => [fact.key, fact]));
    const defaults: Record<string, string> = {
      goal: structured.intent.goal || "找到合适伙伴，一起完成这件事",
      activity: "新的活动",
      location: "同城公共场所，具体地点可协商（可编辑默认）",
      time: "时间可协商（可编辑默认）",
      ability: "能力不限，轻松参与（可编辑默认）",
    };
    const labels: Record<string, string> = {
      goal: "核心目的",
      activity: "活动",
      location: "地点",
      time: "时间",
      ability: "能力",
    };
    const fieldFor = (key: string) => {
      const fact = factsByKey.get(key);
      const hasValue = Boolean(fact?.value?.trim());
      return {
        key,
        title: fact?.label || labels[key],
        value: fact?.value?.trim() || defaults[key],
        state: hasValue ? fact?.state || "inferred" : "defaulted",
        requirement: key === "goal" ? "context" : "preferred",
        visibility: "public",
        editable: fact?.editable !== false,
        evidence: fact?.evidence || [],
      } as const;
    };
    const activity = fieldFor("activity").value;
    const structuredFields: NonNullable<DemandViewModel["fields"]> = [
      {
        key: "public_summary",
        title: "公开摘要",
        value: structured.intent.publicSummary.trim() || `希望找到合适的人一起完成“${activity}”。`,
        state: "inferred",
        requirement: "context",
        visibility: "public",
        editable: true,
        evidence: [],
      },
      ...["goal", "activity", "location", "time", "ability"].map(fieldFor),
    ];
    return {
      id: session.generatedCardId || session.id,
      title: structured.intent.title,
      summary: structured.intent.publicSummary || structured.intent.goal,
      demandType: structured.intent.demandType,
      activityType: activity,
      timeWindow: fieldFor("time").value,
      locationText: fieldFor("location").value,
      capacityMax: 2,
      durationText: fieldFor("ability").value,
      privacyBoundary: "公开场所优先，沟通后再决定",
      status: "draft",
      fields: structuredFields,
      publishable: true,
      completeness: 100,
      revision: structured.revision,
    };
  }
  const fields = session.knownFields || {};
  const activity = agentDraftActivity(session);
  const cardFields: NonNullable<DemandViewModel["fields"]> = [
    { key: "public_summary", title: "公开摘要", value: `希望找到合适的人一起完成“${activity}”。`, state: "inferred", requirement: "context", visibility: "public", editable: true, evidence: [] },
    { key: "goal", title: "核心目的", value: fields["核心目的"] || `找到合适伙伴，一起完成“${activity}”`, state: "inferred", requirement: "context", visibility: "public", editable: true, evidence: [] },
    { key: "activity", title: "活动", value: activity, state: "inferred", requirement: "preferred", visibility: "public", editable: true, evidence: [] },
    { key: "location", title: "地点", value: fields["地点"] || fields["目的地"] || "同城公共场所，具体地点可协商（可编辑默认）", state: "defaulted", requirement: "preferred", visibility: "public", editable: true, evidence: [] },
    { key: "time", title: "时间", value: fields["时间"] || "时间可协商（可编辑默认）", state: "defaulted", requirement: "preferred", visibility: "public", editable: true, evidence: [] },
    { key: "ability", title: "能力", value: fields["能力"] || fields["能力要求"] || fields["水平或偏好"] || "能力不限，轻松参与（可编辑默认）", state: "defaulted", requirement: "preferred", visibility: "public", editable: true, evidence: [] },
  ];
  return {
    id: session.generatedCardId || session.id,
    title: activity,
    summary: `希望找到合适的人一起完成“${activity}”。`,
    activityType: activity,
    timeWindow: cardFields.find((field) => field.key === "time")?.value || "时间可协商（可编辑默认）",
    locationText: cardFields.find((field) => field.key === "location")?.value || "同城公共场所，具体地点可协商（可编辑默认）",
    capacityMax: 2,
    durationText: cardFields.find((field) => field.key === "ability")?.value || "能力不限，轻松参与（可编辑默认）",
    privacyBoundary: "公开场所优先，沟通后再决定",
    status: "draft",
    fields: cardFields,
    publishable: true,
    completeness: 100,
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
  const softPreferences = Array.from(new Set([
    activity ? `活动：${activity}` : "",
    demand.timeWindow && !/待确认/.test(demand.timeWindow) ? `时间：${demand.timeWindow}` : "",
    demand.locationText && !/待确认/.test(demand.locationText) ? `地点：${demand.locationText}` : "",
    demand.durationText && !/可编辑默认|待确认/.test(demand.durationText) ? `能力：${demand.durationText}` : "",
  ].filter(Boolean)));
  return {
    demandType,
    activity,
    matchingPolicy: {
      city: city || undefined,
      radiusKm,
      hardFilters: [],
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
