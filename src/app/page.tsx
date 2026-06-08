"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookHeart, Calendar, BarChart2, Mail, Tag, Clock } from "lucide-react";
import { useLang } from "@/providers/language-provider";

const FEATURE_ICONS = [BookHeart, Calendar, BarChart2, Mail, Tag, Clock];

export default function LandingPage() {
  const { t, lang, setLang } = useLang();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center">
          <Image src="/images/cozyberry.png" alt="CozyBerry" width={140} height={40} className="h-9 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <div className="flex items-center gap-1">
            <button onClick={() => setLang("pt")} className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${lang === "pt" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>PT</button>
            <span className="text-[var(--muted-foreground)] text-xs">/</span>
            <button onClick={() => setLang("en")} className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${lang === "en" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>EN</button>
          </div>
          <Button asChild variant="ghost"><Link href="/login">{t.landing.signIn}</Link></Button>
          <Button asChild><Link href="/register">{t.landing.getStarted}</Link></Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/30 text-sm text-[var(--accent)] font-medium mb-6">
          {t.landing.badge}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-[var(--foreground)] mb-6 leading-tight">
          {t.landing.heroTitle1}<br />
          <span className="text-[var(--accent)]">{t.landing.heroTitle2}</span>
        </h1>
        <p className="text-xl text-[var(--muted-foreground)] mb-10 max-w-2xl mx-auto">{t.landing.heroDesc}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg"><Link href="/register">{t.landing.startFree}</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/login">{t.landing.signIn}</Link></Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[var(--foreground)] mb-12">{t.landing.featuresTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.landing.features.map(({ title, desc }, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={title} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/30 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-[var(--foreground)]">{title}</h3>
                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center bg-[var(--primary)]/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">{t.landing.ctaTitle}</h2>
          <p className="text-[var(--muted-foreground)] mb-8">{t.landing.ctaDesc}</p>
          <Button asChild size="lg"><Link href="/register">{t.landing.ctaBtn}</Link></Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-[var(--muted-foreground)] border-t border-[var(--border)]">
        <div className="flex items-center justify-center mb-2">
          <Image src="/images/cozyberry-2.png" alt="CozyBerry" width={32} height={32} className="w-8 h-8" />
        </div>
        <p>{t.landing.footer}</p>
      </footer>
    </div>
  );
}
