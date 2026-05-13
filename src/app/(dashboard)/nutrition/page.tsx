import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding } from "@/components/space-landing";

export const metadata: Metadata = {
  title: "Nutrition Space",
};

export default async function NutritionSpacePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "nutrition space",
        title: "Nutrition Space",
        description: "",
      }}
    />
  );
}
