import "dotenv/config"
import { prisma } from "../src/lib/prisma"

async function exportWeekPlan() {
  const weekPlan = await prisma.weekPlan.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      dayPlans: {
        orderBy: { dayOfWeek: "asc" },
        include: {
          mealSlots: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  })

  if (!weekPlan) {
    console.log("No week plans found")
    process.exit(1)
  }

  const firstDaySlots = weekPlan.dayPlans[0]?.mealSlots || []

  const json = {
    name: weekPlan.name,
    days: weekPlan.dayPlans.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      activity: day.activity,
      mealSlots: firstDaySlots.map((slot) => ({
        name: slot.name,
        timeWindow: slot.timeWindow,
        order: slot.order,
        kcalPct: slot.targetKcal / (firstDaySlots.reduce((sum, s) => sum + s.targetKcal, 0) || 1),
        fiberPct: slot.targetFiberGrams / (firstDaySlots.reduce((sum, s) => sum + s.targetFiberGrams, 0) || 1),
      })),
    })),
  }

  console.log(JSON.stringify(json, null, 2))
  await prisma.$disconnect()
}

exportWeekPlan().catch(console.error)
