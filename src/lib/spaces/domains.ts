import type { LucideIcon } from "lucide-react";
import {
  Activity,
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
  Dumbbell,
  TrendingUp,
  Scale,
} from "lucide-react";

export interface PageLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface Space {
  label: string;
  icon: LucideIcon;
  accent: string;
  href: string;
  pages: PageLink[];
}

export interface Domain {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  spaces: Space[];
}

export const DOMAINS: Domain[] = [
  {
    id: "life",
    label: "Life",
    href: "/life",
    icon: Sparkles,
    accent: "#6fbfbf",
    spaces: [
      {
        label: "Operation Space",
        icon: Activity,
        accent: "#6fbfbf",
        href: "/life/journal",
        pages: [
          { href: "/life/journal", label: "Journal", icon: BookText },
          { href: "/life/habits", label: "Habits", icon: Zap },
          { href: "/life/tasks", label: "Tasks", icon: CheckCircle2 },
          { href: "/life/week", label: "Week", icon: CalendarDays },
          { href: "/life/review", label: "Review", icon: LineChart },
        ],
      },
    ],
  },
  {
    id: "health",
    label: "Health",
    href: "/health",
    icon: Heart,
    accent: "#ff8c00",
    spaces: [
      {
        label: "Nutrition Space",
        icon: Utensils,
        accent: "#ff8c00",
        href: "/health/nutrition",
        pages: [
          { href: "/health/nutrition", label: "Daily", icon: Utensils },
          { href: "/health/nutrition/meal-prep", label: "Meal Prep", icon: ClipboardList },
          { href: "/health/nutrition/shopping-list", label: "Shopping List", icon: ShoppingCart },
          { href: "/health/nutrition/profiles", label: "Profiles", icon: Scale },
        ],
      },
      {
        label: "Training Space",
        icon: Dumbbell,
        accent: "#e87d88",
        href: "/health/training",
        pages: [
          { href: "/health/training", label: "Plan", icon: ClipboardList },
          { href: "/health/training/exercises", label: "Exercises", icon: Dumbbell },
          { href: "/health/training/sessions", label: "Sessions", icon: LineChart },
          { href: "/health/training/review", label: "Weekly Review", icon: TrendingUp },
        ],
      },
    ],
  },
];

export function getActiveDomain(pathname: string): Domain {
  return DOMAINS.find((domain) => pathname.startsWith(domain.href)) ?? DOMAINS[0];
}
