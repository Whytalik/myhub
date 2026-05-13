"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { toast } from "sonner"
import { createWeekPlan } from "../../actions/planning"

interface Person {
  id: string
  name: string | null
}

interface CreatePlanFormProps {
  persons: Person[]
}

export function CreatePlanForm({ persons }: CreatePlanFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [selectedPersons, setSelectedPersons] = useState<string[]>(persons.map(p => p.id))

  const togglePerson = (id: string) => {
    setSelectedPersons(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleCreate = () => {
    if (selectedPersons.length === 0) { toast.error("Select at least one person"); return }

    startTransition(async () => {
      const planName = name.trim() || `Week Plan`
      const result = await createWeekPlan(planName, selectedPersons)
      if (result.success) {
        toast.success("Week plan created")
        setIsOpen(false)
        setName("")
        router.push("/nutrition/week")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create plan")
      }
    })
  }

  if (persons.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 bg-surface border border-border rounded-2xl">
        <div className="w-16 h-16 rounded-3xl bg-bg/50 flex items-center justify-center border border-border mb-4">
          <Users size={32} className="text-text-muted/40" />
        </div>
        <p className="text-body font-semibold text-text-primary mb-1">No profiles yet</p>
        <p className="text-note text-text-secondary mb-4">Create a person profile first to start planning.</p>
        <Button variant="primary" size="sm" onClick={() => router.push("/nutrition/profiles")}>
          Go to Profiles
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        className="rounded-xl"
        onClick={() => setIsOpen(true)}
      >
        <Plus size={14} className="mr-1.5" /> Create Week Plan
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); setName(""); setSelectedPersons(persons.map(p => p.id)); }}
        title="Create New Week Plan"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setIsOpen(false); setName(""); }}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={isPending || selectedPersons.length === 0}>
              {isPending ? "Creating..." : "Create Plan"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-caption font-mono text-text-muted tracking-widest pl-1">Plan Name</label>
            <Input
              placeholder="e.g. Week 20, Cutting Phase..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-caption font-mono text-text-muted tracking-widest pl-1">Include Persons</label>
            <div className="flex flex-wrap gap-2">
              {persons.map((person) => {
                const isSelected = selectedPersons.includes(person.id)
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => togglePerson(person.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-note font-mono border transition-all ${
                      isSelected
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "border-border text-text-muted hover:text-text-primary hover:bg-surface-hover"
                    }`}
                  >
                    <Users size={12} />
                    {person.name}
                    {isSelected && <span className="text-caption">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}
