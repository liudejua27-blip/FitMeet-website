import assert from 'node:assert/strict';
import test from 'node:test';
import { FitMeetApiClient, FitMeetApiError } from '../lib/fitmeet-api-client.ts';

const baseUrl = 'https://contract.fitmeet.test/api';

function response(data = { ok: true }, status = 200) {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function recordRequests(run, responder = () => response()) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const call = { url: String(input), init };
    calls.push(call);
    return responder(call, calls.length - 1);
  };
  try {
    await run(new FitMeetApiClient(() => 'contract-token', baseUrl));
    return calls;
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function body(call) {
  return call.init.body ? JSON.parse(String(call.init.body)) : undefined;
}

function assertAuthorized(call) {
  assert.equal(call.init.cache, 'no-store');
  assert.equal(call.init.headers.Authorization, 'Bearer contract-token');
  assert.equal(call.init.headers['Content-Type'], 'application/json');
}

test('relationship writes preserve paths, explicit confirmation payloads and idempotency', async () => {
  const calls = await recordRequests(async (api) => {
    await api.createConnectionRequest(42, '想先聊聊共同兴趣', 'candidate-9');
    await api.acceptConnectionRequest(11);
    await api.rejectConnectionRequest(12);
    await api.cancelConnectionRequest(13);
    await api.deleteFriend(42);
  });

  assert.deepEqual(
    calls.map((call) => [call.init.method, call.url.replace(baseUrl, '')]),
    [
      ['POST', '/connections/requests'],
      ['POST', '/connections/requests/11/accept'],
      ['POST', '/connections/requests/12/reject'],
      ['POST', '/connections/requests/13/cancel'],
      ['DELETE', '/friends/42'],
    ],
  );
  assert.deepEqual(body(calls[0]), {
    targetUserId: 42,
    message: '想先聊聊共同兴趣',
    contextType: 'agent_candidate',
    contextId: 'candidate-9',
  });
  assert.match(calls[0].init.headers['Idempotency-Key'], /^web-connection-42-/);
  assert.match(calls[1].init.headers['Idempotency-Key'], /^web-connection-accept-11-/);
  assert.match(calls[2].init.headers['Idempotency-Key'], /^web-connection-reject-12-/);
  assert.match(calls[3].init.headers['Idempotency-Key'], /^web-connection-cancel-13-/);
  calls.forEach(assertAuthorized);
});

test('conversation lifecycle uses a formal start contract and retry-stable clientMessageId', async () => {
  const calls = await recordRequests(async (api) => {
    await api.startConversation(42, 'demand', 'demand-7');
    await api.sendConversationMessage('conversation/a', '第一条消息', 'client-stable-1');
    await api.sendConversationMessage('conversation/a', '第一条消息', 'client-stable-1');
    await api.markConversationDelivered('conversation/a', 'message-1');
    await api.markConversationRead('conversation/a', 'message-1');
    await api.recallConversationMessage('message/1');
    await api.reportConversationMessage('message/2', 'harassment', '持续发送冒犯内容');
    await api.updateConversationSettings('conversation/a', {
      notificationLevel: 'muted',
      mutedUntil: '2026-08-01T00:00:00.000Z',
    });
  });

  assert.equal(calls[0].url, `${baseUrl}/messages/start`);
  assert.deepEqual(body(calls[0]), {
    targetUserId: 42,
    contextType: 'demand',
    contextId: 'demand-7',
  });
  assert.equal(
    calls[0].init.headers['Idempotency-Key'],
    'web-conversation-start-42-demand-demand-7',
  );

  for (const call of calls.slice(1, 3)) {
    assert.equal(call.url, `${baseUrl}/messages/conversations/conversation%2Fa/send`);
    assert.deepEqual(body(call), { text: '第一条消息', clientMessageId: 'client-stable-1' });
    assert.equal(call.init.headers['Idempotency-Key'], 'client-stable-1');
  }
  assert.equal(calls[3].url, `${baseUrl}/messages/conversations/conversation%2Fa/delivered`);
  assert.deepEqual(body(calls[3]), { lastDeliveredMessageId: 'message-1' });
  assert.equal(calls[4].url, `${baseUrl}/messages/conversations/conversation%2Fa/read`);
  assert.deepEqual(body(calls[4]), { lastReadMessageId: 'message-1' });
  assert.equal(calls[5].url, `${baseUrl}/messages/message%2F1/recall`);
  assert.deepEqual(body(calls[6]), {
    reason: 'harassment',
    details: '持续发送冒犯内容',
  });
  assert.deepEqual(body(calls[7]), {
    notificationLevel: 'muted',
    mutedUntil: '2026-08-01T00:00:00.000Z',
  });
  assert.equal(Object.hasOwn(body(calls[7]), 'archived'), false);
});

test('feed, notification and safety calls stay separate and server-authoritative', async () => {
  const calls = await recordRequests(async (api) => {
    await api.likeFeedPost(7);
    await api.unlikeFeedPost(7);
    await api.createFeedComment(7, '愿意参加');
    await api.reportFeedComment(7, 8, 'harassment');
    await api.acknowledgeAgentInboxEvents(['event-a', 'event-b']);
    await api.listSafetyReports();
    await api.listBlockedUsers();
    await api.reportSafety({
      targetUserId: 42,
      targetType: 'user',
      targetId: 42,
      reason: 'harassment',
      description: '多次骚扰',
    });
    await api.blockUser(42);
    await api.unblockUser(42);
  });

  assert.deepEqual(
    calls.map((call) => [call.init.method, call.url.replace(baseUrl, '')]),
    [
      ['POST', '/feed/posts/7/likes'],
      ['DELETE', '/feed/posts/7/likes'],
      ['POST', '/feed/posts/7/comments'],
      ['POST', '/feed/posts/7/comments/8/reports'],
      ['POST', '/agent-inbox/events/ack'],
      ['GET', '/safety/reports'],
      ['GET', '/safety/blocks'],
      ['POST', '/safety/reports'],
      ['POST', '/safety/blocks/42'],
      ['DELETE', '/safety/blocks/42'],
    ],
  );
  assert.deepEqual(body(calls[2]), { body: '愿意参加' });
  assert.deepEqual(body(calls[3]), {
    reason: 'harassment',
    description: '网页端用户举报动态评论',
  });
  assert.deepEqual(body(calls[4]), { ids: ['event-a', 'event-b'] });
  assert.deepEqual(body(calls[7]), {
    targetUserId: 42,
    targetType: 'user',
    targetId: 42,
    reason: 'harassment',
    description: '多次骚扰',
  });
});

test('server block list is normalized for shared Web profile state', async () => {
  let blockedUsers;
  const calls = await recordRequests(
    async (api) => {
      blockedUsers = await api.listBlockedUsers();
    },
    () =>
      new Response(
        JSON.stringify({
          items: [
            {
              blockedUserId: 42,
              user: { id: 42, name: '林川', avatar: null, city: '青岛', status: 'active' },
              reason: 'user_block',
              createdAt: '2026-07-29T01:00:00.000Z',
            },
          ],
          total: 1,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
  );

  assert.deepEqual(blockedUsers, [
    {
      id: 42,
      name: '林川',
      avatar: null,
      city: '青岛',
      reason: 'user_block',
      blockedAt: '2026-07-29T01:00:00.000Z',
    },
  ]);
  assert.equal(calls[0].url, `${baseUrl}/safety/blocks`);
  assertAuthorized(calls[0]);
});

test('API errors expose authoritative status, code and details instead of fake success', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        code: 'RELATIONSHIP_REQUIRED',
        message: '双方尚未成为好友',
        details: { targetUserId: 42 },
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );
  try {
    const api = new FitMeetApiClient(() => 'contract-token', baseUrl);
    await assert.rejects(
      () => api.startConversation(42),
      (error) => {
        assert.ok(error instanceof FitMeetApiError);
        assert.equal(error.status, 409);
        assert.equal(error.code, 'RELATIONSHIP_REQUIRED');
        assert.deepEqual(error.details, { targetUserId: 42 });
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('formal web authentication uses same-origin routes and never returns refresh tokens to storage', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    calls.push({ url: String(input), init });
    if (String(input).endsWith('/sms/send')) return response({ message: '验证码已发送' });
    if (String(input).endsWith('/sms/verify'))
      return response({ accessToken: 'web-access-token', user: { id: 7, name: '正式用户' } });
    if (String(input).endsWith('/refresh'))
      return response({ accessToken: 'rotated-access-token', user: { id: 7, name: '正式用户' } });
    return response({ status: 'logged_out' });
  };

  try {
    const api = new FitMeetApiClient(() => null, baseUrl);
    const sent = await api.sendWebSmsCode('13800138000');
    const loggedIn = await api.loginWebByPhone('13800138000', '2468');
    const refreshed = await api.refreshWebSession();
    await api.logoutWebSession();

    assert.equal(sent.message, '验证码已发送');
    assert.equal(loggedIn.accessToken, 'web-access-token');
    assert.equal(loggedIn.refreshToken, undefined);
    assert.equal(refreshed.accessToken, 'rotated-access-token');
    assert.deepEqual(
      calls.map((call) => [call.init.method, call.url]),
      [
        ['POST', '/api/auth/sms/send'],
        ['POST', '/api/auth/sms/verify'],
        ['POST', '/api/auth/refresh'],
        ['POST', '/api/auth/logout'],
      ],
    );
    assert.deepEqual(body(calls[0]), { phone: '13800138000' });
    assert.deepEqual(body(calls[1]), { phone: '13800138000', code: '2468' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
