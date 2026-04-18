"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Product } from "@/app/generated/prisma/client";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface ProductSearchProps {
  products: Product[];
  onSelect: (product: Product) => void;
  placeholder?: string;
  className?: string;
}

export function ProductSearch({ products, onSelect, placeholder = "Search product...", className }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    if (!query) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  }, [products, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative group">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted opacity-50 group-focus-within:text-accent transition-colors" />
        <Input
          variant="inline"
          className="pl-8 pr-8 w-full"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button 
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-1">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-raised text-[13px] transition-colors flex justify-between items-center group"
                onClick={() => {
                  onSelect(p);
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                <span className="font-medium group-hover:text-accent transition-colors">{p.name}</span>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{p.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
