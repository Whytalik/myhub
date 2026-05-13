import { ReactNode } from "react";

interface TabBarItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabBarProps {
  tabs: TabBarItem[];
  activeId: string;
  onTabChange: (id: string) => void;
  variant?: "primary" | "sub";
  className?: string;
}

export function TabBar({ tabs, activeId, onTabChange, variant = "primary", className = "" }: TabBarProps) {
  if (tabs.length === 0) return null;

  const isPrimary = variant === "primary";

  return (
    <div className={`p-1.5 bg-surface border border-border/50 rounded-xl shadow-sm overflow-x-auto scrollbar-hide ${className}`}>
      <div className="flex gap-1 min-w-fit">
        {tabs.map((tab) => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg text-note font-medium transition-all duration-200
                ${isActive
                  ? isPrimary
                    ? "bg-accent text-bg font-semibold shadow-sm"
                    : "bg-text text-bg font-semibold shadow-sm"
                  : isPrimary
                    ? "text-secondary hover:text-text hover:bg-raised"
                    : "text-muted hover:text-text hover:bg-raised"
                }
              `}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-label px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? isPrimary
                      ? "bg-white/20"
                      : "bg-white/20"
                    : "bg-raised"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
