"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { upsertTacticAction } from "../actions/sprint-actions";
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
  
  const [title, setTitle] = useState(tactic?.title || "");
  const [frequency, setFrequency] = useState<any>(tactic?.frequency || "WEEKLY");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    try {
      await upsertTacticAction({
        id: tactic?.id,
        keyResultId,
        title,
        frequency
      });
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save tactic:", error);
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
        title={tactic ? "Edit Tactic" : "New Tactic"}
        description="Weekly recurring action"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading || !title}>
              {loading ? "Saving..." : (tactic ? "Update" : "Create")}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted tracking-widest">Tactic Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Read 20 mins every morning"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted tracking-widest">Frequency</label>
            <Select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
            </Select>
          </div>
        </div>
      </Dialog>
    </>
  );
}
