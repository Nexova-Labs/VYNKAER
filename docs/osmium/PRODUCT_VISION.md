# OSMIUM — Product vision

> **OSMIUM — Private Human Performance Intelligence.**
> *A trainer that evolves with you.*

## 1. What OSMIUM is

OSMIUM is a personal training companion. It builds each session from the athlete's own logged history, preferences, limitations, recovery context and goals. It explains each decision in plain language, and it changes the plan only when the athlete approves.

It is **not** a generic AI workout generator. The defining property is *continuity*. Session 40 is a consequence of sessions 1–39, and the athlete can see why.

This proposition already runs in the VYNKÆR codebase as the loop *history → generate → train → log → progress → next workout* (see [CODEBASE_AUDIT.md §3](CODEBASE_AUDIT.md#3-training-engine)). OSMIUM keeps that loop and changes how it is presented, personalised and eventually synchronised.

## 2. Brand character

- **Aesthetic reference:** a private performance system that could have come from a fictional advanced research division. Think precision instrumentation, industrial product design and quiet luxury. *This is a mood reference only.* No Batman, DC or Wayne Enterprises names, logos or assets may appear in the product, the code or marketing.
- **Personality (from v2):** discreet, engineered, disciplined, perceptive, calm, credible, humane.
- **Anti-patterns (from v2):** generic AI visual clichés, bodybuilding aggression, unexplained readiness percentages, decorative dashboard overload, neon, gamification clutter.

## 3. The four destinations

v2 allows **at most four primary destinations, with persistent access to the coach**. Today the app has five tabs (Home, Train, Progress, Coach, Profile). The target is:

| Destination | Purpose | Built from (today) | Primary action |
|---|---|---|---|
| **Today** (Coach) | Daily command centre. Today's recommendation, why it fits, recent context, readiness check-in, conversation, reviewable proposals | `home.tsx` + `coach.tsx` | Start session |
| **Training** | Fast, offline set logging. Load/rep adjust, rest timer, instructions, substitutions, progress, effort and limitation feedback, resume after interruption | `train.tsx`, `src/features/workout/*`, `workout/complete.tsx` | Log set |
| **Progress** | Trustworthy view of actual performance. Strength trends, volume, adherence, per-exercise history, milestones, long-term trends, explanations grounded in logs | `progress.tsx`, `exercise/[id].tsx` | Open an exercise |
| **Recovery** | Self-reported fatigue, energy, soreness, sleep, pain/limitations. Conservative suggestions. No diagnosis, no invented scores | *new*; limitations UI currently lives in `profile.tsx` | Check in |

Profile and settings move out of the tab bar to a header entry point. The options are in [TARGET_ARCHITECTURE.md §3](TARGET_ARCHITECTURE.md#3-navigation).

## 4. Trust rules

These rules are product requirements. Each one maps to a mechanism that exists today or is planned:

1. **No silent changes.** Every consequential adaptation is a visible proposal that is applied only on explicit approval. *Exists:* `WorkoutAdaptation` + APPLY CHANGE in `coach.tsx` → `applyStructuralAdaptation`.
2. **Deterministic policy, interpretive AI.** The engine decides loads, progression and safety. An LLM may interpret, explain and propose, but never decide. *Exists:* the `src/engine` split and the `CoachProvider` interface.
3. **Every recommendation is explained.** *Exists:* `generationExplanation[]`, `recommendationReason`, and `ProgressionDecision.reason`.
4. **No fabricated data.** Show "insufficient data" instead of a number with no method behind it. No readiness score unless its inputs and formula exist and are shown. *Partly exists:* PR badges come from real history. Recovery is new and must follow this rule from the first commit.
5. **History is append-only from the athlete's point of view.** Logged facts are never silently overwritten. *At risk today:* see the storage fallback bug in [CODEBASE_AUDIT.md §5](CODEBASE_AUDIT.md#5-verified-defects).
6. **Not a medical device.** Pain and limitations constrain training. They are never diagnosed. *Exists:* the coach copy and the safety engine's framing.
7. **Demo data is labelled as demo data.** *Exists:* "Athlete 001" seed plus the Reset demo data control. It must stay visibly labelled after the rebrand.

## 5. Who it is for (initial)

A single, self-directed adult who trains in a gym or at home. They want a coach's continuity without a human coach's cost, and they value being told *why*. Multi-athlete coaching, teams and clinicians are out of scope until after the public launch.

## 6. Commercial shape (planned, not decided)

The plan is native iOS/Android subscription distribution with web where it helps. This needs subscription-ready accounts and entitlements (Phase 4). Pricing, tiers, the trial model and the payments provider are **undecided** and deliberately not designed in Phase 0.

## 7. Out of scope until after launch

Wearable integrations, social features, the marketplace, clinician features, and any medical claim.
