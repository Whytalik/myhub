import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { PersonForm } from "@/features/nutrition/components/PersonForm";
import { getPersons, getMealTemplateSlots } from "@/features/nutrition/actions/persons";

export const metadata: Metadata = {
  title: "Profiles",
};

export default async function ProfilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const personsResult = await getPersons();
  const persons = personsResult.success ? personsResult.data : [];

  const slotsResult = await getMealTemplateSlots();
  const slots = slotsResult.success ? slotsResult.data : [];

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "profiles" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <Heading title="Profiles" />
          <p className="text-[10px] font-mono text-muted tracking-widest pl-1 italic">
            Nutrition goals and macro targets per person.
          </p>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        <PersonForm persons={persons} templateSlots={slots} />
      </div>
    </div>
  );
}
