import type { Metadata } from "next";
import { SpaceLanding } from "@/components/space-landing";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Trading Space",
};

export default function TradingPage() {
  return (
    <SpaceLanding
      header={{
        label: "trading space",
        title: "Trading Space",
        description: "High-performance environment for market execution and portfolio management. Analyze market structures, track trade performance, and optimize execution strategies.",
      }}
    >
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
    </SpaceLanding>
  );
}
