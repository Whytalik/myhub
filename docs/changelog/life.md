## [2026-05-18] — Feature: "Eat the Frog" task marker

Додано механізм позначення однієї задачі як "Жаба" (пріоритетна задача дня). Тільки одна активна жаба одночасно — встановлення нової автоматично знімає попередню.

- **Schema**: `isFrog Boolean @default(false)` у моделі `Task`
- **Service**: `setTaskAsFrog(userId, id)` — транзакція: знімає прапор у всіх задач, ставить обраній; toggle-поведінка
- **Sorting**: жаба завжди піднімається вгору в `sortTasks` (вище статусу та пріоритету)
- **UI**: зелений border/glow на картці; badge "🐸 Frog" поряд із заголовком; кнопка toggle у hover-actions

**Verification:**
- [x] Logic implemented
- [x] UI updated
- [x] Verified with `pnpm tsc --noEmit`, `pnpm lint`
- [ ] Міграція БД (`pnpm prisma migrate dev --name add_task_frog`) — потребує запущеного Docker

## [2026-05-15] — UI: Standardized and Refactored Life Space Skeletons

Refactored all loading skeletons (`loading.tsx`) and page containers in the `Life` Space to accurately mirror the functional page structure, ensuring visual consistency during data fetching.

- **Pages Updated**: `habits/page.tsx`, `tasks/page.tsx`, `journal/page.tsx`, `history/page.tsx`.
- **Skeletons Updated**: `habits/loading.tsx`, `tasks/loading.tsx`, `journal/loading.tsx`, `history/loading.tsx`.
- **Improvements**:
    - Skeletons now include headers, breadcrumbs, and filter controls where applicable, matching page structure.
    - Grid layouts in skeletons accurately represent the actual cards/task items.
    - Padding standardized to `px-8 py-8` container across all pages and skeletons to match the new UI standard.
- **Verification**:
    - [x] Logic implemented (padding standardized in pages and skeletons)
    - [x] UI updated (loading states align with page content)
    - [x] Verified with `pnpm tsc --noEmit`
