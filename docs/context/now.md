---
updated: 2026-06-30
---

# Поточний стан проекту

## Фокус зараз

**Domain Cleanup** — видалення 10+ доменів, фокус тільки на `life` домені.
Великий batch змін в staging, ще не закомічено.

## Що зроблено (в staging / untracked)

### Завершено і staged:
- ✅ **Google OAuth міграція** — замінено credentials на Google OAuth (NextAuth v5)
- ✅ **Landing page видалено** — `/` редиректить на `/home` або `/login` через middleware
- ✅ **Login redesign** — Void Terminal стиль, тільки кнопка Google
- ✅ **Domain cleanup (staged)** — 100+ файлів staged for deletion:
  - `fishing`, `fitness`, `health`, `languages`, `library`, `life-system`
  - `mind`, `nutrition`, `operations`, `other`, `planning`, `profile`
  - `trading`, `vault`, `wealth` — всі видалені з `src/app/(dashboard)/`
- ✅ **Docs** — додано `cleanup-unused-domains.md`, `google-oauth-migration.md`
- ✅ `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` — видалені (старі, замінюємо цією системою)

### Untracked (нові, не staged):
- 🔄 `src/app/(auth)/register/` — новий register flow (actions, loading, page)
- 🔄 `src/features/life/repositories/` — новий repository pattern для life домену

### Unstaged changes (в роботі):
- 🔄 `src/app/(auth)/login/actions.ts` і `page.tsx` — локальні зміни не staged

## Поточна архітектура (що лишається)

```
src/app/(dashboard)/life/
  journal/    — щоденний запис (DailyEntry)
  tasks/      — рекурсивне дерево задач
  habits/     — Tiny Habits трекер
  week/       — тижневий розклад + шаблони
  history/    — перегляд минулих записів

prisma/schema.prisma — ще містить deprecated моделі (nutrition, languages...)
```

## Відкриті питання

- [ ] Чи потрібен `register/` flow якщо є тільки Google OAuth?
- [ ] Коли робити Prisma migration для видалення deprecated моделей зі схеми?
- [ ] Що робити з `src/features/` папками для видалених доменів?

## Відомі ризики

- `prisma/schema.prisma` ще містить 30+ deprecated моделей (nutrition, languages тощо)
- Після видалення файлів обов'язково: `npx tsc --noEmit` + `pnpm lint` + `pnpm build`
