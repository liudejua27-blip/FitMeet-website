import type {
  AgentThreadEntry,
  DemandMatchesResponse,
  DemandDraftSession,
  DemandDraftUpdatePayload,
} from "./fitmeet-api-contract";
import type { DemandViewModel } from "./fitmeet-experience-models";

const genericDemandCategories = new Set([
  "friends",
  "dating",
  "workout",
  "buddy",
  "travel",
  "service",
  "housing",
  "activity",
  "help",
  "other",
]);

const preferredFieldOrder = [
  "活动类型",
  "活动",
  "运动项目",
  "服务类型",
  "求助事项",
  "需求内容",
  "目的地",
  "地点",
  "时间",
  "数量或人数",
  "预算",
  "水平或偏好",
  "搭子要求",
  "偏好",
  "边界",
  "见面方式",
  "人数",
];

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function assistantLabelValue(content: string, labels: string[]) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = content.match(new RegExp(`(?:^|\\n)\\s*[-*•]?\\s*\\**${escaped}\\**\\s*[:：]\\s*([^\\n]+)`, "i"));
    const value = clean(match?.[1]).replace(/\*\*/g, "").trim();
    if (value && value.length <= 120) return value;
  }
  return "";
}

// These values deliberately cover only negotiable or safety-oriented fields.
// Core intent fields (activity, destination, service/request content) and any
// identity, address or contact detail must still come from the user.
const editableDefaultValues: Record<string, string> = {
  "偏好": "不限，优先礼貌、尊重边界（可编辑默认）",
  "搭子要求": "不限，优先礼貌、尊重边界（可编辑默认）",
  "水平或偏好": "水平不限，以轻松参与和彼此照顾为主（可编辑默认）",
  "时间": "时间可协商（可编辑默认）",
  "地点": "同城公共场所，具体地点可协商（可编辑默认）",
  "预算": "预算与费用方式可提前协商（可编辑默认）",
  "数量或人数": "1–2 人，具体人数可协商（可编辑默认）",
  "人数": "1–2 人，具体人数可协商（可编辑默认）",
  "边界": "先在线沟通，只在公共场所见面，尊重彼此边界（可编辑默认）",
  "见面方式": "先在线沟通，只在公共场所见面，尊重彼此边界（可编辑默认）",
};

export function editableDefaultFieldTitles(session: DemandDraftSession | null | undefined) {
  if (!session) return [];
  return Object.entries(session.knownFields || {})
    .filter(([, value]) => clean(value).includes("可编辑默认"))
    .map(([title]) => title);
}

export function editableDefaultDraftPatch(
  session: DemandDraftSession | null | undefined,
): Partial<DemandDraftSession> | null {
  if (!session || session.status === "cardGenerated") return null;
  const knownFields = { ...(session.knownFields || {}) };
  const defaulted: string[] = [];
  for (const field of session.missingFields || []) {
    if (clean(knownFields[field])) continue;
    const defaultValue = editableDefaultValues[field];
    if (!defaultValue) continue;
    knownFields[field] = defaultValue;
    defaulted.push(field);
  }
  if (!defaulted.length) return null;
  const missingFields = (session.missingFields || [])
    .filter((field) => !clean(knownFields[field]));
  const canGenerateCard = missingFields.length === 0;
  return {
    knownFields,
    missingFields,
    canGenerateCard,
    status: canGenerateCard ? "readyToConfirm" : "collecting",
    lastQuestion: canGenerateCard
      ? `已用可编辑建议值补全${defaulted.join("、")}；需求草稿会自动更新，发布前仍需确认。`
      : `${missingFields[0]}是这次需求的核心信息，你希望是什么样？`,
  };
}

export function orderedAgentDraftFields(session: DemandDraftSession, limit = 6) {
  const knownFields = { ...(session.knownFields || {}) };
  if (clean(knownFields["活动类型"])) delete knownFields["活动"];
  if (clean(knownFields["人数"])) delete knownFields["数量或人数"];
  if (Object.keys(knownFields).filter((key) => key !== "需求内容" && clean(knownFields[key])).length >= 3) {
    delete knownFields["需求内容"];
  }
  const allKeys = Array.from(new Set([
    ...preferredFieldOrder,
    ...Object.keys(knownFields),
    ...(session.missingFields || []),
  ]));
  return allKeys
    .filter((key) => clean(knownFields[key]) || session.missingFields.includes(key))
    .map((title) => ({ title, value: clean(knownFields[title]) }))
    .slice(0, Math.max(1, limit));
}

