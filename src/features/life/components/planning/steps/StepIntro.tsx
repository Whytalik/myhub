import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/actions/button";

export function StepIntro({ setStep }: { setStep: (step: number) => void }) {
  return (
    <div className="glass-card p-6 md:p-8 flex flex-col gap-6 items-center text-center bg-white/[0.01] max-w-3xl mx-auto w-full">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center animate-float">
        <Sparkles size={32} />
      </div>

      <div className="flex flex-col gap-2 max-w-lg">
        <h2 className="text-2xl font-bold text-zinc-100 font-mono">Kaizen Planning Cycle</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Do not try to plan the chaos in your head. Let&apos;s declutter your mind, sift thoughts
          through the Prime Filter, and break them down into atoms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full text-left mt-4">
        <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
          <span className="text-xl">✍️</span>
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
              1. Brain Dump
            </h4>
            <p className="text-[11px] text-zinc-500 mt-1">
              Write down everything on your mind without analysis or limits.
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
          <span className="text-xl">🔍</span>
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
              2. Prime Filter
            </h4>
            <p className="text-[11px] text-zinc-500 mt-1">
              Separate true desires from obligations. Discard noise.
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
          <span className="text-xl">🔬</span>
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
              3. Decomposition
            </h4>
            <p className="text-[11px] text-zinc-500 mt-1">
              Convert thoughts into Projects or Standalone Tasks in your backlog.
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
          <span className="text-xl">🎯</span>
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
              4. Sprint Goals
            </h4>
            <p className="text-[11px] text-zinc-500 mt-1">
              Define sprint objectives and pull projects from backlog.
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
          <span className="text-xl">🛠️</span>
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
              5. Deconstruction
            </h4>
            <p className="text-[11px] text-zinc-500 mt-1">
              Break down sprint projects into simple actionable task atoms.
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
          <span className="text-xl">📅</span>
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
              6. Distribution
            </h4>
            <p className="text-[11px] text-zinc-500 mt-1">
              Distribute task atoms across the weeks and days of your sprint.
            </p>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={() => setStep(1)}
        className="mt-4 px-8 py-2.5 font-semibold text-sm flex items-center gap-2"
      >
        Start Planning <ArrowRight size={16} />
      </Button>
    </div>
  );
}
