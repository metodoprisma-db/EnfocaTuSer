import type { SupabaseClient } from "@supabase/supabase-js";

import { JOURNAL_PAGE_SIZE } from "@/lib/constants";
import {
  createJournalPage,
  type JournalCursor,
} from "@/lib/journal-pagination";
import { mergeAccountData } from "@/lib/supabase/merge";
import type {
  AppAnnouncement,
  AppData,
  JournalEntry,
  PracticeSession,
  ProgressEntry,
  UserAssessment,
} from "@/types/app";

function mapProgress(row: {
  id: string;
  item_type: "discovery" | "extra";
  item_index: number;
  completed_at: string;
}): ProgressEntry {
  return {
    id: row.id,
    kind: row.item_type,
    itemIndex: row.item_index,
    completedAt: row.completed_at,
  };
}

function mapPractice(row: {
  id: string;
  feeling: string;
  situation: string | null;
  body_place: string | null;
  thoughts_released: string[];
  intensity_before: number;
  intensity_after: number;
  release_note: string | null;
  created_at: string;
}): PracticeSession {
  return {
    id: row.id,
    feeling: row.feeling,
    situation: row.situation ?? "",
    bodyPlace: row.body_place ?? "",
    thoughtsReleased: row.thoughts_released ?? [],
    intensityBefore: row.intensity_before,
    intensityAfter: row.intensity_after,
    releaseNote: row.release_note ?? "",
    createdAt: row.created_at,
  };
}

function mapJournal(row: {
  id: string;
  entry_type: JournalEntry["entryType"];
  item_index: number | null;
  title: string;
  content: string;
  practice_session_id: string | null;
  created_at: string;
}): JournalEntry {
  return {
    id: row.id,
    entryType: row.entry_type,
    itemIndex: row.item_index,
    title: row.title,
    content: row.content,
    practiceSessionId: row.practice_session_id,
    createdAt: row.created_at,
  };
}

function mapAssessment(row: {
  id: string;
  stage: UserAssessment["stage"];
  calm_score: number;
  self_kindness_score: number;
  clarity_score: number;
  peace_score: number;
  reflection_note: string | null;
  created_at: string;
}): UserAssessment {
  return {
    id: row.id,
    stage: row.stage,
    calmScore: row.calm_score,
    selfKindnessScore: row.self_kindness_score,
    clarityScore: row.clarity_score,
    peaceScore: row.peace_score,
    reflectionNote: row.reflection_note ?? "",
    createdAt: row.created_at,
  };
}

function throwIfError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

async function applyPendingDeletes(
  client: SupabaseClient,
  userId: string,
  local: AppData,
) {
  if (local.sync.clearAll) {
    for (const table of [
      "journal_entries",
      "practice_sessions",
      "user_progress",
      "user_assessments",
    ]) {
      const { error } = await client.from(table).delete().eq("user_id", userId);
      throwIfError(error);
    }
    const { error } = await client
      .from("profiles")
      .update({ last_compass_emotion: "Temor", gift_unlocked_at: null })
      .eq("id", userId);
    throwIfError(error);
    return;
  }

  if (local.sync.pendingJournalDeletes.length > 0) {
    const { error } = await client
      .from("journal_entries")
      .delete()
      .eq("user_id", userId)
      .in("id", local.sync.pendingJournalDeletes);
    throwIfError(error);
  }

  for (const entry of local.sync.pendingProgressDeletes) {
    const { error } = await client
      .from("user_progress")
      .delete()
      .eq("user_id", userId)
      .eq("item_type", entry.kind)
      .eq("item_index", entry.itemIndex);
    throwIfError(error);
  }
}

