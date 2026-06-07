import { auth } from "@/lib/auth";
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const session = await auth();
  return (
    <ProfileView
      user={{
        id: session?.user?.id ?? "",
        name: session?.user?.name ?? null,
        email: session?.user?.email ?? null,
        image: session?.user?.image ?? null,
        theme: (session?.user as any)?.theme ?? "light",
      }}
    />
  );
}
