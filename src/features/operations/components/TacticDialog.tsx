"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { upsertTacticAction } from "../actions/sprint-actions";
import { tacticSchema, type TacticFormData } from "../schemas";
import type { TacticData } from "../types";

interface TacticDialogProps {
  keyResultId: string;
  tactic?: TacticData;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function TacticDialog({ keyResultId, tactic, onSuccess, children }: TacticDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<TacticFormData>({
    resolver: zodResolver(tacticSchema),
    defaultValues: {
      title: tactic?.title ?? "",
      frequency: tactic?.frequency ?? "WEEKLY",
    },
  });

  const onSubmit = async (data: TacticFormData) => {
    setLoading(true);
    const result = await upsertTacticAction({
      id: tactic?.id,
      keyResultId,
      title: data.title,
      frequency: data.frequency,
    });
    if (result.success) {
      onSuccess();
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to save tactic");
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
        title={tactic ? "Edit Tactic" : "New Tactic"}
        description="Weekly recurring action"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
              {loading ? "Saving..." : (tactic ? "Update" : "Create")}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <FormField label="Tactic Title" error={errors.title?.message} required>
            <Input
              {...register("title")}
              placeholder="e.g. Read 20 mins every morning"
            />
          </FormField>

          <FormField label="Frequency">
            <Select {...register("frequency")}>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
            </Select>
          </FormField>
        </form>
      </Dialog>
    </>
  );
}
