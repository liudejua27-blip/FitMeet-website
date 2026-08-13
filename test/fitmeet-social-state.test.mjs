import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dedupeAndSortConversations,
  dedupeInboxEvents,
  conversationMessageGroupPresentation,
  conversationRequestIsCurrent,
  failOptimisticMessage,
  formatInboxTimestamp,
  formatMessageClock,
  firstUnreadPeerMessageIndex,
  messageDateSeparatorLabel,
  optimisticMessage,
  optimisticLikeState,
  relationshipSnapshot,
  settleOptimisticMessage,
  shouldSubmitMessageFromKeyboard,
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

test('unread positioning counts peer messages without treating my replies as unread', () => {
  const messages = [
    { id: '1', role: 'peer', text: 'old', createdAt: '2026-01-01T00:00:00Z' },
    { id: '2', role: 'user', text: 'reply', createdAt: '2026-01-01T00:00:01Z' },
    { id: '3', role: 'peer', text: 'unread one', createdAt: '2026-01-01T00:00:02Z' },
    { id: '4', role: 'user', text: 'local reply', createdAt: '2026-01-01T00:00:03Z' },
    { id: '5', role: 'peer', text: 'unread two', createdAt: '2026-01-01T00:00:04Z' },
  ];
  assert.equal(firstUnreadPeerMessageIndex(messages, 2), 2);
  assert.equal(firstUnreadPeerMessageIndex(messages, 0), -1);
  assert.equal(firstUnreadPeerMessageIndex(messages, 9), 0);
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

test('conversations are deduplicated by peer or group and sorted by latest activity', () => {
  const conversations = [
    {
      id: 'direct-old',
      relatedUserId: 8,
      displayName: '小林',
      avatar: 'https://example.com/lin.png',
      lastMessage: '旧消息',
      unread: 3,
      updatedAt: '2026-08-08T10:00:00Z',
    },
    {
      id: 'group-old',
      conversationId: 'group-3',
      isGroup: true,
      title: '周末羽毛球',
      updatedAt: '2026-08-07T10:00:00Z',
    },
    {
      id: 'direct-new',
      userId: 8,
      displayName: '小林',
      lastMessage: '最新消息',
      unread: 1,
      updatedAt: '2026-08-09T12:00:00Z',
    },
    {
      id: 'group-new',
      conversationId: 'group-3',
      contextType: 'group',
      title: '周末羽毛球',
      lastMessage: '集合地点已确认',
      updatedAt: '2026-08-09T11:00:00Z',
    },
  ];

  const result = dedupeAndSortConversations(conversations);
  assert.deepEqual(
    result.map((item) => item.id),
    ['direct-new', 'group-new'],
  );
  assert.equal(result[0].lastMessage, '最新消息');
  assert.equal(result[0].avatar, 'https://example.com/lin.png');
  assert.equal(result[0].unread, 3);
});

test('message timestamps use compact inbox and stable date separator labels', () => {
  const now = new Date(2026, 7, 9, 18, 0, 0);
  assert.equal(formatInboxTimestamp(new Date(2026, 7, 9, 9, 5).toISOString(), now), '09:05');
  assert.equal(formatInboxTimestamp(new Date(2026, 7, 8, 23, 30).toISOString(), now), '昨天');
  assert.equal(formatInboxTimestamp(new Date(2026, 6, 20, 12, 0).toISOString(), now), '7月20日');
  assert.equal(formatInboxTimestamp('刚刚', now), '刚刚');
  assert.equal(formatMessageClock(new Date(2026, 7, 9, 9, 5).toISOString()), '09:05');
  assert.equal(formatMessageClock('not-a-date'), '');
  assert.equal(
    messageDateSeparatorLabel(new Date(2026, 7, 9, 9, 5).toISOString(), undefined, now),
    '今天',
  );
  assert.equal(
    messageDateSeparatorLabel(
      new Date(2026, 7, 9, 10, 0).toISOString(),
      new Date(2026, 7, 9, 9, 5).toISOString(),
      now,
    ),
    null,
  );
  assert.equal(
    messageDateSeparatorLabel(
      new Date(2026, 7, 8, 10, 0).toISOString(),
      new Date(2026, 7, 7, 18, 0).toISOString(),
      now,
    ),
    '昨天',
  );
});

test('enter submits only outside Chinese IME composition and shift-newline', () => {
  assert.equal(shouldSubmitMessageFromKeyboard({ key: 'Enter' }), true);
  assert.equal(shouldSubmitMessageFromKeyboard({ key: 'Enter', isComposing: true }), false);
  assert.equal(shouldSubmitMessageFromKeyboard({ key: 'Enter', keyCode: 229 }), false);
  assert.equal(shouldSubmitMessageFromKeyboard({ key: 'Enter', shiftKey: true }), false);
  assert.equal(shouldSubmitMessageFromKeyboard({ key: 'a' }), false);
});

test('conversation responses cannot settle into a different or newer conversation request', () => {
  assert.equal(
    conversationRequestIsCurrent({
      expectedConversationId: 'conversation-a',
      activeConversationId: 'conversation-a',
      requestGeneration: 3,
      currentGeneration: 3,
    }),
    true,
  );
  assert.equal(
    conversationRequestIsCurrent({
      expectedConversationId: 'conversation-a',
      activeConversationId: 'conversation-b',
      requestGeneration: 3,
      currentGeneration: 3,
    }),
    false,
  );
  assert.equal(
    conversationRequestIsCurrent({
      expectedConversationId: 'conversation-a',
      activeConversationId: 'conversation-a',
      requestGeneration: 2,
      currentGeneration: 3,
    }),
    false,
  );
});

test('message groups show one peer avatar and one delivery receipt per adjacent group', () => {
  const messages = [
    { id: '1', role: 'peer', text: '第一条', createdAt: '2026-08-09T10:00:00Z' },
    { id: '2', role: 'peer', text: '第二条', createdAt: '2026-08-09T10:00:10Z' },
    { id: '3', role: 'user', text: '回复一', createdAt: '2026-08-09T10:01:00Z' },
    { id: '4', role: 'user', text: '回复二', createdAt: '2026-08-09T10:01:10Z' },
  ];
  assert.deepEqual(conversationMessageGroupPresentation(messages, 0), {
    groupedWithNext: true,
    showPeerAvatar: false,
    showDeliveryStatus: false,
    showPeerTimestamp: false,
  });
  assert.equal(conversationMessageGroupPresentation(messages, 1).showPeerAvatar, true);
  assert.equal(conversationMessageGroupPresentation(messages, 2).showDeliveryStatus, false);
  assert.equal(conversationMessageGroupPresentation(messages, 3).showDeliveryStatus, true);
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
