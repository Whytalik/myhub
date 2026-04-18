import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { prisma } from "@/lib/prisma";
import { ImmersionTimer } from "@/features/languages/components/ImmersionTimer";
import { Clock, Headphones, Book, Mic, PenTool, Library, History } from "lucide-react";
import { LanguageSphere } from "@/app/generated/prisma";

export const metadata: Metadata = {
  title: "Immersion Log",
};

export default async function JournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const userLanguage = await prisma.userLanguage.findUnique({
    where: { id },
    include: { language: true }
  });

  if (!userLanguage) return <div>Not found</div>;

  const logs = await prisma.immersionLog.findMany({
    where: { userLanguageId: id },
    orderBy: { date: "desc" }
  });

  const sphereIcons: Record<LanguageSphere, any> = {
    [LanguageSphere.VOCABULARY]: Library,
    [LanguageSphere.LISTENING]: Headphones,
    [LanguageSphere.READING]: Book,
    [LanguageSphere.SPEAKING]: Mic,
    [LanguageSphere.WRITING]: PenTool,
  };

  return (
    <div className="px-14 py-10">
      <Breadcrumb items={[
        { label: "languages", href: "/languages" },
        { label: userLanguage.language.name.toLowerCase(), href: `/languages/${id}` },
        { label: "immersion log" }
      ]} />
      
      <div className="flex justify-between items-start mb-12">
        <div className="flex flex-col">
           <div className="flex items-center gap-4 mb-2">
             <span className="text-4xl">{userLanguage.language.icon}</span>
             <Heading title="Immersion Log" />
           </div>
           <p className="text-secondary max-w-2xl leading-relaxed">
             Track every minute of your language exposure. The more you immerse, 
             the faster your mastery grows.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border rounded-[40px] overflow-hidden shadow-sm">
             <div className="p-8 border-b border-border bg-bg/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-accent/10 text-accent">
                    <History size={18} />
                  </div>
                  <h4 className="font-heading text-xl uppercase tracking-tight">Recent Sessions</h4>
                </div>
             </div>

             <div className="divide-y divide-border/40">
                {logs.length === 0 ? (
                  <div className="p-20 text-center text-secondary italic">
                    No sessions logged yet. Use the timer to start!
                  </div>
                ) : (
                  logs.map((log) => {
                    const Icon = sphereIcons[log.sphere];
                    return (
                      <div key={log.id} className="flex items-center justify-between p-6 px-8 hover:bg-raised transition-all">
                        <div className="flex items-center gap-6">
                          <div className="p-3 rounded-2xl bg-bg text-accent border border-border/50">
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="text-lg font-bold uppercase tracking-tight leading-none mb-2">
                              {log.sphere} session
                            </p>
                            <p className="text-xs text-muted font-mono leading-none">
                              {new Date(log.date).toLocaleString()} • {log.note || "Productive session"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-2xl font-heading text-accent">
                          <Clock size={20} className="text-muted" />
                          <span>{log.duration}m</span>
                        </div>
                      </div>
                    );
                  })
                )}
             </div>
          </div>
        </div>

        <div>
          <ImmersionTimer userLanguageId={id} />
        </div>
      </div>
    </div>
  );
}
