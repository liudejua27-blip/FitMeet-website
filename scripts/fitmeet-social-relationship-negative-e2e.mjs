import assert from 'node:assert/strict';

const baseUrl = (process.env.FITMEET_E2E_API_BASE_URL || 'https://api.fitmeet.cn/api').replace(
  /\/$/,
  '',
);
const tokenA = process.env.FITMEET_E2E_TOKEN_A;
const tokenB = process.env.FITMEET_E2E_TOKEN_B;
const userA = Number(process.env.FITMEET_E2E_USER_A);
const userB = Number(process.env.FITMEET_E2E_USER_B);
const mode = process.env.FITMEET_E2E_NEGATIVE_MODE;

assert.equal(
  process.env.FITMEET_E2E_CONFIRM_WRITES,
  'YES',
  'Set FITMEET_E2E_CONFIRM_WRITES=YES to acknowledge that this test writes relationship state.',
);
assert.ok(tokenA && tokenB && userA && userB, 'Provide two real test tokens and numeric user IDs.');
assert.notEqual(userA, userB, 'The two test accounts must be different.');
assert.ok(
  mode === 'cancel' || mode === 'reject',
  'Set FITMEET_E2E_NEGATIVE_MODE=cancel or reject.',
);

async function rawRequest(token, method, path, body, idempotencyKey) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const envelope = await response.json().catch(() => ({}));
  return { response, envelope, data: envelope.data ?? envelope };
}

async function request(token, method, path, body, idempotencyKey) {
  const result = await rawRequest(token, method, path, body, idempotencyKey);
  if (!result.response.ok) {
    throw new Error(
      `${method} ${path} failed (${result.response.status}): ${JSON.stringify(result.envelope)}`,
    );
  }
  return result.data;
}

function items(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

const existingFriends = await Promise.all([
  request(tokenA, 'GET', '/friends'),
  request(tokenB, 'GET', '/friends'),
]);
assert.equal(
  items(existingFriends[0]).some((item) => Number(item.id) === userB),
  false,
  'A and B must start as non-friends. Use reset disposable accounts.',
);
assert.equal(
  items(existingFriends[1]).some((item) => Number(item.id) === userA),
  false,
  'A and B must start as non-friends. Use reset disposable accounts.',
);

const runId = `web-social-negative-${mode}-${Date.now()}`;
const outgoing = await request(
  tokenA,
  'POST',
  '/connections/requests',
  {
    targetUserId: userB,
    message: `${mode === 'cancel' ? '撤回' : '婉拒'}路径验收 ${runId}`,
    contextType: 'web_e2e',
    contextId: runId,
  },
  `${runId}-friend`,
);

const inbox = items(await request(tokenB, 'GET', '/connections/requests?box=inbox&status=pending'));
const incoming = inbox.find(
  (item) =>
    Number(item.requesterId) === userA &&
    (String(item.id) === String(outgoing.id) || item.message?.includes(runId)),
);
assert.ok(incoming, "B must see A's pending request before the negative action.");

if (mode === 'cancel') {
  await request(
    tokenA,
    'POST',
    `/connections/requests/${encodeURIComponent(outgoing.id || incoming.id)}/cancel`,
    {},
    `${runId}-cancel`,
  );
} else {
  await request(
    tokenB,
    'POST',
    `/connections/requests/${encodeURIComponent(incoming.id)}/reject`,
    {},
    `${runId}-reject`,
  );
}

const [freshFriendsA, freshFriendsB, freshInbox, freshOutbox] = await Promise.all([
  request(tokenA, 'GET', '/friends'),
  request(tokenB, 'GET', '/friends'),
  request(tokenB, 'GET', '/connections/requests?box=inbox&status=pending'),
  request(tokenA, 'GET', '/connections/requests?box=outbox&status=pending'),
]);
assert.equal(
  items(freshFriendsA).some((item) => Number(item.id) === userB),
  false,
  `${mode} must not make B appear in A's friend list.`,
);
assert.equal(
  items(freshFriendsB).some((item) => Number(item.id) === userA),
  false,
  `${mode} must not make A appear in B's friend list.`,
);
assert.equal(
  items(freshInbox).some((item) => String(item.id) === String(incoming.id)),
  false,
  'The request must leave the pending inbox.',
);
assert.equal(
  items(freshOutbox).some((item) => String(item.id) === String(incoming.id)),
  false,
  'The request must leave the pending outbox.',
);

const forbiddenConversation = await rawRequest(
  tokenA,
  'POST',
  '/messages/start',
  { targetUserId: userB, contextType: 'web_e2e_negative', contextId: runId },
  `${runId}-forbidden-conversation`,
);
assert.equal(
  forbiddenConversation.response.ok,
  false,
  `${mode} must not return a formal conversation for non-friends.`,
);
assert.ok(
  [400, 403, 409].includes(forbiddenConversation.response.status),
  `Expected an authorization/business-rule denial, got ${forbiddenConversation.response.status}.`,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      mode,
      runId,
      denialStatus: forbiddenConversation.response.status,
      checks: [
        'pending-request-visible',
        `${mode}-server-confirmed`,
        'not-friends-after-action',
        'pending-request-removed',
        'conversation-not-opened',
      ],
    },
    null,
    2,
  ),
);
