import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookHeart, Utensils, Languages, Dumbbell,
  BookOpen, ShoppingBag, ArrowRight, Lock,
  Flame, BookText, Zap, CheckCircle2, CalendarDays,
} from "lucide-react";
import { getTodayEntry, getDailyStats } from "@/features/life/services/journal-service";
import { format } from "date-fns";

const spaces = [
  { label: "Life Space", description: "Journal, habits & tasks", icon: BookHeart, href: "/life/journal", adminOnly: false },
  { label: "Food System", description: "Nutrition & meal planning", icon: Utensils, href: "/food", adminOnly: true },
  { label: "Languages", description: "Vocabulary & immersion", icon: Languages, href: "/languages", adminOnly: true },
  { label: "Fitness", description: "Workouts & progress", icon: Dumbbell, href: "/fitness", adminOnly: true },
  { label: "Library", description: "Books & reading lists", icon: BookOpen, href: "/library", adminOnly: true },
  { label: "Other", description: "Wishlist & tools", icon: ShoppingBag, href: "/other", adminOnly: true },
];

const quickActions = [
  { label: "Today's Journal", href: "/life/journal", icon: BookText, desc: "Log your daily entry" },
  { label: "Habits", href: "/life/habits", icon: Zap, desc: "Check off habits" },
  { label: "Tasks", href: "/life/tasks", icon: CheckCircle2, desc: "View your task board" },
  { label: "Journal History", href: "/life/history", icon: CalendarDays, desc: "Browse past entries" },
];

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = (session.user as any)?.role === "ADMIN";
  const personId = (session.user as any)?.personId as string | undefined;
  const name = session.user?.name?.split(" ")[0] ?? "there";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = format(new Date(), "EEEE, MMMM d");

  let streak = 0;
  let todayDone = false;
  let avgEnergy: number | null = null;

  if (personId) {
    const [stats, todayEntry] = await Promise.all([
      getDailyStats(personId).catch(() => null),
      getTodayEntry(personId).catch(() => null),
    ]);
    streak = stats?.streak ?? 0;
    todayDone = !!todayEntry;
    avgEnergy = stats?.avgEnergy ?? null;
  }

  return (
    <div className="px-14 py-12 w-full max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[11px] font-mono text-muted uppercase tracking-[0.25em] mb-1">{today}</p>
        <p className="text-[11px] font-mono text-accent uppercase tracking-[0.2em] mb-3">{greeting}</p>
        <h1 className="font-heading text-7xl text-text leading-none tracking-tight">{name}</h1>
        <div className="h-0.5 w-12 bg-accent mt-4" />
      </div>

      {/* Stats strip */}
      {personId && (
        <div className="flex items-center gap-6 bg-surface border border-border rounded-2xl px-6 py-4 mb-8">
          <div className="flex items-center gap-2.5">
            <Flame size={15} className={streak > 0 ? "text-accent" : "text-muted"} />
            <div>
              <p className="text-lg font-heading text-text leading-none">{streak}</p>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Streak</p>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2.5">
            <Zap size={15} className="text-muted" />
            <div>
              <p className="text-lg font-heading text-text leading-none">
                {avgEnergy !== null ? avgEnergy.toFixed(1) : "—"}
              </p>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Avg Energy</p>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2.5">
            <BookText size={15} className={todayDone ? "text-accent" : "text-muted"} />
            <div>
              <p className="text-[13px] font-semibold text-text leading-none">
                {todayDone ? "Logged" : "Pending"}
              </p>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Today&apos;s Entry</p>
            </div>
          </div>
          <div className="ml-auto">
            <Link
              href="/life/journal"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-accent hover:underline uppercase tracking-wider"
            >
              {todayDone ? "View entry" : "Log today"}
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick actions */}
        <section>
          <h2 className="text-[11px] font-mono text-muted uppercase tracking-widest mb-4">Quick access</h2>
          <div className="flex flex-col gap-2">
            {quickActions.map(({ label, href, icon: Icon, desc }) => (
              <Link
                key={label}
                href={href}
                className="group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-surface border border-border hover:border-accent/40 transition-all"
              >
                <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 shrink-0">
                  <Icon size={14} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-text leading-none">{label}</p>
                  <p className="text-[11px] text-muted mt-0.5">{desc}</p>
                </div>
                <ArrowRight size={13} className="text-muted group-hover:text-accent transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* All spaces */}
        <section>
          <h2 className="text-[11px] font-mono text-muted uppercase tracking-widest mb-4">All spaces</h2>
          <div className="flex flex-col gap-2">
            {spaces.map(({ label, description, icon: Icon, href, adminOnly }) => {
              const accessible = !adminOnly || isAdmin;
              return (
                <Link
                  key={label}
                  href={accessible ? href : "#"}
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                    accessible
                      ? "bg-surface border-border hover:border-accent/40"
                      : "bg-surface/40 border-border/40 opacity-50 pointer-events-none"
                  }`}
                >
                  <div className={`p-2 rounded-lg border shrink-0 ${accessible ? "bg-accent/10 border-accent/20" : "bg-raised border-border/30"}`}>
                    <Icon size={14} className={accessible ? "text-accent" : "text-muted"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-semibold text-text leading-none">{label}</p>
                      {!accessible && <Lock size={10} className="text-muted" />}
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">{description}</p>
                  </div>
                  {accessible && <ArrowRight size={13} className="text-muted group-hover:text-accent transition-colors shrink-0" />}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
