"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { triggerSOSAction } from "../actions/recovery-actions";

export function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleTriggerSOS = async () => {
    try {
      const result = await triggerSOSAction();
      if (result.success) {
        setIsOpen(false);
      } else {
        toast.error(result.error || "Failed to trigger SOS");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-2"
      >
        <AlertTriangle className="h-4 w-4" />
        SOS
      </Button>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleTriggerSOS}
        title="Activate Survival Mode?"
        description="Are you feeling overwhelmed? Activating SOS (Safe Mode) will hide all complex tasks and analytics, leaving only a basic survival checklist for gradual recovery."
        confirmLabel="Activate Safe Mode"
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  );
}
