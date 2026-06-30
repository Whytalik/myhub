# Журнал архітектурних рішень

Формат: **рішення** → чому → наслідки.
Новіші зверху.

---

## [2026-06-30] Нова система контексту (ця система)

**Рішення:** Замінити CLAUDE.md/AGENTS.md/GEMINI.md однією системою:
`CLAUDE.md` (протокол сесії) + `docs/context/` (живий контекст).

**Чому:** Розробник повертається до проекту кілька разів на тиждень — щоразу втрачає 20+ хвилин на відновлення контексту. Потрібно одне місце де "де я зараз".

**Наслідки:** `CLAUDE.md` < 150 рядків, деталі в `docs/`. Obsidian читає той самий `docs/`.

---

## [2026-06-26] Google OAuth замість Credentials

**Рішення:** Видалено email/password auth, тільки Google OAuth (NextAuth v5).
Landing page видалено — `/` редиректить одразу.

**Чому:** Спрощення системи, менше коду для підтримки, немає сенсу реєстрації для особистого застосунку.

**Наслідки:** `allowDangerousEmailAccountLinking: true` щоб існуючі users не дублювались. `/register` редиректить на `/login`.

→ Деталі: `docs/research/google-oauth-migration.md`

---

## [2026-06-~] Life-only Domain Cleanup

**Рішення:** Видалено всі домени крім `life` (Operations):
Health (nutrition, fitness), Mind (languages, library), Wealth (trading), Vault (wishlist), Fishing.

**Чому:** Занадто широкий scope, більшість доменів не використовувались. Фокус на щоденному виконанні (tasks, habits, journal) + OKR/sprint плануванні.

**Наслідки:** 100+ файлів видалено. Prisma schema потребує окремої міграції для видалення deprecated моделей.

→ Деталі: `docs/research/cleanup-unused-domains.md`

---

## [2026-04-21] Space vs System — термінологія UI

**Рішення:** UI використовує термін **Space** (середовище для роботи), а **System** — концептуальний шар (механіки, правила).

**Чому:** "Life Space" інтуїтивніше для щоденного використання ніж "Life System". System залишається для внутрішньої документації механік.

**Наслідки:** Breadcrumbs, заголовки, навігація — скрізь "Space". Документація механік — у "System" секціях.

→ Деталі: `docs/research/space-vs-system.md`

---

## [2026-04-29] Supabase замість Prisma Postgres

**Рішення:** Міграція з Prisma Postgres на Supabase.

**Чому:** Prisma Postgres мав timeout на Vercel build (45хв через connection pooler). Supabase з `directUrl` (порт 5432) для міграцій вирішує проблему.

**Наслідки:** `prisma.config.ts` має `directUrl` (env: `DIRECT_URL` або `POSTGRES_URL_NON_POOLING`). `prisma generate && next build` — без `db push` в build script.

---

## [2026-04-21] Видалення AI модуля

**Рішення:** Видалено `src/features/ai`, `src/lib/ai`, моделі AIChat/AISuggestion/AIUsage.

**Чому:** Нестабільні AI SDK, overhead підтримки, bundle size. Фокус на стабільності core доменів.

**Наслідки:** Зменшено bundle ~200KB+. Dependencies видалено: `ai`, `@ai-sdk/google`, `@ai-sdk/openai`.
