import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MOODS = [
  { value: "very_happy", label: "Very Happy", emoji: "😄", color: "#FFD93D" },
  { value: "happy", label: "Happy", emoji: "😊", color: "#6BCB77" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "#A8C5E0" },
  { value: "sad", label: "Sad", emoji: "😢", color: "#85A5C8" },
  { value: "anxious", label: "Anxious", emoji: "😰", color: "#E8A87C" },
  { value: "stressed", label: "Stressed", emoji: "😤", color: "#E87C7C" },
] as const;

export type MoodValue = (typeof MOODS)[number]["value"];

export function getMood(value: string | null | undefined) {
  return MOODS.find((m) => m.value === value) ?? null;
}
