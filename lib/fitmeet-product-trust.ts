import type { AgentInboxEvent, FitMeetAgentMemory } from './fitmeet-api-contract';
import { defaultMemoryUseScope } from './fitmeet-memory-state.ts';

export type TrustTone = 'positive' | 'neutral' | 'caution';

export type CandidateTrustInput = {
  usedSignals?: string[];
  missingSignals?: string[];
  boundaryNotes?: string[];
  riskWarnings?: string[];
  confidenceLevel?: string | null;
  dataQuality?: string | null;
  profileCompleteness?: number | null;
  safeFirstStep?: string | null;
  nextActionSuggestion?: string | null;
  requiresConfirmation?: boolean | null;
};

function uniqueText(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
}

export function candidateTrustEvidence(input: CandidateTrustInput) {
  const usedSignals = uniqueText(input.usedSignals ?? []);
  const missingSignals = uniqueText(input.missingSignals ?? []).filter(
    (item) => !usedSignals.includes(item),
  );
  const boundaryNotes = uniqueText([...(input.boundaryNotes ?? []), ...(input.riskWarnings ?? [])]);
  const confidence = confidencePresentation(input.confidenceLevel);
  const quality = dataQualityPresentation(input.dataQuality);
  const completeness =
    typeof input.profileCompleteness === 'number'
      ? Math.max(0, Math.min(100, Math.round(input.profileCompleteness)))
      : null;

  return {
    usedSignals,
    missingSignals,
    boundaryNotes,
    confidence,
    quality,
    completeness,
    safeFirstStep: input.safeFirstStep?.trim() || '',
    nextActionSuggestion: input.nextActionSuggestion?.trim() || '',
    requiresConfirmation: input.requiresConfirmation !== false,
  };
}

export function confidencePresentation(value?: string | null): { label: string; tone: TrustTone } {
  const normalized = value?.trim().toLowerCase();
  if (['high', 'strong', 'reliable'].includes(normalized || ''))
    return { label: '高置信度', tone: 'positive' };
  if (['medium', 'moderate'].includes(normalized || ''))
    return { label: '中等置信度', tone: 'neutral' };
  if (['low', 'weak', 'uncertain'].includes(normalized || ''))
    return { label: '低置信度', tone: 'caution' };
  return { label: '置信度未提供', tone: 'neutral' };
}

export function dataQualityPresentation(value?: string | null): { label: string; tone: TrustTone } {
  const normalized = value?.trim().toLowerCase();
  if (['fresh', 'complete', 'reliable', 'high'].includes(normalized || ''))
    return { label: '资料较新', tone: 'positive' };
  if (['stale', 'outdated', 'expired'].includes(normalized || ''))
    return { label: '资料可能过期', tone: 'caution' };
  if (['limited', 'incomplete', 'low', 'partial'].includes(normalized || ''))
    return { label: '资料有限', tone: 'caution' };
  return { label: '资料新鲜度未提供', tone: 'neutral' };
}

export function memorySourceLabel(source?: string) {
  const normalized = source?.trim().toLowerCase() || '';
  if (/onboarding|profile|manual|user/.test(normalized)) return '你主动填写';
  if (/conversation|chat|agent/.test(normalized)) return 'Agent 对话';
  if (/demand|intent|activity/.test(normalized)) return '历史需求';
  if (/infer|system|model/.test(normalized)) return '系统推断';
  return source?.trim() || '来源未提供';
}

export function memorySensitivityPresentation(value?: string): { label: string; tone: TrustTone } {
  const normalized = value?.trim().toLowerCase() || '';
  if (/sensitive|high|restricted/.test(normalized)) return { label: '敏感信息', tone: 'caution' };
  if (/medium|moderate/.test(normalized)) return { label: '需要留意', tone: 'neutral' };
  if (/low|normal|public/.test(normalized)) return { label: '普通偏好', tone: 'positive' };
  return { label: '敏感等级未提供', tone: 'neutral' };
}

