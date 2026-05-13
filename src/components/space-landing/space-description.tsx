import { AlertTriangle, Lightbulb, Target } from "lucide-react";

interface SpaceDescriptionProps {
  problem: string;
  solution: string;
  result: string;
}

export function SpaceDescription({ problem, solution, result }: SpaceDescriptionProps) {
  return (
    <div className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-xl border border-border overflow-hidden">
        {/* Problem */}
        <div className="relative p-5 bg-surface border-b md:border-b-0 md:border-r border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-danger/10">
              <AlertTriangle size={14} className="text-danger" />
            </div>
            <span className="text-caption font-medium uppercase tracking-wider text-danger">Problem</span>
          </div>
          <p className="text-note text-text-secondary leading-relaxed">{problem}</p>
        </div>

        {/* Solution */}
        <div className="relative p-5 bg-surface border-b md:border-b-0 md:border-r border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-accent/10">
              <Lightbulb size={14} className="text-accent" />
            </div>
            <span className="text-caption font-medium uppercase tracking-wider text-accent">Solution</span>
          </div>
          <p className="text-note text-text-secondary leading-relaxed">{solution}</p>
        </div>

        {/* Result */}
        <div className="relative p-5 bg-surface">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-success/10">
              <Target size={14} className="text-success" />
            </div>
            <span className="text-caption font-medium uppercase tracking-wider text-success">Result</span>
          </div>
          <p className="text-note text-text-secondary leading-relaxed">{result}</p>
        </div>
      </div>
    </div>
  );
}
