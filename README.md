# curve_stitcher
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

1. SVG export
2. Known pattern discovery detector
3. Triangula experience (Sierpinski world)
4. Mashrabiya experience (Islamic rosette world)
5. Stitch library (offline-first)
6. Advanced stitch ribbon motion (Option 4)

## Recently Completed

1. Square canvas enforcement hardening (promoted to complete; reopen if regressions appear)
2. Shape border support (paired inner+outer Stitching borders, advanced toggle, and improved hole-number placement)
3. Stitch motion realism (progressive pull + settle accent, tempo-locked)
4. Arithmetic-first stitch controls in kid and advanced UI
5. Multiplication mapping mode (cardioid/nephroid capable)
6. Formula UX pass (math-friendly input normalization and clearer guidance)
7. Multiplication mapping aligned to visible hole numbering semantics

## TODO Backlog

1. **SVG export**
	- Export current stitched design to SVG.
	- Define export scope clearly (threads, holes, optional labels/border).

2. **Known pattern discovery detector**
	 - Detect when control combinations approximately match known constructions and show a tasteful "discovery" badge.
	 - Use a short stabilization window (for example 700-1200 ms) before firing to avoid slider thrash.
	 - Initial pattern candidates:
		 - Cardioid-like times tables
		 - Mystic Rose
		 - Parabola envelope
		 - Hyperbola envelope
		 - Nephroid-like variants

3. **Triangula experience (Sierpinski world)**
	- Entry trigger and transition:
	  - When the user stitches/discovers an equilateral triangle in Stitching mode, offer an optional prompt to "Enter Triangula".
	  - If confirmed, transition by scrolling the current stitch shape out of canvas view along a path congruent with an edge of the equilateral triangle.
	  - Slide a single triangle into view as the opening state for Triangula.
	- Core experience:
	  - Generate Sierpinski triangle constructions with increasing recursion/complexity levels.
	  - Provide zoomed interval navigation so users can inspect progressively smaller triangles that become visually subtle at higher levels.
	  - Support triangle-count specification for generated sets/instances.
	  - Support style toggles for fill vs edge rendering.
	  - Support full color control in both kid-friendly and advanced forms.
	- Controls and UX consistency:
	  - Preserve the primary interaction model: a kid-friendly control band and an advanced control panel with deeper parameterization.
	  - Keep control semantics, labels, and responsiveness aligned with existing Stitching mode conventions so this feels like the same product family.
	- Return path:
	  - Provide a clear "Follow the thread" action that transitions users back to Stitching mode.
	- Audio/animation behavior parity:
	  - Preserve music behavior exactly: play continuously while animation is running and while sliders are actively moving; pause when animation is idle and controls are at rest.

4. **Mashrabiya experience (Islamic rosette world)**
	- Entry trigger and transition:
	  - When the user stitches/discovers a Mystic Rose in Stitching mode, offer an optional prompt to "Enter Mashrabiya".
	  - Reuse a similarly polished scene transition language so movement into Mashrabiya feels native to the app (not a hard context switch).
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

5. **Stitch library (offline-first)**
	 - Save/load named presets containing shape + global controls + per-thread settings.
	 - Start with local persistence (offline by default, e.g. localStorage or IndexedDB).
	 - Leave room for optional future cloud sync/import-export.

6. **Advanced stitch ribbon motion (Option 4, lowest priority)**
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

1. SVG export
2. Pattern discovery notifier
3. Triangula experience (Sierpinski world)
4. Mashrabiya experience (Islamic rosette world)
5. Stitch library (offline-first)
6. Advanced stitch ribbon motion (Option 4)
