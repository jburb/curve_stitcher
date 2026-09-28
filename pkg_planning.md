# Packaging Planning: Electron vs Tauri vs Capacitor

Date: 2026-09-25

## Decision Context

The app has known cross-engine sensitivity (especially around PDF viewer behavior and some runtime differences), and there is a requirement to support both desktop and mobile packaging.

This document captures:
1. Framework-by-framework impact assessment.
2. Concrete changes required in this codebase.
3. Shared work that should be done regardless of final packaging path.

## Current App Assumptions That Drive Packaging Work

These implementation patterns materially affect packaging choices:

1. Blob-download based export and save behavior.
- `js/app/export.js` uses `URL.createObjectURL` + anchor download flows.
- `js/app/pattern-library.js` uses similar download flow for JSON export.

2. PDF.js worker/document loading with web-style asset paths.
- `js/app/sewing-cards.js` sets PDF worker path and runtime bootstrap from bundled assets.

3. URL-driven application state and history mutation.
- `js/app/state-url-persistence.js` writes state via `history.replaceState`.
- `js/app/ui-wiring.js` applies in-place URL hydration and selective navigation.

4. Browser storage dependence.
- `localStorage` and IndexedDB (pattern library store) are core persistence mechanisms.

5. Asset/doc text fetch at runtime.
- Multiple modules fetch local assets/text (`narration`, `acknowledgments`, prebuilt narration manifest/clips).

## Option A: Electron (Desktop: Windows/macOS/Linux)

### What gets added

1. Electron shell project:
- main process
- preload script
- secure BrowserWindow config
- build/packaging pipeline

2. Secure IPC bridge for native file operations:
- save dialog and write for SVG/PNG/ZIP
- import file picker for pattern-library import

3. Signing and release plumbing:
- Windows signing/SmartScreen strategy
- macOS signing + notarization
- Linux package targets (AppImage/deb/rpm)

### What changes in this app

1. Export/import abstraction layer:
- Keep browser download fallback.
- Prefer native save/open when running in Electron.
- Main touchpoints: `js/app/export.js`, `js/app/pattern-library.js`.

2. PDF worker path validation in packaged runtime:
- Confirm worker/document loading under packaged app protocol and paths.
- Main touchpoint: `js/app/sewing-cards.js`.

3. URL-state deep-link/reload validation in desktop shell:
- Ensure startup/reload/restore flows remain correct.
- Main touchpoints: `js/app/state-url-persistence.js`, `js/app/ui-wiring.js`.

### Risks/strengths summary

Strengths:
- Most consistent desktop runtime (bundled Chromium).
- Likely fewer cross-engine PDF/render surprises.

Tradeoffs:
- Larger app size and higher baseline memory.
- Mobile still requires a separate framework.

## Option B: Capacitor (Mobile: iOS/Android; optional desktop via community paths)

### What gets added

1. Capacitor project scaffolding for iOS and Android.
2. Native plugin integration:
- Filesystem
- Share/Open-in
- file picker

3. Mobile release and provisioning pipeline:
- iOS certificates/profiles/entitlements
- Android signing/scoped storage validation

### What changes in this app

1. Replace download-anchor assumptions on mobile:
- Route exports to filesystem + share sheet/open-in.
- Main touchpoint: `js/app/export.js`.

2. Pattern library import/export mobile adaptation:
- Native file-picker import.
- Native export/share path.
- Main touchpoint: `js/app/pattern-library.js`.

3. PDF.js WebView compatibility checks:
- Validate worker loading and rendering behavior in iOS/Android WebViews.
- Consider native PDF viewer fallback for heavy/edge cases.
- Main touchpoint: `js/app/sewing-cards.js`.

4. Audio/session/lifecycle handling:
- Foreground/background transitions, interruptions, user-gesture constraints.
- Main touchpoint area: `js/app/experience-runtime.js`.

5. Storage durability checks:
- Verify IndexedDB/localStorage persistence and migration behavior by OS version.
- Main touchpoint: `js/app/pattern-library.js`.

### Risks/strengths summary

Strengths:
- Mainstream mobile packaging path.
- Good plugin ecosystem for mobile-native workflows.

Tradeoffs:
- WebView behavior still differs across iOS/Android versions.
- Requires explicit native UX for file import/export.

## Option C: Tauri v2 (Desktop + Mobile)

### What gets added

1. Tauri shell:
- Rust core
- tauri config/capabilities
- plugin integration

2. Native dialogs/filesystem/share bridges.
3. Target-specific signing/distribution pipelines for desktop + mobile.

