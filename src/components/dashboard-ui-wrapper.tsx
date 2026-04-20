"use client";

import { Sidebar } from "@/components/sidebar";
import { DomainHeader } from "@/components/domain-header";

export function DashboardUIWrapper({
  children,
  initialOrder,
  user,
}: {
  children: React.ReactNode;
  initialOrder?: string[];
  user?: { name: string; email: string; role?: string };
}) {
  return (
    <div className="flex h-screen overflow-hidden w-full bg-bg relative">
      {/* Sidebar - Always visible as a rail, expands on hover */}
      <div className="relative z-50 h-full">
        <Sidebar
          initialOrder={initialOrder}
          user={user}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0 relative h-full overflow-hidden">
        {/* Header - Always visible but minimalist */}
        <DomainHeader />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scrollbar-hide relative bg-bg/50">
          {children}
        </main>
      </div>
    </div>
  );
}
