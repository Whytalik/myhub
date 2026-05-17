# Hub: Features Index (Functional Mapping)

This file serves as the definitive, exhaustive index of all currently implemented business logic and data structures. It maps directly to the database schema and active services.
**Goal:** Minimize context usage by providing a flat, descriptive list of exact capabilities without implementation history.

---

## 1. Operations Domain (The Engine)
### 1.1 Strategic Planning (Personal Scrum)
- **Level 01: 5-Year Mission**: Long-term qualitative vision (title, descriptive content).
- **Level 02: Strategic Pillars**: Activation/Deactivation of Life Spheres (Finance, Health, Mind, etc.) as active focal points.
- **Level 03: Annual Compass**: Year-level tracking for Theme, WIGs (Wildly Important Goals), and Focus Areas.
- **Level 04: Sprints**:
  - Bi-weekly execution cycles (Status: PLANNED, ACTIVE, COMPLETED).
  - **Objectives**: Tied to Spheres, with statuses (IN_PROGRESS, ACHIEVED, PARTIAL, FAILED).
  - **Key Results (OKR)**: Quantitative targets with current/target values and custom units.
  - **Projects**: Time-bound groupings of tasks linked to Objectives.
  - **Tactics**: Reusable actions tied to Key Results, repeating DAILY or WEEKLY, tracked by week number.
- **Level 05: Reviews**: Weekly narrative reviews capturing score, wins, challenges, and adjustments.

### 1.2 Daily Execution Hub
- **Journal & Telemetry (DailyEntry)**:
  - **Sleep**: Bedtime, wakeup, total hours, subjective quality, text notes.
  - **State**: Morning/Evening energy (1-10), mood (1-10), emotional tags (JSON array).
  - **Routines**: Morning/Evening/Recovery routine checklists (JSON) and text notes.
  - **Standup**: Blockers, achievements (done), and daily plan.
  - **Reflection**: Win of the day, improvement for tomorrow, gratitude, brain dump.
  - **Metrics**: Body weight, nutrition rating.
- **Habit Engine (Tiny Habits)**:
  - **Types**: Positive (Build) and Avoidance (Break).
  - **Methodology**: Anchor (Trigger), Action, Celebration.
  - **Parameters**: Target days per week, reminder time, subcategories.
  - **Effort Tiers**: Sphere Levels (MINIMUM, MEDIUM, DESIRED) for adaptive daily goals.
  - **Tracking**: Daily habit completions mapped to dates.
- **Task Management**:
  - **Structure**: Infinite recursive parent-child depth (`parentId`).
  - **Metadata**: Title, description, icon, planned dates (start/end) with/without specific times, due dates.
  - **Status**: BACKLOG, TODO, IN_PROGRESS, DONE, CANCELLED. Priority: LOW, MEDIUM, HIGH, URGENT.
  - **Mechanics**:
    - **Carry-over**: Unfinished tasks retain original date (`carriedFromDate`) and require a `carryOverReason`.
    - **Blockers**: `isBlocked` flag for dependency tracking.
    - **Privacy**: `isPrivate` flag for sensitive tasks (local-only visibility).
  - **Associations**: Tied to Life Spheres and Projects.
- **Routine Scheduling**:
  - **Day Templates**: Global mappings (e.g., "Regular", "Training").
  - **Week Templates**: Defining routine structures for specific days of the week (Mon-Sun).

## 2. Health Domain (Physical Optimization)
### 2.1 Advanced Nutrition System
- **Profiles**: Personalized targets (Gain/Maintain/Lose), daily Kcal goals, macro percentages (Protein, Fat, Carbs), and fiber targets.
- **Food Database (Products)**:
  - Macro tracking per 100g.
  - Market data: Price, store (e.g., ATB, Silpo, Metro), standard package amounts, custom units.
  - Sourcing metadata: Manual vs. External APIs (OpenFoodFacts).
