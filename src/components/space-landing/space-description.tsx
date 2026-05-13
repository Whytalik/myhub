import { AlertTriangle, Lightbulb, Target, ArrowRight } from "lucide-react";

interface SpaceDescriptionProps {
  problem: string;
  solution: string;
  result: string;
}

export function SpaceDescription({ problem, solution, result }: SpaceDescriptionProps) {
  const steps = [
    { label: "Problem", text: problem, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { label: "Solution", text: solution, icon: Lightbulb, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
    { label: "Result", text: result, icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="mb-12">
      <div className="relative flex flex-col md:flex-row gap-6 md:gap-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.label} className="relative flex-1 group">
              {/* Connector Line (Desktop) */}
              {!isLast && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-border -translate-y-1/2 z-10">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-border" />
                </div>
              )}

              <div className={`relative p-6 rounded-xl border bg-surface ${step.border} hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg ${step.bg} shrink-0`}>
                    <Icon size={20} className={step.color} />
                  </div>
                  <div>
                    <h4 className={`text-caption font-bold uppercase tracking-wider ${step.color} mb-2`}>
                      {step.label}
                    </h4>
                    <p className="text-note text-text-secondary leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
