import "dotenv/config"
import { prisma } from "../src/lib/prisma"
import { calculateEntryNutrition } from "../src/lib/nutrition/calculations"

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

async function main() {
  const weekPlan = await prisma.weekPlan.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      dayPlans: {
        orderBy: { dayOfWeek: "asc" },
        include: {
          mealSlots: {
            orderBy: { order: "asc" },
            include: {
              person: true,
              dishEntries: {
                include: {
                  dish: { include: { ingredients: { include: { product: true, cookingMethod: true } } } },
                  ingredients: { orderBy: { ingredientIndex: "asc" } },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!weekPlan) {
    console.log("No week plan found")
    process.exit(1)
  }

  console.log(`Adjusting plan: ${weekPlan.name ?? weekPlan.id}`)

  for (const day of weekPlan.dayPlans) {
    console.log(`\nDay ${day.dayOfWeek}:`)
    for (const slot of day.mealSlots) {
      const person = slot.person
      // compute actual totals for this slot
      let slotKcal = 0
      slot.dishEntries.forEach((entry) => {
        const weights = entry.ingredients.map((ing) => ({ ingredientIndex: ing.ingredientIndex, weight: ing.weight, inputState: ing.inputState }))
        const nutrition = calculateEntryNutrition(entry.dish as any, weights)
        slotKcal += nutrition.total.kcal
      })

      const targetKcal = slot.targetKcal || (person.targetKcal ?? 2000) / 4
      if (slotKcal === 0) {
        console.log(`  Slot ${slot.name} (${person.name}): no kcal, skipping`)
        continue
      }

      const rawScale = targetKcal / slotKcal
      const scale = clamp(rawScale, 0.75, 1.25)
      if (Math.abs(scale - 1) < 0.01) {
        console.log(`  Slot ${slot.name} (${person.name}): already close to target (${slotKcal.toFixed(0)} kcal)`)
        continue
      }

      console.log(`  Slot ${slot.name} (${person.name}): ${slotKcal.toFixed(0)} -> target ${targetKcal.toFixed(0)}, scale ${rawScale.toFixed(3)} (applied ${scale.toFixed(3)})`)

      // update ingredient weights for all dish entries in this slot
      for (const entry of slot.dishEntries) {
        for (const ing of entry.ingredients) {
          const newWeight = Math.round(ing.weight * scale)
          await prisma.dishEntryIngredient.updateMany({
            where: { dishEntryId: entry.id, ingredientIndex: ing.ingredientIndex },
            data: { weight: newWeight },
          })
        }
      }
    }
  }

  console.log('\nDone. Review changes and re-run export/plan view to verify macros.')
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
