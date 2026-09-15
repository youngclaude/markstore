"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface DocsSidebarProps {
  sections: SidebarSection[];
}

export function DocsSidebar({ sections }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/60">
      <div className="sticky top-0 h-screen overflow-y-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/docs" className="flex items-center gap-2 text-sm font-semibold text-white">
            <LogoMark className="h-5 w-5" />
            MarkStore Docs
          </Link>
          <p className="mt-1 text-xs text-slate-500">
            File storage, collaboration and versioning for your projects.
          </p>
        </div>
        <nav className="space-y-6">
          {sections.map((section, i) => (
            <div key={i}>
              {section.title && (
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-[#1D7BFF]/15 text-blue-200 font-medium"
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <GlobeIcon className="h-4 w-4" />
            Base URL
          </p>
          <p className="mt-1 text-xs text-slate-400">https://usemarkstore.com</p>
        </div>
      </div>
    </aside>
  );
}

function LogoMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <span className="absolute left-0 top-0 h-[70%] w-[70%] rounded-[2px] bg-[#1D7BFF]" />
      <span className="absolute left-[18%] top-[18%] h-[70%] w-[70%] rounded-[2px] bg-[#4F9DFF]" />
      <span className="absolute left-[36%] top-[36%] h-[70%] w-[70%] rounded-[2px] bg-[#7BB6FF]" />
    </span>
  );
}

function GlobeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10" />
    </svg>
  );
}
