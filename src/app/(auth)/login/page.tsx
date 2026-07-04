"use client";

import { useState, useTransition } from "react";
import { loginWithCredentialsAction } from "./actions";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/actions/button";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas relative overflow-hidden">
      {/* Dynamic Background Mesh Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/10 opacity-30 blur-[140px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/5 opacity-20 blur-[140px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[380px] px-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
            <Sparkles size={16} className="text-accent" />
          </div>
          <h1 className="text-xl font-bold text-zinc-50 tracking-tight">
            My<span className="text-accent">Hub</span>
          </h1>
        </div>

        {/* Login Box */}
        <div className="glass-card p-8 flex flex-col gap-6 shadow-2xl">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-100">Вхід</h2>
            <p className="text-xs text-zinc-400">Доступ до вашого особистого хабу</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Пароль</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              isLoading={isPending}
              className="w-full shadow-md"
            >
              Увійти
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
