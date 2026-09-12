document.addEventListener('click', (event) => {
  var eventPath = (event && typeof event.composedPath === 'function') ? event.composedPath() : [];
  function eventPathContains(node) {
    if (!node) return false;
    if (eventPath && eventPath.length) {
      for (var i = 0; i < eventPath.length; i++) {
        if (eventPath[i] === node) return true;
      }
    }
    return !!(event.target && node.contains && node.contains(event.target));
  }

  function eventPathMatchesSelector(selector) {
    if (!selector || !eventPath || !eventPath.length) return false;
    for (var i = 0; i < eventPath.length; i++) {
      var entry = eventPath[i];
      if (entry && entry.nodeType === 1 && typeof entry.matches === 'function' && entry.matches(selector)) {
        return true;
      }
    }
    return false;
  }

  var clickedWithinAdvanced = eventPathContains(advancedPanel);
  var clickedAdvancedToggle = eventPathContains(gearBtn);
  var clickedWithinDiscovery = eventPathContains(discoveryPanel);
  var clickedDiscoveryToggle = eventPathContains(discoveryToggleBtn);
  var clickedThreadCard = eventPathMatchesSelector('.thread-card');
  var clickedCanvasArea = eventPathMatchesSelector('#myCanvas') || eventPathMatchesSelector('#canvas-container') || eventPathMatchesSelector('#canvas-stage');

  if (!kidThreadMenu.hasAttribute('hidden') && !kidThreadPicker.contains(event.target)) {
    kidThreadMenu.setAttribute('hidden', '');
    kidThreadToggle.setAttribute('aria-expanded', 'false');
  }
  if (!kidSongMenu.hasAttribute('hidden') && !kidSongPicker.contains(event.target)) {
    kidSongMenu.setAttribute('hidden', '');
    kidSongToggle.setAttribute('aria-expanded', 'false');
    kidSongToggle.classList.remove('is-active');
    syncSongPickerToggleButton();
  }
  if (!experienceInfoPanel.hasAttribute('hidden') && !experienceInfoPanel.contains(event.target) && !experienceInfoToggle.contains(event.target)) {
    syncExperienceInfoPanel(false);
  }
  if (advancedPanel.classList.contains('open') && clickedCanvasArea && !clickedWithinAdvanced && !clickedAdvancedToggle && !clickedThreadCard) {
    advancedPanel.classList.remove('open');
    syncAdvancedToggleButton();
  }
  if (discoveryPanel.classList.contains('open') && !clickedWithinDiscovery && !clickedDiscoveryToggle) {
    discoveryPanel.classList.remove('open');
    syncDiscoveryToggleButton();
  }
});

experienceInfoToggle.addEventListener('click', () => {
  var willOpen = experienceInfoToggle.getAttribute('aria-expanded') !== 'true';
  syncExperienceInfoPanel(willOpen);
  if (willOpen) {
    positionExperienceInfoPanel();
    experienceInfoClose.focus();
  }
});

experienceInfoClose.addEventListener('click', () => {
  syncExperienceInfoPanel(false);
  experienceInfoToggle.focus();
});

if (experienceInfoHtmlFrame) {
  experienceInfoHtmlFrame.addEventListener('load', () => {
    enforceExperienceInfoFrameAllowlist();
    attachExperienceInfoAcknowledgmentsBridge();
    if (typeof scheduleCurrentExperienceAboutNarrationPreparation === 'function') {
      scheduleCurrentExperienceAboutNarrationPreparation();
    }
  });
}

experienceNarrateToggle.addEventListener('click', () => {
  toggleExperienceNarration();
});

if (window.ResizeObserver) {
  canvasResizeObserver = new ResizeObserver(() => {
    scheduleFitCanvasToStage();
  });
  canvasResizeObserver.observe(canvasStage);
  if (canvasContainer) {
    canvasResizeObserver.observe(canvasContainer);
  }
}

window.addEventListener('resize', scheduleFitCanvasToStage);
window.addEventListener('resize', function() {
  renderExperienceTitleStatic();
  refreshExperienceInfoPanelPlacement();
});
window.addEventListener('orientationchange', scheduleFitCanvasToStage);
window.addEventListener('orientationchange', function() {
  renderExperienceTitleStatic();
  refreshExperienceInfoPanelPlacement();
});
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', scheduleFitCanvasToStage);
  window.visualViewport.addEventListener('resize', function() {
    renderExperienceTitleStatic();
    refreshExperienceInfoPanelPlacement();
  });
}

window.addEventListener('pageshow', () => {
  if (startupTailPreviewInProgress) {
    return;
  }

  if (!hasUrlStateParams()) {
    if (!hasAppliedParamlessStitchingRandomization) {
      applyRandomizedStitchingStateForParamlessLoad();
      applyDefaultTempo();
    }
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    renderThreadControls();
    syncKidControlsFromSelectedThread();
    redrawForPathChange();
  }
  applyExperienceOverlayPosition(EXPERIENCE_OVERLAY_POSITION_CLASS);
  renderExperienceTitleStatic();
  applyStateFromCurrentUrl({ forceUrlSync: false });
  syncKidControlsFromSelectedThread();
});

window.addEventListener('popstate', function() {
  applyStateFromCurrentUrl({ forceUrlSync: false });
});

addMagicThreadBtn.addEventListener('click', () => {
  threads.push(buildMagicThread());
  // Keep basic controls focused on the newest magic thread.
  selectedThreadIndex = threads.length - 1;
  renderThreadControls();
  syncKidControlsFromSelectedThread();
  redrawForPathChange();
});

removeLastThreadBtn.addEventListener('click', () => {
  if (threads.length <= 1) return;
  var indexToRemove = getKidTargetThreadIndex();
  if (indexToRemove < 0 || indexToRemove >= threads.length) return;
  threads.splice(indexToRemove, 1);
  if (!threads.length) {
    threads.push(buildMagicThread());
    selectedThreadIndex = 0;
  } else {
    selectedThreadIndex = Math.min(indexToRemove, threads.length - 1);
  }
  renderThreadControls();
  syncKidControlsFromSelectedThread();
  redrawForPathChange();
});

holeNumbersToggleBtn.addEventListener('click', () => {
  showHoleNumbers = !showHoleNumbers;
  syncHoleNumberToggles();
  // Labels only; keep animation continuity.
  redrawAnimationInPlace();
});

