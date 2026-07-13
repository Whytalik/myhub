"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FolderKanban, CheckSquare, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { decomposeThoughtAction } from "@/features/life/actions/thought-actions";
import type { LifeSphereData, ThoughtData } from "@/features/life/types";

interface ThoughtDecomposeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  thought: ThoughtData;
  spheres: LifeSphereData[];
  onDecomposed: () => void;
}

type DecomposeType = "task" | "project";
type Step = "type" | "form";

export function ThoughtDecomposeDialog({
  isOpen,
  onClose,
  thought,
  spheres,
  onDecomposed,
}: ThoughtDecomposeDialogProps) {
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<DecomposeType | null>(null);

  // Form states
  const [taskTitle, setTaskTitle] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [atomTitle, setAtomTitle] = useState("");
  const [description, setDescription] = useState("");
  const [atomDescription, setAtomDescription] = useState("");
  const [sphereId, setSphereId] = useState<string | null>(thought.sphereId);
  const [resistance, setResistance] = useState<number>(1); // Scale 1-5
  const [isPending, startTransition] = useTransition();

  const handleOpenForm = (selectedType: DecomposeType) => {
    setType(selectedType);
    if (selectedType === "task") {
      setTaskTitle(thought.content);
    } else {
      setProjectTitle(thought.content);
      setAtomTitle("");
    }
    setStep("form");
  };

  const handleBack = () => {
    setStep("type");
  };

  const handleSubmit = () => {
    const isTask = type === "task";
    const currentTitle = isTask ? taskTitle : atomTitle;

    const trimmedTitle = currentTitle.trim();
    if (!trimmedTitle) {
      toast.error(isTask ? "Введіть назву завдання" : "Введіть перший крок (атом)");
      return;
    }

    startTransition(async () => {
      const result = await decomposeThoughtAction({
        thoughtId: thought.id,
        type: type!,
        taskTitle: isTask ? taskTitle : undefined,
        projectTitle: !isTask ? projectTitle : undefined,
        atomTitle: !isTask ? atomTitle : undefined,
        description: description || null,
        atomDescription: !isTask ? atomDescription : null,
        sphereId,
      });

      if (result.success) {
        toast.success(
          isTask ? "Думку успішно розбито на завдання!" : "Думку успішно розбито на проєкт!"
        );
        onDecomposed();
        onClose();
      } else {
        toast.error(result.error || "Не вдалося зберегти декомпозицію");
      }
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Кайдзен-декомпозиція (Розбивка до атомів)"
      maxWidth="500px"
    >
      <div className="flex flex-col gap-5">
        {step === "type" ? (
          <div className="flex flex-col gap-4">
            <div className="glass-card p-4 bg-white/[0.02]">
              <span className="text-label text-orange-400 block mb-1">Сира думка:</span>
              <p className="text-body italic text-zinc-150">«{thought.content}»</p>
            </div>

            <p className="text-panel-title text-center mt-2">
              Визначте характер цієї думки:
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOpenForm("task")}
                className="glass-card p-5 flex flex-col items-center gap-3 text-center hover:border-accent/40 hover:bg-white/[0.04] transition-all duration-150 group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                  <CheckSquare size={24} />
                </div>
                <div>
                  <h4 className="text-panel-title">Завдання</h4>
                  <p className="text-caption mt-1">Можна виконати за один раз (до 30 хвилин)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleOpenForm("project")}
                className="glass-card p-5 flex flex-col items-center gap-3 text-center hover:border-accent/40 hover:bg-white/[0.04] transition-all duration-150 group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                  <FolderKanban size={24} />
                </div>
                <div>
                  <h4 className="text-panel-title">Проєкт</h4>
                  <p className="text-caption mt-1">Потребує більше ніж однієї фізичної дії</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-caption text-zinc-400">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
              >
                <ChevronLeft size={14} /> Назад до вибору
              </button>
            </div>

            {type === "task" ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label text-zinc-300">Формування Атома (Завдання)</label>
                  <Input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Наприклад: Відкрити кабінет платника і завантажити реквізити"
                    className="w-full"
                    autoFocus
                  />
                  <p className="text-[11px] text-zinc-400 italic">
                    💡 Має починатися з дієслова, бути максимально конкретним та займати до 15-30 хвилин.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label text-zinc-300">Опис завдання (опціонально)</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Додаткові деталі, посилання..."
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label text-zinc-300">Назва Проєкту</label>
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Наприклад: Оплатити податки за 3-й квартал"
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label text-zinc-300">Опис проєкту (опціонально)</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Мета проєкту, очікуваний результат..."
                    rows={2}
                  />
                </div>

                <div className="glass-card p-4 bg-orange-500/[0.02] border-orange-500/10 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label text-orange-400 font-semibold">
                      Кайдзен-питання: Яка найперша, найменша фізична дія (атом) потрібна, щоб зрушити це з місця?
                    </label>
                    <Input
                      value={atomTitle}
                      onChange={(e) => setAtomTitle(e.target.value)}
                      placeholder="Наприклад: Завантажити реквізити з сайту податкової"
                      className="w-full bg-black/40"
                      autoFocus
                    />
                    <p className="text-[11px] text-zinc-400 italic">
                      💡 Правило атома: починається з дієслова, конкретне, до 15-30 хв.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-label text-zinc-300">Опис першого кроку (опціонально)</label>
                    <Textarea
                      value={atomDescription}
                      onChange={(e) => setAtomDescription(e.target.value)}
                      placeholder="Деталі першої дії..."
                      rows={2}
                      className="bg-black/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Life Sphere Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label text-zinc-300">Сфера життя</label>
              <div className="flex flex-wrap gap-2">
                {spheres.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSphereId(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      sphereId === s.id
                        ? "bg-accent/15 text-accent border-accent/30"
                        : "text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Resistance Scale */}
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex justify-between items-center">
                <label className="text-label text-zinc-300">Внутрішній опір дії (1 - немає, 5 - ступор)</label>
                <span className="font-mono text-xs font-bold text-orange-400">{resistance} / 5</span>
              </div>
              <div className="flex gap-2 justify-between">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setResistance(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-150 border ${
                      resistance === val
                        ? val >= 4
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          : "bg-accent/20 text-accent border-accent/40"
                        : "bg-black/25 text-zinc-500 border-white/[0.06] hover:bg-white/5"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              {resistance >= 4 && (
                <div className="flex items-start gap-2 text-rose-400 text-xs mt-1 p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <p>
                    Опір занадто великий! Кайдзен-правило каже: якщо опір відчутний, задачу погано розбито. Дробіть її ще дрібніше!
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-white/[0.06]">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
                Скасувати
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? "Збереження..." : "Розбити (Кайдзен)"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
