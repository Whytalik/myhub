# Skeleton Loading States Plan

## Overview
Add `loading.tsx` files to all pages that don't already have them. The existing Skeleton component at `@/components/ui/skeleton` will be used.

## Already Existing Loading Files (4)
- `src/app/(dashboard)/food/loading.tsx` ✅
- `src/app/(dashboard)/food/products/loading.tsx` ✅
- `src/app/(dashboard)/planning/loading.tsx` ✅
- `src/app/(dashboard)/life/tasks/loading.tsx` ✅

## Pages Needing loading.tsx (37 files)

### Auth Pages (2)
1. `src/app/(auth)/login/loading.tsx`
2. `src/app/(auth)/register/loading.tsx`

### Dashboard Root (1)
3. `src/app/(dashboard)/home/loading.tsx`

### Life Space (3)
4. `src/app/(dashboard)/life/loading.tsx`
5. `src/app/(dashboard)/life/journal/loading.tsx`
6. `src/app/(dashboard)/life/habits/loading.tsx`
7. `src/app/(dashboard)/life/history/loading.tsx`

### Food Space (3)
8. `src/app/(dashboard)/food/dishes/loading.tsx`
9. `src/app/(dashboard)/food/plans/loading.tsx`
10. `src/app/(dashboard)/food/shopping/loading.tsx`

### Fitness Space (4)
11. `src/app/(dashboard)/fitness/loading.tsx`
12. `src/app/(dashboard)/fitness/workouts/loading.tsx`
13. `src/app/(dashboard)/fitness/exercises/loading.tsx`
14. `src/app/(dashboard)/fitness/progress/loading.tsx`

### Languages Space (7)
15. `src/app/(dashboard)/languages/loading.tsx`
16. `src/app/(dashboard)/languages/add/loading.tsx`
17. `src/app/(dashboard)/languages/vocabulary/loading.tsx` (redirect page - simple skeleton)
18. `src/app/(dashboard)/languages/journal/loading.tsx` (redirect page - simple skeleton)
19. `src/app/(dashboard)/languages/resources/loading.tsx` (redirect page - simple skeleton)
20. `src/app/(dashboard)/languages/[id]/loading.tsx`
21. `src/app/(dashboard)/languages/[id]/vocabulary/loading.tsx`
22. `src/app/(dashboard)/languages/[id]/journal/loading.tsx`
23. `src/app/(dashboard)/languages/[id]/resources/loading.tsx`

### Library (1)
24. `src/app/(dashboard)/library/loading.tsx`

### Planning Space (3)
25. `src/app/(dashboard)/planning/vision/loading.tsx`
26. `src/app/(dashboard)/planning/compass/loading.tsx`
27. `src/app/(dashboard)/planning/sprints/loading.tsx`
28. `src/app/(dashboard)/planning/reviews/loading.tsx`

### Other Spaces (12)
29. `src/app/(dashboard)/operations/loading.tsx`
30. `src/app/(dashboard)/life-system/loading.tsx`
31. `src/app/(dashboard)/health/loading.tsx`
32. `src/app/(dashboard)/mind/loading.tsx`
33. `src/app/(dashboard)/wealth/loading.tsx`
34. `src/app/(dashboard)/trading/loading.tsx`
35. `src/app/(dashboard)/vault/loading.tsx`
36. `src/app/(dashboard)/profile/loading.tsx`
37. `src/app/(dashboard)/other/loading.tsx`
38. `src/app/(dashboard)/other/wishlist/loading.tsx`
39. `src/app/(dashboard)/fishing/loading.tsx`

## Implementation Pattern

Each loading.tsx will follow this pattern:
```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function PageLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      {/* Breadcrumb skeleton */}
      <Skeleton className="h-4 w-24 mb-6" />
      
      {/* Heading skeleton */}
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-4 w-96 mb-8" />
      
      {/* Content skeletons matching page layout */}
    </div>
  );
}
```

## Notes
- Pages that use `SpaceLanding` component will have skeletons matching that layout
- Redirect pages (languages/vocabulary, languages/journal, languages/resources) will have minimal loading states
- Pages with data tables will have row skeletons
- Pages with cards/grids will have card skeletons
