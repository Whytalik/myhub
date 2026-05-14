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
  repeatedDishes?: { dishName: string; count: number }[]
  title?: string
}

export function MacroSummary({ personName, macros, repeatedDishes, title }: MacroSummaryProps) {
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
            
            // Status-based coloring
            const color = m.target > 0 
              ? m.actual > m.target * 1.1 ? 'bg-red-500' 
              : m.actual < m.target * 0.9 ? 'bg-amber-500' 
              : 'bg-green-500'
              : 'bg-raised'

            return (
              <div key={m.label} className="flex items-center gap-x-5 min-w-0">
                {/* Label */}
                <span className="text-micro font-mono text-text-muted w-3 shrink-0">{m.label}</span>
                
                {/* Visualization (Progress Bar) */}
                <div className="flex-1 h-1.5 bg-raised rounded-full overflow-hidden shrink-0">
                  <div 
                    style={{ width: `${pct}%` }} 
                    className={`h-full ${color} transition-all`} 
                  />
                </div>
                
                {/* Values */}
                <span className="text-micro font-mono text-text-secondary shrink-0 tabular-nums">
                  {m.actual.toFixed(0)}{m.unit}<span className="text-text-muted">/{m.target.toFixed(0)}{m.unit}</span>
                </span>
              </div>
            )
          })}
        </div>

        {repeatedDishes && repeatedDishes.length > 0 && (
          <div className="pt-2 border-t border-border/30">
            <div className="flex flex-wrap gap-1">
              {repeatedDishes.map((d, i) => (
                <span key={i} className="text-micro font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">
                  {d.dishName}: {d.count}×
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
