# PilateSafe — Monetization Strategy

## What this app actually is

PilateSafe is a **Pilates safety assistant for instructors and health-conscious teachers**. The core flow is:

1. Select a client’s health concerns and Pilates condition(s)
2. Get evidence-based contraindications, exercise guidance, and movement risk context
3. Review carefully curated Pilates programs that are safe for common conditions

The app is not a workout tracker or a general fitness coach. Its value proposition is the health-concern-aware Pilates safety knowledge base plus expert program structure.

---

## Guiding principle

Monetize the Pilates safety *knowledge and decision support*, not the client CRM or generic exercise library. Instructors should feel the paywall as a higher-value safety resource:

- “Can I safely teach this client on the Reformer with this condition?”
- “What should I avoid and how do I cue this safely?”
- “Which of the built-in Pilates programs are appropriate for this client?”

That keeps the app aligned with its actual focus: Pilates plus health concerns.

---

## Best Pro feature split for this app

| Free | Pro |
|---|---|
| Core mat-based exercise safety reference | Full apparatus support: Reformer, Cadillac, Chair, Prop-specific guidance |
| Most common/safe condition guidance | All 80+ conditions and detailed contraindication coverage |
| Top-level exercise avoid/modify lists | Full **Instructor Notes** and professional exception guidance |
| Searchable Pilates programs preview | Full access to all 6 curated **Pilates programs** and program notes |
| Basic condition “Other” input allowed | **AI-assisted guidance** for unknown or complex health concerns |
| Exercise list, categories, and library filters | Full exercise teaching cues, progressions, apparatus settings, and links |

This split makes the free tier a real evaluation tool while reserving the deeper clinical-Pilates support for paying users.

---

## What should be gated

### 1. Condition depth

- Free tier: common condition set and general contraindication output
- Pro tier: all less-common, systemic, surgical, neuro, pregnancy/postpartum, and recovery conditions
- Pro tier: highlight when a selected condition is a professional-risk or physiotherapy referral case

### 2. Apparatus-specific Pilates guidance

- Free: Mat-first exercises and broad safety cues
- Pro: Reformer, Cadillac, Chair, and props with the right modifications for health concerns
- Show locked apparatus content visually, not hidden entirely, so instructors understand the upgrade value

### 3. Instructor-level insight

- Pro-only reveal of `instructorNote` content from the condition data
- Framing: “Professional Pilates teaching notes for clients with this condition”

### 4. Programs

- Programs are a natural premium anchor because they are structured and actionable
- Keep the built-in 6 programs as a Pro feature since they are curated and aligned with Pilates health outcomes
- The Programs page is already in the app and should become a visible “premium module” rather than a hidden utility

### 5. AI fallback for “Other” concerns

- Free users can enter a custom health concern, but the actual AI-generated guidance should be a Pro unlock
- This fits the app’s health emphasis: free tier still provides basic safety, while Pro gives expert-level interpretation of ambiguous client requests

---

## Suggested free condition set

Keep the free tier grounded in the most common Pilates client presentations:

`low_back_pain`, `osteoporosis`, `pregnancy`, `postpartum`, `arthritis`, `knee_issues`, `scoliosis`, `disc_degeneration`, `shoulder_impingement`, `rotator_cuff_injury`, `hip_replacement`, `hypertension`, `obesity`, `chronic_fatigue`, `respiratory`, `vertigo_dizziness`, `balance_issues`, `plantar_fasciitis`, `weight_concerns`, `other`

All remaining conditions should show a Pro badge on the selector chip and route to the upgrade screen when tapped.

---

## Recommended launch roadmap

### Phase 1 — Safety-first monetization

1. Build the subscription/business page and premium entitlement flow
2. Add a Pro badge to locked conditions and apparatus types in the home/library selector
3. Implement soft locks for premium apparatus categories in the exercise library
4. Add a Programs entry point that clearly identifies the premium content

### Phase 2 — Deep Pilates value

5. Enable the 6 curated Programs as the flagship Pro feature
6. Unlock Instructor Notes on the Results page and condition detail screens
7. Gate AI “Other” guidance behind Pro and keep freetext entry visible for all users

### Phase 3 — Growth and retention

8. Add session presets / repeat condition sets for instructors who use the app regularly
9. Add export/share of safety summaries for clients and referring clinicians
10. Add offline sync notes or client-style bookmarks if the app is positioned as a professional Pilates tool

---

## Pricing guidance

| Plan | Price |
|---|---|
| Monthly | $9.99 / month |
| Annual | $59.99 / year |
| Lifetime | $89.99 one-time |

This is a professional Pilates tool with an offline-first safety focus, so position the lifetime option as the best value for instructors who want no recurring fees.

---

## RevenueCat setup checklist

- [ ] Create entitlement: `premium`
- [ ] Create products: `pilatesafe_monthly`, `pilatesafe_annual`, `pilatesafe_lifetime`
- [ ] Add RevenueCat keys to `src/environments/environment.ts` and `src/environments/environment.prod.ts`
- [ ] Install `@revenuecat/purchases-capacitor` and run `npm install && npx cap sync`

---

## What the Programs page should show before upgrade

- Show the 6 curated programs with name, goal, level, and key focus areas
- Include a short description and a visual cue that programs are premium
- Display a “Preview available with Pro” or “Unlock program details” CTA on each item
- Keep the page useful by letting users search/filter programs, but gate the full workout details and exercise lists

---

## Implementation notes

- Keep the paywall close to the safety workflow, not buried in settings
- The upgrade path should feel like “unlocking professional Pilates safety detail”
- Use a shared constant for the free condition set so the gating remains consistent
- Soft lock locked content with lock overlays and upgrade prompts, rather than hiding it completely
- Favor clarity: show users the exact Pilates/health content they are unlocking with Pro
