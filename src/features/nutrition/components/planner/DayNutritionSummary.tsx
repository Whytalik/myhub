"use client"

interface NutritionData {
  actual: number
  target: number
  unit: string
  label: string
  color?: string
}

interface DayNutritionSummaryProps {
  personName: string
  data: {
    kcal: NutritionData
    protein: NutritionData
    fat: NutritionData
    carbs: NutritionData
    fiber: NutritionData
  }
  warnings?: string[]
}

export function DayNutritionSummary({ personName, data, warnings }: DayNutritionSummaryProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">{personName}</h3>
        {warnings && warnings.length > 0 && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
            ⚠️ {warnings.length} warnings
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {Object.entries(data).map(([key, item]) => {
          const percentage = Math.min((item.actual / (item.target || 1)) * 100, 100)
          const isOver = item.actual > item.target * 1.1
          const isUnder = item.actual < item.target * 0.9

          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{item.label}</span>
                <span className={isOver ? "text-red-500" : isUnder ? "text-yellow-500" : "text-green-500"}>
                  {item.actual.toFixed(0)} / {item.target.toFixed(0)} {item.unit}
                </span>
              </div>
              <div className="h-1.5 bg-raised rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : isUnder ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {warnings && warnings.length > 0 && (
        <ul className="text-[10px] text-muted-foreground list-disc pl-4">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
