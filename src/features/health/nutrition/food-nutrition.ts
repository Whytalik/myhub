// Reference macros per 100g (or 100ml for liquids), generic USDA-style values.
// Branded/prepared items (protein powder, syrniki, mayo, soy sauce) are rough
// estimates — swap in real label values if you have the exact product.
export interface FoodMacros {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const FOOD_NUTRITION: Record<string, FoodMacros> = {
  eggs: { kcal: 155, protein: 13, fat: 11, carbs: 1.1 },
  bread: { kcal: 250, protein: 10, fat: 3.5, carbs: 43 },
  freshVeg: { kcal: 20, protein: 1, fat: 0.2, carbs: 4 },
  oil: { kcal: 884, protein: 0, fat: 100, carbs: 0 },
  chickenMarinated: { kcal: 180, protein: 29, fat: 6, carbs: 2 },
  friedChicken: { kcal: 220, protein: 26, fat: 12, carbs: 1 },
  chickenHearts: { kcal: 185, protein: 17, fat: 11.4, carbs: 0.8 },
  potato: { kcal: 87, protein: 1.9, fat: 0.1, carbs: 20 },
  milk: { kcal: 42, protein: 3.4, fat: 1, carbs: 5 },
  butter: { kcal: 717, protein: 0.9, fat: 81, carbs: 0.1 },
  tomato: { kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
  cucumber: { kcal: 15, protein: 0.7, fat: 0.1, carbs: 3.6 },
  pepper: { kcal: 20, protein: 1, fat: 0.2, carbs: 4.6 },
  onion: { kcal: 40, protein: 1.1, fat: 0.1, carbs: 9.3 },
  brynza: { kcal: 260, protein: 16, fat: 21, carbs: 2 },
  yogurtGreek: { kcal: 73, protein: 9, fat: 2, carbs: 4 },
  berries: { kcal: 43, protein: 0.8, fat: 0.4, carbs: 10 },
  fruitMix: { kcal: 60, protein: 0.5, fat: 0.3, carbs: 15 },
  banana: { kcal: 89, protein: 1.1, fat: 0.3, carbs: 23 },
  oats: { kcal: 389, protein: 13.5, fat: 6.9, carbs: 66.3 },
  proteinPowder: { kcal: 400, protein: 80, fat: 6.7, carbs: 10 },
  buckwheat: { kcal: 343, protein: 13.3, fat: 3.4, carbs: 71.5 },
  rice: { kcal: 365, protein: 7.1, fat: 0.7, carbs: 80 },
  arugula: { kcal: 25, protein: 2.6, fat: 0.7, carbs: 3.7 },
  icebergLettuce: { kcal: 14, protein: 0.9, fat: 0.1, carbs: 3 },
  hardCheese: { kcal: 380, protein: 25, fat: 30, carbs: 2 },
  suluguni: { kcal: 285, protein: 20, fat: 22, carbs: 0 },
  cottageCheese: { kcal: 159, protein: 16.7, fat: 9, carbs: 3 },
  soySauce: { kcal: 60, protein: 10, fat: 0, carbs: 6 },
  honey: { kcal: 304, protein: 0.3, fat: 0, carbs: 82.4 },
  mackerel: { kcal: 205, protein: 19, fat: 13.9, carbs: 0 },
  tunaCanned: { kcal: 116, protein: 26, fat: 1, carbs: 0 },
  cornCanned: { kcal: 76, protein: 2.9, fat: 1.2, carbs: 15.6 },
  carrot: { kcal: 41, protein: 0.9, fat: 0.2, carbs: 10 },
  sugar: { kcal: 387, protein: 0, fat: 0, carbs: 100 },
  syrniki: { kcal: 200, protein: 12, fat: 8, carbs: 20 },
  mayo: { kcal: 680, protein: 1, fat: 75, carbs: 2.6 },
  mustardDijon: { kcal: 150, protein: 4, fat: 11, carbs: 5 },
  porkChop: { kcal: 250, protein: 26, fat: 16, carbs: 0 },
  cream: { kcal: 145, protein: 2.8, fat: 12.5, carbs: 4 },
};

export type FoodKey = keyof typeof FOOD_NUTRITION;
