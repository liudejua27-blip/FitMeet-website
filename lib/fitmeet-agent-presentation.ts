import type { AgentThreadEntry } from "./fitmeet-api-contract";

export type AgentActivityMode = "thinking" | "structuring" | "searching" | "working";

export type AgentRunStepState = "pending" | "running" | "waiting" | "complete" | "failed";

export type AgentRunStep = {
  id: string;
  label: string;
  state: AgentRunStepState;
};

export type AgentRunPresentation = {
  title: string;
  detail: string;
  stage: number;
  stages: [string, string, string];
  steps: AgentRunStep[];
  activity: AgentActivityMode;
};

const trustedAgentTools = new Set([
  "search_knowledge",
  "search_people",
  "search_services",
  "search_activities",
  "search_organizations",
  "evaluate_safety_requirements",
  "classify_demand",
  "route_demand_flow",
  "generate_demand_card",
  "generate_demand_card_v2",
  "draft_capability_offering",
  "press_demand_card_button",
  "preview_search_candidates",
  "search_candidates_for_demand",
  "rank_candidates",
  "search_capability_matches_for_demand",
  "draft_invitation",
  "draft_service_message",
  "send_invitation",
  "request_service_connection",
  "draft_multiplayer_group",
  "create_multiplayer_group",
  "invite_group_candidate",
  "block_user",
  "report_user",
  "patch_social_profile",
  "patch_onboarding",
]);

const agentToolLabels: Record<string, string> = {
  search_knowledge: "核对可用资料",
  search_people: "查找合适的人",
  search_services: "查找专业服务",
  search_activities: "查找真实活动",
  search_organizations: "查找相关机构",
  evaluate_safety_requirements: "核对安全边界",
  classify_demand: "理解你的要求",
  route_demand_flow: "选择处理路径",
  generate_demand_card: "整理需求卡",
  generate_demand_card_v2: "整理结构化需求卡",
  draft_capability_offering: "整理能力资料",
  press_demand_card_button: "提交已确认操作",
  preview_search_candidates: "预览候选范围",
  search_candidates_for_demand: "筛选真实候选",
  rank_candidates: "整理匹配依据",
  search_capability_matches_for_demand: "匹配可用能力",
  draft_invitation: "准备邀请草稿",
  draft_service_message: "准备沟通草稿",
  send_invitation: "提交已确认邀请",
  request_service_connection: "提交已确认联系",
  draft_multiplayer_group: "准备组局草稿",
  create_multiplayer_group: "提交已确认组局",
  invite_group_candidate: "提交已确认组局邀请",
  block_user: "提交拉黑操作",
  report_user: "提交安全举报",
  patch_social_profile: "保存已确认资料",
  patch_onboarding: "保存已确认建档资料",
};

function agentToolStepState(status: string | null | undefined): AgentRunStepState {
  const normalized = String(status || "").toLowerCase();
  if (["completed", "executed", "approved", "succeeded", "done"].includes(normalized)) {
    return "complete";
  }
  if (["failed", "error", "declined", "denied", "expired", "stale", "cancelled", "canceled"].includes(normalized)) {
    return "failed";
  }
  if (["awaiting_confirmation", "ready_for_review", "waiting_approval"].includes(normalized)) {
    return "waiting";
  }
  if (["collecting", "executing", "running", "processing", "started", "input_streaming"].includes(normalized)) {
    return "running";
  }
  return "pending";
}

function currentRunSteps(entries: AgentThreadEntry[], draftStructuring: boolean): AgentRunStep[] {
  const latest = new Map<string, AgentThreadEntry>();
  for (const entry of entries) {
    if (!entry.toolName || !trustedAgentTools.has(entry.toolName)) continue;
    latest.set(entry.toolName, entry);
  }
  const steps = [...latest.entries()].map(([toolName, entry]) => ({
    id: `${entry.clientTurnId || "turn"}:${toolName}`,
    label: agentToolLabels[toolName] || "处理已确认步骤",
    state: agentToolStepState(entry.toolStatus),
  }));
  if (draftStructuring && !steps.some((step) => step.label.includes("需求卡"))) {
    steps.push({ id: "live:draft", label: "整理需求卡", state: "running" });
  }
  if (!steps.length) {
    steps.push({ id: "live:understanding", label: "理解你的要求", state: "running" });
  } else if (steps.every((step) => step.state === "complete")) {
    steps.push({ id: "live:response", label: "组织可阅读的回复", state: "running" });
  }
  return steps;
}

