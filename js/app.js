var EXPERIENCE_LIBRARY = window.EXPERIENCE_LIBRARY || Object.freeze({});
var EXPERIENCE_ADAPTERS = window.EXPERIENCE_ADAPTERS || Object.freeze({});
var DISCOVERY_LIBRARY = window.DISCOVERY_LIBRARY || Object.freeze({});
var DISCOVERY_FEATURE_FLAGS = window.DISCOVERY_FEATURE_FLAGS || Object.freeze({ rosetteDiscovery: false });
var STITCHING_LOGIC = window.STITCHING_LOGIC || Object.freeze({});
var TRIANGULA_LOGIC = window.TRIANGULA_LOGIC || Object.freeze({});
var normalizeTriangulaDrawableCount = TRIANGULA_LOGIC.normalizeTriangulaDrawableCount;
var sanitizeTriangulaCount = TRIANGULA_LOGIC.sanitizeTriangulaCount;
var sanitizeTriangulaColorMode = TRIANGULA_LOGIC.sanitizeTriangulaColorMode;
var sanitizeTriangulaConstructionMode = TRIANGULA_LOGIC.sanitizeTriangulaConstructionMode;
var sanitizeTriangulaFractalMode = TRIANGULA_LOGIC.sanitizeTriangulaFractalMode;
var sanitizeTriangulaFitMode = TRIANGULA_LOGIC.sanitizeTriangulaFitMode;
var stepTriangulaCount = TRIANGULA_LOGIC.stepTriangulaCount;
var isTriangulaColorScopeVisible = TRIANGULA_LOGIC.isTriangulaColorScopeVisible;
var captureTriangulaState = TRIANGULA_LOGIC.captureTriangulaExperienceState;
var applyTriangulaState = TRIANGULA_LOGIC.applyTriangulaExperienceState;
var buildTriangulaUrlState = TRIANGULA_LOGIC.buildTriangulaUrlState;
var hydrateTriangulaUrlState = TRIANGULA_LOGIC.hydrateTriangulaUrlState;
var getTriangulaExportProfileForExperience = TRIANGULA_LOGIC.getExportProfileForExperience;
var parseBoundedInt = STITCHING_LOGIC.parseBoundedInt;
var sanitizeThreadJumpMode = STITCHING_LOGIC.sanitizeThreadJumpMode;
var sanitizeThreadColor = STITCHING_LOGIC.sanitizeThreadColor;
var sanitizeThreadColorList = STITCHING_LOGIC.sanitizeThreadColorList;
var sanitizeThreadDescriptor = STITCHING_LOGIC.sanitizeThreadDescriptor;
var sanitizeThreadList = STITCHING_LOGIC.sanitizeThreadList;
var ensureThreadList = STITCHING_LOGIC.ensureThreadList;
var serializeStitchingThreadState = STITCHING_LOGIC.serializeStitchingThreadState;
var parseStitchingThreadState = STITCHING_LOGIC.parseStitchingThreadState;
var buildStitchingUrlState = STITCHING_LOGIC.buildStitchingUrlState;
var hydrateStitchingUrlState = STITCHING_LOGIC.hydrateStitchingUrlState;

paper.install(window);
paper.setup('myCanvas');

/* ------------------------------
   BASIC STATE
------------------------------ */
var holesSlider = document.getElementById('holes');
var jumpSlider  = document.getElementById('jump');
var multiplySlider = document.getElementById('multiply');
var widthSlider = document.getElementById('width');
var kidStitchBySelect = document.getElementById('kid-stitch-by');
var addSliderBlock = document.getElementById('add-slider-block');
var multiplySliderBlock = document.getElementById('multiply-slider-block');
var advancedShapeSelect = document.getElementById('advanced-shape');
var advancedHolesNumberInput = document.getElementById('advanced-holes-number');
var advancedHoleNumbersToggle = document.getElementById('advanced-hole-numbers');
var advancedBorderEnabledInput = document.getElementById('advanced-border-enabled');
var advancedTempoInput = document.getElementById('advanced-tempo');
var advancedTempoValue = document.getElementById('advanced-tempo-value');
var resetTempoBtn = document.getElementById('reset-tempo');
var exportSvgBtn = document.getElementById('advanced-export-svg');
var exportOptionsModal = document.getElementById('export-options-modal');
var exportNameInput = document.getElementById('export-name-input');
var exportIncludeThreadsInput = document.getElementById('export-include-threads');
var exportIncludeGuideInput = document.getElementById('export-include-guide');
var exportIncludePreviewInput = document.getElementById('export-include-preview');
var exportConfirmBtn = document.getElementById('export-confirm-btn');
var exportCancelBtn = document.getElementById('export-cancel-btn');
var canvasContainer = document.getElementById('canvas-container');
var canvasStage = document.getElementById('canvas-stage');
var shapeButtons = Array.prototype.slice.call(document.querySelectorAll('.shape-btn'));
var holesSliderBlock = holesSlider ? holesSlider.closest('.slider-block') : null;
var stitchBySliderBlock = kidStitchBySelect ? kidStitchBySelect.closest('.slider-block') : null;
var jumpSliderBlock = document.getElementById('add-slider-block');
var multiplyMathSliderBlock = document.getElementById('multiply-slider-block');
var widthSliderBlock = widthSlider ? widthSlider.closest('.slider-block') : null;
var triangulaColorScopeBlock = document.getElementById('triangula-color-scope-block');
var triangulaModeBlock = document.getElementById('triangula-mode-block');
var triangulaStartBlock = document.getElementById('triangula-start-block');
var triangulaTargetBlock = document.getElementById('triangula-target-block');
var triangulaColorScopeSelect = document.getElementById('triangula-color-scope');
var triangulaConstructionModeSelect = document.getElementById('triangula-construction-mode');
var triangulaStartSlider = document.getElementById('triangula-start-count');
var triangulaTargetSlider = document.getElementById('triangula-target-count');
var triangulaStartValue = document.getElementById('triangula-start-value');
var triangulaTargetValue = document.getElementById('triangula-target-value');
var triangulaStartNumberInput = document.getElementById('triangula-start-number');
var triangulaTargetNumberInput = document.getElementById('triangula-target-number');
var triangulaStartDiv3Btn = document.getElementById('triangula-start-div3');
var triangulaStartMul3Btn = document.getElementById('triangula-start-mul3');
var triangulaStartDec10Btn = document.getElementById('triangula-start-dec10');
var triangulaStartInc10Btn = document.getElementById('triangula-start-inc10');
var triangulaTargetDiv3Btn = document.getElementById('triangula-target-div3');
var triangulaTargetMul3Btn = document.getElementById('triangula-target-mul3');
var triangulaTargetDec10Btn = document.getElementById('triangula-target-dec10');
var triangulaTargetInc10Btn = document.getElementById('triangula-target-inc10');
var triangulaFractalModeSelect = document.getElementById('triangula-fractal-mode');
var triangulaFitModeSelect = document.getElementById('triangula-fit-mode');
var triangulaAdvancedSubsection = document.getElementById('triangula-advanced-subsection');
var addMagicThreadBtn = document.getElementById('add-magic-thread');
var removeLastThreadBtn = document.getElementById('remove-last-thread');
var addThreadBtn = document.getElementById('add-thread');
var threadControlsContainer = document.getElementById('thread-controls');
var advancedThreadsTitle = document.querySelector('#advanced-panel .advanced-section-title');
var holeNumbersToggleBtn = document.getElementById('toggle-hole-numbers');
var backToStitchingBtn = document.getElementById('back-to-stitching');
var discoveryReturnRow = document.getElementById('discovery-return-row');
var discoveryToggleBtn = document.getElementById('discovery-toggle');
var closeDiscoveryBtn = document.getElementById('close-discovery');
var paletteContainer = document.getElementById('palette');
var musicToggleBtn = document.getElementById('toggle-music');
var kidThreadPicker = document.getElementById('kid-thread-picker');
var kidThreadToggle = document.getElementById('kid-thread-toggle');
var kidThreadMenu = document.getElementById('kid-thread-menu');
var kidSongPicker = document.getElementById('kid-song-picker');
var kidSongToggle = document.getElementById('kid-song-toggle');
var kidSongMenu = document.getElementById('kid-song-menu');
var kidSongIcon = document.querySelector('#kid-song-toggle .kid-song-icon');
var kidThreadActiveSwatch = document.getElementById('kid-thread-active-swatch');
var kidThreadActiveLabel = document.getElementById('kid-thread-active-label');
var holesValue  = document.getElementById('holes-value');
var jumpValue   = document.getElementById('jump-value');
var multiplyValue = document.getElementById('multiply-value');
var widthValue  = document.getElementById('width-value');
var animateBtn  = document.getElementById('animate');
var kidTempoSlowBtn = document.getElementById('kid-tempo-slow');
var kidTempoNormalBtn = document.getElementById('kid-tempo-normal');
var kidTempoFastBtn = document.getElementById('kid-tempo-fast');
var gearBtn     = document.getElementById('gear');
var closeAdvancedBtn = document.getElementById('close-advanced');
var advancedPanel = document.getElementById('advanced-panel');
var discoveryPanel = document.getElementById('discovery-panel');
var discoveryCards = document.getElementById('discovery-cards');
var discoveryToast = document.getElementById('discovery-toast');
var discoveryPassphraseForm = document.getElementById('discovery-passphrase-form');
var discoveryPassphraseInput = document.getElementById('discovery-passphrase-input');
var discoveryPassphraseFeedback = document.getElementById('discovery-passphrase-feedback');
var experienceInline = document.getElementById('experience-inline');
var experienceTitleLabel = document.getElementById('experience-title-label');
var experienceSrTitle = document.getElementById('experience-sr-title');
var experienceInfoToggle = document.getElementById('experience-info-toggle');
var experienceInfoPanel = document.getElementById('experience-info-panel');
var experienceInfoTitle = document.getElementById('experience-info-title');
var experienceInfoText = document.getElementById('experience-info-text');
var experienceInfoClose = document.getElementById('experience-info-close');
var experienceNarrateToggle = document.getElementById('experience-narrate-toggle');
var experienceNarrationStatus = document.getElementById('experience-narration-status');

/* ------------------------------
   UI REGISTRIES (MAINTAINABILITY)
  CORE_UI: shared controls across experiences.
  STITCHER_UI: controls tied to stitching-style interaction.
  EXPERIENCE_UI: controls specific to an experience implementation.
------------------------------ */
var CORE_UI = Object.freeze({
  discoveryReturnRow: discoveryReturnRow,
  paletteContainer: paletteContainer,
  animateBtn: animateBtn,
  advancedTempoInput: advancedTempoInput,
  advancedTempoValue: advancedTempoValue,
  resetTempoBtn: resetTempoBtn,
  kidTempoSlowBtn: kidTempoSlowBtn,
  kidTempoNormalBtn: kidTempoNormalBtn,
  kidTempoFastBtn: kidTempoFastBtn,
  musicToggleBtn: musicToggleBtn,
  kidSongPicker: kidSongPicker,
  kidSongToggle: kidSongToggle,
  kidSongMenu: kidSongMenu,
  kidSongIcon: kidSongIcon
});

var STITCHER_UI = Object.freeze({
  holesSliderBlock: holesSliderBlock,
  stitchBySliderBlock: stitchBySliderBlock,
  jumpSliderBlock: jumpSliderBlock,
  multiplyMathSliderBlock: multiplyMathSliderBlock,
  widthSliderBlock: widthSliderBlock,
  advancedShapeSelect: advancedShapeSelect,
  advancedBorderEnabledInput: advancedBorderEnabledInput,
  advancedHoleNumbersToggle: advancedHoleNumbersToggle,
  advancedHolesNumberInput: advancedHolesNumberInput,
  addMagicThreadBtn: addMagicThreadBtn,
  removeLastThreadBtn: removeLastThreadBtn,
  kidThreadPicker: kidThreadPicker,
  addThreadBtn: addThreadBtn,
  advancedThreadsTitle: advancedThreadsTitle,
  threadControlsContainer: threadControlsContainer,
  holeNumbersToggleBtn: holeNumbersToggleBtn
});

var EXPERIENCE_UI = Object.freeze({
  triangulaColorScopeBlock: triangulaColorScopeBlock,
  triangulaModeBlock: triangulaModeBlock,
  triangulaStartBlock: triangulaStartBlock,
  triangulaTargetBlock: triangulaTargetBlock,
  triangulaColorScopeSelect: triangulaColorScopeSelect,
  triangulaConstructionModeSelect: triangulaConstructionModeSelect,
  triangulaAdvancedSubsection: triangulaAdvancedSubsection
});

/* ------------------------------
   BEHAVIOR REGISTRIES (MAINTAINABILITY)
   CORE_BEHAVIOR: shared app flow and lifecycle behaviors.
   STITCHER_BEHAVIOR: stitching/discovery-specific behaviors.
   EXPERIENCE_BEHAVIOR: experience transition and experience-owned behavior.
------------------------------ */
var CORE_BEHAVIOR = Object.freeze({
  applyStateFromCurrentUrl: applyStateFromCurrentUrl,
  scheduleUrlStateSync: scheduleUrlStateSync,
  updateMusicPlaybackState: updateMusicPlaybackState,
  applyTempoValue: applyTempoValue,
  applyDefaultTempo: applyDefaultTempo,
  renderAdvancedTempoOptions: renderAdvancedTempoOptions,
  redrawForPathChange: redrawForPathChange,
  redrawAnimationInPlace: redrawAnimationInPlace
});

var STITCHER_BEHAVIOR = Object.freeze({
  evaluateDiscoveryCandidates: evaluateDiscoveryCandidates,
  scheduleDiscoveryEvaluation: scheduleDiscoveryEvaluation,
  getDiscoveryCandidateThreads: getDiscoveryCandidateThreads,
  computeSegments: computeSegments
});

var EXPERIENCE_BEHAVIOR = Object.freeze({
  setCurrentExperience: setCurrentExperience,
  applyExperienceUiPolicy: applyExperienceUiPolicy,
  syncTriangulaControls: syncTriangulaControls,
  applyTriangulaCountUpdate: applyTriangulaCountUpdate
});

/* ------------------------------
   CONTROL CATALOG (MAINTAINABILITY)
   Canonical keys + element mapping for uiProfile control booleans.
------------------------------ */
var CONTROL_KEYS = Object.freeze({
  BASIC: Object.freeze({
    holes: 'holes',
    stitchBy: 'stitchBy',
    add: 'add',
    multiply: 'multiply',
    width: 'width',
    triangulaColorScope: 'triangulaColorScope',
    triangulaConstructionMode: 'triangulaConstructionMode',
    triangulaStartCount: 'triangulaStartCount',
    triangulaTargetCount: 'triangulaTargetCount'
  }),
  ADVANCED: Object.freeze({
    shape: 'shape',
    border: 'border',
    holeNumbers: 'holeNumbers',
    holesNumber: 'holesNumber',
    threads: 'threads',
    triangulaAnimationFitMode: 'triangulaAnimationFitMode'
  })
});

var BASIC_CONTROL_CATALOG = Object.freeze({
  [CONTROL_KEYS.BASIC.holes]: {
    element: STITCHER_UI.holesSliderBlock,
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.BASIC.holes] !== false; }
  },
  [CONTROL_KEYS.BASIC.stitchBy]: {
    element: STITCHER_UI.stitchBySliderBlock,
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.BASIC.stitchBy] !== false; }
  },
  [CONTROL_KEYS.BASIC.add]: {
    element: STITCHER_UI.jumpSliderBlock,
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.BASIC.add] !== false; }
  },
  [CONTROL_KEYS.BASIC.multiply]: {
    element: STITCHER_UI.multiplyMathSliderBlock,
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.BASIC.multiply] !== false; }
  },
  [CONTROL_KEYS.BASIC.width]: {
    element: STITCHER_UI.widthSliderBlock,
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.BASIC.width] !== false; }
  },
  [CONTROL_KEYS.BASIC.triangulaColorScope]: {
    element: EXPERIENCE_UI.triangulaColorScopeBlock,
    visibleWhen: function(controls) {
      return isTriangulaColorScopeVisible(controls, currentExperienceId, triangulaConstructionMode);
    }
  },
  [CONTROL_KEYS.BASIC.triangulaConstructionMode]: {
    element: EXPERIENCE_UI.triangulaModeBlock,
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.BASIC.triangulaConstructionMode] === true; }
  },
  [CONTROL_KEYS.BASIC.triangulaStartCount]: {
    element: EXPERIENCE_UI.triangulaStartBlock,
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.BASIC.triangulaStartCount] === true; }
  },
  [CONTROL_KEYS.BASIC.triangulaTargetCount]: {
    element: EXPERIENCE_UI.triangulaTargetBlock,
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.BASIC.triangulaTargetCount] === true; }
  }
});

var ADVANCED_CONTROL_CATALOG = Object.freeze({
  [CONTROL_KEYS.ADVANCED.shape]: {
    getElement: function() {
      return STITCHER_UI.advancedShapeSelect ? STITCHER_UI.advancedShapeSelect.parentElement : null;
    },
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.ADVANCED.shape] !== false; }
  },
  [CONTROL_KEYS.ADVANCED.border]: {
    getElement: function() {
      return STITCHER_UI.advancedBorderEnabledInput ? STITCHER_UI.advancedBorderEnabledInput.parentElement : null;
    },
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.ADVANCED.border] !== false; }
  },
  [CONTROL_KEYS.ADVANCED.holeNumbers]: {
    getElement: function() {
      return STITCHER_UI.advancedHoleNumbersToggle ? STITCHER_UI.advancedHoleNumbersToggle.parentElement : null;
    },
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.ADVANCED.holeNumbers] !== false; }
  },
  [CONTROL_KEYS.ADVANCED.holesNumber]: {
    getElement: function() {
      return STITCHER_UI.advancedHolesNumberInput ? STITCHER_UI.advancedHolesNumberInput.parentElement : null;
    },
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.ADVANCED.holesNumber] !== false; }
  },
  [CONTROL_KEYS.ADVANCED.threads]: {
    getElementSet: function() {
      return [
        STITCHER_UI.advancedThreadsTitle,
        STITCHER_UI.addThreadBtn,
        STITCHER_UI.threadControlsContainer
      ];
    },
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.ADVANCED.threads] !== false; }
  },
  [CONTROL_KEYS.ADVANCED.triangulaAnimationFitMode]: {
    element: EXPERIENCE_UI.triangulaAdvancedSubsection,
    visibleWhen: function(controls) { return controls[CONTROL_KEYS.ADVANCED.triangulaAnimationFitMode] === true; }
  }
});

function getControlCatalogKeys(catalog) {
  return Object.keys(catalog || {});
}

function validateExperienceControlProfile(profile, experienceId) {
  if (!profile) return;

  var basicControls = profile.basicControls || {};
  var advancedControls = profile.advancedControls || {};
  var knownBasicKeys = Object.keys(CONTROL_KEYS.BASIC).map(function(keyName) {
    return CONTROL_KEYS.BASIC[keyName];
  });
  var knownAdvancedKeys = Object.keys(CONTROL_KEYS.ADVANCED).map(function(keyName) {
    return CONTROL_KEYS.ADVANCED[keyName];
  });

  Object.keys(basicControls).forEach(function(key) {
    if (knownBasicKeys.indexOf(key) === -1) {
      console.warn('Unknown basic control key in uiProfile for experience', experienceId, key);
    }
  });

  Object.keys(advancedControls).forEach(function(key) {
    if (knownAdvancedKeys.indexOf(key) === -1) {
      console.warn('Unknown advanced control key in uiProfile for experience', experienceId, key);
    }
  });
}

var threads = [
  {
    jump: 22,
    width: 2,
    color: '#1982c4',
    sequence: null,
    jumpMode: 'fixed',
    jumpFormula: 'skip',
    jumpSequence: '',
    connectMultiplier: 2,
    connectOffset: 0
  }
];
var selectedThreadIndex = 0;

var points = [];
var animationActive = false;
var animationState = null;
var animationPlaybackState = 'idle';
var canvasResizeObserver = null;
var showHoleNumbers = true;
var holeNumberLabelsByIndex = Object.create(null);
var highlightedHoleNumbers = [];

