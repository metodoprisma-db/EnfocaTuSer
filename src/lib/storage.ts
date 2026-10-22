import {
  LEGACY_LOCAL_STORAGE_KEY,
  LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import {
  accountStorageKey,
  claimGuestRecord,
  completeGuestRecord,
  readGuestState,
  readScopedRecord,
  writeGuestRecord,
  writeMigratedGuestRecord,
  writeMigratedRecord,
  writeScopedRecord,
} from "@/lib/storage-scope";
import type { AppData, UserProfile } from "@/types/app";

function localDate() {
  const parts = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function createDefaultProfile(): UserProfile {
  return {
    email: null,
    billingEmail: null,
    displayName: null,
    role: "user",
    timezone: null,
    timezoneManual: false,
    presenceDaysCount: 1,
    currentRhythmCount: 1,
    lastActiveDate: localDate(),
    planType: "free_beta",
    subscriptionStatus: "active",
    accessUntil: null,
  };
}

export function createEmptyData(): AppData {
  return {
    version: 2,
    progress: [],
    practiceSessions: [],
    journalEntries: [],
    assessments: [],
    profile: createDefaultProfile(),
    lastCompassEmotion: "Temor",
    giftUnlockedAt: null,
    syncedUserIds: [],
    sync: {
      pendingJournalDeletes: [],
      pendingProgressDeletes: [],
      clearAll: false,
      profilePatch: {},
    },
  };
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "00000000-0000-4000-8000-" + Date.now().toString().padStart(12, "0").slice(-12);
}

function normalizeData(parsed: Partial<AppData> | null | undefined): AppData {
  if (!parsed) return createEmptyData();
  const defaultProfile = createDefaultProfile();
  const parsedProfile = parsed.profile as Partial<UserProfile> | undefined;

  return {
    version: 2,
    progress: Array.isArray(parsed.progress) ? parsed.progress : [],
    practiceSessions: Array.isArray(parsed.practiceSessions)
      ? parsed.practiceSessions
      : [],
    journalEntries: Array.isArray(parsed.journalEntries)
      ? parsed.journalEntries
      : [],
    assessments: Array.isArray(parsed.assessments) ? parsed.assessments : [],
    profile: {
      ...defaultProfile,
      ...(parsedProfile ?? {}),
    },
    lastCompassEmotion:
      typeof parsed.lastCompassEmotion === "string"
        ? parsed.lastCompassEmotion
        : "Temor",
    giftUnlockedAt:
      typeof parsed.giftUnlockedAt === "string"
        ? parsed.giftUnlockedAt
        : null,
    syncedUserIds: Array.isArray(parsed.syncedUserIds)
      ? parsed.syncedUserIds.filter(
          (userId): userId is string => typeof userId === "string",
        )
      : [],
    sync: {
      pendingJournalDeletes: Array.isArray(
        parsed.sync?.pendingJournalDeletes,
      )
        ? parsed.sync.pendingJournalDeletes.filter(
            (id): id is string => typeof id === "string",
          )
        : [],
      pendingProgressDeletes: Array.isArray(
        parsed.sync?.pendingProgressDeletes,
      )
        ? parsed.sync.pendingProgressDeletes.filter(
            (entry) =>
              Boolean(entry) &&
              (entry.kind === "discovery" || entry.kind === "extra") &&
              Number.isInteger(entry.itemIndex),
          )
        : [],
      clearAll: parsed.sync?.clearAll === true,
      profilePatch:
        parsed.sync?.profilePatch && typeof parsed.sync.profilePatch === "object"
          ? parsed.sync.profilePatch
          : {},
    },
  };
}

function readLegacyData() {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage.getItem(LOCAL_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);
    return raw ? normalizeData(JSON.parse(raw) as Partial<AppData>) : null;
  } catch {
    return null;
  }
}

export function readGuestData(): AppData {
  if (typeof window === "undefined") return createEmptyData();
  const state = readGuestState<Partial<AppData>>(
    window.localStorage,
  );
  if (state?.active) return normalizeData(state.active);
  if (state) return createEmptyData();

  const legacy = readLegacyData();
  if (legacy && legacy.syncedUserIds.length === 0) {
    writeMigratedGuestRecord(
      window.localStorage,
      legacy,
      [LOCAL_STORAGE_KEY, LEGACY_LOCAL_STORAGE_KEY],
    );
    return legacy;
  }
  return createEmptyData();
}

export function readUserData(userId: string): AppData {
  if (typeof window === "undefined") return createEmptyData();
  const stored = readScopedRecord<Partial<AppData>>(
    window.localStorage,
    accountStorageKey(userId),
  );
  if (stored) return normalizeData(stored);

  const legacy = readLegacyData();
  if (
    legacy &&
    legacy.syncedUserIds.length === 1 &&
    legacy.syncedUserIds[0] === userId
  ) {
    writeMigratedRecord(
      window.localStorage,
      accountStorageKey(userId),
      legacy,
      [LOCAL_STORAGE_KEY, LEGACY_LOCAL_STORAGE_KEY],
    );
    return legacy;
  }
  return createEmptyData();
}

export function claimGuestDataForUser(userId: string) {
  if (typeof window === "undefined") return null;
  const record = claimGuestRecord<Partial<AppData>>(
    window.localStorage,
    userId,
  );
  return record ? normalizeData(record.data) : null;
}

export function completeGuestMigration(userId: string) {
  if (typeof window === "undefined") return false;
  return completeGuestRecord(window.localStorage, userId);
}

export function writeScopedData(data: AppData, userId: string | null) {
  if (typeof window === "undefined") return false;
  if (userId) {
    return writeScopedRecord(
      window.localStorage,
      accountStorageKey(userId),
      data,
    );
  }
  return writeGuestRecord(window.localStorage, data);
}

export function readLocalData() {
  return readGuestData();
}

export function writeLocalData(data: AppData) {
  return writeScopedData(data, null);
}

export function exportLocalData(data: AppData) {
  if (typeof window === "undefined") return;

  const blob = new Blob(
    [
      JSON.stringify(
        {
          app: "Enfoca Tu Ser",
          exportedAt: new Date().toISOString(),
          data,
        },
        null,
        2,
      ),
    ],
    { type: "application/json;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "mi-diario-enfoca-tu-ser.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
