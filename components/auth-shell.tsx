import { Logo } from "@/components/logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0B0E14] text-slate-50">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"
      />
      <header className="relative z-10 px-6 py-5">
        <Logo />
      </header>
      <div className="relative z-10 flex justify-center px-4 pb-16 pt-4 sm:pt-8">{children}</div>
    </main>
  );
}
