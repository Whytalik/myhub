import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { TrendingUp, BarChart3, PieChart, History, Target, Zap, Shield, Activity } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Trading Space",
};

export default async function TradingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workflow = [
    {
      step: "01",
      name: "Analysis",
      desc: "Market structure evaluation. Identify key liquidity zones and trend alignment.",
      icon: Activity,
    },
    {
      step: "02",
      name: "Execution",
      desc: "Precision entry based on established edge. Risk management protocol activation.",
      icon: Zap,
    },
    {
      step: "03",
      name: "Management",
      desc: "Active trade monitoring and adjustment. Trailing stops and partial profit taking.",
      icon: Shield,
    },
    {
      step: "04",
      name: "Review",
      desc: "Post-trade journaling and performance metrics analysis for edge refinement.",
      icon: History,
    },
  ];

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "trading space" }]} />

      <div className="flex flex-col mb-16">
        <Heading title="Trading Space" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          High-performance environment for market execution and portfolio management. 
          Analyze market structures, track trade performance, and optimize execution strategies.
        </p>
      </div>

      {/* Operational Workflow Section */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">Execution Workflow</h4>
          <div className="h-px flex-1 bg-border/30" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {workflow.map((w, i) => (
            <div key={w.step} className="relative group">
              <div className="flex flex-col gap-3">
                <span className="text-4xl font-heading text-border group-hover:text-accent/20 transition-colors duration-500">
                  {w.step}
                </span>
                <div className="flex items-center gap-2">
                  <w.icon size={14} className="text-accent/60" />
                  <h5 className="font-mono text-[11px] text-text uppercase tracking-widest">{w.name}</h5>
                </div>
                <p className="text-secondary text-xs leading-relaxed pr-4">
                  {w.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status Grid */}
      <div className="mb-20">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">Space Modules</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border p-8 rounded-xl hover:bg-raised transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <BarChart3 size={24} />
              </div>
              <h3 className="font-heading text-3xl uppercase tracking-tight group-hover:text-accent transition-colors">Journal</h3>
            </div>
            <p className="text-secondary text-sm mb-8">Detailed log of every execution. Statistical analysis of trade performance and psychological state.</p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase tracking-widest">
              <span>Status: Initializing</span>
            </div>
          </div>

          <div className="bg-surface border border-border p-8 rounded-xl hover:bg-raised transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <PieChart size={24} />
              </div>
              <h3 className="font-heading text-3xl uppercase tracking-tight group-hover:text-accent transition-colors">Portfolio</h3>
            </div>
            <p className="text-secondary text-sm mb-8">Asset allocation and risk exposure overview. Real-time balance and performance tracking.</p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase tracking-widest">
              <span>Status: Initializing</span>
            </div>
          </div>

          <div className="bg-surface border border-border p-8 rounded-xl hover:bg-raised transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <Target size={24} />
              </div>
              <h3 className="font-heading text-3xl uppercase tracking-tight group-hover:text-accent transition-colors">Strategies</h3>
            </div>
            <p className="text-secondary text-sm mb-8">Playbook of verified setups. Edge verification and backtesting performance database.</p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase tracking-widest">
              <span>Status: Initializing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-surface/30 border border-dashed border-border/40 p-24 rounded-2xl text-center">
        <TrendingUp size={48} className="mx-auto text-muted/20 mb-6" />
        <h3 className="text-2xl font-black uppercase tracking-tight text-muted mb-4">Trading Space Offline</h3>
        <p className="text-secondary text-sm max-w-md mx-auto mb-8">
          The high-frequency execution engine and market analysis modules are currently under development.
        </p>
        <div className="bg-accent/10 border border-accent/20 px-6 py-3 rounded-lg inline-flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">Awaiting Market Integration</span>
        </div>
      </div>
    </div>
  );
}
