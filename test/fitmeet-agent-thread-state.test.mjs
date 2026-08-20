import test from "node:test";
import assert from "node:assert/strict";
import {
  agentDraftActivity,
  agentDraftCanRenderCard,
  agentReplySuggestions,
  agentTurnNotice,
  canonicalAgentDraftCardPatch,
  compactAgentTimelineEntries,
  deduplicateAgentCardFields,
  demandMatchPhase,
  demandForAgentThread,
  demandLifecyclePrompt,
  editableDefaultDraftPatch,
  guardDemandMatchesGeneration,
  latestAgentToolProposal,
  mergeAgentDraftEdits,
  orderedAgentDraftFields,
  preferredAgentThread,
  reconcileDraftWithAssistantSummary,
  reconcileExplicitDraftAnswer,
  repairDraftAfterLifecycleTurn,
} from "../lib/fitmeet-agent-thread-state.ts";
import { displayDraftSession } from "../lib/fitmeet-agent-domain.ts";

const draft = {
  id: "draft-1",
  sourceConversationId: "thread-1",
  rawUserIntent: "周末想找人 Citywalk 后喝咖啡",
  demandType: "buddy",
  flowKind: "generate_card",
  hallTarget: "socialHall",
  category: "Citywalk",
  knownFields: {
    活动: "Citywalk 和咖啡",
    时间: "周六下午",
    地点: "上海徐汇",
    搭子要求: "轻松聊天，不赶行程",
  },
  missingFields: [],
  lastQuestion: "",
  canGenerateCard: true,
  userConfirmedGenerate: false,
  status: "readyToConfirm",
  generatedCardId: null,
  createdAt: "2026-07-23T00:00:00.000Z",
  updatedAt: "2026-07-23T00:00:00.000Z",
};

const structuredDraft = {
  ...draft,
  schemaVersion: 2,
  revision: 7,
  canGenerateCard: false,
  status: "collecting",
  structuredDraft: {
    schemaVersion: 2,
    revision: 7,
    intent: {
      demandType: "workout",
      domain: "羽毛球",
      title: "周六青大羽毛球搭子",
      goal: "找到合适伙伴一起完成羽毛球约练",
      publicSummary: "寻找两位伙伴周六下午在青岛大学轻松打羽毛球。",
    },
    facts: [
      { key: "goal", label: "核心目的", value: "找到合适伙伴一起完成羽毛球约练", state: "inferred", requirement: "context", visibility: "public", evidence: [{ source: "user", quote: "找人打羽毛球" }], editable: true, source: "user" },
      { key: "activity", label: "运动项目", value: "羽毛球", state: "confirmed", requirement: "preferred", visibility: "public", evidence: [{ source: "user", quote: "羽毛球" }], editable: true, source: "user_edit" },
      { key: "time", label: "时间", value: "周六下午", state: "inferred", requirement: "preferred", visibility: "public", evidence: [{ source: "user", quote: "周六下午" }], editable: true, source: "user" },
      { key: "location", label: "地点", value: "", state: "missing", requirement: "preferred", visibility: "public", evidence: [], editable: true, source: "missing" },
      { key: "gender", label: "性别偏好", value: "女生优先", state: "inferred", requirement: "preferred", visibility: "matching_only", evidence: [{ source: "user", quote: "女生优先" }], editable: true, source: "user" },
    ],
    sections: {
      core: ["goal", "activity"],
      mustHave: [],
      negotiable: ["time"],
      matchingOnly: ["gender"],
    },
    missingCriticalFacts: ["地点"],
    publishable: false,
    location: { city: "青岛", venue: null, radiusKm: 10 },
    matchingPolicy: {
      city: "青岛", venue: null, radiusKm: 10, timeWindows: ["周六下午"], activity: "羽毛球",
      level: null, age: null, gender: "女生优先", boundary: null, hardFilters: [], softPreferences: ["时间：周六下午", "性别偏好：女生优先"],
    },
  },
};

