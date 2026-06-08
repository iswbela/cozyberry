"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { registerUser } from "@/actions/auth";
import { useLang } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "no-match", path: ["confirmPassword"] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await registerUser({ name: data.name, email: data.email, password: data.password });
      if (result.error) { setError(result.error); return; }
      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      router.push("/dashboard");
      router.refresh();
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
          <p className="text-[var(--muted-foreground)] mt-1">{t.auth.registerSubtitle}</p>
          <div className="flex justify-center gap-2 mt-3">
            <button onClick={() => setLang("pt")} className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${lang === "pt" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>PT</button>
            <span className="text-[var(--muted-foreground)] text-xs self-center">/</span>
            <button onClick={() => setLang("en")} className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${lang === "en" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>EN</button>
          </div>
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl">{t.auth.createYourAccount}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="name">{t.auth.name}</Label>
                <Input id="name" placeholder={t.auth.namePlaceholder} {...register("name")} />
                {errors.name && <p className="text-xs text-red-500">{t.auth.nameMin}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input id="email" type="email" placeholder={t.auth.emailPlaceholder} {...register("email")} />
                {errors.email && <p className="text-xs text-red-500">{t.auth.emailInvalid}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.auth.password}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder={t.auth.passwordMinPlaceholder} {...register("password")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{t.auth.passwordMin}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
                <Input id="confirmPassword" type="password" placeholder={t.auth.confirmPasswordPlaceholder} {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-xs text-red-500">{t.auth.passwordNoMatch}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t.auth.creatingAccount : t.auth.createAccount}
              </Button>
            </form>
            <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
              {t.auth.alreadyHaveAccount}{" "}
              <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">{t.auth.signInLink}</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
