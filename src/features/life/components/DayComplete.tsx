"use client";

import { BookOpen, CheckCircle2, Zap, Moon, Heart, Smile } from "lucide-react";

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
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="glass-card p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-zinc-500">
        {icon}
        <span className="text-label">{label}</span>
      </div>
      <p className="font-mono text-lg font-semibold text-zinc-100">{value}</p>
      {sub && <p className="text-caption">{sub}</p>}
    </div>
  );
}

const MOOD_LABELS = [
  "",
  "Жахливо",
  "Погано",
  "Зле",
  "Нижче норми",
  "Нейтрально",
  "Нормально",
  "Добре",
  "Чудово",
  "Відмінно",
  "Ідеально",
];

export function DayComplete({ dateStr, stats, onViewJournal }: Props) {
  const {
    tasksTotal,
    tasksDone,
    habitsTotal,
    habitsDone,
    sleepHours,
    sleepQuality,
    energy,
    eveningEnergy,
    mood,
    winToday,
  } = stats;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass-card p-8 flex flex-col items-center gap-6 max-w-lg w-full">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-label capitalize">{formatDate(dateStr)}</span>
          <span className="text-4xl">🌙</span>
          <h1 className="text-page-title text-2xl">День завершено</h1>
          <p className="text-caption">Сьогодні ти зробив усе що міг. Відпочинь.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
          {tasksTotal > 0 && (
            <StatCard
              icon={<CheckCircle2 size={14} />}
              label="Завдання"
              value={`${tasksDone} / ${tasksTotal}`}
              sub={
                tasksTotal > 0
                  ? `${Math.round((tasksDone / tasksTotal) * 100)}% виконано`
                  : undefined
              }
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
              sub={MOOD_LABELS[mood]}
            />
          )}
        </div>

        {winToday && (
          <div className="w-full glass-card p-3 flex flex-col gap-1">
            <p className="text-label flex items-center gap-1.5">
              <Smile size={12} />
              Перемога дня
            </p>
            <p className="text-sm text-zinc-200 italic">{winToday}</p>
          </div>
        )}

        <button
          onClick={onViewJournal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors text-sm font-medium"
        >
          <BookOpen size={14} />
          Переглянути записи
        </button>
      </div>
    </div>
  );
}
