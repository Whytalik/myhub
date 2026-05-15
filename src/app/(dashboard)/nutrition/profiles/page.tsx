import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { PersonForm } from "@/features/nutrition/components/PersonForm";
import { getPersons } from "@/features/nutrition/actions/persons";

export const metadata: Metadata = {
  title: "Profiles",
};

export default async function ProfilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const personsResult = await getPersons();
  const persons = personsResult.success ? personsResult.data : [];

  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "profiles" }]}
        title="Profiles"
        description="Nutrition goals and macro targets per person."
      />

      <div className="animate-in fade-in duration-500">
        <PersonForm persons={persons} />
      </div>
    </div>
  );
}
