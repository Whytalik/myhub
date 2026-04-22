"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getAllSpheresAction } from "@/features/life/actions/task-actions";
import { upsertObjectiveAction } from "../actions/sprint-actions";
import type { ObjectiveData } from "../types";

interface ObjectiveDialogProps {
  sprintId: string;
  objective?: ObjectiveData;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function ObjectiveDialog({ sprintId, objective, onSuccess, children }: ObjectiveDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spheres, setSpheres] = useState<any[]>([]);
  
  const [title, setTitle] = useState(objective?.title || "");
  const [description, setDescription] = useState(objective?.description || "");
  const [sphereId, setSphereId] = useState(objective?.sphereId || "");

  useEffect(() => {
    if (isOpen) {
      getAllSpheresAction().then(setSpheres);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sphereId) return;

    setLoading(true);
    try {
      await upsertObjectiveAction({
        id: objective?.id,
        sprintId,
        sphereId,
        title,
        description
      });
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save objective:", error);
    } finally {
      setLoading(false);
    }
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
            <Button onClick={handleSubmit} disabled={loading || !title || !sphereId}>
              {loading ? "Saving..." : (objective ? "Update Objective" : "Create Objective")}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted tracking-widest">Pillar / Life Sphere</label>
            <Select value={sphereId} onChange={(e) => setSphereId(e.target.value)}>
              <option value="" disabled>Select a sphere</option>
              {spheres.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted tracking-widest">Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Master Next.js 15"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted tracking-widest">Description</label>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Why this matters..."
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
