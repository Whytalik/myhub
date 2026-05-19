import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { PageHeader } from "@/components/ui/page-header"
import { getWeekPlan, getLatestWeekPlan } from "@/features/nutrition/actions/planning"
import { MealPrepView } from "@/features/nutrition/components/MealPrepView"

export const metadata: Metadata = {
  title: "Meal Prep",
}

interface MealPrepPageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function MealPrepPage({ searchParams }: MealPrepPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id: planId } = await searchParams
  let activePlanId = planId

  if (!activePlanId) {
    const latestResult = await getLatestWeekPlan()
    if (latestResult.success && latestResult.data) {
      activePlanId = latestResult.data.id
    }
  }

  if (!activePlanId) {
    return (
      <div className="px-8 py-8">
        <PageHeader
          breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "meal prep" }]}
          title="Meal Prep"
          description="No week plan found. Create one from the Plans page."
        />
      </div>
    )
  }

  const result = await getWeekPlan(activePlanId)
  const plan = result.success ? result.data : null

  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "plans", href: "/nutrition/plans" }, { label: "meal prep" }]}
        title="Meal Prep"
        description="Маринади для підготовки перед приготуванням."
      />
      <div className="mt-6">
        <MealPrepView plan={plan} />
      </div>
    </div>
  )
}
