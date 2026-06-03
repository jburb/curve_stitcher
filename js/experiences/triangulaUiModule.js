(function() {
  function createTriangulaUiModule(deps) {
    deps = deps || {};

    function syncTriangulaControls() {
      var startCount = deps.normalizeTriangulaDrawableCount(deps.getTriangulaStartCount(), 'start', 1);
      var targetCount = deps.normalizeTriangulaDrawableCount(deps.getTriangulaTargetCount(), 'target', startCount);

      if (targetCount < startCount) {
        targetCount = startCount;
      }

      deps.setTriangulaStartCount(startCount);
      deps.setTriangulaTargetCount(targetCount);

      var startSlider = deps.getTriangulaStartSlider();
      var targetSlider = deps.getTriangulaTargetSlider();
      var startValue = deps.getTriangulaStartValue();
      var targetValue = deps.getTriangulaTargetValue();
      var startNumber = deps.getTriangulaStartNumberInput();
      var targetNumber = deps.getTriangulaTargetNumberInput();
      var colorScopeSelect = deps.getTriangulaColorScopeSelect();
      var constructionModeSelect = deps.getTriangulaConstructionModeSelect();
      var fractalModeSelect = deps.getTriangulaFractalModeSelect();
      var fitModeSelect = deps.getTriangulaFitModeSelect();

      if (startSlider) {
        startSlider.value = String(startCount);
      }
      if (targetSlider) {
        targetSlider.value = String(targetCount);
      }
      if (startValue) {
        startValue.textContent = String(startCount);
      }
      if (targetValue) {
        targetValue.textContent = String(targetCount);
      }
      if (startNumber) {
        startNumber.value = String(startCount);
      }
      if (targetNumber) {
        targetNumber.value = String(targetCount);
      }
      if (colorScopeSelect) {
        colorScopeSelect.value = deps.getTriangulaColorMode();
      }
      if (constructionModeSelect) {
        constructionModeSelect.value = deps.getTriangulaConstructionMode();
      }
      if (fractalModeSelect) {
        fractalModeSelect.value = deps.getTriangulaFractalMode();
      }
      if (fitModeSelect) {
        fitModeSelect.value = deps.getTriangulaFitMode();
      }

      var profile = deps.getExperienceUiProfile(deps.getCurrentExperienceId());
      var controls = profile && profile.basicControls ? profile.basicControls : null;
      deps.setElementDisplay(
        deps.getTriangulaColorScopeBlock(),
        deps.isTriangulaColorScopeVisible(controls, deps.getCurrentExperienceId(), deps.getTriangulaConstructionMode()),
        ''
      );
    }

    function applyTriangulaCountUpdate(nextStart, nextTarget, shouldRedraw) {
      var startCount = deps.normalizeTriangulaDrawableCount(nextStart, 'start', deps.getTriangulaStartCount() || 1);
      var targetCount = deps.normalizeTriangulaDrawableCount(nextTarget, 'target', deps.getTriangulaTargetCount() || startCount || 1);

      if (targetCount < startCount) {
        targetCount = startCount;
      }

      deps.setTriangulaStartCount(startCount);
      deps.setTriangulaTargetCount(targetCount);
      syncTriangulaControls();

      if (shouldRedraw) {
        deps.redrawForPathChange();
      }
    }

    return {
      syncTriangulaControls: syncTriangulaControls,
      applyTriangulaCountUpdate: applyTriangulaCountUpdate
    };
  }

  window.createTriangulaUiModule = createTriangulaUiModule;
})();
