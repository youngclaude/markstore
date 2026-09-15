import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByEmail } from "@/lib/db";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { verifyPassword } from "@/lib/password";

function createNextAuth() {
  // Resolve Workers secret binding into process.env before Auth.js reads it
  let secret: string | undefined;
  try {
    secret = resolveAuthSecret();
  } catch {
    // Fall back to process.env directly
    secret = process.env.AUTH_SECRET;
  }

  // If no secret is available, we can't create a valid auth instance
  // Auth.js will throw when trying to sign/verify JWTs
  if (!secret) {
    console.error("[Auth] No AUTH_SECRET available");
  }

  return NextAuth({
    trustHost: true,
    secret,
    session: { strategy: "jwt" },
    pages: {
      signIn: "/signin",
    },
    providers: [
      Credentials({
        id: "credentials",
        name: "Email and Password",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const email = String(credentials?.email ?? "")
            .toLowerCase()
            .trim();
          const password = String(credentials?.password ?? "");
          if (!email || !password) return null;

          const user = await findUserByEmail(email);
          if (!user) return null;
          const ok = await verifyPassword(password, user.password_hash);
          if (!ok) return null;
          return { id: user.id, email: user.email };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.sub = user.id;
          token.email = user.email;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.sub ?? "";
          session.user.email = (token.email as string | undefined) ?? session.user.email;
        }
        return session;
      },
    },
  });
}

type AuthApi = ReturnType<typeof createNextAuth>;

let cached: AuthApi | null = null;
let authError: Error | null = null;

function getAuth(): AuthApi | null {
  if (authError) return null;
  if (!cached) {
    try {
      cached = createNextAuth();
    } catch (error) {
      console.error("[auth] Error creating NextAuth:", error);
      authError = error as Error;
      return null;
    }
  }
  return cached;
}

export const handlers = {
  GET: async (req: Request) => {
    const authInstance = getAuth();
    if (!authInstance) {
      return new Response(JSON.stringify({ error: "Auth not configured" }), { status: 500 });
    }
    return authInstance.handlers.GET(req);
  },
  POST: async (req: Request) => {
    const authInstance = getAuth();
    if (!authInstance) {
      return new Response(JSON.stringify({ error: "Auth not configured" }), { status: 500 });
    }
    return authInstance.handlers.POST(req);
  },
};

export const auth: AuthApi["auth"] = (async (...args: Parameters<AuthApi["auth"]>) => {
  try {
    const authInstance = getAuth();
    if (!authInstance) {
      console.error("[auth] No auth instance available");
      return null;
    }
    // @ts-expect-error Auth.js overload forwarding
    return await authInstance.auth(...args);
  } catch (error) {
    console.error("[auth] Error in auth():", error);
    return null;
  }
}) as AuthApi["auth"];

export const signIn: AuthApi["signIn"] = (async (...args: Parameters<AuthApi["signIn"]>) => {
  const authInstance = getAuth();
  if (!authInstance) {
    throw new Error("Auth not configured");
  }
  // @ts-expect-error Auth.js overload forwarding
  return authInstance.signIn(...args);
}) as AuthApi["signIn"];

export const signOut: AuthApi["signOut"] = (async (...args: Parameters<AuthApi["signOut"]>) => {
  const authInstance = getAuth();
  if (!authInstance) {
    throw new Error("Auth not configured");
  }
  // @ts-expect-error Auth.js overload forwarding
  return authInstance.signOut(...args);
}) as AuthApi["signOut"];
