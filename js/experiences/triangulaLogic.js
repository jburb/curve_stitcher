(function() {
  function parseBoundedIntValue(value, min, max, fallback) {
    var parsed = parseInt(value, 10);
    if (!isFinite(parsed)) return fallback;
    if (parsed < min) return min;
    if (parsed > max) return max;
    return parsed;
  }

  var TRIANGULA_DRAWABLE_COUNTS = Object.freeze([1, 3, 9, 27, 81, 243, 729]);

  function normalizeTriangulaDrawableCount(value, role, fallback) {
    var parsed = parseBoundedIntValue(value, 1, 729, fallback);
    if (!isFinite(parsed)) {
      parsed = parseBoundedIntValue(fallback, 1, 729, 1);
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

  function stepTriangulaCount(baseValue, stepAction) {
    var value = parseBoundedIntValue(baseValue, 1, 729, 1);
    if (stepAction === 'div3') {
      return Math.max(1, Math.floor(value / 3));
    }
    if (stepAction === 'mul3') {
      return Math.min(729, value * 3);
    }
    if (stepAction === 'dec10') {
      return Math.max(1, value - 10);
    }
    if (stepAction === 'inc10') {
      return Math.min(729, value + 10);
    }
    return value;
  }

  function isTriangulaColorScopeVisible(controls, currentExperienceId, triangulaConstructionMode) {
    return !!(
      controls &&
      controls.triangulaColorScope === true &&
      currentExperienceId === 'triangula' &&
      triangulaConstructionMode === 'shrink-duplicate'
    );
  }

  function captureTriangulaExperienceState(runtime, options) {
    runtime = runtime || {};
    options = options || {};
    var sanitizeColor = options.sanitizeThreadColor || function(value, fallback) { return value || fallback; };
    var source = runtime.threadZeroColor || '#1982c4';

    return {
      colorMode: runtime.colorMode,
      constructionMode: runtime.constructionMode,
      startCount: runtime.startCount,
      targetCount: runtime.targetCount,
      fractalMode: runtime.fractalMode,
      fitMode: runtime.fitMode,
      band1: runtime.band1,
      band2: runtime.band2,
      band4: runtime.band4,
      sourceColor: sanitizeColor(source, '#1982c4')
    };
  }

  function applyTriangulaExperienceState(snapshot, runtime, options) {
    snapshot = snapshot || {};
    runtime = runtime || {};
    options = options || {};

    var sanitizeColorMode = options.sanitizeTriangulaColorMode || sanitizeTriangulaColorMode;
    var sanitizeConstructionMode = options.sanitizeTriangulaConstructionMode || sanitizeTriangulaConstructionMode;
    var sanitizeCount = options.sanitizeTriangulaCount || sanitizeTriangulaCount;
    var sanitizeFractal = options.sanitizeTriangulaFractalMode || sanitizeTriangulaFractalMode;
    var sanitizeFit = options.sanitizeTriangulaFitMode || sanitizeTriangulaFitMode;
    var sanitizeColor = options.sanitizeThreadColor || function(value, fallback) { return value || fallback; };
    var sanitizeHex = options.sanitizeHexColor || function(value, fallback) { return value || fallback; };

    var colorMode = sanitizeColorMode(snapshot.colorMode, runtime.colorMode);
    var constructionMode = sanitizeConstructionMode(snapshot.constructionMode, runtime.constructionMode);
    var startCount = sanitizeCount(snapshot.startCount, runtime.startCount, 'start');
    var targetCount = sanitizeCount(snapshot.targetCount, runtime.targetCount, 'target');
    if (targetCount < startCount) {
      targetCount = startCount;
    }

    var fractalMode = sanitizeFractal(snapshot.fractalMode, runtime.fractalMode);
    var fitMode = sanitizeFit(snapshot.fitMode, runtime.fitMode);
    var sharedColor = sanitizeHex(
      snapshot.band1 || snapshot.band2 || snapshot.band4 || snapshot.sourceColor,
      runtime.band1
    );

    return {
      colorMode: colorMode,
      constructionMode: constructionMode,
      startCount: startCount,
      targetCount: targetCount,
      fractalMode: fractalMode,
      fitMode: fitMode,
      band1: sharedColor,
      band2: sharedColor,
      band4: sharedColor,
      sourceColor: sanitizeColor(snapshot.sourceColor, sharedColor)
    };
  }

  function buildTriangulaUrlState(runtime, options) {
    runtime = runtime || {};
    options = options || {};

    var sanitizeColor = options.sanitizeThreadColor || function(value, fallback) { return value || fallback; };

    return {
      colorMode: runtime.colorMode,
      constructionMode: runtime.constructionMode,
      startCount: runtime.startCount,
      targetCount: runtime.targetCount,
      fractalMode: runtime.fractalMode,
      fitMode: runtime.fitMode,
      sourceColor: sanitizeColor(runtime.sourceColor, runtime.band1 || '#1982c4'),
      band1Color: runtime.band1,
      band2Color: runtime.band2,
      band4Color: runtime.band4
    };
  }

  function hydrateTriangulaUrlState(runtime, options) {
    runtime = runtime || {};
    options = options || {};

    return applyTriangulaExperienceState(
      {
        colorMode: runtime.colorModeParam,
        constructionMode: runtime.constructionModeParam,
        startCount: runtime.startCountParam,
        targetCount: runtime.targetCountParam,
        fractalMode: runtime.fractalModeParam,
        fitMode: runtime.fitModeParam,
        band1: runtime.band1ColorParam,
        band2: runtime.band2ColorParam,
        band4: runtime.band4ColorParam,
        sourceColor: runtime.sourceColorParam
      },
      {
        colorMode: runtime.colorMode,
        constructionMode: runtime.constructionMode,
        startCount: runtime.startCount,
        targetCount: runtime.targetCount,
        fractalMode: runtime.fractalMode,
        fitMode: runtime.fitMode,
        band1: runtime.band1,
        band2: runtime.band2,
        band4: runtime.band4
      },
      options
    );
  }

  function getExportProfileForExperience(experienceId) {
    if (experienceId === 'triangula') {
      return {
        supportsThreads: false,
        supportsPreview: false,
        defaultIncludeThreads: false,
        defaultIncludePreview: false,
        guideFileSuffix: '-triangula-instructions.txt'
      };
    }

    return {
      supportsThreads: true,
      supportsPreview: true,
      defaultIncludeThreads: false,
      defaultIncludePreview: true,
      guideFileSuffix: '-stitching-guide.txt'
    };
  }

  window.TRIANGULA_LOGIC = Object.freeze({
    TRIANGULA_DRAWABLE_COUNTS: TRIANGULA_DRAWABLE_COUNTS,
    normalizeTriangulaDrawableCount: normalizeTriangulaDrawableCount,
    sanitizeTriangulaCount: sanitizeTriangulaCount,
    sanitizeTriangulaColorMode: sanitizeTriangulaColorMode,
    sanitizeTriangulaConstructionMode: sanitizeTriangulaConstructionMode,
    sanitizeTriangulaFractalMode: sanitizeTriangulaFractalMode,
    sanitizeTriangulaFitMode: sanitizeTriangulaFitMode,
    stepTriangulaCount: stepTriangulaCount,
    isTriangulaColorScopeVisible: isTriangulaColorScopeVisible,
    captureTriangulaExperienceState: captureTriangulaExperienceState,
    applyTriangulaExperienceState: applyTriangulaExperienceState,
    buildTriangulaUrlState: buildTriangulaUrlState,
    hydrateTriangulaUrlState: hydrateTriangulaUrlState,
    getExportProfileForExperience: getExportProfileForExperience
  });

  // Backward-compat globals for existing app wiring.
  window.TRIANGULA_DRAWABLE_COUNTS = TRIANGULA_DRAWABLE_COUNTS;
  window.normalizeTriangulaDrawableCount = normalizeTriangulaDrawableCount;
  window.sanitizeTriangulaCount = sanitizeTriangulaCount;
  window.sanitizeTriangulaColorMode = sanitizeTriangulaColorMode;
  window.sanitizeTriangulaConstructionMode = sanitizeTriangulaConstructionMode;
  window.sanitizeTriangulaFractalMode = sanitizeTriangulaFractalMode;
  window.sanitizeTriangulaFitMode = sanitizeTriangulaFitMode;
  window.stepTriangulaCount = stepTriangulaCount;
})();
