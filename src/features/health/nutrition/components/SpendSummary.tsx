import { formatWeekRange } from "../week";
import type { WeekSpend } from "../services/spending-service";

interface SpendSummaryProps {
  current: WeekSpend;
  history: WeekSpend[];
}

export function SpendSummary({ current, history }: SpendSummaryProps) {
  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      <span className="text-panel-title">Оцінка витрат — {formatWeekRange(current.weekStart)}</span>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-label">Бюджет</span>
          <span className="font-mono text-lg text-zinc-200">
            {Math.round(current.plannedTotal)} ₴
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-label">Подаровано</span>
          <span className="font-mono text-lg text-fuchsia-400">
            {Math.round(current.giftedTotal)} ₴
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-label">Оцінка витрат</span>
          <span className="font-mono text-lg text-accent-nutrition">
            {Math.round(current.actualSpend)} ₴
          </span>
        </div>
      </div>

      <p className="text-caption italic">
        Оцінка = плановий бюджет тижня мінус подароване — не звірка по чеку. Продукти, позначені
        &quot;вже вдома&quot;, зменшують лише поточний перегляд нижче й не потрапляють в історію.
      </p>

      {history.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
          <span className="text-label">Історія</span>
          <ul className="flex flex-col gap-1">
            {history.map((week) => (
              <li key={week.weekStart} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{formatWeekRange(week.weekStart)}</span>
                <span className="font-mono text-zinc-200">{Math.round(week.actualSpend)} ₴</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
