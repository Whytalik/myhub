"use client";

import { useState } from "react";
import { Plus, ShoppingCart, ExternalLink, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { WishlistForm } from "@/features/other/wishlist/components/WishlistForm";
import { upsertWishlistItemAction } from "@/features/other/wishlist/actions/wishlist-actions";
import type { WishlistItemData } from "@/features/other/wishlist/types";
import type { UpsertWishlistItemInput } from "@/features/other/wishlist/types";

interface WishlistPageClientProps {
  items: WishlistItemData[];
}

export function WishlistPageClient({ items }: WishlistPageClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-end mb-16">
        <div className="flex flex-col">
          {/* This content is static, can remain part of server component if needed */}
        </div>
        
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus size={16} />
          Add Item
        </Button>
        
        <Dialog 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)}
          title="Add to Wishlist"
          maxWidth="600px"
        >
<WishlistForm 
            onSuccess={() => setIsDialogOpen(false)}
            onCancel={() => setIsDialogOpen(false)}
            onSubmit={async (data: UpsertWishlistItemInput) => {
              await upsertWishlistItemAction(data);
            }}
          />
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-20 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center text-accent/40">
             <ShoppingCart size={40} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-heading uppercase tracking-tight text-text">Your wishlist is empty</h3>
            <p className="text-secondary text-sm max-w-xs mx-auto">
              Start adding items you want to acquire or experiences you want to have.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div 
              key={item.id}
              className="group bg-surface border border-border rounded-xl p-6 flex items-center justify-between hover:border-accent/40 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className={`w-2 h-2 rounded-full ${
                  item.priority === "HIGH" || item.priority === "URGENT" ? "bg-red-500" :
                  item.priority === "MEDIUM" ? "bg-orange-500" : "bg-blue-500"
                }`} />
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-heading uppercase tracking-tight text-text">
                      {item.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent uppercase tracking-widest">
                      {item.status}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-secondary text-sm">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-8">
                {item.price && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Price</span>
                    <span className="text-text font-bold">${item.price.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  {item.url && (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-raised rounded-lg text-muted hover:text-accent transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <Button variant="ghost" size="icon" className="text-muted">
                    <MoreVertical size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
