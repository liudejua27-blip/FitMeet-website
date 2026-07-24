import test from "node:test";
import assert from "node:assert/strict";
import {
  agentDraftActivity,
  agentDraftCanRenderCard,
  agentReplySuggestions,
  agentTurnNotice,
  canonicalAgentDraftCardPatch,
  deduplicateAgentCardFields,
  demandForAgentThread,
  demandLifecyclePrompt,
  latestAgentToolProposal,
  mergeAgentDraftEdits,
  orderedAgentDraftFields,
  preferredAgentThread,
  reconcileAgentReplyWithDraft,
  reconcileDraftWithAssistantSummary,
  reconcileExplicitDraftAnswer,
  repairDraftAfterLifecycleTurn,
} from "../lib/fitmeet-agent-thread-state.ts";

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

test("a ready draft is not displayed as a generated card before confirmation", () => {
  assert.equal(agentDraftCanRenderCard(draft), false);
  assert.equal(agentDraftCanRenderCard({ ...draft, status: "cardGenerated", userConfirmedGenerate: true }), true);
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
  assert.equal(patch.status, "readyToConfirm");
});

test("finds the latest actionable server proposal", () => {
  const proposal = latestAgentToolProposal([
    { id: "old", threadId: "thread-1", sequence: 4, kind: "tool_proposal", role: null, content: null, toolName: "generate_demand_card", toolStatus: "approved", payload: {}, clientTurnId: null, createdAt: "", updatedAt: "" },
    { id: "new", threadId: "thread-1", sequence: 8, kind: "tool_proposal", role: null, content: null, toolName: "generate_demand_card", toolStatus: "ready_for_review", payload: {}, clientTurnId: null, createdAt: "", updatedAt: "" },
  ], "generate_demand_card");
  assert.equal(proposal?.id, "new");
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

test("uses the remote draft as the single stage when model copy disagrees", () => {
  const collecting = {
    ...draft,
    missingFields: ["搭子要求"],
    canGenerateCard: false,
    status: "collecting",
    lastQuestion: "搭子要求你希望是什么样？",
  };
  const corrected = reconcileAgentReplyWithDraft(
    "太好了，信息已经全部齐全，我现在可以生成卡片。\n\n你还想要什么年龄和性格？你对时间还有要求吗？",
    collecting,
  );
  assert.doesNotMatch(corrected, /全部齐全/);
  assert.match(corrected, /只确认一个关键点/);
  assert.match(corrected, /搭子要求/);
  assert.equal((corrected.match(/[？?]/g) || []).length, 1);

  const ready = reconcileAgentReplyWithDraft(
    "还需要你补充更精确的位置。",
    draft,
  );
  assert.match(ready, /信息已经足够/);
  assert.match(ready, /要我现在生成吗/);
});

test("chat feedback never implies that a demand was created", () => {
  assert.match(agentTurnNotice({ executionMode: "social_chat_v1", activeDraft: null }), /没有创建需求卡/);
  assert.match(demandLifecyclePrompt("publish"), /不要重新生成卡片/);
});

test("offers one-tap answers without asserting them as user facts", () => {
  const suggestions = agentReplySuggestions({ ...draft, missingFields: ["搭子要求"], canGenerateCard: false, status: "collecting" });
  assert.match(suggestions[0], /年龄相近/);
  assert.equal(agentReplySuggestions({ ...draft, status: "cardGenerated", userConfirmedGenerate: true })[0], "请提出发布确认，不要重新生成卡片");
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
