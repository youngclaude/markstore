import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LogoMark } from "@/components/logo";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <AuthShell>
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-950/70 p-6 shadow-2xl shadow-blue-950/40 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="mb-4 h-11 w-11" />
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Create your{" "}
            <span className="bg-gradient-to-r from-[#4F9DFF] to-cyan-300 bg-clip-text text-transparent">
              MarkStore
            </span>{" "}
            account
          </h1>
        </div>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-[#4F9DFF] hover:text-cyan-300">
            Sign In
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
