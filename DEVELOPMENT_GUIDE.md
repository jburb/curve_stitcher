# Development Guide

This guide covers common extension scenarios for the current Curve Stitcher architecture.

## Architecture Overview

The app is a classic-script SPA with experience-driven behavior.

- Experience definitions: `js/experiences/*.js`
- Experience registry: `js/experiences/library.js`
- Discovery definitions: `js/experiences/discovery.js`
- Experience adapters: `js/experiences/adapters/*.js` and `js/experiences/adapters.js`
- Adapter dependency bundle: `js/experiences/adapterContextFactory.js`
- Domain event binders: `js/events/*.js`
- Main runtime orchestration: `js/app.js`
- Script load order: `curvestitcher.html`

## Guardrails (Read First)

These prevent the regressions hit during recent refactors:

1. Do not reassign shared arrays after event binding.
- Example: keep `threads` identity stable; mutate in place (`splice`, `push`) instead of `threads = ...`.

2. Do not destructively mutate cross-experience state in UI policy functions.
- `applyThreadPolicy` should hide/show controls, not truncate thread data.

3. Keep script order explicit in `curvestitcher.html`.
- Experience files and adapters must load before `js/app.js`.

4. Treat adapter binding as experience-specific, but keep critical shared handlers in one canonical location.
- Avoid duplicate/competing button listeners for the same action.

5. Validate controls by switching experiences and returning.
- Most bugs show up at state-boundary transitions.

---

## Scenario 1: Create a New Experience (Example: Squarus) Triggered by Shape Discovery

### Goal
Add a new world that unlocks from a discovery pattern and can be entered via Discovery panel action.

### Steps

1. Create the experience definition file.
- Add `js/experiences/squarus.js` (or your new file) with:
  - `id`
  - `title`
  - `defaultSongId`
  - `uiProfile` (allowed shapes, controls, thread policy, etc.)

2. Register the experience in the library.
- Update `js/experiences/library.js` to include the new experience key.

3. Add an experience adapter.
- Add `js/experiences/adapters/<experience>Adapter.js`.
- If no custom events yet, start with a noop adapter.
- Register it in `js/experiences/adapters.js`.

4. Add script tags in load order.
- Update `curvestitcher.html` to load:
  - experience file
  - adapter file
  - registry files
  - then `js/app.js` last

5. Add discovery entry.
- Update `js/experiences/discovery.js` with a new discovery config:
  - `title`, `icon`, `description`
  - `experienceName` (must resolve to your experience)
  - `songId`
  - `discoveryRule` with `detectorId`, `detectorScope`, optional `enabledFlag`

6. Implement detector logic.
- In `js/app.js`, add detector function(s) near existing discovery detectors.
- Register `detectorId` mapping in `getDiscoveryDetector`.

7. Ensure experience resolution works.
- `resolveExperienceId` in `js/app.js` resolves by id or title.
- Keep `experienceName` in discovery aligned with either.

8. Add song/tempo mappings (optional but typical).
- Update `MUSIC_LIBRARY` and `SONG_TEMPO_OPTIONS` in `js/app.js`.

9. Verify end-to-end.
- Trigger discovery pattern.
- Confirm unlock toast and discovery entry.
- Click "Travel to <experience>".
- Confirm experience switch and return-to-stitching flow.

### Common Failure Modes

- Discovery unlock appears, but travel fails:
  - `experienceName` does not resolve to registered experience.

- Experience exists but controls are wrong:
  - `uiProfile` booleans do not match catalog keys.

- Runtime errors after adding files:
  - Script order in `curvestitcher.html` is incorrect.

---

## Scenario 2: Modify an Existing Experience's Controls

### Goal
Change which controls appear and how they behave for one experience.

### Steps

1. Update the experience `uiProfile`.
- Edit the target file in `js/experiences/*.js`.
- Typical fields:
  - `threadsEnabled`
  - `allowMultipleThreads`
  - `paletteMode`
  - `supportsHoleNumbers`
  - `supportsBorder`
  - `basicControls`
  - `advancedControls`

2. Use only known control keys.
- Basic keys are defined in `CONTROL_KEYS.BASIC` in `js/app.js`.
- Advanced keys are defined in `CONTROL_KEYS.ADVANCED` in `js/app.js`.
- Unknown keys will warn in console and have no effect.

3. If adding a new control (not just toggling existing), update the catalogs.
- `BASIC_CONTROL_CATALOG` and/or `ADVANCED_CONTROL_CATALOG` in `js/app.js`.
- Map your control key to element(s) and visibility function.

4. Wire event behavior if needed.
- Add experience-specific event handling in `js/events/*.js`.
- Bind via the experience adapter (`js/experiences/adapters/*.js`).

5. Validate policy boundaries.
- Switch across experiences and back.
- Ensure hidden controls do not mutate data unexpectedly.

### Common Failure Modes

- Control still visible when disabled:
  - Visibility logic in catalog does not account for experience-specific condition.

- Control hidden but still mutating runtime:
  - Listener still active and tied to shared state without policy checks.

- State lost when switching:
  - Cross-experience mutation in policy function instead of per-experience state capture/restore.

---

## Scenario 3: Modify an Existing Experience's Animation/Canvas Settings

### Goal
Adjust rendering behavior, animation pacing/logic, or canvas fit behavior.

### Where to Change

1. Canvas/stage fit behavior
- `scheduleFitCanvasToStage` and `fitCanvasToStage` in `js/app.js`.

2. Static rendering entrypoint
- `drawStatic` in `js/app.js`.

3. Animation entrypoints
- `animateStitch` (Stitching path)
- `animateTriangula` (Triangula path)
- Both in `js/app.js`.

4. Experience mode-driven animation parameters
- Triangula mode variables and usage in `js/app.js`:
  - `triangulaConstructionMode`
  - `triangulaFitMode`
  - count/state helpers

5. Experience profile-level animation intent
- `uiProfile.animationBehavior` (where present, e.g. Triangula) in `js/experiences/*.js`.

### Safe Change Workflow

1. Start from one experience path only.
- Example: Triangula-only change behind `currentExperienceId === 'triangula'`.

2. Keep URL/state sync in mind.
- If behavior should persist/share via URL, ensure corresponding state fields serialize/deserialize.

3. Keep frame budget in check.
- Prefer bounded loops and incremental rendering.
- Verify high hole counts / higher recursion counts.

4. Preserve playback semantics.
- Existing policy: music/animation states should remain consistent with user actions.

5. Validate export parity.
- If visual output changes materially, confirm export still matches expected final state.

### Common Failure Modes

- Canvas jumps or clips on resize:
  - Fit logic changed without honoring stage constraints.

- Animation updates visual state but not URL/state snapshot:
  - Missing sync path for modified runtime values.

- Triangula control changes appear but do nothing:
  - Updated UI variable not used in draw/animate branch.

---

## Quick PR Checklist for Any Experience Change

1. New/updated experience file added and registered.
2. Adapter and event binder path verified.
3. Script order in `curvestitcher.html` verified.
4. Switch sequence tested:
- Stitching -> target experience -> Stitching.
5. URL hydration tested with full query params.
6. No diagnostics errors in touched files.

---

## Suggested Future Hardening

1. Move more mutable globals into explicit per-experience state objects.
2. Add lightweight smoke tests for:
- discovery unlock -> travel
- add thread -> switch experience -> return
- URL hydrate with multiple threads
3. Gradually reduce the orchestration size in `js/app.js` by extracting focused modules with clear ownership.
