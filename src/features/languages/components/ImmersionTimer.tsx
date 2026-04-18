"use client";

import React, { useState } from "react";
import { LanguageSphere } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logImmersionAction } from "../actions/language-actions";
import { toast } from "sonner";
import { Clock, Play } from "lucide-react";

interface ImmersionTimerProps {
  userLanguageId: string;
}

export function ImmersionTimer({ userLanguageId }: ImmersionTimerProps) {
  const [duration, setDuration] = useState<string>("30");
  const [sphere, setSphere] = useState<LanguageSphere>(LanguageSphere.LISTENING);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(duration);
    if (isNaN(mins) || mins <= 0) {
      toast.error("Invalid duration value");
      return;
    }

    setIsPending(true);
    try {
      const result = await logImmersionAction({
        userLanguageId,
        sphere,
        duration: mins,
      });

      if (result.success) {
        toast.success(`Logged ${mins}m of ${sphere.toLowerCase()}`);
        setDuration("30");
      } else {
        toast.error(result.error || "Failed to log activity");
      }
    } catch (error) {
      toast.error("Operational failure");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-surface/60 border border-border/40 p-8 rounded-[40px] backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-2.5 rounded-2xl bg-violet text-bg shadow-lg shadow-violet/20">
          <Clock size={20} strokeWidth={3} />
        </div>
        <h4 className="font-black text-2xl uppercase tracking-tight">Quick Log</h4>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-2">
          {Object.values(LanguageSphere).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSphere(s)}
              className={`px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase tracking-widest border transition-all ${
                sphere === s
                  ? "bg-violet/20 border-violet text-violet shadow-sm"
                  : "bg-bg/40 border-border/40 text-muted hover:border-violet/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] font-bold ml-1">
            Duration <span className="text-violet/60">(Minutes)</span>
          </label>
          <div className="flex gap-4">
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="flex-1 bg-bg/60 border-border/40 rounded-2xl h-12 text-xl font-black font-heading focus-visible:ring-violet"
              min="1"
            />
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-12 rounded-2xl p-0 flex items-center justify-center shrink-0 shadow-lg shadow-violet/20 bg-violet text-bg hover:bg-violet/90 active:scale-95"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={20} fill="currentColor" strokeWidth={3} />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
