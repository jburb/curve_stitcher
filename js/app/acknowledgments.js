function openAcknowledgmentsViewer(options) {
  options = options || {};
  if (!acknowledgmentsModal) return;
  loadAcknowledgmentsLines().then(function(lines) {
    var safeLines = Array.isArray(lines) && lines.length ? lines : ACKNOWLEDGMENTS_FALLBACK_LINES.slice();
    acknowledgmentsViewerState.lineDurationsMsByIndex = buildAcknowledgmentsLineDurations(safeLines);
    acknowledgmentsViewerState.seriesLineDurationMs = getAcknowledgmentsSeriesLineDurationMs(safeLines.length);
    var requestedIndex = parseBoundedInt(options.lineIndex, 0, Math.max(0, safeLines.length - 1), 0);
    acknowledgmentsViewerState.lineIndex = requestedIndex;
    acknowledgmentsViewerState.autoPlay = (typeof options.autoPlay === 'boolean') ? options.autoPlay : true;
    stopAcknowledgmentsAutoplay();
    acknowledgmentsModal.classList.add('open');
    acknowledgmentsAudio.currentTime = 0;
    updateMusicPlaybackState();
    renderAcknowledgmentsLine(safeLines);
    scheduleAcknowledgmentsAutoplayTick(safeLines);
    if (acknowledgmentsCloseBtn) {
      acknowledgmentsCloseBtn.focus();
    }
  });
}

function closeAcknowledgmentsViewer() {
  if (!acknowledgmentsModal) return;
  stopAcknowledgmentsAutoplay();
  stopAcknowledgmentsStageAnimation();
  acknowledgmentsViewerState.autoPlay = false;
  acknowledgmentsViewerState.lineDurationsMsByIndex = [];
  acknowledgmentsViewerState.seriesLineDurationMs = 0;
  acknowledgmentsModal.classList.remove('open');
  updateMusicPlaybackState();
}

function triggerAcknowledgmentsViewerOpen(autoPlay) {
  syncExperienceInfoPanel(false);
  if (typeof autoPlay === 'boolean') {
    openAcknowledgmentsViewer({ lineIndex: 0, autoPlay: autoPlay });
    return;
  }
  openAcknowledgmentsViewer({ lineIndex: 0 });
}

function attachExperienceInfoAcknowledgmentsBridge() {
  if (!experienceInfoHtmlFrame) return;
  var frameDoc = null;
  try {
    frameDoc = experienceInfoHtmlFrame.contentDocument || (experienceInfoHtmlFrame.contentWindow && experienceInfoHtmlFrame.contentWindow.document) || null;
  } catch (error) {
    frameDoc = null;
  }
  if (!frameDoc || frameDoc.__ackBridgeAttached) return;

  frameDoc.addEventListener('click', function(event) {
    if (!event || !event.target || typeof event.target.closest !== 'function') return;
    var trigger = event.target.closest('[data-open-acknowledgments]');
    if (!trigger) return;
    event.preventDefault();
    triggerAcknowledgmentsViewerOpen();
  });
  frameDoc.__ackBridgeAttached = true;
}

joyAudio.addEventListener('ended', function() {
  if (!shouldMusicBePlaying()) return;
  joyAudio.currentTime = 0;
  playMusicFromCurrentState();
});

