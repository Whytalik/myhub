import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { prisma } from "@/lib/prisma";
import { VocabularyManager } from "@/features/languages/components/VocabularyManager";

export const metadata: Metadata = {
  title: "Vocabulary",
};

export default async function VocabularyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const userLanguage = await prisma.userLanguage.findUnique({
    where: { id },
    include: { language: true }
  });

  if (!userLanguage) return <div>Not found</div>;

  const vocabulary = await prisma.vocabularyItem.findMany({
    where: { userLanguageId: id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="px-14 py-10">
      <Breadcrumb items={[
        { label: "languages", href: "/languages" },
        { label: userLanguage.language.name.toLowerCase(), href: `/languages/${id}` },
        { label: "vocabulary" }
      ]} />
      
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-2">
           <span className="text-4xl">{userLanguage.language.icon}</span>
           <Heading title="Vocabulary Manager" />
        </div>
        <p className="text-secondary max-w-2xl leading-relaxed">
          Manage your personal dictionary and track your mastery through the 
          Spaced Repetition System (SRS).
        </p>
      </div>

      <VocabularyManager 
        userLanguageId={id} 
        initialItems={vocabulary} 
      />
    </div>
  );
}