export function agentDraftActivity(session: DemandDraftSession) {
  const fields = orderedAgentDraftFields(session, 12);
  const semanticField = fields.find((field) => [
    "活动类型",
    "活动",
    "运动项目",
    "服务类型",
    "求助事项",
    "需求内容",
    "目的地",
  ].includes(field.title) && field.value)?.value;
  if (semanticField) return semanticField;
  const category = clean(session.category);
  if (category && !genericDemandCategories.has(category.toLowerCase())) return category;
  return fields.find((field) => field.value)?.value || "新的 FitMeet 需求";
}

export function canonicalAgentDraftCardPatch(session: DemandDraftSession) {
  const knownFields = { ...(session.knownFields || {}) };
  const activityType = clean(knownFields["活动类型"]);
  const people = clean(knownFields["人数"]);
  const meetingStyle = clean(knownFields["见面方式"]);
  const requirements = clean(knownFields["搭子要求"]);
  const preference = clean(knownFields["偏好"]);
  if (activityType) {
    knownFields["活动"] = activityType;
    delete knownFields["活动类型"];
  }
  if (people) {
    knownFields["数量或人数"] = people;
    delete knownFields["人数"];
  }
  if (meetingStyle) {
    knownFields["边界"] = meetingStyle;
    delete knownFields["见面方式"];
  }
  if (
    requirements
    && preference
    && (requirements.includes(preference) || preference.includes(requirements))
  ) delete knownFields["偏好"];
  const category = agentDraftActivity({ ...session, knownFields });
  return { knownFields, category };
}

export function deduplicateAgentCardFields(fields: Array<{ title: string; value: string }>) {
  const requirements = clean(fields.find((field) => field.title === "搭子要求")?.value);
  const preference = clean(fields.find((field) => field.title === "偏好")?.value);
  if (
    !requirements
    || !preference
    || (!requirements.includes(preference) && !preference.includes(requirements))
  ) return fields;
  return fields.filter((field) => field.title !== "偏好");
}

/**
 * A lifecycle prompt such as "publish this card" is control-plane input, not a
 * new demand fact. MobileAPI can currently merge that prompt into semantic
 * fields before returning the tool proposal, so restore the last confirmed
 * card snapshot before the proposal can be approved.
 */
export function repairDraftAfterLifecycleTurn(
  before: DemandDraftSession | null | undefined,
  after: DemandDraftSession | null | undefined,
): Partial<DemandDraftSession> | null {
  if (!before || !after || before.id !== after.id) return null;
  const canonical = canonicalAgentDraftCardPatch(before);
  const semanticChanged = (
    canonical.category !== after.category
    || JSON.stringify(canonical.knownFields) !== JSON.stringify(after.knownFields)
    || before.demandType !== after.demandType
    || before.status !== after.status
  );
  if (!semanticChanged) return null;
  return {
    demandType: before.demandType,
    category: canonical.category,
    knownFields: canonical.knownFields,
    missingFields: before.missingFields,
    canGenerateCard: before.canGenerateCard,
    userConfirmedGenerate: before.userConfirmedGenerate,
    status: before.status,
    generatedCardId: before.generatedCardId,
    lastQuestion: before.lastQuestion,
  };
}

/**
 * The server model can return a correct structured summary while the legacy
 * draft merger keeps a narrower value. Reconcile only explicit labelled facts
 * from that same server reply; this does not classify or infer a new demand in
 * the browser.
 */
