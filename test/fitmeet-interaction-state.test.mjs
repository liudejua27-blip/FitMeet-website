import assert from 'node:assert/strict';
import test from 'node:test';
import {
  agentToolDisclosure,
  agentToolResultLink,
  feedbackToneForMessage,
  parseConversationDrafts,
  updateConversationDraft,
  visibleAgentArguments,
} from '../lib/fitmeet-interaction-state.ts';

test('feedback uses distinct semantic tones instead of one success icon', () => {
  assert.equal(feedbackToneForMessage('好友申请已发送。'), 'success');
  assert.equal(feedbackToneForMessage('好友申请未能发送。'), 'error');
  assert.equal(feedbackToneForMessage('还差一项资料，请先补充。'), 'warning');
  assert.equal(feedbackToneForMessage('正在重新同步账号数据。'), 'pending');
  assert.equal(feedbackToneForMessage('你可以继续浏览。'), 'info');
});

test('tool approval hides internal fields and labels user-visible changes', () => {
  assert.deepEqual(
    visibleAgentArguments({
      action: 'publish',
      demand_id: 'demand-1',
      idempotency_key: 'secret-internal-key',
      message: 'editable copy',
    }),
    [
      { key: 'action', label: '准备执行', value: 'publish' },
      { key: 'demand_id', label: '关联需求', value: 'demand-1' },
    ],
  );
});

test('tool disclosure preserves the assisted-social confirmation boundary', () => {
  const disclosure = agentToolDisclosure('send_invitation');
  assert.match(disclosure.why, /最后确认/);
  assert.match(disclosure.writeScope, /不会自动加好友或开启连续私信/);
  assert.ok(disclosure.sources.includes('候选人的公开资料'));
});

test('tool results link only to verified payload identifiers', () => {
  assert.deepEqual(agentToolResultLink({ result: { conversationId: 'conversation-1' } }), {
    href: '/agent/try/messages/conversation-1',
    label: '进入真实会话',
  });
  assert.deepEqual(agentToolResultLink({ demand_id: 'demand/1' }), {
    href: '/agent/try/demands/demand%2F1',
    label: '查看需求结果',
  });
  assert.equal(agentToolResultLink({}), null);
});

test('conversation drafts are scoped by conversation and invalid storage fails closed', () => {
  const withFirst = updateConversationDraft({}, 'conversation-1', '第一段草稿');
  const withSecond = updateConversationDraft(withFirst, 'conversation-2', '第二段草稿');
  assert.equal(withSecond['conversation-1'], '第一段草稿');
  assert.equal(withSecond['conversation-2'], '第二段草稿');
  assert.deepEqual(updateConversationDraft(withSecond, 'conversation-1', ''), {
    'conversation-2': '第二段草稿',
  });
  assert.deepEqual(parseConversationDrafts('{invalid'), {});
  assert.deepEqual(parseConversationDrafts(JSON.stringify({ good: '保留', bad: 12 })), { good: '保留' });
});
