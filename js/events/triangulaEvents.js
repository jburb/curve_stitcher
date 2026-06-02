window.bindTriangulaEvents = function bindTriangulaEvents(deps) {
  if (!deps) return;

  if (deps.triangulaColorScopeSelect) {
    deps.triangulaColorScopeSelect.addEventListener('change', function() {
      var nextMode = deps.triangulaColorScopeSelect.value || 'all';
      deps.setTriangulaColorMode(nextMode);
      deps.syncTriangulaControls();
      deps.redrawAnimationInPlace();
    });
  }

  if (deps.triangulaConstructionModeSelect) {
    deps.triangulaConstructionModeSelect.addEventListener('change', function() {
      deps.setTriangulaConstructionMode(deps.triangulaConstructionModeSelect.value || 'shrink-duplicate');
      deps.syncTriangulaControls();
      deps.redrawForPathChange();
    });
  }

  if (deps.triangulaStartSlider) {
    deps.triangulaStartSlider.addEventListener('input', function() {
      deps.applyTriangulaCountUpdate(deps.triangulaStartSlider.value, deps.getTriangulaTargetCount(), true);
    });
    deps.triangulaStartSlider.addEventListener('change', function() {
      deps.applyTriangulaCountUpdate(deps.triangulaStartSlider.value, deps.getTriangulaTargetCount(), false);
      deps.settleSliderMotion(deps.triangulaStartSlider);
    });
  }

  if (deps.triangulaStartNumberInput) {
    deps.triangulaStartNumberInput.addEventListener('input', function() {
      if (deps.triangulaStartNumberInput.value === '') return;
      deps.applyTriangulaCountUpdate(deps.triangulaStartNumberInput.value, deps.getTriangulaTargetCount(), true);
    });
    deps.triangulaStartNumberInput.addEventListener('change', function() {
      deps.applyTriangulaCountUpdate(deps.triangulaStartNumberInput.value, deps.getTriangulaTargetCount(), false);
    });
  }

  if (deps.triangulaTargetSlider) {
    deps.triangulaTargetSlider.addEventListener('input', function() {
      deps.applyTriangulaCountUpdate(deps.getTriangulaStartCount(), deps.triangulaTargetSlider.value, true);
    });
    deps.triangulaTargetSlider.addEventListener('change', function() {
      deps.applyTriangulaCountUpdate(deps.getTriangulaStartCount(), deps.triangulaTargetSlider.value, false);
      deps.settleSliderMotion(deps.triangulaTargetSlider);
    });
  }

  if (deps.triangulaTargetNumberInput) {
    deps.triangulaTargetNumberInput.addEventListener('input', function() {
      if (deps.triangulaTargetNumberInput.value === '') return;
      deps.applyTriangulaCountUpdate(deps.getTriangulaStartCount(), deps.triangulaTargetNumberInput.value, true);
    });
    deps.triangulaTargetNumberInput.addEventListener('change', function() {
      deps.applyTriangulaCountUpdate(deps.getTriangulaStartCount(), deps.triangulaTargetNumberInput.value, false);
    });
  }

  if (deps.triangulaStartDiv3Btn) {
    deps.triangulaStartDiv3Btn.addEventListener('click', function() {
      deps.applyTriangulaCountUpdate(deps.stepTriangulaCount(deps.getTriangulaStartCount(), 'div3'), deps.getTriangulaTargetCount(), true);
    });
  }

  if (deps.triangulaStartMul3Btn) {
    deps.triangulaStartMul3Btn.addEventListener('click', function() {
      deps.applyTriangulaCountUpdate(deps.stepTriangulaCount(deps.getTriangulaStartCount(), 'mul3'), deps.getTriangulaTargetCount(), true);
    });
  }

  if (deps.triangulaStartDec10Btn) {
    deps.triangulaStartDec10Btn.addEventListener('click', function() {
      deps.applyTriangulaCountUpdate(deps.stepTriangulaCount(deps.getTriangulaStartCount(), 'dec10'), deps.getTriangulaTargetCount(), true);
    });
  }

  if (deps.triangulaStartInc10Btn) {
    deps.triangulaStartInc10Btn.addEventListener('click', function() {
      deps.applyTriangulaCountUpdate(deps.stepTriangulaCount(deps.getTriangulaStartCount(), 'inc10'), deps.getTriangulaTargetCount(), true);
    });
  }

  if (deps.triangulaTargetDiv3Btn) {
    deps.triangulaTargetDiv3Btn.addEventListener('click', function() {
      deps.applyTriangulaCountUpdate(deps.getTriangulaStartCount(), deps.stepTriangulaCount(deps.getTriangulaTargetCount(), 'div3'), true);
    });
  }

  if (deps.triangulaTargetMul3Btn) {
    deps.triangulaTargetMul3Btn.addEventListener('click', function() {
      deps.applyTriangulaCountUpdate(deps.getTriangulaStartCount(), deps.stepTriangulaCount(deps.getTriangulaTargetCount(), 'mul3'), true);
    });
  }

  if (deps.triangulaTargetDec10Btn) {
    deps.triangulaTargetDec10Btn.addEventListener('click', function() {
      deps.applyTriangulaCountUpdate(deps.getTriangulaStartCount(), deps.stepTriangulaCount(deps.getTriangulaTargetCount(), 'dec10'), true);
    });
  }

  if (deps.triangulaTargetInc10Btn) {
    deps.triangulaTargetInc10Btn.addEventListener('click', function() {
      deps.applyTriangulaCountUpdate(deps.getTriangulaStartCount(), deps.stepTriangulaCount(deps.getTriangulaTargetCount(), 'inc10'), true);
    });
  }

  if (deps.triangulaFitModeSelect) {
    deps.triangulaFitModeSelect.addEventListener('change', function() {
      deps.setTriangulaFitMode(deps.triangulaFitModeSelect.value || 'dynamic');
      deps.syncTriangulaControls();
      deps.redrawAnimationInPlace();
    });
  }

  if (deps.triangulaFractalModeSelect) {
    deps.triangulaFractalModeSelect.addEventListener('change', function() {
      deps.setTriangulaFractalMode(deps.triangulaFractalModeSelect.value === 'parallel' ? 'parallel' : 'series');
      deps.syncTriangulaControls();
      deps.redrawForPathChange();
    });
  }
};
