"use server"

import { prisma } from "@/lib/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { NutritionPerson, Goal } from "@/app/generated/prisma"
import { invalidateFoodCache } from "@/lib/revalidate"

interface CreatePersonData {
  name: string
  goal: Goal
  targetKcal: number
  proteinPct: number
  fatPct: number
  carbsPct: number
  fiberGrams: number
}

type UpdatePersonData = Partial<CreatePersonData>

export async function createPerson(data: CreatePersonData): Promise<ActionResult<NutritionPerson>> {
  try {
    const userId = await getRequiredUserId()
    const person = await prisma.nutritionPerson.create({
      data: {
        userId,
        name: data.name,
        goal: data.goal,
        targetKcal: data.targetKcal,
        proteinPct: data.proteinPct,
        fatPct: data.fatPct,
        carbsPct: data.carbsPct,
        fiberGrams: data.fiberGrams,
      },
    })
    invalidateFoodCache(userId)
    return { success: true, data: person }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create person" }
  }
}

export async function updatePerson(id: string, data: UpdatePersonData): Promise<ActionResult<NutritionPerson>> {
  try {
    const userId = await getRequiredUserId()
    const existing = await prisma.nutritionPerson.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Person not found" }
    if (existing.userId && existing.userId !== userId) return { success: false, error: "Unauthorized" }

    const person = await prisma.nutritionPerson.update({
      where: { id },
      data,
    })
    invalidateFoodCache(userId)
    return { success: true, data: person }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update person" }
  }
}

export async function deletePerson(id: string): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    const existing = await prisma.nutritionPerson.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Person not found" }
    if (existing.userId && existing.userId !== userId) return { success: false, error: "Unauthorized" }

    await prisma.nutritionPerson.delete({ where: { id } })
    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete person" }
  }
}

export async function getPersons(): Promise<ActionResult<NutritionPerson[]>> {
  try {
    const userId = await getRequiredUserId()
    const persons = await prisma.nutritionPerson.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    })
    return { success: true, data: persons }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get persons" }
  }
}
