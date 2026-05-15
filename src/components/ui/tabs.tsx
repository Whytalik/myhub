"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  className?: string;
  contentClassName?: string;
  variant?: string;
  size?: string;
  layoutId?: string;
}

export function Tabs({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  className,
  contentClassName,
  size = "text-note md:text-body",
  layoutId = "activeTab"
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState(tabs[0]?.id);
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const [visitedTabs, setVisitedTabs] = React.useState<Set<string>>(new Set([activeTab]));

  React.useEffect(() => {
    if (activeTab && !visitedTabs.has(activeTab)) {
      setVisitedTabs(prev => new Set([...prev, activeTab]));
    }
  }, [activeTab, visitedTabs]);

  const [isPending, startTransition] = React.useTransition();

  const handleTabClick = (id: string) => {
    startTransition(() => {
      if (!controlledActiveTab) {
        setInternalActiveTab(id);
      }
      onTabChange?.(id);
    });
  };

  return (
    <div className="flex flex-col w-full min-w-0 gap-6">
      <div className={`flex w-full overflow-x-auto scrollbar-hide ${className}`}>
        <div className="flex p-1 bg-surface border border-border/50 rounded-xl shadow-sm w-fit relative">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  relative flex items-center gap-2 whitespace-nowrap px-4 md:px-6 py-2 rounded-lg ${size} font-medium transition-colors duration-200 z-10
                  ${
                    isActive
                      ? "text-bg font-semibold"
                      : "text-secondary hover:text-text"
                  }
                  ${isPending && isActive ? "opacity-70" : ""}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId={layoutId}
                    className="absolute inset-0 bg-accent rounded-lg shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`relative ${contentClassName}`}>
        {tabs.map((tab) => {
          const isVisited = visitedTabs.has(tab.id);
          const isActive = activeTab === tab.id;

          if (!isVisited || !tab.content) return null;

          return (
            <div
              key={tab.id}
              className={`w-full transition-opacity duration-200 ${
                isActive ? "block opacity-100" : "hidden opacity-0"
              }`}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
