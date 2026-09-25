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
