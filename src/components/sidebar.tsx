"use client";

import { logoutAction } from "@/actions/logout";
import type { LucideIcon } from "lucide-react";
import { useSidebar } from "./sidebar-provider";
import { useSpace } from "./space-provider";
import {
  Activity,
  BookText,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  Compass,
  Dumbbell,
  HelpCircle,
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
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
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

// --- Theme Configuration ---
const spaceColors: Record<string, { text: string; bgActive: string; bgInactive: string; borderActive: string; borderInactive: string }> = {
  "Life Space":     { text: "#6fbfbf", bgActive: "rgba(111,191,191,0.10)", bgInactive: "rgba(111,191,191,0.02)", borderActive: "rgba(111,191,191,0.25)", borderInactive: "rgba(111,191,191,0.1)" },
  "Planning Space": { text: "#fbbf24", bgActive: "rgba(251,191,36,0.10)",  bgInactive: "rgba(251,191,36,0.02)",  borderActive: "rgba(251,191,36,0.25)",  borderInactive: "rgba(251,191,36,0.1)" },
  "Food Space":     { text: "#ff8c00", bgActive: "rgba(255,140,0,0.10)",   bgInactive: "rgba(255,140,0,0.02)",   borderActive: "rgba(255,140,0,0.25)",   borderInactive: "rgba(255,140,0,0.1)" },
  "Fitness Space":  { text: "#e87d88", bgActive: "rgba(232,125,136,0.10)", bgInactive: "rgba(232,125,136,0.02)", borderActive: "rgba(232,125,136,0.25)", borderInactive: "rgba(232,125,136,0.1)" },
  "Language Space": { text: "#c084fc", bgActive: "rgba(192,132,252,0.10)", bgInactive: "rgba(192,132,252,0.02)", borderActive: "rgba(192,132,252,0.25)", borderInactive: "rgba(192,132,252,0.1)" },
  "Library Space":  { text: "#818cf8", bgActive: "rgba(129,140,248,0.10)", bgInactive: "rgba(129,140,248,0.02)", borderActive: "rgba(129,140,248,0.25)", borderInactive: "rgba(129,140,248,0.1)" },
  "Trading Space":  { text: "#22c55e", bgActive: "rgba(34,197,94,0.10)",  bgInactive: "rgba(34,197,94,0.02)",  borderActive: "rgba(34,197,94,0.25)",  borderInactive: "rgba(34,197,94,0.1)" },
  "Misc / Other":   { text: "#a3a3a3", bgActive: "rgba(163,163,163,0.10)", bgInactive: "rgba(163,163,163,0.02)", borderActive: "rgba(163,163,163,0.25)", borderInactive: "rgba(163,163,163,0.1)" },
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
  const isAdmin = user?.role === "ADMIN";

  const [order, setOrder] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
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
    items: { href: string; label: string; icon: LucideIcon; subItems?: { href: string; label: string; icon: LucideIcon }[] }[],
  ) => {
    return (
      <div
        key={label}
        className="flex flex-col gap-4 animate-in fade-in duration-500"
      >
        <div className="flex flex-col gap-2.5 px-1">
          {items.map((item) => {
            const isItemActive = pathname.startsWith(item.href);
            const subSectionKey = `${label}-${item.label}`;
            const isSubOpen = openSections[subSectionKey] ?? isItemActive;
            const ItemIcon = item.icon;
            const color = spaceColors[item.label] || spaceColors["Misc / Other"];

            return (
              <div 
                key={item.href} 
                className={`flex flex-col border rounded-2xl p-1 transition-all duration-300 ${
                  isItemActive ? "border-border shadow-sm" : "bg-surface/30 border-border/40"
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
                        style={{ color: isItemActive ? color.text : 'rgba(255,255,255,0.4)' }} 
                        strokeWidth={isItemActive ? 2.5 : 2}
                        className="transition-colors"
                      />
                    </div>
                    <div className={`flex-1 transition-all duration-300 overflow-hidden whitespace-nowrap ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
                      <span className="transition-colors" style={{ color: isItemActive ? color.text : 'rgba(255,255,255,0.6)' }}>
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
                        style={{ color: isItemActive ? color.text : 'rgba(255,255,255,0.3)' }}
                      />
                    </button>
                  )}
                </div>
                
                {isExpanded && item.subItems && isSubOpen && (
                  <div className="flex flex-col gap-1 pl-7 pr-1 pb-1 pt-1 animate-in slide-in-from-top-2 duration-300">
                    <div className="border-t mb-1" style={{ borderColor: isItemActive ? color.borderActive : 'rgba(255,255,255,0.1)' }} />
                    {item.subItems.map(sub => {
                      const SubIcon = sub.icon;
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors overflow-hidden whitespace-nowrap"
                          style={{ 
                            color: isSubActive ? color.text : 'rgba(255,255,255,0.5)',
                            backgroundColor: isSubActive ? 'rgba(255,255,255,0.05)' : 'transparent'
                          }}
                        >
                          <SubIcon size={12} style={{ color: isSubActive ? color.text : 'currentColor', opacity: isSubActive ? 1 : 0.6 }} strokeWidth={isSubActive ? 2.5 : 2} className="shrink-0" />
                          <span className={`${isSubActive ? "font-bold" : ""} truncate`}>{sub.label}</span>
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
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        sticky top-0 h-screen bg-surface border-r border-border flex flex-col shrink-0 transition-all duration-500 ease-in-out z-[100]
        ${isExpanded ? "w-64" : "w-20"}
      `}
    >
      <div className={`shrink-0 py-6 flex items-center transition-all duration-300 ${isExpanded ? "px-6 justify-between" : "justify-center"}`}>
        <Link href="/home" className="flex items-center gap-3 group overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles size={18} className="text-bg" fill="currentColor" />
          </div>
          <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isExpanded ? "opacity-100 w-auto ml-1" : "opacity-0 w-0"}`}>
            <h1 className="text-base font-black text-text tracking-tighter leading-none">MYHUB</h1>
            <p className="text-[9px] font-mono text-accent uppercase tracking-widest mt-1">Personal OS</p>
          </div>
        </Link>
        
        {isExpanded && (
          <button 
            onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}
            className={`p-1.5 rounded-lg transition-all ${!isCollapsed ? "text-accent bg-accent/10" : "text-muted hover:text-text hover:bg-raised"}`}
            title={!isCollapsed ? "Unlock sidebar" : "Lock expanded"}
          >
            {!isCollapsed ? <Pin size={14} /> : <PinOff size={14} />}
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
                { label: "Planning Space", href: "/planning", icon: Compass, subItems: planningNav },
                { label: "Life Space", href: "/life", icon: Sparkles, subItems: lifeSpaceNav },
              ]);
            if (section === "health" && isAdmin)
              return renderNavGroup("Health", [
                { label: "Food Space", href: "/food", icon: ChefHat, subItems: foodNav },
                { label: "Fitness Space", href: "/fitness", icon: Dumbbell, subItems: fitnessNav },
              ]);
            if (section === "mind" && isAdmin)
              return renderNavGroup("Mind", [
                { label: "Language Space", href: "/languages", icon: Languages, subItems: languagesNav },
                { label: "Library Space", href: "/library", icon: BookText, subItems: libraryNav },
              ]);
            if (section === "wealth" && isAdmin)
              return renderNavGroup("Wealth", [
                { label: "Trading Space", href: "/trading", icon: TrendingUp, subItems: tradingNav },
              ]);
            if (section === "vault")
              return renderNavGroup("Vault", [
                { label: "Misc / Other", href: "/other", icon: Package, subItems: otherNav },
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
                <Link href="/settings" className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-raised transition-colors"><Settings2 size={13} /></Link>
                <form action={logoutAction}><button type="submit" className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-raised transition-colors"><LogOut size={13} /></button></form>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
