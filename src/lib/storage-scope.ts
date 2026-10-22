export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const BASE_KEY = "enfoca-tu-ser:v2";

export function guestStorageKey() {
  return `${BASE_KEY}:guest`;
}

export function accountStorageKey(userId: string) {
  return `${BASE_KEY}:user:${userId}`;
}

export function migrationStorageKey(userId: string) {
  return `${BASE_KEY}:migration:${userId}`;
}

export function readScopedRecord<T>(storage: StorageLike, key: string): T | null {
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeScopedRecord(
  storage: StorageLike,
  key: string,
  value: unknown,
) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function writeMigratedRecord(
  storage: StorageLike,
  destinationKey: string,
  value: unknown,
  legacyKeys: string[],
) {
  if (!writeScopedRecord(storage, destinationKey, value)) return false;

  for (const key of legacyKeys) {
    try {
      storage.removeItem(key);
    } catch {
      // The destination record is already durable and takes precedence.
    }
  }
  return true;
}

export interface GuestRecord<T = unknown> {
  data: T;
  claimedBy: string | null;
}

export interface GuestState<T = unknown> {
  version: 1;
  active: T | null;
  claims: GuestRecord<T>[];
}

function isGuestState<T>(
  stored: GuestState<T> | GuestRecord<T>,
): stored is GuestState<T> {
  return (
    "version" in stored &&
    stored.version === 1 &&
    Array.isArray(stored.claims)
  );
}

export function readGuestState<T>(
  storage: StorageLike,
): GuestState<T> | null {
  const stored = readScopedRecord<
    GuestState<T> | GuestRecord<T>
  >(storage, guestStorageKey());
  if (!stored) return null;

  if (isGuestState(stored)) return stored;

  return {
    version: 1,
    active: stored.claimedBy ? null : stored.data,
    claims: stored.claimedBy ? [stored] : [],
  };
}

export function writeGuestRecord<T>(storage: StorageLike, data: T) {
  const state = readGuestState<T>(storage);

  return writeScopedRecord(storage, guestStorageKey(), {
    version: 1,
    active: data,
    claims: state?.claims ?? [],
  } satisfies GuestState<T>);
}

export function writeMigratedGuestRecord<T>(
  storage: StorageLike,
  data: T,
  legacyKeys: string[],
) {
  if (!writeGuestRecord(storage, data)) return false;

  for (const key of legacyKeys) {
    try {
      storage.removeItem(key);
    } catch {
      // The guest state is already durable and takes precedence.
    }
  }
  return true;
}

export function claimGuestRecord<T>(
  storage: StorageLike,
  userId: string,
): GuestRecord<T> | null {
  const state = readGuestState<T>(storage);
  const existing = state?.claims.find(
    (record) => record.claimedBy === userId,
  );
  if (existing) return existing;

  const previousMigration = readScopedRecord<GuestRecord<T>>(
    storage,
    migrationStorageKey(userId),
  );
  if (previousMigration?.claimedBy === userId) return previousMigration;

  if (!state || state.active === null) return null;

  const claimed = { data: state.active, claimedBy: userId };
  if (
    !writeScopedRecord(storage, guestStorageKey(), {
      ...state,
      active: null,
      claims: [...state.claims, claimed],
    } satisfies GuestState<T>)
  ) {
    return null;
  }
  return claimed;
}

export function completeGuestRecord(storage: StorageLike, userId: string) {
  try {
    const state = readGuestState(storage);
    if (state) {
      const next = {
        ...state,
        claims: state.claims.filter(
          (record) => record.claimedBy !== userId,
        ),
      } satisfies GuestState;
      if (next.active === null && next.claims.length === 0) {
        storage.removeItem(guestStorageKey());
      } else if (!writeScopedRecord(storage, guestStorageKey(), next)) {
        return false;
      }
    }
    storage.removeItem(migrationStorageKey(userId));
    return true;
  } catch {
    return false;
  }
}
