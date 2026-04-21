"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ 
  children,
  initialCollapsed = false 
}: { 
  children: React.ReactNode;
  initialCollapsed?: boolean;
}) {
  const [isCollapsed, setIsCollapsedState] = useState(initialCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const setIsCollapsed = (value: boolean) => {
    setIsCollapsedState(value);
    document.cookie = `sidebar-collapsed=${value}; path=/; max-age=31536000`;
  };

  const toggleSidebar = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
  };

  // Sync with localStorage as backup
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed, 
      toggleSidebar, 
      setIsCollapsed,
      isMobileOpen,
      setIsMobileOpen
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
