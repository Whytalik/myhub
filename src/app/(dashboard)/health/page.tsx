import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding } from "@/components/space-landing";

export const metadata: Metadata = {
  title: "Health Domain",
};

export default async function HealthPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "health",
        title: "Health",
        description: "",
      }}
    />
  );
}
