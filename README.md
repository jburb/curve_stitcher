# StitchLab
An interactive, kid-friendly and advanced-friendly curve stitching playground inspired by Mary Everest Boole, focused on geometric pattern discovery, animated thread construction, and export-ready design workflows.

[![E2E Playwright](https://github.com/jburb/curve_stitcher/actions/workflows/e2e-playwright.yml/badge.svg)](https://github.com/jburb/curve_stitcher/actions/workflows/e2e-playwright.yml)

## E2E Regression Tests (Playwright)

This repository includes dev-only Playwright tests for repeatable regression coverage.

Current covered checks:
- Stitching shape selection persists to URL and survives refresh.
- SVG export flow opens/closes correctly and does not throw the export failure alert.

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

1. Mashrabiya experience
2. Experience title bar (animated stitched reveal)
3. Stitch library (offline-first)
4. Advanced stitch ribbon motion (Option 4)

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

## TODO Backlog

1. **Mashrabiya experience**
	- Entry trigger and transition:
	  - Allow edge/line styling controls where relevant to preserve geometric legibility at different fold counts.

2. **Stitch library (offline-first)**
	 - Save/load named presets containing shape + global controls + per-thread settings.
	 - Start with local persistence (offline by default, e.g. localStorage or IndexedDB).
	 - Leave room for optional future cloud sync/import-export.

3. **Experience title bar (animated stitched reveal)**
	- Add a visible active-experience title bar (for example: "Stitching", "Triangula", "Squarus", "Mashrabiya").
	- Animate title reveal as if stitched along the writing path, rather than a static fade/slide.
	- Trigger the reveal on initial page load and on transition into a new experience/world.
	- Support experience-specific typography/path styling so each world can have its own font/letterform identity.
	- Keep the motion language consistent with current discovery and transition cues (kid-friendly, clear, not visually noisy).

4. **Advanced stitch ribbon motion (Option 4, lowest priority)**
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

1. Mashrabiya experience
2. Stitch library (offline-first)
3. Experience title bar (animated stitched reveal)
4. Advanced stitch ribbon motion (Option 4)
