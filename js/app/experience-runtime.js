function applyStateFromCurrentUrl(options) {
  options = options || {};
  var params = new URLSearchParams(window.location.search || '');
  var requestedExperience = resolveExperienceId(getUrlStateParam(params, 'experienceId'));
  var hasExplicitExperienceParam = !!resolveExperienceId(getUrlStateParam(params, 'experienceId'));
  var allowExperienceUrlDiscoveryUnlock = options.initialLoad === true;

  if (!requestedExperience) {
    requestedExperience = currentExperienceId;
  }

  try {
    withUrlSyncSuspended(function() {
    if (allowExperienceUrlDiscoveryUnlock && hasExplicitExperienceParam) {
      var unlockKey = getDiscoveryKeyForExperience(requestedExperience);
      if (requestedExperience === 'mashrabiya') {
        var requestedMashrabiyaFoldForUnlock = sanitizeMashrabiyaFold(
          getUrlStateParam(params, 'mashrabiyaFold'),
          mashrabiyaFold
        );
        unlockKey = requestedMashrabiyaFoldForUnlock === 8 ? 'rosette8' : 'rosette12';
      }
      if (unlockKey) {
        unlockDiscovery(unlockKey);
      }
    }

    if (hasExplicitExperienceParam) {
      setCurrentExperience(requestedExperience, { suppressUrlSync: true });
      requestedExperience = currentExperienceId;
    }

    var explicitStitchingShape = sanitizeShape(getUrlStateParam(params, 'stitchingShape'), '');
    if (explicitStitchingShape) {
      stitchingFrameShape = explicitStitchingShape;
    } else {
      stitchingFrameShape = sanitizeShape(stitchingFrameShape, 'circle');
    }

    var profile = getExperienceUiProfile(currentExperienceId);
    if (requestedExperience === 'stitching') {
      var requestedStitchingShape = explicitStitchingShape || sanitizeShape(stitchingFrameShape, currentShape || 'circle');
      setCurrentShape(requestedStitchingShape, false);
      stitchingFrameShape = sanitizeShape(requestedStitchingShape, stitchingFrameShape || 'circle');
    } else if (profile && profile.fixedShape) {
      setCurrentShape(profile.fixedShape, false);
    }

    var songIdFromUrl = sanitizeSongId(getUrlStateParam(params, 'songId'), currentSongId);
    if (songIdFromUrl && songIdFromUrl !== currentSongId) {
      setCurrentSong(songIdFromUrl, { suppressUrlSync: true });
    }

    var bpmFromUrl = sanitizeBpmForCurrentSong(getUrlStateParam(params, 'bpm'), currentAnimationBpm);
    applyTempoValue(bpmFromUrl, { suppressUrlSync: true });

    isMusicMuted = sanitizeBooleanParam(getUrlStateParam(params, 'musicMuted'), isMusicMuted);
    syncMusicToggleButton();

    if (requestedExperience === 'stitching') {
      showHoleNumbers = sanitizeBooleanParam(getUrlStateParam(params, 'stitchingShowHoleNumbers'), showHoleNumbers);
      borderEnabled = sanitizeBooleanParam(getUrlStateParam(params, 'stitchingBorderEnabled'), borderEnabled);
      nestedFrameEnabled = !!sanitizeBooleanParam(getUrlStateParam(params, 'stitchingNestedFrameEnabled'), nestedFrameEnabled);
      nestedFrameRatio = sanitizeNestedFrameRatio(getUrlStateParam(params, 'stitchingNestedFrameRatio'), nestedFrameRatio);
      syncNestedFrameControls();
      syncHoleNumberToggles();
      syncBorderControls();

      var fallbackThreads = threads.map(function(thread) {
        return sanitizeThreadDescriptor(thread, thread);
      });
      var requestedThreadState = parseStitchingThreadState(getUrlStateParam(params, 'stitchingThreadState'), fallbackThreads);

      if (requestedThreadState.length) {
        threads = requestedThreadState.map(function(thread) {
          return sanitizeThreadDescriptor(thread, thread);
        });
      }

      var fallbackColors = threads.map(function(thread) {
        return sanitizeThreadColor(thread.color, '#1982c4');
      });
      var requestedThreadColors = sanitizeThreadColorList(getUrlStateParam(params, 'stitchingThreadColors'), fallbackColors);
      for (var i = 0; i < threads.length && i < requestedThreadColors.length; i++) {
        threads[i].color = requestedThreadColors[i];
      }

      if (!threads.length) {
        threads = [sanitizeThreadDescriptor({}, null)];
      }

      var holesFromUrl = parseBoundedInt(getUrlStateParam(params, 'stitchingHoles'), 3, MAX_HOLES, parseBoundedInt(holesSlider.value, 3, MAX_HOLES, DEFAULT_HOLES));
      holesSlider.value = String(holesFromUrl);
      if (advancedHolesNumberInput) {
        advancedHolesNumberInput.value = String(holesFromUrl);
      }

      selectedThreadIndex = parseBoundedInt(getUrlStateParam(params, 'stitchingSelectedThreadIndex'), 0, threads.length - 1, selectedThreadIndex);
      renderThreadControls();
      syncKidControlsFromSelectedThread();
    }

    if (requestedExperience === 'triangula') {
      var sourceColor = sanitizeThreadColor(getUrlStateParam(params, 'triangulaSourceColor'), triangulaSourceColor || '#1982c4');
      triangulaSourceColor = sourceColor;
      triangulaColorMode = sanitizeTriangulaColorMode(getUrlStateParam(params, 'triangulaColorMode'), triangulaColorMode);
      triangulaConstructionMode = sanitizeTriangulaConstructionMode(getUrlStateParam(params, 'triangulaConstructionMode'), triangulaConstructionMode);
      triangulaStartCount = sanitizeTriangulaCount(getUrlStateParam(params, 'triangulaStartCount'), triangulaStartCount, 'start');
      triangulaTargetCount = sanitizeTriangulaCount(getUrlStateParam(params, 'triangulaTargetCount'), triangulaTargetCount, 'target');
      if (triangulaTargetCount < triangulaStartCount) {
        triangulaTargetCount = triangulaStartCount;
      }
      triangulaFractalMode = sanitizeTriangulaFractalMode(getUrlStateParam(params, 'triangulaFractalMode'), triangulaFractalMode);
      triangulaFitMode = sanitizeTriangulaFitMode(getUrlStateParam(params, 'triangulaFitMode'), triangulaFitMode);

      triangulaBandColors.band1 = sanitizeHexColor(getUrlStateParam(params, 'triangulaBand1Color'), triangulaBandColors.band1);
      triangulaBandColors.band2 = sanitizeHexColor(getUrlStateParam(params, 'triangulaBand2Color'), triangulaBandColors.band2);
      triangulaBandColors.band4 = sanitizeHexColor(getUrlStateParam(params, 'triangulaBand4Color'), triangulaBandColors.band4);

      syncTriangulaControls();
    } else if (requestedExperience === 'squarus') {
      var orderFromUrl = parseBoundedInt(getUrlStateParam(params, 'squarusOrder'), 1, 6, squarusOrder);
      squarusOrder = orderFromUrl;
      squarusLayout = sanitizeSquarusLayout(getUrlStateParam(params, 'squarusLayout'), squarusLayout);
      squarusAnimationMode = sanitizeSquarusAnimationMode(getUrlStateParam(params, 'squarusAnimationMode'), squarusAnimationMode);
      squarusContactMode = sanitizeSquarusContactMode(getUrlStateParam(params, 'squarusContactMode'), squarusContactMode);
      squarusPieceCount = normalizeSquarusPieceCount(getUrlStateParam(params, 'squarusPieceCount'), squarusPieceCount, squarusOrder);
      squarusSequenceSeed = normalizeSquarusSequenceSeed(getUrlStateParam(params, 'squarusSequenceSeed'), squarusSequenceSeed, squarusOrder);
      syncSquarusControls();
    } else if (requestedExperience === 'mashrabiya') {
      mashrabiyaFold = sanitizeMashrabiyaFold(getUrlStateParam(params, 'mashrabiyaFold'), mashrabiyaFold);
      mashrabiyaGeometryMode = sanitizeMashrabiyaGeometryMode(getUrlStateParam(params, 'mashrabiyaGeometryMode'), mashrabiyaGeometryMode);
      mashrabiyaStarColor = sanitizeHexColor(getUrlStateParam(params, 'mashrabiyaStarColor'), mashrabiyaStarColor);
      mashrabiyaPetalColor = sanitizeHexColor(getUrlStateParam(params, 'mashrabiyaPetalColor'), mashrabiyaPetalColor);
      mashrabiyaPointColor = sanitizeHexColor(getUrlStateParam(params, 'mashrabiyaPointColor'), mashrabiyaPointColor);
      mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(getUrlStateParam(params, 'mashrabiyaFillBorderWidth'), mashrabiyaFillBorderWidth);
      mashrabiyaKeepConstructionLines = sanitizeBooleanValue(getUrlStateParam(params, 'mashrabiyaKeepConstructionLines'), mashrabiyaKeepConstructionLines);
      syncMashrabiyaControls();
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
  if (hasUrlStateKey(params, 'version') || hasUrlStateKey(params, 'experienceId')) return true;
  // Backward/partial URLs should still be treated as explicit state.
  return params.toString().length > 0;
}

var magicThreadColors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#f15bb5'];
var joyAudio = new Audio(MUSIC_LIBRARY[currentSongId].path);
joyAudio.preload = 'auto';
var acknowledgmentsAudio = new Audio(ACKNOWLEDGMENTS_SONG_PATH);
acknowledgmentsAudio.preload = 'auto';
var isMusicMuted = false;
var hasMusicStartedSinceLoad = false;
var sliderMotionKeys = Object.create(null);
var sliderMotionSettleTimers = Object.create(null);
var sliderMotionKeySeed = 0;
var hasAppliedParamlessStitchingRandomization = false;
var startupTailPreviewInProgress = false;

function getRandomIntInclusive(min, max) {
  var safeMin = Math.ceil(Number(min));
  var safeMax = Math.floor(Number(max));
  if (!isFinite(safeMin) || !isFinite(safeMax)) return 0;
  if (safeMax < safeMin) return safeMin;
  return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
}

function pickRandomValue(options, fallback) {
  if (!Array.isArray(options) || !options.length) return fallback;
  return options[getRandomIntInclusive(0, options.length - 1)];
}

function buildRandomThreadSequence(sourceHoleCount, jumpLimit, sequenceMode) {
  var usesStepList = sanitizeThreadSequenceMode(sequenceMode, 'holes') === 'steps';
  var itemMax = usesStepList
    ? Math.max(1, jumpLimit)
    : Math.max(1, sourceHoleCount);
  var sequenceLength = getRandomIntInclusive(3, Math.min(8, itemMax + 2));
  var values = [];

  for (var i = 0; i < sequenceLength; i++) {
    values.push(getRandomIntInclusive(1, itemMax));
  }

  return values.join(',');
}

function applyRandomizedStitchingStateForParamlessLoad() {
  var stitchingProfile = getExperienceUiProfile('stitching');
  var allowedShapes = (stitchingProfile && Array.isArray(stitchingProfile.allowedShapes) && stitchingProfile.allowedShapes.length)
    ? stitchingProfile.allowedShapes.slice()
    : ['circle', 'triangle', 'square'];
  var randomShape = sanitizeShape(pickRandomValue(allowedShapes, 'circle'), 'circle');
  var holesMin = parseBoundedInt(holesSlider && holesSlider.min, 3, MAX_HOLES, 3);
  var holesDisplayLimit = parseBoundedInt(HOLE_NUMBER_AUTO_HIDE_THRESHOLD, holesMin, MAX_HOLES, MAX_HOLES);
  var holesMaxFromSlider = parseBoundedInt(holesSlider && holesSlider.max, holesMin, MAX_HOLES, DEFAULT_HOLES);
  var holesMax = Math.min(holesMaxFromSlider, holesDisplayLimit);
  var randomHoleCount = getRandomIntInclusive(holesMin, holesMax);

  setCurrentShape(randomShape, false);
  stitchingFrameShape = sanitizeShape(randomShape, stitchingFrameShape || 'circle');
  holesSlider.value = String(randomHoleCount);
  if (advancedHolesNumberInput) {
    advancedHolesNumberInput.value = String(randomHoleCount);
  }

  nestedFrameEnabled = Math.random() < 0.5;
  nestedFrameRatio = sanitizeNestedFrameRatio(
    pickRandomValue(NESTED_FRAME_RATIO_OPTIONS, DEFAULT_NESTED_FRAME_RATIO),
    DEFAULT_NESTED_FRAME_RATIO
  );
  // Keep startup visuals beginner-readable on random loads.
  showHoleNumbers = true;
  borderEnabled = true;

  var threadWidthMin = parseBoundedInt(widthSlider && widthSlider.min, 1, 10, 1);
  var threadWidthMaxFromSlider = parseBoundedInt(widthSlider && widthSlider.max, threadWidthMin, 10, DEFAULT_THREAD_SIZE);
  var threadWidthMax = Math.min(threadWidthMaxFromSlider, 5);
  var connectMin = parseBoundedInt(multiplySlider && multiplySlider.min, 1, 12, 1);
  var connectMax = parseBoundedInt(multiplySlider && multiplySlider.max, connectMin, 12, 12);
  var frameModes = nestedFrameEnabled
    ? ['inner', 'bridge-reverse', 'bridge-reverse-project']
    : ['outer'];

  var randomThread = createThread({
    jump: DEFAULT_SKIP,
    width: getRandomIntInclusive(threadWidthMin, threadWidthMax),
    color: pickRandomValue(magicThreadColors.concat(['rainbow']), '#1982c4'),
    startHole: 1,
    frameMode: pickRandomValue(frameModes, 'outer'),
    jumpSequenceMode: pickRandomValue(['holes', 'steps'], 'holes')
  });
  var randomJumpMode = pickRandomValue(['fixed', 'connect', 'sequence'], 'fixed');
  var sourceHoleCount = Math.max(3, getThreadSourceHoleCount(randomThread));
  var jumpLimit = Math.max(1, sourceHoleCount - 1);

  randomThread.startHole = 1;
  randomThread.jump = getRandomIntInclusive(1, jumpLimit);
  if (randomJumpMode === 'connect') {
    randomThread.connectMultiplier = getRandomIntInclusive(Math.max(2, connectMin), connectMax);
  } else {
    randomThread.connectMultiplier = getRandomIntInclusive(connectMin, connectMax);
  }
  randomThread.jumpMode = randomJumpMode;
  randomThread.jumpFormula = 'skip';
  randomThread.jumpSequence = '';

  if (randomJumpMode === 'sequence') {
    randomThread.jumpSequence = buildRandomThreadSequence(sourceHoleCount, jumpLimit, randomThread.jumpSequenceMode);
  }

  threads = [randomThread];
  selectedThreadIndex = 0;

  renderThreadControls();
  syncKidControlsFromSelectedThread();
  syncNestedFrameControls();
  syncHoleNumberToggles();
  syncBorderControls();
  updateKidControlValues();
  persistStitchingStateCache(buildStitchingStateSnapshotFromRuntime());
  hasAppliedParamlessStitchingRandomization = true;
}

function runParamlessStartupTailPreview(onComplete) {
  var done = typeof onComplete === 'function' ? onComplete : function() {};

  if (startupTailPreviewInProgress) {
    done();
    return;
  }
  if (hasUrlStateParams()) {
    done();
    return;
  }
  if (currentExperienceId !== 'stitching' || !hasAppliedParamlessStitchingRandomization) {
    done();
    return;
  }
  if (!threads.length) {
    done();
    return;
  }

  // Keep the preview cadence anchored to the default startup tempo.
  applyTempoValue(getKidTempoPresetsForSong(currentSongId).slow || DEFAULT_ANIMATION_BPM, {
    suppressUrlSync: true,
    suppressRedraw: true
  });

  var previewThread = threads[0];
  var segments = computeSegments(previewThread) || [];
  if (segments.length < 3) {
    done();
    return;
  }

  var previewStartStep = Math.max(0, segments.length - 3);
  var previewDurationMs = Math.ceil((3 * getAnimationSecondsPerSegment() + 1.2) * 1000);
  var previewTimeoutMs = Math.max(2200, previewDurationMs + 800);

  startupTailPreviewInProgress = true;
  stopAnimationIfActive();
  project.activeLayer.removeChildren();
  computePoints();

  animationState = {
    threadIndex: 0,
    step: previewStartStep,
    elapsed: 0,
    activeHolePair: null,
    settle: null,
    segmentLists: [segments]
  };
  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  renderAnimationFrame();
  startAnimationLoop();

  var previewStartAt = Date.now();

  function finalizePreview() {
    if (!startupTailPreviewInProgress) return;
    startupTailPreviewInProgress = false;
    done();
  }

  function watchPreviewCompletion() {
    if (!startupTailPreviewInProgress) return;
    if (!animationActive && animationPlaybackState === 'idle') {
      finalizePreview();
      return;
    }
    if (Date.now() - previewStartAt > previewTimeoutMs) {
      stopAnimationIfActive();
      finalizePreview();
      return;
    }
    window.requestAnimationFrame(watchPreviewCompletion);
  }

  window.requestAnimationFrame(watchPreviewCompletion);
}

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

function shouldAcknowledgmentsMusicBePlaying() {
  return !!(acknowledgmentsModal && acknowledgmentsModal.classList.contains('open'));
}

function syncMusicToggleButton() {
  musicToggleBtn.textContent = isMusicMuted ? '🔇' : '🔊';
  musicToggleBtn.classList.toggle('is-active', isMusicMuted);
  musicToggleBtn.setAttribute('aria-pressed', isMusicMuted ? 'true' : 'false');
  musicToggleBtn.setAttribute('aria-label', isMusicMuted ? 'Unmute music' : 'Mute music');
  musicToggleBtn.title = isMusicMuted ? 'Unmute music' : 'Mute music';
}

function sanitizeTheme(value, fallback) {
  if (value === 'dark' || value === 'light') return value;
  return fallback || 'light';
}

function syncThemeToggleButton() {
  if (!themeToggleBtn) return;
  var isDark = currentTheme === 'dark';
  themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  themeToggleBtn.classList.toggle('active', isDark);
  themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggleBtn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
}

function applyTheme(theme, options) {
  options = options || {};
  var normalizedTheme = sanitizeTheme(theme, 'light');
  currentTheme = normalizedTheme;
  document.documentElement.setAttribute('data-theme', normalizedTheme);
  if (options.persist !== false) {
    appStateStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  }
  syncThemeToggleButton();
  if (options.refreshVisuals !== false) {
    renderExperienceTitleStatic();
    redrawAnimationInPlace();
  }
}

function initializeThemeFromStorage() {
  var storedTheme = sanitizeTheme(appStateStorage.getItem(THEME_STORAGE_KEY), '');
  var attrTheme = sanitizeTheme(document.documentElement.getAttribute('data-theme'), 'light');
  if (!storedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    storedTheme = 'dark';
  }
  applyTheme(storedTheme || attrTheme, { persist: false, refreshVisuals: false });
}

function getThemeBorderStrokeColor() {
  if (forceExportRenderColors) return BORDER_STROKE_COLOR;
  if (currentTheme === 'dark') return BORDER_STROKE_COLOR_DARK;
  return BORDER_STROKE_COLOR;
}

function getThemeHoleFillColor() {
  if (forceExportRenderColors) return HOLE_FILL_COLOR;
  if (currentTheme === 'dark') return HOLE_FILL_COLOR_DARK;
  return HOLE_FILL_COLOR;
}

function getThemeHoleLabelColor() {
  if (forceExportRenderColors) return HOLE_LABEL_COLOR;
  if (currentTheme === 'dark') return HOLE_LABEL_COLOR_DARK;
  return HOLE_LABEL_COLOR;
}

function getThemeHoleLabelHighlightColor() {
  if (forceExportRenderColors) return HOLE_LABEL_HIGHLIGHT_COLOR;
  if (currentTheme === 'dark') return HOLE_LABEL_HIGHLIGHT_COLOR_DARK;
  return HOLE_LABEL_HIGHLIGHT_COLOR;
}

function getThemeExperienceTitleColor(baseColor) {
  if (currentTheme === 'dark') return EXPERIENCE_TITLE_COLOR_DARK;
  return baseColor || '#1f4f94';
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

function isMashrabiyaExperienceUnlocked() {
  return !!(discoveredShapeKeys.rosette8 || discoveredShapeKeys.rosette12);
}

function isExperienceAccessible(experienceId) {
  var resolvedId = resolveExperienceId(experienceId) || 'stitching';
  if (resolvedId === 'mashrabiya') {
    return isMashrabiyaExperienceUnlocked();
  }
  return true;
}

function resolveAccessibleExperienceId(experienceRef, fallback) {
  var fallbackId = resolveExperienceId(fallback) || 'stitching';
  var requestedId = resolveExperienceId(experienceRef) || fallbackId;
  return isExperienceAccessible(requestedId) ? requestedId : fallbackId;
}

function getExperienceUiProfile(experienceId) {
  var experience = getExperienceById(experienceId);
  return experience.uiProfile || EXPERIENCE_LIBRARY.stitching.uiProfile;
}

function getDefaultSongIdForExperience(experienceId) {
  if (experienceId === 'triangula') return 'triangle';
  if (experienceId === 'squarus') return 'square';
  if (experienceId === 'mashrabiya') return 'rosette';
  return 'bach';
}

function isSongUnlockedForCurrentSession(songId) {
  if (!songId || !MUSIC_LIBRARY[songId]) return false;
  if (songId === 'bach') return true;
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

  if (!threadsEnabled) {
    setElementDisplay(addMagicThreadBtn, false, '');
    setElementDisplay(removeLastThreadBtn, false, '');
    setElementDisplay(kidThreadPicker, false, '');
    setElementDisplay(addThreadBtn, false, '');
    setElementDisplay(advancedThreadsTitle, false, '');
    setElementDisplay(threadControlsContainer, false, '');
    return;
  }

  if (!threads.length) {
    threads = [sanitizeThreadDescriptor({}, null)];
  }
  if (selectedThreadIndex < 0 || selectedThreadIndex >= threads.length) {
    selectedThreadIndex = 0;
  }

  setElementDisplay(addMagicThreadBtn, threadsEnabled && allowMultipleThreads, '');
  setElementDisplay(removeLastThreadBtn, threadsEnabled && allowMultipleThreads && threads.length > 1, '');
  setElementDisplay(kidThreadPicker, threadsEnabled && allowMultipleThreads && threads.length > 1, 'inline-flex');
  setElementDisplay(addThreadBtn, threadsEnabled && allowMultipleThreads, '');
  setElementDisplay(advancedThreadsTitle, threadsEnabled, '');
  setElementDisplay(threadControlsContainer, threadsEnabled, '');

  renderThreadControls();
}

function applyBasicControlPolicy(profile) {
  var controls = profile && profile.basicControls ? profile.basicControls : null;
  if (!controls) return;
  setElementDisplay(holesSliderBlock, controls.holes !== false, '');
  setElementDisplay(stitchBySliderBlock, controls.stitchBy !== false, '');
  setElementDisplay(startHoleBlock, controls.stitchBy !== false && currentExperienceId === 'stitching', '');
  setElementDisplay(jumpSliderBlock, controls.add !== false, '');
  setElementDisplay(multiplyMathSliderBlock, controls.multiply !== false, '');
  setElementDisplay(widthSliderBlock, controls.width !== false, '');
  setElementDisplay(
    triangulaColorScopeBlock,
    controls.triangulaColorScope === true && currentExperienceId === 'triangula' && triangulaConstructionMode === 'shrink-duplicate',
    ''
  );
  setElementDisplay(triangulaModeBlock, controls.triangulaConstructionMode === true, '');
  setElementDisplay(triangulaStartBlock, controls.triangulaStartCount === true, '');
  setElementDisplay(triangulaTargetBlock, controls.triangulaTargetCount === true, '');
  setElementDisplay(squarusOrderBlock, controls.squarusOrder === true && currentExperienceId === 'squarus', '');
  setElementDisplay(squarusLayoutBlock, controls.squarusLayout === true && currentExperienceId === 'squarus', '');
  setElementDisplay(squarusContactBlock, controls.squarusLayout === true && currentExperienceId === 'squarus', '');
  setElementDisplay(squarusPieceCountBlock, controls.squarusPieceCount === true && currentExperienceId === 'squarus', '');
  setElementDisplay(squarusSequenceBlock, controls.squarusSequence === true && currentExperienceId === 'squarus', '');
  setElementDisplay(mashrabiyaFoldBlock, controls.mashrabiyaFold === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(mashrabiyaFillBorderBlock, controls.mashrabiyaFillBorder === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(mashrabiyaLinesVisibilityBlock, controls.mashrabiyaConstructionLines === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(mashrabiyaStarColorBlock, controls.mashrabiyaStarColor === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(mashrabiyaPointColorBlock, controls.mashrabiyaPointColor === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(mashrabiyaPetalColorBlock, controls.mashrabiyaPetalColor === true && currentExperienceId === 'mashrabiya', '');
}

function applyAdvancedControlPolicy(profile) {
  var controls = profile && profile.advancedControls ? profile.advancedControls : null;
  if (!controls) return;
  if (advancedStitchingFrameSubsection) {
    setElementDisplay(advancedStitchingFrameSubsection, currentExperienceId === 'stitching', '');
  }
  setElementDisplay(nestedFrameBlock, currentExperienceId === 'stitching', '');
  if (advancedShapeSelect) {
    setElementDisplay(advancedShapeSelect.parentElement, controls.shape !== false, '');
  }
  if (advancedBorderEnabledInput) {
    setElementDisplay(advancedBorderEnabledInput.parentElement, controls.border !== false, '');
  }
  if (advancedHoleNumbersToggle) {
    setElementDisplay(advancedHoleNumbersToggle.parentElement, controls.holeNumbers !== false, '');
  }
  if (advancedHolesNumberInput) {
    setElementDisplay(advancedHolesNumberInput.parentElement, controls.holesNumber !== false, '');
  }
  if (controls.threads === false) {
    setElementDisplay(advancedThreadsTitle, false, '');
    setElementDisplay(addThreadBtn, false, '');
    setElementDisplay(threadControlsContainer, false, '');
  }
  setElementDisplay(mashrabiyaAdvancedSubsection, controls.mashrabiyaFillBorder === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(triangulaAdvancedSubsection, controls.triangulaAnimationFitMode === true, '');
  setElementDisplay(squarusAdvancedSubsection, controls.squarusControls === true, '');
}

function syncDiscoveryReturnRowVisibility() {
  if (!discoveryReturnRow) return;
  var showReturn = currentExperienceId !== 'stitching';
  if (showReturn) {
    discoveryReturnRow.removeAttribute('hidden');
  } else {
    discoveryReturnRow.setAttribute('hidden', '');
  }
}

function applyTopBarPolicy(profile) {
  var supportsHoleNumbers = !profile || profile.supportsHoleNumbers !== false;
  setElementDisplay(holeNumbersToggleBtn, supportsHoleNumbers, 'flex');
  syncDiscoveryReturnRowVisibility();
}

function applyExperienceUiPolicy() {
  var profile = getExperienceUiProfile(currentExperienceId);
  applyShapePolicy(profile);
  applyThreadPolicy(profile);
  applyBasicControlPolicy(profile);
  applyAdvancedControlPolicy(profile);
  applyTopBarPolicy(profile);
  if (paletteContainer) {
    var paletteMode = profile && profile.paletteMode ? profile.paletteMode : 'thread';
    paletteContainer.dataset.paletteMode = paletteMode;
    setElementDisplay(paletteContainer, paletteMode !== 'none', '');
  }
  if (currentExperienceId === 'triangula') {
    var allowedTriangulaModes = (profile && profile.triangulaColorModes && profile.triangulaColorModes.length)
      ? profile.triangulaColorModes
      : ['band-1'];
    if (allowedTriangulaModes.indexOf(triangulaColorMode) === -1) {
      triangulaColorMode = allowedTriangulaModes[0];
    }
  }
  if (triangulaColorScopeSelect) {
    triangulaColorScopeSelect.value = triangulaColorMode;
  }
  if (triangulaConstructionModeSelect) {
    triangulaConstructionModeSelect.value = triangulaConstructionMode;
  }
  syncSquarusControls();
  syncTriangulaControls();
  syncMashrabiyaControls();
}

function syncMashrabiyaControls() {
  mashrabiyaFold = sanitizeMashrabiyaFold(mashrabiyaFold, 12);
  mashrabiyaGeometryMode = sanitizeMashrabiyaGeometryMode(mashrabiyaGeometryMode, 'stitch-vertex');
  mashrabiyaStarColor = sanitizeHexColor(mashrabiyaStarColor, '#f4d35e');
  mashrabiyaPetalColor = sanitizeHexColor(mashrabiyaPetalColor, '#ee964b');
  mashrabiyaPointColor = sanitizeHexColor(mashrabiyaPointColor, '#f95738');
  mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderWidth, 0);
  mashrabiyaKeepConstructionLines = sanitizeBooleanValue(mashrabiyaKeepConstructionLines, false);

  if (mashrabiyaFoldSelect) {
    mashrabiyaFoldSelect.value = String(mashrabiyaFold);
  }
  if (mashrabiyaFillBorderSlider) {
    mashrabiyaFillBorderSlider.value = String(mashrabiyaFillBorderWidth);
  }
  if (mashrabiyaFillBorderValue) {
    mashrabiyaFillBorderValue.textContent = String(mashrabiyaFillBorderWidth);
  }
  if (advancedMashrabiyaFillBorderInput) {
    advancedMashrabiyaFillBorderInput.value = String(mashrabiyaFillBorderWidth);
  }
  if (mashrabiyaStarColorInput) {
    mashrabiyaStarColorInput.value = mashrabiyaStarColor;
  }
  if (mashrabiyaPetalColorInput) {
    mashrabiyaPetalColorInput.value = mashrabiyaPetalColor;
  }
  if (mashrabiyaPointColorInput) {
    mashrabiyaPointColorInput.value = mashrabiyaPointColor;
  }
  if (mashrabiyaKeepConstructionLinesInput) {
    mashrabiyaKeepConstructionLinesInput.checked = !!mashrabiyaKeepConstructionLines;
  }

  if (currentExperienceId === 'mashrabiya') {
    persistMashrabiyaStateCache();
  }
}

function syncSquarusControls() {
  var totalPieces = getSquarusTotalPiecesForOrder(squarusOrder);
  squarusPieceCount = normalizeSquarusPieceCount(squarusPieceCount, totalPieces, squarusOrder);

  if (squarusOrderInlineSelect) {
    squarusOrderInlineSelect.value = String(squarusOrder);
  }
  if (squarusLayoutInlineSelect) {
    squarusLayoutInlineSelect.value = squarusLayout;
  }
  if (squarusContactModeInlineSelect) {
    squarusContactModeInlineSelect.value = squarusContactMode;
  }
  if (squarusOrderSelect) {
    squarusOrderSelect.value = String(squarusOrder);
  }
  if (squarusLayoutSelect) {
    squarusLayoutSelect.value = squarusLayout;
  }
  if (squarusAnimationModeSelect) {
    squarusAnimationModeSelect.value = squarusAnimationMode;
  }
  if (squarusContactModeSelect) {
    squarusContactModeSelect.value = squarusContactMode;
  }
  if (squarusPieceCountSlider) {
    squarusPieceCountSlider.max = String(totalPieces);
    squarusPieceCountSlider.value = String(squarusPieceCount);
  }
  if (squarusPieceCountValue) {
    squarusPieceCountValue.textContent = String(squarusPieceCount);
  }
  var sequenceMaxIndex = getSquarusSequenceMaxIndex(squarusOrder);
  squarusSequenceSeed = normalizeSquarusSequenceSeed(squarusSequenceSeed, 0, squarusOrder);
  if (squarusSequenceSlider) {
    squarusSequenceSlider.max = String(sequenceMaxIndex);
    squarusSequenceSlider.value = String(squarusSequenceSeed);
  }
  if (squarusSequenceValue) {
    squarusSequenceValue.textContent = String(squarusSequenceSeed);
  }
  if (squarusSequenceNumberInput) {
    squarusSequenceNumberInput.max = String(sequenceMaxIndex);
    squarusSequenceNumberInput.value = String(squarusSequenceSeed);
  }

  if (currentExperienceId === 'squarus') {
    persistSquarusStateCache();
  }
}

function syncTriangulaControls() {
  triangulaStartCount = normalizeTriangulaDrawableCount(triangulaStartCount, 'start', 1);
  triangulaTargetCount = normalizeTriangulaDrawableCount(triangulaTargetCount, 'target', triangulaStartCount);

  if (triangulaTargetCount < triangulaStartCount) {
    triangulaTargetCount = triangulaStartCount;
  }

  if (triangulaStartSlider) {
    triangulaStartSlider.min = '0';
    triangulaStartSlider.max = String(TRIANGULA_DRAWABLE_COUNTS.length - 1);
    triangulaStartSlider.step = '1';
    triangulaStartSlider.value = String(getTriangulaCountIndexFromValue(triangulaStartCount, 'start', 1));
  }
  if (triangulaTargetSlider) {
    triangulaTargetSlider.min = '0';
    triangulaTargetSlider.max = String(TRIANGULA_DRAWABLE_COUNTS.length - 1);
    triangulaTargetSlider.step = '1';
    triangulaTargetSlider.value = String(getTriangulaCountIndexFromValue(triangulaTargetCount, 'target', triangulaStartCount));
  }
  if (triangulaStartValue) {
    triangulaStartValue.textContent = String(triangulaStartCount);
  }
  if (triangulaTargetValue) {
    triangulaTargetValue.textContent = String(triangulaTargetCount);
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
  var canvasRect = (canvasStage && typeof canvasStage.getBoundingClientRect === 'function')
    ? canvasStage.getBoundingClientRect()
    : null;
  var panelRect = experienceInfoPanel.getBoundingClientRect();
  var margin = 10;
  var gap = 8;

  var preferredCenterX = anchorRect.left + (anchorRect.width / 2);
  if (canvasRect && isFinite(canvasRect.left) && isFinite(canvasRect.width) && canvasRect.width > 0) {
    preferredCenterX = canvasRect.left + (canvasRect.width / 2);
  }

  var left = preferredCenterX - (panelRect.width / 2);
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
  experienceNarrateToggle.textContent = playing ? STOP_NARRATION_BUTTON_LABEL : HEAR_THIS_BUTTON_LABEL;
  experienceNarrationStatus.textContent = statusText || '';
}

function stopExperienceNarration() {
  experienceNarrationRequestToken += 1;
  experienceNarrationRequestInFlight = false;
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  experienceNarrationUtterance = null;
  syncExperienceNarrationState(false, '');
}

function toggleExperienceNarration() {
  var nowMs = (typeof performance !== 'undefined' && performance && typeof performance.now === 'function')
    ? performance.now()
    : Date.now();
  if (nowMs - experienceNarrationLastToggleAtMs < 120) {
    narrationDebugLog('log', 'Ignoring duplicate narration toggle call.', {
      deltaMs: nowMs - experienceNarrationLastToggleAtMs
    });
    return;
  }
  experienceNarrationLastToggleAtMs = nowMs;

  var experience = getExperienceById(currentExperienceId);
  narrationDebugLog('log', 'Narration toggle invoked.', {
    experienceId: currentExperienceId,
    hasActiveUtterance: !!experienceNarrationUtterance,
    aboutHtmlPath: experience.aboutHtmlPath || ''
  });
  if (experienceNarrationUtterance) {
    stopExperienceNarration();
    return;
  }
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    syncExperienceNarrationState(false, 'Narration is unavailable in this browser.');
    return;
  }
  if (experienceNarrationRequestInFlight) {
    narrationDebugLog('log', 'Narration request already in flight; ignoring duplicate toggle.');
    return;
  }

  var experienceId = currentExperienceId;
  var requestToken = ++experienceNarrationRequestToken;
  experienceNarrationRequestInFlight = true;
  syncExperienceNarrationState(false, 'Loading narration...');
  getExperienceNarrationScript(experienceId).then(function(script) {
    if (requestToken !== experienceNarrationRequestToken) {
      experienceNarrationRequestInFlight = false;
      return;
    }
    narrationDebugLog('log', 'Narration script resolved.', {
      experienceId: experienceId,
      textLength: String(script || '').length,
      text: String(script || '')
    });
    if (currentExperienceId !== experienceId) {
      experienceNarrationRequestInFlight = false;
      syncExperienceNarrationState(false, '');
      return;
    }

    speakExperienceNarration(script);
  }).catch(function() {
    experienceNarrationRequestInFlight = false;
    narrationDebugLog('error', 'Narration script failed to load.');
    syncExperienceNarrationState(false, 'Narration could not load.');
  });

  function speakExperienceNarration(textScript) {
    var utterance = new SpeechSynthesisUtterance(textScript);
    utterance.rate = 0.97;
    utterance.pitch = 1;
    utterance.onend = function() {
      experienceNarrationUtterance = null;
      experienceNarrationRequestInFlight = false;
      syncExperienceNarrationState(false, 'Narration complete.');
    };
    utterance.onerror = function() {
      experienceNarrationUtterance = null;
      experienceNarrationRequestInFlight = false;
      syncExperienceNarrationState(false, 'Narration could not play.');
    };

    experienceNarrationUtterance = utterance;
    syncExperienceNarrationState(true, 'Narrating...');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}

function getExperienceNarrationScript(experienceId) {
  var resolvedExperienceId = resolveExperienceId(experienceId) || currentExperienceId;
  var experience = getExperienceById(resolvedExperienceId);
  narrationDebugLog('log', 'Resolving narration script.', {
    requestedExperienceId: experienceId,
    resolvedExperienceId: resolvedExperienceId,
    aboutHtmlPath: experience.aboutHtmlPath || ''
  });

  var aboutHtmlPath = normalizeAllowedAboutDocPath(experience.aboutHtmlPath || '');
  if (!aboutHtmlPath) {
    return Promise.reject(new Error('No valid about html path for narration'));
  }

  var requestKey = resolvedExperienceId;
  if (experienceNarrationFetchById[requestKey]) {
    narrationDebugLog('log', 'Narration request already in flight; reusing promise.', {
      experienceId: resolvedExperienceId
    });
    return experienceNarrationFetchById[requestKey];
  }

  experienceNarrationFetchById[requestKey] = loadNarrationTextFromExperienceInfoFrame(aboutHtmlPath)
    .then(function(text) {
      var normalized = String(text || '').trim();
      if (!normalized) {
        throw new Error('Narration extraction returned empty text');
      }
      narrationDebugLog('log', 'Narration extraction succeeded.', {
        experienceId: resolvedExperienceId,
        textLength: normalized.length,
        text: normalized
      });
      return normalized;
    })
    .finally(function() {
      delete experienceNarrationFetchById[requestKey];
    });

  return experienceNarrationFetchById[requestKey];
}

function renderExperienceTitleStatic() {
  if (!experienceTitleLabel) return;
  var experience = getExperienceById(currentExperienceId);
  var title = experience.title || 'Stitching';
  var color = getThemeExperienceTitleColor(experience.strokeColor || '#1f4f94');
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
  var aboutHtmlPath = normalizeAllowedAboutDocPath(experience.aboutHtmlPath || '');
  var hasHtmlAbout = !!aboutHtmlPath;
  experienceInfoText.hidden = hasHtmlAbout;
  experienceInfoText.textContent = experience.infoText || '';
  if (experienceInfoHtmlFrame) {
    experienceInfoHtmlFrame.hidden = !hasHtmlAbout;
    if (hasHtmlAbout) {
      if (experienceInfoHtmlFrame.getAttribute('src') !== aboutHtmlPath) {
        experienceInfoHtmlFrame.setAttribute('src', aboutHtmlPath);
      } else {
        enforceExperienceInfoFrameAllowlist();
      }
    } else {
      experienceInfoHtmlFrame.removeAttribute('src');
    }
  }
  syncExperienceNarrationState(false, '');
}

function setCurrentExperience(experienceId, options) {
  options = options || {};
  var accessibleExperienceId = resolveAccessibleExperienceId(experienceId, 'stitching');
  var experience = getExperienceById(accessibleExperienceId);
  var previousExperienceId = currentExperienceId;

  if (previousExperienceId === 'stitching') {
    syncStitchingStateCacheFromRuntime();
  } else if (previousExperienceId === 'triangula') {
    persistTriangulaStateCache();
  } else if (previousExperienceId === 'squarus') {
    persistSquarusStateCache();
  } else if (previousExperienceId === 'mashrabiya') {
    persistMashrabiyaStateCache();
  }

  // keep options arg for API compatibility
  currentExperienceId = experience.id;
  if (previousExperienceId !== currentExperienceId) {
    dismissOnboardingUiForExperienceChange();
  }

  if (currentExperienceId === 'squarus') {
    if (previousExperienceId !== 'squarus') {
      squarusEntryFadeStartMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      squarusEntryFadeActive = true;
    }
  } else {
    squarusEntryFadeActive = false;
  }

  if (currentExperienceId === 'stitching') {
    restoreStitchingStateFromCache();
  } else if (currentExperienceId === 'triangula') {
    restoreTriangulaStateFromCache();
  } else if (currentExperienceId === 'squarus') {
    restoreSquarusStateFromCache();
  } else if (currentExperienceId === 'mashrabiya') {
    restoreMashrabiyaStateFromCache();
  }

  if (!options.preserveSongOnExperienceChange) {
    var preferredPlayback = getPreferredPlaybackForExperience(currentExperienceId);
    if (currentExperienceId === 'mashrabiya' && isSongUnlockedForCurrentSession('rosette')) {
      preferredPlayback.songId = 'rosette';
    }
    setCurrentSong(preferredPlayback.songId, { suppressUrlSync: true });
    applyTempoValue(preferredPlayback.bpm, { suppressUrlSync: true, suppressRedraw: true });
  }

  applyExperienceUiPolicy();
  if (currentExperienceId === 'stitching') {
    setCurrentShape(sanitizeShape(stitchingFrameShape, 'circle'), false);
  }
  // Re-apply mode-specific slider visibility after base UI policy toggles.
  syncKidControlsFromSelectedThread();
  applyCurrentExperienceInfo();
  syncExportUiCopy();
  renderExperienceTitleStatic();
  applyOnboardingGuideContentForCurrentExperience();
  refreshOnboardingOverlayPositions();

  if (currentExperienceId === 'stitching') {
    scheduleDiscoveryEvaluation();
  }

  if (!options.suppressUrlSync) {
    scheduleUrlStateSync(false);
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
  if (shouldAcknowledgmentsMusicBePlaying()) {
    if (!joyAudio.paused) {
      joyAudio.pause();
    }
    if (isMusicMuted) {
      if (!acknowledgmentsAudio.paused) {
        acknowledgmentsAudio.pause();
      }
      return;
    }
    var ackPlay = acknowledgmentsAudio.play();
    if (ackPlay && typeof ackPlay.catch === 'function') {
      ackPlay.catch(function() {
        // Ignore autoplay-policy rejections; the next user gesture will retry.
      });
    }
    return;
  }

  if (!acknowledgmentsAudio.paused) {
    acknowledgmentsAudio.pause();
    acknowledgmentsAudio.currentTime = 0;
  }

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

function syncKidSaveToggleButton() {
  if (!kidSaveToggleBtn || !kidSaveModal) return;
  var isOpen = kidSaveModal.classList.contains('open');
  kidSaveToggleBtn.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
  kidSaveToggleBtn.classList.toggle('active', isOpen);
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
  var lineThickness = 2;
  var lineHalfThickness = lineThickness / 2;
  var headSize = 7;
  var headHalfSize = headSize / 2;

  var line = document.createElement('div');
  line.className = 'return-thread-trail-line';
  line.style.left = startPoint.x + 'px';
  line.style.top = (startPoint.y - lineHalfThickness) + 'px';
  line.style.width = distance + 'px';
  line.style.transform = 'rotate(' + angle + 'rad) scaleX(0.08)';
  line.style.background = trailColorStrong;

  var head = document.createElement('div');
  head.className = 'return-thread-trail-head';
  head.style.left = (startPoint.x - headHalfSize) + 'px';
  head.style.top = (startPoint.y - headHalfSize) + 'px';
  head.style.background = trailColor;
  head.style.boxShadow = '0 0 0 3px ' + toRgbaColor(trailColor, 0.22);

  document.body.appendChild(line);
  document.body.appendChild(head);

  if (typeof line.animate === 'function' && typeof head.animate === 'function') {
    var durationMs = RETURN_TO_STITCHING_TRAIL_DURATION_MS;
    var destinationHoldMs = Math.max(120, Math.round(durationMs * 0.22));
    var retractDurationMs = Math.max(260, Math.round(durationMs * 0.74));
    var rotateScaleStart = 'rotate(' + angle + 'rad) scaleX(0.08)';
    var rotateScaleFull = 'rotate(' + angle + 'rad) scaleX(1)';
    function buildDestinationAnchoredRetractTransform(scale) {
      var clampedScale = Math.max(0, Math.min(1, scale));
      var translateX = distance * (1 - clampedScale);
      return 'rotate(' + angle + 'rad) translateX(' + translateX + 'px) scaleX(' + clampedScale + ')';
    }
    var lineAnim = line.animate(
      [
        { transform: rotateScaleStart, opacity: 0 },
        { transform: rotateScaleFull, opacity: 1, offset: 0.22 },
        { transform: rotateScaleFull, opacity: 1, offset: 1 }
      ],
      {
        duration: durationMs,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards'
      }
    );
    lineAnim.onfinish = function() {
      window.setTimeout(function() {
        var retractAnim = line.animate(
          [
            { transform: buildDestinationAnchoredRetractTransform(1), opacity: 1 },
            { transform: buildDestinationAnchoredRetractTransform(0), opacity: 1 }
          ],
          {
            duration: retractDurationMs,
            easing: 'cubic-bezier(0.22, 0.55, 0.35, 1)',
            fill: 'forwards'
          }
        );
        retractAnim.onfinish = function() {
          line.remove();
        };
        retractAnim.oncancel = function() {
          line.remove();
        };
      }, destinationHoldMs);
    };
    lineAnim.oncancel = function() {
      line.remove();
    };

    var headAnim = head.animate(
      [
        { transform: 'translate(0, 0) scale(0.8)', opacity: 0 },
        { transform: 'translate(' + (dx * 0.22) + 'px, ' + (dy * 0.22) + 'px) scale(1)', opacity: 1, offset: 0.18 },
        { transform: 'translate(' + (dx * 0.88) + 'px, ' + (dy * 0.88) + 'px) scale(1)', opacity: 1, offset: 0.8 },
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(0.94)', opacity: 1, offset: 1 }
      ],
      {
        duration: durationMs,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards'
      }
    );
    headAnim.onfinish = function() {
      window.setTimeout(function() {
        head.remove();
      }, destinationHoldMs);
    };
    headAnim.oncancel = function() {
      head.remove();
    };
    return;
  }

  window.setTimeout(function() {
    line.remove();
    head.remove();
  }, RETURN_TO_STITCHING_TRAIL_DURATION_MS + Math.max(120, Math.round(RETURN_TO_STITCHING_TRAIL_DURATION_MS * 0.22)) + Math.max(260, Math.round(RETURN_TO_STITCHING_TRAIL_DURATION_MS * 0.74)) + 40);
}

function getActiveTrailColor() {
  var fallbackColor = '#1982c4';
  var cachedStitchingThreadColor = getCachedActiveStitchingThreadColor();
  if (cachedStitchingThreadColor) return cachedStitchingThreadColor;

  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex >= 0 && threads[targetIndex]) {
    var chosen = threads[targetIndex].color;
    if (chosen && chosen !== 'rainbow') return chosen;
  }

  return fallbackColor;
}

function getCachedActiveStitchingThreadColor() {
  var snapshot = hydrateStitchingStateCacheFromStorage();
  if (!snapshot || !stitchingStateSnapshotAvailable) return null;

  var cachedThreads = parseStitchingThreadState(snapshot.threadState, [sanitizeThreadDescriptor({}, null)]);
  if (!cachedThreads.length) return null;

  var cachedIndex = parseBoundedInt(snapshot.selectedThreadIndex, 0, cachedThreads.length - 1, 0);
  var cachedThread = cachedThreads[cachedIndex];
  if (!cachedThread) return null;

  var cachedColor = sanitizeThreadColor(cachedThread.color, null);
  if (cachedColor && cachedColor !== 'rainbow') return cachedColor;

  var cachedSolidColor = sanitizeThreadSolidColor(cachedThread.solidColor, '#1982c4');
  if (cachedSolidColor && cachedSolidColor !== 'rainbow') return cachedSolidColor;

  return null;
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
  if (!advancedTempoInput) return;
  var options = getActiveTempoOptions();
  advancedTempoInput.innerHTML = '';
  for (var i = 0; i < options.length; i++) {
    var option = document.createElement('option');
    option.value = String(options[i]);
    option.textContent = String(options[i]);
    advancedTempoInput.appendChild(option);
  }
}

function setCurrentSong(songId, options) {
  options = options || {};
  if (!MUSIC_LIBRARY[songId]) return;
  if (!options.allowLockedSong && !isSongUnlockedForCurrentSession(songId)) return;
  if (currentSongId === songId) return;

  var shouldResume = shouldMusicBePlaying() && !isMusicMuted;
  currentSongId = songId;
  renderAdvancedTempoOptions();
  var allowedTempos = getActiveTempoOptions();
  if (allowedTempos.indexOf(currentAnimationBpm) === -1) {
    currentAnimationBpm = getKidTempoPresetsForSong(currentSongId).slow || DEFAULT_ANIMATION_BPM;
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
  recordCurrentExperiencePlaybackPreference();
  if (!options.suppressUrlSync) {
    scheduleUrlStateSync(false);
  }
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

function getDiscoveryPassphrasePreview(config) {
  if (!config || typeof config !== 'object') return 'Passphrase hint: ...';
  var explicitStep = String(config.passphrasePreviewStep || '').replace(/\s+/g, ' ').trim();
  if (explicitStep) {
    return 'Passphrase hint: ' + explicitStep.replace(/[,:;.!?]+$/g, '') + '...';
  }

  var text = String(config.passphrase || '').replace(/\s+/g, ' ').trim();
  if (!text) return 'Passphrase hint: ...';

  var clauses = text.split(/[;:.!?]/).map(function(part) {
    return part.trim();
  }).filter(function(part) {
    return !!part;
  });

  var candidate = clauses.length ? clauses[0] : text;
  var words = candidate.split(' ').filter(function(word) {
    return !!word;
  });

  if (words.length > 10) {
    candidate = words.slice(0, 10).join(' ');
  }

  candidate = candidate.replace(/[,:;.!?]+$/g, '').trim();
  if (!candidate) {
    candidate = 'Pattern details';
  }

  return 'Passphrase hint: ' + candidate + '...';
}

function getDiscoveryIconPath(discoveryKey, isUnlocked) {
  var iconName = null;
  if (discoveryKey === 'triangle') {
    iconName = 'triangle';
  } else if (discoveryKey === 'square') {
    iconName = 'square';
  } else if (discoveryKey === 'rosette12') {
    iconName = 'rosette_12fold';
  } else if (discoveryKey === 'rosette8') {
    iconName = 'rosette_8fold';
  }

  if (!iconName) return '';
  var suffix = isUnlocked ? 'color' : 'bw';
  return 'assets/images/icons/stitchlab-stitching-stitchlab_' + iconName + '_' + suffix + '.svg';
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
  var unlockedKeys = [];
  var lockedKeys = [];

  for (var index = 0; index < keys.length; index++) {
    if (discoveredShapeKeys[keys[index]]) {
      unlockedKeys.push(keys[index]);
    } else {
      lockedKeys.push(keys[index]);
    }
  }

  var orderedKeys = unlockedKeys.concat(lockedKeys);

  for (var i = 0; i < orderedKeys.length; i++) {
    var key = orderedKeys[i];
    var isUnlocked = !!discoveredShapeKeys[key];

    var config = DISCOVERY_LIBRARY[key];
    var card = document.createElement('div');
    card.className = 'discovery-card' + (isUnlocked ? '' : ' is-preview');

    var title = document.createElement('h4');
    var iconPath = getDiscoveryIconPath(key, isUnlocked);
    if (iconPath) {
      var iconChip = document.createElement('span');
      iconChip.className = 'discovery-card-icon-chip' + (isUnlocked ? ' is-unlocked' : ' is-preview');
      iconChip.setAttribute('aria-hidden', 'true');

      var iconImage = document.createElement('img');
      iconImage.className = 'discovery-card-icon' + (isUnlocked ? ' is-unlocked' : ' is-preview');
      iconImage.src = iconPath;
      iconImage.alt = '';
      iconImage.setAttribute('aria-hidden', 'true');
      iconChip.appendChild(iconImage);
      title.appendChild(iconChip);
    }

    var titleLabel = document.createElement('span');
    titleLabel.textContent = config.title;
    title.appendChild(titleLabel);
    card.appendChild(title);

    var text = document.createElement('p');
    var previewShapeName = String(config.previewShapeName || config.title || 'shape');
    var previewExperienceName = String(config.experienceName || 'experience');
    var previewShapeForArticle = previewShapeName.replace(/^[^A-Za-z]+/, '');
    var previewArticle = (/^[AEIOUaeiou]/.test(previewShapeForArticle)) ? 'an' : 'a';
    text.textContent = isUnlocked
      ? config.description
      : ('Stitch ' + previewArticle + ' ' + previewShapeName + ' to unlock travel to ' + previewExperienceName + '.');
    card.appendChild(text);

    if (config.passphrase) {
      var passphrase = document.createElement('p');
      passphrase.className = 'discovery-passphrase';
      passphrase.textContent = isUnlocked
        ? ('Passphrase: ' + config.passphrase)
        : getDiscoveryPassphrasePreview(config);
      card.appendChild(passphrase);
    }

    var action = document.createElement('button');
    action.type = 'button';
    action.className = 'advanced-reset-btn';
    action.textContent = isUnlocked
      ? ('Travel to ' + config.experienceName)
      : ('Locked: ' + config.experienceName);
    action.disabled = !isUnlocked;
    action.setAttribute('aria-disabled', isUnlocked ? 'false' : 'true');
    action.addEventListener('click', function(experienceName, songId, discoveryKey) {
      return function() {
        var experienceId = resolveExperienceId(experienceName);
        if (!experienceId) {
          alert(experienceName + ' experience is not available yet, but this travel path is now reserved in the discovery library.');
          return;
        }

        if (!isExperienceAccessible(experienceId)) {
          alert(experienceName + ' is currently gated while nested-frame rosette support is under development.');
          return;
        }

        if ((discoveryKey === 'rosette8' || discoveryKey === 'rosette12') && experienceId === 'mashrabiya') {
          mashrabiyaFold = (discoveryKey === 'rosette8') ? 8 : 12;
          persistMashrabiyaStateCache();
        }

        setCurrentExperience(experienceId);
        redrawForPathChange();
        discoveryPanel.classList.remove('open');
        syncDiscoveryToggleButton();
      };
    }(config.experienceName, config.songId, key));
    card.appendChild(action);

    discoveryCards.appendChild(card);
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
  if (discoveredShapeKeys[shapeKey]) return;

  var config = DISCOVERY_LIBRARY[shapeKey];
  discoveredShapeKeys[shapeKey] = true;
  unlockSong(config.songId);

  var unlockedExperienceId = resolveExperienceId(config.experienceName);
  if (unlockedExperienceId === 'mashrabiya' && config.songId === 'rosette') {
    var playbackState = hydrateExperiencePlaybackStateCacheFromStorage();
    playbackState.mashrabiya = normalizePlaybackEntry(
      {
        songId: 'rosette',
        bpm: getKidTempoPresetsForSong('rosette').slow || DEFAULT_ANIMATION_BPM
      },
      'rosette'
    );
    persistExperiencePlaybackStateCache(playbackState);
  }

  if (unlockedExperienceId && unlockedExperienceId === currentExperienceId && config.songId && currentSongId !== config.songId) {
    setCurrentSong(config.songId, { suppressUrlSync: true });
  }

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

function isPerfectSquareInteger(value) {
  var n = parseInt(value, 10);
  if (!isFinite(n) || n < 1) return false;
  var root = Math.round(Math.sqrt(n));
  return root * root === n;
}

function threadHasSquareFramePerfectSquareDiscovery(thread, activeShape, holeCount) {
  if (activeShape !== 'square') return false;
  if (!thread) return false;
  if (!isPerfectSquareInteger(holeCount)) return false;

  var jumpMode = sanitizeThreadJumpMode(thread.jumpMode, 'fixed');
  if (jumpMode !== 'fixed') return false;

  var jump = parseInt(thread.jump, 10);
  if (!isFinite(jump)) return false;
  return jump === 1;
}

function normalizeRosetteThreadSignature(thread, holeCount, options) {
  options = options || {};
  if (!thread || !isFinite(holeCount) || holeCount < 3) return null;
  if (thread.jumpMode && thread.jumpMode !== 'fixed') return null;

  var frameMode = sanitizeThreadFrameMode(thread.frameMode, 'outer');
  var innerHoleCountDefault = parseBoundedInt(options.innerHoleCount, 3, MAX_HOLES, getCurrentInnerStitchHoleCount());
  var sourceHoleCount = parseBoundedInt(thread.sourceHoleCount, 3, MAX_HOLES, holeCount);
  if (!thread.sourceHoleCount) {
    if (frameMode === 'inner' || frameMode === 'bridge-reverse' || frameMode === 'bridge-reverse-project') {
      sourceHoleCount = innerHoleCountDefault;
    } else {
      sourceHoleCount = holeCount;
    }
  }

  var rawJump = parseInt(thread.jump, 10);
  if (!isFinite(rawJump)) return null;
  var jump = ((rawJump % sourceHoleCount) + sourceHoleCount) % sourceHoleCount;
  if (jump === 0) return null;

  var rawStartHole = parseInt(thread.startHole, 10);
  if (!isFinite(rawStartHole)) {
    rawStartHole = 1;
  }
  var startHole = ((rawStartHole - 1) % sourceHoleCount + sourceHoleCount) % sourceHoleCount + 1;
  var jumpGcd = getRosetteGreatestCommonDivisor(jump, sourceHoleCount);
  var startHoleOrbitSize = Math.max(1, jumpGcd);
  var canonicalStartHole = ((startHole - 1) % startHoleOrbitSize + startHoleOrbitSize) % startHoleOrbitSize + 1;

  return {
    jump: jump,
    startHole: startHole,
    canonicalStartHole: canonicalStartHole,
    startHoleOrbitSize: startHoleOrbitSize,
    frameMode: frameMode,
    sourceHoleCount: sourceHoleCount
  };
}

function getRosetteGreatestCommonDivisor(a, b) {
  var x = Math.abs(Math.round(Number(a) || 0));
  var y = Math.abs(Math.round(Number(b) || 0));
  if (!x && !y) return 1;
  if (!x) return Math.max(1, y);
  if (!y) return Math.max(1, x);
  while (y !== 0) {
    var remainder = x % y;
    x = y;
    y = remainder;
  }
  return Math.max(1, x);
}

function buildRosetteSignatureKey(signature) {
  var orbitSize = Math.max(1, parseBoundedInt(signature.startHoleOrbitSize, 1, MAX_HOLES, 1));
  var canonicalStartHole = parseBoundedInt(signature.canonicalStartHole, 1, orbitSize, parseBoundedInt(signature.startHole, 1, MAX_HOLES, 1));
  return String(signature.jump) + '|' + String(canonicalStartHole) + '|' + String(signature.frameMode || 'outer') + '|' + String(signature.sourceHoleCount || 0);
}

function areRosetteSignatureMultisetsEqual(left, right) {
  if (!left || !right || left.length !== right.length) return false;

  var leftKeys = [];
  var rightKeys = [];
  for (var i = 0; i < left.length; i++) {
    leftKeys.push(buildRosetteSignatureKey(left[i]));
    rightKeys.push(buildRosetteSignatureKey(right[i]));
  }
  leftKeys.sort();
  rightKeys.sort();

  for (var k = 0; k < leftKeys.length; k++) {
    if (leftKeys[k] !== rightKeys[k]) {
      return false;
    }
  }

  return true;
}

function rotateRosetteSignature(signature, delta, holeCount) {
  var sourceCount = parseBoundedInt(signature.sourceHoleCount, 3, MAX_HOLES, holeCount);
  var startHole = ((signature.startHole - 1 + delta) % sourceCount + sourceCount) % sourceCount + 1;
  var orbitSize = Math.max(1, getRosetteGreatestCommonDivisor(signature.jump, sourceCount));
  return {
    jump: signature.jump,
    startHole: startHole,
    canonicalStartHole: ((startHole - 1) % orbitSize + orbitSize) % orbitSize + 1,
    startHoleOrbitSize: orbitSize,
    frameMode: signature.frameMode,
    sourceHoleCount: sourceCount
  };
}

function doesRosetteSubsetMatchRecipe(candidateSubset, recipeSignatures, holeCount, allowRotation) {
  if (!allowRotation) {
    return areRosetteSignatureMultisetsEqual(candidateSubset, recipeSignatures);
  }

  for (var delta = 0; delta < holeCount; delta++) {
    var rotatedRecipe = [];
    for (var i = 0; i < recipeSignatures.length; i++) {
      rotatedRecipe.push(rotateRosetteSignature(recipeSignatures[i], delta, holeCount));
    }
    if (areRosetteSignatureMultisetsEqual(candidateSubset, rotatedRecipe)) {
      return true;
    }
  }

  return false;
}

function findRosetteSubsetMatch(candidateSignatures, recipeSignatures, holeCount, allowRotation) {
  if (!candidateSignatures || !recipeSignatures) return false;
  var targetSize = recipeSignatures.length;
  if (targetSize < 1 || candidateSignatures.length < targetSize) return false;

  var subset = [];

  function search(startIndex) {
    if (subset.length === targetSize) {
      return doesRosetteSubsetMatchRecipe(subset, recipeSignatures, holeCount, allowRotation);
    }

    var needed = targetSize - subset.length;
    for (var i = startIndex; i <= candidateSignatures.length - needed; i++) {
      subset.push(candidateSignatures[i]);
      if (search(i + 1)) {
        return true;
      }
      subset.pop();
    }

    return false;
  }

  return search(0);
}

function findMatchingRosetteDiscoveryRecipe() {
  var holeCount = parseInt(holesSlider.value, 10);
  if (!isFinite(holeCount) || holeCount < 3) return null;

  var candidateSignatures = [];
  for (var i = 0; i < threads.length; i++) {
    var signature = normalizeRosetteThreadSignature(threads[i], holeCount, {
      innerHoleCount: getCurrentInnerStitchHoleCount()
    });
    if (signature) {
      candidateSignatures.push(signature);
    }
  }

  for (var r = 0; r < ROSETTE_DISCOVERY_RECIPES.length; r++) {
    var recipe = ROSETTE_DISCOVERY_RECIPES[r];
    if (!recipe) continue;
    if (parseInt(recipe.holeCount, 10) !== holeCount) continue;
    if (!recipe.threads || !recipe.threads.length) continue;
    if (recipe.requireNestedFrameEnabled && !nestedFrameEnabled) continue;
    if (isFinite(recipe.requiredNestedFrameRatio)) {
      var requiredRatio = sanitizeNestedFrameRatio(recipe.requiredNestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
      var activeRatio = sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
      if (Math.abs(requiredRatio - activeRatio) > 1e-8) continue;
    }
    if (isFinite(recipe.requiredInnerHoleCount)) {
      if (getCurrentInnerStitchHoleCount() !== parseBoundedInt(recipe.requiredInnerHoleCount, 3, MAX_HOLES, getCurrentInnerStitchHoleCount())) {
        continue;
      }
    }

    var recipeSignatures = [];
    var recipeIsValid = true;
    var recipeInnerCount = parseBoundedInt(recipe.requiredInnerHoleCount, 3, MAX_HOLES, Math.round(holeCount * sanitizeNestedFrameRatio(recipe.requiredNestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO)));
    for (var t = 0; t < recipe.threads.length; t++) {
      var recipeSignature = normalizeRosetteThreadSignature(recipe.threads[t], holeCount, {
        innerHoleCount: recipeInnerCount
      });
      if (!recipeSignature) {
        recipeIsValid = false;
        break;
      }
      recipeSignatures.push(recipeSignature);
    }
    if (!recipeIsValid) continue;

    if (findRosetteSubsetMatch(candidateSignatures, recipeSignatures, holeCount, recipe.allowRotation !== false)) {
      return recipe;
    }
  }

  return null;
}

function evaluateDiscoveryCandidates() {
  if (currentExperienceId !== 'stitching') return;

  var activeShape = currentShape;
  var activeHoleCount = parseInt(holesSlider.value, 10);
  if (activeShape !== 'circle') {
    // Keep discovery criteria consistent across stitching frames.
    currentShape = 'circle';
  }
  computePoints();

  var candidates = getDiscoveryCandidateThreads();
  var foundTriangle = false;
  var foundSquare = false;

  for (var i = 0; i < candidates.length; i++) {
    if (!foundTriangle && threadHasEquilateralTriangleDiscovery(candidates[i])) {
      foundTriangle = true;
    }
    if (!foundSquare && (threadHasSquareDiscovery(candidates[i]) || threadHasSquareFramePerfectSquareDiscovery(candidates[i], activeShape, activeHoleCount))) {
      foundSquare = true;
    }
    if (foundTriangle && foundSquare) break;
  }

  if (foundTriangle) {
    unlockDiscovery('triangle');
  }
  if (foundSquare) {
    unlockDiscovery('square');
  }
  var matchingRosetteRecipe = findMatchingRosetteDiscoveryRecipe();
  if (matchingRosetteRecipe) {
    unlockDiscovery(matchingRosetteRecipe.discoveryKey || 'rosette12');
  }

  if (activeShape !== currentShape) {
    currentShape = activeShape;
    computePoints();
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
  label.fillColor = isHighlighted ? getThemeHoleLabelHighlightColor() : getThemeHoleLabelColor();
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
  if (nestedFrameRatioValue) {
    if (!nestedFrameEnabled) {
      nestedFrameRatioValue.textContent = 'off';
    } else if (nestedFrameRatio === 0.75) {
      nestedFrameRatioValue.textContent = '3/4';
    } else {
      nestedFrameRatioValue.textContent = '1/2';
    }
  }
  if (advancedHolesNumberInput) {
    advancedHolesNumberInput.value = holesSlider.value;
  }
}

function syncNestedFrameControls() {
  if (nestedFrameEnabledInput) {
    nestedFrameEnabledInput.checked = !!nestedFrameEnabled;
  }
  if (nestedFrameRatioSelect) {
    nestedFrameRatioSelect.value = String(sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO));
    nestedFrameRatioSelect.disabled = !nestedFrameEnabled;
  }
  updateKidControlValues();
}

function getCurrentStitchHoleCount() {
  return parseBoundedInt(holesSlider && holesSlider.value, 3, MAX_HOLES, DEFAULT_HOLES);
}

function getCurrentInnerStitchHoleCount() {
  if (!nestedFrameEnabled) return 0;
  var outerCount = getCurrentStitchHoleCount();
  var ratio = sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
  var scaledInnerCount = Math.round(outerCount * ratio);
  return parseBoundedInt(scaledInnerCount, 3, MAX_HOLES, Math.max(3, Math.round(outerCount * DEFAULT_NESTED_FRAME_RATIO)));
}

function getCurrentTotalStitchHoleCount() {
  return getCurrentStitchHoleCount() + getCurrentInnerStitchHoleCount();
}

function getThreadSourceRing(thread) {
  var mode = sanitizeThreadFrameMode(thread && thread.frameMode, 'outer');
  if (mode === 'inner' || mode === 'bridge-reverse' || mode === 'bridge-reverse-project') {
    return 'inner';
  }
  return 'outer';
}

function getThreadSourceHoleCount(thread) {
  var outerCount = getCurrentStitchHoleCount();
  var innerCount = getCurrentInnerStitchHoleCount();
  var sourceRing = getThreadSourceRing(thread);
  if (sourceRing === 'inner' && nestedFrameEnabled && innerCount > 0) {
    return innerCount;
  }
  return outerCount;
}

function getCurrentJumpLimit() {
  return Math.max(1, getCurrentStitchHoleCount() - 1);
}

function normalizeThreadHoleDependentValues(thread, holeCount) {
  if (!thread) return;
  var safeHoleCount = parseBoundedInt(holeCount, 3, MAX_HOLES, getCurrentStitchHoleCount());
  thread.jump = parseBoundedInt(thread.jump, 1, Math.max(1, safeHoleCount - 1), DEFAULT_SKIP);
  thread.startHole = parseBoundedInt(thread.startHole, 1, safeHoleCount, 1);
}

function syncJumpBoundsFromHoleCount() {
  var holeCount = getCurrentStitchHoleCount();
  var jumpLimit = Math.max(1, holeCount - 1);

  if (jumpSlider) {
    jumpSlider.max = String(jumpLimit);
  }
  if (startHoleInput) {
    startHoleInput.max = String(holeCount);
  }

  for (var i = 0; i < threads.length; i++) {
    normalizeThreadHoleDependentValues(threads[i], getThreadSourceHoleCount(threads[i]));
  }

  var selected = getKidTargetThreadIndex();
  if (selected >= 0 && threads[selected] && jumpSlider) {
    var selectedJumpLimit = Math.max(1, getThreadSourceHoleCount(threads[selected]) - 1);
    jumpSlider.max = String(selectedJumpLimit);
    threads[selected].jump = parseBoundedInt(threads[selected].jump, 1, selectedJumpLimit, threads[selected].jump || 1);
    jumpSlider.value = String(threads[selected].jump);
  }
  if (selected >= 0 && threads[selected] && startHoleInput) {
    var selectedHoleCount = getThreadSourceHoleCount(threads[selected]);
    startHoleInput.max = String(selectedHoleCount);
    threads[selected].startHole = parseBoundedInt(threads[selected].startHole, 1, selectedHoleCount, threads[selected].startHole || 1);
    startHoleInput.value = String(threads[selected].startHole);
  }
}

function syncBorderControls() {
  advancedBorderEnabledInput.checked = borderEnabled;
}

function createThread(config) {
  var initialSolidColor = sanitizeThreadSolidColor(config.solidColor, config.color || '#1982c4');
  var initialColor = sanitizeThreadColor(config.color, initialSolidColor);
  if (initialColor !== 'rainbow') {
    initialSolidColor = sanitizeThreadSolidColor(initialColor, initialSolidColor);
  }

  return {
    jump: config.jump,
    width: config.width,
    color: initialColor,
    solidColor: initialSolidColor,
    startHole: parseBoundedInt(config.startHole, 1, MAX_HOLES, 1),
    sequence: null,
    jumpMode: 'fixed',
    jumpFormula: 'skip',
    jumpSequence: '',
    jumpSequenceMode: sanitizeThreadSequenceMode(config.jumpSequenceMode, 'holes'),
    connectMultiplier: 2,
    connectOffset: 0,
    frameMode: sanitizeThreadFrameMode(config.frameMode, 'outer')
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
  if (!thread) {
    return 'add';
  }
  if (thread.jumpMode === 'connect') return 'multiply';
  if (thread.jumpMode === 'sequence') return 'sequence';
  if (thread.jumpMode === 'formula') {
    return isExpressionStitchModeEnabled() ? 'formula' : 'add';
  }
  return 'add';
}

function isThreadHoleListMode(thread) {
  return !!thread &&
    thread.jumpMode === 'sequence' &&
    sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes') === 'holes';
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
    if (startHoleBlock) startHoleBlock.style.display = 'none';
    if (sequenceInputBlock) sequenceInputBlock.style.display = 'none';
    if (formulaInputBlock) formulaInputBlock.style.display = 'none';
    jumpSlider.disabled = true;
    multiplySlider.disabled = true;
    if (startHoleInput) startHoleInput.disabled = true;
    if (kidJumpSequenceInput) kidJumpSequenceInput.disabled = true;
    if (kidSequenceModeSelect) kidSequenceModeSelect.disabled = true;
    if (kidJumpFormulaInput) kidJumpFormulaInput.disabled = true;
    return;
  }

  var index = getKidTargetThreadIndex();
  var mode = 'fixed';

  if (index >= 0 && threads[index]) {
    mode = threads[index].jumpMode || 'fixed';
  }

  var isMultiplyMode = mode === 'connect';
  var isSequenceMode = mode === 'sequence';
  var isFormulaMode = isExpressionStitchModeEnabled() && mode === 'formula';
  var isFixedMode = !isMultiplyMode && !isSequenceMode && !isFormulaMode;
  var hideStartHole = index >= 0 && threads[index] && isThreadHoleListMode(threads[index]);

  addSliderBlock.style.display = isFixedMode ? '' : 'none';
  multiplySliderBlock.style.display = isMultiplyMode ? '' : 'none';
  if (startHoleBlock) startHoleBlock.style.display = hideStartHole ? 'none' : '';
  if (sequenceInputBlock) sequenceInputBlock.style.display = isSequenceMode ? '' : 'none';
  if (formulaInputBlock) formulaInputBlock.style.display = isFormulaMode ? '' : 'none';

  jumpSlider.disabled = !isFixedMode;
  multiplySlider.disabled = !isMultiplyMode;
  if (startHoleInput) startHoleInput.disabled = hideStartHole;
  if (kidJumpSequenceInput) kidJumpSequenceInput.disabled = !isSequenceMode;
  if (kidSequenceModeSelect) kidSequenceModeSelect.disabled = !isSequenceMode;
  if (kidJumpFormulaInput) kidJumpFormulaInput.disabled = !isFormulaMode;
}

function buildMagicThread() {
  var baseIndex = threads.length ? Math.max(0, selectedThreadIndex) : 0;
  var base = threads[baseIndex] || createThread({ jump: 22, width: 2, color: '#1982c4' });
  var jumpShift = (Math.floor(Math.random() * 7) + 2);
  var nextJump = base.jump + jumpShift;
  var jumpLimit = getCurrentJumpLimit();
  if (nextJump > jumpLimit) nextJump = ((nextJump - 1) % jumpLimit) + 1;

  var colorPick = magicThreadColors[Math.floor(Math.random() * magicThreadColors.length)];
  if (threads.length && threads[threads.length - 1].color === colorPick) {
    colorPick = magicThreadColors[(magicThreadColors.indexOf(colorPick) + 1) % magicThreadColors.length];
  }

  return createThread({
    jump: nextJump,
    width: DEFAULT_THREAD_SIZE,
    color: colorPick,
    startHole: parseBoundedInt(base.startHole, 1, getCurrentStitchHoleCount(), 1),
    frameMode: sanitizeThreadFrameMode(base.frameMode, 'outer')
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
      if (color !== 'rainbow') {
        thread.solidColor = sanitizeThreadSolidColor(color, thread.solidColor || '#1982c4');
      }
    });
    return;
  }

  if (paletteMode === 'triangula-banded') {
    var safeColor = normalizeTriangulaFillColor(color, triangulaBandColors.band1);
    // Keep the most recently picked palette color available across band mode switches.
    triangulaSourceColor = safeColor;
    if (triangulaConstructionMode === 'cut') {
      triangulaBandColors.band1 = safeColor;
      triangulaBandColors.band2 = safeColor;
      triangulaBandColors.band4 = safeColor;
      persistTriangulaStateCache();
      return;
    }
    if (triangulaColorMode === 'all') {
      triangulaBandColors.band1 = safeColor;
      triangulaBandColors.band2 = safeColor;
      triangulaBandColors.band4 = safeColor;
      persistTriangulaStateCache();
      return;
    }
    if (triangulaColorMode === 'band-1') {
      triangulaBandColors.band1 = safeColor;
      persistTriangulaStateCache();
      return;
    }
    if (triangulaColorMode === 'band-2') {
      triangulaBandColors.band2 = safeColor;
      persistTriangulaStateCache();
      return;
    }
    if (triangulaColorMode === 'band-4') {
      triangulaBandColors.band4 = safeColor;
      persistTriangulaStateCache();
      return;
    }
    persistTriangulaStateCache();
    return;
  }

  var targetIndex = selectedThreadIndex;
  if (targetIndex < 0 || targetIndex >= threads.length) {
    targetIndex = 0;
  }
  threads[targetIndex].color = color;
  if (color !== 'rainbow') {
    threads[targetIndex].solidColor = sanitizeThreadSolidColor(color, threads[targetIndex].solidColor || '#1982c4');
  }
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
  if (currentExperienceId === 'stitching') {
    stitchingFrameShape = sanitizeShape(nextShape, stitchingFrameShape || 'circle');
  }
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

  function getFrameModeBadge(thread) {
    if (!nestedFrameEnabled || !thread) return '';
    var mode = sanitizeThreadFrameMode(thread.frameMode, 'outer');
    if (mode === 'inner') return ' I';
    if (mode === 'bridge') return ' O->I';
    if (mode === 'bridge-reverse') return ' I->O';
    if (mode === 'bridge-reverse-project') return ' I->R';
    return ' O';
  }

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
    label.textContent = 'Thread ' + (i + 1) + getFrameModeBadge(thread);

    option.appendChild(swatch);
    option.appendChild(label);
    kidThreadMenu.appendChild(option);
  }

  var selectedIndex = getKidTargetThreadIndex();
  var selectedThread = threads[selectedIndex];
  if (selectedThread) {
    kidThreadActiveLabel.textContent = 'Thread ' + (selectedIndex + 1) + getFrameModeBadge(selectedThread);
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
  if (currentExperienceId !== 'stitching') {
    setElementDisplay(addMagicThreadBtn, false, '');
    setElementDisplay(removeLastThreadBtn, false, '');
    setElementDisplay(kidThreadPicker, false, '');
    setElementDisplay(addThreadBtn, false, '');
    setElementDisplay(advancedThreadsTitle, false, '');
    setElementDisplay(threadControlsContainer, false, '');
    syncBasicMathSliderVisibility();
    syncNestedFrameControls();
    return;
  }

  var index = getKidTargetThreadIndex();
  syncJumpBoundsFromHoleCount();
  refreshKidThreadPicker();
  if (index < 0) return;
  ensureThreadConnectConfig(threads[index]);
  var sourceHoleCount = getThreadSourceHoleCount(threads[index]);
  var sourceJumpLimit = Math.max(1, sourceHoleCount - 1);
  normalizeThreadHoleDependentValues(threads[index], sourceHoleCount);
  if (startHoleInput) {
    startHoleInput.max = String(sourceHoleCount);
    startHoleInput.value = String(threads[index].startHole);
  }
  if (jumpSlider) {
    jumpSlider.max = String(sourceJumpLimit);
  }
  jumpSlider.value = threads[index].jump;
  multiplySlider.value = threads[index].connectMultiplier;
  if (kidJumpSequenceInput) {
    kidJumpSequenceInput.value = String(threads[index].jumpSequence || '');
    kidJumpSequenceInput.placeholder = sanitizeThreadSequenceMode(threads[index].jumpSequenceMode, 'holes') === 'steps'
      ? 'e.g. 2,3,5,8'
      : 'e.g. 1,1,2,3,5,8';
  }
  if (kidSequenceModeSelect) {
    kidSequenceModeSelect.value = sanitizeThreadSequenceMode(threads[index].jumpSequenceMode, 'holes');
  }
  if (kidJumpFormulaInput) {
    kidJumpFormulaInput.value = String(threads[index].jumpFormula || 'skip');
  }
  widthSlider.value = threads[index].width;
  syncKidStitchByControl();
  syncBasicMathSliderVisibility();
  syncNestedFrameControls();
  updateKidControlValues();
}

function applyDefaultHoles() {
  holesSlider.value = String(DEFAULT_HOLES);
  if (advancedHolesNumberInput) {
    advancedHolesNumberInput.value = String(DEFAULT_HOLES);
  }
  syncJumpBoundsFromHoleCount();
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
    currentAnimationBpm = getKidTempoPresetsForSong(currentSongId).slow || DEFAULT_ANIMATION_BPM;
  }
  advancedTempoInput.value = String(currentAnimationBpm);
  advancedTempoValue.textContent = String(currentAnimationBpm);
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

function applyTempoValue(bpm, options) {
  options = options || {};
  var parsed = Math.round(Number(bpm));
  var allowedTempos = getActiveTempoOptions();
  if (!isFinite(parsed) || allowedTempos.indexOf(parsed) === -1) {
    parsed = getKidTempoPresetsForSong(currentSongId).slow || DEFAULT_ANIMATION_BPM;
  }
  currentAnimationBpm = parsed;
  syncAdvancedTempoControls();
  syncKidTempoPresetControls();
  recordCurrentExperiencePlaybackPreference();
  if (!options.suppressRedraw) {
    // Tempo change updates playback speed without resetting progress.
    redrawAnimationInPlace();
  }
  if (!options.suppressUrlSync) {
    scheduleUrlStateSync(false);
  }
}

function syncAnimateButtonLabel() {
  if (!animateBtn) return;
  if (animationPlaybackState === 'playing') {
    animateBtn.innerHTML = '<span class="pause-bars" aria-hidden="true">||</span> Pause';
    animateBtn.classList.add('is-playing');
    animateBtn.setAttribute('aria-pressed', 'true');
    animateBtn.setAttribute('aria-label', 'Pause stitch animation');
    animateBtn.title = 'Pause stitch animation';
    return;
  }
  if (animationPlaybackState === 'paused') {
    animateBtn.textContent = '▶ Resume';
    animateBtn.classList.remove('is-playing');
    animateBtn.setAttribute('aria-pressed', 'false');
    animateBtn.setAttribute('aria-label', 'Resume stitch animation');
    animateBtn.title = 'Resume stitch animation';
    return;
  }
  animateBtn.textContent = '▶ Play';
  animateBtn.classList.remove('is-playing');
  animateBtn.setAttribute('aria-pressed', 'false');
  animateBtn.setAttribute('aria-label', 'Start stitch animation');
  animateBtn.title = 'Start stitch animation';
}

function applyDefaultTempo() {
  applyTempoValue(getKidTempoPresetsForSong(currentSongId).slow || DEFAULT_ANIMATION_BPM);
}

function pauseAnimationIfActive() {
  if (!animationActive || (!animationState && !triangulaAnimationState && !squarusAnimationState && !mashrabiyaAnimationState)) return;
  animationActive = false;
  view.onFrame = null;
  animationPlaybackState = 'paused';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
}