/* ------------------------------
  STITCHING UI (PENDING MOVE)
------------------------------ */
function renderThreadControls() {
  var container = document.getElementById('thread-controls');
  container.innerHTML = '';
  var holeCount = getCurrentStitchHoleCount();

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
    thread.frameMode = sanitizeThreadFrameMode(thread.frameMode, 'outer');
    if (thread.frameMode === 'bridge') {
      thread.frameMode = 'bridge-reverse-project';
    }
    if (thread.color === 'rainbow') {
      thread.solidColor = sanitizeThreadSolidColor(thread.solidColor, '#1982c4');
    } else {
      thread.solidColor = sanitizeThreadSolidColor(thread.color, thread.solidColor || '#1982c4');
    }
    var sourceHoleCount = getThreadSourceHoleCount(thread);
    var jumpLimit = Math.max(1, sourceHoleCount - 1);
    normalizeThreadHoleDependentValues(thread, sourceHoleCount);

    var threadColorInputValue = thread.color === 'rainbow'
      ? sanitizeThreadSolidColor(thread.solidColor, '#1982c4')
      : sanitizeThreadSolidColor(thread.color, '#1982c4');

    var div = document.createElement('div');
    div.className = 'thread-card' + (index === selectedThreadIndex ? ' selected' : '');

    var isFixedMode = thread.jumpMode === 'fixed';
    var isFormulaMode = isExpressionStitchModeEnabled() && thread.jumpMode === 'formula';
    var isSequenceMode = thread.jumpMode === 'sequence';
    var isConnectMode = thread.jumpMode === 'connect';
    var sequenceMode = sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes');
    var isHoleListMode = isThreadHoleListMode(thread);

    div.innerHTML = `
      <strong>Thread ${index + 1}</strong><br>
      Color: <input type="color" value="${threadColorInputValue}" id="color-${index}"><br>
      ${nestedFrameEnabled ? `
      Frame:
      <select id="frame-mode-${index}">
        <option value="outer" ${sanitizeThreadFrameMode(thread.frameMode, 'outer') === 'outer' ? 'selected' : ''}>Outer</option>
        <option value="inner" ${sanitizeThreadFrameMode(thread.frameMode, 'outer') === 'inner' ? 'selected' : ''}>Inner</option>
        <option value="bridge-reverse" ${sanitizeThreadFrameMode(thread.frameMode, 'outer') === 'bridge-reverse' ? 'selected' : ''}>Inner -&gt; Outer (Bridge)</option>
        <option value="bridge-reverse-project" ${sanitizeThreadFrameMode(thread.frameMode, 'outer') === 'bridge-reverse-project' ? 'selected' : ''}>Inner -&gt; Outer (Projected)</option>
      </select><br>
      ` : ''}
      Stitch by:
      <select id="jump-mode-${index}">
        <option value="fixed" ${thread.jumpMode === 'fixed' ? 'selected' : ''}>Addition</option>
        <option value="connect" ${thread.jumpMode === 'connect' ? 'selected' : ''}>Multiplication</option>
        <option value="sequence" ${thread.jumpMode === 'sequence' ? 'selected' : ''}>List</option>
        ${isExpressionStitchModeEnabled() ? `<option value="formula" ${thread.jumpMode === 'formula' ? 'selected' : ''}>Expression</option>` : ''}
      </select><br>
      ${isFixedMode ? `
      Add by: <input class="advanced-inline-number" type="number" min="1" max="${jumpLimit}" value="${thread.jump}" id="jump-number-${index}" aria-label="Thread ${index + 1} add value"><br>
      ` : ''}
      ${isFormulaMode ? `
      Base add: <input class="advanced-inline-number" type="number" min="1" max="${jumpLimit}" value="${thread.jump}" id="jump-number-${index}" aria-label="Thread ${index + 1} base add value"><br>
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
      List type:
      <select id="jump-sequence-mode-${index}">
        <option value="holes" ${sequenceMode === 'holes' ? 'selected' : ''}>Holes</option>
        <option value="steps" ${sequenceMode === 'steps' ? 'selected' : ''}>Steps</option>
      </select><br>
      List: <input type="text" value="${thread.jumpSequence || ''}" id="jump-sequence-${index}" placeholder="${sequenceMode === 'steps' ? 'e.g. 2,3,5,8' : 'e.g. 1,1,2,3,5,8'}"><br>
      <div class="jump-help">Hole sequence: 1,1,2,3... stitches each listed pair in order.</div>
      <div class="jump-help">Hole sequence stops at the first value above the current hole count.</div>
      <div class="jump-help">Interval sequence: values are repeated jumps from each current hole.</div>
      ` : ''}
      ${!isHoleListMode ? `Start hole: <input class="advanced-inline-number" type="number" min="1" max="${sourceHoleCount}" value="${thread.startHole}" id="start-hole-number-${index}" aria-label="Thread ${index + 1} start hole"><br>` : ''}
      ${isConnectMode ? `
      Multiply by: <input class="advanced-inline-number" type="number" min="1" max="12" value="${thread.connectMultiplier}" id="connect-m-number-${index}" aria-label="Thread ${index + 1} multiply value"><br>
      <div class="jump-help">Begin at Start hole and count forward as i = 1..n, then connect to ((start + multiplier × i - 2) mod n) + 1.</div>
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
      thread.color = e.target.value;
      thread.solidColor = sanitizeThreadSolidColor(e.target.value, thread.solidColor || '#1982c4');
      syncKidControlsFromSelectedThread();
      redrawAnimationInPlace();
    });

    var skipNumberInput = document.getElementById(`jump-number-${index}`);
    if (skipNumberInput) {
      skipNumberInput.addEventListener('input', e => {
        if (e.target.value === '') return;
        thread.jump = parseBoundedInt(e.target.value, 1, jumpLimit, thread.jump || 1);
        e.target.value = String(thread.jump);
        if (index === getKidTargetThreadIndex()) {
          jumpSlider.value = thread.jump;
          updateKidControlValues();
        }
        redrawForPathChange();
      });
      skipNumberInput.addEventListener('change', e => {
        thread.jump = parseBoundedInt(e.target.value, 1, jumpLimit, thread.jump || 1);
        e.target.value = String(thread.jump);
      });
    }

    var startHoleNumberInput = document.getElementById(`start-hole-number-${index}`);
    if (startHoleNumberInput) {
      startHoleNumberInput.addEventListener('input', e => {
        if (e.target.value === '') return;
        var localSourceCount = getThreadSourceHoleCount(thread);
        thread.startHole = parseBoundedInt(e.target.value, 1, localSourceCount, thread.startHole || 1);
        e.target.value = String(thread.startHole);
        redrawForPathChange();
      });
      startHoleNumberInput.addEventListener('change', e => {
        var localSourceCount = getThreadSourceHoleCount(thread);
        thread.startHole = parseBoundedInt(e.target.value, 1, localSourceCount, thread.startHole || 1);
        e.target.value = String(thread.startHole);
      });
    }

    document.getElementById(`jump-mode-${index}`).addEventListener('change', e => {
      var nextMode = e.target.value;
      if (nextMode === 'formula' && !isExpressionStitchModeEnabled()) {
        nextMode = 'fixed';
      }
      thread.jumpMode = nextMode;
      if (thread.jumpMode === 'sequence') {
        thread.jumpSequenceMode = sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes');
        if (!thread.jumpSequence) {
          thread.jumpSequence = thread.jumpSequenceMode === 'steps' ? '2,3,5,8' : '1,1,2,3,5,8';
        }
      }
      renderThreadControls();
      syncKidControlsFromSelectedThread();
      redrawForPathChange();
    });

    var frameModeInput = document.getElementById(`frame-mode-${index}`);
    if (frameModeInput) {
      frameModeInput.addEventListener('change', e => {
        thread.frameMode = sanitizeThreadFrameMode(e.target.value, thread.frameMode || 'outer');
        redrawForPathChange();
      });
    }

    var formulaInput = document.getElementById(`jump-formula-${index}`);
    if (formulaInput) {
      formulaInput.addEventListener('input', e => {
        thread.jumpFormula = e.target.value;
        if (isExpressionStitchModeEnabled() && thread.jumpMode === 'formula') {
          redrawForPathChange();
        }
      });
    }

    var usePresetBtn = document.getElementById(`use-preset-${index}`);
    if (usePresetBtn) {
      usePresetBtn.addEventListener('click', () => {
        if (!isExpressionStitchModeEnabled()) return;
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

    var sequenceModeInput = document.getElementById(`jump-sequence-mode-${index}`);
    if (sequenceModeInput) {
      sequenceModeInput.addEventListener('change', e => {
        thread.jumpSequenceMode = sanitizeThreadSequenceMode(e.target.value, 'holes');
        renderThreadControls();
        syncKidControlsFromSelectedThread();
        redrawForPathChange();
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
      if (e.target.checked) {
        if (thread.color !== 'rainbow') {
          thread.solidColor = sanitizeThreadSolidColor(thread.color, thread.solidColor || '#1982c4');
        }
        thread.color = 'rainbow';
      } else {
        thread.color = sanitizeThreadSolidColor(thread.solidColor, '#1982c4');
      }
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
  STITCHING EVENT LISTENERS (PENDING MOVE)
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
    thread.jumpFormula = String(thread.jumpFormula || 'skip');
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

function stopAcknowledgmentsAutoplay() {
  if (acknowledgmentsViewerState.timerId) {
    clearTimeout(acknowledgmentsViewerState.timerId);
    acknowledgmentsViewerState.timerId = null;
  }
}

function parseAcknowledgmentsLinesFromText(text) {
  if (typeof text !== 'string') return [];
  return filterAcknowledgmentsLines(text.split(/\r?\n/));
}

function filterAcknowledgmentsLines(sourceLines) {
  if (!Array.isArray(sourceLines)) return [];
  var lines = [];
  for (var i = 0; i < sourceLines.length; i++) {
    var cleaned = String(sourceLines[i] || '').trim();
    if (cleaned.indexOf('//') === 0) continue;
    if (cleaned) {
      lines.push(cleaned);
    }
  }
  return lines;
}

function loadAcknowledgmentsLines() {
  if (acknowledgmentsLinesCache && acknowledgmentsLinesCache.length) {
    return Promise.resolve(acknowledgmentsLinesCache.slice());
  }

  var isFileProtocol = !!(window && window.location && window.location.protocol === 'file:');
  if (isFileProtocol) {
    acknowledgmentsLinesCache = filterAcknowledgmentsLines(
      ACKNOWLEDGMENTS_INLINE_LINES.length
        ? ACKNOWLEDGMENTS_INLINE_LINES
        : ACKNOWLEDGMENTS_FALLBACK_LINES
    );
    if (!acknowledgmentsLinesCache.length) {
      acknowledgmentsLinesCache = filterAcknowledgmentsLines(ACKNOWLEDGMENTS_FALLBACK_LINES);
    }
    return Promise.resolve(acknowledgmentsLinesCache.slice());
  }

  return fetch(ACKNOWLEDGMENTS_SOURCE_PATH, { cache: 'no-store' })
    .then(function(response) {
      if (!response || !response.ok) {
        throw new Error('Acknowledgments file not available');
      }
      return response.text();
    })
    .then(function(text) {
      var parsed = parseAcknowledgmentsLinesFromText(text);
      acknowledgmentsLinesCache = parsed.length ? parsed : filterAcknowledgmentsLines(ACKNOWLEDGMENTS_FALLBACK_LINES);
      return acknowledgmentsLinesCache.slice();
    })
    .catch(function() {
      acknowledgmentsLinesCache = filterAcknowledgmentsLines(ACKNOWLEDGMENTS_FALLBACK_LINES);
      return acknowledgmentsLinesCache.slice();
    });
}

function getAcknowledgmentsStyleForIndex(index) {
  if (!ACKNOWLEDGMENTS_STYLE_SEQUENCE.length) return 'stitching';
  var normalized = Math.max(0, parseBoundedInt(index, 0, 100000, 0));
  return ACKNOWLEDGMENTS_STYLE_SEQUENCE[normalized % ACKNOWLEDGMENTS_STYLE_SEQUENCE.length] || 'stitching';
}

function getAcknowledgmentsStyleLabel(styleId) {
  if (styleId === 'triangula') return 'Triangula';
  if (styleId === 'squarus') return 'Squarus';
  return 'Stitching';
}

function createSvgNode(name) {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function createAcknowledgmentsSeededRng(seed) {
  var state = ((seed >>> 0) || 1) >>> 0;
  return function() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createAcknowledgmentsVisual(styleId, index) {
  var rng = createAcknowledgmentsSeededRng(((index + 1) * 2654435761) ^ (styleId === 'triangula' ? 73 : (styleId === 'squarus' ? 137 : 211)));
  if (styleId === 'triangula') {
    return {
      depth: 3 + Math.floor(rng() * 2),
      mode: rng() > 0.5 ? 'shrink' : 'cut',
      fractalMode: rng() > 0.5 ? 'parallel' : 'series'
    };
  }
  if (styleId === 'squarus') {
    return {
      order: 4 + Math.floor(rng() * 2),
      pieceCount: 8 + Math.floor(rng() * 8),
      sequenceSeed: 1 + Math.floor(rng() * 32),
      layout: rng() > 0.5 ? 'force-directed' : 'grid-packing'
    };
  }
  return {
    holes: 36 + Math.floor(rng() * 24),
    jump: 3 + Math.floor(rng() * 9),
    width: 1 + Math.floor(rng() * 2)
  };
}

function getAcknowledgmentsVisualForIndex(index, styleId) {
  var cacheKey = String(index);
  var cached = acknowledgmentsViewerState.visualByIndex[cacheKey];
  if (cached && cached.styleId === styleId && cached.visual) {
    return cached.visual;
  }
  var visual = createAcknowledgmentsVisual(styleId, index);
  acknowledgmentsViewerState.visualByIndex[cacheKey] = {
    styleId: styleId,
    visual: visual
  };
  return visual;
}

function clearAcknowledgmentsPattern() {
  if (!acknowledgmentsPattern) return;
  while (acknowledgmentsPattern.firstChild) {
    acknowledgmentsPattern.removeChild(acknowledgmentsPattern.firstChild);
  }
  acknowledgmentsViewerState.svgTextGroup = null;
  acknowledgmentsViewerState.svgTextNode = null;
  acknowledgmentsViewerState.svgTextSpec = null;
  acknowledgmentsViewerState.lastRevealText = '';
}

function stopAcknowledgmentsStageAnimation() {
  if (acknowledgmentsViewerState.rafId) {
    cancelAnimationFrame(acknowledgmentsViewerState.rafId);
    acknowledgmentsViewerState.rafId = null;
  }
}

function getAcknowledgmentsStageLogicalSize() {
  var canvasSize = null;
  if (view && view.viewSize && isFinite(view.viewSize.width) && isFinite(view.viewSize.height)) {
    canvasSize = Math.floor(Math.min(view.viewSize.width, view.viewSize.height));
  }
  if (!isFinite(canvasSize) || canvasSize <= 0) {
    canvasSize = ACKNOWLEDGMENTS_STAGE_SIZE;
  }
  return Math.max(240, canvasSize);
}

function configureAcknowledgmentsPatternViewport() {
  var stageSize = getAcknowledgmentsStageLogicalSize();
  if (acknowledgmentsPattern) {
    acknowledgmentsPattern.setAttribute('viewBox', '0 0 ' + stageSize + ' ' + stageSize);
    acknowledgmentsPattern.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }

  if (acknowledgmentsStage) {
    var canvasSizePx = null;
    var canvasEl = document.getElementById('myCanvas');
    if (canvasEl && isFinite(canvasEl.clientWidth) && canvasEl.clientWidth > 0) {
      canvasSizePx = Math.round(canvasEl.clientWidth);
    }
    if ((!isFinite(canvasSizePx) || canvasSizePx <= 0) && isFinite(stageSize)) {
      canvasSizePx = Math.round(stageSize);
    }
    if (isFinite(canvasSizePx) && canvasSizePx > 0) {
      canvasSizePx = Math.max(520, canvasSizePx);
      acknowledgmentsStage.style.setProperty('--ack-stage-target-size', String(canvasSizePx) + 'px');
    }
  }

  return stageSize;
}

function ensureAcknowledgmentsTextLayerInFront() {
  if (!acknowledgmentsPattern || !acknowledgmentsViewerState.svgTextGroup) return;
  if (acknowledgmentsViewerState.svgTextGroup.parentNode === acknowledgmentsPattern) {
    acknowledgmentsPattern.appendChild(acknowledgmentsViewerState.svgTextGroup);
  }
}

function buildAcknowledgmentsEquilateralTriangle(size, sideScale, baseYRatio) {
  var side = size * sideScale;
  var half = side * 0.5;
  var centerX = size * 0.5;
  var baseY = size * baseYRatio;
  var triHeight = side * (Math.sqrt(3) * 0.5);
  var apexY = baseY - triHeight;
  return {
    apex: { x: centerX, y: apexY },
    left: { x: centerX - half, y: baseY },
    right: { x: centerX + half, y: baseY },
    side: side,
    height: triHeight
  };
}

function getAcknowledgmentsTriangulaSideScale(size) {
  var safeSize = Math.max(220, Number(size) || ACKNOWLEDGMENTS_STAGE_SIZE);
  // Keep a fixed-like footprint (closer to Triangula's base frame) while preserving edge margins.
  var side = Math.max(safeSize * 0.78, safeSize - 64);
  side = Math.min(side, safeSize - 34);
  return Math.max(0.68, Math.min(0.94, side / safeSize));
}

function getAcknowledgmentsPaletteColors() {
  var palette = [];
  function pushColor(value, fallback) {
    var normalized = sanitizeHexColor(value, fallback || '#1982c4');
    var key = String(normalized || '').toLowerCase();
    if (!key || palette.indexOf(normalized) >= 0) return;
    palette.push(normalized);
  }

  if (Array.isArray(threads) && threads.length) {
    for (var i = 0; i < threads.length; i++) {
      pushColor(threads[i] && threads[i].color, '#1982c4');
    }
  }

  pushColor(triangulaBandColors && triangulaBandColors.band1, '#8ac926');
  pushColor(triangulaBandColors && triangulaBandColors.band2, '#6a4c93');
  pushColor(triangulaBandColors && triangulaBandColors.band4, '#1982c4');

  var source = normalizeTriangulaFillColor(triangulaSourceColor, '#8ac926');
  if (source !== 'rainbow') {
    pushColor(source, '#8ac926');
  }

  if (!palette.length) {
    for (var m = 0; m < magicThreadColors.length; m++) {
      pushColor(magicThreadColors[m], '#1982c4');
    }
  }

  return palette.length ? palette : ['#1982c4', '#8ac926', '#6a4c93'];
}

function getAcknowledgmentsSoftenedColor(color, amount) {
  var base = sanitizeHexColor(color, '#6f7f95');
  return squarusApplyShade(base, Math.max(0, Math.min(1, Number(amount) || 0.55)));
}

function getAcknowledgmentsTextFrameSpec(styleId) {
  var size = getAcknowledgmentsStageLogicalSize();
  if (styleId === 'triangula') {
    var triScale = getAcknowledgmentsTriangulaSideScale(size);
    var tri = buildAcknowledgmentsEquilateralTriangle(size, triScale, 0.86);
    var triTopPad = size * 0.136;
    var triBottomPad = size * 0.03;
    return {
      shapeType: 'path',
      shapePath: 'M ' + tri.apex.x + ' ' + tri.apex.y + ' L ' + tri.left.x + ' ' + tri.left.y + ' L ' + tri.right.x + ' ' + tri.right.y + ' Z',
      textX: size * 0.5,
      textY: tri.apex.y + (tri.height * 0.84),
      maxChars: 18,
      maxCharsMax: 26,
      minFontSize: 20,
      maxFontSize: 24,
      textAreaHeight: tri.height * 0.48,
      triangleApexY: tri.apex.y,
      triangleHeight: tri.height,
      triangleSide: tri.side,
      textPadding: size * 0.045,
      textTop: tri.apex.y + triTopPad,
      textBottom: tri.left.y - triBottomPad
    };
  }
  if (styleId === 'squarus') {
    var rectPad = size * 0.055;
    return {
      shapeType: 'rect',
      shapeRect: {
        x: size * 0.14,
        y: size * 0.14,
        width: size * 0.72,
        height: size * 0.72,
        rx: 18
      },
      textX: size * 0.5,
      textY: size * 0.56,
      maxChars: 34,
      maxCharsMax: 44,
      minFontSize: 20,
      maxFontSize: 28,
      textAreaHeight: size * 0.56,
      textPadding: size * 0.05,
      textTop: size * 0.14 + rectPad,
      textBottom: size * 0.86 - rectPad
    };
  }

  var circlePad = size * 0.055;
  return {
    shapeType: 'circle',
    shapeCircle: {
      cx: size * 0.5,
      cy: size * 0.5,
      r: size * 0.35
    },
    textX: size * 0.5,
    textY: size * 0.58,
    maxChars: 30,
    maxCharsMax: 40,
    minFontSize: 20,
    maxFontSize: 27,
    textAreaHeight: size * 0.55,
    textPadding: size * 0.05,
    textTop: (size * 0.5 - size * 0.35) + circlePad,
    textBottom: (size * 0.5 + size * 0.35) - circlePad
  };
}

var acknowledgmentsTextMeasureCanvas = null;

function getAcknowledgmentsTextMeasureContext() {
  if (!acknowledgmentsTextMeasureCanvas) {
    acknowledgmentsTextMeasureCanvas = document.createElement('canvas');
  }
  return acknowledgmentsTextMeasureCanvas.getContext('2d');
}

function measureAcknowledgmentsTextWidth(text, fontSize, fontFamily, fontWeight) {
  var ctx = getAcknowledgmentsTextMeasureContext();
  if (!ctx) return (String(text || '').length * fontSize * 0.62);
  ctx.font = String(fontWeight || 700) + ' ' + String(Math.max(8, fontSize || 12)) + 'px ' + String(fontFamily || 'sans-serif');
  return ctx.measureText(String(text || '')).width;
}

function getAcknowledgmentsLineMaxWidthForY(spec, lineY, stageSize) {
  var safePad = Math.max(6, Number(spec && spec.textPadding) || (stageSize * 0.03));
  var sideGuard = Math.max(8, safePad * 0.5);
  if (!spec) return stageSize - (safePad * 2);

  if (spec.shapeType === 'rect' && spec.shapeRect) {
    return Math.max(20, spec.shapeRect.width - (safePad * 2) - sideGuard);
  }

  if (spec.shapeType === 'circle' && spec.shapeCircle) {
    var dy = lineY - spec.shapeCircle.cy;
    var r = Math.max(1, spec.shapeCircle.r - safePad);
    var inside = (r * r) - (dy * dy);
    if (inside <= 0) return 20;
    return Math.max(20, Math.sqrt(inside) * 2 - sideGuard);
  }

  if (spec.shapeType === 'path' && isFinite(spec.triangleApexY) && isFinite(spec.triangleHeight) && isFinite(spec.triangleSide)) {
    var t = (lineY - spec.triangleApexY) / Math.max(1e-6, spec.triangleHeight);
    t = clamp01(t);
    return Math.max(20, (spec.triangleSide * t) - (safePad * 2) - sideGuard);
  }

  return Math.max(20, stageSize - (safePad * 2) - sideGuard);
}

function buildAcknowledgmentsWrappedLines(text, maxChars, maxLines) {
  var safeText = String(text || '').replace(/\s+/g, ' ').trim();
  if (!safeText) return [];

  var words = safeText.split(' ');
  var lines = [];
  var current = '';
  for (var i = 0; i < words.length; i++) {
    var probe = current ? (current + ' ' + words[i]) : words[i];
    if (probe.length <= maxChars || !current) {
      current = probe;
      continue;
    }
    lines.push(current);
    current = words[i];
    if (maxLines > 0 && lines.length >= maxLines) break;
  }
  if ((maxLines <= 0 || lines.length < maxLines) && current) {
    lines.push(current);
  }
  if (maxLines > 0 && lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
  }
  return lines;
}

function createAcknowledgmentsTextLayer(styleId) {
  if (!acknowledgmentsPattern) return;

  configureAcknowledgmentsPatternViewport();

  var spec = getAcknowledgmentsTextFrameSpec(styleId);
  var defs = createSvgNode('defs');
  var clipPath = createSvgNode('clipPath');
  var clipId = 'acknowledgments-text-clip-' + styleId;
  var textFilterId = 'acknowledgments-text-edge-' + styleId;
  clipPath.setAttribute('id', clipId);

  var textFilter = createSvgNode('filter');
  textFilter.setAttribute('id', textFilterId);
  textFilter.setAttribute('x', '-12%');
  textFilter.setAttribute('y', '-12%');
  textFilter.setAttribute('width', '124%');
  textFilter.setAttribute('height', '124%');
  textFilter.setAttribute('color-interpolation-filters', 'sRGB');

  var edgeDilate = createSvgNode('feMorphology');
  edgeDilate.setAttribute('in', 'SourceAlpha');
  edgeDilate.setAttribute('operator', 'dilate');
  edgeDilate.setAttribute('radius', '0.85');
  edgeDilate.setAttribute('result', 'edgeBase');
  textFilter.appendChild(edgeDilate);

  var edgeBlur = createSvgNode('feGaussianBlur');
  edgeBlur.setAttribute('in', 'edgeBase');
  edgeBlur.setAttribute('stdDeviation', '1.15');
  edgeBlur.setAttribute('result', 'edgeBlur');
  textFilter.appendChild(edgeBlur);

  var edgeFlood = createSvgNode('feFlood');
  edgeFlood.setAttribute('flood-color', '#f8fbff');
  edgeFlood.setAttribute('flood-opacity', '0.95');
  edgeFlood.setAttribute('result', 'edgeColor');
  textFilter.appendChild(edgeFlood);

  var edgeComposite = createSvgNode('feComposite');
  edgeComposite.setAttribute('in', 'edgeColor');
  edgeComposite.setAttribute('in2', 'edgeBlur');
  edgeComposite.setAttribute('operator', 'in');
  edgeComposite.setAttribute('result', 'edgeGlow');
  textFilter.appendChild(edgeComposite);

  var textMerge = createSvgNode('feMerge');
  var textMergeEdge = createSvgNode('feMergeNode');
  textMergeEdge.setAttribute('in', 'edgeGlow');
  var textMergeSource = createSvgNode('feMergeNode');
  textMergeSource.setAttribute('in', 'SourceGraphic');
  textMerge.appendChild(textMergeEdge);
  textMerge.appendChild(textMergeSource);
  textFilter.appendChild(textMerge);

  var clipShape = null;
  var frameOutline = null;
  if (spec.shapeType === 'rect') {
    clipShape = createSvgNode('rect');
    clipShape.setAttribute('x', String(spec.shapeRect.x));
    clipShape.setAttribute('y', String(spec.shapeRect.y));
    clipShape.setAttribute('width', String(spec.shapeRect.width));
    clipShape.setAttribute('height', String(spec.shapeRect.height));
    clipShape.setAttribute('rx', String(spec.shapeRect.rx));

    frameOutline = createSvgNode('rect');
    frameOutline.setAttribute('x', String(spec.shapeRect.x));
    frameOutline.setAttribute('y', String(spec.shapeRect.y));
    frameOutline.setAttribute('width', String(spec.shapeRect.width));
    frameOutline.setAttribute('height', String(spec.shapeRect.height));
    frameOutline.setAttribute('rx', String(spec.shapeRect.rx));
  } else if (spec.shapeType === 'circle') {
    clipShape = createSvgNode('circle');
    clipShape.setAttribute('cx', String(spec.shapeCircle.cx));
    clipShape.setAttribute('cy', String(spec.shapeCircle.cy));
    clipShape.setAttribute('r', String(spec.shapeCircle.r));

    frameOutline = createSvgNode('circle');
    frameOutline.setAttribute('cx', String(spec.shapeCircle.cx));
    frameOutline.setAttribute('cy', String(spec.shapeCircle.cy));
    frameOutline.setAttribute('r', String(spec.shapeCircle.r));
  } else {
    clipShape = createSvgNode('path');
    clipShape.setAttribute('d', spec.shapePath);

    frameOutline = createSvgNode('path');
    frameOutline.setAttribute('d', spec.shapePath);
  }

  clipPath.appendChild(clipShape);
  defs.appendChild(clipPath);
  defs.appendChild(textFilter);
  acknowledgmentsPattern.appendChild(defs);

  frameOutline.setAttribute('fill', 'none');
  if (spec.shapeType === 'rect') {
    // Squarus uses an internal square clip frame; keep it invisible.
    frameOutline.setAttribute('stroke', 'none');
    frameOutline.setAttribute('opacity', '0');
  } else {
    frameOutline.setAttribute('stroke', '#748292');
    frameOutline.setAttribute('stroke-width', '2');
    frameOutline.setAttribute('opacity', '0.32');
  }
  acknowledgmentsPattern.appendChild(frameOutline);

  var textGroup = createSvgNode('g');
  textGroup.setAttribute('clip-path', 'url(#' + clipId + ')');
  textGroup.setAttribute('filter', 'url(#' + textFilterId + ')');
  textGroup.setAttribute('opacity', '0');

  var textNode = createSvgNode('text');
  textNode.setAttribute('x', String(spec.textX));
  textNode.setAttribute('y', String(spec.textY));
  textNode.setAttribute('fill', 'rgba(16, 23, 35, 0.9)');
  textNode.setAttribute('text-anchor', 'middle');
  textNode.setAttribute('font-size', '29');
  textNode.setAttribute('font-family', '"Clacon2", "Nunito", sans-serif');
  textNode.setAttribute('font-weight', '700');
  textNode.setAttribute('paint-order', 'stroke');
  textNode.setAttribute('stroke', 'rgba(248, 252, 255, 0.88)');
  textNode.setAttribute('stroke-width', '1.18');
  textNode.setAttribute('stroke-linejoin', 'round');

  textGroup.appendChild(textNode);
  acknowledgmentsPattern.appendChild(textGroup);

  acknowledgmentsViewerState.svgTextGroup = textGroup;
  acknowledgmentsViewerState.svgTextNode = textNode;
  acknowledgmentsViewerState.svgTextSpec = spec;
  acknowledgmentsViewerState.svgTextMaxChars = spec.maxChars;
  acknowledgmentsViewerState.svgTextMaxLines = spec.maxLines || 0;
  acknowledgmentsViewerState.svgTextLineHeight = spec.lineHeight || 32;
  acknowledgmentsViewerState.svgTextAnchorY = spec.textY;
}

function updateAcknowledgmentsSvgText(text) {
  var svgTextNode = acknowledgmentsViewerState.svgTextNode;
  if (!svgTextNode) return;
  var stageSize = getAcknowledgmentsStageLogicalSize();

  var safeText = String(text || '');
  if (acknowledgmentsViewerState.lastRevealText === safeText) return;
  acknowledgmentsViewerState.lastRevealText = safeText;

  while (svgTextNode.firstChild) {
    svgTextNode.removeChild(svgTextNode.firstChild);
  }

  if (!safeText) return;
  var spec = acknowledgmentsViewerState.svgTextSpec || {};
  var maxChars = Math.max(14, parseBoundedInt(acknowledgmentsViewerState.svgTextMaxChars, 14, 64, 32));
  var maxCharsCap = Math.max(maxChars, parseBoundedInt(spec.maxCharsMax, maxChars, 72, maxChars + 10));
  var maxLines = Math.max(0, parseBoundedInt(acknowledgmentsViewerState.svgTextMaxLines, 0, 24, 0));
  var textAreaHeight = Math.max(140, parseBoundedInt(spec.textAreaHeight, 140, stageSize - 40, Math.floor(stageSize * 0.56)));
  var minFontSize = Math.max(12, parseBoundedInt(spec.minFontSize, 12, 26, 15));
  var maxFontSize = Math.max(minFontSize, parseBoundedInt(spec.maxFontSize, minFontSize, 38, 27));
  var lines = [];
  var fontSize = minFontSize;
  var charLimit = maxChars;
  var fontFamily = svgTextNode.getAttribute('font-family') || 'sans-serif';
  var fontWeight = svgTextNode.getAttribute('font-weight') || '400';

  while (true) {
    lines = buildAcknowledgmentsWrappedLines(safeText, charLimit, maxLines);
    if (!lines.length) break;
    var candidate = Math.floor(textAreaHeight / Math.max(1, lines.length * 1.24));
    fontSize = Math.max(minFontSize, Math.min(maxFontSize, candidate));
    if (fontSize > minFontSize || charLimit >= maxCharsCap) break;
    charLimit = Math.min(maxCharsCap, charLimit + 2);
  }
  if (!lines.length) return;

  var lineHeight = Math.max(18, Math.round(fontSize * 1.22));
  var textTop = isFinite(spec.textTop) ? spec.textTop : 80;
  var textBottom = isFinite(spec.textBottom) ? spec.textBottom : (stageSize - 80);
  var availableHeight = Math.max(40, textBottom - textTop);
  var ascentRatio = 0.78;
  var descentRatio = 0.22;
  var topPad = Math.max(2, fontSize * 0.08);
  var bottomPad = Math.max(2, fontSize * 0.06);
  var ascent = fontSize * ascentRatio;
  var descent = fontSize * descentRatio;
  var totalHeight = ascent + descent + ((lines.length - 1) * lineHeight) + topPad + bottomPad;
  while (totalHeight > availableHeight && fontSize > minFontSize) {
    fontSize -= 1;
    lineHeight = Math.max(16, Math.round(fontSize * 1.2));
    topPad = Math.max(2, fontSize * 0.08);
    bottomPad = Math.max(2, fontSize * 0.06);
    ascent = fontSize * ascentRatio;
    descent = fontSize * descentRatio;
    totalHeight = ascent + descent + ((lines.length - 1) * lineHeight) + topPad + bottomPad;
  }

  function fitsAllLineWidths() {
    var baselineStartProbe = textTop + ((availableHeight - totalHeight) * 0.5) + topPad + ascent;
    for (var li = 0; li < lines.length; li++) {
      var ly = baselineStartProbe + li * lineHeight;
      var allowed = getAcknowledgmentsLineMaxWidthForY(spec, ly, stageSize);
      var measured = measureAcknowledgmentsTextWidth(lines[li], fontSize, fontFamily, fontWeight);
      if (measured > allowed) return false;
    }
    return true;
  }

  while (!fitsAllLineWidths() && fontSize > minFontSize) {
    fontSize -= 1;
    lineHeight = Math.max(16, Math.round(fontSize * 1.2));
    topPad = Math.max(2, fontSize * 0.08);
    bottomPad = Math.max(2, fontSize * 0.06);
    ascent = fontSize * ascentRatio;
    descent = fontSize * descentRatio;
    totalHeight = ascent + descent + ((lines.length - 1) * lineHeight) + topPad + bottomPad;
    if (totalHeight > availableHeight) {
      continue;
    }
  }

  svgTextNode.setAttribute('font-size', String(fontSize));
  svgTextNode.setAttribute('stroke-width', String(Math.max(0.45, fontSize * 0.03)));

  var baselineStart = textTop + ((availableHeight - totalHeight) * 0.5) + topPad + ascent;
  if (!isFinite(baselineStart)) baselineStart = textTop + topPad + ascent;
  for (var i = 0; i < lines.length; i++) {
    var lineY = baselineStart + i * lineHeight;
    var maxWidth = getAcknowledgmentsLineMaxWidthForY(spec, lineY, stageSize);
    var measuredWidth = measureAcknowledgmentsTextWidth(lines[i], fontSize, fontFamily, fontWeight);
    var tspan = createSvgNode('tspan');
    tspan.setAttribute('x', svgTextNode.getAttribute('x') || String(stageSize * 0.5));
    tspan.setAttribute('y', String(lineY));
    if (measuredWidth > maxWidth) {
      // Last-resort clamp for edge cases (e.g., very long single tokens).
      tspan.setAttribute('textLength', String(Math.max(18, maxWidth - 2)));
      tspan.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    }
    tspan.textContent = lines[i];
    svgTextNode.appendChild(tspan);
  }

  ensureAcknowledgmentsTextLayerInFront();
}

function setAcknowledgmentsLineReveal(text, progress) {
  var safeText = String(text || '');
  var p = clamp01(progress);
  var revealText = safeText;
  if (acknowledgmentsLineText) {
    acknowledgmentsLineText.textContent = revealText;
  }
  updateAcknowledgmentsSvgText(revealText);

  if (acknowledgmentsViewerState.svgTextGroup) {
    var fadeStart = ACKNOWLEDGMENTS_TEXT_FADE_START;
    var fadeEnd = Math.max(fadeStart + 0.04, ACKNOWLEDGMENTS_TEXT_FADE_END);
    var alpha = 0;
    if (p >= fadeEnd) {
      alpha = 0.95;
    } else if (p > fadeStart) {
      var local = (p - fadeStart) / (fadeEnd - fadeStart);
      alpha = 0.95 * easeInOutCubic(clamp01(local));
    }
    acknowledgmentsViewerState.svgTextGroup.setAttribute('opacity', String(alpha));
  }
}

function getAcknowledgmentsSecondsPerBeat() {
  return 60 / ACKNOWLEDGMENTS_BPM;
}

function getAcknowledgmentsBaseLineDurationMs() {
  var spb = getAcknowledgmentsSecondsPerBeat();
  return Math.round(ACKNOWLEDGMENTS_LINE_BEATS * spb * 1000);
}

function countAcknowledgmentsWords(text) {
  var safeText = String(text || '').trim();
  if (!safeText) return 0;
  var matches = safeText.match(/\S+/g);
  return matches ? matches.length : 0;
}

function buildAcknowledgmentsLineDurations(lines) {
  var safeLines = Array.isArray(lines) && lines.length ? lines : ACKNOWLEDGMENTS_FALLBACK_LINES;
  var raw = [];
  var totalRaw = 0;
  for (var i = 0; i < safeLines.length; i++) {
    var words = countAcknowledgmentsWords(safeLines[i]);
    var ms = ACKNOWLEDGMENTS_LINE_BASE_MS + (words * ACKNOWLEDGMENTS_MS_PER_WORD);
    ms = Math.max(ACKNOWLEDGMENTS_LINE_MIN_MS, Math.min(ACKNOWLEDGMENTS_LINE_MAX_MS, Math.round(ms)));
    raw.push(ms);
    totalRaw += ms;
  }

  if (!raw.length) return [getAcknowledgmentsBaseLineDurationMs()];

  var trackDurationSec = (acknowledgmentsAudio && isFinite(acknowledgmentsAudio.duration))
    ? acknowledgmentsAudio.duration
    : 0;
  if (!(trackDurationSec > 0) || !(totalRaw > 0)) {
    return raw;
  }

  var trackMs = Math.round(trackDurationSec * 1000);
  var scale = trackMs / totalRaw;
  scale = Math.max(0.72, Math.min(1.4, scale));

  var scaled = [];
  for (var s = 0; s < raw.length; s++) {
    var scaledMs = Math.round(raw[s] * scale);
    scaled.push(Math.max(ACKNOWLEDGMENTS_LINE_MIN_MS, Math.min(ACKNOWLEDGMENTS_LINE_MAX_MS, scaledMs)));
  }
  return scaled;
}

function getAcknowledgmentsSeriesLineDurationMs(lineCount) {
  var count = Math.max(1, parseBoundedInt(lineCount, 1, 9999, 1));
  var trackDurationSec = (acknowledgmentsAudio && isFinite(acknowledgmentsAudio.duration))
    ? acknowledgmentsAudio.duration
    : 0;
  if (trackDurationSec > 0) {
    var perLineMs = Math.round((trackDurationSec * 1000) / count);
    return Math.max(2500, Math.min(14000, perLineMs));
  }
  return getAcknowledgmentsBaseLineDurationMs();
}

function getAcknowledgmentsLineDurationMs(styleId, visual, animatorData) {
  if (Array.isArray(acknowledgmentsViewerState.lineDurationsMsByIndex) && acknowledgmentsViewerState.lineDurationsMsByIndex.length) {
    var index = parseBoundedInt(acknowledgmentsViewerState.lineIndex, 0, acknowledgmentsViewerState.lineDurationsMsByIndex.length - 1, 0);
    var perLine = acknowledgmentsViewerState.lineDurationsMsByIndex[index];
    if (isFinite(perLine) && perLine > 0) {
      return perLine;
    }
  }
  if (isFinite(acknowledgmentsViewerState.seriesLineDurationMs) && acknowledgmentsViewerState.seriesLineDurationMs > 0) {
    return acknowledgmentsViewerState.seriesLineDurationMs;
  }
  return getAcknowledgmentsBaseLineDurationMs();
}

function buildAcknowledgmentsStitchingAnimator(visual) {
  clearAcknowledgmentsPattern();
  createAcknowledgmentsTextLayer('stitching');
  var width = configureAcknowledgmentsPatternViewport();
  var height = width;
  var centerX = width * 0.5;
  var centerY = height * 0.5;
  var radius = Math.min(width, height) * 0.35;
  var holeCount = Math.max(16, parseBoundedInt(visual && visual.holes, 16, 120, 42));
  var jump = Math.max(2, parseBoundedInt(visual && visual.jump, 2, holeCount - 1, 5));
  var lineWidth = Math.max(1, parseBoundedInt(visual && visual.width, 1, 3, 2));
  var palette = getAcknowledgmentsPaletteColors();

  var pointsList = [];
  for (var i = 0; i < holeCount; i++) {
    var theta = -Math.PI / 2 + (Math.PI * 2 * i / holeCount);
    pointsList.push({
      x: centerX + Math.cos(theta) * radius,
      y: centerY + Math.sin(theta) * radius
    });
  }

  var circle = createSvgNode('circle');
  circle.setAttribute('cx', String(centerX));
  circle.setAttribute('cy', String(centerY));
  circle.setAttribute('r', String(radius));
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[0] || '#b5bdc8', 0.5));
  circle.setAttribute('stroke-width', '1');
  circle.setAttribute('stroke-opacity', '0.28');
  acknowledgmentsPattern.appendChild(circle);

  for (var h = 0; h < holeCount; h++) {
    var hole = createSvgNode('circle');
    hole.setAttribute('cx', String(pointsList[h].x));
    hole.setAttribute('cy', String(pointsList[h].y));
    hole.setAttribute('r', '1.8');
    hole.setAttribute('fill', getAcknowledgmentsSoftenedColor(palette[h % palette.length] || '#8e98a8', 0.56));
    hole.setAttribute('opacity', '0.44');
    acknowledgmentsPattern.appendChild(hole);
  }

  var sequence = [];
  var visited = new Array(holeCount).fill(false);
  var current = 0;
  for (var s = 0; s < holeCount; s++) {
    if (visited[current]) break;
    visited[current] = true;
    sequence.push(current);
    current = (current + jump) % holeCount;
  }

  var segments = [];
  for (var si = 0; si < sequence.length; si++) {
    var from = pointsList[sequence[si]];
    var to = pointsList[sequence[(si + 1) % sequence.length]];
    var line = createSvgNode('line');
    line.setAttribute('x1', String(from.x));
    line.setAttribute('y1', String(from.y));
    line.setAttribute('x2', String(from.x));
    line.setAttribute('y2', String(from.y));
    line.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[si % palette.length] || '#2c323a', 0.4));
    line.setAttribute('stroke-width', String(lineWidth));
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('opacity', '0.6');
    acknowledgmentsPattern.appendChild(line);
    segments.push({ line: line, from: from, to: to });
  }

  return {
    segmentCount: segments.length,
    render: function(progress) {
    var p = clamp01(progress);
    var scaled = p * segments.length;
    var fullCount = Math.floor(scaled);
    var partial = scaled - fullCount;

    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      if (i < fullCount) {
        seg.line.setAttribute('x2', String(seg.to.x));
        seg.line.setAttribute('y2', String(seg.to.y));
      } else if (i === fullCount) {
        var px = seg.from.x + (seg.to.x - seg.from.x) * partial;
        var py = seg.from.y + (seg.to.y - seg.from.y) * partial;
        seg.line.setAttribute('x2', String(px));
        seg.line.setAttribute('y2', String(py));
      } else {
        seg.line.setAttribute('x2', String(seg.from.x));
        seg.line.setAttribute('y2', String(seg.from.y));
      }
    }
    }
  };
}

function splitAcknowledgmentsTriangle(vertices) {
  var m01 = { x: (vertices[0].x + vertices[1].x) / 2, y: (vertices[0].y + vertices[1].y) / 2 };
  var m12 = { x: (vertices[1].x + vertices[2].x) / 2, y: (vertices[1].y + vertices[2].y) / 2 };
  var m20 = { x: (vertices[2].x + vertices[0].x) / 2, y: (vertices[2].y + vertices[0].y) / 2 };
  return {
    central: [m01, m12, m20],
    children: [
      { vertices: [vertices[0], m01, m20], slot: 1 },
      { vertices: [m01, vertices[1], m12], slot: 2 },
      { vertices: [m20, m12, vertices[2]], slot: 4 }
    ]
  };
}

function collectAcknowledgmentsTriangles(vertices, depth, slot, collector) {
  if (depth <= 0) {
    collector.push({ vertices: vertices, slot: slot || 1 });
    return;
  }
  var split = splitAcknowledgmentsTriangle(vertices);
  for (var i = 0; i < split.children.length; i++) {
    collectAcknowledgmentsTriangles(split.children[i].vertices, depth - 1, split.children[i].slot, collector);
  }
}

function collectAcknowledgmentsCutCenters(vertices, depth, collector) {
  if (depth <= 0) return;
  var split = splitAcknowledgmentsTriangle(vertices);
  if (depth === 1) {
    collector.push(split.central);
    return;
  }
  for (var i = 0; i < split.children.length; i++) {
    collectAcknowledgmentsCutCenters(split.children[i].vertices, depth - 1, collector);
  }
}

function toAcknowledgmentsPath(vertices) {
  return 'M ' + vertices[0].x + ' ' + vertices[0].y + ' L ' + vertices[1].x + ' ' + vertices[1].y + ' L ' + vertices[2].x + ' ' + vertices[2].y + ' Z';
}

function buildAcknowledgmentsTriangulaAnimator(visual) {
  clearAcknowledgmentsPattern();
  createAcknowledgmentsTextLayer('triangula');
  var width = configureAcknowledgmentsPatternViewport();
  var height = width;
  var depth = Math.max(2, parseBoundedInt(visual && visual.depth, 2, 5, 3));
  var mode = visual && visual.mode === 'cut' ? 'cut' : 'shrink';
  var palette = getAcknowledgmentsPaletteColors();
  var triScale = getAcknowledgmentsTriangulaSideScale(width);
  var tri = buildAcknowledgmentsEquilateralTriangle(width, triScale, 0.86);
  var base = [tri.apex, tri.left, tri.right];

  var basePath = createSvgNode('path');
  basePath.setAttribute('d', toAcknowledgmentsPath(base));
  basePath.setAttribute('fill', 'none');
  basePath.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[0] || '#3d4652', 0.48));
  basePath.setAttribute('stroke-width', '2');
  basePath.setAttribute('opacity', '0.54');
  acknowledgmentsPattern.appendChild(basePath);

  var elements = [];
  var timelineBeats = 0;
  var slotPalette = {
    1: getTriangulaFillColorForSlot(1, 0),
    2: getTriangulaFillColorForSlot(2, 1),
    4: getTriangulaFillColorForSlot(4, 2)
  };
  if (mode === 'cut') {
    for (var d = 1; d <= depth; d++) {
      var cuts = [];
      collectAcknowledgmentsCutCenters(base, d, cuts);
      timelineBeats += (visual && visual.fractalMode === 'parallel') ? 1.85 : (cuts.length * 0.95);
      for (var c = 0; c < cuts.length; c++) {
        var cutPath = createSvgNode('path');
        cutPath.setAttribute('d', toAcknowledgmentsPath(cuts[c]));
        cutPath.setAttribute('fill', getAcknowledgmentsSoftenedColor(palette[(c + d) % palette.length] || '#6f7b8a', 0.48));
        cutPath.setAttribute('fill-opacity', '0.46');
        cutPath.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[(c + d + 1) % palette.length] || '#353f4b', 0.38));
        cutPath.setAttribute('stroke-opacity', '0.56');
        cutPath.setAttribute('stroke-width', '1.2');
        cutPath.setAttribute('opacity', '0');
        acknowledgmentsPattern.appendChild(cutPath);
        elements.push(cutPath);
      }
    }
  } else {
    for (var level = 1; level <= depth; level++) {
      var triangles = [];
      collectAcknowledgmentsTriangles(base, level, 1, triangles);
      timelineBeats += (visual && visual.fractalMode === 'parallel') ? 1.75 : (triangles.length * 0.92);
      for (var t = 0; t < triangles.length; t++) {
        var trianglePath = createSvgNode('path');
        trianglePath.setAttribute('d', toAcknowledgmentsPath(triangles[t].vertices));
        trianglePath.setAttribute('fill', getAcknowledgmentsSoftenedColor(slotPalette[triangles[t].slot] || palette[t % palette.length], 0.5));
        trianglePath.setAttribute('fill-opacity', '0.48');
        trianglePath.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[(t + level) % palette.length] || '#2f3946', 0.4));
        trianglePath.setAttribute('stroke-opacity', '0.58');
        trianglePath.setAttribute('stroke-width', String(Math.max(0.6, 1.2 - level * 0.1)));
        trianglePath.setAttribute('opacity', '0');
        acknowledgmentsPattern.appendChild(trianglePath);
        elements.push(trianglePath);
      }
    }
  }

  return {
    timelineBeats: timelineBeats,
    render: function(progress) {
    var p = clamp01(progress);
    var scaled = p * elements.length;
    var fullCount = Math.floor(scaled);
    var partial = scaled - fullCount;
    for (var i = 0; i < elements.length; i++) {
      if (i < fullCount) {
        elements[i].setAttribute('opacity', mode === 'cut' ? '0.72' : '0.66');
      } else if (i === fullCount) {
        elements[i].setAttribute('opacity', String(mode === 'cut' ? (partial * 0.72) : (partial * 0.66)));
      } else {
        elements[i].setAttribute('opacity', '0');
      }
    }
    }
  };
}

