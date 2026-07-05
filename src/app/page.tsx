import Link from "next/link";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/actions/button";
import { DOMAINS } from "@/lib/spaces/domains";

function getSpaceAccent(label: string) {
  const clean = label.toLowerCase();
  if (clean.includes("operation") || clean.includes("life")) {
    return { text: "text-accent-life", bg: "bg-accent-life/10", border: "border-accent-life/20" };
  }
  if (clean.includes("nutrition")) {
    return {
      text: "text-accent-nutrition",
      bg: "bg-accent-nutrition/10",
      border: "border-accent-nutrition/20",
    };
  }
  if (clean.includes("training")) {
    return {
      text: "text-accent-training",
      bg: "bg-accent-training/10",
      border: "border-accent-training/20",
    };
  }
  return { text: "text-accent", bg: "bg-accent/10", border: "border-accent/20" };
}

async function HomeContent() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="w-full max-w-[380px] flex flex-col items-center gap-6 text-center">
        <p className="text-sm text-zinc-400">Особистий простір для життя, звичок і харчування.</p>
        <Link href="/login" className="w-full">
          <Button className="w-full shadow-md">Увійти</Button>
        </Link>
      </div>
    );
  }

  const spaces = DOMAINS.flatMap((domain) => domain.spaces);

  return (
    <div className="w-full flex flex-col gap-6">
      <p className="text-sm text-zinc-400 text-center">Швидкий доступ</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces.map((space) => {
          const accent = getSpaceAccent(space.label);
          const SpaceIcon = space.icon;

          return (
            <div
              key={space.href}
              className={`glass-card p-4 flex flex-col gap-3 border ${accent.border}`}
            >
              <Link href={space.href} className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${accent.bg} ${accent.text}`}
                >
                  <SpaceIcon size={20} />
                </div>
                <span className="text-panel-title text-left">{space.label}</span>
              </Link>
              <div className="flex flex-col gap-0.5">
                {space.pages.map((page) => {
                  const PageIcon = page.icon;
                  return (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-zinc-100 transition-colors"
                    >
                      <PageIcon size={14} className="text-zinc-500 shrink-0" />
                      {page.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RootPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas relative overflow-hidden py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/10 opacity-30 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/5 opacity-20 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center gap-8 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
            <Sparkles size={16} className="text-accent" />
          </div>
          <h1 className="text-xl font-bold text-zinc-50 tracking-tight">
            My<span className="text-accent">Hub</span>
          </h1>
        </div>

        <Suspense fallback={<div className="w-full max-w-[380px] h-10" />}>
          <HomeContent />
        </Suspense>
      </div>
    </div>
  );
}
