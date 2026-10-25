export type CatalogKind = "discovery" | "extra";

export interface IntegrationInvitation {
  title: string;
  text: string;
  reminder: string;
}

export interface CatalogItem {
  id: string;
  slug: string;
  index: number;
  number: number;
  kind: CatalogKind;
  title: string;
  description: string;
  focus?: string;
  whyItMatters?: string;
  presence?: string;
  insight: string;
  perspectives?: string[];
  prompts: string[];
  action: string;
  seed: string;
  mentorNote: string;
  closing?: string;
  integrationInvitation?: IntegrationInvitation;
  audioUrl?: string;
  hasGift?: boolean;
}

export interface CompassFrequency {
  emotion: string;
  value: string;
  guidance: string;
  discoverySlug: string;
}

export interface CompassZone {
  id: string;
  stage: "Oruga" | "Crisálida" | "Mariposa";
  leadership: string;
  calibration: string;
  title: string;
  detail: string;
  frequencies: CompassFrequency[];
}

export interface ProgressEntry {
  id: string;
  kind: CatalogKind;
  itemIndex: number;
  completedAt: string;
}

export interface PracticeSession {
  id: string;
  feeling: string;
  situation: string;
  bodyPlace: string;
  thoughtsReleased: string[];
  intensityBefore: number;
  intensityAfter: number;
  releaseNote: string;
  createdAt: string;
}

export type JournalEntryType = "free" | "discovery" | "extra" | "practice";

export interface JournalEntry {
  id: string;
  entryType: JournalEntryType;
  itemIndex: number | null;
  title: string;
  content: string;
  practiceSessionId: string | null;
  createdAt: string;
}

export type AssessmentStage = "initial" | "final";

export interface UserAssessment {
  id: string;
  stage: AssessmentStage;
  calmScore: number;
  selfKindnessScore: number;
  clarityScore: number;
  peaceScore: number;
  reflectionNote: string;
  createdAt: string;
}

export type PlanType =
  | "free_beta"
  | "trial"
  | "promo_pass"
  | "member"
  | "lifetime";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "grace_period"
  | "inactive";

export interface UserProfile {
  email: string | null;
  billingEmail: string | null;
  displayName: string | null;
  role: "user" | "admin";
  timezone: string | null;
  timezoneManual: boolean;
  presenceDaysCount: number;
  currentRhythmCount: number;
  lastActiveDate: string | null;
  planType: PlanType;
  subscriptionStatus: SubscriptionStatus;
  accessUntil: string | null;
  reminderEnabled: boolean;
}

export interface PendingProfilePatch {
  lastCompassEmotion?: string;
  timezone?: string;
  timezoneManual?: boolean;
  presenceDaysCount?: number;
  currentRhythmCount?: number;
  lastActiveDate?: string | null;
  giftUnlockedAt?: string | null;
  reminderEnabled?: boolean;
}

export interface LocalSyncState {
  pendingJournalDeletes: string[];
  pendingProgressDeletes: Array<{
    kind: CatalogKind;
    itemIndex: number;
  }>;
  clearAll: boolean;
  profilePatch: PendingProfilePatch;
}

export interface AppAnnouncement {
  id: string;
  title: string;
  message: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  variant: "warm" | "butterfly" | "deep";
  startsAt: string | null;
  endsAt: string | null;
}

export interface AppData {
  version: 2;
  progress: ProgressEntry[];
  practiceSessions: PracticeSession[];
  journalEntries: JournalEntry[];
  assessments: UserAssessment[];
  profile: UserProfile;
  lastCompassEmotion: string;
  giftUnlockedAt: string | null;
  syncedUserIds: string[];
  sync: LocalSyncState;
}

export interface AppStats {
  discoveriesCompleted: number;
  pausesCompleted: number;
  journalEntries: number;
  reflectionsWritten: number;
}
