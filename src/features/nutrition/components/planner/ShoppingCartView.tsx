"use client"

import { useState, useTransition, useMemo } from "react"
import { 
  Check, 
  Edit2, 
  RefreshCw, 
  AlertCircle, 
  ShoppingBag, 
  Home, 
  Copy,
  ChevronDown,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { toast } from "sonner"
import { updateCartItemStatus, updateCartItemQuantity, generateShoppingCart } from "../../actions/shopping"
import { CartItemStatus } from "@/app/generated/prisma"

interface CartItem {
  id: string
  productId: string
  requiredRawGrams: number
  availableGrams: number | null
  packagesCount: number | null
  totalCost: number | null
  status: string
  product: {
    name: string
    price: number | null
    standardPackageAmount: number | null
    pantryStock: number | null
    category: string | null
  }
  dishes: { dishName: string; dishId: string }[]
}

interface ShoppingCartViewProps {
  itemsByCategory: Record<string, CartItem[]>
  weekPlanId: string
  totalCost: number
  personCosts: Record<string, { name: string; cost: number }>
  varietyWarnings: { dishName: string; count: number; days: number[] }[]
}

export function ShoppingCartView({ itemsByCategory, weekPlanId, totalCost, personCosts, varietyWarnings }: ShoppingCartViewProps) {
  const [items, setItems] = useState<CartItem[]>(Object.values(itemsByCategory).flat())
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showRegenConfirm, setShowRegenConfirm] = useState(false)

  const missingItemsCount = useMemo(() => items.filter(item => {
    const available = item.availableGrams ?? item.product.pantryStock ?? 0
    return item.status === CartItemStatus.TO_BUY && available < item.requiredRawGrams
  }).length, [items])

  const handleStatusChange = (itemId: string, newStatus: CartItemStatus) => {
    startTransition(async () => {
      const result = await updateCartItemStatus(itemId, newStatus)
      if (result.success) {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item))
        toast.success(newStatus === CartItemStatus.BOUGHT ? "Marked as Bought" : "Status updated")
      } else {
        toast.error(result.error || "Failed to update status")
      }
    })
  }

  const handleQuantityUpdate = (itemId: string) => {
    const packagesCount = parseInt(editValue) || 0
    startTransition(async () => {
      const result = await updateCartItemQuantity(itemId, packagesCount)
      if (result.success) {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, packagesCount, status: CartItemStatus.BOUGHT } : item))
        setEditingId(null)
        toast.success("Quantity updated")
      } else {
        toast.error(result.error || "Failed to update quantity")
      }
    })
  }

  const handleRegenerate = () => {
    startTransition(async () => {
      const result = await generateShoppingCart(weekPlanId)
      if (result.success) {
        toast.success("Shopping cart regenerated")
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to regenerate")
      }
    })
  }

  const copyToClipboard = () => {
    const list = items
      .filter(i => i.status === CartItemStatus.TO_BUY)
      .map(i => {
        const qty = i.requiredRawGrams >= 1000 
          ? `${(i.requiredRawGrams / 1000).toFixed(1)}kg` 
          : `${Math.round(i.requiredRawGrams)}g`
        return `- ${i.product.name}: ${qty}`
      })
      .join("\n")
    
    navigator.clipboard.writeText(`Shopping List for the Week:\n${list}`)
    toast.success("Copied to clipboard")
  }

  const toggleExpand = (id: string) => {
    const next = new Set(expandedItems)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedItems(next)
  }

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.product.category || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, CartItem[]>)

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShoppingBag size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="text-body font-semibold text-text-primary">Weekly Shopping</h2>
            <p className="text-note text-text-muted">{items.length} items total</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-9 w-9 p-0">
            <Copy size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowRegenConfirm(true)} disabled={isPending} className="h-9">
            <RefreshCw size={14} className={isPending ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-micro font-mono text-text-muted uppercase tracking-wider mb-1">Cost</span>
          <span className="text-body font-bold text-text-primary">{totalCost.toFixed(0)}₴</span>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-micro font-mono text-text-muted uppercase tracking-wider mb-1">To Buy</span>
          <span className={`text-body font-bold ${missingItemsCount > 0 ? "text-amber-500" : "text-green-500"}`}>
            {missingItemsCount} items
          </span>
        </div>
      </div>

      {/* Warnings & Alerts */}
      {(varietyWarnings.length > 0 || missingItemsCount > 0) && (
        <div className="space-y-2">
          {varietyWarnings.length > 0 && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <div className="text-micro text-amber-600 dark:text-amber-400">
                <span className="font-semibold uppercase mr-1">Variety:</span>
                {varietyWarnings.map(w => w.dishName).join(", ")} repeated 3+ times.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-8">
        {Object.entries(groupedItems).map(([category, catItems]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-3 px-1">
              <h3 className="text-caption font-bold text-text-muted uppercase tracking-widest">{category}</h3>
              <div className="h-px flex-1 bg-border-dim" />
            </div>
            
            <div className="bg-surface border border-border rounded-2xl divide-y divide-border/50 overflow-hidden">
              {catItems.map((item) => {
                const isBought = item.status === CartItemStatus.BOUGHT
                const isHave = item.status === CartItemStatus.HAVE
                const isExpanded = expandedItems.has(item.id)
                
                const qtyStr = item.requiredRawGrams >= 1000 
                  ? `${(item.requiredRawGrams / 1000).toFixed(2)}kg` 
                  : `${Math.round(item.requiredRawGrams)}g`

                return (
                  <div key={item.id} className={`transition-colors ${isBought ? "bg-raised/30" : ""}`}>
                    <div className="flex items-center px-4 py-3 gap-3">
                      {/* Status Checkbox */}
                      <button 
                        onClick={() => handleStatusChange(
                          item.id, 
                          isBought ? CartItemStatus.TO_BUY : CartItemStatus.BOUGHT
                        )}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                          isBought 
                            ? "bg-green-500 border-green-500 text-white" 
                            : isHave 
                              ? "bg-accent/10 border-accent text-accent" 
                              : "border-border hover:border-text-muted"
                        }`}
                      >
                        {isBought ? <Check size={14} strokeWidth={3} /> : isHave ? <Home size={12} /> : null}
                      </button>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0" onClick={() => toggleExpand(item.id)}>
                        <div className={`text-body font-medium transition-all truncate ${isBought ? "text-text-muted line-through" : "text-text-primary"}`}>
                          {item.product.name}
                        </div>
                        <div className="flex items-center gap-2 text-micro font-mono text-text-secondary">
                          <span className={isBought ? "text-text-muted" : "text-accent font-bold"}>{qtyStr}</span>
                          {item.totalCost && item.totalCost > 0 && (
                            <span className="text-text-muted">· {Math.round(item.totalCost)}₴</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleStatusChange(item.id, isHave ? CartItemStatus.TO_BUY : CartItemStatus.HAVE)}
                          className={`h-8 w-8 p-0 rounded-lg ${isHave ? "text-accent bg-accent/10" : "text-text-muted"}`}
                        >
                          <Home size={14} />
                        </Button>
                        <button 
                          onClick={() => toggleExpand(item.id)}
                          className={`h-8 w-8 flex items-center justify-center text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Context */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-border/30 bg-raised/10">
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {item.dishes.map((d, i) => (
                              <div key={i} className="text-micro font-mono bg-surface border border-border/50 px-2 py-0.5 rounded-md text-text-secondary">
                                {d.dishName}
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between text-micro font-mono pt-2 border-t border-border/20">
                            <div className="text-text-muted">
                              Pkg size: {item.product.standardPackageAmount || "—"}g
                            </div>
                            <div className="flex items-center gap-2">
                              {editingId === item.id ? (
                                <div className="flex gap-1 items-center">
                                  <Input 
                                    type="number" 
                                    value={editValue} 
                                    onChange={e => setEditValue(e.target.value)} 
                                    className="h-7 w-16 text-micro py-0 px-2 border-accent"
                                    autoFocus
                                  />
                                  <Button size="sm" className="h-7 px-2" onClick={() => handleQuantityUpdate(item.id)}>Save</Button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setEditingId(item.id)
                                    setEditValue(String(item.packagesCount || 1))
                                  }}
                                  className="flex items-center gap-1 text-accent hover:underline"
                                >
                                  <Edit2 size={10} />
                                  {item.packagesCount || Math.ceil(item.requiredRawGrams / (item.product.standardPackageAmount || 1))} pkgs
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Person Breakdown */}
      <div className="p-6 bg-surface border border-border rounded-3xl space-y-4">
        <h4 className="text-note font-bold text-text-primary flex items-center gap-2">
          <Info size={14} className="text-accent" />
          Budget Distribution
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(personCosts).map(([id, pc]) => (
            <div key={id} className="flex items-center justify-between p-3 bg-raised/30 rounded-2xl border border-border/50">
              <span className="text-note font-medium text-text-secondary">{pc.name}</span>
              <span className="text-note font-mono font-bold text-text-primary">{pc.cost.toFixed(0)}₴</span>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        isOpen={showRegenConfirm}
        onClose={() => setShowRegenConfirm(false)}
        title="Refresh List?"
        description="Recalculate quantities based on the current week plan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRegenConfirm(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleRegenerate} disabled={isPending}>
              {isPending ? "Refreshing..." : "Refresh Now"}
            </Button>
          </>
        }
      >
        <p className="text-body text-text-secondary">
          Manual overrides and &quot;Bought&quot; statuses might be reset during regeneration.
        </p>
      </Dialog>
    </div>
  )
}
