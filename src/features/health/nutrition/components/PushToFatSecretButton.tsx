"use client";

import { useState, useTransition } from "react";
import { Send, Check, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { pushMealToFatSecretAction, type PushEntryResult } from "../actions/fatsecret-actions";
import type { MacroItem, MealType } from "../types";

interface PushToFatSecretButtonProps {
  mealType: MealType;
  macroItems: MacroItem[];
}

export function PushToFatSecretButton({ mealType, macroItems }: PushToFatSecretButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PushEntryResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const okCount = result?.filter((r) => r.status === "ok").length ?? 0;
  const problemEntries = result?.filter((r) => r.status !== "ok") ?? [];

  const handleClick = () => {
    startTransition(async () => {
      const response = await pushMealToFatSecretAction(mealType, macroItems);
      if (!response.success) {
        setError(response.error);
        setResult(null);
        return;
      }
      setError(null);
      setResult(response.data.entries);
    });
  };

  if (macroItems.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 items-center">
      <Button
        variant="secondary"
        size="sm"
        isLoading={isPending}
        onClick={handleClick}
        className="text-xs"
      >
        <Send size={12} />
        Запушити в FatSecret
      </Button>

      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-400">
          <X size={11} />
          {error}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-0.5 items-center">
          {okCount > 0 && (
            <p className="flex items-center gap-1 text-xs text-emerald-400">
              <Check size={11} />
              {okCount} записів додано
            </p>
          )}
          {problemEntries.map((entry, idx) => (
            <p key={idx} className="flex items-center gap-1 text-xs text-amber-400">
              <AlertTriangle size={11} />
              {entry.profile} · {entry.food}
              {entry.status === "unmapped" ? " — нема відповідника" : ` — ${entry.detail}`}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
