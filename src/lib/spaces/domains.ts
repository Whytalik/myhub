import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookText,
  CalendarDays,
  Compass,
  Heart,
  LayoutGrid,
  Lightbulb,
  LineChart,
  ListChecks,
  Sparkles,
  Utensils,
  Zap,
  ClipboardList,
  ShoppingCart,
  Dumbbell,
  TrendingUp,
  Scale,
  Star,
  BarChart3,
  FolderKanban,
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
    id: "review",
    label: "Review",
    href: "/life/review",
    icon: LineChart,
    accent: "#fbbf24",
    spaces: [
      {
        label: "Retrospective",
        icon: ListChecks,
        accent: "#fbbf24",
        href: "/life/review",
        pages: [
          { href: "/life/review", label: "Life & Habits", icon: LineChart },
          { href: "/life/planning/review", label: "Thoughts Filter", icon: Sparkles },
          { href: "/health/training/review", label: "Training Review", icon: TrendingUp },
          { href: "/health/training/stats", label: "Training Stats", icon: BarChart3 },
        ],
      },
    ],
  },
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
          { href: "/life/week", label: "Week Template", icon: CalendarDays },
        ],
      },
      {
        label: "Planning Space",
        icon: ClipboardList,
        accent: "#fbbf24",
        href: "/life/planning/mission",
        pages: [
          { href: "/life/planning/mission", label: "Mission", icon: Compass },
          { href: "/life/planning/spheres", label: "Life Spheres", icon: LayoutGrid },
          { href: "/life/planning", label: "Inbox Thoughts", icon: Lightbulb },
          { href: "/life/planning/wizard", label: "Planning Wizard", icon: Sparkles },
          { href: "/life/planning/kanban", label: "Sprint Kanban", icon: FolderKanban },
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
          { href: "/health/nutrition/profiles", label: "Profiles", icon: Scale },
          { href: "/health/nutrition", label: "Daily", icon: Utensils },
          { href: "/health/nutrition/meal-prep", label: "Meal Prep", icon: ClipboardList },
          { href: "/health/nutrition/shopping-list", label: "Shopping List", icon: ShoppingCart },
          { href: "/health/nutrition/mapping", label: "Food Mapper", icon: Star },
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
        ],
      },
    ],
  },
];

export function getActiveDomain(pathname: string): Domain {
  for (const domain of DOMAINS) {
    const hasActivePage = domain.spaces.some((space) =>
      space.pages.some((page) => pathname === page.href || pathname.startsWith(page.href + "/")),
    );
    if (hasActivePage) {
      return domain;
    }
  }

  const sorted = [...DOMAINS].sort((a, b) => b.href.length - a.href.length);
  return sorted.find((domain) => pathname.startsWith(domain.href)) ?? DOMAINS[0];
}
