import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppLayoutClient } from "@/components/layout/app-layout-client";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AppLayoutClient user={session.user}>
      {children}
    </AppLayoutClient>
  );
}
