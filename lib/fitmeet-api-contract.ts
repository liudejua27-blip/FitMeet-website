/**
 * Web representation of the MobileAPI contract.
 *
 * Source of truth: FitMeetAlpha/Networking/FitMeetCoreEndpoint.swift.
 * Keep the path names and request semantics aligned with iOS and the
 * mini-program client; this module deliberately does not invent web-only
 * endpoints.
 */
export const FITMEET_API_BASE_URL = process.env.NEXT_PUBLIC_FITMEET_API_BASE_URL ?? "https://api.ourfitmeet.cn/api";
export const FITMEET_REALTIME_BASE_URL = FITMEET_API_BASE_URL.replace(/\/api\/?$/, "");

export const fitMeetPaths = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    sendSmsCode: "/auth/sms/send",
    phoneLogin: "/auth/sms/verify",
    bindPhone: "/auth/phone/bind",
    wechatLogin: "/auth/wechat/login",
    refresh: "/auth/refresh",
    profile: "/auth/profile",
  },
  users: {
    profile: "/users/profile",
    account: "/users/me",
    accountExport: "/users/me/export",
    socialProfile: "/users/me/social-profile",
    socialProfilePrivacy: "/users/me/social-profile/privacy",
    onboardingStatus: "/users/me/onboarding-status",
    onboardingComplete: "/users/me/onboarding/complete",
    profilePhotos: "/users/me/profile-photos",
    profilePhoto: (id: number) => `/users/me/profile-photos/${id}`,
    advantages: "/users/me/advantages",
    advantage: (id: string) => `/users/me/advantages/${encodeURIComponent(id)}`,
    verifications: "/users/me/verifications",
    verification: (id: string) => `/users/me/verifications/${encodeURIComponent(id)}`,
    demands: "/users/me/demands",
    meetInvitations: "/users/me/meet-invitations",
    agentMemory: "/users/me/agent-memory",
    agentMemoryExtract: "/users/me/agent-memory/extract",
    agentMemoryConfirm: "/users/me/agent-memory/confirm",
    agentMemoryReject: "/users/me/agent-memory/reject",
    reminderPreferences: "/social-agent/reminders/preferences",
  },
  feed: {
    posts: "/feed/posts",
    friends: "/feed/friends",
    post: (id: number) => `/feed/posts/${id}`,
    userPosts: (userId: number) => `/users/${userId}/posts`,
    likes: (id: number) => `/feed/posts/${id}/likes`,
    comments: (id: number) => `/feed/posts/${id}/comments`,
    comment: (postId: number, commentId: number) => `/feed/posts/${postId}/comments/${commentId}`,
    commentReports: (postId: number, commentId: number) => `/feed/posts/${postId}/comments/${commentId}/reports`,
    socialIntents: "/public/social-intents",
    taskIntents: "/public/task-intents",
    socialIntentApplications: (id: string) => `/public/social-intents/${encodeURIComponent(id)}/applications`,
    taskIntentApplications: (id: string) => `/public/task-intents/${encodeURIComponent(id)}/applications`,
    publicIntentApplicationsMine: "/users/me/public-intent-applications",
    taskIntentApplicationsMine: "/users/me/task-intent-applications",
    acceptPublicIntentApplication: (id: number) => `/public-intent-applications/${id}/accept`,
    rejectPublicIntentApplication: (id: number) => `/public-intent-applications/${id}/reject`,
    cancelPublicIntentApplication: (id: number) => `/public-intent-applications/${id}/cancel`,
    acceptTaskIntentApplication: (id: number) => `/task-intent-applications/${id}/accept`,
    rejectTaskIntentApplication: (id: number) => `/task-intent-applications/${id}/reject`,
    cancelTaskIntentApplication: (id: number) => `/task-intent-applications/${id}/cancel`,
  },
  messages: {
    start: "/messages/start",
    conversations: "/messages/conversations",
    unread: "/messages/unread",
    thread: (id: string) => `/messages/conversations/${encodeURIComponent(id)}`,
    send: (id: string) => `/messages/conversations/${encodeURIComponent(id)}/send`,
  },
  relationships: {
    friends: "/friends",
    user: (id: number) => `/relationships/users/${id}`,
    requests: "/connections/requests",
    accept: (id: number) => `/connections/requests/${id}/accept`,
    reject: (id: number) => `/connections/requests/${id}/reject`,
    cancel: (id: number) => `/connections/requests/${id}/cancel`,
    friend: (id: number) => `/friends/${id}`,
  },
  invitations: {
    root: "/meet-invitations",
    mine: "/users/me/meet-invitations",
    detail: (id: number) => `/meet-invitations/${id}`,
    accept: (id: number) => `/meet-invitations/${id}/accept`,
    reject: (id: number) => `/meet-invitations/${id}/reject`,
    cancel: (id: number) => `/meet-invitations/${id}/cancel`,
  },
  demands: {
    root: "/demands",
    detail: (id: string) => `/demands/${encodeURIComponent(id)}`,
    publish: (id: string) => `/demands/${encodeURIComponent(id)}/publish`,
    hide: (id: string) => `/demands/${encodeURIComponent(id)}/hide`,
    cancel: (id: string) => `/demands/${encodeURIComponent(id)}/cancel`,
    candidates: (id: string) => `/demands/${encodeURIComponent(id)}/candidates`,
    candidateBehavior: (demandId: string, candidateId: number) => `/demands/${encodeURIComponent(demandId)}/candidates/${candidateId}/behavior`,
  },
  demandDraftSessions: {
    root: "/users/me/demand-draft-sessions",
    active: "/users/me/demand-draft-sessions/active",
    update: (id: string) => `/users/me/demand-draft-sessions/${encodeURIComponent(id)}`,
    cancel: (id: string) => `/users/me/demand-draft-sessions/${encodeURIComponent(id)}/cancel`,
  },
  agentThreads: {
    root: "/users/me/agent-threads",
    detail: (id: string) => `/users/me/agent-threads/${encodeURIComponent(id)}`,
    turns: (id: string) => `/users/me/agent-threads/${encodeURIComponent(id)}/turns`,
    resolveProposal: (id: string, proposalId: string) => `/users/me/agent-threads/${encodeURIComponent(id)}/tool-proposals/${encodeURIComponent(proposalId)}/resolve`,
  },
  agentInbox: {
    events: "/agent-inbox/events",
    acknowledge: "/agent-inbox/events/ack",
  },
  meets: {
    confirm: (id: number) => `/meets/${id}/confirm`,
    cancel: (id: number) => `/meets/${id}/cancel`,
    complete: (id: number) => `/meets/${id}/complete`,
    noShow: (id: number) => `/meets/${id}/no-show`,
    reviews: (id: number) => `/meets/${id}/reviews`,
  },
  safety: {
    reports: "/safety/reports",
    block: (id: number) => `/safety/blocks/${id}`,
  },
} as const;

