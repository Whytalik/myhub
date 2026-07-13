"use client";

import { AlertTriangle, CheckCircle2, Sparkles, type LucideIcon } from "lucide-react";
import { Textarea } from "@/components/ui/inputs/textarea";
import { THOUGHT_TYPE_CONFIGS, type ThoughtType } from "@/features/life/logic/thought-types";
import type { LifeSphereData } from "@/features/life/types";

const TYPE_ICONS: Record<string, LucideIcon> = { AlertTriangle, Sparkles, CheckCircle2 };

interface ThoughtFieldsProps {
  spheres: LifeSphereData[];
  sphereId: string | null;
  type: ThoughtType | null;
  templateData: Record<string, string> | null;
  onChange: (patch: {
    sphereId?: string | null;
    type?: ThoughtType | null;
    templateData?: Record<string, string> | null;
  }) => void;
}

// Shared sphere + type + per-type template picker, reused by the Quick
// Capture "Continue filling" step and the board's ThoughtDetailDialog.
export function ThoughtFields({
  spheres,
  sphereId,
  type,
  templateData,
  onChange,
}: ThoughtFieldsProps) {
  const activeConfig = THOUGHT_TYPE_CONFIGS.find((config) => config.id === type) ?? null;

  const chipClass = (isActive: boolean) =>
    `px-2.5 py-1 rounded-lg text-xs border transition-colors duration-150 ${
      isActive
        ? "bg-accent/15 text-accent border-accent/30"
        : "text-zinc-400 border-white/[0.08] hover:bg-white/5"
    }`;

  const selectSphere = (id: string) => {
    onChange({ sphereId: sphereId === id ? null : id });
  };

  const selectType = (id: ThoughtType) => {
    if (type === id) {
      onChange({ type: null, templateData: null });
    } else {
      onChange({ type: id, templateData: {} });
    }
  };

  const setTemplateField = (key: string, value: string) => {
    onChange({ templateData: { ...(templateData ?? {}), [key]: value } });
  };

  return (
    <div className="flex flex-col gap-4">
      {spheres.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-label">Sphere</label>
          <div className="flex flex-wrap gap-1.5">
            {spheres.map((sphere) => (
              <button
                key={sphere.id}
                type="button"
                onClick={() => selectSphere(sphere.id)}
                className={chipClass(sphereId === sphere.id)}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                  style={{ backgroundColor: sphere.color }}
                />
                {sphere.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-label">Type (optional)</label>
        <div className="flex flex-wrap gap-1.5">
          {THOUGHT_TYPE_CONFIGS.map((config) => {
            const Icon = TYPE_ICONS[config.icon];
            return (
              <button
                key={config.id}
                type="button"
                onClick={() => selectType(config.id)}
                className={chipClass(type === config.id)}
              >
                <span className="inline-flex items-center gap-1.5">
                  {Icon && <Icon size={12} />}
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeConfig && (
        <div className="flex flex-col gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          {activeConfig.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label className="text-label">{field.label}</label>
              <Textarea
                value={templateData?.[field.key] ?? ""}
                onChange={(e) => setTemplateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={2}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
