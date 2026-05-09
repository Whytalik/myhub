"use client";

import React, { useState } from "react";
import { Zap, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SprintBoard } from "./SprintBoard";
import { getActiveSprintAction, upsertSprintAction } from "../actions/sprint-actions";
import type { SprintData } from "../types";

interface SprintManagerProps {
  initialSprint: SprintData | null;
}

export function SprintManager({ initialSprint }: SprintManagerProps) {
  const [sprint, setSprint] = useState<SprintData | null>(initialSprint);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    // We only need to show loading during manual refreshes/actions
    try {
      const active = await getActiveSprintAction();
      setSprint(active);
    } catch {
      toast.error("Failed to load sprint");
    }
  };

  const handleCreateSprint = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startDate = new Date(now);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + (12 * 7)); // 12 weeks

      const result = await upsertSprintAction({
        number: 1,
        year: now.getFullYear(),
        startDate,
        endDate,
        status: "ACTIVE"
      });
      if (result.success) {
        setSprint(result.data);
      } else {
        toast.error(result.error || "Failed to create sprint");
      }
    } catch {
      toast.error("Failed to create sprint");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
           <Zap className="text-emerald-500" size={32} />
        </div>
        <h3 className="text-base font-heading mb-2 uppercase tracking-tight">No Active Sprint</h3>
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