export function reconcileDraftWithAssistantSummary(
  session: DemandDraftSession | null | undefined,
  assistantContent: string | null | undefined,
): Partial<DemandDraftSession> | null {
  if (!session || !clean(assistantContent)) return null;
  const content = clean(assistantContent);
  const activity = assistantLabelValue(content, ["活动类型", "活动"]);
  const peopleLine = assistantLabelValue(content, ["人数"]);
  const style = assistantLabelValue(content, ["风格", "搭子要求"]);
  const boundary = assistantLabelValue(content, ["安全约定", "见面边界", "边界"]);
  if (!activity && !peopleLine && !style && !boundary) return null;

  const knownFields = { ...(session.knownFields || {}) };
  if (activity) knownFields["活动"] = activity;
  const peopleParts = peopleLine.split(/[，,；;]/).map((item) => item.trim()).filter(Boolean);
  if (peopleParts[0]) knownFields["数量或人数"] = peopleParts[0];
  const requirements = [...peopleParts.slice(1), style].filter(Boolean).join("；");
  if (requirements) knownFields["搭子要求"] = requirements;
  if (boundary) knownFields["边界"] = boundary;
  const preference = clean(knownFields["偏好"]);
  if (
    style
    && preference
    && (style.includes(preference) || preference.includes(style))
  ) delete knownFields["偏好"];

  const category = activity || session.category;
  if (category === session.category && JSON.stringify(knownFields) === JSON.stringify(session.knownFields)) return null;
  return { category, knownFields };
}

export function preferredAgentThread<T extends { id: string }>(
  threads: T[],
  requestedId: string | null | undefined,
) {
  return (requestedId ? threads.find((thread) => thread.id === requestedId) : undefined)
    ?? threads[0]
    ?? null;
}

export function demandForAgentThread<
  T extends { id: string; sourceConversationId?: string | null },
>(
  demands: T[],
  threadId: string | null | undefined,
  requestedDemandId?: string | null,
) {
  if (!threadId) return null;
  const scoped = demands.filter((demand) => demand.sourceConversationId === threadId);
  if (requestedDemandId) {
    return scoped.find((demand) => demand.id === requestedDemandId) ?? null;
  }
  return scoped[0] ?? null;
}

export function agentDraftCanRenderCard(session: DemandDraftSession | null | undefined) {
  if (!session) return false;
  const lifecycleStatus = session.status.replace(/[\s_-]/g, "").toLowerCase();
  if (
    [
      "published",
      "matching",
      "candidatepool",
      "hascandidates",
      "invited",
      "matchedcommunicating",
      "hidden",
      "canceled",
      "cancelled",
      "closed",
    ].includes(lifecycleStatus)
  )
    return false;
  return true;
}

export type DemandMatchPhase =
  | "matching"
  | "waiting"
  | "matched"
  | "invited"
  | "communicating"
  | "failed"
  | "hidden"
  | "cancelled";

export function demandMatchPhase({
  demandStatus,
  demandVisibility,
  matchJobStatus,
  candidateCount = 0,
}: {
  demandStatus?: string | null;
  demandVisibility?: string | null;
  matchJobStatus?: string | null;
  candidateCount?: number | null;
}): DemandMatchPhase {
  const demand = clean(demandStatus).replace(/[\s_-]/g, "").toLowerCase();
  const visibility = clean(demandVisibility).toLowerCase();
  const job = clean(matchJobStatus).replace(/[\s_-]/g, "").toLowerCase();
  if (["canceled", "cancelled", "closed"].includes(demand)) return "cancelled";
  if (demand === "hidden" || visibility === "hidden") return "hidden";
  if (demand === "matchedcommunicating") return "communicating";
  // A matching job's candidateCount is an immutable generation receipt. The
  // actionable queue can later become empty after invite/dismiss/block actions,
  // so only the candidates returned by the current /matches read may open the
  // candidate deck.
  if (Number(candidateCount || 0) > 0) return "matched";
  if (demand === "invited") return "invited";
  if (job === "failed") return "failed";
  if (["candidatepool", "hascandidates", "matched"].includes(demand) || job === "succeeded")
    return "waiting";
  return "matching";
}

export type DemandMatchGenerationFailureCode =
  | "missing_demand_id"
  | "missing_demand_revision"
  | "missing_match_job"
  | "missing_match_job_id"
  | "demand_id_mismatch"
  | "demand_revision_mismatch"
  | "candidate_job_mismatch"
  | "candidate_revision_mismatch";

export type DemandMatchGenerationGuard =
  | {
      ok: true;
      code: null;
      message: null;
      requiresResync: false;
      demandId: string;
      demandRevision: number;
      matchJobId: string;
      candidates: DemandMatchesResponse["candidates"];
    }
  | {
      ok: false;
      code: DemandMatchGenerationFailureCode;
      message: string;
      requiresResync: true;
      demandId: string | null;
      demandRevision: number | null;
      matchJobId: string | null;
      candidates: [];
    };

