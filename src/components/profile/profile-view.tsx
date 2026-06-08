"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/providers/theme-provider";
import { useLang } from "@/providers/language-provider";
import { updateProfile, changePassword } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon, Eye, EyeOff } from "lucide-react";

interface ProfileViewProps {
  user: { id: string; name: string | null; email: string | null; image: string | null; theme: string };
}

export function ProfileView({ user }: ProfileViewProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { t } = useLang();

  const [name, setName] = useState(user.name ?? "");
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? "U";

  const handleProfileSave = async () => {
    setProfileLoading(true);
    const result = await updateProfile({ name });
    setProfileMsg(result.error ? { text: result.error, ok: false } : { text: t.profile.profileUpdated, ok: true });
    setProfileLoading(false);
    router.refresh();
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) { setPasswordMsg({ text: t.profile.passwordNoMatch, ok: false }); return; }
    if (newPassword.length < 8) { setPasswordMsg({ text: t.profile.passwordTooShort, ok: false }); return; }
    setPasswordLoading(true);
    const result = await changePassword({ currentPassword, newPassword });
    setPasswordMsg(result.error ? { text: result.error, ok: false } : { text: t.profile.passwordChanged, ok: true });
    if (!result.error) { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setPasswordLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">{t.profile.title}</h1>

      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 text-lg">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-lg">{user.name ?? "Anonymous"}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{user.email}</p>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader><CardTitle className="text-base">{t.profile.accountDetails}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {profileMsg && (
            <div className={`rounded-xl px-4 py-3 text-sm ${profileMsg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
              {profileMsg.text}
            </div>
          )}
          <div className="space-y-2">
            <Label>{t.profile.displayName}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.profile.displayName} />
          </div>
          <div className="space-y-2">
            <Label>{t.profile.email}</Label>
            <Input value={user.email ?? ""} disabled className="opacity-60" />
          </div>
          <Button onClick={handleProfileSave} disabled={profileLoading}>
            {profileLoading ? t.profile.saving : t.profile.save}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t.profile.appearance}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === "light" ? "border-[var(--accent)] bg-[var(--primary)]/10" : "border-[var(--border)] hover:border-[var(--accent)]/50"}`}
            >
              <Sun className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium">{t.profile.light}</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === "dark" ? "border-[var(--accent)] bg-[var(--primary)]/10" : "border-[var(--border)] hover:border-[var(--accent)]/50"}`}
            >
              <Moon className="w-5 h-5 text-[var(--accent)]" />
              <span className="text-sm font-medium">{t.profile.dark}</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t.profile.changePassword}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {passwordMsg && (
            <div className={`rounded-xl px-4 py-3 text-sm ${passwordMsg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
              {passwordMsg.text}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.profile.currentPassword}</Label>
              <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1">
                {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPasswords ? t.profile.hide : t.profile.show}
              </button>
            </div>
            <Input type={showPasswords ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t.profile.currentPasswordPlaceholder} />
          </div>
          <div className="space-y-2">
            <Label>{t.profile.newPassword}</Label>
            <Input type={showPasswords ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t.profile.newPasswordPlaceholder} />
          </div>
          <div className="space-y-2">
            <Label>{t.profile.confirmNewPassword}</Label>
            <Input type={showPasswords ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t.profile.confirmPasswordPlaceholder} />
          </div>
          <Button onClick={handlePasswordChange} disabled={passwordLoading || !currentPassword || !newPassword}>
            {passwordLoading ? t.profile.changing : t.profile.changeBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
