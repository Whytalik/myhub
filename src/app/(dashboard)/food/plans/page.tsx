import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { getWeekPlans } from "@/features/food/services/week-plan-service";
import { getDayPlans } from "@/features/food/services/day-plan-service";
import { getDishes } from "@/features/food/services/dish-service";
import { WeekPlanView } from "@/features/food/components/WeekPlanView";
import { DayPlanView } from "@/features/food/components/DayPlanView";
import { CreateDayPlanForm } from "@/features/food/components/CreateDayPlanForm";
import { X } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Meal Plans",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const personId = (session.user as any).personId;
  if (!personId) redirect("/login");

  const params = await searchParams;
  const isCreating = params.create === "true";

  const weekPlans = await getWeekPlans(personId);
  const dayPlans = await getDayPlans(personId);
  const dishes = isCreating ? await getDishes(personId) : [];

  return (
    <div className="px-14 py-10">
      <Breadcrumb items={[{ label: "food", href: "/food" }, { label: "plans" }]} />
      
      <div className="flex justify-between items-start mb-12">
        <Heading title={isCreating ? "New Day Plan" : "Meal Plans"} />
        <div className="flex gap-3">
          {isCreating ? (
            <Link 
              href="/food/plans"
              className="flex items-center gap-2 bg-raised border border-border px-4 py-2 rounded text-[10px] font-mono uppercase tracking-[0.2em] hover:text-text transition-colors"
            >
              <X size={14} /> Cancel
            </Link>
          ) : (
            <>
              <Link 
                href="/food/plans?create=true"
                className="bg-raised border border-border px-4 py-2 rounded text-[10px] font-mono uppercase tracking-[0.2em] hover:border-accent/50 transition-colors"
              >
                New Day
              </Link>
              <button className="bg-accent text-bg px-4 py-2 rounded text-[10px] font-mono uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-opacity">
                New Week
              </button>
            </>
          )}
        </div>
      </div>

      {isCreating ? (
        <CreateDayPlanForm personId={personId} dishes={dishes} />
      ) : (
        <div className="flex flex-col gap-16">
          {weekPlans.length > 0 && (
            <section>
              <p className="text-[10px] font-mono text-muted uppercase tracking-[0.3em] mb-8">Active Week</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <WeekPlanView plan={weekPlans[0] as any} />
            </section>
          )}

          <section>
            <p className="text-[10px] font-mono text-muted uppercase tracking-[0.3em] mb-8">Recent Days</p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              {dayPlans.slice(0, 2).map((day) => (
                <div key={day.id} className="bg-surface/50 border border-border p-8 rounded-lg">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <DayPlanView plan={day as any} />
                </div>
              ))}
              {dayPlans.length === 0 && (
                <div className="col-span-full py-12 border border-dashed border-border rounded-lg text-center text-secondary text-sm">
                  No day plans recorded yet.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
