# PilateSafe — Monetization Strategy

## What this app actually is

A **safety reference tool**: an instructor selects health conditions, the app returns which exercises to avoid and why. That is the entire core loop. The value is the knowledge base — 82 conditions, 93 exercises, 194 contraindication entries, with AI fallback for freetext. Everything else is secondary.

---

## Guiding principle

Gate access to the **knowledge base itself** — not CRM or client-management features. The previous strategy (client profiles as the paywall anchor) was wrong for this app's identity. Instructors open PilateSafe to look up a condition before a session. The paywall must sit on that lookup path.

---

## Free vs Pro split

| Free | Pro |
|---|---|
| Mat exercises (46) | + Reformer, Cadillac, Chair, Props (47) |
| ~20 most common conditions | All 82 conditions |
| Basic contraindication output | + full **Instructor Notes** per condition |
| — | All 6 curated **Programs** (data already complete) |
| — | **AI guidance** for "Other" freetext concerns |
| — | Full exercise detail: teaching cues, progressions, apparatus settings, video links |

### Why this split works

- **Mat / Apparatus divide** is a real professional signal. Studio instructors who own Reformers and Cadillacs are the higher-value segment and the most natural upgrade candidates.
- **Instructor Notes** are already present in `safety-conditions.json` (`instructorNote` field) — they just aren't surfaced in the UI yet. Revealing them behind a paywall is a zero-data-work gate.
- **Programs data is complete** (6 fully populated programs) but the page is an empty stub — the lowest implementation effort of any premium feature.
- The **free tier is genuinely useful** (mat + common conditions covers most class scenarios), so it functions as a real trial, not crippleware.

---

## Suggested free condition set (~20 most common)

`low_back_pain`, `osteoporosis`, `pregnancy`, `postpartum`, `arthritis`, `knee_issues`, `scoliosis`, `disc_degeneration`, `shoulder_impingement`, `rotator_cuff`, `hip_replacement`, `hypertension`, `obesity`, `anxiety_depression`, `chronic_fatigue`, `wrist_hand_injuries`, `hamstring_strain`, `plantar_fasciitis`, `balance_vestibular`, `other`

All remaining conditions show a Pro badge on the chip; tapping them routes to the upgrade page.

---

## Build order (lowest effort → highest impact first)

### Phase 1 — Foundation
1. **Upgrade page** — paywall screen with RevenueCat offerings (monthly / annual / lifetime)
2. **Upgrade banner** — persistent bottom-of-page strip on Home, Library, Settings (already stubbed)
3. **PurchaseService** — RevenueCat SDK wrapper, `isPremium$` observable
4. **Gate apparatus categories** in the Library — Reformer / Cadillac / Chair chips show a lock; tapping opens upgrade
5. **Gate conditions beyond the free set** — Pro badge on chip, paywall on tap

### Phase 2 — Pro features
6. **Programs page** — data already complete; just needs a UI listing the 6 programs with their exercise sets
7. **Reveal Instructor Notes** on the Results page — already in the data, not yet shown in the template
8. **Gate AI "Other" guidance** — freetext path is free-tier entry; AI response is the pro reveal

### Phase 3 — Growth
9. **Saved searches / condition presets** — instructors who teach the same clients repeatedly
10. **Export** — share a safety summary PDF or text for a client's physiotherapist

---

## Pricing guidance

| Plan | Price |
|---|---|
| Monthly | $9.99 / month |
| Annual | $59.99 / year (save 50%) |
| Lifetime | $89.99 one-time |

Professional tools for instructors sustain higher price points than consumer fitness apps. Many instructors will prefer lifetime given the offline-first, no-subscription feel of the app.

---

## RevenueCat setup checklist

- [ ] Create entitlement: `premium`
- [ ] Create products: `pilatesafe_monthly`, `pilatesafe_annual`, `pilatesafe_lifetime`
- [ ] Replace `YOUR_REVENUECAT_API_KEY` in `src/environments/environment.ts` and `environment.prod.ts`
- [ ] Add `@revenuecat/purchases-capacitor` to `package.json` and run `npm install && npx cap sync`

---

## Implementation notes

- All new gated pages/components should use the `inject(PurchaseService)` pattern with `isPremium$` as a reactive observable
- The free condition set should be a named constant in a shared location (e.g. `src/app/services/purchase.service.ts`) so the gate is maintained in one place
- Apparatus gating in the Library should be soft (show content with a lock overlay) not hard (hide entirely) — instructors need to see what they're missing
