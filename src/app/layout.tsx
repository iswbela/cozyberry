import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "CozyBerry — Your Personal Journal",
  description: "A cozy, aesthetic digital journaling platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply stored theme before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('cozyberry-theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
