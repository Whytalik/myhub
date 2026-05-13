"use client"

import { useState, useTransition } from "react"
import { Trash2, Edit2, Copy, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { deleteWeekPlan, updateWeekPlanName, duplicateWeekPlan } from "../../actions/planning"
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
  const [plans, setPlans] = useState(initialPlans)
  const [isPending, startTransition] = useTransition()
  const [editingPlan, setEditingPlan] = useState<{ id: string; name: string } | null>(null)
  const [planToDelete, setPlanToDelete] = useState<{ id: string; name: string | null } | null>(null)

  const handleDelete = () => {
    if (!planToDelete) return
    startTransition(async () => {
      const result = await deleteWeekPlan(planToDelete.id)
      if (result.success) {
        setPlans(prev => prev.filter(p => p.id !== planToDelete.id))
        toast.success("Plan deleted")
        setPlanToDelete(null)
      } else {
        toast.error(result.error || "Failed to delete")
      }
    })
  }

  const handleUpdateName = () => {
    if (!editingPlan || !editingPlan.name.trim()) return
    startTransition(async () => {
      const result = await updateWeekPlanName(editingPlan.id, editingPlan.name)
      if (result.success) {
        setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, name: editingPlan.name } : p))
        toast.success("Name updated")
        setEditingPlan(null)
      } else {
        toast.error(result.error || "Failed to update name")
      }
    })
  }

  const handleDuplicate = (planId: string) => {
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
        <p className="text-body font-semibold text-text-primary mb-1">No week plans yet</p>
        <p className="text-note text-text-secondary">Create one above to get started.</p>
      </div>
    )
  }

  const latestPlanId = plans[0]?.id

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {plans.map((plan) => {
          const isLatest = plan.id === latestPlanId
          return (
          <div
            key={plan.id}
            className={`group bg-surface border rounded-2xl p-5 hover:border-accent/30 transition-all relative ${
              isLatest ? "border-accent/30 bg-accent/[0.02]" : "border-border"
            }`}
          >
            <Link
              href={`/nutrition/week?id=${plan.id}`}
              className="flex items-start justify-between"
            >
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isLatest ? "bg-accent/20" : "bg-accent/10"
                  }`}>
                    <CalendarDays size={18} className="text-accent" />
                  </div>
                  <div className="min-w-0">
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
                </div>
              </div>
            </Link>

            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDuplicate(plan.id); }}
                disabled={isPending}
              >
                <Copy size={14} />
              </button>
              <button
                className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingPlan({ id: plan.id, name: plan.name || "" }); }}
                disabled={isPending}
              >
                <Edit2 size={14} />
              </button>
              <button
                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlanToDelete({ id: plan.id, name: plan.name }); }}
                disabled={isPending}
              >
                <Trash2 size={14} />
              </button>
            </div>

            <Link
              href={`/nutrition/week?id=${plan.id}`}
              className="absolute inset-0"
            />
          </div>
          )
        })}
      </div>

      {/* Edit Name Dialog */}
      <Dialog
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        title="Edit Plan Name"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingPlan(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdateName} disabled={isPending}>Save</Button>
          </>
        }
      >
        <div className="space-y-2">
          <label className="text-caption font-mono text-text-muted uppercase">Plan Name</label>
          <Input
            value={editingPlan?.name || ""}
            onChange={(e) => setEditingPlan(prev => prev ? { ...prev, name: e.target.value } : null)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
          />
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        title="Delete Plan?"
        description="This action cannot be undone"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPlanToDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete Plan"}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>{planToDelete?.name || "this plan"}</strong>?</p>
      </Dialog>
    </div>
  )
}