### What changes in this app

1. Same export/import abstraction requirement:
- Native-first file operations with browser fallback.
- Main touchpoints: `js/app/export.js`, `js/app/pattern-library.js`.

2. PDF worker and asset path validation under Tauri runtime/protocol.
- Main touchpoint: `js/app/sewing-cards.js`.

3. URL-state lifecycle validation in webview host contexts.
- Main touchpoints: `js/app/state-url-persistence.js`, `js/app/ui-wiring.js`.

4. Mobile parity work similar to Capacitor:
- file APIs
- lifecycle/audio handling
- permissions/store compliance

### Risks/strengths summary

Strengths:
- Small footprint and strong security defaults.
- Unified framework family for desktop and mobile.

Tradeoffs:
- Uses platform webviews; runtime consistency concerns remain (important for this app’s PDF/render sensitivity).
- Rust/tooling complexity relative to JS-only stacks.

## Shared Work Required No Matter Which Path Is Chosen

This is the highest-value common implementation and should be done first.

### 1) Create a platform services adapter

Introduce a single runtime-facing service boundary, e.g. `platformServices`:

- `saveFile({ name, mimeType, data })`
- `openFile({ mimeTypes })`
- `exportAndShare({ name, mimeType, data })`
- `isNativeShell()`
- `getRuntimeInfo()`

Goal:
- App code stops depending directly on download-anchor behaviors for critical workflows.

### 2) Refactor export/import flows behind adapter

1. Export flows:
- Replace direct blob-download code paths with adapter calls.
- Preserve web fallback.
- Files: `js/app/export.js`.

2. Pattern library import/export:
- Move file selection + save logic behind adapter.
- Preserve browser fallback.
- Files: `js/app/pattern-library.js`.

### 3) Add PDF runtime diagnostics and fallback strategy

Add explicit diagnostics hooks for packaged runs:
- worker load success/failure
- first-page render time
- navigation/render errors

Define fallback policy (if needed):
- alternate worker path
- native PDF handoff (mobile-specific fallback)

Primary runtime area:
- `js/app/sewing-cards.js`.

### 4) Harden persistence/migration strategy

Define and test:
- IndexedDB schema migration policy
- export/import backward compatibility
- localStorage key versioning and migration handling

Primary area:
- `js/app/pattern-library.js`
- URL/state snapshots in `js/app/state-url-persistence.js`.

### 5) Build a cross-target validation matrix

Common acceptance matrix for all packaging paths:

1. Export correctness (SVG/PNG/ZIP) and destination UX.
2. Pattern library save/load/import/export parity.
3. PDF viewer reliability and navigation correctness.
4. Audio playback continuity and interruptions.
5. URL-state restore/deep-link behavior.
6. Storage durability after app restarts/upgrades.

## Recommended Sequencing

### Phase 1: Packaging-agnostic prep (do first)

1. Implement platform services adapter.
2. Route export/import through adapter while keeping browser fallback.
3. Add PDF diagnostics and test hooks.
4. Add/extend automated regressions where feasible.

### Phase 2: Shell-specific MVP

If choosing Electron + Capacitor:
1. Electron desktop MVP (Windows/macOS/Linux packaging basics + file IPC).
2. Capacitor mobile MVP (iOS/Android export/import and PDF validation).

If choosing Tauri:
1. Tauri desktop MVP.
2. Tauri mobile MVP.

### Phase 3: Store/distribution hardening

1. Signing/notarization/play-store/app-store compliance.
2. Crash/error telemetry for packaged-only issues.
3. Performance and memory tuning by target OS.

## Practical Conclusion (Given Current Constraints)

If runtime consistency (especially PDF/viewer/render behavior) is the top concern, Electron for desktop plus Capacitor for mobile is a pragmatic path:

1. Electron minimizes desktop engine variance.
2. Capacitor is established for iOS/Android packaging.
3. The cost is dual shell ecosystems, which can be controlled by doing the shared adapter-first work above.

If reducing shell/tooling surface area matters more than runtime uniformity, Tauri can still be viable, but it does not remove webview variance concerns that are already visible in this app.

## Additional NYI Requirements Impact Assessment

The following not-yet-implemented requirements should be treated as packaging-sensitive and included in framework selection:

1. Startup splash shown on each app open, with:
- option to load the last pattern
- option to disable splash for future opens

### NYI 1: Startup Splash Policy (Always show + load last pattern + disable future)

#### Product requirement shape

