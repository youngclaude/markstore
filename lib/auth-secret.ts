import { env } from "cloudflare:workers";

/** Resolve AUTH_SECRET from Workers binding or process.env (local .dev.vars). */
export function resolveAuthSecret(): string {
  // First check if already in process.env (populated by nodejs_compat_populate_process_env flag
  // or from .dev.vars locally)
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }

  // Try to get from Workers env binding
  try {
    const binding = (env as { AUTH_SECRET?: string })?.AUTH_SECRET;
    if (binding) {
      process.env.AUTH_SECRET = binding;
      return binding;
    }
  } catch {
    // env access may fail in certain contexts
  }

  throw new Error("AUTH_SECRET is not configured");
}
