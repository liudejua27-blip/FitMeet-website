/**
 * Web representation of the MobileAPI contract.
 *
 * Source of truth: FitMeetAlpha/Networking/FitMeetCoreEndpoint.swift.
 * Keep the path names and request semantics aligned with iOS and the
 * mini-program client; this module deliberately does not invent web-only
 * endpoints.
 */
export const FITMEET_API_BASE_URL = process.env.NEXT_PUBLIC_FITMEET_API_BASE_URL ?? "https://api.fitmeet.cn/api";
export const FITMEET_REALTIME_BASE_URL = FITMEET_API_BASE_URL.replace(/\/api\/?$/, "");

export const fitMeetPaths = {
  // The API currently exposes one shared public capability manifest under the
  // iOS-compatible path. It is platform-neutral in shape and is consumed by
  // every authenticated client to keep rollout and maintenance gates aligned.
  appConfig: "/app-config/ios",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    resendEmailVerification: "/auth/email/verification/resend",
    verifyEmail: "/auth/email/verify",
    forgotPassword: "/auth/password/forgot",
    resetPassword: "/auth/password/reset",
    sendSmsCode: "/auth/sms/send",
    phoneLogin: "/auth/sms/verify",
    bindPhone: "/auth/phone/bind",
    wechatLogin: "/auth/wechat/login",
    refresh: "/auth/refresh",
    profile: "/auth/profile",
    sessions: "/auth/sessions",
    session: (id: string) => `/auth/sessions/${encodeURIComponent(id)}`,
  },
  users: {
    profile: "/users/profile",
    account: "/users/me",
    accountExport: "/users/me/export",
    notificationPreferences: "/users/me/notification-preferences",
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
    agentMemoryControl: "/users/me/agent-memory/control",
    agentMemoryUsage: (id: string) =>
      `/users/me/agent-memory/${encodeURIComponent(id)}/usage`,
    agentMemorySuppress: (id: string) =>
      `/users/me/agent-memory/${encodeURIComponent(id)}/suppress`,
    agentMemorySuppression: (memoryType: string) =>
      `/users/me/agent-memory/suppressions/${encodeURIComponent(memoryType)}`,
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
    read: (id: string) => `/messages/conversations/${encodeURIComponent(id)}/read`,
    delivered: (id: string) => `/messages/conversations/${encodeURIComponent(id)}/delivered`,
    memberSettings: (id: string) => `/messages/conversations/${encodeURIComponent(id)}/member-settings`,
    recall: (id: string) => `/messages/${encodeURIComponent(id)}/recall`,
    report: (id: string) => `/messages/${encodeURIComponent(id)}/report`,
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
  search: "/search",
  meets: {
    confirm: (id: number) => `/meets/${id}/confirm`,
    cancel: (id: number) => `/meets/${id}/cancel`,
    complete: (id: number) => `/meets/${id}/complete`,
    noShow: (id: number) => `/meets/${id}/no-show`,
    reviews: (id: number) => `/meets/${id}/reviews`,
  },
  groups: {
    root: "/groups",
    detail: (id: string) => `/groups/${encodeURIComponent(id)}`,
    join: (id: string) => `/groups/${encodeURIComponent(id)}/join`,
    leave: (id: string) => `/groups/${encodeURIComponent(id)}/leave`,
    cancel: (id: string) => `/groups/${encodeURIComponent(id)}/cancel`,
    polls: (id: string) => `/groups/${encodeURIComponent(id)}/polls`,
    vote: (id: string, pollId: string) =>
      `/groups/${encodeURIComponent(id)}/polls/${encodeURIComponent(pollId)}/vote`,
    finalizePoll: (id: string, pollId: string) =>
      `/groups/${encodeURIComponent(id)}/polls/${encodeURIComponent(pollId)}/finalize`,
    checkIn: (id: string) => `/groups/${encodeURIComponent(id)}/check-in`,
    memberRole: (id: string, membershipId: number) =>
      `/groups/${encodeURIComponent(id)}/members/${membershipId}/role`,
    removeMember: (id: string, membershipId: number) =>
      `/groups/${encodeURIComponent(id)}/members/${membershipId}/remove`,
    chatMode: (id: string) => `/groups/${encodeURIComponent(id)}/chat-mode`,
    resolveRequest: (id: string, membershipId: number, decision: "approve" | "reject") =>
      `/groups/${encodeURIComponent(id)}/requests/${membershipId}/${decision}`,
  },
  safety: {
    reports: "/safety/reports",
    blocks: "/safety/blocks",
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

export type FitMeetAuthSessionRecord = {
  id: string;
  platform: string;
  appVersion: string | null;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string | null;
  isCurrent: boolean;
};

export type FitMeetAuthSessionPage = {
  items: FitMeetAuthSessionRecord[];
  total: number;
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

export type EmailRegistrationPending = {
  status: "verification_required";
  emailVerificationRequired: true;
  emailVerificationDelivery: "sent";
};

export type EmailActionResult = {
  status: "accepted" | "verified" | "password_reset";
  message?: string;
  sessionsRevoked?: boolean;
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

export type FitMeetNotificationPreferences = {
  directMessagesEnabled: boolean;
  interactionsEnabled: boolean;
  systemEnabled: boolean;
  updatedAt?: string | null;
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
  bio?: string | null;
  interests?: string[];
  verificationStatus?: string | null;
  relationship?: RelationshipState;
  connectionRequest?: FitMeetConnectionRequest | null;
};

export type FitMeetDemand = {
  id: string;
  sourceConversationId?: string | null;
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
  contextType?: string | null;
  contextId?: string | null;
  isGroup?: boolean;
  memberCount?: number;
  chatMode?: FitMeetGroupChatMode | null;
  canSendMessages?: boolean;
  userId?: number;
  displayName?: string;
  username?: string;
  title?: string;
  lastMessage?: string;
  unread?: number;
  time?: string;
  avatar?: string | null;
  updatedAt?: string;
  status?: string;
  online?: boolean;
  mutedUntil?: string | null;
  pinnedAt?: string | null;
  archivedAt?: string | null;
  notificationLevel?: "normal" | "mentions_only" | "muted" | string;
  peer?: { id: number; name?: string; avatar?: string | null };
};

export type FitMeetConversationMessage = {
  id: string;
  conversationId?: string;
  senderId?: number;
  senderName?: string;
  senderAvatar?: string | null;
  text: string;
  body?: { text?: string };
  createdAt: string;
  updatedAt?: string;
  status?: string;
  lifecycleStatus?: string;
  isMine?: boolean;
  readByOther?: boolean | null;
  messageType?: string;
  clientMessageId?: string | null;
  recalledAt?: string | null;
  moderationStatus?: string;
};

export type FitMeetConversationHistoryPage = {
  items: FitMeetConversationMessage[];
  nextBefore: string | null;
};

export type FitMeetFeatureKey =
  | "agent"
  | "matching"
  | "demandPublishing"
  | "messaging"
  | "voice"
  | "discovery"
  | "multiplayerGroups";

export type FitMeetFeatureAvailability = {
  enabled: boolean;
  rolloutPercentage?: number;
};

export type FitMeetAppConfig = {
  schemaVersion?: number;
  platform?: string;
  launchScope?: string;
  revision?: string;
  generatedAt?: string;
  cacheTTLSeconds?: number;
  maintenance?: {
    enabled: boolean;
    title?: string;
    message?: string;
    retryAfterSeconds?: number;
  };
  authentication?: {
    phoneEnabled?: boolean;
    emailEnabled?: boolean;
    emailRegistrationEnabled?: boolean;
    emailRecoveryEnabled?: boolean;
    appleEnabled?: boolean;
    googleEnabled?: boolean;
  };
  features?: Partial<Record<FitMeetFeatureKey, FitMeetFeatureAvailability>>;
};

export type BlockedUserRecord = {
  id: number;
  name: string;
  avatar?: string | null;
  city?: string | null;
  reason?: string | null;
  blockedAt: string;
};

export type SafetyBlockListResponse = {
  items: Array<{
    blockedUserId: number;
    user: PublicUserProfile;
    reason?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  }>;
  total?: number;
};

export type SafetyReportRecord = {
  id: number;
  targetType?: string | null;
  targetId?: string | null;
  reason?: string | null;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SafetyReportListResponse = {
  items: SafetyReportRecord[];
  total?: number;
};

export type AgentMemoryStatus =
  | 'pending'
  | 'draft'
  | 'proposed'
  | 'confirmed'
  | 'active'
  | 'rejected'
  | 'disabled'
  | 'expired'
  | 'deleted';

export type AgentMemorySensitivity = 'normal' | 'low' | 'medium' | 'sensitive' | 'high' | string;

export type AgentMemoryUseScope =
  | 'agent_and_matching'
  | 'agent_only'
  | 'matching_only'
  | 'paused';

export type AgentMemoryEvidence =
  | string
  | {
      text?: string | null;
      sourceRole?: 'user' | string | null;
      sourceEventId?: string | null;
    };

export type FitMeetAgentMemory = {
  id: string;
  memoryType: string;
  memoryKey?: string;
  value?: string | null;
  summary?: string | null;
  status: AgentMemoryStatus;
  source?: string;
  sourceConversationId?: string | null;
  sourceRunId?: string | null;
  sourceEventId?: string | null;
  sensitivity?: AgentMemorySensitivity;
  evidence?: AgentMemoryEvidence[];
  confidence?: number;
  useScope?: AgentMemoryUseScope;
  revision?: number;
  lastUsedAt?: string | null;
  lastExtractedAt?: string | null;
  userConfirmedAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AgentMemoryMutation = {
  status: AgentMemoryStatus;
  item: FitMeetAgentMemory;
};

export type AgentMemorySuppression = {
  memoryType: string;
  createdAt?: string | null;
};

export type AgentMemoryControl = {
  inferenceEnabled: boolean;
  suppressions: AgentMemorySuppression[];
  updatedAt?: string | null;
};

export type AgentMemoryUsagePurpose = 'agent_context' | 'matching';

export type AgentMemoryUsageEvent = {
  id: string;
  memoryId: string;
  purpose: AgentMemoryUsagePurpose;
  contextType?: 'agent_thread' | 'demand' | string | null;
  contextId?: string | null;
  subjectId?: string | null;
  createdAt: string;
};

export type AgentMemoryUsagePage = {
  items: AgentMemoryUsageEvent[];
  nextCursor?: string | null;
  total?: number;
};

export type AgentMemorySuppressionMutation = {
  status: 'suppressed';
  item: FitMeetAgentMemory;
  control: AgentMemoryControl;
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
  senderId?: number;
  senderName?: string;
  senderAvatar?: string | null;
  readByOther?: boolean | null;
  status?: string;
  lifecycleStatus?: string;
  recalledAt?: string | null;
  clientMessageId?: string | null;
  localStatus?: "sending" | "failed";
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
  stateVersion?: number;
  preview?: string | null;
  messageCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type AgentApproval = {
  id: string;
  runId: string;
  threadId: string;
  proposalId: string | null;
  toolName: string;
  status: string;
  stateVersion: number;
  arguments: Record<string, unknown>;
  expiresAt: string;
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
  pendingApprovals?: AgentApproval[];
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

export type FitMeetSearchType = "agent_thread" | "message" | "friend" | "group";

export type FitMeetSearchResult = {
  id: string;
  type: FitMeetSearchType;
  title: string;
  subtitle?: string | null;
  snippet?: string | null;
  path: string;
  updatedAt?: string | null;
};

export type FitMeetSearchCounts = {
  agent_threads: number;
  messages: number;
  friends: number;
  groups: number;
};

export type FitMeetSearchResponse = {
  query: string;
  items: FitMeetSearchResult[];
  counts: FitMeetSearchCounts;
};

export type AgentInboxScope = 'unread' | 'all' | 'read';

export type AgentInboxEvent = {
  id: string;
  type?: string;
  title?: string;
  body?: string;
  status?: string;
  createdAt?: string;
  acknowledgedAt?: string | null;
  relatedUserId?: number | null;
  relatedCandidateId?: number | null;
  payload?: Record<string, unknown>;
};

export type AgentInboxEventPage = {
  items: AgentInboxEvent[];
  total?: number;
  historyCount?: number;
  unreadCount?: number;
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

export type FitMeetGroupJoinMode = "open" | "request" | "invite_only";
export type FitMeetGroupStatus = "forming" | "confirmed" | "cancelled" | "completed";
export type FitMeetGroupChatMode = "all_members" | "admins_only";
export type FitMeetGroupPollType = "time" | "location";
export type FitMeetGroupPollStatus = "open" | "finalized" | "cancelled";
export type FitMeetGroupAttendanceStatus = "none" | "attending" | "arrived" | "not_attending";
export type FitMeetGroupMemberStatus =
  | "active"
  | "pending"
  | "waitlisted"
  | "left"
  | "rejected"
  | "removed";
export type FitMeetGroupMemberRole = "host" | "cohost" | "member";

export type FitMeetGroupMember = {
  id: number;
  groupId: string;
  userId: number;
  name?: string;
  avatar?: string | null;
  role: FitMeetGroupMemberRole;
  status: FitMeetGroupMemberStatus;
  attendanceStatus?: FitMeetGroupAttendanceStatus;
  joinedAt?: string | null;
  resolvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FitMeetGroupEvent = {
  id: string;
  groupId: string;
  type: string;
  actorUserId?: number | null;
  actorName?: string | null;
  payload?: Record<string, unknown>;
  createdAt: string;
};

export type FitMeetGroupPollOption = {
  id: string;
  pollId: string;
  label: string;
  voteCount: number;
  currentUserVoted: boolean;
};

export type FitMeetGroupPoll = {
  id: string;
  groupId: string;
  type: FitMeetGroupPollType;
  question: string;
  status: FitMeetGroupPollStatus;
  createdByUserId: number;
  createdByName?: string;
  finalOptionId?: string | null;
  closesAt?: string | null;
  options: FitMeetGroupPollOption[];
  createdAt?: string;
  updatedAt?: string;
};

export type FitMeetGroupAttendanceSummary = {
  attending: number;
  arrived: number;
  notAttending: number;
  unconfirmed: number;
};

export type FitMeetGroup = {
  id: string;
  demandId?: string | null;
  hostUserId: number;
  title: string;
  summary: string;
  activityType: string;
  city?: string | null;
  locationText?: string | null;
  timeWindow?: string | null;
  timeFinalizedAt?: string | null;
  locationFinalizedAt?: string | null;
  joinMode: FitMeetGroupJoinMode;
  chatMode: FitMeetGroupChatMode;
  status: FitMeetGroupStatus;
  capacityMin: number;
  capacityMax: number;
  memberCount: number;
  pendingCount: number;
  waitlistCount: number;
  availableSeats: number;
  conversationId?: string | null;
  currentUserRole: FitMeetGroupMemberRole | "none";
  currentUserMembershipStatus: FitMeetGroupMemberStatus | "none";
  currentUserAttendanceStatus: FitMeetGroupAttendanceStatus;
  canManage: boolean;
  canSendGroupMessages: boolean;
  canCheckIn: boolean;
  canJoin: boolean;
  members?: FitMeetGroupMember[];
  requests?: FitMeetGroupMember[];
  polls?: FitMeetGroupPoll[];
  attendanceSummary?: FitMeetGroupAttendanceSummary;
  events?: FitMeetGroupEvent[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateFitMeetGroupPayload = {
  demandId: string;
  title?: string;
  summary?: string;
  activityType?: string;
  city?: string | null;
  locationText?: string | null;
  timeWindow?: string | null;
  joinMode: FitMeetGroupJoinMode;
  capacityMin: number;
  capacityMax: number;
};

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
