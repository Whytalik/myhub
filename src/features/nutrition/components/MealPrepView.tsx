"use client"

type WeekPlanData = {
  id: string
  name: string | null
  persons: { id: string; name: string | null }[]
  days: {
    dayOfWeek: number
    slots: {
      personId: string
      personName: string | null
      name: string
      entries: {
        dishId: string
        dishName: string
        dishType: string
        ingredients: {
          productName: string
          weight: number
          unit: string | null
        }[]
      }[]
      productEntries: {
        productId: string
        productName: string
        portionWeight: number
      }[]
    }[]
  }[]
}

interface DishOccurrence {
  count: number
  totalWeight: number
}

interface PersonAggregate {
  totalWeight: number
  dishes: Map<string, DishOccurrence>
}

interface ProductRow {
  productName: string
  persons: Map<string, PersonAggregate>
}

function buildAggregation(plan: WeekPlanData): ProductRow[] {
  const productMap = new Map<string, ProductRow>()

  function getOrCreateProduct(name: string): ProductRow {
    if (!productMap.has(name)) {
      productMap.set(name, { productName: name, persons: new Map() })
    }
    return productMap.get(name)!
  }

  function getOrCreatePerson(row: ProductRow, personName: string): PersonAggregate {
    if (!row.persons.has(personName)) {
      row.persons.set(personName, { totalWeight: 0, dishes: new Map() })
    }
    return row.persons.get(personName)!
  }

  for (const day of plan.days) {
    for (const slot of day.slots) {
      const personName = slot.personName ?? "?"

      for (const entry of slot.entries) {
        for (const ing of entry.ingredients) {
          if (ing.weight <= 0) continue
          const row = getOrCreateProduct(ing.productName)
          const agg = getOrCreatePerson(row, personName)
          agg.totalWeight += ing.weight
          const existing = agg.dishes.get(entry.dishName)
          if (existing) {
            existing.count += 1
            existing.totalWeight += ing.weight
          } else {
            agg.dishes.set(entry.dishName, { count: 1, totalWeight: ing.weight })
          }
        }
      }

      for (const pe of slot.productEntries) {
        if (pe.portionWeight <= 0) continue
        const row = getOrCreateProduct(pe.productName)
        const agg = getOrCreatePerson(row, personName)
        agg.totalWeight += pe.portionWeight
        const existing = agg.dishes.get("(пряма добавка)")
        if (existing) {
          existing.count += 1
          existing.totalWeight += pe.portionWeight
        } else {
          agg.dishes.set("(пряма добавка)", { count: 1, totalWeight: pe.portionWeight })
        }
      }
    }
  }

  // Sort by max total weight across persons, descending
  return [...productMap.values()].sort((a, b) => {
    const aMax = Math.max(...[...a.persons.values()].map(p => p.totalWeight))
    const bMax = Math.max(...[...b.persons.values()].map(p => p.totalWeight))
    return bMax - aMax
  })
}

function formatDishList(dishes: Map<string, DishOccurrence>): string {
  return [...dishes.entries()]
    .sort((a, b) => b[1].totalWeight - a[1].totalWeight)
    .map(([name, occ]) => occ.count > 1 ? `${name} ×${occ.count}` : name)
    .join(", ")
}

interface MealPrepViewProps {
  plan: WeekPlanData | null
}

export function MealPrepView({ plan }: MealPrepViewProps) {
  if (!plan) {
    return <div className="text-text-muted text-body">Немає даних плану.</div>
  }

  const rows = buildAggregation(plan)
  const personNames = plan.persons.map(p => p.name ?? "?")

  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted text-body">
        Інгредієнти не знайдені. Додайте страви до тижневого плану.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className={`grid gap-0 border border-border/50 rounded-xl overflow-hidden`}
           style={{ gridTemplateColumns: `1fr repeat(${personNames.length}, 160px)` }}>
        <div className="px-4 py-2 bg-raised text-caption font-mono text-text-muted uppercase">Продукт</div>
        {personNames.map(name => (
          <div key={name} className="px-4 py-2 bg-raised text-caption font-semibold text-text-primary border-l border-border/30">{name}</div>
        ))}
      </div>

      {/* Ingredient rows */}
      <div className="border border-border rounded-xl overflow-hidden divide-y divide-border/30">
        {rows.map(row => (
          <div
            key={row.productName}
            className={`grid hover:bg-surface-hover transition-colors`}
            style={{ gridTemplateColumns: `1fr repeat(${personNames.length}, 160px)` }}
          >
            <div className="px-4 py-3 text-caption text-text-secondary">{row.productName}</div>
            {personNames.map(name => {
              const agg = row.persons.get(name)
              if (!agg) return (
                <div key={name} className="px-4 py-3 border-l border-border/20 text-caption text-text-muted/30">—</div>
              )
              return (
                <div key={name} className="px-4 py-3 border-l border-border/20">
                  <span className="text-caption font-mono text-text-primary">{agg.totalWeight.toFixed(0)}г</span>
                  <div className="text-micro text-text-muted leading-tight mt-0.5 truncate" title={formatDishList(agg.dishes)}>
                    {formatDishList(agg.dishes)}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