export function memoryConfidenceLabel(confidence?: number) {
  if (typeof confidence !== 'number' || Number.isNaN(confidence)) return '未提供';
  const normalized = confidence <= 1 ? confidence * 100 : confidence;
  return `${Math.max(0, Math.min(100, Math.round(normalized)))}%`;
}

export function memoryStatusLabel(status: string) {
  const normalized = status.trim().toLowerCase();
  if (['confirmed', 'active'].includes(normalized)) return '已确认';
  if (['rejected', 'disabled'].includes(normalized)) return '不使用';
  if (normalized === 'expired') return '已过期';
  if (['pending', 'proposed', 'draft'].includes(normalized)) return '等待确认';
  return status || '状态未提供';
}

export type MemoryDecisionAction = 'confirm' | 'reject' | 'delete';

export function memoryDecisionActions(status: string): MemoryDecisionAction[] {
  const normalized = status.trim().toLowerCase();
  if (['pending', 'proposed', 'draft'].includes(normalized)) return ['confirm', 'reject'];
  if (normalized === 'expired') return ['confirm', 'delete'];
  if (['confirmed', 'active', 'rejected', 'disabled'].includes(normalized)) return ['delete'];
  return [];
}

export type InboxEventCategory = 'relationship' | 'message' | 'activity' | 'safety' | 'system';

export function inboxEventCategory(event: AgentInboxEvent): InboxEventCategory {
  const type = event.type || '';
  if (/connection|friend|relationship/i.test(type)) return 'relationship';
  if (/message|conversation/i.test(type)) return 'message';
  if (/safety|report|block|moderation|risk/i.test(type)) return 'safety';
  if (/demand|invitation|meet|application|activity|candidate|group/i.test(type)) return 'activity';
  return 'system';
}

export type InboxEventDestination =
  | { kind: 'conversation'; id: string }
  | { kind: 'user'; id: number }
  | { kind: 'demand'; id: string }
  | { kind: 'group'; id: string }
  | { kind: 'post'; id: number }
  | { kind: 'none' };

function payloadString(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function payloadNumber(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key];
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function inboxEventDestination(event: AgentInboxEvent): InboxEventDestination {
  const conversationId = payloadString(event.payload, 'conversationId');
  if (conversationId) return { kind: 'conversation', id: conversationId };
  const groupId = payloadString(event.payload, 'groupId');
  if (groupId) return { kind: 'group', id: groupId };
  const demandId = payloadString(event.payload, 'demandId');
  if (demandId) return { kind: 'demand', id: demandId };
  const postId = payloadNumber(event.payload, 'postId');
  if (postId) return { kind: 'post', id: postId };
  const userId = event.relatedUserId || payloadNumber(event.payload, 'userId');
  if (userId) return { kind: 'user', id: userId };
  return { kind: 'none' };
}

export function memoryBoundaryNotice(
  memory: Pick<FitMeetAgentMemory, 'status' | 'sensitivity' | 'useScope'>,
) {
  const status = memory.status.trim().toLowerCase();
  const confirmed = ['confirmed', 'active'].includes(status);
  const sensitive = memorySensitivityPresentation(memory.sensitivity).tone === 'caution';
  if (status === 'expired') return '这条记忆已过期，不会继续参与推荐；重新确认后才会恢复使用。';
  if (['rejected', 'disabled'].includes(status)) return '你已选择不使用这条推断；它不会参与 Agent 或匹配。';
  if (!confirmed && sensitive)
    return '敏感信息不会因为一次普通对话自动保存；只有你确认并选择用途后才会使用。';
  if (!confirmed) return '这是一条待确认的推断；不确认就不会成为长期记忆。';
  const useScope = defaultMemoryUseScope(memory);
  if (useScope === 'paused') return '这条记忆已保留但暂停使用；Agent 和匹配都不会读取。';
  if (useScope === 'agent_only') return '仅帮助小福理解对话和生成待确认草稿，不参与匹配，也不会自动公开。';
  if (useScope === 'matching_only') return '仅用于候选人与组局匹配，不放入普通 Agent 对话。';
  return '可用于小福理解和匹配；不会自动公开到你的个人资料，也不会替你联系任何人。';
}
