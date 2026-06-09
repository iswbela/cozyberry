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
