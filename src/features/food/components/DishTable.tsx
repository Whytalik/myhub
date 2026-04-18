"use client";

import { DataTable } from "@/components/ui/data-table";
import { Dish, DishIngredient, Product } from "@/app/generated/prisma/client";
import { calculateDishStats } from "../logic/recalculator";

interface DishWithIngredients extends Dish {
  ingredients: (DishIngredient & { product: Product })[];
}

interface DishTableProps {
  initialDishes: DishWithIngredients[];
}

export function DishTable({ initialDishes }: DishTableProps) {
  const columns = [
    {
      header: "Dish Name",
      accessorKey: "name",
      cell: (d: DishWithIngredients) => (
        <div className="flex flex-col">
          <span className="font-medium text-[13px]">{d.name}</span>
          {d.description && <span className="text-muted text-[11px] line-clamp-1">{d.description}</span>}
        </div>
      ),
    },
    {
      header: "Ingredients",
      accessorKey: "ingredients",
      cell: (d: DishWithIngredients) => (
        <div className="flex flex-wrap gap-1.5">
          {d.ingredients.map((ing) => (
            <span
              key={ing.id}
              className="text-[10px] font-mono bg-raised px-1.5 py-0.5 rounded text-secondary border border-border"
            >
              {ing.product.name}
            </span>
          ))}
          {d.ingredients.length === 0 && <span className="text-muted text-[10px]">No ingredients</span>}
        </div>
      ),
    },
    {
      header: "Nutrition",
      accessorKey: "nutrition",
      cell: (d: DishWithIngredients) => {
        const stats = calculateDishStats(d);
        return (
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <div className="flex flex-col">
              <span className="text-accent font-bold">{Math.round(stats.calories)}</span>
              <span className="text-[9px] text-muted uppercase">kcal</span>
            </div>
            <div className="flex gap-3 text-secondary/60">
              <span title="Protein">P: <b className="text-secondary">{stats.protein.toFixed(1)}</b></span>
              <span title="Fat">F: <b className="text-secondary">{stats.fat.toFixed(1)}</b></span>
              <span title="Carbs">C: <b className="text-secondary">{stats.carbs.toFixed(1)}</b></span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Yield",
      accessorKey: "yield",
      align: "center" as const,
      cell: (d: DishWithIngredients) => (
        <span className="text-[11px] font-mono text-muted">
          x{d.yield?.toFixed(1) || "1.0"}
        </span>
      ),
    },
  ];

  return <DataTable data={initialDishes} columns={columns} />;
}
