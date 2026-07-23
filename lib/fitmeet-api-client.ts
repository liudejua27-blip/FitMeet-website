import {
  FITMEET_API_BASE_URL,
  fitMeetPaths,
  type AgentCompletionResponse,
  type AgentThread,
  type AgentThreadDetail,
  type AgentThreadEntry,
  type AgentThreadTurn,
  type AgentInboxEventPage,
  type AuthSession,
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
  type FitMeetConversation,
  type FitMeetConversationMessage,
  type FitMeetDemand,
  type FitMeetDemandCandidate,
  type FitMeetIntentApplication,
  type FitMeetProfilePhoto,
  type FitMeetPublicIntent,
  type FitMeetUploadImage,
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
  type SafetyReportPayload,
  type SocialProfile,
} from "./fitmeet-api-contract";

type ApiErrorPayload = { code?: string; message?: string; details?: unknown };

export class FitMeetApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "FitMeetApiError";
  }
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) return (payload as { data: T }).data;
  return payload as T;
}

export function normalizeAuthSession(payload: RawAuthSession): AuthSession {
  const accessToken = payload.accessToken ?? payload.access_token;
  if (!accessToken) throw new Error("登录响应缺少访问凭证。");
  return {
    accessToken,
    refreshToken: payload.refreshToken ?? payload.refresh_token,
    user: payload.user,
    requiresPhoneVerification: payload.phoneVerificationRequired ?? payload.phone_verification_required,
  };
}

function textArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeSocialProfile(payload: unknown): SocialProfile {
  const source = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const directInterests = textArray(source.interests);
  const taggedInterests = textArray(source.interestTags);
  return {
    nickname: typeof source.nickname === "string" ? source.nickname : typeof source.name === "string" ? source.name : "",
    city: typeof source.city === "string" ? source.city : "",
    bio: typeof source.bio === "string" ? source.bio : "",
    interests: directInterests.length ? directInterests : taggedInterests.length ? taggedInterests : textArray(source.interest_tags),
    distanceKm: typeof source.distanceKm === "number" ? source.distanceKm : typeof source.distance_km === "number" ? source.distance_km : 5,
    profileDiscoverable: typeof source.profileDiscoverable === "boolean" ? source.profileDiscoverable : source.profile_discoverable !== false,
    agentCanRecommendMe: typeof source.agentCanRecommendMe === "boolean" ? source.agentCanRecommendMe : source.agent_can_recommend_me !== false,
    agentCanStartChatAfterApproval: source.agentCanStartChatAfterApproval === true || source.agent_can_start_chat_after_approval === true,
    hideSensitiveTags: typeof source.hideSensitiveTags === "boolean" ? source.hideSensitiveTags : source.hide_sensitive_tags !== false,
  };
}

export class FitMeetApiClient {
  constructor(
    private readonly getToken: () => string | null,
    private readonly baseUrl = FITMEET_API_BASE_URL,
  ) {}

