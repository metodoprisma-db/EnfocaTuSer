export interface JournalDraft {
  title: string;
  content: string;
}

export function journalDraftKey(identity: string | null | undefined) {
  return `enfoca-tu-ser:journal-draft:${identity || "guest"}`;
}

export function lessonDraftKey(
  identity: string | null | undefined,
  kind: "discovery" | "extra",
  itemIndex: number,
) {
  return `enfoca-tu-ser:lesson-draft:${identity || "guest"}:${kind}:${itemIndex}`;
}

export function parseJournalDraft(raw: string | null): JournalDraft {
  if (!raw) return { title: "", content: "" };
  try {
    const value = JSON.parse(raw) as Partial<JournalDraft>;
    return {
      title: typeof value.title === "string" ? value.title : "",
      content: typeof value.content === "string" ? value.content : "",
    };
  } catch {
    return { title: "", content: "" };
  }
}
