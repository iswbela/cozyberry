"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/providers/theme-provider";
import { useLang } from "@/providers/language-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Clock,
  Search,
  Tag,
  BarChart2,
  Mail,
  User,
  LogOut,
  Sun,
  Moon,
  X,
  NotebookPen,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ICONS = [
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/journal",   icon: BookOpen,        key: "journal" },
  { href: "/notebooks", icon: NotebookPen,     key: "notebooks" },
  { href: "/reminders", icon: Bell,            key: "reminders" },
  { href: "/calendar",  icon: Calendar,        key: "calendar" },
  { href: "/timeline",  icon: Clock,           key: "timeline" },
  { href: "/search",    icon: Search,          key: "search" },
  { href: "/tags",      icon: Tag,             key: "tags" },
  { href: "/stats",     icon: BarChart2,       key: "stats" },
  { href: "/letters",   icon: Mail,            key: "letters" },
  { href: "/profile",   icon: User,            key: "profile" },
] as const;

interface SidebarNavProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  isOpen?: boolean;
  onClose?: () => void;
}

export function SidebarNav({ user, isOpen = false, onClose }: SidebarNavProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useLang();

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? "U";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--border)] shrink-0 transition-transform duration-200",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
        <Link href="/dashboard" onClick={onClose} className="hover:opacity-80 transition-opacity">
          <Image src="/images/cozyberry.png" alt="CozyBerry" width={140} height={40} className="h-8 w-auto" />
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ICONS.map(({ href, icon: Icon, key }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          const label = t.nav[key as keyof typeof t.nav];
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[var(--border)] space-y-1">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all w-full"
        >
          {theme === "light"
            ? <><Moon className="w-4 h-4" /> {t.nav.darkMode}</>
            : <><Sun className="w-4 h-4" /> {t.nav.lightMode}</>
          }
        </button>

        {/* Language Toggle */}
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={() => setLang("pt")}
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-lg transition-colors",
              lang === "pt"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            )}
          >
            PT
          </button>
          <span className="text-[var(--muted-foreground)] text-xs">/</span>
          <button
            onClick={() => setLang("en")}
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-lg transition-colors",
              lang === "en"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            )}
          >
            EN
          </button>
        </div>

        {/* User + Sign Out */}
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">{user.name ?? "User"}</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
            title={t.nav.signOut}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
