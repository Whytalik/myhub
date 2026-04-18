import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookHeart, Utensils, Languages, Dumbbell, BookOpen, ShoppingBag, Lock } from "lucide-react";

const spaces = [
  {
    id: "life",
    label: "Life Space",
    description: "Journal, habits, tasks, sleep & energy tracking.",
    icon: BookHeart,
    href: "/life/journal",
    available: true,
  },
  {
    id: "food",
    label: "Food System",
    description: "Nutrition planning, dishes, shopping lists.",
    icon: Utensils,
    href: "/food",
    available: false,
  },
  {
    id: "languages",
    label: "Languages",
    description: "Vocabulary, immersion timer, resources.",
    icon: Languages,
    href: "/languages",
    available: false,
  },
  {
    id: "fitness",
    label: "Fitness",
    description: "Workouts, exercises, progress tracking.",
    icon: Dumbbell,
    href: "/fitness",
    available: false,
  },
  {
    id: "library",
    label: "Library",
    description: "Books, notes, reading lists.",
    icon: BookOpen,
    href: "/library",
    available: false,
  },
  {
    id: "other",
    label: "Other",
    description: "Wishlist and miscellaneous tools.",
    icon: ShoppingBag,
    href: "/other",
    available: false,
  },
];

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = (session.user as any)?.role === "ADMIN";

  return (
    <main className="flex-1 bg-bg min-h-screen px-14 py-16">
      <div className="max-w-3xl">
        <p className="text-[11px] font-mono text-muted uppercase tracking-[0.2em] mb-3">
          welcome back, {session.user?.name}
        </p>
        <h1 className="font-heading text-8xl text-accent leading-none tracking-tight">
          My Hub
        </h1>
        <div className="mt-4 h-0.5 w-16 bg-accent mb-8" />

        <p className="text-secondary text-base leading-relaxed max-w-xl mb-12">
          A personal operating system for tracking what matters — life habits,
          nutrition, languages, fitness, and more. All spaces in one place.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {spaces.map(({ id, label, description, icon: Icon, href, available }) => {
            const accessible = available || isAdmin;
            return (
              <Link
                key={id}
                href={accessible ? href : "#"}
                className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all
                  ${accessible
                    ? "border-border bg-surface hover:border-accent/40 hover:shadow-sm cursor-pointer"
                    : "border-border/40 bg-surface/40 opacity-50 cursor-not-allowed pointer-events-none"
                  }`}
              >
                <div className={`mt-0.5 p-2.5 rounded-xl border ${accessible ? "bg-accent/10 border-accent/20" : "bg-raised border-border/30"}`}>
                  <Icon size={18} className={accessible ? "text-accent" : "text-muted"} />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-text">{label}</span>
                    {!accessible && <Lock size={11} className="text-muted flex-shrink-0" />}
                  </div>
                  <p className="text-[12px] text-muted leading-snug">{description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {!isAdmin && (
          <p className="mt-8 text-[11px] font-mono text-muted/60 uppercase tracking-wider">
            Other spaces are available for admin accounts
          </p>
        )}
      </div>
    </main>
  );
}
