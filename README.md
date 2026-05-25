# curve_stitcher
for playing with curve stitching a la mary everest boole (enabled in this case of course by babbage)

## Current Milestones

1. Square canvas enforcement hardening
2. Shape border support
3. SVG export
4. Known pattern discovery detector
5. Stitch library (offline-first)
6. Advanced stitch ribbon motion (Option 4)

## Recently Completed

1. Stitch motion realism (progressive pull + settle accent, tempo-locked)
2. Arithmetic-first stitch controls in kid and advanced UI
3. Multiplication mapping mode (cardioid/nephroid capable)
4. Formula UX pass (math-friendly input normalization and clearer guidance)
5. Multiplication mapping aligned to visible hole numbering semantics

## TODO Backlog

1. **Square canvas enforcement hardening**
	- Investigate cross-environment behavior differences in Linux Firefox where square enforcement can fail on QHD displays.
	- Reproduce against at least:
	  - Linux Firefox (Pop!_OS) 1600x900 where current behavior is good
	  - Linux Firefox (Mint) QHD where current behavior can drift
	- Add robust fallback sizing logic and resize-event handling so the stage remains square consistently.

2. **Shape border support**
	- Add optional shape border rendering with user controls (on/off, thickness, color).
	- Keep border updates style-only where possible.

3. **SVG export**
	- Export current stitched design to SVG.
	- Define export scope clearly (threads, holes, optional labels/border).

4. **Known pattern discovery detector**
	 - Detect when control combinations approximately match known constructions and show a tasteful "discovery" badge.
	 - Use a short stabilization window (for example 700-1200 ms) before firing to avoid slider thrash.
	 - Initial pattern candidates:
		 - Cardioid-like times tables
		 - Mystic Rose
		 - Parabola envelope
		 - Hyperbola envelope
		 - Nephroid-like variants

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

1. Square canvas enforcement hardening
2. Shape borders
3. SVG export
4. Pattern discovery notifier
5. Stitch library (offline-first)
6. Advanced stitch ribbon motion (Option 4)
