"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertProjectAction } from "../actions/sprint-actions";
import type { ProjectData } from "../types";

interface ProjectDialogProps {
  objectiveId: string;
  project?: ProjectData;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function ProjectDialog({ objectiveId, project, onSuccess, children }: ProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    const result = await upsertProjectAction({
      id: project?.id,
      objectiveId,
      title,
      description,
      status: project?.status || "TODO",
      startDate: project?.startDate,
      endDate: project?.endDate
    });
    if (result.success) {
      onSuccess();
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to save project");
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
        title={project ? "Edit Project" : "New Project"}
        description="A tactical vehicle for your objective"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading || !title}>
              {loading ? "Saving..." : (project ? "Update Project" : "Create Project")}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-caption font-mono uppercase text-muted tracking-widest">Project Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Build the Auth Module"
            />
          </div>

          <div className="space-y-2">
            <label className="text-caption font-mono uppercase text-muted tracking-widest">Description</label>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="What needs to be achieved?"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
