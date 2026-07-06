import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import * as exerciseService from "@/features/health/training/services/exercise-service";
import { EXERCISE_DETAILS } from "@/features/health/training/data/exercise-details";
import { Dumbbell, Activity, Video, AlignLeft, Info, ListChecks, CheckCircle } from "lucide-react";

interface ExerciseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ExerciseDetailPageProps): Promise<Metadata> {
  const session = await auth();
  const userId = session?.user?.id;
  const { id } = await params;
  if (!userId) return { title: "Exercise Details" };

  const exercise = await exerciseService.getExercise(userId, id);
  return {
    title: exercise ? `Exercise — ${exercise.name}` : "Exercise Not Found",
  };
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const exercise = await exerciseService.getExercise(userId, id);

  if (!exercise) {
    notFound();
  }

  const details = EXERCISE_DETAILS[exercise.name];

  return (
    <div className="flex flex-col gap-6 pb-12">


      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "training", href: "/health/training" },
          { label: "exercises", href: "/health/training/exercises" },
          { label: exercise.name },
        ]}
        title={exercise.name}
        description={exercise.muscleGroup ? `${exercise.muscleGroup} • ${exercise.equipment || "Без спорядження"}` : undefined}
      />

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
                <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-zinc-400 mb-1">Пояснення вправи</h3>
                <p className="text-body leading-relaxed">
                  {details?.explanation || "Детальний опис цієї вправи знаходиться на етапі підготовки. Вона задіює цільові м'язові групи відповідно до вашої анатомічної структури."}
                </p>
              </div>

              {details?.scientificInsight && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-accent-training mb-1.5 flex items-center gap-1.5">
                    <Info size={14} />
                    Науковий інсайт (Дослідження)
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                    {details.scientificInsight}
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
              {details?.technique ? (
                details.technique.split("\n").map((step, index) => (
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
                    Утримуйте хребет у нейтральному положенні, виконуйте рух плавно та контролюйте ексцентричну фазу (опускання ваги).
                  </p>
                </div>
              )}
            </div>
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
                <span className="text-zinc-400 font-normal">Група м'язів</span>
                <span className="font-semibold text-zinc-200">{exercise.muscleGroup || "Не вказано"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <span className="text-zinc-400 font-normal">Спорядження</span>
                <span className="font-semibold text-zinc-200">{exercise.equipment || "Власна вага"}</span>
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
          {details?.videoUrl && (
            <div className="glass-card p-5 flex flex-col gap-3.5">
              <h2 className="text-panel-title flex items-center gap-2">
                <Video size={16} className="text-red-400" />
                Відеопояснення
              </h2>
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08] bg-black/20">
                <iframe
                  className="w-full h-full"
                  src={details.videoUrl}
                  title={`Відеопояснення: ${exercise.name}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <span className="text-[11px] text-center text-zinc-400">
                Відео від провідних тренерів з правильної біомеханіки та безпеки.
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
              {exercise.notes ? (
                <p className="whitespace-pre-line leading-relaxed">{exercise.notes}</p>
              ) : (
                <p className="text-zinc-500 italic text-[13px] text-center pt-4">Немає особистих нотаток для цієї вправи.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
