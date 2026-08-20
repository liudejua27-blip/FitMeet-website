import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  agentToolDisclosure,
  agentToolResultLink,
  feedbackToneForMessage,
  parseConversationDrafts,
  updateConversationDraft,
  visibleAgentArguments,
} from '../lib/fitmeet-interaction-state.ts';

const completeExperienceSource = readFileSync(
  new URL('../components/fitmeet-app/FitMeetCompleteExperience.tsx', import.meta.url),
  'utf8',
);
const profileExperienceSource = readFileSync(
  new URL('../components/fitmeet-app/ProfileExperience.tsx', import.meta.url),
  'utf8',
);

function sourceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `missing source start: ${start}`);
  assert.notEqual(endIndex, -1, `missing source end: ${end}`);
  return source.slice(startIndex, endIndex);
}

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

test('opening an invitation draft does not record an invited decision before server confirmation', () => {
  const createInvite = sourceBetween(
    completeExperienceSource,
    'const createInvite = () => {',
    'const sendInvite = async (message: string) => {',
  );
  const sendInvite = sourceBetween(
    completeExperienceSource,
    'const sendInvite = async (message: string) => {',
    'const updateMeet = async',
  );

  assert.doesNotMatch(createInvite, /recordCandidate\([^)]*'invited'/);
  assert.match(sendInvite, /await api\.createInvitation/);
  assert.match(sendInvite, /recordCandidate\(selectedCandidate\.id, 'invited'\)/);
  assert.match(sendInvite, /inviteSendingRef\.current/);
});

test('agent turns and demand matches reject late responses from an obsolete scope', () => {
  const sendAgentMessage = sourceBetween(
    completeExperienceSource,
    'const sendAgentMessage = async',
    'const startVoiceInput = () => {',
  );
  const activateDemand = sourceBetween(
    completeExperienceSource,
    'const activateDemand = useCallback(',
    'const openDemandRecord = useCallback(',
  );
  const syncDemandMatches = sourceBetween(
    completeExperienceSource,
    'const syncDemandMatches = async',
    'const pollDemandMatches =',
  );

  assert.match(sendAgentMessage, /const sendRequestId = \+\+agentSendRequestRef\.current/);
  assert.match(sendAgentMessage, /if \(!operationIsCurrent\(\)\) return;/);
  assert.match(activateDemand, /const activationGeneration = \+\+demandMatchPollGenerationRef\.current/);
  assert.match(activateDemand, /activeDemandIdRef\.current !== record\.id/);
  assert.match(syncDemandMatches, /activeDemandIdRef\.current !== demandId/);
});

test('candidate actions use the actionable queue instead of the immutable generation receipt', () => {
  assert.match(
    completeExperienceSource,
    /const currentCandidateCount = activeCandidates\.length/,
  );
  assert.doesNotMatch(
    completeExperienceSource,
    /const currentCandidateCount = Math\.max\([\s\S]*?matchJob\?\.candidateCount/,
  );
  const syncDemandMatches = sourceBetween(
    completeExperienceSource,
    'const syncDemandMatches = async',
    'const pollDemandMatches =',
  );
  assert.match(syncDemandMatches, /actionableCandidateCount: guarded\.candidates\.length/);
  assert.match(completeExperienceSource, /result\.actionableCandidateCount > 0/);
  assert.match(completeExperienceSource, /本轮候选已经处理完/);
});

test('sent invitations expose the real user profile route instead of a dead candidate modal', () => {
  const messageExperienceSource = readFileSync(
    new URL('../components/fitmeet-app/MessagesExperience.tsx', import.meta.url),
    'utf8',
  );
  assert.match(messageExperienceSource, /查看对方资料/);
  assert.match(messageExperienceSource, /onUser\(Number\(item\.inviteeUserId\)\)/);
  assert.match(messageExperienceSource, /useState<MessageHomeCategory>\(initialCategory\)/);
  assert.match(completeExperienceSource, /setMessageLandingCategory\('interaction'\)/);
  assert.match(completeExperienceSource, /onUser=\{\(id\) => router\.push\(`\/agent\/try\/users\/\$\{id\}`\)\}/);
});

test('destructive and write-in-progress sheets cannot close through Escape or the backdrop', () => {
  const sheet = sourceBetween(
    completeExperienceSource,
    'function Sheet({',
    'type FitMeetCompleteExperienceProps',
  );
  assert.match(sheet, /useAccessibleDialog\(true, guardedClose\)/);
  assert.match(sheet, /onMouseDown={guardedClose}/);
  assert.match(sheet, /aria-busy={closeDisabled}/);
  assert.match(
    profileExperienceSource,
    /closeDisabled={accountOperation === "delete"}/,
  );
});
