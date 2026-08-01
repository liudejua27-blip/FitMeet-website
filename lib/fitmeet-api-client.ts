import {
  FITMEET_API_BASE_URL,
  fitMeetPaths,
  type AgentCompletionResponse,
  type AgentThread,
  type AgentThreadDetail,
  type AgentThreadEntry,
  type AgentThreadTurn,
  type AgentInboxEventPage,
  type AgentInboxScope,
  type AuthSession,
  type EmailActionResult,
  type EmailRegistrationPending,
  type Conversation,
  type ConversationMessage,
  type DemandCandidateBehavior,
  type DemandDraftSession,
  type FitMeetConnectionRequest,
  type FeedPage,
  type FeedPost,
  type FeedComment,
  type FeedCommentPage,
  type FitMeetAgentMemory,
  type AgentMemoryControl,
  type AgentMemoryMutation,
  type AgentMemorySuppressionMutation,
  type AgentMemoryUsagePage,
  type AgentMemoryUseScope,
  type FitMeetConversation,
  type FitMeetAppConfig,
  type FitMeetConversationHistoryPage,
  type FitMeetConversationMessage,
  type FitMeetDemand,
  type FitMeetDemandCandidate,
  type FitMeetGroup,
  type FitMeetGroupAttendanceStatus,
  type FitMeetGroupChatMode,
  type FitMeetGroupMember,
  type FitMeetGroupMemberRole,
  type FitMeetGroupPoll,
  type FitMeetGroupPollType,
  type CreateFitMeetGroupPayload,
  type FitMeetIntentApplication,
  type FitMeetNotificationPreferences,
  type FitMeetProfilePhoto,
  type FitMeetPublicIntent,
  type FitMeetUploadImage,
  type FitMeetSearchResponse,
  type FitMeetSearchType,
  type UserAdvantage,
  type UserVerification,
  type PublicUserProfile,
  type MeetInvitation,
  type MeetInvitationDraft,
  type MeetInvitationRole,
  type MeetInvitationStatus,
  type MeetReviewPayload,
  type OnboardingPayload,
  type OnboardingStatus,
  type RawAuthSession,
  type RequestOptions,
  type SafetyBlockListResponse,
  type SafetyReportListResponse,
  type SafetyReportPayload,
  type SocialProfile,
} from './fitmeet-api-contract.ts';
import type { FitMeetRegistrationConsent } from './fitmeet-registration-consent.ts';

type ApiErrorPayload = { code?: string; message?: string; details?: unknown };

export class FitMeetApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'FitMeetApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload)
    return (payload as { data: T }).data;
  return payload as T;
}

export function normalizeAuthSession(payload: RawAuthSession): AuthSession {
  const accessToken = payload.accessToken ?? payload.access_token;
  if (!accessToken) throw new Error('登录响应缺少访问凭证。');
  return {
    accessToken,
    refreshToken: payload.refreshToken ?? payload.refresh_token,
    user: payload.user,
    requiresPhoneVerification:
      payload.phoneVerificationRequired ?? payload.phone_verification_required,
  };
}

function textArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function normalizeSocialProfile(payload: unknown): SocialProfile {
  const source = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const directInterests = textArray(source.interests);
  const taggedInterests = textArray(source.interestTags);
  return {
    nickname:
      typeof source.nickname === 'string'
        ? source.nickname
        : typeof source.name === 'string'
          ? source.name
          : '',
    city: typeof source.city === 'string' ? source.city : '',
    bio: typeof source.bio === 'string' ? source.bio : '',
    interests: directInterests.length
      ? directInterests
      : taggedInterests.length
        ? taggedInterests
        : textArray(source.interest_tags),
    distanceKm:
      typeof source.distanceKm === 'number'
        ? source.distanceKm
        : typeof source.distance_km === 'number'
          ? source.distance_km
          : 5,
    profileDiscoverable:
      typeof source.profileDiscoverable === 'boolean'
        ? source.profileDiscoverable
        : source.profile_discoverable !== false,
    agentCanRecommendMe:
      typeof source.agentCanRecommendMe === 'boolean'
        ? source.agentCanRecommendMe
        : source.agent_can_recommend_me !== false,
    agentCanStartChatAfterApproval:
      source.agentCanStartChatAfterApproval === true ||
      source.agent_can_start_chat_after_approval === true,
    hideSensitiveTags:
      typeof source.hideSensitiveTags === 'boolean'
        ? source.hideSensitiveTags
        : source.hide_sensitive_tags !== false,
  };
}

export class FitMeetApiClient {
  private readonly getToken: () => string | null;
  private readonly baseUrl: string;

  constructor(getToken: () => string | null, baseUrl = FITMEET_API_BASE_URL) {
    this.getToken = getToken;
    this.baseUrl = baseUrl;
  }

  getAppConfig() {
    return this.request<FitMeetAppConfig>({
      method: 'GET',
      path: fitMeetPaths.appConfig,
    });
  }

