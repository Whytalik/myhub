"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { Search, Trash2, Plus, Edit2, ExternalLink, Loader2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { FoodProduct, NutritionSource } from "@/app/generated/prisma";
import { deleteProduct, createProduct, updateProduct, searchOpenFoodFacts, importFromOpenFoodFacts } from "../actions/products";
import { FatSecretImportModal } from "./FatSecretImportModal";

interface ProductLibraryProps {
  initialProducts: FoodProduct[];
}

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
}

const EMPTY_FORM: ProductFormData = {
  name: "", caloriesPer100: "", proteinPer100: "", fatPer100: "",
  carbsPer100: "", fiberPer100: "", unit: "GRAM", standardPackageAmount: "100",
  price: "", category: "OTHER",
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create/Edit modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FoodProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);

  // OpenFoodFacts modal
  const [showOFFModal, setShowOFFModal] = useState(false);
  const [offQuery, setOffQuery] = useState("");
  const [offResults, setOffResults] = useState<OFFProduct[]>([]);
  const [offSearching, setOffSearching] = useState(false);
  const [offImporting, setOffImporting] = useState<string | null>(null);

  // FatSecret modal
  const [showFSModal, setShowFSModal] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

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

  const searchOFF = () => {
    if (!offQuery.trim()) return;
    setOffSearching(true);
    searchOpenFoodFacts(offQuery).then(result => {
      setOffSearching(false);
      if (result.success) {
        setOffResults(result.data);
      } else {
        toast.error(result.error || "Search failed");
      }
    });
  };

  const importOFF = (code: string) => {
    setOffImporting(code);
    importFromOpenFoodFacts(code).then(result => {
      setOffImporting(null);
      if (result.success) {
        setProducts(prev => [...prev, result.data]);
        toast.success("Product imported");
        setShowOFFModal(false);
      } else {
        toast.error(result.error || "Import failed");
      }
    });
  };

  const sourceLabel = (source: NutritionSource) => {
    switch (source) {
      case NutritionSource.OPENFOODFACTS: return "OFF";
      case NutritionSource.USDA: return "USDA";
      case NutritionSource.FATSECRET: return "FS";
      default: return "Manual";
    }
  };

  const sourceColor = (source: NutritionSource) => {
    switch (source) {
      case NutritionSource.OPENFOODFACTS: return "text-blue-500";
      case NutritionSource.USDA: return "text-purple-500";
      case NutritionSource.FATSECRET: return "text-emerald-500";
      default: return "text-muted";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted opacity-50"
          />
          <Input
            placeholder="Search products..."
            className="pl-9 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="primary" size="sm" className="rounded-xl" onClick={openCreateForm}>
          <Plus size={14} className="mr-1.5" /> Add Product
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-emerald-500" 
          onClick={() => setShowFSModal(true)}
        >
          <Download size={14} className="mr-1.5" /> Import from FatSecret
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowOFFModal(true)}>
          <ExternalLink size={14} className="mr-1.5" /> Import from OFF
        </Button>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-surface border border-border rounded-2xl p-5 hover:border-accent/30 transition-colors relative"
            >
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditForm(product)}
                  className="p-1.5 hover:bg-blue-500/10 rounded-lg text-muted hover:text-blue-500 transition-colors"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => setProductToDelete(product)}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <h3 className="text-[15px] font-semibold text-text mb-1 pr-16">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[10px] text-muted font-mono">
                  {product.category}
                </p>
                <span className={`text-[9px] font-mono font-bold ${sourceColor(product.nutritionSource)}`}>
                  [{sourceLabel(product.nutritionSource)}]
                </span>
              </div>

              <div className="flex gap-3 text-[11px] font-mono text-secondary mb-3">
                <span>
                  <b className="text-accent">{product.caloriesPer100.toFixed(0)}</b> kcal
                </span>
                <span>
                  P: <b className="text-text">{product.proteinPer100.toFixed(1)}g</b>
                </span>
                <span>
                  F: <b className="text-text">{product.fatPer100.toFixed(1)}g</b>
                </span>
                <span>
                  C: <b className="text-text">{product.carbsPer100.toFixed(1)}g</b>
                </span>
              </div>

              {product.price && product.price > 0 && (
                <div className="pt-3 border-t border-border/50">
                  <span className="text-[11px] font-mono text-amber-500 font-bold">
                    {product.price.toFixed(1)}₴ / {product.standardPackageAmount}{product.unit}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 bg-surface border border-border rounded-2xl">
          <p className="text-sm font-bold text-text mb-1">
            {searchQuery ? "No products found" : "No products yet"}
          </p>
          {!searchQuery && (
            <Button variant="primary" size="sm" className="mt-4" onClick={openCreateForm}>
              <Plus size={14} className="mr-1.5" /> Add Product
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingProduct(null); }}
        title={editingProduct ? "Edit Product" : "Add Product"}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowFormModal(false); setEditingProduct(null); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveProduct} disabled={isPending}>
              {isPending ? "Saving..." : editingProduct ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-mono text-muted tracking-wider">Name</label>
            <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Product name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-muted tracking-wider">Calories / 100g</label>
              <Input type="number" value={formData.caloriesPer100} onChange={(e) => setFormData(prev => ({ ...prev, caloriesPer100: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted tracking-wider">Category</label>
              <Select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-mono text-muted tracking-wider">Protein</label>
              <Input type="number" value={formData.proteinPer100} onChange={(e) => setFormData(prev => ({ ...prev, proteinPer100: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted tracking-wider">Fat</label>
              <Input type="number" value={formData.fatPer100} onChange={(e) => setFormData(prev => ({ ...prev, fatPer100: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted tracking-wider">Carbs</label>
              <Input type="number" value={formData.carbsPer100} onChange={(e) => setFormData(prev => ({ ...prev, carbsPer100: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted tracking-wider">Fiber</label>
              <Input type="number" value={formData.fiberPer100} onChange={(e) => setFormData(prev => ({ ...prev, fiberPer100: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-mono text-muted tracking-wider">Unit</label>
              <Select value={formData.unit} onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}>
                <option value="GRAM">g</option>
                <option value="ML">ml</option>
                <option value="PIECE">pcs</option>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted tracking-wider">Package Amount</label>
              <Input type="number" value={formData.standardPackageAmount} onChange={(e) => setFormData(prev => ({ ...prev, standardPackageAmount: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted tracking-wider">Price (₴)</label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} placeholder="0" />
            </div>
          </div>
        </div>
      </Dialog>

      <FatSecretImportModal 
        isOpen={showFSModal} 
        onClose={() => setShowFSModal(false)}
        onImportSuccess={(newProduct) => {
          setProducts(prev => [...prev, newProduct]);
        }}
      />

      {/* OpenFoodFacts Dialog */}
      <Dialog
        isOpen={showOFFModal}
        onClose={() => { setShowOFFModal(false); setOffResults([]); setOffQuery(""); }}
        title="Import from OpenFoodFacts"
        maxWidth="max-w-lg"
        bare
      >
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or barcode..."
              value={offQuery}
              onChange={(e) => setOffQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchOFF()}
            />
            <Button variant="primary" size="sm" onClick={searchOFF} disabled={offSearching || !offQuery.trim()}>
              {offSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            </Button>
          </div>

          {offResults.length > 0 && (
            <div className="max-h-80 overflow-y-auto space-y-2">
              {offResults.map((p) => (
                <div key={p.code} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    {p.brand && <div className="text-[10px] text-muted">{p.brand}</div>}
                    <div className="text-[10px] font-mono text-muted-foreground mt-1">
                      {p.calories.toFixed(0)} kcal · P: {p.protein.toFixed(1)}g · F: {p.fat.toFixed(1)}g · C: {p.carbs.toFixed(1)}g
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => importOFF(p.code)}
                    disabled={offImporting === p.code}
                  >
                    {offImporting === p.code ? <Loader2 size={14} className="animate-spin" /> : "Import"}
                  </Button>
                </div>
              ))}
            </div>
          )}
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
            <Button variant="secondary" onClick={() => setProductToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p>
          You are about to delete <strong>{productToDelete?.name}</strong>.
        </p>
      </Dialog>
    </div>
  );
}
