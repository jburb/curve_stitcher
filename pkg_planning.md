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

1. Single-pattern export/import for sharing.
2. Startup splash shown on each app open, with:
- option to load the last pattern
- option to disable splash for future opens
3. Persistence strategy review: SQLite vs IndexedDB, and interaction with existing localStorage usage.

### NYI 1: Single-Pattern Export/Import for Sharing

#### Product requirement shape

Recommended portable pattern artifact (JSON):
- schemaVersion
- createdAt
- appVersion (optional)
- patternName
- patternDescription
- patternUrl (URL-state encoded)
- optional preview metadata (small SVG/thumbnail)

#### Framework impact

Electron:
- Strong fit. Use native save/open dialogs via IPC.
- Can still support browser-style fallback in dev-web mode.

Capacitor:
- Requires Filesystem + Share + File Picker plugin flow.
- UX should be explicit: Save copy / Share copy / Import from file.

Tauri:
- Similar to Electron in concept (native dialog/filesystem APIs), but with plugin/capability configuration.

#### Code-level impact in this repo

1. Add single-pattern serializer/deserializer API in `js/app/pattern-library.js`.
2. Route file save/open through `platformServices` adapter.
3. Keep current full-library import/export as separate workflow.

### NYI 2: Startup Splash Policy (Always show + load last pattern + disable future)

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

### NYI 3: SQLite vs IndexedDB, and localStorage implications

#### Current state

Pattern library already has an adapter shape (`indexeddb` with optional runtime bridge hook), while localStorage is used for settings/caches/state toggles.

#### Decision guidance

1. Keep localStorage for lightweight preferences and UX flags.
- theme
- onboarding/splash preferences
- quick feature toggles

2. Use a primary durable store for pattern/library records.
- IndexedDB is simplest for pure-web and WebView parity.
- SQLite can be stronger for queryability, backup portability, and native-shell durability if bridged cleanly.

3. Do not mix multiple authorities for the same entity set.
- Choose one source of truth for pattern records (IndexedDB or SQLite).
- Use localStorage only for metadata/cache pointers.

#### Framework-by-framework persistence implications

Electron:
- Easiest SQLite adoption path (Node/Rust/native addon options), plus reliable filesystem access.
- IndexedDB also works; SQLite becomes an architectural choice, not a necessity.

Capacitor:
- IndexedDB support exists but behavior can vary by WebView and OS lifecycle edge cases.
- SQLite can improve durability/consistency, but requires plugin integration and migration logic.

Tauri:
- SQLite integration is feasible via plugin/native side and can be clean if capabilities are configured well.
- Still need explicit migration path from IndexedDB/localStorage if switching authority.

#### Migration strategy recommendation

If moving to SQLite:
1. Versioned migration gate on startup.
2. One-time import from IndexedDB -> SQLite.
3. Validation checksum/count before cutover.
4. Mark migration complete flag in localStorage.
5. Keep read-only fallback from IndexedDB for one release window, then retire.

If staying on IndexedDB:
1. Keep existing adapter architecture.
2. Tighten schema versioning and corruption recovery flows.
3. Keep localStorage only for non-authoritative settings.

## Packaging Choice Pressure from NYI Items

These NYI items shift tradeoff weight as follows:

1. Single-pattern share feature:
- Neutral to slight advantage for Electron/Tauri (desktop native file APIs).
- Still fully achievable in Capacitor with plugin-based flows.

2. Splash policy with "load last pattern":
- Neutral for desktop.
- On mobile, requires careful resume semantics regardless of Capacitor or Tauri mobile.

3. Potential SQLite adoption:
- Slight advantage for Electron (operational simplicity on desktop).
- Strongly manageable in Capacitor/Tauri, but adds integration and migration complexity.

Overall, these NYI points are compatible with all three frameworks, but they reinforce the value of:
1. Implementing the platform services adapter first.
2. Defining a single persistence authority model early (IndexedDB-first or SQLite-first).
3. Treating app lifecycle semantics (launch vs resume) as a first-class mobile requirement.
