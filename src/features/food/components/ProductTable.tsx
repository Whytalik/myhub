"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Save, X, Plus, Trash2 } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/app/generated/prisma/client";
import { ProductStatus, ProductSource, ProductState, Unit, ProductCategory } from "@/app/generated/prisma";
import { updateProductAction, createProductAction, deleteProductAction } from "../actions/product-actions";
import type { UpdateProductInput } from "../types";

interface ProductTableProps {
  initialProducts: Product[];
  isEditModeExternal?: boolean;
}

export function ProductTable({ initialProducts, isEditModeExternal = false }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCreating = searchParams.get("create") === "true";
  const isEditMode = isEditModeExternal;

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const [newData, setNewData] = useState<{
    name: string;
    category: ProductCategory;
    status: ProductStatus;
    source: ProductSource;
    state: ProductState;
    unit: Unit;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  }>({
    name: "",
    category: ProductCategory.OTHER,
    status: ProductStatus.ACTIVE,
    source: ProductSource.MANUAL,
    state: ProductState.RAW,
    unit: Unit.GRAM,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
  });

  useEffect(() => {
    if (activeCategory !== "ALL" && Object.values(ProductCategory).includes(activeCategory as ProductCategory)) {
      setNewData(prev => ({ ...prev, category: activeCategory as ProductCategory }));
    }
  }, [activeCategory]);

  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    products.forEach(p => {
      const cat = String((p as Record<string, unknown>).category || "OTHER").toUpperCase();
      acc[cat] = (acc[cat] || 0) + 1;
    });
    return acc;
  }, [products]);

  const categoryTabs = useMemo(() => {
    return [
      { id: "ALL", label: `All (${products.length})` },
      ...Object.values(ProductCategory).map(cat => ({
        id: cat,
        label: `${String(cat).replace(/_/g, " ").toLowerCase()} (${counts[cat.toUpperCase()] || 0})`
      }))
    ];
  }, [products.length, counts]);

  const filteredProducts = useMemo(() => {
    if (!activeCategory || activeCategory === "ALL") return products;
    
    const target = String(activeCategory).toUpperCase();
    return products.filter(p => {
      const pCat = String((p as Record<string, unknown>).category || "OTHER").toUpperCase();
      return pCat === target;
    });
  }, [products, activeCategory]);

  const handleUpdate = async (id: string, field: string, value: string | number) => {
    const original = products.find(p => p.id === id);
    if (original && (original as Record<string, unknown>)[field] === value) return;

    setEditingId(id);
    
    startTransition(async () => {
      let updatedProducts = products.map(p => p.id === id ? { ...p, [field]: value } : p);
      
      if (["protein", "fat", "carbs"].includes(field)) {
        updatedProducts = updatedProducts.map(p => {
          if (p.id === id) {
            const calories = (Number(p.protein) || 0) * 4 + (Number(p.fat) || 0) * 9 + (Number(p.carbs) || 0) * 4;
            return { ...p, calories };
          }
          return p;
        });
      }

      setProducts(updatedProducts);

      try {
        const updateData: UpdateProductInput = { id, [field]: value } as UpdateProductInput;
        if (["protein", "fat", "carbs"].includes(field)) {
          const p = updatedProducts.find(p => p.id === id);
          if (p) updateData.calories = p.calories ?? undefined;
        }
        await updateProductAction(updateData);
        toast.success("Updated successfully");
      } catch {
        setProducts(initialProducts);
        toast.error("Update failed");
      } finally {
        setEditingId(null);
      }
    });
  };

  const handleCreate = async () => {
    if (!newData.name) return;

    startTransition(async () => {
      try {
        const calories = Number(newData.protein) * 4 + Number(newData.fat) * 9 + Number(newData.carbs) * 4;
        const product = await createProductAction({ ...newData, calories });
        
        setProducts(prev => [product as Product, ...prev]);
        setNewData({
          name: "",
          category: activeCategory !== "ALL" ? activeCategory as ProductCategory : ProductCategory.OTHER,
          status: ProductStatus.ACTIVE,
          source: ProductSource.MANUAL,
          state: ProductState.RAW,
          unit: Unit.GRAM,
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          fiber: 0,
        });
        toast.success("Created successfully");
        router.push("/food/products");
      } catch {
        toast.error("Creation failed");
      }
    });
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    startTransition(async () => {
      try {
        await deleteProductAction(productToDelete.id);
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        toast.success("Deleted successfully");
      } catch {
        toast.error("Deletion failed");
      } finally {
        setProductToDelete(null);
      }
    });
  };

  const cancelCreate = () => {
    router.push("/food/products");
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      width: "30%",
      cell: (p: Product) => (
        <div className="flex items-center gap-3 w-full group">
          {isEditMode && (
            <button 
              onClick={() => setProductToDelete(p)}
              className="p-1 hover:bg-accent-muted rounded text-secondary hover:text-accent transition-colors shrink-0"
            >
              <Trash2 size={14} />
            </button>
          )}
          <div className="relative flex items-center w-full min-w-0">
            {isEditMode ? (
              <Input
                variant="inline"
                className={`w-full -mx-1 ${editingId === p.id ? "opacity-50" : ""}`}
                defaultValue={p.name}
                onBlur={(e) => handleUpdate(p.id, "name", e.target.value)}
              />
            ) : (
              <span className="text-[13px] font-medium truncate">{p.name}</span>
            )}
            {editingId === p.id && (
              <div className="absolute right-0 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Properties",
      accessorKey: "properties",
      width: "280px",
      cell: (p: Product) => (
        <div className="flex gap-2 items-center">
          <span className="text-[11px] font-mono text-accent uppercase tracking-wider bg-accent-muted/20 px-1.5 py-0.5 rounded border border-accent/20 whitespace-nowrap">
            {String((p as Record<string, unknown>).category || "OTHER").replace(/_/g, " ")}
          </span>
          <span className="text-[11px] font-mono text-secondary uppercase tracking-wider bg-raised px-1.5 py-0.5 rounded border border-border/50 whitespace-nowrap">
            {p.state}
          </span>
          <span className="text-[11px] font-mono text-secondary uppercase tracking-wider bg-raised px-1.5 py-0.5 rounded border border-border/50 whitespace-nowrap">
            {p.unit}
          </span>
        </div>
      ),
    },
    {
      header: "Calories",
      accessorKey: "calories",
      width: "90px",
      cell: (p: Product) => (
        <div className="flex items-center gap-1">
          <span className="text-text font-mono text-[13px] font-bold">
            {Math.round(p.calories || 0)}
          </span>
          <span className="text-secondary text-[10px] font-mono opacity-50">kcal</span>
        </div>
      ),
    },
    {
      header: "Protein",
      accessorKey: "protein",
      width: "70px",
      cell: (p: Product) => (
        <div className="flex items-center gap-1">
          {isEditMode ? (
            <Input
              type="number"
              variant="inline"
              className="w-[35px] px-0 text-accent text-[11px]"
              defaultValue={p.protein || 0}
              onBlur={(e) => handleUpdate(p.id, "protein", parseFloat(e.target.value))}
            />
          ) : (
            <span className="text-accent font-mono text-[11px] min-w-[20px]">{p.protein || 0}</span>
          )}
          <span className="text-muted text-[10px] opacity-50">g</span>
        </div>
      ),
    },
    {
      header: "Fat",
      accessorKey: "fat",
      width: "70px",
      cell: (p: Product) => (
        <div className="flex items-center gap-1">
          {isEditMode ? (
            <Input
              type="number"
              variant="inline"
              className="w-[35px] px-0 text-secondary text-[11px]"
              defaultValue={p.fat || 0}
              onBlur={(e) => handleUpdate(p.id, "fat", parseFloat(e.target.value))}
            />
          ) : (
            <span className="text-secondary font-mono text-[11px] min-w-[20px]">{p.fat || 0}</span>
          )}
          <span className="text-muted text-[10px] opacity-50">g</span>
        </div>
      ),
    },
    {
      header: "Carbs",
      accessorKey: "carbs",
      width: "70px",
      cell: (p: Product) => (
        <div className="flex items-center gap-1">
          {isEditMode ? (
            <Input
              type="number"
              variant="inline"
              className="w-[35px] px-0 text-text text-[11px]"
              defaultValue={p.carbs || 0}
              onBlur={(e) => handleUpdate(p.id, "carbs", parseFloat(e.target.value))}
            />
          ) : (
            <span className="text-text font-mono text-[11px] min-w-[20px]">{p.carbs || 0}</span>
          )}
          <span className="text-muted text-[10px] opacity-50">g</span>
        </div>
      ),
    },
    {
      header: "Fiber",
      accessorKey: "fiber",
      width: "70px",
      cell: (p: Product) => (
        <div className="flex items-center gap-1">
          {isEditMode ? (
            <Input
              type="number"
              variant="inline"
              className="w-[35px] px-0 text-secondary/80 text-[11px]"
              defaultValue={p.fiber || 0}
              onBlur={(e) => handleUpdate(p.id, "fiber", parseFloat(e.target.value))}
            />
          ) : (
            <span className="text-secondary/80 font-mono text-[11px] min-w-[20px]">{p.fiber || 0}</span>
          )}
          <span className="text-muted text-[10px] opacity-50">g</span>
        </div>
      ),
    },
    {
      header: "",
      accessorKey: "actions",
      width: "60px",
      align: "right" as const,
      cell: () => <div className="w-10" />, 
    },
  ];

  const CreateRow = (
    <tr className="border-b border-accent/20 bg-accent-muted/5 animate-in fade-in slide-in-from-top-1 duration-200">
      <td className="px-4 py-3" style={{ width: "30%" }}>
        <Input
          autoFocus
          variant="inline"
          placeholder="Product name..."
          className="w-full -mx-1 placeholder:text-muted/50 text-text"
          value={newData.name}
          onChange={e => setNewData(prev => ({ ...prev, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
      </td>
      <td className="px-4 py-3" style={{ width: "280px" }}>
        <div className="flex gap-2 items-center">
          <Select 
            variant="inline"
            className="w-[100px]"
            value={newData.category}
            onChange={e => setNewData(prev => ({ ...prev, category: e.target.value as ProductCategory }))}
          >
            {Object.values(ProductCategory).map(c => <option key={c} value={c}>{String(c).replace(/_/g, " ")}</option>)}
          </Select>
          <Select 
            variant="inline"
            className="w-[70px]"
            value={newData.state}
            onChange={e => setNewData(prev => ({ ...prev, state: e.target.value as ProductState }))}
          >
            {Object.values(ProductState).map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select 
            variant="inline"
            className="w-[70px]"
            value={newData.unit}
            onChange={e => setNewData(prev => ({ ...prev, unit: e.target.value as Unit }))}
          >
            {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
          </Select>
        </div>
      </td>
      <td className="px-4 py-3" style={{ width: "90px" }}>
        <div className="flex items-center gap-1">
          <span className="text-text font-mono text-[13px] font-bold">
            {Math.round(Number(newData.protein) * 4 + Number(newData.fat) * 9 + Number(newData.carbs) * 4)}
          </span>
          <span className="text-secondary text-[10px] font-mono opacity-50">kcal</span>
        </div>
      </td>
      <td className="px-4 py-3" style={{ width: "70px" }}>
        <div className="flex items-center gap-1">
          <Input type="number" step="0.1" variant="inline" className="w-[35px] px-0 text-accent text-[11px]" value={newData.protein} onChange={e => setNewData(prev => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))} title="Protein" />
          <span className="text-muted text-[10px] opacity-50">g</span>
        </div>
      </td>
      <td className="px-4 py-3" style={{ width: "70px" }}>
        <div className="flex items-center gap-1">
          <Input type="number" step="0.1" variant="inline" className="w-[35px] px-0 text-secondary text-[11px]" value={newData.fat} onChange={e => setNewData(prev => ({ ...prev, fat: parseFloat(e.target.value) || 0 }))} title="Fat" />
          <span className="text-muted text-[10px] opacity-50">g</span>
        </div>
      </td>
      <td className="px-4 py-3" style={{ width: "70px" }}>
        <div className="flex items-center gap-1">
          <Input type="number" step="0.1" variant="inline" className="w-[35px] px-0 text-text text-[11px]" value={newData.carbs} onChange={e => setNewData(prev => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))} title="Carbs" />
          <span className="text-muted text-[10px] opacity-50">g</span>
        </div>
      </td>
      <td className="px-4 py-3" style={{ width: "70px" }}>
        <div className="flex items-center gap-1">
          <Input type="number" step="0.1" variant="inline" className="w-[35px] px-0 text-secondary/80 text-[11px]" value={newData.fiber} onChange={e => setNewData(prev => ({ ...prev, fiber: parseFloat(e.target.value) || 0 }))} title="Fiber" />
          <span className="text-muted text-[10px] opacity-50">g</span>
        </div>
      </td>
      <td className="px-4 py-3" style={{ width: "60px" }}>
        <div className="flex gap-1 justify-end">
          <button 
            onClick={handleCreate}
            disabled={isPending || !newData.name}
            className="p-1 hover:bg-accent-muted rounded text-accent transition-colors disabled:opacity-50"
          >
            <Save size={14} />
          </button>
          <button 
            onClick={cancelCreate}
            className="p-1 hover:bg-raised rounded text-muted transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-2">
      <Tabs 
        tabs={categoryTabs} 
        activeTab={activeCategory} 
        onTabChange={setActiveCategory} 
      />
      
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <DataTable 
          data={filteredProducts} 
          columns={columns} 
          prependRow={isCreating ? CreateRow : null}
          emptyState={
            <div className="flex flex-col items-center py-8">
              <p className="mb-4 text-secondary italic">No products found in this category.</p>
              <button 
                onClick={() => router.push("/food/products?create=true")}
                className="text-accent text-xs font-mono uppercase tracking-widest hover:underline flex items-center gap-2"
              >
                <Plus size={14} /> Add your first product
              </button>
            </div>
          }
        />
      </div>

      <Dialog 
        isOpen={!!productToDelete} 
        onClose={() => setProductToDelete(null)}
        title="Delete Product?"
        description="Dangerous Action"
        footer={
          <>
            <Button variant="secondary" onClick={() => setProductToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={isPending}>
              Delete
            </Button>
          </>
        }
      >
        <p>You are about to delete <strong>{productToDelete?.name}</strong>. This action is irreversible and will remove the product from all recipes and plans.</p>
      </Dialog>
    </div>
  );
}
