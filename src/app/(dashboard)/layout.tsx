import { SpaceProvider } from "@/components/providers/space-provider";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { DashboardUIWrapper } from "@/components/layout/dashboard-ui-wrapper";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/display/skeleton";
import { getDailyResistanceBudget } from "@/lib/actions/user-settings-actions";

function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex bg-canvas">
      <div className="hidden md:flex w-[280px] flex-shrink-0 h-screen glass-sidebar flex-col gap-2 p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex-1 flex flex-col gap-4 p-8">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}

async function DashboardDataLayer({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const orderCookie = cookieStore.get("sidebar-domains-order");
  const collapsedCookie = cookieStore.get("sidebar-collapsed");
  const customizationsCookie = cookieStore.get("system-customizations");
  const openSectionsCookie = cookieStore.get("sidebar-open-sections");

  let initialOrder: string[] | undefined = undefined;
  if (orderCookie) {
    try {
      initialOrder = JSON.parse(orderCookie.value);
    } catch {}
  }

  let initialCustomizations: Record<string, { icon?: string; color?: string }> = {};
  if (customizationsCookie) {
    try {
      initialCustomizations = JSON.parse(customizationsCookie.value);
    } catch {}
  }

  let initialOpenSections: Record<string, boolean> = {};
  if (openSectionsCookie) {
    try {
      initialOpenSections = JSON.parse(openSectionsCookie.value);
    } catch {}
  }

  const initialCollapsed = collapsedCookie?.value === "true";

  const session = await auth();
  if (!session) redirect("/login");

  const dailyResistanceBudget = await getDailyResistanceBudget();

  return (
    <SidebarProvider initialCollapsed={initialCollapsed}>
      <SpaceProvider>
        <DashboardUIWrapper
          initialOrder={initialOrder}
          initialCustomizations={initialCustomizations}
          initialOpenSections={initialOpenSections}
          dailyResistanceBudget={dailyResistanceBudget}
          user={
            session.user
              ? {
                  name: session.user.name || "",
                  email: session.user.email || "",
                }
              : undefined
          }
        >
          {children}
        </DashboardUIWrapper>
      </SpaceProvider>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardDataLayer>{children}</DashboardDataLayer>
    </Suspense>
  );
}
