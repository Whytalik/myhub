import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
import { Sparkles, History, BookText } from "lucide-react";

export const metadata: Metadata = {
  title: "Language Space",
};

export default async function LanguagesPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "language space",
        title: "Language Space",
        description: "",
      }}
    >
      <SpaceDescription
        problem="Language learning stalls without consistent practice and balanced skill development."
        solution="Spaced repetition vocabulary, immersion logging, and sphere-based progress tracking."
        result="Steady progress across reading, listening, speaking, and writing."
      />
      <SpaceNav
        items={[
          {
            title: "Vocabulary",
            description: "Spaced repetition system",
            href: "/languages/vocabulary",
            icon: Sparkles,
          },
          {
            title: "Immersion Log",
            description: "Track exposure density",
            href: "/languages/journal",
            icon: History,
          },
          {
            title: "Resources",
            description: "Learning materials",
            href: "/languages/resources",
            icon: BookText,
          },
        ]}
      />
    </SpaceLanding>
  );
}