State model recommendation:
- `splashMode`: `always` | `disabled`
- `lastOpenedPatternRef`: `{ id?, kind?, serializedPattern? }`
- `lastOpenedAt`

Flow recommendation:
1. App launch checks splash mode.
2. If `always`, show splash with:
- Continue
- Load last pattern
- Disable splash going forward
3. If `disabled`, skip splash and open app directly.

#### Framework impact

Electron:
- Straightforward; launch lifecycle is stable and predictable.

Capacitor:
- Need to define behavior on cold start vs resume-from-background.
- On mobile, "app opened" semantics differ from desktop; avoid showing splash on every resume.

Tauri:
- Similar lifecycle caveat as Capacitor on mobile targets.

#### Code-level impact in this repo

1. Add splash preference and last-pattern metadata keys in localStorage (or unified settings store).
2. Add startup decision logic in `js/app/ui-wiring.js` bootstrap path.
3. Add "load last pattern" resolver that can restore from:
- stored pattern ID when available
- or stored serialized pattern payload fallback.

## Packaging Choice Pressure from NYI Items

These NYI items shift tradeoff weight as follows:

1. Splash policy with "load last pattern":
- Neutral for desktop.
- On mobile, requires careful resume semantics regardless of Capacitor or Tauri mobile.

Overall, these NYI points are compatible with all three frameworks, but they reinforce the value of:
1. Implementing the platform services adapter first.
3. Treating app lifecycle semantics (launch vs resume) as a first-class mobile requirement.

## Tauri Implementation Plan (Execution Update: 2026-09-28)

This section defines the implementation plan assuming Tauri is the selected path.

Planning assumptions for this execution update:
1. This app has low active-user impact, so internal refactors can be made without preserving legacy behavior contracts.
2. Browser fallback should remain for local web development and GitHub Pages use, but native Tauri flows should be primary when running in Tauri.
3. Desktop is the first target (Linux/macOS/Windows), then mobile parity.

### Implementation Goals

1. Ship a desktop Tauri MVP with native export/import flows and reliable sewing-cards PDF behavior.
2. Keep one app codebase, with runtime-specific platform services behind an adapter boundary.
3. Establish a repeatable path to Tauri mobile without reworking core app modules.

### Work Breakdown Structure

#### Phase 0: Tauri Shell Bootstrap (2-3 days)

Scope:
1. Initialize Tauri v2 project scaffolding in the repo.
2. Configure dev/build commands for desktop targets.
3. Configure Tauri capabilities/allowlist for dialogs, filesystem, and asset access.

Repo touchpoints:
1. `package.json` (scripts for tauri dev/build)
2. New Tauri config and Rust shell files under a dedicated app shell folder
3. Build docs in `README.md`

Acceptance criteria:
1. Desktop app launches and loads `stitchlab.html` content through Tauri.
2. `npm` script(s) exist for local Tauri run and build.
3. Existing web flow remains runnable via HTTP server.

#### Phase 1: Platform Services Adapter (3-5 days)

Scope:
1. Introduce `platformServices` as the only API surface for native-sensitive operations.
2. Implement runtime detection (`web` vs `tauri-desktop` vs `tauri-mobile` placeholder).
3. Implement web fallback and Tauri-backed implementations.

Proposed adapter contract:
1. `saveFile({ name, mimeType, data })`
2. `openFile({ mimeTypes })`
3. `exportAndShare({ name, mimeType, data })`
4. `isNativeShell()`
5. `getRuntimeInfo()`

Repo touchpoints:
1. New module: `js/app/platform-services.js` (or equivalent)
2. `stitchlab.html` script loading order update
3. `README.md` ownership table update

Acceptance criteria:
1. No direct native-shell checks scattered through feature modules.
2. Adapter returns consistent, typed result shapes for success/error/cancel.
3. Browser fallback behavior still works without Tauri runtime.

#### Phase 2: Export and Pattern Library Refactor (3-5 days)

Scope:
1. Route all file-save flows through `platformServices`.
2. Route all file-open/import flows through `platformServices`.
3. Keep ZIP/SVG/PNG generation logic in existing domain modules; only move I/O boundaries.

Repo touchpoints:
1. `js/app/export.js`
2. `js/app/pattern-library.js`
3. `stitchlab.html` (if file input fallback behavior changes)

Implementation notes:
1. Replace `URL.createObjectURL` + anchor click assumptions as primary path.
2. Preserve browser download/file-input fallback for web runtime only.
3. Keep modal and UX flows unchanged where possible.

