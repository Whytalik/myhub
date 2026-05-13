"use client"

import { useState, useTransition } from "react"
import { Trash2, Edit2, ChevronRight, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { deleteWeekPlan, updateWeekPlanName, duplicateWeekPlan } from "../../actions/planning"
import { toast } from "sonner"
import Link from "next/link"

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

  return (
    <div className="space-y-4">
      {plans.length === 0 ? (
        <p className="text-muted">No week plans yet. Create one above.</p>
      ) : (
        <div className="grid gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all flex items-center justify-between gap-4"
            >
              <Link
                href={`/nutrition/week?id=${plan.id}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{plan.name || "Week Plan"}</h3>
                  <ChevronRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted">{new Date(plan.createdAt).toLocaleDateString()}</p>
              </Link>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted hover:text-accent"
                  onClick={() => handleDuplicate(plan.id)}
                  disabled={isPending}
                >
                  <Copy size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted hover:text-accent"
                  onClick={() => setEditingPlan({ id: plan.id, name: plan.name || "" })}
                  disabled={isPending}
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted hover:text-red-500"
                  onClick={() => setPlanToDelete({ id: plan.id, name: plan.name })}
                  disabled={isPending}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
          <label className="text-caption font-mono text-muted uppercase">Plan Name</label>
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
