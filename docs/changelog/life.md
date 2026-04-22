# Life Domain Changelog

## [2026-04-22] - Task Statistics & Performance Optimization
Redesigned `getTaskStats` service to use targeted database counts and groupings instead of fetching all tasks into memory.
Implemented `loading.tsx` for the Tasks page to enable streaming and instant UI feedback.

### Verification Checklist:
- [x] Logic implemented (Database-level aggregations)
- [x] UI updated (Loading skeleton for tasks)
- [x] Verified with tsc/lint/build
- [x] Bugfix: Cleaned up invalid where clauses in CRUD operations
