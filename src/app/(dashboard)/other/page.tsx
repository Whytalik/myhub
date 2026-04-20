import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Target, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Misc / Other",
};

export default async function OtherSpacePage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/life");
  const sections = [
    {
      title: "Wishlist",
      href: "/other/wishlist",
      description: "Manage your desires, planned purchases, and long-term goals.",
      icon: Target,
      status: "Active",
    }
  ];

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "misc / other" }]} />
      
      <div className="flex flex-col mb-16">
        <Heading title="Misc / Other" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          A collection of independent tools and trackers that don&apos;t fit into the main systems.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {sections.map((section) => (
          <div
            key={section.href}
            className="group relative bg-surface border border-border p-8 rounded-xl hover:bg-raised transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <span className="font-heading text-8xl uppercase leading-none tracking-tighter -mr-8">
                {section.title}
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-5xl text-text uppercase leading-none tracking-tight group-hover:text-accent transition-colors">
                    {section.title}
                  </h3>
                  <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
                    {section.status}
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
                <span>Enter Space</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State / Placeholder for future tools */}
      {sections.length < 2 && (
         <div className="bg-surface/50 border border-border-dim border-dashed rounded-2xl p-10 flex flex-col items-center text-center gap-4 opacity-60">
           <Package size={24} className="text-muted" />
           <p className="text-sm text-secondary">More standalone tools will appear here in the future.</p>
         </div>
      )}
    </div>
  );
}