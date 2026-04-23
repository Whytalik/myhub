import { SpaceProvider } from "@/components/space-provider";
import { SidebarProvider } from "@/components/sidebar-provider";
import { DashboardUIWrapper } from "@/components/dashboard-ui-wrapper";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  // Зчитуємо всі налаштування сайдбару з куків для серверного рендерингу
  const orderCookie = cookieStore.get("sidebar-domains-order");
  const collapsedCookie = cookieStore.get("sidebar-collapsed");
  const customizationsCookie = cookieStore.get("system-customizations");
  const openSectionsCookie = cookieStore.get("sidebar-open-sections");

  let initialOrder: string[] | undefined = undefined;
  if (orderCookie) {
    try { initialOrder = JSON.parse(orderCookie.value); } catch {}
  }

  let initialCustomizations: Record<string, { icon?: string; color?: string }> = {};
  if (customizationsCookie) {
    try { initialCustomizations = JSON.parse(customizationsCookie.value); } catch {}
  }

  let initialOpenSections: Record<string, boolean> = {};
  if (openSectionsCookie) {
    try { initialOpenSections = JSON.parse(openSectionsCookie.value); } catch {}
  }

  const initialCollapsed = collapsedCookie?.value === "true";

  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SidebarProvider initialCollapsed={initialCollapsed}>
      <SpaceProvider>
        <DashboardUIWrapper 
          initialOrder={initialOrder}
          initialCustomizations={initialCustomizations}
          initialOpenSections={initialOpenSections}
          user={session.user ? { 
            name: session.user.name || "", 
            email: session.user.email || "", 
            role: session.user.role 
          } : undefined}
        >
          {children}
        </DashboardUIWrapper>
      </SpaceProvider>
    </SidebarProvider>
  );
}
