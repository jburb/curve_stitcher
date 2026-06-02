var EXPERIENCE_LIBRARY = window.EXPERIENCE_LIBRARY || Object.freeze({});
var EXPERIENCE_ADAPTERS = window.EXPERIENCE_ADAPTERS || Object.freeze({});
var DISCOVERY_LIBRARY = window.DISCOVERY_LIBRARY || Object.freeze({});
var DISCOVERY_FEATURE_FLAGS = window.DISCOVERY_FEATURE_FLAGS || Object.freeze({ rosetteDiscovery: false });
var normalizeTriangulaDrawableCount = window.normalizeTriangulaDrawableCount;
var sanitizeTriangulaCount = window.sanitizeTriangulaCount;
var sanitizeTriangulaColorMode = window.sanitizeTriangulaColorMode;
var sanitizeTriangulaConstructionMode = window.sanitizeTriangulaConstructionMode;
var sanitizeTriangulaFractalMode = window.sanitizeTriangulaFractalMode;
var sanitizeTriangulaFitMode = window.sanitizeTriangulaFitMode;
var stepTriangulaCount = window.stepTriangulaCount;

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
      return controls[CONTROL_KEYS.BASIC.triangulaColorScope] === true && currentExperienceId === 'triangula' && triangulaConstructionMode === 'shrink-duplicate';
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

var borderEnabled = true;

var currentExperienceId = 'stitching';
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

