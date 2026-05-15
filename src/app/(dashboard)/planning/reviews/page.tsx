import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { getActiveSprintAction } from "@/features/operations/actions/sprint-actions";
import { SprintReviewView } from "@/features/operations/components/SprintReviewView";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Review Center | Planning",
};

export default async function ReviewsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const sprint = await getActiveSprintAction();

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <PageHeader
        breadcrumb={[
          { label: "planning space", href: "/planning" },
          { label: "review center" }
        ]}
        title="Review Center"
      />

      <div className="mt-8">
        {sprint ? (
          <SprintReviewView sprint={sprint} />
        ) : (
          <div className="p-20 border-2 border-dashed border-border rounded-[3rem] text-center">
             <p className="text-secondary italic">No active sprint found. Initialize a sprint to start weekly reviews.</p>
          </div>
        )}
      </div>
    </div>
  );
}
