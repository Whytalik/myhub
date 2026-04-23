"use client";

import { Sidebar } from "@/components/sidebar";
import { DomainHeader } from "@/components/domain-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export function DashboardUIWrapper({ 
  children,
  initialOrder,
  initialOpenSections,
  user
}: { 
  children: React.ReactNode;
  initialOrder?: string[];
  initialCustomizations?: Record<string, { icon?: string; color?: string }>;
  initialOpenSections?: Record<string, boolean>;
  user?: { name: string, email: string, role?: string };
}) {

  return (
    <div className="flex h-screen overflow-hidden w-full bg-bg relative">
      {/* Sidebar - Desktop Sticky / Mobile Drawer */}
      <div style={{ viewTransitionName: 'sidebar', zIndex: 1001 }} className="relative">
        <Sidebar
          initialOrder={initialOrder}
          initialOpenSections={initialOpenSections}
          user={user}
        />
      </div>

      {/* Main Container */}
      <div className="flex flex-col flex-1 min-w-0 relative h-full overflow-hidden z-0">
        <DomainHeader user={user} />
        
        <main className="flex-1 overflow-y-auto scrollbar-hide relative bg-bg/50 pb-20 lg:pb-0" style={{ viewTransitionName: 'page-content' }}>
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
