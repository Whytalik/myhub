import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
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
    <div className="w-full">
      <div className="mb-8">
        <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "profiles" }]} />
        <Heading title="Profiles" />
        <div className="h-px w-full bg-border-dim mt-4 mb-3" />
        <p className="text-body text-text-secondary">Nutrition goals and macro targets per person.</p>
      </div>

      <div className="animate-in fade-in duration-500">
        <PersonForm persons={persons} />
      </div>
    </div>
  );
}
