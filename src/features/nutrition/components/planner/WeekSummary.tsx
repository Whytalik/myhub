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
  repeatedDishes: { dishName: string; count: number; days: string[] }[]
}

interface WeekSummaryProps {
  summary: { persons: PersonSummary[] }
}

export function WeekSummary({ summary }: WeekSummaryProps) {
  const persons = summary.persons
  return (
    <div className="space-y-6">
      <div className="border rounded-lg bg-card">
        <div className="p-6 border-b">
          <h3 className="text-base font-semibold">Weekly Averages</h3>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">Person</th>
                <th className="text-left py-2 px-3 font-medium">Calories</th>
                <th className="text-left py-2 px-3 font-medium">Protein</th>
                <th className="text-left py-2 px-3 font-medium">Fat</th>
                <th className="text-left py-2 px-3 font-medium">Carbs</th>
                <th className="text-left py-2 px-3 font-medium">Fiber</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((p) => (
                <tr key={p.personId} className="border-b last:border-0">
                  <td className="py-2 px-3 font-medium">{p.personName}</td>
                  <td className="py-2 px-3">
                    <div className="font-semibold">{p.avgKcalPerDay.toFixed(0)}</div>
                    <div className="text-caption text-muted-foreground">Target: {p.targetKcal}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div>{p.avgProtein.toFixed(1)}g</div>
                    <div className="text-caption text-muted-foreground">Target: {p.targetProtein}g</div>
                  </td>
                  <td className="py-2 px-3">
                    <div>{p.avgFat.toFixed(1)}g</div>
                    <div className="text-caption text-muted-foreground">Target: {p.targetFat}g</div>
                  </td>
                  <td className="py-2 px-3">
                    <div>{p.avgCarbs.toFixed(1)}g</div>
                    <div className="text-caption text-muted-foreground">Target: {p.targetCarbs}g</div>
                  </td>
                  <td className="py-2 px-3">
                    <div>{p.avgFiber.toFixed(1)}g</div>
                    <div className="text-caption text-muted-foreground">Target: {p.targetFiber}g</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <div className="p-6 border-b">
          <h3 className="text-base font-semibold">Variety Warnings</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {persons.map((p) => (
              <div key={p.personId} className="space-y-2">
                <h4 className="text-base font-medium">{p.personName}</h4>
                {p.repeatedDishes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {p.repeatedDishes.map((d, i) => (
                      <span key={i} className="text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-800">
                        ⚠️ {d.dishName}: {d.count} times
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Excellent variety! No repeats 3+ times.</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
