"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
        router.push("/nutrition/week")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create plan")
      }
    })
  }

  if (persons.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 text-center">
        <p className="text-base text-muted">Create a person profile first to start planning.</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={() => router.push("/nutrition/profiles")}>
          Go to Profiles
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
      <h3 className="text-note font-mono tracking-[0.2em] text-muted">Create New Week Plan</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-caption font-mono text-muted tracking-widest pl-1">Plan Name</label>
          <Input
            placeholder="e.g. Week 20, Cutting Phase..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <label className="text-caption font-mono text-muted tracking-widest pl-1">Include Persons</label>
          <div className="flex flex-wrap gap-2">
            {persons.map((person) => {
              const isSelected = selectedPersons.includes(person.id)
              return (
                <button
                  key={person.id}
                  onClick={() => togglePerson(person.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors ${
                    isSelected
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-transparent border-border text-muted hover:text-text"
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

      <Button
        variant="primary"
        size="sm"
        className="rounded-xl"
        onClick={handleCreate}
        disabled={isPending || selectedPersons.length === 0}
      >
        {isPending ? "Creating..." : "Create Week Plan"}
      </Button>
    </div>
  )
}
