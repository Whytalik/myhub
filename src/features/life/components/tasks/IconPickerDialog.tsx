"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Input } from "@/components/ui/inputs/input";
import { ALL_ICONS, SPHERE_ICON_NAMES } from "./lucide-icons-map";

interface IconPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  value: string | null;
  onChange: (icon: string | null) => void;
  color?: string;
  title?: string;
}

export function IconPickerDialog({
  isOpen,
  onClose,
  value,
  onChange,
  title = "Pick an icon",
}: IconPickerDialogProps) {
  const [search, setSearch] = useState("");

  const filteredIcons = SPHERE_ICON_NAMES.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (name: string | null) => {
    onChange(name);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Choose a visual symbol"
      maxWidth="600px"
    >
      <div className="flex flex-col gap-4">
        <div className="glass-input flex items-center gap-2 px-3 py-2">
          <Search size={18} className="text-zinc-500 shrink-0" />
          <Input
            variant="inline"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all icons..."
            autoFocus
            className="flex-1"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-8 gap-1 max-h-80 overflow-y-auto">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="aspect-square flex flex-col items-center justify-center gap-0.5 rounded-lg text-zinc-500 hover:bg-white/5 hover:text-zinc-200 transition-colors"
          >
            <X size={16} />
            <span className="text-[9px] uppercase tracking-wide">None</span>
          </button>

          {filteredIcons.map((name) => {
            const Icon = ALL_ICONS[name];
            const isSelected = value === name;
            const iconButtonClass = `aspect-square flex items-center justify-center rounded-lg transition-colors ${
              isSelected
                ? "bg-accent/15 text-accent"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`;

            return (
              <button
                key={name}
                type="button"
                onClick={() => handleSelect(name)}
                className={iconButtonClass}
                title={name}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>

        {filteredIcons.length === 0 && (
          <div className="flex items-center justify-center p-6">
            <p className="text-caption">No matching icons found.</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
