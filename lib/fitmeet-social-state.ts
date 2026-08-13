import type {
  AgentInboxEvent,
  ConversationMessage,
  FeedPost,
  FitMeetConnectionRequest,
  FitMeetConversation,
  PublicUserProfile,
  RelationshipState,
} from './fitmeet-api-contract';

export type RelationshipSnapshot = {
  state: RelationshipState;
  direction: 'incoming' | 'outgoing' | null;
  request: FitMeetConnectionRequest | null;
};

export function relationshipSnapshot(args: {
  userId: number;
  friends: PublicUserProfile[];
  incoming: FitMeetConnectionRequest[];
  outgoing: FitMeetConnectionRequest[];
  serverRelationship?: RelationshipState;
}): RelationshipSnapshot {
  const { userId, friends, incoming, outgoing, serverRelationship } = args;
  if (serverRelationship === 'blocked') return { state: 'blocked', direction: null, request: null };
  if (friends.some((item) => Number(item.id) === Number(userId)))
    return { state: 'friends', direction: null, request: null };
  const incomingRequest = incoming.find(
    (item) => item.status === 'pending' && Number(item.requesterId) === Number(userId),
  );
  if (incomingRequest) return { state: 'pending', direction: 'incoming', request: incomingRequest };
  const outgoingRequest = outgoing.find(
    (item) => item.status === 'pending' && Number(item.targetUserId) === Number(userId),
  );
  if (outgoingRequest) return { state: 'pending', direction: 'outgoing', request: outgoingRequest };
  if (serverRelationship === 'friends' || serverRelationship === 'pending')
    return { state: serverRelationship, direction: null, request: null };
  return { state: 'none', direction: null, request: null };
}

export function optimisticMessage(
  text: string,
  clientMessageId: string,
  createdAt = new Date().toISOString(),
): ConversationMessage {
  return {
    id: clientMessageId,
    clientMessageId,
    role: 'user',
    text,
    createdAt,
    localStatus: 'sending',
    status: 'sending',
  };
}

export function settleOptimisticMessage(
  items: ConversationMessage[],
  clientMessageId: string,
  server: ConversationMessage,
): ConversationMessage[] {
  return items.map((item) =>
    item.clientMessageId === clientMessageId || item.id === clientMessageId
      ? { ...server, clientMessageId, localStatus: undefined }
      : item,
  );
}

export function failOptimisticMessage(
  items: ConversationMessage[],
  clientMessageId: string,
): ConversationMessage[] {
  return items.map((item) =>
    item.clientMessageId === clientMessageId || item.id === clientMessageId
      ? { ...item, localStatus: 'failed', status: 'failed' }
      : item,
  );
}

export function firstUnreadPeerMessageIndex(
  messages: ConversationMessage[],
  unreadCount: number | undefined,
): number {
  let remaining = Math.max(0, Number(unreadCount || 0));
  let firstUnreadIndex = -1;
  for (let index = messages.length - 1; index >= 0 && remaining > 0; index -= 1) {
    if (messages[index]?.role === 'peer') {
      firstUnreadIndex = index;
      remaining -= 1;
    }
  }
  return firstUnreadIndex;
}

