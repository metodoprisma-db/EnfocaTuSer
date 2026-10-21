interface ProgressLike {
  kind: string;
  itemIndex: number;
  completedAt?: string;
}

interface IdentifiedLike {
  id: string;
  createdAt?: string;
}

interface AssessmentLike extends IdentifiedLike {
  stage: string;
}

interface MergeableData<
  TProgress extends ProgressLike,
  TPractice extends IdentifiedLike,
  TJournal extends IdentifiedLike,
  TAssessment extends AssessmentLike,
> {
  progress: TProgress[];
  practiceSessions: TPractice[];
  journalEntries: TJournal[];
  assessments: TAssessment[];
}

interface LocalMergeableData<
  TProgress extends ProgressLike,
  TPractice extends IdentifiedLike,
  TJournal extends IdentifiedLike,
  TAssessment extends AssessmentLike,
> extends MergeableData<TProgress, TPractice, TJournal, TAssessment> {
  pendingJournalDeletes: string[];
  pendingProgressDeletes: Array<{ kind: string; itemIndex: number }>;
}

function progressKey(entry: { kind: string; itemIndex: number }) {
  return `${entry.kind}:${entry.itemIndex}`;
}

function mergeProgress<T extends ProgressLike>(local: T[], remote: T[]) {
  const map = new Map<string, T>();
  [...remote, ...local].forEach((entry) => {
    const key = progressKey(entry);
    const current = map.get(key);
    if (
      !current ||
      (entry.completedAt ?? "") < (current.completedAt ?? "")
    ) {
      map.set(key, entry);
    }
  });
  return Array.from(map.values());
}

function mergeImmutableById<T extends IdentifiedLike>(local: T[], remote: T[]) {
  const map = new Map(local.map((entry) => [entry.id, entry]));
  remote.forEach((entry) => map.set(entry.id, entry));
  return Array.from(map.values());
}

function mergeAssessments<T extends AssessmentLike>(local: T[], remote: T[]) {
  const map = new Map<string, T>();
  [...remote, ...local].forEach((entry) => {
    const current = map.get(entry.stage);
    if (!current || (entry.createdAt ?? "") >= (current.createdAt ?? "")) {
      map.set(entry.stage, entry);
    }
  });
  return Array.from(map.values());
}

export function mergeAccountData<
  TProgress extends ProgressLike,
  TPractice extends IdentifiedLike,
  TJournal extends IdentifiedLike,
  TAssessment extends AssessmentLike,
>(
  local: LocalMergeableData<TProgress, TPractice, TJournal, TAssessment>,
  remote: MergeableData<TProgress, TPractice, TJournal, TAssessment>,
) {
  const deletedJournalIds = new Set(local.pendingJournalDeletes);
  const deletedProgress = new Set(local.pendingProgressDeletes.map(progressKey));

  return {
    progress: mergeProgress(local.progress, remote.progress).filter(
      (entry) => !deletedProgress.has(progressKey(entry)),
    ),
    practiceSessions: mergeImmutableById(
      local.practiceSessions,
      remote.practiceSessions,
    ),
    journalEntries: mergeImmutableById(
      local.journalEntries,
      remote.journalEntries,
    ).filter((entry) => !deletedJournalIds.has(entry.id)),
    assessments: mergeAssessments(local.assessments, remote.assessments),
  };
}