async function applyPendingProfilePatch(
  client: SupabaseClient,
  userId: string,
  local: AppData,
) {
  const patch = local.sync.profilePatch;
  const payload: Record<string, unknown> = {};
  if (patch.lastCompassEmotion !== undefined) {
    payload.last_compass_emotion = patch.lastCompassEmotion;
  }
  if (patch.timezone !== undefined) payload.timezone = patch.timezone;
  if (patch.timezoneManual !== undefined) {
    payload.timezone_manual = patch.timezoneManual;
  }
  if (patch.presenceDaysCount !== undefined) {
    payload.presence_days_count = patch.presenceDaysCount;
  }
  if (patch.currentRhythmCount !== undefined) {
    payload.current_rhythm_count = patch.currentRhythmCount;
  }
  if (patch.lastActiveDate !== undefined) {
    payload.last_active_date = patch.lastActiveDate;
  }
  if (patch.giftUnlockedAt !== undefined) {
    payload.gift_unlocked_at = patch.giftUnlockedAt;
  }

  if (Object.keys(payload).length > 0) {
    const { error } = await client
      .from("profiles")
      .update(payload)
      .eq("id", userId);
    throwIfError(error);
  }
}

export async function syncDataWithSupabase(
  client: SupabaseClient,
  userId: string,
  local: AppData,
) {
  await applyPendingDeletes(client, userId, local);
  await applyPendingProfilePatch(client, userId, local);

  const [
    progressResult,
    practicesResult,
    journalResult,
    assessmentResult,
    profileResult,
  ] = await Promise.all([
    client
      .from("user_progress")
      .select("id,item_type,item_index,completed_at")
      .eq("user_id", userId),
    client
      .from("practice_sessions")
      .select(
        "id,feeling,situation,body_place,thoughts_released,intensity_before,intensity_after,release_note,created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    client
      .from("journal_entries")
      .select(
        "id,entry_type,item_index,title,content,practice_session_id,created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(JOURNAL_PAGE_SIZE + 1),
    client
      .from("user_assessments")
      .select(
        "id,stage,calm_score,self_kindness_score,clarity_score,peace_score,reflection_note,created_at",
      )
      .eq("user_id", userId),
    client
      .from("profiles")
      .select(
        "email,billing_email,display_name,role,last_compass_emotion,timezone,timezone_manual,presence_days_count,current_rhythm_count,last_active_date,gift_unlocked_at,plan_type,subscription_status,access_until",
      )
      .eq("id", userId)
      .single(),
  ]);

  throwIfError(progressResult.error);
  throwIfError(practicesResult.error);
  throwIfError(journalResult.error);
  throwIfError(assessmentResult.error);
  throwIfError(profileResult.error);

  const remoteProgress = (progressResult.data ?? []).map(mapProgress);
  const remotePractices = (practicesResult.data ?? []).map(mapPractice);
  const journalPage = createJournalPage(
    (journalResult.data ?? []).map(mapJournal),
    JOURNAL_PAGE_SIZE,
  );
  const remoteJournal = journalPage.entries;
  const remoteAssessments = (assessmentResult.data ?? []).map(mapAssessment);
  const profile = profileResult.data;
  const merged = mergeAccountData(
    {
      progress: local.progress,
      practiceSessions: local.practiceSessions,
      journalEntries: local.journalEntries,
      assessments: local.assessments,
      pendingJournalDeletes: local.sync.pendingJournalDeletes,
      pendingProgressDeletes: local.sync.pendingProgressDeletes,
    },
    {
      progress: remoteProgress,
      practiceSessions: remotePractices,
      journalEntries: remoteJournal,
      assessments: remoteAssessments,
    },
  );

  if (merged.progress.length > 0) {
    const { error } = await client.from("user_progress").upsert(
      merged.progress.map((entry) => ({
        user_id: userId,
        item_type: entry.kind,
        item_index: entry.itemIndex,
        completed_at: entry.completedAt,
      })),
      { onConflict: "user_id,item_type,item_index" },
    );
    throwIfError(error);
  }
  if (merged.practiceSessions.length > 0) {
    const { error } = await client.from("practice_sessions").upsert(
      merged.practiceSessions.map((entry) => ({
        id: entry.id,
        user_id: userId,
        feeling: entry.feeling,
        situation: entry.situation || null,
        body_place: entry.bodyPlace || null,
        thoughts_released: entry.thoughtsReleased,
        intensity_before: entry.intensityBefore,
        intensity_after: entry.intensityAfter,
        release_note: entry.releaseNote || null,
        created_at: entry.createdAt,
      })),
      { onConflict: "id" },
    );
    throwIfError(error);
  }
  if (merged.journalEntries.length > 0) {
    const { error } = await client.from("journal_entries").upsert(
      merged.journalEntries.map((entry) => ({
        id: entry.id,
        user_id: userId,
        entry_type: entry.entryType,
        item_index: entry.itemIndex,
        title: entry.title,
        content: entry.content,
        practice_session_id: entry.practiceSessionId,
        created_at: entry.createdAt,
      })),
      { onConflict: "id" },
    );
    throwIfError(error);
  }
  if (merged.assessments.length > 0) {
    const { error } = await client.from("user_assessments").upsert(
      merged.assessments.map((entry) => ({
        id: entry.id,
        user_id: userId,
        stage: entry.stage,
        calm_score: entry.calmScore,
        self_kindness_score: entry.selfKindnessScore,
        clarity_score: entry.clarityScore,
        peace_score: entry.peaceScore,
        reflection_note: entry.reflectionNote || null,
        created_at: entry.createdAt,
      })),
      { onConflict: "user_id,stage" },
    );
    throwIfError(error);
  }

  const completedDiscoveries = new Set(
    merged.progress
      .filter((entry) => entry.kind === "discovery")
      .map((entry) => entry.itemIndex),
  );
  if ([0, 1, 2, 3, 4].every((index) => completedDiscoveries.has(index))) {
    const unlockedAt = local.giftUnlockedAt ?? new Date().toISOString();
    const { error } = await client
      .from("profiles")
      .update({ gift_unlocked_at: unlockedAt })
      .eq("id", userId)
      .is("gift_unlocked_at", null);
    throwIfError(error);
  }

  return {
    data: {
      ...local,
      version: 2,
      progress: merged.progress,
      practiceSessions: merged.practiceSessions,
      journalEntries: merged.journalEntries,
      assessments: merged.assessments,
      profile: {
        email: profile?.email ?? local.profile.email,
        billingEmail: profile?.billing_email ?? local.profile.billingEmail,
        displayName: profile?.display_name ?? local.profile.displayName,
        role: profile?.role === "admin" ? "admin" : "user",
        timezone: profile?.timezone ?? null,
        timezoneManual: profile?.timezone_manual ?? false,
        presenceDaysCount:
          profile?.presence_days_count ?? local.profile.presenceDaysCount,
        currentRhythmCount:
          profile?.current_rhythm_count ?? local.profile.currentRhythmCount,
        lastActiveDate:
          profile?.last_active_date ?? local.profile.lastActiveDate,
        planType: profile?.plan_type ?? local.profile.planType,
        subscriptionStatus:
          profile?.subscription_status ?? local.profile.subscriptionStatus,
        accessUntil: profile?.access_until ?? local.profile.accessUntil,
      },
      lastCompassEmotion:
        profile?.last_compass_emotion ?? local.lastCompassEmotion,
      giftUnlockedAt:
        profile?.gift_unlocked_at ?? local.giftUnlockedAt,
      syncedUserIds: [userId],
      sync: {
        pendingJournalDeletes: [],
        pendingProgressDeletes: [],
        clearAll: false,
        profilePatch: {},
      },
    } satisfies AppData,
    journalPage,
  };
}

export async function loadCurrentAnnouncement(client: SupabaseClient) {
  const { data, error } = await client
    .from("app_announcements")
    .select(
      "id,title,message,cta_label,cta_url,variant,starts_at,ends_at",
    )
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  throwIfError(error);
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    message: data.message,
    ctaLabel: data.cta_label,
    ctaUrl: data.cta_url,
    variant: data.variant,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
  } as AppAnnouncement;
}

export async function loadOlderJournalEntries(
  client: SupabaseClient,
  userId: string,
  cursor: JournalCursor,
) {
  const filter =
    "created_at.lt." +
    cursor.createdAt +
    ",and(created_at.eq." +
    cursor.createdAt +
    ",id.lt." +
    cursor.id +
    ")";
  const { data, error } = await client
    .from("journal_entries")
    .select(
      "id,entry_type,item_index,title,content,practice_session_id,created_at",
    )
    .eq("user_id", userId)
    .or(filter)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(JOURNAL_PAGE_SIZE + 1);

  throwIfError(error);
  return createJournalPage(
    (data ?? []).map(mapJournal),
    JOURNAL_PAGE_SIZE,
  );
}
