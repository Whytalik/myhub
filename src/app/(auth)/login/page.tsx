"use client";

import { useState, useTransition } from "react";
import { loginWithCredentialsAction } from "./actions";
import { Sparkles, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await loginWithCredentialsAction(email, password);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles size={20} className="text-bg" fill="currentColor" />
          </div>
          <p className="font-heading text-base text-text leading-none tracking-tight">
            My<span className="text-accent">Hub</span>
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl shadow-accent/5">
          <h2 className="font-heading text-base text-text mb-1">Вхід</h2>
          <p className="text-sm mb-6 text-text-muted">Доступ до вашого особистого хабу</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-bg border border-border px-4 py-2.5 rounded-xl text-sm text-text outline-none focus:border-accent/40 transition-colors"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-bg border border-border px-4 py-2.5 rounded-xl text-sm text-text outline-none focus:border-accent/40 transition-colors"
            />
            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-accent text-bg font-semibold py-2.5 px-4 rounded-xl text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              Увійти
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
