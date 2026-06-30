# Layer-by-layer templates for life domain features

Replace `<Entity>` / `<entity>` with your entity name (e.g. Sprint / sprint).

---

## Naming conventions

| Layer | File | Export |
|-------|------|--------|
| repository | `repositories/<entity>.repository.ts` | `const <entity>Repository = { ... }` |
| cache | `lib/cache.ts` (add to existing) | `getCached<Thing>(userId)` |
| service | `services/<entity>-service.ts` | `export async function verb<Entity>(userId, ...)` |
| logic | `logic/<entity>-utils.ts` | pure functions only |
| action | `actions/<entity>-actions.ts` | `export async function verb<Entity>Action(...)` |
| revalidate | `lib/revalidate.ts` (add to existing) | `invalidate<Feature>Cache(userId)` |
| schema | `schemas.ts` (add to existing) | `<entity>Schema`, `<Entity>FormData` |
| types | `types.ts` (add to existing) | `<Entity>Data`, `Upsert<Entity>Input` |
| page | `app/(dashboard)/life/<feature>/page.tsx` | `async function <Feature>Page()` |
| client | `components/<feature>/<Feature>PageClient.tsx` | `function <Feature>PageClient(props)` |
| form dialog | `components/<feature>/<Entity>FormDialog.tsx` | `function <Entity>FormDialog(props)` |

---

## 1. types.ts — add these interfaces

```ts
// Read DTO (returned from service)
export interface <Entity>Data {
  id: string;
  userId: string;
  // ... domain fields with proper TS types (Date not string)
  createdAt: Date;
  updatedAt: Date;
}

// Write input (from form / action)
export interface Upsert<Entity>Input {
  id?: string;
  // ... writable fields (dates as string | null)
}
```

---

## 2. repositories/<entity>.repository.ts

```ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma";

// Optional: shared include + row type
export const <ENTITY>_INCLUDE = {
  // e.g. relatedModel: true,
} as const satisfies Prisma.<Entity>Include;

export type <Entity>Row = Prisma.<Entity>GetPayload<{
  include: typeof <ENTITY>_INCLUDE;
}>;

export const <entity>Repository = {
  findAll(userId: string) {
    return prisma.<entity>.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: <ENTITY>_INCLUDE,
    });
  },

  findById(id: string, userId: string) {
    return prisma.<entity>.findUnique({ where: { id, userId } });
  },

  create(userId: string, data: Prisma.<Entity>UncheckedCreateInput) {
    return prisma.<entity>.create({ data: { ...data, userId } });
  },

  update(id: string, userId: string, data: Prisma.<Entity>UncheckedUpdateInput) {
    return prisma.<entity>.update({ where: { id, userId }, data });
  },

  delete(id: string, userId: string) {
    return prisma.<entity>.delete({ where: { id, userId } });
  },
};
```

---

## 3. lib/cache.ts — add entries

```ts
// In cacheTags object:
<entity>s: (userId: string) => `<entity>s:${userId}`,

// Cached read function:
export const getCachedAll<Entity>s = unstable_cache(
  (userId: string) => <entity>Repository.findAll(userId),
  [],
  { tags: ["<entity>s"] },
);
```

---

## 4. services/<entity>-service.ts

```ts
import { getCachedAll<Entity>s } from "@/lib/cache";
import { <entity>Repository, <Entity>Row } from "../repositories/<entity>.repository";
import type { <Entity>Data, Upsert<Entity>Input } from "../types";

function map<Entity>(row: <Entity>Row): <Entity>Data {
  return {
    id: row.id,
    userId: row.userId,
    // map fields...
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getAll<Entity>s(userId: string): Promise<<Entity>Data[]> {
  const rows = await getCachedAll<Entity>s(userId);
  return rows.map(map<Entity>);
}

export async function upsert<Entity>(
  userId: string,
  input: Upsert<Entity>Input,
): Promise<<Entity>Data> {
  const saved = input.id
    ? await <entity>Repository.update(input.id, userId, { /* map input fields */ })
    : await <entity>Repository.create(userId, { /* map input fields */ });
  return map<Entity>(saved as <Entity>Row);
}

export async function delete<Entity>(id: string, userId: string): Promise<void> {
  await <entity>Repository.delete(id, userId);
}
```

