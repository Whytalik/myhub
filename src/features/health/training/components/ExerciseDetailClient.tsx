"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { PageHeader } from "@/components/ui/display/page-header";
import { toast } from "sonner";
import {
  Dumbbell,
  Activity,
  Video,
  AlignLeft,
  Info,
  ListChecks,
  CheckCircle,
  Edit2,
  Save,
  XCircle,
  TrendingUp,
} from "lucide-react";
import type { ExerciseData } from "../types";
import { upsertExerciseAction } from "../actions/exercise-actions";

import type { ExerciseInfo } from "../data/exercise-details";

interface ExerciseDetailClientProps {
  exercise: ExerciseData;
  staticDetails?: ExerciseInfo;
}

export function ExerciseDetailClient({ exercise, staticDetails }: ExerciseDetailClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(exercise.name);
  const [muscleGroup, setMuscleGroup] = useState(exercise.muscleGroup || "");
  const [equipment, setEquipment] = useState(exercise.equipment || "");
  const [explanation, setExplanation] = useState(
    exercise.explanation || staticDetails?.explanation || "",
  );
  const [scientificInsight, setScientificInsight] = useState(
    exercise.scientificInsight || staticDetails?.scientificInsight || "",
  );
  const [technique, setTechnique] = useState(exercise.technique || staticDetails?.technique || "");
  const [videoUrl, setVideoUrl] = useState(exercise.videoUrl || staticDetails?.videoUrl || "");
  const [progression, setProgression] = useState(
    exercise.progression || staticDetails?.progression || "",
  );
  const [notes, setNotes] = useState(exercise.notes || "");

  const handleCancel = () => {
    setName(exercise.name);
    setMuscleGroup(exercise.muscleGroup || "");
    setEquipment(exercise.equipment || "");
    setExplanation(exercise.explanation || staticDetails?.explanation || "");
    setScientificInsight(exercise.scientificInsight || staticDetails?.scientificInsight || "");
    setTechnique(exercise.technique || staticDetails?.technique || "");
    setVideoUrl(exercise.videoUrl || staticDetails?.videoUrl || "");
    setProgression(exercise.progression || staticDetails?.progression || "");
    setNotes(exercise.notes || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Назва вправи обов'язкова");
      return;
    }

    try {
      const result = await upsertExerciseAction({
        id: exercise.id,
        name,
        muscleGroup: muscleGroup || null,
        equipment: equipment || null,
        explanation: explanation || null,
        scientificInsight: scientificInsight || null,
        technique: technique || null,
        videoUrl: videoUrl || null,
        progression: progression || null,
        notes: notes || null,
      });

      if (result.success) {
        toast.success("Вправу успішно оновлено");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || "Не вдалося зберегти зміни");
      }
    } catch {
      toast.error("Виникла помилка при збереженні");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "training", href: "/health/training" },
          { label: "exercises", href: "/health/training/exercises" },
          { label: name },
        ]}
        title={name}
        description={muscleGroup ? `${muscleGroup} • ${equipment || "Без спорядження"}` : undefined}
      />

      <div className="flex justify-end gap-2 -mt-4 mb-2">
        {isEditing ? (
          <>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <XCircle size={14} />
              Скасувати
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Save size={14} />
              Зберегти
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 size={14} />
            Редагувати вправу
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* EDIT MODE: Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Title & Metadata Inputs */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <h2 className="text-panel-title border-b border-white/[0.06] pb-2">Основні дані</h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Назва вправи
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                    Група м&apos;язів
                  </label>
                  <Input
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value)}
                    placeholder="Напр. Груди, Квадрицепс"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                    Спорядження
                  </label>
                  <Input
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    placeholder="Напр. Гантелі, Килимок"
                  />
                </div>
              </div>
            </div>

            {/* Explanation & Insight Inputs */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <h2 className="text-panel-title border-b border-white/[0.06] pb-2">
                Науковий аналіз
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Пояснення вправи
                </label>
                <textarea
                  className="glass-input px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:glass-input-focus transition-all duration-150 min-h-[120px] rounded-lg"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Біомеханічний опис вправи..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Науковий інсайт (Дослідження)
                </label>
                <textarea
                  className="glass-input px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:glass-input-focus transition-all duration-150 min-h-[100px] rounded-lg"
                  value={scientificInsight}
                  onChange={(e) => setScientificInsight(e.target.value)}
                  placeholder="Наукові дослідження або біомеханічні інсайти..."
                />
              </div>
            </div>

            {/* Technique Inputs */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <h2 className="text-panel-title border-b border-white/[0.06] pb-2">
                Покрокова техніка виконання
              </h2>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Кроки техніки
                </label>
                <span className="text-[10px] text-zinc-500 mb-1">
                  Кожен крок пишіть з нового рядка без цифр (вони додадуться автоматично)
                </span>
                <textarea
                  className="glass-input px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:glass-input-focus transition-all duration-150 min-h-[180px] rounded-lg font-mono text-xs"
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  placeholder="1. Лягти на лаву...&#10;2. Звести лопатки..."
                />
              </div>
            </div>

            {/* Progression Input */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <h2 className="text-panel-title border-b border-white/[0.06] pb-2">
                Стратегія прогресу
              </h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Правила прогресії
                </label>
                <textarea
                  className="glass-input px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:glass-input-focus transition-all duration-150 min-h-[120px] rounded-lg"
                  value={progression}
                  onChange={(e) => setProgression(e.target.value)}
                  placeholder="Вкажіть, як прогресувати в цій вправі (напр., крок збільшення ваги, діапазони повторень)..."
                />
              </div>
            </div>
          </div>

          {/* EDIT MODE: Right Column */}
          <div className="flex flex-col gap-6">
            {/* Video Input */}
            <div className="glass-card p-5 flex flex-col gap-4">
              <h2 className="text-panel-title border-b border-white/[0.06] pb-2">Медіа та відео</h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Посилання на YouTube Embed
                </label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                />
                <span className="text-[10px] text-zinc-500 leading-relaxed">
                  Будь ласка, використовуйте посилання у форматі <strong>/embed/VIDEO_ID</strong>{" "}
                  для вбудовування відеоплеєра.
                </span>
              </div>
            </div>

            {/* Notes Input */}
            <div className="glass-card p-5 flex flex-col gap-4">
              <h2 className="text-panel-title border-b border-white/[0.06] pb-2">Ваші нотатки</h2>
              <div className="flex flex-col gap-1.5">
                <textarea
                  className="glass-input px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:glass-input-focus transition-all duration-150 min-h-[120px] rounded-lg"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ваші персональні нотатки..."
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* READ MODE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Scientific Analysis and Technique */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Scientific Bio & Concept */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Activity size={18} />
                </div>
                <h2 className="text-panel-title">Біомеханічний та науковий аналіз</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Пояснення вправи
                  </h3>
                  <p className="text-body leading-relaxed">
                    {explanation ||
                      "Детальний опис цієї вправи знаходиться на етапі підготовки. Вона задіює цільові м'язові групи відповідно до вашої анатомічної структури."}
                  </p>
                </div>

                {scientificInsight && (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-accent-training mb-1.5 flex items-center gap-1.5">
                      <Info size={14} />
                      Науковий інсайт (Дослідження)
                    </h3>
                    <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                      {scientificInsight}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Technique steps */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <ListChecks size={18} />
                </div>
                <h2 className="text-panel-title">Покрокова техніка виконання</h2>
              </div>

              <div className="flex flex-col gap-3">
                {technique ? (
                  technique.split("\n").map((step, index) => (
                    <div key={index} className="flex gap-3 items-start text-body">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/[0.08] text-xs font-semibold font-mono flex items-center justify-center text-zinc-300 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-zinc-300 pt-0.5">{step.replace(/^\d+\.\s*/, "")}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-3 items-start text-body">
                    <CheckCircle size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                    <p className="text-zinc-400">
                      Утримуйте хребет у нейтральному положенні, виконуйте рух плавно та контролюйте
                      ексцентричну фазу (опускання ваги).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progression Strategy */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <TrendingUp size={18} />
                </div>
                <h2 className="text-panel-title">
                  Стратегія прогресу (Прогресивне перевантаження)
                </h2>
              </div>

              {progression ? (
                <div className="text-body text-zinc-300 whitespace-pre-line leading-relaxed">
                  {progression}
                </div>
              ) : exercise.trackingType === "weight_reps" ? (
                <div className="flex flex-col gap-4 text-body text-zinc-300">
                  <p className="leading-relaxed">
                    Для ефективного росту сили та м&apos;язової маси використовуйте метод{" "}
                    <strong>подвійної прогресії</strong>:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
                      <div className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400">
                        1. Закріплення ваги
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Використовуйте стабільну вагу та намагайтеся досягти верхньої межі цільового
                        діапазону повторень (наприклад, 12 повторень) в усіх запланованих підходах.
                      </p>
                    </div>

                    <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
                      <div className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400">
                        2. Крок вгору
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Коли всі підходи виконані на максимум із запасом RPE 8-9, на наступному
                        тренуванні додайте вагу (+1-2.5 кг для верхньої частини тіла, +2.5-5 кг для
                        нижньої).
                      </p>
                    </div>

                    <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
                      <div className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400">
                        3. Новий цикл
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        З новою вагою кількість повторень знизиться до нижньої межі (наприклад, 8
                        повторень). Поступово збільшуйте їх від тренування до тренування, повторюючи
                        цикл.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 text-body text-zinc-300">
                  <p className="leading-relaxed">
                    Для вправ із трекінгом за часом використовуйте метод{" "}
                    <strong>прогресії часу під навантаженням (Time under Tension)</strong>:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
                      <div className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400">
                        1. Збільшення часу
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Намагайтеся збільшувати тривалість виконання вправи на 2–5 секунд у кожному
                        підході на кожному тренуванні (наприклад, планка від 45 до 60 секунд).
                      </p>
                    </div>

                    <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
                      <div className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400">
                        2. Ускладнення
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Досягнувши цільового часу, ускладніть вправу (додайте жилет-обважнювач,
                        змініть кут нахилу або робіть статичні паузи у найважчій точці).
                      </p>
                    </div>

                    <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
                      <div className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400">
                        3. Контроль форми
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Збільшення часу не повинно шкодити техніці. Якщо спина прогинається або тіло
                        тремтить надмірно, поверніться на попередній рівень часу.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Metadata, Video Player, and Notes */}
          <div className="flex flex-col gap-6">
            {/* Metadata Card */}
            <div className="glass-card p-5 flex flex-col gap-4">
              <h2 className="text-panel-title flex items-center gap-2">
                <Dumbbell size={16} className="text-zinc-400" />
                Характеристики вправи
              </h2>
              <div className="flex flex-col gap-3 text-[13px]">
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-400 font-normal">Група м&apos;язів</span>
                  <span className="font-semibold text-zinc-200">{muscleGroup || "Не вказано"}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-400 font-normal">Спорядження</span>
                  <span className="font-semibold text-zinc-200">{equipment || "Власна вага"}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-zinc-400 font-normal">Тип трекінгу</span>
                  <span className="font-mono text-xs uppercase text-zinc-300 bg-white/5 px-2 py-0.5 rounded">
                    {exercise.trackingType === "weight_reps" ? "Вага та повторення" : "Тривалість"}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Embed */}
            {videoUrl && (
              <div className="glass-card p-5 flex flex-col gap-3.5">
                <h2 className="text-panel-title flex items-center gap-2">
                  <Video size={16} className="text-red-400" />
                  Відеопояснення
                </h2>
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08] bg-black/20">
                  <iframe
                    className="w-full h-full"
                    src={videoUrl}
                    title={`Відеопояснення: ${name}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <span className="text-[11px] text-center text-zinc-400">
                  Відео з правильної біомеханіки та безпеки виконання.
                </span>
              </div>
            )}

            {/* User's custom notes */}
            <div className="glass-card p-5 flex flex-col gap-3.5">
              <h2 className="text-panel-title flex items-center gap-2">
                <AlignLeft size={16} className="text-zinc-400" />
                Ваші нотатки
              </h2>
              <div className="min-h-[80px] p-3 rounded-lg bg-black/20 border border-white/[0.06] text-body text-zinc-300">
                {notes ? (
                  <p className="whitespace-pre-line leading-relaxed">{notes}</p>
                ) : (
                  <p className="text-zinc-500 italic text-[13px] text-center pt-4">
                    Немає особистих нотаток для цієї вправи.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