function getAcknowledgmentsPieceWorldPoint(piece, target, cellX, cellY) {
  var cosR = Math.cos(target.rotation);
  var sinR = Math.sin(target.rotation);
  var localX = (cellX - piece.centroidX) * target.scale;
  var localY = (cellY - piece.centroidY) * target.scale;
  return {
    x: target.x + (localX * cosR - localY * sinR),
    y: target.y + (localX * sinR + localY * cosR)
  };
}

function buildAcknowledgmentsViewportMapper(points) {
  var width = getAcknowledgmentsStageLogicalSize();
  var height = width;
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  for (var i = 0; i < points.length; i++) {
    minX = Math.min(minX, points[i].x);
    minY = Math.min(minY, points[i].y);
    maxX = Math.max(maxX, points[i].x);
    maxY = Math.max(maxY, points[i].y);
  }
  if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
    minX = 0; minY = 0; maxX = 1; maxY = 1;
  }
  var pad = 16;
  var sx = (width - pad * 2) / Math.max(1e-3, maxX - minX);
  var sy = (height - pad * 2) / Math.max(1e-3, maxY - minY);
  var scale = Math.min(sx, sy);
  var offsetX = pad + (width - pad * 2 - ((maxX - minX) * scale)) * 0.5;
  var offsetY = pad + (height - pad * 2 - ((maxY - minY) * scale)) * 0.5;
  return function(point) {
    return {
      x: offsetX + (point.x - minX) * scale,
      y: offsetY + (point.y - minY) * scale,
      scale: scale
    };
  };
}

