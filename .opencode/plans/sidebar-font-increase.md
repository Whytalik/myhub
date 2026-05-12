# Plan: Increase Sidebar Font Sizes via CSS Variables

## Step 1: Add CSS variables to `src/app/globals.css`

In the `@theme` block, after existing `--text-*` variables, add:

```css
  /* Sidebar font sizes */
  --text-sidebar-label: 0.875rem;
  --text-sidebar-sub: 0.8125rem;
  --text-sidebar-badge: 0.5625rem;
  --text-sidebar-title: 1.125rem;
  --text-sidebar-subtitle: 0.625rem;
  --text-sidebar-user: 0.875rem;
  --text-sidebar-user-label: 0.6875rem;
  --text-sidebar-avatar: 0.8125rem;

  /* Settings modal font sizes */
  --text-settings-item: 0.875rem;
  --text-settings-tab: 0.875rem;
  --text-settings-version: 0.5625rem;
  --text-settings-heading: 0.5625rem;
  --text-settings-input: 0.875rem;

  /* Domain header font sizes */
  --text-header-logo: 0.875rem;
  --text-header-domain: 0.75rem;
```

## Step 2: Update `src/components/sidebar.tsx`

| Line | Old | New |
|------|-----|-----|
| 253 | `text-[13px]` | `text-[var(--text-sidebar-label)]` |
| 262 | `text-[8px]` | `text-[var(--text-sidebar-badge)]` |
| 340 | `text-[12px]` | `text-[var(--text-sidebar-sub)]` |
| 417 | `text-base` | `text-[var(--text-sidebar-title)]` |
| 418 | `text-[9px]` | `text-[var(--text-sidebar-subtitle)]` |
| 504 | `text-[12px]` | `text-[var(--text-sidebar-avatar)]` |
| 516 | `text-[13px]` | `text-[var(--text-sidebar-user)]` |
| 517 | `text-[10px]` | `text-[var(--text-sidebar-user-label)]` |

## Step 3: Update `src/components/settings-modal.tsx`

| Line | Old | New |
|------|-----|-----|
| 189 | `text-sm` | `text-[var(--text-settings-item)]` |
| 503 | `text-sm` | `text-[var(--text-settings-tab)]` |
| 512 | `text-[8px]` | `text-[var(--text-settings-version)]` |
| 527 | `text-[8px]` | `text-[var(--text-settings-heading)]` |
| 531 | `text-sm` | `text-[var(--text-settings-input)]` |
| 540 | `text-[8px]` | `text-[var(--text-settings-heading)]` |
| 548 | `text-sm` | `text-[var(--text-settings-input)]` |
| 565 | `text-[8px]` | `text-[var(--text-settings-heading)]` |
| 583 | `text-[8px]` | `text-[var(--text-settings-heading)]` |
| 619 | `text-[8px]` | `text-[var(--text-settings-heading)]` |
| 654 | `text-[8px]` | `text-[var(--text-settings-heading)]` |
| 679 | `text-[8px]` | `text-[var(--text-settings-heading)]` |

## Step 4: Update `src/components/domain-header.tsx`

| Line | Old | New |
|------|-----|-----|
| 49 | `text-sm` | `text-[var(--text-header-logo)]` |
| 86 | `text-[11px]` | `text-[var(--text-header-domain)]` |

## Notes

- `sidebar-provider.tsx` and `space-provider.tsx` have no UI/font styling, only logic — no changes needed.
- All values are +1px from original sizes.
- Using CSS custom properties via `@theme` so Tailwind can resolve them with `text-[var(...)]` syntax.
