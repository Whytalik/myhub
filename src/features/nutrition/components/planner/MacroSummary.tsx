import React from "react"

interface MacroData {
  label: string
  actual: number
  target: number
  unit: string
}

interface MacroSummaryProps {
  personName: string
  macros: MacroData[]
  title?: string
}

export function MacroSummary({ personName, macros, title }: MacroSummaryProps) {
  const getMacroType = (label: string) => {
    switch (label.toLowerCase()) {
      case "protein":
      case "б":
      case "білок":
        return "protein"
      case "fat":
      case "ж":
      case "жири":
        return "fat"
      case "carbs":
      case "carbohydrates":
      case "в":
      case "вуглеводи":
        return "carbs"
      case "fiber":
      case "кл":
      case "клітковина":
        return "fiber"
      case "kcal":
      case "к":
      case "кал":
      case "калорії":
        return "kcal"
      default:
        return "unknown"
    }
  }

  const getMacroColor = (label: string) => {
    switch (getMacroType(label)) {
      case "protein":
        return "bg-rose-500"
      case "fat":
        return "bg-amber-500"
      case "carbs":
        return "bg-sky-500"
      case "fiber":
        return "bg-emerald-500"
      case "kcal":
        return "bg-text-secondary"
      default:
        return "bg-accent"
    }
  }

  const getMacroTextColor = (label: string) => {
    switch (getMacroType(label)) {
      case "protein":
        return "text-rose-400"
      case "fat":
        return "text-amber-400"
      case "carbs":
        return "text-sky-400"
      case "fiber":
        return "text-emerald-400"
      default:
        return "text-text-muted"
    }
  }

  const getMacroStatus = (actual: number, target: number) => {
    if (!target || target === 0) {
      return { bg: "bg-text-muted/20", text: undefined }
    }

    const ratio = actual / target
    if (ratio < 0.9 || ratio > 1.1) {
      return { bg: "bg-rose-500", text: "text-rose-400" }
    }

    if (ratio < 0.95 || ratio > 1.05) {
      return { bg: "bg-amber-500", text: "text-amber-400" }
    }

    return { bg: "bg-emerald-500", text: "text-emerald-400" }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col h-full">
      {title && (
        <div className="bg-raised/50 px-4 py-2 border-b border-border">
          <span className="text-micro font-bold uppercase tracking-wider text-text-muted">{title}</span>
        </div>
      )}
      
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
            <span className="text-accent text-micro font-bold">{(personName || "U").charAt(0).toUpperCase()}</span>
          </div>
          <span className="text-caption font-semibold text-text-primary truncate">{personName || "Unknown"}</span>
        </div>
        
        <div className="space-y-1.5 flex-1">
          {macros.map((m) => {
            const pct = Math.min((m.actual / (m.target || 1)) * 100, 100)
            const color = getMacroColor(m.label)
            const labelColor = getMacroTextColor(m.label)
            const status = getMacroStatus(m.actual, m.target)

            return (
              <div key={m.label} className="flex items-center gap-x-5 min-w-0">
                {/* Label */}
                <span className={`text-micro font-mono w-3 shrink-0 ${labelColor}`}>{m.label}</span>
                
                {/* Visualization (Progress Bar) */}
                <div className="flex-1 h-1.5 bg-raised rounded-full overflow-hidden shrink-0">
                  <div 
                    style={{ width: `${pct}%` }} 
                    className={`h-full ${status.bg} transition-all`} 
                  />
                </div>
                
                {/* Values */}
                <span className={`text-micro font-mono shrink-0 tabular-nums ${status.text ?? "text-text-secondary"}`}>
                  {m.actual.toFixed(0)}{m.unit}
                  <span className="text-text-muted">/{m.target.toFixed(0)}{m.unit}</span>
                </span>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
