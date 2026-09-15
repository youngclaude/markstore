/** Resolve AUTH_SECRET from Workers binding or process.env (local .dev.vars). */
export function resolveAuthSecret(): string {
  // First check if already in process.env (populated by nodejs_compat_populate_process_env flag
  // or from .dev.vars locally)
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }

  // Try to get from Workers env binding (wrapped in try-catch as env access
  // may throw in certain contexts like RSC)
  try {
    const { env } = require("cloudflare:workers") as { env: { AUTH_SECRET?: string } };
    const binding = env?.AUTH_SECRET;
    if (binding) {
      process.env.AUTH_SECRET = binding;
      return binding;
    }
  } catch {
    // cloudflare:workers may not be available in all contexts
  }

  throw new Error("AUTH_SECRET is not configured");
}