test("keeps dynamic Citywalk fields instead of forcing workout fields", () => {
  assert.equal(agentDraftActivity(draft), "Citywalk 和咖啡");
  assert.deepEqual(orderedAgentDraftFields(draft).map((field) => field.title), [
    "活动",
    "地点",
    "时间",
    "搭子要求",
  ]);
});

test("normalizes model field aliases into the shared demand-card contract", () => {
  const generated = {
    ...draft,
    category: "本周六下午在上海徐汇想找人 Citywalk",
    status: "cardGenerated",
    knownFields: {
      ...draft.knownFields,
      活动: "本周六下午在上海徐汇想找人 Citywalk",
      活动类型: "Citywalk + 咖啡",
      人数: "1-2人",
      见面方式: "公共场所",
    },
  };
  assert.equal(agentDraftActivity(generated), "Citywalk + 咖啡");
  assert.deepEqual(orderedAgentDraftFields(generated).slice(0, 3), [
    { title: "活动类型", value: "Citywalk + 咖啡" },
    { title: "地点", value: "上海徐汇" },
    { title: "时间", value: "周六下午" },
  ]);
  const patch = canonicalAgentDraftCardPatch(generated);
  assert.equal(patch.category, "Citywalk + 咖啡");
  assert.equal(patch.knownFields["活动"], "Citywalk + 咖啡");
  assert.equal(patch.knownFields["数量或人数"], "1-2人");
  assert.equal(patch.knownFields["边界"], "公共场所");
  assert.equal("活动类型" in patch.knownFields, false);
});

test("any real draft is displayed as editable without a generation approval", () => {
  assert.equal(agentDraftCanRenderCard(draft), true);
  assert.equal(agentDraftCanRenderCard({ ...draft, status: "cardGenerated", userConfirmedGenerate: true }), true);
  assert.equal(agentDraftCanRenderCard({
    ...draft,
    missingFields: ["地点", "时间"],
    canGenerateCard: false,
    status: "collecting",
  }), true);
});

test("only pre-publication drafts can render as editable demand cards", () => {
  for (const status of [
    "published",
    "matching",
    "candidatePool",
    "hasCandidates",
    "invited",
    "matchedCommunicating",
    "hidden",
    "canceled",
    "cancelled",
    "closed",
  ]) {
    assert.equal(agentDraftCanRenderCard({ ...draft, status }), false, status);
  }
});

test("projects authoritative matching jobs without guessing from an empty candidate list", () => {
  assert.equal(demandMatchPhase({ demandStatus: "matching", matchJobStatus: "running" }), "matching");
  assert.equal(demandMatchPhase({ demandStatus: "candidatePool", matchJobStatus: "succeeded" }), "waiting");
  assert.equal(demandMatchPhase({ demandStatus: "matching", matchJobStatus: "failed" }), "failed");
  assert.equal(demandMatchPhase({ demandStatus: "hasCandidates", candidateCount: 1 }), "matched");
  assert.equal(demandMatchPhase({ demandStatus: "hasCandidates", candidateCount: 0 }), "waiting");
  assert.equal(
    demandMatchPhase({ demandStatus: "invited", matchJobStatus: "succeeded", candidateCount: 0 }),
    "invited",
  );
  assert.equal(
    demandMatchPhase({ demandStatus: "invited", matchJobStatus: "succeeded", candidateCount: 2 }),
    "matched",
  );
  assert.equal(
    demandMatchPhase({ demandStatus: "matchedCommunicating", candidateCount: 0 }),
    "communicating",
  );
  assert.equal(demandMatchPhase({ demandStatus: "hidden", candidateCount: 3 }), "hidden");
  assert.equal(
    demandMatchPhase({ demandStatus: "matching", demandVisibility: "hidden", matchJobStatus: "running" }),
    "hidden",
  );
  assert.equal(demandMatchPhase({ demandStatus: "canceled" }), "cancelled");
});

