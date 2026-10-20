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
  createEmptyData,
  createId,
  exportLocalData,
  readLocalData,
  writeLocalData,
} from "@/lib/storage";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
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

type SyncStatus = "local" | "connecting" | "synced" | "error";

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
    exportData: () => void;
    clearData: () => Promise<void>;
    loadOlder: () => Promise<void>;
  };
  meta: {
    stats: AppStats;
    completedDiscoveries: Set<number>;
    completedExtras: Set<number>;
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

function sequentialDiscoveryCount(progress: AppData["progress"]) {
  const completed = new Set(
    progress
      .filter((entry) => entry.kind === "discovery")
      .map((entry) => entry.itemIndex),
  );
  let next = 0;
  while (next < 15 && completed.has(next)) next += 1;
  return next;
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

export function AppStateProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    let active = true;
    const refreshTimestamp = () => {
      if (active) setCurrentTimestamp(Date.now());
    };
    queueMicrotask(refreshTimestamp);
    const intervalId = window.setInterval(refreshTimestamp, 60_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);
  const syncingRef = useRef(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const stored = readLocalData();
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
      writeLocalData(presence.data);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: AppData, synchronize = true) => {
    dataRef.current = next;
    setData(next);
    writeLocalData(next);

    const client = clientRef.current;
    const currentUser = userRef.current;
    if (!synchronize || !client || !currentUser || syncingRef.current) {
      return;
    }

    syncingRef.current = true;
    setSyncStatus("connecting");
    void syncDataWithSupabase(client, currentUser.id, next)
      .then((merged) => {
        dataRef.current = merged;
        setData(merged);
        writeLocalData(merged);
        setSyncStatus("synced");
      })
      .catch(() => setSyncStatus("error"))
      .finally(() => {
        syncingRef.current = false;
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const client = getBrowserSupabaseClient();
    if (!client) return;

    clientRef.current = client;
    let active = true;

    void loadCurrentAnnouncement(client)
      .then((nextAnnouncement) => {
        if (active) setAnnouncement(nextAnnouncement);
      })
      .catch(() => {
        if (active) setAnnouncement(null);
      });

    const connectUser = async (nextUser: User | null) => {
      if (!active) return;
      userRef.current = nextUser;
      setUser(nextUser);
      if (!nextUser) {
        setSyncStatus("local");
        setRemoteHasMore(false);
        return;
      }

      setSyncStatus("connecting");
      syncingRef.current = true;
      try {
        const merged = await syncDataWithSupabase(
          client,
          nextUser.id,
          dataRef.current,
        );
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

        const profileUpdates: Record<string, unknown> = {};
        if (needsTimezone) {
          profileUpdates.timezone = detectedTimezone;
          profileUpdates.timezone_manual = false;
        }
        if (presence.changed) {
          profileUpdates.presence_days_count =
            presence.data.profile.presenceDaysCount;
          profileUpdates.current_rhythm_count =
            presence.data.profile.currentRhythmCount;
          profileUpdates.last_active_date =
            presence.data.profile.lastActiveDate;
        }
        if (Object.keys(profileUpdates).length > 0) {
          const { error } = await client
            .from("profiles")
            .update(profileUpdates)
            .eq("id", nextUser.id);
          if (error) throw error;
        }

        if (active) {
          dataRef.current = presence.data;
          setData(presence.data);
          setRhythmResumed(presence.resumed);
          writeLocalData(presence.data);
          setSyncStatus("synced");
          setRemoteHasMore(
            presence.data.journalEntries.length >= JOURNAL_PAGE_SIZE,
          );
        }
      } catch {
        if (active) setSyncStatus("error");
      } finally {
        syncingRef.current = false;
      }
    };

    void client.auth.getUser().then(({ data: authData }) => {
      void connectUser(authData.user);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        void connectUser(session?.user ?? null);
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [hydrated]);

  const toggleProgress = useCallback(
    (kind: CatalogKind, itemIndex: number) => {
      const current = dataRef.current;
      const existing = current.progress.find(
        (entry) => entry.kind === kind && entry.itemIndex === itemIndex,
      );

      if (kind === "discovery") {
        const nextDiscovery = sequentialDiscoveryCount(current.progress);
        if (existing || itemIndex !== nextDiscovery || itemIndex > 14) return;
      }

      let progress = current.progress;
      if (existing) {
        progress = progress.filter((entry) => entry.id !== existing.id);
        const client = clientRef.current;
        const currentUser = userRef.current;
        if (client && currentUser) {
          void client
            .from("user_progress")
            .delete()
            .eq("user_id", currentUser.id)
            .eq("item_type", kind)
            .eq("item_index", itemIndex);
        }
      } else {
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

      const completedInOrder = sequentialDiscoveryCount(progress);
      persist(
        {
          ...current,
          progress,
          giftUnlockedAt:
            completedInOrder >= 5
              ? current.giftUnlockedAt ?? new Date().toISOString()
              : current.giftUnlockedAt,
        },
        !existing,
      );
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
        createdAt: existing?.createdAt ?? new Date().toISOString(),
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
        },
        false,
      );
      const client = clientRef.current;
      const currentUser = userRef.current;
      if (client && currentUser) {
        void client
          .from("journal_entries")
          .delete()
          .eq("id", id)
          .eq("user_id", currentUser.id);
      }
    },
    [persist],
  );

  const setCompassEmotion = useCallback(
    (emotion: string) => {
      const current = dataRef.current;
      persist({ ...current, lastCompassEmotion: emotion }, false);
      const client = clientRef.current;
      const currentUser = userRef.current;
      if (client && currentUser) {
        void client
          .from("profiles")
          .update({ last_compass_emotion: emotion })
          .eq("id", currentUser.id)
          .then(({ error }) => {
            if (error) setSyncStatus("error");
          });
      }
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
      };
      persist(next, false);

      const client = clientRef.current;
      const currentUser = userRef.current;
      if (client && currentUser) {
        const { error } = await client
          .from("profiles")
          .update({ timezone, timezone_manual: manual })
          .eq("id", currentUser.id);
        if (error) {
          setSyncStatus("error");
          throw error;
        }
      }
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
    const next = {
      ...dataRef.current,
      profile: { ...dataRef.current.profile, billingEmail: normalized },
    };
    dataRef.current = next;
    setData(next);
    writeLocalData(next);
    return normalized;
  }, []);

  const clearData = useCallback(async () => {
    const client = clientRef.current;
    const currentUser = userRef.current;
    if (client && currentUser) {
      await Promise.all([
        client.from("journal_entries").delete().eq("user_id", currentUser.id),
        client.from("practice_sessions").delete().eq("user_id", currentUser.id),
        client.from("user_progress").delete().eq("user_id", currentUser.id),
        client.from("user_assessments").delete().eq("user_id", currentUser.id),
      ]);
      await client
        .from("profiles")
        .update({
          last_compass_emotion: "Temor",
          gift_unlocked_at: null,
        })
        .eq("id", currentUser.id);
    }

    const empty = {
      ...createEmptyData(),
      profile: dataRef.current.profile,
    };
    dataRef.current = empty;
    setData(empty);
    setVisibleJournalCount(JOURNAL_PAGE_SIZE);
    setRemoteHasMore(false);
    writeLocalData(empty);
  }, []);

  const loadOlder = useCallback(async () => {
    const sorted = sortJournal(dataRef.current.journalEntries);
    const client = clientRef.current;
    const currentUser = userRef.current;
    const cursor = sorted.at(-1);
    if (client && currentUser && cursor && remoteHasMore) {
      try {
        const older = await loadOlderJournalEntries(
          client,
          currentUser.id,
          cursor,
        );
        const map = new Map(
          dataRef.current.journalEntries.map((entry) => [entry.id, entry]),
        );
        older.forEach((entry) => map.set(entry.id, entry));
        const next = {
          ...dataRef.current,
          journalEntries: Array.from(map.values()),
        };
        dataRef.current = next;
        setData(next);
        writeLocalData(next);
        setRemoteHasMore(older.length === JOURNAL_PAGE_SIZE);
      } catch {
        setSyncStatus("error");
      }
    }
    setVisibleJournalCount((count) => count + JOURNAL_PAGE_SIZE);
  }, [remoteHasMore]);

  const completedDiscoveries = useMemo(
    () =>
      new Set(
        data.progress
          .filter((entry) => entry.kind === "discovery")
          .map((entry) => entry.itemIndex),
      ),
    [data.progress],
  );
  const completedExtras = useMemo(
    () =>
      new Set(
        data.progress
          .filter((entry) => entry.kind === "extra")
          .map((entry) => entry.itemIndex),
      ),
    [data.progress],
  );
  const nextDiscoveryIndex = useMemo(
    () => sequentialDiscoveryCount(data.progress),
    [data.progress],
  );
  const isDiscoveryUnlocked = useCallback(
    (itemIndex: number) => itemIndex <= nextDiscoveryIndex && itemIndex < 15,
    [nextDiscoveryIndex],
  );
  const sortedEntries = useMemo(
    () => sortJournal(data.journalEntries),
    [data.journalEntries],
  );
  const visibleJournalEntries = sortedEntries.slice(0, visibleJournalCount);
  const initialAssessment =
    data.assessments.find((item) => item.stage === "initial") ?? null;
  const finalAssessment =
    data.assessments.find((item) => item.stage === "final") ?? null;
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
      giftUnlocked: nextDiscoveryIndex >= 5,
      pathComplete: nextDiscoveryIndex >= 15,
      initialAssessment,
      finalAssessment,
      journeyDays: inclusiveJourneyDays(data),
      accessExpired,
      visibleJournalEntries,
      hasMoreJournalEntries:
        visibleJournalEntries.length < data.journalEntries.length ||
        (Boolean(user) && remoteHasMore),
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
