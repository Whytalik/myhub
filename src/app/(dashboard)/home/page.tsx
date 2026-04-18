import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookHeart, Utensils, Languages, Dumbbell, BookOpen, ShoppingBag, ArrowRight, Lock } from "lucide-react";

const spaces = [
  { label: "Life Space", description: "Journal, habits & tasks", icon: BookHeart, href: "/life/journal", adminOnly: false },
  { label: "Food System", description: "Nutrition & meal planning", icon: Utensils, href: "/food", adminOnly: true },
  { label: "Languages", description: "Vocabulary & immersion", icon: Languages, href: "/languages", adminOnly: true },
  { label: "Fitness", description: "Workouts & progress", icon: Dumbbell, href: "/fitness", adminOnly: true },
  { label: "Library", description: "Books & reading lists", icon: BookOpen, href: "/library", adminOnly: true },
  { label: "Other", description: "Wishlist & tools", icon: ShoppingBag, href: "/other", adminOnly: true },
];

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = (session.user as any)?.role === "ADMIN";
  const name = session.user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-14 py-12 max-w-3xl">
      <p className="text-[11px] font-mono text-muted uppercase tracking-[0.25em] mb-2">
        {greeting}
      </p>
      <h1 className="font-heading text-6xl text-text leading-none tracking-tight mb-2">
        {name}
      </h1>
      <div className="h-0.5 w-12 bg-accent mb-10" />

      <p className="text-secondary text-sm mb-8 leading-relaxed">
        Your personal hub is ready. Pick a space to continue.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {spaces.map(({ label, description, icon: Icon, href, adminOnly }) => {
          const accessible = !adminOnly || isAdmin;
          return (
            <Link
              key={label}
              href={accessible ? href : "#"}
              className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                accessible
                  ? "border-border bg-surface hover:border-accent/40 hover:shadow-sm"
                  : "border-border/40 bg-surface/40 opacity-50 pointer-events-none"
              }`}
            >
              <div className={`p-2.5 rounded-xl border shrink-0 ${accessible ? "bg-accent/10 border-accent/20" : "bg-raised border-border/30"}`}>
                <Icon size={18} className={accessible ? "text-accent" : "text-muted"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold text-text">{label}</p>
                  {!accessible && <Lock size={10} className="text-muted" />}
                </div>
                <p className="text-[11px] text-muted">{description}</p>
              </div>
              {accessible && <ArrowRight size={14} className="text-muted group-hover:text-accent transition-colors shrink-0" />}
            </Link>
          );
        })}
      </div>

      {!isAdmin && (
        <p className="mt-6 text-[11px] font-mono text-muted/50 uppercase tracking-wider">
          Other spaces available for admin accounts
        </p>
      )}
    </div>
  );
}
