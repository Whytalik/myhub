import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AlignmentMap } from "@/features/operations/components/AlignmentMap";
import { getAlignmentDataAction } from "@/features/operations/actions/sprint-actions";

export const metadata: Metadata = {
  title: "Alignment Map | Planning",
};

export default async function VisionPage() {
  const data = await getAlignmentDataAction();

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <PageHeader
        breadcrumb={[
          { label: "planning space", href: "/planning" },
          { label: "alignment map" }
        ]}
        title="Strategic Alignment"
        description="The lineage of execution: From your ultimate North Star to this week's tactical objectives."
      />

      <AlignmentMap initialData={data} />
    </div>
  );
}