var DEFAULT_HOLES = 35;
var DEFAULT_SKIP = 22;
var DEFAULT_THREAD_SIZE = 2;
var MAX_HOLES = 140;
var HOLE_NUMBER_AUTO_HIDE_THRESHOLD = 80;
var DEFAULT_ANIMATION_BPM = 84;
var BEATS_PER_STITCH_SEGMENT = 1;
var currentAnimationBpm = DEFAULT_ANIMATION_BPM;
var DEFAULT_TEMPO_OPTIONS = [84, 168, 252, 336, 420];
var SONG_TEMPO_OPTIONS = {
  bach: DEFAULT_TEMPO_OPTIONS.slice(),
  triangle: [110, 220, 330, 440, 550],
  square: [150, 300, 450, 600, 750],
  // Placeholder values until measured BPM-based sets are finalized.
  rosette: DEFAULT_TEMPO_OPTIONS.slice()
};
var MUSIC_LIBRARY = {
  bach: {
    title: 'Bach_Fugue_21_in_BbMajor',
    path: 'assets/audio/Bach_Fugue_21_in_BbMajor.mp3'
  },
  triangle: {
    title: 'Bach_Cantata_BWV_29_Sinfonia',
    path: 'assets/audio/Bach_Cantata_BWV_29_Sinfonia.mp3'
  },
  square: {
    title: 'GregorQuendel_Korobeiniki_for_Piano',
    path: 'assets/audio/GregorQuendel_Korobeiniki_for_Piano.mp3'
  },
  rosette: {
    title: 'djovan-the-voice-of-the-oud-258611',
    path: 'assets/audio/djovan-the-voice-of-the-oud-258611.mp3'
  }
};
var DISCOVERY_STABILIZE_MS = 900;
var ROSETTE_DISCOVERY_ENABLED = !!DISCOVERY_FEATURE_FLAGS.rosetteDiscovery;
var DISCOVERY_FLOAT_DURATION_MS = 4400;
var discoveryTimer = null;
var discoveredShapeKeys = Object.create(null);
var unlockedSongIds = [];
var currentSongId = 'bach';
var hasUnseenDiscoveries = false;
var hasUnseenSongUnlock = false;
var discoveryToastTimer = null;
var SLIDER_MOTION_SETTLE_MS = 180;
var STITCH_PULL_SETTLE_SECONDS = 0.18; // was 120ms, increased to 180ms for a slightly more relaxed feel
var STITCH_PULL_SETTLE_OVERSHOOT = 0.027;
var pendingCanvasFit = false;
var BORDER_STROKE_WIDTH = 2;
var BORDER_INNER_GAP = 10;
var BORDER_OUTER_GAP = 17;
var LABEL_HOLE_CLEARANCE = 2.2;
var LABEL_HOLE_CLEARANCE_SVG = 4.2;
var LABEL_BORDER_CLEARANCE = 1.2;
var LABEL_BORDER_CLEARANCE_SVG = 3.2;
var LABEL_OUTER_BIAS = 0.72;
var BORDER_STROKE_COLOR = '#2f4368';
var BORDER_INCLUDE_IN_SVG = true;
// Other supported values: 'pos-bottom-center', 'pos-top-left', 'pos-top-right'.
var EXPERIENCE_OVERLAY_POSITION_CLASS = 'pos-top-center';
var DEFAULT_EXPERIENCE_ID = 'stitching';

var borderEnabled = true;

var currentExperienceId = DEFAULT_EXPERIENCE_ID;
var runtimeStateStore = null;
var experienceNarrationUtterance = null;
var triangulaColorMode = 'band-1';
var triangulaConstructionMode = 'shrink-duplicate';
var triangulaStartCount = 1;
var triangulaTargetCount = 3;
var triangulaFractalMode = 'series';
var triangulaFitMode = 'locked';
var triangulaAnimationState = null;
var triangulaBandColors = {
  band1: '#1982c4',
  band2: '#1982c4',
  band4: '#1982c4'
};
var experienceStateManager = null;
var EXPERIENCE_ENGINE_REGISTRY = Object.create(null);
var EXPERIENCE_STATE_HANDLERS = Object.create(null);
var EXPERIENCE_URL_HANDLERS = Object.create(null);
var EXPERIENCE_TRAIL_COLOR_HANDLERS = Object.create(null);
var EXPERIENCE_EXPORT_HANDLERS = Object.create(null);
var EXPERIENCE_EXPORT_PROFILES = Object.create(null);
var stitchingUiModule = null;
var stitchingRenderModule = null;
var stitchingExportModule = null;
var triangulaUiModule = null;
var triangulaRenderModule = null;
var triangulaExportModule = null;
var stitchingStateModule = null;
var triangulaStateModule = null;
var triangulaCoreModule = null;
var urlStateService = null;
var experienceStateCache = null;

var APP_STATE_URL_VERSION = '1';
var EXPERIENCE_STATE_CACHE_SCHEMA_VERSION = '1';
var URL_SYNC_DEBOUNCE_MS = 800;
var urlSyncTimer = null;
var urlSyncSuspended = false;
var appState = {
  version: APP_STATE_URL_VERSION,
  experienceId: DEFAULT_EXPERIENCE_ID,
  common: {
    shape: 'circle',
    bpm: DEFAULT_ANIMATION_BPM,
    musicMuted: false,
    songId: 'bach'
  },
  stitching: {
    holes: DEFAULT_HOLES,
    selectedThreadIndex: 0,
    threadColors: ['#1982c4'],
    threadState: '',
    showHoleNumbers: true,
    borderEnabled: true
  },
  triangula: {
    colorMode: 'band-1',
    constructionMode: 'shrink-duplicate',
    startCount: 1,
    targetCount: 3,
    fractalMode: 'series',
    fitMode: 'locked',
    sourceColor: '#1982c4',
    band1Color: '#1982c4',
    band2Color: '#6a4c93',
    band4Color: '#8ac926'
  }
};

var URL_STATE_PARAM_KEYS = Object.freeze({
  version: 'version',
  experience: 'experience',
  shape: 'shape',
  bpm: 'bpm',
  musicMuted: 'musicMuted',
  songId: 'songId',
  showHoleNumbers: 'showHoleNumbers',
  borderEnabled: 'borderEnabled',
  stitchingHoles: 'stitchingHoles',
  selectedThreadIndex: 'selectedThreadIndex',
  threadState: 'threadState',
  threadColors: 'threadColors',
  triangulaSourceColor: 'triangulaSourceColor',
  triangulaColorMode: 'triangulaColorMode',
  triangulaConstructionMode: 'triangulaConstructionMode',
  triangulaStartCount: 'triangulaStartCount',
  triangulaTargetCount: 'triangulaTargetCount',
  triangulaFractalMode: 'triangulaFractalMode',
  triangulaFitMode: 'triangulaFitMode',
  triangulaBand1Color: 'triangulaBand1Color',
  triangulaBand2Color: 'triangulaBand2Color',
  triangulaBand4Color: 'triangulaBand4Color'
});

function setUrlStateParam(params, logicalKey, value) {
  var key = URL_STATE_PARAM_KEYS[logicalKey];
  if (!key) return;
  params.set(key, value);
}

function getUrlStateParam(params, logicalKey) {
  var key = URL_STATE_PARAM_KEYS[logicalKey];
  if (!key || !params.has(key)) return null;
  return params.get(key);
}

function hasUrlStateKey(params, logicalKey) {
  var key = URL_STATE_PARAM_KEYS[logicalKey];
  return !!key && params.has(key);
}

function withUrlSyncSuspended(work) {
  var wasSuspended = urlSyncSuspended;
  urlSyncSuspended = true;
  try {
    work();
  } finally {
    urlSyncSuspended = wasSuspended;
  }
}

function getStitchingUiModule() {
  if (stitchingUiModule || typeof window.createStitchingUiModule !== 'function') {
    return stitchingUiModule;
  }

  stitchingUiModule = window.createStitchingUiModule({
    holesValue: holesValue,
    holesSlider: holesSlider,
    jumpValue: jumpValue,
    jumpSlider: jumpSlider,
    multiplyValue: multiplyValue,
    multiplySlider: multiplySlider,
    widthValue: widthValue,
    widthSlider: widthSlider,
    advancedHolesNumberInput: advancedHolesNumberInput,
    advancedBorderEnabledInput: advancedBorderEnabledInput,
    addSliderBlock: addSliderBlock,
    kidStitchBySelect: kidStitchBySelect,
    multiplySliderBlock: multiplySliderBlock,
    threadControlsContainer: threadControlsContainer,
    parseBoundedInt: parseBoundedInt,
    maxHoles: MAX_HOLES,
    getThreads: function() { return threads; },
    getCurrentExperienceId: function() { return currentExperienceId; },
    getExperienceUiProfile: getExperienceUiProfile,
    getTriangulaBandColors: function() { return triangulaBandColors; },
    normalizeTriangulaFillColor: function(c, f) { return getTriangulaCoreModule().normalizeTriangulaFillColor(c, f); },
    getSelectedThreadIndex: function() { return selectedThreadIndex; },
    setSelectedThreadIndex: function(nextIndex) { selectedThreadIndex = nextIndex; },
    getBorderEnabled: function() { return borderEnabled; },
    getShowHoleNumbers: function() { return showHoleNumbers; },
    getMagicThreadColors: function() { return magicThreadColors; },
    getDefaultThreadSize: function() { return DEFAULT_THREAD_SIZE; },
    ensureThreadConnectConfig: ensureThreadConnectConfig,
    redrawForPathChange: redrawForPathChange,
    redrawAnimationInPlace: redrawAnimationInPlace,
    kidThreadPicker: kidThreadPicker,
    kidThreadMenu: kidThreadMenu,
    removeLastThreadBtn: removeLastThreadBtn,
    kidThreadToggle: kidThreadToggle,
    kidThreadActiveLabel: kidThreadActiveLabel,
    kidThreadActiveSwatch: kidThreadActiveSwatch,
    holeNumbersToggleBtn: holeNumbersToggleBtn,
    advancedHoleNumbersToggle: advancedHoleNumbersToggle
  });

  return stitchingUiModule;
}

function getStitchingRenderModule() {
  if (stitchingRenderModule || typeof window.createStitchingRenderModule !== 'function') {
    return stitchingRenderModule;
  }

  stitchingRenderModule = window.createStitchingRenderModule({
    getPoints: function() { return points; },
    getThreads: function() { return threads; },
    getAnimationState: function() { return animationState; },
    getBorderEnabled: function() { return borderEnabled; },
    getBorderStrokeColor: function() { return BORDER_STROKE_COLOR; },
    getBorderStrokeWidth: function() { return BORDER_STROKE_WIDTH; },
    getBorderGeometryForCurrentShape: getBorderGeometryForCurrentShape,
    ensureThreadConnectConfig: ensureThreadConnectConfig,
    rainbowColor: rainbowColor,
    clearLayer: function() { project.activeLayer.removeChildren(); },
    computePoints: computePoints,
    drawHoles: function() {
      if (stitchingRuntime && typeof stitchingRuntime.drawHoles === 'function') {
        stitchingRuntime.drawHoles();
      }
    },
    drawAnimatedSegments: drawAnimatedSegments,
    drawAnimatedSegmentProgress: drawAnimatedSegmentProgress,
    drawSegmentSettleAccent: drawSegmentSettleAccent,
    getAnimationSecondsPerSegment: getAnimationSecondsPerSegment,
    syncHoleNumberHighlightFromAnimationState: syncHoleNumberHighlightFromAnimationState,
    bringHoleNumbersToFront: function() {
      if (stitchingRuntime && typeof stitchingRuntime.bringHoleNumbersToFront === 'function') {
        stitchingRuntime.bringHoleNumbersToFront();
      }
    },
    drawStatic: drawStatic
  });

  return stitchingRenderModule;
}

function getStitchingExportModule() {
  if (stitchingExportModule || typeof window.createStitchingExportModule !== 'function') {
    return stitchingExportModule;
  }

  stitchingExportModule = window.createStitchingExportModule({
    computePoints: computePoints,
    getViewSize: function() { return view.viewSize; },
    getBorderEnabled: function() { return borderEnabled; },
    getBorderIncludeInSvg: function() { return BORDER_INCLUDE_IN_SVG; },
    getBorderStrokeColor: function() { return BORDER_STROKE_COLOR; },
    getBorderStrokeWidth: function() { return BORDER_STROKE_WIDTH; },
    getBorderOuterGap: function() { return BORDER_OUTER_GAP; },
    getBorderGeometryForCurrentShape: getBorderGeometryForCurrentShape,
    svgPathFromPoints: svgPathFromPoints,
    colorToSvg: colorToSvg,
    formatSvgNumber: formatSvgNumber,
    rainbowColor: rainbowColor,
    computeSegments: computeSegments,
    getThreads: function() { return threads; },
    getPoints: function() { return points; },
    shouldShowHoleNumbersNow: function() { return stitchingRuntime && typeof stitchingRuntime.shouldShowHoleNumbersNow === 'function' ? stitchingRuntime.shouldShowHoleNumbersNow() : false; },
    getHolesValue: function() { return holesSlider.value; },
    getDefaultHoles: function() { return DEFAULT_HOLES; },
    getHoleNumberFontSize: function(holeCount) { return stitchingRuntime && typeof stitchingRuntime.getHoleNumberFontSize === 'function' ? stitchingRuntime.getHoleNumberFontSize(holeCount) : 9; },
    signedAreaOfClosedPolyline: signedAreaOfClosedPolyline,
    getOutwardDirectionAtHole: function(index, ccw) { return stitchingRuntime && typeof stitchingRuntime.getOutwardDirectionAtHole === 'function' ? stitchingRuntime.getOutwardDirectionAtHole(index, ccw) : new Point(0, -1); },
    estimateTextExtentAlongDirection: function(text, fontSize) { return stitchingRuntime && typeof stitchingRuntime.estimateTextExtentAlongDirection === 'function' ? stitchingRuntime.estimateTextExtentAlongDirection(text, fontSize) : Math.max(0, Number(fontSize) || 0); },
    getHoleLabelOffsetFromExtent: function(extent, bc, hc) { return stitchingRuntime && typeof stitchingRuntime.getHoleLabelOffsetFromExtent === 'function' ? stitchingRuntime.getHoleLabelOffsetFromExtent(extent, bc, hc) : { offset: 4, minOffset: 4, maxOffset: 4 }; },
    getLabelBorderClearanceSvg: function() { return LABEL_BORDER_CLEARANCE_SVG; },
    getLabelHoleClearanceSvg: function() { return LABEL_HOLE_CLEARANCE_SVG; },
    getCurrentShape: function() { return currentShape; },
    ensureThreadConnectConfig: ensureThreadConnectConfig
  });

  return stitchingExportModule;
}

function getTriangulaUiModule() {
  if (triangulaUiModule || typeof window.createTriangulaUiModule !== 'function') {
    return triangulaUiModule;
  }

  triangulaUiModule = window.createTriangulaUiModule({
    normalizeTriangulaDrawableCount: normalizeTriangulaDrawableCount,
    getTriangulaStartCount: function() { return triangulaStartCount; },
    getTriangulaTargetCount: function() { return triangulaTargetCount; },
    setTriangulaStartCount: function(nextValue) { triangulaStartCount = nextValue; },
    setTriangulaTargetCount: function(nextValue) { triangulaTargetCount = nextValue; },
    getTriangulaStartSlider: function() { return triangulaStartSlider; },
    getTriangulaTargetSlider: function() { return triangulaTargetSlider; },
    getTriangulaStartValue: function() { return triangulaStartValue; },
    getTriangulaTargetValue: function() { return triangulaTargetValue; },
    getTriangulaStartNumberInput: function() { return triangulaStartNumberInput; },
    getTriangulaTargetNumberInput: function() { return triangulaTargetNumberInput; },
    getTriangulaColorScopeSelect: function() { return triangulaColorScopeSelect; },
    getTriangulaConstructionModeSelect: function() { return triangulaConstructionModeSelect; },
    getTriangulaFractalModeSelect: function() { return triangulaFractalModeSelect; },
    getTriangulaFitModeSelect: function() { return triangulaFitModeSelect; },
    getTriangulaColorMode: function() { return triangulaColorMode; },
    getTriangulaConstructionMode: function() { return triangulaConstructionMode; },
    getTriangulaFractalMode: function() { return triangulaFractalMode; },
    getTriangulaFitMode: function() { return triangulaFitMode; },
    getExperienceUiProfile: getExperienceUiProfile,
    getCurrentExperienceId: function() { return currentExperienceId; },
    getTriangulaColorScopeBlock: function() { return triangulaColorScopeBlock; },
    isTriangulaColorScopeVisible: isTriangulaColorScopeVisible,
    setElementDisplay: setElementDisplay,
    redrawForPathChange: redrawForPathChange
  });

  return triangulaUiModule;
}

function getTriangulaRenderModule() {
  if (triangulaRenderModule || typeof window.createTriangulaRenderModule !== 'function') {
    return triangulaRenderModule;
  }

  triangulaRenderModule = window.createTriangulaRenderModule({
    getTriangulaBaseTriangle: function(s) { return getTriangulaCoreModule().getTriangulaBaseTriangle(s); },
    getTriangulaFillColorForSlot: function(slot, seq) { return getTriangulaCoreModule().getTriangulaFillColorForSlot(slot, seq); },
    getTriangulaStrokeColorForSlot: function(slot, seq) { return getTriangulaCoreModule().getTriangulaStrokeColorForSlot(slot, seq); },
    drawTrianglePath: function(v, opts) { return getTriangulaCoreModule().drawTrianglePath(v, opts); },
    drawTriangleStrokeProgress: function(v, opts, p) { return getTriangulaCoreModule().drawTriangleStrokeProgress(v, opts, p); },
    collectCutTrianglesAtDepth: function(v, d, cd, col) { return getTriangulaCoreModule().collectCutTrianglesAtDepth(v, d, cd, col); },
    collectTrianglesAtDepth: function(v, d, cd, s, col) { return getTriangulaCoreModule().collectTrianglesAtDepth(v, d, cd, s, col); },
    collectParentChildTransitionsAtDepth: function(v, d, cd, col) { return getTriangulaCoreModule().collectParentChildTransitionsAtDepth(v, d, cd, col); },
    toRgbaColor: toRgbaColor,
    createPath: function() { return new Path(); },
    getTriangulaConstructionMode: function() { return triangulaConstructionMode; }
  });

  return triangulaRenderModule;
}

function getTriangulaExportModule() {
  if (triangulaExportModule || typeof window.createTriangulaExportModule !== 'function') {
    return triangulaExportModule;
  }

  triangulaExportModule = window.createTriangulaExportModule({
    getViewSize: function() { return view.viewSize; },
    getTriangulaBaseTriangle: function(s) { return getTriangulaCoreModule().getTriangulaBaseTriangle(s); },
    triangulaCountToDepth: function(c) { return getTriangulaCoreModule().triangulaCountToDepth(c); },
    getTriangulaTargetCount: function() { return triangulaTargetCount; },
    getTriangulaStartCount: function() { return triangulaStartCount; },
    getTriangulaConstructionMode: function() { return triangulaConstructionMode; },
    getTriangulaFractalMode: function() { return triangulaFractalMode; },
    getTriangulaFitMode: function() { return triangulaFitMode; },
    getTriangulaColorMode: function() { return triangulaColorMode; },
    getTriangulaBandColors: function() { return triangulaBandColors; },
    getTriangulaFillColorForSlot: function(slot, seq) { return getTriangulaCoreModule().getTriangulaFillColorForSlot(slot, seq); },
    getTriangulaStrokeColorForSlot: function(slot, seq) { return getTriangulaCoreModule().getTriangulaStrokeColorForSlot(slot, seq); },
    collectCutTrianglesAtDepth: function(v, d, cd, col) { return getTriangulaCoreModule().collectCutTrianglesAtDepth(v, d, cd, col); },
    collectTrianglesAtDepth: function(v, d, cd, s, col) { return getTriangulaCoreModule().collectTrianglesAtDepth(v, d, cd, s, col); },
    svgPathFromPoints: svgPathFromPoints,
    colorToSvg: colorToSvg,
    formatSvgNumber: formatSvgNumber,
    getThreads: function() { return threads; }
  });

  return triangulaExportModule;
}

