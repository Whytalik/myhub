---
name: new-feature
description: End-to-end layered workflow for adding a new feature to myhub (Prisma model → repository → cache → service → action → component → page → nav). Use when asked to add/build a new feature, module, or page.
---

# Skill: new-feature

myhub is a layered Next.js 16 App Router app. A feature is never just a component — it's a vertical slice through every layer below. Follow the order; each layer depends on the one before it. Use the `life` (`src/features/life/`) and `health/training` (`src/features/health/training/`) features as reference implementations throughout.

Before writing any component-level code, also load the `design-system` skill.

## 0. Place the feature

Decide where it lives before creating files:

- Existing space, new page → new route under an existing domain in `src/app/(dashboard)/<domain>/<space>/...` and a new entry in that space's `pages` in `src/lib/spaces/domains.ts`.
- New space inside an existing domain (`life` or `health`) → new `Space` entry in `DOMAINS[].spaces` in `src/lib/spaces/domains.ts`, plus route folder.
- Entirely new domain → new `Domain` entry in `DOMAINS` (`src/lib/spaces/domains.ts`) with its own `accent` color, plus check `src/lib/spaces/spaces.ts` (`SPACE_THEMES`, `getSpaceFromPath`) if the domain needs its own accent/theme mapping.

Feature code always lives under `src/features/<domain>/` (flat) or `src/features/<domain>/<subfeature>/` (e.g. `health/training`, `health/nutrition`) — mirror whichever pattern the target domain already uses.

## 1. Prisma model

Add the model to `prisma/schema.prisma`. Conventions from existing models:

- `id String @id @default(cuid())`
- `userId String` + relation to `User`, and add the reverse array field on `User`
- `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`

Then run:

```
npx prisma generate   # schema-only, always safe, unblocks type-checking
npx prisma db push    # writes to the DB — needs a working connection, see below
```

If `db push` fails with `P1001: Can't reach database server`, don't retry blindly — the direct Supabase host is IPv6-only and this machine has no IPv6 route. The pooler URLs (`POSTGRES_URL`/`POSTGRES_PRISMA_URL`/`POSTGRES_URL_NON_POOLING`) in `.env.local` are the working path; confirm they're set before assuming the DB itself is down.

## 2. `types.ts` + `schemas.ts`

In `src/features/<domain>/types.ts`: add the domain-shaped TypeScript type returned to components (not the raw Prisma row) plus `Upsert<Name>Input`.

In `src/features/<domain>/schemas.ts`: add a Zod schema for form validation (`z.object({...})`, `.superRefine` for cross-field rules), and export `type <Name>FormData = z.infer<typeof ...>`.

## 3. Repository — `repositories/<name>.repository.ts`

Plain object of Prisma calls, no business logic:

```ts
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const <name>Repository = {
  findAll(userId: string) { return prisma.<model>.findMany({ where: { userId } }); },
  create(data: Prisma.<Model>UncheckedCreateInput) { return prisma.<model>.create({ data }); },
  update(id: string, userId: string, data: Prisma.<Model>UncheckedUpdateInput) {
    return prisma.<model>.update({ where: { id, userId }, data });
  },
  delete(id: string, userId: string) { return prisma.<model>.delete({ where: { id, userId } }); },
};
```

If a query needs nested relations, define a `<MODEL>_INCLUDE` const `satisfies Prisma.<Model>Include` and a `<Model>Row` type from `Prisma.<Model>GetPayload`.

## 4. Cache — `src/lib/cache/cache.ts` + `src/lib/cache/revalidate.ts`

Add a tag to `cacheTags`, wrap the repository read in `unstable_cache`:

```ts
export const getCached<Name> = unstable_cache(
  (userId: string) => <name>Repository.findAll(userId),
  [],
  { tags: ["<name>"] },
);
```

Add an `invalidate<Name>Cache(userId)` function in `revalidate.ts` that calls `revalidateTag` for every tag this feature's writes affect (including tags of related features it touches, e.g. task writes also invalidate `spheres`).

## 5. Service — `services/<name>-service.ts`

Business logic and DB-row → domain-type mapping live here, never in the repository or the component. Pattern:

```ts
function map<Name>(row: <Name>Row): <Name>Data { /* flatten/rename fields */ }

export async function getAll<Name>(userId: string): Promise<<Name>Data[]> {
  const rows = await getCached<Name>(userId);
  return rows.map(map<Name>);
}

export async function upsert<Name>(userId: string, input: Upsert<Name>Input): Promise<<Name>Data> {
  // validate invariants that touch multiple fields here (see resolveDepth in task-service.ts for an example)
  const saved = input.id
    ? await <name>Repository.update(input.id, userId, {/* only defined fields, undefined means "don't touch" */})
    : await <name>Repository.create({ userId, /* ... */ });
  return map<Name>(saved);
}
```

Only pass fields through as `undefined` (skip) vs `null` (clear) deliberately — Prisma treats them differently.

## 6. Server Actions — `actions/<name>-actions.ts`

`"use server"` at the top. Every action goes through `withAction` from `@/lib/actions/action-utils`, which resolves `userId` from the session and wraps the result as `ActionResult<T>`:

```ts
"use server";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import * as service from "../services/<name>-service";
import { invalidate<Name>Cache } from "@/lib/cache/revalidate";

export async function upsert<Name>Action(input: Upsert<Name>Input): Promise<ActionResult<Awaited<ReturnType<typeof service.upsert<Name>>>>> {
  return withAction(async (userId) => {
    const result = await service.upsert<Name>(userId, input);
    invalidate<Name>Cache(userId);
    return result;
  });
}
```

Never call the repository directly from an action for a write — go through the service so mapping/validation isn't bypassed. Always call `invalidate*Cache` after a write, before returning.

## 7. Components

Follow the `[[design-system]]` skill for styling and the `[[component-structure]]` skill for internal ordering (hooks → derived values → handlers → early returns → JSX). Structural conventions:

- `src/features/<domain>/components/<Name>PageClient.tsx` — `"use client"`, receives `initial<Name>` etc. as props from the page, owns local state, calls actions directly (Server Actions are callable from client components — no fetch wrapper needed), shows toasts (`sonner`) on action results.
- Never call `input`/`textarea`/`select`/`button` raw — use the matching primitive from `src/components/ui/<category>/`.
- Heavy/rarely-shown subviews (calendar, graph view) are lazy-loaded with `lazy(() => import(...))` + `Suspense`, matching `TasksPageClient.tsx`.

## 8. Page — `src/app/(dashboard)/<domain>/<route>/page.tsx`

Server Component:

```tsx
export default async function <Name>Page() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) redirect("/login");

  let data: Awaited<ReturnType<typeof service.getAll<Name>>> = [];
  try {
    data = await service.getAll<Name>(userId);
  } catch (error) {
    console.error("Critical error in <Name>Page:", error);
    return <div>Failed to load — check logs</div>;
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "<domain> space", href: "/<domain>" }, { label: "<name>" }]} />
      <<Name>PageClient initial<Name>={data} />
    </div>
  );
}
```

Fetch multiple independent datasets with `Promise.all`, not sequential `await`s. Add `metadata: Metadata = { title: "..." }`. Add a sibling `loading.tsx` if the page has a non-trivial fetch.

## 9. Register in navigation

Add the route to the relevant space's `pages` array in `src/lib/spaces/domains.ts` (see step 0) — a page that isn't registered here is unreachable from the sidebar/mobile nav.

## 10. Verify

```
npx tsc --noEmit
pnpm dev   # click through the new page/flow before calling it done
```
