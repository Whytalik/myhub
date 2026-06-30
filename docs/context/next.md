---
updated: 2026-06-30
---

# Наступні кроки

## Першочергово (поточний cleanup)

1. **Завершити staged changes** — перевірити що все консистентно, зробити commit
   - `npx tsc --noEmit` → `pnpm lint` → `pnpm build` перед commit
2. **Вирішити питання `register/`** — чи потрібен якщо тільки Google OAuth
3. **Очистити `prisma/schema.prisma`** — видалити deprecated моделі (nutrition, languages, library, wishlist, trading, fitness) + запустити `prisma migrate dev`
4. **Stage life repositories** — `src/features/life/repositories/` готові?

## Після cleanup

5. **Перевірити sidebar** — чи відображає тільки life домен після видалення інших
6. **Перевірити home page** — чи не лишились посилання на видалені домени
7. **Оновити Prisma Client** — `npx prisma generate` після cleanup схеми

## Майбутні фічі (ідеї, не commitments)

- Crisis/Recovery UI — SystemStatus вже в схемі, потрібна реалізація в UI
- Sprint board — Objective + KeyResult компоненти
- Weekly review workflow

---
*Оновлюй цей файл наприкінці кожної сесії — додавай виконане в `now.md`, видаляй звідси.*
