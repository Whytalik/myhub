"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import { getAllSpheresAction } from "@/features/life/actions/task-actions";
import { upsertObjectiveAction } from "../actions/sprint-actions";
import { objectiveSchema, type ObjectiveFormData } from "../schemas";
import type { ObjectiveData } from "../types";
import type { LifeSphereData } from "@/features/life/types";

interface ObjectiveDialogProps {
  sprintId: string;
  objective?: ObjectiveData;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function ObjectiveDialog({ sprintId, objective, onSuccess, children }: ObjectiveDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spheres, setSpheres] = useState<LifeSphereData[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<ObjectiveFormData>({
    resolver: zodResolver(objectiveSchema),
    defaultValues: {
      title: objective?.title ?? "",
      description: objective?.description ?? "",
      sphereId: objective?.sphereId ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      getAllSpheresAction().then(r => { if (r.success) setSpheres(r.data); });
    }
  }, [isOpen]);

  const onSubmit = async (data: ObjectiveFormData) => {
    setLoading(true);
    const result = await upsertObjectiveAction({
      id: objective?.id,
      sprintId,
      sphereId: data.sphereId,
      title: data.title,
      description: data.description,
    });
    if (result.success) {
      onSuccess();
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to save objective");
    }
    setLoading(false);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="contents">
        {children}
      </div>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={objective ? "Edit Objective" : "New Objective"}
        description="Lineage to your North Star"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
              {loading ? "Saving..." : (objective ? "Update Objective" : "Create Objective")}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <FormField label="Pillar / Life Sphere" error={errors.sphereId?.message} required>
            <Select {...register("sphereId")}>
              <option value="" disabled>Select a sphere</option>
              {spheres.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Title" error={errors.title?.message} required>
            <Input
              {...register("title")}
              placeholder="e.g. Master Next.js 15"
            />
          </FormField>

          <FormField label="Description">
            <Input
              {...register("description")}
              placeholder="Why this matters..."
            />
          </FormField>
        </form>
      </Dialog>
    </>
  );
}