var APP_STATE_URL_VERSION = '1';
var URL_SYNC_DEBOUNCE_MS = 800;
var urlSyncTimer = null;
var urlSyncSuspended = false;
var appState = {
  version: APP_STATE_URL_VERSION,
  experienceId: 'stitching',
  common: {
    shape: 'circle',
    bpm: DEFAULT_ANIMATION_BPM,
    musicMuted: false,
    songId: 'bach',
    showHoleNumbers: true,
    borderEnabled: true
  },
  stitching: {
    holes: DEFAULT_HOLES,
    selectedThreadIndex: 0,
    threadColors: ['#1982c4'],
    threadState: ''
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

function withUrlSyncSuspended(work) {
  var wasSuspended = urlSyncSuspended;
  urlSyncSuspended = true;
  try {
    work();
  } finally {
    urlSyncSuspended = wasSuspended;
  }
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

function sanitizeThreadColor(value, fallback) {
  return sanitizeHexColor(value, fallback);
}

function sanitizeThreadColorList(value, fallbackList) {
  if (typeof value !== 'string' || !value.trim()) return fallbackList.slice();
  var raw = value.split(',');
  var sanitized = [];
  for (var i = 0; i < raw.length; i++) {
    var color = sanitizeThreadColor(raw[i], null);
    if (color) sanitized.push(color);
  }
  if (!sanitized.length) return fallbackList.slice();
  return sanitized;
}

function sanitizeThreadJumpMode(value, fallback) {
  var allowed = ['fixed', 'connect', 'sequence', 'formula'];
  if (allowed.indexOf(value) === -1) return fallback;
  return value;
}

function sanitizeThreadDescriptor(raw, fallback) {
  fallback = fallback || {
    jump: DEFAULT_SKIP,
    width: DEFAULT_THREAD_SIZE,
    color: '#1982c4',
    jumpMode: 'fixed',
    jumpFormula: 'skip',
    jumpSequence: '',
    connectMultiplier: 2,
    connectOffset: 0
  };

  raw = raw || {};
  var jumpMode = sanitizeThreadJumpMode(raw.m || raw.jumpMode, fallback.jumpMode || 'fixed');
  var thread = {
    jump: parseBoundedInt(raw.j != null ? raw.j : raw.jump, 1, 100, fallback.jump || DEFAULT_SKIP),
    width: parseBoundedInt(raw.w != null ? raw.w : raw.width, 1, 10, fallback.width || DEFAULT_THREAD_SIZE),
    color: sanitizeThreadColor(raw.c != null ? raw.c : raw.color, fallback.color || '#1982c4'),
    sequence: null,
    jumpMode: jumpMode,
    jumpFormula: String(raw.f != null ? raw.f : (raw.jumpFormula != null ? raw.jumpFormula : (fallback.jumpFormula || 'skip'))),
    jumpSequence: String(raw.s != null ? raw.s : (raw.jumpSequence != null ? raw.jumpSequence : (fallback.jumpSequence || ''))),
    connectMultiplier: parseBoundedInt(raw.cm != null ? raw.cm : raw.connectMultiplier, 1, 12, fallback.connectMultiplier || 2),
    connectOffset: parseBoundedInt(raw.co != null ? raw.co : raw.connectOffset, 0, MAX_HOLES, fallback.connectOffset || 0)
  };

  if (thread.jumpMode !== 'formula') {
    thread.jumpFormula = fallback.jumpFormula || 'skip';
  }
  if (thread.jumpMode !== 'sequence') {
    thread.jumpSequence = '';
  }

  return thread;
}

function serializeStitchingThreadState(threadList) {
  var compact = (threadList || []).map(function(thread) {
    return {
      j: parseBoundedInt(thread.jump, 1, 100, DEFAULT_SKIP),
      w: parseBoundedInt(thread.width, 1, 10, DEFAULT_THREAD_SIZE),
      c: sanitizeThreadColor(thread.color, '#1982c4'),
      m: sanitizeThreadJumpMode(thread.jumpMode, 'fixed'),
      f: String(thread.jumpFormula || 'skip'),
      s: String(thread.jumpSequence || ''),
      cm: parseBoundedInt(thread.connectMultiplier, 1, 12, 2),
      co: parseBoundedInt(thread.connectOffset, 0, MAX_HOLES, 0)
    };
  });

  if (!compact.length) {
    compact.push({
      j: DEFAULT_SKIP,
      w: DEFAULT_THREAD_SIZE,
      c: '#1982c4',
      m: 'fixed',
      f: 'skip',
      s: '',
      cm: 2,
      co: 0
    });
  }

  return encodeURIComponent(JSON.stringify(compact));
}

function parseStitchingThreadState(value, fallbackList) {
  fallbackList = fallbackList || [];
  if (typeof value !== 'string' || !value.trim()) {
    return fallbackList.slice();
  }

  try {
    var decoded = decodeURIComponent(value);
    var parsed = JSON.parse(decoded);
    if (!Array.isArray(parsed)) {
      return fallbackList.slice();
    }
    var sanitized = parsed.map(function(entry, index) {
      var fallback = fallbackList[index] || fallbackList[0];
      return sanitizeThreadDescriptor(entry, fallback);
    }).filter(function(thread) {
      return !!thread;
    });
    if (!sanitized.length) {
      return fallbackList.slice();
    }
    return sanitized;
  } catch (error) {
    return fallbackList.slice();
  }
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
  dispatchRuntimeState({
    type: 'SET_SHOW_HOLE_NUMBERS',
    payload: { showHoleNumbers: showHoleNumbers }
  });
}

function setBorderEnabledState(nextValue) {
  borderEnabled = !!nextValue;
  dispatchRuntimeState({
    type: 'SET_BORDER_ENABLED',
    payload: { borderEnabled: borderEnabled }
  });
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
  appState.common.showHoleNumbers = typeof runtimeSnapshot.showHoleNumbers === 'boolean' ? runtimeSnapshot.showHoleNumbers : !!showHoleNumbers;
  appState.common.borderEnabled = typeof runtimeSnapshot.borderEnabled === 'boolean' ? runtimeSnapshot.borderEnabled : !!borderEnabled;

  appState.stitching.holes = parseBoundedInt(holesSlider.value, 3, MAX_HOLES, DEFAULT_HOLES);
  appState.stitching.selectedThreadIndex = Math.max(0, Math.min(threads.length - 1, selectedThreadIndex));
  appState.stitching.threadColors = threads.map(function(thread) {
    return sanitizeThreadColor(thread.color, '#1982c4');
  });
  appState.stitching.threadState = serializeStitchingThreadState(threads);

  appState.triangula.colorMode = triangulaColorMode;
  appState.triangula.constructionMode = triangulaConstructionMode;
  appState.triangula.startCount = triangulaStartCount;
  appState.triangula.targetCount = triangulaTargetCount;
  appState.triangula.fractalMode = triangulaFractalMode;
  appState.triangula.fitMode = triangulaFitMode;
  appState.triangula.sourceColor = sanitizeThreadColor(
    threads[0] ? threads[0].color : null,
    appState.triangula.sourceColor || '#1982c4'
  );
  appState.triangula.band1Color = triangulaBandColors.band1;
  appState.triangula.band2Color = triangulaBandColors.band2;
  appState.triangula.band4Color = triangulaBandColors.band4;
}

function buildSearchParamsFromAppState() {
  syncAppStateFromRuntime();
  var params = new URLSearchParams();
  params.set('v', APP_STATE_URL_VERSION);
  params.set('e', appState.experienceId);
  params.set('sh', appState.common.shape);
  params.set('tb', String(appState.common.bpm));
  params.set('mm', appState.common.musicMuted ? '1' : '0');
  params.set('sg', appState.common.songId);
  params.set('hn', appState.common.showHoleNumbers ? '1' : '0');
  params.set('be', appState.common.borderEnabled ? '1' : '0');
  params.set('sn', String(appState.stitching.holes));
  params.set('ssi', String(appState.stitching.selectedThreadIndex));
  params.set('st', appState.stitching.threadState);

  if (appState.stitching.threadColors && appState.stitching.threadColors.length) {
    params.set('sc', appState.stitching.threadColors.join(','));
  }

  if (appState.experienceId === 'triangula') {
    params.set('tc0', appState.triangula.sourceColor);
    params.set('tcm', appState.triangula.colorMode);
    params.set('tm', appState.triangula.constructionMode);
    params.set('ts', String(appState.triangula.startCount));
    params.set('tt', String(appState.triangula.targetCount));
    params.set('tf', appState.triangula.fractalMode);
    params.set('tfit', appState.triangula.fitMode);
    params.set('tc1', appState.triangula.band1Color);
    params.set('tc2', appState.triangula.band2Color);
    params.set('tc4', appState.triangula.band4Color);
  }

  return params;
}

function flushUrlStateSync() {
  if (urlSyncSuspended) return;
  var params = buildSearchParamsFromAppState();
  var nextSearch = params.toString();
  var nextUrl = nextSearch ? (window.location.pathname + '?' + nextSearch) : window.location.pathname;
  var currentUrl = window.location.pathname + window.location.search;
  if (nextUrl === currentUrl) return;
  history.replaceState({ appStateVersion: APP_STATE_URL_VERSION }, '', nextUrl);
}

function scheduleUrlStateSync(immediate) {
  if (urlSyncSuspended) return;
  if (urlSyncTimer) {
    clearTimeout(urlSyncTimer);
    urlSyncTimer = null;
  }
  if (immediate) {
    flushUrlStateSync();
    return;
  }
  urlSyncTimer = window.setTimeout(function() {
    urlSyncTimer = null;
    flushUrlStateSync();
  }, URL_SYNC_DEBOUNCE_MS);
}

function applyStateFromCurrentUrl(options) {
  options = options || {};
  var params = new URLSearchParams(window.location.search || '');
  var requestedExperience = resolveExperienceId(params.get('e'));

  if (!requestedExperience) {
    requestedExperience = currentExperienceId;
  }

  try {
    withUrlSyncSuspended(function() {
    if (resolveExperienceId(params.get('e'))) {
      setCurrentExperience(requestedExperience, { suppressUrlSync: true });
    }

    var profile = getExperienceUiProfile(currentExperienceId);
    var shapeFromUrl = sanitizeShape(params.get('sh'), currentShape);
    if (profile && profile.fixedShape) {
      shapeFromUrl = profile.fixedShape;
    }

    setCurrentShape(shapeFromUrl, false);

    var songIdFromUrl = sanitizeSongId(params.get('sg'), currentSongId);
    if (canApplySongSelection(songIdFromUrl)) {
      setCurrentSong(songIdFromUrl);
    }

    var bpmFromUrl = sanitizeBpmForCurrentSong(params.get('tb'), currentAnimationBpm);
    applyTempoValue(bpmFromUrl);

    var mutedFromUrl = sanitizeBooleanParam(params.get('mm'), isMusicMuted);
    setMusicMutedState(mutedFromUrl);
    syncMusicToggleButton();

    var showHoleNumbersFromUrl = sanitizeBooleanParam(params.get('hn'), showHoleNumbers);
    var borderEnabledFromUrl = sanitizeBooleanParam(params.get('be'), borderEnabled);
    setShowHoleNumbersState(showHoleNumbersFromUrl);
    setBorderEnabledState(borderEnabledFromUrl);
    syncHoleNumberToggles();
    syncBorderControls();

    dispatchRuntimeState({
      type: 'HYDRATE_URL_META',
      payload: {
        experienceId: requestedExperience,
        shape: shapeFromUrl,
        bpm: bpmFromUrl,
        songId: songIdFromUrl,
        musicMuted: mutedFromUrl,
        showHoleNumbers: showHoleNumbersFromUrl,
        borderEnabled: borderEnabledFromUrl
      }
    });

    var fallbackThreads = threads.map(function(thread) {
      return sanitizeThreadDescriptor(thread, thread);
    });
    var requestedThreadState = parseStitchingThreadState(params.get('st'), fallbackThreads);

    if (requestedThreadState.length) {
      var hydratedThreads = requestedThreadState.map(function(thread) {
        return sanitizeThreadDescriptor(thread, thread);
      });
      threads.splice(0, threads.length);
      Array.prototype.push.apply(threads, hydratedThreads);
    }

    // Backward compatibility for older URLs that only carried color list.
    var fallbackColors = threads.map(function(thread) {
      return sanitizeThreadColor(thread.color, '#1982c4');
    });
    var requestedThreadColors = sanitizeThreadColorList(params.get('sc'), fallbackColors);
    for (var i = 0; i < threads.length && i < requestedThreadColors.length; i++) {
      threads[i].color = requestedThreadColors[i];
    }

    if (!threads.length) {
      threads.push(sanitizeThreadDescriptor({}, null));
    }

    var holesFromUrl = parseBoundedInt(params.get('sn'), 3, MAX_HOLES, parseBoundedInt(holesSlider.value, 3, MAX_HOLES, DEFAULT_HOLES));
    holesSlider.value = String(holesFromUrl);
    if (advancedHolesNumberInput) {
      advancedHolesNumberInput.value = String(holesFromUrl);
    }

    selectedThreadIndex = parseBoundedInt(params.get('ssi'), 0, threads.length - 1, selectedThreadIndex);

    renderThreadControls();
    syncKidControlsFromSelectedThread();

    if (requestedExperience === 'triangula') {
      var sourceColor = sanitizeThreadColor(params.get('tc0'), threads[0] ? threads[0].color : '#1982c4');
      if (threads[0]) {
        threads[0].color = sourceColor;
      }
      triangulaColorMode = sanitizeTriangulaColorMode(params.get('tcm'), triangulaColorMode);
      triangulaConstructionMode = sanitizeTriangulaConstructionMode(params.get('tm'), triangulaConstructionMode);
      triangulaStartCount = sanitizeTriangulaCount(params.get('ts'), triangulaStartCount, 'start');
      triangulaTargetCount = sanitizeTriangulaCount(params.get('tt'), triangulaTargetCount, 'target');
      if (triangulaTargetCount < triangulaStartCount) {
        triangulaTargetCount = triangulaStartCount;
      }
      triangulaFractalMode = sanitizeTriangulaFractalMode(params.get('tf'), triangulaFractalMode);
      triangulaFitMode = sanitizeTriangulaFitMode(params.get('tfit'), triangulaFitMode);

      var sharedTriangulaColor = sanitizeHexColor(
        params.get('tc1') || params.get('tc2') || params.get('tc4') || sourceColor,
        triangulaBandColors.band1
      );
      triangulaBandColors.band1 = sharedTriangulaColor;
      triangulaBandColors.band2 = sharedTriangulaColor;
      triangulaBandColors.band4 = sharedTriangulaColor;
      if (threads[0]) {
        threads[0].color = sharedTriangulaColor;
      }

      syncTriangulaControls();
    }

    redrawForPathChange();

    // Always start from unstarted playback state on load/popstate.
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();

    updateMusicPlaybackState();
    });
  } catch (error) {
    console.error('URL state hydration failed:', error);
  }

  if (options.forceUrlSync !== false) {
    scheduleUrlStateSync(true);
  }
}

function hasUrlStateParams() {
  var params = new URLSearchParams(window.location.search || '');
  if (!params || !params.toString()) return false;
  if (params.has('v') || params.has('e')) return true;
  // Backward/partial URLs should still be treated as explicit state.
  return params.toString().length > 0;
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

  if (!threadsEnabled || !allowMultipleThreads) {
    if (threads.length > 1) {
      threads.splice(1);
    }
    if (selectedThreadIndex < 0 || selectedThreadIndex >= threads.length) {
      selectedThreadIndex = threads.length ? 0 : -1;
    }
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
  triangulaColorMode = (profile && profile.triangulaColorModes && profile.triangulaColorModes.length) ? profile.triangulaColorModes[0] : 'all';
  if (EXPERIENCE_UI.triangulaColorScopeSelect) {
    EXPERIENCE_UI.triangulaColorScopeSelect.value = triangulaColorMode;
  }
  if (EXPERIENCE_UI.triangulaConstructionModeSelect) {
    EXPERIENCE_UI.triangulaConstructionModeSelect.value = triangulaConstructionMode;
  }
  syncTriangulaControls();
}

function syncTriangulaControls() {
  triangulaStartCount = normalizeTriangulaDrawableCount(triangulaStartCount, 'start', 1);
  triangulaTargetCount = normalizeTriangulaDrawableCount(triangulaTargetCount, 'target', triangulaStartCount);

  if (triangulaTargetCount < triangulaStartCount) {
    triangulaTargetCount = triangulaStartCount;
  }

  if (triangulaStartSlider) {
    triangulaStartSlider.value = String(triangulaStartCount);
  }
  if (triangulaTargetSlider) {
    triangulaTargetSlider.value = String(triangulaTargetCount);
  }
  if (triangulaStartValue) {
    triangulaStartValue.textContent = String(triangulaStartCount);
  }
  if (triangulaTargetValue) {
    triangulaTargetValue.textContent = String(triangulaTargetCount);
  }
  if (triangulaStartNumberInput) {
    triangulaStartNumberInput.value = String(triangulaStartCount);
  }
  if (triangulaTargetNumberInput) {
    triangulaTargetNumberInput.value = String(triangulaTargetCount);
  }
  if (triangulaColorScopeSelect) {
    triangulaColorScopeSelect.value = triangulaColorMode;
  }
  if (triangulaConstructionModeSelect) {
    triangulaConstructionModeSelect.value = triangulaConstructionMode;
  }
  if (triangulaFractalModeSelect) {
    triangulaFractalModeSelect.value = triangulaFractalMode;
  }
  if (triangulaFitModeSelect) {
    triangulaFitModeSelect.value = triangulaFitMode;
  }
  var profile = getExperienceUiProfile(currentExperienceId);
  var controls = profile && profile.basicControls ? profile.basicControls : null;
  setElementDisplay(
    triangulaColorScopeBlock,
    !!(controls && controls.triangulaColorScope === true && currentExperienceId === 'triangula' && triangulaConstructionMode === 'shrink-duplicate'),
    ''
  );
}

function applyTriangulaCountUpdate(nextStart, nextTarget, shouldRedraw) {
  triangulaStartCount = normalizeTriangulaDrawableCount(nextStart, 'start', triangulaStartCount || 1);
  triangulaTargetCount = normalizeTriangulaDrawableCount(nextTarget, 'target', triangulaTargetCount || triangulaStartCount || 1);
  if (triangulaTargetCount < triangulaStartCount) {
    triangulaTargetCount = triangulaStartCount;
  }
  syncTriangulaControls();
  if (shouldRedraw) {
    redrawForPathChange();
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
  // keep options arg for API compatibility
  currentExperienceId = experience.id;
  dispatchRuntimeState({
    type: 'SET_EXPERIENCE',
    payload: { experienceId: currentExperienceId }
  });

  if (!options.preserveSongOnExperienceChange) {
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

  if (currentExperienceId === 'triangula') {
    if (triangulaColorMode === 'band-1') return triangulaBandColors.band1 || fallbackColor;
    if (triangulaColorMode === 'band-2') return triangulaBandColors.band2 || fallbackColor;
    if (triangulaColorMode === 'band-4') return triangulaBandColors.band4 || fallbackColor;
    return normalizeTriangulaFillColor(threads[0] ? threads[0].color : null, triangulaBandColors.band1 || fallbackColor);
  }

  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex >= 0 && threads[targetIndex]) {
    var chosen = threads[targetIndex].color;
    if (chosen && chosen !== 'rainbow') return chosen;
  }

  return fallbackColor;
}

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

function getSongShapeProfile(shapeKey) {
  if (shapeKey === 'triangle') {
    return {
      innerFactor: 0.09,
      outerFactor: 0.44,
      startOffset: '0%',
      charWidthFactor: 0.62
    };
  }
  if (shapeKey === 'square') {
    return {
      innerFactor: 0.09,
      outerFactor: 0.44,
      startOffset: '0%',
      charWidthFactor: 0.62
    };
  }
  if (shapeKey === 'rosette') {
    return {
      innerFactor: 0.08,
      outerFactor: 0.43,
      startOffset: '0%',
      charWidthFactor: 0.62
    };
  }
  return {
    innerFactor: 0.09,
    outerFactor: 0.43,
    startOffset: '0%',
    charWidthFactor: 0.62
  };
}

function getShapeRadiusFactor(shapeKey, angle) {
  if (shapeKey === 'triangle') {
    return getPolygonRadiusFactor(angle - (Math.PI / 2), 3);
  }
  if (shapeKey === 'square') {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    return 1 / Math.max(Math.abs(c), Math.abs(s));
  }
  if (shapeKey === 'rosette') {
    return 0.86 + (0.14 * Math.cos(angle * 6));
  }
  return 1;
}

function estimateMonospaceTextLength(label, fontSize, charWidthFactor, letterSpacingEm) {
  var text = String(label || '');
  if (!text) return 0;
  var spacing = isFinite(letterSpacingEm) ? (fontSize * letterSpacingEm) : 0;
  return text.length * (fontSize * charWidthFactor + spacing);
}

function getMinimumWrapPitch(fontSize) {
  // Keep wrap spacing above glyph-height footprint to avoid cross-wrap overlap.
  return Math.max(2.1, fontSize * 1.25);
}

function polylineLength(pointsList) {
  if (!pointsList || pointsList.length < 2) return 0;
  var total = 0;
  for (var i = 1; i < pointsList.length; i++) {
    var dx = pointsList[i].x - pointsList[i - 1].x;
    var dy = pointsList[i].y - pointsList[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

function getPolygonVertex(cx, cy, radius, angleOffset, sides, sideIndex) {
  var angle = angleOffset + ((2 * Math.PI * sideIndex) / sides);
  return {
    x: Math.round((cx + Math.cos(angle) * radius) * 1000) / 1000,
    y: Math.round((cy + Math.sin(angle) * radius) * 1000) / 1000
  };
}

function buildPolygonSpiralPoints(cx, cy, outer, inner, sides, angleOffset, wraps) {
  var pointsList = [];
  wraps = Math.max(1, wraps);

  for (var wrap = 0; wrap <= wraps; wrap++) {
    var t = wrap / wraps;
    var radius = outer - ((outer - inner) * t);
    // Alternate direction per ring so transitions between rings are inward/radial,
    // avoiding diagonal jumps that can create acute corner artifacts.
    if (wrap % 2 === 0) {
      for (var side = 0; side < sides; side++) {
        pointsList.push(getPolygonVertex(cx, cy, radius, angleOffset, sides, side));
      }
    } else {
      for (var reverseSide = sides - 1; reverseSide >= 0; reverseSide--) {
        pointsList.push(getPolygonVertex(cx, cy, radius, angleOffset, sides, reverseSide));
      }
    }
  }

  return pointsList;
}

function buildPolygonSpiralPath(shapeKey, width, height, targetLength, fontSize) {
  var cx = width * 0.5;
  var cy = height * 0.5;
  var minDimension = Math.min(width, height);
  var profile = getSongShapeProfile(shapeKey);
  var outer = minDimension * profile.outerFactor;
  var inner = minDimension * profile.innerFactor;
  var sides = shapeKey === 'triangle' ? 3 : 4;
  var angleOffset = shapeKey === 'triangle' ? -Math.PI / 2 : -Math.PI / 4;
  var radialSpan = Math.max(0.001, outer - inner);
  var minPitch = getMinimumWrapPitch(fontSize);
  var maxWraps = Math.max(2, Math.floor(radialSpan / minPitch));
  var minWraps = Math.min(3, maxWraps);

  var bestPoints = buildPolygonSpiralPoints(cx, cy, outer, inner, sides, angleOffset, minWraps);
  var fit = false;
  for (var wraps = minWraps; wraps <= maxWraps; wraps++) {
    var candidate = buildPolygonSpiralPoints(cx, cy, outer, inner, sides, angleOffset, wraps);
    var len = polylineLength(candidate);
    bestPoints = candidate;
    if (len >= targetLength) {
      fit = true;
      break;
    }
  }

  return {
    path: pointsToSvgPath(bestPoints),
    length: polylineLength(bestPoints),
    startOffset: profile.startOffset,
    fit: fit
  };
}

function buildCurvedSpiralPath(shapeKey, width, height, targetLength, fontSize) {
  var profile = getSongShapeProfile(shapeKey);
  var cx = width * 0.5;
  var cy = height * 0.5;
  var minDimension = Math.min(width, height);
  var inner = minDimension * profile.innerFactor;
  var outer = minDimension * profile.outerFactor;
  var radialSpan = Math.max(0.001, outer - inner);
  var minPitch = getMinimumWrapPitch(fontSize);
  var maxTurnsByPitch = Math.max(1.7, radialSpan / minPitch);

  var bestPoints = [];
  var bestLength = 0;
  var bestTurns = Math.min(2.2, maxTurnsByPitch);
  var samples = 260;
  var fit = false;

  for (var turns = 1.8; turns <= maxTurnsByPitch; turns += 0.12) {
    var pointsList = [];
    for (var i = 0; i <= samples; i++) {
      var u = i / samples;
      var angle = (-Math.PI / 2) + (u * turns * Math.PI * 2);
      var spiralRadius = outer - ((outer - inner) * u);
      var baseShape = getShapeRadiusFactor(shapeKey, angle);
      var shapeBlend = mix(1, baseShape, Math.pow(1 - u, 0.97));
      pointsList.push({
        x: Math.round((cx + Math.cos(angle) * spiralRadius * shapeBlend) * 1000) / 1000,
        y: Math.round((cy + Math.sin(angle) * spiralRadius * shapeBlend) * 1000) / 1000
      });
    }

    var candidateLength = polylineLength(pointsList);
    bestPoints = pointsList;
    bestLength = candidateLength;
    bestTurns = turns;
    if (candidateLength >= targetLength) {
      fit = true;
      break;
    }
  }

  return {
    path: pointsToSvgPath(bestPoints),
    length: bestLength,
    startOffset: profile.startOffset,
    turns: bestTurns,
    fit: fit
  };
}

function pointsToSvgPath(pointsList) {
  if (!pointsList || !pointsList.length) return '';
  var path = 'M ' + pointsList[0].x + ' ' + pointsList[0].y;
  for (var i = 1; i < pointsList.length; i++) {
    path += ' L ' + pointsList[i].x + ' ' + pointsList[i].y;
  }
  return path;
}

function buildSongSpiralPath(shapeKey, width, height) {
  var label = arguments.length > 3 ? arguments[3] : '';
  var profile = getSongShapeProfile(shapeKey);
  var best = null;
  var letterSpacingSteps = [0.03, 0.02, 0.01, 0, -0.01];

  for (var s = 0; s < letterSpacingSteps.length; s++) {
    var letterSpacingEm = letterSpacingSteps[s];

    for (var fontSize = 10.6; fontSize >= 7.2; fontSize -= 0.4) {
      var targetLength = Math.max(
        78,
        estimateMonospaceTextLength(label, fontSize, profile.charWidthFactor, letterSpacingEm) * 1.06
      );

      var result;
      if (shapeKey === 'triangle' || shapeKey === 'square') {
        result = buildPolygonSpiralPath(shapeKey, width, height, targetLength, fontSize);
      } else {
        result = buildCurvedSpiralPath(shapeKey, width, height, targetLength, fontSize);
      }

      result.fontSize = Math.round(fontSize * 10) / 10;
      result.letterSpacingEm = letterSpacingEm;
      best = result;
      if (result.fit) {
        return result;
      }
    }
  }

  return best || {
    path: '',
    length: 0,
    startOffset: profile.startOffset,
    fontSize: 7.2,
    letterSpacingEm: 0,
    fit: false
  };
}

function repeatSongLabel(label) {
  var clean = String(label || '').trim();
  if (!clean) return '';
  return clean.toUpperCase();
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
  holesValue.textContent = holesSlider.value;
  jumpValue.textContent = jumpSlider.value;
  multiplyValue.textContent = multiplySlider.value;
  widthValue.textContent = widthSlider.value;
  if (advancedHolesNumberInput) {
    advancedHolesNumberInput.value = holesSlider.value;
  }
}

function syncBorderControls() {
  advancedBorderEnabledInput.checked = borderEnabled;
}

function createThread(config) {
  return {
    jump: config.jump,
    width: config.width,
    color: config.color,
    sequence: null,
    jumpMode: 'fixed',
    jumpFormula: 'skip',
    jumpSequence: '',
    connectMultiplier: 2,
    connectOffset: 0
  };
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

function getKidStitchByForThread(thread) {
  if (!thread || thread.jumpMode !== 'connect') {
    return 'add';
  }
  return 'multiply';
}

function syncKidStitchByControl() {
  var index = getKidTargetThreadIndex();
  if (index < 0 || !threads[index]) {
    kidStitchBySelect.value = 'add';
    return;
  }
  kidStitchBySelect.value = getKidStitchByForThread(threads[index]);
}

function syncBasicMathSliderVisibility() {
  if (currentExperienceId !== 'stitching') {
    addSliderBlock.style.display = 'none';
    multiplySliderBlock.style.display = 'none';
    jumpSlider.disabled = true;
    multiplySlider.disabled = true;
    return;
  }

  var index = getKidTargetThreadIndex();
  var isMultiplyMode = false;

  if (index >= 0 && threads[index]) {
    isMultiplyMode = threads[index].jumpMode === 'connect';
  }

  addSliderBlock.style.display = isMultiplyMode ? 'none' : '';
  multiplySliderBlock.style.display = isMultiplyMode ? '' : 'none';

  jumpSlider.disabled = isMultiplyMode;
  multiplySlider.disabled = !isMultiplyMode;
}

function buildMagicThread() {
  var baseIndex = threads.length ? Math.max(0, selectedThreadIndex) : 0;
  var base = threads[baseIndex] || createThread({ jump: 22, width: 2, color: '#1982c4' });
  var jumpShift = (Math.floor(Math.random() * 7) + 2);
  var nextJump = base.jump + jumpShift;
  if (nextJump > 100) nextJump = ((nextJump - 1) % 100) + 1;

  var colorPick = magicThreadColors[Math.floor(Math.random() * magicThreadColors.length)];
  if (threads.length && threads[threads.length - 1].color === colorPick) {
    colorPick = magicThreadColors[(magicThreadColors.indexOf(colorPick) + 1) % magicThreadColors.length];
  }

  return createThread({
    jump: nextJump,
    width: DEFAULT_THREAD_SIZE,
    color: colorPick
  });
}

function applyThreadSwatchStyle(element, color) {
  if (!element) return;
  if (color === 'rainbow') {
    element.style.background = 'linear-gradient(45deg, red, orange, yellow, green, blue, purple)';
  } else {
    element.style.background = color || '#1982c4';
  }
}

function applyExperiencePaletteColorChoice(colorValue) {
  if (!threads.length) return;

  var profile = getExperienceUiProfile(currentExperienceId);
  var paletteMode = profile && profile.paletteMode ? profile.paletteMode : 'thread';
  var color = colorValue || '#1982c4';

  if (paletteMode === 'global') {
    threads.forEach(function(thread) {
      thread.color = color;
    });
    return;
  }

  if (paletteMode === 'triangula-banded') {
    var safeColor = normalizeTriangulaFillColor(color, triangulaBandColors.band1);
    // Keep all triangula bands aligned to the most recently picked color.
    threads[0].color = safeColor;
    triangulaBandColors.band1 = safeColor;
    triangulaBandColors.band2 = safeColor;
    triangulaBandColors.band4 = safeColor;
    return;
  }

  var targetIndex = selectedThreadIndex;
  if (targetIndex < 0 || targetIndex >= threads.length) {
    targetIndex = 0;
  }
  threads[targetIndex].color = color;
}

function syncHoleNumberToggles() {
  advancedHoleNumbersToggle.checked = showHoleNumbers;
  holeNumbersToggleBtn.classList.toggle('active', showHoleNumbers);
  holeNumbersToggleBtn.setAttribute('aria-pressed', showHoleNumbers ? 'true' : 'false');
  holeNumbersToggleBtn.title = showHoleNumbers ? 'Hole numbers on' : 'Hole numbers off';
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
  kidThreadPicker.style.display = threads.length > 1 ? 'inline-flex' : 'none';
  removeLastThreadBtn.style.display = threads.length > 1 ? '' : 'none';
  kidThreadMenu.innerHTML = '';
  removeLastThreadBtn.disabled = threads.length <= 1;

  if (!threads.length) {
    kidThreadToggle.disabled = true;
    kidThreadActiveLabel.textContent = 'No threads';
    applyThreadSwatchStyle(kidThreadActiveSwatch, '#cccccc');
    return;
  }

  kidThreadToggle.disabled = false;

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var option = document.createElement('button');
    option.type = 'button';
    option.className = 'kid-thread-option' + (i === selectedThreadIndex ? ' active' : '');
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', i === selectedThreadIndex ? 'true' : 'false');
    option.dataset.index = String(i);

    var swatch = document.createElement('span');
    swatch.className = 'thread-swatch';
    applyThreadSwatchStyle(swatch, thread.color);

    var label = document.createElement('span');
    label.textContent = 'Thread ' + (i + 1);

    option.appendChild(swatch);
    option.appendChild(label);
    kidThreadMenu.appendChild(option);
  }

  var selectedIndex = getKidTargetThreadIndex();
  var selectedThread = threads[selectedIndex];
  if (selectedThread) {
    kidThreadActiveLabel.textContent = 'Thread ' + (selectedIndex + 1);
    applyThreadSwatchStyle(kidThreadActiveSwatch, selectedThread.color);
  }
}

function getKidTargetThreadIndex() {
  if (!threads.length) return -1;
  if (selectedThreadIndex >= 0 && selectedThreadIndex < threads.length) {
    return selectedThreadIndex;
  }
  return 0;
}

function syncKidControlsFromSelectedThread() {
  var index = getKidTargetThreadIndex();
  refreshKidThreadPicker();
  if (index < 0) return;
  ensureThreadConnectConfig(threads[index]);
  jumpSlider.value = threads[index].jump;
  multiplySlider.value = threads[index].connectMultiplier;
  widthSlider.value = threads[index].width;
  syncKidStitchByControl();
  syncBasicMathSliderVisibility();
  updateKidControlValues();
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

function renderAnimationFrame() {
  if (!animationState) {
    drawStatic();
    return;
  }

  project.activeLayer.removeChildren();
  computePoints();
  drawShapeBorder();
  drawHoles();

  for (var i = 0; i < animationState.threadIndex; i++) {
    drawAnimatedSegments(threads[i], animationState.segmentLists[i], (animationState.segmentLists[i] || []).length);
  }

  var activePair = null;
  if (animationState.threadIndex >= 0 && animationState.threadIndex < threads.length) {
    var activeThread = threads[animationState.threadIndex];
    var activeSegments = animationState.segmentLists[animationState.threadIndex] || [];

    drawAnimatedSegments(activeThread, activeSegments, animationState.step);

    if (animationState.step < activeSegments.length) {
      var segmentProgress = animationState.elapsed / getAnimationSecondsPerSegment();
      activePair = drawAnimatedSegmentProgress(activeThread, activeSegments, animationState.step, segmentProgress);
    }
  }

  drawSegmentSettleAccent(animationState.settle);

  animationState.activeHolePair = activePair;
  syncHoleNumberHighlightFromAnimationState();
  bringHoleNumbersToFront();
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

  renderAnimationFrame();
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
    musicMuted: isMusicMuted,
    showHoleNumbers: showHoleNumbers,
    borderEnabled: borderEnabled
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

function drawShapeBorder() {
  if (!borderEnabled) return;

  var borderGeometry = getBorderGeometryForCurrentShape();
  if (!borderGeometry || !borderGeometry.outerSamples || !borderGeometry.innerSamples) return;

  var polygonVertices = borderGeometry.isPolygon ? borderGeometry.polygonVertices : null;
  var outerSamples = borderGeometry.outerSamples;
  var innerSamples = borderGeometry.innerSamples;

  var outerPath = new Path(outerSamples);
  outerPath.closed = true;
  outerPath.strokeColor = BORDER_STROKE_COLOR;
  outerPath.strokeWidth = BORDER_STROKE_WIDTH;
  outerPath.strokeJoin = polygonVertices ? 'miter' : 'round';
  outerPath.strokeCap = 'round';
  outerPath.miterLimit = 8;

  var innerPath = new Path(innerSamples);
  innerPath.closed = true;
  innerPath.strokeColor = BORDER_STROKE_COLOR;
  innerPath.strokeWidth = BORDER_STROKE_WIDTH;
  innerPath.strokeJoin = polygonVertices ? 'miter' : 'round';
  innerPath.strokeCap = 'round';
  innerPath.miterLimit = 8;
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
function computeSequence(thread) {
  var n = points.length;

  if (thread.sequence && thread.sequence.type === 'custom') {
    return thread.sequence.list;
  }

  var jumpMode = thread.jumpMode || 'fixed';
  var visited = new Array(n).fill(false);
  var current = 0;
  var prev = 0;
  var seq = [];
  var maxSteps = n * 4;

  function normalizeJump(value) {
    var k = Math.round(Number(value));
    if (!isFinite(k)) return 1;
    k = k % n;
    if (k === 0) return 1;
    return k;
  }

  function parseJumpSequence(text) {
    if (!text) return [];
    return text
      .split(/[\s,]+/)
      .map(Number)
      .filter((num) => isFinite(num))
      .map((num) => Math.round(num))
      .filter((num) => num !== 0);
  }

  function normalizeFormulaExpression(expression) {
    if (!expression) return 'skip';
    return String(expression)
      .trim()
      .replace(/[×·]/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**')
      .replace(/\bmod\b/gi, '%');
  }

  var jumpResolver;
  if (jumpMode === 'sequence') {
    var stepList = parseJumpSequence(thread.jumpSequence);
    jumpResolver = function(i) {
      if (!stepList.length) return normalizeJump(thread.jump);
      return normalizeJump(stepList[i % stepList.length]);
    };
  } else if (jumpMode === 'formula') {
    var formula = normalizeFormulaExpression(thread.jumpFormula || 'skip');
    jumpResolver = function(i, currentIndex, previousIndex) {
      try {
        var evaluate = new Function(
          'i', 'n', 'current', 'prev', 'skip', 'jump',
          'abs', 'floor', 'ceil', 'round', 'sqrt', 'pow', 'min', 'max', 'sin', 'cos', 'tan', 'pi',
          'return (' + formula + ');'
        );
        return normalizeJump(
          evaluate(
            i, n, currentIndex, previousIndex, thread.jump, thread.jump,
            Math.abs, Math.floor, Math.ceil, Math.round, Math.sqrt, Math.pow,
            Math.min, Math.max, Math.sin, Math.cos, Math.tan, Math.PI
          )
        );
      } catch (err) {
        return normalizeJump(thread.jump);
      }
    };
  } else {
    jumpResolver = function() {
      return normalizeJump(thread.sequence ? thread.sequence.k : thread.jump);
    };
  }

  for (var i = 0; i < maxSteps; i++) {
    if (visited[current]) break;
    visited[current] = true;
    seq.push(current);
    var step = jumpResolver(i, current, prev);
    prev = current;
    current = (current + step) % n;
    if (current < 0) current += n;
  }
  return seq;
}

function computeSegments(thread) {
  var n = points.length;
  if (!n || !thread) return [];

  if (thread.jumpMode === 'connect') {
    ensureThreadConnectConfig(thread);
    var segments = [];
    var multiplier = Math.round(Number(thread.connectMultiplier || 2));
    var offset = Math.round(Number(thread.connectOffset || 0));
    for (var i = 0; i < n; i++) {
      // Use label-based (1..n) arithmetic so visible hole numbers match mapping behavior.
      var sourceLabel = i + 1;
      var mappedLabel = (multiplier * sourceLabel + offset - 1) % n;
      if (mappedLabel < 0) mappedLabel += n;
      var mapped = mappedLabel;
      segments.push([i, mapped]);
    }
    return segments;
  }

  var seq = computeSequence(thread);
  var chained = [];
  for (var j = 0; j < seq.length; j++) {
    chained.push([seq[j], seq[(j + 1) % seq.length]]);
  }
  return chained;
}

function drawThread(thread) {
  var segments = computeSegments(thread);

  for (var i = 0; i < segments.length; i++) {
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

function triangulaCountToDepth(count) {
  var safeCount = Math.max(1, Math.floor(Number(count) || 1));
  var depth = Math.round(Math.log(safeCount) / Math.log(3));
  if (!isFinite(depth) || depth < 0) depth = 0;
  return Math.max(0, Math.min(6, depth));
}

function getTriangulaBaseTriangle(scaleFactor) {
  var center = view.center;
  var baseSize = Math.max(120, Math.min(view.size.width, view.size.height) - 56);
  var scale = isFinite(scaleFactor) ? Math.max(0.45, Math.min(1, scaleFactor)) : 1;
  var size = baseSize * scale;
  var half = size / 2;
  var height = Math.sqrt(3) * half;
  return [
    new Point(center.x, center.y - (height / 2)),
    new Point(center.x - half, center.y + (height / 2)),
    new Point(center.x + half, center.y + (height / 2))
  ];
}

function normalizeTriangulaFillColor(colorValue, fallback) {
  var fallbackColor = fallback || '#256f7a';
  if (!colorValue) return fallbackColor;
  return colorValue;
}

function getTriangulaAlternatingRainbowColor(sequenceIndex) {
  // Fixed ROYGBIV order for predictable rainbow construction progression.
  var palette = ['#ff0000', '#ff7f00', '#ffff00', '#00aa00', '#0066ff', '#4b0082', '#8f00ff'];
  var index = Math.abs(Math.floor(Number(sequenceIndex) || 0)) % palette.length;
  return palette[index];
}

function getTriangulaResolvedFillColor(colorValue, sequenceIndex, fallback) {
  var normalized = normalizeTriangulaFillColor(colorValue, fallback);
  if (normalized === 'rainbow') {
    return getTriangulaAlternatingRainbowColor(sequenceIndex);
  }
  return normalized;
}

function getTriangulaEffectiveColorMode() {
  if (triangulaConstructionMode === 'cut') return 'all';
  return triangulaColorMode || 'band-1';
}

function getTriangulaRainbowSequenceIndex(slot, sequenceIndex, mode) {
  var sequence = Math.floor(Number(sequenceIndex) || 0);
  if (sequence < 0) sequence = 0;

  if (mode === 'all') return sequence;
  if ((mode === 'band-1' && slot === 1) || (mode === 'band-2' && slot === 2) || (mode === 'band-4' && slot === 4)) {
    return Math.floor(sequence / 3);
  }

  return sequence;
}

function getTriangulaFillColorForSlot(slot, sequenceIndex) {
  var mode = getTriangulaEffectiveColorMode();
  var rainbowSequence = getTriangulaRainbowSequenceIndex(slot, sequenceIndex, mode);
  var allColor = normalizeTriangulaFillColor(threads[0] ? threads[0].color : null, triangulaBandColors.band1);
  if (mode === 'all') return getTriangulaResolvedFillColor(allColor, rainbowSequence, triangulaBandColors.band1);
  if (mode === 'band-1') return slot === 1 ? getTriangulaResolvedFillColor(triangulaBandColors.band1, rainbowSequence, triangulaBandColors.band1) : '#ffffff';
  if (mode === 'band-2') return slot === 2 ? getTriangulaResolvedFillColor(triangulaBandColors.band2, rainbowSequence, triangulaBandColors.band2) : '#ffffff';
  if (mode === 'band-4') return slot === 4 ? getTriangulaResolvedFillColor(triangulaBandColors.band4, rainbowSequence, triangulaBandColors.band4) : '#ffffff';
  return getTriangulaResolvedFillColor(allColor, rainbowSequence, triangulaBandColors.band1);
}

function getTriangulaStrokeColorForSlot(slot, sequenceIndex) {
  var fill = getTriangulaFillColorForSlot(slot, sequenceIndex);
  if (!fill || fill === '#ffffff') return '#8ea4b0';
  return '#234b61';
}

function getTriangulaSplit(vertices) {
  var m01 = vertices[0].add(vertices[1]).divide(2);
  var m12 = vertices[1].add(vertices[2]).divide(2);
  var m20 = vertices[2].add(vertices[0]).divide(2);
  return {
    central: [m01, m12, m20],
    children: [
      { vertices: [vertices[0], m01, m20], slot: 1 },
      { vertices: [m01, vertices[1], m12], slot: 2 },
      { vertices: [m20, m12, vertices[2]], slot: 4 }
    ]
  };
}

function collectTrianglesAtDepth(vertices, depth, currentDepth, slot, collector) {
  if (currentDepth === depth) {
    collector.push({ vertices: vertices, slot: slot || 1 });
    return;
  }
  if (currentDepth > depth) return;
  var split = getTriangulaSplit(vertices);
  for (var i = 0; i < split.children.length; i++) {
    collectTrianglesAtDepth(split.children[i].vertices, depth, currentDepth + 1, split.children[i].slot, collector);
  }
}

function collectCutTrianglesAtDepth(vertices, depth, currentDepth, collector) {
  if (depth <= 0) return;
  if (currentDepth >= depth) return;
  var split = getTriangulaSplit(vertices);
  if (currentDepth + 1 === depth) {
    collector.push({ vertices: split.central, parent: vertices });
    return;
  }
  for (var i = 0; i < split.children.length; i++) {
    collectCutTrianglesAtDepth(split.children[i].vertices, depth, currentDepth + 1, collector);
  }
}

function collectParentChildTransitionsAtDepth(vertices, depth, currentDepth, collector) {
  if (depth <= 0) return;
  if (currentDepth >= depth) return;
  var split = getTriangulaSplit(vertices);
  if (currentDepth + 1 === depth) {
    var parentCenter = vertices[0].add(vertices[1]).add(vertices[2]).divide(3);
    for (var i = 0; i < split.children.length; i++) {
      var child = split.children[i];
      var childCenter = child.vertices[0].add(child.vertices[1]).add(child.vertices[2]).divide(3);
      collector.push({
        from: parentCenter,
        to: childCenter,
        child: child.vertices,
        parent: vertices,
        slot: child.slot
      });
    }
    return;
  }
  for (var j = 0; j < split.children.length; j++) {
    collectParentChildTransitionsAtDepth(split.children[j].vertices, depth, currentDepth + 1, collector);
  }
}

function drawTriangleStrokeProgress(vertices, options, progress) {
  var p = Math.max(0, Math.min(1, progress));
  if (p <= 0) return;

  var v0 = vertices[0];
  var v1 = vertices[1];
  var v2 = vertices[2];
  var l01 = v0.getDistance(v1);
  var l12 = v1.getDistance(v2);
  var l20 = v2.getDistance(v0);
  var total = l01 + l12 + l20;
  var remaining = total * p;

  var path = new Path();
  path.strokeColor = options.strokeColor || '#2f4368';
  path.strokeWidth = options.strokeWidth || 1.2;
  path.opacity = isFinite(options.opacity) ? options.opacity : 1;
  path.add(v0);

  function addPartial(from, to, segLength) {
    if (remaining <= 0) return;
    if (remaining >= segLength) {
      path.add(to);
      remaining -= segLength;
      return;
    }
    var t = remaining / segLength;
    path.add(from.add(to.subtract(from).multiply(t)));
    remaining = 0;
  }

  addPartial(v0, v1, l01);
  addPartial(v1, v2, l12);
  addPartial(v2, v0, l20);
}

function drawTrianglePath(vertices, options) {
  var triangle = new Path();
  triangle.closed = true;
  triangle.add(vertices[0]);
  triangle.add(vertices[1]);
  triangle.add(vertices[2]);
  if (options && options.strokeColor) {
    triangle.strokeColor = options.strokeColor;
    triangle.strokeWidth = options.strokeWidth || 1.4;
  }
  if (options && options.fillColor) {
    triangle.fillColor = options.fillColor;
  }
  if (options && isFinite(options.opacity)) {
    triangle.opacity = options.opacity;
  }
  return triangle;
}

function drawTriangulaDepth(depth, scale) {
  var base = getTriangulaBaseTriangle(scale);
  var baseColor = getTriangulaFillColorForSlot(1);
  drawTrianglePath(base, {
    strokeColor: '#234b61',
    strokeWidth: triangulaConstructionMode === 'cut' ? 1.7 : 1.1,
    fillColor: baseColor,
    opacity: 0.95
  });

  var boundedDepth = Math.max(0, Math.min(6, depth));
  if (triangulaConstructionMode === 'cut') {
    for (var level = 1; level <= boundedDepth; level++) {
      var cutTriangles = [];
      collectCutTrianglesAtDepth(base, level, 0, cutTriangles);
      for (var c = 0; c < cutTriangles.length; c++) {
        drawTrianglePath(cutTriangles[c].vertices, {
          fillColor: '#ffffff',
          strokeColor: '#ffffff',
          strokeWidth: 1.08,
          opacity: 0.97
        });
      }
    }
  } else {
    for (var d = 1; d <= boundedDepth; d++) {
      var triangles = [];
      collectTrianglesAtDepth(base, d, 0, 1, triangles);
      for (var t = 0; t < triangles.length; t++) {
        drawTrianglePath(triangles[t].vertices, {
          strokeColor: getTriangulaStrokeColorForSlot(triangles[t].slot, t),
          strokeWidth: Math.max(0.7, 1.3 - (d * 0.1)),
          fillColor: getTriangulaFillColorForSlot(triangles[t].slot, t),
          opacity: Math.max(0.45, 0.92 - (d * 0.08))
        });
      }
    }
  }
}

function getTriangulaItemCountForDepth(base, depth) {
  if (triangulaConstructionMode === 'cut') {
    var cuts = [];
    collectCutTrianglesAtDepth(base, depth, 0, cuts);
    return cuts.length;
  }
  var transitions = [];
  collectParentChildTransitionsAtDepth(base, depth, 0, transitions);
  return transitions.length;
}

function buildTriangulaSteps(startDepth, targetDepth) {
  var steps = [];
  var depthItemCounts = Object.create(null);
  var base = getTriangulaBaseTriangle(1);

  for (var d = startDepth + 1; d <= targetDepth; d++) {
    var itemCount = getTriangulaItemCountForDepth(base, d);
    depthItemCounts[d] = itemCount;
    if (itemCount <= 0) continue;

    if (triangulaFractalMode === 'parallel') {
      if (triangulaConstructionMode === 'cut') {
        steps.push({ type: 'cut-guides', depth: d, beats: 1.0, itemIndex: -1, itemCount: itemCount });
        steps.push({ type: 'cut-apply', depth: d, beats: 0.85, itemIndex: -1, itemCount: itemCount });
      } else {
        steps.push({ type: 'shrink-paths', depth: d, beats: 0.95, itemIndex: -1, itemCount: itemCount });
        steps.push({ type: 'shrink-materialize', depth: d, beats: 0.8, itemIndex: -1, itemCount: itemCount });
      }
      continue;
    }

    for (var idx = 0; idx < itemCount; idx++) {
      if (triangulaConstructionMode === 'cut') {
        steps.push({ type: 'cut-guides', depth: d, beats: 0.5, itemIndex: idx, itemCount: itemCount });
        steps.push({ type: 'cut-apply', depth: d, beats: 0.45, itemIndex: idx, itemCount: itemCount });
      } else {
        steps.push({ type: 'shrink-paths', depth: d, beats: 0.48, itemIndex: idx, itemCount: itemCount });
        steps.push({ type: 'shrink-materialize', depth: d, beats: 0.44, itemIndex: idx, itemCount: itemCount });
      }
    }
  }
  return {
    steps: steps,
    depthItemCounts: depthItemCounts
  };
}

function getTriangulaStepDurationSeconds(step) {
  var baseSeconds = getAnimationSecondsPerSegment();
  var beats = step && isFinite(step.beats) ? Math.max(0.05, step.beats) : 0.5;
  return Math.max(0.03, baseSeconds * beats);
}

function getTriangulaTimelineScale(state) {
  if (triangulaFitMode !== 'dynamic') return 1;
  if (!state || !state.steps || !state.steps.length) return 1;
  var currentStep = state.steps[Math.min(state.stepIndex, state.steps.length - 1)];
  var localProgress = 0;
  if (currentStep) {
    var currentDuration = getTriangulaStepDurationSeconds(currentStep);
    localProgress = Math.max(0, Math.min(1, state.elapsed / currentDuration));
  }
  var phaseProgress = (state.stepIndex + localProgress) / Math.max(1, state.steps.length);
  return Math.max(0.62, 1 - (0.3 * phaseProgress));
}

function triangulaStepFinalizesDepth(step) {
  return !!step && (step.type === 'cut-apply' || step.type === 'shrink-materialize');
}

function getTriangulaFinalizedCountAtDepth(state, depth) {
  if (!state || !state.steps) return 0;
  var count = 0;
  for (var i = 0; i < state.stepIndex; i++) {
    var step = state.steps[i];
    if (!step || step.depth !== depth || !triangulaStepFinalizesDepth(step)) continue;
    count += step.itemIndex === -1 ? (step.itemCount || 0) : 1;
  }
  var maxCount = state.depthItemCounts && state.depthItemCounts[depth] ? state.depthItemCounts[depth] : 0;
  return Math.min(count, maxCount);
}

function getTriangulaCompletedDepth(state) {
  var depth = state ? state.startDepth : 0;
  if (!state || !state.depthItemCounts) return depth;
  for (var d = state.startDepth + 1; d <= state.targetDepth; d++) {
    var needed = state.depthItemCounts[d] || 0;
    if (!needed) {
      depth = d;
      continue;
    }
    if (getTriangulaFinalizedCountAtDepth(state, d) >= needed) {
      depth = d;
      continue;
    }
    break;
  }
  return depth;
}

function drawTriangulaFinalizedAtDepth(base, depth, finalizedCount) {
  if (finalizedCount <= 0) return;

  if (triangulaConstructionMode === 'cut') {
    var cuts = [];
    collectCutTrianglesAtDepth(base, depth, 0, cuts);
    for (var i = 0; i < Math.min(finalizedCount, cuts.length); i++) {
      drawTrianglePath(cuts[i].vertices, {
        fillColor: '#ffffff',
        strokeColor: '#ffffff',
        strokeWidth: 1.06,
        opacity: 0.97
      });
    }
    return;
  }

  var triangles = [];
  collectTrianglesAtDepth(base, depth, 0, 1, triangles);
  for (var j = 0; j < Math.min(finalizedCount, triangles.length); j++) {
    drawTrianglePath(triangles[j].vertices, {
      strokeColor: getTriangulaStrokeColorForSlot(triangles[j].slot, j),
      strokeWidth: Math.max(0.7, 1.3 - (depth * 0.1)),
      fillColor: getTriangulaFillColorForSlot(triangles[j].slot, j),
      opacity: Math.max(0.45, 0.92 - (depth * 0.08))
    });
  }
}

function stepAppliesToIndex(step, index) {
  if (!step) return false;
  return step.itemIndex === -1 || step.itemIndex === index;
}

function drawTriangulaPulseBorder(vertices, progress) {
  if (!vertices || vertices.length < 3) return;
  var p = Math.max(0, Math.min(1, progress));
  // Single-pass envelope with slight hold so emphasis does not fade too quickly.
  var attackEnd = 0.44;
  var holdEnd = 0.72;
  var pulse;
  if (p < attackEnd) {
    pulse = p / attackEnd;
  } else if (p < holdEnd) {
    pulse = 1;
  } else {
    pulse = 1 - ((p - holdEnd) / (1 - holdEnd));
  }
  pulse = Math.max(0, Math.min(1, pulse));
  var easedPulse = pulse * pulse * (3 - (2 * pulse));
  drawTrianglePath(vertices, {
    strokeColor: toRgbaColor('#173b56', 0.38 + (0.42 * easedPulse)),
    strokeWidth: 1.3 + (2.2 * easedPulse),
    opacity: 0.36 + (0.44 * easedPulse)
  });
  drawTrianglePath(vertices, {
    strokeColor: toRgbaColor('#f8fcff', 0.06 + (0.14 * easedPulse)),
    strokeWidth: 2.0 + (1.0 * easedPulse),
    opacity: 0.06 + (0.16 * easedPulse)
  });
}

function drawTriangulaPulseBordersForCutStep(cuts, step, progress) {
  if (!cuts || !cuts.length || !step) return;
  if (step.itemIndex === -1) {
    for (var i = 0; i < cuts.length; i++) {
      drawTriangulaPulseBorder(cuts[i].parent, progress);
    }
    return;
  }
  if (step.itemIndex >= 0 && step.itemIndex < cuts.length) {
    drawTriangulaPulseBorder(cuts[step.itemIndex].parent, progress);
  }
}

function drawTriangulaPulseBordersForShrinkStep(transitions, step, progress) {
  if (!transitions || !transitions.length || !step) return;
  if (step.itemIndex === -1) {
    var parallelPhase = step.type === 'shrink-materialize'
      ? (0.5 + (0.5 * progress))
      : (0.5 * progress);
    for (var i = 0; i < transitions.length; i += 3) {
      drawTriangulaPulseBorder(transitions[i].parent, parallelPhase);
    }
    return;
  }

  // A parent set is 3 child transitions, each with 2 sub-steps.
  // Map all of that to one 0..1 phase so highlight appears once per set:
  // rise through child 1, peak by child 2, fade by end of child 3.
  var childIndexWithinSet = step.itemIndex % 3;
  var childSubstepPhase = step.type === 'shrink-materialize'
    ? (0.5 + (0.5 * progress))
    : (0.5 * progress);
  var setPhase = (childIndexWithinSet + childSubstepPhase) / 3;

  var parentGroupIndex = Math.floor(step.itemIndex / 3) * 3;
  if (parentGroupIndex >= 0 && parentGroupIndex < transitions.length) {
    drawTriangulaPulseBorder(transitions[parentGroupIndex].parent, setPhase);
  }
}

function drawTriangulaStepOverlay(base, step, progress) {
  if (!step) return;
  var p = Math.max(0, Math.min(1, progress));

  if (step.type === 'cut-guides' || step.type === 'cut-apply') {
    var cuts = [];
    collectCutTrianglesAtDepth(base, step.depth, 0, cuts);
    for (var i = 0; i < cuts.length; i++) {
      if (!stepAppliesToIndex(step, i)) continue;
      drawTriangleStrokeProgress(cuts[i].vertices, {
        strokeColor: '#2c5a7d',
        strokeWidth: 1.2,
        opacity: 0.55
      }, step.type === 'cut-guides' ? p : 1);

      if (step.type === 'cut-apply') {
        drawTrianglePath(cuts[i].vertices, {
          fillColor: '#ffffff',
          strokeColor: '#ffffff',
          strokeWidth: 1.08,
          opacity: Math.max(0, Math.min(1, p))
        });
      }
    }
    if (step.type === 'cut-guides') {
      drawTriangulaPulseBordersForCutStep(cuts, step, p);
    }
    return;
  }

  if (step.type === 'shrink-paths' || step.type === 'shrink-materialize') {
    var transitions = [];
    collectParentChildTransitionsAtDepth(base, step.depth, 0, transitions);
    for (var j = 0; j < transitions.length; j++) {
      if (!stepAppliesToIndex(step, j)) continue;
      var link = transitions[j];
      var connector = new Path();
      connector.strokeColor = getTriangulaStrokeColorForSlot(link.slot, j);
      connector.strokeWidth = 1.05;
      connector.opacity = 0.42;
      connector.add(link.from);
      var connectorProgress = step.type === 'shrink-paths' ? p : 1;
      connector.add(link.from.add(link.to.subtract(link.from).multiply(connectorProgress)));
    }

    if (step.type === 'shrink-materialize') {
      for (var k = 0; k < transitions.length; k++) {
        if (!stepAppliesToIndex(step, k)) continue;
        var child = transitions[k];
        drawTrianglePath(child.child, {
          fillColor: getTriangulaFillColorForSlot(child.slot, k),
          strokeColor: getTriangulaStrokeColorForSlot(child.slot, k),
          strokeWidth: Math.max(0.7, 1.3 - (step.depth * 0.1)),
          opacity: Math.max(0.2, p * (0.95 - (step.depth * 0.08)))
        });
        drawTriangleStrokeProgress(child.child, {
          strokeColor: getTriangulaStrokeColorForSlot(child.slot, k),
          strokeWidth: Math.max(0.7, 1.3 - (step.depth * 0.1)),
          opacity: Math.max(0.36, 0.85 - (step.depth * 0.08))
        }, p);
      }
    }

    drawTriangulaPulseBordersForShrinkStep(transitions, step, p);
  }
}

function renderTriangulaAnimationStateFrame(state) {
  if (!state) return;
  var step = state.steps[state.stepIndex] || null;
  var completedDepth = getTriangulaCompletedDepth(state);
  var scale = getTriangulaTimelineScale(state);
  var base = getTriangulaBaseTriangle(scale);

  project.activeLayer.removeChildren();
  drawTriangulaDepth(completedDepth, scale);

  if (step && step.depth > completedDepth) {
    var finalizedAtStepDepth = getTriangulaFinalizedCountAtDepth(state, step.depth);
    drawTriangulaFinalizedAtDepth(base, step.depth, finalizedAtStepDepth);
  }

  if (step) {
    var stepDuration = getTriangulaStepDurationSeconds(step);
    var stepProgress = Math.max(0, Math.min(1, state.elapsed / stepDuration));
    drawTriangulaStepOverlay(base, step, stepProgress);
  }
}

function drawTriangulaStatic() {
  project.activeLayer.removeChildren();
  var endDepth = triangulaCountToDepth(triangulaTargetCount);
  drawTriangulaDepth(endDepth, 1);
  clearHighlightedHoleNumbers();
}

function runTriangulaAnimationFrame(event) {
  if (!animationActive || !triangulaAnimationState) return;
  var delta = Math.min(event.delta || 0, 0.1);
  triangulaAnimationState.elapsed += delta;

  while (animationActive) {
    var activeStep = triangulaAnimationState.steps[triangulaAnimationState.stepIndex];
    if (!activeStep) break;
    var stepDuration = getTriangulaStepDurationSeconds(activeStep);
    if (triangulaAnimationState.elapsed < stepDuration) break;
    triangulaAnimationState.elapsed -= stepDuration;
    triangulaAnimationState.stepIndex += 1;

    if (triangulaAnimationState.stepIndex >= triangulaAnimationState.steps.length) {
      animationActive = false;
      animationPlaybackState = 'idle';
      triangulaAnimationState = null;
      view.onFrame = null;
      syncAnimateButtonLabel();
      updateMusicPlaybackState();
      scheduleUrlStateSync(false);
      drawTriangulaStatic();
      return;
    }
  }

  renderTriangulaAnimationStateFrame(triangulaAnimationState);
}

function animateTriangula() {
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  triangulaAnimationState = null;

  var startDepth = triangulaCountToDepth(triangulaStartCount);
  var endDepth = triangulaCountToDepth(triangulaTargetCount);
  if (endDepth < startDepth) {
    endDepth = startDepth;
  }

  var timeline = buildTriangulaSteps(startDepth, endDepth);
  if (!timeline.steps.length) {
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    scheduleUrlStateSync(false);
    drawTriangulaStatic();
    return;
  }

  triangulaAnimationState = {
    startDepth: startDepth,
    targetDepth: endDepth,
    steps: timeline.steps,
    depthItemCounts: timeline.depthItemCounts,
    stepIndex: 0,
    elapsed: 0,
    mode: triangulaConstructionMode,
    fractalMode: triangulaFractalMode
  };

  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  renderTriangulaAnimationStateFrame(triangulaAnimationState);
  view.onFrame = runTriangulaAnimationFrame;
}

function shouldShowHoleNumbersNow() {
  var holeCount = parseInt(holesSlider.value, 10);
  if (!isFinite(holeCount)) return false;
  return showHoleNumbers && holeCount <= HOLE_NUMBER_AUTO_HIDE_THRESHOLD;
}

function getOutwardDirectionAtHole(index, ccw) {
  if (!points.length) return new Point(0, -1);

  var n = points.length;
  var prev = points[(index - 1 + n) % n];
  var curr = points[index];
  var next = points[(index + 1) % n];
  var tangent = next.subtract(prev);

  if (tangent.length <= 0.001) {
    var fromCenter = curr.subtract(view.center);
    if (fromCenter.length <= 0.001) return new Point(0, -1);
    return fromCenter.normalize(1);
  }

  var outwardRotation = ccw ? -90 : 90;
  var outward = tangent.normalize(1).rotate(outwardRotation);
  if (outward.length <= 0.001) {
    var fallback = curr.subtract(view.center);
    if (fallback.length <= 0.001) return new Point(0, -1);
    return fallback.normalize(1);
  }

  // Ensure direction points away from center for stable "outer side" placement.
  if (outward.dot(curr.subtract(view.center)) < 0) {
    outward = outward.multiply(-1);
  }

  return outward.normalize(1);
}

function getBoundsExtentAlongDirection(item, direction) {
  var dir = direction.normalize(1);
  var center = item.position;
  var corners = [
    item.bounds.topLeft,
    item.bounds.topRight,
    item.bounds.bottomLeft,
    item.bounds.bottomRight
  ];
  var maxProjection = 0;
  for (var i = 0; i < corners.length; i++) {
    var projection = corners[i].subtract(center).dot(dir);
    if (projection > maxProjection) {
      maxProjection = projection;
    }
  }
  return Math.max(0, maxProjection);
}

function getHoleNumberFontSize(holeCount) {
  if (holeCount >= 70) return 8;
  if (holeCount >= 55) return 8.5;
  return 9;
}

function getHoleLabelOffsetFromExtent(extent, borderClearance, holeClearance) {
  var borderPad = isFinite(borderClearance) ? borderClearance : LABEL_BORDER_CLEARANCE;
  var holePad = isFinite(holeClearance) ? holeClearance : LABEL_HOLE_CLEARANCE;
  var minOffset = 3 + holePad + extent;
  var maxOffset = BORDER_OUTER_GAP - (BORDER_STROKE_WIDTH * 0.5 + borderPad + extent);
  var preferredOffset = Math.max(minOffset, BORDER_OUTER_GAP * LABEL_OUTER_BIAS);
  var clampedOffset;

  if (maxOffset >= minOffset) {
    clampedOffset = Math.max(minOffset, Math.min(preferredOffset, maxOffset));
  } else {
    // Fallback: prioritize staying inside the outer border band.
    clampedOffset = Math.max(3.8, maxOffset);
  }

  if (!isFinite(clampedOffset)) {
    clampedOffset = Math.max(4, BORDER_OUTER_GAP * 0.6);
  }

  return {
    offset: clampedOffset,
    minOffset: minOffset,
    maxOffset: maxOffset
  };
}

function estimateTextExtentAlongDirection(text, fontSize) {
  var len = String(text || '').length;
  if (len <= 1) return fontSize * 0.28;
  if (len === 2) return fontSize * 0.46;
  return fontSize * (0.56 + Math.min(2, len - 2) * 0.1);
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

function parseBoundedInt(rawValue, minValue, maxValue, fallback) {
  var parsed = parseInt(rawValue, 10);
  if (!isFinite(parsed)) return fallback;
  if (isFinite(minValue) && parsed < minValue) parsed = minValue;
  if (isFinite(maxValue) && parsed > maxValue) parsed = maxValue;
  return parsed;
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
  var width = Math.round(view.viewSize.width);
  var height = Math.round(view.viewSize.height);
  var lines = [];
  var base = getTriangulaBaseTriangle(1);
  var endDepth = triangulaCountToDepth(triangulaTargetCount);

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');
  lines.push('<rect x="0" y="0" width="' + width + '" height="' + height + '" fill="#ffffff"/>');

  lines.push(
    '<path d="' + svgPathFromPoints(base) +
    '" fill="' + colorToSvg(getTriangulaFillColorForSlot(1, 0)) +
    '" stroke="#234b61" stroke-width="' + formatSvgNumber(triangulaConstructionMode === 'cut' ? 1.7 : 1.1) +
    '" opacity="0.95"/>'
  );

  if (triangulaConstructionMode === 'cut') {
    for (var level = 1; level <= endDepth; level++) {
      var cutTriangles = [];
      collectCutTrianglesAtDepth(base, level, 0, cutTriangles);
      for (var c = 0; c < cutTriangles.length; c++) {
        lines.push(
          '<path d="' + svgPathFromPoints(cutTriangles[c].vertices) +
          '" fill="#ffffff" stroke="#ffffff" stroke-width="1.08" opacity="0.97"/>'
        );
      }
    }
  } else {
    for (var d = 1; d <= endDepth; d++) {
      var triangles = [];
      collectTrianglesAtDepth(base, d, 0, 1, triangles);
      for (var t = 0; t < triangles.length; t++) {
        lines.push(
          '<path d="' + svgPathFromPoints(triangles[t].vertices) +
          '" fill="' + colorToSvg(getTriangulaFillColorForSlot(triangles[t].slot, t)) +
          '" stroke="' + colorToSvg(getTriangulaStrokeColorForSlot(triangles[t].slot, t)) +
          '" stroke-width="' + formatSvgNumber(Math.max(0.7, 1.3 - (d * 0.1))) +
          '" opacity="' + formatSvgNumber(Math.max(0.45, 0.92 - (d * 0.08))) +
          '"/>'
        );
      }
    }
  }

  lines.push('</svg>');
  return lines.join('\n');
}

function buildCurrentDesignSvgString(options) {
  options = options || {};
  if (currentExperienceId === 'triangula') {
    return buildTriangulaDesignSvgString();
  }

  var includeThreads = options.includeThreads !== false;

  // Export a fresh static snapshot independent from transient animation artifacts.
  computePoints();

  var width = Math.round(view.viewSize.width);
  var height = Math.round(view.viewSize.height);
  var lines = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');

  if (borderEnabled && BORDER_INCLUDE_IN_SVG) {
    var borderGeometry = getBorderGeometryForCurrentShape();
    if (borderGeometry && borderGeometry.outerSamples && borderGeometry.innerSamples) {
      var lineJoin = borderGeometry.isPolygon ? 'miter' : 'round';
      var outerPathData = svgPathFromPoints(borderGeometry.outerSamples);
      var innerPathData = svgPathFromPoints(borderGeometry.innerSamples);
      lines.push('<path d="' + outerPathData + '" fill="none" stroke="' + BORDER_STROKE_COLOR + '" stroke-width="' + BORDER_STROKE_WIDTH + '" stroke-linejoin="' + lineJoin + '" stroke-linecap="round" stroke-miterlimit="8"/>');
      lines.push('<path d="' + innerPathData + '" fill="none" stroke="' + BORDER_STROKE_COLOR + '" stroke-width="' + BORDER_STROKE_WIDTH + '" stroke-linejoin="' + lineJoin + '" stroke-linecap="round" stroke-miterlimit="8"/>');
    }
  }

  if (includeThreads) {
    for (var t = 0; t < threads.length; t++) {
      var thread = threads[t];
      var segments = computeSegments(thread);
      for (var s = 0; s < segments.length; s++) {
        var fromPoint = points[segments[s][0]];
        var toPoint = points[segments[s][1]];
        if (!fromPoint || !toPoint) continue;

        var strokeColor = thread.color === 'rainbow'
          ? colorToSvg(rainbowColor(s / Math.max(1, segments.length)))
          : colorToSvg(thread.color);

        lines.push(
          '<line x1="' + formatSvgNumber(fromPoint.x) + '" y1="' + formatSvgNumber(fromPoint.y) +
          '" x2="' + formatSvgNumber(toPoint.x) + '" y2="' + formatSvgNumber(toPoint.y) +
          '" stroke="' + strokeColor + '" stroke-width="' + formatSvgNumber(thread.width) +
          '" stroke-linecap="round" stroke-linejoin="round"/>'
        );
      }
    }
  }

  for (var i = 0; i < points.length; i++) {
    lines.push('<circle cx="' + formatSvgNumber(points[i].x) + '" cy="' + formatSvgNumber(points[i].y) + '" r="3" fill="#333"/>');
  }

  if (shouldShowHoleNumbersNow()) {
    var holeCount = parseInt(holesSlider.value, 10);
    if (!isFinite(holeCount)) holeCount = DEFAULT_HOLES;
    var fontSize = getHoleNumberFontSize(holeCount);
    var ccw = signedAreaOfClosedPolyline(points) > 0;

    for (var j = 0; j < points.length; j++) {
      var text = String(j + 1);
      var outward = getOutwardDirectionAtHole(j, ccw);
      var extent = estimateTextExtentAlongDirection(text, fontSize);
      var metrics = getHoleLabelOffsetFromExtent(extent, LABEL_BORDER_CLEARANCE_SVG, LABEL_HOLE_CLEARANCE_SVG);

      if (metrics.maxOffset < metrics.minOffset) {
        var availableBand = BORDER_OUTER_GAP - (BORDER_STROKE_WIDTH * 0.5 + LABEL_BORDER_CLEARANCE_SVG) - (3 + LABEL_HOLE_CLEARANCE_SVG);
        var reducedFont = Math.max(6, Math.min(fontSize, availableBand * 1.6));
        if (reducedFont < fontSize) {
          fontSize = reducedFont;
          extent = estimateTextExtentAlongDirection(text, fontSize);
          metrics = getHoleLabelOffsetFromExtent(extent, LABEL_BORDER_CLEARANCE_SVG, LABEL_HOLE_CLEARANCE_SVG);
        }
      }

      var labelPos = points[j].add(outward.multiply(metrics.offset));
      lines.push(
        '<text x="' + formatSvgNumber(labelPos.x) + '" y="' + formatSvgNumber(labelPos.y) +
        '" fill="#555" font-size="' + formatSvgNumber(fontSize) +
        '" font-family="Nunito, sans-serif" text-anchor="middle" dominant-baseline="middle">' +
        text +
        '</text>'
      );
    }
  }

  lines.push('</svg>');
  return lines.join('\n');
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
  function getReadableStitchMode(mode) {
    if (mode === 'connect') return 'Multiplication';
    if (mode === 'sequence') return 'Step list';
    if (mode === 'formula') return 'Expression';
    return 'Addition';
  }

  function appendConnections(targetLines, segments) {
    for (var idx = 0; idx < segments.length; idx++) {
      targetLines.push('    ' + String(segments[idx][0] + 1) + ' -> ' + String(segments[idx][1] + 1));
    }
  }

  computePoints();

  var lines = [];
  var now = new Date();
  lines.push('curve_stitcher manual stitching guide');
  lines.push('Generated: ' + now.toISOString());
  lines.push('Export name: ' + fileBaseName);
  lines.push('');
  lines.push('Parameters');
  lines.push('Global');
  lines.push('Shape: ' + currentShape);
  lines.push('Holes: ' + holesSlider.value);
  lines.push('Border enabled: ' + (borderEnabled ? 'yes' : 'no'));
  lines.push('Hole numbers visible in export: ' + (shouldShowHoleNumbersNow() ? 'yes' : 'no'));
  lines.push('Include stitched threads in SVG: ' + (options.includeThreads ? 'yes' : 'no'));
  lines.push('');
  lines.push('Threads');

  for (var p = 0; p < threads.length; p++) {
    var paramThread = threads[p];
    ensureThreadConnectConfig(paramThread);
    lines.push('Thread ' + (p + 1));
    lines.push('  Color: ' + String(paramThread.color));
    lines.push('  Size: ' + String(paramThread.width));
    lines.push('  Stitch mode: ' + getReadableStitchMode(paramThread.jumpMode));
    lines.push('  Add value: ' + String(paramThread.jump));
    if (paramThread.jumpMode === 'connect') {
      lines.push('  Multiply by: ' + String(paramThread.connectMultiplier));
      lines.push('  Offset: ' + String(paramThread.connectOffset));
    }
    if (paramThread.jumpMode === 'sequence') {
      lines.push('  Step list: ' + String(paramThread.jumpSequence || ''));
    }
    if (paramThread.jumpMode === 'formula') {
      lines.push('  Expression: ' + String(paramThread.jumpFormula || 'skip'));
    }
  }

  lines.push('');
  lines.push('Preparation');
  lines.push('1. Manufacture the board with shape "' + currentShape + '" and ' + String(points.length) + ' numbered holes.');
  lines.push('2. Number holes clockwise as shown in the preview/export from 1 to ' + String(points.length) + '.');
  lines.push('3. Use one thread sequence section per listed thread below.');
  lines.push('');

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    ensureThreadConnectConfig(thread);
    var segments = computeSegments(thread);
    var modeName = getReadableStitchMode(thread.jumpMode);
    lines.push('Thread ' + (i + 1));
    lines.push('  Mode: ' + modeName);
    lines.push('  Color: ' + String(thread.color));
    lines.push('  Width: ' + String(thread.width));

    if (thread.jumpMode === 'connect') {
      lines.push('  Rule: target = ((multiplier * source + offset - 1) mod n) + 1, using labels 1..n.');
      lines.push('  Multiplier: ' + String(thread.connectMultiplier));
      lines.push('  Offset: ' + String(thread.connectOffset));
      lines.push('  Full connections:');
      appendConnections(lines, segments);
    } else if (thread.jumpMode === 'sequence') {
      lines.push('  Rule: repeat the provided step list from each current hole, wrapping modulo n.');
      lines.push('  Step list: ' + String(thread.jumpSequence || ''));
      lines.push('  Full connections:');
      appendConnections(lines, segments);
    } else if (thread.jumpMode === 'formula') {
      lines.push('  Rule: evaluate expression per step, then connect current -> (current + step) mod n.');
      lines.push('  Expression: ' + String(thread.jumpFormula || 'skip'));
      lines.push('  Base add value: ' + String(thread.jump));
      lines.push('  Full connections:');
      appendConnections(lines, segments);
    } else {
      lines.push('  Rule: next = ((current + add - 1) mod n) + 1, using labels 1..n.');
      lines.push('  Add value: ' + String(thread.jump));
      lines.push('  Full connections:');
      appendConnections(lines, segments);
    }

    lines.push('');
  }

  lines.push('Notes');
  lines.push('- If threads are hidden in the exported SVG, use this guide for reconstruction.');
  lines.push('- Keep consistent thread tension to match the on-screen reference closely.');

  return lines.join('\n');
}

function buildTriangulaGuideText(fileBaseName, options) {
  options = options || {};
  var now = new Date();
  var startDepth = triangulaCountToDepth(triangulaStartCount);
  var targetDepth = triangulaCountToDepth(triangulaTargetCount);
  var lines = [];

  lines.push('curve_stitcher Triangula instructions');
  lines.push('Generated: ' + now.toISOString());
  lines.push('Export name: ' + fileBaseName);
  lines.push('');
  lines.push('Parameters');
  lines.push('Experience: Triangula');
  lines.push('Construction mode: ' + triangulaConstructionMode);
  lines.push('Fractal mode: ' + triangulaFractalMode);
  lines.push('Canvas fit mode: ' + triangulaFitMode);
  lines.push('Color mode: ' + triangulaColorMode);
  lines.push('Start triangles: ' + String(triangulaStartCount) + ' (depth ' + String(startDepth) + ')');
  lines.push('Target triangles: ' + String(triangulaTargetCount) + ' (depth ' + String(targetDepth) + ')');
  lines.push('Band 1 color: ' + String(triangulaBandColors.band1));
  lines.push('Band 2 color: ' + String(triangulaBandColors.band2));
  lines.push('Band 4 color: ' + String(triangulaBandColors.band4));
  lines.push('Rainbow source color: ' + String(threads[0] ? threads[0].color : triangulaBandColors.band1));
  lines.push('');
  lines.push('Reconstruction');
  lines.push('1. Open Triangula in curve_stitcher.');
  lines.push('2. Set mode, color mode, and start/target values to match parameters above.');
  lines.push('3. Apply band/rainbow colors as listed above.');
  lines.push('4. Exported SVG captures the fully completed target-state triangle composition with colors.');
  lines.push('');
  lines.push('Notes');
  lines.push('- Triangula exports intentionally skip preview PNG files.');
  lines.push('- Include instructions controls whether this file is exported.');

  return lines.join('\n');
}

function getExportGuideFileName(fileBaseName) {
  if (currentExperienceId === 'triangula') {
    return fileBaseName + '-triangula-instructions.txt';
  }
  return fileBaseName + '-stitching-guide.txt';
}

function buildExportGuideText(fileBaseName, options) {
  if (currentExperienceId === 'triangula') {
    return buildTriangulaGuideText(fileBaseName, options || {});
  }
  return buildStitchingGuideText(fileBaseName, options || {});
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
  var isTriangulaExport = currentExperienceId === 'triangula';
  var threadsRow = exportIncludeThreadsInput ? exportIncludeThreadsInput.closest('.modal-row') : null;
  var previewRow = exportIncludePreviewInput ? exportIncludePreviewInput.closest('.modal-row') : null;

  exportNameInput.value = 'curve_stitcher-' + getTimestampLabel();
  exportIncludeThreadsInput.checked = false;
  exportIncludeThreadsInput.disabled = isTriangulaExport;
  exportIncludeGuideInput.checked = true;
  exportIncludePreviewInput.checked = isTriangulaExport ? false : true;
  exportIncludePreviewInput.disabled = isTriangulaExport;
  if (threadsRow) {
    threadsRow.style.display = isTriangulaExport ? 'none' : '';
  }
  if (previewRow) {
    previewRow.style.display = isTriangulaExport ? 'none' : '';
  }
  exportOptionsModal.classList.add('open');
  exportNameInput.focus();
  exportNameInput.select();
}

function closeExportOptionsModal() {
  exportOptionsModal.classList.remove('open');
}

async function runExportFromModalSelection() {
  var isTriangulaExport = currentExperienceId === 'triangula';
  var baseName = normalizeExportBaseName(exportNameInput.value);
  var options = {
    includeThreads: isTriangulaExport ? false : exportIncludeThreadsInput.checked,
    includeGuide: exportIncludeGuideInput.checked,
    includePreview: isTriangulaExport ? false : exportIncludePreviewInput.checked
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

function drawHoles() {
  var numbersVisible = shouldShowHoleNumbersNow();
  var holeCount = parseInt(holesSlider.value, 10);
  if (!isFinite(holeCount)) holeCount = DEFAULT_HOLES;
  var fontSize = getHoleNumberFontSize(holeCount);
  var ccw = signedAreaOfClosedPolyline(points) > 0;
  holeNumberLabelsByIndex = Object.create(null);
  highlightedHoleNumbers = [];
  for (var i = 0; i < points.length; i++) {
    new Path.Circle(points[i], 3).fillColor = '#333';
    if (numbersVisible) {
      var outward = getOutwardDirectionAtHole(i, ccw);

      var label = new PointText(points[i]);
      label.justification = 'center';
      label.fillColor = '#555';
      label.fontSize = fontSize;
      label.fontWeight = 'normal';
      label.content = String(i + 1);

      var extent = getBoundsExtentAlongDirection(label, outward);
      var metrics = getHoleLabelOffsetFromExtent(extent, LABEL_BORDER_CLEARANCE, LABEL_HOLE_CLEARANCE);
      var minOffset = metrics.minOffset;
      var maxOffset = metrics.maxOffset;

      // If space is tight, reduce label size before final placement.
      if (maxOffset < minOffset) {
        var availableBand = BORDER_OUTER_GAP - (BORDER_STROKE_WIDTH * 0.5 + LABEL_BORDER_CLEARANCE) - (3 + LABEL_HOLE_CLEARANCE);
        var targetFont = Math.max(6, Math.min(label.fontSize, availableBand * 1.6));
        if (targetFont < label.fontSize) {
          label.fontSize = targetFont;
          extent = getBoundsExtentAlongDirection(label, outward);
          metrics = getHoleLabelOffsetFromExtent(extent, LABEL_BORDER_CLEARANCE, LABEL_HOLE_CLEARANCE);
          minOffset = metrics.minOffset;
          maxOffset = metrics.maxOffset;
        }
      }

      var clampedOffset = metrics.offset;
      if (maxOffset < minOffset) {
        // Recompute fallback offset against latest bounds when tight.
        clampedOffset = getHoleLabelOffsetFromExtent(extent, LABEL_BORDER_CLEARANCE, LABEL_HOLE_CLEARANCE).offset;
      }
      label.position = points[i].add(outward.multiply(clampedOffset));

      holeNumberLabelsByIndex[i] = label;
    }
  }
}

function bringHoleNumbersToFront() {
  if (!shouldShowHoleNumbersNow()) return;
  var children = project.activeLayer.children;
  var labels = [];
  for (var i = 0; i < children.length; i++) {
    if (children[i] instanceof PointText) {
      labels.push(children[i]);
    }
  }
  for (var j = 0; j < labels.length; j++) {
    labels[j].bringToFront();
  }
}

/* ------------------------------
   STATIC DRAW
------------------------------ */
function drawStatic() {
  if (currentExperienceId === 'triangula') {
    drawTriangulaStatic();
    return;
  }

  project.activeLayer.removeChildren();
  computePoints();

  // Border is a style-only layer for Stitching mode and should sit behind holes/threads.
  drawShapeBorder();

  // Draw holes
  drawHoles();

  // Draw threads
  for (var i = 0; i < threads.length; i++) {
    drawThread(threads[i]);
  }

  clearHighlightedHoleNumbers();
  bringHoleNumbersToFront();
}

/* ------------------------------
   ANIMATION
------------------------------ */
function runAnimationFrameTick(event) {
  if (!animationActive) return;

  if (!animationState || !animationState.segmentLists.length) {
    animationActive = false;
    view.onFrame = null;
    animationState = null;
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    clearHighlightedHoleNumbers();
    updateMusicPlaybackState();
    scheduleUrlStateSync(false);
    drawStatic();
    return;
  }

  // Clamp long frame gaps so a resumed tab or hitch cannot skip ahead visibly.
  var frameDelta = Math.min(event.delta, 0.1);
  animationState.elapsed += frameDelta;

  if (animationState.settle) {
    animationState.settle.remaining = Math.max(0, animationState.settle.remaining - frameDelta);
    if (animationState.settle.remaining <= 0) {
      animationState.settle = null;
    }
  }

  var secondsPerSegment = getAnimationSecondsPerSegment();

  while (animationState.elapsed >= secondsPerSegment && animationActive) {
    animationState.elapsed -= secondsPerSegment;

    var threadIndex = animationState.threadIndex;
    if (threadIndex < 0 || threadIndex >= threads.length) {
      animationActive = false;
      animationState = null;
      animationPlaybackState = 'idle';
      view.onFrame = null;
      syncAnimateButtonLabel();
      clearHighlightedHoleNumbers();
      updateMusicPlaybackState();
      scheduleUrlStateSync(false);
      drawStatic();
      return;
    }

    var segments = animationState.segmentLists[threadIndex] || [];

    if (animationState.step < segments.length) {
      animationState.settle = {
        threadIndex: threadIndex,
        segmentIndex: animationState.step,
        segments: segments,
        duration: STITCH_PULL_SETTLE_SECONDS,
        remaining: STITCH_PULL_SETTLE_SECONDS
      };
      animationState.step++;
    } else {
      animationState.threadIndex++;
      if (animationState.threadIndex >= threads.length) {
        animationActive = false;
        animationState = null;
        animationPlaybackState = 'idle';
        view.onFrame = null;
        syncAnimateButtonLabel();
        clearHighlightedHoleNumbers();
        updateMusicPlaybackState();
        scheduleUrlStateSync(false);
        drawStatic();
        return;
      }
      animationState.step = 0;
    }
  }

  renderAnimationFrame();
}

function startAnimationLoop() {
  view.onFrame = runAnimationFrameTick;
}

function animateStitch() {
  if (currentExperienceId === 'triangula') {
    animateTriangula();
    return;
  }

  // Always treat this as a fresh run, even if a prior animation is active.
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  triangulaAnimationState = null;
  clearHighlightedHoleNumbers();

  project.activeLayer.removeChildren();
  computePoints();

  animationState = {
    threadIndex: 0,
    step: 0,
    elapsed: 0,
    activeHolePair: null,
    settle: null,
    segmentLists: threads.map(function(thread) {
      return computeSegments(thread);
    })
  };
  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  renderAnimationFrame();
  startAnimationLoop();
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
  var container = document.getElementById('thread-controls');
  container.innerHTML = '';

  if (!threads.length) {
    selectedThreadIndex = -1;
    refreshKidThreadPicker();
    return;
  }
  if (selectedThreadIndex < 0 || selectedThreadIndex >= threads.length) {
    selectedThreadIndex = 0;
  }

  threads.forEach((thread, index) => {
    ensureThreadConnectConfig(thread);

    var div = document.createElement('div');
    div.className = 'thread-card' + (index === selectedThreadIndex ? ' selected' : '');

    var isFixedMode = thread.jumpMode === 'fixed';
    var isFormulaMode = thread.jumpMode === 'formula';
    var isSequenceMode = thread.jumpMode === 'sequence';
    var isConnectMode = thread.jumpMode === 'connect';

    div.innerHTML = `
      <strong>Thread ${index + 1}</strong><br>
      Color: <input type="color" value="${thread.color}" id="color-${index}"><br>
      Stitch by:
      <select id="jump-mode-${index}">
        <option value="fixed" ${thread.jumpMode === 'fixed' ? 'selected' : ''}>Addition</option>
        <option value="connect" ${thread.jumpMode === 'connect' ? 'selected' : ''}>Multiplication</option>
        <option value="sequence" ${thread.jumpMode === 'sequence' ? 'selected' : ''}>Step list</option>
        <option value="formula" ${thread.jumpMode === 'formula' ? 'selected' : ''}>Expression</option>
      </select><br>
      ${isFixedMode ? `
      Add by: <input class="advanced-inline-number" type="number" min="1" max="100" value="${thread.jump}" id="jump-number-${index}" aria-label="Thread ${index + 1} add value"><br>
      ` : ''}
      ${isFormulaMode ? `
      Base add: <input class="advanced-inline-number" type="number" min="1" max="100" value="${thread.jump}" id="jump-number-${index}" aria-label="Thread ${index + 1} base add value"><br>
      Step expression: <input type="text" value="${thread.jumpFormula || 'skip'}" id="jump-formula-${index}" placeholder="e.g. (skip + i) mod n"><br>
      <div class="jump-help">Use + - * /, ^ for powers, and mod for modulo.</div>
      <div class="jump-help">Vars: i (step), n (holes), current, prev, skip</div>
      <div class="jump-preset-row">
        <select id="jump-preset-${index}">
          <option value="">Preset formulas...</option>
          <option value="(skip + i) mod n">Growing spiral ((skip + i) mod n)</option>
          <option value="skip + (i mod 5)">Wobble (skip + (i mod 5))</option>
          <option value="skip × ((i mod 3) + 1)">Pulse (skip × ((i mod 3) + 1))</option>
          <option value="(current mod 7) + skip">Current-based ((current mod 7) + skip)</option>
        </select>
        <button type="button" id="use-preset-${index}">Use</button>
      </div>
      ` : ''}
      ${isSequenceMode ? `
      Step list: <input type="text" value="${thread.jumpSequence || ''}" id="jump-sequence-${index}" placeholder="e.g. 2,3,5,8"><br>
      <div class="jump-help">Comma-separated steps, e.g. 2, 3, 5, 8</div>
      ` : ''}
      ${isConnectMode ? `
      Multiply by: <input class="advanced-inline-number" type="number" min="1" max="12" value="${thread.connectMultiplier}" id="connect-m-number-${index}" aria-label="Thread ${index + 1} multiply value"><br>
      Offset (add-on): <input class="advanced-inline-number" type="number" min="0" max="140" value="${thread.connectOffset}" id="connect-offset-number-${index}" aria-label="Thread ${index + 1} offset value"><br>
      <div class="jump-help">For each hole i, connect to (multiplier × i + offset) mod n.</div>
      <div class="jump-preset-row">
        <select id="connect-preset-${index}">
          <option value="">Preset multiplier...</option>
          <option value="2,0">Cardioid (m=2, offset=0)</option>
          <option value="3,0">Nephroid (m=3, offset=0)</option>
          <option value="4,0">Times 4 (m=4, offset=0)</option>
        </select>
        <button type="button" id="use-connect-preset-${index}">Use</button>
      </div>
      ` : ''}
      Size: <input class="advanced-inline-number" type="number" min="1" max="10" value="${thread.width}" id="width-number-${index}" aria-label="Thread ${index + 1} size value"><br>
      Rainbow: <input type="checkbox" id="rainbow-${index}" ${thread.color === 'rainbow' ? 'checked' : ''}><br>
      <button id="delete-${index}">Delete</button>
    `;

    container.appendChild(div);

    div.addEventListener('click', (event) => {
      if (event.target.closest('input, select, button')) return;
      selectedThreadIndex = index;
      renderThreadControls();
      syncKidControlsFromSelectedThread();
    });

    document.getElementById(`color-${index}`).addEventListener('input', e => {
      var profile = getExperienceUiProfile(currentExperienceId);
      var paletteMode = profile && profile.paletteMode ? profile.paletteMode : 'thread';
      if (paletteMode === 'triangula-banded' && index === 0) {
        applyExperiencePaletteColorChoice(e.target.value);
      } else {
        thread.color = e.target.value;
      }
      syncKidControlsFromSelectedThread();
      redrawAnimationInPlace();
    });

    var skipNumberInput = document.getElementById(`jump-number-${index}`);
    if (skipNumberInput) {
      skipNumberInput.addEventListener('input', e => {
        if (e.target.value === '') return;
        thread.jump = parseBoundedInt(e.target.value, 1, 100, thread.jump || 1);
        e.target.value = String(thread.jump);
        if (index === getKidTargetThreadIndex()) {
          jumpSlider.value = thread.jump;
          updateKidControlValues();
        }
        redrawForPathChange();
      });
      skipNumberInput.addEventListener('change', e => {
        thread.jump = parseBoundedInt(e.target.value, 1, 100, thread.jump || 1);
        e.target.value = String(thread.jump);
      });
    }

    document.getElementById(`jump-mode-${index}`).addEventListener('change', e => {
      thread.jumpMode = e.target.value;
      renderThreadControls();
      redrawForPathChange();
    });

    var formulaInput = document.getElementById(`jump-formula-${index}`);
    if (formulaInput) {
      formulaInput.addEventListener('input', e => {
        thread.jumpFormula = e.target.value;
        if (thread.jumpMode === 'formula') {
          redrawForPathChange();
        }
      });
    }

    var usePresetBtn = document.getElementById(`use-preset-${index}`);
    if (usePresetBtn) {
      usePresetBtn.addEventListener('click', () => {
        var preset = document.getElementById(`jump-preset-${index}`).value;
        if (!preset) return;
        thread.jumpFormula = preset;
        thread.jumpMode = 'formula';
        renderThreadControls();
        redrawForPathChange();
      });
    }

    var sequenceInput = document.getElementById(`jump-sequence-${index}`);
    if (sequenceInput) {
      sequenceInput.addEventListener('input', e => {
        thread.jumpSequence = e.target.value;
        if (thread.jumpMode === 'sequence') {
          redrawForPathChange();
        }
      });
    }

    var connectMultiplierNumberInput = document.getElementById(`connect-m-number-${index}`);
    if (connectMultiplierNumberInput) {
      connectMultiplierNumberInput.addEventListener('input', e => {
        if (e.target.value === '') return;
        thread.connectMultiplier = parseBoundedInt(e.target.value, 1, 12, thread.connectMultiplier || 1);
        e.target.value = String(thread.connectMultiplier);
        if (index === getKidTargetThreadIndex()) {
          syncKidControlsFromSelectedThread();
        }
        redrawForPathChange();
      });
      connectMultiplierNumberInput.addEventListener('change', e => {
        thread.connectMultiplier = parseBoundedInt(e.target.value, 1, 12, thread.connectMultiplier || 1);
        e.target.value = String(thread.connectMultiplier);
      });
    }

    var connectOffsetNumberInput = document.getElementById(`connect-offset-number-${index}`);
    if (connectOffsetNumberInput) {
      connectOffsetNumberInput.addEventListener('input', e => {
        if (e.target.value === '') return;
        thread.connectOffset = parseBoundedInt(e.target.value, 0, MAX_HOLES, thread.connectOffset || 0);
        e.target.value = String(thread.connectOffset);
        if (index === getKidTargetThreadIndex()) {
          syncKidControlsFromSelectedThread();
        }
        redrawForPathChange();
      });
      connectOffsetNumberInput.addEventListener('change', e => {
        thread.connectOffset = parseBoundedInt(e.target.value, 0, MAX_HOLES, thread.connectOffset || 0);
        e.target.value = String(thread.connectOffset);
      });
    }

    var useConnectPresetBtn = document.getElementById(`use-connect-preset-${index}`);
    if (useConnectPresetBtn) {
      useConnectPresetBtn.addEventListener('click', () => {
        var raw = document.getElementById(`connect-preset-${index}`).value;
        if (!raw) return;
        var parts = raw.split(',');
        if (parts.length !== 2) return;
        thread.jumpMode = 'connect';
        thread.connectMultiplier = parseInt(parts[0], 10);
        thread.connectOffset = parseInt(parts[1], 10);
        renderThreadControls();
        syncKidControlsFromSelectedThread();
        redrawForPathChange();
      });
    }

    var widthNumberInput = document.getElementById(`width-number-${index}`);
    if (widthNumberInput) {
      widthNumberInput.addEventListener('input', e => {
        if (e.target.value === '') return;
        thread.width = parseBoundedInt(e.target.value, 1, 10, thread.width || 1);
        e.target.value = String(thread.width);
        if (index === getKidTargetThreadIndex()) {
          widthSlider.value = thread.width;
          updateKidControlValues();
        }
        redrawAnimationInPlace();
      });
      widthNumberInput.addEventListener('change', e => {
        thread.width = parseBoundedInt(e.target.value, 1, 10, thread.width || 1);
        e.target.value = String(thread.width);
      });
    }

    document.getElementById(`rainbow-${index}`).addEventListener('change', e => {
      thread.color = e.target.checked ? 'rainbow' : '#000000';
      syncKidControlsFromSelectedThread();
      redrawAnimationInPlace();
    });

    document.getElementById(`delete-${index}`).addEventListener('click', () => {
      threads.splice(index, 1);
      if (!threads.length) {
        selectedThreadIndex = -1;
      } else if (selectedThreadIndex >= threads.length) {
        selectedThreadIndex = threads.length - 1;
      }
      renderThreadControls();
      syncKidControlsFromSelectedThread();
      redrawForPathChange();
    });
  });

  syncKidControlsFromSelectedThread();
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
  normalizeTriangulaFillColor: normalizeTriangulaFillColor,
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
  var initialExperience = resolveExperienceId(initialParams.get('e')) || 'stitching';
  EXPERIENCE_BEHAVIOR.setCurrentExperience(initialExperience, { suppressUrlSync: true });
  setCurrentShape(sanitizeShape(initialParams.get('sh'), currentShape), false);
} else {
  EXPERIENCE_BEHAVIOR.setCurrentExperience('stitching');
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

