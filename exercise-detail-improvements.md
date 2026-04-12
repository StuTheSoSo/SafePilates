# Exercise Detail Improvements

## Purpose
This file documents suggested improvements to the exercise detail pages and provides clear prompt wording for expanding the content. It is intended as a guide for refining the exercise library with stronger Pilates coaching cues, richer safety guidance, and more actionable step sequences.

## Current status
- Every exercise in `src/assets/data/exercises.json` now has an `instructions` array.
- The detail page displays:
  - setup
  - breathing
  - numbered instructions
  - common mistakes
  - modifications
  - progressions
  - key takeaway and safety notes
- The app view supports nested substeps, and the remaining equipment-specific setup wording has been polished for the final Reformer and Prop entries.

## Improvement Areas

### 1. Strengthen Pilates-specific alignment cues
**Why:** Many generated instruction steps are functional, but they lack the detailed postural cues Pilates practitioners rely on.

**What to add:**
- pelvis position (neutral, tucked, lifted)
- rib cage closure and breath support
- spine articulation and head/neck alignment
- shoulder blade stability and scapular placement
- a clear “powerhouse” engagement cue for every movement
- weight distribution and contact points for mat and apparatus work

**Implementation:**
- revise each instruction step to name the exact body segment position rather than only describing the movement
- include a coaching cue for the start of the step and a correction cue for the main action
- describe how to maintain the powerhouse through each transition
- add a brief cue for where to feel the work (e.g. lower abdominals, inner thighs, posterior shoulder)

**Prompt:**
> Rewrite these exercise instructions with explicit Pilates alignment cues. For each numbered step, include the exact desired position of the pelvis, ribs, spine, neck, shoulders, and contact points. Emphasize core support through the powerhouse, describe the feeling of the work, and use language appropriate for an experienced Pilates instructor.

**Example:**
- "Start supine with the pelvis neutral, ribs softened, head resting lightly, and arms long by the sides."
- "Exhale to articulate the spine away from the mat, keeping the pelvis anchored and the shoulders broad."
- "Keep the neck long and the chin slightly tucked as you maintain abdominal support."

**Status:** Section 1 has been updated with concrete implementation guidance and a coach-style wording template to help convert generic instructions into Pilates-specific cues.

### 2. Expand tempo and transition guidance
**Why:** Pilates is driven by controlled timing and articulated transitions. The current instructions often stop at the basic movement.

**What to add:**
- inhale/exhale timing for each phase
- recommended tempo or count
- where to pause or hold briefly
- how to transition safely between positions
- whether the action is an initiation, a stabilization, or a return

**Implementation:**
- add a breathing cue to every step, not only the first or last
- identify the tempo for each movement phase (e.g. "exhale over 3 counts", "hold 1 breath", "inhale to return")
- describe safe transitions between positions, especially for spinal articulation and apparatus changes
- include one brief cue for what to do if the timing feels too fast or too shaky

**Prompt:**
> Add tempo and transition cues to these exercise steps. Specify exactly when to inhale and exhale, where to pause briefly, and how to move smoothly between phases. Include count-based timing and a short note for safe pacing if the movement feels too fast.

**Example:**
- "Inhale to prepare and feel the ribs expand; exhale over 3 counts as you peel the spine up."
- "Hold for one breath at the top with the pelvis stable, then inhale to articulate down one vertebra at a time."
- "Transition slowly into the next movement by keeping the abdominal support and maintaining even breath."

**Status:** Section 2 has been expanded with clear tempo, count, and transition guidance to support a second content pass.

### 3. Use nested substeps for options and progressions
**Why:** Some exercises have meaningful optional variations or modifications that should be shown as substeps rather than separate generic items.

**What to add:**
- lettered substeps for alternate hand/foot placements
- optional prep or regression choices
- conditional cues like “if hamstrings are tight, do A; otherwise do B”
- clear separation between the main execution sequence and optional variations

**Implementation:**
- convert the primary movement into a numbered main sequence
- append lettered substeps only where an alternate setup, regression, or progression is directly relevant to that step
- keep nested substeps short and specific so they feel like real coaching options
- avoid turning every modification list into a substep; only use substeps for essential in-line choices

**Prompt:**
> Convert the instructions into a primary numbered sequence with lettered substeps for optional variations. Include at least one regression and one progression option for each exercise where appropriate, and keep the nested choices concise.