function invalidDemandMatchGeneration(
  code: DemandMatchGenerationFailureCode,
  response: DemandMatchesResponse,
): DemandMatchGenerationGuard {
  return {
    ok: false,
    code,
    message: "匹配结果的代次信息不完整或已过期，请重新同步。",
    requiresResync: true,
    demandId: clean(response.demand?.id) || null,
    demandRevision: Number.isInteger(response.demand?.revision)
      ? Number(response.demand.revision)
      : null,
    matchJobId: clean(response.matchJob?.id) || null,
    candidates: [],
  };
}

/**
 * Fail closed unless the demand, matching job and returned candidates all
 * describe the same server-owned generation. This prevents a late response
 * from an older job/revision from replacing the current candidate set.
 */
export function guardDemandMatchesGeneration(
  response: DemandMatchesResponse,
): DemandMatchGenerationGuard {
  const demandId = clean(response.demand?.id);
  if (!demandId) return invalidDemandMatchGeneration("missing_demand_id", response);

  const demandRevision = response.demand?.revision;
  if (!Number.isInteger(demandRevision) || Number(demandRevision) <= 0) {
    return invalidDemandMatchGeneration("missing_demand_revision", response);
  }

  const matchJob = response.matchJob;
  if (!matchJob) return invalidDemandMatchGeneration("missing_match_job", response);
  const matchJobId = clean(matchJob.id);
  if (!matchJobId) return invalidDemandMatchGeneration("missing_match_job_id", response);
  if (clean(matchJob.demandId) !== demandId) {
    return invalidDemandMatchGeneration("demand_id_mismatch", response);
  }
  if (!Number.isInteger(matchJob.demandRevision) || matchJob.demandRevision !== demandRevision) {
    return invalidDemandMatchGeneration("demand_revision_mismatch", response);
  }

  const candidates = Array.isArray(response.candidates) ? response.candidates : [];
  for (const candidate of candidates) {
    if (clean(candidate.matchJobId) !== matchJobId) {
      return invalidDemandMatchGeneration("candidate_job_mismatch", response);
    }
    if (!Number.isInteger(candidate.demandRevision) || candidate.demandRevision !== demandRevision) {
      return invalidDemandMatchGeneration("candidate_revision_mismatch", response);
    }
  }

  return {
    ok: true,
    code: null,
    message: null,
    requiresResync: false,
    demandId,
    demandRevision,
    matchJobId,
    candidates,
  };
}

export function mergeAgentDraftEdits(
  session: DemandDraftSession,
  next: DemandViewModel,
): DemandDraftUpdatePayload {
  if (session.structuredDraft?.schemaVersion === 2) {
    const structured = session.structuredDraft;
    const originals = new Map(structured.facts.map((fact) => [fact.key, fact]));
    const lightFactKeys = new Set(["goal", "activity", "location", "time", "ability"]);
    const facts = (next.fields || []).flatMap((field) => {
      const key = clean(field.key);
      if (!lightFactKeys.has(key)) return [];
      const original = originals.get(key);
      const value = clean(field.value);
      const label = clean(field.title) || original?.label || "信息";
      const requirement = key === "goal" ? "context" as const : "preferred" as const;
      const visibility = "public" as const;
      // A client-only fallback is already represented by the server's light
      // card default. Do not turn merely rendering an old draft into a write.
      if ((!original || !clean(original.value)) && field.state === "defaulted") return [];
      if (
        original
        && original.value === value
        && original.label === label
        && original.requirement === requirement
        && original.visibility === visibility
      ) return [];
      return [{ key, label, value, requirement, visibility }];
    });
    const title = clean(next.title);
    const publicSummary = clean(next.summary);
    const intent = {
      ...(next.demandType && next.demandType !== structured.intent.demandType ? { demandType: next.demandType } : {}),
      ...(title && title !== structured.intent.title ? { title } : {}),
      ...(publicSummary !== structured.intent.publicSummary ? { publicSummary } : {}),
    };
    return {
      baseRevision: structured.revision,
      structuredPatch: {
        ...(Object.keys(intent).length ? { intent } : {}),
        facts,
      },
    };
  }
  const knownFields = { ...(session.knownFields || {}) };
  for (const field of next.fields || []) {
    const title = clean(field.title);
    if (!title) continue;
    knownFields[title] = clean(field.value);
  }
  return {
    knownFields,
    missingFields: [],
    canGenerateCard: true,
    status: "cardGenerated",
    lastQuestion: "需求卡已更新，仍可编辑并确认发布。",
  };
}

