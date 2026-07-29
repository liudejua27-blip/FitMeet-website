import type {
  AgentMemoryEvidence,
  AgentMemorySensitivity,
  AgentMemoryUsageEvent,
  AgentMemoryUseScope,
  FitMeetAgentMemory,
} from './fitmeet-api-contract.ts';

export const agentMemoryUseScopeOptions = [
  {
    value: 'agent_and_matching',
    label: '小福与匹配',
    description: '帮助小福理解你、整理草稿，也参与候选人与组局匹配。',
  },
  {
    value: 'agent_only',
    label: '仅小福理解',
    description: '只用于对话理解和草稿建议，不改变匹配排序。',
  },
  {
    value: 'matching_only',
    label: '仅用于匹配',
    description: '只参与候选人与组局匹配，不放入普通 Agent 对话。',
  },
  {
    value: 'paused',
    label: '暂停使用',
    description: '保留这条记忆，但 Agent 和匹配都不再读取。',
  },
] as const satisfies ReadonlyArray<{
  value: AgentMemoryUseScope;
  label: string;
  description: string;
}>;

const memoryTypeLabels: Record<string, string> = {
  advantage_clue: '优势线索',
  activity_preference: '活动偏好',
  content_interest: '兴趣方向',
  frequent_area: '常去区域',
  interaction_boundary: '互动边界',
  location_preference: '地点偏好',
  negative_feedback: '不喜欢的方向',
  opener_style: '开场偏好',
  people_preference: '人群偏好',
  service_preference: '任务与服务偏好',
  social_boundary: '社交边界',
  social_preference: '社交偏好',
  time_preference: '时间偏好',
  verification_clue: '认证线索',
  workout_profile: '运动画像',
};

function normalized(value?: string | null) {
  return String(value || '').trim().toLowerCase();
}

export function memoryTypeLabel(memoryType: string) {
  const key = normalized(memoryType);
  if (memoryTypeLabels[key]) return memoryTypeLabels[key];
  const readable = key.replace(/[_-]+/g, ' ').trim();
  return readable || '其他画像';
}

export function memoryUseScopePresentation(scope?: AgentMemoryUseScope | string | null) {
  return (
    agentMemoryUseScopeOptions.find((option) => option.value === scope) ?? {
      value: 'agent_and_matching' as const,
      label: '小福与匹配',
      description: '帮助小福理解你、整理草稿，也参与候选人与组局匹配。',
    }
  );
}

export function defaultMemoryUseScope(
  memory: Pick<FitMeetAgentMemory, 'useScope' | 'sensitivity'>,
): AgentMemoryUseScope {
  if (memory.useScope) return memory.useScope;
  const sensitivity = normalized(memory.sensitivity);
  return /sensitive|high|restricted/.test(sensitivity) ? 'agent_only' : 'agent_and_matching';
}

export function memoryCanChangeScope(status: string) {
  return ['confirmed', 'active'].includes(normalized(status));
}

export function memoryEvidenceText(evidence?: AgentMemoryEvidence[]) {
  const values = (evidence ?? [])
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item.sourceRole && item.sourceRole !== 'user') return '';
      return item.text || '';
    })
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set(values)).slice(0, 3);
}

export function memoryUsagePurposeLabel(purpose: AgentMemoryUsageEvent['purpose']) {
  return purpose === 'matching' ? '用于匹配' : '用于小福理解';
}

export function memoryUsageContextLabel(event: AgentMemoryUsageEvent) {
  if (event.contextType === 'agent_thread') return 'Agent 对话';
  if (event.contextType === 'demand') return event.subjectId ? '需求候选匹配' : '需求匹配';
  return '使用场景';
}

export function memoryUsagePath(event: AgentMemoryUsageEvent) {
  if (!event.contextId) return null;
  if (event.contextType === 'agent_thread')
    return `/agent/try/chat/${encodeURIComponent(event.contextId)}`;
  if (event.contextType === 'demand')
    return `/agent/try/demands/${encodeURIComponent(event.contextId)}`;
  return null;
}

export function mergeMemoryUsageEvents(
  current: AgentMemoryUsageEvent[],
  incoming: AgentMemoryUsageEvent[],
) {
  const seen = new Set<string>();
  return [...current, ...incoming].filter((event) => {
    if (!event.id || seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

export function memorySensitivityDefaultScope(sensitivity?: AgentMemorySensitivity) {
  return defaultMemoryUseScope({ sensitivity });
}
