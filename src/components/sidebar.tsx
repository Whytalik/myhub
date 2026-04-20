"use client";

import { logoutAction } from "@/actions/logout";
import type { LucideIcon } from "lucide-react";
import { useSidebar } from "./sidebar-provider";
import {
  Activity,
  BookText,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  ChevronRight,
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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const foodNav = [
  { href: "/food/profiles", label: "Profiles", icon: Users },
  { href: "/food/products", label: "Products", icon: Package },
  { href: "/food/dishes", label: "Dishes", icon: ChefHat },
  { href: "/food/plans", label: "Plans", icon: CalendarDays },
  { href: "/food/shopping", label: "Shopping", icon: ShoppingCart },
];

const lifeSpaceNav = [
  { href: "/life/journal", label: "Journal", icon: BookText },
  { href: "/life/habits", label: "Habits", icon: Zap },
  { href: "/life/tasks", label: "Tasks", icon: CheckCircle2 },
  { href: "/life/journal/stats", label: "Statistics", icon: LayoutDashboard },
];


const fitnessNav = [
  { href: "/fitness/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/fitness/exercises", label: "Exercises", icon: Activity },
  { href: "/fitness/progress", label: "Progress", icon: TrendingUp },
];

const libraryNav = [
  { href: "/library", label: "Library", icon: BookText },
  { href: "/library/books", label: "Books", icon: BookText },
  { href: "/library/articles", label: "Articles", icon: Sparkles },
];

const languagesNav = [
  { href: "/languages", label: "Dashboard", icon: LayoutDashboard },
  { href: "/languages/vocabulary", label: "Vocabulary", icon: Sparkles },
  { href: "/languages/journal", label: "Immersion Log", icon: History },
  { href: "/languages/resources", label: "Resources", icon: BookText },
];

const tradingNav = [
  { href: "/trading", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trading/journal", label: "Journal", icon: BookText },
  { href: "/trading/portfolio", label: "Portfolio", icon: Package },
];

const otherNav = [
  { href: "/other/wishlist", label: "Wishlist", icon: Target },
];

const spaceColors: Record<string, { text: string; bg: string }> = {
  "Life Space": { text: "#6fbfbf", bg: "rgba(111,191,191,0.10)" },
  "Library Space": { text: "#818cf8", bg: "rgba(129,140,248,0.10)" },
  "Food Space": { text: "#f0a868", bg: "rgba(240,168,104,0.10)" },
  "Fitness Space": { text: "#e87d88", bg: "rgba(232,125,136,0.10)" },
  "Language Space": { text: "#c084fc", bg: "rgba(192,132,252,0.10)" },
  "Trading Space": { text: "#22c55e", bg: "rgba(34,197,94,0.10)" },
  "Misc / Other": { text: "#a3a3a3", bg: "rgba(163,163,163,0.10)" },
};

interface SidebarProps {
  user?: { name: string; email: string; role?: string };
  initialOrder?: string[];
}

export function Sidebar({ user, initialOrder }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const ALL_SECTIONS = isAdmin
    ? ["food", "life", "fitness", "library", "languages", "trading", "other"]
    : ["life", "other"];

  const [order, setOrder] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    const ALL_SECTIONS_CURRENT = user?.role === "ADMIN" 
      ? ["food", "life", "fitness", "library", "languages", "trading", "other"]
      : ["life", "other"];

    const mergeOrder = (saved: string[]) => [
      ...saved,
      ...ALL_SECTIONS_CURRENT.filter((s) => !saved.includes(s)),
    ];

    if (initialOrder) {
      setOrder(mergeOrder(initialOrder));
    } else {
      const savedOrder = localStorage.getItem("sidebar-spaces-order");
      if (savedOrder) {
        try {
          setOrder(mergeOrder(JSON.parse(savedOrder)));
        } catch {
          setOrder(ALL_SECTIONS_CURRENT);
        }
      } else {
        setOrder(ALL_SECTIONS_CURRENT);
      }
    }
  }, [initialOrder, user?.role]);

  useEffect(() => {
    const handleSync = () => {
      const savedOrder = localStorage.getItem("sidebar-spaces-order");
      if (savedOrder) {
        try {
          const ALL_SECTIONS_CURRENT = user?.role === "ADMIN" 
            ? ["food", "life", "fitness", "library", "languages", "other"]
            : ["life", "other"];
          
          const mergeOrder = (saved: string[]) => [
            ...saved,
            ...ALL_SECTIONS_CURRENT.filter((s) => !saved.includes(s)),
          ];
          setOrder(mergeOrder(JSON.parse(savedOrder)));
        } catch {}
      }
    };

    window.addEventListener("sidebar-order-updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("sidebar-order-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  if (!mounted) return <aside className="hidden md:flex w-64 bg-surface border-r border-border h-screen shrink-0" />;

  const filteredOrder = order.filter(section => ALL_SECTIONS.includes(section));

  const renderNavGroup = (
    label: string,
    items: { href: string; label: string; icon: LucideIcon }[],
    groupHref: string,
    groupIcon: LucideIcon,
    withSubItems = true,
  ) => {
    const isActive = pathname.startsWith(groupHref);
    // Use the state but default to active if not explicitly toggled yet or if user wants it open
    const isOpen = !isCollapsed && (openSections[label] !== undefined ? openSections[label] : isActive);
    const GroupIcon = groupIcon;
    const color = spaceColors[label];

    return (
      <div
        key={label}
        className={`flex flex-col border rounded-2xl p-1 transition-all duration-700 ${
          isActive ? "shadow-sm border-border" : "bg-surface/40 border-border/40"
        } ${isCollapsed ? "items-center" : ""}`}
        style={isActive ? { background: color.bg.replace("0.10", "0.04") } : undefined}
      >
        <div
          className={`flex items-center ${withSubItems && !isCollapsed ? "justify-between" : "justify-center"} ${isCollapsed ? "px-0" : "px-3"} py-2`}
        >
          <Link
            href={groupHref}
            className={`flex items-center gap-3 text-sm font-bold text-text hover:opacity-80 transition-opacity ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? label : undefined}
          >
            <div className="p-1.5 rounded-lg shrink-0" style={{ background: color.bg }}>
              <GroupIcon size={14} style={{ color: color.text }} />
            </div>
            {!isCollapsed && <span className="leading-none truncate">{label}</span>}
          </Link>
          {withSubItems && !isCollapsed && (
            <button
              onClick={() => toggleSection(label)}
              className="p-1.5 hover:bg-raised rounded-lg transition-colors text-muted hover:text-text"
            >
              <ChevronRight
                size={14}
                className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
              />
            </button>
          )}
        </div>

        {withSubItems && !isCollapsed && (
          <div
            className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-0.5 pl-7 pr-1 pb-1 pt-1">
                <div className="border-t border-border/40 mb-1" />
                {items.map(({ href, label: itemLabel, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="group flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200"
                      style={
                        active
                          ? { background: color.bg, color: color.text }
                          : undefined
                      }
                    >
                      <Icon
                        size={16}
                        className={
                          active ? "" : "text-muted group-hover:text-secondary"
                        }
                        style={active ? { color: color.text } : undefined}
                      />
                      <span
                        className={`leading-none ${active ? "" : "text-secondary group-hover:text-text"}`}
                      >
                        {itemLabel}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles size={16} className="text-bg" fill="currentColor" />
          </div>
          <h1 className="text-lg font-black text-text tracking-tighter leading-none">MYHUB</h1>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="p-2 text-muted hover:text-text transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 h-screen bg-surface border-r border-border flex flex-col shrink-0 transition-all duration-300 z-50 md:sticky md:top-0 md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "md:w-20" : "md:w-72 w-72"}
      `}>
        {/* Mobile Close Button (inside sidebar) */}
        <div className="md:hidden flex justify-end p-4">
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted">
            <X size={24} />
          </button>
        </div>

        {/* Brand */}
        <div className={`shrink-0 py-8 ${isCollapsed ? "px-0 flex justify-center" : "px-6"} flex items-center justify-between`}>
          <Link href="/home" className="flex items-center gap-3 group overflow-hidden">
            <div className="w-9 h-9 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles size={20} className="text-bg" fill="currentColor" />
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h1 className="text-lg font-black text-text tracking-tighter leading-none">
                  MYHUB
                </h1>
                <p className="text-[10px] font-mono text-accent uppercase tracking-widest mt-1">
                  Personal OS
                </p>
              </div>
            )}
          </Link>
          
          <button 
            onClick={toggleSidebar}
            className={`hidden md:flex p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-xl transition-all ${isCollapsed ? "absolute -right-3 top-20 bg-surface border border-border shadow-md z-10" : ""}`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto scrollbar-hide flex flex-col scroll-smooth ${isCollapsed ? "px-2" : "px-3"}`}>
          {/* Navigation Groups */}
          <nav className="flex flex-col gap-4">
            {filteredOrder.map((section) => {
              if (section === "food")
                return renderNavGroup("Food Space", foodNav, "/food", ChefHat);
              if (section === "life")
                return renderNavGroup(
                  "Life Space",
                  lifeSpaceNav,
                  "/life",
                  Sparkles,
                );
              if (section === "fitness")
                return renderNavGroup(
                  "Fitness Space",
                  fitnessNav,
                  "/fitness",
                  Activity,
                );
              if (section === "library")
                return renderNavGroup(
                  "Library Space",
                  libraryNav,
                  "/library",
                  BookText,
                );
              if (section === "languages")
                return renderNavGroup(
                  "Language Space",
                  languagesNav,
                  "/languages",
                  Languages,
                );
              if (section === "trading")
                return renderNavGroup(
                  "Trading Space",
                  tradingNav,
                  "/trading",
                  TrendingUp,
                );
              if (section === "other")
                return renderNavGroup(
                  "Misc / Other",
                  otherNav,
                  "/other",
                  Package,
                );
              return null;
            })}
          </nav>
        </div>

        <div className="border-t border-border mt-auto" />

        {/* Footer - Pinned to bottom */}
        <div className={`shrink-0 flex flex-col gap-1 pb-4 pt-2 ${isCollapsed ? "px-2 items-center" : "px-4"}`}>
          {user && (
            <div className={`flex items-center gap-3 px-1 py-1 w-full ${isCollapsed ? "justify-center" : ""}`}>
              <Link 
                href="/profile" 
                title={isCollapsed ? "Profile" : undefined}
                className={`flex items-center gap-3 p-1.5 rounded-xl transition-all hover:bg-raised group/profile ${pathname === '/profile' ? 'bg-raised/80' : ''} ${isCollapsed ? "justify-center w-12 h-12" : "flex-1 min-w-0"}`}
              >
                <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0 group-hover/profile:border-accent/40 transition-colors">
                  <span className="text-accent text-[12px] font-bold leading-none">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                    <p className="text-[13px] font-semibold text-text leading-none truncate group-hover/profile:text-accent transition-colors">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-muted mt-[5px] truncate leading-none">
                      {user.email}
                    </p>
                  </div>
                )}
              </Link>
              
              {!isCollapsed && (
                <div className="flex items-center gap-0.5 animate-in fade-in duration-300">
                  <Link
                    href="/settings"
                    title="Settings"
                    className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                      pathname === "/settings"
                        ? "text-accent bg-accent/10"
                        : "text-muted hover:text-text hover:bg-raised"
                    }`}
                  >
                    <Settings2 size={13} />
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      title="Sign out"
                      className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-raised transition-colors shrink-0"
                    >
                      <LogOut size={13} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
          
          {isCollapsed && (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                href="/settings"
                title="Settings"
                className={`p-3 rounded-xl transition-colors shrink-0 ${
                  pathname === "/settings"
                    ? "text-accent bg-accent/10"
                    : "text-muted hover:text-text hover:bg-raised"
                }`}
              >
                <Settings2 size={16} />
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign out"
                  className="p-3 rounded-xl text-muted hover:text-text hover:bg-raised transition-colors shrink-0"
                >
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
