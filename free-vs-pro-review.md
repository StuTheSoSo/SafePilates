# Free vs. Pro Review — May 2026

## Current Split

| Dimension | Free | Pro |
|---|---|---|
| Conditions | 27 of 82 (33%) | 55 of 82 (67%) |
| Exercises | 49 of 93 — Mat + Warm-up | 44 of 93 — Reformer, Cadillac, Chair, Props |
| Results depth | Avoid/modify lists | + Instructor Notes |
| Programs | Browse only | Full exercise sequences |
| AI ("Other") | Prompt visible | Actual guidance |

---

## Core Problem: Hard-Locking at Input

Right now, selecting a premium condition immediately triggers an upgrade prompt — **before the user sees any value**. This is the single biggest conversion killer. A Pilates instructor who searches "fibromyalgia" for a client and immediately gets a paywall has no reason to buy — they haven't experienced the app's value yet.

**The fix:** let them reach the results page, then gate the depth. Show them what Pro unlocks *in context*, not as an interruption.

---

## Specific Suggestions

**1. Move the gate from selection → results depth**
Instead of blocking condition selection, allow any condition to be added to the query. On the results page, show the Avoid list freely, but blur/lock the Modify details and Instructor Note. The user sees "This condition has 9 specific modifications — Pro required to view." This is a much stronger purchase trigger because the user already invested time and now sees concrete value behind the gate.

**2. Instructor Notes lock is the best feature — surface it harder**
The locked Instructor Notes card on the results page is excellent positioning (*Pro = professional*). But a generic "Upgrade to Pro" card wastes the moment. Show a blurred preview of the first line of the instructor note so they can see *there's something there*. Curiosity converts better than abstraction.

**3. Add a free trial**
At $9.99/month with no trial, users must make a blind purchase. A **7-day free trial** on the annual plan is standard and dramatically increases paid conversions. RevenueCat supports this natively — it's just an App Store Connect / Play Console configuration change, zero code changes needed.

**4. Programs need more substance to be a Pro anchor**
6 programs is a thin flagship. If program pages are rich (per-exercise cues, progression notes, apparatus settings), this works. If they're just a list of exercise names, it won't feel worth $49. Consider adding a visible "preview" exercise to each program so free users can taste the quality.

**5. Add a "Client Profile" as a Pro sticky feature**
The target user is a professional instructor. The highest-retention Pro feature to build: **save a client's conditions** and tap their name before class to instantly get their safety summary. This makes Pro essential for daily professional use, not just an occasional reference upgrade. Nothing in the current codebase does this.

**6. Free tier is slightly too narrow at 27/82 conditions**
Conditions like fibromyalgia, anxiety/depression, cancer recovery, and MS/neurological are increasingly common in Pilates studios. If an instructor encounters these clients and the app immediately says "Pro required," they question whether the app is useful at all. Add ~8–10 more common clinical conditions to free — the goal is that free users can cover ~80% of their typical daily client mix without hitting a wall.

**7. Pricing framing**
The "Save 58%" annual badge is good. But the upgrade page should lead with professional framing: *"Used by Pilates instructors before every client session"* — not just a feature list. Professionals justify $49/year as a business expense; consumers do not.

---

## Priority Order

1. **Free trial** — biggest immediate conversion lift, zero code
2. **Move gate to results depth** — removes the most frustrating UX friction
3. **Blur/preview Instructor Notes** — converts at the moment of highest intent
4. **Expand free conditions by ~8–10** — reduces early churn
5. **Client profiles** — long-term retention and differentiation
