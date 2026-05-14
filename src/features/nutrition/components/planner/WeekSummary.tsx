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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {persons.map((p) => {
        const personMacros = [
          { label: "К", actual: p.avgKcalPerDay, target: p.targetKcal, unit: "" },
          { label: "Б", actual: p.avgProtein, target: p.targetProtein, unit: "g" },
          { label: "Ж", actual: p.avgFat, target: p.targetFat, unit: "g" },
          { label: "В", actual: p.avgCarbs, target: p.targetCarbs, unit: "g" },
          { label: "Кл", actual: p.avgFiber, target: p.targetFiber, unit: "g" },
        ]
        
        return (
          <MacroSummary 
            key={p.personId}
            title="Week Overview"
            personName={p.personName || "Unknown"}
            macros={personMacros}
            repeatedDishes={p.repeatedDishes}
          />
        )
      })}
    </div>
  )
}
