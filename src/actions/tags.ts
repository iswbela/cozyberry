"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getTags() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.tag.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });
}

export async function createTag(name: string, color?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const tag = await prisma.tag.create({
    data: { userId: session.user.id, name, color: color ?? "#F8C8DC" },
  });
  revalidatePath("/tags");
  return { success: true, tag };
}

export async function updateTag(id: string, name: string, color: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const tag = await prisma.tag.update({
    where: { id, userId: session.user.id },
    data: { name, color },
  });
  revalidatePath("/tags");
  return { success: true, tag };
}

export async function deleteTag(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.tag.delete({ where: { id, userId: session.user.id } });
  revalidatePath("/tags");
  return { success: true };
}
