# Operations Domain Changelog

## [2026-04-22] - 12-Week Sprints & OKR Engine
Implemented the core 12-week sprint logic, including database models for Sprints, Objectives, and Key Results.
Added a SprintBoard UI with tactical execution scoring and a TacticTracker for weekly habit-style goal driving.

### Verification Checklist:
- [x] Logic implemented (Prisma models + Sprint services/actions)
- [x] UI updated (SprintBoard, Objective/KeyResult/Tactic dialogs)
- [x] Verified with tsc/lint/build
- [x] Bugfix: Resolved ForeignKeyConstraintViolation in upsertSphere/task calls