musicToggleBtn.addEventListener('click', () => {
  isMusicMuted = !isMusicMuted;
  syncMusicToggleButton();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
});

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
}

/* ------------------------------
  STITCHING AND CONTROL EVENT LISTENERS
------------------------------ */
document.addEventListener('pointerdown', function(event) {
  var slider = event.target && event.target.closest ? event.target.closest('input[type="range"]') : null;
  if (!slider) return;
  markSliderAsMoving(slider);
  updateMusicPlaybackState();
});

document.addEventListener('input', function(event) {
  var slider = event.target && event.target.matches && event.target.matches('input[type="range"]') ? event.target : null;
  if (!slider) return;
  markSliderAsMoving(slider);
  updateMusicPlaybackState();
});

document.addEventListener('keyup', function(event) {
  var slider = event.target && event.target.matches && event.target.matches('input[type="range"]') ? event.target : null;
  if (!slider) return;
  settleSliderMotion(slider);
});

document.addEventListener('pointerup', settleAllSliderMotion);
document.addEventListener('mouseup', settleAllSliderMotion);
document.addEventListener('touchend', settleAllSliderMotion, { passive: true });
document.addEventListener('touchcancel', settleAllSliderMotion, { passive: true });
document.addEventListener('pointercancel', settleAllSliderMotion);
document.addEventListener('blur', function(event) {
  var slider = event.target && event.target.matches && event.target.matches('input[type="range"]') ? event.target : null;
  if (!slider) return;
  settleSliderMotion(slider);
}, true);

function handleHolesSliderChange() {
  syncJumpBoundsFromHoleCount();
  renderThreadControls();
  updateKidControlValues();
  // Hole count changes point geometry and stitch path.
  redrawForPathChange();
}

function handleAdvancedHolesNumberInput() {
  if (!advancedHolesNumberInput) return;
  if (advancedHolesNumberInput.value === '') return;
  var holeCount = parseInt(advancedHolesNumberInput.value, 10);
  if (!isFinite(holeCount)) return;
  if (holeCount < 3 || holeCount > MAX_HOLES) return;
  holesSlider.value = String(holeCount);
  handleHolesSliderChange();
}

function handleAdvancedHoleRotationInput(commitValue) {
  if (!advancedHoleRotationInput) return;
  var holeCount = getCurrentStitchHoleCount();
  var nextRotation = sanitizeHoleNumberRotation(advancedHoleRotationInput.value, holeCount, holeNumberRotation);
  holeNumberRotation = nextRotation;
  syncHoleNumberRotationControls();
  if (commitValue) {
    scheduleUrlStateSync(false);
  }
  redrawForPathChange();
}

function handleAdvancedHolesNumberCommit() {
  if (!advancedHolesNumberInput) return;
  if (advancedHolesNumberInput.value === '') {
    advancedHolesNumberInput.value = String(getCurrentStitchHoleCount());
    return;
  }
  var holeCount = parseBoundedInt(advancedHolesNumberInput.value, 3, MAX_HOLES, getCurrentStitchHoleCount());
  advancedHolesNumberInput.value = String(holeCount);
  holesSlider.value = String(holeCount);
  handleHolesSliderChange();
}

holesSlider.addEventListener('input', handleHolesSliderChange);
holesSlider.addEventListener('change', handleHolesSliderChange);
if (advancedHolesNumberInput) {
  advancedHolesNumberInput.addEventListener('input', handleAdvancedHolesNumberInput);
  advancedHolesNumberInput.addEventListener('change', handleAdvancedHolesNumberCommit);
  advancedHolesNumberInput.addEventListener('blur', handleAdvancedHolesNumberCommit);
}
if (advancedHoleRotationInput) {
  advancedHoleRotationInput.addEventListener('input', function() {
    handleAdvancedHoleRotationInput(false);
  });
  advancedHoleRotationInput.addEventListener('change', function() {
    handleAdvancedHoleRotationInput(true);
  });
}
if (nestedFrameEnabledInput) {
  nestedFrameEnabledInput.addEventListener('change', function() {
    nestedFrameEnabled = !!nestedFrameEnabledInput.checked;
    syncNestedFrameControls();
    renderThreadControls();
    redrawForPathChange();
  });
}
if (nestedFrameRatioSelect) {
  nestedFrameRatioSelect.addEventListener('change', function() {
    nestedFrameRatio = sanitizeNestedFrameRatio(nestedFrameRatioSelect.value, nestedFrameRatio);
    syncNestedFrameControls();
    redrawForPathChange();
  });
}
advancedHoleNumbersToggle.addEventListener('change', () => {
  showHoleNumbers = advancedHoleNumbersToggle.checked;
  syncHoleNumberToggles();
  // Labels only; keep animation continuity.
  redrawAnimationInPlace();
});
advancedBorderEnabledInput.addEventListener('change', () => {
  borderEnabled = advancedBorderEnabledInput.checked;
  syncBorderControls();
  // Border is style-only and should not reset animation progress.
  redrawAnimationInPlace();
});
kidStitchBySelect.addEventListener('change', () => {
  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex < 0 || !threads[targetIndex]) return;

  var thread = threads[targetIndex];
  var choice = kidStitchBySelect.value;

  if (choice === 'multiply') {
    thread.jumpMode = 'connect';
    thread.connectMultiplier = parseBoundedInt(thread.connectMultiplier, 1, 12, 2);
  } else if (choice === 'sequence') {
    thread.jumpMode = 'sequence';
    thread.jumpSequenceMode = sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes');
    thread.jumpSequence = String(thread.jumpSequence || (thread.jumpSequenceMode === 'steps' ? '2,3,5,8' : '1,1,2,3,5,8'));
  } else if (choice === 'formula' && isExpressionStitchModeEnabled()) {
    thread.jumpMode = 'formula';
    thread.jumpFormula = String(thread.jumpFormula || 'targetHole = currentHole + 1');
  } else if (choice === 'add') {
    if (thread.jumpMode === 'connect' || thread.jumpMode === 'sequence' || thread.jumpMode === 'formula') {
      thread.jumpMode = 'fixed';
    }
  }

  renderThreadControls();
  syncKidControlsFromSelectedThread();
  redrawForPathChange();
});