const demandMatches = ({
  demandId = "demand-1",
  demandRevision = 3,
  jobId = "job-3",
  jobDemandId = demandId,
  jobDemandRevision = demandRevision,
  jobStatus = "succeeded",
  candidates = [{
    candidateRecordId: 9,
    candidateUserId: 42,
    matchJobId: jobId,
    demandRevision,
    displayName: "小林",
    status: "recommended",
  }],
} = {}) => ({
  demand: {
    id: demandId,
    revision: demandRevision,
    type: "buddy",
    title: "周末 Citywalk",
    summary: "一起散步",
    fields: [],
    visibility: "public",
    hallTarget: "socialHall",
    category: "Citywalk",
    status: jobStatus === "succeeded" ? "candidatePool" : "matching",
    candidateCount: candidates.length,
    capacityMin: 1,
    capacityMax: 2,
    acceptedParticipantCount: 0,
  },
  matchJob: {
    id: jobId,
    demandId: jobDemandId,
    demandRevision: jobDemandRevision,
    status: jobStatus,
  },
  candidates,
  total: candidates.length,
  nextCursor: null,
});

test("accepts one internally consistent demand matching generation", () => {
  const guarded = guardDemandMatchesGeneration(demandMatches());
  assert.equal(guarded.ok, true);
  assert.equal(guarded.demandId, "demand-1");
  assert.equal(guarded.demandRevision, 3);
  assert.equal(guarded.matchJobId, "job-3");
  assert.equal(guarded.candidates.length, 1);
  assert.equal(guarded.requiresResync, false);
});

test("fails closed when a late job belongs to an older demand", () => {
  const guarded = guardDemandMatchesGeneration(demandMatches({ jobDemandId: "demand-old" }));
  assert.deepEqual(
    { ok: guarded.ok, code: guarded.code, candidates: guarded.candidates, requiresResync: guarded.requiresResync },
    { ok: false, code: "demand_id_mismatch", candidates: [], requiresResync: true },
  );
});

test("fails closed when the matching job belongs to an older demand revision", () => {
  const guarded = guardDemandMatchesGeneration(demandMatches({ jobDemandRevision: 2 }));
  assert.equal(guarded.ok, false);
  assert.equal(guarded.code, "demand_revision_mismatch");
  assert.deepEqual(guarded.candidates, []);
});

test("fails closed when one candidate comes from another matching job", () => {
  const guarded = guardDemandMatchesGeneration(demandMatches({ candidates: [{
    candidateRecordId: 9,
    candidateUserId: 42,
    matchJobId: "job-old",
    demandRevision: 3,
    displayName: "小林",
    status: "recommended",
  }] }));
  assert.equal(guarded.ok, false);
  assert.equal(guarded.code, "candidate_job_mismatch");
  assert.deepEqual(guarded.candidates, []);
});

test("fails closed when one candidate comes from another demand revision", () => {
  const guarded = guardDemandMatchesGeneration(demandMatches({ candidates: [{
    candidateRecordId: 9,
    candidateUserId: 42,
    matchJobId: "job-3",
    demandRevision: 2,
    displayName: "小林",
    status: "recommended",
  }] }));
  assert.equal(guarded.ok, false);
  assert.equal(guarded.code, "candidate_revision_mismatch");
  assert.deepEqual(guarded.candidates, []);
});

test("accepts an empty succeeded generation without pretending candidates exist", () => {
  const guarded = guardDemandMatchesGeneration(demandMatches({ candidates: [] }));
  assert.equal(guarded.ok, true);
  assert.deepEqual(guarded.candidates, []);
});

test("queued and running responses still require generation truth but may be empty", () => {
  assert.equal(guardDemandMatchesGeneration(demandMatches({ jobStatus: "queued", candidates: [] })).ok, true);
  assert.equal(guardDemandMatchesGeneration(demandMatches({ jobStatus: "running", candidates: [] })).ok, true);
  const missingRevision = demandMatches({ jobStatus: "running", candidates: [] });
  delete missingRevision.demand.revision;
  const guarded = guardDemandMatchesGeneration(missingRevision);
  assert.equal(guarded.ok, false);
  assert.equal(guarded.code, "missing_demand_revision");
});