  async request<T>({ method, path, body, idempotencyKey }: RequestOptions): Promise<T> {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      // Realtime events are only invalidation signals. Every reconciliation
      // must obtain an authorization-checked representation, not a browser
      // 304 response with no JSON body.
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === "object" ? payload as ApiErrorPayload : {};
      throw new FitMeetApiError(error.message || error.code || `请求失败 (${response.status})`, response.status, error.code, error.details);
    }
    return unwrap<T>(payload);
  }

  private async requestEnvelope<T>(path: string): Promise<T> {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === "object" ? payload as ApiErrorPayload : {};
      throw new FitMeetApiError(error.message || error.code || `请求失败 (${response.status})`, response.status, error.code, error.details);
    }
    return payload as T;
  }

  sendSmsCode(phone: string) {
    return this.request<{ message: string; expiresIn?: number }>({ method: "POST", path: fitMeetPaths.auth.sendSmsCode, body: { phone } });
  }

  async loginByPhone(phone: string, code: string) {
    return normalizeAuthSession(await this.request<RawAuthSession>({ method: "POST", path: fitMeetPaths.auth.phoneLogin, body: { phone, code } }));
  }

  /**
   * The public web client never sees a tester phone number or the MobileAPI
   * test-code.  Those credentials stay in the web server's environment and
   * are exchanged only after an internal invite code is verified.
   */
  async loginInternalTester(accessCode: string) {
    const response = await fetch("/api/internal-test/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCode }),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === "object" ? payload as ApiErrorPayload : {};
      throw new Error(error.message || error.code || "内测登录未能完成。");
    }
    return normalizeAuthSession(unwrap<RawAuthSession>(payload));
  }

  async refreshInternalTesterSession() {
    const response = await fetch("/api/internal-test/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store" });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === "object" ? payload as ApiErrorPayload : {};
      throw new Error(error.message || "登录已失效。");
    }
    return normalizeAuthSession(unwrap<RawAuthSession>(payload));
  }

  async logoutInternalTester() {
    await fetch("/api/internal-test/logout", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store" }).catch(() => undefined);
  }

  async refreshSession(refreshToken: string) {
    return normalizeAuthSession(await this.request<RawAuthSession>({ method: "POST", path: fitMeetPaths.auth.refresh, body: { refreshToken } }));
  }

  getAuthProfile() { return this.request<AuthSession["user"]>({ method: "GET", path: fitMeetPaths.auth.profile }); }
  getOnboardingStatus() { return this.request<OnboardingStatus>({ method: "GET", path: fitMeetPaths.users.onboardingStatus }); }

  completeOnboarding(payload: OnboardingPayload) {
    return this.request<OnboardingStatus>({ method: "POST", path: fitMeetPaths.users.onboardingComplete, body: payload, idempotencyKey: `web-onboarding-${crypto.randomUUID()}` });
  }

  async getSocialProfile() { return normalizeSocialProfile(await this.request<unknown>({ method: "GET", path: fitMeetPaths.users.socialProfile })); }
  async updateSocialProfile(payload: Partial<SocialProfile>) { return normalizeSocialProfile(await this.request<unknown>({ method: "PUT", path: fitMeetPaths.users.socialProfile, body: payload, idempotencyKey: `web-profile-${crypto.randomUUID()}` })); }
  listProfilePhotos() { return this.request<FitMeetProfilePhoto[]>({ method: "GET", path: fitMeetPaths.users.profilePhotos }); }
  async uploadImage(file: File) {
    const token = this.getToken();
    const form = new FormData();
    form.append("file", file, file.name || "fitmeet-profile.jpg");
    const response = await fetch(`${this.baseUrl}/uploads/image`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === "object" ? payload as ApiErrorPayload : {};
      throw new Error(error.message || error.code || "照片上传失败。");
    }
    return unwrap<FitMeetUploadImage>(payload);
  }
  replaceProfilePhotos(photos: Array<{ assetId: number; sortOrder: number; isCover: boolean }>) {
    return this.request<FitMeetProfilePhoto[]>({ method: "PUT", path: fitMeetPaths.users.profilePhotos, body: { photos }, idempotencyKey: `web-profile-photos-${crypto.randomUUID()}` });
  }
  deleteProfilePhoto(id: number) { return this.request<{ id: number; status: string }>({ method: "DELETE", path: fitMeetPaths.users.profilePhoto(id) }); }
  async listAdvantages() {
    const payload = await this.request<{ items?: UserAdvantage[]; data?: UserAdvantage[] } | UserAdvantage[]>({ method: "GET", path: fitMeetPaths.users.advantages });
    return Array.isArray(payload) ? payload : payload.items ?? payload.data ?? [];
  }
  createAdvantage(payload: Pick<UserAdvantage, "title"> & Partial<UserAdvantage>) { return this.request<UserAdvantage>({ method: "POST", path: fitMeetPaths.users.advantages, body: payload, idempotencyKey: `web-advantage-${crypto.randomUUID()}` }); }
  deleteAdvantage(id: string) { return this.request<{ id: string; status: string }>({ method: "DELETE", path: fitMeetPaths.users.advantage(id) }); }
  async listVerifications() {
    const token = this.getToken();
    const response = await fetch("/api/fitmeet/verifications", {
      method: "GET",
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload && typeof payload === "object" ? payload as ApiErrorPayload : {};
      throw new FitMeetApiError(error.message || "认证资料暂时无法同步。", response.status, error.code, error.details);
    }
    const source = unwrap<{ items?: UserVerification[]; available?: boolean; message?: string }>(payload);
    return {
      items: Array.isArray(source.items) ? source.items : [],
      available: source.available !== false,
      message: source.message,
    };
  }
  createVerification(payload: { title: string; verificationType?: string; evidenceAssetIds?: number[] }) { return this.request<UserVerification>({ method: "POST", path: fitMeetPaths.users.verifications, body: payload, idempotencyKey: `web-verification-${crypto.randomUUID()}` }); }
  deleteVerification(id: string) { return this.request<{ id: string; status: string }>({ method: "DELETE", path: fitMeetPaths.users.verification(id) }); }
  exportAccountData() { return this.request<Record<string, unknown>>({ method: "GET", path: fitMeetPaths.users.accountExport }); }
  deleteAccount() { return this.request<{ id?: number; status: string; deletedAt?: string }>({ method: "DELETE", path: fitMeetPaths.users.account }); }

  async getFeed(page = 1, limit = 10) {
    const payload = await this.requestEnvelope<FeedPost[] | FeedPage>(`${fitMeetPaths.feed.posts}?category=log&page=${page}&limit=${limit}`);
    return Array.isArray(payload) ? { data: payload } : payload;
  }
  async getFriendFeed(page = 1, limit = 10) {
    const payload = await this.requestEnvelope<FeedPost[] | FeedPage>(`${fitMeetPaths.feed.friends}?page=${page}&limit=${limit}`);
    return Array.isArray(payload) ? { data: payload } : payload;
  }
  async listUserPosts(userId: number, page = 1, limit = 10) {
    const payload = await this.requestEnvelope<FeedPost[] | FeedPage>(`${fitMeetPaths.feed.userPosts(userId)}?page=${page}&limit=${limit}`);
    return Array.isArray(payload) ? { data: payload } : payload;
  }
  createFeedPost(payload: Pick<FeedPost, "title" | "text" | "tags"> & { city: string; visibility?: "public" | "private"; images?: Array<{ assetId: number; url: string; width?: number | null; height?: number | null }> }) {
    const images = payload.images ?? [];
    return this.request<FeedPost>({ method: "POST", path: fitMeetPaths.feed.posts, body: { type: "log", sport: "", ...payload, images, mediaAssetIds: images.map((image) => image.assetId), loc: "", visibility: payload.visibility ?? "public" }, idempotencyKey: `web-feed-${crypto.randomUUID()}` });
  }
  likeFeedPost(id: number) { return this.request<{ postId: number; liked: boolean; likes: number }>({ method: "POST", path: fitMeetPaths.feed.likes(id), body: {}, idempotencyKey: `web-like-${id}-${crypto.randomUUID()}` }); }
  unlikeFeedPost(id: number) { return this.request<{ postId: number; liked: boolean; likes: number }>({ method: "DELETE", path: fitMeetPaths.feed.likes(id) }); }
  deleteFeedPost(id: number) { return this.request<void>({ method: "DELETE", path: fitMeetPaths.feed.post(id) }); }
  listFeedComments(postId: number, page = 1, limit = 30) {
    return this.request<FeedCommentPage>({ method: "GET", path: `${fitMeetPaths.feed.comments(postId)}?page=${page}&limit=${limit}` });
  }
  createFeedComment(postId: number, body: string) {
    return this.request<FeedComment>({ method: "POST", path: fitMeetPaths.feed.comments(postId), body: { body }, idempotencyKey: `web-feed-comment-${postId}-${crypto.randomUUID()}` });
  }
  deleteFeedComment(postId: number, commentId: number) {
    return this.request<{ id: number; postId: number; status: string }>({ method: "DELETE", path: fitMeetPaths.feed.comment(postId, commentId) });
  }
  reportFeedComment(postId: number, commentId: number, reason = "inappropriate_content") {
    return this.request<{ id: number; status: string }>({ method: "POST", path: fitMeetPaths.feed.commentReports(postId, commentId), body: { reason, description: "网页端用户举报动态评论" }, idempotencyKey: `web-feed-comment-report-${postId}-${commentId}` });
  }

  createInvitation(payload: MeetInvitationDraft) { return this.request<MeetInvitation>({ method: "POST", path: fitMeetPaths.invitations.root, body: payload, idempotencyKey: `web-invite-${crypto.randomUUID()}` }); }
  listMeetInvitations(role?: MeetInvitationRole, status?: MeetInvitationStatus) {
    const query = new URLSearchParams({ ...(role ? { role: role === "sender" ? "sent" : "received" } : {}), ...(status ? { status } : {}) });
    return this.request<MeetInvitation[]>({ method: "GET", path: `${fitMeetPaths.invitations.mine}${query.size ? `?${query}` : ""}` });
  }
  acceptInvitation(id: number) { return this.request<{ invitationId: number; status: MeetInvitationStatus; meetId?: number; conversation?: { id?: string; conversationId?: string; status?: string } }>({ method: "POST", path: fitMeetPaths.invitations.accept(id), body: {}, idempotencyKey: `web-invite-accept-${id}-${crypto.randomUUID()}` }); }
  rejectInvitation(id: number) { return this.request<MeetInvitation>({ method: "POST", path: fitMeetPaths.invitations.reject(id), body: {}, idempotencyKey: `web-invite-reject-${id}-${crypto.randomUUID()}` }); }
  cancelInvitation(id: number) { return this.request<MeetInvitation>({ method: "POST", path: fitMeetPaths.invitations.cancel(id), body: {}, idempotencyKey: `web-invite-cancel-${id}-${crypto.randomUUID()}` }); }

  createDemand(payload: { type: string; title: string; summary: string; fields: Array<{ title: string; value: string; importance?: "required" | "optional" | "context" }>; visibility: "hidden" | "public"; hallTarget?: string; category?: string; matchingPolicy?: { city?: string; radiusKm?: number; hardFilters?: string[]; softPreferences?: string[] }; capacityMax: number; capacityMin?: number; sourceConversationId?: string }) {
    return this.request<FitMeetDemand>({ method: "POST", path: fitMeetPaths.demands.root, body: payload, idempotencyKey: `web-demand-${crypto.randomUUID()}` });
  }
  async listMyDemands() {
    const payload = await this.request<FitMeetDemand[] | { data: FitMeetDemand[] }>({ method: "GET", path: fitMeetPaths.users.demands });
    return Array.isArray(payload) ? { data: payload } : payload;
  }
  getDemand(id: string) { return this.request<FitMeetDemand>({ method: "GET", path: fitMeetPaths.demands.detail(id) }); }
  publishDemand(id: string, category?: string) { return this.request<FitMeetDemand>({ method: "POST", path: fitMeetPaths.demands.publish(id), body: { hallTarget: "socialHall", ...(category ? { category } : {}) }, idempotencyKey: `web-demand-publish-${id}-${crypto.randomUUID()}` }); }
  listDemandCandidates(id: string) { return this.request<{ demand: FitMeetDemand; candidates: FitMeetDemandCandidate[]; total: number }>({ method: "GET", path: `${fitMeetPaths.demands.candidates(id)}?limit=20` }); }
  hideDemand(id: string) { return this.request<FitMeetDemand>({ method: "POST", path: fitMeetPaths.demands.hide(id), body: {}, idempotencyKey: `web-demand-hide-${id}-${crypto.randomUUID()}` }); }
  cancelDemand(id: string, reason?: string) { return this.request<FitMeetDemand>({ method: "POST", path: fitMeetPaths.demands.cancel(id), body: { reason }, idempotencyKey: `web-demand-cancel-${id}-${crypto.randomUUID()}` }); }
  recordDemandCandidateBehavior(demandId: string, candidateId: number, eventType: DemandCandidateBehavior) {
    const mapped = eventType === "dismissed" ? "candidate.dismissed" : eventType === "saved" ? "candidate.viewed" : eventType === "invited" ? "candidate.invited" : "candidate.viewed";
    return this.request<{ status: string; candidate: FitMeetDemandCandidate }>({ method: "POST", path: fitMeetPaths.demands.candidateBehavior(demandId, candidateId), body: { eventType: mapped }, idempotencyKey: `web-demand-candidate-${demandId}-${candidateId}-${eventType}-${crypto.randomUUID()}` });
  }

  getActiveDemandDraftSession(sourceConversationId?: string) {
    const query = sourceConversationId ? `?sourceConversationId=${encodeURIComponent(sourceConversationId)}` : "";
    return this.request<{ session: DemandDraftSession | null }>({ method: "GET", path: `${fitMeetPaths.demandDraftSessions.active}${query}` });
  }
  updateDemandDraftSession(id: string, payload: Partial<DemandDraftSession>) {
    return this.request<DemandDraftSession>({ method: "PATCH", path: fitMeetPaths.demandDraftSessions.update(id), body: payload, idempotencyKey: `web-demand-draft-${id}-${crypto.randomUUID()}` });
  }
  cancelDemandDraftSession(id: string) {
    return this.request<DemandDraftSession>({ method: "POST", path: fitMeetPaths.demandDraftSessions.cancel(id), body: {}, idempotencyKey: `web-demand-draft-cancel-${id}-${crypto.randomUUID()}` });
  }

  async listAgentThreads() {
    const payload = await this.request<AgentThread[] | { items?: AgentThread[]; data?: AgentThread[] }>({ method: "GET", path: fitMeetPaths.agentThreads.root });
    return Array.isArray(payload) ? { items: payload, data: payload } : payload;
  }
  createAgentThread(title?: string) {
    const clientThreadId = crypto.randomUUID();
    return this.request<{ thread: AgentThread; entries: AgentThreadEntry[] }>({
      method: "POST",
      path: fitMeetPaths.agentThreads.root,
      body: { clientThreadId, ...(title ? { title } : {}) },
      idempotencyKey: `web-agent-thread-${clientThreadId}`,
    });
  }
  getAgentThread(id: string) { return this.request<AgentThreadDetail>({ method: "GET", path: fitMeetPaths.agentThreads.detail(id) }); }
  sendAgentThreadTurn(id: string, content: string, clientTurnId = crypto.randomUUID()) {
    return this.request<AgentThreadTurn>({ method: "POST", path: fitMeetPaths.agentThreads.turns(id), body: { content, clientTurnId }, idempotencyKey: `web-agent-turn-${clientTurnId}` });
  }
  resolveAgentToolProposal(threadId: string, proposalId: string, decision: "approve" | "decline", argumentsPatch?: Record<string, unknown>) {
    return this.request<{ proposal: AgentThreadEntry; resolution: AgentThreadEntry }>({ method: "POST", path: fitMeetPaths.agentThreads.resolveProposal(threadId, proposalId), body: { decision, ...(argumentsPatch ? { arguments: argumentsPatch } : {}) }, idempotencyKey: `web-agent-proposal-${proposalId}-${decision}` });
  }
  deleteAgentThread(id: string) { return this.request<{ id: string; status: string }>({ method: "DELETE", path: fitMeetPaths.agentThreads.detail(id) }); }
  getAgentInboxEvents(limit = 30) { return this.request<AgentInboxEventPage>({ method: "GET", path: `${fitMeetPaths.agentInbox.events}?limit=${limit}` }); }
  acknowledgeAgentInboxEvents(ids: string[]) { return this.request<{ acknowledged: string[]; acknowledgedCount: number }>({ method: "POST", path: fitMeetPaths.agentInbox.acknowledge, body: { ids } }); }

  createConnectionRequest(targetUserId: number, message: string, contextId = "") { return this.request({ method: "POST", path: fitMeetPaths.relationships.requests, body: { targetUserId, message, contextType: "agent_candidate", contextId }, idempotencyKey: `web-connection-${targetUserId}-${crypto.randomUUID()}` }); }
  listConnectionRequests(box: "inbox" | "outbox", status = "pending") { return this.request<FitMeetConnectionRequest[]>({ method: "GET", path: `${fitMeetPaths.relationships.requests}?box=${box}&status=${status}` }); }
  acceptConnectionRequest(id: number) { return this.request({ method: "POST", path: fitMeetPaths.relationships.accept(id), body: {}, idempotencyKey: `web-connection-accept-${id}-${crypto.randomUUID()}` }); }
  rejectConnectionRequest(id: number) { return this.request({ method: "POST", path: fitMeetPaths.relationships.reject(id), body: {}, idempotencyKey: `web-connection-reject-${id}-${crypto.randomUUID()}` }); }
  cancelConnectionRequest(id: number) { return this.request({ method: "POST", path: fitMeetPaths.relationships.cancel(id), body: {}, idempotencyKey: `web-connection-cancel-${id}-${crypto.randomUUID()}` }); }
  deleteFriend(id: number) { return this.request({ method: "DELETE", path: fitMeetPaths.relationships.friend(id) }); }
  async listFriends() {
    const payload = await this.request<{ data?: PublicUserProfile[] } | PublicUserProfile[]>({ method: "GET", path: fitMeetPaths.relationships.friends });
    return Array.isArray(payload) ? payload : payload.data ?? [];
  }

  createPublicIntentApplication(intentId: string, message: string) { return this.request({ method: "POST", path: fitMeetPaths.feed.socialIntentApplications(intentId), body: { message }, idempotencyKey: `web-social-intent-${intentId}-${crypto.randomUUID()}` }); }
  createTaskIntentApplication(intentId: string, message: string) { return this.request({ method: "POST", path: fitMeetPaths.feed.taskIntentApplications(intentId), body: { message }, idempotencyKey: `web-task-intent-${intentId}-${crypto.randomUUID()}` }); }
  listPublicSocialIntents() { return this.request<FitMeetPublicIntent[]>({ method: "GET", path: `${fitMeetPaths.feed.socialIntents}?page=1&limit=20` }); }
  listPublicTaskIntents() { return this.request<FitMeetPublicIntent[]>({ method: "GET", path: `${fitMeetPaths.feed.taskIntents}?page=1&limit=20` }); }
  listMyPublicIntentApplications(role?: "owner" | "applicant") { return this.request<FitMeetIntentApplication[]>({ method: "GET", path: `${fitMeetPaths.feed.publicIntentApplicationsMine}${role ? `?role=${role}` : ""}` }); }
  listMyTaskIntentApplications(role?: "owner" | "applicant") { return this.request<FitMeetIntentApplication[]>({ method: "GET", path: `${fitMeetPaths.feed.taskIntentApplicationsMine}${role ? `?role=${role}` : ""}` }); }
  cancelPublicIntentApplication(id: number) { return this.request({ method: "POST", path: fitMeetPaths.feed.cancelPublicIntentApplication(id), body: {}, idempotencyKey: `web-social-intent-cancel-${id}-${crypto.randomUUID()}` }); }
  cancelTaskIntentApplication(id: number) { return this.request({ method: "POST", path: fitMeetPaths.feed.cancelTaskIntentApplication(id), body: {}, idempotencyKey: `web-task-intent-cancel-${id}-${crypto.randomUUID()}` }); }
  acceptPublicIntentApplication(id: number) { return this.request({ method: "POST", path: fitMeetPaths.feed.acceptPublicIntentApplication(id), body: {}, idempotencyKey: `web-social-intent-accept-${id}-${crypto.randomUUID()}` }); }
  rejectPublicIntentApplication(id: number) { return this.request({ method: "POST", path: fitMeetPaths.feed.rejectPublicIntentApplication(id), body: {}, idempotencyKey: `web-social-intent-reject-${id}-${crypto.randomUUID()}` }); }
  acceptTaskIntentApplication(id: number) { return this.request({ method: "POST", path: fitMeetPaths.feed.acceptTaskIntentApplication(id), body: {}, idempotencyKey: `web-task-intent-accept-${id}-${crypto.randomUUID()}` }); }
  rejectTaskIntentApplication(id: number) { return this.request({ method: "POST", path: fitMeetPaths.feed.rejectTaskIntentApplication(id), body: {}, idempotencyKey: `web-task-intent-reject-${id}-${crypto.randomUUID()}` }); }

  confirmMeet(id: number) { return this.request({ method: "POST", path: fitMeetPaths.meets.confirm(id), body: {}, idempotencyKey: `web-meet-confirm-${id}-${crypto.randomUUID()}` }); }
  cancelMeet(id: number, reason?: string) { return this.request({ method: "POST", path: fitMeetPaths.meets.cancel(id), body: { reason }, idempotencyKey: `web-meet-cancel-${id}-${crypto.randomUUID()}` }); }
  completeMeet(id: number) { return this.request({ method: "POST", path: fitMeetPaths.meets.complete(id), body: {}, idempotencyKey: `web-meet-complete-${id}-${crypto.randomUUID()}` }); }
  reportMeetNoShow(id: number, reason: string) { return this.request({ method: "POST", path: fitMeetPaths.meets.noShow(id), body: { reason }, idempotencyKey: `web-meet-no-show-${id}-${crypto.randomUUID()}` }); }
  reviewMeet(id: number, payload: MeetReviewPayload) { return this.request({ method: "POST", path: fitMeetPaths.meets.reviews(id), body: payload, idempotencyKey: `web-meet-review-${id}-${crypto.randomUUID()}` }); }

  reportSafety(payload: SafetyReportPayload) { return this.request({ method: "POST", path: fitMeetPaths.safety.reports, body: payload, idempotencyKey: `web-safety-report-${crypto.randomUUID()}` }); }
  blockUser(id: number) { return this.request({ method: "POST", path: fitMeetPaths.safety.block(id), body: {}, idempotencyKey: `web-block-${id}-${crypto.randomUUID()}` }); }
  unblockUser(id: number) { return this.request({ method: "DELETE", path: fitMeetPaths.safety.block(id) }); }

  listConversations() { return this.request<FitMeetConversation[]>({ method: "GET", path: fitMeetPaths.messages.conversations }); }
  getConversation(id: string) { return this.request<FitMeetConversationMessage[]>({ method: "GET", path: fitMeetPaths.messages.thread(id) }); }
  sendConversationMessage(id: string, text: string) { return this.request<FitMeetConversationMessage>({ method: "POST", path: fitMeetPaths.messages.send(id), body: { text, clientMessageId: `web-message-${crypto.randomUUID()}` }, idempotencyKey: `web-message-${crypto.randomUUID()}` }); }
  markConversationRead(id: string, lastReadMessageId: string) { return this.request({ method: "POST", path: fitMeetPaths.messages.read(id), body: { lastReadMessageId }, idempotencyKey: `web-read-${id}-${lastReadMessageId}` }); }
  markConversationDelivered(id: string, lastDeliveredMessageId: string) { return this.request({ method: "POST", path: fitMeetPaths.messages.delivered(id), body: { lastDeliveredMessageId }, idempotencyKey: `web-delivered-${id}-${lastDeliveredMessageId}` }); }
  updateConversationSettings(id: string, payload: { mutedUntil?: string | null; notificationLevel?: "normal" | "mentions_only" | "muted"; pinned?: boolean; archived?: boolean; hidden?: boolean }) { return this.request<FitMeetConversation>({ method: "PATCH", path: fitMeetPaths.messages.memberSettings(id), body: payload, idempotencyKey: `web-conversation-settings-${id}-${crypto.randomUUID()}` }); }
  recallConversationMessage(id: string) { return this.request<FitMeetConversationMessage>({ method: "POST", path: fitMeetPaths.messages.recall(id), body: {}, idempotencyKey: `web-message-recall-${id}` }); }
  reportConversationMessage(id: string, reason: string, details?: string) { return this.request({ method: "POST", path: fitMeetPaths.messages.report(id), body: { reason, details }, idempotencyKey: `web-message-report-${id}` }); }
  getUnreadCount() { return this.request<{ unreadCount: number }>({ method: "GET", path: fitMeetPaths.messages.unread }); }

  async listAgentMemories() {
    const payload = await this.request<FitMeetAgentMemory[] | { items?: FitMeetAgentMemory[]; data?: FitMeetAgentMemory[] }>({ method: "GET", path: fitMeetPaths.users.agentMemory });
    return Array.isArray(payload) ? { items: payload, data: payload } : payload;
  }
  confirmAgentMemory(payload: { memoryType: string; value: string; summary?: string }) { return this.request<FitMeetAgentMemory>({ method: "POST", path: fitMeetPaths.users.agentMemoryConfirm, body: payload, idempotencyKey: `web-memory-${crypto.randomUUID()}` }); }
  rejectAgentMemory(id: string) { return this.request({ method: "POST", path: fitMeetPaths.users.agentMemoryReject, body: { id }, idempotencyKey: `web-memory-reject-${id}-${crypto.randomUUID()}` }); }
  deleteAgentMemory(id: string) { return this.request({ method: "DELETE", path: `${fitMeetPaths.users.agentMemory}/${encodeURIComponent(id)}` }); }

  runAgentCompletion(body: { messages: Array<{ role: "system" | "user" | "assistant" | "tool"; content: string; tool_calls?: unknown[]; tool_call_id?: string }>; tools?: unknown[]; tool_choice?: "auto"; fitmeet_context: Record<string, unknown> }) {
    return this.request<AgentCompletionResponse>({ method: "POST", path: "/agent/v1/chat/completions", body });
  }

  // Kept for callers that still use the lighter legacy display types.
  listLegacyConversations() { return this.request<Conversation[]>({ method: "GET", path: fitMeetPaths.messages.conversations }); }
  getLegacyConversation(id: string) { return this.request<ConversationMessage[]>({ method: "GET", path: fitMeetPaths.messages.thread(id) }); }
}
