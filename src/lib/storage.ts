import {
  LEGACY_LOCAL_STORAGE_KEY,
  LOCAL_STORAGE_KEY,
} from "@/lib/constants";
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
  };
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "00000000-0000-4000-8000-" + Date.now().toString().padStart(12, "0").slice(-12);
}

export function readLocalData(): AppData {
  if (typeof window === "undefined") {
    return createEmptyData();
  }

  try {
    const raw =
      window.localStorage.getItem(LOCAL_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);
    if (!raw) {
      return createEmptyData();
    }

    const parsed = JSON.parse(raw) as Partial<AppData>;
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
      assessments: Array.isArray(parsed.assessments)
        ? parsed.assessments
        : [],
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
        ? parsed.syncedUserIds
        : [],
    };
  } catch {
    return createEmptyData();
  }
}

export function writeLocalData(data: AppData) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // La aplicación conserva el estado de React aunque el navegador bloquee storage.
  }
}

export function exportLocalData(data: AppData) {
  if (typeof window === "undefined") {
    return;
  }

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
