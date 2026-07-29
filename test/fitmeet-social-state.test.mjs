import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dedupeInboxEvents,
  failOptimisticMessage,
  optimisticMessage,
  optimisticLikeState,
  relationshipSnapshot,
  settleOptimisticMessage,
} from '../lib/fitmeet-social-state.ts';

test('relationship state prioritizes block and distinguishes request direction', () => {
  const base = { userId: 8, friends: [], incoming: [], outgoing: [] };
  assert.deepEqual(relationshipSnapshot(base), { state: 'none', direction: null, request: null });
  const outgoing = { id: 1, requesterId: 3, targetUserId: 8, status: 'pending', message: 'hi' };
  assert.equal(relationshipSnapshot({ ...base, outgoing: [outgoing] }).direction, 'outgoing');
  assert.equal(relationshipSnapshot({ ...base, friends: [{ id: 8, name: 'A' }] }).state, 'friends');
  assert.equal(
    relationshipSnapshot({
      ...base,
      friends: [{ id: 8, name: 'A' }],
      serverRelationship: 'blocked',
    }).state,
    'blocked',
  );
});

test('optimistic messages settle or remain retryable after failure', () => {
  const pending = optimisticMessage('你好', 'client-1', '2026-01-01T00:00:00Z');
  assert.equal(pending.localStatus, 'sending');
  const failed = failOptimisticMessage([pending], 'client-1');
  assert.equal(failed[0].localStatus, 'failed');
  const settled = settleOptimisticMessage(failed, 'client-1', {
    id: 'server-1',
    role: 'user',
    text: '你好',
    createdAt: '2026-01-01T00:00:01Z',
    status: 'sent',
  });
  assert.equal(settled[0].id, 'server-1');
  assert.equal(settled[0].localStatus, undefined);
});

test('notification events are deduplicated without reordering', () => {
  const events = [
    { id: 'a', type: 'connection', title: 'A' },
    { id: 'a', type: 'connection', title: 'A duplicate' },
    { id: 'b', type: 'message', title: 'B' },
  ];
  assert.deepEqual(
    dedupeInboxEvents(events).map((item) => item.id),
    ['a', 'b'],
  );
});

test('likes update optimistically without mutating the previous server snapshot', () => {
  const post = {
    id: 9,
    userId: 2,
    username: 'A',
    text: 'hello',
    tags: [],
    likes: 4,
    comments: 0,
    images: [],
    createdAt: '2026-01-01T00:00:00Z',
  };
  const liked = optimisticLikeState([post], [], 9);
  assert.deepEqual(liked.likedIds, [9]);
  assert.equal(liked.posts[0].likes, 5);
  assert.equal(post.likes, 4);
  const unliked = optimisticLikeState(liked.posts, liked.likedIds, 9);
  assert.deepEqual(unliked.likedIds, []);
  assert.equal(unliked.posts[0].likes, 4);
});
