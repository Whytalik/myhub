/**
 * Macro fitting via Lagrange multipliers.
 *
 * Finds the minimum-perturbation set of ingredient weight scale factors
 * such that the day's protein, fat, and carbs hit exact gram targets.
 *
 * Derivation (minimise Σ(sᵢ−1)² s.t. macro constraints):
 *   sᵢ = 1 − μ₁·(pᵢwᵢ) − μ₂·(fᵢwᵢ) − μ₃·(cᵢwᵢ)
 * where μ is the solution of the 3×3 Gram system:
 *   A·μ = currentMacros − targetMacros
 *   Aᵣₛ = Σᵢ (rᵢ·wᵢ)(sᵢ·wᵢ)
 */

function solveLinearSystem(matrix: number[][], rhs: number[]): number[] {
  const n = matrix.length
  const a = matrix.map(row => [...row])
  const b = [...rhs]

  for (let i = 0; i < n; i++) {
    let pivot = i
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(a[j][i]) > Math.abs(a[pivot][i])) pivot = j
    }
    if (Math.abs(a[pivot][i]) < 1e-12) {
      b[i] = 0
      continue
    }
    if (pivot !== i) {
      ;[a[i], a[pivot]] = [a[pivot], a[i]]
      ;[b[i], b[pivot]] = [b[pivot], b[i]]
    }
    const diag = a[i][i]
    for (let j = i; j < n; j++) a[i][j] /= diag
    b[i] /= diag
    for (let j = 0; j < n; j++) {
      if (j === i) continue
      const factor = a[j][i]
      for (let k = i; k < n; k++) a[j][k] -= factor * a[i][k]
      b[j] -= factor * b[i]
    }
  }
  return b
}

export interface FittableIngredient {
  /** Unique key used to look up the result */
  key: string
  /** Weight currently stored in the DB (grams) */
  currentStoredWeight: number
  /**
   * Effective nutrition per gram of stored weight.
   * For RAW ingredients: productPer100 / 100.
   * For COOKED ingredients: productPer100 / (100 × cookingCoeff).
   */
  effectiveProteinPerGram: number
  effectiveFatPerGram: number
  effectiveCarbsPerGram: number
  effectiveKcalPerGram: number
}

export interface MacroTargets {
  protein: number
  fat: number
  carbs: number
}

export interface FitResult {
  /** Map from ingredient key → new stored weight (rounded to nearest gram) */
  newWeights: Map<string, number>
  achieved: { protein: number; fat: number; carbs: number; kcal: number }
}

export function fitDayMacros(
  ingredients: FittableIngredient[],
  targets: MacroTargets,
  options?: { minWeightGrams?: number; maxScaleFactor?: number },
): FitResult {
  const minW = options?.minWeightGrams ?? 1
  const maxS = options?.maxScaleFactor ?? 8

  const active = ingredients.filter(ing => ing.currentStoredWeight > 0)

  // Current macro totals
  let cP = 0, cF = 0, cC = 0, cK = 0
  for (const ing of active) {
    cP += ing.effectiveProteinPerGram * ing.currentStoredWeight
    cF += ing.effectiveFatPerGram * ing.currentStoredWeight
    cC += ing.effectiveCarbsPerGram * ing.currentStoredWeight
    cK += ing.effectiveKcalPerGram * ing.currentStoredWeight
  }

  // Gram matrix A[r][c] = Σᵢ (macroR_i · w_i)(macroC_i · w_i)
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (const ing of active) {
    const v = [
      ing.effectiveProteinPerGram * ing.currentStoredWeight,
      ing.effectiveFatPerGram * ing.currentStoredWeight,
      ing.effectiveCarbsPerGram * ing.currentStoredWeight,
    ]
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        A[r][c] += v[r] * v[c]
      }
    }
  }

  // Solve A·μ = current − target
  const mu = solveLinearSystem(A, [cP - targets.protein, cF - targets.fat, cC - targets.carbs])

  const newWeights = new Map<string, number>()
  let aP = 0, aF = 0, aC = 0, aK = 0

  for (const ing of active) {
    const si = 1
      - mu[0] * ing.effectiveProteinPerGram * ing.currentStoredWeight
      - mu[1] * ing.effectiveFatPerGram * ing.currentStoredWeight
      - mu[2] * ing.effectiveCarbsPerGram * ing.currentStoredWeight

    const newW = Math.round(
      Math.max(minW, Math.min(ing.currentStoredWeight * maxS, si * ing.currentStoredWeight)),
    )
    newWeights.set(ing.key, newW)
    aP += ing.effectiveProteinPerGram * newW
    aF += ing.effectiveFatPerGram * newW
    aC += ing.effectiveCarbsPerGram * newW
    aK += ing.effectiveKcalPerGram * newW
  }

  for (const ing of ingredients) {
    if (!newWeights.has(ing.key)) newWeights.set(ing.key, 0)
  }

  return {
    newWeights,
    achieved: { protein: aP, fat: aF, carbs: aC, kcal: aK },
  }
}
