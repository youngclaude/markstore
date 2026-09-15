"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  FolderIcon,
  DocIcon,
  ProjectIcon,
  CloseIcon,
} from "@/components/icons";
import type { SearchResponse, SearchResultItem } from "@/app/api/search/route";

function SearchEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="absolute -left-8 -top-6 h-12 w-12 rounded-full border-2 border-dashed border-slate-600 opacity-40" />
        <div className="absolute -right-6 -bottom-4 h-8 w-8 rounded-full border-2 border-dashed border-slate-600 opacity-30" />
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800/60">
          <SearchIcon className="h-12 w-12 text-slate-500" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-200">
        No results found
      </h3>
      <p className="text-sm text-slate-400">
        Try <code className="rounded bg-slate-800 px-1.5 py-0.5 text-cyan-300">CLAUDE.md</code> or a project name.
      </p>
    </div>
  );
}

function SearchNoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="absolute -left-8 -top-6 h-12 w-12 rounded-full border-2 border-dashed border-slate-600 opacity-40" />
        <div className="absolute -right-6 -bottom-4 h-8 w-8 rounded-full border-2 border-dashed border-slate-600 opacity-30" />
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800/60">
          <SearchIcon className="h-12 w-12 text-slate-500" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-200">
        No results found
      </h3>
      <p className="mb-3 text-sm text-slate-400">
        We couldn&apos;t find anything for &quot;{query}&quot;.
      </p>
      <p className="flex items-center gap-2 text-sm text-slate-500">
        <span className="text-yellow-500">💡</span>
        Suggestion: Check spelling or browse the sidebar.
      </p>
    </div>
  );
}

function ResultIcon({ item }: { item: SearchResultItem }) {
  if (item.type === "project") {
    return <ProjectIcon className="h-5 w-5 text-[#4F9DFF]" />;
  }
  if (item.type === "folder") {
    return <FolderIcon className="h-5 w-5 text-[#4F9DFF]" />;
  }
  return <DocIcon className="h-5 w-5 text-slate-400" />;
}

function TypeTag({ item }: { item: SearchResultItem }) {
  if (item.type === "project") {
    return (
      <span className="shrink-0 rounded bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">
        project
      </span>
    );
  }
  if (item.type === "folder") {
    return (
      <span className="shrink-0 rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">
        folder
      </span>
    );
  }
  if (item.fileType === "json") {
    return (
      <span className="shrink-0 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
        .json
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded bg-cyan-500/20 px-2 py-0.5 text-xs font-medium text-cyan-300">
      .md
    </span>
  );
}

function SearchResult({
  item,
  isSelected,
  onClick,
}: {
  item: SearchResultItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
        isSelected
          ? "bg-[#1D7BFF]/15 ring-1 ring-[#1D7BFF]/30"
          : "hover:bg-slate-800/60"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800/80">
        <ResultIcon item={item} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-slate-100">
            {item.name}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          {item.path.split("/").filter(Boolean).map((segment, i, arr) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-600">/</span>}
              <span
                className={
                  i === arr.length - 1
                    ? "truncate text-slate-400"
                    : "shrink-0 text-slate-500"
                }
              >
                {segment}
              </span>
            </span>
          ))}
        </div>
      </div>
      <TypeTag item={item} />
    </button>
  );
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data: SearchResponse = await res.json();
        setResults(data.results);
        setHasSearched(true);
        setSelectedIndex(0);
      }
    } catch {
      /* ignore errors */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setHasSearched(false);
  }, []);

  const navigateToResult = useCallback(
    (item: SearchResultItem) => {
      handleClose();
      if (item.type === "project") {
        router.push(`/app/projects/${item.id}`);
      } else if (item.type === "folder") {
        router.push(`/app?folder=${item.id}`);
      } else {
        router.push(`/app/files/${item.id}`);
      }
    },
    [router, handleClose],
  );

  const handleKeyDownInModal = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        navigateToResult(results[selectedIndex]);
      }
    },
    [results, selectedIndex, navigateToResult, handleClose],
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-80 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 text-sm text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/60"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="flex-1 text-left">Search files and folders...</span>
        <kbd className="flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-xs text-slate-500">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className="fixed left-1/2 top-[15%] z-50 w-full max-w-2xl -translate-x-1/2 overflow-hidden rounded-xl border border-slate-700/80 bg-[#0F1318] shadow-2xl"
        onKeyDown={handleKeyDownInModal}
      >
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
          <SearchIcon className="h-5 w-5 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files and folders..."
            className="flex-1 bg-transparent text-base text-slate-100 placeholder-slate-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
          <kbd className="flex items-center rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-xs text-slate-500">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-[#4F9DFF]" />
            </div>
          )}

          {!isLoading && !query && <SearchEmptyState />}

          {!isLoading && query && hasSearched && results.length === 0 && (
            <SearchNoResults query={query} />
          )}

          {!isLoading && results.length > 0 && (
            <div className="p-2">
              <div className="mb-2 px-2 text-xs font-medium text-slate-500">
                {results.length} result{results.length === 1 ? "" : "s"} for &quot;{query}&quot;
              </div>
              <div className="space-y-1">
                {results.map((item, index) => (
                  <SearchResult
                    key={`${item.type}-${item.id}`}
                    item={item}
                    isSelected={index === selectedIndex}
                    onClick={() => navigateToResult(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
