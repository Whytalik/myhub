import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, BookHeart, Utensils, Languages, Dumbbell, BookOpen, ShoppingBag, ArrowRight } from "lucide-react";

const spaces = [
  { label: "Life", description: "Habits, journal, tasks & energy", icon: BookHeart },
  { label: "Food", description: "Nutrition, dishes & shopping lists", icon: Utensils },
  { label: "Languages", description: "Vocabulary, immersion & resources", icon: Languages },
  { label: "Fitness", description: "Workouts & progress tracking", icon: Dumbbell },
  { label: "Library", description: "Books, notes & reading lists", icon: BookOpen },
  { label: "Other", description: "Wishlist & miscellaneous tools", icon: ShoppingBag },
];

export default async function LandingPage() {
  const session = await auth().catch(() => null);
  if (session) redirect("/home");

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles size={16} className="text-bg" fill="currentColor" />
          </div>
          <span className="font-heading text-xl text-text">
            My<span className="text-accent">Hub</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] font-mono text-secondary hover:text-text transition-colors uppercase tracking-wider">
            Sign in
          </Link>
          <Link href="/register" className="text-[13px] font-mono bg-accent text-bg px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent/20 uppercase tracking-wider">
            Sign up
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
        <p className="text-[11px] font-mono text-muted uppercase tracking-[0.3em] mb-6">
          Personal Operating System
        </p>
        <h1 className="font-heading text-[clamp(4rem,12vw,9rem)] text-accent leading-none tracking-tight mb-6">
          My Hub
        </h1>
        <p className="text-secondary text-lg max-w-md leading-relaxed mb-10">
          One place to track what matters — your life, habits, food, languages, fitness, and more.
        </p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-accent text-bg font-bold px-8 py-3.5 rounded-2xl text-[15px] hover:opacity-90 transition-all shadow-xl shadow-accent/25 active:scale-[0.98]">
          Get started
          <ArrowRight size={18} />
        </Link>

        <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl w-full">
          {spaces.map(({ label, description, icon: Icon }) => (
            <div key={label} className="flex items-start gap-3 p-4 rounded-2xl bg-surface border border-border/50 text-left">
              <div className="mt-0.5 p-2 rounded-lg bg-accent/10 border border-accent/15 shrink-0">
                <Icon size={15} className="text-accent" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-text leading-none mb-1">{label}</p>
                <p className="text-[11px] text-muted leading-snug">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-[11px] font-mono text-muted/50 uppercase tracking-widest">
          Life system available on signup · Other systems for admin accounts
        </p>
      </main>
    </div>
  );
}
