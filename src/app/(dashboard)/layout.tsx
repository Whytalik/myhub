import { Sidebar } from "@/components/sidebar";
import { SystemProvider } from "@/components/system-provider";
import { SidebarProvider } from "@/components/sidebar-provider";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const orderCookie = cookieStore.get("sidebar-spaces-order");
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
      <SystemProvider>
        <Sidebar
          initialOrder={initialOrder}
          key={orderCookie?.value || "default"}
          user={session.user ? { name: session.user.name || "", email: session.user.email || "", role: session.user.role } : undefined}
        />
        <main className="flex-1 bg-bg overflow-y-auto scrollbar-hide">{children}</main>
      </SystemProvider>
    </SidebarProvider>
  );
}