function getStitchingStateModule() {
  if (stitchingStateModule || typeof window.createStitchingStateModule !== 'function') {
    return stitchingStateModule;
  }

  stitchingStateModule = window.createStitchingStateModule({
    getThreads: function() { return threads; },
    replaceThreads: function(nextThreads) {
      threads.splice(0, threads.length);
      Array.prototype.push.apply(threads, nextThreads || []);
    },
    getSelectedThreadIndex: function() { return selectedThreadIndex; },
    setSelectedThreadIndex: function(nextIndex) { selectedThreadIndex = nextIndex; },
    getHolesValue: function() { return holesSlider.value; },
    setHolesValue: function(nextValue) { holesSlider.value = nextValue; },
    setAdvancedHolesValue: function(nextValue) {
      if (advancedHolesNumberInput) advancedHolesNumberInput.value = nextValue;
    },
    getMaxHoles: function() { return MAX_HOLES; },
    getDefaultHoles: function() { return DEFAULT_HOLES; },
    getCurrentShape: function() { return currentShape; },
    setCurrentShape: setCurrentShape,
    getCurrentAnimationBpm: function() { return currentAnimationBpm; },
    getCurrentSongId: function() { return currentSongId; },
    canApplySongSelection: canApplySongSelection,
    setCurrentSong: setCurrentSong,
    applyTempoValue: applyTempoValue,
    sanitizeBpmForCurrentSong: sanitizeBpmForCurrentSong,
    parseBoundedInt: parseBoundedInt,
    sanitizeThreadList: sanitizeThreadList,
    ensureThreadList: ensureThreadList,
    sanitizeShape: sanitizeShape,
    sanitizeThreadColor: sanitizeThreadColor,
    sanitizeBooleanParam: sanitizeBooleanParam,
    serializeStitchingThreadState: serializeStitchingThreadState,
    parseStitchingThreadState: parseStitchingThreadState,
    sanitizeThreadColorList: sanitizeThreadColorList,
    buildStitchingUrlState: buildStitchingUrlState,
    hydrateStitchingUrlState: hydrateStitchingUrlState,
    getAppState: function() { return appState; },
    setUrlStateParam: setUrlStateParam,
    getUrlStateParam: getUrlStateParam,
    getShowHoleNumbers: function() { return showHoleNumbers; },
    getBorderEnabled: function() { return borderEnabled; },
    setShowHoleNumbers: setShowHoleNumbersState,
    setBorderEnabled: setBorderEnabledState,
    syncHoleNumberToggles: syncHoleNumberToggles,
    syncBorderControls: syncBorderControls,
    renderThreadControls: renderThreadControls,
    syncKidControlsFromSelectedThread: syncKidControlsFromSelectedThread
  });

  return stitchingStateModule;
}

function getTriangulaStateModule() {
  if (triangulaStateModule || typeof window.createTriangulaStateModule !== 'function') {
    return triangulaStateModule;
  }

  triangulaStateModule = window.createTriangulaStateModule({
    captureTriangulaState: captureTriangulaState,
    applyTriangulaState: applyTriangulaState,
    buildTriangulaUrlState: buildTriangulaUrlState,
    hydrateTriangulaUrlState: hydrateTriangulaUrlState,
    sanitizeTriangulaColorMode: sanitizeTriangulaColorMode,
    sanitizeTriangulaConstructionMode: sanitizeTriangulaConstructionMode,
    sanitizeTriangulaCount: sanitizeTriangulaCount,
    sanitizeTriangulaFractalMode: sanitizeTriangulaFractalMode,
    sanitizeTriangulaFitMode: sanitizeTriangulaFitMode,
    sanitizeHexColor: sanitizeHexColor,
    sanitizeThreadColor: sanitizeThreadColor,
    sanitizeBpmForCurrentSong: sanitizeBpmForCurrentSong,
    getTriangulaColorMode: function() { return triangulaColorMode; },
    getTriangulaConstructionMode: function() { return triangulaConstructionMode; },
    getTriangulaStartCount: function() { return triangulaStartCount; },
    getTriangulaTargetCount: function() { return triangulaTargetCount; },
    getTriangulaFractalMode: function() { return triangulaFractalMode; },
    getTriangulaFitMode: function() { return triangulaFitMode; },
    getTriangulaBandColors: function() { return triangulaBandColors; },
    setTriangulaColorMode: function(nextValue) { triangulaColorMode = nextValue; },
    setTriangulaConstructionMode: function(nextValue) { triangulaConstructionMode = nextValue; },
    setTriangulaStartCount: function(nextValue) { triangulaStartCount = nextValue; },
    setTriangulaTargetCount: function(nextValue) { triangulaTargetCount = nextValue; },
    setTriangulaFractalMode: function(nextValue) { triangulaFractalMode = nextValue; },
    setTriangulaFitMode: function(nextValue) { triangulaFitMode = nextValue; },
    setTriangulaBandColors: function(b1, b2, b4) {
      triangulaBandColors.band1 = b1;
      triangulaBandColors.band2 = b2;
      triangulaBandColors.band4 = b4;
    },
    getThreadZeroColor: function() { return threads[0] ? threads[0].color : '#1982c4'; },
    setThreadZeroColor: function(nextColor) { if (threads[0]) threads[0].color = nextColor; },
    getCurrentAnimationBpm: function() { return currentAnimationBpm; },
    getCurrentSongId: function() { return currentSongId; },
    canApplySongSelection: canApplySongSelection,
    setCurrentSong: setCurrentSong,
    applyTempoValue: applyTempoValue,
    getAppState: function() { return appState; },
    setUrlStateParam: setUrlStateParam,
    getUrlStateParam: getUrlStateParam,
    syncTriangulaControls: syncTriangulaControls
  });

  return triangulaStateModule;
}

function getTriangulaCoreModule() {
  if (triangulaCoreModule || typeof window.createTriangulaCoreModule !== 'function') {
    return triangulaCoreModule;
  }

  triangulaCoreModule = window.createTriangulaCoreModule({
    getView: function() { return view; },
    getTriangulaColorMode: function() { return triangulaColorMode; },
    getTriangulaConstructionMode: function() { return triangulaConstructionMode; },
    getTriangulaFractalMode: function() { return triangulaFractalMode; },
    getTriangulaFitMode: function() { return triangulaFitMode; },
    getTriangulaBandColors: function() { return triangulaBandColors; },
    getThreadZeroColor: function() { return threads[0] ? threads[0].color : null; },
    getAnimationSecondsPerSegment: getAnimationSecondsPerSegment
  });

  return triangulaCoreModule;
}

function getUrlStateService() {
  if (urlStateService || typeof window.createUrlStateService !== 'function') {
    return urlStateService;
  }

  urlStateService = window.createUrlStateService({
    syncAppStateFromRuntime: syncAppStateFromRuntime,
    setUrlStateParam: setUrlStateParam,
    getUrlStateParam: getUrlStateParam,
    hasUrlStateKey: hasUrlStateKey,
    getAppStateUrlVersion: function() { return APP_STATE_URL_VERSION; },
    getAppState: function() { return appState; },
    getExperienceUrlHandlers: function() { return EXPERIENCE_URL_HANDLERS; },
    getUrlSyncSuspended: function() { return urlSyncSuspended; },
    getUrlSyncTimer: function() { return urlSyncTimer; },
    setUrlSyncTimer: function(nextTimer) { urlSyncTimer = nextTimer; },
    getUrlSyncDebounceMs: function() { return URL_SYNC_DEBOUNCE_MS; },
    resolveExperienceId: resolveExperienceId,
    setCurrentExperience: setCurrentExperience,
    getCurrentExperienceId: function() { return currentExperienceId; },
    getExperienceUiProfile: getExperienceUiProfile,
    sanitizeShape: sanitizeShape,
    getCurrentShape: function() { return currentShape; },
    setCurrentShape: setCurrentShape,
    sanitizeSongId: sanitizeSongId,
    getCurrentSongId: function() { return currentSongId; },
    canApplySongSelection: canApplySongSelection,
    setCurrentSong: setCurrentSong,
    sanitizeBpmForCurrentSong: sanitizeBpmForCurrentSong,
    getCurrentAnimationBpm: function() { return currentAnimationBpm; },
    applyTempoValue: applyTempoValue,
    sanitizeBooleanParam: sanitizeBooleanParam,
    getMusicMuted: function() { return isMusicMuted; },
    setMusicMutedState: setMusicMutedState,
    syncMusicToggleButton: syncMusicToggleButton,
    dispatchRuntimeState: dispatchRuntimeState,
    getExperienceUrlHandler: getExperienceUrlHandler,
    redrawForPathChange: redrawForPathChange,
    setAnimationPlaybackState: function(nextState) { animationPlaybackState = nextState; },
    syncAnimateButtonLabel: syncAnimateButtonLabel,
    updateMusicPlaybackState: updateMusicPlaybackState,
    withUrlSyncSuspended: withUrlSyncSuspended
  });

  return urlStateService;
}

function getExperienceStateCache() {
  if (experienceStateCache || typeof window.createExperienceStateCacheService !== 'function') {
    return experienceStateCache;
  }

  experienceStateCache = window.createExperienceStateCacheService({
    schemaVersion: EXPERIENCE_STATE_CACHE_SCHEMA_VERSION,
    storageKey: 'curve_stitcher.experience_state_cache'
  });

  return experienceStateCache;
}

function registerExperienceStateHandler(experienceId, handler) {
  if (!experienceId || !handler) return;
  EXPERIENCE_STATE_HANDLERS[experienceId] = handler;
}

function getExperienceStateHandler(experienceId) {
  return EXPERIENCE_STATE_HANDLERS[experienceId] || null;
}

function registerExperienceUrlHandler(experienceId, handler) {
  if (!experienceId || !handler) return;
  EXPERIENCE_URL_HANDLERS[experienceId] = handler;
}

function getExperienceUrlHandler(experienceId) {
  return EXPERIENCE_URL_HANDLERS[experienceId] || null;
}

function registerExperienceTrailColorHandler(experienceId, resolver) {
  if (!experienceId || typeof resolver !== 'function') return;
  EXPERIENCE_TRAIL_COLOR_HANDLERS[experienceId] = resolver;
}

function getExperienceTrailColorHandler(experienceId) {
  return EXPERIENCE_TRAIL_COLOR_HANDLERS[experienceId] || null;
}

function registerExperienceExportHandler(experienceId, handler) {
  if (!experienceId || !handler) return;
  EXPERIENCE_EXPORT_HANDLERS[experienceId] = handler;
}

function getRegisteredExperienceExportHandler(experienceId) {
  return EXPERIENCE_EXPORT_HANDLERS[experienceId] || null;
}

function registerExperienceExportProfile(experienceId, profile) {
  if (!experienceId || !profile) return;
  EXPERIENCE_EXPORT_PROFILES[experienceId] = profile;
}

function getRegisteredExperienceExportProfile(experienceId) {
  return EXPERIENCE_EXPORT_PROFILES[experienceId] || null;
}

function sanitizeShape(value, fallback) {
  var allowed = ['circle', 'triangle', 'square', 'star', 'heart'];
  if (allowed.indexOf(value) === -1) return fallback;
  return value;
}

function sanitizeBooleanParam(value, fallback) {
  if (value === '1' || value === 'true') return true;
  if (value === '0' || value === 'false') return false;
  return fallback;
}

function sanitizeSongId(value, fallback) {
  if (value && MUSIC_LIBRARY[value]) return value;
  return fallback;
}

function sanitizeBpmForCurrentSong(value, fallback) {
  var parsed = Math.round(Number(value));
  var allowedTempos = getActiveTempoOptions();
  if (!isFinite(parsed) || allowedTempos.indexOf(parsed) === -1) {
    return fallback;
  }
  return parsed;
}

function createModuleStateHandler(getModule) {
  return {
    capture: function() {
      var module = getModule();
      if (module && typeof module.captureState === 'function') {
        return module.captureState();
      }
      return null;
    },
    apply: function(snapshot) {
      var module = getModule();
      if (module && typeof module.applyState === 'function') {
        module.applyState(snapshot);
      }
    }
  };
}

function createModuleUrlHandler(getModule, options) {
  options = options || {};
  return {
    syncToAppState: function() {
      var module = getModule();
      if (module && typeof module.syncToAppState === 'function') {
        module.syncToAppState();
      }
    },
    appendParams: function(params) {
      if (options.appendGuard && !options.appendGuard()) return;
      var module = getModule();
      if (module && typeof module.appendUrlParams === 'function') {
        module.appendUrlParams(params);
      }
    },
    hydrateParams: function(params, requestedExperience) {
      var module = getModule();
      if (module && typeof module.hydrateUrlParams === 'function') {
        module.hydrateUrlParams(params, requestedExperience);
      }
    }
  };
}

registerExperienceStateHandler('stitching', createModuleStateHandler(getStitchingStateModule));
registerExperienceStateHandler('triangula', createModuleStateHandler(getTriangulaStateModule));

registerExperienceUrlHandler('stitching', createModuleUrlHandler(getStitchingStateModule));
registerExperienceUrlHandler('triangula', createModuleUrlHandler(getTriangulaStateModule, {
  appendGuard: function() {
    return appState.experienceId === 'triangula';
  }
}));

function ensureExperienceStateManager() {
  if (experienceStateManager) return experienceStateManager;

  var handlers = EXPERIENCE_STATE_HANDLERS;
  var cache = getExperienceStateCache();

  if (typeof window.createExperienceStateManager === 'function') {
    experienceStateManager = window.createExperienceStateManager(handlers, {
      cache: cache
    });
    return experienceStateManager;
  }

  var fallbackSlots = Object.create(null);
  experienceStateManager = {
    capture: function(experienceId) {
      var handler = handlers[experienceId];
      if (!handler || typeof handler.capture !== 'function') return false;
      fallbackSlots[experienceId] = handler.capture();
      if (cache && typeof cache.setExperienceSnapshot === 'function') {
        cache.setExperienceSnapshot(experienceId, fallbackSlots[experienceId]);
      }
      return true;
    },
    restore: function(experienceId) {
      var handler = handlers[experienceId];
      if (!handler || typeof handler.apply !== 'function') return false;
      if (!Object.prototype.hasOwnProperty.call(fallbackSlots, experienceId) && cache && typeof cache.getExperienceSnapshot === 'function') {
        var persisted = cache.getExperienceSnapshot(experienceId);
        if (persisted !== null && typeof persisted !== 'undefined') {
          fallbackSlots[experienceId] = persisted;
        }
      }
      if (!Object.prototype.hasOwnProperty.call(fallbackSlots, experienceId)) return false;
      handler.apply(fallbackSlots[experienceId]);
      return true;
    }
  };

  return experienceStateManager;
}

function registerExperienceEngine(experienceId, engine) {
  if (!experienceId || !engine) return;
  EXPERIENCE_ENGINE_REGISTRY[experienceId] = engine;
}

function getExperienceEngine(experienceId) {
  return EXPERIENCE_ENGINE_REGISTRY[experienceId] || null;
}

function sanitizeHexColor(value, fallback) {
  if (typeof value !== 'string') return fallback;
  var trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  if (trimmed === 'rainbow') return 'rainbow';
  return fallback;
}

function getRuntimeStateSnapshot() {
  if (runtimeStateStore && typeof runtimeStateStore.getState === 'function') {
    return runtimeStateStore.getState();
  }
  return {
    experienceId: currentExperienceId,
    shape: currentShape
  };
}

function dispatchRuntimeState(action) {
  if (!runtimeStateStore || typeof runtimeStateStore.dispatch !== 'function') return;
  runtimeStateStore.dispatch(action);
}

function setShowHoleNumbersState(nextValue) {
  showHoleNumbers = !!nextValue;
}

function setBorderEnabledState(nextValue) {
  borderEnabled = !!nextValue;
}

function setMusicMutedState(nextValue) {
  isMusicMuted = !!nextValue;
  dispatchRuntimeState({
    type: 'SET_MUSIC_MUTED',
    payload: { musicMuted: isMusicMuted }
  });
}

function syncAppStateFromRuntime() {
  var runtimeSnapshot = getRuntimeStateSnapshot();
  appState.version = APP_STATE_URL_VERSION;
  appState.experienceId = runtimeSnapshot.experienceId || currentExperienceId;
  appState.common.shape = runtimeSnapshot.shape || currentShape;
  appState.common.bpm = isFinite(runtimeSnapshot.bpm) ? Number(runtimeSnapshot.bpm) : currentAnimationBpm;
  appState.common.musicMuted = typeof runtimeSnapshot.musicMuted === 'boolean' ? runtimeSnapshot.musicMuted : !!isMusicMuted;
  appState.common.songId = runtimeSnapshot.songId || currentSongId;

  Object.keys(EXPERIENCE_URL_HANDLERS).forEach(function(experienceId) {
    var handler = EXPERIENCE_URL_HANDLERS[experienceId];
    if (!handler || typeof handler.syncToAppState !== 'function') return;
    handler.syncToAppState();
  });
}

function buildSearchParamsFromAppState() {
  var service = getUrlStateService();
  if (service && typeof service.buildSearchParamsFromAppState === 'function') {
    return service.buildSearchParamsFromAppState();
  }

  syncAppStateFromRuntime();
  var params = new URLSearchParams();
  setUrlStateParam(params, 'version', APP_STATE_URL_VERSION);
  setUrlStateParam(params, 'experience', appState.experienceId);
  setUrlStateParam(params, 'shape', appState.common.shape);
  setUrlStateParam(params, 'bpm', String(appState.common.bpm));
  setUrlStateParam(params, 'musicMuted', appState.common.musicMuted ? '1' : '0');
  setUrlStateParam(params, 'songId', appState.common.songId);
  return params;
}

function flushUrlStateSync() {
  var service = getUrlStateService();
  if (service && typeof service.flushUrlStateSync === 'function') {
    service.flushUrlStateSync();
  }
}

function scheduleUrlStateSync(immediate) {
  var stateManager = ensureExperienceStateManager();
  if (stateManager && typeof stateManager.capture === 'function') {
    stateManager.capture(currentExperienceId);
  }

  var service = getUrlStateService();
  if (service && typeof service.scheduleUrlStateSync === 'function') {
    service.scheduleUrlStateSync(immediate);
  }
}

function applyStateFromCurrentUrl(options) {
  var service = getUrlStateService();
  if (service && typeof service.applyStateFromCurrentUrl === 'function') {
    service.applyStateFromCurrentUrl(options || {});
  }
}

function hasUrlStateParams() {
  var service = getUrlStateService();
  if (service && typeof service.hasUrlStateParams === 'function') {
    return service.hasUrlStateParams();
  }
  return false;
}

var magicThreadColors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#f15bb5'];
var joyAudio = new Audio(MUSIC_LIBRARY[currentSongId].path);
joyAudio.preload = 'auto';
var isMusicMuted = false;
var hasMusicStartedSinceLoad = false;
var sliderMotionKeys = Object.create(null);
var sliderMotionSettleTimers = Object.create(null);
var sliderMotionKeySeed = 0;

function getSliderMotionKey(slider) {
  if (!slider) return null;
  if (!slider.dataset.motionKey) {
    sliderMotionKeySeed += 1;
    slider.dataset.motionKey = 'slider-' + sliderMotionKeySeed;
  }
  return slider.dataset.motionKey;
}

function hasActiveSliderMotion() {
  for (var key in sliderMotionKeys) {
    if (sliderMotionKeys[key]) return true;
  }
  return false;
}

function shouldMusicBePlaying() {
  return animationActive || hasActiveSliderMotion();
}

function syncMusicToggleButton() {
  musicToggleBtn.textContent = isMusicMuted ? '🔇' : '🔊';
  musicToggleBtn.classList.toggle('is-active', isMusicMuted);
  musicToggleBtn.setAttribute('aria-pressed', isMusicMuted ? 'true' : 'false');
  musicToggleBtn.setAttribute('aria-label', isMusicMuted ? 'Unmute music' : 'Mute music');
  musicToggleBtn.title = isMusicMuted ? 'Unmute music' : 'Mute music';
}

