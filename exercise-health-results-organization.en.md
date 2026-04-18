# Exercise Detail and Health Concern Results Organization

## Overview
This document captures recommendations for organizing the information in the exercise result page and the health concern result page. It also includes detailed prompts to guide implementation or future iteration.

---

## Exercise Detail Page

### Current observations
- The page begins with the exercise title and a short description, which is good.
- The summary section is visible and useful.
- The notes card is prominent, but it is placed before some safety content, which can distract from high-priority risk information.
- `Meta & Details` content is mixed with actionable and safety information.
- There are multiple expandable sections, but the flow could be more linear.

### Recommended structure
1. Header: exercise name and short description
2. Summary: level, category, focus, key takeaway, safety note
3. Safety overview:
   - Instructor note
   - Contraindications
4. Notes card: instructor private notes
5. Modifications & safer alternatives
6. Instructions & details (with nested teaching cues, common mistakes, progressions)
7. Reference details (collapsed or secondary):
   - Equipment, apparatus, reps, breathing, setup, transitions, benefits, self-check, video link

### Why this helps
- Users see the most critical safety guidance first.
- Notes are still visible but do not compete with warning content.
- Metadata becomes a reference section instead of interrupting action guidance.
- A cleaner top-to-bottom flow reduces overload and improves scanning.

### Detailed prompts
- "Refactor the exercise detail page so the top of the page shows the exercise name, a short description, and a compact summary block for level, category, focus, key takeaway, and safety."
- "Create a `Safety overview` section that combines instructor note and contraindications into one clearly labeled risk block."
- "Keep the notes card visible, but place it immediately after the safety overview so it is recognized as a task after the key warnings."
- "Make `Modifications & safer alternatives` its own collapsible block immediately after the notes section."
- "Move `Meta & Details` into a lower secondary section labeled `Reference details` with collapsed content for equipment, reps, breathing, setup, transitions, benefits, and self-check."
- "Enhance warning sections like `Contraindications` and `What to avoid` with a warning border or tinted card for better scan visibility."

---

## Health Concern Results Page

### Current observations
- The results page starts well with a disclaimer and selected concerns summary.
- The `What to do first` card is useful and should remain top priority.
- Each condition card shows summary, safety, and expandable details.
- The current layout has multiple accordions and the `Your Note` section is tucked into the same card structure.
- Some sections are dense and can be hard to scan quickly.

### Recommended structure
1. Disclaimer and selected concerns summary
2. `What to do first` action card
3. Condition cards with a stronger top-to-bottom logic:
   - Condition title + trimester tag
   - `Why it matters` block (summary + dangers)
   - `Avoid / alternatives` accordion
   - Collapsible `Instructor note`
   - Always-visible `Your note` section at the bottom of each card
4. Fallback AI card shown only when there are no local condition results
5. Persistent page action at the bottom: `Check another concern`

### Why this helps
- It centers the user on immediate actions first.
- It reduces accordion depth for the most important content.
- It makes note capture easier by keeping `Your Note` visible rather than hidden.
- It maintains a consistent condition card pattern with a clear hierarchy.
- It avoids showing fallback guidance and condition results at the same time.

### Detailed prompts
- "Update the results page so the top of the screen is the disclaimer, followed by selected concerns and a `What to do first` action card."
- "Restructure each condition card so the top block explains why the condition matters, including summary and dangers, and then collapses the detailed exercise avoidance guidance."
- "Keep the `Your Note` composer visible within each condition card instead of hiding it behind an extra accordion."
- "Make the `Instructor Note` section collapsible, but leave the condition summary and safety blocks open by default."
- "If there are no local condition matches, show only the AI fallback card and hide the empty condition result layout."
- "Add a second `Check another concern` action at the top or sticky footer so users can quickly return to the checker."

---

## Suggested implementation notes
- Use clear section headers such as `Safety overview`, `Reference details`, `Why it matters`, and `Avoid / alternatives`.
- Keep important warnings visible and visually distinct with color or cards.
- Preserve the current best practices: progressive disclosure for non-critical details, consistent note capture UI, and accessible tap targets.
- Keep the result pages readable for both mobile and desktop by limiting long sections of dense text and using cards/list blocks.

---

## File naming
- Use a file name like `exercise-health-results-organization.en.md` for English-language documentation.
- Keep the file in the repository root or a docs folder for easy reference.
