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

export function TabBar({
  groups,
  activeGroup,
  onGroupChange,
  subgroups,
  activeSubgroup,
  onSubgroupChange,
  className = "",
}: TabBarProps) {
  const wrapperClass = `glass-card p-2 flex flex-col gap-1.5 ${className}`;
  const showSubgroups = !!subgroups && subgroups.length > 1 && !!onSubgroupChange;

  if (groups.length === 0) return null;

  return (
    <div className={wrapperClass}>
      <div className="flex gap-1 overflow-x-auto">
        {groups.map((tab) => {
          const isActive = activeGroup === tab.id;
          const tabClass = `flex items-center gap-2 whitespace-nowrap px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 shrink-0 ${
            isActive
              ? "bg-accent text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
          }`;
          const countClass = `text-label px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : "bg-white/5"}`;

          return (
            <button key={tab.id} onClick={() => onGroupChange(tab.id)} className={tabClass}>
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && <span className={countClass}>{tab.count}</span>}
            </button>
          );
        })}
      </div>

      {showSubgroups && (
        <div className="flex gap-1 overflow-x-auto pt-1.5 border-t border-white/[0.06]">
          {subgroups!.map((tab) => {
            const isActive = activeSubgroup === tab.id;
            const tabClass = `flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-caption transition-all duration-150 shrink-0 ${
              isActive
                ? "bg-accent/15 text-accent font-medium"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
            }`;

            return (
              <button key={tab.id} onClick={() => onSubgroupChange!(tab.id)} className={tabClass}>
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