test("an incomplete V2 draft renders as a publishable six-field light card", () => {
  assert.equal(agentDraftCanRenderCard(structuredDraft), true);
  const displayed = displayDraftSession(structuredDraft);
  assert.equal(displayed.title, "周六青大羽毛球搭子");
  assert.equal(displayed.publishable, true);
  assert.equal(displayed.revision, 7);
  assert.deepEqual(displayed.fields?.map((field) => field.key), [
    "public_summary", "goal", "activity", "location", "time", "ability",
  ]);
  assert.equal(displayed.fields?.find((field) => field.key === "location")?.state, "defaulted");
  assert.equal(displayed.fields?.every((field) => field.visibility === "public"), true);
});

test("V2 edits submit revision-bound changed facts instead of rebuilding legacy fields", () => {
  const displayed = displayDraftSession(structuredDraft);
  const next = {
    ...displayed,
    demandType: "activity",
    title: "周日青大羽毛球搭子",
    summary: "周日下午在青岛大学找羽毛球伙伴。",
    fields: displayed.fields?.map((field) => field.key === "time"
      ? { ...field, value: "周日下午", requirement: "required" }
      : field),
  };
  const patch = mergeAgentDraftEdits(structuredDraft, next);
  assert.equal(patch.baseRevision, 7);
  assert.deepEqual(patch.structuredPatch?.intent, {
    demandType: "activity",
    title: "周日青大羽毛球搭子",
    publicSummary: "周日下午在青岛大学找羽毛球伙伴。",
  });
  assert.deepEqual(patch.structuredPatch?.facts, [
    {
      key: "time",
      label: "时间",
      value: "周日下午",
      requirement: "preferred",
      visibility: "public",
    },
  ]);
  assert.equal("knownFields" in patch, false);
});

test("editing a dynamic field does not reclassify the server demand type", () => {
  const patch = mergeAgentDraftEdits(draft, {
    id: "draft-1",
    title: "Citywalk",
    summary: draft.rawUserIntent,
    activityType: "Citywalk",
    timeWindow: "周日下午",
    locationText: "上海徐汇",
    capacityMax: 2,
    durationText: "轻松聊天",
    privacyBoundary: "公共场所见面",
    status: "draft",
    fields: [
      { title: "活动", value: "Citywalk 和咖啡" },
      { title: "时间", value: "周日下午" },
      { title: "地点", value: "上海徐汇" },
      { title: "搭子要求", value: "轻松聊天，不赶行程" },
    ],
  });
  assert.equal(patch.knownFields?.["时间"], "周日下午");
  assert.equal("demandType" in patch, false);
  assert.equal(patch.status, "cardGenerated");
});

test("finds the latest actionable server proposal", () => {
  const proposal = latestAgentToolProposal([
    { id: "old", threadId: "thread-1", sequence: 4, kind: "tool_proposal", role: null, content: null, toolName: "generate_demand_card", toolStatus: "approved", payload: {}, clientTurnId: null, createdAt: "", updatedAt: "" },
    { id: "new", threadId: "thread-1", sequence: 8, kind: "tool_proposal", role: null, content: null, toolName: "generate_demand_card", toolStatus: "ready_for_review", payload: {}, clientTurnId: null, createdAt: "", updatedAt: "" },
  ], "generate_demand_card");
  assert.equal(proposal?.id, "new");
});

test("does not treat a failed or stale proposal as actionable", () => {
  const proposal = latestAgentToolProposal([
    { id: "failed", threadId: "thread-1", sequence: 8, kind: "tool_proposal", role: null, content: null, toolName: "press_demand_card_button", toolStatus: "failed", payload: {}, clientTurnId: null, createdAt: "", updatedAt: "" },
    { id: "stale", threadId: "thread-1", sequence: 9, kind: "tool_proposal", role: null, content: null, toolName: "press_demand_card_button", toolStatus: "stale", payload: {}, clientTurnId: null, createdAt: "", updatedAt: "" },
  ], "press_demand_card_button");
  assert.equal(proposal, null);
});

