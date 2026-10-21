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

export interface GuestRecord<T = unknown> {
  data: T;
  claimedBy: string | null;
}

export function claimGuestRecord<T>(
  storage: StorageLike,
  userId: string,
): GuestRecord<T> | null {
  const migrationKey = migrationStorageKey(userId);
  const existing = readScopedRecord<GuestRecord<T>>(storage, migrationKey);
  if (existing?.claimedBy === userId) return existing;

  const guestKey = guestStorageKey();
  const record = readScopedRecord<GuestRecord<T>>(storage, guestKey);
  if (!record || record.claimedBy) return null;

  const claimed = { ...record, claimedBy: userId };
  if (!writeScopedRecord(storage, migrationKey, claimed)) return null;
  if (!writeScopedRecord(storage, guestKey, claimed)) return null;
  return claimed;
}
