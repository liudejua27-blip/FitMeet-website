import type { AgentCompletionResponse, FitMeetAgentMemory, SocialProfile } from "./fitmeet-api-contract";

const empathySignals = "先接住用户的感受和处境，再讨论选择；不评判、不催促、不把社交结果说成用户的成败。";

export function fitMeetAgentSystemPrompt(profile: SocialProfile, memories: FitMeetAgentMemory[]) {
  const confirmedMemories = memories
    .filter((memory) => memory.status === "confirmed" || memory.status === "active")
    .map((memory) => `${memory.memoryType}: ${memory.value || memory.summary || ""}`)
    .filter(Boolean)
    .slice(0, 12);

  return `你是 FitMeet 的小福，一个高情商、边界清晰的社交协作助手。

用户档案：昵称 ${profile.nickname || "未填写"}；城市 ${profile.city || "未填写"}；兴趣 ${profile.interests.join("、") || "未填写"}；可接受距离 ${profile.distanceKm} km。
确认记忆：${confirmedMemories.join("；") || "暂无"}。

对话原则：
1. ${empathySignals}
2. 先给一个轻量、可撤回的下一步；信息不足时一次只问 1-2 个最必要的问题。
3. 不能声称已经发布、匹配、联系、发送邀请、开启私信、安排见面或保存资料。所有这些动作必须由用户在界面中明确确认后才会发生。
4. 不要索取或展示精确住址、身份证件、联系方式等敏感信息。涉及线下时，优先建议公共场所、明确时间与退出空间。
5. 当用户想找人活动时，帮其形成清晰的「需求卡草稿」：活动、时间、大致地点、人数、节奏/边界。提醒用户可以点击“生成需求卡草稿”后自行核对和发布。
6. 对拒绝、失约、焦虑、疲惫、困扰等情境先表达理解，再给用户选择；紧急危险时建议立即联系当地紧急服务、可信赖的人并停止互动。

保持自然的简体中文、短段落、不过度使用表情。`;
}

export function agentText(response: AgentCompletionResponse) {
  if (typeof response.content === "string" && response.content.trim()) return response.content.trim();
  if (typeof response.reply === "string" && response.reply.trim()) return response.reply.trim();
  if (typeof response.message === "string" && response.message.trim()) return response.message.trim();
  if (response.message && typeof response.message === "object" && typeof response.message.content === "string" && response.message.content.trim()) return response.message.content.trim();
  const choice = response.choices?.[0];
  if (typeof choice?.message?.content === "string" && choice.message.content.trim()) return choice.message.content.trim();
  if (typeof choice?.text === "string" && choice.text.trim()) return choice.text.trim();
  throw new Error("小福暂时没有生成有效回复，请稍后再试。");
}
