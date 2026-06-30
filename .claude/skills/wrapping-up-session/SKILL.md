---
name: wrapping-up-session
description: Wraps up the current work session by updating project context files. Use when finishing work, ending a session, or when the user says "wrap up", "let's finish", "закінчуємо", "завершуємо сесію". Updates docs/context/now.md, next.md, and writes a session log.
---

# Wrapping Up a Session

## Steps

1. **Update `docs/context/now.md`**
   - Reflect what changed during this session (what's done, what's in progress)
   - Update open questions / risks if needed
   - Keep the `updated:` frontmatter date current

2. **Update `docs/context/next.md`**
   - Mark completed items as done or remove them
   - Add new steps discovered during this session
   - Keep it as a short numbered list (< 10 items)

3. **Write session log `docs/context/sessions/YYYY-MM-DD.md`**
   Use today's date. Template:
   ```markdown
   # Session YYYY-MM-DD

   ## What was done
   - ...

   ## Decisions made
   - ...

   ## Open questions
   - ...
   ```

4. **Update `docs/context/decisions.md`** (only if architectural decision was made)
   Format: `## [date] Decision title` → What → Why → Consequences

## Done when
All three files updated and session log written.
