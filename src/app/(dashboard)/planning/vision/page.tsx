import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { AlignmentMap } from "@/features/operations/components/AlignmentMap";
import { getAlignmentDataAction } from "@/features/operations/actions/sprint-actions";

export const metadata: Metadata = {
  title: "Alignment Map | Planning",
};

export default async function VisionPage() {
  const data = await getAlignmentDataAction();

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[
        { label: "planning space", href: "/planning" },
        { label: "alignment map" }
      ]} />
      
      <div className="flex flex-col mb-16">
        <Heading title="Strategic Alignment" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          The lineage of execution: From your ultimate North Star to this week&apos;s tactical objectives.
        </p>
      </div>

      <AlignmentMap initialData={data} />
    </div>
  );
}
