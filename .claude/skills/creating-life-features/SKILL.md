---
name: creating-life-features
description: Creates a new entity or feature in the life domain following the project's layered architecture. Use when adding a new model, entity, or feature area to the life domain — e.g. "add sprint feature", "create new life entity", "implement tracking for X". Covers all layers: schema, types, repository, cache, service, action, revalidate, page, component.
---

# Creating Life Domain Features

## Data flow (read-only)
```
page.tsx (server) → service → getCached* (lib/cache) → repository → prisma
```

## Data flow (mutations)
```
*FormDialog (client) → *Action ("use server") → service → repository → invalidate*Cache
```

## 9-step checklist

Copy and track progress:
```
- [ ] 1. Schema    — add model to prisma/schema.prisma, run `npx prisma db push`
- [ ] 2. Types     — add EntityData + UpsertEntityInput to src/features/life/types.ts
- [ ] 3. Repository — create src/features/life/repositories/<entity>.repository.ts
- [ ] 4. Cache     — add getCached* + cacheTags entry to src/lib/cache.ts
- [ ] 5. Service   — create src/features/life/services/<entity>-service.ts
- [ ] 6. Action    — create src/features/life/actions/<entity>-actions.ts
- [ ] 7. Revalidate — add invalidate<Feature>Cache to src/lib/revalidate.ts
- [ ] 8. Page      — create src/app/(dashboard)/life/<feature>/page.tsx
- [ ] 9. Component — create src/features/life/components/<feature>/<Feature>PageClient.tsx
         Optional: <Entity>FormDialog.tsx + Zod schema in schemas.ts if form needed
```

## Key rules (never break these)
- Repositories return **raw Prisma rows** — no DTO mapping, no await
- Only **services** map rows → DTOs and touch the cache
- **Actions** never run Zod (validation is client-side via zodResolver)
- Every action ends with `invalidate<Feature>Cache(userId)`
- Pages call **services**, never repositories or cache directly
- `withAction` in lib/action-utils.ts injects userId + wraps try/catch

## Full templates
See [references/recipe.md](references/recipe.md) for copy-paste code templates for each layer.

## Verify after each step
```bash
npx tsc --noEmit   # type check
pnpm lint          # eslint
pnpm build         # full build (do last)
```
