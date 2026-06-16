import type { JournalEntry, Tag, FutureLetter, User, Notebook, Note } from "@prisma/client";

export type JournalEntryWithTags = JournalEntry & {
  tags: { tag: Tag }[];
};

export type FutureLetterWithStatus = FutureLetter & {
  isUnlocked: boolean;
};

export type UserProfile = Pick<User, "id" | "name" | "email" | "image" | "theme">;

export type NotebookWithCount = Notebook & {
  _count: { notes: number };
};

export type NoteWithNotebook = Note & {
  notebook: Notebook;
};

// ─── Health types (manually defined until prisma generate runs) ─────────────

export type WeightEntry = {
  id: string;
  userId: string;
  date: Date;
  weightKg: number;
  createdAt: Date;
};

export type GymSession = {
  id: string;
  userId: string;
  date: Date;
  durationMin: number | null;
  focus: string | null;
  energyBefore: number | null;
  energyAfter: number | null;
  perceivedLoad: string | null;
  notes: string | null;
  createdAt: Date;
};

export type CryEntry = {
  id: string;
  userId: string;
  date: Date;
  times: number | null;
  durationMin: number | null;
  reason: string | null;
  journalEntryId: string | null;
  createdAt: Date;
};

export type CryEntryWithJournal = CryEntry & {
  journalEntry: (JournalEntry & { tags: { tag: Tag }[] }) | null;
};
