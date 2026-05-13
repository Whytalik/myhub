import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
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
        title: "Mind",
        description: "",
      }}
    >
      <SpaceDescription
        problem="Information overload without structured retention leads to forgotten knowledge and wasted effort."
        solution="Spaced repetition for languages, curated reading lists, and organized knowledge base."
        result="Active mastery instead of passive consumption."
      />
      <SpaceNav
        items={[
          {
            title: "Language Space",
            description: "Vocabulary & immersion",
            href: "/languages",
            icon: Languages,
          },
          {
            title: "Library Space",
            description: "Books & reading lists",
            href: "/library",
            icon: BookOpen,
          },
        ]}
      />
    </SpaceLanding>
  );
}
