"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { DocIcon, LockIcon, MailIcon } from "@/components/icons";

const inputClass =
  "w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-3 pl-10 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-[#1D7BFF] focus:ring-1 focus:ring-[#1D7BFF]/40";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");
    const planToStore = String(fd.get("planToStore") ?? "");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword, planToStore }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create account.");
        setPending(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Account created, but sign-in failed. Try signing in.");
        setPending(false);
        return;
      }
      window.location.href = "/app";
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <label className="block text-sm text-slate-300">
        Email
        <span className="relative mt-1.5 block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <MailIcon />
          </span>
          <input
            className={inputClass}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
          />
        </span>
      </label>

      <label className="block text-sm text-slate-300">
        Password
        <span className="relative mt-1.5 block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <LockIcon />
          </span>
          <input
            className={inputClass}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Create a strong password"
          />
        </span>
      </label>

      <label className="block text-sm text-slate-300">
        Confirm password
        <span className="relative mt-1.5 block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <LockIcon />
          </span>
          <input
            className={inputClass}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Re-enter your password"
          />
        </span>
      </label>

      <label className="block text-sm text-slate-300">
        What are you planning to store?{" "}
        <span className="text-slate-500">(optional)</span>
        <span className="relative mt-1.5 block">
          <span className="pointer-events-none absolute left-3 top-3 text-slate-500">
            <DocIcon />
          </span>
          <textarea
            className={`${inputClass} min-h-[88px] resize-y pt-3`}
            name="planToStore"
            rows={3}
            placeholder="e.g. CLAUDE.md files, Cursor rules, OpenClaw memory"
          />
        </span>
      </label>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl bg-gradient-to-r from-[#1D7BFF] to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Start storing →"}
      </button>
    </form>
  );
}
