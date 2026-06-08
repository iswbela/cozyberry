import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no Prisma, no Node-only modules.
// Used by middleware. The full config (with Prisma adapter) lives in src/lib/auth.ts.
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  cookies: {
    sessionToken: {
      options: {
        maxAge: 365 * 24 * 60 * 60, // 365 days
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/api/auth");

      if (isPublic) return true;
      if (!isLoggedIn) return false;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.theme = (user as any).theme;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).theme = token.theme;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
