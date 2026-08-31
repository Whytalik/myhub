import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check, ChefHat } from "lucide-react";
import { highlightProductMentions } from "../highlight-products";

interface CookingModeModalProps {
  algorithm: { title: string; steps: string[] }[];
  onClose: () => void;
}

export function CookingModeModal({ algorithm, onClose }: CookingModeModalProps) {
  const [currentBlockIdx, setCurrentBlockIdx] = useState(0);

  // Persist checked steps in localStorage so they survive app reloads
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mealprep-checked");
      if (saved) return new Set(JSON.parse(saved));
    }
    return new Set();
  });

  const toggleStep = (stepText: string) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepText)) next.delete(stepText);
      else next.add(stepText);

      localStorage.setItem("mealprep-checked", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Wake Lock API to keep screen on
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

  if (algorithm.length === 0) return null;

  const block = algorithm[currentBlockIdx];
  const isFirst = currentBlockIdx === 0;
  const isLast = currentBlockIdx === algorithm.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-canvas flex flex-col sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-stroke shrink-0">
        <div className="flex items-center gap-2 text-accent-nutrition">
          <ChefHat size={20} />
          <span className="font-semibold text-sm tracking-wide uppercase">
            Фокус-режим: Блок {currentBlockIdx + 1} з {algorithm.length}
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
          style={{ width: `${((currentBlockIdx + 1) / algorithm.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">{block.title}</h2>

          <div className="flex flex-col gap-3">
            {block.steps.map((step, stepIdx) => {
              const isChecked = checkedSteps.has(step);
              return (
                <label
                  key={stepIdx}
                  className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    isChecked
                      ? "bg-accent-nutrition/5 border-accent-nutrition/20 opacity-60"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleStep(step)}
                    className="mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded border-stroke bg-canvas text-accent-nutrition focus:ring-accent-nutrition focus:ring-offset-canvas cursor-pointer shrink-0"
                  />
                  <span
                    className={`text-lg sm:text-xl md:text-2xl leading-snug ${
                      isChecked
                        ? "text-zinc-400 line-through decoration-zinc-500/50"
                        : "text-zinc-200"
                    }`}
                  >
                    {highlightProductMentions(step)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 sm:p-6 border-t border-stroke shrink-0 flex items-center justify-between bg-surface/50 backdrop-blur-md">
        <button
          onClick={() => setCurrentBlockIdx(Math.max(0, currentBlockIdx - 1))}
          disabled={isFirst}
          className="px-5 py-4 rounded-xl font-medium flex items-center gap-2 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={24} />
          <span className="hidden sm:inline">Попередній</span>
        </button>

        <button
          onClick={() => {
            if (isLast) onClose();
            else setCurrentBlockIdx(Math.min(algorithm.length - 1, currentBlockIdx + 1));
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
              <span className="text-lg">Наступний блок</span>
              <ChevronRight size={24} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
