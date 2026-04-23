import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { prisma } from "@/lib/prisma";
import { ResourceManager } from "@/features/languages/components/ResourceManager";
import { Book } from "lucide-react";

export const metadata: Metadata = {
  title: "Resource Matrix",
};

export default async function ResourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const userLanguage = await prisma.userLanguage.findUnique({
    where: { id },
    include: { language: true }
  });

  if (!userLanguage) return <div>Not found</div>;

  const resources = await prisma.languageResource.findMany({
    where: { userLanguageId: id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="px-6 md:px-14 py-8 md:py-10 min-h-screen bg-bg">
      <Breadcrumb items={[
        { label: "languages", href: "/languages" },
        { label: userLanguage.language.name.toLowerCase(), href: `/languages/${id}` },
        { label: "resource matrix" }
      ]} />
      
      <div className="mb-12">
        <div className="flex items-center gap-5 mb-3">
           <div className="p-3 rounded-2xl bg-accent text-bg shadow-lg shadow-accent/20">
             <Book size={24} strokeWidth={3} />
           </div>
           <Heading title="Resource Matrix" className="text-5xl font-black uppercase tracking-tighter" />
        </div>
        <p className="text-secondary max-w-2xl text-sm leading-relaxed font-medium">
          Centralized repository for comprehensible input sources. Manage your books, 
          podcasts, and digital materials aligned with your current proficiency level.
        </p>
      </div>

      <ResourceManager 
        initialItems={resources} 
      />
    </div>
  );
}
