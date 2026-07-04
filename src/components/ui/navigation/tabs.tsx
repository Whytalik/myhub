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
    <div >
      <div >
        <div >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}

              >
                {isActive && (
                  <motion.div
                    layoutId={layoutId}

                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span >
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div >
        {tabs.map((tab) => {
          const isVisited = visitedTabs.has(tab.id);
          const isActive = activeTab === tab.id;

          if (!isVisited || !tab.content) return null;

          return (
            <div
              key={tab.id}

            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
