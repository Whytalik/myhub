import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { prisma } from "@/lib/prisma";
import { LanguageService } from "@/features/languages/services/language-service";
import { AddLanguageForm } from "@/features/languages/components/AddLanguageForm";

export const metadata: Metadata = {
  title: "Add Language",
};

export default async function AddLanguagePage() {
  const person = await prisma.nutritionPerson.findFirst();
  
  if (!person) {
    return <div>No profile found</div>;
  }

  const allLanguages = await LanguageService.getAllAvailableLanguages();
  const userLanguages = await LanguageService.getUserLanguages(person.id);
  const userLangIds = userLanguages.map(ul => ul.languageId);
  
  // Filter out already added languages
  const available = allLanguages.filter(l => !userLangIds.includes(l.id));

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[
        { label: "language system", href: "/languages" },
        { label: "add language" }
      ]} />
      
      <div className="mb-12">
        <Heading title="Add New Language" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          Select a language to add to your system. Each language will have its own 
          mastery radar and tracking environment.
        </p>
      </div>

      <AddLanguageForm 
        availableLanguages={available} 
        personId={person.id} 
      />
    </div>
  );
}
