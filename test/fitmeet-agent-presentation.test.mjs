import assert from 'node:assert/strict';
import test from 'node:test';

import {
  agentEntryCanRender,
  agentEntryIsStreaming,
  agentLiveEventBelongsToThread,
  agentRunPresentation,
  agentToolIsActive,
} from '../lib/fitmeet-agent-presentation.ts';

function entry(overrides = {}) {
  return {
    id: 'entry-1',
    threadId: 'thread-1',
    sequence: 2,
    kind: 'tool_resolution',
    role: 'assistant',
    content: null,
    toolName: null,
    toolStatus: null,
    payload: {},
    clientTurnId: 'turn-1',
    createdAt: '2026-08-09T00:00:00.000Z',
    updatedAt: '2026-08-09T00:00:00.000Z',
    ...overrides,
  };
}

test('agent run presentation maps real card structuring without claiming a write', () => {
  const status = agentRunPresentation([], 0, true);
  assert.equal(status.activity, 'structuring');
  assert.equal(status.stage, 1);
  assert.deepEqual(status.steps.map((step) => step.state), ['running']);
  assert.match(status.title, /可编辑需求卡/);
  assert.match(status.detail, /仍由你决定/);
});

test('agent run presentation maps candidate search and confirmation stages', () => {
  const searching = agentRunPresentation([
    entry({ toolName: 'search_candidates_for_demand', toolStatus: 'executing' }),
  ], 0);
  assert.equal(searching.activity, 'searching');
  assert.equal(searching.stage, 1);
  assert.equal(searching.steps[0].label, '筛选真实候选');
  assert.equal(searching.steps[0].state, 'running');

  const confirmation = agentRunPresentation([
    entry({ kind: 'tool_proposal', toolName: 'generate_demand_card', toolStatus: 'awaiting_confirmation' }),
  ], 0);
  assert.equal(confirmation.stage, 2);
  assert.match(confirmation.title, /等待你确认/);
});

test('Agent timeline only renders trusted semantic surfaces and never raw state projections', () => {
  assert.equal(agentEntryCanRender(entry({ kind: 'message', content: '真实回复' })), true);
  assert.equal(
    agentEntryCanRender(entry({ kind: 'tool_result', toolName: 'search_people', toolStatus: 'completed' })),
    true,
  );
  assert.equal(agentEntryCanRender(entry({ kind: 'guided_collection', content: 'raw projection' })), false);
  assert.equal(
    agentEntryCanRender(entry({ kind: 'tool_result', toolName: 'untrusted_html_surface' })),
    false,
  );
});

test('streaming and active tool markers only follow authoritative entry state', () => {
  assert.equal(agentEntryIsStreaming(entry({ kind: 'message', payload: { live: true } })), true);
  assert.equal(agentEntryIsStreaming(entry({ kind: 'message', payload: { live: false } })), false);
  assert.equal(agentToolIsActive('executing'), true);
  assert.equal(agentToolIsActive('completed'), false);
});

test('live events cannot cross the active Agent thread boundary', () => {
  assert.equal(agentLiveEventBelongsToThread({
    activeThreadId: 'thread-1',
    expectedThreadId: 'thread-1',
    eventThreadId: 'thread-1',
  }), true);
  assert.equal(agentLiveEventBelongsToThread({
    activeThreadId: 'thread-2',
    expectedThreadId: 'thread-1',
    eventThreadId: 'thread-1',
  }), false);
  assert.equal(agentLiveEventBelongsToThread({
    activeThreadId: 'thread-1',
    expectedThreadId: 'thread-1',
    eventThreadId: 'thread-2',
  }), false);
});
