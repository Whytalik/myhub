"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
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
  color = "var(--color-accent)",
  title = "Pick an icon"
}: IconPickerDialogProps) {
  const [search, setSearch] = useState("");

  const filteredIcons = SPHERE_ICON_NAMES.filter(name => 
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Choose a visual symbol"
      maxWidth="600px"
    >
      <div className="flex flex-col gap-6">
        {/* Search */}
        <div className="flex items-center gap-3 px-4 h-11 bg-surface border border-border rounded-2xl focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent transition-all">
          <Search size={18} className="text-muted" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all icons..."
            className="flex-1 bg-transparent outline-none text-[14px] text-text placeholder:text-muted font-medium h-full"
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted hover:text-text p-1">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
          {/* None Option */}
          <button
            type="button"
            onClick={() => {
              onChange(null);
              onClose();
            }}
            className={`flex items-center justify-center aspect-square rounded-xl border transition-all ${
              value === null 
                ? "border-accent bg-accent/10 shadow-lg scale-105" 
                : "border-border/50 hover:bg-raised hover:border-border"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <X size={16} className={value === null ? "text-accent" : "text-muted/40"} />
              <span className="text-[8px] font-mono uppercase tracking-tighter text-muted/40">None</span>
            </div>
          </button>

          {filteredIcons.map((name) => {
            const Icon = ALL_ICONS[name];
            const isSelected = value === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name);
                  onClose();
                }}
                className={`flex items-center justify-center aspect-square rounded-xl border transition-all group ${
                  isSelected 
                    ? "border-accent bg-accent/10 shadow-lg scale-105" 
                    : "border-border/50 hover:bg-raised hover:border-border"
                }`}
                style={isSelected ? { borderColor: color, backgroundColor: `${color}15` } : undefined}
                title={name}
              >
                <Icon 
                  size={20} 
                  className="transition-transform group-hover:scale-110"
                  style={{ color: isSelected ? color : "var(--color-muted)" }} 
                />
              </button>
            );
          })}
        </div>

        {filteredIcons.length === 0 && (
          <div className="py-12 text-center border border-dashed border-border rounded-2xl bg-raised/10">
             <p className="text-sm text-muted font-medium italic">No matching icons found.</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
