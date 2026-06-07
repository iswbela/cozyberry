import type { JournalEntry, Tag, FutureLetter, User } from "@prisma/client";

export type JournalEntryWithTags = JournalEntry & {
  tags: { tag: Tag }[];
};

export type FutureLetterWithStatus = FutureLetter & {
  isUnlocked: boolean;
};

export type UserProfile = Pick<User, "id" | "name" | "email" | "image" | "theme">;
