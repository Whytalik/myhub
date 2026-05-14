"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Search, Trash2, Plus, Edit2, Loader2, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { TabBar } from "@/components/ui/tab-bar";
import { FoodProduct, NutritionSource } from "@/app/generated/prisma";
import { deleteProduct, createProduct, updateProduct, importFromOpenFoodFacts, unifiedSearchProducts, exportProducts, deleteAllUserProducts } from "../actions/products";
import { JsonImportModal } from "./JsonImportModal";
import type { Store } from "../constants/stores";
import { STORE_META, ALL_STORES } from "../constants/stores";

interface ProductLibraryProps {
  initialProducts: FoodProduct[];
}

const CATEGORY_GROUPS: Record<string, string[]> = {
  ALL: ["FRUITS", "VEGETABLES", "DAIRY", "MEAT", "FISH", "GRAINS", "LEGUMES", "NUTS", "OILS", "BEVERAGES", "SNACKS", "BAKERY", "SPICES", "SAUCES", "OTHER"],
  "Fresh": ["FRUITS", "VEGETABLES"],
  "Protein": ["MEAT", "FISH", "LEGUMES", "NUTS"],
  "Pantry": ["DAIRY", "GRAINS", "OILS", "SPICES", "SAUCES", "BAKERY"],
  "Other": ["BEVERAGES", "SNACKS", "OTHER"],
};

const CATEGORIES = ["FRUITS", "VEGETABLES", "DAIRY", "MEAT", "FISH", "GRAINS", "LEGUMES", "NUTS", "OILS", "BEVERAGES", "SNACKS", "BAKERY", "SPICES", "SAUCES", "OTHER"];

interface ProductFormData {
  name: string;
  caloriesPer100: string;
  proteinPer100: string;
  fatPer100: string;
  carbsPer100: string;
  fiberPer100: string;
  unit: string;
  standardPackageAmount: string;
  price: string;
  category: string;
  stores: Store[];
}

const EMPTY_FORM: ProductFormData = {
  name: "", caloriesPer100: "", proteinPer100: "", fatPer100: "",
  carbsPer100: "", fiberPer100: "", unit: "GRAM", standardPackageAmount: "100",
  price: "", category: "OTHER", stores: [],
};

interface OFFProduct {
  code: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export function ProductLibrary({ initialProducts }: ProductLibraryProps) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState<FoodProduct | null>(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create/Edit modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FoodProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);

