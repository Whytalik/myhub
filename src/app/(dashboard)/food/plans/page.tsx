import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { getWeekPlans } from "@/features/food/services/week-plan-service";
import { getDayPlans } from "@/features/food/services/day-plan-service";
import { getDishes } from "@/features/food/services/dish-service";
import { WeekPlanView } from "@/features/food/components/WeekPlanView";
import { DayPlanView } from "@/features/food/components/DayPlanView";
import { CreateDayPlanForm } from "@/features/food/components/CreateDayPlanForm";
import { Calendar, Plus, X } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Food Plans",
};

export default async function FoodPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;
  if (!userId) redirect("/login");

  const params = await searchParams;
  const isCreating = params.create === "true";

  const weekPlans = await getWeekPlans(userId);
  const dayPlans = await getDayPlans(userId);
  const dishes = isCreating ? await getDishes(userId) : [];

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "food space", href: "/food" }, { label: "plans" }]} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <Heading title={isCreating ? "New Day Plan" : "Meal Plans"} />
          <p className="text-[10px] font-mono text-muted tracking-widest pl-1 italic">
            Weekly and daily meal schedules with macro tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isCreating ? (
            <Link href="/food/plans">
              <Button variant="outline" size="sm" className="rounded-xl">
                <X size={14} className="mr-1.5" />
                Cancel
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/food/plans?create=true">
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Plus size={14} className="mr-1.5" />
                  New Day
                </Button>
              </Link>
              <Button variant="primary" size="sm" className="rounded-xl">
                <Calendar size={14} className="mr-1.5" />
                New Week
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        {isCreating ? (
          <CreateDayPlanForm userId={userId} dishes={dishes} />
        ) : (
          <div className="flex flex-col gap-16">
            {weekPlans.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px flex-1 bg-border/40" />
                  <span className="text-[10px] font-mono text-muted tracking-[0.4em]">Active Week</span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <WeekPlanView plan={weekPlans[0] as any} />
              </section>
            )}

            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-[10px] font-mono text-muted tracking-[0.4em]">Recent Days</span>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {dayPlans.slice(0, 2).map((day) => (
                  <div key={day.id} className="bg-surface/50 border border-border p-8 rounded-2xl">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <DayPlanView plan={day as any} />
                  </div>
                ))}
                {dayPlans.length === 0 && weekPlans.length === 0 && (
                  <div className="col-span-full bg-surface/30 border border-dashed border-border/40 rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-raised flex items-center justify-center border border-border">
                      <Calendar size={32} className="text-muted/40" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-bold text-text">
                        No meal plans defined yet
                      </p>
                      <p className="text-[11px] text-muted max-w-[280px]">
                        Start by creating a day plan or a full week schedule to organize your meals.
                      </p>
                    </div>
                    <Link href="/food/plans?create=true">
                      <Button variant="ghost" size="sm" className="mt-2">
                        Create your first day plan
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
