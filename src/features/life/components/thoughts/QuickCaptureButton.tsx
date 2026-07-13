"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Textarea } from "@/components/ui/inputs/textarea";
import { quickCaptureAction } from "@/features/life/actions/thought-actions";
import { getAllSpheresAction } from "@/features/life/actions/task-actions";
import { ThoughtFields } from "./ThoughtFields";
import type { ThoughtType } from "@/features/life/logic/thought-types";
import type { LifeSphereData } from "@/features/life/types";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

// Mounted once in DashboardUIWrapper so it's reachable from every page — the
// "5-second rule" entry point for the Thoughts Inbox. Zero categorization
// here on purpose: it always drops straight into the Inbox column
// (thoughtService.quickCapture resolves that column by name).
// Reads the PWA manifest shortcut deep-link (see src/app/manifest.ts):
// ?capture=1 should open the dialog immediately. A lazy useState initializer
// (rather than an effect calling setState) avoids a hydration mismatch risk
// entirely — Dialog itself never renders portal content until its own
// post-mount effect flips `mounted`, so an initial `isOpen=true` here never
// produces divergent server/client DOM.
function readInitialCaptureIntent(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("capture") === "1";
}

export function QuickCaptureButton() {
  const [isOpen, setIsOpen] = useState(readInitialCaptureIntent);
  const [step, setStep] = useState<"quick" | "enrich">("quick");
  const [draft, setDraft] = useState("");
  const [spheres, setSpheres] = useState<LifeSphereData[]>([]);
  const [spheresLoading, setSpheresLoading] = useState(false);
  const [sphereId, setSphereId] = useState<string | null>(null);
  const [type, setType] = useState<ThoughtType | null>(null);
  const [templateData, setTemplateData] = useState<Record<string, string> | null>(null);
  const [isPending, startTransition] = useTransition();

  // Strip the ?capture=1 param once consumed — a history mutation, not
  // React state, so it's a legitimate effect side effect.
  useEffect(() => {
    if (!isOpen) return;
    const url = new URL(window.location.href);
    if (url.searchParams.has("capture")) {
      url.searchParams.delete("capture");
      window.history.replaceState({}, "", url);
    }
  }, [isOpen]);

  // Global "n" shortcut — no modifiers, and only when not already typing
  // somewhere else in the app, so normal input is never hijacked.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen) return;
      if (event.key !== "n" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      setIsOpen(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const reset = () => {
    setStep("quick");
    setDraft("");
    setSphereId(null);
    setType(null);
    setTemplateData(null);
  };

  const close = () => {
    setIsOpen(false);
    reset();
  };

  const handleFieldsChange = (patch: {
    sphereId?: string | null;
    type?: ThoughtType | null;
    templateData?: Record<string, string> | null;
  }) => {
    if (patch.sphereId !== undefined) setSphereId(patch.sphereId);
    if (patch.type !== undefined) setType(patch.type);
    if (patch.templateData !== undefined) setTemplateData(patch.templateData);
  };

  const continueFilling = () => {
    if (!draft.trim()) return;
    setStep("enrich");
    setSpheresLoading(true);
    getAllSpheresAction().then((result) => {
      setSpheresLoading(false);
      if (result.success) setSpheres(result.data);
    });
  };

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed || isPending) return;

    startTransition(async () => {
      const result = await quickCaptureAction(
        trimmed,
        step === "enrich" ? { sphereId, type, templateData } : undefined,
      );
      if (result.success) {
        toast.success("Captured to Inbox");
        close();
      } else {
        toast.error(result.error || "Failed to capture thought");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="icon"
        onClick={() => setIsOpen(true)}
        title="Quick capture (n)"
        className="fixed bottom-6 right-6 z-[7000] w-12 h-12 rounded-full shadow-lg shadow-black/40"
      >
        <Plus size={20} />
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={close}
        title="Capture a thought"
        description={step === "quick" ? "Goes to Inbox" : "Add context (optional)"}
      >
        <div className="flex flex-col gap-4">
          <Textarea
            autoFocus={step === "quick"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (step === "quick" && e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="What's on your mind?"
            rows={3}
          />

          {step === "enrich" &&
            (spheresLoading ? (
              <p className="text-caption">Loading spheres...</p>
            ) : (
              <ThoughtFields
                spheres={spheres}
                sphereId={sphereId}
                type={type}
                templateData={templateData}
                onChange={handleFieldsChange}
              />
            ))}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={close} disabled={isPending}>
              Cancel
            </Button>
            {step === "quick" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={continueFilling}
                disabled={isPending || !draft.trim()}
              >
                Continue filling
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={submit}
              disabled={isPending || !draft.trim()}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
