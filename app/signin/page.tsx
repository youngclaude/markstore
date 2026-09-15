import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { SigninForm } from "@/components/signin-form";

export default function SigninPage() {
  return (
    <AuthShell>
      <div className="flex w-full max-w-lg flex-col items-center px-2 pt-6 text-center sm:pt-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Sign in to{" "}
          <span className="bg-gradient-to-r from-[#4F9DFF] to-cyan-300 bg-clip-text text-transparent">
            MarkStore
          </span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-400 sm:text-base">
          Access your account and continue building, managing and growing your store.
        </p>
        <SigninForm />
        <p className="mt-4 text-sm">
          <Link href="#" className="text-[#4F9DFF] hover:text-cyan-300">
            Forgot password?
          </Link>
        </p>
        <p className="mt-10 text-sm text-slate-400">
          Need an account?{" "}
          <Link href="/signup" className="font-medium text-[#4F9DFF] hover:text-cyan-300">
            Start storing →
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
