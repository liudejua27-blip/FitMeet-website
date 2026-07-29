import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { FitMeetApiClient, FitMeetApiError } from '../lib/fitmeet-api-client.ts';
import { fitMeetRegistrationConsentFromExplicitChoice } from '../lib/fitmeet-registration-consent.ts';

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

test('multiplayer groups keep creation, join, approval, leave and cancellation as explicit writes', async () => {
  const calls = await recordRequests(async (api) => {
    await api.listGroups('mine');
    await api.listGroups('discover');
    await api.getGroup('group/a');
    await api.createGroup({
      demandId: 'demand-7',
      joinMode: 'request',
      capacityMin: 3,
      capacityMax: 6,
    });
    await api.joinGroup('group/a');
    await api.resolveGroupRequest('group/a', 19, 'approve');
    await api.createGroupPoll('group/a', {
      type: 'time',
      question: '哪天见面？',
      options: ['周六下午', '周日下午'],
    });
    await api.voteGroupPoll('group/a', 'poll/1', 'option/2');
    await api.finalizeGroupPoll('group/a', 'poll/1', 'option/2');
    await api.updateGroupCheckIn('group/a', 'arrived');
    await api.updateGroupMemberRole('group/a', 19, 'cohost');
    await api.removeGroupMember('group/a', 20, '本次不再参加');
    await api.updateGroupChatMode('group/a', 'admins_only');
    await api.leaveGroup('group/a');
    await api.cancelGroup('group/a', '时间有变');
  });

  assert.deepEqual(
    calls.map((call) => [call.init.method, call.url.replace(baseUrl, '')]),
    [
      ['GET', '/groups?scope=mine'],
      ['GET', '/groups?scope=discover'],
      ['GET', '/groups/group%2Fa'],
      ['POST', '/groups'],
      ['POST', '/groups/group%2Fa/join'],
      ['POST', '/groups/group%2Fa/requests/19/approve'],
      ['POST', '/groups/group%2Fa/polls'],
      ['POST', '/groups/group%2Fa/polls/poll%2F1/vote'],
      ['POST', '/groups/group%2Fa/polls/poll%2F1/finalize'],
      ['POST', '/groups/group%2Fa/check-in'],
      ['POST', '/groups/group%2Fa/members/19/role'],
      ['POST', '/groups/group%2Fa/members/20/remove'],
      ['POST', '/groups/group%2Fa/chat-mode'],
      ['POST', '/groups/group%2Fa/leave'],
      ['POST', '/groups/group%2Fa/cancel'],
    ],
  );
  assert.deepEqual(body(calls[3]), {
    demandId: 'demand-7',
    joinMode: 'request',
    capacityMin: 3,
    capacityMax: 6,
  });
  assert.deepEqual(body(calls[4]), {});
  assert.deepEqual(body(calls[5]), {});
  assert.deepEqual(body(calls[6]), {
    type: 'time',
    question: '哪天见面？',
    options: ['周六下午', '周日下午'],
  });
  assert.deepEqual(body(calls[7]), { optionId: 'option/2' });
  assert.deepEqual(body(calls[8]), { optionId: 'option/2' });
  assert.deepEqual(body(calls[9]), { status: 'arrived' });
  assert.deepEqual(body(calls[10]), { role: 'cohost' });
  assert.deepEqual(body(calls[11]), { reason: '本次不再参加' });
  assert.deepEqual(body(calls[12]), { chatMode: 'admins_only' });
  assert.deepEqual(body(calls[13]), {});
  assert.deepEqual(body(calls[14]), { reason: '时间有变' });
  assert.match(calls[3].init.headers['Idempotency-Key'], /^web-group-create-demand-7-/);
  assert.match(calls[4].init.headers['Idempotency-Key'], /^web-group-join-group\/a-/);
  assert.match(calls[5].init.headers['Idempotency-Key'], /^web-group-request-group\/a-19-approve-/);
  assert.match(calls[6].init.headers['Idempotency-Key'], /^web-group-poll-create-group\/a-time-/);
  assert.match(calls[8].init.headers['Idempotency-Key'], /^web-group-poll-finalize-group\/a-poll\/1-/);
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

test('memory decisions target the exact proposal and unwrap the server mutation envelope', async () => {
  let confirmed;
  let rejected;
  const calls = await recordRequests(
    async (api) => {
      confirmed = await api.confirmAgentMemory('memory/proposal-1', 2);
      rejected = await api.rejectAgentMemory('memory/proposal-2', 3);
      await api.deleteAgentMemory('memory/proposal-3', 4);
    },
    (_call, index) => response({
      status: index === 0 ? 'confirmed' : 'rejected',
      item: {
        id: index === 0 ? 'memory/proposal-1' : 'memory/proposal-2',
        memoryType: 'social_preference',
        status: index === 0 ? 'confirmed' : 'rejected',
      },
    }),
  );

  assert.deepEqual(
    calls.map((call) => [call.init.method, call.url.replace(baseUrl, '')]),
    [
      ['POST', '/users/me/agent-memory/confirm'],
      ['POST', '/users/me/agent-memory/reject'],
      ['DELETE', '/users/me/agent-memory/memory%2Fproposal-3'],
    ],
  );
  assert.deepEqual(body(calls[0]), {
    memoryId: 'memory/proposal-1',
    action: 'confirm_memory',
    expectedRevision: 2,
  });
  assert.deepEqual(body(calls[1]), { memoryId: 'memory/proposal-2', expectedRevision: 3 });
  assert.deepEqual(body(calls[2]), { expectedRevision: 4 });
  assert.equal(confirmed.id, 'memory/proposal-1');
  assert.equal(confirmed.status, 'confirmed');
  assert.equal(rejected.id, 'memory/proposal-2');
  assert.equal(rejected.status, 'rejected');
});

test('memory control keeps scope, usage and suppression writes owner-scoped and explicit', async () => {
  const controls = {
    inferenceEnabled: true,
    suppressions: [{ memoryType: 'location_preference', createdAt: '2026-07-29T00:00:00.000Z' }],
  };
  let confirmed;
  let updated;
  let usage;
  const calls = await recordRequests(
    async (api) => {
      await api.getAgentMemoryControl();
      await api.updateAgentMemoryControl(false);
      confirmed = await api.confirmAgentMemory('memory/1', 3, 'agent_only', true);
      updated = await api.updateAgentMemory('memory/1', {
        useScope: 'matching_only',
        expectedRevision: 4,
        explicitSensitiveConsent: true,
      });
      usage = await api.listAgentMemoryUsage('memory/1', 'cursor/1', 99);
      await api.suppressAgentMemory('memory/1', 5);
      await api.removeAgentMemorySuppression('location_preference');
    },
    (_call, index) => {
      if (index <= 1 || index === 6) return response(controls);
      if (index === 2)
        return response({
          status: 'confirmed',
          item: { id: 'memory/1', memoryType: 'location_preference', status: 'confirmed', useScope: 'agent_only', revision: 4 },
        });
      if (index === 3)
        return response({
          status: 'confirmed',
          item: { id: 'memory/1', memoryType: 'location_preference', status: 'confirmed', useScope: 'matching_only', revision: 5 },
        });
      if (index === 4)
        return response({
          items: [{ id: 'usage-1', memoryId: 'memory/1', purpose: 'matching', createdAt: '2026-07-29T00:00:00.000Z' }],
          nextCursor: null,
          total: 1,
        });
      return response({
        status: 'suppressed',
        item: { id: 'memory/1', memoryType: 'location_preference', status: 'deleted' },
        control: controls,
      });
    },
  );

  assert.deepEqual(
    calls.map((call) => [call.init.method, call.url.replace(baseUrl, '')]),
    [
      ['GET', '/users/me/agent-memory/control'],
      ['PATCH', '/users/me/agent-memory/control'],
      ['POST', '/users/me/agent-memory/confirm'],
      ['PATCH', '/users/me/agent-memory/memory%2F1'],
      ['GET', '/users/me/agent-memory/memory%2F1/usage?limit=40&cursor=cursor%2F1'],
      ['POST', '/users/me/agent-memory/memory%2F1/suppress'],
      ['DELETE', '/users/me/agent-memory/suppressions/location_preference'],
    ],
  );
  assert.deepEqual(body(calls[1]), { inferenceEnabled: false });
  assert.deepEqual(body(calls[2]), {
    memoryId: 'memory/1',
    action: 'confirm_memory',
    expectedRevision: 3,
    useScope: 'agent_only',
    explicitSensitiveConsent: true,
  });
  assert.deepEqual(body(calls[3]), {
    useScope: 'matching_only',
    expectedRevision: 4,
    explicitSensitiveConsent: true,
  });
  assert.deepEqual(body(calls[5]), { expectedRevision: 5 });
  assert.equal(confirmed.useScope, 'agent_only');
  assert.equal(updated.revision, 5);
  assert.equal(usage.items[0].purpose, 'matching');
});

test('global search sends one authenticated permission-filtered query contract', async () => {
  let result;
  const calls = await recordRequests(
    async (api) => {
      result = await api.search('  羽毛球 %_  ', ['agent_thread', 'message', 'friend', 'group'], 99);
    },
    () => response({
      query: '羽毛球 %_',
      items: [
        {
          id: 'thread-1',
          type: 'agent_thread',
          title: '周末羽毛球',
          path: '/agent/try/chat/thread-1',
        },
      ],
      counts: { agent_threads: 1, messages: 0, friends: 0, groups: 0 },
    }),
  );

  assert.equal(calls.length, 1);
  assertAuthorized(calls[0]);
  assert.equal(calls[0].init.method, 'GET');
  const url = new URL(calls[0].url);
  assert.equal(url.pathname, '/api/search');
  assert.equal(url.searchParams.get('q'), '羽毛球 %_');
  assert.equal(url.searchParams.get('types'), 'agent_threads,messages,friends,groups');
  assert.equal(url.searchParams.get('limit'), '40');
  assert.equal(result.items[0].id, 'thread-1');
});

test('feed, notification and safety calls stay separate and server-authoritative', async () => {
  const calls = await recordRequests(async (api) => {
    await api.likeFeedPost(7);
    await api.unlikeFeedPost(7);
    await api.createFeedComment(7, '愿意参加');
    await api.reportFeedComment(7, 8, 'harassment');
    await api.getAgentInboxEvents(30, 'cursor/older', 'all');
    await api.acknowledgeAgentInboxEvents(['event-a', 'event-b']);
    await api.acknowledgeAllAgentInboxEvents();
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
      ['GET', '/agent-inbox/events?limit=30&scope=all&cursor=cursor%2Folder'],
      ['POST', '/agent-inbox/events/ack'],
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
  assert.deepEqual(body(calls[5]), { ids: ['event-a', 'event-b'] });
  assert.deepEqual(body(calls[6]), { all: true });
  assert.deepEqual(body(calls[9]), {
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

test('formal web email authentication uses same-origin routes and never returns refresh tokens to storage', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    calls.push({ url: String(input), init });
    if (String(input).endsWith('/api/auth/login'))
      return response({ accessToken: 'web-access-token', user: { id: 7, name: '正式用户' } });
    if (String(input).endsWith('/api/auth/register'))
      return response({
        status: 'verification_required',
        emailVerificationRequired: true,
        emailVerificationDelivery: 'sent',
      }, 202);
    if (String(input).endsWith('/api/auth/email/verify'))
      return response({ status: 'verified' });
    if (String(input).endsWith('/api/auth/email/verification/resend'))
      return response({ status: 'accepted' }, 202);
    if (String(input).endsWith('/api/auth/password/forgot'))
      return response({ status: 'accepted' }, 202);
    if (String(input).endsWith('/api/auth/password/reset'))
      return response({ status: 'password_reset', sessionsRevoked: true });
    if (String(input).endsWith('/refresh'))
      return response({ accessToken: 'rotated-access-token', user: { id: 7, name: '正式用户' } });
    return response({ status: 'logged_out' });
  };

  try {
    const api = new FitMeetApiClient(() => null, baseUrl);
    const loggedIn = await api.loginWebByEmail('hello@example.com', 'secure-password');
    const registrationConsent = fitMeetRegistrationConsentFromExplicitChoice(
      true,
      new Date('2026-07-29T10:11:12.123Z'),
    );
    assert.ok(registrationConsent);
    const registered = await api.registerWebByEmail(
      'new@example.com',
      'new-password',
      '新用户',
      registrationConsent,
    );
    await api.verifyWebEmail('v'.repeat(43));
    await api.resendWebEmailVerification('new@example.com');
    await api.requestWebPasswordReset('new@example.com');
    await api.resetWebPassword('r'.repeat(43), 'newer-password');
    const refreshed = await api.refreshWebSession();
    await api.logoutWebSession();

    assert.equal(loggedIn.accessToken, 'web-access-token');
    assert.equal(loggedIn.refreshToken, undefined);
    assert.equal(registered.status, 'verification_required');
    assert.equal(registered.emailVerificationRequired, true);
    assert.equal(Object.hasOwn(registered, 'accessToken'), false);
    assert.equal(Object.hasOwn(registered, 'refreshToken'), false);
    assert.equal(refreshed.accessToken, 'rotated-access-token');
    assert.deepEqual(
      calls.map((call) => [call.init.method, call.url]),
      [
        ['POST', '/api/auth/login'],
        ['POST', '/api/auth/register'],
        ['POST', '/api/auth/email/verify'],
        ['POST', '/api/auth/email/verification/resend'],
        ['POST', '/api/auth/password/forgot'],
        ['POST', '/api/auth/password/reset'],
        ['POST', '/api/auth/refresh'],
        ['POST', '/api/auth/logout'],
      ],
    );
    assert.deepEqual(body(calls[0]), { email: 'hello@example.com', password: 'secure-password' });
    assert.deepEqual(body(calls[1]), {
      email: 'new@example.com',
      password: 'new-password',
      name: '新用户',
      consents: {
        termsVersion: '1.0',
        privacyVersion: '1.0',
        termsAccepted: true,
        privacyAccepted: true,
        acceptedAt: '2026-07-29T10:11:12.123Z',
      },
    });
    assert.deepEqual(body(calls[2]), { token: 'v'.repeat(43) });
    assert.deepEqual(body(calls[3]), { email: 'new@example.com' });
    assert.deepEqual(body(calls[4]), { email: 'new@example.com' });
    assert.deepEqual(body(calls[5]), { token: 'r'.repeat(43), password: 'newer-password' });
    for (const call of calls.slice(0, 6)) {
      assert.equal(call.init.cache, 'no-store');
      assert.doesNotMatch(call.url, /token=/);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('formal web logout does not hide an upstream revocation failure', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => response({ message: '登录状态尚未安全撤销。' }, 503);
  try {
    const api = new FitMeetApiClient(() => null, baseUrl);
    await assert.rejects(() => api.logoutWebSession(), /退出暂未完成/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('web auth proxy carries platform context and clears cookies only after safe logout outcomes', async () => {
  const [serverAuth, emailAuthServer, loginRoute, registerRoute, refreshRoute, logoutRoute, sessionHook] = await Promise.all([
    fs.readFile(new URL('../lib/fitmeet-web-auth-server.ts', import.meta.url), 'utf8'),
    fs.readFile(new URL('../lib/fitmeet-email-auth-server.ts', import.meta.url), 'utf8'),
    fs.readFile(new URL('../app/api/auth/login/route.ts', import.meta.url), 'utf8'),
    fs.readFile(new URL('../app/api/auth/register/route.ts', import.meta.url), 'utf8'),
    fs.readFile(new URL('../app/api/auth/refresh/route.ts', import.meta.url), 'utf8'),
    fs.readFile(new URL('../app/api/auth/logout/route.ts', import.meta.url), 'utf8'),
    fs.readFile(new URL('../components/fitmeet-app/useFitMeetSession.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(serverAuth, /'X-FitMeet-Platform': 'web'/);
  assert.match(serverAuth, /'X-FitMeet-App-Version'/);
  assert.match(emailAuthServer, /fitMeetWebClientHeaders\(\)/);
  assert.match(emailAuthServer, /withoutRefreshToken\(payload\)/);
  assert.match(emailAuthServer, /FITMEET_WEB_REFRESH_COOKIE/);
  assert.match(loginRoute, /action: 'login'/);
  assert.match(registerRoute, /action: 'register'/);
  assert.match(registerRoute, /validateFitMeetRegistrationConsent\(consents\)/);
  assert.match(registerRoute, /consents: consent\.value/);
  assert.match(refreshRoute, /fitMeetWebClientHeaders\(\)/);
  assert.match(logoutRoute, /fitMeetServerApiBase\(\)\}\/auth\/logout/);
  assert.match(logoutRoute, /response\.ok \|\| response\.status === 401/);
  assert.match(logoutRoute, /登录状态尚未安全撤销/);
  assert.doesNotMatch(logoutRoute, /\[401, 403\]/);
  assert.match(refreshRoute, /if \(response\.status === 401\)/);
  assert.match(refreshRoute, /暂时无法确认登录状态/);
  assert.match(sessionHook, /pendingWebSessionRefresh/);
  assert.match(sessionHook, /refreshWebSessionOnce\(api\)/);
});