const nonAnswerCommands = new Set([
  "可以",
  "可以的",
  "确认",
  "确认吧",
  "好",
  "好的",
  "好啊",
  "对",
  "没问题",
  "就这样",
  "生成卡片",
  "生成需求卡",
  "开始匹配",
  "发布",
]);

function explicitFieldAnswer(prompt: string, field: string) {
  const value = clean(prompt).replace(/[。！!？?]+$/g, "");
  if (!value || value.length > 160 || nonAnswerCommands.has(value)) return "";
  if (/不要|先别|不用|取消|发布|生成|匹配|联系|邀请/.test(value)) return "";
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const labelled = value.match(new RegExp(`(?:${escaped})(?:是|为|：|:)?\\s*(.+)$`));
  return clean(labelled?.[1] || value);
}

/**
 * MobileAPI remains the authority for whether a demand exists and which field
 * is missing. This only protects an already-known server draft when the user
 * directly answers that one outstanding question and a stale merger writes
 * the answer into unrelated fields.
 */
export function reconcileExplicitDraftAnswer(
  prompt: string,
  before: DemandDraftSession | null | undefined,
  after: DemandDraftSession | null | undefined,
): Partial<DemandDraftSession> | null {
  const targetField = before?.missingFields?.[0];
  if (!before || !after || !targetField || !after.missingFields.includes(targetField)) return null;
  const answer = explicitFieldAnswer(prompt, targetField);
  if (!answer) return null;

  const promptValue = clean(prompt).replace(/[。！!？?]+$/g, "");
  const knownFields = { ...(after.knownFields || {}) };
  for (const [key, previousValue] of Object.entries(before.knownFields || {})) {
    if (clean(knownFields[key]).replace(/[。！!？?]+$/g, "") === promptValue) {
      knownFields[key] = previousValue;
    }
  }
  knownFields[targetField] = answer;
  const missingFields = after.missingFields.filter((field) => field !== targetField && !clean(knownFields[field]));
  const canGenerateCard = missingFields.length === 0;
  return {
    demandType: before.demandType,
    category: clean(after.category).replace(/[。！!？?]+$/g, "") === promptValue
      ? before.category
      : after.category,
    knownFields,
    missingFields,
    canGenerateCard,
    status: canGenerateCard ? "readyToConfirm" : "collecting",
    lastQuestion: canGenerateCard
      ? "信息基本完整了。要我现在为你生成一张需求卡吗？"
      : `${missingFields[0]}你希望是什么样？`,
  };
}

export function latestAgentToolProposal(
  entries: AgentThreadEntry[],
  toolName: string,
  statuses: string[] = ["awaiting_confirmation", "ready_for_review"],
) {
  const acceptedStatuses = new Set(statuses);
  return [...entries]
    .sort((left, right) => right.sequence - left.sequence)
    .find((entry) => (
      entry.kind === "tool_proposal"
      && entry.toolName === toolName
      && acceptedStatuses.has(entry.toolStatus || "")
    )) || null;
}

