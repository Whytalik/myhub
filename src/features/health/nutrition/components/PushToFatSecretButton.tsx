"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { Send, Check, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Dialog } from "@/components/ui/overlays/dialog";
import {
  previewFatSecretPushAction,
  pushMealToFatSecretAction,
  type PushEntryResult,
  type PushPreviewEntry,
} from "../actions/fatsecret-actions";
import { PROFILES } from "../data";
import type { MacroItem, MealType } from "../types";

interface PushToFatSecretButtonProps {
  mealType: MealType;
  macroItems: MacroItem[];
  pushedKey?: string;
}

export function PushToFatSecretButton({ mealType, macroItems, pushedKey }: PushToFatSecretButtonProps) {
  // 1. Hooks
  const [isPreviewPending, startPreviewTransition] = useTransition();
  const [isPushPending, startPushTransition] = useTransition();
  const [preview, setPreview] = useState<PushPreviewEntry[] | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [result, setResult] = useState<PushEntryResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPushed, setIsPushed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const macroItemsKey = JSON.stringify(macroItems);

  useEffect(() => {
    if (pushedKey) {
      try {
        const raw = localStorage.getItem("nutrition-fatsecret-pushed-v1");
        const map = raw ? JSON.parse(raw) : {};
        setIsPushed(!!map[pushedKey]);
      } catch (e) {
        console.error(e);
      }
    } else {
      setIsPushed(false);
    }
    setResult(null);
    setError(null);
  }, [macroItemsKey, pushedKey]);

  // 2. Derived values
  const okCount = result?.filter((r) => r.status === "ok").length ?? 0;
  const problemEntries = result?.filter((r) => r.status !== "ok") ?? [];
  const hasUnmapped = preview?.some((entry) => !entry.mapped) ?? false;
  const profileNameOf = (profileId: string) =>
    PROFILES.find((p) => p.id === profileId)?.name ?? profileId;

  // 3. Handlers
  const handleOpenPreview = () => {
    setError(null);
    setResult(null);
    startPreviewTransition(async () => {
      const response = await previewFatSecretPushAction(mealType, macroItems);
      if (!response.success) {
        setPreviewError(response.error);
        setPreview(null);
        return;
      }
      setPreviewError(null);
      setPreview(response.data);
    });
  };

  const handleClosePreview = () => setPreview(null);

  const handleConfirmPush = () => {
    startPushTransition(async () => {
      const response = await pushMealToFatSecretAction(mealType, macroItems);
      setPreview(null);
      if (!response.success) {
        setError(response.error);
        setResult(null);
        return;
      }
      setError(null);
      
      const entries = response.data.entries;
      setResult(entries);

      const hasProblems = entries.some((r) => r.status !== "ok");
      if (!hasProblems) {
        if (pushedKey) {
          try {
            const raw = localStorage.getItem("nutrition-fatsecret-pushed-v1");
            const map = raw ? JSON.parse(raw) : {};
            map[pushedKey] = true;
            localStorage.setItem("nutrition-fatsecret-pushed-v1", JSON.stringify(map));
          } catch (e) {
            console.error(e);
          }
        }
        setIsPushed(true);
        setTimeout(() => {
          setResult(null);
        }, 3000);
      }
    });
  };

  const handleButtonClick = () => {
    if (isPushed) {
      setShowConfirmModal(true);
    } else {
      handleOpenPreview();
    }
  };

  if (macroItems.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 items-end">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          isLoading={isPreviewPending}
          onClick={handleButtonClick}
          className="text-xs"
        >
          <Send size={12} />
          Запушити в FatSecret
        </Button>
        {isPushed && (
          <span
            className="flex items-center justify-center text-emerald-400 bg-emerald-400/10 rounded-full p-1 shrink-0"
            title="Вже запушено"
          >
            <Check size={14} strokeWidth={2.5} />
          </span>
        )}
      </div>

      {previewError && (
        <p className="flex items-center gap-1 text-xs text-rose-400">
          <X size={11} />
          {previewError}
        </p>
      )}

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
              {entry.status === "unmapped" ? (
                <>
                  {" — нема відповідника, "}
                  <Link href="/health/nutrition/mapping" className="underline hover:no-underline">
                    мапувати →
                  </Link>
                </>
              ) : (
                ` — ${entry.detail}`
              )}
            </p>
          ))}
        </div>
      )}

      {preview && (
        <Dialog
          isOpen
          onClose={handleClosePreview}
          title="Що буде записано в FatSecret"
          description="Перевірте перелік перед відправкою"
          maxWidth="480px"
          footer={
            <>
              <Button variant="ghost" onClick={handleClosePreview}>
                Скасувати
              </Button>
              <Button onClick={handleConfirmPush} isLoading={isPushPending}>
                Продовжити
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            {preview.length === 0 && <p className="text-caption">Немає позицій для запису.</p>}

            {preview.map((entry, idx) => {
              const statusClass = !entry.accountLinked
                ? "text-zinc-500"
                : entry.mapped
                  ? "text-zinc-200"
                  : "text-amber-400";

              return (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-body truncate ${statusClass}`}>
                      {profileNameOf(entry.profile)} · {entry.food}
                    </p>
                    {!entry.accountLinked && (
                      <p className="text-label text-rose-400">FatSecret не підключено</p>
                    )}
                    {entry.accountLinked && !entry.mapped && (
                      <p className="text-label text-amber-400">нема відповідника у FatSecret</p>
                    )}
                  </div>
                  <span className="text-label shrink-0">
                    {entry.grams} г
                    {entry.numberOfUnits !== null && ` · ${entry.numberOfUnits.toFixed(2)} порц.`}
                  </span>
                </div>
              );
            })}

            {hasUnmapped && (
              <Link
                href="/health/nutrition/mapping"
                className="text-caption text-accent-nutrition hover:opacity-80 transition-opacity"
              >
                Мапувати відсутні продукти →
              </Link>
            )}
          </div>
        </Dialog>
      )}

      {showConfirmModal && (
        <Dialog
          isOpen
          onClose={() => setShowConfirmModal(false)}
          title="Повторне надсилання"
          description="Цей прийом їжі вже було надіслано до FatSecret. Ви впевнені, що хочете надіслати його знову?"
          maxWidth="400px"
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
                Скасувати
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleOpenPreview();
                }}
              >
                Продовжити
              </Button>
            </>
          }
        >
          <div className="text-zinc-400 text-sm">
            Повторне надсилання може призвести до дублювання записів у вашому акаунті FatSecret.
          </div>
        </Dialog>
      )}
    </div>
  );
}
