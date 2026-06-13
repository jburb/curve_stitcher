# StitchLab
An interactive, kid-friendly and advanced-friendly curve stitching playground inspired by Mary Everest Boole, focused on geometric pattern discovery, animated thread construction, and export-ready design workflows.

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

1. Dynamic add/multiply bounds guardrail [Completed]
2. Triangula experience (Sierpinski world) [Completed]
3. Squarus experience (polyonimo world) [Completed]
4. Mashrabiya experience (Islamic rosette world)
5. Experience title bar (animated stitched reveal)
6. Stitch library (offline-first)
7. Advanced stitch ribbon motion (Option 4)

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
11. Triangula experience (Sierpinski world) core delivery complete (entry, controls, recursive rendering/animation, color modes, and export support)

## TODO Backlog

1. **Mashrabiya experience (Islamic rosette world)**
	- Entry trigger and transition:
	  - When the user stitches/discovers a Mystic Rose in Stitching mode, offer an optional prompt to "Enter Mashrabiya".
	  - Reuse a similarly polished scene transition language so movement into Mashrabiya feels native to the app (not a hard context switch).
	  - Define and document the strict unlock definition of "rosette" before finalizing discovery detection logic.
	  - Current implementation status: rosette discovery unlocking is intentionally disabled behind a feature flag until the strict detection definition is finalized.
	  - Candidate strict rule to evaluate: complete-graph rosette for 5-12 holes (each hole connected to every other hole), potentially as a dedicated Mashrabiya subtype/milestone.
	- Core experience:
	  - Generate Islamic rosettes ("mystic roses") as the primary geometric object.
	  - Support varying fold/point structures (for example 6-fold, 8-fold, 12-fold and beyond) to produce distinct rosette families.
	  - Support fill color variation to produce different tiling and ornamental outcomes.
	  - Allow edge/line styling controls where relevant to preserve geometric legibility at different fold counts.
	- Controls and UX consistency:
	  - Mirror the same kid-friendly and advanced control framework used in Stitching mode and Triangula.
	  - Keep mode-switching and value feedback legible for younger users while still enabling advanced precision.
	- Return path:
	  - Include "Follow the thread" navigation back to Stitching mode.
	- Audio/animation behavior parity:
	  - Keep the same activity-driven music lifecycle as the main app (play during animation/active adjustment, pause at rest).

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

1. Dynamic add/multiply bounds guardrail
2. Triangula experience (Sierpinski world) [Completed]
3. Squarus experience (polyonimo world) [Essentially Complete]
4. Mashrabiya experience (Islamic rosette world)
5. Experience title bar (animated stitched reveal)
6. Stitch library (offline-first)
7. Advanced stitch ribbon motion (Option 4)