function buildAcknowledgmentsSquarusAnimator(visual) {
  clearAcknowledgmentsPattern();
  createAcknowledgmentsTextLayer('squarus');
  var stageSize = configureAcknowledgmentsPatternViewport();
  var previousOrder = squarusOrder;
  var previousLayout = squarusLayout;
  var previousPieceCount = squarusPieceCount;
  var previousSequenceSeed = squarusSequenceSeed;
  var previousContactMode = squarusContactMode;
  var previousAnimationMode = squarusAnimationMode;

  var order = Math.max(2, parseBoundedInt(visual && visual.order, 2, 6, 4));
  var requestedLayout = (visual && visual.layout) ? String(visual.layout) : 'force-directed';
  var sequenceSeed = Math.max(1, parseBoundedInt(visual && visual.sequenceSeed, 1, 999, 7));

  squarusOrder = order;
  squarusLayout = requestedLayout;
  squarusContactMode = 'formula-only';
  squarusAnimationMode = 'sequential';
  squarusSequenceSeed = sequenceSeed;

  var orderedPieces = getSquarusSequencedPieces(squarusOrder, squarusSequenceSeed);
  var pieceCount = Math.max(1, Math.min(orderedPieces.length, parseBoundedInt(visual && visual.pieceCount, 1, orderedPieces.length || 1, 10)));
  squarusPieceCount = pieceCount;
  var pieces = orderedPieces.slice(0, pieceCount);
  var targets = buildSquarusTargets(pieces, squarusLayout).slice(0, pieceCount);

  squarusOrder = previousOrder;
  squarusLayout = previousLayout;
  squarusPieceCount = previousPieceCount;
  squarusSequenceSeed = previousSequenceSeed;
  squarusContactMode = previousContactMode;
  squarusAnimationMode = previousAnimationMode;

  var allPoints = [];
  for (var i = 0; i < pieceCount; i++) {
    var target = targets[i];
    var piece = pieces[i];
    allPoints.push({ x: target.x, y: target.y });
    for (var c = 0; c < piece.cells.length; c++) {
      var p1 = getAcknowledgmentsPieceWorldPoint(piece, target, piece.cells[c][0], piece.cells[c][1]);
      var p2 = getAcknowledgmentsPieceWorldPoint(piece, target, piece.cells[c][0] + 1, piece.cells[c][1] + 1);
      allPoints.push(p1);
      allPoints.push(p2);
    }
  }
  var mapPoint = buildAcknowledgmentsViewportMapper(allPoints);
  var palette = getAcknowledgmentsPaletteColors();
  var groups = [];

  for (var p = 0; p < pieceCount; p++) {
    var pieceMeta = pieces[p];
    var targetMeta = targets[p];
    var mappedTarget = mapPoint({ x: targetMeta.x, y: targetMeta.y });
    var targetScale = targetMeta.scale * mappedTarget.scale;
    var group = createSvgNode('g');
    group.setAttribute('opacity', '0.12');
    acknowledgmentsPattern.appendChild(group);

    for (var rc = 0; rc < pieceMeta.cells.length; rc++) {
      var rect = createSvgNode('rect');
      rect.setAttribute('x', String((pieceMeta.cells[rc][0] - pieceMeta.centroidX) * targetScale));
      rect.setAttribute('y', String((pieceMeta.cells[rc][1] - pieceMeta.centroidY) * targetScale));
      rect.setAttribute('width', String(targetScale));
      rect.setAttribute('height', String(targetScale));
      rect.setAttribute('fill', getAcknowledgmentsSoftenedColor(palette[p % palette.length], 0.52));
      rect.setAttribute('fill-opacity', '0.46');
      rect.setAttribute('stroke', '#6a7a90');
      rect.setAttribute('stroke-opacity', '0.44');
      rect.setAttribute('stroke-width', String(Math.max(0.55, targetScale * 0.045)));
      group.appendChild(rect);
    }

    var seedAngle = p * (Math.PI * (3 - Math.sqrt(5)));
    var scatterRadius = 130 * mappedTarget.scale;
    groups.push({
      group: group,
      targetX: mappedTarget.x,
      targetY: mappedTarget.y,
      targetR: (targetMeta.rotation * 180 / Math.PI),
      scatterX: (stageSize * 0.5) + Math.cos(seedAngle) * scatterRadius,
      scatterY: (stageSize * 0.5) + Math.sin(seedAngle) * scatterRadius,
      scatterR: (seedAngle * 180 / Math.PI) + 90
    });
  }

  var defaultBpm = DEFAULT_ANIMATION_BPM;
  var scale = defaultBpm / ACKNOWLEDGMENTS_BPM;
  var d = {
    scatter: 0.7 * scale,
    reveal: 0,
    travel: 2.0 * scale,
    snap: 0.5 * scale,
    fade: 0.5 * scale
  };
  var pieceMotion = d.scatter + d.reveal + d.travel + d.snap;
  var totalSeconds = pieceCount > 0 ? (pieceMotion * pieceCount + d.fade) : d.scatter;

  return {
    pieceCount: pieceCount,
    durationMs: Math.round(totalSeconds * 1000),
    render: function(progress) {
      var elapsedSeconds = clamp01(progress) * totalSeconds;
      for (var i = 0; i < groups.length; i++) {
        var localT = elapsedSeconds - (i * pieceMotion);
        var x = groups[i].scatterX;
        var y = groups[i].scatterY;
        var rot = groups[i].scatterR;
        var localOpacity = 0.16;

        if (localT > 0 && localT < d.scatter) {
          localOpacity = 0.28;
        } else if (localT >= d.scatter && localT < (d.scatter + d.reveal + d.travel)) {
          var travelP = easeInOutCubic(clamp01((localT - d.scatter - d.reveal) / Math.max(1e-4, d.travel)));
          x = groups[i].scatterX + (groups[i].targetX - groups[i].scatterX) * travelP;
          y = groups[i].scatterY + (groups[i].targetY - groups[i].scatterY) * travelP;
          rot = groups[i].scatterR + (groups[i].targetR - groups[i].scatterR) * travelP;
          localOpacity = 0.2 + 0.52 * travelP;
        } else if (localT >= (d.scatter + d.reveal + d.travel)) {
          x = groups[i].targetX;
          y = groups[i].targetY;
          rot = groups[i].targetR;
          localOpacity = 0.74;
        }

        groups[i].group.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + rot + ')');
        groups[i].group.setAttribute('opacity', String(localOpacity));
      }
    }
  };
}

