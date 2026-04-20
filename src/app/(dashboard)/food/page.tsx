import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { prisma } from "@/lib/prisma";
import { Tabs } from "@/components/ui/tabs";
import { LayoutDashboard, Settings2, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Food Space",
};

export default async function FoodDashboardPage() {
  const [productCount, dishCount, planCount, shoppingCount] = await Promise.all([
    prisma.product.count(),
    prisma.dish.count(),
    prisma.weekPlan.count(),
    prisma.shoppingList.count(),
  ]);

  const sections = [
    {
      title: "Products",
      href: "/food/products",
      description: "Inventories, macro-data, and source tracking.",
      count: `${productCount} items`,
    },
    {
      title: "Dishes",
      href: "/food/dishes",
      description: "Recipe repository with automated macro scaling.",
      count: `${dishCount} recipes`,
    },
    {
      title: "Plans",
      href: "/food/plans",
      description: "Daily & Weekly schedules with calorie targets.",
      count: `${planCount} active`,
    },
    {
      title: "Shopping",
      href: "/food/shopping",
      description: "Smart aggregation of ingredients for procurement.",
      count: `${shoppingCount} lists`,
    },
  ];

  const workflow = [
    {
      step: "01",
      name: "Inventory",
      desc: "Add raw products with their macro-nutrient data per 100g. This is your foundation.",
    },
    {
      step: "02",
      name: "Composition",
      desc: "Combine products into Dishes. Set default ingredients and base proportions.",
    },
    {
      step: "03",
      name: "Orchestration",
      desc: "Schedule dishes into Day or Week plans. Set calorie targets for automated scaling.",
    },
    {
      step: "04",
      name: "Procurement",
      desc: "Generate a shopping list from your plan. The space sums all quantities automatically.",
    },
  ];

  const dashboardContent = (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Workflow Section */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">Operational Workflow</h4>
          <div className="h-px flex-1 bg-border/30" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {workflow.map((w, i) => (
            <div key={w.step} className="relative group">
              <div className="flex flex-col gap-3">
                <span className="text-4xl font-heading text-border group-hover:text-accent/20 transition-colors duration-500">
                  {w.step}
                </span>
                <h5 className="font-mono text-[11px] text-text uppercase tracking-widest">{w.name}</h5>
                <p className="text-secondary text-xs leading-relaxed pr-4">
                  {w.desc}
                </p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-4 translate-y-[-50%] text-border">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {sections.map((section) => (
          <div
            key={section.href}
            className="group relative bg-surface border border-border p-8 rounded-xl hover:bg-raised transition-all duration-300 hover:border-accent/40 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <span className="font-heading text-8xl uppercase leading-none tracking-tighter -mr-8">
                {section.title}
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-heading text-5xl text-text uppercase leading-none tracking-tight group-hover:text-accent transition-colors">
                  {section.title}
                </h3>
                <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] bg-accent/10 px-2 py-1 rounded">
                  {section.count}
                </span>
              </div>
              <p className="text-secondary text-sm leading-relaxed mb-8 max-w-[80%]">
                {section.description}
              </p>
              <Link href={section.href} className="flex items-center gap-2 text-[10px] font-mono text-muted hover:text-text transition-colors">
                <span>Access Module</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      <div className="bg-surface/50 border border-border-dim rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <h4 className="text-[10px] font-mono text-muted uppercase tracking-[0.3em]">Space Intelligence</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
           <div>
             <p className="text-[10px] font-mono text-muted uppercase mb-2">Macro Scaling</p>
             <p className="text-sm font-medium">Automatic</p>
           </div>
           <div>
             <p className="text-[10px] font-mono text-muted uppercase mb-2">Shopping Logic</p>
             <p className="text-sm font-medium">Aggregated</p>
           </div>
           <div>
             <p className="text-[10px] font-mono text-muted uppercase mb-2">Unit Conversion</p>
             <p className="text-sm font-medium">Multi-standard</p>
           </div>
           <div>
             <p className="text-[10px] font-mono text-muted uppercase mb-2">Data Engine</p>
             <p className="text-sm font-medium">PostgreSQL / Prisma</p>
           </div>
        </div>
      </div>
    </div>
  );

  const systemContent = (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Settings2 size={18} className="text-accent" />
            <h3 className="text-xl font-bold uppercase tracking-tight">System Logic & Rules</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border p-6 rounded-2xl">
              <h4 className="font-mono text-[10px] text-accent uppercase tracking-widest mb-3">Calorie Targets</h4>
              <p className="text-sm text-secondary leading-relaxed">
                The system automatically scales dish ingredients to match the target calories set in a Day Plan. 
                If a dish is part of multiple meals, the target is distributed proportionally.
              </p>
            </div>
            <div className="bg-surface border border-border p-6 rounded-2xl">
              <h4 className="font-mono text-[10px] text-accent uppercase tracking-widest mb-3">Ingredient Aggregation</h4>
              <p className="text-sm text-secondary leading-relaxed">
                Shopping lists aggregate identical products across all dishes in a plan. 
                Measurements are converted to the base unit (usually grams or ml) before summing.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <Info size={18} className="text-accent" />
            <h3 className="text-xl font-bold uppercase tracking-tight">Principles of the Space</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center shrink-0 text-accent font-mono text-[10px]">1</div>
              <div>
                <p className="text-sm font-bold mb-1 uppercase tracking-tight">Precision over Guesswork</p>
                <p className="text-xs text-secondary leading-relaxed">Always weight ingredients raw. The system assumes raw weights for all caloric calculations unless specified.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center shrink-0 text-accent font-mono text-[10px]">2</div>
              <div>
                <p className="text-sm font-bold mb-1 uppercase tracking-tight">The 80/20 of Nutrition</p>
                <p className="text-xs text-secondary leading-relaxed">Focus on hitting your protein and total calorie targets first. Micros are secondary to macro consistency.</p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "food space" }]} />
      
      <div className="flex flex-col mb-16">
        <Heading title="Food Space" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          Integrated nutrition management environment. Automate your meal planning, 
          track macro-nutrients, and sync your shopping requirements with live targets.
        </p>
      </div>

      <Tabs 
        tabs={[
          { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} />, content: dashboardContent },
          { id: "system", label: "System Guide", icon: <Info size={14} />, content: systemContent },
        ]} 
      />
    </div>
  );
}