Acceptance criteria:
1. Export of SVG/PNG/ZIP succeeds in Tauri through native file dialogs.
2. Pattern library export/import succeeds in Tauri through native file dialogs.
3. Existing Playwright web regressions for export/library still pass.

#### Phase 3: PDF Runtime Reliability in Tauri (3-6 days)

Scope:
1. Add runtime-aware PDF.js worker/document path resolver.
2. Expand existing debug instrumentation into actionable runtime diagnostics.
3. Add fallback path policy for worker/document load failures.

Repo touchpoints:
1. `js/app/sewing-cards.js`
2. `js/vendor/pdfjs/*` handling assumptions
3. Optional diagnostics helper module

Implementation notes:
1. Keep existing debug event model and extend with first-render timing + source path metadata.
2. Validate both first open and repeated open/close navigation cycles.
3. Define fallback behavior before mobile phase (for example, alternate path retry then user-visible failure state).

Acceptance criteria:
1. PDF worker loads reliably in desktop Tauri build.
2. Page navigation works without render lockups across repeated modal opens.
3. Diagnostics clearly identify worker-load, document-load, and render failures.

#### Phase 4: Lifecycle and State Semantics for Native Host (2-4 days)

Scope:
1. Review startup and URL-state assumptions under native host lifecycle.
2. Distinguish launch behavior from browser-like reload assumptions.
3. Implement NYI splash policy support with native-friendly semantics.

Repo touchpoints:
1. `js/app/ui-wiring.js`
2. `js/app/state-url-persistence.js`
3. `js/app/experience-runtime.js` (if lifecycle hooks are centralized there)

Implementation notes:
1. Keep URL-state serialization as internal state mechanism, but do not depend on browser navigation UX in packaged app.
2. Add startup policy keys and last-pattern loading hooks directly, since compatibility migration is not a blocker.

Acceptance criteria:
1. Launch and relaunch behavior is deterministic in Tauri desktop.
2. Splash policy (`always`/`disabled`) works as specified.
3. "Load last pattern" can restore a valid last state reference.

#### Phase 5: Storage and Error Telemetry Hardening (2-4 days)

Scope:
1. Keep IndexedDB/localStorage unless runtime testing proves instability.
2. Add simple packaged-runtime error logging hooks (especially for export and PDF paths).
3. Define migration/versioning only for new runtime contracts introduced during this work.

Repo touchpoints:
1. `js/app/pattern-library.js`
2. `js/app/state-url-persistence.js`
3. `js/app/experience-runtime.js`

Acceptance criteria:
1. Pattern library records persist across app restarts in Tauri desktop.
2. No data corruption from save/load/import/export loop tests.
3. Packaged-runtime errors are capturable with enough context to reproduce.

#### Phase 6: Release Pipeline and Distribution Prep (3-6 days)

Scope:
1. Add desktop build/signing/notarization checklist per OS.
2. Add CI smoke for Tauri desktop build artifacts.
3. Add target-specific release docs.

Repo touchpoints:
1. `README.md`
2. CI workflow files
3. Tauri config/release metadata

Acceptance criteria:
1. Build artifacts generated for at least one desktop target in CI.
2. Manual install/run instructions are documented and tested.
3. Packaging does not include Playwright/test artifact folders.

### Cross-Phase Validation Matrix (Tauri Track)

Run these at the end of each phase where applicable:
1. Export correctness: SVG/PNG/ZIP output and destination UX.
2. Pattern library parity: save/load/import/export behavior.
3. Sewing cards PDF reliability: load, navigate, reopen stability.
4. Audio continuity: playback and interruption behavior.
5. Startup and restore: splash policy, last-pattern load, URL-state restore.
6. Persistence durability: data survives restart and upgrade build.

### Suggested Sprint Sequence

1. Sprint 1:
- Phase 0 + Phase 1
- Begin Phase 2
2. Sprint 2:
- Complete Phase 2
- Complete Phase 3
3. Sprint 3:
- Phase 4 + Phase 5
- Begin Phase 6
4. Sprint 4:
- Complete Phase 6
- Desktop hardening pass and mobile planning checkpoint

### Out-of-Scope for Desktop MVP

1. Full Tauri mobile packaging and store submission.
2. Comprehensive telemetry platform integration.
3. Extensive legacy migration paths for old storage keys.

### Mobile Follow-On (After Desktop MVP)

1. Add Tauri mobile shell and permissions.
2. Implement mobile-specific file/share behavior in `platformServices`.
3. Re-run PDF and lifecycle validation with mobile webview constraints.
4. Validate foreground/background interruption handling for narration/audio.
