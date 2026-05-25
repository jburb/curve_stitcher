# curve_stitcher
for playing with curve stitching a la mary everest boole (enabled in this case of course by babbage)

## Current Milestones

1. Square canvas enforcement hardening
2. Formula mode clarity
3. Cardioid support assurance
4. Shape border support
5. SVG export
6. Known pattern discovery detector
7. Stitch library (offline-first)
8. Advanced stitch ribbon motion (Option 4)

## TODO Backlog

1. **Formula mode clarity**
	 - Improve helper text so users can write formulas in math-first language.
	 - Keep variables documented in plain terms:
		 - `i`: stitch step number
		 - `n`: number of holes
		 - `current`: current hole index
		 - `prev`: previous hole index
		 - `skip`: base skip
	 - Add examples in algebraic style, then show equivalent engine expression.

2. **Cardioid support assessment**
	 - Current formula mode updates the next hole via step arithmetic:
		 - `next = (current + step) mod n`
	 - This is good for many dynamic skip patterns, but not ideal for full multiplication-table families (cardioid / nephroid style) that are naturally expressed as direct mappings:
		 - `target(i) = (k * i + b) mod n`
	 - Proposed extension:
		 - Add a mapping mode where each segment is drawn from `i` to `f(i)` for all `i`.
		 - This mode should coexist with existing fixed/formula/sequence modes.

3. **Known pattern discovery detector**
	 - Detect when control combinations approximately match known constructions and show a tasteful "discovery" badge.
	 - Use a short stabilization window (for example 700-1200 ms) before firing to avoid slider thrash.
	 - Initial pattern candidates:
		 - Cardioid-like times tables
		 - Mystic Rose
		 - Parabola envelope
		 - Hyperbola envelope
		 - Nephroid-like variants

4. **Stitch library (offline-first)**
	 - Save/load named presets containing shape + global controls + per-thread settings.
	 - Start with local persistence (offline by default, e.g. localStorage or IndexedDB).
	 - Leave room for optional future cloud sync/import-export.

5. **Square canvas enforcement hardening**
	- Investigate cross-environment behavior differences in Linux Firefox where square enforcement can fail on QHD displays.
	- Reproduce against at least:
	  - Linux Firefox (Pop!_OS) 1600x900 where current behavior is good
	  - Linux Firefox (Mint) QHD where current behavior can drift
	- Add robust fallback sizing logic and resize-event handling so the stage remains square consistently.

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

1. Square canvas enforcement hardening
2. Formula UX pass
3. Mapping mode for cardioid family
4. Shape borders
5. SVG export
6. Pattern discovery notifier
7. Stitch library (offline-first)
8. Advanced stitch ribbon motion (Option 4)
