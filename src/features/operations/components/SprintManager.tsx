"use client";

import React, { useEffect, useState } from "react";
import { Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SprintBoard } from "./SprintBoard";
import { getActiveSprintAction, upsertSprintAction } from "../actions/sprint-actions";
import type { SprintData } from "../types";

export function SprintManager() {
  const [sprint, setSprint] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const active = await getActiveSprintAction();
      setSprint(active);
    } catch (error) {
      console.error("Failed to load active sprint:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateSprint = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startDate = new Date(now);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + (12 * 7)); // 12 weeks

      const newSprint = await upsertSprintAction({
        number: 1, // Defaulting to 1 for now, logic could be more complex
        year: now.getFullYear(),
        startDate,
        endDate,
        status: "ACTIVE"
      });
      setSprint(newSprint);
    } catch (error) {
      console.error("Failed to create sprint:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <p className="text-xs text-muted font-mono uppercase tracking-widest">Initializing Engine...</p>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
           <Zap className="text-emerald-500" size={32} />
        </div>
        <h3 className="text-2xl font-heading mb-2 uppercase tracking-tight">No Active Sprint</h3>
        <p className="text-secondary text-sm leading-relaxed mb-8">
          The 12-week sprint is your tactical engine. Start a new cycle to begin 
          tracking your Objectives and Key Results.
        </p>
        <Button onClick={handleCreateSprint} className="gap-2">
          <Plus size={16} />
          Initialize Sprint 01
        </Button>
      </div>
    );
  }

  return <SprintBoard sprint={sprint} onRefresh={load} />;
}
