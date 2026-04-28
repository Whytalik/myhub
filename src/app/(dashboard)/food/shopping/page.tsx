import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { getShoppingLists } from "@/features/food/services/shopping-list-service";
import { getWeekPlans } from "@/features/food/services/week-plan-service";
import { ShoppingListView } from "@/features/food/components/ShoppingListView";
import { createShoppingListAction } from "@/features/food/actions/shopping-list-actions";
import { ShoppingBasket, ListTodo } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Shopping List",
};

export default async function ShoppingPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const shoppingLists = await getShoppingLists(userId);
  const weekPlans = await getWeekPlans(userId);

  // Simple handler to create from the latest week plan
  const handleGenerateFromLatest = async () => {
    "use server";
    if (weekPlans.length > 0) {
      await createShoppingListAction(weekPlans[0].id);
    }
  };

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "food space", href: "/food" }, { label: "shopping" }]} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <Heading title="Shopping Lists" />
          <p className="text-[10px] font-mono text-muted tracking-widest pl-1 italic">
            Aggregated ingredient lists from your meal plans.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {weekPlans.length > 0 && (
            <form action={handleGenerateFromLatest}>
              <Button type="submit" variant="primary" size="sm" className="rounded-xl">
                <ShoppingBasket size={14} className="mr-1.5" />
                Generate from Plan
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        <div className="flex flex-col gap-12">
          {shoppingLists.length > 0 ? (
            shoppingLists.map((list) => (
              <section key={list.id}>
                <ShoppingListView list={list} />
              </section>
            ))
          ) : (
            <div className="bg-surface/30 border border-dashed border-border/40 rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-raised flex items-center justify-center border border-border">
                <ListTodo size={32} className="text-muted/40" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-text">
                  No shopping lists generated yet
                </p>
                <p className="text-[11px] text-muted max-w-[280px]">
                  Create a week plan first, then generate a shopping list from it.
                </p>
              </div>
              {weekPlans.length === 0 && (
                <p className="text-[10px] font-mono text-muted/60 mt-2">
                  Go to Meal Plans to get started.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
