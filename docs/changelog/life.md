## [2026-05-20] — Feature: Day lifecycle (Greeting → Journal → Complete)

Додано екран привітання перед початком дня (з часовим greeting, датою та brain dump вчора) і екран завершення з підсумком (завдання, звички, сон, енергія, настрій, перемога дня). Кнопка "Завершити день" з'являється в кінці Evening-таба. Стан (startedAt/completedAt) зберігається в БД — потрібна міграція: `pnpm prisma migrate dev --name add-day-started-completed`.

**Verification:**
- [ ] Run migration: `docker compose up -d` → `pnpm prisma migrate dev --name add-day-started-completed`
- [ ] Open `/life/journal` today → shows greeting screen
- [ ] Click "Розпочати день" → transitions to journal form
- [ ] Go to Evening tab → "Завершити день" button at bottom
- [ ] Click it → shows completion screen with stats
- [ ] "Переглянути записи" → goes back to form
- [ ] Past-day entries: no greeting/completion, normal read-only form
- [x] Verified with `pnpm tsc --noEmit`

## [2026-05-20] — Fix: Task carry-over timezone bug + Guide page-awareness

Виправлено timezone-баг у `tomorrowISO`: раніше `.toISOString().split("T")[0]` повертало UTC-дату, яка для UTC+3 збігалася з поточним днем, — таски залишалися на тому ж дні з часом 3:00. Тепер дата обчислюється через локальний конструктор `new Date(y, m-1, d+1)`. `carryOverTaskAction` тепер також зсуває `plannedDate`/`plannedEndDate` на правильну кількість UTC-мілісекунд, зберігаючи оригінальний час. Guide modal тепер відкривається на відповідній секції залежно від поточної сторінки (`/life/tasks` → Tasks, `/life/habits` → Habits, `/nutrition/dishes` → Dishes тощо).

**Verification:**
- [x] Logic implemented (`TaskReviewSection.tsx`, `task-actions.ts`, `guide-drawer.tsx`)
- [x] Verified with `pnpm tsc --noEmit`

## [2026-05-19] — Fix: TaskReviewSection always reflects current day tasks count

Видалено `initialTotal` — frozen state, що не оновлювався при додаванні нових тасок протягом дня. Тепер `total`, прогрес-бар та лічильник `done / total` завжди відображають актуальну кількість тасок з пропу `tasks`.

**Verification:**
- [x] Logic implemented (`TaskReviewSection.tsx` — removed `useState(() => tasks.length)`, replaced with `tasks.length`)
- [x] Verified with `pnpm tsc --noEmit`

## [2026-05-19] — Feature: auto-update current time line in Day timeline + Tasks tab done/total count

Лінія поточного часу в Day-таймлайні тепер оновлюється кожну хвилину через `setInterval`. Таб "Tasks" у журналі тепер показує `done/total` (наприклад, `Tasks (2/5)`) замість лише загальної кількості.

**Verification:**
- [x] Logic implemented (`TaskCalendar.tsx` — `now` state + interval; `DailyEntryForm.tsx` — tasks label)
- [x] Verified with `pnpm tsc --noEmit`

## [2026-05-18] — Feature: show frog indicator in day timeline

Таска-жаба (🐸) тепер показує іконку у картці таймлайну (режим Day) поруч зі сферою та пріоритетом.

**Verification:**
- [x] UI updated (`TaskCalendar.tsx` — день-таймлайн картка)
- [x] Verified with `pnpm tsc --noEmit`

## [2026-05-18] — Fix: hide parent task in daily grid until subtasks are done

Батьківська задача (з сабтасками) більше не відображається в гріді дня, якщо сабтаски ще не завершені. Показується лише якщо: всі сабтаски мають статус DONE або CANCELLED, або сьогодні є днем дедлайну (`dueDate`).

**Verification:**
- [x] Logic implemented (`filterDailyTasks` в `task-service.ts`)
- [x] Verified with `pnpm tsc --noEmit`

## [2026-05-18] — Fix: History button — journal date navigation

Сторінка журналу тепер читає `?date=YYYY-MM-DD` query param. Переходи з History view на конкретну дату тепер завантажують правильний запис. При перегляді минулої дати breadcrumb і заголовок відображають вибрану дату, при поверненні без параметра — показується сьогоднішній запис.

**Verification:**
- [x] Logic implemented
- [x] UI updated
- [x] Verified with `pnpm tsc --noEmit`

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
