import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DomainTemplate } from "@/components/domain-template";
import { Languages, BookOpen, Brain } from "lucide-react";

export default async function MindPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/home");

  return (
    <DomainTemplate
      domainId="mind"
      title="Knowledge & Skill"
      subtitle="Intellectual Mastery"
      description="The Mind domain centers on information processing and skill acquisition. Transform raw data into wisdom and passive learning into active mastery."
      icon={Brain}
      color="#818cf8"
      spaces={[
        { label: "Language Space", description: "Linguistic neural growth, vocabulary retention, and immersion density.", icon: Languages, href: "/languages", color: "#c084fc" },
        { label: "Library Space", description: "Personal knowledge base, curated reading lists, and mental models.", icon: BookOpen, href: "/library", color: "#818cf8" },
      ]}
      metrics={[
        { label: "Retention Rate", value: "94%" },
        { label: "Knowledge Nodes", value: "124" },
        { label: "Deep Work", value: "4.2h" },
      ]}
    />
  );
}
