"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check, ChefHat } from "lucide-react";
import { highlightProductMentions } from "../highlight-products";

interface Block {
  title: string;
  steps: string[];
}

interface CookingModeModalProps {
  algorithm: Block[];
  onClose: () => void;
}

export function CookingModeModal({ algorithm, onClose }: CookingModeModalProps) {
  // Flatten steps into a single array with block context
  const flatSteps = algorithm
    .flatMap((block) =>
      block.steps.map((step, stepIdx) => ({
        blockTitle: block.title,
        text: step,
        isLastInBlock: stepIdx === block.steps.length - 1,
        globalIndex: 0, // will compute below
      })),
    )
    .map((s, i) => ({ ...s, globalIndex: i }));

  const [currentStep, setCurrentStep] = useState(0);

  // Wake Lock API to keep screen on (works in modern Chrome/Edge/Opera on Android/Desktop, Safari iOS 16.4+)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const nav = navigator as any;
          wakeLock = await nav.wakeLock.request("screen");
        }
      } catch {
        console.warn("Wake Lock not supported or denied.");
      }
    };
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(console.warn);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (flatSteps.length === 0) return null;

  const step = flatSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === flatSteps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-canvas flex flex-col sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-stroke shrink-0">
        <div className="flex items-center gap-2 text-accent-nutrition">
          <ChefHat size={20} />
          <span className="font-semibold text-sm tracking-wide uppercase">
            Фокус-режим: {step.blockTitle}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 -mr-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/5 shrink-0">
        <div
          className="h-full bg-accent-nutrition transition-all duration-300 ease-out"
          style={{ width: `${((currentStep + 1) / flatSteps.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-3xl w-full flex flex-col gap-8">
          <div className="text-zinc-500 font-mono text-sm sm:text-base mb-2">
            Крок {currentStep + 1} з {flatSteps.length}
          </div>

          <p className="text-2xl sm:text-4xl md:text-5xl font-medium text-zinc-100 leading-tight sm:leading-snug">
            {highlightProductMentions(step.text)}
          </p>

          {step.isLastInBlock && !isLast && (
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-success-bg/20 text-success border border-success/30 rounded-lg w-fit">
              <Check size={18} />
              <span>Блок завершено! Далі почнеться новий.</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 sm:p-6 border-t border-stroke shrink-0 flex items-center justify-between bg-surface/50 backdrop-blur-md">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={isFirst}
          className="px-6 py-4 rounded-xl font-medium flex items-center gap-2 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={24} />
          <span className="hidden sm:inline">Попередній</span>
        </button>

        <button
          onClick={() => {
            if (isLast) onClose();
            else setCurrentStep(Math.min(flatSteps.length - 1, currentStep + 1));
          }}
          className="flex-1 max-w-sm ml-4 px-8 py-5 rounded-xl font-bold flex items-center justify-center gap-2 bg-accent-nutrition hover:bg-accent-nutrition/90 text-white shadow-lg transition-all active:scale-95"
        >
          {isLast ? (
            <>
              <Check size={24} />
              <span>Завершити мілпреп</span>
            </>
          ) : (
            <>
              <span className="text-lg">Далі</span>
              <ChevronRight size={24} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
