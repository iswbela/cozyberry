"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { getEntries } from "@/actions/entries";
import { getMood } from "@/lib/utils";
import { useLang } from "@/providers/language-provider";
import type { JournalEntryWithTags } from "@/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

function highlight(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-[var(--primary)]/50 rounded px-0.5">{part}</mark> : part
  );
}

export function SearchView({ initialQuery, initialEntries }: { initialQuery: string; initialEntries: JournalEntryWithTags[] }) {
  const { t } = useLang();
  const [query, setQuery] = useState(initialQuery);
  const [entries, setEntries] = useState(initialEntries);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    const { entries: results } = await getEntries({ search: q, limit: 50 });
    setEntries(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (query !== initialQuery) search(query); }, 300);
    return () => clearTimeout(timer);
  }, [query, initialQuery, search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.search.title}</h1>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <Input
          placeholder={t.search.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 h-12 text-base rounded-2xl"
          autoFocus
        />
      </div>
      {loading && <p className="text-sm text-[var(--muted-foreground)] text-center py-4">{t.search.searching}</p>}
      {!loading && query && (
        <p className="text-sm text-[var(--muted-foreground)]">
          {entries.length} {entries.length !== 1 ? t.search.results : t.search.result} {t.search.for} &ldquo;{query}&rdquo;
        </p>
      )}
      <div className="space-y-3">
        {entries.map((entry) => {
          const mood = getMood(entry.mood);
          const plainText = entry.content.replace(/<[^>]*>/g, "").slice(0, 200);
          return (
            <Link key={entry.id} href={`/journal/${entry.id}`}>
              <Card className="hover:shadow-md transition-all hover:border-[var(--accent)] cursor-pointer">
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {mood && <span>{mood.emoji}</span>}
                        <h3 className="font-semibold text-[var(--foreground)]">{highlight(entry.title, query)}</h3>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-3">{highlight(plainText, query)}</p>
                      {entry.tags.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {entry.tags.map(({ tag }) => (
                            <Badge key={tag.id} style={{ backgroundColor: tag.color + "33", color: tag.color }} className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] shrink-0">
                      {format(new Date(entry.entryDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
