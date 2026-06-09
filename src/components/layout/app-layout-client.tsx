"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";

interface AppLayoutClientProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: React.ReactNode;
}

// Routes that should use full available space (no max-width, no py padding)
const FULL_SCREEN_PREFIXES = ["/notebooks/"];

export function AppLayoutClient({ user, children }: AppLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isFullScreen = FULL_SCREEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const MobileBar = (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] md:hidden sticky top-0 bg-[var(--background)] z-10 shrink-0">
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-[var(--foreground)]" />
      </button>
      <Image
        src="/images/cozyberry.png"
        alt="CozyBerry"
        width={120}
        height={36}
        className="h-7 w-auto"
      />
    </div>
  );

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <SidebarNav
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {isFullScreen ? (
        /* Full-screen mode: no max-width, fills entire available area */
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {MobileBar}
          <div className="flex-1 min-h-0 px-4 md:px-6 py-4 md:py-5 flex flex-col">
            {children}
          </div>
        </main>
      ) : (
        /* Normal mode: scrollable with max-width */
        <main className="flex-1 overflow-y-auto min-w-0">
          {MobileBar}
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {children}
          </div>
        </main>
      )}
    </div>
  );
}
