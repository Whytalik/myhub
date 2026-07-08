import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { getTrainingStats } from "@/features/health/training/services/training-stats-service";
import { AdherenceGrid } from "@/features/health/training/components/charts/AdherenceGrid";
import { E1rmStatTile } from "@/features/health/training/components/charts/E1rmStatTile";
import { RpeTrendChart } from "@/features/health/training/components/charts/RpeTrendChart";
import { TonnageBarList } from "@/features/health/training/components/charts/TonnageBarList";
import { TRAINING_SEQUENTIAL_RAMP } from "@/features/health/training/components/charts/chart-tokens";
import { CalendarCheck, TrendingUp, Gauge, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Training — Statistics",
};

export default async function TrainingStatsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const stats = await getTrainingStats(userId);
  const weeksWithSessions = stats.weeks.filter((w) => w.sessionsCount > 0).length;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "training", href: "/health/training" },
          { label: "statistics" },
        ]}
        title="Статистика"
        description="Довгострокові тренди: адгеренс, прогресія 1ПМ, RPE та обсяг навантаження"
      />

      <div className="glass-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-accent-training/10 text-accent-training">
            <CalendarCheck size={18} />
          </div>
          <div>
            <h2 className="text-panel-title">Адгеренс за 12 тижнів</h2>
            <p className="text-caption">
              {weeksWithSessions} з {stats.weeks.length} тижнів з тренуванням
            </p>
          </div>
        </div>

        <AdherenceGrid weeks={stats.weeks} />

        <div className="flex items-center gap-3 pt-1">
          <span className="text-[10px] text-zinc-500 font-mono">Менше</span>
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded border border-white/[0.08]"
              style={{ backgroundColor: "transparent" }}
            />
            {TRAINING_SEQUENTIAL_RAMP.map((color) => (
              <div
                key={color}
                className="w-4 h-4 rounded border border-white/[0.08]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Більше</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 pl-1">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <h2 className="text-panel-title">Прогресія 1ПМ (оцінка за Epley)</h2>
            <p className="text-caption">Найкращий підхід за сесію, для базових рухів з вагою</p>
          </div>
        </div>

        {stats.e1rmSeries.length === 0 ? (
          <div className="glass-card p-6 text-center text-caption">
            Замало даних для прогресії — потрібно щонайменше 2 завершені сесії з цією вправою.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.e1rmSeries.map((series) => (
              <E1rmStatTile
                key={series.exerciseId}
                exerciseName={series.exerciseName}
                points={series.points}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 pl-1">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Gauge size={18} />
          </div>
          <div>
            <h2 className="text-panel-title">Тренд RPE</h2>
            <p className="text-caption">Середній RPE виконаних підходів за сесію</p>
          </div>
        </div>

        <div className="glass-card p-5">
          {stats.rpeSeries.length < 2 ? (
            <div className="text-center text-caption py-6">Замало даних для тренду RPE.</div>
          ) : (
            <RpeTrendChart points={stats.rpeSeries} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 pl-1">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Scale size={18} />
          </div>
          <div>
            <h2 className="text-panel-title">Обсяг за м&apos;язовими групами</h2>
            <p className="text-caption">Тоннаж (вага × повторення) за останні 7 днів</p>
          </div>
        </div>

        <div className="glass-card p-5">
          {stats.muscleGroupTonnage.length === 0 ? (
            <div className="text-center text-caption py-6">
              Немає завершених підходів за останній тиждень.
            </div>
          ) : (
            <TonnageBarList items={stats.muscleGroupTonnage} />
          )}
        </div>
      </div>
    </div>
  );
}
