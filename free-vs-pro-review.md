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

**Status:** ✅
**Where:** `src/app/pages/home/home.page.ts` and `src/assets/i18n/`
**What:** A free user tapping a locked condition chip sees a localized alert that names the condition and explains that Pro unlocks detailed precautions, exercises to avoid or modify, and safer alternatives. The alert offers "Not now" and "Explore Pro"; the locked condition is not added to the user's selection.

**Implemented:** Added the condition-specific alert in all nine supported locales. Selecting a free condition and selecting any condition as a Pro user continue to work as before.

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

**Status:** ✅
**Where:** `src/app/pages/results/results.page.html` and `src/assets/i18n/`
**What:** Free users with at least one condition result see a soft "Save to client profile?" outline button at the bottom of Results. Tapping it opens the Pro upgrade page.

**Implemented:** The CTA is hidden when there are no results or the user has Pro access, and the label is localized in all nine supported locales.

---

## #8 — Anchoring: Per-Week Price on Upgrade Page

**Status:** ✅
**Where:** `src/app/pages/upgrade/upgrade.page.html` + i18n  
**What:** Optionally show the weekly equivalent derived from the annual price already configured in the store. This is copy only; it must not change the product, billing period, or price.

**Implemented:** Shows RevenueCat's localized weekly recurrence price when the annual product provides it; the line is hidden otherwise. No price points or store products were changed.

---

## #9 — Default Bias: Annual Plan Pre-Selected

**Status:** ✅
**Where:** `src/app/pages/upgrade/upgrade.page.html` + SCSS  
**What:** The annual plan should be visually pre-selected (highlighted card, checkmark, "Best Value" badge) by default — not equal weight to monthly. Users take the default; equal presentation leaves money on the table.

**Implemented:** The annual option is visually highlighted on initial load with a primary border, tinted background, Best Value badge, and checkmark. This is a visual default only; prices and products are unchanged.

---

## #10 — Expand Free Tier Conditions

**Status:** ✅ (38 free conditions, up from ~28)

---

## #11 — Library: Locked Exercise Detail Page Copy

**Status:** ✅
**Where:** `src/app/pages/exercise-detail/exercise-detail.page.html` (`#premiumExerciseLocked` template) and `src/assets/i18n/`
**What:** The locked detail screen names the exercise, shows its category and exact modification count, and specifies that Pro unlocks instructor notes and the full safety profile.

**Implemented:** Added `PRO_LOCKED_TITLE` and `PRO_LOCKED_DESC` in all nine locales. The count is taken from the exercise's modification data, and Library taps now open this gated preview instead of sending free users directly to the upgrade page.

---

## #12 — Library: Free/Pro Ratio Indicator

**Status:** ✅
**Where:** `src/app/pages/library/library.page.html` (below the category chips)  
**What:** Free users browsing a specific category see the number of available exercises out of the current filtered total when at least one result is Pro-gated. The inline upgrade link follows the active search and category filters.

**Implemented:** Added `freeFilteredCount` and `totalFilteredCount` getters and the `FREE_COUNT_NOTE` translation to all nine locales. The note is hidden for Pro users, "All", and filtered categories with no locked exercises.

---

## #13 — Library: Locked Card Visual Weight

**Status:** ✅  
**Where:** `src/app/pages/library/library.page.scss`  
**What:** Currently the only signal that a card is locked is a small corner `PRO` flag — free and locked cards look nearly identical. Locked cards should have clearly reduced visual weight (muted opacity, desaturated background, or a lock icon overlay) so free cards read as "yours" and locked cards read as "available if you upgrade." The contrast also makes the free tier feel curated rather than arbitrarily cut off.

**Prompt:**
> Implement library suggestion #13: increase the visual distinction between free and locked exercise cards. The `.exercise-card--locked` class should make cards appear visually muted — reduced opacity and/or a slight desaturation filter — so free cards stand out as the user's current accessible content. The PRO badge should remain. No HTML changes needed; pure SCSS on the existing `.exercise-card--locked` selector.

---

## Priority Order (suggested)

1. **#1** — Loss aversion count on results (strong conversion signal)
2. **#13** — Library locked card visual weight (pure SCSS)
3. **#3** — Progress bar in settings (persistent motivation loop)
4. **#4** — Identity framing on clients gate
5. **#5** — Liability framing line

---

## Tier Structure Recommendations

### Pricing Guardrail

**Do not change pricing.** Preserve the existing App Store / Google Play products, price points, billing periods, and RevenueCat configuration. Any price text or optional weekly equivalent must reflect the price returned by the store; fallback values and old strategy notes are not authoritative.

### Current Product Split

- **Conditions:** 38 of 88 are free. The general condition summary and danger context are visible to all users; detailed contraindications for Pro conditions and instructor notes are gated.
- **Exercises:** 44 of 93 are currently classified as Pro through apparatus-related text matching. The other 49 are ungated by this rule.
- **Built-in programs:** 2 of 32 are Free and 30 are Pro.
- **Flow workflow:** creating, saving, and running a custom flow, including Watch controls, is not currently gated.
- **Client profiles:** gated to Pro.

### Recommended Free Tier

Keep Free useful for evaluating a real instructor workflow:

- Keep high-level condition summaries and danger context visible for every condition.
- Keep detailed guidance for the current 38 free conditions and ungated exercise guidance available.
- Keep custom flow creation, saving, and running available; do not make Watch support a Pro requirement.
- Expand the built-in Free sample from 2 to roughly 6–8 representative programs, including at least one general-purpose template.

### Recommended Pro Tier

Position Pro as more complete safety depth and instructor workflow:

- Detailed contraindications and instructor notes across all 88 conditions.
- Apparatus-specific exercise access and guidance.
- The remaining curated program library and program notes.
- Client profiles and related client-management tools.

### Product and Trust Follow-Ups

- Keep essential safety context available to everyone; the paywall should gate depth, not conceal the basic risk summary.
- Replace the exercise apparatus keyword heuristic with explicit access metadata as the catalog grows; substring matching can misclassify content.
- Update the upgrade page's “60+ health conditions” claim to match the current 88-condition catalog.
- Do not advertise AI-assisted guidance until that capability exists in the product.
- Review the liability-framing claim and prefer substantiated descriptions of Pro's actual features.
- Before changing any tier boundaries, measure which locked-content views lead to upgrades and whether users retain after the free sample is expanded.
