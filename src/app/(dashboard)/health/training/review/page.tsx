import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { prisma } from "@/lib/db/prisma";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { uk } from "date-fns/locale";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Flame,
  Dumbbell,
  Hourglass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Training — Weekly Review",
};

interface TrainingReviewPageProps {
  searchParams: Promise<{ weekOffset?: string }>;
}

export default async function TrainingReviewPage({ searchParams }: TrainingReviewPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { weekOffset: rawWeekOffset } = await searchParams;
  const weekOffset = Number(rawWeekOffset || "0");

  const now = new Date();
  now.setDate(now.getDate() + weekOffset * 7);

  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });

  const startStr = format(start, "dd MMMM", { locale: uk });
  const endStr = format(end, "dd MMMM yyyy", { locale: uk });

  // 1. Fetch all completed setLogs for the user during this week
  const setLogs = await prisma.setLog.findMany({
    where: {
      userId,
      completed: true,
      session: {
        date: {
          gte: start,
          lte: end,
        },
      },
    },
    include: {
      exercise: true,
    },
  });

  // 2. Fetch completed sessions count
  const weeklySessionsCount = await prisma.trainingSession.count({
    where: {
      userId,
      status: "completed",
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  // 3. Calculate total workout duration
  const weeklySessions = await prisma.trainingSession.findMany({
    where: {
      userId,
      status: "completed",
      date: {
        gte: start,
        lte: end,
      },
    },
    select: {
      durationSeconds: true,
    },
  });
  const totalDurationSeconds = weeklySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

  // Targets definition
  const targets = [
    { key: "Груди", name: "Груди", target: 15, label: "Оптимально" },
    { key: "Спина", name: "Спина", target: 12, label: "Оптимально" },
    { key: "Ноги", name: "Ноги", target: 9, label: "Оптимально" },
    { key: "Плечі", name: "Плечі", target: 6, label: "Оптимально" },
    { key: "Біцепс", name: "Біцепс", target: 6, label: "Оптимально" },
    { key: "Прес", name: "Прес", target: 6, label: "Оптимально" },
    { key: "Трицепс", name: "Трицепс", target: 3, label: "Підтримка" },
    { key: "Передпліччя", name: "Передпліччя", target: 3, label: "Підтримка" },
    { key: "Литки", name: "Литки", target: 3, label: "Підтримка" },
  ];

  // Group completed sets by normalized muscle group
  const completedSetsMap: Record<string, number> = {};
  for (const log of setLogs) {
    const rawGroup = log.exercise?.muscleGroup || "";
    const groupLower = rawGroup.trim().toLowerCase();

    let targetKey = "";
    if (groupLower.includes("груд") || groupLower === "chest") {
      targetKey = "Груди";
    } else if (groupLower.includes("спин") || groupLower === "back") {
      targetKey = "Спина";
    } else if (
      groupLower.includes("ног") ||
      groupLower === "legs" ||
      groupLower.includes("quad") ||
      groupLower.includes("hamstring") ||
      groupLower.includes("glute")
    ) {
      targetKey = "Ноги";
    } else if (
      groupLower.includes("плеч") ||
      groupLower === "shoulders" ||
      groupLower === "delts" ||
      groupLower.includes("delt")
    ) {
      targetKey = "Плечі";
    } else if (groupLower.includes("біцеп") || groupLower.includes("bicep")) {
      targetKey = "Біцепс";
    } else if (groupLower.includes("прес") || groupLower === "abs" || groupLower === "core") {
      targetKey = "Прес";
    } else if (groupLower.includes("трицеп") || groupLower.includes("tricep")) {
      targetKey = "Трицепс";
    } else if (groupLower.includes("передпліч") || groupLower.includes("forearm")) {
      targetKey = "Передпліччя";
    } else if (
      groupLower.includes("литк") ||
      groupLower === "calves" ||
      groupLower.includes("calf")
    ) {
      targetKey = "Литки";
    }

    if (targetKey) {
      completedSetsMap[targetKey] = (completedSetsMap[targetKey] || 0) + 1;
    }
  }

  const totalWeeklySets = Object.values(completedSetsMap).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "training", href: "/health/training" },
          { label: "weekly review" },
        ]}
        title="Тижневий звіт"
      />

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl">
        <Link
          href={`/health/training/review?weekOffset=${weekOffset - 1}`}
          className="p-2 rounded-lg bg-white/5 border border-white/[0.08] hover:bg-white/10 transition-colors text-zinc-300"
        >
          <ChevronLeft size={16} />
        </Link>

        <div className="flex items-center gap-2 text-sm font-semibold font-mono text-zinc-200">
          <CalendarDays size={16} className="text-zinc-400" />
          <span>
            {startStr} – {endStr}
          </span>
          {weekOffset === 0 && (
            <span className="text-[10px] uppercase font-bold text-accent-training bg-accent-training/10 border border-accent-training/20 px-2 py-0.5 rounded-full ml-1">
              Поточний тиждень
            </span>
          )}
        </div>

        <Link
          href={`/health/training/review?weekOffset=${weekOffset + 1}`}
          className="p-2 rounded-lg bg-white/5 border border-white/[0.08] hover:bg-white/10 transition-colors text-zinc-300"
        >
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-training/10 text-accent-training">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Тренування</p>
            <p className="text-2xl font-bold text-zinc-200 font-mono mt-0.5">
              {weeklySessionsCount}
            </p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <Dumbbell size={24} />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
              Завершено підходів
            </p>
            <p className="text-2xl font-bold text-zinc-200 font-mono mt-0.5">{totalWeeklySets}</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Hourglass size={24} />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
              Час під навантаженням
            </p>
            <p className="text-2xl font-bold text-zinc-200 font-mono mt-0.5">
              {totalDurationMinutes} хв
            </p>
          </div>
        </div>
      </div>

      {/* Muscle Group Progression Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-panel-title font-semibold text-zinc-300 pl-1">
          Розподіл навантаження на м&apos;язи
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.map((item) => {
            const completed = completedSetsMap[item.name] || 0;
            const progressPercent = Math.min(100, Math.round((completed / item.target) * 100));

            // Status indicator coloring
            let statusBadge = (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-500/10 border border-white/[0.06] text-zinc-400">
                Не розпочато
              </span>
            );
            let barColor = "bg-zinc-800";

            if (completed >= item.target) {
              statusBadge = (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Виконано
                </span>
              );
              barColor = "bg-emerald-500";
            } else if (completed > 0) {
              statusBadge = (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
                  <AlertCircle size={10} /> У процесі
                </span>
              );
              barColor = "bg-amber-500";
            }

            return (
              <div key={item.key} className="glass-card p-5 flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-200 text-sm">{item.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Ціль: {item.target} • {item.label}
                    </span>
                  </div>
                  {statusBadge}
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex justify-between items-baseline text-xs font-mono text-zinc-400">
                    <span>Прогрес</span>
                    <span className="font-semibold text-zinc-200">
                      {completed} / {item.target} підходів ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 border border-white/[0.04] overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-300`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
