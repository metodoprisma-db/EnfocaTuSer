export interface JournalCursor {
  id: string;
  createdAt: string;
}

export interface JournalPage<T extends JournalCursor> {
  entries: T[];
  cursor: JournalCursor | null;
  hasMore: boolean;
}

export function createJournalPage<T extends JournalCursor>(
  rows: T[],
  pageSize: number,
): JournalPage<T> {
  const entries = rows.slice(0, pageSize);
  const lastEntry = entries.at(-1);

  return {
    entries,
    cursor: lastEntry
      ? { id: lastEntry.id, createdAt: lastEntry.createdAt }
      : null,
    hasMore: rows.length > pageSize,
  };
}
