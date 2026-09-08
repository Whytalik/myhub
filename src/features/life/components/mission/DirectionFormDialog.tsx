"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Select } from "@/components/ui/inputs/select";
import { FormField } from "@/components/ui/display/form-field";
import { upsertDirectionAction } from "@/features/life/actions/direction-actions";
import type { DirectionAction, DirectionData, LifeSphereData } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

interface DirectionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  direction?: DirectionData | null;
  spheres: LifeSphereData[];
  takenSphereIds: string[];
}

export function DirectionFormDialog({
  isOpen,
  onClose,
  direction,
  spheres,
  takenSphereIds,
}: DirectionFormDialogProps) {
  const isEditing = !!direction;
  const { run, isPending } = useServerAction();

  const availableSpheres = isEditing
    ? spheres.filter((s) => s.id === direction?.sphereId)
    : spheres.filter((s) => !takenSphereIds.includes(s.id));

  const [sphereId, setSphereId] = useState(direction?.sphereId ?? "");
  const [statement, setStatement] = useState(direction?.statement ?? "");
  const [actions, setActions] = useState<DirectionAction[]>(
    direction?.actions ?? [{ label: "", text: "" }],
  );

  const handleAddAction = () => {
    setActions((prev) => [...prev, { label: "", text: "" }]);
  };

  const handleActionChange = (index: number, field: keyof DirectionAction, value: string) => {
    setActions((prev) =>
      prev.map((action, i) => (i === index ? { ...action, [field]: value } : action)),
    );
  };

  const handleRemoveAction = (index: number) => {
    setActions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (isPending) return;
    if (!sphereId) return;
    if (!statement.trim()) return;

    const cleanActions = actions
      .map((action) => ({ label: action.label.trim(), text: action.text.trim() }))
      .filter((action) => action.label || action.text);

    run(upsertDirectionAction({ sphereId, statement: statement.trim(), actions: cleanActions }), {
      successMessage: isEditing ? "Vector updated" : "Vector created",
      errorMessage: "Failed to save vector",
    });
  };

  return (
    <Dialog
      key={direction?.id ?? "new"}
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Vector" : "New Vector"}
      description="A one-year direction for a life sphere"
      maxWidth="560px"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Vector"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <FormField label="Life Sphere" required>
          <Select
            value={sphereId}
            onChange={(e) => setSphereId(e.target.value)}
            disabled={isEditing}
          >
            {!isEditing && <option value="">Select a sphere…</option>}
            {availableSpheres.map((sphere) => (
              <option key={sphere.id} value={sphere.id}>
                {sphere.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Statement"
          required
          hint="The superordinate goal — abstract but vivid. e.g. “Вектор на 1 рік: …”"
        >
          <Textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="One-year direction for this sphere…"
            rows={4}
          />
        </FormField>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-label">Actions</label>
            <Button type="button" variant="ghost" size="sm" onClick={handleAddAction}>
              <Plus size={14} />
              Add bullet
            </Button>
          </div>

          {actions.length === 0 && (
            <p className="text-caption">No bullets yet — concrete actions give the vector teeth.</p>
          )}

          {actions.map((action, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={action.label}
                onChange={(e) => handleActionChange(index, "label", e.target.value)}
                placeholder="Label"
                className="w-40 shrink-0"
              />
              <Input
                value={action.text}
                onChange={(e) => handleActionChange(index, "text", e.target.value)}
                placeholder="What does this mean in practice?"
              />
              <button
                type="button"
                onClick={() => handleRemoveAction(index)}
                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-white/5 rounded-md transition-colors shrink-0"
                title="Remove bullet"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
