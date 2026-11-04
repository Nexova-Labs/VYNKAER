# Product

> **Superseded by [osmium/PRODUCT_VISION.md](osmium/PRODUCT_VISION.md)** (OSMIUM positioning, four destinations, trust rules). Kept as the record of the V1 product definition; the philosophy and no-medical-claims rules here still apply.

## Platform

adaptive

## Positioning

VYNKÆR Training is not another AI workout generator. Generic tools answer "what workout should I do today?" — a question that resets to zero every time. VYNKÆR answers a harder, more useful question: **what should this athlete do next, given everything they have already done?**

Continuity is the product. Every set logged becomes context for the next session's modality, load, exercise selection, and conditioning volume.

## Philosophy

Discipline over motivation. Consistency over hype. Progression over randomness. Strength with control. Training as a long-term process. Data supporting the athlete, not distracting them.

Concretely, this means V1 deliberately avoids:

- Badges, streak confetti, or gamified point systems.
- Neon gradients or "AI fitness" cartoon imagery.
- Copy like "Crush your goals!!" or "Beast mode" — see the tone examples below.
- An AI layer that decides progression. The Coach interprets and proposes; the deterministic engine decides, and never silently.

## Voice

Restrained, calm, declarative. Preferred: *"Next session."* · *"Progress when earned."* · *"Maintain load."* · *"Ready to progress."* · *"Session logged."* · *"The next session starts here."* · *"Built from your previous work."*

Avoided: exclamation points, hype adjectives, celebratory emoji, "AI-powered" as a selling point.

## The five destinations

- **Home** (now **Today**) — decisive. One generated session, one primary action (Start Workout), one explanation of why. Not a dashboard to browse.
- **Train** — the highest-priority screen. Logging a set should take as few taps as possible; a rest timer and per-exercise progression reasoning are always visible, never buried in a menu.
- **Progress** — performance, not noise. Trends, volume, adherence, and the push-up milestone, all reading from real logged history rather than a decorative chart.
- **Coach** — adaptive, but never silent. Every proposed change is a structured, visible proposal (`WorkoutAdaptation`) that requires an explicit **APPLY CHANGE** tap. Nothing changes a workout behind the athlete's back — including the production Claude-backed version this is designed to swap in for later.
- **Profile** — the long-term rules behind the workouts: goal, rotation, preferences, conditioning emphasis, and limitations. Editing here is what should feel like steering the system, not filling out a settings form.

## What V1 explicitly does not do

- No accounts, no login, no cloud dependency — Athlete 001 is seeded on first launch and everything after that is on-device.
- No LLM in the decision path for rotation, progression, or exercise selection — those stay deterministic and testable so the product works identically with or without a network connection or an AI provider.
- No medical claims. Limitation/pain fields exist to make exercise selection more conservative, never to diagnose. The Profile and Coach screens both carry the same disclaimer: training suggestions are not medical advice, and persistent or worsening pain should be assessed by a qualified professional.
- No multi-athlete support yet — the whole prototype is scoped to one athlete being genuinely well-served before scaling to many.

## Nexova / VYNKÆR relationship

Nexova Labs is the technology company; VYNKÆR is the product. Attribution appears subtly (e.g. onboarding's "VYNKÆR — by Nexova Labs" framing) rather than as a persistent logo lockup competing with the athlete's own data.
