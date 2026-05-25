# curve_stitcher
for playing with curve stitching a la mary everest boole (enabled in this case of course by babbage)

## Current Milestones

1. Shape border support
2. SVG export

## TODO Backlog

1. **Stitch motion realism**
	 - Add a moving "pull" head while each segment is drawn (for example, a short bright lead segment + trailing fade).
	 - Keep this visual effect style-only so it does not reset path progression.

2. **Formula mode clarity**
	 - Improve helper text so users can write formulas in math-first language.
	 - Keep variables documented in plain terms:
		 - `i`: stitch step number
		 - `n`: number of holes
		 - `current`: current hole index
		 - `prev`: previous hole index
		 - `skip`: base skip
	 - Add examples in algebraic style, then show equivalent engine expression.

3. **Cardioid support assessment**
	 - Current formula mode updates the next hole via step arithmetic:
		 - `next = (current + step) mod n`
	 - This is good for many dynamic skip patterns, but not ideal for full multiplication-table families (cardioid / nephroid style) that are naturally expressed as direct mappings:
		 - `target(i) = (k * i + b) mod n`
	 - Proposed extension:
		 - Add a mapping mode where each segment is drawn from `i` to `f(i)` for all `i`.
		 - This mode should coexist with existing fixed/formula/sequence modes.

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

8. **Square canvas enforcement hardening**
	- Investigate cross-environment behavior differences in Linux Firefox where square enforcement can fail on QHD displays.
	- Reproduce against at least:
	  - Linux Firefox (Pop!_OS) 1600x900 where current behavior is good
	  - Linux Firefox (Mint) QHD where current behavior can drift
	- Add robust fallback sizing logic and resize-event handling so the stage remains square consistently.

## Suggested Delivery Order

1. Shape borders
2. SVG export
3. Stitch library (offline-first)
4. Formula UX pass
5. Mapping mode for cardioid family
6. Pattern discovery notifier
7. Motion realism polish
