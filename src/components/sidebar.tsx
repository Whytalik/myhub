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
  LayoutDashboard,
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
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";

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

// --- Animation constants ---
const SIDEBAR_SPRING = { type: "spring", stiffness: 320, damping: 32, restDelta: 0.001 } as const;
const LABEL_TRANSITION = { duration: 0.14, ease: "easeOut" } as const;
const SUBMENU_TRANSITION = { duration: 0.22, ease: [0.16, 1, 0.3, 1] } as const;

interface SidebarProps {
  user?: { name: string; email: string; role?: string };
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
  const isAdmin = user?.role === "ADMIN";

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialOpenSections);

  const ALL_DOMAINS = ["operations", "health", "mind", "wealth", "vault"];

  const effectiveDomain = useMemo(() => {
    if (ALL_DOMAINS.includes(activeDomain)) return activeDomain;
    return "operations";
  }, [activeDomain]);

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
  }, [initialOrder]);

  const [order, setOrder] = useState<string[]>(getInitialOrder);

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
    items: { href: string; label: string; icon: LucideIcon, id: string; subItems?: { href: string; label: string; icon: LucideIcon }[] }[],
  ) => {
    return (
      <div key={label} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2 w-full">
          {items.map((item) => {
            const isItemActive = pathname.startsWith(item.href);
            const subSectionKey = `${label}-${item.label}`;
            const isSubOpen = openSections[subSectionKey] ?? false;

            const custom = customizations[item.id];
            const ItemIcon = custom?.icon ? (ICON_LIBRARY[custom.icon as IconName] || item.icon) : item.icon;
            const baseColor = custom?.color || DEFAULT_SPACE_COLORS[item.label]?.text || "#a3a3a3";

            const color = {
              text: baseColor,
              bgActive: `${baseColor}18`,
              bgHover: `${baseColor}12`,
              bgInactive: "transparent",
              borderActive: `${baseColor}40`,
              borderHover: `${baseColor}50`,
              glow: `${baseColor}20`
            };

            return (
              <div
                key={item.href}
                className={`flex flex-col border transition-colors duration-200 group/item overflow-hidden rounded-2xl bg-[var(--item-bg)] border-[var(--item-border)] hover:bg-[var(--hover-bg)] hover:border-[var(--hover-border)] ${
                  isItemActive ? "shadow-[0_8px_20px_-6px_var(--glow-color)]" : ""
                }`}
                style={{
                  "--item-bg": isItemActive ? color.bgActive : "transparent",
                  "--item-border": isItemActive ? color.borderActive : `${baseColor}25`,
                  "--hover-bg": color.bgHover,
                  "--hover-border": color.borderHover,
                  "--hover-text": color.text,
                  "--glow-color": color.glow,
                } as React.CSSProperties}
              >
                <div className="flex items-center group/link relative w-full">
                  <Link
                    href={item.href}
                    className="flex-1 flex items-center h-12"
                  >
                    <motion.div
                      initial={false}
                      animate={{ paddingLeft: isExpanded ? 12 : 10 }}
                      transition={SIDEBAR_SPRING}
                      className="flex items-center w-full h-full"
                    >
                    <div className={`w-9 h-9 flex items-center justify-center shrink-0 rounded-xl transition-all duration-200 ${
                      !isExpanded && isItemActive ? "shadow-[0_0_15px_-3px_var(--glow-color)]" : ""
                    } ${!isExpanded ? "group-hover/item:scale-110" : ""}`}
                    style={{ backgroundColor: !isExpanded && isItemActive ? `${color.text}15` : undefined }}>
                      <ItemIcon
                        size={18}
                        style={{ color: color.text }}
                        strokeWidth={isItemActive ? 2.5 : 2}
                        className="transition-colors duration-200"
                      />
                    </div>

                    <motion.div
                      initial={false}
                      animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -8 }}
                      transition={LABEL_TRANSITION}
                      className="ml-3 overflow-hidden"
                      style={{ pointerEvents: isExpanded ? "auto" : "none" }}
                    >
                      <span
                        className="text-[13px] font-bold whitespace-nowrap"
                        style={{ color: color.text }}
                      >
                        {item.label}
                      </span>
                    </motion.div>
                    </motion.div>
                  </Link>

                  {item.subItems && (
                    <motion.button
                      initial={false}
                      animate={{ opacity: isExpanded ? 1 : 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSection(subSectionKey); }}
                      className="p-3 transition-colors duration-200"
                      style={{ pointerEvents: isExpanded ? "auto" : "none", color: color.text }}
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

                {item.subItems && (
                  <motion.div
                    initial={false}
                    animate={{
                      height: isExpanded && isSubOpen ? "auto" : 0,
                      opacity: isExpanded && isSubOpen ? 1 : 0,
                    }}
                    transition={SUBMENU_TRANSITION}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="flex flex-col gap-1 pl-3 pr-2 pb-2 pt-1">
                      <div
                        className="h-px mb-1 transition-colors duration-500"
                        style={{ backgroundColor: isItemActive ? color.borderActive : "rgba(255,255,255,0.05)" }}
                      />
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-lg text-[12px] transition-colors duration-200 ${
                              isSubActive
                                ? "font-bold"
                                : "text-muted hover:text-[var(--hover-text)] hover:bg-[var(--hover-bg)]"
                            }`}
                            style={{
                              color: isSubActive ? color.text : undefined,
                              backgroundColor: isSubActive ? color.bgHover : undefined,
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
        animate={{
          width: isMobileOpen ? 288 : (isExpanded ? 256 : 80),
        }}
        initial={false}
        transition={SIDEBAR_SPRING}
        className={`
          fixed inset-y-0 left-0 z-[1001] lg:sticky lg:top-0 h-screen bg-surface border-r border-border flex flex-col shrink-0 overflow-hidden
          transition-transform duration-300 ease-out
          ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar Header */}
        <div className="shrink-0 h-16 flex items-center justify-between relative pl-5 pr-4 border-b border-border">
          <Link href="/home" className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Sparkles size={20} className="text-bg" fill="currentColor" />
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
                  <h1 className="text-base font-black text-text tracking-tighter leading-none">MYHUB</h1>
                  <p className="text-[9px] font-mono text-accent uppercase tracking-widest mt-1">Personal OS</p>
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
                className="shrink-0 flex items-center"
              >
                {/* Mobile: X close button */}
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="lg:hidden p-2 rounded-xl text-muted hover:text-text hover:bg-raised transition-all duration-200"
                >
                  <X size={16} />
                </button>
                {/* Desktop: Pin button */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}
                  className={`hidden lg:flex p-2 rounded-xl transition-all duration-200 ${
                    !isCollapsed
                      ? "text-accent bg-accent/10 border border-accent/20"
                      : "text-muted hover:text-text hover:bg-raised"
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
                  { id: "planning", label: "Planning Space", href: "/planning", icon: Compass, subItems: planningNav },
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

        {/* User Footer */}
        <div className="shrink-0 flex items-center justify-between relative pl-5 pr-4 py-4 overflow-hidden border-t border-border">
          {user && (
            <>
              <Link href="/profile" className="flex items-center gap-4 group/profile-link">
                <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0 group-hover/profile-link:scale-105 transition-transform duration-200 shadow-lg shadow-accent/5">
                  <span className="text-accent text-[12px] font-bold">{user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span>
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
                      <p className="text-[13px] font-bold text-text truncate leading-none mb-1">{user.name}</p>
                      <p className="text-[10px] text-muted truncate font-mono uppercase tracking-widest">{user.role || 'User'}</p>
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
                      onClick={() => setIsSettingsOpen(true)}
                      className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-raised transition-all duration-200"
                    >
                      <Settings2 size={13} />
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <LogOut size={13} />
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
        initialOrder={order}
        userName={user?.name}
      />
    </>
  );
}
