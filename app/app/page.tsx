import { auth, signOut } from "@/auth";
import { Logo } from "@/components/logo";
import { resolveAuthSecret } from "@/lib/auth-secret";

export default async function AppPage() {
  resolveAuthSecret();
  const session = await auth();
  const email = session?.user?.email ?? "unknown";

  return (
    <main className="min-h-screen bg-[#0B0E14] text-slate-50">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Logo href="/app" />
        <form
          action={async () => {
            "use server";
            resolveAuthSecret();
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
          >
            Sign out
          </button>
        </form>
      </header>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-8 shadow-xl">
          <h1 className="text-2xl font-semibold tracking-tight">You're signed in</h1>
          <p className="mt-3 text-slate-400">
            Welcome to your MarkStore dashboard stub.
          </p>
          <p className="mt-6 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm">
            <span className="text-slate-500">Email · </span>
            <span className="font-medium text-slate-100">{email}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
