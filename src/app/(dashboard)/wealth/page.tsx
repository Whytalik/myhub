import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding } from "@/components/space-landing";

export const metadata: Metadata = {
  title: "Wealth Domain",
};

export default async function WealthPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "wealth",
        title: "Wealth",
        description: "",
      }}
    />
  );
}
