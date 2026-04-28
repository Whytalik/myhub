"use client";

import { useTransition, useState, useMemo } from "react";
import { ShoppingList, ShoppingListItem, Product, ProductCategory } from "@/app/generated/prisma/client";
import { toggleShoppingListItemAction } from "../actions/shopping-list-actions";
import { Unit } from "@/app/generated/prisma";
import { toast } from "sonner";
import { ShoppingBasket, Package, CheckCircle2, Circle, Loader2 } from "lucide-react";

interface FullShoppingList extends ShoppingList {
  items: (ShoppingListItem & { product: Product })[];
}

interface ShoppingListViewProps {
  list: FullShoppingList;
}

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  FRUITS: "text-red-400",
  VEGETABLES: "text-emerald-400",
  DAIRY: "text-blue-300",
  MEAT: "text-rose-500",
  POULTRY: "text-orange-400",
  SEAFOOD: "text-cyan-400",
  GRAINS: "text-yellow-600",
  LEGUMES: "text-amber-700",
  NUTS_SEEDS: "text-amber-500",
  EGGS: "text-yellow-400",
  OILS_FATS: "text-yellow-200",
  SWEETS: "text-pink-400",
  BEVERAGES: "text-indigo-400",
  BAKERY: "text-orange-300",
  OTHER: "text-muted",
};

export function ShoppingListView({ list }: ShoppingListViewProps) {
  const [items, setItems] = useState(list.items);
  const [isPending, startTransition] = useTransition();

  const groupedItems = useMemo(() => {
    const groups: Partial<Record<ProductCategory, (ShoppingListItem & { product: Product })[]>> = {};
    items.forEach(item => {
      const cat = item.product.category || "OTHER";
      if (!groups[cat]) groups[cat] = [];
      groups[cat]!.push(item);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])) as [ProductCategory, (ShoppingListItem & { product: Product })[]][];
  }, [items]);

  const handleToggle = async (itemId: string, checked: boolean) => {
    startTransition(async () => {
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, checked } : item));
      try {
        await toggleShoppingListItemAction(itemId, checked);
      } catch {
        setItems(list.items);
        toast.error("Failed to update item status");
      }
    });
  };

  const calculateTotalPrice = () => {
    return items.reduce((acc, item) => {
      const baseAmount = (item.unit === Unit.GRAM || item.unit === Unit.ML) ? 100 : 1;
      const pricePerUnit = (item.product.price || 0) / baseAmount;
      return acc + (pricePerUnit * item.amount);
    }, 0);
  };

  return (
    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/20 relative">
      {isPending && (
        <div className="absolute inset-0 bg-bg/40 backdrop-blur-[2px] z-[100] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-raised p-4 rounded-2xl border border-border flex items-center gap-3 shadow-2xl">
            <Loader2 size={20} className="text-accent animate-spin" />
            <span className="text-[10px] font-mono tracking-widest text-accent font-bold">Updating...</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="px-8 py-6 border-b border-border bg-raised/40 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
            <ShoppingBasket size={24} />
          </div>
          <div>
            <h3 className="font-heading text-2xl text-text tracking-tight leading-none mb-1">
              {list.name || "Shopping List"}
            </h3>
            <p className="text-[10px] font-mono text-muted tracking-[0.2em]">
              {items.filter(i => i.checked).length} / {items.length} COMPLETED • {new Date(list.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-muted tracking-widest mb-1">Total Est. Cost</p>
          <p className="text-3xl font-heading text-accent tracking-tighter leading-none">
            ${calculateTotalPrice().toFixed(2)}
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="p-2 flex flex-col gap-2">
        {groupedItems.map(([category, catItems]) => (
          <div key={category} className="bg-raised/10 rounded-2xl border border-border/30 overflow-hidden">
            <div className="px-6 py-3 bg-raised/20 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full bg-current ${CATEGORY_COLORS[category]}`} />
                <span className={`text-[10px] font-mono tracking-[0.25em] font-bold ${CATEGORY_COLORS[category]}`}>
                  {category}
                </span>
              </div>
              <span className="text-[9px] font-mono text-muted/50">{catItems.length} items</span>
            </div>
            
            <div className="divide-y divide-border/20">
              {catItems.sort((a,b) => (a.checked === b.checked ? 0 : a.checked ? 1 : -1)).map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleToggle(item.id, !item.checked)}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-raised/40 transition-all cursor-pointer group ${
                    item.checked ? 'opacity-40' : ''
                  }`}
                >
                  <div className="shrink-0 transition-transform group-active:scale-90">
                    {item.checked ? (
                      <CheckCircle2 size={20} className="text-accent" />
                    ) : (
                      <Circle size={20} className="text-muted/30 group-hover:text-accent/50" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`text-[15px] font-bold transition-all duration-300 ${item.checked ? 'line-through text-muted italic' : 'text-text'}`}>
                      {item.product.name}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="px-3 py-1 rounded-full bg-bg/50 border border-border/50 flex items-center gap-1.5">
                      <span className="text-xs font-black text-accent tabular-nums">
                        {item.amount % 1 === 0 ? item.amount : item.amount.toFixed(1)}
                      </span>
                      <span className="text-[9px] font-mono text-muted tracking-wider">
                        {item.unit.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="py-20 flex flex-col items-center gap-4 text-muted">
          <Package size={48} strokeWidth={1} className="opacity-20" />
          <p className="text-xs font-mono tracking-widest">No items in this list</p>
        </div>
      )}
    </div>
  );
}