function buildAcknowledgmentsStageAnimator(styleId, visual) {
  if (styleId === 'triangula') {
    return buildAcknowledgmentsTriangulaAnimator(visual);
  }
  if (styleId === 'squarus') {
    return buildAcknowledgmentsSquarusAnimator(visual);
  }
  return buildAcknowledgmentsStitchingAnimator(visual);
}

function playAcknowledgmentsStage(styleId, visual, lineText) {
  stopAcknowledgmentsStageAnimation();
  configureAcknowledgmentsPatternViewport();
  var animatorBundle = buildAcknowledgmentsStageAnimator(styleId, visual);
  var animator = (typeof animatorBundle === 'function') ? { render: animatorBundle } : animatorBundle;
  var start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  var durationMs = getAcknowledgmentsLineDurationMs(styleId, visual, animator);
  acknowledgmentsViewerState.currentLineDurationMs = durationMs;

  function tick(nowMs) {
    var now = isFinite(nowMs) ? nowMs : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
    var progress = clamp01((now - start) / durationMs);
    if (animator && typeof animator.render === 'function') {
      animator.render(progress);
    }
    setAcknowledgmentsLineReveal(lineText, clamp01((progress - 0.06) / 0.9));
    if (progress >= 1) {
      setAcknowledgmentsLineReveal(lineText, 1);
      acknowledgmentsViewerState.rafId = null;
      return;
    }
    acknowledgmentsViewerState.rafId = requestAnimationFrame(tick);
  }

  acknowledgmentsViewerState.rafId = requestAnimationFrame(tick);
}

