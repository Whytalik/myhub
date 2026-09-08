---
name: component-structure
description: Mandatory internal ordering for every component -- compute state and styles as named values first, then render. Use when creating or editing any .tsx component.
---

# Skill: component-structure

Every component body follows the same four-part order, top to bottom. Never compute a className, style object, or derived label inline inside the JSX you return — compute it above the `return`, give it a name, then reference the name.

## Why this is a hard rule here

A past refactor (`2d68982 refactor: ... strip styles and comments`) stripped inline className attributes across the codebase and left the JSX structurally intact but with **blank attribute slots** — the tag was still there, but the class string was gone, so components silently rendered unstyled. That specific regression (including the `PRIORITY_CONFIG`/`STATUS_CONFIG` `style: ""` placeholders) has since been fixed and verified clean repo-wide (checked 2026-09-08 — zero blank `className`/`style` slots left). The rule below stays in force as prevention: keeping computation and rendering as two visibly separate steps is what makes this class of regression impossible to introduce silently and easy to spot in review.

## The four-part order

```tsx
export function Example({ status, isPrivate, className }: ExampleProps) {
  // 1. Hooks -- state, transitions, context, custom hooks. Nothing computed yet.
  const [isPending, startTransition] = useTransition();
  const { isOpen, toggle } = useDynamicPositioning<HTMLButtonElement>({ offset: 8 });

  // 2. Derived values -- styles, formatted labels, config lookups. Named, computed once.
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const badgeClass = `${config.tone} ${isPending ? "opacity-50" : ""} ${className ?? ""}`.trim();
  const label = isPrivate ? "Private" : config.label;

  // 3. Handlers -- defined before return, not inline arrow soup in JSX where avoidable.
  const handleClick = () => startTransition(() => toggle());

  // 4. Early-return guards, then the single JSX return. No computed strings inside the JSX itself.
  if (!status) return null;

  return (
    <button className={badgeClass} onClick={handleClick} disabled={isPending}>
      <Icon size={10} strokeWidth={3} />
      {label}
    </button>
  );
}
```

Rules that follow from this:

- **No blank JSX attributes.** If a tag has `className={...}` or `style={...}`, it must resolve to a real value — never leave `className={""}` as a silent placeholder, and never leave the line blank waiting to be filled in later. If a component genuinely needs no class, omit the prop entirely.
- **No inline ternary chains inside a JSX attribute.** `className={a ? "x" : b ? "y" : "z"}` inside the `return` is a sign the derivation belongs in step 2, above, as a named variable.
- **Config maps (`X_CONFIG: Record<...>`) must carry real values.** An empty string in a config map (`style: ""`) is either dead code to delete or a bug to fix — never leave it as a stub.
- **Derive once, use many times.** If the same conditional expression appears in more than one place in the JSX, it was computed in the wrong place — hoist it to step 2.
- Use `[[design-system]]` for which token classes to put into these computed strings.

## Fixing existing offenders

When you touch a file that has this pattern (blank attribute slots, empty `style: ""` config values), fix it in the same edit rather than leaving it — pull the class computation up into a named variable per the pattern above, using the real tokens from `[[design-system]]`. Don't do a drive-by rewrite of unrelated parts of the file.
