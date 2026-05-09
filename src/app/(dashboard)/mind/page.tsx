import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, ModuleQuickAccess } from "@/components/space-landing";
import { Languages, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Mind Domain",
};

export default async function MindPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "mind",
        title: "Knowledge & Skill",
        description: "The Mind domain centers on information processing and skill acquisition. Transform raw data into wisdom and passive learning into active mastery.",
      }}
      intelligence={{
        items: [
          { label: "Retention Rate", value: "94%" },
          { label: "Knowledge Nodes", value: "124" },
          { label: "Deep Work", value: "4.2h" },
        ],
      }}
    >
      <ModuleQuickAccess
        modules={[
          {
            title: "Language Space",
            href: "/languages",
            description: "Linguistic neural growth, vocabulary retention, and immersion density.",
            icon: Languages,
            status: "Active",
          },
          {
            title: "Library Space",
            href: "/library",
            description: "Personal knowledge base, curated reading lists, and mental models.",
            icon: BookOpen,
            status: "Coming soon",
          },
        ]}
      />
    </SpaceLanding>
  );
}
