"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getMood } from "@/lib/utils";
import { deleteEntry } from "@/actions/entries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { JournalEntryWithTags } from "@/types";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";

export function EntryView({ entry }: { entry: JournalEntryWithTags }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const mood = getMood(entry.mood);

  const handleDelete = async () => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(true);
    await deleteEntry(entry.id);
    router.push("/journal");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/journal">
            <ArrowLeft className="w-4 h-4" /> Journal
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/journal/${entry.id}/edit`}>
              <Edit2 className="w-4 h-4" /> Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="w-4 h-4" /> {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Entry Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
          <span>{format(new Date(entry.entryDate), "EEEE, MMMM d, yyyy")}</span>
          {mood && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                {mood.emoji} {mood.label}
              </span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">{entry.title}</h1>
        {entry.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {entry.tags.map(({ tag }) => (
              <Badge
                key={tag.id}
                style={{ backgroundColor: tag.color + "33", color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="py-6">
          <div
            className="ProseMirror prose prose-sm max-w-none text-[var(--foreground)]"
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
