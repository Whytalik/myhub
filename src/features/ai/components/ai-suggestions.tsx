"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, X } from "lucide-react";
import {
  aiExecuteSuggestionAction,
  aiRejectSuggestionAction,
  aiGetPendingSuggestionsAction,
  aiGetSuggestionsAction,
} from "@/features/ai/actions/ai-actions";
import { toast } from "sonner";

interface AISuggestionItem {
  id: string;
  domain: string;
  action: string;
  payload: Record<string, unknown>;
  reason: string | null;
  createdAt: Date;
}

interface AISuggestionsProps {
  suggestionIds?: string[];
  onDismiss?: (id: string) => void;
}

const ACTION_LABELS: Record<string, string> = {
  createTask: "Створити завдання",
  updateTask: "Оновити завдання",
  deleteTask: "Видалити завдання",
  createHabit: "Створити звичку",
  updateHabit: "Оновити звичку",
  deleteHabit: "Видалити звичку",
  createSprint: "Створити спринт",
  createObjective: "Створити ціль",
  createDailyEntry: "Запис у щоденник",
  updateDailyEntry: "Оновити запис",
  deleteDailyEntry: "Видалити запис",
};

function getActionTitle(action: string, payload: Record<string, unknown>): string {
  // Primary: try to find a specific title/name in payload
  const specificName = (payload.title || payload.name || payload.date) as string;
  
  if (action.toLowerCase().includes("delete")) {
    return `Видалити: ${specificName || "об'єкт"}`;
  }
  
  if (action.toLowerCase().includes("update")) {
    return `Оновити: ${specificName || "дані"}`;
  }

  if (specificName) return specificName;

  // Fallback to generic labels
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];

  return action;
}

export function AISuggestions({ suggestionIds, onDismiss }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestionItem[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (suggestionIds && suggestionIds.length > 0) {
      aiGetPendingSuggestionsAction().then((data) => {
        setSuggestions(data as unknown as AISuggestionItem[]);
      });
    }
  }, [suggestionIds]);

  const handleAccept = async (id: string) => {
    const suggestion = suggestions.find(s => s.id === id);
    if (suggestion?.action.toLowerCase().includes("delete")) {
      const confirmed = window.confirm(`Ви впевнені, що хочете виконати дію: ${getActionTitle(suggestion.action, suggestion.payload)}?`);
      if (!confirmed) return;
    }

    setLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await aiExecuteSuggestionAction(id);
      toast.success("Дію виконано!");
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      onDismiss?.(id);
    } catch {
      toast.error("Помилка виконання");
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await aiRejectSuggestionAction(id);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      onDismiss?.(id);
    } catch {
      toast.error("Помилка");
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="px-6 py-2 space-y-3 relative">
      <div className="absolute inset-0 bg-raised/20 backdrop-blur-xl -z-10" />
      {suggestions.map((s) => (
        <div
          key={s.id}
          className="group relative bg-bg/20 border border-border/30 rounded-2xl p-4 hover:border-accent/30 transition-all"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-accent/60 block mb-1">
                  {s.action.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <p className="text-[13px] font-bold text-text leading-snug">
                  {getActionTitle(s.action, s.payload)}
                </p>
                {s.reason && (
                  <p className="text-[11px] text-muted mt-2 leading-relaxed italic border-l border-border/50 pl-2">
                    {s.reason}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleAccept(s.id)}
                  disabled={loading[s.id]}
                  className="p-2 rounded-xl bg-accent text-bg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  title="Accept"
                >
                  {loading[s.id] ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} strokeWidth={3} />
                  )}
                </button>
                <button
                  onClick={() => handleReject(s.id)}
                  disabled={loading[s.id]}
                  className="p-2 rounded-xl hover:bg-red-500/10 text-muted hover:text-red-500 transition-all disabled:opacity-50"
                  title="Reject"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AISuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<AISuggestionItem[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const ids = await aiGetSuggestionsAction();
      if (ids.length > 0) {
        const data = await aiGetPendingSuggestionsAction();
        setSuggestions(data as unknown as AISuggestionItem[]);
      }
    } catch {
      toast.error("Помилка завантаження пропозицій");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    const suggestion = suggestions.find(s => s.id === id);
    if (suggestion?.action.toLowerCase().includes("delete")) {
      const confirmed = window.confirm(`Ви впевнені, що хочете виконати дію: ${getActionTitle(suggestion.action, suggestion.payload)}?`);
      if (!confirmed) return;
    }

    setLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await aiExecuteSuggestionAction(id);
      toast.success("Дію виконано!");
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error("Помилка виконання");
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await aiRejectSuggestionAction(id);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error("Помилка");
    }
  };

  if (suggestions.length === 0 && !isLoading) {
    return (
      <div className="space-y-3">
        <button
          onClick={loadSuggestions}
          className="w-full py-8 border border-dashed border-border/50 rounded-xl text-muted hover:text-text hover:border-accent/50 transition-colors flex flex-col items-center gap-2"
        >
          <SparklesIcon />
          <span className="text-sm">Отримати AI-пропозиції</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text flex items-center gap-2">
          <SparklesIcon />
          AI Suggestions
        </h3>
        <button
          onClick={loadSuggestions}
          disabled={isLoading}
          className="text-xs text-accent hover:text-accent/80 disabled:opacity-50"
        >
          {isLoading ? "Оновлення..." : "Оновити"}
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-muted" />
        </div>
      )}

      {suggestions.map((s) => (
        <div
          key={s.id}
          className="bg-raised/50 border border-border/50 rounded-xl p-4 space-y-3"
        >
          <div>
            <p className="text-sm font-medium text-text">
              {getActionTitle(s.action, s.payload)}
            </p>
            {s.reason && (
              <p className="text-xs text-muted mt-1">{s.reason}</p>
            )}
          </div>

          {typeof s.payload.title === "string" && s.action === "createTask" && (
            <div className="text-xs text-secondary space-y-1">
              {typeof s.payload.description === "string" && s.payload.description && (
                <p>{s.payload.description}</p>
              )}
              {typeof s.payload.priority === "string" && (
                <p>Пріоритет: {s.payload.priority}</p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleAccept(s.id)}
              disabled={loading[s.id]}
              className="flex-1 py-2 rounded-xl text-xs font-mono uppercase tracking-wider bg-accent text-bg hover:bg-accent/90 font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {loading[s.id] ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Прийняти
            </button>
            <button
              onClick={() => handleReject(s.id)}
              disabled={loading[s.id]}
              className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