export type ApiErrorPayload = { code?: string; message?: string };

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  user: FitMeetUser;
  requiresPhoneVerification?: boolean;
};

export type RawAuthSession = {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  user: FitMeetUser;
  phoneVerificationRequired?: boolean;
  phone_verification_required?: boolean;
};

export type OnboardingStatus = {
  version: number;
  status: string;
  canUseSocialActions: boolean;
  requirements?: string[];
  completion?: {
    profileVersion?: number;
    approvedPhotoCount?: number;
    completedRequirements?: string[];
    [key: string]: unknown;
  } | null;
  completedAt?: string | null;
};

export type FitMeetUser = {
  id: number;
  name: string;
  avatar?: string | null;
  city?: string | null;
  phoneVerifiedAt?: string | null;
};

export type OnboardingPayload = {
  expectedProfileVersion?: number | null;
  nickname: string;
  dateOfBirth: string;
  city: string;
  primaryPurpose: SocialPurpose;
  purposes: SocialPurpose[];
  bio?: string;
  gender?: string;
  showMe: string[];
  personalityTags: string[];
  mbti?: string;
  meetingPace?: string;
  communicationStyle?: string;
  nearbyArea?: string;
  fitnessGoals: string[];
  exerciseLevels: string[];
  socialScenes: string[];
  lifestyleTags: string[];
  availableTimes: string[];
  socialPreference: string;
  privacyBoundary?: string;
  interestTags: string[];
  distanceKm: number;
  fuzzyLatitude?: number | null;
  fuzzyLongitude?: number | null;
  photoIds: number[];
  coverPhotoId: number;
  consents: {
    termsVersion: string;
    privacyVersion: string;
    adultAttestation: boolean;
    photoPermissionAcknowledged: boolean;
    contentRulesAccepted: boolean;
  };
};

export type SocialPurpose = "sportsPartner" | "activityPartner" | "newFriends" | "seriousDating" | "casualBrowsing";

export type SocialProfile = {
  nickname: string;
  city: string;
  bio: string;
  interests: string[];
  distanceKm: number;
  profileDiscoverable: boolean;
  agentCanRecommendMe: boolean;
  agentCanStartChatAfterApproval: boolean;
  hideSensitiveTags: boolean;
};

