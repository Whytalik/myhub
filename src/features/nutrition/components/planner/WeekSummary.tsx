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

function MacroBar({ label, actual, target, unit, color }: { label: string; actual: number; target: number; unit: string; color: string }) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0
  const isOver = actual > target * 1.1
  const isUnder = actual < target * 0.9

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-note font-medium text-text-secondary">{label}</span>
        <span className="text-note font-mono text-text-primary">
          {actual.toFixed(1)}{unit} <span className="text-text-muted">/ {target.toFixed(1)}{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-bg rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-warning" : isUnder ? "bg-text-muted" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function WeekSummary({ summary }: WeekSummaryProps) {
  const persons = summary.persons

  if (persons.length === 0) return null

  return (
    <div className="space-y-4">
      {persons.map((p) => (
        <div key={p.personId} className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <span className="text-accent text-note font-bold">{(p.personName || "U").charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h3 className="text-body font-semibold text-text-primary">{p.personName || "Unknown"}</h3>
              <p className="text-note font-mono text-text-muted">Daily average vs target</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <MacroBar label="Calories" actual={p.avgKcalPerDay} target={p.targetKcal} unit="" color="bg-accent" />
              <MacroBar label="Protein" actual={p.avgProtein} target={p.targetProtein} unit="g" color="bg-blue-500" />
            </div>
            <div className="space-y-4">
              <MacroBar label="Fat" actual={p.avgFat} target={p.targetFat} unit="g" color="bg-amber-500" />
              <MacroBar label="Carbs" actual={p.avgCarbs} target={p.targetCarbs} unit="g" color="bg-purple-500" />
              <MacroBar label="Fiber" actual={p.avgFiber} target={p.targetFiber} unit="g" color="bg-green-500" />
            </div>
          </div>

          {p.repeatedDishes.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-caption font-mono text-text-muted uppercase tracking-wider mb-2">Repeated Dishes</p>
              <div className="flex flex-wrap gap-2">
                {p.repeatedDishes.map((d, i) => (
                  <span key={i} className="text-micro font-mono bg-warning/10 text-warning px-2 py-1 rounded-lg">
                    {d.dishName}: {d.count}×
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
