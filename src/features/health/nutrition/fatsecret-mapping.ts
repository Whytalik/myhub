export interface FatSecretMapping {
  foodId: string;
  servingId: string;
  /** Grams represented by one unit of `servingId` — used to compute number_of_units. */
  servingGrams: number;
}

export const FATSECRET_MAPPING: Partial<Record<string, FatSecretMapping>> = {
  eggs: { foodId: "3092", servingId: "51772", servingGrams: 100 },
  bread: { foodId: "3590", servingId: "52270", servingGrams: 100 },
  oil: { foodId: "34212", servingId: "56943", servingGrams: 100 },
  potato: { foodId: "5718", servingId: "54398", servingGrams: 100 },
  milk: { foodId: "803", servingId: "49483", servingGrams: 100 },
  butter: { foodId: "33814", servingId: "56545", servingGrams: 100 },
  tomato: { foodId: "6138", servingId: "54818", servingGrams: 100 },
  cucumber: { foodId: "36376", servingId: "59107", servingGrams: 100 },
  pepper: { foodId: "285829", servingId: "321558", servingGrams: 100 },
  onion: { foodId: "36442", servingId: "59173", servingGrams: 100 },
  berries: { foodId: "91621", servingId: "131951", servingGrams: 140 },
  fruitMix: { foodId: "3352146", servingId: "3260931", servingGrams: 126 },
  banana: { foodId: "35755", servingId: "58486", servingGrams: 100 },
  oats: { foodId: "39715", servingId: "62446", servingGrams: 100 },
  buckwheat: { foodId: "4435", servingId: "53115", servingGrams: 100 },
  rice: { foodId: "4501", servingId: "53181", servingGrams: 100 },
  arugula: { foodId: "6253", servingId: "54933", servingGrams: 100 },
  icebergLettuce: { foodId: "36414", servingId: "59145", servingGrams: 100 },
  honey: { foodId: "39536", servingId: "62267", servingGrams: 100 },
  mackerel: { foodId: "2008", servingId: "50688", servingGrams: 100 },
  tunaCanned: { foodId: "40811462", servingId: "35673302", servingGrams: 113 },
  cornCanned: { foodId: "6433", servingId: "55113", servingGrams: 100 },
  carrot: { foodId: "6034", servingId: "54714", servingGrams: 100 },
  sugar: { foodId: "39559", servingId: "62290", servingGrams: 100 },
  mayo: { foodId: "34194", servingId: "56925", servingGrams: 100 },

  // TODO: brand/recipe-dependent — fill in manually (uncomment + replace values).
  //
  // Raw, not cooked: all portion grams in data.ts are as-purchased/pre-cook weight
  // (confirmed by cross-checking SHOPPING_LIST totals against macroItems sums — they
  // match exactly on raw purchase weight). Cooking loses ~20-30% water weight while
  // total calories stay roughly the same, so a "cooked" FatSecret entry applied to a
  // raw gram amount overcounts calories. Pick the plain "raw"/no-cook-descriptor food
  // entry for chickenMarinated / friedChicken / chickenHearts / porkChop — not
  // "cooked"/"roasted"/"baked"/"broiled" variants.
  //
  // Marinade: don't add anything extra for it. Only ~10-30% of marinade liquid is
  // actually absorbed (rest is discarded), and data.ts already separately tracks the
  // parts that are fully eaten as their own macroItems/mapping entries (e.g. the
  // soy-honey glaze for chickenHearts is tracked via soySauce+honey, not baked into
  // the meat's own macros) — so map these meats as plain unmarinated raw meat.
  // chickenMarinated: { foodId: "", servingId: "", servingGrams: 100 },
  // friedChicken: { foodId: "", servingId: "", servingGrams: 100 },
  // chickenHearts: { foodId: "", servingId: "", servingGrams: 100 },
  // porkChop: { foodId: "", servingId: "", servingGrams: 100 },
  // brynza: { foodId: "", servingId: "", servingGrams: 100 },
  // suluguni: { foodId: "", servingId: "", servingGrams: 100 },
  // yogurtGreek: { foodId: "", servingId: "", servingGrams: 100 },
  // proteinPowder: { foodId: "", servingId: "", servingGrams: 100 },
  // hardCheese: { foodId: "", servingId: "", servingGrams: 100 },
  // soySauce: { foodId: "", servingId: "", servingGrams: 100 },
  // mustardDijon: { foodId: "", servingId: "", servingGrams: 100 },
  // cottageCheese: { foodId: "", servingId: "", servingGrams: 100 },
  // cream: { foodId: "", servingId: "", servingGrams: 100 },
  // syrniki: { foodId: "", servingId: "", servingGrams: 100 },
  // freshVeg: { foodId: "", servingId: "", servingGrams: 100 },
};
