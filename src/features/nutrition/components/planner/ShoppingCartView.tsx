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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Shopping Cart</h2>
          <span className="text-base text-muted-foreground">{items.length} items</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowRegenConfirm(true)} disabled={isPending}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>
        </div>
      </div>

      {varietyWarnings.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-base font-medium text-yellow-800 dark:text-yellow-200">Variety Warnings</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {varietyWarnings.map((w, i) => (
                  <span key={i} className="text-caption bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded">
                    ⚠️ {w.dishName}: {w.count} times
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {missingItems.length > 0 && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="text-base font-medium text-orange-800 dark:text-orange-200">Missing Items</h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                {missingItems.length} item(s) need to be purchased or restocked.
              </p>
            </div>
          </div>
        </div>
      )}

      {Object.entries(groupedItems).map(([category, catItems]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-base font-bold font-mono text-muted tracking-wider">{category}</h3>
          {catItems.map((item) => {
            const available = item.availableGrams ?? item.product.pantryStock ?? 0
            const deficit = Math.max(0, item.requiredRawGrams - available)
            const packageWeight = item.product.packageWeight || 100
            const packagesCount = item.packagesCount ?? Math.ceil(item.requiredRawGrams / packageWeight)
            const isComplete = item.status === "BOUGHT" || item.status === "HAVE"

            return (
              <div key={item.id} className={`p-4 border rounded-lg ${isComplete ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : ""}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.product.name}</span>
                      {deficit > 0 && !isComplete && (
                        <span className="text-caption bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">
                          -{deficit.toFixed(0)}g
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Need: {item.requiredRawGrams.toFixed(0)}g | Available: {available.toFixed(0)}g
                      <span className="ml-2">~{packagesCount} pkg{packagesCount !== 1 ? "s" : ""} ({packageWeight}g)</span>
                      {item.totalCost != null && item.totalCost > 0 && ` | ${item.totalCost.toFixed(1)}₴`}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.dishes.map((d, i) => (
                        <span key={i} className="text-caption bg-muted px-1.5 py-0.5 rounded">
                          {d.dishName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {availableEditId === item.id ? (
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          value={availableValue}
                          onChange={(e) => setAvailableValue(e.target.value)}
                          className="w-20 h-8 text-sm"
                          placeholder="grams"
                        />
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleAvailableUpdate(item.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-caption"
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
                          className="w-20 h-8 text-sm"
                          placeholder="pkgs"
                        />
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleQuantityUpdate(item.id)}>
                          <Check className="h-4 w-4" />
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
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant={isComplete ? "primary" : "outline"}
                      className="h-8"
                      onClick={() => handleStatusChange(item.id, isComplete ? CartItemStatus.TO_BUY : CartItemStatus.BOUGHT)}
                    >
                      {isComplete ? <Check className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}

      <div className="p-4 border rounded-lg bg-card space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-base font-medium">Total Estimated Cost</span>
          <span className="text-base font-bold">{totalCost.toFixed(1)}₴</span>
        </div>
        {Object.keys(personCosts).length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <div className="text-caption font-mono text-muted tracking-wider mb-2">Cost by Person</div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(personCosts).map(([id, pc]) => (
                <div key={id} className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">{pc.name}:</span>
                  <span className="font-mono font-bold">{pc.cost.toFixed(1)}₴</span>
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
