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
  const orderCookie = cookieStore.get("sidebar-domains-order");

  let initialOrder: string[] | undefined = undefined;

  if (orderCookie) {
    try {
      initialOrder = JSON.parse(orderCookie.value);
    } catch {}
  }

  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SidebarProvider>
      <SpaceProvider>
        <DashboardUIWrapper 
          initialOrder={initialOrder}
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
