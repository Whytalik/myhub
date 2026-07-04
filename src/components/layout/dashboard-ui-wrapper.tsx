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
    <div >
      {}
      <Sidebar
        initialOrder={initialOrder}
        initialOpenSections={initialOpenSections}
        user={user}
      />

      {}
      <div >
        <DomainHeader />

        <main >
          <div >
            {children}
          </div>
        </main>

        {}
        <MobileBottomNav />
      </div>
    </div>
  );
}
