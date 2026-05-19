# Free vs Pro — Conversion Improvements

Status legend: ✅ Done · 🔲 Not started

---

## #1 — Loss Aversion: Results Page Count

**Status:** ✅  
**Where:** `src/app/pages/results/` (locked condition block)  
**What:** Replace the generic "Upgrade to Pro" CTA with the exact modification count — e.g. *"Your client has 7 specific exercise modifications. You're seeing 0 of them."* Specificity converts far better than abstraction.

**Prompt:**
> Implement suggestion #1: on the results page, when a condition is locked/pro-gated, show the exact number of contraindications the user is missing (e.g. "7 specific modifications are hidden") instead of a generic upgrade message.

---

## #2 — Loss Aversion: Home Screen Locked Chip

**Status:** 🔲  
**Where:** `src/app/pages/home/` (condition chip tap → paywall modal/sheet)  
**What:** When a user taps a locked condition chip, replace the generic paywall with condition-specific copy — e.g. *"Clients with fibromyalgia walk into studios every week. See exactly what to avoid."*

**Prompt:**
> Implement suggestion #2: when the user taps a locked condition chip on the home screen, show a condition-specific paywall message that names the condition and explains what they're missing, instead of a generic "upgrade to Pro" sheet.

---

## #3 — Partial Progress Bar in Settings

**Status:** ✅  
**Where:** `src/app/pages/settings/` (settings page)  
**What:** Show *"41 of 88 conditions unlocked"* with a visual progress bar. Partial completion creates a persistent motivation loop (same mechanic as Duolingo streaks).

**Prompt:**
> Implement suggestion #3: add a "conditions unlocked" progress bar to the settings page showing how many of the 88 total conditions the user has access to (free count vs total), with copy like "41 of 88 conditions — upgrade to unlock all".

---

## #4 — Identity Framing on Clients Page

**Status:** ✅  
**Where:** `src/app/pages/clients/` (pro gate empty state)  
**What:** The pro gate currently says "Pro feature". Change to identity framing: *"How professional instructors manage clients"* — not a restriction, a professional identity signal.

**Prompt:**
> Implement suggestion #4: on the clients page pro gate / empty state, replace "Pro feature" framing with identity-based copy like "How professional Pilates instructors manage client safety" to make Pro feel like a professional identity, not a paywall.

---

## #5 — Risk / Liability Framing on Upgrade Page

**Status:** ✅  
**Where:** `src/app/pages/upgrade/upgrade.page.html` + i18n  
**What:** Add a liability reframe line: *"One injury from a client whose condition you weren't briefed on costs more than a decade of Pro."* Reframes $49/year as professional insurance, not a subscription fee.

**Prompt:**
> Implement suggestion #5: add a liability/risk reframe line to the upgrade page (below the current pro-hero section) that positions Pro as professional insurance — e.g. "One missed contraindication can cost more than a decade of Pro." Add the i18n key to all 9 language files.

---

## #6 — Peer Norming on Upgrade Page

**Status:** ✅ (professional tagline added as UPGRADE.PROFESSIONAL_TAGLINE)  
**Where:** `src/app/pages/upgrade/upgrade.page.html`  
**What:** *"Used by Pilates instructors before every client session"* — already live.

---

## #7 — Micro-Commitment: Save to Client Profile CTA

**Status:** 🔲  
**Where:** `src/app/pages/results/` (bottom of results page, free users only)  
**What:** After a free results check, surface a soft *"Save this to a client profile?"* button. Tapping it opens the upgrade page — but the user has already committed to the action. Commitment at point of intent converts better than commitment at point of pricing.

**Prompt:**
> Implement suggestion #7: on the results page for free users, add a soft "Save to client profile?" CTA button at the bottom. Tapping it opens the upgrade page (since clients is a Pro feature). Only show it when the user has selected at least one condition and is not yet Pro.

---

## #8 — Anchoring: Per-Week Price on Upgrade Page

**Status:** 🔲  
**Where:** `src/app/pages/upgrade/upgrade.page.html` + i18n  
**What:** Show the math visually: *"$49/year = less than $1/week"*. Trivializing cost with a per-week figure is a classic price anchor. Reinforces the existing "less than one cancelled session" line.

**Prompt:**
> Implement suggestion #8: on the upgrade page, below the annual plan price, add a per-week cost breakdown line (e.g. "That's less than $1 per week") as a price anchor. Add the i18n key to all 9 language files.

---

## #9 — Default Bias: Annual Plan Pre-Selected

**Status:** 🔲  
**Where:** `src/app/pages/upgrade/upgrade.page.html` + SCSS  
**What:** The annual plan should be visually pre-selected (highlighted card, checkmark, "Best Value" badge) by default — not equal weight to monthly. Users take the default; equal presentation leaves money on the table.

**Prompt:**
> Implement suggestion #9: on the upgrade page, make the annual plan the visually pre-selected default — highlighted card with a "Best Value" badge and checkmark, larger visual weight than monthly. The annual option should look selected on page load.

---

## #10 — Expand Free Tier Conditions

**Status:** ✅ (38 free conditions, up from ~28)

---

## Priority Order (suggested)

1. **#9** — Annual plan default (layout only, highest revenue impact)
2. **#1** — Loss aversion count on results (strong conversion signal)
3. **#8** — Per-week anchor (2-line copy change)
4. **#3** — Progress bar in settings (persistent motivation loop)
5. **#7** — Micro-commitment save CTA
6. **#2** — Condition-specific locked chip message
7. **#4** — Identity framing on clients gate
8. **#5** — Liability framing line
