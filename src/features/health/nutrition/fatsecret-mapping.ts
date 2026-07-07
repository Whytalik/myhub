export interface FatSecretMapping {
  foodId: string;
  servingId: string;
  /** Grams represented by one unit of `servingId` — used to compute number_of_units. */
  servingGrams: number;
}

export const FATSECRET_MAPPING: Partial<Record<string, FatSecretMapping>> = {
  eggs: { foodId: "3092", servingId: "51772", servingGrams: 1 },
  bread: { foodId: "3590", servingId: "52270", servingGrams: 1 },
  oil: { foodId: "34212", servingId: "56943", servingGrams: 1 },
  potato: { foodId: "5718", servingId: "54398", servingGrams: 1 },
  milk: { foodId: "803", servingId: "49483", servingGrams: 1 },
  butter: { foodId: "33814", servingId: "56545", servingGrams: 1 },
  tomato: { foodId: "6138", servingId: "54818", servingGrams: 1 },
  cucumber: { foodId: "36376", servingId: "59107", servingGrams: 1 },
  pepper: { foodId: "285829", servingId: "321558", servingGrams: 1 },
  onion: { foodId: "36442", servingId: "59173", servingGrams: 1 },
  berries: { foodId: "91621", servingId: "131951", servingGrams: 140 },
  fruitMix: { foodId: "3352146", servingId: "3260931", servingGrams: 126 },
  banana: { foodId: "35755", servingId: "58486", servingGrams: 1 },
  oats: { foodId: "39715", servingId: "62446", servingGrams: 1 },
  buckwheat: { foodId: "4435", servingId: "53115", servingGrams: 1 },
  rice: { foodId: "4501", servingId: "53181", servingGrams: 1 },
  arugula: { foodId: "6253", servingId: "54933", servingGrams: 1 },
  icebergLettuce: { foodId: "36414", servingId: "59145", servingGrams: 1 },
  honey: { foodId: "39536", servingId: "62267", servingGrams: 1 },
  mackerel: { foodId: "2008", servingId: "50688", servingGrams: 1 },
  tunaCanned: { foodId: "2109", servingId: "50789", servingGrams: 1 },
  cornCanned: { foodId: "6433", servingId: "55113", servingGrams: 1 },
  carrot: { foodId: "6034", servingId: "54714", servingGrams: 1 },
  sugar: { foodId: "39559", servingId: "62290", servingGrams: 1 },
  mayo: { foodId: "34194", servingId: "56925", servingGrams: 1 },

  // generic meat mappings:
  chickenMarinated: { foodId: "4881229", servingId: "4751539", servingGrams: 1 },
  friedChicken: { foodId: "4881229", servingId: "4751539", servingGrams: 1 },
  chickenHearts: { foodId: "34410", servingId: "57141", servingGrams: 1 },
  porkChop: { foodId: "1435", servingId: "50115", servingGrams: 1 },

  brynza: { foodId: "33699", servingId: "56430", servingGrams: 1 },
  suluguni: { foodId: "33708", servingId: "56439", servingGrams: 1 },
  yogurtGreek: { foodId: "32696412", servingId: "29550569", servingGrams: 1 },
  proteinPowder: { foodId: "3282", servingId: "51962", servingGrams: 1 },
  hardCheese: { foodId: "33713", servingId: "56444", servingGrams: 1 },
  soySauce: { foodId: "3272", servingId: "51952", servingGrams: 1 },
  mustardDijon: { foodId: "294912", servingId: "330199", servingGrams: 1 },
  cottageCheese: { foodId: "6312", servingId: "54992", servingGrams: 1 },
  cream: { foodId: "1080", servingId: "49760", servingGrams: 1 },
};
