export const PILOT_UNLOCK_INTERVAL_MS = 60_000;
export const DEFINITIVE_UNLOCK_INTERVAL_MS = 12 * 60 * 60 * 1_000;
export const DISCOVERY_COUNT = 15;
export const EXTRA_COUNT = 12;

export type DiscoveryAccessStatus =
  | "completed"
  | "available"
  | "integrating"
  | "locked_sequence";

export type ExtraAccessStatus =
  | "completed"
  | "available"
  | "locked_until_path_complete";

export interface ProgressRecord {
  kind: "discovery" | "extra";
  itemIndex: number;
  completedAt: string;
}

export interface ProgressionState {
  completedDiscoveryIndexes: ReadonlySet<number>;
  completedExtraIndexes: ReadonlySet<number>;
  discoveriesCompleted: number;
  nextDiscoveryIndex: number | null;
  nextUnlockAt: string | null;
  activeInvitationIndex: number | null;
  giftUnlocked: boolean;
  pathComplete: boolean;
  practicesUnlocked: boolean;
  discoveryStatus: (itemIndex: number) => DiscoveryAccessStatus;
  extraStatus: (itemIndex: number) => ExtraAccessStatus;
  canComplete: (kind: "discovery" | "extra", itemIndex: number) => boolean;
}

export function unlockIntervalForEnvironment(
  nodeEnvironment: string | undefined,
  vercelEnvironment: string | undefined,
) {
  if (vercelEnvironment === "preview" || nodeEnvironment !== "production") {
    return PILOT_UNLOCK_INTERVAL_MS;
  }
  return DEFINITIVE_UNLOCK_INTERVAL_MS;
}

function validCompletionTime(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function evaluateProgression(
  progress: readonly ProgressRecord[],
  now: number,
  intervalMs: number,
): ProgressionState {
  const duration = Number.isFinite(intervalMs) && intervalMs >= 0
    ? intervalMs
    : DEFINITIVE_UNLOCK_INTERVAL_MS;
  const discoveryCompletionTimes = new Map<number, number>();
  const completedExtraIndexes = new Set<number>();

  for (const entry of progress) {
    if (!Number.isInteger(entry.itemIndex)) continue;
    if (entry.kind === "extra") {
      if (entry.itemIndex >= 0 && entry.itemIndex < EXTRA_COUNT) {
        completedExtraIndexes.add(entry.itemIndex);
      }
      continue;
    }
    if (entry.itemIndex < 0 || entry.itemIndex >= DISCOVERY_COUNT) continue;
    const completedAt = validCompletionTime(entry.completedAt);
    if (completedAt === null) continue;
    const existing = discoveryCompletionTimes.get(entry.itemIndex);
    if (existing === undefined || completedAt < existing) {
      discoveryCompletionTimes.set(entry.itemIndex, completedAt);
    }
  }

  let discoveriesCompleted = 0;
  while (
    discoveriesCompleted < DISCOVERY_COUNT &&
    discoveryCompletionTimes.has(discoveriesCompleted)
  ) {
    discoveriesCompleted += 1;
  }

  const completedDiscoveryIndexes = new Set<number>();
  for (let index = 0; index < discoveriesCompleted; index += 1) {
    completedDiscoveryIndexes.add(index);
  }

  const pathComplete = discoveriesCompleted === DISCOVERY_COUNT;
  const nextDiscoveryIndex = pathComplete ? null : discoveriesCompleted;
  const lastCompletedAt = discoveriesCompleted > 0
    ? discoveryCompletionTimes.get(discoveriesCompleted - 1) ?? null
    : null;
  const integrationEndsAt = lastCompletedAt === null
    ? null
    : lastCompletedAt + duration;
  const integrationActive = integrationEndsAt !== null && now < integrationEndsAt;
  const nextUnlockAt = nextDiscoveryIndex !== null && integrationActive
    ? new Date(integrationEndsAt).toISOString()
    : null;
  const activeInvitationIndex = integrationActive
    ? discoveriesCompleted - 1
    : null;

  const discoveryStatus = (itemIndex: number): DiscoveryAccessStatus => {
    if (completedDiscoveryIndexes.has(itemIndex)) return "completed";
    if (itemIndex === nextDiscoveryIndex) {
      return integrationActive ? "integrating" : "available";
    }
    return "locked_sequence";
  };

  const practicesUnlocked = pathComplete;
  const extraStatus = (itemIndex: number): ExtraAccessStatus => {
    if (!practicesUnlocked) return "locked_until_path_complete";
    return completedExtraIndexes.has(itemIndex) ? "completed" : "available";
  };

  return {
    completedDiscoveryIndexes,
    completedExtraIndexes,
    discoveriesCompleted,
    nextDiscoveryIndex,
    nextUnlockAt,
    activeInvitationIndex,
    giftUnlocked: discoveriesCompleted >= 5,
    pathComplete,
    practicesUnlocked,
    discoveryStatus,
    extraStatus,
    canComplete: (kind, itemIndex) =>
      kind === "discovery"
        ? discoveryStatus(itemIndex) === "available"
        : extraStatus(itemIndex) === "available",
  };
}
