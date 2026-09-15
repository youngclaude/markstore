import Link from "next/link";
import { PLAN_FEATURES, PLAN_LIMITS } from "@/lib/billing-constants";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="relative inline-flex h-5 w-5">
        <span className="absolute left-0 top-0 h-[14px] w-[14px] rounded-[3px] bg-[#1D7BFF]" />
        <span className="absolute left-1 top-1 h-[14px] w-[14px] rounded-[3px] bg-[#4F9DFF]" />
        <span className="absolute left-2 top-2 h-[14px] w-[14px] rounded-[3px] bg-[#7BB6FF]" />
      </span>
      MarkStore
    </Link>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.5 0 3-.3 4.3-.9" />
      <path d="M22 2l-10 10" />
      <path d="M16 2l6 6" />
      <path d="M22 2H16" />
      <path d="M22 2v6" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0B0E14] text-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <Link href="/#features" className="hover:text-white">
            Features
          </Link>
          <Link href="/pricing" className="text-white">
            Pricing
          </Link>
          <a href="#docs" className="hover:text-white">
            Docs
          </a>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/signin" className="hidden text-slate-300 hover:text-white sm:inline">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[#1D7BFF] px-3.5 py-2 font-medium text-white hover:bg-blue-500"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-12 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#6366F1]">
          Simple, Transparent Pricing
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          The right plan for{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
            your growth
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          Start free, or upgrade to Pro for more projects, higher limits, and powerful features
          like the API and team sharing.
        </p>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-2">
          {/* Free Plan */}
          <div className="relative rounded-2xl border border-slate-700/70 bg-slate-950/60 p-8 text-left">
            <div className="mb-6 flex items-start gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <LeafIcon className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-semibold">{PLAN_FEATURES.free.name}</h2>
                <p className="text-sm text-slate-400">{PLAN_FEATURES.free.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-5xl font-bold">${PLAN_FEATURES.free.price}</span>
              <span className="text-slate-400">/mo</span>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">📁</span>
                <span className="text-slate-300">Projects</span>
                <span className="ml-auto text-slate-100">Up to {PLAN_LIMITS.free.projects}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">💾</span>
                <span className="text-slate-300">Storage</span>
                <span className="ml-auto text-slate-100">Up to {PLAN_LIMITS.free.storageGb} GB</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">{"</>"}</span>
                <span className="text-slate-300">API Calls</span>
                <span className="ml-auto text-slate-100">Up to {PLAN_LIMITS.free.apiCallsPerMonth.toLocaleString()} / month</span>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              {PLAN_FEATURES.free.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckIcon className="h-4 w-4 text-emerald-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="block w-full rounded-xl border border-slate-600 bg-slate-800/50 py-3 text-center font-medium text-white hover:bg-slate-800"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl border border-[#6366F1]/40 bg-gradient-to-b from-[#6366F1]/10 to-transparent p-8 text-left ring-1 ring-[#6366F1]/20">
            <div className="absolute -top-3 right-6">
              <span className="rounded-full bg-[#6366F1] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Most Popular
              </span>
            </div>

            <div className="mb-6 flex items-start gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366F1]/20 text-[#818CF8]">
                <CrownIcon className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-semibold">{PLAN_FEATURES.pro.name}</h2>
                <p className="text-sm text-slate-400">{PLAN_FEATURES.pro.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-5xl font-bold">${PLAN_FEATURES.pro.price}</span>
              <span className="text-slate-400">/mo</span>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">📁</span>
                <span className="text-slate-300">Projects</span>
                <span className="ml-auto text-slate-100">Up to {PLAN_LIMITS.pro.projects}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">💾</span>
                <span className="text-slate-300">Storage</span>
                <span className="ml-auto text-slate-100">Up to {PLAN_LIMITS.pro.storageGb} GB</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">{"</>"}</span>
                <span className="text-slate-300">API Calls</span>
                <span className="ml-auto text-slate-100">Up to {PLAN_LIMITS.pro.apiCallsPerMonth.toLocaleString()} / month</span>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              {PLAN_FEATURES.pro.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckIcon className="h-4 w-4 text-[#818CF8]" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup?plan=pro"
              className="block w-full rounded-xl bg-[#6366F1] py-3 text-center font-medium text-white hover:bg-[#5558E3]"
            >
              Upgrade to Pro →
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">⚡</span>
            <span>Fast & Reliable</span>
            <span className="text-slate-500">99.9% uptime, always.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">🔒</span>
            <span>Secure by Design</span>
            <span className="text-slate-500">Your data, our priority.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">👥</span>
            <span>Built for Teams</span>
            <span className="text-slate-500">Collaborate without limits.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">💬</span>
            <span>Real Support</span>
            <span className="text-slate-500">Here when you need us.</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/80 px-6 py-8 text-center text-sm text-slate-500">
        <p>MarkStore · usemarkstore.com</p>
      </footer>
    </main>
  );
}
