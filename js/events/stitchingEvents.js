window.bindStitchingEvents = function bindStitchingEvents(deps) {
  if (!deps) return;

  deps.holesSlider.addEventListener('input', deps.handleHolesSliderChange);
  deps.holesSlider.addEventListener('change', deps.handleHolesSliderChange);

  if (deps.advancedHolesNumberInput) {
    deps.advancedHolesNumberInput.addEventListener('input', deps.handleAdvancedHolesNumberChange);
    deps.advancedHolesNumberInput.addEventListener('change', deps.handleAdvancedHolesNumberChange);
  }

  deps.advancedHoleNumbersToggle.addEventListener('change', function() {
    deps.setShowHoleNumbers(deps.advancedHoleNumbersToggle.checked);
    deps.syncHoleNumberToggles();
    deps.redrawAnimationInPlace();
  });

  deps.advancedBorderEnabledInput.addEventListener('change', function() {
    deps.setBorderEnabled(deps.advancedBorderEnabledInput.checked);
    deps.syncBorderControls();
    deps.redrawAnimationInPlace();
  });

  deps.kidStitchBySelect.addEventListener('change', function() {
    var targetIndex = deps.getKidTargetThreadIndex();
    if (targetIndex < 0 || !deps.threads[targetIndex]) return;

    var thread = deps.threads[targetIndex];
    var choice = deps.kidStitchBySelect.value;

    if (choice === 'multiply') {
      thread.jumpMode = 'connect';
      thread.connectMultiplier = 2;
      thread.connectOffset = 0;
    } else if (choice === 'add' && thread.jumpMode === 'connect') {
      thread.jumpMode = 'fixed';
    }

    deps.renderThreadControls();
    deps.syncKidControlsFromSelectedThread();
    deps.redrawForPathChange();
  });

  deps.jumpSlider.addEventListener('input', function() {
    var targetIndex = deps.getKidTargetThreadIndex();
    if (targetIndex < 0) return;
    if (deps.threads[targetIndex].jumpMode === 'connect') return;
    deps.updateKidControlValues();
    deps.threads[targetIndex].jump = parseInt(deps.jumpSlider.value, 10);
    deps.renderThreadControls();
    deps.redrawForPathChange();
  });

  deps.multiplySlider.addEventListener('input', function() {
    var targetIndex = deps.getKidTargetThreadIndex();
    if (targetIndex < 0 || !deps.threads[targetIndex]) return;
    deps.ensureThreadConnectConfig(deps.threads[targetIndex]);
    deps.threads[targetIndex].jumpMode = 'connect';
    deps.threads[targetIndex].connectMultiplier = parseInt(deps.multiplySlider.value, 10);
    deps.updateKidControlValues();
    deps.renderThreadControls();
    deps.syncKidControlsFromSelectedThread();
    deps.redrawForPathChange();
  });

  deps.widthSlider.addEventListener('input', function() {
    var targetIndex = deps.getKidTargetThreadIndex();
    if (targetIndex < 0) return;
    deps.updateKidControlValues();
    deps.threads[targetIndex].width = parseInt(deps.widthSlider.value, 10);
    deps.renderThreadControls();
    deps.redrawAnimationInPlace();
  });

  document.querySelectorAll('.color-dot').forEach(function(dot) {
    dot.addEventListener('click', function() {
      if (!deps.threads.length) return;
      deps.applyExperiencePaletteColorChoice(dot.getAttribute('data-color') || '#1982c4');
      deps.renderThreadControls();
      deps.redrawAnimationInPlace();
    });
  });

  document.querySelectorAll('.shape-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      deps.setCurrentShape(btn.getAttribute('data-shape') || 'circle');
    });
  });

  deps.advancedShapeSelect.addEventListener('change', function() {
    deps.setCurrentShape(deps.advancedShapeSelect.value || 'circle');
  });

};
