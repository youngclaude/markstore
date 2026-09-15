"use client";

import { useState, useRef, useEffect } from "react";
import { CloseIcon, CrownIcon, CheckCircleIcon } from "@/components/icons";
import { PLAN_FEATURES, PLAN_LIMITS } from "@/lib/billing-constants";

const PRO_BENEFITS = [
  {
    title: `Access to ${PLAN_LIMITS.pro.apiCallsPerMonth.toLocaleString()}+ API calls`,
    description: "Logos, wordmarks, icons and more.",
  },
  {
    title: "Advanced search & filters",
    description: "Find the perfect mark, faster.",
  },
  {
    title: "Unlimited collections",
    description: "Organize your ideas and projects.",
  },
  {
    title: "High-resolution downloads",
    description: "Get crisp, production-ready files.",
  },
  {
    title: "Save favorites",
    description: "Keep your top marks at your fingertips.",
  },
  {
    title: "Early access to new drops",
    description: "Be the first to see what's next.",
  },
];

export function UpgradeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  function handleClose() {
    if (pending) return;
    onClose();
  }

  async function handleUpgrade() {
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        setPending(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) handleClose();
      }}
      className="m-auto w-full max-w-lg rounded-2xl border border-slate-700/70 bg-[#0F131A] p-0 text-slate-50 shadow-2xl shadow-black/60 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366F1]/20 text-[#818CF8]">
              <CrownIcon className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold">
                MarkStore <span className="text-[#818CF8]">Pro</span>
              </h2>
              <p className="text-sm text-slate-400">
                More marks. More power. Build your brand faster.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={pending}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Price */}
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-4xl font-bold">${PLAN_FEATURES.pro.price}</span>
          <span className="text-slate-400">/month</span>
          <span className="ml-3 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
            Billed monthly · Cancel anytime
          </span>
        </div>

        {/* Everything in Pro */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-slate-300">Everything in Pro</p>
          <div className="space-y-3">
            {PRO_BENEFITS.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-white">{benefit.title}</p>
                  <p className="text-xs text-slate-500">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Summary */}
        <div className="mb-6 rounded-xl border border-slate-700/60 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Premium plan</span>
            <span className="font-medium">${PLAN_FEATURES.pro.price}.00</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-slate-400">Next charge</span>
            <span className="text-slate-400">
              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-slate-700/60 pt-3 text-xs text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-bold">🔒</span>
            <span>Secure checkout</span>
            <span className="ml-auto">Powered by</span>
            <span className="font-semibold text-[#635BFF]">stripe</span>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6366F1] py-3 text-sm font-semibold text-white hover:bg-[#5558E3] disabled:opacity-60"
          >
            {pending ? (
              "Redirecting to Stripe..."
            ) : (
              <>
                <span className="text-lg">💳</span>
                Upgrade with Stripe
              </>
            )}
          </button>
          <button
            onClick={handleClose}
            disabled={pending}
            className="w-full rounded-xl border border-slate-700 py-3 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-50"
          >
            Maybe later
          </button>
        </div>
      </div>
    </dialog>
  );
}