test("compacts repeated Agent execution states while preserving user turns and final outcomes", () => {
  const base = { threadId: "thread-1", role: null, payload: {}, createdAt: "", updatedAt: "" };
  const entries = [
    { ...base, id: "user-1", sequence: 1, kind: "message", role: "user", content: "发布需求", toolName: null, toolStatus: null, clientTurnId: "turn-1" },
    { ...base, id: "noise-1", sequence: 2, kind: "tool_resolution", content: null, toolName: null, toolStatus: "completed", clientTurnId: "turn-1" },
    { ...base, id: "classify-collecting", sequence: 3, kind: "tool_resolution", content: "正在整理", toolName: "classify_demand", toolStatus: "collecting", clientTurnId: "turn-1" },
    { ...base, id: "classify-completed", sequence: 4, kind: "tool_resolution", content: "已归类", toolName: "classify_demand", toolStatus: "completed", clientTurnId: "turn-1" },
    { ...base, id: "assistant-duplicate-1", sequence: 5, kind: "message", role: "assistant", content: " 已经整理完成。 ", toolName: null, toolStatus: null, clientTurnId: "turn-1" },
    { ...base, id: "assistant-duplicate-2", sequence: 6, kind: "message", role: "assistant", content: "已经整理完成。", toolName: null, toolStatus: null, clientTurnId: "turn-1" },
    { ...base, id: "proposal-stale", sequence: 7, kind: "tool_proposal", content: null, toolName: "press_demand_card_button", toolStatus: "stale", payload: { arguments: { action: "publish" } }, clientTurnId: "turn-1" },
    { ...base, id: "proposal-current", sequence: 8, kind: "tool_proposal", content: null, toolName: "press_demand_card_button", toolStatus: "awaiting_confirmation", payload: { arguments: { action: "publish" } }, clientTurnId: "turn-1" },
    { ...base, id: "user-2", sequence: 9, kind: "message", role: "user", content: "再说明一次", toolName: null, toolStatus: null, clientTurnId: "turn-2" },
    { ...base, id: "assistant-turn-2", sequence: 10, kind: "message", role: "assistant", content: "已经整理完成。", toolName: null, toolStatus: null, clientTurnId: "turn-2" },
  ];

  assert.deepEqual(compactAgentTimelineEntries(entries).map((entry) => entry.id), [
    "user-1",
    "classify-completed",
    "assistant-duplicate-2",
    "proposal-current",
    "user-2",
    "assistant-turn-2",
  ]);
});

test("keeps one generic status when a turn has no user-facing Agent result", () => {
  const entries = [
    { id: "status-old", threadId: "thread-1", sequence: 1, kind: "tool_resolution", role: null, content: null, toolName: null, toolStatus: "collecting", payload: {}, clientTurnId: null, createdAt: "", updatedAt: "" },
    { id: "status-new", threadId: "thread-1", sequence: 2, kind: "tool_resolution", role: null, content: null, toolName: null, toolStatus: "completed", payload: {}, clientTurnId: null, createdAt: "", updatedAt: "" },
  ];
  assert.deepEqual(compactAgentTimelineEntries(entries).map((entry) => entry.id), ["status-new"]);
});

test("does not merge independent card operations that share the same action", () => {
  const base = { threadId: "thread-1", sequence: 1, kind: "tool_proposal", role: null, content: null, toolName: "press_demand_card_button", toolStatus: "awaiting_confirmation", clientTurnId: "turn-1", createdAt: "", updatedAt: "" };
  const entries = [
    { ...base, id: "card-1", payload: { arguments: { action: "publish", cardId: "card-1" } } },
    { ...base, id: "card-2", sequence: 2, payload: { arguments: { action: "publish", cardId: "card-2" } } },
  ];
  assert.deepEqual(compactAgentTimelineEntries(entries).map((entry) => entry.id), ["card-1", "card-2"]);
});