function isReduceMotionPreferred() {
  if (!window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getExperienceById(experienceId) {
  return EXPERIENCE_LIBRARY[experienceId] || EXPERIENCE_LIBRARY.stitching;
}

function resolveExperienceId(experienceRef) {
  if (!experienceRef) return null;
  if (EXPERIENCE_LIBRARY[experienceRef]) return experienceRef;

  var normalized = String(experienceRef).trim().toLowerCase();
  if (!normalized) return null;

  var keys = Object.keys(EXPERIENCE_LIBRARY);
  for (var i = 0; i < keys.length; i++) {
    var id = keys[i];
    var entry = EXPERIENCE_LIBRARY[id];
    if (!entry) continue;
    if (id.toLowerCase() === normalized) return id;
    if (entry.title && String(entry.title).trim().toLowerCase() === normalized) return id;
  }
  return null;
}

function getExperienceUiProfile(experienceId) {
  var experience = getExperienceById(experienceId);
  return experience.uiProfile || EXPERIENCE_LIBRARY.stitching.uiProfile;
}

function getDefaultSongIdForExperience(experienceId) {
  var experience = getExperienceById(experienceId);
  var defaultSongId = experience && experience.defaultSongId;
  if (defaultSongId && MUSIC_LIBRARY[defaultSongId]) return defaultSongId;
  return 'bach';
}

function canApplySongSelection(songId) {
  if (!songId || !MUSIC_LIBRARY[songId]) return false;
  if (songId === 'bach') return true;
  if (songId === getDefaultSongIdForExperience(currentExperienceId)) return true;
  return unlockedSongIds.indexOf(songId) !== -1;
}

function setElementDisplay(element, isVisible, displayValue) {
  if (!element) return;
  element.style.display = isVisible ? (displayValue || '') : 'none';
}

function applyShapePolicy(profile) {
  var allowedShapes = (profile && profile.allowedShapes && profile.allowedShapes.length) ? profile.allowedShapes : ['circle', 'triangle', 'square', 'star', 'heart'];
  var fixedShape = profile ? profile.fixedShape : null;

  shapeButtons.forEach(function(btn) {
    var shape = btn.getAttribute('data-shape') || '';
    var allowed = allowedShapes.indexOf(shape) !== -1;
    setElementDisplay(btn, allowed, 'flex');
    btn.setAttribute('aria-hidden', allowed ? 'false' : 'true');
    if (!allowed) {
      btn.classList.remove('active');
      btn.tabIndex = -1;
    } else {
      btn.removeAttribute('tabindex');
    }
  });

  if (advancedShapeSelect) {
    var hasAllowedOption = false;
    Array.prototype.forEach.call(advancedShapeSelect.options, function(option) {
      var allowed = allowedShapes.indexOf(option.value) !== -1;
      option.hidden = !allowed;
      option.disabled = !allowed;
      if (allowed) hasAllowedOption = true;
    });
    advancedShapeSelect.disabled = !!fixedShape || !hasAllowedOption;
  }

  if (fixedShape) {
    setCurrentShape(fixedShape);
    return;
  }

  if (allowedShapes.indexOf(currentShape) === -1 && allowedShapes.length) {
    setCurrentShape(allowedShapes[0]);
  }
}

function applyThreadPolicy(profile) {
  var threadsEnabled = !profile || profile.threadsEnabled !== false;
  var allowMultipleThreads = !profile || profile.allowMultipleThreads !== false;

  if (selectedThreadIndex < 0 || selectedThreadIndex >= threads.length) {
    selectedThreadIndex = threads.length ? 0 : -1;
  }

  setElementDisplay(STITCHER_UI.addMagicThreadBtn, threadsEnabled && allowMultipleThreads, '');
  setElementDisplay(STITCHER_UI.removeLastThreadBtn, threadsEnabled && allowMultipleThreads && threads.length > 1, '');
  setElementDisplay(STITCHER_UI.kidThreadPicker, threadsEnabled && allowMultipleThreads && threads.length > 1, 'inline-flex');
  setElementDisplay(STITCHER_UI.addThreadBtn, threadsEnabled && allowMultipleThreads, '');
  setElementDisplay(STITCHER_UI.advancedThreadsTitle, threadsEnabled, '');
  setElementDisplay(STITCHER_UI.threadControlsContainer, threadsEnabled, '');

  renderThreadControls();
}

function applyBasicControlPolicy(profile) {
  var controls = profile && profile.basicControls ? profile.basicControls : null;
  if (!controls) return;

  var keys = getControlCatalogKeys(BASIC_CONTROL_CATALOG);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var entry = BASIC_CONTROL_CATALOG[key];
    if (!entry || !entry.element) continue;
    var visible = entry.visibleWhen ? !!entry.visibleWhen(controls) : true;
    setElementDisplay(entry.element, visible, '');
  }
}

function applyAdvancedControlPolicy(profile) {
  var controls = profile && profile.advancedControls ? profile.advancedControls : null;
  if (!controls) return;

  var keys = getControlCatalogKeys(ADVANCED_CONTROL_CATALOG);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var entry = ADVANCED_CONTROL_CATALOG[key];
    if (!entry) continue;

    var visible = entry.visibleWhen ? !!entry.visibleWhen(controls) : true;

    if (entry.getElementSet) {
      var elements = entry.getElementSet();
      for (var j = 0; j < elements.length; j++) {
        setElementDisplay(elements[j], visible, '');
      }
      continue;
    }

    var element = entry.element || (entry.getElement ? entry.getElement() : null);
    if (element) {
      setElementDisplay(element, visible, '');
    }
  }
}

function syncDiscoveryReturnRowVisibility() {
  if (!CORE_UI.discoveryReturnRow) return;
  var showReturn = currentExperienceId !== 'stitching';
  if (showReturn) {
    CORE_UI.discoveryReturnRow.removeAttribute('hidden');
  } else {
    CORE_UI.discoveryReturnRow.setAttribute('hidden', '');
  }
}

function applyTopBarPolicy(profile) {
  var supportsHoleNumbers = !profile || profile.supportsHoleNumbers !== false;
  setElementDisplay(STITCHER_UI.holeNumbersToggleBtn, supportsHoleNumbers, 'flex');
  syncDiscoveryReturnRowVisibility();
}

function applyExperienceUiPolicy() {
  var profile = getExperienceUiProfile(currentExperienceId);
  validateExperienceControlProfile(profile, currentExperienceId);
  applyShapePolicy(profile);
  applyThreadPolicy(profile);
  applyBasicControlPolicy(profile);
  applyAdvancedControlPolicy(profile);
  applyTopBarPolicy(profile);
  if (CORE_UI.paletteContainer) {
    CORE_UI.paletteContainer.dataset.paletteMode = profile && profile.paletteMode ? profile.paletteMode : 'thread';
  }
  var allowedTriangulaColorModes = (profile && profile.triangulaColorModes && profile.triangulaColorModes.length)
    ? profile.triangulaColorModes.slice()
    : null;
  if (allowedTriangulaColorModes && allowedTriangulaColorModes.length) {
    if (allowedTriangulaColorModes.indexOf(triangulaColorMode) === -1) {
      triangulaColorMode = allowedTriangulaColorModes[0];
    }
  }
  if (EXPERIENCE_UI.triangulaColorScopeSelect) {
    EXPERIENCE_UI.triangulaColorScopeSelect.value = triangulaColorMode;
  }
  if (EXPERIENCE_UI.triangulaConstructionModeSelect) {
    EXPERIENCE_UI.triangulaConstructionModeSelect.value = triangulaConstructionMode;
  }
  syncTriangulaControls();
}

function syncTriangulaControls() {
  var uiModule = getTriangulaUiModule();
  if (uiModule && typeof uiModule.syncTriangulaControls === 'function') {
    uiModule.syncTriangulaControls();
  }
}

function applyTriangulaCountUpdate(nextStart, nextTarget, shouldRedraw) {
  var uiModule = getTriangulaUiModule();
  if (uiModule && typeof uiModule.applyTriangulaCountUpdate === 'function') {
    uiModule.applyTriangulaCountUpdate(nextStart, nextTarget, shouldRedraw);
  }
}

function applyExperienceOverlayPosition(positionClass) {
  if (!experienceInline) return;
  var allPositionClasses = ['pos-top-center', 'pos-bottom-center', 'pos-top-left', 'pos-top-right'];
  for (var i = 0; i < allPositionClasses.length; i++) {
    experienceInline.classList.remove(allPositionClasses[i]);
  }
  experienceInline.classList.add(positionClass || 'pos-top-center');
}

function positionExperienceInfoPanel() {
  if (!experienceInfoPanel || !experienceInfoToggle || experienceInfoPanel.hasAttribute('hidden')) return;

  var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  if (viewportWidth <= 0 || viewportHeight <= 0) return;

  var anchorRect = experienceInfoToggle.getBoundingClientRect();
  var panelRect = experienceInfoPanel.getBoundingClientRect();
  var margin = 10;
  var gap = 8;

  var left = anchorRect.left + (anchorRect.width / 2) - (panelRect.width / 2);
  left = Math.max(margin, Math.min(left, viewportWidth - panelRect.width - margin));

  var belowTop = anchorRect.bottom + gap;
  var aboveTop = anchorRect.top - panelRect.height - gap;
  var top = belowTop;
  if (belowTop + panelRect.height > viewportHeight - margin && aboveTop >= margin) {
    top = aboveTop;
  }
  if (top + panelRect.height > viewportHeight - margin) {
    top = viewportHeight - panelRect.height - margin;
  }
  top = Math.max(margin, top);

  experienceInfoPanel.style.left = Math.round(left) + 'px';
  experienceInfoPanel.style.top = Math.round(top) + 'px';
}

function syncExperienceInfoPanel(isOpen) {
  var open = !!isOpen;
  experienceInfoToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) {
    experienceInfoPanel.removeAttribute('hidden');
    positionExperienceInfoPanel();
  } else {
    experienceInfoPanel.setAttribute('hidden', '');
    stopExperienceNarration();
  }
}

function syncExperienceNarrationState(isPlaying, statusText) {
  var playing = !!isPlaying;
  experienceNarrateToggle.classList.toggle('is-active', playing);
  experienceNarrateToggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
  experienceNarrateToggle.textContent = playing ? 'Stop narration' : 'Hear this';
  experienceNarrationStatus.textContent = statusText || '';
}

function stopExperienceNarration() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  experienceNarrationUtterance = null;
  syncExperienceNarrationState(false, '');
}

function toggleExperienceNarration() {
  var experience = getExperienceById(currentExperienceId);
  if (experienceNarrationUtterance) {
    stopExperienceNarration();
    return;
  }
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    syncExperienceNarrationState(false, 'Narration is unavailable in this browser.');
    return;
  }

  var script = experience.narrationText || experience.infoText || experience.title;
  var utterance = new SpeechSynthesisUtterance(script);
  utterance.rate = 0.97;
  utterance.pitch = 1;
  utterance.onend = function() {
    experienceNarrationUtterance = null;
    syncExperienceNarrationState(false, 'Narration complete.');
  };
  utterance.onerror = function() {
    experienceNarrationUtterance = null;
    syncExperienceNarrationState(false, 'Narration could not play.');
  };

  experienceNarrationUtterance = utterance;
  syncExperienceNarrationState(true, 'Narrating...');
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function renderExperienceTitleStatic() {
  if (!experienceTitleLabel) return;
  var experience = getExperienceById(currentExperienceId);
  var title = experience.title || 'Stitching';
  var color = experience.strokeColor || '#1f4f94';
  var fontFamily = experience.titleFontFamily || 'Nunito';

  if (experienceSrTitle) {
    experienceSrTitle.textContent = title;
  }

  experienceTitleLabel.textContent = title;
  experienceTitleLabel.style.color = color;
  experienceTitleLabel.style.fontFamily = '"' + fontFamily + '", "Nunito", sans-serif';
}

function applyCurrentExperienceInfo() {
  var experience = getExperienceById(currentExperienceId);
  experienceInfoTitle.textContent = experience.infoTitle || ('About ' + (experience.title || 'Experience'));
  experienceInfoText.textContent = experience.infoText || '';
  syncExperienceNarrationState(false, '');
}

function setCurrentExperience(experienceId, options) {
  options = options || {};
  var experience = getExperienceById(experienceId);
  var previousExperienceId = currentExperienceId;
  var stateManager = ensureExperienceStateManager();

  if (options.capturePrevious !== false) {
    stateManager.capture(previousExperienceId);
  }

  // keep options arg for API compatibility
  currentExperienceId = experience.id;

  var restored = stateManager.restore(currentExperienceId);

  dispatchRuntimeState({
    type: 'SET_EXPERIENCE',
    payload: { experienceId: currentExperienceId }
  });

  if (!restored && !options.preserveSongOnExperienceChange) {
    setCurrentSong(getDefaultSongIdForExperience(currentExperienceId));
  }

  applyExperienceUiPolicy();
  // Re-apply mode-specific slider visibility after base UI policy toggles.
  syncKidControlsFromSelectedThread();
  applyCurrentExperienceInfo();
  renderExperienceTitleStatic();

  if (!options.suppressUrlSync) {
    CORE_BEHAVIOR.scheduleUrlStateSync(false);
  }
}

function refreshExperienceInfoPanelPlacement() {
  if (!experienceInfoPanel || experienceInfoPanel.hasAttribute('hidden')) return;
  positionExperienceInfoPanel();
}

function playMusicFromCurrentState() {
  if (!hasMusicStartedSinceLoad) {
    joyAudio.currentTime = 0;
    hasMusicStartedSinceLoad = true;
  }
  var playRequest = joyAudio.play();
  if (playRequest && typeof playRequest.catch === 'function') {
    playRequest.catch(function() {
      // Ignore autoplay-policy rejections; the next user gesture will retry.
    });
  }
}

function updateMusicPlaybackState() {
  if (isMusicMuted) {
    if (!joyAudio.paused) {
      joyAudio.pause();
    }
    return;
  }
  if (shouldMusicBePlaying()) {
    playMusicFromCurrentState();
    return;
  }
  if (!joyAudio.paused) {
    joyAudio.pause();
  }
}

function syncDiscoveryToggleButton() {
  if (!discoveryToggleBtn) return;
  var isOpen = discoveryPanel.classList.contains('open');
  discoveryToggleBtn.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
  discoveryToggleBtn.title = isOpen ? 'Close discovery library' : 'Open discovery library';
  discoveryToggleBtn.classList.toggle('active', isOpen);
  discoveryToggleBtn.classList.toggle('has-unseen', hasUnseenDiscoveries && !isOpen);
}

function syncAdvancedToggleButton() {
  if (!gearBtn) return;
  var isOpen = advancedPanel.classList.contains('open');
  gearBtn.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
  gearBtn.title = isOpen ? 'Close advanced controls' : 'Open advanced controls';
  gearBtn.classList.toggle('active', isOpen);
}

function syncSongPickerToggleButton() {
  if (!kidSongToggle) return;
  var isOpen = kidSongToggle.getAttribute('aria-expanded') === 'true';
  kidSongToggle.classList.toggle('has-unseen', hasUnseenSongUnlock && !isOpen && !kidSongToggle.disabled);
}

function showDiscoveryToast(message) {
  if (!discoveryToast) return;
  if (discoveryToastTimer) {
    clearTimeout(discoveryToastTimer);
    discoveryToastTimer = null;
  }

  discoveryToast.textContent = message;
  discoveryToast.classList.add('show');

  discoveryToastTimer = window.setTimeout(function() {
    discoveryToast.classList.remove('show');
    discoveryToastTimer = null;
  }, 2500);
}

function getElementCenterPoint(element) {
  if (!element || typeof element.getBoundingClientRect !== 'function') return null;
  var rect = element.getBoundingClientRect();
  if (!isFinite(rect.left) || !isFinite(rect.top)) return null;
  return {
    x: rect.left + (rect.width / 2),
    y: rect.top + (rect.height / 2)
  };
}

function animateFloatingDiscoveryIcon(iconText, startPoint, endPoint, delayMs) {
  if (!iconText || !startPoint || !endPoint || !document.body) return;

  var token = document.createElement('div');
  token.className = 'discovery-float-icon';
  token.textContent = iconText;
  token.style.left = String(startPoint.x) + 'px';
  token.style.top = String(startPoint.y) + 'px';
  document.body.appendChild(token);

  var dx = endPoint.x - startPoint.x;
  var dy = endPoint.y - startPoint.y;
  var durationMs = DISCOVERY_FLOAT_DURATION_MS;
  var delay = Math.max(0, delayMs || 0);

  if (typeof token.animate === 'function') {
    var animation = token.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.86)', opacity: 0, offset: 0 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.14 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(1)', opacity: 1, offset: 0.86 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(0.95)', opacity: 0, offset: 1 }
      ],
      {
        duration: durationMs,
        delay: delay,
        easing: 'cubic-bezier(0.16, 0.84, 0.24, 1)',
        fill: 'forwards'
      }
    );
    animation.onfinish = function() {
      token.remove();
    };
    animation.oncancel = function() {
      token.remove();
    };
    return;
  }

  window.setTimeout(function() {
    token.remove();
  }, durationMs + delay + 120);
}

function animateReturnToStitchingTrail(startPoint, endPoint) {
  if (!startPoint || !endPoint || !document.body) return;

  var dx = endPoint.x - startPoint.x;
  var dy = endPoint.y - startPoint.y;
  var distance = Math.sqrt(dx * dx + dy * dy);
  if (!isFinite(distance) || distance < 8) return;

  var angle = Math.atan2(dy, dx);
  var trailColor = getActiveTrailColor();
  var trailColorStrong = toRgbaColor(trailColor, 0.85);
  var trailColorSoft = toRgbaColor(trailColor, 0.18);
  var trailColorNone = toRgbaColor(trailColor, 0);

  var line = document.createElement('div');
  line.className = 'return-thread-trail-line';
  line.style.left = Math.round(startPoint.x) + 'px';
  line.style.top = Math.round(startPoint.y) + 'px';
  line.style.width = Math.round(distance) + 'px';
  line.style.transform = 'rotate(' + angle + 'rad) scaleX(0.08)';
  line.style.background = 'linear-gradient(90deg, ' + trailColorStrong + ' 0%, ' + trailColorSoft + ' 72%, ' + trailColorNone + ' 100%)';

  var head = document.createElement('div');
  head.className = 'return-thread-trail-head';
  head.style.left = Math.round(startPoint.x - 3) + 'px';
  head.style.top = Math.round(startPoint.y - 3) + 'px';
  head.style.background = trailColor;
  head.style.boxShadow = '0 0 0 3px ' + toRgbaColor(trailColor, 0.22);

  document.body.appendChild(line);
  document.body.appendChild(head);

  if (typeof line.animate === 'function' && typeof head.animate === 'function') {
    var lineAnim = line.animate(
      [
        { transform: 'rotate(' + angle + 'rad) scaleX(0.08)', opacity: 0 },
        { transform: 'rotate(' + angle + 'rad) scaleX(1)', opacity: 1, offset: 0.42 },
        { transform: 'rotate(' + angle + 'rad) scaleX(1)', opacity: 0, offset: 1 }
      ],
      {
        duration: 520,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards'
      }
    );
    lineAnim.onfinish = function() {
      line.remove();
    };
    lineAnim.oncancel = function() {
      line.remove();
    };

    var headAnim = head.animate(
      [
        { transform: 'translate(0, 0) scale(0.8)', opacity: 0 },
        { transform: 'translate(' + Math.round(dx * 0.88) + 'px, ' + Math.round(dy * 0.88) + 'px) scale(1)', opacity: 1, offset: 0.78 },
        { transform: 'translate(' + Math.round(dx) + 'px, ' + Math.round(dy) + 'px) scale(0.9)', opacity: 0, offset: 1 }
      ],
      {
        duration: 520,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards'
      }
    );
    headAnim.onfinish = function() {
      head.remove();
    };
    headAnim.oncancel = function() {
      head.remove();
    };
    return;
  }

  window.setTimeout(function() {
    line.remove();
    head.remove();
  }, 560);
}

function getActiveTrailColor() {
  var fallbackColor = '#1982c4';
  var resolver = getExperienceTrailColorHandler(currentExperienceId);
  if (typeof resolver === 'function') {
    return resolver(fallbackColor);
  }

  return fallbackColor;
}

function resolveStitchingTrailColor(fallbackColor) {
  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex >= 0 && threads[targetIndex]) {
    var chosen = threads[targetIndex].color;
    if (chosen && chosen !== 'rainbow') return chosen;
  }

  return fallbackColor;
}

function resolveTriangulaTrailColor(fallbackColor) {
  if (triangulaColorMode === 'band-1') return triangulaBandColors.band1 || fallbackColor;
  if (triangulaColorMode === 'band-2') return triangulaBandColors.band2 || fallbackColor;
  if (triangulaColorMode === 'band-4') return triangulaBandColors.band4 || fallbackColor;
  return getTriangulaCoreModule().normalizeTriangulaFillColor(threads[0] ? threads[0].color : null, triangulaBandColors.band1 || fallbackColor);
}

registerExperienceTrailColorHandler('stitching', resolveStitchingTrailColor);
registerExperienceTrailColorHandler('triangula', resolveTriangulaTrailColor);

