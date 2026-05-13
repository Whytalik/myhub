import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format, isToday, isPast } from "date-fns";
import {
  Flame, Zap, BookText, ArrowRight, Target,
  AlertCircle, ChevronRight, Utensils, Dumbbell,
  BookOpen, Brain,
  CheckCircle2, Circle, CircleDot,
  Sparkles, Compass
} from "lucide-react";
import { getTodayEntry } from "@/features/life/services/journal-service";
import { getCachedSystemStatus, getCachedEntriesForStats, getCachedActiveHabits, getCachedTasksByDate, getCachedAllTasks, getCachedActiveSprint, getCachedAnnualCompass, getCachedVision } from "@/lib/cache";
import { SOSButton } from "@/features/system/components/sos-button";
import { recoveryService } from "@/features/system/services/recovery-service";
import { CrisisDashboard } from "@/features/system/components/crisis-dashboard";

export const metadata: Metadata = {
  title: "Hub",
};

function getStatusIcon(status: string) {
  switch (status) {
    case "DONE": return <CheckCircle2 size={14} className="text-success" />;
    case "IN_PROGRESS": return <CircleDot size={14} className="text-accent" />;
    default: return <Circle size={14} className="text-text-muted/40" />;
  }
}

function getPriorityBadge(priority: string) {
  const colors: Record<string, string> = {
    URGENT: "bg-danger/10 text-danger border-danger/20",
    HIGH: "bg-warning/10 text-warning border-warning/20",
    MEDIUM: "bg-accent/10 text-accent border-accent/20",
    LOW: "bg-text-muted/10 text-text-muted border-text-muted/20",
  };
  return (
    <span className={`text-micro font-medium px-1.5 py-0.5 rounded border ${colors[priority] || colors.LOW}`}>
      {priority}
    </span>
  );
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const name = session.user?.name?.split(" ")[0] ?? "there";

  if (userId) {
    await recoveryService.runDailyCheck(userId).catch(() => null);
  }

  const user = await getCachedSystemStatus(userId);
  const isCrisis = user?.systemStatus && user.systemStatus !== "STABLE";

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = format(now, "EEEE, MMMM d");
  const todayISO = format(now, "yyyy-MM-dd");
  const nowTs = now.getTime();

  let streak = 0;
  let todayDone = false;
  let avgEnergy: number | null = null;
  let todayEntry: Awaited<ReturnType<typeof getTodayEntry>> | null = null;
  let entries: Awaited<ReturnType<typeof getCachedEntriesForStats>> = [];
  let todayTasks: Awaited<ReturnType<typeof getCachedTasksByDate>> = [];
  let allTasks: Awaited<ReturnType<typeof getCachedAllTasks>> = [];
  let habits: Awaited<ReturnType<typeof getCachedActiveHabits>> = [];
  let activeSprint: Awaited<ReturnType<typeof getCachedActiveSprint>> = null;
  let annualCompass: Awaited<ReturnType<typeof getCachedAnnualCompass>> = null;
  let vision: Awaited<ReturnType<typeof getCachedVision>> = null;

  if (userId) {
    const results = await Promise.all([
      getTodayEntry(userId).catch(() => null),
      getCachedEntriesForStats(userId).catch(() => []),
      getCachedTasksByDate(userId, todayISO).catch(() => []),
      getCachedAllTasks(userId).catch(() => []),
      getCachedActiveHabits(userId).catch(() => []),
      getCachedActiveSprint(userId).catch(() => null),
      getCachedAnnualCompass(userId, new Date().getFullYear()).catch(() => null),
      getCachedVision(userId).catch(() => null),
    ]);
    todayEntry = results[0];
    entries = results[1];
    todayTasks = results[2];
    allTasks = results[3];
    habits = results[4];
    activeSprint = results[5];
    annualCompass = results[6];
    vision = results[7];

    todayDone = !!todayEntry;

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < entries.length; i++) {
      const entryDay = new Date(entries[i].date);
      entryDay.setHours(0, 0, 0, 0);
      const expected = new Date(todayDate.getTime() - i * 86400000);
      if (entryDay.getTime() === expected.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    const withEnergy = entries.filter((e) => e.energy !== null);
    avgEnergy = withEnergy.length > 0
      ? withEnergy.reduce((s, e) => s + e.energy!, 0) / withEnergy.length
      : null;
  }

  let recoveryRoutine = {};
  let recoveryScore = 0;
  if (isCrisis && todayEntry) {
    recoveryRoutine = (todayEntry.recoveryRoutine as Record<string, boolean>) || {};
    recoveryScore = todayEntry.recoveryScore || 0;
  }

  const pendingTasks = allTasks.filter(t => t.status === "TODO" || t.status === "IN_PROGRESS");
  const urgentTasks = pendingTasks.filter(t => t.priority === "URGENT" || t.priority === "HIGH");
  const overdueTasks = pendingTasks.filter(t => t.plannedDate && isPast(new Date(t.plannedDate)) && !isToday(new Date(t.plannedDate)));

  const todayHabits = habits.map(h => {
    const todayStr = todayISO;
    const completed = h.completions.some(c => format(new Date(c.date), "yyyy-MM-dd") === todayStr);
    return { ...h, completed };
  });

  const sprintProgress = activeSprint?.objectives.reduce((acc, obj) => {
    const totalKR = obj.keyResults.length;
    const doneKR = obj.keyResults.filter(kr => kr.targetValue > 0 && kr.currentValue >= kr.targetValue).length;
    return acc + (totalKR > 0 ? (doneKR / totalKR) * 100 : 0);
  }, 0) ?? 0;
  const sprintObjectiveCount = activeSprint?.objectives.length ?? 0;
  const sprintProgressAvg = sprintObjectiveCount > 0 ? sprintProgress / sprintObjectiveCount : 0;

  const sprintDaysLeft = activeSprint?.endDate
    ? Math.ceil((new Date(activeSprint.endDate).getTime() - nowTs) / 86400000)
    : null;

  if (isCrisis) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <p className="text-note font-mono text-text-muted uppercase tracking-wider mb-1">{today}</p>
          <h1 className="font-heading text-title text-text-primary leading-tight">
            {greeting}, <span className="text-accent">{name}</span>
          </h1>
        </div>
        <CrisisDashboard
          status={user!.systemStatus}
          routine={recoveryRoutine}
          score={recoveryScore}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-note font-mono text-text-muted uppercase tracking-wider mb-1">{today}</p>
          <h1 className="font-heading text-title text-text-primary leading-tight">
            {greeting}, <span className="text-accent">{name}</span>
          </h1>
        </div>
        <SOSButton />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 bg-surface rounded-xl px-4 py-3">
          <Flame size={16} className={streak > 0 ? "text-accent" : "text-text-muted"} />
          <div>
            <p className="text-body font-heading text-text-primary leading-none">{streak}</p>
            <p className="text-note font-mono text-text-muted uppercase tracking-wider">Streak</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface rounded-xl px-4 py-3">
          <Zap size={16} className="text-text-muted" />
          <div>
            <p className="text-body font-heading text-text-primary leading-none">
              {avgEnergy !== null ? avgEnergy.toFixed(1) : "—"}
            </p>
            <p className="text-note font-mono text-text-muted uppercase tracking-wider">Avg Energy</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface rounded-xl px-4 py-3">
          <BookText size={16} className={todayDone ? "text-accent" : "text-text-muted"} />
          <div>
            <p className="text-body font-medium text-text-primary leading-none">
              {todayDone ? "Logged" : "Pending"}
            </p>
            <p className="text-note font-mono text-text-muted uppercase tracking-wider">Journal</p>
          </div>
        </div>
        <Link href="/life/journal" className="flex items-center justify-between bg-surface rounded-xl px-4 py-3 hover:bg-surface-hover transition-colors group">
          <div>
            <p className="text-body font-medium text-text-primary leading-none">
              {todayDone ? "View" : "Write"}
            </p>
            <p className="text-note font-mono text-text-muted uppercase tracking-wider">Entry</p>
          </div>
          <ArrowRight size={14} className="text-text-muted group-hover:text-accent transition-colors" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Sprint */}
          {activeSprint && (
            <div className="bg-surface rounded-xl border border-border/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Target size={16} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-body font-semibold text-text-primary">Sprint {activeSprint.number} · {activeSprint.year}</h3>
                    {sprintDaysLeft !== null && (
                      <p className="text-note font-mono text-text-muted">
                        {sprintDaysLeft > 0 ? `${sprintDaysLeft} days left` : "Ended"}
                      </p>
                    )}
                  </div>
                </div>
                <Link href="/planning/sprints" className="text-note text-accent hover:underline flex items-center gap-1">
                  Details <ChevronRight size={12} />
                </Link>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${sprintProgressAvg}%` }} />
                </div>
                <span className="text-note font-mono text-text-muted">{sprintProgressAvg.toFixed(0)}%</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeSprint.objectives.slice(0, 4).map(obj => (
                  <span key={obj.id} className="text-micro px-2 py-1 rounded-lg bg-bg/50 border border-border/50 text-text-secondary">
                    {obj.title}
                  </span>
                ))}
                {activeSprint.objectives.length > 4 && (
                  <span className="text-micro px-2 py-1 rounded-lg bg-bg/50 border border-border/50 text-text-muted">
                    +{activeSprint.objectives.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Today's Tasks */}
          <div className="bg-surface rounded-xl border border-border/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-body font-semibold text-text-primary">Today&apos;s Tasks</h3>
                  <p className="text-note font-mono text-text-muted">{todayTasks.filter(t => t.status !== "DONE").length} pending</p>
                </div>
              </div>
              <Link href="/life/tasks" className="text-note text-accent hover:underline flex items-center gap-1">
                All <ChevronRight size={12} />
              </Link>
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-note text-text-muted text-center py-6">No tasks scheduled for today</p>
            ) : (
              <div className="space-y-1.5">
                {todayTasks.slice(0, 6).map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors group">
                    {getStatusIcon(task.status)}
                    <span className={`flex-1 text-body truncate ${task.status === "DONE" ? "line-through text-text-muted" : "text-text-primary"}`}>
                      {task.title}
                    </span>
                    {getPriorityBadge(task.priority)}
                  </div>
                ))}
                {todayTasks.length > 6 && (
                  <Link href="/life/tasks" className="flex items-center justify-center gap-1 py-2 text-note text-text-muted hover:text-accent transition-colors">
                    +{todayTasks.length - 6} more <ChevronRight size={12} />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Today's Habits */}
          {todayHabits.length > 0 && (
            <div className="bg-surface rounded-xl border border-border/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Zap size={16} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-body font-semibold text-text-primary">Today&apos;s Habits</h3>
                    <p className="text-note font-mono text-text-muted">{todayHabits.filter(h => h.completed).length}/{todayHabits.length} done</p>
                  </div>
                </div>
                <Link href="/life/habits" className="text-note text-accent hover:underline flex items-center gap-1">
                  All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {todayHabits.map(habit => (
                  <div key={habit.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${habit.completed ? "bg-accent/5" : "bg-bg/30"}`}>
                    {habit.completed ? (
                      <CheckCircle2 size={14} className="text-accent shrink-0" />
                    ) : (
                      <Circle size={14} className="text-text-muted/40 shrink-0" />
                    )}
                    <span className={`text-body truncate ${habit.completed ? "text-accent" : "text-text-secondary"}`}>
                      {habit.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Meal Plan */}
        </div>

        {/* Right Column: North Star + Attention */}
        <div className="space-y-6">
          {/* North Star */}
          {(annualCompass || vision) && (
            <div className="bg-surface rounded-xl border border-border/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Compass size={16} className="text-accent" />
                </div>
                <h3 className="text-body font-semibold text-text-primary">North Star</h3>
              </div>
              <div className="space-y-4">
                {annualCompass && (
                  <div>
                    <p className="text-micro font-mono text-text-muted uppercase tracking-wider mb-1">{new Date().getFullYear()} Theme</p>
                    <p className="text-body font-medium text-text-primary">{annualCompass.theme}</p>
                    {annualCompass.wigs && (
                      <p className="text-note text-text-secondary mt-1">{annualCompass.wigs}</p>
                    )}
                  </div>
                )}
                {vision && (
                  <div>
                    <p className="text-micro font-mono text-text-muted uppercase tracking-wider mb-1">Vision</p>
                    <p className="text-note text-text-secondary leading-relaxed line-clamp-4">{vision.content}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attention Needed */}
          {(urgentTasks.length > 0 || overdueTasks.length > 0) && (
            <div className="bg-surface rounded-xl border border-danger/20 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                  <AlertCircle size={16} className="text-danger" />
                </div>
                <h3 className="text-body font-semibold text-text-primary">Attention Needed</h3>
              </div>
              <div className="space-y-3">
                {overdueTasks.length > 0 && (
                  <div>
                    <p className="text-micro font-mono text-danger uppercase tracking-wider mb-2">Overdue ({overdueTasks.length})</p>
                    <div className="space-y-1.5">
                      {overdueTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-danger/5">
                          <Circle size={12} className="text-danger/60 shrink-0" />
                          <span className="text-note text-text-secondary truncate flex-1">{task.title}</span>
                          {getPriorityBadge(task.priority)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {urgentTasks.length > 0 && (
                  <div>
                    <p className="text-micro font-mono text-warning uppercase tracking-wider mb-2">Urgent ({urgentTasks.length})</p>
                    <div className="space-y-1.5">
                      {urgentTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-warning/5">
                          <Circle size={12} className="text-warning/60 shrink-0" />
                          <span className="text-note text-text-secondary truncate flex-1">{task.title}</span>
                          {getPriorityBadge(task.priority)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Navigation */}
          <div className="bg-surface rounded-xl border border-border/50 p-5">
            <h3 className="text-body font-semibold text-text-primary mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Planning", icon: Compass, href: "/planning", color: "text-domain-ops" },
                { label: "Life", icon: Sparkles, href: "/life", color: "text-domain-ops" },
                { label: "Nutrition", icon: Utensils, href: "/nutrition", color: "text-domain-health" },
                { label: "Fitness", icon: Dumbbell, href: "/fitness", color: "text-domain-health" },
                { label: "Languages", icon: BookOpen, href: "/languages", color: "text-domain-mind" },
                { label: "Library", icon: Brain, href: "/library", color: "text-domain-mind" },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg/30 hover:bg-surface-hover transition-colors group"
                >
                  <item.icon size={14} className={`${item.color} shrink-0`} />
                  <span className="text-note text-text-secondary group-hover:text-text-primary transition-colors truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
