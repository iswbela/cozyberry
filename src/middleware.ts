import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Use the edge-safe config (no Prisma) for middleware
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
