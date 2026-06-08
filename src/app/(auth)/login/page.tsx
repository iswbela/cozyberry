"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      if (result?.error) { setError(t.auth.invalidCredentials); }
      else { router.push("/dashboard"); router.refresh(); }
    } catch { setError(t.auth.somethingWrong); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/images/cozyberry-2.png" alt="CozyBerry" width={64} height={64} className="w-16 h-16" />
          </div>
          <p className="text-[var(--muted-foreground)] mt-1">{t.auth.loginSubtitle}</p>
          {/* Language toggle */}
          <div className="flex justify-center gap-2 mt-3">
            <button onClick={() => setLang("pt")} className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${lang === "pt" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>PT</button>
            <span className="text-[var(--muted-foreground)] text-xs self-center">/</span>
            <button onClick={() => setLang("en")} className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${lang === "en" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>EN</button>
          </div>
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl">{t.auth.welcome}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input id="email" type="email" placeholder={t.auth.emailPlaceholder} {...register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.auth.password}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder={t.auth.passwordPlaceholder} {...register("password")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t.auth.signingIn : t.auth.signIn}
              </Button>
            </form>
            <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
              {t.auth.noAccount}{" "}
              <Link href="/register" className="text-[var(--accent)] hover:underline font-medium">{t.auth.createOne}</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
