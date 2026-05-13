import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding } from "@/components/space-landing";

export const metadata: Metadata = {
  title: "Operations Domain",
};

export default async function OperationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "operations",
        title: "Operations",
        description: "",
      }}
    />
  );
}
