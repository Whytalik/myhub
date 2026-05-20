"use client";

import { BookOpen, CheckCircle2, Zap, Moon, Heart, Smile } from "lucide-react";
import type { TaskData, HabitData } from "../types";

interface DayStats {
  tasksTotal: number;
  tasksDone: number;
  habitsTotal: number;
  habitsDone: number;
  sleepHours: number | null;
  sleepQuality: number | null;
  energy: number | null;
  eveningEnergy: number | null;
  mood: number | null;
  winToday: string | null;
}

interface Props {
  dateStr: string;
  stats: DayStats;
  onViewJournal: () => void;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-caption font-mono uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-heading font-bold text-text-primary">{value}</p>
      {sub && <p className="text-caption text-muted">{sub}</p>}
    </div>
  );
}

export function DayComplete({ dateStr, stats, onViewJournal }: Props) {
  const { tasksTotal, tasksDone, habitsTotal, habitsDone, sleepHours, sleepQuality, energy, eveningEnergy, mood, winToday } = stats;

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-8 max-w-xl w-full">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-caption font-mono text-muted uppercase tracking-[0.3em]">
            {formatDate(dateStr)}
          </span>
          <span className="text-5xl">🌙</span>
          <h1 className="text-[2rem] font-bold tracking-tight text-text-primary">
            День завершено
          </h1>
          <p className="text-body text-muted">Сьогодні ти зробив усе що міг. Відпочинь.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
          {tasksTotal > 0 && (
            <StatCard
              icon={<CheckCircle2 size={14} />}
              label="Завдання"
              value={`${tasksDone} / ${tasksTotal}`}
              sub={tasksTotal > 0 ? `${Math.round((tasksDone / tasksTotal) * 100)}% виконано` : undefined}
            />
          )}
          {habitsTotal > 0 && (
            <StatCard
              icon={<Zap size={14} />}
              label="Звички"
              value={`${habitsDone} / ${habitsTotal}`}
              sub={habitsTotal > 0 ? `${Math.round((habitsDone / habitsTotal) * 100)}%` : undefined}
            />
          )}
          {sleepHours !== null && (
            <StatCard
              icon={<Moon size={14} />}
              label="Сон"
              value={`${sleepHours} год`}
              sub={sleepQuality !== null ? `Якість: ${sleepQuality}/10` : undefined}
            />
          )}
          {energy !== null && (
            <StatCard
              icon={<Zap size={14} />}
              label="Енергія"
              value={eveningEnergy !== null ? `${energy} → ${eveningEnergy}` : `${energy}/10`}
            />
          )}
          {mood !== null && (
            <StatCard
              icon={<Heart size={14} />}
              label="Настрій"
              value={`${mood}/10`}
              sub={["","Жахливо","Погано","Зле","Нижче норми","Нейтрально","Нормально","Добре","Чудово","Відмінно","Ідеально"][mood]}
            />
          )}
        </div>

        {/* Win of the day */}
        {winToday && (
          <div className="w-full bg-surface border border-accent/20 rounded-xl p-5">
            <p className="text-caption font-mono text-accent/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Smile size={12} />
              Перемога дня
            </p>
            <p className="text-body text-text-secondary leading-relaxed">{winToday}</p>
          </div>
        )}

        {/* View journal button */}
        <button
          onClick={onViewJournal}
          className="inline-flex items-center gap-2 h-10 px-6 rounded-xl border border-border text-note font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:border-border-strong transition-all duration-200"
        >
          <BookOpen size={14} />
          Переглянути записи
        </button>

      </div>
    </div>
  );
}
