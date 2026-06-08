"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Greeting({ firstName }: { firstName: string }) {
  const [greeting, setGreeting] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    setGreeting(getGreeting(now.getHours()));
    setDateStr(format(now, "EEEE, MMMM d, yyyy"));
  }, []);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
        {greeting ? `${greeting}, ${firstName} 🌸` : `Hey, ${firstName} 🌸`}
      </h1>
      <p className="text-[var(--muted-foreground)] mt-1">{dateStr}</p>
    </div>
  );
}
