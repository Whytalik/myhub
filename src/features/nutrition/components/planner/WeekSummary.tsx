import { MacroSummary } from "./MacroSummary"

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

export function WeekSummary({ summary }: WeekSummaryProps) {
  const persons = summary.persons

  if (persons.length === 0) return null

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="bg-raised/50 px-5 py-3 border-b border-border">
        <h3 className="text-note font-semibold text-text-primary">Week Overview</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-8 divide-x divide-border/50">
          {persons.map((p) => {
            const personMacros = [
              { label: "К", actual: p.avgKcalPerDay, target: p.targetKcal, unit: "" },
              { label: "Б", actual: p.avgProtein, target: p.targetProtein, unit: "g" },
              { label: "Ж", actual: p.avgFat, target: p.targetFat, unit: "g" },
              { label: "В", actual: p.avgCarbs, target: p.targetCarbs, unit: "g" },
              { label: "Кл", actual: p.avgFiber, target: p.targetFiber, unit: "g" },
            ]
            
            return (
              <div key={p.personId} className="pl-4 first:pl-0 min-w-0">
                <MacroSummary 
                  personName={p.personName || "Unknown"}
                  macros={personMacros}
                  repeatedDishes={p.repeatedDishes}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
