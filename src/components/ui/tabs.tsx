"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  className?: string;
  contentClassName?: string;
  variant?: string;
}

export function Tabs({ 
  tabs, 
  activeTab: controlledActiveTab, 
  onTabChange, 
  className,
  contentClassName 
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState(tabs[0]?.id);
  
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabClick = (id: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(id);
    }
    onTabChange?.(id);
  };

  const activeTabContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className={`flex ${className}`}>
        <div className="flex p-1 bg-surface border border-border/50 rounded-2xl shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex items-center gap-2 whitespace-nowrap px-6 py-2 rounded-xl text-[11px] font-mono uppercase tracking-widest transition-all
                  ${
                    isActive
                      ? "bg-accent text-bg font-bold shadow-lg shadow-accent/20"
                      : "text-secondary hover:text-text hover:bg-raised/50"
                  }
                `}
              >
                {Icon && <Icon size={14} />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTabContent && (
        <div className={contentClassName}>
          {activeTabContent}
        </div>
      )}
    </div>
  );
}
