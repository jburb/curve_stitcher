var APP_STATE_URL_VERSION = '2';
var URL_STATE_PARAM_KEYS = Object.freeze({
  version: 'version',
  experienceId: 'experience',
  stitchingShape: 'stitchingShape',
  bpm: 'bpm',
  musicMuted: 'musicMuted',
  songId: 'song',
  stitchingShowHoleNumbers: 'stitchingShowHoleNumbers',
  stitchingBorderEnabled: 'stitchingBorderEnabled',
  stitchingHoles: 'stitchingHoles',
  stitchingNestedFrameEnabled: 'stitchingNestedFrameEnabled',
  stitchingNestedFrameRatio: 'stitchingNestedFrameRatio',
  stitchingSelectedThreadIndex: 'stitchingSelectedThreadIndex',
  stitchingThreadState: 'stitchingThreadState',
  stitchingThreadColors: 'stitchingThreadColors',
  triangulaSourceColor: 'triangulaSourceColor',
  triangulaColorMode: 'triangulaColorMode',
  triangulaConstructionMode: 'triangulaConstructionMode',
  triangulaStartCount: 'triangulaStartCount',
  triangulaTargetCount: 'triangulaTargetCount',
  triangulaFractalMode: 'triangulaFractalMode',
  triangulaFitMode: 'triangulaFitMode',
  triangulaBand1Color: 'triangulaBand1Color',
  triangulaBand2Color: 'triangulaBand2Color',
  triangulaBand4Color: 'triangulaBand4Color',
  squarusOrder: 'squarusOrder',
  squarusLayout: 'squarusLayout',
  squarusAnimationMode: 'squarusAnimationMode',
  squarusContactMode: 'squarusContactMode',
  squarusPieceCount: 'squarusPieceCount',
  squarusSequenceSeed: 'squarusSequenceSeed',
  mashrabiyaFold: 'mashrabiyaFold',
  mashrabiyaGeometryMode: 'mashrabiyaGeometryMode',
  mashrabiyaStarColor: 'mashrabiyaStarColor',
  mashrabiyaPetalColor: 'mashrabiyaPetalColor',
  mashrabiyaPointColor: 'mashrabiyaPointColor',
  mashrabiyaFillBorderWidth: 'mashrabiyaFillBorderWidth',
  mashrabiyaKeepConstructionLines: 'mashrabiyaKeepConstructionLines'
});
var URL_SYNC_DEBOUNCE_MS = 800;
var TRIANGULA_DRAWABLE_COUNTS = [1, 3, 9, 27, 81, 243, 729];
var urlSyncTimer = null;
var urlSyncSuspended = false;
var appState = {
  version: APP_STATE_URL_VERSION,
  experienceId: 'stitching',
  common: {
    shape: 'circle',
    bpm: currentAnimationBpm,
    musicMuted: false,
    songId: 'bach'
  },
  stitching: {
    holes: DEFAULT_HOLES,
    nestedFrameEnabled: false,
    nestedFrameRatio: DEFAULT_NESTED_FRAME_RATIO,
    selectedThreadIndex: 0,
    showHoleNumbers: true,
    borderEnabled: true,
    threadColors: ['#1982c4'],
    threadState: ''
  },
  triangula: {
    colorMode: 'band-1',
    constructionMode: 'shrink-duplicate',
    startCount: 1,
    targetCount: 27,
    fractalMode: 'series',
    fitMode: 'locked',
    sourceColor: '#8ac926',
    band1Color: '#8ac926',
    band2Color: '#6a4c93',
    band4Color: '#8ac926'
  },
  squarus: {
    order: 4,
    layout: 'grid-packing',
    animationMode: 'sequential',
    contactMode: 'formula-only',
    pieceCount: null,
    sequenceSeed: 0
  },
  mashrabiya: {
    fold: 12,
    geometryMode: 'stitch-vertex',
    starColor: '#f4d35e',
    petalColor: '#ee964b',
    pointColor: '#f95738',
    fillBorderWidth: 2,
    keepConstructionLines: false
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

function setUrlStateParam(params, logicalKey, value) {
  var key = URL_STATE_PARAM_KEYS[logicalKey];
  if (!key) return;
  params.set(key, value);
}

function getUrlStateParam(params, logicalKey) {
  var key = URL_STATE_PARAM_KEYS[logicalKey];
  if (key && params.has(key)) return params.get(key);
  return null;
}

function hasUrlStateKey(params, logicalKey) {
  var key = URL_STATE_PARAM_KEYS[logicalKey];
  return !!(key && params.has(key));
}

function getDiscoveryKeyForExperience(experienceId) {
  var resolved = resolveExperienceId(experienceId);
  if (resolved === 'triangula') return 'triangle';
  if (resolved === 'squarus') return 'square';
  if (resolved === 'mashrabiya') return 'rosette12';
  return null;
}

function normalizeTriangulaDrawableCount(value, role, fallback) {
  var parsed = parseBoundedInt(value, 1, 729, fallback);
  if (!isFinite(parsed)) {
    parsed = parseBoundedInt(fallback, 1, 729, 1);
  }

  if (TRIANGULA_DRAWABLE_COUNTS.indexOf(parsed) !== -1) {
    return parsed;
  }

  if (role === 'target') {
    for (var i = 0; i < TRIANGULA_DRAWABLE_COUNTS.length; i++) {
      if (TRIANGULA_DRAWABLE_COUNTS[i] >= parsed) {
        return TRIANGULA_DRAWABLE_COUNTS[i];
      }
    }
    return TRIANGULA_DRAWABLE_COUNTS[TRIANGULA_DRAWABLE_COUNTS.length - 1];
  }

  // Default/start behavior: snap downward to avoid overshooting requested start density.
  for (var j = TRIANGULA_DRAWABLE_COUNTS.length - 1; j >= 0; j--) {
    if (TRIANGULA_DRAWABLE_COUNTS[j] <= parsed) {
      return TRIANGULA_DRAWABLE_COUNTS[j];
    }
  }

  return TRIANGULA_DRAWABLE_COUNTS[0];
}

function sanitizeTriangulaCount(value, fallback, role) {
  return normalizeTriangulaDrawableCount(value, role, fallback);
}

function getTriangulaCountIndexFromValue(value, role, fallback) {
  var normalized = normalizeTriangulaDrawableCount(value, role, fallback);
  var index = TRIANGULA_DRAWABLE_COUNTS.indexOf(normalized);
  if (index === -1) return 0;
  return index;
}

function getTriangulaCountFromSliderIndex(indexValue, role, fallback) {
  var fallbackIndex = getTriangulaCountIndexFromValue(fallback, role, fallback);
  var index = parseBoundedInt(indexValue, 0, TRIANGULA_DRAWABLE_COUNTS.length - 1, fallbackIndex);
  return TRIANGULA_DRAWABLE_COUNTS[index];
}

function sanitizeTriangulaColorMode(value, fallback) {
  var allowed = ['band-1', 'band-2', 'band-4'];
  if (allowed.indexOf(value) === -1) return fallback;
  return value;
}

function sanitizeTriangulaConstructionMode(value, fallback) {
  if (value !== 'cut' && value !== 'shrink-duplicate') return fallback;
  return value;
}

function sanitizeTriangulaFractalMode(value, fallback) {
  if (value !== 'parallel' && value !== 'series') return fallback;
  return value;
}

function sanitizeTriangulaFitMode(value, fallback) {
  if (value !== 'dynamic' && value !== 'locked') return fallback;
  return value;
}

function sanitizeSquarusLayout(value, fallback) {
  var allowed = [
    'grid-packing',
    'hilbert-curve',
    'symmetry-d4',
    'spiral-packing',
    'circle-packing',
    'radial-tree',
    'force-directed'
  ];
  if (allowed.indexOf(value) === -1) return fallback;
  return value;
}

function sanitizeSquarusAnimationMode(value, fallback) {
  if (value !== 'parallel' && value !== 'sequential') return fallback;
  return value;
}

function sanitizeSquarusContactMode(value, fallback) {
  if (value !== 'connected-touch' && value !== 'formula-only') return fallback;
  return value;
}

function sanitizeMashrabiyaFold(value, fallback) {
  var parsed = parseBoundedInt(value, 8, 12, fallback);
  var allowed = [8, 12];
  if (allowed.indexOf(parsed) === -1) {
    return allowed.indexOf(fallback) !== -1 ? fallback : 12;
  }
  return parsed;
}

function sanitizeMashrabiyaGeometryMode(value, fallback) {
  return 'stitch-vertex';
}

function sanitizeMashrabiyaFillBorderWidth(value, fallback) {
  return parseBoundedInt(value, 0, 3, parseBoundedInt(fallback, 0, 3, 0));
}

function getSquarusSequenceDomainSize(orderRef) {
  var order = parseBoundedInt(orderRef, 1, 6, squarusOrder);
  if (order <= 4) {
    var pieceCount = getSquarusTotalPiecesForOrder(order);
    var total = 1;
    for (var i = 2; i <= pieceCount; i++) {
      total *= i;
    }
    return Math.max(1, total);
  }
  return 1000;
}

function getSquarusSequenceMaxIndex(orderRef) {
  return Math.max(0, getSquarusSequenceDomainSize(orderRef) - 1);
}

function normalizeSquarusSequenceSeed(value, fallback, orderRef) {
  var maxIndex = getSquarusSequenceMaxIndex(orderRef);
  return parseBoundedInt(value, 0, maxIndex, parseBoundedInt(fallback, 0, maxIndex, 0));
}

function getSquarusTotalPiecesForOrder(order) {
  return getSquarusPolyominoes(parseBoundedInt(order, 1, 6, squarusOrder)).length;
}

function normalizeSquarusPieceCount(value, fallback, orderRef) {
  var order = parseBoundedInt(orderRef, 1, 6, squarusOrder);
  var total = getSquarusTotalPiecesForOrder(order);
  var defaultValue = isFinite(fallback) ? fallback : total;
  return parseBoundedInt(value, 0, total, defaultValue);
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

function sanitizeBooleanValue(value, fallback) {
  if (value === true || value === false) return value;
  return !!sanitizeBooleanParam(value, fallback);
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

function sanitizeThreadSolidColor(value, fallback) {
  var fallbackColor = sanitizeHexColor(fallback, '#1982c4');
  if (fallbackColor === 'rainbow') {
    fallbackColor = '#1982c4';
  }
  var normalized = sanitizeHexColor(value, fallbackColor);
  if (normalized === 'rainbow') {
    return fallbackColor;
  }
  return normalized;
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
  var allowed = ['fixed', 'connect', 'sequence'];
  if (isExpressionStitchModeEnabled()) {
    allowed.push('formula');
  }
  if (allowed.indexOf(value) === -1) {
    return allowed.indexOf(fallback) !== -1 ? fallback : 'fixed';
  }
  return value;
}

function sanitizeThreadSequenceMode(value, fallback) {
  var allowed = ['holes', 'steps'];
  if (allowed.indexOf(value) === -1) {
    return allowed.indexOf(fallback) !== -1 ? fallback : 'holes';
  }
  return value;
}

function sanitizeNestedFrameRatio(value, fallback) {
  var parsed = Number(value);
  if (!isFinite(parsed) || NESTED_FRAME_RATIO_OPTIONS.indexOf(parsed) === -1) {
    return NESTED_FRAME_RATIO_OPTIONS.indexOf(fallback) !== -1 ? fallback : DEFAULT_NESTED_FRAME_RATIO;
  }
  return parsed;
}

function sanitizeThreadFrameMode(value, fallback) {
  var allowed = ['outer', 'inner', 'bridge', 'bridge-reverse', 'bridge-reverse-project'];
  if (allowed.indexOf(value) === -1) {
    return allowed.indexOf(fallback) !== -1 ? fallback : 'outer';
  }
  return value;
}

function sanitizeThreadDescriptor(raw, fallback) {
  fallback = fallback || {
    jump: DEFAULT_SKIP,
    width: DEFAULT_THREAD_SIZE,
    color: '#1982c4',
    solidColor: '#1982c4',
    startHole: 1,
    jumpMode: 'fixed',
    jumpFormula: 'skip',
    jumpSequence: '',
    jumpSequenceMode: 'holes',
    connectMultiplier: 2,
    connectOffset: 0,
    frameMode: 'outer'
  };

  raw = raw || {};
  var jumpMode = sanitizeThreadJumpMode(raw.m || raw.jumpMode, fallback.jumpMode || 'fixed');
  var thread = {
    jump: parseBoundedInt(raw.j != null ? raw.j : raw.jump, 1, MAX_HOLES - 1, fallback.jump || DEFAULT_SKIP),
    width: parseBoundedInt(raw.w != null ? raw.w : raw.width, 1, 10, fallback.width || DEFAULT_THREAD_SIZE),
    color: sanitizeThreadColor(raw.c != null ? raw.c : raw.color, fallback.color || '#1982c4'),
    startHole: parseBoundedInt(raw.sh != null ? raw.sh : raw.startHole, 1, MAX_HOLES, fallback.startHole || 1),
    sequence: null,
    jumpMode: jumpMode,
    jumpFormula: String(raw.f != null ? raw.f : (raw.jumpFormula != null ? raw.jumpFormula : (fallback.jumpFormula || 'skip'))),
    jumpSequence: String(raw.s != null ? raw.s : (raw.jumpSequence != null ? raw.jumpSequence : (fallback.jumpSequence || ''))),
    jumpSequenceMode: sanitizeThreadSequenceMode(raw.sm != null ? raw.sm : raw.jumpSequenceMode, fallback.jumpSequenceMode || 'holes'),
    connectMultiplier: parseBoundedInt(raw.cm != null ? raw.cm : raw.connectMultiplier, 1, 12, fallback.connectMultiplier || 2),
    connectOffset: parseBoundedInt(raw.co != null ? raw.co : raw.connectOffset, 0, MAX_HOLES, fallback.connectOffset || 0),
    frameMode: sanitizeThreadFrameMode(raw.fm != null ? raw.fm : raw.frameMode, fallback.frameMode || 'outer'),
    solidColor: sanitizeThreadSolidColor(raw.sc != null ? raw.sc : raw.solidColor, fallback.solidColor || fallback.color || '#1982c4')
  };

  if (thread.color !== 'rainbow') {
    thread.solidColor = sanitizeThreadSolidColor(thread.color, thread.solidColor || '#1982c4');
  }

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
      j: parseBoundedInt(thread.jump, 1, MAX_HOLES - 1, DEFAULT_SKIP),
      w: parseBoundedInt(thread.width, 1, 10, DEFAULT_THREAD_SIZE),
      c: sanitizeThreadColor(thread.color, '#1982c4'),
      sh: parseBoundedInt(thread.startHole, 1, MAX_HOLES, 1),
      m: sanitizeThreadJumpMode(thread.jumpMode, 'fixed'),
      f: String(thread.jumpFormula || 'skip'),
      s: String(thread.jumpSequence || ''),
      sm: sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes'),
      cm: parseBoundedInt(thread.connectMultiplier, 1, 12, 2),
      co: parseBoundedInt(thread.connectOffset, 0, MAX_HOLES, 0),
      fm: sanitizeThreadFrameMode(thread.frameMode, 'outer'),
      sc: sanitizeThreadSolidColor(thread.solidColor, thread.color === 'rainbow' ? '#1982c4' : thread.color)
    };
  });

  if (!compact.length) {
    compact.push({
      j: DEFAULT_SKIP,
      w: DEFAULT_THREAD_SIZE,
      c: '#1982c4',
      sh: 1,
      m: 'fixed',
      f: 'skip',
      s: '',
      sm: 'holes',
      cm: 2,
      co: 0,
      fm: 'outer',
      sc: '#1982c4'
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

function buildStitchingStateSnapshotFromRuntime() {
  var defaultThread = sanitizeThreadDescriptor({}, null);
  var sourceThreads = (threads && threads.length) ? threads : [defaultThread];
  var sanitizedThreads = sourceThreads.map(function(thread) {
    return sanitizeThreadDescriptor(thread, defaultThread);
  });
  var maxIndex = Math.max(0, sanitizedThreads.length - 1);
  var snapshotShape = sanitizeShape(stitchingFrameShape, 'circle');
  return {
    shape: snapshotShape,
    holes: parseBoundedInt(holesSlider && holesSlider.value, 3, MAX_HOLES, DEFAULT_HOLES),
    nestedFrameEnabled: !!nestedFrameEnabled,
    nestedFrameRatio: sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO),
    selectedThreadIndex: parseBoundedInt(selectedThreadIndex, 0, maxIndex, 0),
    showHoleNumbers: !!showHoleNumbers,
    borderEnabled: !!borderEnabled,
    threadState: serializeStitchingThreadState(sanitizedThreads)
  };
}

function normalizeStitchingStateSnapshot(raw, fallback) {
  var base = fallback || buildStitchingStateSnapshotFromRuntime();
  raw = raw || {};
  var normalizedShape = sanitizeShape(raw.shape, base.shape);
  var normalizedHoles = parseBoundedInt(raw.holes, 3, MAX_HOLES, base.holes);
  var normalizedNestedFrameEnabled = !!sanitizeBooleanParam(raw.nestedFrameEnabled, base.nestedFrameEnabled);
  var normalizedNestedFrameRatio = sanitizeNestedFrameRatio(raw.nestedFrameRatio, base.nestedFrameRatio);
  var normalizedShowHoleNumbers = !!sanitizeBooleanParam(raw.showHoleNumbers, base.showHoleNumbers);
  var normalizedBorderEnabled = !!sanitizeBooleanParam(raw.borderEnabled, base.borderEnabled);
  var parsedThreads = parseStitchingThreadState(raw.threadState, parseStitchingThreadState(base.threadState, [sanitizeThreadDescriptor({}, null)]));
  if (!parsedThreads.length) {
    parsedThreads = [sanitizeThreadDescriptor({}, null)];
  }
  var normalizedSelectedThreadIndex = parseBoundedInt(raw.selectedThreadIndex, 0, parsedThreads.length - 1, base.selectedThreadIndex);
  return {
    shape: normalizedShape,
    holes: normalizedHoles,
    nestedFrameEnabled: normalizedNestedFrameEnabled,
    nestedFrameRatio: normalizedNestedFrameRatio,
    selectedThreadIndex: normalizedSelectedThreadIndex,
    showHoleNumbers: normalizedShowHoleNumbers,
    borderEnabled: normalizedBorderEnabled,
    threadState: serializeStitchingThreadState(parsedThreads)
  };
}

function persistStitchingStateCache(snapshot) {
  var normalized = normalizeStitchingStateSnapshot(snapshot, buildStitchingStateSnapshotFromRuntime());
  stitchingStateCache = normalized;
  stitchingFrameShape = sanitizeShape(normalized.shape, stitchingFrameShape || 'circle');
  stitchingStateSnapshotAvailable = true;
  try {
    appStateStorage.setItem(STITCHING_STATE_CACHE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Ignore persistence failures; in-memory state still works during session.
  }
}

function hydrateStitchingStateCacheFromStorage() {
  if (stitchingStateCache) return stitchingStateCache;
  var fallback = buildStitchingStateSnapshotFromRuntime();
  var raw = appStateStorage.getItem(STITCHING_STATE_CACHE_KEY);
  if (!raw) {
    stitchingStateCacheLoadedFromStorage = false;
    stitchingStateSnapshotAvailable = false;
    stitchingStateCache = fallback;
    return stitchingStateCache;
  }
  try {
    var parsed = JSON.parse(raw);
    stitchingStateCache = normalizeStitchingStateSnapshot(parsed, fallback);
    stitchingStateCacheLoadedFromStorage = true;
    stitchingStateSnapshotAvailable = true;
  } catch (error) {
    stitchingStateCacheLoadedFromStorage = false;
    stitchingStateSnapshotAvailable = false;
    stitchingStateCache = fallback;
  }
  return stitchingStateCache;
}

function getPreferredStitchingShapeFromHydration(params, fallbackShape) {
  var cachedState = hydrateStitchingStateCacheFromStorage();
  var cacheShape = sanitizeShape(cachedState && cachedState.shape, fallbackShape || 'circle');
  if (stitchingStateSnapshotAvailable) {
    return cacheShape;
  }
  return sanitizeShape(getUrlStateParam(params, 'stitchingShape'), cacheShape);
}

function buildExperiencePlaybackStateFallback() {
  var stitchingSong = 'bach';
  var triangulaSong = 'triangle';
  var squarusSong = 'square';
  var mashrabiyaSong = 'rosette';
  return {
    stitching: {
      songId: stitchingSong,
      bpm: getKidTempoPresetsForSong(stitchingSong).slow || DEFAULT_ANIMATION_BPM
    },
    triangula: {
      songId: triangulaSong,
      bpm: getKidTempoPresetsForSong(triangulaSong).slow || DEFAULT_ANIMATION_BPM
    },
    squarus: {
      songId: squarusSong,
      bpm: getKidTempoPresetsForSong(squarusSong).slow || DEFAULT_ANIMATION_BPM
    },
    mashrabiya: {
      songId: mashrabiyaSong,
      bpm: getKidTempoPresetsForSong(mashrabiyaSong).slow || DEFAULT_ANIMATION_BPM
    }
  };
}

function normalizePlaybackEntry(rawEntry, fallbackSongId) {
  var songId = sanitizeSongId(rawEntry && rawEntry.songId, fallbackSongId);
  var allowedTempos = getTempoOptionsForSong(songId);
  var fallbackBpm = getKidTempoPresetsForSong(songId).slow || DEFAULT_ANIMATION_BPM;
  var bpm = parseBoundedInt(rawEntry && rawEntry.bpm, 1, 2000, fallbackBpm);
  if (allowedTempos.indexOf(bpm) === -1) {
    bpm = fallbackBpm;
  }
  return {
    songId: songId,
    bpm: bpm
  };
}

function persistExperiencePlaybackStateCache(snapshot) {
  var normalized = snapshot || hydrateExperiencePlaybackStateCacheFromStorage();
  experiencePlaybackStateCache = normalized;
  try {
    appStateStorage.setItem(EXPERIENCE_PLAYBACK_STATE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Ignore persistence failures; runtime cache still works.
  }
}

function hydrateExperiencePlaybackStateCacheFromStorage() {
  if (experiencePlaybackStateCache) return experiencePlaybackStateCache;
  var fallback = buildExperiencePlaybackStateFallback();
  var raw = appStateStorage.getItem(EXPERIENCE_PLAYBACK_STATE_KEY);
  if (!raw) {
    experiencePlaybackStateCache = fallback;
    return experiencePlaybackStateCache;
  }
  try {
    var parsed = JSON.parse(raw);
    experiencePlaybackStateCache = {
      stitching: normalizePlaybackEntry(parsed.stitching, fallback.stitching.songId),
      triangula: normalizePlaybackEntry(parsed.triangula, fallback.triangula.songId),
      squarus: normalizePlaybackEntry(parsed.squarus, fallback.squarus.songId),
      mashrabiya: normalizePlaybackEntry(parsed.mashrabiya, fallback.mashrabiya.songId)
    };
  } catch (error) {
    experiencePlaybackStateCache = fallback;
  }
  return experiencePlaybackStateCache;
}

function recordCurrentExperiencePlaybackPreference() {
  var experienceId = resolveExperienceId(currentExperienceId);
  if (!experienceId) return;
  var playbackState = hydrateExperiencePlaybackStateCacheFromStorage();
  var fallbackSong = sanitizeSongId(getDefaultSongIdForExperience(experienceId), 'bach');
  playbackState[experienceId] = normalizePlaybackEntry(
    {
      songId: currentSongId,
      bpm: currentAnimationBpm
    },
    fallbackSong
  );
  persistExperiencePlaybackStateCache(playbackState);
}

function getPreferredPlaybackForExperience(experienceId) {
  var resolvedExperienceId = resolveExperienceId(experienceId) || 'stitching';
  var fallbackSong = sanitizeSongId(getDefaultSongIdForExperience(resolvedExperienceId), 'bach');
  var playbackState = hydrateExperiencePlaybackStateCacheFromStorage();
  var preferred = normalizePlaybackEntry(playbackState[resolvedExperienceId], fallbackSong);
  return preferred;
}

function syncStitchingStateCacheFromRuntime() {
  if (currentExperienceId !== 'stitching') return;
  persistStitchingStateCache(buildStitchingStateSnapshotFromRuntime());
}

function restoreStitchingStateFromCache() {
  var snapshot = hydrateStitchingStateCacheFromStorage();
  if (!snapshot) return false;
  var normalized = normalizeStitchingStateSnapshot(snapshot, buildStitchingStateSnapshotFromRuntime());
  var restoredThreads = parseStitchingThreadState(normalized.threadState, [sanitizeThreadDescriptor({}, null)]);
  if (!restoredThreads.length) {
    restoredThreads = [sanitizeThreadDescriptor({}, null)];
  }

  threads = restoredThreads.map(function(thread) {
    return sanitizeThreadDescriptor(thread, thread);
  });
  selectedThreadIndex = parseBoundedInt(normalized.selectedThreadIndex, 0, threads.length - 1, 0);
  showHoleNumbers = !!normalized.showHoleNumbers;
  borderEnabled = !!normalized.borderEnabled;
  nestedFrameEnabled = !!normalized.nestedFrameEnabled;
  nestedFrameRatio = sanitizeNestedFrameRatio(normalized.nestedFrameRatio, nestedFrameRatio);
  holesSlider.value = String(parseBoundedInt(normalized.holes, 3, MAX_HOLES, DEFAULT_HOLES));
  if (advancedHolesNumberInput) {
    advancedHolesNumberInput.value = holesSlider.value;
  }

  stitchingFrameShape = sanitizeShape(normalized.shape, stitchingFrameShape || 'circle');
  setCurrentShape(stitchingFrameShape, false);
  renderThreadControls();
  syncKidControlsFromSelectedThread();
  updateKidControlValues();
  syncNestedFrameControls();
  syncHoleNumberToggles();
  syncBorderControls();

  persistStitchingStateCache(normalized);
  return true;
}

function buildTriangulaStateSnapshotFromRuntime() {
  return {
    colorMode: sanitizeTriangulaColorMode(triangulaColorMode, 'band-1'),
    constructionMode: sanitizeTriangulaConstructionMode(triangulaConstructionMode, 'shrink-duplicate'),
    startCount: sanitizeTriangulaCount(triangulaStartCount, 1, 'start'),
    targetCount: sanitizeTriangulaCount(triangulaTargetCount, 27, 'target'),
    fractalMode: sanitizeTriangulaFractalMode(triangulaFractalMode, 'series'),
    fitMode: sanitizeTriangulaFitMode(triangulaFitMode, 'locked'),
    sourceColor: sanitizeThreadColor(triangulaSourceColor, '#8ac926'),
    band1Color: sanitizeHexColor(triangulaBandColors.band1, '#8ac926'),
    band2Color: sanitizeHexColor(triangulaBandColors.band2, '#6a4c93'),
    band4Color: sanitizeHexColor(triangulaBandColors.band4, '#8ac926')
  };
}

function persistTriangulaStateCache(snapshot) {
  var normalized = snapshot || buildTriangulaStateSnapshotFromRuntime();
  triangulaStateCache = normalized;
  try {
    appStateStorage.setItem(TRIANGULA_STATE_CACHE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Ignore persistence failures; runtime cache still works.
  }
}

function hydrateTriangulaStateCacheFromStorage() {
  if (triangulaStateCache) return triangulaStateCache;
  var fallback = buildTriangulaStateSnapshotFromRuntime();
  var raw = appStateStorage.getItem(TRIANGULA_STATE_CACHE_KEY);
  if (!raw) {
    triangulaStateCache = fallback;
    return triangulaStateCache;
  }
  try {
    var parsed = JSON.parse(raw);
    triangulaStateCache = {
      colorMode: sanitizeTriangulaColorMode(parsed.colorMode, fallback.colorMode),
      constructionMode: sanitizeTriangulaConstructionMode(parsed.constructionMode, fallback.constructionMode),
      startCount: sanitizeTriangulaCount(parsed.startCount, fallback.startCount, 'start'),
      targetCount: sanitizeTriangulaCount(parsed.targetCount, fallback.targetCount, 'target'),
      fractalMode: sanitizeTriangulaFractalMode(parsed.fractalMode, fallback.fractalMode),
      fitMode: sanitizeTriangulaFitMode(parsed.fitMode, fallback.fitMode),
      sourceColor: sanitizeThreadColor(parsed.sourceColor, fallback.sourceColor),
      band1Color: sanitizeHexColor(parsed.band1Color, fallback.band1Color),
      band2Color: sanitizeHexColor(parsed.band2Color, fallback.band2Color),
      band4Color: sanitizeHexColor(parsed.band4Color, fallback.band4Color)
    };
  } catch (error) {
    triangulaStateCache = fallback;
  }
  if (triangulaStateCache.targetCount < triangulaStateCache.startCount) {
    triangulaStateCache.targetCount = triangulaStateCache.startCount;
  }
  return triangulaStateCache;
}

function restoreTriangulaStateFromCache() {
  var cached = hydrateTriangulaStateCacheFromStorage();
  if (!cached) return;
  triangulaColorMode = cached.colorMode;
  triangulaConstructionMode = cached.constructionMode;
  triangulaStartCount = cached.startCount;
  triangulaTargetCount = Math.max(cached.startCount, cached.targetCount);
  triangulaFractalMode = cached.fractalMode;
  triangulaFitMode = cached.fitMode;
  triangulaSourceColor = cached.sourceColor;
  triangulaBandColors.band1 = cached.band1Color;
  triangulaBandColors.band2 = cached.band2Color;
  triangulaBandColors.band4 = cached.band4Color;
}

function buildSquarusStateSnapshotFromRuntime() {
  return {
    order: parseBoundedInt(squarusOrder, 1, 6, 5),
    layout: sanitizeSquarusLayout(squarusLayout, 'force-directed'),
    animationMode: sanitizeSquarusAnimationMode(squarusAnimationMode, 'sequential'),
    contactMode: sanitizeSquarusContactMode(squarusContactMode, 'formula-only'),
    pieceCount: normalizeSquarusPieceCount(squarusPieceCount, getSquarusTotalPiecesForOrder(squarusOrder), squarusOrder),
    sequenceSeed: normalizeSquarusSequenceSeed(squarusSequenceSeed, 1, squarusOrder)
  };
}

function persistSquarusStateCache(snapshot) {
  var normalized = snapshot || buildSquarusStateSnapshotFromRuntime();
  squarusStateCache = normalized;
  try {
    appStateStorage.setItem(SQUARUS_STATE_CACHE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Ignore persistence failures; runtime cache still works.
  }
}

function hydrateSquarusStateCacheFromStorage() {
  if (squarusStateCache) return squarusStateCache;
  var fallback = buildSquarusStateSnapshotFromRuntime();
  var raw = appStateStorage.getItem(SQUARUS_STATE_CACHE_KEY);
  if (!raw) {
    squarusStateCache = fallback;
    return squarusStateCache;
  }
  try {
    var parsed = JSON.parse(raw);
    var order = parseBoundedInt(parsed.order, 1, 6, fallback.order);
    squarusStateCache = {
      order: order,
      layout: sanitizeSquarusLayout(parsed.layout, fallback.layout),
      animationMode: sanitizeSquarusAnimationMode(parsed.animationMode, fallback.animationMode),
      contactMode: sanitizeSquarusContactMode(parsed.contactMode, fallback.contactMode),
      pieceCount: normalizeSquarusPieceCount(parsed.pieceCount, fallback.pieceCount, order),
      sequenceSeed: normalizeSquarusSequenceSeed(parsed.sequenceSeed, fallback.sequenceSeed, order)
    };
  } catch (error) {
    squarusStateCache = fallback;
  }
  return squarusStateCache;
}

function restoreSquarusStateFromCache() {
  var cached = hydrateSquarusStateCacheFromStorage();
  if (!cached) return;
  squarusOrder = cached.order;
  squarusLayout = cached.layout;
  squarusAnimationMode = cached.animationMode;
  squarusContactMode = cached.contactMode;
  squarusPieceCount = cached.pieceCount;
  squarusSequenceSeed = cached.sequenceSeed;
}

function buildMashrabiyaStateSnapshotFromRuntime() {
  return {
    fold: sanitizeMashrabiyaFold(mashrabiyaFold, 12),
    geometryMode: sanitizeMashrabiyaGeometryMode(mashrabiyaGeometryMode, 'stitch-vertex'),
    starColor: sanitizeHexColor(mashrabiyaStarColor, '#f4d35e'),
    petalColor: sanitizeHexColor(mashrabiyaPetalColor, '#ee964b'),
    pointColor: sanitizeHexColor(mashrabiyaPointColor, '#f95738'),
    fillBorderWidth: sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderWidth, 0),
    keepConstructionLines: sanitizeBooleanValue(mashrabiyaKeepConstructionLines, false)
  };
}

function persistMashrabiyaStateCache(snapshot) {
  var normalized = snapshot || buildMashrabiyaStateSnapshotFromRuntime();
  mashrabiyaStateCache = normalized;
  try {
    appStateStorage.setItem(MASHRABIYA_STATE_CACHE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Ignore persistence failures; runtime cache still works.
  }
}

function hydrateMashrabiyaStateCacheFromStorage() {
  if (mashrabiyaStateCache) return mashrabiyaStateCache;
  var fallback = buildMashrabiyaStateSnapshotFromRuntime();
  var raw = appStateStorage.getItem(MASHRABIYA_STATE_CACHE_KEY);
  if (!raw) {
    mashrabiyaStateCache = fallback;
    return mashrabiyaStateCache;
  }
  try {
    var parsed = JSON.parse(raw);
    mashrabiyaStateCache = {
      fold: sanitizeMashrabiyaFold(parsed.fold, fallback.fold),
      geometryMode: sanitizeMashrabiyaGeometryMode(parsed.geometryMode, fallback.geometryMode),
      starColor: sanitizeHexColor(parsed.starColor, fallback.starColor),
      petalColor: sanitizeHexColor(parsed.petalColor, fallback.petalColor),
      pointColor: sanitizeHexColor(parsed.pointColor, fallback.pointColor),
      fillBorderWidth: sanitizeMashrabiyaFillBorderWidth(parsed.fillBorderWidth, fallback.fillBorderWidth),
      keepConstructionLines: sanitizeBooleanValue(parsed.keepConstructionLines, fallback.keepConstructionLines)
    };
  } catch (error) {
    mashrabiyaStateCache = fallback;
  }
  return mashrabiyaStateCache;
}

function restoreMashrabiyaStateFromCache() {
  var cached = hydrateMashrabiyaStateCacheFromStorage();
  if (!cached) return;
  mashrabiyaFold = cached.fold;
  mashrabiyaGeometryMode = sanitizeMashrabiyaGeometryMode(cached.geometryMode, 'stitch-vertex');
  mashrabiyaStarColor = cached.starColor;
  mashrabiyaPetalColor = cached.petalColor;
  mashrabiyaPointColor = cached.pointColor;
  mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(cached.fillBorderWidth, 0);
  mashrabiyaKeepConstructionLines = sanitizeBooleanValue(cached.keepConstructionLines, false);
}

function syncCurrentExperienceStateCacheFromRuntime() {
  if (currentExperienceId === 'stitching') {
    syncStitchingStateCacheFromRuntime();
    return;
  }
  if (currentExperienceId === 'triangula') {
    persistTriangulaStateCache();
    return;
  }
  if (currentExperienceId === 'squarus') {
    persistSquarusStateCache();
    return;
  }
  if (currentExperienceId === 'mashrabiya') {
    persistMashrabiyaStateCache();
  }
}

function sanitizeHexColor(value, fallback) {
  if (typeof value !== 'string') return fallback;
  var trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  if (trimmed === 'rainbow') return 'rainbow';
  return fallback;
}

function syncAppStateFromRuntime() {
  appState.version = APP_STATE_URL_VERSION;
  appState.experienceId = currentExperienceId;
  var cachedStitchingState = hydrateStitchingStateCacheFromStorage();
  appState.common.shape = (currentExperienceId === 'stitching')
    ? currentShape
    : sanitizeShape(
      stitchingFrameShape,
      sanitizeShape(cachedStitchingState && cachedStitchingState.shape, appState.common.shape || 'circle')
    );
  appState.common.bpm = currentAnimationBpm;
  appState.common.musicMuted = !!isMusicMuted;
  appState.common.songId = currentSongId;

  appState.stitching.holes = parseBoundedInt(holesSlider.value, 3, MAX_HOLES, DEFAULT_HOLES);
  appState.stitching.nestedFrameEnabled = !!nestedFrameEnabled;
  appState.stitching.nestedFrameRatio = sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
  appState.stitching.selectedThreadIndex = Math.max(0, Math.min(threads.length - 1, selectedThreadIndex));
  appState.stitching.showHoleNumbers = !!showHoleNumbers;
  appState.stitching.borderEnabled = !!borderEnabled;
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
    triangulaSourceColor,
    appState.triangula.sourceColor || '#1982c4'
  );
  appState.triangula.band1Color = triangulaBandColors.band1;
  appState.triangula.band2Color = triangulaBandColors.band2;
  appState.triangula.band4Color = triangulaBandColors.band4;

  appState.squarus.order = parseBoundedInt(squarusOrder, 1, 6, 4);
  appState.squarus.layout = sanitizeSquarusLayout(squarusLayout, 'grid-packing');
  appState.squarus.animationMode = sanitizeSquarusAnimationMode(squarusAnimationMode, 'sequential');
  appState.squarus.contactMode = sanitizeSquarusContactMode(squarusContactMode, 'formula-only');
  appState.squarus.pieceCount = normalizeSquarusPieceCount(squarusPieceCount, getSquarusTotalPiecesForOrder(squarusOrder), squarusOrder);
  appState.squarus.sequenceSeed = normalizeSquarusSequenceSeed(squarusSequenceSeed, 0, squarusOrder);

  appState.mashrabiya.fold = sanitizeMashrabiyaFold(mashrabiyaFold, 12);
  appState.mashrabiya.geometryMode = sanitizeMashrabiyaGeometryMode(mashrabiyaGeometryMode, 'stitch-vertex');
  appState.mashrabiya.starColor = sanitizeHexColor(mashrabiyaStarColor, '#f4d35e');
  appState.mashrabiya.petalColor = sanitizeHexColor(mashrabiyaPetalColor, '#ee964b');
  appState.mashrabiya.pointColor = sanitizeHexColor(mashrabiyaPointColor, '#f95738');
  appState.mashrabiya.fillBorderWidth = sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderWidth, 0);
  appState.mashrabiya.keepConstructionLines = sanitizeBooleanValue(mashrabiyaKeepConstructionLines, false);
}

function buildSearchParamsFromAppState() {
  syncAppStateFromRuntime();
  var params = new URLSearchParams();
  setUrlStateParam(params, 'version', APP_STATE_URL_VERSION);
  setUrlStateParam(params, 'experienceId', appState.experienceId);
  setUrlStateParam(params, 'stitchingShape', sanitizeShape(appState.common.shape, stitchingFrameShape || 'circle'));
  if (appState.experienceId === 'stitching') {
    setUrlStateParam(params, 'stitchingShowHoleNumbers', appState.stitching.showHoleNumbers ? '1' : '0');
    setUrlStateParam(params, 'stitchingBorderEnabled', appState.stitching.borderEnabled ? '1' : '0');
    setUrlStateParam(params, 'stitchingHoles', String(appState.stitching.holes));
    setUrlStateParam(params, 'stitchingNestedFrameEnabled', appState.stitching.nestedFrameEnabled ? '1' : '0');
    setUrlStateParam(params, 'stitchingNestedFrameRatio', String(appState.stitching.nestedFrameRatio));
    setUrlStateParam(params, 'stitchingSelectedThreadIndex', String(appState.stitching.selectedThreadIndex));
    setUrlStateParam(params, 'stitchingThreadState', appState.stitching.threadState);
    if (appState.stitching.threadColors && appState.stitching.threadColors.length) {
      setUrlStateParam(params, 'stitchingThreadColors', appState.stitching.threadColors.join(','));
    }
  }
  setUrlStateParam(params, 'bpm', String(appState.common.bpm));
  setUrlStateParam(params, 'musicMuted', appState.common.musicMuted ? '1' : '0');
  setUrlStateParam(params, 'songId', appState.common.songId);

  if (appState.experienceId === 'triangula') {
    setUrlStateParam(params, 'triangulaSourceColor', appState.triangula.sourceColor);
    setUrlStateParam(params, 'triangulaColorMode', appState.triangula.colorMode);
    setUrlStateParam(params, 'triangulaConstructionMode', appState.triangula.constructionMode);
    setUrlStateParam(params, 'triangulaStartCount', String(appState.triangula.startCount));
    setUrlStateParam(params, 'triangulaTargetCount', String(appState.triangula.targetCount));
    setUrlStateParam(params, 'triangulaFractalMode', appState.triangula.fractalMode);
    setUrlStateParam(params, 'triangulaFitMode', appState.triangula.fitMode);
    setUrlStateParam(params, 'triangulaBand1Color', appState.triangula.band1Color);
    setUrlStateParam(params, 'triangulaBand2Color', appState.triangula.band2Color);
    setUrlStateParam(params, 'triangulaBand4Color', appState.triangula.band4Color);
  } else if (appState.experienceId === 'squarus') {
    setUrlStateParam(params, 'squarusOrder', String(appState.squarus.order));
    setUrlStateParam(params, 'squarusLayout', appState.squarus.layout);
    setUrlStateParam(params, 'squarusAnimationMode', appState.squarus.animationMode);
    setUrlStateParam(params, 'squarusContactMode', appState.squarus.contactMode);
    setUrlStateParam(params, 'squarusPieceCount', String(appState.squarus.pieceCount));
    setUrlStateParam(params, 'squarusSequenceSeed', String(appState.squarus.sequenceSeed));
  } else if (appState.experienceId === 'mashrabiya') {
    setUrlStateParam(params, 'mashrabiyaFold', String(appState.mashrabiya.fold));
    setUrlStateParam(params, 'mashrabiyaGeometryMode', appState.mashrabiya.geometryMode);
    setUrlStateParam(params, 'mashrabiyaStarColor', appState.mashrabiya.starColor);
    setUrlStateParam(params, 'mashrabiyaPetalColor', appState.mashrabiya.petalColor);
    setUrlStateParam(params, 'mashrabiyaPointColor', appState.mashrabiya.pointColor);
    setUrlStateParam(params, 'mashrabiyaFillBorderWidth', String(appState.mashrabiya.fillBorderWidth));
    setUrlStateParam(params, 'mashrabiyaKeepConstructionLines', appState.mashrabiya.keepConstructionLines ? '1' : '0');
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
  syncCurrentExperienceStateCacheFromRuntime();
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

