# Increment: Crisis & Recovery System (Safe Mode)

## Overview
Implementation of a "Safe Mode" for the Personal OS to handle periods of low energy, burnout, or crisis. The system transitions from a high-performance tracker to a survival-focused assistant that guides the user back to stability through a phased recovery protocol.

## Core Concepts
- **SOS Triggers:** Specific behavioral, physical, and cognitive markers that signal the need for Crisis Mode.
- **Phased Recovery (The Ladder):**
    - **Phase 0: Survival (Safe Mode)** - Focus on 100% biological maintenance.
    - **Phase 1: Stabilization** - Focus on 80% consistency of low-effort routines.
    - **Phase 2: Re-entry** - Gradual return to productivity and social activity.
- **Fail-Safe Logic:** Automatic "Step Down" if performance targets (<80%) aren't met, preventing "pushing through" during injury/burnout.

---

## User Stories (US)

### Phase 1: Documentation & Protocol Design
- **US 1.1: SOS Trigger Definition**
    - *As a user, I want to have a clear list of "Red Flags" so that I know exactly when I should activate Crisis Mode without second-guessing.*
    - **Deliverable:** `docs/protocols/SOS_TRIGGERS.md` (Obsidian).
- **US 1.2: Recovery Protocol Documentation**
    - *As a user, I want a detailed, step-by-step guide for each recovery phase so that I have a roadmap even when I can't think clearly.*
    - **Deliverable:** `docs/protocols/RECOVERY_LADDER.md` (Obsidian).

### Phase 2: Data Schema & State Management [COMPLETED]
- **US 2.1: System Status Persistence**
    - *As a developer, I want to store the current system state (Normal, Crisis 0/1/2) in the database so that the UI can adapt across sessions.*
    - **Task:** Added `SystemStatus` enum and updated `User` and `DailyEntry` models.
- **US 2.2: Daily Performance Tracking for Recovery**
    - *As a system, I need to calculate the daily completion percentage specifically for recovery tasks to determine if the user moves up or down the ladder.*
    - **Task:** Added `recoveryRoutine` and `recoveryScore` to `DailyEntry`.

### Phase 3: Core Functionality (The Logic) [COMPLETED]
- **US 3.1: The "SOS" Button**
    - *As a user in distress, I want a prominent "SOS" button on the dashboard to immediately activate Phase 0 (Survival Mode).*
    - **Task:** Implemented `triggerSOSAction` and `recoveryService.activateCrisisMode`.
- **US 3.2: Automated Progression/Regression Logic**
    - *As a user, I want the system to automatically move me to the next phase after 3 days of >80% success, or drop me back a phase if I fall below 80%, so I don't have to manage my own recovery.*
    - **Task:** Implemented `processRecoveryTransition` logic and `runDailySystemCheckAction`.

### Phase 4: UI/UX (Adaptive Dashboard) [COMPLETED]
- **US 4.1: Survival Dashboard (Safe Mode UI)**
    - *As a user in Crisis Mode, I want to see only 3-5 critical survival tasks and zero complex analytics, to minimize cognitive load.*
    - **Task:** Implemented `CrisisDashboard` component with phased checklists and automated evaluation.
- **US 4.2: Ghost Mode (Anti-Friction)**
    - *As a user who is avoiding the system, I want the Hub to stop sending alerts or demanding data after 24 hours of inactivity, to avoid adding to my guilt.*
    - **Task:** Integrated SOS button and conditional rendering into `HomePage`.

---

## Verification Checklist
- [x] SOS triggers defined and documented.
- [x] Prisma schema updated with system status.
- [x] Database synchronized via `prisma db push`.
- [x] Transition logic (Step up/down) implemented in `recoveryService`.
- [x] Crisis Mode UI hides non-essential components.
- [x] "SOS" button functional on the Home page.
