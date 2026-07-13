"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Trash2,
  GitBranch,
  CheckSquare,
  Sparkles,
  Zap,
  Save,
  MessageSquareQuote,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  upsertTaskAction,
  deleteTaskAction,
} from "@/features/life/actions/task-actions";
import { saveSprintReviewAction } from "@/features/life/actions/sprint-actions";
import type { TaskData, WeekSummary } from "@/features/life/types";

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
  sprintReviews: any[];
  weekStart: Date;
  summary: WeekSummary;
}

export function KaizenTab({
  tasks,
  activeSprint,
  sprintReviews,
  weekStart,
  summary,
}: KaizenTabProps) {
  const router = useRouter();
  const [localTasks, setLocalTasks] = useState<TaskData[]>(tasks);
  const [decomposingTaskId, setDecomposingTaskId] = useState<string | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  // 1. Calculate week number of active sprint
  const weekNum = activeSprint
    ? Math.floor(
        (new Date(weekStart).getTime() - new Date(activeSprint.startDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      ) + 1
    : null;

  // 2. Find existing review for this sprint and week
  const currentReview = activeSprint
    ? sprintReviews.find(
        (r) => r.sprintId === activeSprint.id && r.weekNumber === weekNum
      )
    : null;

  // 3. Reflection form states (keyed by weekNum to reset automatically when user shifts weeks)
  return (
    <KaizenFormInner
      key={`kaizen-form-${weekNum ?? "none"}`}
      tasks={tasks}
      activeSprint={activeSprint}
      weekStart={weekStart}
      weekNum={weekNum}
      currentReview={currentReview}
      summary={summary}
      localTasks={localTasks}
      setLocalTasks={setLocalTasks}
      decomposingTaskId={decomposingTaskId}
      setDecomposingTaskId={setDecomposingTaskId}
      subtaskTitle={subtaskTitle}
      setSubtaskTitle={setSubtaskTitle}
      isPending={isPending}
      startTransition={startTransition}
      router={router}
    />
  );
}

// Inner form component with re-keyed state
interface KaizenFormInnerProps {
  tasks: TaskData[];
  activeSprint: any;
  weekStart: Date;
  weekNum: number | null;
  currentReview: any;
  summary: WeekSummary;
  localTasks: TaskData[];
  setLocalTasks: React.Dispatch<React.SetStateAction<TaskData[]>>;
  decomposingTaskId: string | null;
  setDecomposingTaskId: (id: string | null) => void;
  subtaskTitle: string;
  setSubtaskTitle: (title: string) => void;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
  router: any;
}

function KaizenFormInner({
  tasks,
  activeSprint,
  weekStart,
  weekNum,
  currentReview,
  summary,
  localTasks,
  setLocalTasks,
  decomposingTaskId,
  setDecomposingTaskId,
  subtaskTitle,
  setSubtaskTitle,
  isPending,
  startTransition,
  router,
}: KaizenFormInnerProps) {
  // Sync tasks on mount / prop change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks, setLocalTasks]);

  // Form states
  const [score, setScore] = useState<number>(currentReview?.score ?? 7);
  const [wins, setWins] = useState<string>(currentReview?.wins ?? "");
  const [challenges, setChallenges] = useState<string>(currentReview?.challenges ?? "");
  const [adjustments, setAdjustments] = useState<string>(currentReview?.adjustments ?? "");

  // Checklist states
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // Filter stuck tasks
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

  const handleMoveToBacklog = (taskId: string) => {
    startTransition(async () => {
      const result = await upsertTaskAction({
        id: taskId,
        plannedDate: null,
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
        const newSub: TaskData = subtaskResult.data as any;
        setLocalTasks((prev) => [newSub, ...prev]);
      } else {
        toast.error(subtaskResult.error || "Не вдалося створити підзадачу");
      }
    });
  };

  const handleSaveReview = () => {
    if (!activeSprint || !weekNum) {
      toast.error("Немає активного спринту для збереження рефлексії");
      return;
    }

    startTransition(async () => {
      const result = await saveSprintReviewAction(
        activeSprint.id,
        weekNum,
        weekStart.toISOString(),
        {
          score,
          wins,
          challenges,
          adjustments,
        }
      );

      if (result.success) {
        toast.success("Висновки тижня успішно збережено в базі!");
        router.refresh();
      } else {
        toast.error(result.error || "Не вдалося зберегти рефлексію");
      }
    });
  };

  const toggleCheck = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCheckboxItem = (id: string, text: string) => {
    const isChecked = !!checklist[id];
    return (
      <label
        key={id}
        className={`flex items-start gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer ${
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
        <span className="text-xs leading-snug">{text}</span>
      </label>
    );
  };

  const renderChecklistHeader = () => {
    if (!weekNum || weekNum < 1 || weekNum > 12) {
      return (
        <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <CheckSquare size={14} className="text-orange-400" />
          Чекліст аналізу тижня
        </h4>
      );
    }
    if (weekNum === 4 || weekNum === 8) {
      return (
        <h4 className="text-sm font-semibold text-orange-400 flex items-center gap-2 font-mono">
          <Compass size={14} />
          Місячний чек-поінт (Тиждень {weekNum} / 12)
        </h4>
      );
    }
    if (weekNum === 12) {
      return (
        <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2 font-mono">
          <Sparkles size={14} />
          «Річний» аналіз Спринту (Тиждень 12 / 12)
        </h4>
      );
    }
    return (
      <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 font-mono">
        <Zap size={14} className="text-orange-400" />
        Тиждень {weekNum} / 12 — Рефлексія
      </h4>
    );
  };

  const renderChecklistItems = () => {
    if (!weekNum || weekNum < 1 || weekNum > 12) {
      return (
        <>
          {renderCheckboxItem("w-1", `Збір метрик: Подивись на завершені атоми (${completedTasksCount} виконано).`)}
          {renderCheckboxItem("w-2", "Кайдзен-аудит: Проаналізуй застряглі атоми в списку зліва. Чому вони зависли?")}
          {renderCheckboxItem("w-3", "Планування: Наріж 5-10 нових кайдзен-атомів на наступний тиждень.")}
        </>
      );
    }
    if (weekNum === 4 || weekNum === 8) {
      return (
        <>
          <p className="text-[10px] text-orange-400 font-mono mb-1">
            ⚠️ ТРЕТИНА СПРИНТУ. ЧАС ОЦІНИТИ РЕАЛЬНІСТЬ ЦІЛЕЙ:
          </p>
          {renderCheckboxItem("m-1", `Звірка компаса: Чи пройшов ти ${weekNum === 4 ? "33%" : "66%"} шляху до цілей свого Спринту?`)}
          {renderCheckboxItem("m-2", "Жорсткий пріоритет: Чи готовий заморозити один проєкт, щоб врятувати головний?")}
          {renderCheckboxItem("m-3", "Корекція Спринту: Офіційно зміни або видали цілі, якщо життя внесло зміни.")}
        </>
      );
    }
    if (weekNum === 12) {
      return (
        <>
          <p className="text-[10px] text-purple-400 font-mono mb-1">
            🎉 ЦЕ ТВОЙ НОВИЙ РІК! ЧАС ДЛЯ ГЛОБАЛЬНОЇ СТРАТЕГІЇ:
          </p>
          {renderCheckboxItem("s-1", "Святкування: Переглянь і випиши всі досягнення за 12 тижнів.")}
          {renderCheckboxItem("s-2", "Глибокий Кайдзен: Яка звичка заважала найбільше? Одне нове правило на наступний спринт.")}
          {renderCheckboxItem("s-3", "Очищення беклогу: Безжально видали застарілі думки з глобального беклогу.")}
          {renderCheckboxItem("s-4", "Новий Спринт: Обери 2-3 нові проєкти на наступні 12 тижнів.")}
          {renderCheckboxItem("s-5", "Буферний тиждень 13: Наступного тижня зроби перерву від планування.")}
        </>
      );
    }
    return (
      <>
        {renderCheckboxItem("w-1", `Збір метрик: Подивись на завершені атоми (${completedTasksCount} виконано).`)}
        {renderCheckboxItem("w-2", "Кайдзен-аудит: Проаналізуй застряглі атоми в списку зліва. Чому вони зависли?")}
        {renderCheckboxItem("w-3", "Планування: Наріж нові атоми до цілей спринту на наступний тиждень.")}
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-6 items-start">
      {/* 🔎 Column 1: Kaizen Audit (Stuck Tasks) */}
      <div className="glass-card p-5 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-4">
        <div>
          <h3 className="text-panel-title font-semibold text-zinc-200">
            🔎 Кайдзен-аудит (Застряглі Атоми)
          </h3>
          <p className="text-caption text-xs mt-1">
            Завдання, які були заплановані, але не виконані цього тижня. Знайди системні збої.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-1 max-h-[500px] overflow-y-auto pr-1">
          {stuckTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-xs italic bg-white/[0.01] border border-white/[0.04] rounded-xl">
              <CheckCircle2 size={22} className="text-emerald-400 mb-2" />
              Всі заплановані атоми виконано! Чудова робота.
            </div>
          ) : (
            stuckTasks.map((task) => (
              <div
                key={task.id}
                className="glass-card p-3.5 bg-white/[0.01] border-white/[0.06] rounded-xl flex flex-col gap-3 relative hover:border-white/10 transition-colors"
              >
                <div>
                  <h5 className="text-xs font-semibold text-zinc-200 leading-normal">
                    {task.title}
                  </h5>
                  {task.project && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-mono uppercase">
                      Проєкт: {task.project.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 border-t border-white/[0.04] pt-2 flex-wrap">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDecomposingTaskId(decomposingTaskId === task.id ? null : task.id)
                    }
                    className="h-6 px-2 text-[11px] text-orange-400 hover:text-orange-300"
                  >
                    <GitBranch size={10} className="mr-1" /> Дробити
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveToBacklog(task.id)}
                    className="h-6 px-2 text-[11px] text-zinc-400 hover:text-zinc-300"
                  >
                    <ArrowRightLeft size={10} className="mr-1" /> В Беклог
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="h-6 px-2 text-[11px] text-rose-400 hover:text-rose-300 ml-auto"
                  >
                    <Trash2 size={10} className="mr-1" /> Видалити
                  </Button>
                </div>

                {decomposingTaskId === task.id && (
                  <div className="mt-2 p-2.5 rounded-lg bg-black/30 border border-white/5 flex flex-col gap-2">
                    <label className="text-[9px] font-mono text-orange-400">
                      Створити дрібнішу фізичну підзадачу (атом):
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={subtaskTitle}
                        onChange={(e) => setSubtaskTitle(e.target.value)}
                        placeholder="Наприклад: Знайти пароль від кабінету..."
                        className="text-xs h-7 flex-1"
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleDecompose(task)}
                        disabled={!subtaskTitle.trim() || isPending}
                        className="h-7"
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

      {/* 📝 Column 2: Reflection & written conclusions */}
      <div className="glass-card p-5 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-5">
        {/* Checklist */}
        <div className="flex flex-col gap-3">
          {renderChecklistHeader()}
          <div className="flex flex-col gap-2">{renderChecklistItems()}</div>
        </div>

        {/* Written Review */}
        {activeSprint && weekNum ? (
          <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-4">
            <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <MessageSquareQuote size={14} className="text-accent" />
              Письмові висновки ({currentReview ? "Редагувати" : "Створити"})
            </h4>

            {/* Score */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                <span>Оцінка тижня</span>
                <span className="text-accent font-bold text-sm">{score}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full accent-accent h-1.5 rounded bg-black/35 cursor-pointer"
              />
            </div>

            {/* Aggregated daily notes from Journal */}
            {(summary.wins.length > 0 || summary.improvements.length > 0) && (
              <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-3 flex flex-col gap-2 text-xs">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wide">
                  📌 Матеріал з щоденника за тиждень:
                </span>
                {summary.wins.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-emerald-400 font-medium text-[10px]">Перемоги:</span>
                    <ul className="list-disc list-inside text-zinc-400 pl-1 space-y-0.5 max-h-20 overflow-y-auto">
                      {summary.wins.map((w, idx) => (
                        <li key={idx} className="truncate">{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.improvements.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-amber-400 font-medium text-[10px]">Потребує покращення:</span>
                    <ul className="list-disc list-inside text-zinc-400 pl-1 space-y-0.5 max-h-20 overflow-y-auto">
                      {summary.improvements.map((imp, idx) => (
                        <li key={idx} className="truncate">{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Wins input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                1. Твої перемоги та досягнення (Wins)
              </label>
              <Textarea
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="Що вдалося виконати? Чим пишаєшся?.."
                rows={2}
                className="text-xs"
              />
            </div>

            {/* Challenges input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                2. Головні труднощі та виклики (Challenges)
              </label>
              <Textarea
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="Що заважало? Де виник збій у системі?.."
                rows={2}
                className="text-xs"
              />
            </div>

            {/* Adjustments input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                3. Кайдзен-корективи на майбутнє (Adjustments)
              </label>
              <Textarea
                value={adjustments}
                onChange={(e) => setAdjustments(e.target.value)}
                placeholder={
                  weekNum === 12
                    ? "Які глобальні висновки зробиш на наступний Спринт? Яке одне залізне правило впровадиш?.."
                    : "Що змінити наступного тижня, щоб полегшити процеси? Як розбити кроки?.."
                }
                rows={2}
                className="text-xs"
              />
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveReview}
              disabled={isPending}
              className="mt-2 flex items-center justify-center gap-1.5"
            >
              <Save size={14} />
              {currentReview ? "Оновити висновки" : "Зберегти висновки"} {weekNum ? `тижня ${weekNum}` : ""}
            </Button>
          </div>
        ) : (
          <div className="text-zinc-500 text-xs italic py-8 text-center border-t border-white/[0.06] mt-4">
            Не знайдено активного спринту на цей період для написання письмових висновків.
          </div>
        )}
      </div>
    </div>
  );
}
