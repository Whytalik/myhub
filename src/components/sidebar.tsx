"use client";

import { logoutAction } from "@/actions/logout";
import type { LucideIcon } from "lucide-react";
import { useSidebar } from "./sidebar-provider";
import { useSpace } from "./space-provider";
import { SettingsModal } from "./settings-modal";
import { ICON_LIBRARY, IconName } from "@/lib/constants/icons";
import {
  Activity,
  BookText,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  Compass,
  Dumbbell,
  History,
  Languages,
  LayoutDashboard,
  LogOut,
  Package,
  Settings2,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
  Briefcase,
  Shield,
  Brain,
  Database,
  Pin,
  PinOff
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// --- Navigation Data ---
const foodNav = [
  { href: "/food/profiles", label: "Profiles", icon: Users },
  { href: "/food/products", label: "Products", icon: Package },
  { href: "/food/dishes", label: "Dishes", icon: ChefHat },
  { href: "/food/plans", label: "Plans", icon: CalendarDays },
  { href: "/food/shopping", label: "Shopping", icon: ShoppingCart },
];

const fitnessNav = [
  { href: "/fitness/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/fitness/exercises", label: "Exercises", icon: Activity },
  { href: "/fitness/progress", label: "Progress", icon: TrendingUp },
];

const lifeSpaceNav = [
  { href: "/life/journal", label: "Journal", icon: BookText },
  { href: "/life/habits", label: "Habits", icon: Zap },
  { href: "/life/tasks", label: "Tasks", icon: CheckCircle2 },
  { href: "/life/journal/stats", label: "Statistics", icon: LayoutDashboard },
];

const planningNav = [
  { href: "/planning/vision", label: "Vision & Milestones", icon: Target },
  { href: "/planning/compass", label: "Annual Compass", icon: Compass },
  { href: "/planning/sprints", label: "12-Week Sprints", icon: Zap },
  { href: "/planning/reviews", label: "Review Center", icon: CheckCircle2 },
];

const libraryNav = [
  { href: "/library/books", label: "Books", icon: BookText },
  { href: "/library/articles", label: "Articles", icon: Sparkles },
];

const languagesNav = [
  { href: "/languages/vocabulary", label: "Vocabulary", icon: Sparkles },
  { href: "/languages/journal", label: "Immersion Log", icon: History },
  { href: "/languages/resources", label: "Resources", icon: BookText },
];

const tradingNav = [
  { href: "/trading/journal", label: "Trade Log", icon: BookText },
  { href: "/trading/portfolio", label: "Portfolio", icon: Package },
];

const otherNav = [
  { href: "/other/wishlist", label: "Wishlist", icon: Target },
];

// --- Default Theme Configuration ---
const defaultSpaceColors: Record<string, { text: string; bgActive: string; bgInactive: string; borderActive: string; borderInactive: string }> = {
  "Life Space":     { text: "#6fbfbf", bgActive: "var(--color-life-muted)", bgInactive: "transparent", borderActive: "rgba(111,191,191,0.2)", borderInactive: "var(--color-border)" },
  "Planning Space": { text: "#fbbf24", bgActive: "rgba(251,191,36,0.1)",  bgInactive: "transparent",  borderActive: "rgba(251,191,36,0.2)",  borderInactive: "var(--color-border)" },
  "Food Space":     { text: "#ff8c00", bgActive: "rgba(255,140,0,0.1)",   bgInactive: "transparent",   borderActive: "rgba(255,140,0,0.2)",   borderInactive: "var(--color-border)" },
  "Fitness Space":  { text: "#e87d88", bgActive: "rgba(232,125,136,0.1)", bgInactive: "transparent", borderActive: "rgba(232,125,136,0.2)", borderInactive: "var(--color-border)" },
  "Language Space": { text: "#c084fc", bgActive: "rgba(192,132,252,0.1)", bgInactive: "transparent", borderActive: "rgba(192,132,252,0.2)", borderInactive: "var(--color-border)" },
  "Library Space":  { text: "#818cf8", bgActive: "rgba(129,140,248,0.1)", bgInactive: "transparent", borderActive: "rgba(129,140,248,0.2)", borderInactive: "var(--color-border)" },
  "Trading Space":  { text: "#22c55e", bgActive: "rgba(34,197,94,0.1)",  bgInactive: "transparent",  borderActive: "rgba(34,197,94,0.2)",  borderInactive: "var(--color-border)" },
  "Misc / Other":   { text: "#a3a3a3", bgActive: "rgba(163,163,163,0.1)", bgInactive: "transparent", borderActive: "rgba(163,163,163,0.2)", borderInactive: "var(--color-border)" },
};

interface SidebarProps {
  user?: { name: string; email: string; role?: string };
  initialOrder?: string[];
}

export function Sidebar({ user, initialOrder }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { activeDomain } = useSpace();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customizations, setCustomizations] = useState<Record<string, { icon?: string, color?: string }>>({});
  const isAdmin = user?.role === "ADMIN";

  const [order, setOrder] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const loadCustomizations = () => {
    const saved = localStorage.getItem("system-customizations");
    if (saved) setCustomizations(JSON.parse(saved));
  };

  useEffect(() => {
    setMounted(true);
    loadCustomizations();
    window.addEventListener("system-customizations-updated", loadCustomizations);
    return () => window.removeEventListener("system-customizations-updated", loadCustomizations);
  }, []);

  useEffect(() => {
    const ALL_DOMAINS_CURRENT = isAdmin 
      ? ["operations", "health", "mind", "wealth", "vault"]
      : ["operations", "vault"];

    const mergeOrder = (saved: string[]) => {
      const filteredSaved = saved.filter(s => ALL_DOMAINS_CURRENT.includes(s));
      return [
        ...filteredSaved,
        ...ALL_DOMAINS_CURRENT.filter((s) => !filteredSaved.includes(s)),
      ];
    };

    if (initialOrder) {
      setOrder(mergeOrder(initialOrder));
    } else {
      const savedOrder = localStorage.getItem("sidebar-domains-order");
      if (savedOrder) {
        try {
          setOrder(mergeOrder(JSON.parse(savedOrder)));
        } catch {
          setOrder(ALL_DOMAINS_CURRENT);
        }
      } else {
        setOrder(ALL_DOMAINS_CURRENT);
      }
    }
  }, [initialOrder, isAdmin]);

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  if (!mounted) return <aside className="w-20 bg-surface border-r border-border h-screen shrink-0" />;

  const isExpanded = !isCollapsed || isHovered;

  const renderNavGroup = (
    label: string,
    items: { href: string; label: string; icon: LucideIcon, id: string; subItems?: { href: string; label: string; icon: LucideIcon }[] }[],
  ) => {
    return (
      <div key={label} className="flex flex-col gap-4 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2.5 px-1">
          {items.map((item) => {
            const isItemActive = pathname.startsWith(item.href);
            const subSectionKey = `${label}-${item.label}`;
            const isSubOpen = openSections[subSectionKey] ?? isItemActive;
            
            const custom = customizations[item.id];
            const ItemIcon = custom?.icon ? (ICON_LIBRARY[custom.icon as IconName] || item.icon) : item.icon;
            const baseColor = custom?.color || defaultSpaceColors[item.label]?.text || "#a3a3a3";
            
            const color = {
               text: baseColor,
               bgActive: `${baseColor}15`,
               bgInactive: "transparent",
               borderActive: `${baseColor}30`,
               borderInactive: "var(--color-border)"
            };

            return (
              <div 
                key={item.href} 
                className={`flex flex-col border rounded-2xl p-1 transition-all duration-300 ${
                  isItemActive ? "shadow-sm" : "bg-surface/30 border-border/40"
                }`}
                style={{ 
                  backgroundColor: isItemActive ? color.bgActive : color.bgInactive,
                  borderColor: isItemActive ? color.borderActive : color.borderInactive,
                }}
              >
                <div className="flex items-center justify-between group">
                  <Link
                    href={item.href}
                    className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 ${!isExpanded ? "justify-center" : ""}`}
                  >
                    <div className="w-5 flex justify-center shrink-0">
                      <ItemIcon 
                        size={18} 
                        style={{ color: isItemActive ? color.text : undefined }} 
                        strokeWidth={isItemActive ? 2.5 : 2}
                        className={`transition-colors ${isItemActive ? "" : "text-muted group-hover:text-secondary"}`}
                      />
                    </div>
                    <div className={`flex-1 transition-all duration-300 overflow-hidden whitespace-nowrap ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
                      <span 
                        className="transition-colors" 
                        style={{ color: isItemActive ? color.text : undefined }}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                  {isExpanded && item.subItems && (
                    <button
                      onClick={() => toggleSection(subSectionKey)}
                      className="p-2 text-muted hover:text-text transition-colors"
                    >
                      <ChevronRight 
                        size={14} 
                        className={`transition-transform duration-300 ${isSubOpen ? "rotate-90" : ""}`} 
                        style={{ color: isItemActive ? color.text : undefined }}
                      />
                    </button>
                  )}
                </div>
                
                {isExpanded && item.subItems && isSubOpen && (
                  <div className="flex flex-col gap-1 pl-7 pr-1 pb-1 pt-1 animate-in slide-in-from-top-2 duration-300">
                    <div className="border-t border-border/40 mb-1" />
                    {item.subItems.map(sub => {
                      const SubIcon = sub.icon;
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors overflow-hidden whitespace-nowrap ${
                            isSubActive ? "bg-accent/5 font-bold" : "text-secondary hover:text-text"
                          }`}
                          style={{ color: isSubActive ? color.text : undefined }}
                        >
                          <SubIcon 
                            size={12} 
                            style={{ color: isSubActive ? color.text : undefined }} 
                            strokeWidth={isSubActive ? 2.5 : 2} 
                            className="shrink-0" 
                          />
                          <span className="truncate">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          sticky top-0 h-screen bg-surface border-r border-border flex flex-col shrink-0 transition-all duration-500 ease-in-out z-[100]
          ${isExpanded ? "w-64 shadow-2xl" : "w-20"}
        `}
      >
        {/* Branding & Pin Row */}
        <div className={`shrink-0 py-8 flex items-center transition-all duration-300 ${isExpanded ? "px-6 justify-between" : "justify-center"}`}>
          <Link href="/home" className="flex items-center gap-3 group overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles size={20} className="text-bg" fill="currentColor" />
            </div>
            <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isExpanded ? "opacity-100 w-auto ml-1" : "opacity-0 w-0"}`}>
              <h1 className="text-base font-black text-text tracking-tighter leading-none">MYHUB</h1>
              <p className="text-[9px] font-mono text-accent uppercase tracking-widest mt-1">Personal OS</p>
            </div>
          </Link>

          {isExpanded && (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}
              className={`p-2 rounded-xl transition-all ${
                !isCollapsed 
                  ? "text-accent bg-accent/10 border border-accent/20" 
                  : "text-muted hover:text-text hover:bg-raised"
              }`}
              title={!isCollapsed ? "Unpin sidebar" : "Pin sidebar"}
            >
              <Pin size={14} className={!isCollapsed ? "rotate-45" : ""} />
            </button>
          )}
        </div>

        <div className={`flex-1 overflow-y-auto scrollbar-hide flex flex-col scroll-smooth transition-all duration-300 ${isExpanded ? "px-3" : "px-2"}`}>
          <div className={`mb-6 transition-all duration-300 ${isExpanded ? "px-3" : "px-1"}`}>
            <div className="h-px w-full bg-border/40" />
          </div>
          <nav className="flex flex-col gap-4">
            {order.map((section) => {
              if (section !== activeDomain) return null;

              if (section === "operations")
                return renderNavGroup("Operations", [
                  { id: "planning", label: "Planning Space", href: "/planning", icon: Compass },
                  { id: "life", label: "Life Space", href: "/life", icon: Sparkles, subItems: lifeSpaceNav },
                ]);
              if (section === "health" && isAdmin)
                return renderNavGroup("Health", [
                  { id: "food", label: "Food Space", href: "/food", icon: ChefHat, subItems: foodNav },
                  { id: "fitness", label: "Fitness Space", href: "/fitness", icon: Dumbbell, subItems: fitnessNav },
                ]);
              if (section === "mind" && isAdmin)
                return renderNavGroup("Mind", [
                  { id: "languages", label: "Language Space", href: "/languages", icon: Languages, subItems: languagesNav },
                  { id: "library", label: "Library Space", href: "/library", icon: BookText, subItems: libraryNav },
                ]);
              if (section === "wealth" && isAdmin)
                return renderNavGroup("Wealth", [
                  { id: "trading", label: "Trading Space", href: "/trading", icon: TrendingUp, subItems: tradingNav },
                ]);
              if (section === "vault")
                return renderNavGroup("Vault", [
                  { id: "other", label: "Misc / Other", href: "/other", icon: Package, subItems: otherNav },
                ]);
              return null;
            })}
          </nav>
        </div>

        <div className="border-t border-border mt-auto" />
        <div className={`shrink-0 flex flex-col gap-1 pb-4 pt-2 transition-all duration-300 ${isExpanded ? "px-4" : "px-2"}`}>
          {user && (
            <div className="flex items-center gap-3 px-1 py-1 w-full overflow-hidden">
              <Link href="/profile" className={`flex items-center gap-3 p-1.5 rounded-xl transition-all hover:bg-raised group/profile ${pathname === '/profile' ? 'bg-raised/80' : ''} ${isExpanded ? "flex-1 min-w-0" : "w-12 h-12 justify-center"}`}>
                <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
                  <span className="text-accent text-[12px] font-bold">{user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span>
                </div>
                <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
                  <p className="text-[13px] font-semibold text-text truncate">{user.name}</p>
                  <p className="text-[11px] text-muted truncate">{user.email}</p>
                </div>
              </Link>
              {isExpanded && (
                <div className="flex items-center gap-0.5 animate-in fade-in duration-500">
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-raised transition-colors"
                  >
                    <Settings2 size={13} />
                  </button>
                  <form action={logoutAction}>
                    <button type="submit" className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-raised transition-colors">
                      <LogOut size={13} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        initialOrder={order}
        userName={user?.name}
      />
    </>
  );
}
