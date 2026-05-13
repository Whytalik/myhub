import { ArrowRight } from "lucide-react";

interface SpaceDescriptionProps {
  problem: string;
  solution: string;
  result: string;
}

export function SpaceDescription({ problem, solution, result }: SpaceDescriptionProps) {
  return (
    <div className="mb-6 relative rounded-2xl bg-surface/50 border border-border p-6 md:p-8 overflow-hidden backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[64px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
        {/* Problem */}
        <div className="flex-1 flex flex-col p-4 rounded-xl bg-danger/5 border border-danger/10">
          <div className="flex items-center gap-2 text-danger/80 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-danger/60" />
            <span className="text-micro font-medium uppercase tracking-wider">Problem</span>
          </div>
          <p className="text-note text-text-secondary leading-relaxed flex-1">{problem}</p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex shrink-0 items-center justify-center text-text-muted/30">
          <ArrowRight size={18} strokeWidth={1.5} />
        </div>

        {/* Solution */}
        <div className="flex-1 flex flex-col p-4 rounded-xl bg-accent/5 border border-accent/10">
          <div className="flex items-center gap-2 text-accent mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
            <span className="text-micro font-medium uppercase tracking-wider">Solution</span>
          </div>
          <p className="text-note text-text-secondary leading-relaxed flex-1">{solution}</p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex shrink-0 items-center justify-center text-text-muted/30">
          <ArrowRight size={18} strokeWidth={1.5} />
        </div>

        {/* Result */}
        <div className="flex-1 flex flex-col p-4 rounded-xl bg-success/5 border border-success/10">
          <div className="flex items-center gap-2 text-success/80 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success/60" />
            <span className="text-micro font-medium uppercase tracking-wider">Result</span>
          </div>
          <p className="text-note text-text-primary font-medium leading-relaxed flex-1">{result}</p>
        </div>
      </div>
    </div>
  );
}