export type FitMeetUploadImage = {
  id?: number;
  assetId?: number;
  asset_id?: number;
  url: string;
  width?: number | null;
  height?: number | null;
  moderationStatus?: string;
  moderation_status?: string;
};

export type FitMeetProfilePhoto = {
  id: number;
  assetId?: number;
  asset_id?: number;
  url: string;
  sortOrder?: number;
  sort_order?: number;
  isCover?: boolean;
  is_cover?: boolean;
  status?: string;
  moderationStatus?: string;
  moderation_status?: string;
  width?: number | null;
  height?: number | null;
};

export type UserAdvantage = {
  id: string;
  title: string;
  advantageType?: string;
  specialties?: string[];
  serviceArea?: string | null;
  availableTime?: string | null;
  pricing?: string | null;
  acceptsHomeVisit?: boolean | null;
  serviceBoundary?: string | null;
  visibility?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserVerification = {
  id: string;
  verificationType?: string;
  title: string;
  status: string;
  badgeTitle?: string | null;
  evidenceAssetIds?: number[];
  reviewerNote?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicUserProfile = {
  id: number;
  name: string;
  avatar?: string | null;
  city?: string | null;
  status?: string;
};

export type FitMeetDemand = {
  id: string;
  type: string;
  title: string;
  summary: string;
  fields: Array<{ title: string; value: string }>;
  visibility: "hidden" | "public";
  hallTarget: string;
  category: string;
  status: string;
  candidateCount: number;
  capacityMin: number;
  capacityMax: number;
  acceptedParticipantCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type FitMeetDemandCandidate = {
  candidateRecordId: number;
  candidateUserId: number;
  displayName: string;
  nickname?: string;
  age?: number | null;
  avatar?: string | null;
  color?: string;
  city?: string | null;
  level?: string | null;
  distanceKm?: number | null;
  score?: number | null;
  matchScore?: number | null;
  commonTags?: string[];
  interestTags?: string[];
  reasons?: string[];
  matchReasons?: string[];
  suggestedOpener?: string;
  suggestedMessage?: string;
  candidateExplanation?: { safeFirstStep?: string; nextActionSuggestion?: string; requiresConfirmation?: boolean };
  riskWarnings?: string[];
  status: string;
  safetyState?: string;
  verificationStatus?: string;
  profileCompleteness?: number | null;
  dataQuality?: string;
  moderationState?: string;
  isOnline?: boolean | null;
  onlineStatus?: string | null;
  lastActiveText?: string | null;
  emotionalInsight?: string | null;
  lifeGraphExplanation?: {
    usedSignals?: string[];
    missingSignals?: string[];
    boundaryNotes?: string[];
    confidenceLevel?: string;
  };
};

export type FitMeetConversation = {
  id: string;
  conversationId?: string;
  displayName?: string;
  username?: string;
  title?: string;
  lastMessage?: string;
  unread?: number;
  time?: string;
  avatar?: string | null;
  updatedAt?: string;
  status?: string;
  peer?: { id: number; name?: string; avatar?: string | null };
};

export type FitMeetConversationMessage = {
  id: string;
  conversationId?: string;
  senderId?: number;
  text: string;
  body?: { text?: string };
  createdAt: string;
  status?: string;
  lifecycleStatus?: string;
};

export type FitMeetAgentMemory = {
  id: string;
  memoryType: string;
  memoryKey?: string;
  value?: string | null;
  summary?: string | null;
  status: string;
  source?: string;
  sensitivity?: string;
  confidence?: number;
  createdAt?: string;
};

export type AgentToolCall = {
  id?: string;
  type?: string;
  function?: { name?: string; arguments?: string };
};

export type AgentCompletionResponse = {
  content?: string;
  reply?: string;
  message?: string | { content?: string; tool_calls?: AgentToolCall[] };
  choices?: Array<{ message?: { content?: string; tool_calls?: AgentToolCall[] }; text?: string }>;
};

export type FeedPost = {
  id: number;
  userId: number;
  username: string;
  city?: string | null;
  text: string;
  title?: string | null;
  tags: string[];
  likes: number;
  comments: number;
  images: Array<{ url: string; assetId?: number }>;
  createdAt: string;
  color?: string;
  emoji?: string;
  moderationState?: string;
  safetyState?: string;
};

export type FeedPage = {
  data: FeedPost[];
  metadata?: {
    total: number;
    page: number;
    lastPage: number;
  };
};

export type FeedComment = {
  id: number;
  postId: number;
  userId: number;
  authorName: string;
  authorAvatar?: string | null;
  body: string;
  createdAt: string;
  updatedAt?: string;
  canDelete: boolean;
};

export type FeedCommentPage = {
  data: FeedComment[];
  metadata?: {
    total: number;
    page: number;
    lastPage: number;
  };
};

export type FitMeetPublicIntent = {
  id: string;
  ownerId?: number;
  title?: string;
  summary?: string;
  text?: string;
  city?: string | null;
  tags?: string[];
  fields?: Array<{ title: string; value: string }>;
  timeWindow?: string | null;
  locationText?: string | null;
  activityType?: string | null;
  status?: string;
};

export type FitMeetIntentApplication = {
  id: number;
  publicIntentId?: string;
  taskIntentId?: string;
  ownerUserId?: number;
  applicantUserId?: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message?: string;
};

export type Conversation = {
  id: string;
  userId?: number;
  displayName: string;
  lastMessage?: string;
  unread?: number;
  updatedAt?: string;
};

export type ConversationMessage = {
  id: string;
  role: "user" | "peer" | "assistant";
  text: string;
  createdAt: string;
};

export type DemandDraftSession = {
  id: string;
  sourceConversationId: string | null;
  rawUserIntent: string;
  demandType: string;
  flowKind: string;
  hallTarget: string;
  category: string;
  knownFields: Record<string, string>;
  missingFields: string[];
  lastQuestion: string;
  canGenerateCard: boolean;
  userConfirmedGenerate: boolean;
  status: string;
  generatedCardId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentThread = {
  id: string;
  title: string;
  status: "active" | "deleted" | string;
  lastSequence: number;
  preview?: string | null;
  messageCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type AgentThreadEntry = {
  id: string;
  threadId: string;
  sequence: number;
  kind: "message" | "tool_proposal" | "tool_resolution" | string;
  role: "user" | "assistant" | null;
  content: string | null;
  toolName: string | null;
  toolStatus: string | null;
  payload: Record<string, unknown>;
  clientTurnId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentThreadDetail = {
  thread: AgentThread;
  entries: AgentThreadEntry[];
  activeDraft: DemandDraftSession | null;
  toolManifest: unknown[];
};

export type AgentThreadTurn = {
  thread: AgentThread;
  entries: AgentThreadEntry[];
  activeDraft?: DemandDraftSession | null;
  executionMode?: "social_chat_v1" | "social_task_v1";
  toolManifest?: unknown[];
  idempotent?: boolean;
};

export type AgentInboxEvent = {
  id: string;
  type?: string;
  title?: string;
  body?: string;
  status?: string;
  createdAt?: string;
  relatedUserId?: number | null;
  relatedCandidateId?: number | null;
  payload?: Record<string, unknown>;
};

export type AgentInboxEventPage = {
  items: AgentInboxEvent[];
  total?: number;
  nextCursor?: string | null;
};

export type RelationshipState = "none" | "pending" | "friends" | "blocked";

export type FitMeetConnectionRequest = {
  id: number;
  requesterId: number;
  targetUserId: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message: string;
  requesterName?: string;
  targetName?: string;
  createdAt?: string;
};

export type MeetInvitationDraft = {
  inviteeUserId: number;
  demandId: string;
  candidateRecordId: number;
  title: string;
  message: string;
  activityType: string;
  city: string;
  locationText: string;
  timeWindow: string;
  capacityMax: number;
  sourceType: "agent_candidate" | "demand" | "profile";
  sourceId?: string;
};

export type MeetInvitationStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type MeetInvitationRole = "sender" | "recipient";

export type MeetInvitation = MeetInvitationDraft & {
  id: number;
  status: MeetInvitationStatus;
  role?: MeetInvitationRole;
  inviterUserId?: number;
  inviteeUserId?: number;
  meetId?: number | null;
  acceptedMeetId?: number | null;
  conversation?: { id?: string; conversationId?: string } | null;
  createdAt?: string;
};

export type DemandCandidateBehavior = "viewed" | "saved" | "dismissed" | "invited" | "reported";

export type MeetLifecycleStatus = "scheduled" | "arrived" | "completed" | "cancelled" | "no_show";

export type MeetReviewPayload = {
  rating: number;
  tags?: string[];
  note?: string;
};

export type SafetyReportPayload = {
  targetUserId?: number;
  targetType: "feed_post" | "user" | "message" | "meet";
  targetId: string | number;
  reason: string;
  description?: string;
};

export type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  idempotencyKey?: string;
};
