"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Play,
  Layers,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  quickCaptureAction,
  routeThoughtAction,
  decomposeThoughtAction,
} from "@/features/life/actions/thought-actions";
import type { LifeSphereData } from "@/features/life/types";

interface ThoughtItem {
  id: string;
  content: string;
  status: {
    id: string;
    name: string;
  };
  sphereId: string | null;
}

interface PlanningWizardClientProps {
  initialThoughts: ThoughtItem[];
  spheres: LifeSphereData[];
  activeSprint: any;
}

export function PlanningWizardClient({
  initialThoughts,
  spheres,
  activeSprint,
}: PlanningWizardClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Intro, 1: Brain Dump, 2: Filter, 3: Decompose, 4: Finish
  const [thoughts, setThoughts] = useState<ThoughtItem[]>(initialThoughts);

  // Step 1: Brain Dump state
  const [newThoughtText, setNewThoughtText] = useState("");
  const [isActionPending, startActionTransition] = useTransition();

  // Step 2: Filter states
  const inboxThoughts = useMemo(() => {
    return thoughts.filter((t) => t.status.name === "Inbox" || t.status.name === "Інбокс");
  }, [thoughts]);
  const [filterIndex, setFilterIndex] = useState(0);

  // Step 3: Decompose states
  const decomposableThoughts = useMemo(() => {
    return thoughts.filter((t) => t.status.name === "Хочу" || t.status.name === "Повинен");
  }, [thoughts]);
  const [decomposeIndex, setDecomposeIndex] = useState(0);

  // Decomposition Form states
  const [decomposeType, setDecomposeType] = useState<"task" | "project">("task");
  // Task fields
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  // Project fields
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [firstAtomTitle, setFirstAtomTitle] = useState("");
  const [firstAtomDesc, setFirstAtomDesc] = useState("");

  const [selectedSphereId, setSelectedSphereId] = useState<string>(spheres[0]?.id || "");
  const [resistance, setResistance] = useState<number>(3); // 1-5

  // Handlers
  const handleAddThought = () => {
    const text = newThoughtText.trim();
    if (!text) return;

    startActionTransition(async () => {
      const result = await quickCaptureAction(text);
      if (result.success) {
        toast.success("Думку зафіксовано!");
        const newThought: ThoughtItem = {
          id: result.data.id,
          content: result.data.content,
          status: {
            id: result.data.statusId,
            name: "Inbox",
          },
          sphereId: result.data.sphereId,
        };
        setThoughts((prev) => [...prev, newThought]);
        setNewThoughtText("");
      } else {
        toast.error(result.error || "Не вдалося зберегти думку");
      }
    });
  };

  const handleFilterThought = (thoughtId: string, outcome: "KEEP_WANT" | "KEEP_MUST" | "NOT_MINE") => {
    startActionTransition(async () => {
      const result = await routeThoughtAction(thoughtId, outcome);
      if (result.success) {
        toast.success("Думку відфільтровано");
        // Update local thoughts state
        const statusNameMap = {
          KEEP_WANT: "Хочу",
          KEEP_MUST: "Повинен",
          NOT_MINE: "Кошик",
        };
        setThoughts((prev) =>
          prev.map((t) =>
            t.id === thoughtId
              ? { ...t, status: { ...t.status, name: statusNameMap[outcome] } }
              : t
          )
        );

        // Move to next card
        if (filterIndex < inboxThoughts.length - 1) {
          setFilterIndex((prev) => prev + 1);
        } else {
          // Finished filtering
          toast.success("Всі думки з Інбоксу відфільтровано!");
        }
      } else {
        toast.error(result.error || "Не вдалося відфільтрувати думку");
      }
    });
  };

  // Run decomposition
  const handleDecompose = (thoughtId: string) => {
    const isProject = decomposeType === "project";
    const currentThought = decomposableThoughts[decomposeIndex];

    const title = isProject ? projectTitle.trim() : taskTitle.trim();
    if (!title) return;

    startActionTransition(async () => {
      const result = await decomposeThoughtAction({
        thoughtId,
        type: decomposeType,
        projectTitle: isProject ? title : undefined,
        description: isProject ? projectDesc : taskDesc,
        atomTitle: isProject ? firstAtomTitle.trim() : title,
        atomDescription: isProject ? firstAtomDesc.trim() : undefined,
        sphereId: selectedSphereId,
        priority: "MEDIUM",
      });

      if (result.success) {
        toast.success(isProject ? "Проєкт створено успішно!" : "Атом створено успішно!");

        // Remove the decomposed thought locally
        setThoughts((prev) => prev.filter((t) => t.id !== thoughtId));

        // Reset form states
        setTaskTitle("");
        setTaskDesc("");
        setProjectTitle("");
        setProjectDesc("");
        setFirstAtomTitle("");
        setFirstAtomDesc("");
        setResistance(3);

        // Move to next or check if complete
        if (decomposeIndex < decomposableThoughts.length - 1) {
          // Stay at the same index because the current item was filtered out of decomposable list,
          // so the next item naturally shifts to decomposeIndex!
          // But just to make sure we don't overflow, let's keep index bounds checked:
        } else {
          setDecomposeIndex(0);
        }
      } else {
        toast.error(result.error || "Помилка при декомпозиції");
      }
    });
  };

  // Helper to pre-populate decompose form fields when moving to a card
  const currentDecomposeThought = decomposableThoughts[decomposeIndex];
  useMemo(() => {
    if (currentDecomposeThought) {
      setTaskTitle(currentDecomposeThought.content);
      setProjectTitle(currentDecomposeThought.content);
      setFirstAtomTitle("Фізичний крок для: " + currentDecomposeThought.content.slice(0, 30));
    }
  }, [currentDecomposeThought]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* 🚀 Step Indicator */}
      {step > 0 && (
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex flex-wrap items-center gap-1.5 md:gap-4 text-xs font-mono text-zinc-500">
            <span className={step === 1 ? "text-accent font-bold" : thoughts.length > 0 ? "text-zinc-300" : ""}>
              1. ЗБІР ДУМОК
            </span>
            <ChevronRight size={12} />
            <span className={step === 2 ? "text-accent font-bold" : inboxThoughts.length === 0 ? "text-zinc-300" : ""}>
              2. ПРАЙМ-ФІЛЬТР
            </span>
            <ChevronRight size={12} />
            <span className={step === 3 ? "text-accent font-bold" : decomposableThoughts.length === 0 ? "text-zinc-300" : ""}>
              3. ДЕКОМПОЗИЦІЯ
            </span>
            <ChevronRight size={12} />
            <span className={step === 4 ? "text-accent font-bold" : ""}>
              4. ФІНАЛ
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setStep(0)} className="text-xs">
            Перезапустити флоу
          </Button>
        </div>
      )}

      {/* 🏠 STEP 0: INTRO */}
      {step === 0 && (
        <div className="glass-card p-6 md:p-8 flex flex-col gap-6 items-center text-center bg-white/[0.01]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center animate-float">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-2 max-w-lg">
            <h2 className="text-2xl font-bold text-zinc-100 font-mono">Кайдзен-цикл планування</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Не намагайся планувати хаос у своїй голові. Давай розвантажимо мозок, просіємо думки через Прайм-Фільтр та розіб'ємо їх до атомів.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full text-left mt-4">
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">✍️</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">1. Збір думок</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Виписуєш все, що крутиться в голові, не замислюючись про формати.</p>
              </div>
            </div>
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">🔍</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">2. Прайм-Фільтр</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Відділяєш щирі бажання від чужих боргів. Видаляєш інформаційне сміття.</p>
              </div>
            </div>
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">🔬</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">3. Декомпозиція</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Перетворюєш сиру ідею на проєкт або конкретну фізичну дію (атом).</p>
              </div>
            </div>
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">📅</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">4. Розподіл (Канбан)</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Закладаєш плани на тиждень та розподіляєш щоденне завантаження.</p>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setStep(1)}
            className="mt-4 px-8 py-2.5 font-semibold text-sm flex items-center gap-2"
          >
            Почати планування <ArrowRight size={16} />
          </Button>
        </div>
      )}

      {/* ✍️ STEP 1: BRAIN DUMP */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-start">
          <div className="glass-card p-6 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-4">
            <div>
              <h3 className="text-panel-title font-semibold text-zinc-200">Крок 1: Збір думок (Brain Dump)</h3>
              <p className="text-caption text-xs mt-1">
                Випиши все, що крутиться в голові: завдання, покупки, образи, ідеї, борги. Пиши просто і швидко.
              </p>
            </div>

            <div className="flex gap-2 mt-2">
              <Input
                value={newThoughtText}
                onChange={(e) => setNewThoughtText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddThought();
                }}
                placeholder="Записати думку..."
                autoFocus
                disabled={isActionPending}
              />
              <Button
                variant="primary"
                onClick={handleAddThought}
                disabled={!newThoughtText.trim() || isActionPending}
              >
                Додати
              </Button>
            </div>
          </div>

          {/* Side list of collected thoughts */}
          <div className="glass-card p-5 bg-black/10 border border-white/[0.04] rounded-2xl flex flex-col gap-4 max-h-[450px]">
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
              <h4 className="text-xs font-mono font-semibold uppercase text-zinc-400">Твій поточний Inbox</h4>
              <span className="text-[11px] font-mono text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded">
                {thoughts.length}
              </span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
              {thoughts.length === 0 ? (
                <div className="text-zinc-500 text-xs italic py-12 text-center">
                  Тут з'являться твої думки. Напиши щось зліва!
                </div>
              ) : (
                [...thoughts].reverse().map((t) => (
                  <div key={t.id} className="glass-card p-3 text-xs bg-white/[0.01] border-white/[0.04] flex items-center justify-between gap-3">
                    <span className="text-zinc-300 leading-normal">{t.content}</span>
                    <span className="text-[9px] font-mono text-zinc-500 shrink-0 bg-white/[0.03] px-1.5 py-0.5 rounded">
                      {t.status.name}
                    </span>
                  </div>
                ))
              )}
            </div>

            {thoughts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
                className="w-full mt-auto"
              >
                Далі до Фільтрації ({inboxThoughts.length} в Інбоксі) <ChevronRight size={14} className="ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 🔍 STEP 2: PRIME FILTER */}
      {step === 2 && (
        <div className="glass-card p-6 md:p-8 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-6 items-center">
          <div className="w-full flex items-center justify-between border-b border-white/[0.04] pb-3 mb-2">
            <h3 className="text-panel-title font-semibold text-zinc-200">Крок 2: Прайм-Фільтр (Відсів)</h3>
            <span className="text-xs font-mono text-zinc-500">
              Картка {inboxThoughts.length > 0 ? filterIndex + 1 : 0} з {inboxThoughts.length}
            </span>
          </div>

          {inboxThoughts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <CheckCircle2 size={36} className="text-emerald-400" />
              <div className="flex flex-col gap-1 max-w-sm">
                <h4 className="text-sm font-semibold text-zinc-200 font-mono">Інбокс пустий!</h4>
                <p className="text-xs text-zinc-400">
                  Всі твої думки пройшли Прайм-Фільтр. Вони готові до декомпозиції.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setStep(3)} className="mt-2">
                Далі до Декомпозиції ({decomposableThoughts.length} чекають) <ChevronRight size={14} />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full max-w-lg items-center">
              {/* Active thought card */}
              <div className="glass-card p-6 w-full border-white/10 bg-white/[0.02] shadow-xl text-center min-h-[120px] flex items-center justify-center relative">
                <p className="text-lg font-medium text-zinc-150 leading-relaxed font-sans">
                  &ldquo;{inboxThoughts[filterIndex]?.content}&rdquo;
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-black/35 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${((filterIndex + 1) / inboxThoughts.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <p className="text-xs font-mono text-zinc-400 text-center uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={13} className="text-accent" /> Що це за думка?
              </p>

              {/* Routing Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFilterThought(inboxThoughts[filterIndex].id, "KEEP_WANT")}
                  className="border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.02] hover:bg-emerald-500/10 h-12"
                >
                  💚 ХОЧУ (Бажання)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFilterThought(inboxThoughts[filterIndex].id, "KEEP_MUST")}
                  className="border-amber-500/20 text-amber-400 bg-amber-500/[0.02] hover:bg-amber-500/10 h-12"
                >
                  💙 ПОВИНЕН (Обов'язок)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFilterThought(inboxThoughts[filterIndex].id, "NOT_MINE")}
                  className="border-zinc-500/20 text-zinc-400 bg-white/[0.01] hover:bg-white/[0.03] h-12"
                >
                  🗑️ НЕ МОЄ (У Кошик)
                </Button>
              </div>

              {/* Skip / Back controls */}
              <div className="flex gap-4 justify-between w-full text-xs text-zinc-500 border-t border-white/[0.04] pt-4 mt-2">
                <button
                  type="button"
                  disabled={filterIndex === 0}
                  onClick={() => setFilterIndex((i) => i - 1)}
                  className="hover:text-zinc-300 disabled:opacity-30 disabled:hover:text-zinc-500 flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Попередня думка
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-zinc-400 hover:text-zinc-200 font-semibold"
                >
                  Пропустити фільтрацію та перейти далі
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🔬 STEP 3: DECOMPOSITION */}
      {step === 3 && (
        <div className="glass-card p-6 md:p-8 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-6">
          <div className="w-full flex items-center justify-between border-b border-white/[0.04] pb-3 mb-2">
            <div>
              <h3 className="text-panel-title font-semibold text-zinc-200">Крок 3: Кайдзен-декомпозиція (Розбивка)</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Розбиваємо сирі думки на великі Проєкти та дрібні фізичні кроки (Атоми).</p>
            </div>
            <span className="text-xs font-mono text-zinc-500 shrink-0">
              Залишилось: {decomposableThoughts.length} думок
            </span>
          </div>

          {decomposableThoughts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <CheckCircle2 size={36} className="text-emerald-400" />
              <div className="flex flex-col gap-1 max-w-sm">
                <h4 className="text-sm font-semibold text-zinc-200 font-mono">Все розбито!</h4>
                <p className="text-xs text-zinc-400">
                  Ти успішно декомпозував усі відфільтровані бажання та обов'язки в робочі сутності.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setStep(4)} className="mt-2">
                Завершити планування <ArrowRight size={14} />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-8 items-start">
              {/* Left Column: Thought Info & Type Picker */}
              <div className="flex flex-col gap-4">
                <div className="glass-card p-4 border-amber-500/10 bg-amber-500/[0.01] rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[9px] font-mono text-amber-400 font-semibold uppercase">
                    <span>Сира думка ({decomposableThoughts[decomposeIndex]?.status.name})</span>
                    <span>Думка {decomposeIndex + 1} з {decomposableThoughts.length}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-150 leading-relaxed font-sans">
                    &ldquo;{decomposableThoughts[decomposeIndex]?.content}&rdquo;
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                    Визнач масштаб думки:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDecomposeType("task")}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all duration-150 ${
                        decomposeType === "task"
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                          : "bg-white/[0.01] border-white/[0.06] text-zinc-400 hover:bg-white/[0.02]"
                      }`}
                    >
                      <CheckSquare size={16} />
                      <div>
                        <span className="text-xs font-semibold block">Кайдзен-Крок (Атом)</span>
                        <span className="text-[9px] opacity-75 block mt-0.5">Робиться за раз, &lt; 30 хв.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecomposeType("project")}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all duration-150 ${
                        decomposeType === "project"
                          ? "bg-amber-500/5 border-amber-500/20 text-amber-400"
                          : "bg-white/[0.01] border-white/[0.06] text-zinc-400 hover:bg-white/[0.02]"
                      }`}
                    >
                      <FolderKanban size={16} />
                      <div>
                        <span className="text-xs font-semibold block">Проєкт (&gt;1 кроку)</span>
                        <span className="text-[9px] opacity-75 block mt-0.5">Потребує декількох кроків.</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Skip / Next buttons */}
                <div className="flex justify-between items-center border-t border-white/[0.04] pt-4 mt-2 text-xs">
                  <button
                    type="button"
                    disabled={decomposeIndex === 0}
                    onClick={() => setDecomposeIndex((i) => i - 1)}
                    className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30 flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Назад
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (decomposeIndex < decomposableThoughts.length - 1) {
                        setDecomposeIndex((i) => i + 1);
                      } else {
                        setDecomposeIndex(0);
                      }
                    }}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    Пропустити цю думку
                  </button>
                </div>
              </div>

              {/* Right Column: Decompose forms */}
              <div className="glass-card p-5 bg-black/20 border-white/[0.06] rounded-xl flex flex-col gap-4">
                {decomposeType === "task" ? (
                  // TASK ATOM FORM
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">Сформулюй фізичний крок</label>
                      <Input
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="Обов'язково дієслово: Написати листа, Купити квитки..."
                      />
                      <p className="text-[10px] text-zinc-500 italic">
                        💡 Крок має бути настільки простим, щоб не виникало внутрішнього опору.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">Опис / Деталі (опціонально)</label>
                      <Textarea
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                        placeholder="Корисні посилання, замітки тощо..."
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  // PROJECT FORM
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">Назва проєкту</label>
                      <Input
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="Наприклад: Підготуватися до переїзду"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">Опис проєкту (опціонально)</label>
                      <Textarea
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        placeholder="Результат, який вважатиметься успіхом..."
                        rows={2}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 border-t border-white/[0.04] pt-3">
                      <label className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                        Яка найперша, найменша фізична дія потрібна, щоб зрушити з місця?
                      </label>
                      <Input
                        value={firstAtomTitle}
                        onChange={(e) => setFirstAtomTitle(e.target.value)}
                        placeholder="Обов'язково дієслово: Подзвонити ріелтору, Знайти коробки..."
                      />
                    </div>
                  </div>
                )}

                {/* Common Fields: Sphere & Resistance */}
                <div className="flex flex-col gap-3 border-t border-white/[0.04] pt-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-zinc-300 uppercase">Сфера життя</label>
                    <div className="flex flex-wrap gap-1.5">
                      {spheres.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedSphereId(s.id)}
                          className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                            selectedSphereId === s.id
                              ? "bg-accent/15 text-accent border-accent/30"
                              : "text-zinc-500 border-white/[0.06] hover:text-zinc-300 hover:bg-white/5"
                          }`}
                        >
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-300 uppercase">
                      <span>Внутрішній опір перед дією</span>
                      <span className="text-orange-400 font-bold">{resistance} / 5</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setResistance(val)}
                          className={`flex-1 h-7 rounded text-xs font-mono transition-colors ${
                            resistance === val
                              ? val >= 4
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                              : "bg-white/[0.01] border border-white/[0.06] text-zinc-500 hover:bg-white/[0.03]"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    {resistance >= 4 && (
                      <p className="text-[10px] text-rose-400 font-mono flex items-center gap-1 bg-rose-500/5 p-1.5 rounded border border-rose-500/10">
                        <AlertTriangle size={11} className="shrink-0" />
                        <span>Опір високий: краще розбити цей крок на ще простіший!</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleDecompose(decomposableThoughts[decomposeIndex].id)}
                  disabled={isActionPending}
                  className="w-full mt-2"
                >
                  Розбити та створити {decomposeType === "project" ? "Проєкт" : "Атом"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🎉 STEP 4: FINISH */}
      {step === 4 && (
        <div className="glass-card p-8 flex flex-col gap-6 items-center text-center bg-white/[0.01]">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center animate-float">
            <CheckCircle2 size={32} />
          </div>

          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="text-2xl font-bold text-zinc-100 font-mono">Планування успішно завершено!</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Ти успішно розібрав свій Інбокс, провів фільтрацію та декомпозував думки на конкретні робочі кроки та проєкти.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-sm mt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/life/planning/kanban")}
              className="w-full font-semibold flex items-center justify-center gap-2"
            >
              Відкрити Спринт-Канбан <ArrowRight size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(0)}
              className="w-full text-xs text-zinc-500"
            >
              Спланувати ще раз
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
