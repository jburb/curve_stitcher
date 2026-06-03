(function() {
  function createStitchingUiModule(deps) {
    deps = deps || {};

    function updateKidControlValues() {
      deps.holesValue.textContent = deps.holesSlider.value;
      deps.jumpValue.textContent = deps.jumpSlider.value;
      deps.multiplyValue.textContent = deps.multiplySlider.value;
      deps.widthValue.textContent = deps.widthSlider.value;
      if (deps.advancedHolesNumberInput) {
        deps.advancedHolesNumberInput.value = deps.holesSlider.value;
      }
    }

    function syncBorderControls() {
      if (!deps.advancedBorderEnabledInput) return;
      deps.advancedBorderEnabledInput.checked = deps.getBorderEnabled();
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

    function getKidStitchByForThread(thread) {
      if (!thread || thread.jumpMode !== 'connect') {
        return 'add';
      }
      return 'multiply';
    }

    function syncKidStitchByControl() {
      var index = getKidTargetThreadIndex();
      if (index < 0 || !deps.getThreads()[index]) {
        deps.kidStitchBySelect.value = 'add';
        return;
      }
      deps.kidStitchBySelect.value = getKidStitchByForThread(deps.getThreads()[index]);
    }

    function syncBasicMathSliderVisibility() {
      if (deps.getCurrentExperienceId() !== 'stitching') {
        deps.addSliderBlock.style.display = 'none';
        deps.multiplySliderBlock.style.display = 'none';
        deps.jumpSlider.disabled = true;
        deps.multiplySlider.disabled = true;
        return;
      }

      var index = getKidTargetThreadIndex();
      var isMultiplyMode = false;
      var threads = deps.getThreads();

      if (index >= 0 && threads[index]) {
        isMultiplyMode = threads[index].jumpMode === 'connect';
      }

      deps.addSliderBlock.style.display = isMultiplyMode ? 'none' : '';
      deps.multiplySliderBlock.style.display = isMultiplyMode ? '' : '';
      deps.multiplySliderBlock.style.display = isMultiplyMode ? '' : 'none';
      deps.jumpSlider.disabled = isMultiplyMode;
      deps.multiplySlider.disabled = !isMultiplyMode;
    }

    function buildMagicThread() {
      var threads = deps.getThreads();
      var selectedThreadIndex = deps.getSelectedThreadIndex();
      var baseIndex = threads.length ? Math.max(0, selectedThreadIndex) : 0;
      var base = threads[baseIndex] || createThread({ jump: 22, width: 2, color: '#1982c4' });
      var jumpShift = (Math.floor(Math.random() * 7) + 2);
      var nextJump = base.jump + jumpShift;
      if (nextJump > 100) nextJump = ((nextJump - 1) % 100) + 1;

      var magicThreadColors = deps.getMagicThreadColors();
      var colorPick = magicThreadColors[Math.floor(Math.random() * magicThreadColors.length)];
      if (threads.length && threads[threads.length - 1].color === colorPick) {
        colorPick = magicThreadColors[(magicThreadColors.indexOf(colorPick) + 1) % magicThreadColors.length];
      }

      return createThread({
        jump: nextJump,
        width: deps.getDefaultThreadSize(),
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
      var threads = deps.getThreads();
      if (!threads.length) return;

      var profile = deps.getExperienceUiProfile(deps.getCurrentExperienceId());
      var paletteMode = profile && profile.paletteMode ? profile.paletteMode : 'thread';
      var color = colorValue || '#1982c4';

      if (paletteMode === 'global') {
        threads.forEach(function(thread) {
          thread.color = color;
        });
        return;
      }

      if (paletteMode === 'triangula-banded') {
        var triangulaBandColors = deps.getTriangulaBandColors();
        var safeColor = deps.normalizeTriangulaFillColor(color, triangulaBandColors.band1);
        threads[0].color = safeColor;
        triangulaBandColors.band1 = safeColor;
        triangulaBandColors.band2 = safeColor;
        triangulaBandColors.band4 = safeColor;
        return;
      }

      var targetIndex = deps.getSelectedThreadIndex();
      if (targetIndex < 0 || targetIndex >= threads.length) {
        targetIndex = 0;
      }
      threads[targetIndex].color = color;
    }

    function syncHoleNumberToggles() {
      var showHoleNumbers = deps.getShowHoleNumbers();
      deps.advancedHoleNumbersToggle.checked = showHoleNumbers;
      deps.holeNumbersToggleBtn.classList.toggle('active', showHoleNumbers);
      deps.holeNumbersToggleBtn.setAttribute('aria-pressed', showHoleNumbers ? 'true' : 'false');
      deps.holeNumbersToggleBtn.title = showHoleNumbers ? 'Hole numbers on' : 'Hole numbers off';
    }

    function refreshKidThreadPicker() {
      var threads = deps.getThreads();
      var profile = deps.getExperienceUiProfile(deps.getCurrentExperienceId());
      var threadsEnabled = !profile || profile.threadsEnabled !== false;
      var allowMultipleThreads = !profile || profile.allowMultipleThreads !== false;
      var showThreadPicker = threadsEnabled && allowMultipleThreads && threads.length > 1;

      deps.kidThreadPicker.style.display = showThreadPicker ? 'inline-flex' : 'none';
      deps.removeLastThreadBtn.style.display = showThreadPicker ? '' : 'none';
      deps.kidThreadMenu.innerHTML = '';
      deps.removeLastThreadBtn.disabled = !showThreadPicker;

      if (!threadsEnabled || !allowMultipleThreads) {
        deps.kidThreadToggle.disabled = true;
        deps.kidThreadMenu.setAttribute('hidden', '');
        deps.kidThreadToggle.setAttribute('aria-expanded', 'false');
        return;
      }

      if (!threads.length) {
        deps.kidThreadToggle.disabled = true;
        deps.kidThreadActiveLabel.textContent = 'No threads';
        applyThreadSwatchStyle(deps.kidThreadActiveSwatch, '#cccccc');
        return;
      }

      deps.kidThreadToggle.disabled = false;
      var selectedThreadIndex = deps.getSelectedThreadIndex();

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
        deps.kidThreadMenu.appendChild(option);
      }

      var selectedIndex = getKidTargetThreadIndex();
      var selectedThread = threads[selectedIndex];
      if (selectedThread) {
        deps.kidThreadActiveLabel.textContent = 'Thread ' + (selectedIndex + 1);
        applyThreadSwatchStyle(deps.kidThreadActiveSwatch, selectedThread.color);
      }
    }

    function getKidTargetThreadIndex() {
      var threads = deps.getThreads();
      if (!threads.length) return -1;
      var selectedThreadIndex = deps.getSelectedThreadIndex();
      if (selectedThreadIndex >= 0 && selectedThreadIndex < threads.length) {
        return selectedThreadIndex;
      }
      return 0;
    }

    function syncKidControlsFromSelectedThread() {
      var index = getKidTargetThreadIndex();
      refreshKidThreadPicker();
      if (index < 0) return;
      var threads = deps.getThreads();
      deps.ensureThreadConnectConfig(threads[index]);
      deps.jumpSlider.value = threads[index].jump;
      deps.multiplySlider.value = threads[index].connectMultiplier;
      deps.widthSlider.value = threads[index].width;
      syncKidStitchByControl();
      syncBasicMathSliderVisibility();
      updateKidControlValues();
    }

    function renderThreadControls() {
      var container = deps.threadControlsContainer;
      var threads = deps.getThreads();
      container.innerHTML = '';

      if (!threads.length) {
        deps.setSelectedThreadIndex(-1);
        refreshKidThreadPicker();
        return;
      }

      var selectedThreadIndex = deps.getSelectedThreadIndex();
      if (selectedThreadIndex < 0 || selectedThreadIndex >= threads.length) {
        selectedThreadIndex = 0;
        deps.setSelectedThreadIndex(0);
      }

      threads.forEach(function(thread, index) {
        deps.ensureThreadConnectConfig(thread);

        var div = document.createElement('div');
        div.className = 'thread-card' + (index === deps.getSelectedThreadIndex() ? ' selected' : '');

        var isFixedMode = thread.jumpMode === 'fixed';
        var isFormulaMode = thread.jumpMode === 'formula';
        var isSequenceMode = thread.jumpMode === 'sequence';
        var isConnectMode = thread.jumpMode === 'connect';

        div.innerHTML = '\n      <strong>Thread ' + (index + 1) + '</strong><br>\n      Color: <input type="color" value="' + thread.color + '" id="color-' + index + '"><br>\n      Stitch by:\n      <select id="jump-mode-' + index + '">\n        <option value="fixed" ' + (thread.jumpMode === 'fixed' ? 'selected' : '') + '>Addition</option>\n        <option value="connect" ' + (thread.jumpMode === 'connect' ? 'selected' : '') + '>Multiplication</option>\n        <option value="sequence" ' + (thread.jumpMode === 'sequence' ? 'selected' : '') + '>Step list</option>\n        <option value="formula" ' + (thread.jumpMode === 'formula' ? 'selected' : '') + '>Expression</option>\n      </select><br>\n      ' + (isFixedMode ? '\n      Add by: <input class="advanced-inline-number" type="number" min="1" max="100" value="' + thread.jump + '" id="jump-number-' + index + '" aria-label="Thread ' + (index + 1) + ' add value"><br>\n      ' : '') + '\n      ' + (isFormulaMode ? '\n      Base add: <input class="advanced-inline-number" type="number" min="1" max="100" value="' + thread.jump + '" id="jump-number-' + index + '" aria-label="Thread ' + (index + 1) + ' base add value"><br>\n      Step expression: <input type="text" value="' + (thread.jumpFormula || 'skip') + '" id="jump-formula-' + index + '" placeholder="e.g. (skip + i) mod n"><br>\n      <div class="jump-help">Use + - * /, ^ for powers, and mod for modulo.</div>\n      <div class="jump-help">Vars: i (step), n (holes), current, prev, skip</div>\n      <div class="jump-preset-row">\n        <select id="jump-preset-' + index + '">\n          <option value="">Preset formulas...</option>\n          <option value="(skip + i) mod n">Growing spiral ((skip + i) mod n)</option>\n          <option value="skip + (i mod 5)">Wobble (skip + (i mod 5))</option>\n          <option value="skip × ((i mod 3) + 1)">Pulse (skip × ((i mod 3) + 1))</option>\n          <option value="(current mod 7) + skip">Current-based ((current mod 7) + skip)</option>\n        </select>\n        <button type="button" id="use-preset-' + index + '">Use</button>\n      </div>\n      ' : '') + '\n      ' + (isSequenceMode ? '\n      Step list: <input type="text" value="' + (thread.jumpSequence || '') + '" id="jump-sequence-' + index + '" placeholder="e.g. 2,3,5,8"><br>\n      <div class="jump-help">Comma-separated steps, e.g. 2, 3, 5, 8</div>\n      ' : '') + '\n      ' + (isConnectMode ? '\n      Multiply by: <input class="advanced-inline-number" type="number" min="1" max="12" value="' + thread.connectMultiplier + '" id="connect-m-number-' + index + '" aria-label="Thread ' + (index + 1) + ' multiply value"><br>\n      Offset (add-on): <input class="advanced-inline-number" type="number" min="0" max="140" value="' + thread.connectOffset + '" id="connect-offset-number-' + index + '" aria-label="Thread ' + (index + 1) + ' offset value"><br>\n      <div class="jump-help">For each hole i, connect to (multiplier × i + offset) mod n.</div>\n      <div class="jump-preset-row">\n        <select id="connect-preset-' + index + '">\n          <option value="">Preset multiplier...</option>\n          <option value="2,0">Cardioid (m=2, offset=0)</option>\n          <option value="3,0">Nephroid (m=3, offset=0)</option>\n          <option value="4,0">Times 4 (m=4, offset=0)</option>\n        </select>\n        <button type="button" id="use-connect-preset-' + index + '">Use</button>\n      </div>\n      ' : '') + '\n      Size: <input class="advanced-inline-number" type="number" min="1" max="10" value="' + thread.width + '" id="width-number-' + index + '" aria-label="Thread ' + (index + 1) + ' size value"><br>\n      Rainbow: <input type="checkbox" id="rainbow-' + index + '" ' + (thread.color === 'rainbow' ? 'checked' : '') + '><br>\n      <button id="delete-' + index + '">Delete</button>\n    ';

        container.appendChild(div);

        div.addEventListener('click', function(event) {
          if (event.target.closest('input, select, button')) return;
          deps.setSelectedThreadIndex(index);
          renderThreadControls();
          syncKidControlsFromSelectedThread();
        });

        document.getElementById('color-' + index).addEventListener('input', function(e) {
          var profile = deps.getExperienceUiProfile(deps.getCurrentExperienceId());
          var paletteMode = profile && profile.paletteMode ? profile.paletteMode : 'thread';
          if (paletteMode === 'triangula-banded' && index === 0) {
            applyExperiencePaletteColorChoice(e.target.value);
          } else {
            thread.color = e.target.value;
          }
          syncKidControlsFromSelectedThread();
          deps.redrawAnimationInPlace();
        });

        var skipNumberInput = document.getElementById('jump-number-' + index);
        if (skipNumberInput) {
          skipNumberInput.addEventListener('input', function(e) {
            if (e.target.value === '') return;
            thread.jump = deps.parseBoundedInt(e.target.value, 1, 100, thread.jump || 1);
            e.target.value = String(thread.jump);
            if (index === getKidTargetThreadIndex()) {
              deps.jumpSlider.value = thread.jump;
              updateKidControlValues();
            }
            deps.redrawForPathChange();
          });
          skipNumberInput.addEventListener('change', function(e) {
            thread.jump = deps.parseBoundedInt(e.target.value, 1, 100, thread.jump || 1);
            e.target.value = String(thread.jump);
          });
        }

        document.getElementById('jump-mode-' + index).addEventListener('change', function(e) {
          thread.jumpMode = e.target.value;
          renderThreadControls();
          deps.redrawForPathChange();
        });

        var formulaInput = document.getElementById('jump-formula-' + index);
        if (formulaInput) {
          formulaInput.addEventListener('input', function(e) {
            thread.jumpFormula = e.target.value;
            if (thread.jumpMode === 'formula') {
              deps.redrawForPathChange();
            }
          });
        }

        var usePresetBtn = document.getElementById('use-preset-' + index);
        if (usePresetBtn) {
          usePresetBtn.addEventListener('click', function() {
            var preset = document.getElementById('jump-preset-' + index).value;
            if (!preset) return;
            thread.jumpFormula = preset;
            thread.jumpMode = 'formula';
            renderThreadControls();
            deps.redrawForPathChange();
          });
        }

        var sequenceInput = document.getElementById('jump-sequence-' + index);
        if (sequenceInput) {
          sequenceInput.addEventListener('input', function(e) {
            thread.jumpSequence = e.target.value;
            if (thread.jumpMode === 'sequence') {
              deps.redrawForPathChange();
            }
          });
        }

        var connectMultiplierNumberInput = document.getElementById('connect-m-number-' + index);
        if (connectMultiplierNumberInput) {
          connectMultiplierNumberInput.addEventListener('input', function(e) {
            if (e.target.value === '') return;
            thread.connectMultiplier = deps.parseBoundedInt(e.target.value, 1, 12, thread.connectMultiplier || 1);
            e.target.value = String(thread.connectMultiplier);
            if (index === getKidTargetThreadIndex()) {
              syncKidControlsFromSelectedThread();
            }
            deps.redrawForPathChange();
          });
          connectMultiplierNumberInput.addEventListener('change', function(e) {
            thread.connectMultiplier = deps.parseBoundedInt(e.target.value, 1, 12, thread.connectMultiplier || 1);
            e.target.value = String(thread.connectMultiplier);
          });
        }

        var connectOffsetNumberInput = document.getElementById('connect-offset-number-' + index);
        if (connectOffsetNumberInput) {
          connectOffsetNumberInput.addEventListener('input', function(e) {
            if (e.target.value === '') return;
            thread.connectOffset = deps.parseBoundedInt(e.target.value, 0, deps.maxHoles, thread.connectOffset || 0);
            e.target.value = String(thread.connectOffset);
            if (index === getKidTargetThreadIndex()) {
              syncKidControlsFromSelectedThread();
            }
            deps.redrawForPathChange();
          });
          connectOffsetNumberInput.addEventListener('change', function(e) {
            thread.connectOffset = deps.parseBoundedInt(e.target.value, 0, deps.maxHoles, thread.connectOffset || 0);
            e.target.value = String(thread.connectOffset);
          });
        }

        var useConnectPresetBtn = document.getElementById('use-connect-preset-' + index);
        if (useConnectPresetBtn) {
          useConnectPresetBtn.addEventListener('click', function() {
            var raw = document.getElementById('connect-preset-' + index).value;
            if (!raw) return;
            var parts = raw.split(',');
            if (parts.length !== 2) return;
            thread.jumpMode = 'connect';
            thread.connectMultiplier = parseInt(parts[0], 10);
            thread.connectOffset = parseInt(parts[1], 10);
            renderThreadControls();
            syncKidControlsFromSelectedThread();
            deps.redrawForPathChange();
          });
        }

        var widthNumberInput = document.getElementById('width-number-' + index);
        if (widthNumberInput) {
          widthNumberInput.addEventListener('input', function(e) {
            if (e.target.value === '') return;
            thread.width = deps.parseBoundedInt(e.target.value, 1, 10, thread.width || 1);
            e.target.value = String(thread.width);
            if (index === getKidTargetThreadIndex()) {
              deps.widthSlider.value = thread.width;
              updateKidControlValues();
            }
            deps.redrawAnimationInPlace();
          });
          widthNumberInput.addEventListener('change', function(e) {
            thread.width = deps.parseBoundedInt(e.target.value, 1, 10, thread.width || 1);
            e.target.value = String(thread.width);
          });
        }

        document.getElementById('rainbow-' + index).addEventListener('change', function(e) {
          thread.color = e.target.checked ? 'rainbow' : '#000000';
          syncKidControlsFromSelectedThread();
          deps.redrawAnimationInPlace();
        });

        document.getElementById('delete-' + index).addEventListener('click', function() {
          threads.splice(index, 1);
          if (!threads.length) {
            deps.setSelectedThreadIndex(-1);
          } else if (deps.getSelectedThreadIndex() >= threads.length) {
            deps.setSelectedThreadIndex(threads.length - 1);
          }
          renderThreadControls();
          syncKidControlsFromSelectedThread();
          deps.redrawForPathChange();
        });
      });

      syncKidControlsFromSelectedThread();
    }

    function addThreadAndRefresh() {
      var threads = deps.getThreads();
      threads.push(buildMagicThread());
      deps.setSelectedThreadIndex(threads.length - 1);
      renderThreadControls();
      syncKidControlsFromSelectedThread();
      deps.redrawForPathChange();
    }

    function removeLastThreadAndRefresh() {
      var threads = deps.getThreads();
      if (threads.length <= 1) return;
      threads.pop();
      deps.setSelectedThreadIndex(threads.length - 1);
      renderThreadControls();
      syncKidControlsFromSelectedThread();
      deps.redrawForPathChange();
    }

    return {
      updateKidControlValues: updateKidControlValues,
      syncBorderControls: syncBorderControls,
      createThread: createThread,
      buildMagicThread: buildMagicThread,
      applyExperiencePaletteColorChoice: applyExperiencePaletteColorChoice,
      syncHoleNumberToggles: syncHoleNumberToggles,
      refreshKidThreadPicker: refreshKidThreadPicker,
      getKidTargetThreadIndex: getKidTargetThreadIndex,
      syncKidControlsFromSelectedThread: syncKidControlsFromSelectedThread,
      renderThreadControls: renderThreadControls,
      addThreadAndRefresh: addThreadAndRefresh,
      removeLastThreadAndRefresh: removeLastThreadAndRefresh
    };
  }

  window.createStitchingUiModule = createStitchingUiModule;
})();