**Example:**
1. Sit tall with the legs extended and the spine long.
   a. If tight in the hamstrings, bend the knees slightly and keep the shins parallel.
   b. For more challenge, reach the arms further forward while keeping the ribs closed.
2. Exhale to rotate the torso while keeping the sit bones grounded.

**Status:** Section 3 now includes a practical implementation strategy for nested substeps, and the data has been updated with nested regression/progression substeps for relevant exercises.

### 4. Add equipment-specific setup detail
**Why:** Reformer, Cadillac, Chair, and Props exercises require very specific setup instructions that are currently generalized.

**What to add:**
- exact spring tension or strap placement where known
- hand, foot, and body placement on apparatus
- points of contact and support
- how to check the equipment setup before starting
- any recommended adjustments for comfort and stability

**Implementation:**
- make the first step a clear, equipment-specific setup cue rather than a generic body position
- name the springs, straps, or props and describe how they should feel
- include contact points, such as where the hands, feet, sacrum, or shoulders should press
- add a simple stability check before movement begins, e.g. "confirm the carriage is stable" or "feel the pelvic support before lifting"
- flag common setup errors for each apparatus type, such as incorrect foot placement or uneven spring tension

**Prompt:**
> Rewrite the setup and first instruction steps for equipment-based exercises with detailed apparatus setup notes. Mention spring selection, strap placement, hand/foot position, and how to confirm stable contact before moving. Include one brief setup check and one common setup correction cue.

**Example:**
- "Lie supine on the Reformer with the heels on the footbar, spring tension medium, and the spine long. Press evenly through both feet and check that the carriage is stable before you begin."
- "Sit on the Chair with both sit bones grounded, hands on the handles, and the pedal springs set light. Feel the weight through the heels and keep the shoulders down."

**Status:** Section 4 now includes concrete apparatus setup guidance in the exercise data for Reformer, Cadillac, Chair, and Props exercises.

### 5. Add a purpose/key takeaway line per exercise
**Why:** Some users benefit from a short “why we do this” line in addition to focus and benefits.

**What to add:**
- what the exercise is teaching
- the most important quality to feel
- one key objective to aim for in the movement
- a short coaching cue for the primary movement intention

**Implementation:**
- add a single sentence labeled `Key takeaway` to each exercise record
- keep it concise, specific, and aligned with the exercise focus
- use language like “This exercise teaches…” or “Focus on feeling…”
- make it practitioner-friendly, not generic marketing copy

**Prompt:**
> For each exercise, add a short “Key takeaway” line that summarizes the main aim of the movement and what the user should focus on feeling. Use precise Pilates coaching language and include the key quality the exercise develops.

**Example:**
- "Key takeaway: Maintain pelvic stability and long spinal articulation while moving the legs overhead."
- "Key takeaway: Use breath-driven shoulder openness and core support to lift the chest safely."

**Status:** Section 5 now includes concrete guidance for adding an exercise-level takeaway line to the detail page.

### 6. Add brief safety or caution notes per exercise
**Why:** The app already has contraindications, but the exercise detail page can reinforce safe practice directly in the instruction flow.

**What to add:**
- one caution per exercise for common risk areas
- a reminder to stop if pain or breath-holding occurs
- a safe alternative if applicable

**Prompt:**
> Add a concise safety reminder for each exercise, especially when the movement involves the spine, neck, shoulders, or inversion. Use language like “If you feel X, choose the regression” or “Avoid this common risky pattern.”

**Status:** Section 6 is now implemented in the UI and exercise data with `safetyNote` values for all exercises.

### 7. Standardize step length and structure
**Why:** Consistent instructional structure improves usability and makes the page feel more polished.

**What to add:**
- 5 to 7 steps per exercise when possible
- start with setup, then movement initiation, main action, control cue, and reset/return
- avoid repeating the same introductory phrase across steps

**Prompt:**
> Standardize each instruction list into 5–7 steps. Use the pattern: setup, preparation, action, stabilization, and return. Keep the wording varied and precise.

## Recommended next action
1. Create a small content revision pass for the most technical exercises first:
   - `roll_up`
   - `roll_over`
   - `teaser`
   - `short_box_series`
   - `balance_point`
   - `pulling_straps`
   - `backstroke`
2. Then expand the same approach to the Mat classics and Props work.

## Notes for the author
- Keep a master Pilates tone: professional, precise, encouraging.
- Avoid vague fitness language like “move your body” or “feel the burn.”
- Where possible, include one brief correction cue per step.
- Use the existing `instructions` schema and add nested arrays for optional substeps only when needed.