  // Unified search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ local: FoodProduct[]; external: OFFProduct[] } | null>(null);
  const [importingCode, setImportingCode] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [selectedSubTab, setSelectedSubTab] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Debounced unified search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const result = await unifiedSearchProducts(searchQuery);
      setIsSearching(false);
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setSearchResults({ local: [], external: [] });
        toast.error(result.error || "Search failed");
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    setSelectedSubTab(null);
  }, [selectedGroup]);

  // Library grid (when not searching)
  const groupedProducts = useMemo(() => {
    const groups: Record<string, FoodProduct[]> = {};
    products.forEach((p) => {
      const cat = p.category || "OTHER";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [products]);

  const activeCategories = useMemo(() => {
    const predefined = CATEGORIES.filter(cat => groupedProducts[cat]);
    const others = Object.keys(groupedProducts).filter(cat => !CATEGORIES.includes(cat));
    return [...predefined, ...others];
  }, [groupedProducts]);

  const groupTabs = useMemo(() => {
    return Object.keys(CATEGORY_GROUPS).map(key => ({
      id: key,
      label: key,
      count: key === "ALL"
        ? activeCategories.length
        : CATEGORY_GROUPS[key].filter(cat => activeCategories.includes(cat)).length,
    })).filter(tab => tab.count > 0 || tab.id === "ALL");
  }, [activeCategories]);

  const subTabs = useMemo(() => {
    if (selectedGroup === "ALL") {
      return activeCategories.map(cat => ({ id: cat, label: cat }));
    }
    const groupCats = CATEGORY_GROUPS[selectedGroup] || [];
    return groupCats
      .filter(cat => activeCategories.includes(cat))
      .map(cat => ({ id: cat, label: cat }));
  }, [selectedGroup, activeCategories]);

  const displayedCategories = useMemo(() => {
    if (selectedSubTab) return [selectedSubTab];
    if (selectedGroup === "ALL") return activeCategories;
    return CATEGORY_GROUPS[selectedGroup]?.filter(cat => activeCategories.includes(cat)) || [];
  }, [selectedGroup, selectedSubTab, activeCategories]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setShowFormModal(true);
  };

  const openEditForm = (product: FoodProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      caloriesPer100: String(product.caloriesPer100),
      proteinPer100: String(product.proteinPer100),
      fatPer100: String(product.fatPer100),
      carbsPer100: String(product.carbsPer100),
      fiberPer100: String(product.fiberPer100),
      unit: product.unit,
      standardPackageAmount: String(product.standardPackageAmount),
      price: product.price ? String(product.price) : "",
      category: product.category,
      stores: ((product as FoodProduct & { stores?: Store[] }).stores ?? []) as Store[],
    });
    setShowFormModal(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name.trim()) { toast.error("Name is required"); return; }
    if (!formData.caloriesPer100) { toast.error("Calories are required"); return; }

    const data = {
      name: formData.name.trim(),
      caloriesPer100: parseFloat(formData.caloriesPer100) || 0,
      proteinPer100: parseFloat(formData.proteinPer100) || 0,
      fatPer100: parseFloat(formData.fatPer100) || 0,
      carbsPer100: parseFloat(formData.carbsPer100) || 0,
      fiberPer100: parseFloat(formData.fiberPer100) || 0,
      unit: formData.unit,
      standardPackageAmount: parseFloat(formData.standardPackageAmount) || 100,
      price: formData.price ? parseFloat(formData.price) : undefined,
      category: formData.category,
      stores: formData.stores,
    };

    startTransition(async () => {
      try {
        const result = editingProduct
          ? await updateProduct(editingProduct.id, data)
          : await createProduct(data);
        if (result.success) {
          if (editingProduct) {
            setProducts(prev => prev.map(p => p.id === editingProduct.id ? result.data : p));
            toast.success("Product updated");
          } else {
            setProducts(prev => [...prev, result.data]);
            toast.success("Product created");
          }
          setShowFormModal(false);
          setEditingProduct(null);
        } else {
          toast.error(result.error || "Failed to save");
        }
      } catch {
        toast.error("Failed to save");
      }
    });
  };
const handleDelete = () => {
  if (!productToDelete) return;
  setIsDeleting(true);

  startTransition(async () => {
    try {
      const result = await deleteProduct(productToDelete.id);
      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        toast.success("Product deleted");
      } else {
        toast.error(result.error || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  });
};

const handleDeleteAll = () => {
  setIsDeletingAll(true);

  startTransition(async () => {
    try {
      const result = await deleteAllUserProducts();
      if (result.success) {
        setProducts((prev) => prev.filter(p => !p.userId)); // Keep global products
        toast.success("All personal products deleted");
        setShowDeleteAllDialog(false);
      } else {
        toast.error(result.error || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeletingAll(false);
    }
  });
};

  const handleImportOFF = (code: string) => {
    setImportingCode(code);
    importFromOpenFoodFacts(code).then(result => {
      setImportingCode(null);
      if (result.success) {
        setProducts(prev => [...prev, result.data]);
        toast.success("Product imported");
        setSearchQuery("");
      } else {
        toast.error(result.error || "Import failed");
      }
    });
  };

  const handleExport = async () => {
    const result = await exportProducts();
    if (result.success) {
      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nutrition-products.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Products exported");
    } else {
      toast.error(result.error || "Export failed");
    }
  };

  const handleImported = (newProducts: FoodProduct[]) => {
    setProducts(newProducts);
    setShowImportModal(false);
  };

  const sourceLabel = (source: NutritionSource) => {
    switch (source) {
      case NutritionSource.OPENFOODFACTS: return "OFF";
      case NutritionSource.USDA: return "USDA";
      default: return "Manual";
    }
  };

  const sourceColor = (source: NutritionSource) => {
    switch (source) {
      case NutritionSource.OPENFOODFACTS: return "text-blue-500";
      case NutritionSource.USDA: return "text-purple-500";
      default: return "text-muted";
    }
  };

  const ProductCard = useMemo(() => {
    const Card = ({ product, onEdit, onDelete }: { product: FoodProduct, onEdit: (p: FoodProduct) => void, onDelete: (p: FoodProduct) => void }) => (
      <div
        key={product.id}
        className="group bg-surface border border-border rounded-2xl p-5 hover:border-accent/30 transition-colors relative"
        style={{ contain: "content" }}
      >
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(product)} className="p-1.5 hover:bg-blue-500/10 rounded-lg text-muted hover:text-blue-500 transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(product)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
        <h3 className="text-lg font-semibold text-text mb-1 pr-16 truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-label font-mono font-bold ${sourceColor(product.nutritionSource)}`}>
            [{sourceLabel(product.nutritionSource)}]
          </span>
        </div>
        <div className="flex gap-3 text-note font-mono text-secondary mb-3">
          <span><b className="text-accent">{product.caloriesPer100.toFixed(0)}</b> kcal</span>
          <span>P: <b className="text-text">{product.proteinPer100.toFixed(1)}g</b></span>
          <span>F: <b className="text-text">{product.fatPer100.toFixed(1)}g</b></span>
          <span>C: <b className="text-text">{product.carbsPer100.toFixed(1)}g</b></span>
        </div>
        {product.price && product.price > 0 && (
          <div className="pt-3 border-t border-border/50">
            <span className="text-note font-mono text-amber-500 font-bold">
              {product.price.toFixed(1)}₴ / {product.standardPackageAmount}{product.unit}
            </span>
          </div>
        )}
        {(() => {
          const stores = ((product as FoodProduct & { stores?: Store[] }).stores ?? []) as Store[];
          if (stores.length === 0) return null;
          return (
            <div className="flex flex-wrap gap-1 mt-2">
              {stores.map((s) => (
                <span
                  key={s}
                  className="text-label font-mono px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: STORE_META[s].color + "1a", color: STORE_META[s].color }}
                >
                  {STORE_META[s].label}
                </span>
              ))}
            </div>
          );
        })()}
      </div>
    );
    Card.displayName = "ProductCard";
    return Card;
  }, []);

  const isSearchMode = searchQuery.trim().length >= 2;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          {isSearching ? (
            <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent animate-spin" />
          ) : (
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted opacity-50" />
          )}
          <Input
            placeholder="Search products..."
            className="pl-9 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteAllDialog(true)}
            disabled={isDeletingAll || isPending}
          >
            <Trash2 size={14} className="mr-1.5" /> Delete All
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowImportModal(true)}>
            <Upload size={14} className="mr-1.5" /> Import JSON
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleExport}>
            <Download size={14} className="mr-1.5" /> Export JSON
          </Button>
          <Button variant="primary" size="sm" className="rounded-xl" onClick={openCreateForm}>
            <Plus size={14} className="mr-1.5" /> Add Product
          </Button>
        </div>
      </div>

      {/* Search results panel */}
      {isSearchMode ? (
        <div className="space-y-6">
          {/* Local results */}
          {(searchResults?.local.length ?? 0) > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-note font-bold font-mono text-muted tracking-[0.2em] uppercase">В бібліотеці</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults!.local.map(product => (
                  <ProductCard key={product.id} product={product} onEdit={openEditForm} onDelete={setProductToDelete} />
                ))}
              </div>
            </div>
          )}

          {/* OFF results */}
          {(searchResults?.external.length ?? 0) > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-note font-bold font-mono text-blue-500/70 tracking-[0.2em] uppercase">Open Food Facts</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults!.external.map(product => (
                  <div key={product.code} className="bg-surface border border-border/60 rounded-2xl p-5 hover:border-blue-500/20 transition-colors">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-text leading-tight">{product.name}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 h-7 px-2 text-label rounded-lg"
                        onClick={() => handleImportOFF(product.code)}
                        disabled={importingCode === product.code}
                      >
                        {importingCode === product.code
                          ? <Loader2 size={12} className="animate-spin" />
                          : <><Download size={11} className="mr-1" />Import</>
                        }
                      </Button>
                    </div>
                    {product.brand && (
                      <p className="text-caption font-mono text-blue-500/70 mb-2">{product.brand}</p>
                    )}
                    <div className="flex gap-3 text-note font-mono text-secondary">
                      <span><b className="text-accent">{product.calories.toFixed(0)}</b> kcal</span>
                      <span>P: <b className="text-text">{product.protein.toFixed(1)}g</b></span>
                      <span>F: <b className="text-text">{product.fat.toFixed(1)}g</b></span>
                      <span>C: <b className="text-text">{product.carbs.toFixed(1)}g</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isSearching && searchResults && searchResults.local.length === 0 && searchResults.external.length === 0 && (
            <div className="flex flex-col items-center py-16 bg-surface border border-border rounded-2xl">
              <p className="text-base font-bold text-text mb-1">Нічого не знайдено</p>
              <p className="text-caption text-muted mt-1">Спробуйте інший запит або додайте продукт вручну</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={openCreateForm}>
                <Plus size={14} className="mr-1.5" /> Add Product
              </Button>
            </div>
          )}

          {/* Still loading */}
          {isSearching && !searchResults && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-muted" />
            </div>
          )}
        </div>
      ) : (
        /* Full library grid */
        <>
          <TabBar
            groups={groupTabs}
            activeGroup={selectedGroup}
            onGroupChange={(id) => { setSelectedGroup(id); setSelectedSubTab(null); }}
            subgroups={[{ id: "__all__", label: "ALL" }, ...subTabs]}
            activeSubgroup={selectedSubTab || "__all__"}
            onSubgroupChange={(id) => setSelectedSubTab(id === "__all__" ? null : id)}
          />

          {displayedCategories.length > 0 ? (
            <div className="space-y-8">
              {displayedCategories.map((category) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h2 className="text-note font-bold font-mono text-muted tracking-[0.2em] uppercase">{category}</h2>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedProducts[category].map((product) => (
                      <ProductCard key={product.id} product={product} onEdit={openEditForm} onDelete={setProductToDelete} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 bg-surface border border-border rounded-2xl">
              <p className="text-base font-bold text-text mb-1">No products yet</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={openCreateForm}>
                <Plus size={14} className="mr-1.5" /> Add Product
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingProduct(null); }}
        title={editingProduct ? "Edit Product" : "Add Product"}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowFormModal(false); setEditingProduct(null); }}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveProduct} disabled={isPending}>
              {isPending ? "Saving..." : editingProduct ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-caption font-mono text-muted tracking-wider">Name</label>
            <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Product name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption font-mono text-muted tracking-wider">Calories / 100g</label>
              <Input type="number" value={formData.caloriesPer100} onChange={(e) => setFormData(prev => ({ ...prev, caloriesPer100: e.target.value }))} />
            </div>
            <div>
              <label className="text-caption font-mono text-muted tracking-wider">Category</label>
              <Select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-caption font-mono text-muted tracking-wider">Protein</label>
              <Input type="number" value={formData.proteinPer100} onChange={(e) => setFormData(prev => ({ ...prev, proteinPer100: e.target.value }))} />
            </div>
            <div>
              <label className="text-caption font-mono text-muted tracking-wider">Fat</label>
              <Input type="number" value={formData.fatPer100} onChange={(e) => setFormData(prev => ({ ...prev, fatPer100: e.target.value }))} />
            </div>
            <div>
              <label className="text-caption font-mono text-muted tracking-wider">Carbs</label>
              <Input type="number" value={formData.carbsPer100} onChange={(e) => setFormData(prev => ({ ...prev, carbsPer100: e.target.value }))} />
            </div>
            <div>
              <label className="text-caption font-mono text-muted tracking-wider">Fiber</label>
              <Input type="number" value={formData.fiberPer100} onChange={(e) => setFormData(prev => ({ ...prev, fiberPer100: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-caption font-mono text-muted tracking-wider">Unit</label>
              <Select value={formData.unit} onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}>
                <option value="GRAM">g</option>
                <option value="ML">ml</option>
                <option value="PIECE">pcs</option>
              </Select>
            </div>
            <div>
              <label className="text-caption font-mono text-muted tracking-wider">Package Amount</label>
              <Input type="number" value={formData.standardPackageAmount} onChange={(e) => setFormData(prev => ({ ...prev, standardPackageAmount: e.target.value }))} />
            </div>
            <div>
              <label className="text-caption font-mono text-muted tracking-wider">Price (₴)</label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="text-caption font-mono text-muted tracking-wider block mb-2">Де купувати</label>
            <div className="flex flex-wrap gap-2">
              {ALL_STORES.map((s) => {
                const active = formData.stores.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      stores: active
                        ? prev.stores.filter(x => x !== s)
                        : [...prev.stores, s],
                    }))}
                    className="text-label font-mono px-2.5 py-1 rounded-lg border transition-all"
                    style={active
                      ? { backgroundColor: STORE_META[s].color + "1a", color: STORE_META[s].color, borderColor: STORE_META[s].color + "55" }
                      : { borderColor: "var(--border)", color: "var(--muted)" }
                    }
                  >
                    {STORE_META[s].label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Delete Product?"
        description="This action cannot be undone"
        footer={
          <>
            <Button variant="secondary" onClick={() => setProductToDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p>You are about to delete <strong>{productToDelete?.name}</strong>.</p>
      </Dialog>

      {/* Delete All Confirmation */}
      <Dialog
        isOpen={showDeleteAllDialog}
        onClose={() => setShowDeleteAllDialog(false)}
        title="Delete ALL Products?"
        description="This action is permanent and cannot be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteAllDialog(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteAll} disabled={isDeletingAll}>
              {isDeletingAll ? "Deleting..." : "Delete All Products"}
            </Button>
          </>
        }
      >
        <p>
          You are about to delete <strong>ALL</strong> your custom products. This action will fail if any products are currently used in dishes.
        </p>
      </Dialog>

      <JsonImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={handleImported}
      />
    </div>
  );
}
