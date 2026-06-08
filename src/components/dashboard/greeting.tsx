"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useLang } from "@/providers/language-provider";

function getGreeting(hour: number, t: { goodMorning: string; goodAfternoon: string; goodEvening: string }) {
  // 5:00 AM – 11:59 AM
  if (hour >= 5 && hour < 12) return t.goodMorning;
  // 12:00 PM – 5:59 PM
  if (hour >= 12 && hour < 18) return t.goodAfternoon;
  // 6:00 PM – 4:59 AM
  return t.goodEvening;
}

export function Greeting({ firstName }: { firstName: string }) {
  const { t, lang } = useLang();
  const [greeting, setGreeting] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    setGreeting(getGreeting(now.getHours(), t));
    setDateStr(format(now, "EEEE, MMMM d, yyyy", { locale: lang === "pt" ? ptBR : enUS }));
  }, [t, lang]);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
        {greeting ? `${greeting}, ${firstName} 🌸` : `Hey, ${firstName} 🌸`}
      </h1>
      <p className="text-[var(--muted-foreground)] mt-1">{dateStr}</p>
    </div>
  );
}
