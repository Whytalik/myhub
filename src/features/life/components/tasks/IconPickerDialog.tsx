"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog } from "@/components/ui/overlays/dialog";
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
  color = "#fbbf24",
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
      <div >
        {}
        <div >
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all icons..."

            autoFocus
          />
          {search && (
            <button onClick={() => setSearch("")} >
              <X size={16} />
            </button>
          )}
        </div>

        {}
        <div >
          {}
          <button
            type="button"
            onClick={() => {
              onChange(null);
              onClose();
            }}

          >
            <div >
              <X size={16} />
              <span >None</span>
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


                title={name}
              >
                <Icon
                  size={20}


                />
              </button>
            );
          })}
        </div>

        {filteredIcons.length === 0 && (
          <div >
             <p >No matching icons found.</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
