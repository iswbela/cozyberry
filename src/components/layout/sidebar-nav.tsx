"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/providers/theme-provider";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/search", label: "Search", icon: Search },
  { href: "/tags", label: "Tags", icon: Tag },
  { href: "/stats", label: "Stats", icon: BarChart2 },
  { href: "/letters", label: "Letters", icon: Mail },
  { href: "/profile", label: "Profile", icon: User },
];

interface SidebarNavProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  isOpen?: boolean;
  onClose?: () => void;
}

export function SidebarNav({ user, isOpen = false, onClose }: SidebarNavProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? "U";

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <aside
      className={cn(
        // Mobile: fixed drawer sliding from left
        "fixed inset-y-0 left-0 z-30 w-64 flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--border)] shrink-0 transition-transform duration-200",
        // Show/hide on mobile
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: always visible, relative positioning
        "md:relative md:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
        <Link
          href="/dashboard"
          onClick={handleNavClick}
          className="hover:opacity-80 transition-opacity"
        >
          <Image
            src="/images/cozyberry.png"
            alt="CozyBerry"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
        </Link>
        {/* Close button — mobile only */}
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
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
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
      <div className="px-3 py-4 border-t border-[var(--border)] space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all w-full"
        >
          {theme === "light" ? (
            <><Moon className="w-4 h-4" /> Dark Mode</>
          ) : (
            <><Sun className="w-4 h-4" /> Light Mode</>
          )}
        </button>

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
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