function toRgbaColor(colorValue, alpha) {
  var fallback = 'rgba(25, 130, 196, ' + String(alpha) + ')';
  var color = String(colorValue || '').trim();
  if (!color) return fallback;

  var shortHex = /^#([0-9a-f]{3})$/i.exec(color);
  if (shortHex) {
    var sh = shortHex[1];
    var sr = parseInt(sh.charAt(0) + sh.charAt(0), 16);
    var sg = parseInt(sh.charAt(1) + sh.charAt(1), 16);
    var sb = parseInt(sh.charAt(2) + sh.charAt(2), 16);
    return 'rgba(' + sr + ', ' + sg + ', ' + sb + ', ' + String(alpha) + ')';
  }

  var fullHex = /^#([0-9a-f]{6})$/i.exec(color);
  if (fullHex) {
    var fh = fullHex[1];
    var fr = parseInt(fh.slice(0, 2), 16);
    var fg = parseInt(fh.slice(2, 4), 16);
    var fb = parseInt(fh.slice(4, 6), 16);
    return 'rgba(' + fr + ', ' + fg + ', ' + fb + ', ' + String(alpha) + ')';
  }

  var rgb = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(color);
  if (rgb) {
    return 'rgba(' + rgb[1] + ', ' + rgb[2] + ', ' + rgb[3] + ', ' + String(alpha) + ')';
  }

  return fallback;
}

function pulseDiscoveryTarget(element, delayMs) {
  if (!element || typeof element.animate !== 'function') return;
  var delay = Math.max(0, delayMs || 0);

  window.setTimeout(function() {
    element.animate(
      [
        { boxShadow: '0 0 0 0 rgba(47, 95, 179, 0)', filter: 'brightness(1)' },
        { boxShadow: '0 0 0 6px rgba(47, 95, 179, 0.28)', filter: 'brightness(1.06)', offset: 0.42 },
        { boxShadow: '0 0 0 0 rgba(47, 95, 179, 0)', filter: 'brightness(1)' }
      ],
      {
        duration: 430,
        easing: 'cubic-bezier(0.22, 0.78, 0.2, 1)',
        fill: 'none'
      }
    );
  }, delay);
}

function animateDiscoveryUnlock(shapeKey) {
  if (!shapeKey || !DISCOVERY_LIBRARY[shapeKey]) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var toastCenter = getElementCenterPoint(discoveryToast);
  var libraryCenter = getElementCenterPoint(discoveryToggleBtn);
  if (!toastCenter || !libraryCenter) return;

  var shapeIcon = DISCOVERY_LIBRARY[shapeKey].icon || '✨';
  var shapeDelay = 20;
  var shapeStart = { x: toastCenter.x - 18, y: toastCenter.y + 2 };
  animateFloatingDiscoveryIcon(shapeIcon, shapeStart, libraryCenter, shapeDelay);
  pulseDiscoveryTarget(discoveryToggleBtn, shapeDelay + DISCOVERY_FLOAT_DURATION_MS - 140);

  var songPickerCenter = getElementCenterPoint(kidSongIcon || kidSongToggle);
  if (songPickerCenter) {
    var noteDelay = 140;
    var noteStart = { x: toastCenter.x + 18, y: toastCenter.y + 4 };
    animateFloatingDiscoveryIcon('♪', noteStart, songPickerCenter, noteDelay);
    pulseDiscoveryTarget(kidSongToggle, noteDelay + DISCOVERY_FLOAT_DURATION_MS - 140);
  }
}

function getTempoOptionsForSong(songId) {
  var list = SONG_TEMPO_OPTIONS[songId];
  if (!list || !list.length) {
    return DEFAULT_TEMPO_OPTIONS.slice();
  }
  return list.slice();
}

function getActiveTempoOptions() {
  return getTempoOptionsForSong(currentSongId);
}

function getKidTempoPresetsForSong(songId) {
  var options = getTempoOptionsForSong(songId);
  var slow = options[0];
  var normal = options[Math.min(1, options.length - 1)];
  var fast = options[Math.min(2, options.length - 1)];
  return {
    slow: slow,
    normal: normal,
    fast: fast
  };
}

function renderAdvancedTempoOptions() {
  if (!CORE_UI.advancedTempoInput) return;
  var options = getActiveTempoOptions();
  CORE_UI.advancedTempoInput.innerHTML = '';
  for (var i = 0; i < options.length; i++) {
    var option = document.createElement('option');
    option.value = String(options[i]);
    option.textContent = String(options[i]);
    CORE_UI.advancedTempoInput.appendChild(option);
  }
}

function setCurrentSong(songId) {
  if (!MUSIC_LIBRARY[songId]) return;
  if (currentSongId === songId) return;

  var shouldResume = shouldMusicBePlaying() && !isMusicMuted;
  currentSongId = songId;
  dispatchRuntimeState({
    type: 'SET_SONG',
    payload: { songId: currentSongId }
  });
  renderAdvancedTempoOptions();
  var allowedTempos = getActiveTempoOptions();
  var previousTempo = currentAnimationBpm;
  if (allowedTempos.indexOf(currentAnimationBpm) === -1) {
    currentAnimationBpm = allowedTempos[0] || DEFAULT_ANIMATION_BPM;
  }
  if (currentAnimationBpm !== previousTempo) {
    dispatchRuntimeState({
      type: 'SET_TEMPO',
      payload: { bpm: currentAnimationBpm }
    });
  }
  syncAdvancedTempoControls();
  syncKidTempoPresetControls();
  joyAudio.pause();
  joyAudio.src = MUSIC_LIBRARY[currentSongId].path;
  joyAudio.load();
  hasMusicStartedSinceLoad = false;

  if (shouldResume) {
    playMusicFromCurrentState();
  }
  renderSongPicker();
  scheduleUrlStateSync(false);
}

function getSongPickerOptions() {
  var options = ['bach'];
  if (currentSongId && MUSIC_LIBRARY[currentSongId] && options.indexOf(currentSongId) === -1) {
    options.push(currentSongId);
  }
  for (var i = 0; i < unlockedSongIds.length; i++) {
    if (options.indexOf(unlockedSongIds[i]) === -1) {
      options.push(unlockedSongIds[i]);
    }
  }
  return options;
}

function getSongFilenameLabel(songId) {
  var entry = MUSIC_LIBRARY[songId];
  if (!entry) return songId;

  var source = entry.path || entry.title || songId;
  var baseName = String(source).split('/').pop();
  return baseName.replace(/\.[a-z0-9]+$/i, '');
}

function getSongMenuLabel(songId) {
  var label = getSongFilenameLabel(songId);
  var shapeKey = getSongShapeKey(songId);
  var shapeIcon = '◯';

  if (shapeKey === 'triangle') {
    shapeIcon = '△';
  } else if (shapeKey === 'square') {
    shapeIcon = '□';
  } else if (shapeKey === 'rosette') {
    shapeIcon = '✺';
  }

  return shapeIcon + ' ' + truncateSongLabel(label, 40);
}

function truncateSongLabel(label, maxChars) {
  if (!label) return '';
  if (label.length <= maxChars) return label;
  return label.slice(0, Math.max(1, maxChars - 1)) + '…';
}

function getSongShapeKey(songId) {
  if (songId === 'triangle') return 'triangle';
  if (songId === 'square') return 'square';
  if (songId === 'rosette') return 'rosette';
  return 'circle';
}

function getPolygonRadiusFactor(angle, sides) {
  var sector = (2 * Math.PI) / sides;
  var normalized = ((angle % sector) + sector) % sector;
  var local = normalized - (sector / 2);
  return Math.cos(Math.PI / sides) / Math.cos(local);
}

function mix(a, b, t) {
  return a + ((b - a) * t);
}

function renderSongPicker() {
  if (!kidSongToggle || !kidSongMenu) return;

  var hasUnlocked = unlockedSongIds.length > 0;
  var optionIds = getSongPickerOptions();
  kidSongMenu.innerHTML = '';

  if (optionIds.indexOf(currentSongId) === -1) {
    currentSongId = 'bach';
  }

  var selectedLabel = getSongFilenameLabel(currentSongId);

  if (!hasUnlocked) {
    kidSongToggle.disabled = true;
    kidSongToggle.setAttribute('aria-expanded', 'false');
    kidSongToggle.classList.remove('is-active');
    kidSongToggle.title = 'Discover a shape to unlock more songs';
    kidSongToggle.setAttribute('aria-label', 'Song picker disabled until shape discovery');
    kidSongMenu.setAttribute('hidden', '');
    syncSongPickerToggleButton();
    return;
  }

  kidSongToggle.disabled = false;
  kidSongToggle.title = 'Choose song (current: ' + selectedLabel + ')';
  kidSongToggle.setAttribute('aria-label', 'Choose song. Current song is ' + selectedLabel);
  syncSongPickerToggleButton();

  for (var i = 0; i < optionIds.length; i++) {
    var songId = optionIds[i];
    var fullLabel = getSongFilenameLabel(songId);
    var option = document.createElement('button');
    option.type = 'button';
    option.className = 'kid-song-option' + (songId === currentSongId ? ' active' : '');
    option.dataset.songId = songId;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', songId === currentSongId ? 'true' : 'false');
    option.setAttribute('aria-label', fullLabel);
    option.title = fullLabel;
    option.textContent = getSongMenuLabel(songId);
    kidSongMenu.appendChild(option);
  }
}

function renderDiscoveryLibrary() {
  discoveryCards.innerHTML = '';

  var keys = Object.keys(DISCOVERY_LIBRARY);
  var unlockedCount = 0;

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!discoveredShapeKeys[key]) continue;
    unlockedCount++;

    var config = DISCOVERY_LIBRARY[key];
    var card = document.createElement('div');
    card.className = 'discovery-card';

    var title = document.createElement('h4');
    title.textContent = config.icon + ' ' + config.title;
    card.appendChild(title);

    var text = document.createElement('p');
    text.textContent = config.description;
    card.appendChild(text);

    if (config.passphrase) {
      var passphrase = document.createElement('p');
      passphrase.className = 'discovery-passphrase';
      passphrase.textContent = 'Passphrase: "' + config.passphrase + '"';
      card.appendChild(passphrase);
    }

    var action = document.createElement('button');
    action.type = 'button';
    action.className = 'advanced-reset-btn';
    action.textContent = 'Travel to ' + config.experienceName;
    action.addEventListener('click', function(experienceName, songId) {
      return function() {
        var experienceId = resolveExperienceId(experienceName);
        if (!experienceId) {
          alert(experienceName + ' experience is not available yet, but this travel path is now reserved in the discovery library.');
          return;
        }

        EXPERIENCE_BEHAVIOR.setCurrentExperience(experienceId);
        CORE_BEHAVIOR.redrawForPathChange();
        if (songId) {
          setCurrentSong(songId);
        }
        discoveryPanel.classList.remove('open');
        syncDiscoveryToggleButton();
      };
    }(config.experienceName, config.songId));
    card.appendChild(action);

    discoveryCards.appendChild(card);
  }

  if (!unlockedCount) {
    var empty = document.createElement('div');
    empty.className = 'advanced-global-help';
    empty.textContent = 'No explorable shapes discovered yet. Keep stitching new patterns to find one!';
    discoveryCards.appendChild(empty);
  }

  renderSongPicker();
  syncDiscoveryToggleButton();
}

function normalizeDiscoveryPassphrase(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getDiscoveryKeyForPassphrase(passphraseText) {
  var normalizedInput = normalizeDiscoveryPassphrase(passphraseText);
  if (!normalizedInput) return null;

  var keys = Object.keys(DISCOVERY_LIBRARY);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var config = DISCOVERY_LIBRARY[key];
    if (!config || !config.passphrase || !config.passphraseInputEnabled) continue;
    if (normalizeDiscoveryPassphrase(config.passphrase) === normalizedInput) {
      return key;
    }
  }

  return null;
}

function setDiscoveryPassphraseFeedback(message, status) {
  if (!discoveryPassphraseFeedback) return;
  discoveryPassphraseFeedback.textContent = message || '';
  discoveryPassphraseFeedback.classList.remove('is-success');
  discoveryPassphraseFeedback.classList.remove('is-error');
  if (status === 'success') {
    discoveryPassphraseFeedback.classList.add('is-success');
  } else if (status === 'error') {
    discoveryPassphraseFeedback.classList.add('is-error');
  }
}

function submitDiscoveryPassphraseEntry() {
  if (!discoveryPassphraseInput) return;

  var attemptedPassphrase = discoveryPassphraseInput.value || '';
  if (!normalizeDiscoveryPassphrase(attemptedPassphrase)) {
    setDiscoveryPassphraseFeedback('Type a passphrase first.', 'error');
    return;
  }

  var shapeKey = getDiscoveryKeyForPassphrase(attemptedPassphrase);
  if (!shapeKey) {
    setDiscoveryPassphraseFeedback('That passphrase does not match a discovery yet.', 'error');
    return;
  }

  var alreadyDiscovered = !!discoveredShapeKeys[shapeKey];
  unlockDiscovery(shapeKey);

  if (alreadyDiscovered) {
    setDiscoveryPassphraseFeedback(DISCOVERY_LIBRARY[shapeKey].title + ' was already discovered.', 'success');
  } else {
    setDiscoveryPassphraseFeedback('Passphrase accepted: ' + DISCOVERY_LIBRARY[shapeKey].title + ' unlocked.', 'success');
  }

  discoveryPassphraseInput.value = '';
}

function unlockSong(songId) {
  if (!songId || !MUSIC_LIBRARY[songId]) return;
  if (unlockedSongIds.indexOf(songId) !== -1) return;
  unlockedSongIds.push(songId);
  hasUnseenSongUnlock = true;
}

function unlockDiscovery(shapeKey) {
  if (!shapeKey || !DISCOVERY_LIBRARY[shapeKey]) return;
  var config = DISCOVERY_LIBRARY[shapeKey];
  if (config.discoveryRule && !isDiscoveryRuleEnabled(config.discoveryRule)) return;
  if (discoveredShapeKeys[shapeKey]) return;

  discoveredShapeKeys[shapeKey] = true;
  unlockSong(config.songId);
  hasUnseenDiscoveries = true;
  renderDiscoveryLibrary();
  showDiscoveryToast('New discovery unlocked: ' + config.title);
  animateDiscoveryUnlock(shapeKey);
}

function getDiscoveryCandidateThreads() {
  if (selectedThreadIndex >= 0 && selectedThreadIndex < threads.length) {
    return [threads[selectedThreadIndex]];
  }
  return threads.slice();
}

function buildUndirectedGraphFromSegments(segments, pointCount) {
  var adjacency = [];
  var neighbors = [];
  for (var i = 0; i < pointCount; i++) {
    adjacency.push(Object.create(null));
    neighbors.push([]);
  }

  if (!segments || !segments.length) {
    return {
      adjacency: adjacency,
      neighbors: neighbors
    };
  }

  for (var s = 0; s < segments.length; s++) {
    var fromIndex = segments[s][0];
    var toIndex = segments[s][1];

    if (!isFinite(fromIndex) || !isFinite(toIndex)) continue;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= pointCount || toIndex >= pointCount) continue;
    if (fromIndex === toIndex) continue;
    if (adjacency[fromIndex][toIndex]) continue;

    adjacency[fromIndex][toIndex] = true;
    adjacency[toIndex][fromIndex] = true;
    neighbors[fromIndex].push(toIndex);
    neighbors[toIndex].push(fromIndex);
  }

  return {
    adjacency: adjacency,
    neighbors: neighbors
  };
}

function isApproxEquilateralTriangleByIndices(a, b, c) {
  var pa = points[a];
  var pb = points[b];
  var pc = points[c];
  if (!pa || !pb || !pc) return false;

  var sideAB = pa.getDistance(pb);
  var sideBC = pb.getDistance(pc);
  var sideCA = pc.getDistance(pa);

  var minSide = Math.min(sideAB, sideBC, sideCA);
  var maxSide = Math.max(sideAB, sideBC, sideCA);
  if (!isFinite(minSide) || !isFinite(maxSide) || minSide <= 1e-4) return false;

  var areaTwice = Math.abs(pb.subtract(pa).cross(pc.subtract(pa)));
  if (areaTwice <= (minSide * minSide * 0.08)) return false;

  // Tight tolerance keeps Triangula strictly tied to equilateral stitching.
  return (maxSide / minSide) <= 1.015;
}

function threadHasEquilateralTriangleDiscovery(thread) {
  if (!thread || points.length < 3) return false;

  var graph = buildUndirectedGraphFromSegments(computeSegments(thread), points.length);
  var adjacency = graph.adjacency;
  var neighbors = graph.neighbors;

  for (var a = 0; a < neighbors.length; a++) {
    for (var i = 0; i < neighbors[a].length; i++) {
      var b = neighbors[a][i];
      if (b <= a) continue;

      for (var j = 0; j < neighbors[b].length; j++) {
        var c = neighbors[b][j];
        if (c <= b || c === a) continue;
        if (!adjacency[a][c]) continue;

        if (isApproxEquilateralTriangleByIndices(a, b, c)) {
          return true;
        }
      }
    }
  }

  return false;
}

function isApproxSquareCycleByIndices(a, b, c, d) {
  var p0 = points[a];
  var p1 = points[b];
  var p2 = points[c];
  var p3 = points[d];
  if (!p0 || !p1 || !p2 || !p3) return false;

  var v01 = p1.subtract(p0);
  var v12 = p2.subtract(p1);
  var v23 = p3.subtract(p2);
  var v30 = p0.subtract(p3);

  var l01 = v01.length;
  var l12 = v12.length;
  var l23 = v23.length;
  var l30 = v30.length;
  var minSide = Math.min(l01, l12, l23, l30);
  var maxSide = Math.max(l01, l12, l23, l30);

  if (!isFinite(minSide) || !isFinite(maxSide) || minSide <= 1e-4) return false;
  if ((maxSide / minSide) > 1.03) return false;

  var areaTwice = Math.abs(v01.cross(p3.subtract(p0))) + Math.abs(v12.cross(p0.subtract(p1)));
  if (areaTwice <= (minSide * minSide * 0.12)) return false;

  function isNearlyRightAngle(vA, vB) {
    if (vA.length <= 1e-4 || vB.length <= 1e-4) return false;
    var cosineAbs = Math.abs(vA.dot(vB) / (vA.length * vB.length));
    return cosineAbs <= 0.2;
  }

  if (!isNearlyRightAngle(v01, v12)) return false;
  if (!isNearlyRightAngle(v12, v23)) return false;
  if (!isNearlyRightAngle(v23, v30)) return false;
  if (!isNearlyRightAngle(v30, v01)) return false;

  var d02 = p0.getDistance(p2);
  var d13 = p1.getDistance(p3);
  var minDiag = Math.min(d02, d13);
  var maxDiag = Math.max(d02, d13);
  if (!isFinite(minDiag) || minDiag <= 1e-4) return false;
  if ((maxDiag / minDiag) > 1.03) return false;

  return true;
}

