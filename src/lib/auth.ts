import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { rateLimit, clientKeyFromRequest } from "@/lib/rateLimit";

// Known placeholder values that must never be used in production. This is a
// blocklist of publicly-documented example values (e.g. from .env.example or
// this repo's own local dev setup) — not a real credential.
const KNOWN_INSECURE_AUTH_SECRETS = new Set([
  "dev-only-secret-change-in-production-0123456789",
  "replace-with-a-long-random-string",
]);

// `next build` always runs with NODE_ENV=production (even for a local/dev
// build), but it never serves requests — only `next start` (or an actual
// production server) does. Real secrets are typically injected at deploy
// time, after the build step, so this check must only run when the app is
// actually about to serve traffic, not while it's merely being compiled.
const isProductionBuildStep = process.env.NEXT_PHASE === "phase-production-build";

if (process.env.NODE_ENV === "production" && !isProductionBuildStep) {
  if (!process.env.AUTH_SECRET) {
    throw new Error(
      "AUTH_SECRET is not set. Generate a real, unique secret (e.g. `npx auth secret`) and set it in the production environment before starting the app."
    );
  }
  if (KNOWN_INSECURE_AUTH_SECRETS.has(process.env.AUTH_SECRET)) {
    throw new Error(
      "AUTH_SECRET is still set to a placeholder value from local development. Generate a real, unique secret before deploying to production."
    );
  }
} else if (!process.env.AUTH_SECRET) {
  console.warn(
    "AUTH_SECRET is not set. Add it to your .env file — see .env.example. Auth requests will fail until it is set."
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        // Throttle per client IP before touching the database. The same
        // generic failure (`null`) is returned whether the request was
        // rate-limited, the email doesn't exist, or the password is wrong —
        // so this never reveals which case occurred.
        if (!rateLimit(clientKeyFromRequest(request, "login"), 10, 5 * 60_000)) {
          return null;
        }

        const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
});
