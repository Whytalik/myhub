"use client"

import { useTransition } from "react"
import { CalendarDays, Copy } from "lucide-react"
import { duplicateWeekPlan } from "../../actions/planning"
import { toast } from "sonner"
import Link from "next/link"
import { format } from "date-fns"

interface PlanListProps {
  initialPlans: {
    id: string
    name: string | null
    createdAt: Date
  }[]
}

export function PlanList({ initialPlans }: PlanListProps) {
  const plans = initialPlans
  const [isPending, startTransition] = useTransition()

  const handleDuplicate = (e: React.MouseEvent, planId: string) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const result = await duplicateWeekPlan(planId)
      if (result.success) {
        toast.success("Plan duplicated")
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to duplicate")
      }
    })
  }

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 bg-surface border border-border rounded-2xl">
        <div className="w-16 h-16 rounded-3xl bg-bg/50 flex items-center justify-center border border-border mb-4">
          <CalendarDays size={32} className="text-text-muted/40" />
        </div>
        <p className="text-body font-semibold text-text-primary mb-1">No plans yet</p>
        <p className="text-note text-text-secondary">Create one above to get started.</p>
      </div>
    )
  }

  const latestPlanId = plans[0]?.id

  return (
    <div className="space-y-3">
      {plans.map((plan) => {
        const isLatest = plan.id === latestPlanId
        return (
          <Link
            key={plan.id}
            href={`/nutrition/plan?id=${plan.id}`}
            className={`block bg-surface border rounded-2xl p-5 hover:border-accent/30 transition-all ${
              isLatest ? "border-accent/30 bg-accent/[0.02]" : "border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isLatest ? "bg-accent/20" : "bg-accent/10"
              }`}>
                <CalendarDays size={18} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-body font-semibold text-text-primary truncate">{plan.name || "Week Plan"}</h3>
                  {isLatest && (
                    <span className="text-label font-mono px-2 py-0.5 rounded-md bg-accent/15 text-accent shrink-0">
                      Actual
                    </span>
                  )}
                </div>
                <p className="text-note font-mono text-text-muted">{format(new Date(plan.createdAt), "MMM d, yyyy")}</p>
              </div>
              <button
                onClick={(e) => handleDuplicate(e, plan.id)}
                disabled={isPending}
                className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors shrink-0"
              >
                <Copy size={14} />
              </button>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
