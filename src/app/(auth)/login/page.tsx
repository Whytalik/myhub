"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [error, action, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles size={20} className="text-bg" fill="currentColor" />
          </div>
          <p className="font-heading text-2xl text-text leading-none tracking-tight">
            My<span className="text-accent">Hub</span>
          </p>
        </div>

        {/* Form */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl shadow-accent/5">
          <h2 className="font-heading text-2xl text-text mb-1">Sign in</h2>
          <p className="text-secondary text-sm mb-8">Access your personal hub</p>

          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-muted uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-muted uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-400 bg-red-400/8 border border-red-400/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-1 bg-accent text-bg font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-accent/20 active:scale-[0.98]"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-secondary font-mono uppercase tracking-[0.1em]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-accent hover:underline decoration-accent/30 font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
