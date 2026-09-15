"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ShareIcon,
  GlobeIcon,
  CopyIcon,
  TrashIcon,
  ClockIcon,
  LinkIcon,
} from "@/components/icons";

type ShareStatus = {
  enabled: boolean;
  slug: string | null;
  url: string | null;
  created_at: string | null;
};

export function SharePanel({ fileId }: { fileId: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ShareStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/files/${fileId}/share`);
      const data = (await res.json()) as { share?: ShareStatus; error?: string };
      if (res.ok && data.share) {
        setStatus(data.share);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    if (open && !status) {
      void loadStatus();
    }
  }, [open, status, loadStatus]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function toggleShare() {
    setBusy(true);
    try {
      const method = status?.enabled ? "DELETE" : "POST";
      const res = await fetch(`/api/files/${fileId}/share`, { method });
      const data = (await res.json()) as { share?: ShareStatus; error?: string };
      if (res.ok && data.share) {
        setStatus(data.share);
      }
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl() {
    if (!status?.url) return;
    try {
      await navigator.clipboard.writeText(status.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
      >
        <ShareIcon />
        Share
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
          <div className="mb-3 flex items-center gap-2">
            <GlobeIcon className="h-5 w-5 text-[#1D7BFF]" />
            <span className="font-medium text-slate-100">Public share link</span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : status?.enabled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-2">
                <LinkIcon className="h-4 w-4 shrink-0 text-[#4F9DFF]" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-cyan-200">
                  {status.url}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1D7BFF] px-3 py-2 text-sm font-medium text-white hover:brightness-110"
                >
                  <CopyIcon className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy URL"}
                </button>
                <button
                  type="button"
                  onClick={toggleShare}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300 hover:border-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Revoke
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ClockIcon className="h-3 w-3" />
                <span>Shared {formatDate(status.created_at)} · Never expires</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Create a read-only public link to this file. Anyone with the link can view it.
              </p>
              <button
                type="button"
                onClick={toggleShare}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1D7BFF] px-3 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
              >
                <GlobeIcon className="h-4 w-4" />
                {busy ? "Enabling…" : "Enable sharing"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