function threadHasSquareDiscovery(thread) {
  if (!thread || points.length < 4) return false;

  var graph = buildUndirectedGraphFromSegments(computeSegments(thread), points.length);
  var adjacency = graph.adjacency;
  var neighbors = graph.neighbors;

  for (var a = 0; a < neighbors.length; a++) {
    for (var i = 0; i < neighbors[a].length; i++) {
      var b = neighbors[a][i];
      if (b === a) continue;

      for (var j = 0; j < neighbors[b].length; j++) {
        var c = neighbors[b][j];
        if (c === b || c === a) continue;

        for (var k = 0; k < neighbors[c].length; k++) {
          var d = neighbors[c][k];
          if (d === c || d === b || d === a) continue;
          if (!adjacency[d][a]) continue;

          if (isApproxSquareCycleByIndices(a, b, c, d)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

function isRosetteDiscoveryCandidate() {
  var holeCount = parseInt(holesSlider.value, 10);
  if (!isFinite(holeCount) || holeCount < 24) return false;

  var candidates = getDiscoveryCandidateThreads();
  for (var i = 0; i < candidates.length; i++) {
    var thread = candidates[i];
    ensureThreadConnectConfig(thread);
    if (thread.jumpMode === 'connect' && Number(thread.connectMultiplier) >= 3) {
      return true;
    }
  }
  return false;
}

function isDiscoveryRuleEnabled(rule) {
  if (!rule || !rule.enabledFlag) return true;
  if (rule.enabledFlag === 'rosetteDiscovery') return !!ROSETTE_DISCOVERY_ENABLED;
  return true;
}

function getDiscoveryDetector(detectorId) {
  if (detectorId === 'equilateralTriangle') return threadHasEquilateralTriangleDiscovery;
  if (detectorId === 'square') return threadHasSquareDiscovery;
  if (detectorId === 'rosetteCandidate') return isRosetteDiscoveryCandidate;
  return null;
}

function doesRuleMatchDiscovery(rule, threadCandidates, threadDetectorCache) {
  if (!rule || !rule.detectorId) return false;
  var detector = getDiscoveryDetector(rule.detectorId);
  if (!detector) return false;

  if (rule.detectorScope === 'global') {
    return !!detector();
  }

  if (Object.prototype.hasOwnProperty.call(threadDetectorCache, rule.detectorId)) {
    return !!threadDetectorCache[rule.detectorId];
  }

  var matched = false;
  for (var i = 0; i < threadCandidates.length; i++) {
    if (detector(threadCandidates[i])) {
      matched = true;
      break;
    }
  }
  threadDetectorCache[rule.detectorId] = matched;
  return matched;
}

function evaluateDiscoveryCandidates() {
  computePoints();

  var threadCandidates = getDiscoveryCandidateThreads();
  var threadDetectorCache = Object.create(null);
  var keys = Object.keys(DISCOVERY_LIBRARY);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var config = DISCOVERY_LIBRARY[key];
    if (!config || !config.discoveryRule) continue;
    if (!isDiscoveryRuleEnabled(config.discoveryRule)) continue;
    if (doesRuleMatchDiscovery(config.discoveryRule, threadCandidates, threadDetectorCache)) {
      unlockDiscovery(key);
    }
  }
}

function scheduleDiscoveryEvaluation() {
  if (discoveryTimer) {
    clearTimeout(discoveryTimer);
  }
  discoveryTimer = window.setTimeout(function() {
    discoveryTimer = null;
    if (hasActiveSliderMotion()) {
      scheduleDiscoveryEvaluation();
      return;
    }
    evaluateDiscoveryCandidates();
  }, DISCOVERY_STABILIZE_MS);
}

function markSliderAsMoving(slider) {
  var key = getSliderMotionKey(slider);
  if (!key) return;
  sliderMotionKeys[key] = true;
  if (sliderMotionSettleTimers[key]) {
    clearTimeout(sliderMotionSettleTimers[key]);
    delete sliderMotionSettleTimers[key];
  }
}

function settleSliderMotionByKey(key) {
  if (!key) return;
  if (sliderMotionSettleTimers[key]) {
    clearTimeout(sliderMotionSettleTimers[key]);
  }
  sliderMotionSettleTimers[key] = window.setTimeout(function() {
    delete sliderMotionKeys[key];
    delete sliderMotionSettleTimers[key];
    updateMusicPlaybackState();
  }, SLIDER_MOTION_SETTLE_MS);
}

function settleSliderMotion(slider) {
  var key = getSliderMotionKey(slider);
  settleSliderMotionByKey(key);
}

function settleAllSliderMotion() {
  for (var key in sliderMotionKeys) {
    settleSliderMotionByKey(key);
  }
  scheduleUrlStateSync(true);
}

function setHoleNumberHighlight(index, isHighlighted) {
  var label = holeNumberLabelsByIndex[index];
  if (!label) return;
  label.fontWeight = isHighlighted ? 'bold' : 'normal';
  label.fillColor = isHighlighted ? '#1f2f4d' : '#555';
}

function clearHighlightedHoleNumbers() {
  for (var i = 0; i < highlightedHoleNumbers.length; i++) {
    setHoleNumberHighlight(highlightedHoleNumbers[i], false);
  }
  highlightedHoleNumbers = [];
}

function highlightHoleNumberPair(firstIndex, secondIndex) {
  clearHighlightedHoleNumbers();

  if (!isFinite(firstIndex) || !isFinite(secondIndex)) return;

  setHoleNumberHighlight(firstIndex, true);
  highlightedHoleNumbers.push(firstIndex);

  if (secondIndex !== firstIndex) {
    setHoleNumberHighlight(secondIndex, true);
    highlightedHoleNumbers.push(secondIndex);
  }
}

function syncHoleNumberHighlightFromAnimationState() {
  if (!animationState || !animationState.activeHolePair) {
    clearHighlightedHoleNumbers();
    return;
  }
  highlightHoleNumberPair(animationState.activeHolePair[0], animationState.activeHolePair[1]);
}

function updateKidControlValues() {
  var m = getStitchingUiModule();
  if (m) m.updateKidControlValues();
}

function syncBorderControls() {
  var m = getStitchingUiModule();
  if (m) m.syncBorderControls();
}

function ensureThreadConnectConfig(thread) {
  if (!thread) return;
  if (!isFinite(thread.connectMultiplier)) {
    thread.connectMultiplier = 2;
  }
  if (!isFinite(thread.connectOffset)) {
    thread.connectOffset = 0;
  }
}

function buildMagicThread() {
  var m = getStitchingUiModule();
  return m ? m.buildMagicThread() : null;
}

function applyExperiencePaletteColorChoice(colorValue) {
  var m = getStitchingUiModule();
  if (m) m.applyExperiencePaletteColorChoice(colorValue);
}

function syncHoleNumberToggles() {
  var m = getStitchingUiModule();
  if (m) m.syncHoleNumberToggles();
}

function setCurrentShape(shape, shouldDraw) {
  var nextShape = shape || 'circle';
  currentShape = nextShape;
  dispatchRuntimeState({
    type: 'SET_SHAPE',
    payload: { shape: nextShape }
  });
  document.querySelectorAll('.shape-btn').forEach((b) => b.classList.remove('active'));
  var activeShapeBtn = document.querySelector('.shape-btn[data-shape="' + nextShape + '"]');
  if (activeShapeBtn) {
    activeShapeBtn.classList.add('active');
  }
  if (advancedShapeSelect.value !== nextShape) {
    advancedShapeSelect.value = nextShape;
  }
  if (shouldDraw !== false) {
    redrawForPathChange();
  }
}

function refreshKidThreadPicker() {
  var m = getStitchingUiModule();
  if (m) m.refreshKidThreadPicker();
}

function getKidTargetThreadIndex() {
  var m = getStitchingUiModule();
  return m ? m.getKidTargetThreadIndex() : -1;
}

function syncKidControlsFromSelectedThread() {
  var uiModule = getStitchingUiModule();
  if (uiModule && typeof uiModule.syncKidControlsFromSelectedThread === 'function') {
    uiModule.syncKidControlsFromSelectedThread();
  }
}

function applyDefaultHoles() {
  holesSlider.value = String(DEFAULT_HOLES);
  if (advancedHolesNumberInput) {
    advancedHolesNumberInput.value = String(DEFAULT_HOLES);
  }
  updateKidControlValues();
}

function applyDefaultSkipAndSize() {
  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex >= 0 && threads[targetIndex]) {
    threads[targetIndex].jump = DEFAULT_SKIP;
    threads[targetIndex].width = DEFAULT_THREAD_SIZE;
  }
  jumpSlider.value = String(DEFAULT_SKIP);
  widthSlider.value = String(DEFAULT_THREAD_SIZE);
  updateKidControlValues();
}

function syncAdvancedTempoControls() {
  var allowedTempos = getActiveTempoOptions();
  if (allowedTempos.indexOf(currentAnimationBpm) === -1) {
    currentAnimationBpm = allowedTempos[0] || DEFAULT_ANIMATION_BPM;
  }
  CORE_UI.advancedTempoInput.value = String(currentAnimationBpm);
  CORE_UI.advancedTempoValue.textContent = String(currentAnimationBpm);
}

function syncKidTempoPresetControls() {
  if (!kidTempoSlowBtn || !kidTempoNormalBtn || !kidTempoFastBtn) return;
  var presets = getKidTempoPresetsForSong(currentSongId);
  var activePreset = null;
  if (currentAnimationBpm === presets.slow) activePreset = 'slow';
  if (currentAnimationBpm === presets.normal) activePreset = 'normal';
  if (currentAnimationBpm === presets.fast) activePreset = 'fast';

  kidTempoSlowBtn.classList.toggle('is-active', activePreset === 'slow');
  kidTempoNormalBtn.classList.toggle('is-active', activePreset === 'normal');
  kidTempoFastBtn.classList.toggle('is-active', activePreset === 'fast');

  kidTempoSlowBtn.setAttribute('aria-pressed', activePreset === 'slow' ? 'true' : 'false');
  kidTempoNormalBtn.setAttribute('aria-pressed', activePreset === 'normal' ? 'true' : 'false');
  kidTempoFastBtn.setAttribute('aria-pressed', activePreset === 'fast' ? 'true' : 'false');
}

function applyTempoValue(bpm) {
  var parsed = Math.round(Number(bpm));
  var allowedTempos = getActiveTempoOptions();
  if (!isFinite(parsed) || allowedTempos.indexOf(parsed) === -1) {
    parsed = allowedTempos[0] || DEFAULT_ANIMATION_BPM;
  }
  currentAnimationBpm = parsed;
  dispatchRuntimeState({
    type: 'SET_TEMPO',
    payload: { bpm: currentAnimationBpm }
  });
  syncAdvancedTempoControls();
  syncKidTempoPresetControls();
  // Tempo change updates playback speed without resetting progress.
  redrawAnimationInPlace();
  scheduleUrlStateSync(false);
}

function syncAnimateButtonLabel() {
  if (!animateBtn) return;
  if (animationPlaybackState === 'playing') {
    animateBtn.textContent = '⏸';
    animateBtn.setAttribute('aria-pressed', 'true');
    animateBtn.setAttribute('aria-label', 'Pause stitching');
    animateBtn.title = 'Pause stitching';
    return;
  }
  if (animationPlaybackState === 'paused') {
    animateBtn.textContent = '▶';
    animateBtn.setAttribute('aria-pressed', 'false');
    animateBtn.setAttribute('aria-label', 'Resume stitching');
    animateBtn.title = 'Resume stitching';
    return;
  }
  animateBtn.textContent = '▶';
  animateBtn.setAttribute('aria-pressed', 'false');
  animateBtn.setAttribute('aria-label', 'Watch it stitch');
  animateBtn.title = 'Watch it stitch';
}

function applyDefaultTempo() {
  var allowedTempos = getActiveTempoOptions();
  applyTempoValue(allowedTempos[0] || DEFAULT_ANIMATION_BPM);
}

function stopAnimationIfActive() {
  if (!animationActive && !animationState && !triangulaAnimationState) return;
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  triangulaAnimationState = null;
  animationPlaybackState = 'idle';
  syncAnimateButtonLabel();
  clearHighlightedHoleNumbers();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
}

function pauseAnimationIfActive() {
  if (!animationActive || (!animationState && !triangulaAnimationState)) return;
  animationActive = false;
  view.onFrame = null;
  animationPlaybackState = 'paused';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
}

function redrawForPathChange() {
  // Path/topology changes invalidate the current stitch progression.
  stopAnimationIfActive();
  drawStatic();
  STITCHER_BEHAVIOR.scheduleDiscoveryEvaluation();
  CORE_BEHAVIOR.scheduleUrlStateSync(false);
}

function drawAnimatedSegments(thread, segments, segmentCount) {
  if (!segments || !segments.length || segmentCount <= 0) return;
  var maxSegments = Math.min(segmentCount, segments.length);
  for (var i = 0; i < maxSegments; i++) {
    var fromIndex = segments[i][0];
    var toIndex = segments[i][1];
    if (!isFinite(fromIndex) || !isFinite(toIndex)) continue;

    var seg = new Path();
    seg.strokeWidth = thread.width;
    if (thread.color === 'rainbow') {
      seg.strokeColor = rainbowColor(i / Math.max(1, segments.length));
    } else {
      seg.strokeColor = thread.color;
    }
    seg.add(points[fromIndex]);
    seg.add(points[toIndex]);
  }
}

function getAnimationSecondsPerSegment() {
  var secondsPerSegment = (60 / currentAnimationBpm) * BEATS_PER_STITCH_SEGMENT;
  if (!isFinite(secondsPerSegment) || secondsPerSegment <= 0) {
    secondsPerSegment = (60 / DEFAULT_ANIMATION_BPM) * BEATS_PER_STITCH_SEGMENT;
  }
  return secondsPerSegment;
}

function drawAnimatedSegmentProgress(thread, segments, segmentIndex, progress) {
  if (!segments || !segments.length || segmentIndex < 0 || segmentIndex >= segments.length) return null;

  var fromIndex = segments[segmentIndex][0];
  var toIndex = segments[segmentIndex][1];
  var startPoint = points[fromIndex];
  var endPoint = points[toIndex];

  if (!startPoint || !endPoint) return null;

  var p = Math.max(0, Math.min(1, progress));
  // A slight ease-out makes the pull feel more organic without changing tempo.
  var eased = 1 - Math.pow(1 - p, 2);
  var currentPoint = startPoint.add(endPoint.subtract(startPoint).multiply(eased));

  var seg = new Path();
  seg.strokeWidth = thread.width;

  if (thread.color === 'rainbow') {
    seg.strokeColor = rainbowColor(segmentIndex / Math.max(1, segments.length));
  } else {
    seg.strokeColor = thread.color;
  }

  seg.add(startPoint);
  seg.add(currentPoint);

  if (p < 1) {
    var pullHead = new Path.Circle(currentPoint, Math.max(1.8, thread.width * 0.7));
    pullHead.fillColor = seg.strokeColor;
    pullHead.opacity = 0.88;
  }

  return [fromIndex, toIndex];
}

function drawSegmentSettleAccent(settle) {
  if (!settle || settle.remaining <= 0 || settle.duration <= 0) return;
  if (settle.threadIndex < 0 || settle.threadIndex >= threads.length) return;

  var segments = settle.segments;
  if (!segments || !segments.length || settle.segmentIndex < 0 || settle.segmentIndex >= segments.length) return;

  var fromIndex = segments[settle.segmentIndex][0];
  var toIndex = segments[settle.segmentIndex][1];
  var startPoint = points[fromIndex];
  var endPoint = points[toIndex];
  if (!startPoint || !endPoint) return;

  var ratio = Math.max(0, Math.min(1, settle.remaining / settle.duration));
  var settleStrength = ratio * ratio;
  var distance = startPoint.getDistance(endPoint);
  var overshootAmount = Math.min(8, distance * STITCH_PULL_SETTLE_OVERSHOOT * settleStrength);
  if (overshootAmount <= 0.01) return;

  // Blend incoming and outgoing directions so the overshoot follows local flow.
  var incoming = endPoint.subtract(startPoint);
  if (incoming.length <= 0) return;

  var nextSegment = segments[(settle.segmentIndex + 1) % segments.length];
  var nextPoint = nextSegment ? points[nextSegment[1]] : null;
  var outgoing = nextPoint ? nextPoint.subtract(endPoint) : null;

  var tangent = incoming.normalize(1);
  if (outgoing && outgoing.length > 0) {
    tangent = incoming.normalize(0.7).add(outgoing.normalize(0.3));
    if (tangent.length <= 0) {
      tangent = incoming.normalize(1);
    }
  }

  var overshootPoint = endPoint.add(tangent.normalize(overshootAmount));

  var thread = threads[settle.threadIndex];
  var color = thread.color === 'rainbow'
    ? rainbowColor(settle.segmentIndex / Math.max(1, segments.length))
    : thread.color;

  var settleLine = new Path();
  settleLine.strokeColor = color;
  settleLine.strokeWidth = Math.max(1, thread.width * (0.75 + 0.35 * ratio));
  settleLine.opacity = 0.65 * ratio;
  settleLine.add(endPoint);
  settleLine.add(overshootPoint);

  var settleHead = new Path.Circle(overshootPoint, Math.max(1.4, thread.width * 0.55));
  settleHead.fillColor = color;
  settleHead.opacity = 0.7 * ratio;
}

function redrawAnimationInPlace() {
  // Style-only updates should preserve current animation progress.
  if (triangulaAnimationState) {
    renderTriangulaAnimationStateFrame(triangulaAnimationState);
    STITCHER_BEHAVIOR.scheduleDiscoveryEvaluation();
    CORE_BEHAVIOR.scheduleUrlStateSync(false);
    return;
  }

  if (!animationState) {
    drawStatic();
    STITCHER_BEHAVIOR.scheduleDiscoveryEvaluation();
    CORE_BEHAVIOR.scheduleUrlStateSync(false);
    return;
  }

  var renderModule = getStitchingRenderModule();
  if (renderModule && typeof renderModule.renderAnimationFrame === 'function') {
    renderModule.renderAnimationFrame();
  }
  STITCHER_BEHAVIOR.scheduleDiscoveryEvaluation();
  CORE_BEHAVIOR.scheduleUrlStateSync(false);
}

function scheduleFitCanvasToStage() {
  if (pendingCanvasFit) return;
  pendingCanvasFit = true;
  requestAnimationFrame(function() {
    pendingCanvasFit = false;
    fitCanvasToStage();
  });
}

function fitCanvasToStage() {
  var stageHost = canvasStage.parentElement || canvasContainer;
  var containerRect = stageHost.getBoundingClientRect();

  var maxWidth = parseFloat(getComputedStyle(canvasStage).maxWidth);
  if (!isFinite(maxWidth) || maxWidth <= 0) {
    maxWidth = Infinity;
  }

  var viewportCap = Infinity;
  if (window.visualViewport) {
    viewportCap = Math.min(window.visualViewport.width, window.visualViewport.height);
  }

  var size = Math.floor(Math.min(containerRect.width, containerRect.height, maxWidth, viewportCap));

  if ((!isFinite(size) || size <= 0) && canvasContainer) {
    var fallbackWidth = canvasContainer.clientWidth || 0;
    var fallbackHeight = canvasContainer.clientHeight || 0;
    size = Math.floor(Math.min(fallbackWidth, fallbackHeight, maxWidth));
  }

  if (!isFinite(size) || size <= 0) return;

  // Keep the stage physically square so canvas rendering never stretches.
  var pixelSize = size + 'px';
  if (canvasStage.style.width !== pixelSize) {
    canvasStage.style.width = pixelSize;
  }
  if (canvasStage.style.height !== pixelSize) {
    canvasStage.style.height = pixelSize;
  }

  if (view.viewSize.width === size && view.viewSize.height === size) {
    if (!project.activeLayer.children.length) {
      drawStatic();
    }
    return;
  }

  view.viewSize = new Size(size, size);

  if (animationActive) {
    animationActive = false;
    view.onFrame = null;
    animationState = null;
    triangulaAnimationState = null;
    updateMusicPlaybackState();
  }

  drawStatic();
}

/* ------------------------------
   RAINBOW HELPER
------------------------------ */
function rainbowColor(t) {
  return new Color({ hue: t * 360, saturation: 1, brightness: 1 });
}

/* ------------------------------
   SHAPE GENERATION
------------------------------ */
var currentShape = "circle";

if (typeof window.createRuntimeStateStore === 'function') {
  runtimeStateStore = window.createRuntimeStateStore({
    experienceId: currentExperienceId,
    shape: currentShape,
    bpm: currentAnimationBpm,
    songId: currentSongId,
    musicMuted: isMusicMuted
  });
}

function getShapeGeometry() {
  var radius = Math.min(view.size.width, view.size.height) * 0.35;
  var center = view.center.clone();
  var sampleCount = 360;
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;

  // Auto-center by the shape's own bounding box so all frame types stay centered
  // without maintaining hand-tuned per-shape offsets.
  for (var i = 0; i < sampleCount; i++) {
    var t = (2 * Math.PI * i) / sampleCount;
    var p = shapePointAtAngle(t, new Point(0, 0), radius);
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  var shapeBoundsCenter = new Point((minX + maxX) * 0.5, (minY + maxY) * 0.5);
  center = center.subtract(shapeBoundsCenter);

  return {
    center: center,
    radius: radius
  };
}

function polygonPoint(theta, sides, radius, center) {
  var sector = (2 * Math.PI) / sides;
  var a = ((theta % sector) + sector) % sector - sector / 2;
  var r = radius * Math.cos(Math.PI / sides) / Math.cos(a);
  return new Point(
    center.x + r * Math.cos(theta),
    center.y + r * Math.sin(theta)
  );
}

function shapePointAtAngle(t, center, radius) {

  if (currentShape === 'triangle') {
    var trianglePoint = polygonPoint(t, 3, radius, center);
    return trianglePoint.rotate(-90, center);
  }

  if (currentShape === 'square') {
    var c = Math.cos(t);
    var s = Math.sin(t);
    var m = Math.max(Math.abs(c), Math.abs(s));
    return new Point(
      center.x + (radius * c) / m,
      center.y + (radius * s) / m
    );
  }

  if (currentShape === 'star') {
    var starRadius = radius * (0.62 + 0.38 * Math.cos(5 * t));
    return new Point(
      center.x + starRadius * Math.cos(t - Math.PI / 2),
      center.y + starRadius * Math.sin(t - Math.PI / 2)
    );
  }

  if (currentShape === 'heart') {
    var x = 16 * Math.pow(Math.sin(t), 3);
    var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    var scale = radius / 18;
    return new Point(
      center.x + x * scale,
      center.y - y * scale
    );
  }

  return new Point(
    center.x + radius * Math.cos(t),
    center.y + radius * Math.sin(t)
  );
}

function buildShapeBoundarySamples(sampleCount, center, radius) {
  var samples = [];
  var angleOffset = currentShape === 'square' ? -Math.PI / 2 : 0;
  for (var i = 0; i < sampleCount; i++) {
    var t = angleOffset + ((2 * Math.PI * i) / sampleCount);
    samples.push(shapePointAtAngle(t, center, radius));
  }
  return samples;
}

function sampleEvenlyAlongClosedPolyline(vertices, count) {
  if (!vertices || !vertices.length || count <= 0) return [];

  var edgeLengths = [];
  var totalLength = 0;

  for (var i = 0; i < vertices.length; i++) {
    var start = vertices[i];
    var end = vertices[(i + 1) % vertices.length];
    var edgeLength = start.getDistance(end);
    edgeLengths.push(edgeLength);
    totalLength += edgeLength;
  }

  if (!isFinite(totalLength) || totalLength <= 0) {
    return [vertices[0]];
  }

  var result = [];
  var stepLength = totalLength / count;
  var edgeIndex = 0;
  var traversed = 0;

  for (var targetIndex = 0; targetIndex < count; targetIndex++) {
    var targetDistance = targetIndex * stepLength;

    while (
      edgeIndex < edgeLengths.length - 1 &&
      traversed + edgeLengths[edgeIndex] < targetDistance
    ) {
      traversed += edgeLengths[edgeIndex];
      edgeIndex++;
    }

    var edgeStart = vertices[edgeIndex];
    var edgeEnd = vertices[(edgeIndex + 1) % vertices.length];
    var edgeLen = edgeLengths[edgeIndex];
    var localDistance = targetDistance - traversed;
    var ratio = edgeLen > 0 ? localDistance / edgeLen : 0;

    result.push(edgeStart.add(edgeEnd.subtract(edgeStart).multiply(ratio)));
  }

  return result;
}

function computePoints() {
  var n = parseInt(holesSlider.value, 10);
  var geometry = getShapeGeometry();
  var center = geometry.center;
  var radius = geometry.radius;

  points = [];

  // Circle already has exact uniform spacing with equal-angle sampling.
  if (currentShape === 'circle') {
    for (var i = 0; i < n; i++) {
      var t = (-Math.PI / 2) + ((2 * Math.PI * i) / n);
      points.push(shapePointAtAngle(t, center, radius));
    }
    return;
  }

  // Non-circular shapes need perimeter-based resampling for visual uniformity.
  var sampleCount = Math.max(360, n * 12);
  var boundarySamples = buildShapeBoundarySamples(sampleCount, center, radius);
  points = sampleEvenlyAlongClosedPolyline(boundarySamples, n);
}

function signedAreaOfClosedPolyline(vertices) {
  if (!vertices || vertices.length < 3) return 0;
  var twiceArea = 0;
  for (var i = 0; i < vertices.length; i++) {
    var current = vertices[i];
    var next = vertices[(i + 1) % vertices.length];
    twiceArea += (current.x * next.y) - (next.x * current.y);
  }
  return twiceArea / 2;
}

function offsetClosedPolyline(vertices, distance) {
  if (!vertices || vertices.length < 3 || !isFinite(distance) || distance === 0) {
    return vertices ? vertices.slice() : [];
  }

  var ccw = signedAreaOfClosedPolyline(vertices) > 0;
  var outwardRotation = ccw ? -90 : 90;
  var result = [];

  for (var i = 0; i < vertices.length; i++) {
    var prev = vertices[(i - 1 + vertices.length) % vertices.length];
    var curr = vertices[i];
    var next = vertices[(i + 1) % vertices.length];

    var incoming = curr.subtract(prev);
    var outgoing = next.subtract(curr);

    var n1 = incoming.length > 0 ? incoming.normalize(1).rotate(outwardRotation) : null;
    var n2 = outgoing.length > 0 ? outgoing.normalize(1).rotate(outwardRotation) : null;

    var normal = null;
    if (n1 && n2) {
      normal = n1.add(n2);
      if (normal.length <= 1e-6) {
        normal = n1;
      }
    } else {
      normal = n1 || n2;
    }

    if (!normal || normal.length <= 1e-6) {
      var tangent = next.subtract(prev);
      normal = tangent.length > 0 ? tangent.normalize(1).rotate(outwardRotation) : new Point(0, -1);
    }

    result.push(curr.add(normal.normalize(distance)));
  }

  return result;
}

function lineIntersection(a1, a2, b1, b2) {
  var r = a2.subtract(a1);
  var s = b2.subtract(b1);
  var rxs = r.cross(s);
  if (Math.abs(rxs) <= 1e-8) {
    return null;
  }
  var t = b1.subtract(a1).cross(s) / rxs;
  return a1.add(r.multiply(t));
}

function getPolygonCornerVertices() {
  var geometry = getShapeGeometry();
  var vertices = [];

  if (currentShape === 'triangle') {
    for (var i = 0; i < 3; i++) {
      var tTri = i * 2 * Math.PI / 3;
      vertices.push(shapePointAtAngle(tTri, geometry.center, geometry.radius));
    }
    return vertices;
  }

  if (currentShape === 'square') {
    for (var j = 0; j < 4; j++) {
      var tSq = (Math.PI / 4) + (j * Math.PI / 2);
      vertices.push(shapePointAtAngle(tSq, geometry.center, geometry.radius));
    }
    return vertices;
  }

  return null;
}

function offsetConvexPolygon(vertices, distance) {
  if (!vertices || vertices.length < 3 || !isFinite(distance) || distance === 0) {
    return vertices ? vertices.slice() : [];
  }

  var n = vertices.length;
  var ccw = signedAreaOfClosedPolyline(vertices) > 0;
  var outwardRotation = ccw ? -90 : 90;
  var offsetLines = [];

  for (var i = 0; i < n; i++) {
    var start = vertices[i];
    var end = vertices[(i + 1) % n];
    var edge = end.subtract(start);
    if (edge.length <= 1e-8) continue;

    var outward = edge.normalize(1).rotate(outwardRotation).normalize(distance);
    offsetLines.push({
      p1: start.add(outward),
      p2: end.add(outward)
    });
  }

  if (offsetLines.length < 3) {
    return vertices.slice();
  }

  var result = [];
  for (var k = 0; k < offsetLines.length; k++) {
    var prevLine = offsetLines[(k - 1 + offsetLines.length) % offsetLines.length];
    var thisLine = offsetLines[k];
    var corner = lineIntersection(prevLine.p1, prevLine.p2, thisLine.p1, thisLine.p2);
    if (!corner) {
      corner = thisLine.p1;
    }
    result.push(corner);
  }

  return result;
}

function getBorderGeometryForCurrentShape() {
  var polygonVertices = getPolygonCornerVertices();
  var outerSamples;
  var innerSamples;

  if (polygonVertices && polygonVertices.length >= 3) {
    // For polygons, offset exact edges and intersect them for crisp, stable corners.
    outerSamples = offsetConvexPolygon(polygonVertices, BORDER_OUTER_GAP);
    innerSamples = offsetConvexPolygon(polygonVertices, -BORDER_INNER_GAP);
  } else {
    // Curved/organic shapes continue to use dense polyline offsets.
    var geometry = getShapeGeometry();
    var boundarySamples = buildShapeBoundarySamples(480, geometry.center, geometry.radius);
    if (!boundarySamples.length) return;
    outerSamples = offsetClosedPolyline(boundarySamples, BORDER_OUTER_GAP);
    innerSamples = offsetClosedPolyline(boundarySamples, -BORDER_INNER_GAP);
  }

  return {
    outerSamples: outerSamples,
    innerSamples: innerSamples,
    isPolygon: !!(polygonVertices && polygonVertices.length >= 3),
    polygonVertices: polygonVertices
  };
}

/* ------------------------------
   DRAWING THREADS
------------------------------ */
function computeSegments(thread) {
  var renderModule = getStitchingRenderModule();
  if (renderModule && typeof renderModule.computeSegments === 'function') {
    return renderModule.computeSegments(thread);
  }
  return [];
}

var triangulaRuntime = typeof window.createTriangulaExperienceRuntime === 'function'
  ? window.createTriangulaExperienceRuntime({
      clearLayer: function() {
        project.activeLayer.removeChildren();
      },
      drawTriangulaDepth: function(depth, scale) {
        var rm = getTriangulaRenderModule();
        if (rm) rm.drawTriangulaDepth(depth, scale);
      },
      triangulaCountToDepth: function(c) { return getTriangulaCoreModule().triangulaCountToDepth(c); },
      getTriangulaTargetCount: function() {
        return triangulaTargetCount;
      },
      getTriangulaStartCount: function() {
        return triangulaStartCount;
      },
      clearHighlightedHoleNumbers: clearHighlightedHoleNumbers,
      getAnimationActive: function() {
        return animationActive;
      },
      setAnimationActive: function(nextValue) {
        animationActive = !!nextValue;
      },
      getTriangulaAnimationState: function() {
        return triangulaAnimationState;
      },
      setTriangulaAnimationState: function(nextState) {
        triangulaAnimationState = nextState || null;
      },
      setAnimationState: function(nextState) {
        animationState = nextState || null;
      },
      setAnimationPlaybackState: function(nextState) {
        animationPlaybackState = nextState || 'idle';
      },
      setViewFrameHandler: function(handler) {
        view.onFrame = handler;
      },
      syncAnimateButtonLabel: syncAnimateButtonLabel,
      updateMusicPlaybackState: updateMusicPlaybackState,
      scheduleUrlStateSync: scheduleUrlStateSync,
      getTriangulaStepDurationSeconds: function(step) { return getTriangulaCoreModule().getTriangulaStepDurationSeconds(step); },
      buildTriangulaSteps: function(base, tc, sc) { return getTriangulaCoreModule().buildTriangulaSteps(base, tc, sc); },
      getTriangulaConstructionMode: function() {
        return triangulaConstructionMode;
      },
      getTriangulaFractalMode: function() {
        return triangulaFractalMode;
      },
      getTriangulaCompletedDepth: function(base, tc, sc) { return getTriangulaCoreModule().getTriangulaCompletedDepth(base, tc, sc); },
      getTriangulaTimelineScale: function(steps) { return getTriangulaCoreModule().getTriangulaTimelineScale(steps); },
      getTriangulaBaseTriangle: function(s) { return getTriangulaCoreModule().getTriangulaBaseTriangle(s); },
      getTriangulaFinalizedCountAtDepth: function(base, d, finalDepth, steps) { return getTriangulaCoreModule().getTriangulaFinalizedCountAtDepth(base, d, finalDepth, steps); },
      drawTriangulaFinalizedAtDepth: function(base, depth, finalizedCount) {
        var rm = getTriangulaRenderModule();
        if (rm) rm.drawTriangulaFinalizedAtDepth(base, depth, finalizedCount);
      },
      drawTriangulaStepOverlay: function(base, step, progress) {
        var rm = getTriangulaRenderModule();
        if (rm) rm.drawTriangulaStepOverlay(base, step, progress);
      }
    })
  : null;

function renderTriangulaAnimationStateFrame(state) {
  if (triangulaRuntime && typeof triangulaRuntime.renderAnimationStateFrame === 'function') {
    triangulaRuntime.renderAnimationStateFrame(state);
  }
}

function drawTriangulaStatic() {
  if (triangulaRuntime && typeof triangulaRuntime.drawStatic === 'function') {
    triangulaRuntime.drawStatic();
  }
}

function runTriangulaAnimationFrame(event) {
  if (triangulaRuntime && typeof triangulaRuntime.runAnimationFrame === 'function') {
    triangulaRuntime.runAnimationFrame(event);
  }
}

function animateTriangula() {
  if (triangulaRuntime && typeof triangulaRuntime.animate === 'function') {
    triangulaRuntime.animate();
  }
}

function formatSvgNumber(value) {
  return String(Math.round(value * 1000) / 1000);
}

function colorToSvg(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value.toCSS === 'function') {
    return value.toCSS(true);
  }
  return '#000000';
}

function svgPathFromPoints(vertices) {
  if (!vertices || !vertices.length) return '';
  var parts = ['M ' + formatSvgNumber(vertices[0].x) + ' ' + formatSvgNumber(vertices[0].y)];
  for (var i = 1; i < vertices.length; i++) {
    parts.push('L ' + formatSvgNumber(vertices[i].x) + ' ' + formatSvgNumber(vertices[i].y));
  }
  parts.push('Z');
  return parts.join(' ');
}

function getTimestampLabel() {
  var now = new Date();
  var y = now.getFullYear();
  var m = String(now.getMonth() + 1).padStart(2, '0');
  var d = String(now.getDate()).padStart(2, '0');
  var hh = String(now.getHours()).padStart(2, '0');
  var mm = String(now.getMinutes()).padStart(2, '0');
  var ss = String(now.getSeconds()).padStart(2, '0');
  return y + m + d + '-' + hh + mm + ss;
}

function normalizeExportBaseName(rawName) {
  var fallback = 'curve_stitcher-' + getTimestampLabel();
  var source = String(rawName || '').trim();
  if (!source) return fallback;
  var cleaned = source
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[_\-.]+|[_\-.]+$/g, '');
  return cleaned || fallback;
}

function triggerBlobDownload(blob, fileName) {
  var url = URL.createObjectURL(blob);
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(function() {
    URL.revokeObjectURL(url);
  }, 0);
}

function buildTriangulaDesignSvgString() {
  var exportModule = getTriangulaExportModule();
  if (exportModule && typeof exportModule.buildTriangulaDesignSvgString === 'function') {
    return exportModule.buildTriangulaDesignSvgString();
  }
  return '';
}

function getExperienceExportHandlers(experienceId) {
  return getRegisteredExperienceExportHandler(experienceId);
}

function getExperienceExportProfile(experienceId) {
  return getRegisteredExperienceExportProfile(experienceId) || {
    supportsThreads: true,
    supportsPreview: true,
    defaultIncludeThreads: false,
    defaultIncludePreview: true,
    guideFileSuffix: '-guide.txt'
  };
}

registerExperienceExportHandler('stitching', {
  buildDesignSvgString: function(options) {
    return buildStitchingDesignSvgString(options);
  },
  buildGuideText: buildStitchingGuideText
});

registerExperienceExportHandler('triangula', {
  buildDesignSvgString: buildTriangulaDesignSvgString,
  buildGuideText: buildTriangulaGuideText
});

registerExperienceExportProfile('stitching', {
  supportsThreads: true,
  supportsPreview: true,
  defaultIncludeThreads: false,
  defaultIncludePreview: true,
  guideFileSuffix: '-stitching-guide.txt'
});

if (typeof getTriangulaExportProfileForExperience === 'function') {
  registerExperienceExportProfile('triangula', getTriangulaExportProfileForExperience('triangula'));
}

function buildStitchingDesignSvgString(options) {
  var exportModule = getStitchingExportModule();
  if (exportModule && typeof exportModule.buildStitchingDesignSvgString === 'function') {
    return exportModule.buildStitchingDesignSvgString(options || {});
  }
  return '';
}

function buildCurrentDesignSvgString(options) {
  options = options || {};
  var handlers = getExperienceExportHandlers(currentExperienceId);
  if (!handlers || typeof handlers.buildDesignSvgString !== 'function') {
    return '';
  }
  return handlers.buildDesignSvgString(options);
}

function downloadCurrentDesignSvg(fileBaseName, options) {
  var svgString = buildCurrentDesignSvgString(options);
  var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  triggerBlobDownload(blob, fileBaseName + '.svg');
}

function createCurrentDesignSvgBlob(options) {
  var svgString = buildCurrentDesignSvgString(options);
  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
}

function buildStitchingGuideText(fileBaseName, options) {
  var exportModule = getStitchingExportModule();
  if (exportModule && typeof exportModule.buildStitchingGuideText === 'function') {
    return exportModule.buildStitchingGuideText(fileBaseName, options || {});
  }
  return '';
}

function buildTriangulaGuideText(fileBaseName, options) {
  var exportModule = getTriangulaExportModule();
  if (exportModule && typeof exportModule.buildTriangulaGuideText === 'function') {
    return exportModule.buildTriangulaGuideText(fileBaseName, options || {});
  }
  return '';
}

function getExportGuideFileName(fileBaseName) {
  var profile = getExperienceExportProfile(currentExperienceId);
  return fileBaseName + (profile.guideFileSuffix || '-stitching-guide.txt');
}

function buildExportGuideText(fileBaseName, options) {
  var handlers = getExperienceExportHandlers(currentExperienceId);
  if (!handlers || typeof handlers.buildGuideText !== 'function') {
    return '';
  }
  return handlers.buildGuideText(fileBaseName, options || {});
}

function downloadStitchingGuide(fileBaseName, options) {
  var text = buildExportGuideText(fileBaseName, options || {});
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  triggerBlobDownload(blob, getExportGuideFileName(fileBaseName));
}

function createStitchingGuideBlob(fileBaseName, options) {
  var text = buildExportGuideText(fileBaseName, options || {});
  return new Blob([text], { type: 'text/plain;charset=utf-8' });
}

function downloadPreviewImage(fileBaseName) {
  var canvas = document.getElementById('myCanvas');
  if (!canvas || typeof canvas.toBlob !== 'function') {
    return;
  }
  canvas.toBlob(function(blob) {
    if (!blob) return;
    triggerBlobDownload(blob, fileBaseName + '-preview.png');
  }, 'image/png');
}

function createPreviewImageBlob() {
  return new Promise(function(resolve) {
    var canvas = document.getElementById('myCanvas');
    if (!canvas || typeof canvas.toBlob !== 'function') {
      resolve(null);
      return;
    }
    canvas.toBlob(function(blob) {
      resolve(blob || null);
    }, 'image/png');
  });
}

async function downloadExportZipBundle(fileBaseName, options) {
  var zip = new JSZip();
  zip.file(fileBaseName + '.svg', createCurrentDesignSvgBlob(options));

  if (options.includeGuide) {
    zip.file(getExportGuideFileName(fileBaseName), createStitchingGuideBlob(fileBaseName, options));
  }

  if (options.includePreview) {
    var previewBlob = await createPreviewImageBlob();
    if (previewBlob) {
      zip.file(fileBaseName + '-preview.png', previewBlob);
    }
  }

  var zipBlob = await zip.generateAsync({ type: 'blob' });
  triggerBlobDownload(zipBlob, fileBaseName + '.zip');
}

function openExportOptionsModal() {
  var profile = getExperienceExportProfile(currentExperienceId);
  var threadsRow = exportIncludeThreadsInput ? exportIncludeThreadsInput.closest('.modal-row') : null;
  var previewRow = exportIncludePreviewInput ? exportIncludePreviewInput.closest('.modal-row') : null;

  exportNameInput.value = 'curve_stitcher-' + getTimestampLabel();
  exportIncludeThreadsInput.checked = !!profile.defaultIncludeThreads;
  exportIncludeThreadsInput.disabled = profile.supportsThreads === false;
  exportIncludeGuideInput.checked = true;
  exportIncludePreviewInput.checked = !!profile.defaultIncludePreview;
  exportIncludePreviewInput.disabled = profile.supportsPreview === false;
  if (threadsRow) {
    threadsRow.style.display = profile.supportsThreads === false ? 'none' : '';
  }
  if (previewRow) {
    previewRow.style.display = profile.supportsPreview === false ? 'none' : '';
  }
  exportOptionsModal.classList.add('open');
  exportNameInput.focus();
  exportNameInput.select();
}

function closeExportOptionsModal() {
  exportOptionsModal.classList.remove('open');
}

async function runExportFromModalSelection() {
  var profile = getExperienceExportProfile(currentExperienceId);
  var baseName = normalizeExportBaseName(exportNameInput.value);
  var options = {
    includeThreads: profile.supportsThreads === false ? false : exportIncludeThreadsInput.checked,
    includeGuide: exportIncludeGuideInput.checked,
    includePreview: profile.supportsPreview === false ? false : exportIncludePreviewInput.checked
  };

  try {
    if (typeof JSZip === 'undefined') {
      // Fallback path if zip library fails to load.
      downloadCurrentDesignSvg(baseName, options);
      if (options.includeGuide) {
        downloadStitchingGuide(baseName, options);
      }
      if (options.includePreview) {
        downloadPreviewImage(baseName);
      }
    } else {
      await downloadExportZipBundle(baseName, options);
    }
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  }

  closeExportOptionsModal();
}

/* ------------------------------
   STATIC DRAW
------------------------------ */
var stitchingRuntime = typeof window.createStitchingExperienceRuntime === 'function'
  ? window.createStitchingExperienceRuntime({
      clearLayer: function() {
        project.activeLayer.removeChildren();
      },
      computePoints: computePoints,
      drawShapeBorder: function() {
        var renderModule = getStitchingRenderModule();
        if (renderModule && typeof renderModule.drawShapeBorder === 'function') {
          renderModule.drawShapeBorder();
        }
      },
      drawThread: function(thread) {
        var renderModule = getStitchingRenderModule();
        if (renderModule && typeof renderModule.drawThread === 'function') {
          renderModule.drawThread(thread);
        }
      },
      clearHighlightedHoleNumbers: clearHighlightedHoleNumbers,
      getPoints: function() {
        return points;
      },
      getHolesValue: function() {
        return holesSlider ? holesSlider.value : DEFAULT_HOLES;
      },
      getDefaultHoles: function() {
        return DEFAULT_HOLES;
      },
      getShowHoleNumbers: function() {
        return showHoleNumbers;
      },
      getHoleNumberAutoHideThreshold: function() {
        return HOLE_NUMBER_AUTO_HIDE_THRESHOLD;
      },
      signedAreaOfClosedPolyline: signedAreaOfClosedPolyline,
      getLabelBorderClearance: function() {
        return LABEL_BORDER_CLEARANCE;
      },
      getLabelHoleClearance: function() {
        return LABEL_HOLE_CLEARANCE;
      },
      getLabelOuterBias: function() {
        return LABEL_OUTER_BIAS;
      },
      getBorderOuterGap: function() {
        return BORDER_OUTER_GAP;
      },
      getBorderStrokeWidth: function() {
        return BORDER_STROKE_WIDTH;
      },
      setHoleNumberLabelsByIndex: function(nextLabels) {
        holeNumberLabelsByIndex = nextLabels || Object.create(null);
      },
      setHighlightedHoleNumbers: function(nextHighlighted) {
        highlightedHoleNumbers = Array.isArray(nextHighlighted) ? nextHighlighted : [];
      },
      getThreads: function() {
        return threads;
      },
      getAnimationActive: function() {
        return animationActive;
      },
      setAnimationActive: function(nextValue) {
        animationActive = !!nextValue;
      },
      getAnimationState: function() {
        return animationState;
      },
      setAnimationState: function(nextState) {
        animationState = nextState || null;
      },
      setTriangulaAnimationState: function(nextState) {
        triangulaAnimationState = nextState || null;
      },
      setAnimationPlaybackState: function(nextState) {
        animationPlaybackState = nextState || 'idle';
      },
      syncAnimateButtonLabel: syncAnimateButtonLabel,
      updateMusicPlaybackState: updateMusicPlaybackState,
      scheduleUrlStateSync: scheduleUrlStateSync,
      drawStatic: function() {
        drawStatic();
      },
      renderAnimationFrame: function() {
        var renderModule = getStitchingRenderModule();
        if (renderModule && typeof renderModule.renderAnimationFrame === 'function') {
          renderModule.renderAnimationFrame();
        }
      },
      computeSegments: computeSegments,
      getAnimationSecondsPerSegment: getAnimationSecondsPerSegment,
      getStitchPullSettleSeconds: function() {
        return STITCH_PULL_SETTLE_SECONDS;
      },
      setViewFrameHandler: function(handler) {
        view.onFrame = handler;
      }
    })
  : null;

function drawStitchingStatic() {
  if (stitchingRuntime && typeof stitchingRuntime.drawStatic === 'function') {
    stitchingRuntime.drawStatic();
  }
}

function drawStatic() {
  var engine = getExperienceEngine(currentExperienceId);
  if (engine && typeof engine.drawStatic === 'function') {
    engine.drawStatic();
    return;
  }
  drawStitchingStatic();
}

/* ------------------------------
   ANIMATION
------------------------------ */
function runAnimationFrameTick(event) {
  if (stitchingRuntime && typeof stitchingRuntime.runAnimationFrameTick === 'function') {
    stitchingRuntime.runAnimationFrameTick(event);
  }
}

function startAnimationLoop() {
  if (stitchingRuntime && typeof stitchingRuntime.startAnimationLoop === 'function') {
    stitchingRuntime.startAnimationLoop();
  }
}

function animateStitchingExperience() {
  if (stitchingRuntime && typeof stitchingRuntime.animate === 'function') {
    stitchingRuntime.animate();
  }
}

function drawSquarusStatic() {
  // Placeholder: Squarus currently reuses stitching renderer until world-specific rendering lands.
  drawStitchingStatic();
}

function animateSquarus() {
  // Placeholder: Squarus currently reuses stitching animation until world-specific animation lands.
  animateStitchingExperience();
}

function drawMashrabiyaStatic() {
  // Placeholder: Mashrabiya currently reuses stitching renderer until world-specific rendering lands.
  drawStitchingStatic();
}

function animateMashrabiya() {
  // Placeholder: Mashrabiya currently reuses stitching animation until world-specific animation lands.
  animateStitchingExperience();
}

var stitchingEngine = typeof window.createStitchingExperienceEngine === 'function'
  ? window.createStitchingExperienceEngine({
      drawStatic: drawStitchingStatic,
      animate: animateStitchingExperience
    })
  : {
      drawStatic: drawStitchingStatic,
      animate: animateStitchingExperience
    };

var triangulaEngine = typeof window.createTriangulaExperienceEngine === 'function'
  ? window.createTriangulaExperienceEngine({
      drawStatic: drawTriangulaStatic,
      animate: animateTriangula
    })
  : {
      drawStatic: drawTriangulaStatic,
      animate: animateTriangula
    };

registerExperienceEngine('stitching', stitchingEngine);
registerExperienceEngine('triangula', triangulaEngine);

registerExperienceEngine('squarus', {
  drawStatic: drawSquarusStatic,
  animate: animateSquarus
});

registerExperienceEngine('mashrabiya', {
  drawStatic: drawMashrabiyaStatic,
  animate: animateMashrabiya
});

function animateStitch() {
  var engine = getExperienceEngine(currentExperienceId);
  if (engine && typeof engine.animate === 'function') {
    engine.animate();
    return;
  }
  animateStitchingExperience();
}

function resumeAnimationIfPaused() {
  if (animationActive) return;
  if (!animationState && !triangulaAnimationState) return;
  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  if (triangulaAnimationState) {
    view.onFrame = runTriangulaAnimationFrame;
    return;
  }
  startAnimationLoop();
}

function toggleAnimationPlayback() {
  if (animationPlaybackState === 'playing') {
    pauseAnimationIfActive();
    return;
  }
  if (animationPlaybackState === 'paused') {
    resumeAnimationIfPaused();
    return;
  }
  animateStitch();
}

joyAudio.addEventListener('ended', function() {
  if (!shouldMusicBePlaying()) return;
  joyAudio.currentTime = 0;
  playMusicFromCurrentState();
});

/* ------------------------------
   THREAD UI
------------------------------ */
function renderThreadControls() {
  var uiModule = getStitchingUiModule();
  if (uiModule && typeof uiModule.renderThreadControls === 'function') {
    uiModule.renderThreadControls();
  }
}

/* ------------------------------
   EVENT LISTENERS
------------------------------ */
function handleHolesSliderChange() {
  updateKidControlValues();
  // Hole count changes point geometry and stitch path.
  redrawForPathChange();
}

function handleAdvancedHolesNumberChange() {
  if (!advancedHolesNumberInput) return;
  if (advancedHolesNumberInput.value === '') return;
  var holeCount = parseBoundedInt(advancedHolesNumberInput.value, 3, MAX_HOLES, DEFAULT_HOLES);
  advancedHolesNumberInput.value = String(holeCount);
  holesSlider.value = String(holeCount);
  updateKidControlValues();
  redrawForPathChange();
}

var adapterContextBundle = window.createAdapterContextBundle({
  animateBtn: animateBtn,
  toggleAnimationPlayback: toggleAnimationPlayback,
  gearBtn: gearBtn,
  advancedPanel: advancedPanel,
  syncAdvancedToggleButton: syncAdvancedToggleButton,
  closeAdvancedBtn: closeAdvancedBtn,
  advancedTempoInput: CORE_UI.advancedTempoInput,
  applyTempoValue: CORE_BEHAVIOR.applyTempoValue,
  resetTempoBtn: CORE_UI.resetTempoBtn,
  applyDefaultTempo: CORE_BEHAVIOR.applyDefaultTempo,
  kidTempoSlowBtn: kidTempoSlowBtn,
  kidTempoNormalBtn: kidTempoNormalBtn,
  kidTempoFastBtn: kidTempoFastBtn,
  getKidTempoPresetsForSong: getKidTempoPresetsForSong,
  getCurrentSongId: function() { return currentSongId; },
  exportSvgBtn: exportSvgBtn,
  openExportOptionsModal: openExportOptionsModal,
  exportConfirmBtn: exportConfirmBtn,
  runExportFromModalSelection: runExportFromModalSelection,
  exportCancelBtn: exportCancelBtn,
  closeExportOptionsModal: closeExportOptionsModal,
  exportOptionsModal: exportOptionsModal,
  kidThreadToggle: kidThreadToggle,
  kidThreadMenu: kidThreadMenu,
  kidThreadPicker: kidThreadPicker,
  kidSongToggle: kidSongToggle,
  getHasUnseenSongUnlock: function() { return !!hasUnseenSongUnlock; },
  clearUnseenSongUnlock: function() { hasUnseenSongUnlock = false; },
  kidSongMenu: kidSongMenu,
  kidSongPicker: kidSongPicker,
  syncSongPickerToggleButton: syncSongPickerToggleButton,
  threads: threads,
  setSelectedThreadIndex: function(nextIndex) { selectedThreadIndex = nextIndex; },
  renderThreadControls: renderThreadControls,
  syncKidControlsFromSelectedThread: syncKidControlsFromSelectedThread,
  setCurrentSong: setCurrentSong,
  experienceInfoPanel: experienceInfoPanel,
  experienceInfoToggle: experienceInfoToggle,
  syncExperienceInfoPanel: syncExperienceInfoPanel,
  positionExperienceInfoPanel: positionExperienceInfoPanel,
  experienceInfoClose: experienceInfoClose,
  experienceNarrateToggle: experienceNarrateToggle,
  toggleExperienceNarration: toggleExperienceNarration,
  holeNumbersToggleBtn: holeNumbersToggleBtn,
  setShowHoleNumbers: setShowHoleNumbersState,
  getShowHoleNumbers: function() { return !!showHoleNumbers; },
  syncHoleNumberToggles: syncHoleNumberToggles,
  redrawAnimationInPlace: redrawAnimationInPlace,
  musicToggleBtn: musicToggleBtn,
  setMusicMuted: setMusicMutedState,
  getMusicMuted: function() { return !!isMusicMuted; },
  syncMusicToggleButton: syncMusicToggleButton,
  updateMusicPlaybackState: CORE_BEHAVIOR.updateMusicPlaybackState,
  scheduleUrlStateSync: CORE_BEHAVIOR.scheduleUrlStateSync,
  discoveryPanel: discoveryPanel,
  syncDiscoveryToggleButton: syncDiscoveryToggleButton,
  holesSlider: holesSlider,
  handleHolesSliderChange: handleHolesSliderChange,
  advancedHolesNumberInput: advancedHolesNumberInput,
  handleAdvancedHolesNumberChange: handleAdvancedHolesNumberChange,
  advancedHoleNumbersToggle: advancedHoleNumbersToggle,
  advancedBorderEnabledInput: advancedBorderEnabledInput,
  setBorderEnabled: setBorderEnabledState,
  syncBorderControls: syncBorderControls,
  kidStitchBySelect: kidStitchBySelect,
  getKidTargetThreadIndex: getKidTargetThreadIndex,
  redrawForPathChange: redrawForPathChange,
  jumpSlider: jumpSlider,
  updateKidControlValues: updateKidControlValues,
  multiplySlider: multiplySlider,
  ensureThreadConnectConfig: ensureThreadConnectConfig,
  widthSlider: widthSlider,
  applyExperiencePaletteColorChoice: applyExperiencePaletteColorChoice,
  setCurrentShape: setCurrentShape,
  advancedShapeSelect: advancedShapeSelect,
  addThreadBtn: addThreadBtn,
  buildMagicThread: buildMagicThread,
  addMagicThreadBtn: addMagicThreadBtn,
  removeLastThreadBtn: removeLastThreadBtn,
  discoveryToggleBtn: discoveryToggleBtn,
  clearUnseenDiscoveries: function() { hasUnseenDiscoveries = false; },
  closeDiscoveryBtn: closeDiscoveryBtn,
  discoveryPassphraseForm: discoveryPassphraseForm,
  submitDiscoveryPassphraseEntry: submitDiscoveryPassphraseEntry,
  backToStitchingBtn: backToStitchingBtn,
  getElementCenterPoint: getElementCenterPoint,
  experienceInline: experienceInline,
  canvasStage: canvasStage,
  animateReturnToStitchingTrail: animateReturnToStitchingTrail,
  setCurrentExperience: EXPERIENCE_BEHAVIOR.setCurrentExperience,
  triangulaColorScopeSelect: triangulaColorScopeSelect,
  setTriangulaColorMode: function(nextValue) { triangulaColorMode = nextValue; },
  getTriangulaColorMode: function() { return triangulaColorMode; },
  getCurrentExperienceId: function() { return currentExperienceId; },
  getTriangulaConstructionMode: function() { return triangulaConstructionMode; },
  normalizeTriangulaFillColor: function(c, f) { return getTriangulaCoreModule().normalizeTriangulaFillColor(c, f); },
  getTriangulaBandColors: function() { return triangulaBandColors; },
  syncTriangulaControls: syncTriangulaControls,
  triangulaConstructionModeSelect: triangulaConstructionModeSelect,
  setTriangulaConstructionMode: function(nextValue) { triangulaConstructionMode = nextValue; },
  triangulaStartSlider: triangulaStartSlider,
  applyTriangulaCountUpdate: applyTriangulaCountUpdate,
  getTriangulaTargetCount: function() { return triangulaTargetCount; },
  settleSliderMotion: settleSliderMotion,
  triangulaStartNumberInput: triangulaStartNumberInput,
  triangulaTargetSlider: triangulaTargetSlider,
  getTriangulaStartCount: function() { return triangulaStartCount; },
  triangulaTargetNumberInput: triangulaTargetNumberInput,
  triangulaStartDiv3Btn: triangulaStartDiv3Btn,
  triangulaStartMul3Btn: triangulaStartMul3Btn,
  triangulaStartDec10Btn: triangulaStartDec10Btn,
  triangulaStartInc10Btn: triangulaStartInc10Btn,
  triangulaTargetDiv3Btn: triangulaTargetDiv3Btn,
  triangulaTargetMul3Btn: triangulaTargetMul3Btn,
  triangulaTargetDec10Btn: triangulaTargetDec10Btn,
  triangulaTargetInc10Btn: triangulaTargetInc10Btn,
  stepTriangulaCount: stepTriangulaCount,
  triangulaFitModeSelect: triangulaFitModeSelect,
  setTriangulaFitMode: function(nextValue) { triangulaFitMode = nextValue; },
  triangulaFractalModeSelect: triangulaFractalModeSelect,
  setTriangulaFractalMode: function(nextValue) { triangulaFractalMode = nextValue; }
});

var shellUiDeps = adapterContextBundle.shellUiDeps;
var stitchingEventDeps = adapterContextBundle.stitchingDeps;
var discoveryEventDeps = adapterContextBundle.discoveryDeps;
var triangulaEventDeps = adapterContextBundle.triangulaDeps;

if (typeof window.bindShellUiEvents === 'function') {
  window.bindShellUiEvents(shellUiDeps);
}

var boundExperienceAdapters = Object.create(null);
Object.keys(EXPERIENCE_LIBRARY).forEach(function(experienceId) {
  var adapter = EXPERIENCE_ADAPTERS[experienceId];
  if (!adapter || typeof adapter.bindEvents !== 'function') return;
  if (boundExperienceAdapters[experienceId]) return;

  adapter.bindEvents({
    stitchingDeps: stitchingEventDeps,
    discoveryDeps: discoveryEventDeps,
    triangulaDeps: triangulaEventDeps
  });

  boundExperienceAdapters[experienceId] = true;
});

function addThreadAndRefresh() {
  threads.push(buildMagicThread());
  selectedThreadIndex = threads.length - 1;
  renderThreadControls();
  syncKidControlsFromSelectedThread();
  redrawForPathChange();
}

if (addThreadBtn) {
  addThreadBtn.onclick = function() {
    addThreadAndRefresh();
  };
}

if (addMagicThreadBtn) {
  addMagicThreadBtn.onclick = function() {
    addThreadAndRefresh();
  };
}

if (removeLastThreadBtn) {
  removeLastThreadBtn.onclick = function() {
    if (threads.length <= 1) return;
    threads.pop();
    selectedThreadIndex = threads.length - 1;
    renderThreadControls();
    syncKidControlsFromSelectedThread();
    redrawForPathChange();
  };
}

if (window.ResizeObserver) {
  canvasResizeObserver = new ResizeObserver(() => {
    scheduleFitCanvasToStage();
  });
  canvasResizeObserver.observe(canvasStage);
  if (canvasContainer) {
    canvasResizeObserver.observe(canvasContainer);
  }
}
if (typeof window.bindCoreEnvironmentEvents === 'function') {
  window.bindCoreEnvironmentEvents({
    markSliderAsMoving: markSliderAsMoving,
    updateMusicPlaybackState: updateMusicPlaybackState,
    settleSliderMotion: settleSliderMotion,
    settleAllSliderMotion: settleAllSliderMotion,
    scheduleFitCanvasToStage: scheduleFitCanvasToStage,
    renderExperienceTitleStatic: renderExperienceTitleStatic,
    refreshExperienceInfoPanelPlacement: refreshExperienceInfoPanelPlacement,
    hasUrlStateParams: hasUrlStateParams,
    applyDefaultHoles: applyDefaultHoles,
    applyDefaultSkipAndSize: applyDefaultSkipAndSize,
    applyDefaultTempo: applyDefaultTempo,
    setAnimationPlaybackState: function(nextState) {
      animationPlaybackState = nextState;
    },
    syncAnimateButtonLabel: syncAnimateButtonLabel,
    renderThreadControls: renderThreadControls,
    syncKidControlsFromSelectedThread: syncKidControlsFromSelectedThread,
    redrawForPathChange: redrawForPathChange,
    applyExperienceOverlayPosition: applyExperienceOverlayPosition,
    experienceOverlayPositionClass: EXPERIENCE_OVERLAY_POSITION_CLASS,
    applyStateFromCurrentUrl: applyStateFromCurrentUrl
  });
}

/* ------------------------------
   INITIALIZE
------------------------------ */
renderThreadControls();
syncExperienceInfoPanel(false);
applyExperienceOverlayPosition(EXPERIENCE_OVERLAY_POSITION_CLASS);
if (hasUrlStateParams()) {
  var initialParams = new URLSearchParams(window.location.search || '');
  var initialExperience = resolveExperienceId(getUrlStateParam(initialParams, 'experience')) || 'stitching';
  EXPERIENCE_BEHAVIOR.setCurrentExperience(initialExperience, { suppressUrlSync: true, capturePrevious: false });
  setCurrentShape(sanitizeShape(getUrlStateParam(initialParams, 'shape'), currentShape), false);
} else {
  EXPERIENCE_BEHAVIOR.setCurrentExperience('stitching', { capturePrevious: false });
  setCurrentShape('circle', false);
}
advancedPanel.classList.remove('open');
discoveryPanel.classList.remove('open');
CORE_BEHAVIOR.renderAdvancedTempoOptions();
if (!hasUrlStateParams()) {
  applyDefaultHoles();
  applyDefaultSkipAndSize();
  CORE_BEHAVIOR.applyDefaultTempo();
}
syncAnimateButtonLabel();
syncHoleNumberToggles();
syncBorderControls();
syncMusicToggleButton();
syncKidControlsFromSelectedThread();
renderDiscoveryLibrary();
syncAdvancedToggleButton();
syncDiscoveryToggleButton();
fitCanvasToStage();
if (hasUrlStateParams()) {
  CORE_BEHAVIOR.applyStateFromCurrentUrl({ forceUrlSync: false });
} else {
  CORE_BEHAVIOR.redrawForPathChange();
}
STITCHER_BEHAVIOR.scheduleDiscoveryEvaluation();
CORE_BEHAVIOR.scheduleUrlStateSync(true);
window.setCurrentExperience = EXPERIENCE_BEHAVIOR.setCurrentExperience;

