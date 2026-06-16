"use server";

import { prisma as prismaClient } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = prismaClient as any;
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── helpers ───────────────────────────────────────────────────────────────

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

// ─── Weight ────────────────────────────────────────────────────────────────

const WeightSchema = z.object({
  date: z.string().min(1),
  weightKg: z.number().min(1).max(999),
});

export async function upsertWeight(data: { date: string; weightKg: number }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = WeightSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid fields" };

  const date = parseLocalDate(parsed.data.date);

  const entry = await prisma.weightEntry.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date, weightKg: parsed.data.weightKg },
    update: { weightKg: parsed.data.weightKg },
  });

  revalidatePath("/health");
  revalidatePath("/calendar");
  return { success: true, entry };
}

export async function deleteWeight(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.weightEntry.delete({ where: { id, userId: session.user.id } });

  revalidatePath("/health");
  revalidatePath("/calendar");
  return { success: true };
}

export async function getWeightEntries() {
  const session = await auth();
  if (!session?.user?.id) return { entries: [] };

  const entries = await prisma.weightEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
  });

  return { entries };
}

// ─── Gym ───────────────────────────────────────────────────────────────────

const GymSchema = z.object({
  date: z.string().min(1),
  durationMin: z.number().min(1).max(600).optional().nullable(),
  focus: z.string().optional().nullable(),
  energyBefore: z.number().min(1).max(5).optional().nullable(),
  energyAfter: z.number().min(1).max(5).optional().nullable(),
  perceivedLoad: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export async function upsertGymSession(data: {
  date: string;
  durationMin?: number | null;
  focus?: string | null;
  energyBefore?: number | null;
  energyAfter?: number | null;
  perceivedLoad?: string | null;
  notes?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = GymSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid fields" };

  const date = parseLocalDate(parsed.data.date);
  const payload = {
    durationMin: parsed.data.durationMin ?? null,
    focus: parsed.data.focus ?? null,
    energyBefore: parsed.data.energyBefore ?? null,
    energyAfter: parsed.data.energyAfter ?? null,
    perceivedLoad: parsed.data.perceivedLoad ?? null,
    notes: parsed.data.notes ?? null,
  };

  const entry = await prisma.gymSession.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date, ...payload },
    update: payload,
  });

  revalidatePath("/health");
  revalidatePath("/calendar");
  return { success: true, entry };
}

export async function deleteGymSession(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.gymSession.delete({ where: { id, userId: session.user.id } });

  revalidatePath("/health");
  revalidatePath("/calendar");
  return { success: true };
}

export async function getGymSessions() {
  const session = await auth();
  if (!session?.user?.id) return { sessions: [] };

  const sessions = await prisma.gymSession.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return { sessions };
}

// ─── Cry ───────────────────────────────────────────────────────────────────

const CrySchema = z.object({
  date: z.string().min(1),
  times: z.number().min(1).max(99).optional().nullable(),
  durationMin: z.number().min(1).max(999).optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
  journalEntryId: z.string().optional().nullable(),
});

export async function upsertCryEntry(data: {
  date: string;
  times?: number | null;
  durationMin?: number | null;
  reason?: string | null;
  journalEntryId?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = CrySchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid fields" };

  const date = parseLocalDate(parsed.data.date);
  const payload = {
    times: parsed.data.times ?? null,
    durationMin: parsed.data.durationMin ?? null,
    reason: parsed.data.reason ?? null,
    journalEntryId: parsed.data.journalEntryId ?? null,
  };

  const entry = await prisma.cryEntry.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date, ...payload },
    update: payload,
    include: { journalEntry: { include: { tags: { include: { tag: true } } } } },
  });

  revalidatePath("/health");
  revalidatePath("/calendar");
  return { success: true, entry };
}

export async function deleteCryEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.cryEntry.delete({ where: { id, userId: session.user.id } });

  revalidatePath("/health");
  revalidatePath("/calendar");
  return { success: true };
}

export async function getCryEntries() {
  const session = await auth();
  if (!session?.user?.id) return { entries: [] };

  const entries = await prisma.cryEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    include: { journalEntry: { include: { tags: { include: { tag: true } } } } },
  });

  return { entries };
}
