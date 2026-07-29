import assert from 'node:assert/strict';
import test from 'node:test';
import {
  candidateTrustEvidence,
  inboxEventCategory,
  inboxEventDestination,
  memoryBoundaryNotice,
  memoryConfidenceLabel,
  memoryDecisionActions,
  memorySensitivityPresentation,
  memorySourceLabel,
} from '../lib/fitmeet-product-trust.ts';

test('candidate trust evidence separates used, missing and safety signals without duplicates', () => {
  const evidence = candidateTrustEvidence({
    usedSignals: ['时间窗口', '同城', '时间窗口'],
    missingSignals: ['咖啡偏好', '同城'],
    boundaryNotes: ['仅公共场所'],
    riskWarnings: ['仅公共场所', '首次见面先确认'],
    confidenceLevel: 'high',
    dataQuality: 'fresh',
    profileCompleteness: 88.4,
  });
  assert.deepEqual(evidence.usedSignals, ['时间窗口', '同城']);
  assert.deepEqual(evidence.missingSignals, ['咖啡偏好']);
  assert.deepEqual(evidence.boundaryNotes, ['仅公共场所', '首次见面先确认']);
  assert.equal(evidence.confidence.label, '高置信度');
  assert.equal(evidence.quality.label, '资料较新');
  assert.equal(evidence.completeness, 88);
});

test('memory metadata stays explicit about source, sensitivity and confirmation boundary', () => {
  assert.equal(memorySourceLabel('agent_conversation'), 'Agent 对话');
  assert.equal(memorySourceLabel('demand_history'), '历史需求');
  assert.equal(memorySensitivityPresentation('sensitive').label, '敏感信息');
  assert.equal(memoryConfidenceLabel(0.86), '86%');
  assert.deepEqual(memoryDecisionActions('proposed'), ['confirm', 'reject']);
  assert.deepEqual(memoryDecisionActions('confirmed'), ['delete']);
  assert.deepEqual(memoryDecisionActions('expired'), ['confirm', 'delete']);
  assert.deepEqual(memoryDecisionActions('unknown'), []);
  assert.match(
    memoryBoundaryNotice({ status: 'pending', sensitivity: 'sensitive' }),
    /不会.*自动保存/,
  );
  assert.match(
    memoryBoundaryNotice({ status: 'confirmed', sensitivity: 'normal', useScope: 'agent_only' }),
    /不参与匹配/,
  );
  assert.match(
    memoryBoundaryNotice({ status: 'confirmed', sensitivity: 'normal', useScope: 'paused' }),
    /暂停使用/,
  );
});

test('notification category and deep link destination follow server payloads', () => {
  const message = {
    id: 'message-1',
    type: 'conversation.message.created',
    payload: { conversationId: 'conversation/a' },
  };
  assert.equal(inboxEventCategory(message), 'message');
  assert.deepEqual(inboxEventDestination(message), {
    kind: 'conversation',
    id: 'conversation/a',
  });
  assert.deepEqual(
    inboxEventDestination({ id: 'demand-1', type: 'demand.updated', payload: { demandId: 'd-7' } }),
    { kind: 'demand', id: 'd-7' },
  );
  assert.deepEqual(
    inboxEventDestination({ id: 'group-1', type: 'group.join.requested', payload: { groupId: 'g-7' } }),
    { kind: 'group', id: 'g-7' },
  );
  assert.deepEqual(inboxEventDestination({ id: 'unknown' }), { kind: 'none' });
});
