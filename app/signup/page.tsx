import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#0B0E14] px-6 py-16 text-slate-50">
      <div className="mx-auto flex max-w-md flex-col gap-6 rounded-2xl border border-slate-700/60 bg-slate-950/80 p-8 shadow-2xl">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Back to MarkStore
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Start storing</h1>
        <p className="text-slate-400">
          Signup is coming soon. This placeholder keeps the landing CTA clickable for the MVP
          walkthrough.
        </p>
        <div className="flex flex-col gap-3">
          <label className="text-sm text-slate-300">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-[#1D7BFF]"
              placeholder="you@company.com"
              type="email"
              name="email"
            />
          </label>
          <button
            type="button"
            className="mt-2 rounded-lg bg-[#1D7BFF] px-4 py-2.5 font-medium text-white hover:bg-blue-500"
          >
            Join waitlist
          </button>
        </div>
        <p className="text-xs text-slate-500">No account created yet — placeholder only.</p>
      </div>
    </main>
  );
}