function renderAcknowledgmentsPattern(styleId, visual, lineText) {
  playAcknowledgmentsStage(styleId, visual, lineText);
}

function syncAcknowledgmentsControls(linesLength) {
  var total = Math.max(0, parseBoundedInt(linesLength, 0, 9999, 0));
  var index = Math.max(0, parseBoundedInt(acknowledgmentsViewerState.lineIndex, 0, Math.max(0, total - 1), 0));
  if (acknowledgmentsPrevBtn) {
    acknowledgmentsPrevBtn.disabled = index <= 0;
  }
  if (acknowledgmentsNextBtn) {
    acknowledgmentsNextBtn.disabled = index >= (total - 1);
  }
  if (acknowledgmentsAutoplayBtn) {
    acknowledgmentsAutoplayBtn.setAttribute('aria-pressed', acknowledgmentsViewerState.autoPlay ? 'true' : 'false');
    acknowledgmentsAutoplayBtn.textContent = acknowledgmentsViewerState.autoPlay ? 'Pause' : 'Auto play';
  }
}

function renderAcknowledgmentsLine(lines) {
  var safeLines = Array.isArray(lines) && lines.length ? lines : ACKNOWLEDGMENTS_FALLBACK_LINES;
  if (!safeLines.length) {
    safeLines = ['Acknowledgments unavailable.'];
  }
  acknowledgmentsViewerState.lineIndex = Math.max(0, Math.min(acknowledgmentsViewerState.lineIndex, safeLines.length - 1));
  var lineIndex = acknowledgmentsViewerState.lineIndex;
  var styleId = getAcknowledgmentsStyleForIndex(lineIndex);
  var visual = getAcknowledgmentsVisualForIndex(lineIndex, styleId);
  var activeLine = safeLines[lineIndex];

  if (acknowledgmentsLineText) {
    acknowledgmentsLineText.textContent = '';
  }
  if (acknowledgmentsProgress) {
    acknowledgmentsProgress.textContent = String(lineIndex + 1) + ' / ' + String(safeLines.length);
  }

  renderAcknowledgmentsPattern(styleId, visual, activeLine);
  syncAcknowledgmentsControls(safeLines.length);
}

function scheduleAcknowledgmentsAutoplayTick(lines) {
  stopAcknowledgmentsAutoplay();
  if (!acknowledgmentsViewerState.autoPlay) return;
  var safeLines = Array.isArray(lines) ? lines : [];
  if (!safeLines.length) return;
  if (acknowledgmentsViewerState.lineIndex >= safeLines.length - 1) {
    acknowledgmentsViewerState.autoPlay = false;
    syncAcknowledgmentsControls(safeLines.length);
    return;
  }

  var delayMs = Math.max(1200, parseBoundedInt(
    acknowledgmentsViewerState.currentLineDurationMs,
    1200,
    30000,
    ACKNOWLEDGMENTS_AUTOPLAY_DELAY_MS
  ));

  acknowledgmentsViewerState.timerId = window.setTimeout(function() {
    if (!acknowledgmentsModal || !acknowledgmentsModal.classList.contains('open')) return;
    if (!acknowledgmentsViewerState.autoPlay) return;
    acknowledgmentsViewerState.lineIndex = Math.min(acknowledgmentsViewerState.lineIndex + 1, safeLines.length - 1);
    renderAcknowledgmentsLine(safeLines);
    scheduleAcknowledgmentsAutoplayTick(safeLines);
  }, delayMs);
}

