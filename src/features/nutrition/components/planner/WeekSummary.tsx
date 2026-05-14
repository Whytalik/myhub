interface PersonSummary {
  personId: string
  personName: string | null
  avgKcalPerDay: number
  avgProtein: number
  avgFat: number
  avgCarbs: number
  avgFiber: number
  targetKcal: number
  targetProtein: number
  targetFat: number
  targetCarbs: number
  targetFiber: number
  repeatedDishes: { dishName: string; count: number; days: number[] }[]
}

interface WeekSummaryProps {
  summary: { persons: PersonSummary[] }
}

function MiniBar({ label, actual, target, unit, color }: { label: string; actual: number; target: number; unit: string; color: string }) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-micro font-mono text-text-muted w-3 shrink-0">{label}</span>
      <div className="flex-1 h-0.5 bg-raised rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-micro font-mono text-text-secondary w-16 text-right shrink-0">
        {actual.toFixed(0)}{unit}<span className="text-text-muted">/{target.toFixed(0)}{unit}</span>
      </span>
    </div>
  )
}

export function WeekSummary({ summary }: WeekSummaryProps) {
  const persons = summary.persons

  if (persons.length === 0) return null

  const macros = [
    { label: "К", actual: persons[0]?.avgKcalPerDay ?? 0, target: persons[0]?.targetKcal ?? 0, unit: "", color: "bg-accent" },
    { label: "Б", actual: persons[0]?.avgProtein ?? 0, target: persons[0]?.targetProtein ?? 0, unit: "g", color: "bg-blue-500" },
    { label: "Ж", actual: persons[0]?.avgFat ?? 0, target: persons[0]?.targetFat ?? 0, unit: "g", color: "bg-amber-500" },
    { label: "В", actual: persons[0]?.avgCarbs ?? 0, target: persons[0]?.targetCarbs ?? 0, unit: "g", color: "bg-purple-500" },
    { label: "Кл", actual: persons[0]?.avgFiber ?? 0, target: persons[0]?.targetFiber ?? 0, unit: "g", color: "bg-green-500" },
  ]

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="bg-raised/50 px-5 py-3 border-b border-border">
        <h3 className="text-note font-semibold text-text-primary">Week Overview</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-6 divide-x divide-border/50">
          {persons.map((p) => {
            const personMacros = [
              { label: "К", actual: p.avgKcalPerDay, target: p.targetKcal, unit: "", color: "bg-accent" },
              { label: "Б", actual: p.avgProtein, target: p.targetProtein, unit: "g", color: "bg-blue-500" },
              { label: "Ж", actual: p.avgFat, target: p.targetFat, unit: "g", color: "bg-amber-500" },
              { label: "В", actual: p.avgCarbs, target: p.targetCarbs, unit: "g", color: "bg-purple-500" },
              { label: "Кл", actual: p.avgFiber, target: p.targetFiber, unit: "g", color: "bg-green-500" },
            ]
            return (
              <div key={p.personId} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent text-caption font-bold">{(p.personName || "U").charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-note font-semibold text-text-primary">{p.personName || "Unknown"}</span>
                </div>
                <div className="space-y-1">
                  {personMacros.map((m) => (
                    <MiniBar key={m.label} label={m.label} actual={m.actual} target={m.target} unit={m.unit} color={m.color} />
                  ))}
                </div>
                {p.repeatedDishes.length > 0 && (
                  <div className="pt-2 border-t border-border/30">
                    <div className="flex flex-wrap gap-1">
                      {p.repeatedDishes.map((d, i) => (
                        <span key={i} className="text-micro font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">
                          {d.dishName}: {d.count}×
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
