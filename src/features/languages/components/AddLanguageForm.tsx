"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addLanguageAction } from "../actions/language-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Language } from "@/app/generated/prisma";
import { Check } from "lucide-react";

interface AddLanguageFormProps {
  availableLanguages: Language[];
  personId: string;
}

export function AddLanguageForm({ availableLanguages, personId }: AddLanguageFormProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleAdd = async () => {
    if (!selectedId) return;

    setIsPending(true);
    try {
      const result = await addLanguageAction(personId, selectedId);
      if (result.success) {
        toast.success("Language added successfully!");
        router.push("/languages");
      } else {
        toast.error(result.error || "Failed to add language");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  if (availableLanguages.length === 0) {
    return (
      <div className="bg-surface border border-border p-12 rounded-3xl text-center">
        <p className="text-secondary">All supported languages are already in your system.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {availableLanguages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setSelectedId(lang.id)}
            className={`relative flex flex-col items-center gap-4 p-8 rounded-3xl border transition-all duration-300 ${
              selectedId === lang.id
                ? "bg-accent/10 border-accent shadow-lg shadow-accent/10"
                : "bg-surface border-border hover:border-accent/30 hover:bg-raised"
            }`}
          >
            <span className="text-6xl">{lang.icon}</span>
            <span className="font-heading text-xl uppercase tracking-tight">{lang.name}</span>
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">{lang.code}</span>

            {selectedId === lang.id && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-bg shadow-sm">
                <Check size={14} strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          disabled={!selectedId || isPending}
          className="px-8"
        >
          {isPending ? "Adding..." : "Add Language"}
        </Button>
      </div>
    </div>
  );
}
