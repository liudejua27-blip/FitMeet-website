export type FitMeetFeedbackTone = 'success' | 'error' | 'warning' | 'info' | 'pending';

export type FitMeetActionResult =
  | { ok: true }
  | { ok: false; error: string };

export type AgentToolDisclosure = {
  why: string;
  sources: string[];
  writeScope: string;
};

const ERROR_COPY = /失败|未能|无法|不可用|错误|超时|没有成功|已关闭|拒绝访问|过期/;
const PENDING_COPY = /正在|提交中|发送中|加载中|同步中|连接中|重连/;
const WARNING_COPY = /请先|必须|还差|等待|需要|尚未|暂未|不会自动|仅支持|仍未|不能/;
const SUCCESS_COPY = /已|成功|完成|发出|发布|保存|删除|解除|接受|婉拒|撤回|同步了/;

export function feedbackToneForMessage(message: string): FitMeetFeedbackTone {
  if (ERROR_COPY.test(message)) return 'error';
  if (PENDING_COPY.test(message)) return 'pending';
  if (WARNING_COPY.test(message)) return 'warning';
  if (SUCCESS_COPY.test(message)) return 'success';
  return 'info';
}

const ARGUMENT_LABELS: Record<string, string> = {
  action: '准备执行',
  candidate_id: '候选记录',
  candidate_user_id: '接收用户',
  conversation_id: '会话',
  demand_id: '关联需求',
  generated_card_id: '需求卡',
  intent_id: '需求',
  invitation_id: '邀请',
  profile_patch: '资料变更',
  target_id: '目标对象',
  target_user_id: '目标用户',
  user_id: '用户',
  visibility: '可见范围',
};

const HIDDEN_ARGUMENT_KEYS = new Set([
  'idempotency_key',
  'invitation_message',
  'message',
  'service_message',
  'token',
]);

export function visibleAgentArguments(args: Record<string, unknown>) {
  return Object.entries(args)
    .filter(([key, value]) => !HIDDEN_ARGUMENT_KEYS.has(key) && value !== undefined && value !== null)
    .map(([key, value]) => ({
      key,
      label: ARGUMENT_LABELS[key] || key.replace(/_/g, ' '),
      value: formatAgentArgument(value),
    }));
}

function formatAgentArgument(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return '结构化资料';
  }
}

export function agentToolDisclosure(
  toolName: string | null,
  args: Record<string, unknown> = {},
): AgentToolDisclosure {
  const action = typeof args.action === 'string' ? args.action : '';
  const disclosures: Record<string, AgentToolDisclosure> = {
    press_demand_card_button: {
      why: `你在当前 Agent 对话中提出了${action === 'publish' ? '发布' : action === 'hide' ? '暂停' : action === 'cancel' ? '取消' : '变更'}需求卡，小福把它整理成了待确认操作。`,
      sources: ['当前 Agent 对话', '已确认的需求卡字段', '服务端当前需求状态'],
      writeScope: '只变更当前这张需求卡的状态，不会替你联系任何人。',
    },
    send_invitation: {
      why: '你已经查看候选人并准备发出活动邀请，因此需要最后确认接收对象和邀请文案。',
      sources: ['当前需求卡', '候选人的公开资料', '匹配理由与互动边界', '你确认的邀请文案'],
      writeScope: '只创建一条邀请；不会自动加好友或开启连续私信。',
    },
    request_service_connection: {
      why: '你准备联系一位服务提供者，小福先把接收对象和沟通内容放到确认页。',
      sources: ['当前需求卡', '服务者公开资料', '你确认的联系文案'],
      writeScope: '只创建联系请求；不会绕过对方的接受步骤。',
    },
    block_user: {
      why: '你触发了停止互动的安全操作，需要再次确认影响范围。',
      sources: ['目标用户标识', '当前关系状态', '相关会话权限'],
      writeScope: '停止推荐和后续互动；不会自动提交举报。',
    },
    report_user: {
      why: '你选择了提交安全举报，需要确认目标与举报内容。',
      sources: ['目标用户标识', '你主动填写的举报原因与说明'],
      writeScope: '只提交安全审核；不会自动拉黑或向对方发送消息。',
    },
    patch_social_profile: {
      why: '你要求修改个人资料或隐私设置，小福把实际写入字段列在确认页。',
      sources: ['当前个人资料', '你在本轮对话中明确提出的修改'],
      writeScope: '只写入列出的字段，未列出的资料保持不变。',
    },
  };
  return disclosures[toolName || ''] || {
    why: '这一步会改变账号、关系或真实对象，因此小福暂停并等待你的明确确认。',
    sources: ['当前 Agent 对话', '本次操作提案中列出的字段'],
    writeScope: '只提交确认页列出的这一步，其他动作仍需单独确认。',
  };
}

function payloadRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function agentToolResultLink(payload: Record<string, unknown>) {
  const result = payloadRecord(payload.result);
  const values = { ...payload, ...result };
  const demandId = values.demandId ?? values.demand_id ?? values.generatedCardId ?? values.generated_card_id;
  if (typeof demandId === 'string' && demandId) {
    return { href: `/agent/try/demands/${encodeURIComponent(demandId)}`, label: '查看需求结果' };
  }
  const conversationId = values.conversationId ?? values.conversation_id;
  if (typeof conversationId === 'string' && conversationId) {
    return { href: `/agent/try/messages/${encodeURIComponent(conversationId)}`, label: '进入真实会话' };
  }
  const userId = values.userId ?? values.user_id ?? values.targetUserId ?? values.target_user_id;
  if ((typeof userId === 'string' && userId) || (typeof userId === 'number' && Number.isFinite(userId))) {
    return { href: `/agent/try/users/${encodeURIComponent(String(userId))}`, label: '查看相关用户' };
  }
  return null;
}

export type ConversationDrafts = Record<string, string>;

export function parseConversationDrafts(value: string | null): ConversationDrafts {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([key, draft]) => key && typeof draft === 'string' && draft.length <= 4_000)
        .map(([key, draft]) => [key, draft as string]),
    );
  } catch {
    return {};
  }
}

export function updateConversationDraft(
  drafts: ConversationDrafts,
  conversationId: string,
  value: string,
): ConversationDrafts {
  if (!conversationId) return drafts;
  if (!value) {
    const next = { ...drafts };
    delete next[conversationId];
    return next;
  }
  return { ...drafts, [conversationId]: value.slice(0, 4_000) };
}
