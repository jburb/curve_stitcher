window.bindCoreEnvironmentEvents = function bindCoreEnvironmentEvents(deps) {
  if (!deps) return;

  document.addEventListener('pointerdown', function(event) {
    var slider = event.target && event.target.closest ? event.target.closest('input[type="range"]') : null;
    if (!slider) return;
    deps.markSliderAsMoving(slider);
    deps.updateMusicPlaybackState();
  });

  document.addEventListener('input', function(event) {
    var slider = event.target && event.target.matches && event.target.matches('input[type="range"]') ? event.target : null;
    if (!slider) return;
    deps.markSliderAsMoving(slider);
    deps.updateMusicPlaybackState();
  });

  document.addEventListener('keyup', function(event) {
    var slider = event.target && event.target.matches && event.target.matches('input[type="range"]') ? event.target : null;
    if (!slider) return;
    deps.settleSliderMotion(slider);
  });

  document.addEventListener('pointerup', deps.settleAllSliderMotion);
  document.addEventListener('mouseup', deps.settleAllSliderMotion);
  document.addEventListener('touchend', deps.settleAllSliderMotion, { passive: true });
  document.addEventListener('touchcancel', deps.settleAllSliderMotion, { passive: true });
  document.addEventListener('pointercancel', deps.settleAllSliderMotion);
  document.addEventListener('blur', function(event) {
    var slider = event.target && event.target.matches && event.target.matches('input[type="range"]') ? event.target : null;
    if (!slider) return;
    deps.settleSliderMotion(slider);
  }, true);

  window.addEventListener('resize', deps.scheduleFitCanvasToStage);
  window.addEventListener('resize', function() {
    deps.renderExperienceTitleStatic();
    deps.refreshExperienceInfoPanelPlacement();
  });

  window.addEventListener('orientationchange', deps.scheduleFitCanvasToStage);
  window.addEventListener('orientationchange', function() {
    deps.renderExperienceTitleStatic();
    deps.refreshExperienceInfoPanelPlacement();
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', deps.scheduleFitCanvasToStage);
    window.visualViewport.addEventListener('resize', function() {
      deps.renderExperienceTitleStatic();
      deps.refreshExperienceInfoPanelPlacement();
    });
  }

  window.addEventListener('pageshow', function() {
    if (!deps.hasUrlStateParams()) {
      deps.applyDefaultHoles();
      deps.applyDefaultSkipAndSize();
      deps.applyDefaultTempo();
      deps.setAnimationPlaybackState('idle');
      deps.syncAnimateButtonLabel();
      deps.renderThreadControls();
      deps.syncKidControlsFromSelectedThread();
      deps.redrawForPathChange();
    }

    deps.applyExperienceOverlayPosition(deps.experienceOverlayPositionClass);
    deps.renderExperienceTitleStatic();
    deps.applyStateFromCurrentUrl({ forceUrlSync: false });
    deps.syncKidControlsFromSelectedThread();
  });

  window.addEventListener('popstate', function() {
    deps.applyStateFromCurrentUrl({ forceUrlSync: false });
  });
};
