"use client";
import { useState } from "react";
import { Plus, ChevronDown, SlidersHorizontal } from "lucide-react";
import type { ContextBlock } from "@/features/life/types";
import {
  STANDARD_BLOCK_TEMPLATES,
  getBlockDotClass,
  toContextBlock,
} from "@/features/life/logic/week-template-blocks";

interface AddBlockMenuProps {
  disabled?: boolean;
  onAddPreset: (block: ContextBlock) => void;
  onAddCustom: () => void;
}

export function AddBlockMenu({ disabled, onAddPreset, onAddCustom }: AddBlockMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const presetOptions = STANDARD_BLOCK_TEMPLATES.map((template) => {
    const dotClass = getBlockDotClass(template.id);
    const handleAdd = () => {
      onAddPreset(toContextBlock(template));
      setIsOpen(false);
    };
    return { template, dotClass, handleAdd };
  });

  const triggerClass =
    "w-full py-2 border border-dashed border-white/[0.08] hover:border-white/[0.2] rounded-lg text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed";
  const chevronClass = `text-zinc-500 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`;

  return (
    <div className="flex flex-col gap-2">
      <button type="button" disabled={disabled} onClick={toggleOpen} className={triggerClass}>
        <Plus size={12} />
        Add Block
        <ChevronDown size={12} className={chevronClass} />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-white/[0.05] bg-black/10 p-2">
          {presetOptions.map(({ template, dotClass, handleAdd }) => {
            const rowClass =
              "flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors duration-150 text-left";
            return (
              <button key={template.id} type="button" onClick={handleAdd} className={rowClass}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotClass} shrink-0`} />
                <span className="text-xs text-zinc-200 font-medium flex-1">{template.name}</span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {template.startTime}–{template.endTime}
                </span>
              </button>
            );
          })}

          <div className="h-px bg-white/[0.06] my-1" />

          <button
            type="button"
            onClick={() => {
              onAddCustom();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors duration-150 text-left"
          >
            <SlidersHorizontal size={12} className="text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-300">Custom block…</span>
          </button>
        </div>
      )}
    </div>
  );
}