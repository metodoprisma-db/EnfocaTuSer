"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import {
  ENFORCE_SUBSCRIPTION,
  JOURNAL_PAGE_SIZE,
} from "@/lib/constants";
import {
  claimGuestDataForUser,
  completeGuestMigration,
  createEmptyData,
  createId,
  exportLocalData,
  readGuestData,
  readUserData,
  writeScopedData,
} from "@/lib/storage";
import type { JournalCursor } from "@/lib/journal-pagination";
import {
  evaluateProgression,
  type ProgressionState,
} from "@/lib/progression";
import { isValidAssessment } from "@/lib/assessment";
import { SerialSyncQueue } from "@/lib/sync-queue";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { mergeAccountData } from "@/lib/supabase/merge";
import {
  loadCurrentAnnouncement,
  loadOlderJournalEntries,
  syncDataWithSupabase,
} from "@/lib/supabase/sync";
import type {
  AppAnnouncement,
  AppData,
  AppStats,
  AssessmentStage,
  CatalogKind,
  JournalEntry,
  JournalEntryType,
  PracticeSession,
  UserAssessment,
} from "@/types/app";

type SyncStatus = "local" | "pending" | "connecting" | "synced" | "error";
type SyncResult = Awaited<ReturnType<typeof syncDataWithSupabase>>;

interface NewJournalEntry {
  entryType: JournalEntryType;
  itemIndex?: number | null;
  title: string;
  content: string;
  practiceSessionId?: string | null;
}

interface AssessmentInput {
  stage: AssessmentStage;
  calmScore: number;
  selfKindnessScore: number;
  clarityScore: number;
  peaceScore: number;
  reflectionNote: string;
}

interface AppStateValue {
  state: {
    data: AppData;
    hydrated: boolean;
    syncStatus: SyncStatus;
    user: User | null;
    visibleJournalCount: number;
    announcement: AppAnnouncement | null;
    rhythmResumed: boolean;
  };
  actions: {
    toggleProgress: (kind: CatalogKind, itemIndex: number) => void;
    addJournalEntry: (entry: NewJournalEntry) => void;
    savePractice: (
      entry: Omit<PracticeSession, "id" | "createdAt">,
    ) => void;
    saveAssessment: (assessment: AssessmentInput) => void;
    deleteJournalEntry: (id: string) => void;
    setCompassEmotion: (emotion: string) => void;
    updateTimezone: (timezone: string, manual: boolean) => Promise<void>;
    claimBillingEmail: (email: string) => Promise<string>;
    dismissRhythmMessage: () => void;
    setReminderEnabled: (enabled: boolean) => void;
    exportData: () => void;
    clearData: () => Promise<void>;
    loadOlder: () => Promise<void>;
  };
  meta: {
    stats: AppStats;
    completedDiscoveries: ReadonlySet<number>;
    completedExtras: ReadonlySet<number>;
    nextDiscoveryIndex: number;
    isDiscoveryUnlocked: (itemIndex: number) => boolean;
    giftUnlocked: boolean;
    pathComplete: boolean;
    initialAssessment: UserAssessment | null;
    finalAssessment: UserAssessment | null;
    journeyDays: number;
    accessExpired: boolean;
    visibleJournalEntries: JournalEntry[];
    hasMoreJournalEntries: boolean;
    progression: ProgressionState;
    unlockIntervalMs: number;
  };
}

const AppStateContext = createContext<AppStateValue | null>(null);

