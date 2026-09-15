import Link from "next/link";
import { Logo } from "@/components/logo";

const navLinks = [
  { href: "/docs", label: "Home" },
  { href: "/docs/quickstart", label: "Quickstart" },
  { href: "/docs/api", label: "API Reference" },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#0B0E14] text-slate-50">
      <header className="border-b border-slate-800/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Logo href="/docs" />
            <span className="text-sm font-medium text-slate-400">Docs</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/signin" className="text-slate-300 hover:text-white">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#1D7BFF] px-3.5 py-2 font-medium text-white hover:bg-blue-500"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
