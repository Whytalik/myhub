export type DishType =
  | "MAIN"
  | "SALAD"
  | "SOUP"
  | "SIDE"
  | "SNACK"
  | "SAUCE"
  | "MARINADE"
  | "BASE"

export type DishTypeMeta = {
  label: string
  emoji: string
  color: string
  bg: string
  border: string
}

export const DISH_TYPE_META: Record<DishType, DishTypeMeta> = {
  MAIN:     { label: "Основна",  emoji: "🍽️", color: "text-[#6c63ff]", bg: "bg-[#6c63ff]/10", border: "border-[#6c63ff]/30" },
  SALAD:    { label: "Салат",    emoji: "🥗", color: "text-[#43d98c]", bg: "bg-[#43d98c]/10", border: "border-[#43d98c]/30" },
  SOUP:     { label: "Суп",      emoji: "🍲", color: "text-[#2dd4bf]", bg: "bg-[#2dd4bf]/10", border: "border-[#2dd4bf]/30" },
  SIDE:     { label: "Гарнір",   emoji: "🌾", color: "text-[#e8c06e]", bg: "bg-[#e8c06e]/10", border: "border-[#e8c06e]/30" },
  SNACK:    { label: "Перекус",  emoji: "🍎", color: "text-[#f7a948]", bg: "bg-[#f7a948]/10", border: "border-[#f7a948]/30" },
  SAUCE:    { label: "Соус",     emoji: "🥣", color: "text-[#4fa3e0]", bg: "bg-[#4fa3e0]/10", border: "border-[#4fa3e0]/30" },
  MARINADE: { label: "Маринад",  emoji: "🧂", color: "text-[#a78bfa]", bg: "bg-[#a78bfa]/10", border: "border-[#a78bfa]/30" },
  BASE:     { label: "Основа",   emoji: "🫓", color: "text-[#ff6584]", bg: "bg-[#ff6584]/10", border: "border-[#ff6584]/30" },
}

export const DISH_TYPE_ORDER: DishType[] = [
  "MAIN", "SALAD", "SOUP", "SIDE", "SNACK", "SAUCE", "MARINADE", "BASE",
]
