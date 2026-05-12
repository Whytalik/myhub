export type Store =
  | "NASHA_RYABA"
  | "BAZAR"
  | "ATB"
  | "SILPO"
  | "POLISSYA"
  | "METRO"
  | "FORA"

export type StoreMeta = {
  label: string
  color: string
  bg: string
}

export const STORE_META: Record<Store, StoreMeta> = {
  NASHA_RYABA: { label: "Наша ряба", color: "#e8373b", bg: "bg-[#e8373b]/10" },
  BAZAR:       { label: "Базар",     color: "#8B6914", bg: "bg-[#8B6914]/10" },
  ATB:         { label: "АТБ",       color: "#e8502a", bg: "bg-[#e8502a]/10" },
  SILPO:       { label: "Сільпо",    color: "#009B3A", bg: "bg-[#009B3A]/10" },
  POLISSYA:    { label: "Полісся",   color: "#2d5a27", bg: "bg-[#2d5a27]/10" },
  METRO:       { label: "Метро",     color: "#003f8a", bg: "bg-[#003f8a]/10" },
  FORA:        { label: "Фора",      color: "#d4002b", bg: "bg-[#d4002b]/10" },
}

export const ALL_STORES: Store[] = [
  "NASHA_RYABA", "BAZAR", "ATB", "SILPO", "POLISSYA", "METRO", "FORA",
]
