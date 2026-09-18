# VYNKÆR Training — Build Status

Living status doc for continuing work across sessions. Update as phases complete.

## Phase checklist

- [x] Phase 0 — Inspect repo & existing HTML prototype (`reference/vynkaer-training-v1-demo.html`)
- [ ] Phase 1 — Foundation (Expo + TS + Router, theme tokens, nav, persistence scaffolding)
- [ ] Phase 2 — Domain model (types, exercise library, Athlete 001 seed, history seed)
- [ ] Phase 3 — Training engine (rotation, progression, generator, safety) + tests
- [ ] Phase 4 — Home screen
- [ ] Phase 5 — Active workout (Train) screen — highest priority
- [ ] Phase 6 — Progress screen
- [ ] Phase 7 — Coach screen + DemoCoachProvider
- [ ] Phase 8 — Profile screen
- [ ] Phase 9 — Polish
- [ ] Phase 10 — Verification (typecheck, lint, tests)
- [ ] Phase 11 — Documentation (README, ARCHITECTURE, PRODUCT, SUPABASE_MIGRATION)

## Notes from Phase 0 inspection

Existing prototype: `reference/vynkaer-training-v1-demo.html` — a single-file HTML/CSS/JS demo.
Key concepts extracted:
- Sidebar nav (desktop) / bottom nav (mobile) with 5 destinations: Overview, Workout, Progress, Coach, Athlete Profile.
- Dark charcoal palette, burnt copper accent (`--accent:#b75a37`, `--accent2:#d58a57`), rounded cards, restrained shadows.
- Home: hero card with next workout number/modality/pill, stat grid (sessions, rep target, last knee, last cardio), generated exercise list, Start/Regenerate actions, explanation notice.
- Workout: per-exercise blocks with set rows (weight/reps/done check), session summary sidebar (completed sets, RPE slider, knee before/after), Finish & save.
- Progress: stat cards, simple bar chart for strength trend, push-up milestone with progress bar.
- Coach: chat thread, quick-action buttons, composer, deterministic keyword-based responses.
- Profile: training identity summary, adaptive rule toggles, preferences chips, reset demo data.
- State model in prototype is a flat localStorage blob — V1 native app must replace this with proper typed repositories (Athlete/Workout/Settings) and a real deterministic engine (prototype's `rotationAfter`/plan swap is illustrative only, not the real algorithm).

Decision: build native Expo Router app in project root (not embedding HTML). Reference file kept under `reference/` for inspiration only.

## Current focus

Starting Phase 1 (Foundation).
