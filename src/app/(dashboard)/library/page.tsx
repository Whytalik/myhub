import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { BookText, Sparkles, Video, GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Library System",
};

export default function LibrarySpacePage() {
  const sections = [
    {
      title: "Books",
      href: "/library/books",
      description: "Manage your digital and physical book collection.",
      icon: BookText,
      count: 0,
    },
    {
      title: "Articles",
      href: "/library/articles",
      description: "Saved articles, research papers, and web readings.",
      icon: Sparkles,
      count: 0,
    },
    {
      title: "Videos",
      href: "/library/videos",
      description: "Educational videos, documentaries, and tutorials.",
      icon: Video,
      count: 0,
    },
    {
      title: "Courses",
      href: "/library/courses",
      description: "Track your progress in online courses and certifications.",
      icon: GraduationCap,
      count: 0,
    },
  ];

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "library system" }]} />
      
      <div className="flex justify-between items-end mb-16">
        <div className="flex flex-col">
          <Heading title="Library System" />
          <p className="text-secondary max-w-2xl leading-relaxed">
            Your personal knowledge repository. Organize books, articles, and courses 
            to build your intellectual capital and track your learning journey.
          </p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          Add Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {sections.map((section) => (
          <div
            key={section.href}
            className="group relative bg-surface border border-border p-8 rounded-xl hover:bg-raised transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <section.icon size={120} className="-mr-8 -mt-8" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-4xl text-text uppercase leading-none tracking-tight group-hover:text-accent transition-colors">
                    {section.title}
                  </h3>
                  <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
                    {section.count} Items
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 text-accent group-hover:scale-110 transition-transform">
                  <section.icon size={24} />
                </div>
              </div>
              <p className="text-secondary text-sm leading-relaxed mb-8 max-w-[80%]">
                {section.description}
              </p>
              <Link href={section.href} className="flex items-center gap-2 text-[10px] font-mono text-muted hover:text-text transition-colors">
                <span>View Collection</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
