import { cookies } from "next/headers";
import { SettingsForm } from "./SettingsForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const cookieStore = await cookies();
  const orderCookie = cookieStore.get("sidebar-systems-order");
  let initialOrder: string[] | undefined = undefined;

  if (orderCookie) {
    try {
      initialOrder = JSON.parse(orderCookie.value);
    } catch {
      // Ignore
    }
  }

  return <SettingsForm initialOrder={initialOrder} />;
}