function sortJournal(entries: JournalEntry[]) {
  return entries.toSorted((a, b) => {
    const byDate = b.createdAt.localeCompare(a.createdAt);
    return byDate === 0 ? b.id.localeCompare(a.id) : byDate;
  });
}

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function dateInTimezone(timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function dayDifference(previous: string, current: string) {
  const previousTime = Date.parse(previous + "T00:00:00Z");
  const currentTime = Date.parse(current + "T00:00:00Z");
  if (!Number.isFinite(previousTime) || !Number.isFinite(currentTime)) {
    return 0;
  }
  return Math.round((currentTime - previousTime) / 86_400_000);
}

function applyPresence(data: AppData, timezone: string) {
  const today = dateInTimezone(timezone);
  const previous = data.profile.lastActiveDate;
  if (!previous) {
    return {
      data: {
        ...data,
        profile: {
          ...data.profile,
          lastActiveDate: today,
          presenceDaysCount: Math.max(1, data.profile.presenceDaysCount),
          currentRhythmCount: Math.max(1, data.profile.currentRhythmCount),
        },
      },
      changed: true,
      resumed: false,
    };
  }

  const difference = dayDifference(previous, today);
  if (difference <= 0) {
    return { data, changed: false, resumed: false };
  }

  return {
    data: {
      ...data,
      profile: {
        ...data.profile,
        lastActiveDate: today,
        presenceDaysCount: data.profile.presenceDaysCount + 1,
        currentRhythmCount:
          difference === 1 ? data.profile.currentRhythmCount + 1 : 1,
      },
    },
    changed: true,
    resumed: difference > 1,
  };
}

function inclusiveJourneyDays(data: AppData) {
  const startDates = [
    data.assessments.find((item) => item.stage === "initial")?.createdAt,
    data.progress.find(
      (item) => item.kind === "discovery" && item.itemIndex === 0,
    )?.completedAt,
  ].filter((value): value is string => Boolean(value));
  const endDates = [
    data.assessments.find((item) => item.stage === "final")?.createdAt,
    data.progress.find(
      (item) => item.kind === "discovery" && item.itemIndex === 14,
    )?.completedAt,
  ].filter((value): value is string => Boolean(value));

  if (startDates.length === 0 || endDates.length === 0) return 1;
  const start = Math.min(...startDates.map((value) => Date.parse(value)));
  const end = Math.max(...endDates.map((value) => Date.parse(value)));
  return Math.max(1, Math.floor((end - start) / 86_400_000) + 1);
}

function mergeLocalMigration(account: AppData, guest: AppData | null): AppData {
  if (!guest) return account;
  const merged = mergeAccountData(
    {
      progress: account.progress,
      practiceSessions: account.practiceSessions,
      journalEntries: account.journalEntries,
      assessments: account.assessments,
      pendingJournalDeletes: account.sync.pendingJournalDeletes,
      pendingProgressDeletes: account.sync.pendingProgressDeletes,
    },
    {
      progress: guest.progress,
      practiceSessions: guest.practiceSessions,
      journalEntries: guest.journalEntries,
      assessments: guest.assessments,
    },
  );
  const progressDeletes = new Map(
    [...account.sync.pendingProgressDeletes, ...guest.sync.pendingProgressDeletes].map(
      (entry) => [`${entry.kind}:${entry.itemIndex}`, entry],
    ),
  );

  return {
    ...account,
    progress: merged.progress,
    practiceSessions: merged.practiceSessions,
    journalEntries: merged.journalEntries,
    assessments: merged.assessments,
    lastCompassEmotion:
      account.lastCompassEmotion === "Temor"
        ? guest.lastCompassEmotion
        : account.lastCompassEmotion,
    giftUnlockedAt: account.giftUnlockedAt ?? guest.giftUnlockedAt,
    sync: {
      pendingJournalDeletes: Array.from(
        new Set([
          ...account.sync.pendingJournalDeletes,
          ...guest.sync.pendingJournalDeletes,
        ]),
      ),
      pendingProgressDeletes: Array.from(progressDeletes.values()),
      clearAll: account.sync.clearAll,
      profilePatch: {
        ...guest.sync.profilePatch,
        ...account.sync.profilePatch,
      },
    },
  };
}

export function AppStateProvider({
  children,
  unlockIntervalMs,
}: {
  children: ReactNode;
  unlockIntervalMs: number;
}) {
  const [data, setData] = useState<AppData>(createEmptyData);
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");
  const [user, setUser] = useState<User | null>(null);
  const [announcement, setAnnouncement] =
    useState<AppAnnouncement | null>(null);
  const [rhythmResumed, setRhythmResumed] = useState(false);
  const [visibleJournalCount, setVisibleJournalCount] =
    useState(JOURNAL_PAGE_SIZE);
  const [remoteHasMore, setRemoteHasMore] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);
  const clientRef = useRef<SupabaseClient | null>(null);
  const userRef = useRef<User | null>(null);
  const dataRef = useRef(data);
  const revisionRef = useRef(0);
  const identityRef = useRef("guest");
  const remoteJournalCursorRef = useRef<JournalCursor | null>(null);
  const syncQueueRef = useRef<SerialSyncQueue<AppData, SyncResult> | null>(null);
  const initialAssessment = data.assessments.find(
    (item) => item.stage === "initial" && isValidAssessment(item, "initial"),
  ) ?? null;
  const progression = useMemo(
    () => evaluateProgression(
      data.progress,
      currentTimestamp ?? 0,
      unlockIntervalMs,
      Boolean(initialAssessment),
    ),
    [currentTimestamp, data.progress, initialAssessment, unlockIntervalMs],
  );

  useEffect(() => {
    let active = true;
    const refreshTimestamp = () => {
      if (active) setCurrentTimestamp(Date.now());
    };
    queueMicrotask(refreshTimestamp);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshTimestamp();
    };
    window.addEventListener("focus", refreshTimestamp);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshTimestamp);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  useEffect(() => {
    if (currentTimestamp === null || !progression.nextUnlockAt) return;
    const remaining = Date.parse(progression.nextUnlockAt) - Date.now();
    const timeoutId = window.setTimeout(
      () => setCurrentTimestamp(Date.now()),
      Math.max(0, remaining) + 25,
    );
    return () => window.clearTimeout(timeoutId);
  }, [currentTimestamp, progression.nextUnlockAt]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const stored = readGuestData();
      const detectedTimezone = browserTimezone();
      const withTimezone = stored.profile.timezone
        ? stored
        : {
            ...stored,
            profile: { ...stored.profile, timezone: detectedTimezone },
          };
      const presence = applyPresence(
        withTimezone,
        withTimezone.profile.timezone ?? detectedTimezone,
      );
      dataRef.current = presence.data;
      setData(presence.data);
      setRhythmResumed(presence.resumed);
      if (!writeScopedData(presence.data, null)) setSyncStatus("error");
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: AppData, synchronize = true) => {
    revisionRef.current += 1;
    dataRef.current = next;
    setData(next);
    const currentUser = userRef.current;
    const stored = writeScopedData(next, currentUser?.id ?? null);

    const client = clientRef.current;
    if (!stored) setSyncStatus("error");
    if (!synchronize || !client || !currentUser) {
      if (stored && !currentUser) setSyncStatus("local");
      return;
    }

    if (stored) setSyncStatus("pending");
    syncQueueRef.current?.request({
      identity: currentUser.id,
      revision: revisionRef.current,
      value: next,
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const client = getBrowserSupabaseClient();
    if (!client) return;

    clientRef.current = client;
    let active = true;

    syncQueueRef.current = new SerialSyncQueue<AppData, SyncResult>({
      execute: async (job) => {
        if (active && identityRef.current === job.identity) {
          setSyncStatus("connecting");
        }
        return syncDataWithSupabase(client, job.identity, job.value);
      },
      isCurrent: (job) =>
        active &&
        identityRef.current === job.identity &&
        userRef.current?.id === job.identity &&
        revisionRef.current === job.revision,
      onSuccess: (result, job) => {
        const merged = result.data;
        completeGuestMigration(job.identity);
        const detectedTimezone = browserTimezone();
        const needsTimezone = !merged.profile.timezone;
        const withTimezone = needsTimezone
          ? {
              ...merged,
              profile: { ...merged.profile, timezone: detectedTimezone },
            }
          : merged;
        const presence = applyPresence(
          withTimezone,
          withTimezone.profile.timezone ?? detectedTimezone,
        );
        const profilePatch = { ...presence.data.sync.profilePatch };
        if (needsTimezone) {
          profilePatch.timezone = detectedTimezone;
          profilePatch.timezoneManual = false;
        }
        if (presence.changed) {
          profilePatch.presenceDaysCount =
            presence.data.profile.presenceDaysCount;
          profilePatch.currentRhythmCount =
            presence.data.profile.currentRhythmCount;
          profilePatch.lastActiveDate = presence.data.profile.lastActiveDate;
        }
        const needsProfileSync = Object.keys(profilePatch).length > 0;
        const next = needsProfileSync
          ? {
              ...presence.data,
              sync: { ...presence.data.sync, profilePatch },
            }
          : presence.data;

        dataRef.current = next;
        setData(next);
        setRhythmResumed(presence.resumed);
        const stored = writeScopedData(next, job.identity);
        if (!remoteJournalCursorRef.current) {
          remoteJournalCursorRef.current = result.journalPage.cursor;
          setRemoteHasMore(result.journalPage.hasMore);
        }

        if (!stored) {
          setSyncStatus("error");
          return;
        }
        if (needsProfileSync) {
          revisionRef.current += 1;
          setSyncStatus("pending");
          syncQueueRef.current?.request({
            identity: job.identity,
            revision: revisionRef.current,
            value: next,
          });
        } else {
          setSyncStatus("synced");
        }
      },
      onError: (_error, job) => {
        if (active && identityRef.current === job.identity) {
          setSyncStatus(
            writeScopedData(dataRef.current, job.identity)
              ? "pending"
              : "error",
          );
        }
      },
    });

    void loadCurrentAnnouncement(client)
      .then((nextAnnouncement) => {
        if (active) setAnnouncement(nextAnnouncement);
      })
      .catch(() => {
        if (active) setAnnouncement(null);
      });

    const connectUser = async (nextUser: User | null) => {
      if (!active) return;
      const nextIdentity = nextUser?.id ?? "guest";
      if (identityRef.current === nextIdentity) {
        userRef.current = nextUser;
        setUser(nextUser);
        return;
      }

      identityRef.current = nextIdentity;
      userRef.current = nextUser;
      setUser(nextUser);
      remoteJournalCursorRef.current = null;
      setRemoteHasMore(false);
      if (!nextUser) {
        revisionRef.current += 1;
        const guest = readGuestData();
        const detectedTimezone = browserTimezone();
        const withTimezone = guest.profile.timezone
          ? guest
          : {
              ...guest,
              profile: { ...guest.profile, timezone: detectedTimezone },
            };
        const presence = applyPresence(
          withTimezone,
          withTimezone.profile.timezone ?? detectedTimezone,
        );
        dataRef.current = presence.data;
        setData(presence.data);
        setRhythmResumed(presence.resumed);
        setSyncStatus(
          writeScopedData(presence.data, null) ? "local" : "error",
        );
        return;
      }

      const account = readUserData(nextUser.id);
      const guest = claimGuestDataForUser(nextUser.id);
      const candidate = mergeLocalMigration(account, guest);
      revisionRef.current += 1;
      dataRef.current = candidate;
      setData(candidate);
      const stored = writeScopedData(candidate, nextUser.id);
      setSyncStatus(stored ? "pending" : "error");
      syncQueueRef.current?.request({
        identity: nextUser.id,
        revision: revisionRef.current,
        value: candidate,
      });
    };

    let authEventReceived = false;
    void client.auth.getUser().then(({ data: authData, error }) => {
      if (!authEventReceived && !error) void connectUser(authData.user);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      queueMicrotask(() => {
        void connectUser(session?.user ?? null);
      });
    });

    const retryPending = () => {
      if (syncQueueRef.current?.hasPending()) {
        setSyncStatus("pending");
        syncQueueRef.current.retry();
      }
    };
    window.addEventListener("online", retryPending);
    window.addEventListener("focus", retryPending);

    return () => {
      active = false;
      window.removeEventListener("online", retryPending);
      window.removeEventListener("focus", retryPending);
      subscription.unsubscribe();
      syncQueueRef.current = null;
    };
  }, [hydrated]);

  const toggleProgress = useCallback(
    (kind: CatalogKind, itemIndex: number) => {
      const current = dataRef.current;
      const existing = current.progress.find(
        (entry) => entry.kind === kind && entry.itemIndex === itemIndex,
      );

      if (kind === "discovery") {
        if (existing) return;
      }

      const now = Date.now();
      const hasInitialAssessment = current.assessments.some(
        (item) => item.stage === "initial" && isValidAssessment(item, "initial"),
      );
      const currentProgression = evaluateProgression(
        current.progress,
        now,
        unlockIntervalMs,
        hasInitialAssessment,
      );
      if (!currentProgression.canComplete(kind, itemIndex)) return;

      let progress = current.progress;
      let pendingProgressDeletes = current.sync.pendingProgressDeletes;
      if (existing) {
        progress = progress.filter((entry) => entry.id !== existing.id);
        pendingProgressDeletes = [
          ...pendingProgressDeletes.filter(
            (entry) =>
              entry.kind !== kind || entry.itemIndex !== itemIndex,
          ),
          { kind, itemIndex },
        ];
      } else {
        pendingProgressDeletes = pendingProgressDeletes.filter(
          (entry) => entry.kind !== kind || entry.itemIndex !== itemIndex,
        );
        progress = [
          ...progress,
          {
            id: createId(),
            kind,
            itemIndex,
            completedAt: new Date().toISOString(),
          },
        ];
      }

      const completedInOrder = evaluateProgression(
        progress,
        now,
        unlockIntervalMs,
        hasInitialAssessment,
      ).discoveriesCompleted;
      persist(
        {
          ...current,
          progress,
          giftUnlockedAt:
            completedInOrder >= 5
              ? current.giftUnlockedAt ?? new Date(now).toISOString()
              : current.giftUnlockedAt,
          sync: {
            ...current.sync,
            pendingProgressDeletes,
          },
        },
      );
    },
    [persist, unlockIntervalMs],
  );

  const setReminderEnabled = useCallback(
    (enabled: boolean) => {
      const current = dataRef.current;
      persist({
        ...current,
        profile: { ...current.profile, reminderEnabled: enabled },
        sync: {
          ...current.sync,
          profilePatch: {
            ...current.sync.profilePatch,
            reminderEnabled: enabled,
          },
        },
      });
    },
    [persist],
  );

  const addJournalEntry = useCallback(
    (entry: NewJournalEntry) => {
      const current = dataRef.current;
      persist({
        ...current,
        journalEntries: [
          ...current.journalEntries,
          {
            id: createId(),
            entryType: entry.entryType,
            itemIndex: entry.itemIndex ?? null,
            title: entry.title,
            content: entry.content,
            practiceSessionId: entry.practiceSessionId ?? null,
            createdAt: new Date().toISOString(),
          },
        ],
      });
    },
    [persist],
  );

  const savePractice = useCallback(
    (entry: Omit<PracticeSession, "id" | "createdAt">) => {
      const current = dataRef.current;
      const id = createId();
      const createdAt = new Date().toISOString();
      const practice: PracticeSession = { ...entry, id, createdAt };
      const lines = [
        "Emoción: " + entry.feeling,
        "Intensidad: " +
          entry.intensityBefore +
          "/10 al comenzar y " +
          entry.intensityAfter +
          "/10 al cerrar.",
        entry.situation ? "Lo que la despertó: " + entry.situation : "",
        entry.bodyPlace ? "Lugar en el cuerpo: " + entry.bodyPlace : "",
        entry.thoughtsReleased.length > 0
          ? "Lo que aflojé: " + entry.thoughtsReleased.join(", ")
          : "",
        entry.releaseNote ? "Lo que descubrí: " + entry.releaseNote : "",
      ].filter(Boolean);

      persist({
        ...current,
        practiceSessions: [...current.practiceSessions, practice],
        journalEntries: [
          ...current.journalEntries,
          {
            id: createId(),
            entryType: "practice",
            itemIndex: null,
            title: "Me di un momento para volver a mí",
            content: lines.join("\n"),
            practiceSessionId: id,
            createdAt,
          },
        ],
      });
    },
    [persist],
  );

  const saveAssessment = useCallback(
    (assessment: AssessmentInput) => {
      const current = dataRef.current;
      const existing = current.assessments.find(
        (item) => item.stage === assessment.stage,
      );
      const nextAssessment: UserAssessment = {
        ...assessment,
        id: existing?.id ?? createId(),
        createdAt: new Date().toISOString(),
      };
      persist({
        ...current,
        assessments: [
          ...current.assessments.filter(
            (item) => item.stage !== assessment.stage,
          ),
          nextAssessment,
        ],
      });
    },
    [persist],
  );

  const deleteJournalEntry = useCallback(
    (id: string) => {
      const current = dataRef.current;
      persist(
        {
          ...current,
          journalEntries: current.journalEntries.filter(
            (entry) => entry.id !== id,
          ),
          sync: {
            ...current.sync,
            pendingJournalDeletes: Array.from(
              new Set([...current.sync.pendingJournalDeletes, id]),
            ),
          },
        },
      );
    },
    [persist],
  );

  const setCompassEmotion = useCallback(
    (emotion: string) => {
      const current = dataRef.current;
      persist({
        ...current,
        lastCompassEmotion: emotion,
        sync: {
          ...current.sync,
          profilePatch: {
            ...current.sync.profilePatch,
            lastCompassEmotion: emotion,
          },
        },
      });
    },
    [persist],
  );

  const updateTimezone = useCallback(
    async (timezone: string, manual: boolean) => {
      Intl.DateTimeFormat(undefined, { timeZone: timezone }).format();
      const current = dataRef.current;
      const next = {
        ...current,
        profile: {
          ...current.profile,
          timezone,
          timezoneManual: manual,
        },
        sync: {
          ...current.sync,
          profilePatch: {
            ...current.sync.profilePatch,
            timezone,
            timezoneManual: manual,
          },
        },
      };
      persist(next);
    },
    [persist],
  );

  const claimBillingEmail = useCallback(async (email: string) => {
    const client = clientRef.current;
    const currentUser = userRef.current;
    if (!client || !currentUser) {
      throw new Error("Inicia sesión para vincular tu correo de compra.");
    }
    const { data: claimedEmail, error } = await client.rpc(
      "claim_billing_email",
      { p_billing_email: email },
    );
    if (error) throw new Error(error.message);
    const normalized = String(claimedEmail ?? email).trim().toLowerCase();
    if (userRef.current?.id !== currentUser.id) {
      throw new Error("La sesión cambió antes de completar la operación.");
    }
    const next = {
      ...dataRef.current,
      profile: { ...dataRef.current.profile, billingEmail: normalized },
    };
    dataRef.current = next;
    setData(next);
    if (!writeScopedData(next, currentUser.id)) setSyncStatus("error");
    return normalized;
  }, []);

  const clearData = useCallback(async () => {
    const currentUser = userRef.current;
    const empty = {
      ...createEmptyData(),
      profile: dataRef.current.profile,
      sync: {
        ...createEmptyData().sync,
        clearAll: Boolean(currentUser),
      },
    };
    persist(empty, Boolean(currentUser));
    setVisibleJournalCount(JOURNAL_PAGE_SIZE);
    remoteJournalCursorRef.current = null;
    setRemoteHasMore(false);
  }, [persist]);

  const loadOlder = useCallback(async () => {
    const client = clientRef.current;
    const currentUser = userRef.current;
    const cursor = remoteJournalCursorRef.current;
    if (client && currentUser && cursor && remoteHasMore) {
      const requestedUserId = currentUser.id;
      try {
        const page = await loadOlderJournalEntries(
          client,
          currentUser.id,
          cursor,
        );
        if (userRef.current?.id !== requestedUserId) return;
        const map = new Map(
          dataRef.current.journalEntries.map((entry) => [entry.id, entry]),
        );
        const deletedIds = new Set(dataRef.current.sync.pendingJournalDeletes);
        page.entries
          .filter((entry) => !deletedIds.has(entry.id))
          .forEach((entry) => map.set(entry.id, entry));
        const next = {
          ...dataRef.current,
          journalEntries: Array.from(map.values()),
        };
        dataRef.current = next;
        setData(next);
        if (!writeScopedData(next, requestedUserId)) setSyncStatus("error");
        remoteJournalCursorRef.current = page.cursor;
        setRemoteHasMore(page.hasMore);
      } catch {
        setSyncStatus("error");
      }
    }
    setVisibleJournalCount((count) => count + JOURNAL_PAGE_SIZE);
  }, [remoteHasMore]);

  const completedDiscoveries = progression.completedDiscoveryIndexes;
  const completedExtras = progression.completedExtraIndexes;
  const nextDiscoveryIndex = progression.nextDiscoveryIndex ?? 15;
  const isDiscoveryUnlocked = useCallback(
    (itemIndex: number) => {
      const status = progression.discoveryStatus(itemIndex);
      return status === "available" || status === "completed";
    },
    [progression],
  );
  const sortedEntries = useMemo(
    () => sortJournal(data.journalEntries),
    [data.journalEntries],
  );
  const visibleJournalEntries = sortedEntries.slice(0, visibleJournalCount);
  const finalAssessment =
    data.assessments.find(
      (item) => item.stage === "final" && isValidAssessment(item, "final"),
    ) ?? null;
  const stats: AppStats = {
    discoveriesCompleted: nextDiscoveryIndex,
    pausesCompleted: data.practiceSessions.length,
    journalEntries: data.journalEntries.length,
    reflectionsWritten: data.journalEntries.filter(
      (entry) =>
        entry.entryType === "discovery" || entry.entryType === "extra",
    ).length,
  };
  const accessExpired = Boolean(
    ENFORCE_SUBSCRIPTION &&
      user &&
      data.profile.planType !== "lifetime" &&
      data.profile.accessUntil &&
      currentTimestamp !== null &&
      Date.parse(data.profile.accessUntil) <= currentTimestamp,
  );

  const value: AppStateValue = {
    state: {
      data,
      hydrated,
      syncStatus,
      user,
      visibleJournalCount,
      announcement,
      rhythmResumed,
    },
    actions: {
      toggleProgress,
      addJournalEntry,
      savePractice,
      saveAssessment,
      deleteJournalEntry,
      setCompassEmotion,
      updateTimezone,
      claimBillingEmail,
      dismissRhythmMessage: () => setRhythmResumed(false),
      setReminderEnabled,
      exportData: () => exportLocalData(dataRef.current),
      clearData,
      loadOlder,
    },
    meta: {
      stats,
      completedDiscoveries,
      completedExtras,
      nextDiscoveryIndex,
      isDiscoveryUnlocked,
      giftUnlocked: progression.giftUnlocked,
      pathComplete: progression.pathComplete,
      initialAssessment,
      finalAssessment,
      journeyDays: inclusiveJourneyDays(data),
      accessExpired,
      visibleJournalEntries,
      hasMoreJournalEntries:
        visibleJournalEntries.length < data.journalEntries.length ||
        (Boolean(user) && remoteHasMore),
      progression,
      unlockIntervalMs,
    },
  };

  return <AppStateContext value={value}>{children}</AppStateContext>;
}

export function useAppState() {
  const value = use(AppStateContext);
  if (!value) {
    throw new Error("useAppState requiere AppStateProvider.");
  }
  return value;
}