export function agentRunPresentation(
  entries: AgentThreadEntry[],
  afterSequence: number,
  draftStructuring = false,
): AgentRunPresentation {
  const currentTurnEntries = entries.filter(
    (entry) => Number(entry.sequence || 0) > afterSequence,
  );
  const steps = currentRunSteps(currentTurnEntries, draftStructuring);
  if (draftStructuring) {
    return {
      title: "正在组织一张可编辑需求卡",
      detail: "已确认的信息会原样保留；发布、邀请和联系仍由你决定。",
      stage: 1,
      stages: ["理解需求", "生成卡片", "等你确认"],
      steps,
      activity: "structuring",
    };
  }

  const latestTool = [...currentTurnEntries]
    .reverse()
    .find((entry) => entry.toolName || entry.kind !== "message");
  const toolName = latestTool?.toolName || "";
  const toolStatus = latestTool?.toolStatus || "";

  if (toolStatus === "awaiting_confirmation" || toolStatus === "ready_for_review") {
    return {
      title: "内容已整理，等待你确认",
      detail: "这一步还没有发布、邀请或联系任何人。",
      stage: 2,
      stages: ["理解需求", "生成卡片", "等你确认"],
      steps,
      activity: "working",
    };
  }

  if (
    /search_candidates|rank_candidates|search_people|search_services|search_activities|search_organizations/.test(
      toolName,
    )
  ) {
    return {
      title: "正在按已确认条件查找候选",
      detail: "候选会先核对服务端可见性、边界和资料证据，再交给你确认。",
      stage: /completed|executed|approved/.test(toolStatus) ? 2 : 1,
      stages: ["确认条件", "筛选候选", "整理理由"],
      steps,
      activity: "searching",
    };
  }

  if (/generate_demand_card|classify_demand|route_demand_flow/.test(toolName)) {
    return {
      title: toolName === "generate_demand_card" ? "正在生成可编辑需求卡" : "已收到，正在整理条件",
      detail: "正在核对时间、地点、人数与见面边界；卡片生成后仍需你确认。",
      stage: toolName === "generate_demand_card" ? 1 : 0,
      stages: ["理解需求", "生成卡片", "等你确认"],
      steps,
      activity: toolName === "generate_demand_card" ? "structuring" : "thinking",
    };
  }

  return {
    title: "已收到，正在理解你的想法",
    detail: "小福会先给出可阅读的回复，需要执行的真实动作会单独请你确认。",
    stage: 0,
    stages: ["理解需求", "组织回复", "给出下一步"],
    steps,
    activity: "thinking",
  };
}

export function agentEntryCanRender(entry: AgentThreadEntry) {
  if (entry.kind === "message") return Boolean(String(entry.content || "").trim());
  return Boolean(entry.toolName && trustedAgentTools.has(entry.toolName));
}

export function agentToolDisplayName(toolName: string | null | undefined) {
  return (toolName && agentToolLabels[toolName]) || "处理已确认步骤";
}

export function agentEntryIsStreaming(entry: AgentThreadEntry) {
  return entry.kind === "message" && entry.role === "assistant" && entry.payload?.live === true;
}

export function agentToolIsActive(status: string | null | undefined) {
  return ["collecting", "executing", "running", "processing"].includes(
    String(status || "").toLowerCase(),
  );
}

export function agentLiveEventBelongsToThread({
  activeThreadId,
  expectedThreadId,
  eventThreadId,
}: {
  activeThreadId: string | null | undefined;
  expectedThreadId: string;
  eventThreadId: string | null | undefined;
}) {
  return (
    activeThreadId === expectedThreadId &&
    (!eventThreadId || eventThreadId === expectedThreadId)
  );
}
