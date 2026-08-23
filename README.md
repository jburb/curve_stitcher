# StitchLab
An interactive, kid-friendly and advanced-friendly curve stitching playground inspired by Mary Everest Boole, focused on geometric pattern discovery, animated thread construction, and export-ready design workflows.

[![E2E Playwright](https://github.com/jburb/curve_stitcher/actions/workflows/e2e-playwright.yml/badge.svg)](https://github.com/jburb/curve_stitcher/actions/workflows/e2e-playwright.yml)

## E2E Regression Tests (Playwright)

This repository includes dev-only Playwright tests for repeatable regression coverage.

Current covered checks:
- Stitching shape selection persists to URL and survives refresh.
- SVG export flow opens/closes correctly and does not throw the export failure alert.
- Export fallback path works when JSZip is unavailable.
- Squarus squares selection snaps "pieces placed" to the max for the selected polyomino set.
- Squarus seeded piece sequencing is deterministic for fixed seed.
- Experience switching updates the visible control groups correctly (Stitching, Triangula, Squarus).
- Basic and advanced shared controls remain synchronized (holes, tempo, etc.).
- Basic palette custom dropper applies the selected thread color.
- Acknowledgments viewer opens from about controls and cycles styles by line.
- Acknowledgments viewer opens from About actions.
- Acknowledgments autoplay lifecycle resets cleanly across close/reopen.
- Advanced pane remains open during thread-card interactions.
- Advanced pane remains open for top/lower control-bar interactions and closes on canvas click.
- Squarus basic and advanced squares controls stay synchronized.
- Slider touchmove events are not canceled by global handlers.
- Playback remains operable after orientation-style viewport changes.
- Mobile layout baseline remains usable at phone viewport.
- Triangula URL state roundtrip persists key controls on reload.
- Squarus URL state roundtrip persists key controls on reload.
- Mashrabiya URL state roundtrip persists key controls on reload.
- Runtime load-order contract exposes required global functions.
- Core interaction sweep does not raise runtime reference/type errors.
- Mashrabiya debug SVG export closes sequence stitch paths.
- Mashrabiya fold 8 classification and fills match expected point IDs and area coverage.
- Mashrabiya fold 8 and 12 fills are invariant to debug-label toggle.
- Stitching discovery candidates unlock their corresponding discovery cards (triangle, square, rosette 8-fold, rosette 12-fold).

### Run Locally

1. Install dependencies:
	- `npm install`
2. Install Playwright browser (Chromium):
	- `npm run test:e2e:install`
3. Run tests:
	- `npm run test:e2e`

Optional:
- Headed run: `npm run test:e2e:headed`
- Interactive UI mode: `npm run test:e2e:ui`

### Packaging Safety Guardrails

- Playwright is in `devDependencies` only.
- Tests are isolated under `tests/e2e/`.
- Local test artifacts are ignored via `.gitignore`:
  - `node_modules/`
  - `playwright-report/`
  - `test-results/`

This setup does not change runtime app behavior and should not be included in mobile/desktop packaged artifacts.

## App Script Ownership (Current)

The runtime is loaded in deterministic order from stitchlab.html, and ownership is currently organized as follows.

| Load order | Script | Primary ownership | Notes |
| --- | --- | --- | --- |
| 1 | js/app/onboarding.js | Onboarding state, overlays, hint/tour flow, onboarding narration controls | Keeps onboarding-specific UI behavior isolated from core drawing logic. |
| 2 | js/app/experience-library.js | Experience metadata/config catalog | Source of experience labels/content metadata used by runtime and UI. |
| 3 | js/app/narration.js | About-page narration extraction, iframe allowlist, narration bridge helpers | Handles doc-path safety and narration text exchange. |
| 4 | js/app/state-url-persistence.js | URL schema, sanitizers, per-experience state serialization and hydration helpers | Canonical place for state shape and normalization logic. |
| 5 | js/app/experience-runtime.js | Global runtime orchestration, theme/audio state, experience switching, shared visibility rules | Owns cross-experience lifecycle coordination. |
| 6 | js/app/stitching-core.js | Stitching geometry, point computation, frame fitting, thread drawing, animation rendering | Canonical stitching render/animation engine. |
| 7 | js/app/triangula.js | Triangula geometry, timeline, static/animated rendering | Experience-specific implementation. |
| 8 | js/app/squarus.js | Squarus polyomino generation, sequencing, layout/animation helpers | Experience-specific implementation. |
| 9 | js/app/mashrabiya.js | Mashrabiya geometry, fill classification, timeline, static/animated rendering | Experience-specific implementation. |
| 10 | js/app/export.js | Export modals, naming normalization, SVG/guide/zip generation | Export-only workflow and asset builders. |
| 11 | js/app/acknowledgments.js | Acknowledgments modal flow and stage renderer, plus currently coupled wiring/helpers needed by that flow | This file is intentionally in a mixed-ownership state right now because that is the known passing configuration. |
| 12 | js/app/ui-wiring.js | Shared DOM event wiring and startup initialization | Wires controls/events and bootstraps initial runtime state. |

## Development Notes

### 1) Current stability boundary

- The known-green baseline (23 Playwright regressions passing) currently depends on a mixed-ownership state in js/app/acknowledgments.js.
- Until a targeted follow-up refactor lands with full regression coverage, treat js/app/acknowledgments.js as a stability-sensitive module.

### 2) Safe refactor workflow for module moves

- Move in very small batches (one function group or one listener cluster at a time).
- After each batch, run diagnostics on touched files and then run tests/e2e/stitchlab.regressions.spec.js.
- Prefer mechanical moves (copy then delete) over rewrites, and preserve script load order expectations.
- If a move introduces broad regressions, revert to the last passing baseline first, then narrow scope.

### 3) Practical ownership guidance

- Keep experience-specific math/render logic in its experience module (triangula.js, squarus.js, mashrabiya.js).
- Keep export surface area in export.js.
- Keep URL/state normalization in state-url-persistence.js.
- Keep pure runtime orchestration in experience-runtime.js.
- Keep DOM wiring and startup sequence in ui-wiring.js unless a flow is tightly coupled and proven to require local ownership.

### 4) Verification gate for ownership edits

- Required gate before merging ownership refactors:
	1. No diagnostics in changed files.
	2. All Playwright regressions in tests/e2e/stitchlab.regressions.spec.js passing.
	3. Updated ownership notes in this README if boundaries changed.

## License

This project is licensed under GNU General Public License v3.0. See [LICENSE](LICENSE).

Copyright (c) 2026 Josh Hicken.

Attribution and notices:
- Keep copyright and license notices intact in copies and derivatives.

Future relicensing path:
- The maintainer may offer future versions under additional or different licenses, including Apache-2.0 or MIT.
- Prior distributed copies remain under the license they were released under.

Contributor terms:
- By submitting a contribution, you agree that your contribution is licensed under GPL-3.0-or-later for this project.
- You also grant the project maintainer (Josh Hicken) permission to relicense your contributed code in future versions of this project under other open source licenses, including Apache-2.0 and MIT.
- See [CONTRIBUTING.md](CONTRIBUTING.md) for the contributor agreement details.

## Current Milestones

1. Stitch library (offline-first)
2. Experience title bar (animated stitched reveal)
3. Advanced stitch ribbon motion (Option 4)

## Recently Completed

1. Square canvas enforcement hardening (promoted to complete; reopen if regressions appear)
2. Shape border support (paired inner+outer Stitching borders, advanced toggle, and improved hole-number placement)
3. Stitch motion realism (progressive pull + settle accent, tempo-locked)
4. Arithmetic-first stitch controls in kid and advanced UI
5. Multiplication mapping mode (cardioid/nephroid capable)
6. Formula UX pass (math-friendly input normalization and clearer guidance)
7. Multiplication mapping aligned to visible hole numbering semantics
8. SVG export workflows (single ZIP bundle with optional stitched threads, stitching guide with embedded parameters, and preview image)
9. Playback control refinement (play/pause/resume stitching plus kid-friendly tempo icon controls synced with advanced BPM)
10. Known pattern discovery detector (geometry-based discovery unlocks, song picker unlock flow, and discovery affordance cues)
11. Triangula
12. Dynamic add/multiply bounds guardrail
14. Squarus
15. Mashrabiya
16. Discovery Preview Cards

## TODO Backlog

1. **Stitch library (offline-first)**
	 - Save/load named presets containing shape + global controls + per-thread settings.
	 - Start with local persistence (offline by default, e.g. localStorage or IndexedDB).
	 - Leave room for optional future cloud sync/import-export.

2. **Experience title bar (animated stitched reveal)**
	- Add a visible active-experience title bar (for example: "Stitching", "Triangula", "Squarus", "Mashrabiya").
	- Animate title reveal as if stitched along the writing path, rather than a static fade/slide.
	- Trigger the reveal on initial page load and on transition into a new experience/world.
	- Support experience-specific typography/path styling so each world can have its own font/letterform identity.
	- Keep the motion language consistent with current discovery and transition cues (kid-friendly, clear, not visually noisy).

3. **Advanced stitch ribbon motion (Option 4, lowest priority)**
	- Explore a richer thread-brush/ribbon rendering mode with tapered trail and smoother pull dynamics.
	- Keep BPM timing behavior unchanged; visual enhancement only.
	- Treat as post-core polish after all other roadmap priorities.
	- Implementation guidance:
	  - Start with an "Option 4 lite" mode: one trailing ribbon behind the pull head (no twist/noise initially).
	  - Reuse the existing BPM segment scheduler; only replace per-frame rendering for active segment visuals.
	  - Build a short sampled trail from current pull position backward along recent movement.
	  - Apply width and opacity taper along the trail (largest/brightest at head, fading toward tail).
	  - Add quality levels (low/medium/high) that adjust trail sample count and update frequency.
	  - Keep a feature toggle so users can switch between current motion style and ribbon mode.
	  - Profile at high hole counts and high BPM; auto-fallback to lightweight mode when needed.
	  - Defer advanced polish (thread twist texture, multi-layer fibers, noise jitter) until baseline performance is stable.

## Suggested Delivery Order

1. Stitch library (offline-first)
2. Experience title bar (animated stitched reveal)
3. Advanced stitch ribbon motion (Option 4)
