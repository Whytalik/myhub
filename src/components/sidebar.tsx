"use client";

import { signOut } from "next-auth/react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./sidebar-provider";
import { useSpace } from "./space-provider";
import { SettingsModal } from "./settings-modal";
import { ICON_LIBRARY, IconName } from "@/lib/constants/icons";
import { DEFAULT_SPACE_COLORS } from "@/lib/constants/colors";
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
  LogOut,
  Package,
  Settings2,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  Pin,
  X,
  Lock
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";

type SpaceStatus = "active" | "dev" | "soon" | "disabled";

interface SpaceNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  status: SpaceStatus;
  subItems?: { href: string; label: string; icon: LucideIcon }[];
}

// --- Navigation Data ---
const nutritionNav = [
  { href: "/nutrition/profiles", label: "Profiles", icon: Users },
  { href: "/nutrition/products", label: "Products", icon: Package },
  { href: "/nutrition/dishes", label: "Dishes", icon: ChefHat },
  { href: "/nutrition/plans", label: "Plans", icon: CalendarDays },
  { href: "/nutrition/shopping", label: "Shopping", icon: ShoppingCart },
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

// --- Animation constants ---
const SIDEBAR_SPRING = { type: "spring", stiffness: 320, damping: 32, restDelta: 0.001 } as const;
const LABEL_TRANSITION = { duration: 0.14, ease: "easeOut" } as const;
const SUBMENU_TRANSITION = { duration: 0.22, ease: [0.16, 1, 0.3, 1] } as const;

interface SidebarProps {
  user?: { name: string; email: string };
  initialOrder?: string[];
  initialOpenSections?: Record<string, boolean>;
}

export function Sidebar({
  user,
  initialOrder,
  initialOpenSections = {}
}: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useSidebar();
  const { activeDomain } = useSpace();
  const [isHovered, setIsHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialOpenSections);

  const ALL_DOMAINS = useMemo(() => ["operations", "health", "mind", "wealth", "vault"], []);

  const effectiveDomain = useMemo(() => {
    if (ALL_DOMAINS.includes(activeDomain)) return activeDomain;
    return "operations";
  }, [activeDomain, ALL_DOMAINS]);

  const getInitialOrder = useCallback(() => {
    const mergeOrder = (saved: string[]) => {
      const filteredSaved = saved.filter(s => ALL_DOMAINS.includes(s));
      return [
        ...filteredSaved,
        ...ALL_DOMAINS.filter((s) => !filteredSaved.includes(s)),
      ];
    };
    if (initialOrder) {
      return mergeOrder(initialOrder);
    }
    if (typeof window !== 'undefined') {
      const savedOrder = localStorage.getItem("sidebar-domains-order");
      if (savedOrder) {
        try {
          return mergeOrder(JSON.parse(savedOrder));
        } catch {
          return ALL_DOMAINS;
        }
      }
    }
    return ALL_DOMAINS;
  }, [initialOrder, ALL_DOMAINS]);

  const [order, setOrder] = useState<string[]>(getInitialOrder());

  useEffect(() => {
    setOrder(getInitialOrder());
  }, [getInitialOrder]);

  const loadCustomizations = useCallback(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem("system-customizations");
    return saved ? JSON.parse(saved) : {};
  }, []);
  const [customizations, setCustomizations] = useState(() => loadCustomizations());

  useEffect(() => {
    const handler = () => setCustomizations(loadCustomizations());
    window.addEventListener("system-customizations-updated", handler);
    return () => window.removeEventListener("system-customizations-updated", handler);
  }, [loadCustomizations]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  const toggleSection = (label: string) => {
    setOpenSections((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      document.cookie = `sidebar-open-sections=${JSON.stringify(next)}; path=/; max-age=31536000`;
      localStorage.setItem("sidebar-open-sections", JSON.stringify(next));
      return next;
    });
  };

  const isExpanded = isMobileOpen || !isCollapsed || isHovered;

  const renderNavGroup = (
    label: string,
    items: SpaceNavItem[],
    groupDisabled = false,
  ) => {
    return (
      <div key={label} className={`flex flex-col gap-3 w-full ${groupDisabled ? "opacity-30 pointer-events-none" : ""}`}>
        <div className="flex flex-col gap-1.5 w-full">
          {items.map((item) => {
            const isItemActive = pathname === item.href || pathname.startsWith(item.href + '/') || (item.href === '/nutrition/plans' && pathname.startsWith('/nutrition/week'));
            const subSectionKey = `${label}-${item.label}`;
            const isSubOpen = openSections[subSectionKey] ?? false;
            const isDisabled = item.status === "disabled" || groupDisabled;

            const custom = customizations[item.id];
            const ItemIcon = custom?.icon ? (ICON_LIBRARY[custom.icon as IconName] || item.icon) : item.icon;
            const baseColor = isDisabled ? "#525252" : (custom?.color || DEFAULT_SPACE_COLORS[item.label]?.text || "#a3a3a3");

            const color = {
              text: baseColor,
              bgActive: `${baseColor}12`,
              bgHover: `${baseColor}08`,
              borderActive: `${baseColor}30`,
            };

            const linkContent = (
              <motion.div
                initial={false}
                animate={{ paddingLeft: isExpanded ? 12 : 10 }}
                transition={SIDEBAR_SPRING}
                className="flex items-center w-full h-full"
              >
                <div className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg">
                  <ItemIcon
                    size={18}
                    style={{ color: color.text }}
                    strokeWidth={isItemActive && !isDisabled ? 2.5 : 2}
                    className="transition-colors duration-200"
                  />
                </div>

                <motion.div
                  initial={false}
                  animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -8 }}
                  transition={LABEL_TRANSITION}
                  className="ml-3 overflow-hidden flex items-center gap-2"
                  style={{ pointerEvents: isExpanded ? "auto" : "none" }}
                >
                  <span
                    className="text-note font-medium whitespace-nowrap"
                    style={{ color: color.text }}
                  >
                    {item.label}
                  </span>
                  {isExpanded && isDisabled && (
                    <Lock size={10} className="text-text-muted/30 shrink-0" />
                  )}
                </motion.div>
              </motion.div>
            );

            return (
              <div
                key={item.href}
                className={`flex flex-col transition-all duration-200 group/item overflow-hidden rounded-lg relative ${
                  isItemActive && !isDisabled ? "bg-[var(--item-bg)]" : "bg-transparent"
                } ${!isDisabled ? "hover:bg-surface-hover" : ""}`}
                style={{
                  "--item-bg": color.bgActive,
                } as React.CSSProperties}
              >
                {isItemActive && !isDisabled && (
                  <div className="absolute left-0 top-2.5 w-0.5 h-6 rounded-r-full" style={{ backgroundColor: color.text }} />
                )}
                <div className="flex items-center group/link relative w-full">
                  {isDisabled ? (
                    <div className="flex-1 flex items-center h-11 opacity-40 cursor-not-allowed">
                      {linkContent}
                    </div>
                  ) : (
                    <Link href={item.href} className="flex-1 flex items-center h-11">
                      {linkContent}
                    </Link>
                  )}

                  {item.subItems && !isDisabled && (
                    <motion.button
                      initial={false}
                      animate={{ opacity: isExpanded ? 1 : 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSection(subSectionKey); }}
                      className="p-2 transition-colors duration-200 text-text-muted hover:text-text-primary"
                      style={{ pointerEvents: isExpanded ? "auto" : "none" }}
                    >
                      <motion.div
                        initial={false}
                        animate={{ rotate: isSubOpen ? 90 : 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ChevronRight size={14} />
                      </motion.div>
                    </motion.button>
                  )}
                </div>

                {item.subItems && !isDisabled && (
                  <motion.div
                    initial={false}
                    animate={{
                      height: isExpanded && isSubOpen ? "auto" : 0,
                      opacity: isExpanded && isSubOpen ? 1 : 0,
                    }}
                    transition={SUBMENU_TRANSITION}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="flex flex-col gap-0.5 pl-3 pr-2 pb-2 pt-1">
                      <div
                        className="h-px mb-1 transition-colors duration-500"
                        style={{ backgroundColor: isItemActive ? color.borderActive : "rgba(255,255,255,0.04)" }}
                      />
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-caption transition-colors duration-200 ${
                              isSubActive
                                ? "font-medium text-text-primary"
                                : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                            }`}
                            style={{
                              color: isSubActive ? color.text : undefined,
                            }}
                          >
                            <SubIcon
                              size={13}
                              style={{ color: isSubActive ? color.text : undefined }}
                              strokeWidth={isSubActive ? 2.5 : 2}
                              className="shrink-0"
                            />
                            <span className="truncate">{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
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
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-[1000] lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ viewTransitionName: 'sidebar' }}
        animate={{
          width: isMobileOpen ? 288 : (isExpanded ? 280 : 72),
        }}
        initial={false}
        transition={SIDEBAR_SPRING}
        className={`
          fixed inset-y-0 left-0 z-[2000] lg:sticky lg:top-0 h-screen bg-surface border-r border-border-dim flex flex-col shrink-0 overflow-hidden
          transition-transform duration-300 ease-out
          ${isMobileOpen ? "translate-x-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar Header */}
        <div className={`shrink-0 h-20 flex items-center relative border-b border-border-dim ${isExpanded ? "px-6" : "justify-center"}`}>
          <Link href="/home" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0 transition-shadow duration-200 group-hover:shadow-[0_0_16px_rgba(96,165,250,0.3)]">
              <Sparkles size={20} className="text-bg" />
            </div>

            {isExpanded && (
              <div className="flex flex-col overflow-hidden whitespace-nowrap">
                <h1 className="text-heading font-bold text-text-primary tracking-tight leading-none">MyHub</h1>
                <p className="text-micro font-mono text-accent uppercase tracking-wider mt-0.5">Personal OS</p>
              </div>
            )}
          </Link>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute right-6 flex items-center gap-2"
              >
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-200"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}
                  className={`hidden lg:flex p-2 rounded-lg transition-all duration-200 ${
                    !isCollapsed
                      ? "text-accent bg-accent/10"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  <motion.div
                    animate={{ rotate: !isCollapsed ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <Pin size={14} />
                  </motion.div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col scroll-smooth px-3 pt-4">
          <nav className="flex flex-col gap-4">
            {order.map((section) => {
              if (section !== effectiveDomain) return null;

              if (section === "operations")
                return renderNavGroup("Operations", [
                  { id: "planning", label: "Planning Space", href: "/planning", icon: Compass, status: "soon", subItems: planningNav },
                  { id: "life", label: "Life Space", href: "/life", icon: Sparkles, status: "active", subItems: lifeSpaceNav },
                ]);
              if (section === "health")
                return renderNavGroup("Health", [
                  { id: "nutrition", label: "Nutrition Space", href: "/nutrition", icon: ChefHat, status: "dev", subItems: nutritionNav },
                  { id: "fitness", label: "Fitness Space", href: "/fitness", icon: Dumbbell, status: "disabled", subItems: fitnessNav },
                ]);
              if (section === "mind")
                return renderNavGroup("Mind", [
                  { id: "languages", label: "Language Space", href: "/languages", icon: Languages, status: "disabled", subItems: languagesNav },
                  { id: "library", label: "Library Space", href: "/library", icon: BookText, status: "disabled", subItems: libraryNav },
                ], true);
              if (section === "wealth")
                return renderNavGroup("Wealth", [
                  { id: "trading", label: "Trading Space", href: "/trading", icon: TrendingUp, status: "disabled", subItems: tradingNav },
                ], true);
              if (section === "vault")
                return renderNavGroup("Vault", [
                  { id: "other", label: "Misc / Other", href: "/other", icon: Package, status: "disabled", subItems: otherNav },
                ], true);
              return null;
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className={`
          shrink-0 flex items-center justify-between relative pl-5 pr-4 py-4 overflow-hidden border-t border-border-dim bg-surface
          ${isMobileOpen ? "pb-24 lg:pb-4" : "pb-4"}
        `}>
          {user && (
            <>
              <Link href="/profile" className="flex items-center gap-3 group/profile-link">
                <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0 group-hover/profile-link:scale-105 transition-transform duration-200">
                  <span className="text-accent text-note font-bold">{user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={LABEL_TRANSITION}
                      className="flex flex-col overflow-hidden whitespace-nowrap"
                    >
                      <p className="text-note font-medium text-text-primary truncate leading-none">{user.name}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-0.5 shrink-0"
                  >
                    <button
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsMobileOpen(false);
                      }}
                      className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-200"
                    >
                      <Settings2 size={14} />
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200"
                    >
                      <LogOut size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.aside>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={user?.name}
      />
    </>
  );
}
