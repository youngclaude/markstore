import { env } from "cloudflare:workers";

/** Resolve AUTH_SECRET from Workers binding or process.env (local .dev.vars). */
export function resolveAuthSecret(): string {
  const binding = (env as { AUTH_SECRET?: string }).AUTH_SECRET;
  if (binding) {
    process.env.AUTH_SECRET = binding;
    return binding;
  }
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  throw new Error("AUTH_SECRET is not configured");
}
