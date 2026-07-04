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
    <div >
      {}
      <div >
        {groups.map((tab) => {
          const isActive = activeGroup === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onGroupChange(tab.id)}

            >
              {tab.icon && <span >{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {}
      {subgroups && subgroups.length > 1 && onSubgroupChange && (
        <div >
          {subgroups.map((tab) => {
            const isActive = activeSubgroup === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSubgroupChange(tab.id)}

              >
                {tab.icon && <span >{tab.icon}</span>}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
