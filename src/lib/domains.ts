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
  Dumbbell,
} from "lucide-react";

export interface PageLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface Space {
  label: string;
  icon: LucideIcon;
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
        label: "Journal",
        icon: BookText,
        pages: [{ href: "/life/journal", label: "Journal", icon: BookText }],
      },
      {
        label: "Habits",
        icon: Zap,
        pages: [{ href: "/life/habits", label: "Habits", icon: Zap }],
      },
      {
        label: "Tasks",
        icon: CheckCircle2,
        pages: [{ href: "/life/tasks", label: "Tasks", icon: CheckCircle2 }],
      },
      {
        label: "Week",
        icon: CalendarDays,
        pages: [{ href: "/life/week", label: "Week", icon: CalendarDays }],
      },
      {
        label: "Review",
        icon: LineChart,
        pages: [{ href: "/life/review", label: "Review", icon: LineChart }],
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
        pages: [
          { href: "/health/nutrition", label: "Daily", icon: Utensils },
          { href: "/health/nutrition/meal-prep", label: "Meal Prep", icon: ClipboardList },
          { href: "/health/nutrition/shopping-list", label: "Shopping List", icon: ShoppingCart },
        ],
      },
      {
        label: "Training Space",
        icon: Dumbbell,
        pages: [
          { href: "/health/training", label: "Plans", icon: ClipboardList },
          { href: "/health/training/exercises", label: "Exercises", icon: Dumbbell },
          { href: "/health/training/history", label: "History", icon: LineChart },
        ],
      },
    ],
  },
];

export function getActiveDomain(pathname: string): Domain {
  return DOMAINS.find((domain) => pathname.startsWith(domain.href)) ?? DOMAINS[0];
}
