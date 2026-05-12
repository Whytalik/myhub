import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hub",
};
import {
  BookHeart, Utensils, Languages, Dumbbell,
  BookOpen, ShoppingBag, ArrowRight,
  Flame, BookText, Zap, TrendingUp, Compass,
  Briefcase, Shield, Brain, Database, Package,
} from "lucide-react";
import { getTodayEntry } from "@/features/life/services/journal-service";
import { getCachedSystemStatus, getCachedEntriesForStats } from "@/lib/cache";
import { format } from "date-fns";
import { recoveryService } from "@/features/system/services/recovery-service";
import { CrisisDashboard } from "@/features/system/components/crisis-dashboard";
import { SOSButton } from "@/features/system/components/sos-button";

const domainGroups = [
  {
    name: "Operations",
    icon: Briefcase,
    spaces: [
      { label: "Planning Space", description: "Align vision with cycles", icon: Compass, href: "/planning" },
      { label: "Life Space", description: "Journal, habits & tasks", icon: BookHeart, href: "/life" },
    ]
  },
  {
    name: "Health",
    icon: Shield,
    spaces: [
      { label: "Nutrition Space", description: "Nutrition & meal planning", icon: Utensils, href: "/nutrition" },
      { label: "Fitness Space", description: "Workouts & progress", icon: Dumbbell, href: "/fitness" },
    ]
  },
  {
    name: "Mind",
    icon: Brain,
    spaces: [
      { label: "Language Space", description: "Vocabulary & immersion", icon: Languages, href: "/languages" },
      { label: "Library Space", description: "Books & reading lists", icon: BookOpen, href: "/library" },
    ]
  },
  {
    name: "Wealth",
    icon: Database,
    spaces: [
      { label: "Trading Space", description: "Markets & portfolio", icon: TrendingUp, href: "/trading" },
    ]
  },
  {
    name: "Vault",
    icon: Package,
    spaces: [
      { label: "Misc / Other", description: "Wishlist & tools", icon: ShoppingBag, href: "/other" },
    ]
  }
];

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const name = session.user?.name?.split(" ")[0] ?? "there";

  // Run automated system check once per day/session
  if (userId) {
    await recoveryService.runDailyCheck(userId).catch(() => null);
  }

  const user = await getCachedSystemStatus(userId);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = format(new Date(), "EEEE, MMMM d");

  let streak = 0;
  let todayDone = false;
  let avgEnergy: number | null = null;
  let todayEntry: Awaited<ReturnType<typeof getTodayEntry>> | null = null;
  let entries: Awaited<ReturnType<typeof getCachedEntriesForStats>> = [];

  if (userId) {
    const results = await Promise.all([
      getTodayEntry(userId).catch(() => null),
      getCachedEntriesForStats(userId).catch(() => []),
    ]);
    todayEntry = results[0];
    entries = results[1];
    todayDone = !!todayEntry;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < entries.length; i++) {
      const entryDay = new Date(entries[i].date);
      entryDay.setHours(0, 0, 0, 0);
      const expected = new Date(today.getTime() - i * 86400000);
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

  const isCrisis = user?.systemStatus && user.systemStatus !== "STABLE";

  let recoveryRoutine = {};
  let recoveryScore = 0;
  if (isCrisis && todayEntry) {
    recoveryRoutine = (todayEntry.recoveryRoutine as Record<string, boolean>) || {};
    recoveryScore = todayEntry.recoveryScore || 0;
  }

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-note font-mono text-muted uppercase tracking-[0.25em] mb-1">{today}</p>
          <p className="text-note font-mono text-accent uppercase tracking-[0.2em] mb-3">{greeting}</p>
          <h1 className="font-heading text-xl md:text-2xl text-text leading-none tracking-tight">{name}</h1>
          <div className="h-0.5 w-12 bg-accent mt-4" />
        </div>
        
        {!isCrisis && (
          <div className="flex items-center gap-3">
            <SOSButton />
          </div>
        )}
      </div>

      {isCrisis ? (
        <CrisisDashboard 
          status={user!.systemStatus} 
          routine={recoveryRoutine} 
          score={recoveryScore} 
        />
      ) : (
        <>
          {/* Stats strip */}
          {userId && (
            <div className="flex flex-wrap md:flex-nowrap items-center gap-6 bg-surface border border-border rounded-xl px-5 py-3 mb-6">
              <div className="flex items-center gap-2.5">
                <Flame size={15} className={streak > 0 ? "text-accent" : "text-muted"} />
                <div>
                  <p className="text-base font-heading text-text leading-none">{streak}</p>
                  <p className="text-caption font-mono text-muted uppercase tracking-wider">Streak</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-border" />
              <div className="flex items-center gap-2.5">
                <Zap size={15} className="text-muted" />
                <div>
                  <p className="text-lg font-heading text-text leading-none">
                    {avgEnergy !== null ? avgEnergy.toFixed(1) : "—"}
                  </p>
                  <p className="text-caption font-mono text-muted uppercase tracking-wider">Avg Energy</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-border" />
              <div className="flex items-center gap-2.5">
                <BookText size={15} className={todayDone ? "text-accent" : "text-muted"} />
                <div>
                  <p className="text-body font-semibold text-text leading-none">
                    {todayDone ? "Logged" : "Pending"}
                  </p>
                  <p className="text-caption font-mono text-muted uppercase tracking-wider">Today&apos;s Entry</p>
                </div>
              </div>
              <div className="w-full md:w-auto md:ml-auto pt-2 md:pt-0 border-t md:border-none border-border/40">
                <Link
                  href="/life/journal"
                  className="inline-flex items-center gap-1.5 text-note font-mono text-accent hover:underline uppercase tracking-wider"
                >
                  {todayDone ? "View entry" : "Log today"}
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}

          {/* Domain Groups */}
          <div className="flex flex-col gap-12">
            {domainGroups.map((group) => {
              return (
                <div key={group.name}>
                  <div className="flex items-center gap-2 mb-4">
                     <group.icon size={14} className="text-accent" />
                     <h2 className="text-note font-mono text-muted uppercase tracking-[0.3em]">{group.name}</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {group.spaces.map(({ label, description, icon: Icon, href }) => (
                      <Link
                        key={label}
                        href={href}
                        className="group flex flex-col items-center justify-center gap-3 aspect-square rounded-2xl border border-border bg-surface hover:border-accent/50 hover:bg-surface/80 hover:shadow-lg hover:shadow-accent/5 transition-all"
                      >
                        <div className="p-3 rounded-xl border bg-accent/10 border-accent/20 group-hover:bg-accent/20 transition-colors">
                          <Icon size={22} className="text-accent" />
                        </div>
                        <div className="text-center px-2">
                          <p className="text-base font-semibold text-text leading-none mb-1">{label}</p>
                          <p className="text-caption text-muted leading-snug">{description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
