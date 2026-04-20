import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookHeart, Utensils, Languages, Dumbbell,
  BookOpen, ShoppingBag, ArrowRight, Lock,
  Flame, BookText, Zap, TrendingUp,
} from "lucide-react";
import { getTodayEntry, getDailyStats } from "@/features/life/services/journal-service";
import { format } from "date-fns";

const spaces = [
  { label: "Life System", description: "Journal, habits & tasks", icon: BookHeart, href: "/life", adminOnly: false },
  { label: "Food System", description: "Nutrition & meal planning", icon: Utensils, href: "/food", adminOnly: true },
  { label: "Language System", description: "Vocabulary & immersion", icon: Languages, href: "/languages", adminOnly: true },
  { label: "Fitness System", description: "Workouts & progress", icon: Dumbbell, href: "/fitness", adminOnly: true },
  { label: "Trading System", description: "Markets & portfolio", icon: TrendingUp, href: "/trading", adminOnly: true },
  { label: "Library System", description: "Books & reading lists", icon: BookOpen, href: "/library", adminOnly: true },
  { label: "Misc / Other", description: "Wishlist & tools", icon: ShoppingBag, href: "/other", adminOnly: true },
];


export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";
  const personId = session.user.personId;
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
    <div className="px-6 py-8 md:px-14 md:py-12 w-full">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[11px] font-mono text-muted uppercase tracking-[0.25em] mb-1">{today}</p>
        <p className="text-[11px] font-mono text-accent uppercase tracking-[0.2em] mb-3">{greeting}</p>
        <h1 className="font-heading text-5xl md:text-7xl text-text leading-none tracking-tight">{name}</h1>
        <div className="h-0.5 w-12 bg-accent mt-4" />
      </div>

      {/* Stats strip */}
      {personId && (
        <div className="flex flex-wrap md:flex-nowrap items-center gap-6 bg-surface border border-border rounded-2xl px-6 py-4 mb-8">
          <div className="flex items-center gap-2.5">
            <Flame size={15} className={streak > 0 ? "text-accent" : "text-muted"} />
            <div>
              <p className="text-lg font-heading text-text leading-none">{streak}</p>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Streak</p>
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-border" />
          <div className="flex items-center gap-2.5">
            <Zap size={15} className="text-muted" />
            <div>
              <p className="text-lg font-heading text-text leading-none">
                {avgEnergy !== null ? avgEnergy.toFixed(1) : "—"}
              </p>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Avg Energy</p>
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-border" />
          <div className="flex items-center gap-2.5">
            <BookText size={15} className={todayDone ? "text-accent" : "text-muted"} />
            <div>
              <p className="text-[13px] font-semibold text-text leading-none">
                {todayDone ? "Logged" : "Pending"}
              </p>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Today&apos;s Entry</p>
            </div>
          </div>
          <div className="w-full md:w-auto md:ml-auto pt-2 md:pt-0 border-t md:border-none border-border/40">
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

      {/* Spaces grid */}
      <div>
        <h2 className="text-[11px] font-mono text-muted uppercase tracking-widest mb-4">Spaces</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {spaces.map(({ label, description, icon: Icon, href, adminOnly }) => {
            const accessible = !adminOnly || isAdmin;
            return (
              <Link
                key={label}
                href={accessible ? href : "#"}
                className={`group flex flex-col items-center justify-center gap-3 aspect-square rounded-2xl border transition-all ${
                  accessible
                    ? "bg-surface border-border hover:border-accent/50 hover:bg-surface/80 hover:shadow-lg hover:shadow-accent/5"
                    : "bg-surface/30 border-border/30 opacity-40 pointer-events-none"
                }`}
              >
                <div className={`p-3 rounded-xl border ${accessible ? "bg-accent/10 border-accent/20 group-hover:bg-accent/20 transition-colors" : "bg-raised border-border/30"}`}>
                  <Icon size={22} className={accessible ? "text-accent" : "text-muted"} />
                </div>
                <div className="text-center px-2">
                  <p className="text-[12px] font-semibold text-text leading-none mb-1">{label}</p>
                  <p className="text-[10px] text-muted leading-snug">{description}</p>
                </div>
                {!accessible && <Lock size={10} className="text-muted absolute" />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
