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

export function writeGuestRecord<T>(storage: StorageLike, data: T) {
  const key = guestStorageKey();
  const existing = readScopedRecord<GuestRecord<T>>(storage, key);
  if (existing?.claimedBy) return true;

  return writeScopedRecord(storage, key, {
    data,
    claimedBy: null,
  } satisfies GuestRecord<T>);
}

export function claimGuestRecord<T>(
  storage: StorageLike,
  userId: string,
): GuestRecord<T> | null {
  const guestKey = guestStorageKey();
  const record = readScopedRecord<GuestRecord<T>>(storage, guestKey);
  if (record?.claimedBy === userId) return record;
  if (record?.claimedBy) return null;

  if (!record) {
    const previousMigration = readScopedRecord<GuestRecord<T>>(
      storage,
      migrationStorageKey(userId),
    );
    return previousMigration?.claimedBy === userId ? previousMigration : null;
  }

  const claimed = { ...record, claimedBy: userId };
  if (!writeScopedRecord(storage, guestKey, claimed)) return null;
  return claimed;
}

export function completeGuestRecord(storage: StorageLike, userId: string) {
  try {
    const guest = readScopedRecord<GuestRecord>(storage, guestStorageKey());
    if (guest?.claimedBy === userId) {
      storage.removeItem(guestStorageKey());
    }
    storage.removeItem(migrationStorageKey(userId));
    return true;
  } catch {
    return false;
  }
}
