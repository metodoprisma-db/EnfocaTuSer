import { notFound } from "next/navigation";

import { LessonView } from "@/components/lesson-view";
import { getCatalogItem } from "@/data/catalog";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ kind: string; slug: string }>;
}) {
  const { kind, slug } = await params;
  if (kind !== "discovery" && kind !== "extra") notFound();
  const item = getCatalogItem(kind, slug);
  if (!item) notFound();

  return <LessonView item={item} />;
}