if (kidJumpSequenceInput) {
  kidJumpSequenceInput.addEventListener('input', () => {
    var targetIndex = getKidTargetThreadIndex();
    if (targetIndex < 0 || !threads[targetIndex]) return;
    var thread = threads[targetIndex];
    thread.jumpMode = 'sequence';
    thread.jumpSequenceMode = sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes');
    thread.jumpSequence = kidJumpSequenceInput.value;
    kidStitchBySelect.value = 'sequence';
    syncBasicMathSliderVisibility();
    renderThreadControls();
    redrawForPathChange();
  });
}

if (kidSequenceModeSelect) {
  kidSequenceModeSelect.addEventListener('change', () => {
    var targetIndex = getKidTargetThreadIndex();
    if (targetIndex < 0 || !threads[targetIndex]) return;
    var thread = threads[targetIndex];
    thread.jumpMode = 'sequence';
    thread.jumpSequenceMode = sanitizeThreadSequenceMode(kidSequenceModeSelect.value, 'holes');
    if (kidJumpSequenceInput) {
      kidJumpSequenceInput.placeholder = thread.jumpSequenceMode === 'steps'
        ? 'e.g. 2,3,5,8'
        : 'e.g. 1,1,2,3,5,8';
    }
    kidStitchBySelect.value = 'sequence';
    syncBasicMathSliderVisibility();
    renderThreadControls();
    redrawForPathChange();
  });
}

if (kidJumpFormulaInput) {
  kidJumpFormulaInput.addEventListener('input', () => {
    if (!isExpressionStitchModeEnabled()) return;
    var targetIndex = getKidTargetThreadIndex();
    if (targetIndex < 0 || !threads[targetIndex]) return;
    var thread = threads[targetIndex];
    thread.jumpMode = 'formula';
    thread.jumpFormula = kidJumpFormulaInput.value;
    kidStitchBySelect.value = 'formula';
    syncBasicMathSliderVisibility();
    renderThreadControls();
    redrawForPathChange();
  });
}

function syncExpressionStitchModeOptionVisibility() {
  if (!kidStitchBySelect) return;

  var expressionOption = kidStitchBySelect.querySelector('option[value="formula"]');
  if (isExpressionStitchModeEnabled()) {
    if (!expressionOption) {
      expressionOption = document.createElement('option');
      expressionOption.value = 'formula';
      expressionOption.textContent = 'Expression';
      kidStitchBySelect.appendChild(expressionOption);
    }
    return;
  }

  if (expressionOption) {
    expressionOption.remove();
  }

  if (kidStitchBySelect.value === 'formula') {
    kidStitchBySelect.value = 'add';
  }
}

syncExpressionStitchModeOptionVisibility();
jumpSlider.addEventListener('input', () => {
  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex < 0) return;
  if (threads[targetIndex].jumpMode === 'connect') return;
  var jumpLimit = getCurrentJumpLimit();
  updateKidControlValues();
  threads[targetIndex].jump = parseBoundedInt(jumpSlider.value, 1, jumpLimit, threads[targetIndex].jump || 1);
  jumpSlider.value = String(threads[targetIndex].jump);
  renderThreadControls();
  redrawForPathChange();
});

if (startHoleInput) {
  function handleStartHoleInputChange() {
    var targetIndex = getKidTargetThreadIndex();
    if (targetIndex < 0 || !threads[targetIndex]) return;
    if (startHoleInput.value === '') return;
    var holeCount = getCurrentStitchHoleCount();
    threads[targetIndex].startHole = parseBoundedInt(startHoleInput.value, 1, holeCount, threads[targetIndex].startHole || 1);
    startHoleInput.value = String(threads[targetIndex].startHole);
    updateKidControlValues();
    renderThreadControls();
    redrawForPathChange();
  }

  function settleStartHolePlaybackMotion() {
    settleSliderMotion(startHoleInput);
  }

  function beginStartHolePlaybackMotion() {
    markSliderAsMoving(startHoleInput);
    updateMusicPlaybackState();
  }

  startHoleInput.addEventListener('pointerdown', beginStartHolePlaybackMotion);
  startHoleInput.addEventListener('input', function() {
    beginStartHolePlaybackMotion();
    handleStartHoleInputChange();
  });
  startHoleInput.addEventListener('change', function() {
    beginStartHolePlaybackMotion();
    handleStartHoleInputChange();
    settleStartHolePlaybackMotion();
  });
  startHoleInput.addEventListener('blur', settleStartHolePlaybackMotion);
}
multiplySlider.addEventListener('input', () => {
  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex < 0 || !threads[targetIndex]) return;
  ensureThreadConnectConfig(threads[targetIndex]);
  threads[targetIndex].jumpMode = 'connect';
  threads[targetIndex].connectMultiplier = parseInt(multiplySlider.value, 10);
  updateKidControlValues();
  renderThreadControls();
  syncKidControlsFromSelectedThread();
  redrawForPathChange();
});
widthSlider.addEventListener('input', () => {
  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex < 0) return;
  updateKidControlValues();
  threads[targetIndex].width = parseInt(widthSlider.value, 10);
  renderThreadControls();
  // Stroke width is style-only for the already-determined route.
  redrawAnimationInPlace();
});

animateBtn.addEventListener('click', toggleAnimationPlayback);

discoveryToggleBtn.addEventListener('click', () => {
  discoveryPanel.classList.toggle('open');
  if (discoveryPanel.classList.contains('open')) {
    hasUnseenDiscoveries = false;
  }
  syncDiscoveryToggleButton();
});

closeDiscoveryBtn.addEventListener('click', () => {
  discoveryPanel.classList.remove('open');
  syncDiscoveryToggleButton();
});

if (discoveryPassphraseForm) {
  discoveryPassphraseForm.addEventListener('submit', function(event) {
    event.preventDefault();
    submitDiscoveryPassphraseEntry();
  });
}

gearBtn.addEventListener('click', () => {
  advancedPanel.classList.toggle('open');
  syncAdvancedToggleButton();
});

closeAdvancedBtn.addEventListener('click', () => {
  advancedPanel.classList.remove('open');
  syncAdvancedToggleButton();
});

if (backToStitchingBtn) {
  backToStitchingBtn.addEventListener('click', () => {
    var startPoint = getElementCenterPoint(backToStitchingBtn);
    var endPoint = getElementCenterPoint(experienceInline) || getElementCenterPoint(canvasStage);
    animateReturnToStitchingTrail(startPoint, endPoint);

    window.setTimeout(function() {
      setCurrentExperience('stitching');
      redrawForPathChange();
      discoveryPanel.classList.remove('open');
      syncDiscoveryToggleButton();
    }, 110);
  });
}