  async request<T>({ method, path, body, idempotencyKey }: RequestOptions): Promise<T> {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      // Realtime events are only invalidation signals. Every reconciliation
      // must obtain an authorization-checked representation, not a browser
      // 304 response with no JSON body.
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === 'object' ? (payload as ApiErrorPayload) : {};
      throw new FitMeetApiError(
        error.message || error.code || `请求失败 (${response.status})`,
        response.status,
        error.code,
        error.details,
      );
    }
    return unwrap<T>(payload);
  }

  private async requestEnvelope<T>(path: string): Promise<T> {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === 'object' ? (payload as ApiErrorPayload) : {};
      throw new FitMeetApiError(
        error.message || error.code || `请求失败 (${response.status})`,
        response.status,
        error.code,
        error.details,
      );
    }
    return payload as T;
  }

  sendSmsCode(phone: string) {
    return this.request<{ message: string; expiresIn?: number }>({
      method: 'POST',
      path: fitMeetPaths.auth.sendSmsCode,
      body: { phone },
    });
  }

  async loginByPhone(phone: string, code: string) {
    return normalizeAuthSession(
      await this.request<RawAuthSession>({
        method: 'POST',
        path: fitMeetPaths.auth.phoneLogin,
        body: { phone, code },
      }),
    );
  }

  private async authenticateWebByEmail(
    path: '/api/auth/login',
    body: { email: string; password: string; name?: string },
    fallbackMessage: string,
  ) {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === 'object' ? (payload as ApiErrorPayload) : {};
      throw new FitMeetApiError(
        error.message || error.code || fallbackMessage,
        response.status,
        error.code,
        error.details,
      );
    }
    return normalizeAuthSession(unwrap<RawAuthSession>(payload));
  }

  loginWebByEmail(email: string, password: string) {
    return this.authenticateWebByEmail(
      '/api/auth/login',
      { email, password },
      '邮箱或密码错误。',
    );
  }

  registerWebByEmail(
    email: string,
    password: string,
    name: string,
    consents: FitMeetRegistrationConsent,
  ) {
    return this.publicWebEmailRequest<EmailRegistrationPending>(
      '/api/auth/register',
      { email, password, name, consents },
      '暂时无法创建账号，请稍后重试。',
    );
  }

  verifyWebEmail(token: string) {
    return this.publicWebEmailRequest<EmailActionResult>(
      '/api/auth/email/verify',
      { token },
      '邮箱验证暂时不可用，请稍后重试。',
    );
  }

  resendWebEmailVerification(email: string) {
    return this.publicWebEmailRequest<EmailActionResult>(
      '/api/auth/email/verification/resend',
      { email },
      '验证邮件暂时无法发送，请稍后重试。',
    );
  }

  requestWebPasswordReset(email: string) {
    return this.publicWebEmailRequest<EmailActionResult>(
      '/api/auth/password/forgot',
      { email },
      '如果该邮箱已注册，我们会向它发送密码重置邮件。',
    );
  }

  resetWebPassword(token: string, password: string) {
    return this.publicWebEmailRequest<EmailActionResult>(
      '/api/auth/password/reset',
      { token, password },
      '密码重置暂时不可用，请稍后重试。',
    );
  }

  private async publicWebEmailRequest<T>(
    path: string,
    body: Record<string, unknown>,
    fallbackMessage: string,
  ) {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === 'object' ? (payload as ApiErrorPayload) : {};
      throw new FitMeetApiError(
        error.message || error.code || fallbackMessage,
        response.status,
        error.code,
        error.details,
      );
    }
    return unwrap<T>(payload);
  }

  async refreshWebSession() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === 'object' ? (payload as ApiErrorPayload) : {};
      throw new Error(error.message || '登录已失效。');
    }
    return normalizeAuthSession(unwrap<RawAuthSession>(payload));
  }

  async logoutWebSession() {
    let response: Response;
    try {
      response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      });
    } catch {
      throw new Error('退出暂未完成，请稍后重试。');
    }
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === 'object' ? (payload as ApiErrorPayload) : {};
      throw new Error(error.message || '退出暂未完成，请稍后重试。');
    }
  }

  async refreshSession(refreshToken: string) {
    return normalizeAuthSession(
      await this.request<RawAuthSession>({
        method: 'POST',
        path: fitMeetPaths.auth.refresh,
        body: { refreshToken },
      }),
    );
  }

  getAuthProfile() {
    return this.request<AuthSession['user']>({ method: 'GET', path: fitMeetPaths.auth.profile });
  }
  getOnboardingStatus() {
    return this.request<OnboardingStatus>({
      method: 'GET',
      path: fitMeetPaths.users.onboardingStatus,
    });
  }

  completeOnboarding(payload: OnboardingPayload) {
    return this.request<OnboardingStatus>({
      method: 'POST',
      path: fitMeetPaths.users.onboardingComplete,
      body: payload,
      idempotencyKey: `web-onboarding-${crypto.randomUUID()}`,
    });
  }

  async getSocialProfile() {
    return normalizeSocialProfile(
      await this.request<unknown>({ method: 'GET', path: fitMeetPaths.users.socialProfile }),
    );
  }
  async updateSocialProfile(payload: Partial<SocialProfile>) {
    return normalizeSocialProfile(
      await this.request<unknown>({
        method: 'PUT',
        path: fitMeetPaths.users.socialProfile,
        body: payload,
        idempotencyKey: `web-profile-${crypto.randomUUID()}`,
      }),
    );
  }
  listProfilePhotos() {
    return this.request<FitMeetProfilePhoto[]>({
      method: 'GET',
      path: fitMeetPaths.users.profilePhotos,
    });
  }
  async uploadImage(file: File) {
    const token = this.getToken();
    const form = new FormData();
    form.append('file', file, file.name || 'fitmeet-profile.jpg');
    const response = await fetch(`${this.baseUrl}/uploads/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === 'object' ? (payload as ApiErrorPayload) : {};
      throw new Error(error.message || error.code || '照片上传失败。');
    }
    return unwrap<FitMeetUploadImage>(payload);
  }
  replaceProfilePhotos(photos: Array<{ assetId: number; sortOrder: number; isCover: boolean }>) {
    return this.request<FitMeetProfilePhoto[]>({
      method: 'PUT',
      path: fitMeetPaths.users.profilePhotos,
      body: { photos },
      idempotencyKey: `web-profile-photos-${crypto.randomUUID()}`,
    });
  }
  deleteProfilePhoto(id: number) {
    return this.request<{ id: number; status: string }>({
      method: 'DELETE',
      path: fitMeetPaths.users.profilePhoto(id),
    });
  }
  async listAdvantages() {
    const payload = await this.request<
      { items?: UserAdvantage[]; data?: UserAdvantage[] } | UserAdvantage[]
    >({ method: 'GET', path: fitMeetPaths.users.advantages });
    return Array.isArray(payload) ? payload : (payload.items ?? payload.data ?? []);
  }
  createAdvantage(payload: Pick<UserAdvantage, 'title'> & Partial<UserAdvantage>) {
    return this.request<UserAdvantage>({
      method: 'POST',
      path: fitMeetPaths.users.advantages,
      body: payload,
      idempotencyKey: `web-advantage-${crypto.randomUUID()}`,
    });
  }
  deleteAdvantage(id: string) {
    return this.request<{ id: string; status: string }>({
      method: 'DELETE',
      path: fitMeetPaths.users.advantage(id),
    });
  }
  async listVerifications() {
    const token = this.getToken();
    const response = await fetch('/api/fitmeet/verifications', {
      method: 'GET',
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === 'object' ? (payload as ApiErrorPayload) : {};
      throw new FitMeetApiError(
        error.message || '认证资料暂时无法同步。',
        response.status,
        error.code,
        error.details,
      );
    }
    const source = unwrap<{ items?: UserVerification[]; available?: boolean; message?: string }>(
      payload,
    );
    return {
      items: Array.isArray(source.items) ? source.items : [],
      available: source.available !== false,
      message: source.message,
    };
  }
  createVerification(payload: {
    title: string;
    verificationType?: string;
    evidenceAssetIds?: number[];
  }) {
    return this.request<UserVerification>({
      method: 'POST',
      path: fitMeetPaths.users.verifications,
      body: payload,
      idempotencyKey: `web-verification-${crypto.randomUUID()}`,
    });
  }
  deleteVerification(id: string) {
    return this.request<{ id: string; status: string }>({
      method: 'DELETE',
      path: fitMeetPaths.users.verification(id),
    });
  }
  exportAccountData() {
    return this.request<Record<string, unknown>>({
      method: 'GET',
      path: fitMeetPaths.users.accountExport,
    });
  }
  deleteAccount() {
    return this.request<{ id?: number; status: string; deletedAt?: string }>({
      method: 'DELETE',
      path: fitMeetPaths.users.account,
    });
  }

  async getFeed(page = 1, limit = 10) {
    const payload = await this.requestEnvelope<FeedPost[] | FeedPage>(
      `${fitMeetPaths.feed.posts}?category=log&page=${page}&limit=${limit}`,
    );
    return Array.isArray(payload) ? { data: payload } : payload;
  }
  getFeedPost(id: number) {
    return this.request<FeedPost>({ method: 'GET', path: fitMeetPaths.feed.post(id) });
  }
  async getFriendFeed(page = 1, limit = 10) {
    const payload = await this.requestEnvelope<FeedPost[] | FeedPage>(
      `${fitMeetPaths.feed.friends}?page=${page}&limit=${limit}`,
    );
    return Array.isArray(payload) ? { data: payload } : payload;
  }
  async listUserPosts(userId: number, page = 1, limit = 10) {
    const payload = await this.requestEnvelope<FeedPost[] | FeedPage>(
      `${fitMeetPaths.feed.userPosts(userId)}?page=${page}&limit=${limit}`,
    );
    return Array.isArray(payload) ? { data: payload } : payload;
  }
  createFeedPost(
    payload: Pick<FeedPost, 'title' | 'text' | 'tags'> & {
      city: string;
      visibility?: 'public' | 'private';
      images?: Array<{
        assetId: number;
        url: string;
        width?: number | null;
        height?: number | null;
      }>;
    },
  ) {
    const images = payload.images ?? [];
    return this.request<FeedPost>({
      method: 'POST',
      path: fitMeetPaths.feed.posts,
      body: {
        type: 'log',
        sport: '',
        ...payload,
        images,
        mediaAssetIds: images.map((image) => image.assetId),
        loc: '',
        visibility: payload.visibility ?? 'public',
      },
      idempotencyKey: `web-feed-${crypto.randomUUID()}`,
    });
  }
  likeFeedPost(id: number) {
    return this.request<{ postId: number; liked: boolean; likes: number }>({
      method: 'POST',
      path: fitMeetPaths.feed.likes(id),
      body: {},
      idempotencyKey: `web-like-${id}-${crypto.randomUUID()}`,
    });
  }
  unlikeFeedPost(id: number) {
    return this.request<{ postId: number; liked: boolean; likes: number }>({
      method: 'DELETE',
      path: fitMeetPaths.feed.likes(id),
    });
  }
  deleteFeedPost(id: number) {
    return this.request<void>({ method: 'DELETE', path: fitMeetPaths.feed.post(id) });
  }
  listFeedComments(postId: number, page = 1, limit = 30) {
    return this.request<FeedCommentPage>({
      method: 'GET',
      path: `${fitMeetPaths.feed.comments(postId)}?page=${page}&limit=${limit}`,
    });
  }
  createFeedComment(postId: number, body: string) {
    return this.request<FeedComment>({
      method: 'POST',
      path: fitMeetPaths.feed.comments(postId),
      body: { body },
      idempotencyKey: `web-feed-comment-${postId}-${crypto.randomUUID()}`,
    });
  }
  deleteFeedComment(postId: number, commentId: number) {
    return this.request<{ id: number; postId: number; status: string }>({
      method: 'DELETE',
      path: fitMeetPaths.feed.comment(postId, commentId),
    });
  }
  reportFeedComment(postId: number, commentId: number, reason = 'inappropriate_content') {
    return this.request<{ id: number; status: string }>({
      method: 'POST',
      path: fitMeetPaths.feed.commentReports(postId, commentId),
      body: { reason, description: '网页端用户举报动态评论' },
      idempotencyKey: `web-feed-comment-report-${postId}-${commentId}`,
    });
  }

  createInvitation(payload: MeetInvitationDraft) {
    return this.request<MeetInvitation>({
      method: 'POST',
      path: fitMeetPaths.invitations.root,
      body: payload,
      idempotencyKey: `web-invite-${crypto.randomUUID()}`,
    });
  }
  listMeetInvitations(role?: MeetInvitationRole, status?: MeetInvitationStatus) {
    const query = new URLSearchParams({
      ...(role ? { role: role === 'sender' ? 'sent' : 'received' } : {}),
      ...(status ? { status } : {}),
    });
    return this.request<MeetInvitation[]>({
      method: 'GET',
      path: `${fitMeetPaths.invitations.mine}${query.size ? `?${query}` : ''}`,
    });
  }
  acceptInvitation(id: number) {
    return this.request<{
      invitationId: number;
      status: MeetInvitationStatus;
      meetId?: number;
      conversation?: { id?: string; conversationId?: string; status?: string };
    }>({
      method: 'POST',
      path: fitMeetPaths.invitations.accept(id),
      body: {},
      idempotencyKey: `web-invite-accept-${id}-${crypto.randomUUID()}`,
    });
  }
  rejectInvitation(id: number) {
    return this.request<MeetInvitation>({
      method: 'POST',
      path: fitMeetPaths.invitations.reject(id),
      body: {},
      idempotencyKey: `web-invite-reject-${id}-${crypto.randomUUID()}`,
    });
  }
  cancelInvitation(id: number) {
    return this.request<MeetInvitation>({
      method: 'POST',
      path: fitMeetPaths.invitations.cancel(id),
      body: {},
      idempotencyKey: `web-invite-cancel-${id}-${crypto.randomUUID()}`,
    });
  }

  createDemand(payload: {
    type: string;
    title: string;
    summary: string;
    fields: Array<{
      title: string;
      value: string;
      importance?: 'required' | 'optional' | 'context';
    }>;
    visibility: 'hidden' | 'public';
    hallTarget?: string;
    category?: string;
    matchingPolicy?: {
      city?: string;
      radiusKm?: number;
      hardFilters?: string[];
      softPreferences?: string[];
    };
    capacityMax: number;
    capacityMin?: number;
    sourceConversationId?: string;
  }) {
    return this.request<FitMeetDemand>({
      method: 'POST',
      path: fitMeetPaths.demands.root,
      body: payload,
      idempotencyKey: `web-demand-${crypto.randomUUID()}`,
    });
  }
  async listMyDemands() {
    const payload = await this.request<FitMeetDemand[] | { data: FitMeetDemand[] }>({
      method: 'GET',
      path: fitMeetPaths.users.demands,
    });
    return Array.isArray(payload) ? { data: payload } : payload;
  }
  getDemand(id: string) {
    return this.request<FitMeetDemand>({ method: 'GET', path: fitMeetPaths.demands.detail(id) });
  }
  publishDemand(id: string, category?: string) {
    return this.request<FitMeetDemand>({
      method: 'POST',
      path: fitMeetPaths.demands.publish(id),
      body: { hallTarget: 'socialHall', ...(category ? { category } : {}) },
      idempotencyKey: `web-demand-publish-${id}-${crypto.randomUUID()}`,
    });
  }
  listDemandCandidates(id: string) {
    return this.request<{
      demand: FitMeetDemand;
      candidates: FitMeetDemandCandidate[];
      total: number;
    }>({ method: 'GET', path: `${fitMeetPaths.demands.candidates(id)}?limit=20` });
  }
  hideDemand(id: string) {
    return this.request<FitMeetDemand>({
      method: 'POST',
      path: fitMeetPaths.demands.hide(id),
      body: {},
      idempotencyKey: `web-demand-hide-${id}-${crypto.randomUUID()}`,
    });
  }
  cancelDemand(id: string, reason?: string) {
    return this.request<FitMeetDemand>({
      method: 'POST',
      path: fitMeetPaths.demands.cancel(id),
      body: { reason },
      idempotencyKey: `web-demand-cancel-${id}-${crypto.randomUUID()}`,
    });
  }
  listGroups(scope: 'mine' | 'discover' = 'mine') {
    return this.request<{ items: FitMeetGroup[]; total: number }>({
      method: 'GET',
      path: `${fitMeetPaths.groups.root}?scope=${scope}`,
    });
  }
  getGroup(id: string) {
    return this.request<FitMeetGroup>({ method: 'GET', path: fitMeetPaths.groups.detail(id) });
  }
  createGroup(payload: CreateFitMeetGroupPayload) {
    return this.request<FitMeetGroup>({
      method: 'POST',
      path: fitMeetPaths.groups.root,
      body: payload,
      idempotencyKey: `web-group-create-${payload.demandId}-${crypto.randomUUID()}`,
    });
  }
  joinGroup(id: string) {
    return this.request<{ group: FitMeetGroup; membership: FitMeetGroupMember }>({
      method: 'POST',
      path: fitMeetPaths.groups.join(id),
      body: {},
      idempotencyKey: `web-group-join-${id}-${crypto.randomUUID()}`,
    });
  }
  leaveGroup(id: string) {
    return this.request<{ group: FitMeetGroup; membership: FitMeetGroupMember }>({
      method: 'POST',
      path: fitMeetPaths.groups.leave(id),
      body: {},
      idempotencyKey: `web-group-leave-${id}-${crypto.randomUUID()}`,
    });
  }
  resolveGroupRequest(id: string, membershipId: number, decision: 'approve' | 'reject') {
    return this.request<{ group: FitMeetGroup; membership: FitMeetGroupMember }>({
      method: 'POST',
      path: fitMeetPaths.groups.resolveRequest(id, membershipId, decision),
      body: {},
      idempotencyKey: `web-group-request-${id}-${membershipId}-${decision}-${crypto.randomUUID()}`,
    });
  }
  cancelGroup(id: string, reason?: string) {
    return this.request<FitMeetGroup>({
      method: 'POST',
      path: fitMeetPaths.groups.cancel(id),
      body: { reason },
      idempotencyKey: `web-group-cancel-${id}-${crypto.randomUUID()}`,
    });
  }
  createGroupPoll(id: string, payload: { type: FitMeetGroupPollType; question: string; options: string[]; closesAt?: string | null }) {
    return this.request<{ group: FitMeetGroup; poll: FitMeetGroupPoll }>({
      method: 'POST',
      path: fitMeetPaths.groups.polls(id),
      body: payload,
      idempotencyKey: `web-group-poll-create-${id}-${payload.type}-${crypto.randomUUID()}`,
    });
  }
  voteGroupPoll(id: string, pollId: string, optionId: string) {
    return this.request<{ group: FitMeetGroup; poll: FitMeetGroupPoll }>({
      method: 'POST',
      path: fitMeetPaths.groups.vote(id, pollId),
      body: { optionId },
      idempotencyKey: `web-group-poll-vote-${id}-${pollId}-${crypto.randomUUID()}`,
    });
  }
  finalizeGroupPoll(id: string, pollId: string, optionId: string) {
    return this.request<{ group: FitMeetGroup; poll: FitMeetGroupPoll }>({
      method: 'POST',
      path: fitMeetPaths.groups.finalizePoll(id, pollId),
      body: { optionId },
      idempotencyKey: `web-group-poll-finalize-${id}-${pollId}-${crypto.randomUUID()}`,
    });
  }
  updateGroupCheckIn(id: string, status: Exclude<FitMeetGroupAttendanceStatus, 'none'>) {
    return this.request<{ group: FitMeetGroup; checkIn: { status: string } }>({
      method: 'POST',
      path: fitMeetPaths.groups.checkIn(id),
      body: { status },
      idempotencyKey: `web-group-check-in-${id}-${crypto.randomUUID()}`,
    });
  }
  updateGroupMemberRole(id: string, membershipId: number, role: Exclude<FitMeetGroupMemberRole, 'host'>) {
    return this.request<{ group: FitMeetGroup; membership: FitMeetGroupMember }>({
      method: 'POST',
      path: fitMeetPaths.groups.memberRole(id, membershipId),
      body: { role },
      idempotencyKey: `web-group-member-role-${id}-${membershipId}-${role}-${crypto.randomUUID()}`,
    });
  }
  removeGroupMember(id: string, membershipId: number, reason?: string) {
    return this.request<{ group: FitMeetGroup; membership: FitMeetGroupMember }>({
      method: 'POST',
      path: fitMeetPaths.groups.removeMember(id, membershipId),
      body: { reason },
      idempotencyKey: `web-group-member-remove-${id}-${membershipId}-${crypto.randomUUID()}`,
    });
  }
  updateGroupChatMode(id: string, chatMode: FitMeetGroupChatMode) {
    return this.request<FitMeetGroup>({
      method: 'POST',
      path: fitMeetPaths.groups.chatMode(id),
      body: { chatMode },
      idempotencyKey: `web-group-chat-mode-${id}-${chatMode}-${crypto.randomUUID()}`,
    });
  }
  recordDemandCandidateBehavior(
    demandId: string,
    candidateId: number,
    eventType: DemandCandidateBehavior,
  ) {
    const mapped =
      eventType === 'dismissed'
        ? 'candidate.dismissed'
        : eventType === 'saved'
          ? 'candidate.viewed'
          : eventType === 'invited'
            ? 'candidate.invited'
            : 'candidate.viewed';
    return this.request<{ status: string; candidate: FitMeetDemandCandidate }>({
      method: 'POST',
      path: fitMeetPaths.demands.candidateBehavior(demandId, candidateId),
      body: { eventType: mapped },
      idempotencyKey: `web-demand-candidate-${demandId}-${candidateId}-${eventType}-${crypto.randomUUID()}`,
    });
  }

  getActiveDemandDraftSession(sourceConversationId?: string) {
    const query = sourceConversationId
      ? `?sourceConversationId=${encodeURIComponent(sourceConversationId)}`
      : '';
    return this.request<{ session: DemandDraftSession | null }>({
      method: 'GET',
      path: `${fitMeetPaths.demandDraftSessions.active}${query}`,
    });
  }
  updateDemandDraftSession(id: string, payload: Partial<DemandDraftSession>) {
    return this.request<DemandDraftSession>({
      method: 'PATCH',
      path: fitMeetPaths.demandDraftSessions.update(id),
      body: payload,
      idempotencyKey: `web-demand-draft-${id}-${crypto.randomUUID()}`,
    });
  }
  cancelDemandDraftSession(id: string) {
    return this.request<DemandDraftSession>({
      method: 'POST',
      path: fitMeetPaths.demandDraftSessions.cancel(id),
      body: {},
      idempotencyKey: `web-demand-draft-cancel-${id}-${crypto.randomUUID()}`,
    });
  }

  async listAgentThreads() {
    const payload = await this.request<
      AgentThread[] | { items?: AgentThread[]; data?: AgentThread[] }
    >({ method: 'GET', path: fitMeetPaths.agentThreads.root });
    return Array.isArray(payload) ? { items: payload, data: payload } : payload;
  }
  search(
    query: string,
    types: FitMeetSearchType[] = ['agent_thread', 'message', 'friend', 'group'],
    limit = 20,
  ) {
    const params = new URLSearchParams({
      q: query.trim(),
      types: types
        .map((type) =>
          type === 'agent_thread'
            ? 'agent_threads'
            : type === 'message'
              ? 'messages'
              : type === 'friend'
                ? 'friends'
                : 'groups',
        )
        .join(','),
      limit: String(Math.max(1, Math.min(40, Math.round(limit)))),
    });
    return this.request<FitMeetSearchResponse>({
      method: 'GET',
      path: `${fitMeetPaths.search}?${params.toString()}`,
    });
  }
  createAgentThread(title?: string) {
    const clientThreadId = crypto.randomUUID();
    return this.request<{ thread: AgentThread; entries: AgentThreadEntry[] }>({
      method: 'POST',
      path: fitMeetPaths.agentThreads.root,
      body: { clientThreadId, ...(title ? { title } : {}) },
      idempotencyKey: `web-agent-thread-${clientThreadId}`,
    });
  }
  getAgentThread(id: string) {
    return this.request<AgentThreadDetail>({
      method: 'GET',
      path: fitMeetPaths.agentThreads.detail(id),
    });
  }
  sendAgentThreadTurn(id: string, content: string, clientTurnId = crypto.randomUUID()) {
    return this.request<AgentThreadTurn>({
      method: 'POST',
      path: fitMeetPaths.agentThreads.turns(id),
      body: { content, clientTurnId },
      idempotencyKey: `web-agent-turn-${clientTurnId}`,
    });
  }
  resolveAgentToolProposal(
    threadId: string,
    proposalId: string,
    decision: 'approve' | 'decline',
    argumentsPatch?: Record<string, unknown>,
  ) {
    return this.request<{ proposal: AgentThreadEntry; resolution: AgentThreadEntry }>({
      method: 'POST',
      path: fitMeetPaths.agentThreads.resolveProposal(threadId, proposalId),
      body: { decision, ...(argumentsPatch ? { arguments: argumentsPatch } : {}) },
      idempotencyKey: `web-agent-proposal-${proposalId}-${decision}`,
    });
  }
  deleteAgentThread(id: string) {
    return this.request<{ id: string; status: string }>({
      method: 'DELETE',
      path: fitMeetPaths.agentThreads.detail(id),
    });
  }
  getAgentInboxEvents(limit = 30, cursor?: string, scope: AgentInboxScope = 'unread') {
    const query = new URLSearchParams({ limit: String(limit), scope });
    if (cursor) query.set('cursor', cursor);
    return this.request<AgentInboxEventPage>({
      method: 'GET',
      path: `${fitMeetPaths.agentInbox.events}?${query.toString()}`,
    });
  }
  acknowledgeAgentInboxEvents(ids: string[]) {
    return this.request<{ acknowledged: string[]; acknowledgedCount: number; acknowledgedAll?: boolean }>({
      method: 'POST',
      path: fitMeetPaths.agentInbox.acknowledge,
      body: { ids },
    });
  }
  acknowledgeAllAgentInboxEvents() {
    return this.request<{ acknowledged: string[]; acknowledgedCount: number; acknowledgedAll: boolean }>({
      method: 'POST',
      path: fitMeetPaths.agentInbox.acknowledge,
      body: { all: true },
    });
  }

  createConnectionRequest(targetUserId: number, message: string, contextId = '') {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.relationships.requests,
      body: { targetUserId, message, contextType: 'agent_candidate', contextId },
      idempotencyKey: `web-connection-${targetUserId}-${crypto.randomUUID()}`,
    });
  }
  listConnectionRequests(box: 'inbox' | 'outbox', status = 'pending') {
    return this.request<FitMeetConnectionRequest[]>({
      method: 'GET',
      path: `${fitMeetPaths.relationships.requests}?box=${box}&status=${status}`,
    });
  }
  acceptConnectionRequest(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.relationships.accept(id),
      body: {},
      idempotencyKey: `web-connection-accept-${id}-${crypto.randomUUID()}`,
    });
  }
  rejectConnectionRequest(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.relationships.reject(id),
      body: {},
      idempotencyKey: `web-connection-reject-${id}-${crypto.randomUUID()}`,
    });
  }
  cancelConnectionRequest(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.relationships.cancel(id),
      body: {},
      idempotencyKey: `web-connection-cancel-${id}-${crypto.randomUUID()}`,
    });
  }
  deleteFriend(id: number) {
    return this.request({ method: 'DELETE', path: fitMeetPaths.relationships.friend(id) });
  }
  async listFriends() {
    const payload = await this.request<{ data?: PublicUserProfile[] } | PublicUserProfile[]>({
      method: 'GET',
      path: fitMeetPaths.relationships.friends,
    });
    return Array.isArray(payload) ? payload : (payload.data ?? []);
  }
  getRelationshipUser(id: number) {
    return this.request<PublicUserProfile>({
      method: 'GET',
      path: fitMeetPaths.relationships.user(id),
    });
  }

  createPublicIntentApplication(intentId: string, message: string) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.feed.socialIntentApplications(intentId),
      body: { message },
      idempotencyKey: `web-social-intent-${intentId}-${crypto.randomUUID()}`,
    });
  }
  createTaskIntentApplication(intentId: string, message: string) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.feed.taskIntentApplications(intentId),
      body: { message },
      idempotencyKey: `web-task-intent-${intentId}-${crypto.randomUUID()}`,
    });
  }
  listPublicSocialIntents() {
    return this.request<FitMeetPublicIntent[]>({
      method: 'GET',
      path: `${fitMeetPaths.feed.socialIntents}?page=1&limit=20`,
    });
  }
  listPublicTaskIntents() {
    return this.request<FitMeetPublicIntent[]>({
      method: 'GET',
      path: `${fitMeetPaths.feed.taskIntents}?page=1&limit=20`,
    });
  }
  listMyPublicIntentApplications(role?: 'owner' | 'applicant') {
    return this.request<FitMeetIntentApplication[]>({
      method: 'GET',
      path: `${fitMeetPaths.feed.publicIntentApplicationsMine}${role ? `?role=${role}` : ''}`,
    });
  }
  listMyTaskIntentApplications(role?: 'owner' | 'applicant') {
    return this.request<FitMeetIntentApplication[]>({
      method: 'GET',
      path: `${fitMeetPaths.feed.taskIntentApplicationsMine}${role ? `?role=${role}` : ''}`,
    });
  }
  cancelPublicIntentApplication(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.feed.cancelPublicIntentApplication(id),
      body: {},
      idempotencyKey: `web-social-intent-cancel-${id}-${crypto.randomUUID()}`,
    });
  }
  cancelTaskIntentApplication(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.feed.cancelTaskIntentApplication(id),
      body: {},
      idempotencyKey: `web-task-intent-cancel-${id}-${crypto.randomUUID()}`,
    });
  }
  acceptPublicIntentApplication(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.feed.acceptPublicIntentApplication(id),
      body: {},
      idempotencyKey: `web-social-intent-accept-${id}-${crypto.randomUUID()}`,
    });
  }
  rejectPublicIntentApplication(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.feed.rejectPublicIntentApplication(id),
      body: {},
      idempotencyKey: `web-social-intent-reject-${id}-${crypto.randomUUID()}`,
    });
  }
  acceptTaskIntentApplication(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.feed.acceptTaskIntentApplication(id),
      body: {},
      idempotencyKey: `web-task-intent-accept-${id}-${crypto.randomUUID()}`,
    });
  }
  rejectTaskIntentApplication(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.feed.rejectTaskIntentApplication(id),
      body: {},
      idempotencyKey: `web-task-intent-reject-${id}-${crypto.randomUUID()}`,
    });
  }

  confirmMeet(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.meets.confirm(id),
      body: {},
      idempotencyKey: `web-meet-confirm-${id}-${crypto.randomUUID()}`,
    });
  }
  cancelMeet(id: number, reason?: string) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.meets.cancel(id),
      body: { reason },
      idempotencyKey: `web-meet-cancel-${id}-${crypto.randomUUID()}`,
    });
  }
  completeMeet(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.meets.complete(id),
      body: {},
      idempotencyKey: `web-meet-complete-${id}-${crypto.randomUUID()}`,
    });
  }
  reportMeetNoShow(id: number, reason: string) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.meets.noShow(id),
      body: { reason },
      idempotencyKey: `web-meet-no-show-${id}-${crypto.randomUUID()}`,
    });
  }
  reviewMeet(id: number, payload: MeetReviewPayload) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.meets.reviews(id),
      body: payload,
      idempotencyKey: `web-meet-review-${id}-${crypto.randomUUID()}`,
    });
  }

  reportSafety(payload: SafetyReportPayload) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.safety.reports,
      body: payload,
      idempotencyKey: `web-safety-report-${crypto.randomUUID()}`,
    });
  }
  async listSafetyReports() {
    const payload = await this.request<SafetyReportListResponse>({
      method: 'GET',
      path: fitMeetPaths.safety.reports,
    });
    return payload.items ?? [];
  }
  getNotificationPreferences() {
    return this.request<FitMeetNotificationPreferences>({
      method: 'GET',
      path: fitMeetPaths.users.notificationPreferences,
    });
  }
  updateNotificationPreferences(
    payload: Pick<
      FitMeetNotificationPreferences,
      'directMessagesEnabled' | 'interactionsEnabled' | 'systemEnabled'
    >,
  ) {
    return this.request<FitMeetNotificationPreferences>({
      method: 'PUT',
      path: fitMeetPaths.users.notificationPreferences,
      body: payload,
    });
  }
  async listBlockedUsers() {
    const payload = await this.request<SafetyBlockListResponse>({
      method: 'GET',
      path: fitMeetPaths.safety.blocks,
    });
    return (payload.items ?? []).map((record) => ({
      id: record.blockedUserId,
      name: record.user.name || 'FitMeet 用户',
      avatar: record.user.avatar,
      city: record.user.city,
      reason: record.reason,
      blockedAt: record.createdAt || record.updatedAt || '',
    }));
  }
  blockUser(id: number) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.safety.block(id),
      body: {},
      idempotencyKey: `web-block-${id}-${crypto.randomUUID()}`,
    });
  }
  unblockUser(id: number) {
    return this.request({ method: 'DELETE', path: fitMeetPaths.safety.block(id) });
  }

  listConversations() {
    return this.request<FitMeetConversation[]>({
      method: 'GET',
      path: fitMeetPaths.messages.conversations,
    });
  }
  async listConversationsPage(cursor?: string, limit = 30) {
    const pageSize = Math.min(Math.max(limit, 1), 99);
    const query = new URLSearchParams({ limit: String(pageSize + 1) });
    if (cursor?.trim()) query.set('cursor', cursor.trim());
    const rows = await this.request<FitMeetConversation[]>({
      method: 'GET',
      path: `${fitMeetPaths.messages.conversations}?${query.toString()}`,
    });
    const hasNextPage = rows.length > pageSize;
    const items = rows.slice(0, pageSize);
    return {
      items,
      nextCursor: hasNextPage ? items.at(-1)?.updatedAt ?? null : null,
    };
  }
  startConversation(targetUserId: number, contextType = 'profile', contextId = '') {
    return this.request<FitMeetConversation>({
      method: 'POST',
      path: fitMeetPaths.messages.start,
      body: { targetUserId, contextType, contextId },
      idempotencyKey: `web-conversation-start-${targetUserId}-${contextType}-${contextId || 'direct'}`,
    });
  }
  async getConversationMessagesPage(
    id: string,
    before?: string,
    after?: string,
    limit = 50,
  ): Promise<FitMeetConversationHistoryPage> {
    const pageSize = Math.min(Math.max(limit, 1), 99);
    const query = new URLSearchParams({ limit: String(pageSize + 1) });
    if (before?.trim()) query.set('before', before.trim());
    if (after?.trim()) query.set('after', after.trim());
    const payload = await this.request<
      | FitMeetConversationMessage[]
      | { items?: FitMeetConversationMessage[]; data?: FitMeetConversationMessage[] }
    >({
      method: 'GET',
      path: `${fitMeetPaths.messages.thread(id)}?${query.toString()}`,
    });
    const rows = Array.isArray(payload) ? payload : payload.items ?? payload.data ?? [];
    const hasEarlierPage = rows.length > pageSize;
    const items = hasEarlierPage ? rows.slice(-pageSize) : rows;
    return {
      items,
      nextBefore: hasEarlierPage ? items[0]?.createdAt ?? null : null,
    };
  }
  getConversation(id: string) {
    return this.getConversationMessagesPage(id).then((page) => page.items);
  }
  sendConversationMessage(
    id: string,
    text: string,
    clientMessageId = `web-message-${crypto.randomUUID()}`,
  ) {
    return this.request<FitMeetConversationMessage>({
      method: 'POST',
      path: fitMeetPaths.messages.send(id),
      body: { text, clientMessageId },
      idempotencyKey: clientMessageId,
    });
  }
  markConversationRead(id: string, lastReadMessageId: string) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.messages.read(id),
      body: { lastReadMessageId },
      idempotencyKey: `web-read-${id}-${lastReadMessageId}`,
    });
  }
  markConversationDelivered(id: string, lastDeliveredMessageId: string) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.messages.delivered(id),
      body: { lastDeliveredMessageId },
      idempotencyKey: `web-delivered-${id}-${lastDeliveredMessageId}`,
    });
  }
  updateConversationSettings(
    id: string,
    payload: {
      mutedUntil?: string | null;
      notificationLevel?: 'normal' | 'mentions_only' | 'muted';
      pinned?: boolean;
      archived?: boolean;
      hidden?: boolean;
    },
  ) {
    return this.request<FitMeetConversation>({
      method: 'PATCH',
      path: fitMeetPaths.messages.memberSettings(id),
      body: payload,
      idempotencyKey: `web-conversation-settings-${id}-${crypto.randomUUID()}`,
    });
  }
  recallConversationMessage(id: string) {
    return this.request<FitMeetConversationMessage>({
      method: 'POST',
      path: fitMeetPaths.messages.recall(id),
      body: {},
      idempotencyKey: `web-message-recall-${id}`,
    });
  }
  reportConversationMessage(id: string, reason: string, details?: string) {
    return this.request({
      method: 'POST',
      path: fitMeetPaths.messages.report(id),
      body: { reason, details },
      idempotencyKey: `web-message-report-${id}`,
    });
  }
  getUnreadCount() {
    return this.request<{ unreadCount: number }>({
      method: 'GET',
      path: fitMeetPaths.messages.unread,
    });
  }

  async listAgentMemories() {
    const payload = await this.request<
      FitMeetAgentMemory[] | { items?: FitMeetAgentMemory[]; data?: FitMeetAgentMemory[] }
    >({ method: 'GET', path: fitMeetPaths.users.agentMemory });
    return Array.isArray(payload) ? { items: payload, data: payload } : payload;
  }
  async confirmAgentMemory(
    memoryId: string,
    expectedRevision: number,
    useScope?: AgentMemoryUseScope,
    explicitSensitiveConsent = false,
  ) {
    const result = await this.request<AgentMemoryMutation>({
      method: 'POST',
      path: fitMeetPaths.users.agentMemoryConfirm,
      body: {
        memoryId,
        action: 'confirm_memory',
        expectedRevision,
        ...(useScope ? { useScope } : {}),
        ...(explicitSensitiveConsent ? { explicitSensitiveConsent: true } : {}),
      },
      idempotencyKey: `web-memory-confirm-${memoryId}-${crypto.randomUUID()}`,
    });
    return result.item;
  }
  async rejectAgentMemory(memoryId: string, expectedRevision: number) {
    const result = await this.request<AgentMemoryMutation>({
      method: 'POST',
      path: fitMeetPaths.users.agentMemoryReject,
      body: { memoryId, expectedRevision },
      idempotencyKey: `web-memory-reject-${memoryId}-${crypto.randomUUID()}`,
    });
    return result.item;
  }
  deleteAgentMemory(id: string, expectedRevision: number) {
    return this.request({
      method: 'DELETE',
      path: `${fitMeetPaths.users.agentMemory}/${encodeURIComponent(id)}`,
      body: { expectedRevision },
    });
  }
  async updateAgentMemory(
    id: string,
    patch: {
      value?: string;
      summary?: string;
      useScope?: AgentMemoryUseScope;
      expectedRevision?: number;
      explicitSensitiveConsent?: boolean;
    },
  ) {
    const result = await this.request<AgentMemoryMutation>({
      method: 'PATCH',
      path: `${fitMeetPaths.users.agentMemory}/${encodeURIComponent(id)}`,
      body: patch,
      idempotencyKey: `web-memory-update-${id}-${crypto.randomUUID()}`,
    });
    return result.item;
  }
  getAgentMemoryControl() {
    return this.request<AgentMemoryControl>({
      method: 'GET',
      path: fitMeetPaths.users.agentMemoryControl,
    });
  }
  updateAgentMemoryControl(inferenceEnabled: boolean) {
    return this.request<AgentMemoryControl>({
      method: 'PATCH',
      path: fitMeetPaths.users.agentMemoryControl,
      body: { inferenceEnabled },
      idempotencyKey: `web-memory-control-${crypto.randomUUID()}`,
    });
  }
  listAgentMemoryUsage(id: string, cursor?: string, limit = 20) {
    const query = new URLSearchParams({ limit: String(Math.max(1, Math.min(40, limit))) });
    if (cursor) query.set('cursor', cursor);
    return this.request<AgentMemoryUsagePage>({
      method: 'GET',
      path: `${fitMeetPaths.users.agentMemoryUsage(id)}?${query.toString()}`,
    });
  }
  suppressAgentMemory(id: string, expectedRevision: number) {
    return this.request<AgentMemorySuppressionMutation>({
      method: 'POST',
      path: fitMeetPaths.users.agentMemorySuppress(id),
      body: { expectedRevision },
      idempotencyKey: `web-memory-suppress-${id}-${crypto.randomUUID()}`,
    });
  }
  removeAgentMemorySuppression(memoryType: string) {
    return this.request<AgentMemoryControl>({
      method: 'DELETE',
      path: fitMeetPaths.users.agentMemorySuppression(memoryType),
      idempotencyKey: `web-memory-unsuppress-${memoryType}-${crypto.randomUUID()}`,
    });
  }

  runAgentCompletion(body: {
    messages: Array<{
      role: 'system' | 'user' | 'assistant' | 'tool';
      content: string;
      tool_calls?: unknown[];
      tool_call_id?: string;
    }>;
    tools?: unknown[];
    tool_choice?: 'auto';
    fitmeet_context: Record<string, unknown>;
  }) {
    return this.request<AgentCompletionResponse>({
      method: 'POST',
      path: '/agent/v1/chat/completions',
      body,
    });
  }

  // Kept for callers that still use the lighter legacy display types.
  listLegacyConversations() {
    return this.request<Conversation[]>({
      method: 'GET',
      path: fitMeetPaths.messages.conversations,
    });
  }
  getLegacyConversation(id: string) {
    return this.request<ConversationMessage[]>({
      method: 'GET',
      path: fitMeetPaths.messages.thread(id),
    });
  }
}
