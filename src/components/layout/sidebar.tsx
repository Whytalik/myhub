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

      >
        {}
        <div >
          <Link href="/life" >
            <div >
              <Sparkles size={20} />
            </div>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={LABEL_TRANSITION}

                >
                  <h1 >
                    MyHub
                  </h1>
                  <p >
                    Personal OS
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

              >
                <button
                  onClick={() => setIsMobileOpen(false)}

                >
                  <X size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSidebar();
                  }}

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

        {}
        <div >
          <nav >
            <motion.div
              initial={false}
              animate={{
                height: isExpanded ? "auto" : 0,
                opacity: isExpanded ? 1 : 0,
              }}
              transition={SUBMENU_TRANSITION}

            >
              <div >
                {domain.spaces.map((space) => {
                  const SpaceIcon = space.icon;
                  const accent = space.accent;
                  const color = {
                    text: accent,
                    bg: `${accent}0d`,
                    border: `${accent}22`,
                  };
                  const isOpen = openSpaces.has(space.label);
                  const anyPageActive = space.pages.some(isPageActive);

                  return (
                    <div
                      key={space.label}

                    >
                      <button
                        onClick={() =>
                          setOpenSpaces((prev) => {
                            const next = new Set(prev);
                            if (next.has(space.label)) next.delete(space.label);
                            else next.add(space.label);
                            return next;
                          })
                        }

                      >
                        <SpaceIcon
                          size={13}

                          strokeWidth={anyPageActive ? 2.5 : 2}

                        />
                        <span >{space.label}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 0 : -90 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <ChevronDown
                            size={12}

                          />
                        </motion.div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: "easeInOut" }}

                          >
                            <div >
                              {space.pages.map((page) => {
                                const PageIcon = page.icon;
                                const isActive = isPageActive(page);
                                return (
                                  <Link
                                    key={page.href}
                                    href={page.href}

                                  >
                                    <PageIcon
                                      size={11}

                                      strokeWidth={isActive ? 2.5 : 2}

                                    />
                                    <span >{page.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </nav>
        </div>

        {}
        <div

        >
          {user && (
            <>
              <Link href="/life" >
                <div >
                  <span >
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

                    >
                      <p >
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

                  >
                    <button
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsMobileOpen(false);
                      }}

                    >
                      <Settings2 size={14} />
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}

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
