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
initializeOnboarding();
scheduleUrlStateSync(true);
window.setCurrentExperience = setCurrentExperience;
