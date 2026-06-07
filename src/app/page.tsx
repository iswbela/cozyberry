import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookHeart, Calendar, BarChart2, Mail, Tag, Clock } from "lucide-react";

const features = [
  { icon: BookHeart, title: "Rich Journaling", desc: "Write with a beautiful editor. Format your thoughts with headings, lists, quotes, and more." },
  { icon: Calendar, title: "Calendar View", desc: "See your journaling history at a glance. Navigate by month and revisit any day." },
  { icon: BarChart2, title: "Mood & Stats", desc: "Track your moods over time and see beautiful charts of your journaling habits." },
  { icon: Mail, title: "Letters to Future Me", desc: "Write sealed messages to yourself, locked until a date you choose in the future." },
  { icon: Tag, title: "Tags & Filters", desc: "Organize entries with custom colorful tags. Filter and find what matters." },
  { icon: Clock, title: "Timeline", desc: "Scroll through your life story in a beautiful chronological timeline view." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <BookHeart className="w-5 h-5 text-[var(--primary-foreground)]" />
          </div>
          <span className="text-xl font-bold text-[var(--foreground)]">CozyBerry</span>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/30 text-sm text-[var(--accent)] font-medium mb-6">
          🌸 Your cozy journaling space
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[var(--foreground)] mb-6 leading-tight">
          A journal that feels like<br />
          <span className="text-[var(--accent)]">coming home</span>
        </h1>
        <p className="text-xl text-[var(--muted-foreground)] mb-10 max-w-2xl mx-auto">
          CozyBerry is a warm, beautiful digital journaling platform. Track your moods,
          organize your thoughts, and write letters to your future self — all in one cozy place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/register">Start Journaling Free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[var(--foreground)] mb-12">
          Everything you need to journal beautifully
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/30 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-[var(--foreground)]">{title}</h3>
              <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center bg-[var(--primary)]/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-[var(--muted-foreground)] mb-8">
            Join CozyBerry and make journaling a habit you&apos;ll love.
          </p>
          <Button asChild size="lg">
            <Link href="/register">Create Your Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-[var(--muted-foreground)] border-t border-[var(--border)]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookHeart className="w-4 h-4 text-[var(--accent)]" />
          <span>CozyBerry</span>
        </div>
        <p>Your personal journaling space.</p>
      </footer>
    </div>
  );
}