---

## 5. lib/revalidate.ts — add function

```ts
export function invalidate<Feature>Cache(userId: string) {
  revalidateTag(cacheTags.<entity>s(userId), INVALIDATE_PROFILE);
  revalidateTag("<entity>s", INVALIDATE_PROFILE);
}
```

---

## 6. actions/<entity>-actions.ts

```ts
"use server";

import * as <entity>Service from "../services/<entity>-service";
import { invalidate<Feature>Cache } from "@/lib/revalidate";
import { withAction, ActionResult } from "@/lib/action-utils";
import type { Upsert<Entity>Input, <Entity>Data } from "../types";

export async function upsert<Entity>Action(
  data: Upsert<Entity>Input,
): Promise<ActionResult<Awaited<ReturnType<typeof <entity>Service.upsert<Entity>>>>> {
  return withAction(async (userId) => {
    const result = await <entity>Service.upsert<Entity>(userId, data);
    invalidate<Feature>Cache(userId);
    return result;
  });
}

export async function delete<Entity>Action(
  id: string,
): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await <entity>Service.delete<Entity>(id, userId);
    invalidate<Feature>Cache(userId);
  });
}
```

---

## 7. schemas.ts — add Zod schema (form validation only)

```ts
export const <entity>Schema = z.object({
  name: z.string().min(1, "Required"),
  // ... other validated fields
});

export type <Entity>FormData = z.infer<typeof <entity>Schema>;
```

---

## 8. app/(dashboard)/life/<feature>/page.tsx

```ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import * as <entity>Service from "@/features/life/services/<entity>-service";
import { <Feature>PageClient } from "@/features/life/components/<feature>/<Feature>PageClient";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "<Feature> — myhub" };

export default async function <Feature>Page() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const items = await <entity>Service.getAll<Entity>s(userId);

  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "life space", href: "/life" }, { label: "<feature>" }]}
        title="<Feature>"
      />
      <<Feature>PageClient initial<Entity>s={items} />
    </div>
  );
}
```

---

## 9. components/<feature>/<Feature>PageClient.tsx

```ts
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { <Entity>Data } from "../../types";
import { delete<Entity>Action } from "../../actions/<entity>-actions";

interface <Feature>PageClientProps {
  initial<Entity>s: <Entity>Data[];
}

export function <Feature>PageClient({ initial<Entity>s }: <Feature>PageClientProps) {
  const [items, setItems] = useState(initial<Entity>s);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await delete<Entity>Action(id);
      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success("Deleted");
      } else {
        toast.error(result.error ?? "Failed");
      }
    });
  };

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {/* render item */}
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 10. components/<feature>/<Entity>FormDialog.tsx (if form needed)

```ts
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { <entity>Schema, type <Entity>FormData } from "../../schemas";
import { upsert<Entity>Action } from "../../actions/<entity>-actions";
import type { <Entity>Data } from "../../types";

interface <Entity>FormDialogProps {
  <entity>?: <Entity>Data;
  onClose: () => void;
  onSaved: (item: <Entity>Data) => void;
}

export function <Entity>FormDialog({ <entity>, onClose, onSaved }: <Entity>FormDialogProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<<Entity>FormData>({
    resolver: zodResolver(<entity>Schema),
    defaultValues: <entity> ? { /* map existing values */ } : {},
  });

  const onSubmit = (data: <Entity>FormData) => {
    startTransition(async () => {
      const result = await upsert<Entity>Action({ id: <entity>?.id, ...data });
      if (result.success) {
        toast.success(<entity> ? "Updated" : "Created");
        onSaved(result.data);
        onClose();
      } else {
        toast.error(result.error ?? "Failed");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
      <button type="submit" disabled={isPending}>Save</button>
    </form>
  );
}
```