test("repairs a direct answer to the server's current missing field without reclassifying", () => {
  const before = { ...draft, missingFields: ["搭子要求"], canGenerateCard: false, status: "collecting" };
  const prompt = "搭子要求是年龄相近、节奏轻松，尊重彼此边界。";
  const after = {
    ...before,
    category: prompt,
    knownFields: {
      ...before.knownFields,
      活动: prompt,
      需求内容: prompt,
    },
  };
  const patch = reconcileExplicitDraftAnswer(prompt, before, after);
  assert.equal(patch?.demandType, "buddy");
  assert.equal(patch?.category, "Citywalk");
  assert.equal(patch?.knownFields?.["活动"], "Citywalk 和咖啡");
  assert.equal(patch?.knownFields?.["搭子要求"], "年龄相近、节奏轻松，尊重彼此边界");
  assert.deepEqual(patch?.missingFields, []);
  assert.equal(patch?.status, "readyToConfirm");
});

test("chat feedback never implies that a demand was created", () => {
  assert.match(agentTurnNotice({ executionMode: "conversation_v2", activeDraft: null }), /没有创建需求卡/);
  assert.match(demandLifecyclePrompt("publish"), /不要重新生成卡片/);
});

test("offers one-tap answers without asserting them as user facts", () => {
  const suggestions = agentReplySuggestions({ ...draft, missingFields: ["搭子要求"], canGenerateCard: false, status: "collecting" });
  assert.match(suggestions[0], /年龄相近/);
  assert.equal(agentReplySuggestions({ ...draft, status: "cardGenerated", userConfirmedGenerate: true })[0], "请提出发布确认，不要重新生成卡片");
});

test("fills a dating preference with an explicit editable default", () => {
  const collecting = {
    ...draft,
    demandType: "dating",
    knownFields: {
      活动: "周末约会",
      地点: "上海",
    },
    missingFields: ["偏好"],
    canGenerateCard: false,
    status: "collecting",
  };
  const patch = editableDefaultDraftPatch(collecting);
  assert.equal(patch?.knownFields?.["偏好"], "不限，优先礼貌、尊重边界（可编辑默认）");
  assert.deepEqual(patch?.missingFields, []);
  assert.equal(patch?.canGenerateCard, true);
  assert.equal(patch?.status, "readyToConfirm");
});

test("uses safe generic defaults without inventing an exact address", () => {
  const collecting = {
    ...draft,
    knownFields: { 活动: "Citywalk" },
    missingFields: ["地点", "时间", "搭子要求"],
    canGenerateCard: false,
    status: "collecting",
  };
  const patch = editableDefaultDraftPatch(collecting);
  assert.match(patch?.knownFields?.["地点"] || "", /同城公共场所/);
  assert.match(patch?.knownFields?.["地点"] || "", /可编辑默认/);
  assert.doesNotMatch(patch?.knownFields?.["地点"] || "", /路|号|小区|住址/);
  assert.equal(patch?.knownFields?.["时间"], "时间可协商（可编辑默认）");
  assert.deepEqual(patch?.missingFields, []);
});

test("does not fabricate the user's core activity or request", () => {
  const collecting = {
    ...draft,
    knownFields: {},
    missingFields: ["活动", "地点", "时间", "搭子要求"],
    canGenerateCard: false,
    status: "collecting",
  };
  const patch = editableDefaultDraftPatch(collecting);
  assert.equal(patch?.knownFields?.["活动"], undefined);
  assert.deepEqual(patch?.missingFields, ["活动"]);
  assert.equal(patch?.canGenerateCard, false);
  assert.equal(patch?.status, "collecting");
  assert.match(patch?.lastQuestion || "", /活动/);
});

test("lifecycle control prompts cannot overwrite the confirmed card facts", () => {
  const before = {
    ...draft,
    status: "cardGenerated",
    userConfirmedGenerate: true,
    generatedCardId: "card-1",
  };
  const polluted = {
    ...before,
    category: "请提出发布确认，不要重新生成卡片",
    knownFields: {
      ...before.knownFields,
      活动: "请提出发布确认，不要重新生成卡片",
    },
  };
  const patch = repairDraftAfterLifecycleTurn(before, polluted);
  assert.equal(patch?.category, "Citywalk 和咖啡");
  assert.equal(patch?.knownFields?.["活动"], "Citywalk 和咖啡");
  assert.equal(patch?.status, "cardGenerated");
  assert.equal(patch?.generatedCardId, "card-1");
});

