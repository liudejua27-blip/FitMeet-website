import type {
  AgentInboxEvent,
  ConversationMessage,
  FeedPost,
  FitMeetConnectionRequest,
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
