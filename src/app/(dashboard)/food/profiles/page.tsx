import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { getPersons } from "@/features/food/services/person-service";
import { PersonForm } from "@/features/food/components/PersonForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Food Profiles",
};

export default async function FoodProfilesPage() {

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const persons = await getPersons(userId);

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "food", href: "/food" }, { label: "profiles" }]} />
      <Heading title="Profiles & Goals" />
      
      <PersonForm initialPersons={persons} />
    </div>
  );
}