export function dedupeInboxEvents(events: AgentInboxEvent[]): AgentInboxEvent[] {
  const seen = new Set<string>();
  return events.filter((event) => {
    const key = event.id || `${event.type}:${JSON.stringify(event.payload ?? {})}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

type ConversationWithRelatedUser = FitMeetConversation & {
  relatedUserId?: number | string | null;
};

type ConversationSnapshot = {
  item: FitMeetConversation;
  sourceIndex: number;
  updatedAt: number;
};

function conversationTimestamp(conversation: FitMeetConversation): number {
  const value = conversation.updatedAt || conversation.time;
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function conversationIdentity(conversation: FitMeetConversation): string {
  const isGroup =
    conversation.isGroup === true || conversation.contextType?.toLocaleLowerCase() === 'group';
  if (isGroup) return `group:${conversation.conversationId || conversation.id}`;

  const related = conversation as ConversationWithRelatedUser;
  const peerId = related.relatedUserId ?? conversation.userId ?? conversation.peer?.id;
  if (peerId !== undefined && peerId !== null && String(peerId).trim()) {
    return `user:${String(peerId).trim()}`;
  }
  return `conversation:${conversation.conversationId || conversation.id}`;
}

function mergeConversationSnapshots(
  newest: FitMeetConversation,
  older: FitMeetConversation,
): FitMeetConversation {
  return {
    ...older,
    ...newest,
    conversationId: newest.conversationId || older.conversationId,
    contextType: newest.contextType || older.contextType,
    contextId: newest.contextId || older.contextId,
    displayName: newest.displayName || older.displayName,
    username: newest.username || older.username,
    title: newest.title || older.title,
    lastMessage: newest.lastMessage || older.lastMessage,
    avatar: newest.avatar || older.avatar,
    peer: newest.peer || older.peer,
    unread: Math.max(Number(newest.unread || 0), Number(older.unread || 0)),
  };
}

/**
 * Produces the canonical inbox used by both the message home and the desktop
 * conversation rail. A direct peer or group is represented once, using the
 * newest server snapshot while retaining useful metadata from older snapshots.
 */
export function dedupeAndSortConversations(
  conversations: FitMeetConversation[],
): FitMeetConversation[] {
  const snapshots = new Map<string, ConversationSnapshot>();
  conversations.forEach((item, sourceIndex) => {
    const key = conversationIdentity(item);
    const updatedAt = conversationTimestamp(item);
    const current = snapshots.get(key);
    if (!current) {
      snapshots.set(key, { item, sourceIndex, updatedAt });
      return;
    }

    const incomingIsNewer = updatedAt > current.updatedAt;
    snapshots.set(key, {
      item: incomingIsNewer
        ? mergeConversationSnapshots(item, current.item)
        : mergeConversationSnapshots(current.item, item),
      sourceIndex: Math.min(current.sourceIndex, sourceIndex),
      updatedAt: Math.max(current.updatedAt, updatedAt),
    });
  });

  return [...snapshots.values()]
    .sort((left, right) => right.updatedAt - left.updatedAt || left.sourceIndex - right.sourceIndex)
    .map(({ item }) => item);
}

function validDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function sameLocalDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function localDayDistance(earlier: Date, later: Date): number {
  const earlierDay = new Date(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
  const laterDay = new Date(later.getFullYear(), later.getMonth(), later.getDate());
  return Math.round((laterDay.getTime() - earlierDay.getTime()) / 86_400_000);
}

export function formatInboxTimestamp(
  value: string | null | undefined,
  now = new Date(),
): string {
  if (!value) return '';
  const date = validDate(value);
  if (!date) return value;
  if (sameLocalDay(date, now)) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  if (localDayDistance(date, now) === 1) return '昨天';
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatMessageClock(value: string | null | undefined): string {
  const date = validDate(value);
  if (!date) return '';
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function conversationDateLabel(date: Date, now: Date): string {
  if (sameLocalDay(date, now)) return '今天';
  if (localDayDistance(date, now) === 1) return '昨天';
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function messageDateSeparatorLabel(
  value: string | null | undefined,
  previousValue?: string | null,
  now = new Date(),
): string | null {
  const date = validDate(value);
  if (!date) return null;
  const previousDate = validDate(previousValue);
  if (previousDate && sameLocalDay(date, previousDate)) return null;
  return conversationDateLabel(date, now);
}

export function conversationRequestIsCurrent({
  expectedConversationId,
  activeConversationId,
  requestGeneration,
  currentGeneration,
}: {
  expectedConversationId: string;
  activeConversationId: string | null | undefined;
  requestGeneration: number;
  currentGeneration: number;
}) {
  return (
    Boolean(expectedConversationId) &&
    activeConversationId === expectedConversationId &&
    requestGeneration === currentGeneration
  );
}

export function conversationMessageGroupPresentation(
  messages: ConversationMessage[],
  index: number,
) {
  const current = messages[index];
  const next = messages[index + 1];
  const currentDate = validDate(current?.createdAt);
  const nextDate = validDate(next?.createdAt);
  const continuesGroup = Boolean(
    current &&
      next &&
      current.role === next.role &&
      currentDate &&
      nextDate &&
      sameLocalDay(currentDate, nextDate),
  );
  const isTransient =
    current?.localStatus === 'sending' ||
    current?.localStatus === 'failed' ||
    current?.lifecycleStatus === 'recalled' ||
    Boolean(current?.recalledAt);
  return {
    groupedWithNext: continuesGroup,
    showPeerAvatar: current?.role === 'peer' && !continuesGroup,
    showDeliveryStatus: current?.role === 'user' && (!continuesGroup || isTransient),
    showPeerTimestamp: current?.role === 'peer' && !continuesGroup,
  };
}

export function shouldSubmitMessageFromKeyboard(event: {
  key: string;
  shiftKey?: boolean;
  isComposing?: boolean;
  keyCode?: number;
}): boolean {
  return (
    event.key === 'Enter' &&
    !event.shiftKey &&
    !event.isComposing &&
    event.keyCode !== 229
  );
}

export function optimisticLikeState(posts: FeedPost[], likedIds: number[], postId: number) {
  const wasLiked = likedIds.includes(postId);
  return {
    wasLiked,
    likedIds: wasLiked
      ? likedIds.filter((id) => id !== postId)
      : Array.from(new Set([...likedIds, postId])),
    posts: posts.map((post) =>
      post.id === postId ? { ...post, likes: Math.max(0, post.likes + (wasLiked ? -1 : 1)) } : post,
    ),
  };
}
