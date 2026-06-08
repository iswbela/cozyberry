"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { createLetter, openLetter, deleteLetter } from "@/actions/letters";
import { useLang } from "@/providers/language-provider";
import type { FutureLetter } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Unlock, Mail, Trash2, Plus, X } from "lucide-react";

type LetterWithStatus = FutureLetter & { isUnlocked: boolean };

export function LettersView({ initialLetters }: { initialLetters: LetterWithStatus[] }) {
  const router = useRouter();
  const { t, lang } = useLang();
  const locale = lang === "pt" ? ptBR : enUS;
  const [letters, setLetters] = useState(initialLetters);
  const [showForm, setShowForm] = useState(false);
  const [openedLetter, setOpenedLetter] = useState<LetterWithStatus | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minDate = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !unlockDate) { setError(t.letters.fillFields); return; }
    setLoading(true);
    const result = await createLetter({ title, content, unlockDate });
    if (result.error) { setError(result.error); }
    else {
      setLetters((prev) => [...prev, { ...result.letter!, isUnlocked: false }]);
      setTitle(""); setContent(""); setUnlockDate(""); setShowForm(false);
    }
    setLoading(false);
    router.refresh();
  };

  const handleOpen = async (letter: LetterWithStatus) => {
    await openLetter(letter.id);
    setLetters((prev) => prev.map((l) => l.id === letter.id ? { ...l, opened: true } : l));
    setOpenedLetter({ ...letter, opened: true });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.letters.confirmDelete)) return;
    await deleteLetter(id);
    setLetters((prev) => prev.filter((l) => l.id !== id));
    if (openedLetter?.id === id) setOpenedLetter(null);
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t.letters.title}</h1>
          <p className="text-[var(--muted-foreground)] text-sm">{t.letters.subtitle}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4" /> : <><Plus className="w-4 h-4" /> {t.letters.writeLetter}</>}
        </Button>
      </div>

      {showForm && (
        <Card className="border-[var(--accent)] border-2">
          <CardHeader><CardTitle className="text-base">{t.letters.formTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
            <div className="space-y-2">
              <Label>{t.letters.titleLabel}</Label>
              <Input placeholder={t.letters.titlePlaceholder} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.letters.unlockDate}</Label>
              <Input type="date" min={minDate} value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} />
              <p className="text-xs text-[var(--muted-foreground)]">{t.letters.unlockDateHint}</p>
            </div>
            <div className="space-y-2">
              <Label>{t.letters.message}</Label>
              <Textarea placeholder={t.letters.messagePlaceholder} value={content} onChange={(e) => setContent(e.target.value)} rows={6} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>{t.letters.cancel}</Button>
              <Button onClick={handleCreate} disabled={loading}>{loading ? t.letters.sealing : t.letters.sealLetter}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {openedLetter && (
        <Card className="border-[var(--accent)] border-2 bg-[var(--primary)]/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{openedLetter.title}</CardTitle>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {t.letters.writtenOn} {format(new Date(openedLetter.createdAt), "MMMM d, yyyy", { locale })}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpenedLetter(null)}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--foreground)] whitespace-pre-wrap">{openedLetter.content}</p>
          </CardContent>
        </Card>
      )}

      {letters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Mail className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
            <p className="text-[var(--muted-foreground)]">{t.letters.noLetters}</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>{t.letters.writeFirst}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {letters.map((letter) => (
            <Card key={letter.id} className={letter.isUnlocked ? "border-[var(--accent)]/50" : ""}>
              <CardContent className="py-4 px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`mt-0.5 p-2 rounded-full ${letter.isUnlocked ? "bg-[var(--primary)]/30" : "bg-[var(--muted)]"}`}>
                      {letter.isUnlocked
                        ? <Unlock className="w-4 h-4 text-[var(--accent)]" />
                        : <Lock className="w-4 h-4 text-[var(--muted-foreground)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--foreground)] truncate">{letter.title}</h3>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {letter.isUnlocked
                          ? `${t.letters.unlockedOn} ${format(new Date(letter.unlockDate), "MMMM d, yyyy", { locale })}`
                          : `${t.letters.unlocksIn} ${formatDistanceToNow(new Date(letter.unlockDate), { addSuffix: true, locale })}`}
                      </p>
                      {!letter.isUnlocked && (
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {format(new Date(letter.unlockDate), "MMMM d, yyyy", { locale })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {letter.isUnlocked && (
                      <Button size="sm" variant={letter.opened ? "outline" : "default"} onClick={() => letter.opened ? setOpenedLetter(letter) : handleOpen(letter)}>
                        {letter.opened ? t.letters.readAgain : t.letters.open}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleDelete(letter.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
