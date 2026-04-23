import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { getShoppingLists } from "@/features/food/services/shopping-list-service";
import { getWeekPlans } from "@/features/food/services/week-plan-service";
import { ShoppingListView } from "@/features/food/components/ShoppingListView";
import { createShoppingListAction } from "@/features/food/actions/shopping-list-actions";
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
      <Breadcrumb items={[{ label: "food", href: "/food" }, { label: "shopping" }]} />
      
      <div className="flex justify-between items-start mb-12">
        <Heading title="Shopping Lists" />
        <div className="flex gap-4">
          {weekPlans.length > 0 && (
            <form action={handleGenerateFromLatest}>
              <button 
                type="submit"
                className="bg-accent text-bg px-5 py-2 rounded text-[10px] font-mono uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
              >
                Generate from Plan
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {shoppingLists.length > 0 ? (
          shoppingLists.map((list) => (
            <section key={list.id}>
              <ShoppingListView list={list} />
            </section>
          ))
        ) : (
          <div className="py-24 border border-dashed border-border rounded-lg text-center flex flex-col items-center gap-4">
            <p className="text-secondary text-sm">No shopping lists generated yet.</p>
            {weekPlans.length === 0 && (
              <p className="text-muted text-xs">Create a Week Plan first to generate a list.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
