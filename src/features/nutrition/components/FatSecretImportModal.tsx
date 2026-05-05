"use client";

import { useState } from "react";
import { Search, Loader2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { searchFatSecretAction, importFatSecretProductAction } from "../actions/fatsecret.actions";
import { FoodProduct } from "@/app/generated/prisma";

interface FatSecretImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (product: FoodProduct) => void;
}

interface FatSecretSearchResult {
  id: string;
  name: string;
  brand: string;
  description: string;
  type: string;
}

const CATEGORIES = ["FRUITS", "VEGETABLES", "DAIRY", "MEAT", "FISH", "GRAINS", "LEGUMES", "NUTS", "OILS", "BEVERAGES", "SNACKS", "BAKERY", "SPICES", "SAUCES", "OTHER"];

export function FatSecretImportModal({ isOpen, onClose, onImportSuccess }: FatSecretImportModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FatSecretSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("OTHER");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const data = await searchFatSecretAction(query);
      setResults(data);
    } catch {
      toast.error("Failed to search FatSecret");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (foodId: string) => {
    setImportingId(foodId);
    try {
      const result = await importFatSecretProductAction(foodId, selectedCategory);
      if (result.success) {
        toast.success("Product imported from FatSecret");
        onImportSuccess(result.product as FoodProduct);
        onClose();
      }
    } catch {
      toast.error("Failed to import product");
    } finally {
      setImportingId(null);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Import from FatSecret"
      maxWidth="max-w-xl"
      bare
    >
      <div className="p-6 space-y-5">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted opacity-50" />
              <Input
                placeholder="Search products in FatSecret..."
                className="pl-9 rounded-xl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button 
              variant="primary" 
              className="rounded-xl"
              onClick={handleSearch} 
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? <Loader2 size={14} className="animate-spin" /> : "Search"}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[10px] font-mono text-muted tracking-wider uppercase">Default Category for Imports:</label>
            <select 
              className="bg-surface border border-border rounded-lg px-2 py-1 text-xs outline-none focus:border-accent/50"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
          {results.length > 0 ? (
            results.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-xl hover:border-accent/30 transition-colors group"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold text-text truncate">{item.name}</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-accent/10 text-accent rounded uppercase">
                      {item.brand}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted truncate">{item.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-8 px-3"
                  onClick={() => handleImport(item.id)}
                  disabled={!!importingId}
                >
                  {importingId === item.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <>
                      <Download size={12} className="mr-1.5" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            ))
          ) : (
            !isSearching && query && (
              <div className="text-center py-10 text-muted italic text-sm">
                No products found for &quot;{query}&quot;
              </div>
            )
          )}
        </div>
      </div>
    </Dialog>
  );
}
