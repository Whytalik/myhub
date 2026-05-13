import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
import { BookText, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Library Space",
};

export default async function LibrarySpacePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "library space",
        title: "Library Space",
        description: "",
      }}
    >
      <SpaceDescription
        problem="Books and articles pile up unread, and valuable insights are never revisited."
        solution="Organized collections for books, articles, videos, and courses with reading progress."
        result="A personal knowledge base that grows with you."
      />
      <SpaceNav
        items={[
          {
            title: "Books",
            description: "Digital & physical collection",
            href: "/library/books",
            icon: BookText,
          },
          {
            title: "Articles",
            description: "Saved readings & research",
            href: "/library/articles",
            icon: Sparkles,
          },
        ]}
      />
    </SpaceLanding>
  );
}