document.querySelectorAll('.color-dot').forEach((dot) => {
  dot.addEventListener('click', () => {
    if (!threads.length) return;
    if (dot.id === 'palette-custom-color-btn') return;
    applyExperiencePaletteColorChoice(dot.getAttribute('data-color') || '#1982c4');
    renderThreadControls();
    redrawAnimationInPlace();
  });
});

if (paletteCustomColorBtn && paletteCustomColorInput) {
  function syncPaletteCustomInputFromActiveColor() {
    if (!threads.length) return;
    var initialColor = getActiveTrailColor();
    if (initialColor && initialColor !== 'rainbow') {
      paletteCustomColorInput.value = sanitizeThreadSolidColor(initialColor, paletteCustomColorInput.value || '#1982c4');
    }
  }

  paletteCustomColorBtn.addEventListener('pointerdown', syncPaletteCustomInputFromActiveColor);
  paletteCustomColorBtn.addEventListener('touchstart', syncPaletteCustomInputFromActiveColor, { passive: true });
  paletteCustomColorBtn.addEventListener('mousedown', syncPaletteCustomInputFromActiveColor);

  paletteCustomColorInput.addEventListener('input', (event) => {
    if (!threads.length) return;
    var chosenColor = sanitizeThreadSolidColor(event.target.value, '#1982c4');
    applyExperiencePaletteColorChoice(chosenColor);
    renderThreadControls();
    redrawAnimationInPlace();
  });
}

document.querySelectorAll('.shape-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    setCurrentShape(btn.getAttribute('data-shape') || 'circle');
  });
});

advancedShapeSelect.addEventListener('change', () => {
  setCurrentShape(advancedShapeSelect.value || 'circle');
});

advancedTempoInput.addEventListener('change', () => {
  applyTempoValue(advancedTempoInput.value);
});

resetTempoBtn.addEventListener('click', () => {
  applyDefaultTempo();
});

kidTempoSlowBtn.addEventListener('click', () => {
  var presets = getKidTempoPresetsForSong(currentSongId);
  applyTempoValue(presets.slow);
});

kidTempoNormalBtn.addEventListener('click', () => {
  var presets = getKidTempoPresetsForSong(currentSongId);
  applyTempoValue(presets.normal);
});

kidTempoFastBtn.addEventListener('click', () => {
  var presets = getKidTempoPresetsForSong(currentSongId);
  applyTempoValue(presets.fast);
});

exportSvgBtn.addEventListener('click', () => {
  openExportOptionsModal();
});

exportConfirmBtn.addEventListener('click', () => {
  runExportFromModalSelection();
});

exportCancelBtn.addEventListener('click', () => {
  closeExportOptionsModal();
});

exportOptionsModal.addEventListener('click', (event) => {
  if (event.target === exportOptionsModal) {
    closeExportOptionsModal();
  }
});

if (kidSaveToggleBtn) {
  kidSaveToggleBtn.addEventListener('click', () => {
    if (kidSaveModal && kidSaveModal.classList.contains('open')) {
      closeKidSaveModal();
      return;
    }
    openKidSaveModal();
  });
}

if (kidSaveCancelBtn) {
  kidSaveCancelBtn.addEventListener('click', () => {
    closeKidSaveModal();
  });
}

if (kidSaveImageOptionBtn) {
  kidSaveImageOptionBtn.addEventListener('click', () => {
    runKidFriendlySaveSelection('image');
  });
}

if (kidSaveMakeOptionBtn) {
  kidSaveMakeOptionBtn.addEventListener('click', () => {
    runKidFriendlySaveSelection('make');
  });
}

if (kidSaveModal) {
  kidSaveModal.addEventListener('click', (event) => {
    if (event.target === kidSaveModal) {
      closeKidSaveModal();
    }
  });
}

if (experienceAcknowledgmentsToggle) {
  experienceAcknowledgmentsToggle.addEventListener('click', () => {
    triggerAcknowledgmentsViewerOpen();
  });
}

if (acknowledgmentsCloseBtn) {
  acknowledgmentsCloseBtn.addEventListener('click', () => {
    closeAcknowledgmentsViewer();
    if (experienceAcknowledgmentsToggle) {
      experienceAcknowledgmentsToggle.focus();
    }
  });
}

if (acknowledgmentsModal) {
  acknowledgmentsModal.addEventListener('click', (event) => {
    if (event.target === acknowledgmentsModal) {
      closeAcknowledgmentsViewer();
    }
  });
}

if (acknowledgmentsPrevBtn) {
  acknowledgmentsPrevBtn.addEventListener('click', () => {
    var lines = acknowledgmentsLinesCache && acknowledgmentsLinesCache.length
      ? acknowledgmentsLinesCache
      : ACKNOWLEDGMENTS_FALLBACK_LINES;
    if (!lines.length) return;
    acknowledgmentsViewerState.lineIndex = Math.max(0, acknowledgmentsViewerState.lineIndex - 1);
    renderAcknowledgmentsLine(lines);
    if (acknowledgmentsViewerState.autoPlay) {
      scheduleAcknowledgmentsAutoplayTick(lines);
    }
  });
}

if (acknowledgmentsNextBtn) {
  acknowledgmentsNextBtn.addEventListener('click', () => {
    var lines = acknowledgmentsLinesCache && acknowledgmentsLinesCache.length
      ? acknowledgmentsLinesCache
      : ACKNOWLEDGMENTS_FALLBACK_LINES;
    if (!lines.length) return;
    acknowledgmentsViewerState.lineIndex = Math.min(lines.length - 1, acknowledgmentsViewerState.lineIndex + 1);
    renderAcknowledgmentsLine(lines);
    if (acknowledgmentsViewerState.autoPlay) {
      scheduleAcknowledgmentsAutoplayTick(lines);
    }
  });
}

if (acknowledgmentsRestartBtn) {
  acknowledgmentsRestartBtn.addEventListener('click', () => {
    var lines = acknowledgmentsLinesCache && acknowledgmentsLinesCache.length
      ? acknowledgmentsLinesCache
      : ACKNOWLEDGMENTS_FALLBACK_LINES;
    acknowledgmentsViewerState.lineIndex = 0;
    renderAcknowledgmentsLine(lines);
    if (acknowledgmentsViewerState.autoPlay) {
      scheduleAcknowledgmentsAutoplayTick(lines);
    }
  });
}

