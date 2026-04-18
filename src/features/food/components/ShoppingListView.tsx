"use client";

import { useTransition, useState } from "react";
import { ShoppingList, ShoppingListItem, Product } from "@/app/generated/prisma/client";
import { toggleShoppingListItemAction } from "../actions/shopping-list-actions";
import { Unit } from "@/app/generated/prisma";
import { toast } from "sonner";

interface FullShoppingList extends ShoppingList {
  items: (ShoppingListItem & { product: Product })[];
}

interface ShoppingListViewProps {
  list: FullShoppingList;
}

export function ShoppingListView({ list }: ShoppingListViewProps) {
  const [items, setItems] = useState(list.items);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (itemId: string, checked: boolean) => {
    startTransition(async () => {
      // Optimistic update
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, checked } : item));
      try {
        await toggleShoppingListItemAction(itemId, checked);
      } catch {
        setItems(list.items); // Revert
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
    <div className="bg-surface border border-border rounded-lg overflow-hidden transition-all duration-300">
      <div className="px-6 py-4 border-b border-border-dim bg-raised/30 flex justify-between items-center">
        <div>
          <h3 className="font-heading text-2xl text-text uppercase tracking-tight">
            {list.name || "Shopping List"}
          </h3>
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider">
            {items.length} items • {new Date(list.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">Total Est.</p>
          <p className="text-xl font-heading text-accent tracking-tighter leading-none">
            ${calculateTotalPrice().toFixed(2)}
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`flex items-center gap-4 px-6 py-3 hover:bg-raised/20 transition-colors group ${
              item.checked ? 'opacity-50' : ''
            }`}
          >
            <div className="relative flex items-center justify-center w-4 h-4">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => handleToggle(item.id, e.target.checked)}
                className="w-4 h-4 rounded border-border bg-bg text-accent focus:ring-accent cursor-pointer z-10"
              />
              {isPending && (
                <div className="absolute inset-0 rounded-full border-2 border-accent/30 border-t-accent animate-spin scale-150" />
              )}
            </div>
            <div className="flex-1">
              <span className={`text-sm font-medium transition-all duration-200 ${item.checked ? 'line-through text-muted' : 'text-text'}`}>
                {item.product.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-secondary">
                {item.amount} {item.unit.toLowerCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
