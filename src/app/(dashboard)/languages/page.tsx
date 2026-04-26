import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LanguageService } from "@/features/languages/services/language-service";
import { LanguageRadarChart } from "@/features/languages/components/LanguageRadarChart";
import { SpaceLanding, SpaceError, QuickActions } from "@/components/space-landing";
import { Plus, Languages, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Language Space",
};

async function fetchLanguageData(userId: string) {
  const userLanguages = await LanguageService.getUserLanguages(userId);
  const languagesWithStats = await Promise.all(
    userLanguages.map(async (ul) => {
      const stats = await LanguageService.getLanguageStats(userId, ul.id);
      return { ...ul, stats };
    })
  );
  return { userLanguages, languagesWithStats };
}

export default async function LanguagesPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  let langData: Awaited<ReturnType<typeof fetchLanguageData>> | null = null;
  let error: Error | null = null;

  try {
    langData = await fetchLanguageData(userId);
  } catch (e) {
    console.error("[LanguagesSpace] Failed to load:", e);
    error = e instanceof Error ? e : new Error(String(e));
  }

  if (error) {
    return (
      <SpaceLanding
        header={{
          label: "language space",
          title: "Language Space",
          description: "Precision environment for linguistic neural growth. Automate lexical retention, track immersion density, and visualize mastery balance across five core spheres.",
        }}
      >
        <SpaceError
          message="Failed to load space data. Please try refreshing the page later."
          developerError={error.message}
        />
      </SpaceLanding>
    );
  }

  const d = langData!;

  return (
    <SpaceLanding
      header={{
        label: "language space",
        title: "Language Space",
        description: "Precision environment for linguistic neural growth. Automate lexical retention, track immersion density, and visualize mastery balance across five core spheres.",
      }}
      intelligence={{
        items: [
          { label: "Cognitive Engine", value: "SM-2 Spaced Repetition" },
          { label: "Input Logic", value: "Comprehensible i+1" },
          { label: "Acquisition Model", value: "Sphere Balancing" },
          { label: "Tracking Unit", value: "Immersion Density" },
        ],
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">Active Environments</h4>
          <span className="text-[10px] font-mono text-muted uppercase bg-surface px-2 py-0.5 rounded border border-border/40">
            {d.userLanguages.length} Active
          </span>
        </div>
      </div>

      {d.userLanguages.length === 0 ? (
        <div className="bg-surface/30 border border-dashed border-border/40 p-24 rounded-2xl text-center mb-20">
          <Languages size={48} className="mx-auto text-muted/20 mb-6" />
          <h3 className="text-2xl font-black uppercase tracking-tight text-muted mb-8">Zero Active Neural Nodes</h3>
          <Link
            href="/languages/add"
            className="bg-accent text-bg px-10 py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] hover:scale-105 transition-all inline-block"
          >
            Initialize Space
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {d.languagesWithStats.map((ul) => (
            <Link
              key={ul.id}
              href={`/languages/${ul.id}`}
              className="group relative bg-surface border border-border p-8 rounded-xl hover:bg-raised transition-all duration-300 hover:border-accent/40 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <span className="font-heading text-8xl uppercase leading-none tracking-tighter -mr-8">
                  {ul.language.code}
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{ul.language.icon}</span>
                      <h3 className="font-heading text-5xl text-text uppercase leading-none tracking-tight group-hover:text-accent transition-colors">
                        {ul.language.name}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
                      {ul.level} · {ul.totalXp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="shrink-0">
                    <LanguageRadarChart stats={ul.stats} size={120} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-muted hover:text-text transition-colors">
                  <span>Enter Space</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <QuickActions
        actions={[
          {
            label: "Map New Language",
            href: "/languages/add",
            icon: Plus,
            variant: "primary",
          },
          ...(d.userLanguages.length > 0
            ? [
                {
                  label: "Log Immersion",
                  href: `/languages/${d.userLanguages[0].id}`,
                  icon: Activity,
                  variant: "secondary",
                } as const,
              ]
            : []),
        ]}
      />
    </SpaceLanding>
  );
}
