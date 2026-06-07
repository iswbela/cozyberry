"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const EntrySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  mood: z.string().optional(),
  entryDate: z.string(),
  tagIds: z.array(z.string()).optional(),
});

export async function createEntry(data: {
  title: string;
  content: string;
  mood?: string;
  entryDate: string;
  tagIds?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = EntrySchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid fields" };

  // One entry per day
  const date = new Date(parsed.data.entryDate);
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existing = await prisma.journalEntry.findFirst({
    where: {
      userId: session.user.id,
      entryDate: { gte: dayStart, lte: dayEnd },
    },
  });
  if (existing) return { error: "day_exists", existingId: existing.id };

  const entry = await prisma.journalEntry.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      mood: parsed.data.mood,
      entryDate: new Date(parsed.data.entryDate),
      tags: parsed.data.tagIds?.length
        ? { create: parsed.data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
    include: { tags: { include: { tag: true } } },
  });

  revalidatePath("/dashboard");
  revalidatePath("/journal");
  revalidatePath("/calendar");
  return { success: true, entry };
}

export async function updateEntry(
  id: string,
  data: {
    title?: string;
    content?: string;
    mood?: string;
    entryDate?: string;
    tagIds?: string[];
  }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const existing = await prisma.journalEntry.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { error: "Not found" };

  if (data.tagIds !== undefined) {
    await prisma.journalEntryTag.deleteMany({ where: { journalEntryId: id } });
  }

  const entry = await prisma.journalEntry.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.content && { content: data.content }),
      ...(data.mood !== undefined && { mood: data.mood }),
      ...(data.entryDate && { entryDate: new Date(data.entryDate) }),
      ...(data.tagIds?.length && {
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
      }),
    },
    include: { tags: { include: { tag: true } } },
  });

  revalidatePath("/dashboard");
  revalidatePath("/journal");
  revalidatePath(`/journal/${id}`);
  return { success: true, entry };
}

export async function deleteEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.journalEntry.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/journal");
  revalidatePath("/calendar");
  return { success: true };
}

export async function getEntries(params?: {
  search?: string;
  tagId?: string;
  mood?: string;
  limit?: number;
  offset?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", entries: [] };

  const entries = await prisma.journalEntry.findMany({
    where: {
      userId: session.user.id,
      ...(params?.search && {
        OR: [
          { title: { contains: params.search, mode: "insensitive" } },
          { content: { contains: params.search, mode: "insensitive" } },
        ],
      }),
      ...(params?.tagId && { tags: { some: { tagId: params.tagId } } }),
      ...(params?.mood && { mood: params.mood }),
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { entryDate: "desc" },
    take: params?.limit ?? 50,
    skip: params?.offset ?? 0,
  });

  return { entries };
}

export async function getEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.journalEntry.findFirst({
    where: { id, userId: session.user.id },
    include: { tags: { include: { tag: true } } },
  });
}