- **Recipes (Dishes)**:
  - Categorization (MAIN, SALAD, SOUP, SNACK, etc.), dynamic servings calculation.
  - **Cooking Logic**: Ingredients linked to specific cooking methods (e.g., BOILED, FRIED) with coefficients that auto-calculate cooked vs. raw weight.
  - **Alternatives**: Allowed substitution paths for specific ingredients.
- **Meal Planning**:
  - **Week Plans**: Multi-day overviews, notes.
  - **Day Plans**: Activity levels, Day Prep Notes (checklists for tomorrow).
  - **Meal Slot Instances**: Specific meals (e.g., "Breakfast") with precise time windows, target Kcal/Fiber constraints, and `locked` states.
  - **Entries**: Adding whole Dishes or standalone Products to Meal Slots, supporting raw/cooked input states.
- **Automated Shopping Engine**:
  - **Lists**: Auto-generated from Week Plans with checkable items.
  - **Smart Cart**:
    - Aggregates raw gram requirements across the whole week.
    - Compares against "available grams" at home.
    - Calculates required packages to buy based on standard package sizes.
    - Cost estimation based on database prices.
    - Statuses: TO_BUY, IN_CART, BOUGHT, HAVE, SKIPPED, manual overrides.

## 3. Mind Domain (Intellectual Mastery)
- **Library**: Repository of media (BOOK, ARTICLE, VIDEO, COURSE, OTHER).
  - Statuses: WANT_TO_READ, READING, COMPLETED, DROPPED.
  - Metadata: Author, URL, rating (1-10), and text notes.
- **Language Acquisition System**:
  - **Progression**: CEFR tracking (A0-C2) and total XP.
  - **Spheres of Mastery**: Specific tracking for VOCABULARY, LISTENING, READING, SPEAKING, WRITING.
  - **Spaced Repetition (Vocabulary)**: Word, translation, context, notes. Mathematical SRS tracking (interval, easeFactor, repetition, nextReview date).
  - **Immersion Logging**: Duration-based tracking linked to specific Language Spheres.
  - **Resource Library**: URLs and materials categorized by Sphere and CEFR level.

## 4. Vault Domain (System Archives)
- **Wishlist**: Hierarchical desire pipeline.
  - Statuses: IDEA, RESEARCHING, WISH, PLANNED, ORDERED, BOUGHT, GIFTED, ABANDONED, REPLACED, CANCELLED.
  - Metadata: Price, Currency (UAH default), priority, necessity score, store tags, and image URLs.
- **Life Spheres**: Centralized taxonomy for grouping data across all domains.
  - Visuals: Custom colors and icons.
  - Governance: Automated synchronization to ensure core spheres (Finance, Health, etc.) exist for all users.

## 5. System Infrastructure
- **System Integrity & Recovery (Recovery Ladder)**:
  - **Crisis Management**: Automated transition between system states (STABLE, CRISIS_SURVIVAL, CRISIS_STABILIZATION, CRISIS_RE_ENTRY) based on consecutive performance.
  - **Recovery Scores**: Daily percentage-based evaluation of recovery routine compliance.
  - **Auto-Sync**: Background daily checks validating system state and sphere integrity.
- **Data Governance**:
  - **Full Export/Restore**: Deep JSON generation covering the entire relational tree.
  - **Deep Restore**: Intelligent ID re-mapping for recursive objects (Tasks) and many-to-many relations during import.
  - **System Reset**: Secure transactional wipe of all user-associated data.
- **Push Notifications**: Web Push subscription registry (endpoint, p256dh, auth, userAgent) for external triggers.
- **Contextual UI**:
  - Domain-based sidebar filtering and "Bento grid" landing pages.
  - Space-specific accent theming globally injected via CSS variables.
  - Server-side data fetching coupled with highly synchronized skeleton loading states.
- **Caching**: Centralized `unstable_cache` wrapper with Next.js 16 tag-based revalidation (`revalidateTag`) across 6 domains to minimize database hits.
- **Security**: NextAuth v5 integration, role-based routing (Admin vs User), and Session-DB synchronization.