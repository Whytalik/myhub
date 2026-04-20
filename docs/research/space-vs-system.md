# Research: Space vs. System in Digital Workspaces

Date: 2026-04-21
Context: Decision to rename "Systems" back to "Spaces" and define the role of "System" as a conceptual layer.

## 1. Definitions

### The System (The "Engine" & Logic)
A **System** refers to the underlying logic, methodology, and interconnected architecture. It answers the question: **"How does this work?"**
- **Focus:** Mechanics, automation, rules, and data flow.
- **Components:** Database schemas, workflow rules (e.g., GTD, PARA, SRS), formulas, and integrations.
- **Analogy:** The plumbing and electrical wiring of a house. Essential but often hidden.

### The Space (The "Environment" & Dashboard)
A **Space** (or Area/Dashboard) is the functional environment where a user performs specific types of work. It answers the question: **"What do I need to see/do right now?"**
- **Focus:** Context, user experience, and focus.
- **Components:** UI layouts, filtered views, action buttons, and visual widgets.
- **Analogy:** A specific room in a house (e.g., the Kitchen for cooking, the Office for working).

## 2. Best Practices in "Life OS" Frameworks

Leading productivity architects (August Bradley, Tiago Forte) suggest a clear separation:
- Users "enter" a **Space** to work in a specific context (e.g., "Health Space", "Project Space").
- The **System** behind that space ensures that the data is consistent (e.g., "Health System" defines how calories are calculated or how workouts relate to recovery).

## 3. Decision for MyHub

### Phase 1: Reverting UI Terminology
Rename global UI elements back to **Space** to emphasize the environment:
- "Life System" -> "Life Space"
- "Food System" -> "Food Space"
- "Enter System" -> "Enter Space"
- Breadcrumbs: `life system > tasks` -> `life space > tasks`

### Phase 2: Introducing the "System" Layer
For each Space, add a dedicated "System" or "Mechanics" section/tab. This section will contain:
- **Rules:** The "why" and "how" of the specific area.
- **Structure:** Explanation of data models (e.g., how the SRS logic works in Languages).
- **Guidelines:** Subjective anchors or scaling rules (e.g., what "High Priority" means for this specific space).

## 4. Conclusion
Renaming to **Space** makes the interface more intuitive for daily use ("I am in my Life Space"), while keeping **System** as a structural term allows for detailed documentation and rule-setting within each area.
