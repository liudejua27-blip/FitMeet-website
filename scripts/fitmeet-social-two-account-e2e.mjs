import assert from "node:assert/strict";

const baseUrl = (process.env.FITMEET_E2E_API_BASE_URL || "https://api.fitmeet.cn/api").replace(/\/$/, "");
const tokenA = process.env.FITMEET_E2E_TOKEN_A;
const tokenB = process.env.FITMEET_E2E_TOKEN_B;
const userA = Number(process.env.FITMEET_E2E_USER_A);
const userB = Number(process.env.FITMEET_E2E_USER_B);

assert.equal(process.env.FITMEET_E2E_CONFIRM_WRITES, "YES", "Set FITMEET_E2E_CONFIRM_WRITES=YES to acknowledge that this test writes friendship and message state.");
assert.ok(tokenA && tokenB && userA && userB, "Provide two real test tokens and their numeric user IDs.");
assert.notEqual(userA, userB, "The two test accounts must be different.");

async function request(token, method, path, body, idempotencyKey) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const envelope = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${path} failed (${response.status}): ${JSON.stringify(envelope)}`);
  return envelope.data ?? envelope;
}

const runId = `web-social-e2e-${Date.now()}`;
const outgoing = await request(tokenA, "POST", "/connections/requests", {
  targetUserId: userB,
  message: `双账号验收 ${runId}`,
  contextType: "web_e2e",
  contextId: runId,
}, `${runId}-friend`);

const inbox = await request(tokenB, "GET", "/connections/requests?box=inbox&status=pending");
const incoming = inbox.find((item) => Number(item.requesterId) === userA && (item.id === outgoing.id || item.message?.includes(runId)));
assert.ok(incoming, "B must see A's pending friend request.");

await request(tokenB, "POST", `/connections/requests/${incoming.id}/accept`, {}, `${runId}-accept`);
const [friendsA, friendsB] = await Promise.all([
  request(tokenA, "GET", "/friends"),
  request(tokenB, "GET", "/friends"),
]);
assert.ok((friendsA.data ?? friendsA).some((item) => Number(item.id) === userB), "A must see B as a friend.");
assert.ok((friendsB.data ?? friendsB).some((item) => Number(item.id) === userA), "B must see A as a friend.");

const conversation = await request(tokenA, "POST", "/messages/start", { targetUserId: userB, contextType: "web_e2e", contextId: runId }, `${runId}-conversation`);
const conversationId = conversation.id || conversation.conversationId;
assert.ok(conversationId, "The server must return a formal conversationId before chat opens.");

const clientMessageId = `${runId}-message`;
const sent = await request(tokenA, "POST", `/messages/conversations/${encodeURIComponent(conversationId)}/send`, { text: `消息生命周期验收 ${runId}`, clientMessageId }, clientMessageId);
assert.equal(sent.clientMessageId, clientMessageId, "The server must preserve the retry-stable clientMessageId.");

const threadB = await request(tokenB, "GET", `/messages/conversations/${encodeURIComponent(conversationId)}`);
const received = threadB.find((item) => item.id === sent.id || item.clientMessageId === clientMessageId);
assert.ok(received, "B must receive A's message in the same conversation.");
await request(tokenB, "POST", `/messages/conversations/${encodeURIComponent(conversationId)}/delivered`, { lastDeliveredMessageId: received.id }, `${runId}-delivered`);
await request(tokenB, "POST", `/messages/conversations/${encodeURIComponent(conversationId)}/read`, { lastReadMessageId: received.id }, `${runId}-read`);
await request(tokenA, "POST", `/messages/${encodeURIComponent(sent.id)}/recall`, {}, `${runId}-recall`);

const finalThread = await request(tokenB, "GET", `/messages/conversations/${encodeURIComponent(conversationId)}`);
const recalled = finalThread.find((item) => item.id === sent.id || item.clientMessageId === clientMessageId);
assert.ok(recalled?.recalledAt || recalled?.lifecycleStatus === "recalled", "The recalled state must survive a fresh server read.");

console.log(JSON.stringify({ ok: true, runId, conversationId, checks: ["friend-request", "mutual-friend-state", "formal-conversation", "stable-client-message-id", "delivery", "read", "recall"] }, null, 2));
