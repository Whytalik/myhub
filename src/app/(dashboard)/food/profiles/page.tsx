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
      <Breadcrumb items={[{ label: "food space", href: "/food" }, { label: "profiles" }]} />
      <div className="flex flex-col gap-1 mb-8">
        <Heading title="Profiles & Goals" />
        <p className="text-[10px] font-mono text-muted tracking-widest pl-1 italic">
          Personalized nutrition targets and macro splits for each person.
        </p>
      </div>
      
      <div className="animate-in fade-in duration-500">
        <PersonForm initialPersons={persons} />
      </div>
    </div>
  );
}
