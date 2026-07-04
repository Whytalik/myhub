"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { DomainHeader } from "@/components/layout/domain-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

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
    <div className="min-h-screen flex bg-canvas text-white font-sans selection:bg-[var(--current-accent-muted)] selection:text-[var(--current-accent)]">
      {/* Left Sidebar */}
      <Sidebar
        initialOrder={initialOrder}
        initialOpenSections={initialOpenSections}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">
        <DomainHeader />

        <main className="flex-1 overflow-y-auto relative pb-24 md:pb-8 focus:outline-none">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8 w-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

