"use client";

import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { SettingsModal } from "@/components/layout/settings-modal";
import { LogOut, Settings2, Sparkles, Pin, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getActiveDomain } from "@/lib/spaces/domains";

const SIDEBAR_SPRING = { type: "spring", stiffness: 320, damping: 32, restDelta: 0.001 } as const;
const LABEL_TRANSITION = { duration: 0.14, ease: "easeOut" } as const;
const SUBMENU_TRANSITION = { duration: 0.22, ease: [0.16, 1, 0.3, 1] } as const;

interface SidebarProps {
  user?: { name: string; email: string };
  initialOpenSections?: Record<string, boolean>;
  initialOrder?: string[];
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const domain = getActiveDomain(pathname);
  const [openSpaces, setOpenSpaces] = useState<Set<string>>(
    () => new Set(domain.spaces.map((s) => s.label)),
  );
  const [lastDomainId, setLastDomainId] = useState(domain.id);

  if (domain.id !== lastDomainId) {
    setLastDomainId(domain.id);
    setOpenSpaces(new Set(domain.spaces.map((s) => s.label)));
  }

  const matchesPage = (page: { href: string }) =>
    pathname === page.href ||
    pathname.startsWith(page.href + "/") ||
    (page.href === "/life/journal" && pathname.startsWith("/life/history"));

  const allPages = domain.spaces.flatMap((s) => s.pages);
  const activePage = allPages
    .filter(matchesPage)
    .reduce<(typeof allPages)[number] | undefined>(
      (best, page) => (!best || page.href.length > best.href.length ? page : best),
      undefined,
    );
  const isPageActive = (page: { href: string }) => activePage?.href === page.href;

  useEffect(() => {
    const targetSpace = domain.spaces.find((s) => s.pages.some((p) => p.href === activePage?.href));
    if (targetSpace) {
      setOpenSpaces((prev) =>
        prev.has(targetSpace.label) ? prev : new Set([...prev, targetSpace.label]),
      );
    }

  }, [pathname]);

  const isExpanded = isMobileOpen || !isCollapsed || isHovered;

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ width: isMobileOpen ? 288 : isExpanded ? 280 : 72 }}
        initial={false}
        transition={SIDEBAR_SPRING}
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-30 h-screen glass-sidebar flex flex-col justify-between overflow-hidden select-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transition-transform duration-300 md:transition-none`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800/60 flex-shrink-0">
          <Link href="/life" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <Sparkles size={13} />
            </div>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={LABEL_TRANSITION}
                  className="text-xs font-semibold text-zinc-100 tracking-tight"
                >
                  MyHub
                </motion.span>
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
                className="flex items-center gap-0.5"
              >
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-250 hover:bg-zinc-850 rounded-md transition-colors"
                >
                  <X size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSidebar();
                  }}
                  className="hidden md:flex p-1.5 text-zinc-400 hover:text-zinc-250 hover:bg-zinc-850 rounded-md transition-colors"
                >
                  <motion.div
                    animate={{ rotate: !isCollapsed ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <Pin size={12} />
                  </motion.div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-none">
          <nav className="space-y-4">
            {domain.spaces.map((space) => {
              const SpaceIcon = space.icon;
              const isOpen = openSpaces.has(space.label);
              const anyPageActive = space.pages.some(isPageActive);

              return (
                <div key={space.label} className="w-full flex flex-col space-y-1">
                  <button
                    onClick={() => {
                      if (!isExpanded) {
                        toggleSidebar();
                      }
                      setOpenSpaces((prev) => {
                        const next = new Set(prev);
                        if (next.has(space.label)) next.delete(space.label);
                        else next.add(space.label);
                        return next;
                      });
                    }}
                    className="w-full flex items-center justify-center md:justify-start gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150 text-zinc-500 hover:text-zinc-300"
                  >
                    <SpaceIcon
                      size={12}
                      strokeWidth={2}
                      className="text-zinc-500"
                    />
                    {isExpanded && (
                      <>
                        <span className="flex-1 text-left truncate">{space.label}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 0 : -90 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <ChevronDown size={11} className="text-zinc-500" />
                        </motion.div>
                      </>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        className="pl-2 pr-1 py-0.5 space-y-0.5"
                      >
                        {space.pages.map((page) => {
                          const PageIcon = page.icon;
                          const isActive = isPageActive(page);
                          return (
                            <Link
                              key={page.href}
                              href={page.href}
                              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 ${
                                isActive
                                  ? "text-zinc-150 bg-zinc-800/70 border border-zinc-700/50 shadow-sm font-medium"
                                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                              }`}
                            >
                              <PageIcon
                                size={13}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={isActive ? "text-zinc-200" : "text-zinc-500"}
                              />
                              <span className="truncate">{page.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile */}
        <div className="h-16 border-t border-zinc-800/60 px-4 flex items-center justify-between gap-3 flex-shrink-0 bg-white/[0.01]">
          {user && (
            <>
              <Link href="/life" className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity">
                <div className="w-7 h-7 rounded-full bg-zinc-850 text-zinc-300 flex items-center justify-center border border-zinc-800 text-[11px] font-semibold flex-shrink-0">
                  <span>
                    {user.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : user.email.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={LABEL_TRANSITION}
                      className="min-w-0"
                    >
                      <p className="text-[13px] font-medium text-zinc-300 truncate">
                        {user.name}
                      </p>
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
                    className="flex items-center gap-0.5"
                  >
                    <button
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsMobileOpen(false);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md transition-colors"
                    >
                      <Settings2 size={13} />
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md transition-colors"
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
        userName={user?.name}
      />
    </>
  );
}
