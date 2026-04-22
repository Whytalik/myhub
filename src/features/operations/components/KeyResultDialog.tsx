"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertKeyResultAction } from "../actions/sprint-actions";
import type { KeyResultData } from "../types";

interface KeyResultDialogProps {
  objectiveId: string;
  keyResult?: KeyResultData;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function KeyResultDialog({ objectiveId, keyResult, onSuccess, children }: KeyResultDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState(keyResult?.title || "");
  const [targetValue, setTargetValue] = useState(keyResult?.targetValue.toString() || "100");
  const [currentValue, setCurrentValue] = useState(keyResult?.currentValue.toString() || "0");
  const [unit, setUnit] = useState(keyResult?.unit || "%");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetValue) return;

    setLoading(true);
    try {
      await upsertKeyResultAction({
        id: keyResult?.id,
        objectiveId,
        title,
        targetValue: parseFloat(targetValue),
        currentValue: parseFloat(currentValue),
        unit
      });
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save key result:", error);
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
        title={keyResult ? "Edit Key Result" : "New Key Result"}
        description="Quantifiable success criteria"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading || !title || !targetValue}>
              {loading ? "Saving..." : (keyResult ? "Update" : "Create")}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted tracking-widest">Measurement Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Courses Completed"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase text-muted tracking-widest">Target</label>
              <Input 
                type="number"
                value={targetValue} 
                onChange={(e) => setTargetValue(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase text-muted tracking-widest">Current</label>
              <Input 
                type="number"
                value={currentValue} 
                onChange={(e) => setCurrentValue(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase text-muted tracking-widest">Unit</label>
              <Input 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)} 
                placeholder="%, units"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
