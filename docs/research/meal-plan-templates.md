# Meal Plan Templates Research

## Goals & Strategies

### 1. Muscle Gain (Bulking)
*   **Strategy**: Hypertrophy focus. Constant availability of amino acids and high energy for workouts.
*   **Calorie Target**: TDEE + 250-500 kcal.
*   **Macronutrients**:
    *   **Protein**: 1.6 – 2.2 g/kg (essential for building tissue).
    *   **Fats**: 0.5 – 1.5 g/kg (hormonal health).
    *   **Carbs**: 4 - 7 g/kg (fuel for intensity).
*   **Meal Frequency**: 4-6 meals/day.
    *   Breakfast, Snack 1, Lunch, Snack 2 (Pre/Post workout), Dinner, optional Late Snack.
*   **Optimal Timing**: Protein every 3-4 hours to maximize Muscle Protein Synthesis (MPS).

### 2. Maintenance
*   **Strategy**: Stability and health. Balanced energy intake.
*   **Calorie Target**: TDEE (Total Daily Energy Expenditure).
*   **Macronutrients**:
    *   **Protein**: 1.2 – 1.8 g/kg.
    *   **Fats**: 0.7 – 1.2 g/kg.
    *   **Carbs**: Remainder.
*   **Meal Frequency**: 3-4 meals/day.
    *   Breakfast, Lunch, Dinner, 1 Snack.
*   **Optimal Timing**: Flexible, focus on daily totals.

### 3. Weight Loss (Cutting)
*   **Strategy**: Fat loss while preserving muscle mass. Satiety management.
*   **Calorie Target**: TDEE - 300-500 kcal.
*   **Macronutrients**:
    *   **Protein**: 2.0 – 2.4 g/kg (high protein is thermogenic and muscle-sparing).
    *   **Fats**: 0.5 – 0.8 g/kg (minimum for essential functions).
    *   **Carbs**: Lowered (to fit calorie deficit).
*   **Meal Frequency**: 3-5 meals/day.
    *   Higher frequency (5 meals) helps manage hunger for some.
    *   Lower frequency (3 meals) allows for larger, more satisfying portions.
*   **Optimal Timing**: Protein distribution remains important; fiber-rich veggies in every meal for volume.

## Proposed Templates (Meal Slots)

| Goal | Slot 1 | Slot 2 | Slot 3 | Slot 4 | Slot 5 | Slot 6 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Gain** | Breakfast | Snack (Protein) | Lunch | Snack (Pre-WO) | Dinner | Snack (Casein/Bedtime) |
| **Main** | Breakfast | Lunch | Snack | Dinner | - | - |
| **Loss** | Breakfast | Lunch | Snack | Dinner | - | - |

## Implementation in Hub

1.  **DayTemplate**: Use existing model to store these skeletons.
2.  **Dish Suggestions**:
    *   *Gain*: High carb/protein (Pasta with chicken, Oatmeal with nuts).
    *   *Loss*: High volume/protein (White fish with broccoli, Omelette with spinach).
3.  **NutritionPerson**: Targets should be updated based on the selected goal.
