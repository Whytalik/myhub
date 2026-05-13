"use client"

import { useState, useTransition } from "react"
import { Check, Edit2, RefreshCw, AlertCircle, ShoppingBag, Home } from "lucide-react"
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
    packageWeight: number | null
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
  const [availableEditId, setAvailableEditId] = useState<string | null>(null)
  const [availableValue, setAvailableValue] = useState("")
  const [showRegenConfirm, setShowRegenConfirm] = useState(false)

  const missingItems = items.filter(item => {
    const available = item.availableGrams ?? item.product.pantryStock ?? 0
    return available < item.requiredRawGrams
  })

  const handleStatusChange = (itemId: string, newStatus: CartItemStatus) => {
    startTransition(async () => {
      const result = await updateCartItemStatus(itemId, newStatus)
      if (result.success) {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item))
        toast.success("Status updated")
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

  const handleAvailableUpdate = (itemId: string) => {
    const availableGrams = parseFloat(availableValue) || 0
    startTransition(async () => {
      const result = await updateCartItemStatus(itemId, CartItemStatus.HAVE, availableGrams)
      if (result.success) {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, availableGrams, status: CartItemStatus.HAVE } : item))
        setAvailableEditId(null)
        toast.success("Available amount updated")
      } else {
        toast.error(result.error || "Failed to update")
      }
    })
  }

  const handleRegenerate = () => {
    startTransition(async () => {
      const result = await generateShoppingCart(weekPlanId)
      if (result.success) {
        toast.success("Shopping cart regenerated")
        setShowRegenConfirm(false)
      } else {
        toast.error(result.error || "Failed to regenerate")
      }
    })
  }

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.product.category || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, CartItem[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShoppingBag size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="text-body font-semibold text-text-primary">Shopping Cart</h2>
            <p className="text-note text-text-muted">{items.length} items</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowRegenConfirm(true)} disabled={isPending}>
          <RefreshCw size={14} className="mr-1.5" />
          Regenerate
        </Button>
      </div>

      {/* Warnings */}
      {varietyWarnings.length > 0 && (
        <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
            <div>
              <h3 className="text-note font-medium text-warning mb-2">Variety Warnings</h3>
              <div className="flex flex-wrap gap-2">
                {varietyWarnings.map((w, i) => (
                  <span key={i} className="text-micro font-mono bg-warning/10 text-warning px-2 py-1 rounded-lg">
                    {w.dishName}: {w.count} times
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {missingItems.length > 0 && (
        <div className="p-4 bg-danger/5 border border-danger/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-danger mt-0.5 shrink-0" />
            <div>
              <h3 className="text-note font-medium text-danger">Missing Items</h3>
              <p className="text-micro text-text-secondary mt-1">
                {missingItems.length} item(s) need to be purchased or restocked.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      {Object.entries(groupedItems).map(([category, catItems]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border-dim" />
            <h3 className="text-note font-bold font-mono text-text-muted tracking-widest uppercase">{category}</h3>
            <div className="h-px flex-1 bg-border-dim" />
          </div>
          <div className="space-y-2">
            {catItems.map((item) => {
              const available = item.availableGrams ?? item.product.pantryStock ?? 0
              const deficit = Math.max(0, item.requiredRawGrams - available)
              const packageWeight = item.product.packageWeight || 100
              const packagesCount = item.packagesCount ?? Math.ceil(item.requiredRawGrams / packageWeight)
              const isComplete = item.status === "BOUGHT" || item.status === "HAVE"

              return (
                <div key={item.id} className={`p-4 border rounded-xl transition-all ${isComplete ? "bg-success/5 border-success/20" : "bg-surface border-border hover:border-border-strong"}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-body font-medium text-text-primary">{item.product.name}</span>
                        {deficit > 0 && !isComplete && (
                          <span className="text-micro font-mono bg-danger/10 text-danger px-1.5 py-0.5 rounded">
                            -{deficit.toFixed(0)}g
                          </span>
                        )}
                      </div>
                      <div className="text-note font-mono text-text-secondary">
                        Need: {item.requiredRawGrams.toFixed(0)}g · Available: {available.toFixed(0)}g · ~{packagesCount} pkg{packagesCount !== 1 ? "s" : ""} ({packageWeight}g)
                        {item.totalCost != null && item.totalCost > 0 && ` · ${item.totalCost.toFixed(1)}₴`}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.dishes.map((d, i) => (
                          <span key={i} className="text-micro font-mono bg-bg/50 border border-border/50 text-text-secondary px-1.5 py-0.5 rounded">
                            {d.dishName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      {availableEditId === item.id ? (
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={availableValue}
                            onChange={(e) => setAvailableValue(e.target.value)}
                            className="w-20 h-8 text-note"
                            placeholder="grams"
                          />
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleAvailableUpdate(item.id)}>
                            <Check size={14} />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-micro font-mono"
                          onClick={() => {
                            setAvailableEditId(item.id)
                            setAvailableValue(String(available))
                          }}
                        >
                          Have: {available.toFixed(0)}g
                        </Button>
                      )}

                      {editingId === item.id ? (
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 h-8 text-note"
                            placeholder="pkgs"
                          />
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleQuantityUpdate(item.id)}>
                            <Check size={14} />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingId(item.id)
                            setEditValue(String(packagesCount))
                          }}
                        >
                          <Edit2 size={14} />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant={isComplete ? "primary" : "outline"}
                        className="h-8"
                        onClick={() => handleStatusChange(item.id, isComplete ? CartItemStatus.TO_BUY : CartItemStatus.BOUGHT)}
                      >
                        {isComplete ? <Check size={14} /> : <Home size={14} />}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Total Cost */}
      <div className="p-5 bg-surface border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-body font-medium text-text-primary">Total Estimated Cost</span>
          <span className="text-heading font-bold text-text-primary">{totalCost.toFixed(1)}₴</span>
        </div>
        {Object.keys(personCosts).length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <div className="text-caption font-mono text-text-muted tracking-wider mb-2">Cost by Person</div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(personCosts).map(([id, pc]) => (
                <div key={id} className="flex items-center gap-1 text-note font-mono">
                  <span className="text-text-secondary">{pc.name}:</span>
                  <span className="font-bold text-text-primary">{pc.cost.toFixed(1)}₴</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog
        isOpen={showRegenConfirm}
        onClose={() => setShowRegenConfirm(false)}
        title="Regenerate Shopping Cart?"
        description="This will recalculate all items based on current week plan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRegenConfirm(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleRegenerate} disabled={isPending}>
              {isPending ? "Regenerating..." : "Regenerate"}
            </Button>
          </>
        }
      >
        <p>Current cart data will be replaced with newly calculated items.</p>
      </Dialog>
    </div>
  )
}