function normalizedTimelineContent(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function timelineToolTarget(entry: AgentThreadEntry) {
  const args = entry.payload?.arguments;
  if (!args || typeof args !== "object" || Array.isArray(args)) return "";
  const values = args as Record<string, unknown>;
  return ["action", "cardId", "demandId", "candidateId", "userId"]
    .flatMap((key) => {
      const value = values[key];
      return typeof value === "string" || typeof value === "number"
        ? [`${key}:${value}`]
        : [];
    })
    .join("|");
}

export function compactAgentTimelineEntries(entries: AgentThreadEntry[]) {
  let fallbackTurn = 0;
  const annotated = entries.map((entry, index) => {
    if (entry.kind === "message" && entry.role === "user") fallbackTurn += 1;
    return {
      entry,
      index,
      turn: entry.clientTurnId || `local-turn-${fallbackTurn}`,
    };
  });
  const meaningfulTurns = new Set(
    annotated
      .filter(({ entry }) => (
        (entry.kind === "message" && entry.role === "assistant" && normalizedTimelineContent(entry.content))
        || Boolean(entry.toolName)
      ))
      .map(({ turn }) => turn),
  );
  const keep = new Set<number>();
  const latestMessage = new Map<string, number>();
  const latestToolState = new Map<string, number>();
  const latestGenericTool = new Map<string, number>();

  for (const item of annotated) {
    const { entry, index, turn } = item;
    if (entry.kind === "message" && entry.role === "user") {
      keep.add(index);
      continue;
    }
    if (entry.kind === "message") {
      const content = normalizedTimelineContent(entry.content);
      if (!content) continue;
      latestMessage.set(`${turn}|${entry.role || "unknown"}|${content}`, index);
      continue;
    }
    if (!entry.toolName) {
      if (!meaningfulTurns.has(turn)) latestGenericTool.set(turn, index);
      continue;
    }
    latestToolState.set(`${turn}|${entry.toolName}|${timelineToolTarget(entry)}`, index);
  }

  for (const index of latestMessage.values()) keep.add(index);
  for (const index of latestToolState.values()) keep.add(index);
  for (const index of latestGenericTool.values()) keep.add(index);
  return annotated.filter(({ index }) => keep.has(index)).map(({ entry }) => entry);
}

export type DemandLifecycleAction = "publish" | "hide" | "cancel";

export function demandLifecyclePrompt(action: DemandLifecycleAction) {
  if (action === "publish") {
    return "请为当前已经生成的需求卡提出“发布并开始匹配”的确认操作。不要重新生成卡片。";
  }
  if (action === "hide") {
    return "请为当前已经发布的需求卡提出“暂停匹配”的确认操作。不要生成新卡片。";
  }
  return "请为当前需求卡提出“取消需求”的确认操作。不要生成新卡片。";
}

export function agentTurnNotice(detail: {
  executionMode?: string;
  activeDraft?: DemandDraftSession | null;
}) {
  const draft = detail.activeDraft;
  if (!draft) {
    return detail.executionMode === "conversation_v2"
      ? "小福正在陪你聊；没有创建需求卡或执行任何外部操作。"
      : "";
  }
  if (draft.status === "cardGenerated") {
    return "需求卡已生成但尚未发布；你可以继续修改，或准备发布确认。";
  }
  if (draft.canGenerateCard) {
    const defaultedFields = editableDefaultFieldTitles(draft);
    return defaultedFields.length
      ? `${defaultedFields.join("、")}使用了可编辑建议值；需求草稿会自动更新，但尚未发布。`
      : "需求信息已自动整理为可编辑草稿；发布、联系或邀请仍需你明确确认。";
  }
  return draft.missingFields.length
    ? `草稿已保存；小福接下来只会确认一个关键点：${draft.missingFields[0]}。`
    : "小福已保存当前上下文，你可以继续补充。";
}

export function agentReplySuggestions(session: DemandDraftSession | null | undefined) {
  if (!session) return [];
  if (session.status === "cardGenerated") {
    return [
      "请提出发布确认，不要重新生成卡片",
      "我想先修改一下需求卡",
    ];
  }
  if (session.canGenerateCard && !session.userConfirmedGenerate) {
    return [
      "请展示已整理的可编辑需求草稿",
      "我想先修改一下已整理的信息",
    ];
  }
  const field = session.missingFields[0];
  if (!field) return [];
  const fieldSuggestions: Record<string, string[]> = {
    时间: ["本周六下午比较合适", "时间可以和对方再商量"],
    地点: ["同城公共场所见面", "优先选择交通方便的商圈"],
    目的地: ["同城周边，当天往返", "目的地可以一起商量"],
    搭子要求: ["年龄相近、节奏轻松，尊重彼此边界", "没有硬性要求，聊得舒服最重要"],
    偏好: ["节奏轻松，先聊天再决定", "没有硬性偏好，尊重边界就好"],
    "水平或偏好": ["水平相近，轻松参与", "新手友好，不追求强度"],
    预算: ["费用各自承担，提前说清楚", "预算可以先沟通再决定"],
    "数量或人数": ["找一到两个人就好", "人数少一点，方便沟通"],
  };
  return fieldSuggestions[field] || [
    `关于${field}我没有硬性要求，安全和尊重边界最重要`,
    `我想自己补充${field}`,
  ];
}
