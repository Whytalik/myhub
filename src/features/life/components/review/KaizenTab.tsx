"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Trash2,
  GitBranch,
  CheckSquare,
  HelpCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import {
  upsertTaskAction,
  deleteTaskAction,
} from "@/features/life/actions/task-actions";
import type { TaskData } from "@/features/life/types";

interface KaizenTabProps {
  tasks: TaskData[];
  activeSprint: {
    id: string;
    number: number;
    year: number;
    startDate: Date;
    endDate: Date;
    status: string;
  } | null;
  weekStart: Date;
}

export function KaizenTab({ tasks, activeSprint, weekStart }: KaizenTabProps) {
  const [localTasks, setLocalTasks] = useState<TaskData[]>(tasks);
  const [decomposingTaskId, setDecomposingTaskId] = useState<string | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  // Checklist Checkbox States
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // 1. Calculate week number of active sprint
  const weekNum = activeSprint
    ? Math.floor(
        (new Date(weekStart).getTime() - new Date(activeSprint.startDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      ) + 1
    : null;

  // 2. Identify "stuck" tasks for this week
  // Stuck = planned for this week but not DONE / CANCELLED
  const stuckTasks = localTasks.filter(
    (t) =>
      t.status !== "DONE" &&
      t.status !== "CANCELLED" &&
      t.plannedDate &&
      new Date(t.plannedDate) >= new Date(weekStart) &&
      new Date(t.plannedDate) < new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000)
  );

  const completedTasksCount = localTasks.filter(
    (t) =>
      t.status === "DONE" &&
      t.completedAt &&
      new Date(t.completedAt) >= new Date(weekStart) &&
      new Date(t.completedAt) < new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  // Handlers for stuck tasks
  const handleMoveToBacklog = (taskId: string) => {
    startTransition(async () => {
      const result = await upsertTaskAction({
        id: taskId,
        plannedDate: null, // removes planned date
      });
      if (result.success) {
        toast.success("Задачу перенесено у Глобальний Беклог");
        setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        toast.error(result.error || "Не вдалося перенести в беклог");
      }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    startTransition(async () => {
      const result = await deleteTaskAction(taskId);
      if (result.success) {
        toast.success("Задачу успішно видалено");
        setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        toast.error(result.error || "Не вдалося видалити задачу");
      }
    });
  };

  const handleDecompose = (parentTask: TaskData) => {
    const title = subtaskTitle.trim();
    if (!title) return;

    startTransition(async () => {
      // 1. Create subtask
      const subtaskResult = await upsertTaskAction({
        title,
        parentId: parentTask.id,
        sphereId: parentTask.sphereId,
        status: "TODO",
        priority: "MEDIUM",
        plannedDate: weekStart.toISOString(),
      });

      if (subtaskResult.success) {
        toast.success("Створено дрібніший атом!");
        setSubtaskTitle("");
        setDecomposingTaskId(null);
        // Refresh local task list with the new subtask
        const newSub: TaskData = subtaskResult.data as any;
        setLocalTasks((prev) => [newSub, ...prev]);
      } else {
        toast.error(subtaskResult.error || "Не вдалося створити підзадачу");
      }
    });
  };

  const toggleCheck = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Determine which checklist to show based on week number
  const renderChecklist = () => {
    if (!weekNum || weekNum < 1 || weekNum > 12) {
      // Standard Weekly Review checklist if outside active sprint scope
      return (
        <div className="flex flex-col gap-3">
          <h4 className="text-panel-title text-zinc-200 flex items-center gap-2">
            <CheckSquare size={16} className="text-orange-400" />
            Чекліст щотижневого аналізу
          </h4>
          <div className="flex flex-col gap-2.5 mt-2">
            {renderCheckboxItem("weekly-1", `Збір метрик: Подивись на завершені атоми (${completedTasksCount} виконано). Подбайте про дофамін!`)}
            {renderCheckboxItem("weekly-2", "Кайдзен-аудит: Проаналізуй застряглі атоми в списку нижче. Чому вони зависли? Були завеликими?")}
            {renderCheckboxItem("weekly-3", "Планування: Переглянь Спринт-план та наріж 5-10 нових атомів на наступні 7 днів.")}
          </div>
        </div>
      );
    }

    if (weekNum === 4 || weekNum === 8) {
      // Monthly Compass check
      return (
        <div className="flex flex-col gap-3">
          <h4 className="text-panel-title text-orange-400 flex items-center gap-2 font-mono">
            <Compass size={16} />
            Місячний чек-поінт (Тиждень {weekNum} / 12)
          </h4>
          <div className="flex flex-col gap-2.5 mt-2 bg-orange-500/[0.02] border border-orange-500/10 p-4 rounded-2xl">
            <p className="text-xs text-orange-400 font-mono mb-2">
              ⚠️ МІСЯЦЬ ЦЕ 1/3 СПРИНТУ. ЧАС ДЛЯ РЕАЛІСТИЧНОЇ ОЦІНКИ:
            </p>
            {renderCheckboxItem("monthly-1", `Звірка компаса: Чи пройшов ти ${weekNum === 4 ? "33%" : "66%"} шляху до цілей свого Спринту?`)}
            {renderCheckboxItem("monthly-2", "Жорсткий пріоритет: Якщо сильно відстаєш, чи готовий ти заморозити другорядний проєкт, щоб врятувати головний?")}
            {renderCheckboxItem("monthly-3", "Корекція плану: Офіційно перерозподіли або зміни склад Спринт-проєктів.")}
          </div>
        </div>
      );
    }

    if (weekNum === 12) {
      // Sprint review (12-Week Year)
      return (
        <div className="flex flex-col gap-3">
          <h4 className="text-panel-title text-purple-400 flex items-center gap-2 font-mono">
            <Sparkles size={16} />
            «Річний» аналіз Спринту (Тиждень 12 / 12)
          </h4>
          <div className="flex flex-col gap-2.5 mt-2 bg-purple-500/[0.02] border border-purple-500/10 p-4 rounded-2xl">
            <p className="text-xs text-purple-400 font-mono mb-2">
              🎉 ЦЕ ТВОЙ НОВИЙ РІК! ЧАС ДЛЯ ГЛОБАЛЬНОЇ СТРАТЕГІЇ ТА СВЯТКУВАННЯ:
            </p>
            {renderCheckboxItem("sprint-1", "Святкування: Переглянь і випиши все, що було досягнуто за цей Спринт. Відчуй перемогу!")}
            {renderCheckboxItem("sprint-2", "Глибокий Кайдзен: Які звички чи процеси блокували тебе найбільше? Запиши одне нове правило на наступний Спринт.")}
            {renderCheckboxItem("sprint-3", "Очищення беклогу: Переглянь Глобальний Беклог проєктів та безжально видали застарілі думки.")}
            {renderCheckboxItem("sprint-4", "Новий Спринт: Визнач 2-3 нові цілі/проєкти з Беклогу на наступні 12 тижнів.")}
            {renderCheckboxItem("sprint-5", "Week 13 (Відпустка): Наступний 13-й тиждень зроби буферним. Жодного планування — відпочинок для мозку.")}
          </div>
        </div>
      );
    }

    // Default Weekly Checklist
    return (
      <div className="flex flex-col gap-3">
        <h4 className="text-panel-title text-zinc-200 flex items-center gap-2 font-mono">
          <Zap size={14} className="text-orange-400" />
          Тиждень {weekNum} / 12 — Кайдзен-аналіз тижня
        </h4>
        <div className="flex flex-col gap-2.5 mt-2">
          {renderCheckboxItem("weekly-1", `Збір метрик: Подивись на завершені атоми (${completedTasksCount} виконано). Подбайте про дофамін!`)}
          {renderCheckboxItem("weekly-2", "Кайдзен-аудит: Проаналізуй застряглі атоми в списку нижче. Чому вони зависли? Були завеликими?")}
          {renderCheckboxItem("weekly-3", "Планування: Переглянь Спринт-план та наріж 5-10 нових атомів на наступні 7 днів.")}
        </div>
      </div>
    );
  };

  const renderCheckboxItem = (id: string, text: string) => {
    const isChecked = !!checklist[id];
    return (
      <label
        key={id}
        className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
          isChecked
            ? "bg-emerald-500/5 border-emerald-500/20 text-zinc-300"
            : "bg-white/[0.01] border-white/[0.06] text-zinc-150 hover:bg-white/[0.03]"
        }`}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleCheck(id)}
          className="mt-1 accent-emerald-500 cursor-pointer rounded"
        />
        <span className="text-sm leading-snug">{text}</span>
      </label>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
      {/* Left Column: Kaizen Audit of stuck tasks */}
      <div className="glass-card p-5 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-4">
        <div>
          <h3 className="text-panel-title font-semibold text-zinc-200">
            🔎 Кайдзен-аудит (Застряглі Атоми)
          </h3>
          <p className="text-caption text-xs mt-1">
            Завдання, які були заплановані, але не виконані цього тижня. Знайди системні збої.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {stuckTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-xs italic bg-white/[0.01] border border-white/[0.04] rounded-2xl">
              <CheckCircle2 size={24} className="text-emerald-400 mb-2" />
              Всі заплановані атоми виконано! Чудова робота.
            </div>
          ) : (
            stuckTasks.map((task) => (
              <div
                key={task.id}
                className="glass-card p-4 bg-white/[0.01] border-white/[0.06] rounded-xl flex flex-col gap-3 relative hover:border-white/10 transition-colors duration-150"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="text-sm font-semibold text-zinc-200 leading-snug">
                      {task.title}
                    </h5>
                    {task.project && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-mono uppercase">
                        Проєкт: {task.project.title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Audit Actions */}
                <div className="flex items-center gap-2 border-t border-white/[0.04] pt-2.5 mt-1 flex-wrap">
                  <span className="text-[10px] uppercase font-mono text-zinc-500 mr-1">
                    Аудит кроку:
                  </span>

                  {/* Decompose / Split */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDecomposingTaskId(decomposingTaskId === task.id ? null : task.id)
                    }
                    className="h-7 text-xs text-orange-400 hover:text-orange-300"
                    title="Занадто великий крок? Дроби на дрібніші підзадачі!"
                  >
                    <GitBranch size={12} className="mr-1" /> Дробити
                  </Button>

                  {/* Return to Backlog */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveToBacklog(task.id)}
                    className="h-7 text-xs text-zinc-400 hover:text-zinc-300"
                    title="Брак часу / перенести в беклог"
                  >
                    <ArrowRightLeft size={12} className="mr-1" /> В Беклог
                  </Button>

                  {/* Hard Delete */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="h-7 text-xs text-rose-400 hover:text-rose-300 ml-auto"
                    title="Втратило актуальність? Видалити"
                  >
                    <Trash2 size={12} className="mr-1" /> Видалити
                  </Button>
                </div>

                {/* Inline decomposition form */}
                {decomposingTaskId === task.id && (
                  <div className="mt-2 p-3 rounded-lg bg-black/30 border border-white/5 flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-orange-400 font-semibold">
                      Створити дрібнішу фізичну підзадачу (атом):
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={subtaskTitle}
                        onChange={(e) => setSubtaskTitle(e.target.value)}
                        placeholder="Наприклад: Знайти пароль від кабінету..."
                        className="text-xs h-8 flex-1"
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleDecompose(task)}
                        disabled={!subtaskTitle.trim() || isPending}
                        className="h-8"
                      >
                        Додати
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Contextual Review Checklist */}
      <div className="glass-card p-5 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-4">
        {renderChecklist()}
      </div>
    </div>
  );
}
