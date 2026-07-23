import type { AgentThreadEntry, DemandDraftSession } from "./fitmeet-api-contract";
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

function firstReplyParagraph(content: string) {
  const paragraph = content
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .find(Boolean) || "";
  return paragraph.trim().slice(0, 220);
}

function oneQuestion(content: string) {
  let seenQuestion = false;
  return Array.from(content).filter((character) => {
    if (!["?", "？"].includes(character)) return !seenQuestion;
    if (seenQuestion) return false;
    seenQuestion = true;
    return true;
  }).join("").trim();
}

export function reconcileAgentReplyWithDraft(
  content: string | null | undefined,
  session: DemandDraftSession | null | undefined,
) {
  const original = clean(content);
  if (!original || !session) return original;
  const rawPrefix = firstReplyParagraph(original);

  if (session.missingFields.length) {
    const field = session.missingFields[0];
    const prefix = /齐全|完整|都清楚|可以生成|能生成|准备生成/.test(rawPrefix)
      ? "我已经接住你的想法，先不急着生成卡片。"
      : rawPrefix;
    const rawQuestion = clean(session.lastQuestion);
    const question = rawQuestion && !/还差[:：]/.test(rawQuestion)
      ? rawQuestion
      : `${field}你希望是什么样？`;
    return oneQuestion([
      prefix,
      `我先只确认一个关键点：${question}`,
    ].filter(Boolean).join("\n\n"));
  }

  if (session.canGenerateCard && !session.userConfirmedGenerate && session.status !== "cardGenerated") {
    const prefix = /还需要|还差|补充|继续追问|不完整/.test(rawPrefix)
      ? "我已经把你刚才说的重点整理好了。"
      : rawPrefix;
    return [
      prefix,
      "现在的信息已经足够整理成一张未发布的需求卡。要我现在生成吗？",
    ].filter(Boolean).join("\n\n");
  }

  if (session.status === "cardGenerated") {
    const prefix = /正在生成|准备生成|还需要|还差|补充/.test(rawPrefix)
      ? "我已经按你的确认整理好了。"
      : rawPrefix;
    return [
      prefix,
      "需求卡已经生成，仍未发布。你可以先核对或修改；需要发布时，我会再给你单独的确认操作。",
    ].filter(Boolean).join("\n\n");
  }

  return oneQuestion(original);
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
  const category = agentDraftActivity({ ...session, knownFields });
  return { knownFields, category };
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

export function agentDraftCanRenderCard(session: DemandDraftSession | null | undefined) {
  if (!session) return false;
  return session.status === "cardGenerated"
    || Boolean(session.canGenerateCard && session.userConfirmedGenerate);
}

export function mergeAgentDraftEdits(
  session: DemandDraftSession,
  next: DemandViewModel,
): Partial<DemandDraftSession> {
  const knownFields = { ...(session.knownFields || {}) };
  for (const field of next.fields || []) {
    const title = clean(field.title);
    if (!title) continue;
    knownFields[title] = clean(field.value);
  }
  const missingFields = (session.missingFields || [])
    .filter((title) => !clean(knownFields[title]));
  const canGenerateCard = missingFields.length === 0;
  const alreadyGenerated = session.status === "cardGenerated";
  return {
    knownFields,
    missingFields,
    canGenerateCard,
    status: alreadyGenerated ? "cardGenerated" : canGenerateCard ? "readyToConfirm" : "collecting",
    lastQuestion: alreadyGenerated
      ? "需求卡已更新，仍未发布。请核对后再决定是否开始匹配。"
      : canGenerateCard
        ? "信息基本完整了。要我现在为你生成一张需求卡吗？"
        : `${missingFields[0]}你希望是什么样？`,
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
  statuses: string[] = ["awaiting_confirmation", "ready_for_review", "failed"],
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
    return detail.executionMode === "social_chat_v1"
      ? "小福正在陪你聊；没有创建需求卡或执行任何外部操作。"
      : "";
  }
  if (draft.status === "cardGenerated") {
    return "需求卡已生成但尚未发布；你可以继续修改，或准备发布确认。";
  }
  if (draft.canGenerateCard) {
    return "需求信息已经整理好；只有你明确确认后才会生成需求卡。";
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
      "我确认生成这张需求卡",
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