if (acknowledgmentsAutoplayBtn) {
  acknowledgmentsAutoplayBtn.addEventListener('click', () => {
    var lines = acknowledgmentsLinesCache && acknowledgmentsLinesCache.length
      ? acknowledgmentsLinesCache
      : ACKNOWLEDGMENTS_FALLBACK_LINES;
    acknowledgmentsViewerState.autoPlay = !acknowledgmentsViewerState.autoPlay;
    syncAcknowledgmentsControls(lines.length);
    scheduleAcknowledgmentsAutoplayTick(lines);
  });
}

window.addEventListener('message', function(event) {
  if (!event || !event.data) return;
  if (event.source && experienceInfoHtmlFrame && event.source !== experienceInfoHtmlFrame.contentWindow) {
    return;
  }
  var data = event.data;
  if (typeof data === 'string') {
    if (data === 'stitchlab-open-acknowledgments') {
      triggerAcknowledgmentsViewerOpen();
    }
    return;
  }
  if (typeof data !== 'object' || data === null) return;

  if (data.type === 'stitchlab-about-narration-text' || data.type === 'stitchlab-about-narration-response') {
    var bridgedText = cacheAboutNarrationBridgeText(data.path || '', data.text || '');
    if (data.type === 'stitchlab-about-narration-response') {
      var requestId = typeof data.requestId === 'string' ? data.requestId : '';
      var pending = requestId ? aboutNarrationBridgePendingByRequestId[requestId] : null;
      if (pending) {
        delete aboutNarrationBridgePendingByRequestId[requestId];
        var expectedPath = pending.expectedPath || '';
        var responsePath = normalizeLoadedAboutDocPath(data.path || '');
        if (!bridgedText) {
          pending.reject(new Error('Narration bridge response had no text'));
        } else if (expectedPath && responsePath && expectedPath !== responsePath) {
          pending.reject(new Error('Narration bridge response path mismatch'));
        } else {
          pending.resolve(bridgedText);
        }
      }
    }
    return;
  }

  if (data.type === 'stitchlab-open-acknowledgments') {
    triggerAcknowledgmentsViewerOpen(!!data.autoPlay);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (acknowledgmentsModal && acknowledgmentsModal.classList.contains('open')) {
    closeAcknowledgmentsViewer();
    return;
  }
  if (kidSaveModal.classList.contains('open')) {
    closeKidSaveModal();
    return;
  }
  if (exportOptionsModal.classList.contains('open')) {
    closeExportOptionsModal();
    return;
  }
  if (!experienceInfoPanel.hasAttribute('hidden')) {
    syncExperienceInfoPanel(false);
    experienceInfoToggle.focus();
    return;
  }
  if (advancedPanel.classList.contains('open')) {
    advancedPanel.classList.remove('open');
    syncAdvancedToggleButton();
    return;
  }
  if (discoveryPanel.classList.contains('open')) {
    discoveryPanel.classList.remove('open');
    syncDiscoveryToggleButton();
    return;
  }
});

if (addThreadBtn) {
  addThreadBtn.addEventListener('click', () => {
    threads.push(buildMagicThread());
    selectedThreadIndex = threads.length - 1;
    renderThreadControls();
    syncKidControlsFromSelectedThread();
    redrawForPathChange();
  });
}

if (triangulaColorScopeSelect) {
  triangulaColorScopeSelect.addEventListener('change', () => {
    triangulaColorMode = triangulaColorScopeSelect.value || 'all';
    if (currentExperienceId === 'triangula' && triangulaConstructionMode === 'shrink-duplicate') {
      var activeColor = normalizeTriangulaFillColor(
        triangulaSourceColor,
        triangulaBandColors.band1
      );
      if (triangulaColorMode === 'band-1') {
        triangulaBandColors.band1 = activeColor;
      } else if (triangulaColorMode === 'band-2') {
        triangulaBandColors.band2 = activeColor;
      } else if (triangulaColorMode === 'band-4') {
        triangulaBandColors.band4 = activeColor;
      }
    }
    persistTriangulaStateCache();
    syncTriangulaControls();
    redrawAnimationInPlace();
  });
}

if (triangulaConstructionModeSelect) {
  triangulaConstructionModeSelect.addEventListener('change', () => {
    triangulaConstructionMode = triangulaConstructionModeSelect.value || 'shrink-duplicate';
    persistTriangulaStateCache();
    syncTriangulaControls();
    redrawForPathChange();
  });
}

if (triangulaStartSlider) {
  triangulaStartSlider.addEventListener('input', () => {
    var startCountFromSlider = getTriangulaCountFromSliderIndex(triangulaStartSlider.value, 'start', triangulaStartCount);
    applyTriangulaCountUpdate(startCountFromSlider, triangulaTargetCount, true);
  });
  triangulaStartSlider.addEventListener('change', () => {
    var startCountFromSlider = getTriangulaCountFromSliderIndex(triangulaStartSlider.value, 'start', triangulaStartCount);
    applyTriangulaCountUpdate(startCountFromSlider, triangulaTargetCount, false);
    settleSliderMotion(triangulaStartSlider);
  });
}

if (triangulaTargetSlider) {
  triangulaTargetSlider.addEventListener('input', () => {
    var targetCountFromSlider = getTriangulaCountFromSliderIndex(triangulaTargetSlider.value, 'target', triangulaTargetCount);
    applyTriangulaCountUpdate(triangulaStartCount, targetCountFromSlider, true);
  });
  triangulaTargetSlider.addEventListener('change', () => {
    var targetCountFromSlider = getTriangulaCountFromSliderIndex(triangulaTargetSlider.value, 'target', triangulaTargetCount);
    applyTriangulaCountUpdate(triangulaStartCount, targetCountFromSlider, false);
    settleSliderMotion(triangulaTargetSlider);
  });
}

if (triangulaFitModeSelect) {
  triangulaFitModeSelect.addEventListener('change', () => {
    triangulaFitMode = triangulaFitModeSelect.value || 'dynamic';
    syncTriangulaControls();
    redrawAnimationInPlace();
  });
}

if (triangulaFractalModeSelect) {
  triangulaFractalModeSelect.addEventListener('change', () => {
    triangulaFractalMode = triangulaFractalModeSelect.value === 'parallel' ? 'parallel' : 'series';
    syncTriangulaControls();
    redrawForPathChange();
  });
}

if (squarusOrderSelect) {
  squarusOrderSelect.addEventListener('change', () => {
    squarusOrder = parseBoundedInt(squarusOrderSelect.value, 1, 6, squarusOrder);
    var maxPieces = getSquarusTotalPiecesForOrder(squarusOrder);
    squarusPieceCount = normalizeSquarusPieceCount(maxPieces, maxPieces, squarusOrder);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusOrderInlineSelect) {
  squarusOrderInlineSelect.addEventListener('change', () => {
    squarusOrder = parseBoundedInt(squarusOrderInlineSelect.value, 1, 6, squarusOrder);
    var maxPieces = getSquarusTotalPiecesForOrder(squarusOrder);
    squarusPieceCount = normalizeSquarusPieceCount(maxPieces, maxPieces, squarusOrder);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusLayoutSelect) {
  squarusLayoutSelect.addEventListener('change', () => {
    squarusLayout = squarusLayoutSelect.value || 'grid-packing';
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusLayoutInlineSelect) {
  squarusLayoutInlineSelect.addEventListener('change', () => {
    squarusLayout = squarusLayoutInlineSelect.value || 'grid-packing';
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusContactModeInlineSelect) {
  squarusContactModeInlineSelect.addEventListener('change', () => {
    squarusContactMode = sanitizeSquarusContactMode(squarusContactModeInlineSelect.value, squarusContactMode);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusAnimationModeSelect) {
  squarusAnimationModeSelect.addEventListener('change', () => {
    squarusAnimationMode = sanitizeSquarusAnimationMode(squarusAnimationModeSelect.value, squarusAnimationMode);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusContactModeSelect) {
  squarusContactModeSelect.addEventListener('change', () => {
    squarusContactMode = sanitizeSquarusContactMode(squarusContactModeSelect.value, squarusContactMode);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusPieceCountSlider) {
  squarusPieceCountSlider.addEventListener('input', () => {
    squarusPieceCount = normalizeSquarusPieceCount(squarusPieceCountSlider.value, squarusPieceCount, squarusOrder);
    syncSquarusControls();
    redrawForPathChange();
  });
  squarusPieceCountSlider.addEventListener('change', () => {
    squarusPieceCount = normalizeSquarusPieceCount(squarusPieceCountSlider.value, squarusPieceCount, squarusOrder);
    syncSquarusControls();
    settleSliderMotion(squarusPieceCountSlider);
  });
}

function randomizeSquarusSequenceSeed() {
  var maxIndex = getSquarusSequenceMaxIndex(squarusOrder);
  if (maxIndex <= 0) {
    squarusSequenceSeed = 0;
  } else if (parseBoundedInt(squarusOrder, 1, 6, squarusOrder) <= 4) {
    squarusSequenceSeed = Math.floor(Math.random() * (maxIndex + 1));
  } else {
    squarusSequenceSeed = Math.floor(Math.random() * maxIndex) + 1;
  }
  syncSquarusControls();
  redrawForPathChange();
}

if (squarusSequenceSlider) {
  squarusSequenceSlider.addEventListener('input', () => {
    squarusSequenceSeed = normalizeSquarusSequenceSeed(squarusSequenceSlider.value, squarusSequenceSeed, squarusOrder);
    syncSquarusControls();
    redrawForPathChange();
  });
  squarusSequenceSlider.addEventListener('change', () => {
    squarusSequenceSeed = normalizeSquarusSequenceSeed(squarusSequenceSlider.value, squarusSequenceSeed, squarusOrder);
    syncSquarusControls();
    settleSliderMotion(squarusSequenceSlider);
  });
}

if (squarusSequenceNumberInput) {
  squarusSequenceNumberInput.addEventListener('input', () => {
    squarusSequenceSeed = normalizeSquarusSequenceSeed(squarusSequenceNumberInput.value, squarusSequenceSeed, squarusOrder);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusSequenceRandomizeBtn) {
  squarusSequenceRandomizeBtn.addEventListener('click', () => {
    randomizeSquarusSequenceSeed();
  });
}

if (squarusSequenceRandomizeAdvancedBtn) {
  squarusSequenceRandomizeAdvancedBtn.addEventListener('click', () => {
    randomizeSquarusSequenceSeed();
  });
}

if (mashrabiyaFoldSelect) {
  mashrabiyaFoldSelect.addEventListener('change', () => {
    mashrabiyaFold = sanitizeMashrabiyaFold(mashrabiyaFoldSelect.value, mashrabiyaFold);
    syncMashrabiyaControls();
    redrawForPathChange();
  });
}

if (mashrabiyaFillBorderSlider) {
  mashrabiyaFillBorderSlider.addEventListener('input', () => {
    mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderSlider.value, mashrabiyaFillBorderWidth);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

if (mashrabiyaKeepConstructionLinesInput) {
  mashrabiyaKeepConstructionLinesInput.addEventListener('change', () => {
    mashrabiyaKeepConstructionLines = !!mashrabiyaKeepConstructionLinesInput.checked;
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

if (advancedMashrabiyaFillBorderInput) {
  advancedMashrabiyaFillBorderInput.addEventListener('input', () => {
    if (advancedMashrabiyaFillBorderInput.value === '') return;
    mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(advancedMashrabiyaFillBorderInput.value, mashrabiyaFillBorderWidth);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
  advancedMashrabiyaFillBorderInput.addEventListener('change', () => {
    mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(advancedMashrabiyaFillBorderInput.value, mashrabiyaFillBorderWidth);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

if (mashrabiyaStarColorInput) {
  mashrabiyaStarColorInput.addEventListener('input', () => {
    mashrabiyaStarColor = sanitizeHexColor(mashrabiyaStarColorInput.value, mashrabiyaStarColor);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

if (mashrabiyaPetalColorInput) {
  mashrabiyaPetalColorInput.addEventListener('input', () => {
    mashrabiyaPetalColor = sanitizeHexColor(mashrabiyaPetalColorInput.value, mashrabiyaPetalColor);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

if (mashrabiyaPointColorInput) {
  mashrabiyaPointColorInput.addEventListener('input', () => {
    mashrabiyaPointColor = sanitizeHexColor(mashrabiyaPointColorInput.value, mashrabiyaPointColor);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

kidThreadToggle.addEventListener('click', () => {
  var isOpen = !kidThreadMenu.hasAttribute('hidden');
  if (isOpen) {
    kidThreadMenu.setAttribute('hidden', '');
    kidThreadToggle.setAttribute('aria-expanded', 'false');
  } else {
    kidThreadMenu.removeAttribute('hidden');
    kidThreadToggle.setAttribute('aria-expanded', 'true');
  }
});

kidSongToggle.addEventListener('click', () => {
  if (kidSongToggle.disabled) return;
  if (hasUnseenSongUnlock) {
    hasUnseenSongUnlock = false;
  }
  var isOpen = !kidSongMenu.hasAttribute('hidden');
  if (isOpen) {
    kidSongMenu.setAttribute('hidden', '');
    kidSongToggle.setAttribute('aria-expanded', 'false');
    kidSongToggle.classList.remove('is-active');
  } else {
    kidSongMenu.removeAttribute('hidden');
    kidSongToggle.setAttribute('aria-expanded', 'true');
    kidSongToggle.classList.add('is-active');
  }
  syncSongPickerToggleButton();
});

kidThreadMenu.addEventListener('click', (event) => {
  var option = event.target.closest('.kid-thread-option');
  if (!option) return;
  var nextIndex = parseInt(option.dataset.index, 10);
  if (!isFinite(nextIndex) || nextIndex < 0 || nextIndex >= threads.length) return;
  selectedThreadIndex = nextIndex;
  kidThreadMenu.setAttribute('hidden', '');
  kidThreadToggle.setAttribute('aria-expanded', 'false');
  renderThreadControls();
  syncKidControlsFromSelectedThread();
});

kidSongMenu.addEventListener('click', (event) => {
  var option = event.target.closest('.kid-song-option');
  if (!option) return;
  var songId = option.dataset.songId;
  if (!songId) return;
  kidSongMenu.setAttribute('hidden', '');
  kidSongToggle.setAttribute('aria-expanded', 'false');
  kidSongToggle.classList.remove('is-active');
  syncSongPickerToggleButton();
  setCurrentSong(songId);
});


if (onboardingHelpBtn) {
  onboardingHelpBtn.addEventListener('click', function() {
    if (onboardingTour && !onboardingTour.hidden) {
      handleOnboardingTourSkip();
      return;
    }
    startOnboardingTour();
  });
}

if (onboardingDismissBtn) {
  onboardingDismissBtn.addEventListener('click', function() {
    dismissOnboardingQuickStart();
    dismissOnboardingHints();
  });
}

if (onboardingStartTourBtn) {
  onboardingStartTourBtn.addEventListener('click', function() {
    setOnboardingStatePatch({ quickStartDismissed: true });
    startOnboardingTour();
  });
}

if (onboardingTourNextBtn) {
  onboardingTourNextBtn.addEventListener('click', handleOnboardingTourNext);
}

if (onboardingTourPrevBtn) {
  onboardingTourPrevBtn.addEventListener('click', handleOnboardingTourPrev);
}

if (onboardingTourSkipBtn) {
  onboardingTourSkipBtn.addEventListener('click', handleOnboardingTourSkip);
}

if (onboardingTourOptOutInput) {
  onboardingTourOptOutInput.addEventListener('change', function() {
    setOnboardingTutorialOptOutPreference(!!onboardingTourOptOutInput.checked);
  });
}

if (onboardingTourHearBtn) {
  onboardingTourHearBtn.addEventListener('click', function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    toggleOnboardingTourNarration();
  });
}

if (onboardingTourHearAllBtn) {
  onboardingTourHearAllBtn.addEventListener('click', function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    toggleOnboardingTourHearAll();
  });
}

if (onboardingHintShapeHearBtn) {
  onboardingHintShapeHearBtn.addEventListener('click', function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    toggleOnboardingHintNarration(onboardingHintShape, onboardingHintShapeHearBtn);
  });
}

if (onboardingHintHolesHearBtn) {
  onboardingHintHolesHearBtn.addEventListener('click', function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    toggleOnboardingHintNarration(onboardingHintHoles, onboardingHintHolesHearBtn);
  });
}

if (onboardingHintPlayHearBtn) {
  onboardingHintPlayHearBtn.addEventListener('click', function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    toggleOnboardingHintNarration(onboardingHintPlay, onboardingHintPlayHearBtn);
  });
}

if (onboardingHintsLayer) {
  onboardingHintsLayer.addEventListener('click', function(event) {
    if (!event || !event.target || !event.target.closest) return;
    var nextButton = event.target.closest('.onboarding-hint-next-btn');
    if (nextButton) {
      event.preventDefault();
      event.stopPropagation();
      advanceOnboardingHintStep();
      return;
    }

    var startTourButton = event.target.closest('.onboarding-hint-start-tour-btn');
    if (startTourButton) {
      event.preventDefault();
      event.stopPropagation();
      setOnboardingStatePatch({ quickStartDismissed: true });
      startOnboardingTour();
      return;
    }

    var button = event.target.closest('.onboarding-hint-hear-btn');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (button.id === 'onboarding-hint-shape-hear') {
      toggleOnboardingHintNarration(onboardingHintShape, button);
      return;
    }
    if (button.id === 'onboarding-hint-holes-hear') {
      toggleOnboardingHintNarration(onboardingHintHoles, button);
      return;
    }
    if (button.id === 'onboarding-hint-play-hear') {
      toggleOnboardingHintNarration(onboardingHintPlay, button);
    }
  });
}

window.addEventListener('resize', refreshOnboardingOverlayPositions);

window.addEventListener('orientationchange', function() {
  window.setTimeout(refreshOnboardingOverlayPositions, 120);
});

document.addEventListener('pointerdown', markOnboardingInteractionFromEvent, true);
document.addEventListener('touchstart', markOnboardingInteractionFromEvent, true);
document.addEventListener('mousedown', markOnboardingInteractionFromEvent, true);
document.addEventListener('click', markOnboardingInteractionFromEvent, true);
document.addEventListener('input', markOnboardingInteractionFromEvent, true);
document.addEventListener('change', markOnboardingInteractionFromEvent, true);
document.addEventListener('keydown', function(event) {
  if (!event) return;
  if (event.key === 'Tab' || event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt' || event.key === 'Meta') {
    return;
  }
  markOnboardingInteractionFromEvent(event);
}, true);

shapeButtons.forEach(function(btn) {
  btn.addEventListener('click', markOnboardingInteraction);
});

if (holesSlider) {
  holesSlider.addEventListener('input', markOnboardingInteraction);
}

if (jumpSlider) {
  jumpSlider.addEventListener('input', markOnboardingInteraction);
}

if (animateBtn) {
  animateBtn.addEventListener('click', markOnboardingInteraction);
}

/* ------------------------------
   INITIALIZE
------------------------------ */
initializeThemeFromStorage();
renderThreadControls();
syncExperienceInfoPanel(false);
applyExperienceOverlayPosition(EXPERIENCE_OVERLAY_POSITION_CLASS);
clearSessionScopedCachesOnLoad();
if (hasUrlStateParams()) {
  var initialParams = new URLSearchParams(window.location.search || '');
  var initialExperience = resolveExperienceId(getUrlStateParam(initialParams, 'experienceId')) || 'stitching';
  setCurrentExperience(initialExperience, { suppressUrlSync: true });
  if (initialExperience === 'stitching') {
    var initialUrlStitchingShape = sanitizeShape(getUrlStateParam(initialParams, 'stitchingShape'), '');
    setCurrentShape(
      initialUrlStitchingShape || sanitizeShape(stitchingFrameShape, currentShape || 'circle'),
      false
    );
  }
} else {
  setCurrentExperience('stitching');
  applyRandomizedStitchingStateForParamlessLoad();
  applyDefaultTempo();
}
advancedPanel.classList.remove('open');
discoveryPanel.classList.remove('open');
renderAdvancedTempoOptions();
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
  applyStateFromCurrentUrl({ forceUrlSync: false, initialLoad: true });
} else {
  redrawForPathChange();
}
scheduleDiscoveryEvaluation();
syncExportUiCopy();

function finalizeStartupOnboardingSequence() {
  initializeOnboarding();
  scheduleUrlStateSync(true);
}

function finalizeStartupOnboardingSequenceAfterPreviewDelay() {
  var STARTUP_PREVIEW_HANDOFF_BEATS = 1;
  var delayMs = Math.max(220, Math.round(getAnimationSecondsPerSegment() * STARTUP_PREVIEW_HANDOFF_BEATS * 1000));
  window.setTimeout(function() {
    if (hasUrlStateParams()) {
      history.replaceState({ appStateVersion: APP_STATE_URL_VERSION }, '', window.location.pathname);
    }
    finalizeStartupOnboardingSequence();
  }, delayMs);
}

function beginParamlessStartupSequence(initialParamlessLoad) {
  runParamlessStartupTailPreview(finalizeStartupOnboardingSequenceAfterPreviewDelay, {
    ignoreUrlParamCheck: !!initialParamlessLoad
  });
}

function showParamlessStartupSplash(onContinue, initialParamlessLoad) {
  if (window.navigator && window.navigator.webdriver && !window.__STITCHLAB_FORCE_SPLASH_FOR_TESTS__) {
    onContinue(!!initialParamlessLoad);
    return;
  }

  var startupSplash = document.getElementById('startup-splash');
  var hearBtn = document.getElementById('startup-splash-hear');
  var continueBtn = document.getElementById('startup-splash-continue');
  if (!startupSplash || !continueBtn) {
    onContinue(!!initialParamlessLoad);
    return;
  }

  var splashNarrationUtterance = null;
  var SPLASH_HEAR_LABEL = '🔊 Hear this';
  var SPLASH_STOP_LABEL = '⏹ Stop narration';

  function stopSplashNarration() {
    if (window.stitchlabTts && typeof window.stitchlabTts.cancel === 'function') {
      window.stitchlabTts.cancel();
    }
    splashNarrationUtterance = null;
    if (hearBtn) {
      hearBtn.setAttribute('aria-pressed', 'false');
      hearBtn.textContent = SPLASH_HEAR_LABEL;
    }
  }

  function startSplashNarration() {
    if (!window.stitchlabTts || !window.stitchlabTts.supportsNarration() || !hearBtn) return;
    stopSplashNarration();
    var splashText = (document.getElementById('startup-splash-text') || {}).textContent || '';
    var narrationText = String(splashText || '').trim();
    if (!narrationText) return;
    var utterance = window.stitchlabTts.speak({
      text: narrationText,
      rate: 1,
      pitch: 1,
      volume: 1,
      onend: function() {
        if (splashNarrationUtterance !== utterance) return;
        splashNarrationUtterance = null;
        hearBtn.setAttribute('aria-pressed', 'false');
        hearBtn.textContent = SPLASH_HEAR_LABEL;
      },
      onerror: function() {
        if (splashNarrationUtterance !== utterance) return;
        splashNarrationUtterance = null;
        hearBtn.setAttribute('aria-pressed', 'false');
        hearBtn.textContent = SPLASH_HEAR_LABEL;
      }
    });
    if (!utterance) return;

    splashNarrationUtterance = utterance;
    hearBtn.setAttribute('aria-pressed', 'true');
    hearBtn.textContent = SPLASH_STOP_LABEL;
  }

  startupSplash.hidden = false;
  continueBtn.focus();

  if (hearBtn) {
    hearBtn.setAttribute('aria-pressed', 'false');
    hearBtn.textContent = SPLASH_HEAR_LABEL;
    hearBtn.addEventListener('click', function handleSplashHearClick() {
      if (splashNarrationUtterance) {
        stopSplashNarration();
        return;
      }
      startSplashNarration();
    });
  }

  continueBtn.addEventListener('click', function handleStartupSplashContinue() {
    continueBtn.removeEventListener('click', handleStartupSplashContinue);
    if (typeof prewarmOnboardingNarrationSpeech === 'function') {
      prewarmOnboardingNarrationSpeech();
    }
    stopSplashNarration();
    startupSplash.hidden = true;
    onContinue(!!initialParamlessLoad);
  });
}

var initialParamlessLoad = !hasUrlStateParams();

if (!initialParamlessLoad) {
  finalizeStartupOnboardingSequence();
} else {
  showParamlessStartupSplash(beginParamlessStartupSequence, true);
}

window.setCurrentExperience = setCurrentExperience;