test("restores the explicitly selected thread instead of jumping to the latest one", () => {
  const threads = [{ id: "latest" }, { id: "selected" }];
  assert.equal(preferredAgentThread(threads, "selected")?.id, "selected");
  assert.equal(preferredAgentThread(threads, "missing")?.id, "latest");
});

test("keeps the newest empty thread when no explicit thread was remembered", () => {
  const threads = [
    { id: "empty", messageCount: 0, preview: "" },
    { id: "meaningful", messageCount: 4, preview: "Citywalk" },
  ];
  assert.equal(preferredAgentThread(threads, null)?.id, "empty");
});

test("does not attach an old demand to a new empty Agent thread", () => {
  const demands = [
    { id: "demand-old", sourceConversationId: "thread-old" },
    { id: "demand-older", sourceConversationId: "thread-older" },
  ];
  assert.equal(demandForAgentThread(demands, "thread-new"), null);
});

test("restores only the demand created by the active Agent thread", () => {
  const demands = [
    { id: "demand-latest", sourceConversationId: "thread-other" },
    { id: "demand-current", sourceConversationId: "thread-current" },
  ];
  assert.equal(demandForAgentThread(demands, "thread-current")?.id, "demand-current");
  assert.equal(demandForAgentThread(demands, "thread-current", "demand-latest"), null);
});

test("aligns card fields with explicit facts from the same server assistant reply", () => {
  const serverReply = `收到，这个安排听上去很舒服。

**☕ 本周日下午 · 上海徐汇 · 找搭子**
- 活动：Citywalk + 喝咖啡
- 人数：1位，年龄相近
- 风格：节奏轻松，不赶场
- 安全约定：先在线聊天，只在公共场所见面`;
  const narrowDraft = {
    ...draft,
    category: "咖啡",
    knownFields: {
      地点: "上海徐汇",
      时间: "本周日下午",
      活动: "咖啡",
      数量或人数: "1位",
      搭子要求: "节奏轻松",
      偏好: "节奏轻松，不赶场",
    },
  };
  const patch = reconcileDraftWithAssistantSummary(narrowDraft, serverReply);
  assert.equal(patch?.category, "Citywalk + 喝咖啡");
  assert.equal(patch?.knownFields?.["活动"], "Citywalk + 喝咖啡");
  assert.equal(patch?.knownFields?.["数量或人数"], "1位");
  assert.equal(patch?.knownFields?.["搭子要求"], "年龄相近；节奏轻松，不赶场");
  assert.equal(patch?.knownFields?.["边界"], "先在线聊天，只在公共场所见面");
  assert.equal(patch?.knownFields?.["偏好"], undefined);
});

test("canonical card removes a preference already represented by partner requirements", () => {
  const patch = canonicalAgentDraftCardPatch({
    ...draft,
    knownFields: {
      活动: "Citywalk + 喝咖啡",
      搭子要求: "年龄相近；节奏轻松，不赶场",
      偏好: "节奏轻松",
      边界: "先在线聊天，只在公共场所见面",
    },
  });
  assert.equal(patch.knownFields["偏好"], undefined);
  assert.equal(patch.knownFields["边界"], "先在线聊天，只在公共场所见面");
});

test("published card hides a preference already represented by partner requirements", () => {
  const fields = deduplicateAgentCardFields([
    { title: "搭子要求", value: "年龄相近；节奏轻松，不赶场" },
    { title: "偏好", value: "节奏轻松" },
    { title: "边界", value: "先在线聊天，只在公共场所见面" },
  ]);
  assert.deepEqual(fields.map((field) => field.title), ["搭子要求", "边界"]);
});
