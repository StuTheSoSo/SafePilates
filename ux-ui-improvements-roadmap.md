# Master UX/UI Improvements Roadmap for SafePilates

## [COMPLETED] 1. Progressive Disclosure for All Dense Sections
- **Goal:** Prevent overwhelm by showing only the most essential info by default.
- **Actions:**
  - Convert all secondary info (instructions, meta, progressions, legal, etc.) into collapsible accordions.
  - Only the most essential summary and safety info is expanded by default.
- **Prompt:**
  - "Refactor the [page/component] so that only the summary and safety sections are expanded by default. Move all other sections (instructions, meta, etc.) into collapsible accordions with clear headers."

## [COMPLETED] 2. Section Headers and Dividers
- **Goal:** Improve scan-ability and organization.
- **Actions:**
  - Add clear, consistent section headers for every major block (e.g., “Summary”, “Safety”, “Instructions”, “Instructor Note”, “Meta”, “Legal”).
  - Use subtle dividers or background shading to visually separate sections.
- **Prompt:**
  - "Add visually distinct section headers and subtle dividers between all major blocks on the [page/component]. Use the global typography system for headers."
- **Implementation:**
  - All major blocks on the results page now have visually distinct section headers using the global typography system.
  - Subtle dividers and background shading visually separate each section for improved scan-ability and organization.
  - See results.page.html and results.page.scss for implementation details.

## [COMPLETED] 3. Prominent, Persistent Notes
- **Goal:** Make user notes easy to find and use.
- **Actions:**
  - Move user notes to a more prominent position, right after the summary/safety block.
  - Add a “Notes” icon and tooltip for clarity.
- **Prompt:**
  - "Move the user notes card to immediately follow the summary/safety section. Add a notes icon and a tooltip explaining the purpose of notes."
- **Implementation:**
  - The user notes card is now immediately after the summary/safety section on the exercise detail page.
  - A notes icon and tooltip clarify the purpose of notes, making them easy to find and use.
  - See exercise-detail.page.html and exercise-detail.page.scss for implementation details.

## 4. Contextual Tooltips
- **Goal:** Help users understand key terms without clutter.
- **Actions:**
  - Add info icons with tooltips for terms like “Contraindications”, “Key takeaway”, “Progressions”, “Theme”, and “Legal”.
- **Prompt:**
  - "Add an info icon with a tooltip next to each key term (e.g., 'Contraindications', 'Key takeaway', etc.) explaining its meaning."

## 5. Accordion Animation
- **Goal:** Make UI feel smooth and modern.
- **Actions:**
  - Add smooth open/close transitions for all collapsible sections.
- **Prompt:**
  - "Add a smooth open/close animation to all accordion/collapsible sections for a modern feel."

## 6. Accessibility & Touch
- **Goal:** Ensure the app is usable by everyone.
- **Actions:**
  - Ensure all accordions, chips, and buttons have proper `aria-labels` and large tap targets.
- **Prompt:**
  - "Audit all interactive elements for accessibility: add descriptive aria-labels and ensure all tap targets are at least 44px."

---

**How to use:**
- Use the prompts above to request or implement each improvement in any page or component.
- Apply these patterns everywhere for a consistent, user-friendly, and professional experience.
