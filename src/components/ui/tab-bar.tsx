import { ReactNode } from "react";

interface TabBarItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabBarProps {
  groups: TabBarItem[];
  activeGroup: string;
  onGroupChange: (id: string) => void;
  subgroups?: TabBarItem[];
  activeSubgroup?: string;
  onSubgroupChange?: (id: string) => void;
  className?: string;
}

export function TabBar({ groups, activeGroup, onGroupChange, subgroups, activeSubgroup, onSubgroupChange, className = "" }: TabBarProps) {
  if (groups.length === 0) return null;

  return (
    <div className={`w-full p-2 bg-surface border border-border/50 rounded-xl shadow-sm ${className}`}>
      {/* Groups row */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide min-w-fit max-w-full">
        {groups.map((tab) => {
          const isActive = activeGroup === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onGroupChange(tab.id)}
              className={`
                relative flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg text-note font-medium transition-all duration-200 shrink-0
                ${isActive
                  ? "bg-accent text-[#0a0a0b] font-semibold shadow-sm"
                  : "text-secondary hover:text-text hover:bg-raised"
                }
              `}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-label px-1.5 py-0.5 rounded-md ${
                  isActive ? "bg-white/20" : "bg-raised"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Subgroups row */}
      {subgroups && subgroups.length > 1 && onSubgroupChange && (
        <div className="flex gap-1 overflow-x-auto scrollbar-hide min-w-fit max-w-full mt-1.5 pt-1.5 border-t border-border/30">
          {subgroups.map((tab) => {
            const isActive = activeSubgroup === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSubgroupChange(tab.id)}
                className={`
                  relative flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-caption font-mono transition-all duration-200 shrink-0
                  ${isActive
                    ? "bg-accent/20 text-accent font-medium"
                    : "text-muted hover:text-text hover:bg-raised"
                  }
                `}
              >
                {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
