import type { LucideIcon } from "lucide-react";
import {
  BookText,
  CalendarDays,
  CheckCircle2,
  Heart,
  LineChart,
  Sparkles,
  Utensils,
  Zap,
  ClipboardList,
  ShoppingCart,
} from "lucide-react";

export interface SpaceLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface Domain {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  spaces: SpaceLink[];
}

export const DOMAINS: Domain[] = [
  {
    id: "life",
    label: "Life",
    href: "/life",
    icon: Sparkles,
    accent: "#6fbfbf",
    spaces: [
      { href: "/life/journal", label: "Journal", icon: BookText },
      { href: "/life/habits", label: "Habits", icon: Zap },
      { href: "/life/tasks", label: "Tasks", icon: CheckCircle2 },
      { href: "/life/week", label: "Week", icon: CalendarDays },
      { href: "/life/review", label: "Review", icon: LineChart },
    ],
  },
  {
    id: "health",
    label: "Health",
    href: "/health",
    icon: Heart,
    accent: "#ff8c00",
    spaces: [
      { href: "/health/nutrition", label: "Daily", icon: Utensils },
      { href: "/health/meal-prep", label: "Meal Prep", icon: ClipboardList },
      { href: "/health/shopping-list", label: "Shopping List", icon: ShoppingCart },
    ],
  },
];

export function getActiveDomain(pathname: string): Domain {
  return DOMAINS.find((domain) => pathname.startsWith(domain.href)) ?? DOMAINS[0];
}
