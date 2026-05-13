interface SpaceDescriptionProps {
  problem: string;
  solution: string;
  result: string;
}

export function SpaceDescription({ problem, solution, result }: SpaceDescriptionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="p-5 rounded-xl bg-surface border border-border">
        <h4 className="text-caption font-medium uppercase tracking-wider text-danger mb-2">Problem</h4>
        <p className="text-note text-text-secondary leading-relaxed">{problem}</p>
      </div>
      <div className="p-5 rounded-xl bg-surface border border-border">
        <h4 className="text-caption font-medium uppercase tracking-wider text-accent mb-2">Solution</h4>
        <p className="text-note text-text-secondary leading-relaxed">{solution}</p>
      </div>
      <div className="p-5 rounded-xl bg-surface border border-border">
        <h4 className="text-caption font-medium uppercase tracking-wider text-success mb-2">Result</h4>
        <p className="text-note text-text-secondary leading-relaxed">{result}</p>
      </div>
    </div>
  );
}
