import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding } from "@/components/space-landing";

export const metadata: Metadata = {
  title: "Life Space",
};

export default async function LifeSpacePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "life space",
        title: "Life Space",
        description: "",
      }}
    />
  );
}
