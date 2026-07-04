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
    <div >
      <div >
        {icon}
        <span >{label}</span>
      </div>
      <p >{value}</p>
      {sub && <p >{sub}</p>}
    </div>
  );
}

export function DayComplete({ dateStr, stats, onViewJournal }: Props) {
  const { tasksTotal, tasksDone, habitsTotal, habitsDone, sleepHours, sleepQuality, energy, eveningEnergy, mood, winToday } = stats;

  return (
    <div >
      <div >

        {}
        <div >
          <span >
            {formatDate(dateStr)}
          </span>
          <span >🌙</span>
          <h1 >
            День завершено
          </h1>
          <p >Сьогодні ти зробив усе що міг. Відпочинь.</p>
        </div>

        {}
        <div >
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

        {}
        {winToday && (
          <div >
            <p >
              <Smile size={12} />
              Перемога дня
            </p>
            <p >{winToday}</p>
          </div>
        )}

        {}
        <button
          onClick={onViewJournal}

        >
          <BookOpen size={14} />
          Переглянути записи
        </button>

      </div>
    </div>
  );
}
